#!/usr/bin/env node

/**
 * Zoho OAuth URL Tester
 * This script helps test and debug Zoho OAuth URLs
 */

// Your current URL
const yourUrl = "https://accounts.zoho.in/oauth/v2/auth?scope=Desk.tickets.ALL,Desk.contacts.ALL,Desk.basic.ALL&client_id=1000.DDTGQ4PIZTWO3RIBOWTFFPOAJ61EJV&response_type=code&access_type=offline&redirect_uri=http://localhost:3000/auth/zoho/callback"

console.log('🔍 Analyzing your Zoho OAuth URL...\n')

// Parse the URL
const url = new URL(yourUrl)
const params = url.searchParams

console.log('📋 Current Parameters:')
console.log('  Base URL:', url.origin + url.pathname)
console.log('  Scope:', params.get('scope'))
console.log('  Client ID:', params.get('client_id'))
console.log('  Response Type:', params.get('response_type'))
console.log('  Access Type:', params.get('access_type'))
console.log('  Redirect URI:', params.get('redirect_uri'))
console.log('')

// Common issues and solutions
console.log('🚨 Common 500 Error Causes:')
console.log('')

console.log('1. **Redirect URI Mismatch**')
console.log('   - Make sure http://localhost:3000/auth/zoho/callback is EXACTLY')
console.log('     registered in your Zoho OAuth application')
console.log('   - Check for trailing slashes, http vs https, etc.')
console.log('')

console.log('2. **Invalid Client ID**')
console.log('   - Verify your Client ID in Zoho API Console')
console.log('   - Make sure it matches exactly (case-sensitive)')
console.log('')

console.log('3. **Scope Issues**')
console.log('   - Current scopes: Desk.tickets.ALL,Desk.contacts.ALL,Desk.basic.ALL')
console.log('   - Try with minimal scope first: Desk.basic.READ')
console.log('')

console.log('4. **Data Center Issues**')
console.log('   - Are you using the correct data center?')
console.log('   - US: accounts.zoho.in')
console.log('   - EU: accounts.zoho.eu')
console.log('   - IN: accounts.zoho.in')
console.log('   - AU: accounts.zoho.in.au')
console.log('')

// Generate alternative URLs to test
console.log('🛠️  Test URLs to try:')
console.log('')

// URL 1: Minimal scopes
const minimalUrl = new URL('https://accounts.zoho.in/oauth/v2/auth')
minimalUrl.searchParams.set('client_id', params.get('client_id'))
minimalUrl.searchParams.set('response_type', 'code')
minimalUrl.searchParams.set('scope', 'Desk.basic.READ')
minimalUrl.searchParams.set('redirect_uri', params.get('redirect_uri'))
minimalUrl.searchParams.set('access_type', 'offline')

console.log('1. **Minimal Scopes Test:**')
console.log('   ' + minimalUrl.toString())
console.log('')

// URL 2: URL encoded
const encodedUrl = new URL('https://accounts.zoho.in/oauth/v2/auth')
encodedUrl.searchParams.set('client_id', params.get('client_id'))
encodedUrl.searchParams.set('response_type', 'code')
encodedUrl.searchParams.set('scope', 'Desk.tickets.ALL,Desk.contacts.ALL,Desk.basic.ALL')
encodedUrl.searchParams.set('redirect_uri', encodeURIComponent(params.get('redirect_uri')))
encodedUrl.searchParams.set('access_type', 'offline')

console.log('2. **Properly URL Encoded:**')
console.log('   ' + encodedUrl.toString())
console.log('')

// URL 3: Different data center (EU)
const euUrl = new URL('https://accounts.zoho.eu/oauth/v2/auth')
euUrl.searchParams.set('client_id', params.get('client_id'))
euUrl.searchParams.set('response_type', 'code')
euUrl.searchParams.set('scope', 'Desk.tickets.ALL,Desk.contacts.ALL,Desk.basic.ALL')
euUrl.searchParams.set('redirect_uri', params.get('redirect_uri'))
euUrl.searchParams.set('access_type', 'offline')

console.log('3. **EU Data Center (if applicable):**')
console.log('   ' + euUrl.toString())
console.log('')

// Debugging steps
console.log('🔧 Debugging Steps:')
console.log('')
console.log('1. **Verify Zoho App Configuration:**')
console.log('   - Go to https://api-console.zoho.in/')
console.log('   - Find your application')
console.log('   - Check "Authorized redirect URIs"')
console.log('   - Ensure http://localhost:3000/auth/zoho/callback is listed')
console.log('')

console.log('2. **Check Application Status:**')
console.log('   - Make sure your Zoho application is active')
console.log('   - Check if it needs approval/verification')
console.log('')

console.log('3. **Test with Postman/Browser:**')
console.log('   - Try the minimal scopes URL first')
console.log('   - Check browser developer tools for detailed errors')
console.log('')

console.log('4. **Check Zoho Service Status:**')
console.log('   - Visit https://status.zoho.in/')
console.log('   - Check if OAuth services are down')
console.log('')

// Check for common URL issues
console.log('⚠️  URL Validation:')
console.log('')

const redirectUri = params.get('redirect_uri')
if (!redirectUri.startsWith('http://localhost:3000')) {
  console.log('❌ Redirect URI should start with http://localhost:3000')
} else {
  console.log('✅ Redirect URI format looks correct')
}

const clientId = params.get('client_id')
if (!clientId.startsWith('1000.')) {
  console.log('❌ Client ID should start with "1000."')
} else {
  console.log('✅ Client ID format looks correct')
}

const scopes = params.get('scope').split(',')
if (scopes.length === 0) {
  console.log('❌ No scopes specified')
} else {
  console.log(`✅ ${scopes.length} scopes specified`)
}

console.log('')
console.log('💡 **Next Steps:**')
console.log('1. Try the minimal scopes URL first')
console.log('2. If that works, gradually add more scopes')
console.log('3. Double-check your Zoho app configuration')
console.log('4. Contact Zoho support if issues persist')
