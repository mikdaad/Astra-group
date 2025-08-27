// src/lib/zoho/auth.ts
import 'server-only'

interface ZohoTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
}

// Cache for access token to avoid frequent refreshes
let cachedToken: { token: string; expiresAt: number } | null = null

export async function getZohoAccessToken(): Promise<string> {
  const now = Date.now()

  // Return cached token if it's still valid (with 5 minute buffer)
  if (cachedToken && cachedToken.expiresAt > now + 5 * 60 * 1000) {
    console.log(
      '🔑 [ZOHO AUTH] Using cached token (expires in',
      Math.round((cachedToken.expiresAt - now) / 1000),
      'seconds)'
    )
    return cachedToken.token
  }

  console.log('🔄 [ZOHO AUTH] Token expired or missing, refreshing...')

  const clientId = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('🔑 [ZOHO AUTH] Missing credentials:', {
      clientId: clientId ? '✅ Present' : '❌ Missing',
      clientSecret: clientSecret ? '✅ Present' : '❌ Missing',
      refreshToken: refreshToken ? '✅ Present' : '❌ Missing',
    })
    throw new Error('Missing Zoho API credentials')
  }

  const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token'
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  })

  try {
    console.log('🌐 [ZOHO AUTH] Making token refresh request to:', tokenUrl)

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    console.log('📊 [ZOHO AUTH] Token refresh response:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [ZOHO AUTH] Token refresh failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })

      if (response.status === 400) {
        console.error('💡 [ZOHO AUTH] Possible causes: Invalid/expired refresh token or wrong client credentials')
      }

      throw new Error(`Zoho token refresh failed: ${response.status} - ${errorText}`)
    }

    const data: ZohoTokenResponse = await response.json()

    console.log('✅ [ZOHO AUTH] Token refresh successful:', {
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      scope: data.scope,
      tokenPreview: data.access_token ? data.access_token.substring(0, 20) + '...' : 'Missing',
    })

    cachedToken = {
      token: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    }

    console.log('💾 [ZOHO AUTH] Token cached until:', new Date(cachedToken.expiresAt).toISOString())
    return data.access_token
  } catch (error) {
    console.error('💥 [ZOHO AUTH] Error refreshing Zoho access token:', error)
    cachedToken = null
    console.log('🗑️  [ZOHO AUTH] Cleared cached token due to error')
    throw error
  }
}
