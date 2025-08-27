interface ZohoTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
}

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getZohoAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 5 * 60 * 1000) {
    return cachedToken.token
  }

  const clientId = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Zoho API credentials')
  }

  const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token'
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token'
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Zoho token refresh failed: ${response.status} - ${errorText}`)
  }

  const data: ZohoTokenResponse = await response.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in * 1000)
  }
  return data.access_token
}


