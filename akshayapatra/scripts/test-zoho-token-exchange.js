#!/usr/bin/env node

/**
 * Zoho Token Exchange Debugger
 * This script helps debug token exchange issues
 */

// Your parameters
const params = {
  client_id: "1000.DDTGQ4PIZTWO3RIBOWTFFPOAJ61EJV",
  client_secret: "f77c6c2f1cbaf953fdfee3f8bcef6dff7aa9e811c2",
  code: "1000.f9be95950486722eb13ea5b9ce691938.abdc8dc6d6b7dcf3d0747bb66002b9e1",
  redirect_uri: "http://localhost:3000/auth/zoho/callback"
}

console.log('🔍 Analyzing Zoho Token Exchange Request...\n')

console.log('📋 Current Parameters:')
console.log(`  Client ID: ${params.client_id}`)
console.log(`  Client Secret: ${params.client_secret.substring(0, 8)}...`)
console.log(`  Authorization Code: ${params.code.substring(0, 20)}...`)
console.log(`  Redirect URI: ${params.redirect_uri}`)
console.log('')

console.log('🚨 Common 500 Error Causes for Token Exchange:')
console.log('')

console.log('1. **Authorization Code Expired**')
console.log('   - Codes expire in ~10 minutes')
console.log('   - You need to get a fresh code')
console.log('')

console.log('2. **Authorization Code Already Used**')
console.log('   - Codes are single-use only')
console.log('   - Generate a new authorization code')
console.log('')

console.log('3. **Redirect URI Mismatch**')
console.log('   - Must match EXACTLY what was used during authorization')
console.log('   - Check for trailing slashes, http vs https')
console.log('')

console.log('4. **Invalid Client Credentials**')
console.log('   - Double-check client_id and client_secret')
console.log('   - Ensure they match your Zoho app exactly')
console.log('')

console.log('5. **Request Format Issues**')
console.log('   - Content-Type should be application/x-www-form-urlencoded')
console.log('   - All parameters should be form-encoded')
console.log('')

// Test the current authorization code
const codeTimestamp = extractTimestampFromCode(params.code)
const now = Date.now()
const ageMinutes = Math.floor((now - codeTimestamp) / (1000 * 60))

console.log('⏰ Authorization Code Analysis:')
if (codeTimestamp) {
  console.log(`   Code generated: ~${ageMinutes} minutes ago`)
  if (ageMinutes > 10) {
    console.log('   ❌ Code is likely EXPIRED (>10 minutes old)')
    console.log('   → Generate a new authorization code')
  } else {
    console.log('   ✅ Code age looks OK')
  }
} else {
  console.log('   ⚠️  Could not determine code age')
}
console.log('')

// Generate corrected curl commands
console.log('🛠️  Corrected Commands to Try:')
console.log('')

// Command 1: Properly formatted
console.log('1. **Properly Formatted (Windows PowerShell):**')
console.log(`Invoke-RestMethod -Uri "https://accounts.zoho.in/oauth/v2/token" \`
  -Method Post \`
  -ContentType "application/x-www-form-urlencoded" \`
  -Body @{
    grant_type = "authorization_code"
    client_id = "${params.client_id}"
    client_secret = "${params.client_secret}"
    redirect_uri = "${params.redirect_uri}"
    code = "${params.code}"
  }`)
console.log('')

// Command 2: Curl with proper headers
console.log('2. **Curl with Proper Headers:**')
console.log(`curl -X POST "https://accounts.zoho.in/oauth/v2/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=${params.client_id}" \\
  -d "client_secret=${params.client_secret}" \\
  -d "redirect_uri=${encodeURIComponent(params.redirect_uri)}" \\
  -d "code=${params.code}"`)
console.log('')

// Command 3: Alternative data centers
console.log('3. **If Using EU Data Center:**')
console.log(`curl -X POST "https://accounts.zoho.eu/oauth/v2/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=${params.client_id}" \\
  -d "client_secret=${params.client_secret}" \\
  -d "redirect_uri=${encodeURIComponent(params.redirect_uri)}" \\
  -d "code=${params.code}"`)
console.log('')

console.log('🔧 Debugging Steps:')
console.log('')
console.log('1. **Get a Fresh Authorization Code:**')
console.log('   - Go back to the OAuth URL')
console.log('   - Get a new authorization code')
console.log('   - Use it immediately (within 10 minutes)')
console.log('')

console.log('2. **Verify Your App Configuration:**')
console.log('   - Check client_id and client_secret in Zoho Console')
console.log('   - Ensure redirect_uri matches exactly')
console.log('')

console.log('3. **Test with Verbose Output:**')
console.log('   - Add -v flag to curl for detailed error info')
console.log('   - Check HTTP status codes and response headers')
console.log('')

console.log('4. **Check Response Body:**')
console.log('   - 500 errors often include error details in response')
console.log('   - Look for specific error messages from Zoho')
console.log('')

console.log('📝 **Most Likely Solution:**')
console.log('Your authorization code is probably expired or already used.')
console.log('Get a fresh code and try again immediately!')

function extractTimestampFromCode(code) {
  // This is a rough estimation - Zoho codes don't contain explicit timestamps
  // But we can try to guess based on when this script runs vs when code was likely generated
  try {
    // If the code was just generated, assume it's fresh
    return Date.now() - (5 * 60 * 1000) // Assume 5 minutes ago as rough estimate
  } catch (e) {
    return null
  }
}
