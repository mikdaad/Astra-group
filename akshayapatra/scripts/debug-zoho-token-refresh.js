#!/usr/bin/env node

/**
 * Debug Script: Zoho Token Refresh
 * 
 * This script tests the Zoho OAuth token refresh mechanism
 * to identify why INVALID_OAUTH errors are occurring.
 */

const https = require('https')

// Environment variables (you'll need to set these)
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID || '1000.DDTGQ4PIZTWO3RIBOWTFFPOAJ61EJV'
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || 'f77c6c2f1cbaf953fdfee3f8bcef6dff7aa9e811c2'
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || '1000.00dc17f826e0bae3fe9f1da0e5001bfb.653712f376dacc1e73f8e99977982ab1'
const ZOHO_BASE_URL = process.env.ZOHO_BASE_URL || 'https://desk.zoho.in'

console.log('🔍 [TOKEN DEBUG] Starting Zoho token refresh debug...\n')

// Check environment variables
console.log('📋 [TOKEN DEBUG] Environment Check:')
console.log(`   ZOHO_CLIENT_ID: ${ZOHO_CLIENT_ID ? '✅ Set' : '❌ Missing'}`)
console.log(`   ZOHO_CLIENT_SECRET: ${ZOHO_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`)
console.log(`   ZOHO_REFRESH_TOKEN: ${ZOHO_REFRESH_TOKEN ? '✅ Set' : '❌ Missing'}`)
console.log(`   ZOHO_BASE_URL: ${ZOHO_BASE_URL}`)
console.log()

if (!ZOHO_REFRESH_TOKEN) {
  console.error('❌ [TOKEN DEBUG] ZOHO_REFRESH_TOKEN is missing!')
  console.log('💡 [TOKEN DEBUG] You need to set the refresh token in your environment variables.')
  process.exit(1)
}

async function testTokenRefresh() {
  console.log('🔄 [TOKEN DEBUG] Testing token refresh...')
  
  const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token'
  const postData = new URLSearchParams({
    refresh_token: ZOHO_REFRESH_TOKEN,
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token'
  }).toString()

  console.log(`🌐 [TOKEN DEBUG] POST ${tokenUrl}`)
  console.log(`📝 [TOKEN DEBUG] Request body: ${postData.replace(ZOHO_CLIENT_SECRET, '***SECRET***').replace(ZOHO_REFRESH_TOKEN, '***REFRESH_TOKEN***')}`)
  console.log()

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: postData
    })

    console.log(`📊 [TOKEN DEBUG] Response status: ${response.status} ${response.statusText}`)
    
    const responseText = await response.text()
    console.log(`📄 [TOKEN DEBUG] Response body: ${responseText}`)
    console.log()

    if (response.ok) {
      const tokenData = JSON.parse(responseText)
      console.log('✅ [TOKEN DEBUG] Token refresh successful!')
      console.log(`   Access Token: ${tokenData.access_token ? tokenData.access_token.substring(0, 20) + '...' : 'Missing'}`)
      console.log(`   Token Type: ${tokenData.token_type || 'Missing'}`)
      console.log(`   Expires In: ${tokenData.expires_in || 'Missing'} seconds`)
      console.log()
      
      return tokenData.access_token
    } else {
      console.error('❌ [TOKEN DEBUG] Token refresh failed!')
      
      try {
        const errorData = JSON.parse(responseText)
        console.error(`   Error Code: ${errorData.error || 'Unknown'}`)
        console.error(`   Error Description: ${errorData.error_description || 'No description'}`)
      } catch (e) {
        console.error(`   Raw error: ${responseText}`)
      }
      
      console.log()
      console.log('🔧 [TOKEN DEBUG] Common causes:')
      console.log('   1. Refresh token has expired (need to re-authorize)')
      console.log('   2. Client ID/Secret mismatch')
      console.log('   3. Wrong data center (should be accounts.zoho.in for India)')
      console.log('   4. Invalid refresh token format')
      console.log()
      
      return null
    }
  } catch (error) {
    console.error('💥 [TOKEN DEBUG] Network error:', error.message)
    return null
  }
}

async function testApiWithToken(accessToken) {
  if (!accessToken) {
    console.log('⏭️  [TOKEN DEBUG] Skipping API test (no access token)')
    return
  }
  
  console.log('🎫 [TOKEN DEBUG] Testing API call with refreshed token...')
  
  const apiUrl = `${ZOHO_BASE_URL}/api/v1/tickets?from=0&limit=1`
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(`📊 [TOKEN DEBUG] API Response status: ${response.status} ${response.statusText}`)
    
    const responseText = await response.text()
    console.log(`📄 [TOKEN DEBUG] API Response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`)
    
    if (response.ok) {
      console.log('✅ [TOKEN DEBUG] API call successful with refreshed token!')
    } else {
      console.error('❌ [TOKEN DEBUG] API call failed even with refreshed token')
      
      if (response.status === 401) {
        console.log('🔍 [TOKEN DEBUG] Still getting 401 - possible issues:')
        console.log('   1. Organization ID mismatch')
        console.log('   2. Insufficient scopes in original authorization')
        console.log('   3. Token not valid for this API endpoint')
      }
    }
  } catch (error) {
    console.error('💥 [TOKEN DEBUG] API test error:', error.message)
  }
}

async function checkCurrentTokenInApp() {
  console.log('🏠 [TOKEN DEBUG] Testing current app token refresh endpoint...')
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/zoho/auth', {
      method: 'POST'
    })
    
    console.log(`📊 [TOKEN DEBUG] App auth endpoint status: ${response.status}`)
    
    const responseText = await response.text()
    console.log(`📄 [TOKEN DEBUG] App auth response: ${responseText}`)
    
    if (response.ok) {
      const data = JSON.parse(responseText)
      console.log('✅ [TOKEN DEBUG] App token refresh working!')
      return data.access_token
    } else {
      console.error('❌ [TOKEN DEBUG] App token refresh failing!')
    }
  } catch (error) {
    console.error('💥 [TOKEN DEBUG] App test error:', error.message)
    console.log('💡 [TOKEN DEBUG] Make sure your dev server is running (npm run dev)')
  }
  
  return null
}

// Run all tests
async function runDebug() {
  console.log('🚀 [TOKEN DEBUG] Starting comprehensive token debug...\n')
  
  // Test 1: Direct token refresh
  const accessToken = await testTokenRefresh()
  
  console.log('─'.repeat(50))
  
  // Test 2: API call with refreshed token
  await testApiWithToken(accessToken)
  
  console.log('─'.repeat(50))
  
  // Test 3: App's token refresh endpoint
  await checkCurrentTokenInApp()
  
  console.log('\n🏁 [TOKEN DEBUG] Debug complete!')
  console.log('💡 [TOKEN DEBUG] If all tests fail, you may need to re-authorize with Zoho')
}

runDebug().catch(console.error)
