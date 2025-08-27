#!/usr/bin/env node

/**
 * Zoho Organization ID Finder
 * This script helps you find your Zoho Desk Organization ID
 */

console.log('🔍 How to Find Your Zoho Organization ID\n')

console.log('📋 Method 1: Zoho Desk Dashboard')
console.log('1. Log into your Zoho Desk at:')
console.log('   - US: https://desk.zoho.com')
console.log('   - EU: https://desk.zoho.eu') 
console.log('   - India: https://desk.zoho.in')
console.log('   - Australia: https://desk.zoho.com.au')
console.log('2. Go to Setup → General → Company Profile')
console.log('3. Copy the "Organization ID" number')
console.log('')

console.log('📋 Method 2: Check Browser URL')
console.log('1. Log into Zoho Desk')
console.log('2. Look at the URL in your browser:')
console.log('   https://desk.zoho.in/agent/[ORG_ID]/dashboard')
console.log('3. The number after /agent/ is your Organization ID')
console.log('')

console.log('📋 Method 3: API Console')
console.log('1. Go to https://api-console.zoho.com/')
console.log('2. Select your application')
console.log('3. Go to "Client Details"')
console.log('4. Find "Organization ID" in the details')
console.log('')

console.log('📋 Method 4: API Call (if you have access token)')
console.log('curl -X GET "https://desk.zoho.in/api/v1/organizations" \\')
console.log('  -H "Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN"')
console.log('')

console.log('🔧 Common Issues:')
console.log('')
console.log('❌ **"Invalid Organization ID" Error**')
console.log('   - Double-check you copied the full number')
console.log('   - Ensure no extra spaces or characters')
console.log('   - Verify you\'re using the correct data center')
console.log('')

console.log('❌ **"Organization Not Found" Error**')
console.log('   - Make sure your access token is valid')
console.log('   - Check that your app has Desk API permissions')
console.log('   - Verify the organization is active')
console.log('')

console.log('💡 **Example Organization ID:**')
console.log('   ZOHO_ORG_ID=60008967078')
console.log('')

console.log('🚀 **Once you have it:**')
console.log('1. Add it to your .env.local file:')
console.log('   ZOHO_ORG_ID=your_actual_org_id_number')
console.log('2. Restart your development server')
console.log('3. Test the connection in /admin/support')

// If we have environment variables, show current config
if (process.env.ZOHO_ORG_ID) {
  console.log('')
  console.log('✅ **Current Configuration:**')
  console.log(`   ZOHO_ORG_ID: ${process.env.ZOHO_ORG_ID}`)
  console.log(`   ZOHO_BASE_URL: ${process.env.ZOHO_BASE_URL || 'Not set'}`)
  console.log(`   ZOHO_CLIENT_ID: ${process.env.ZOHO_CLIENT_ID ? 'Set' : 'Not set'}`)
  console.log(`   ZOHO_REFRESH_TOKEN: ${process.env.ZOHO_REFRESH_TOKEN ? 'Set' : 'Not set'}`)
} else {
  console.log('')
  console.log('⚠️  **ZOHO_ORG_ID not found in environment variables**')
  console.log('   Make sure to add it to your .env.local file')
}
