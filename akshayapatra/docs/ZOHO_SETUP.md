# Zoho Desk Integration Setup Guide

This guide will help you set up the Zoho Desk API integration for the Admin Support page.

## Prerequisites

- Zoho Desk account with admin access
- Access to Zoho API Console
- Basic understanding of OAuth 2.0

## Step 1: Create Zoho Desk Organization

1. **Sign up for Zoho Desk**:
   - Go to [https://www.zoho.in/desk/](https://www.zoho.in/desk/)
   - Create an account or sign in to existing Zoho account
   - Set up your organization

2. **Access your Organization ID**:
   - In Zoho Desk, go to **Setup** > **General** > **Company Profile**
   - Note down your **Organization ID** (you'll need this later)

## Step 2: Create API Application

1. **Access Zoho API Console**:
   - Go to [https://api-console.zoho.in/](https://api-console.zoho.in/)
   - Sign in with your Zoho account

2. **Create New Application**:
   - Click "Add Client"
   - Choose **Server-based Applications**
   - Fill in the application details:
     - **Client Name**: Akshayapatra Support Integration
     - **Homepage URL**: Your application URL
     - **Authorized redirect URIs**: Add your callback URL: `https://yourdomain.com/auth/zoho/callback`
       - For local development: `http://localhost:3000/auth/zoho/callback`

3. **Get Client Credentials**:
   - After creating the application, note down:
     - **Client ID**
     - **Client Secret**

## Step 3: Generate Refresh Token

### Method 1: Using Zoho's OAuth Playground

1. **Generate Authorization Code**:
   - Go to [https://accounts.zoho.in/oauth/v2/auth](https://accounts.zoho.in/oauth/v2/auth)
   - Use the following URL format:
   ```
   https://accounts.zoho.in/oauth/v2/auth?scope=Desk.tickets.ALL,Desk.contacts.ALL,Desk.basic.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=YOUR_REDIRECT_URI
   ```
   - Replace `YOUR_CLIENT_ID` and `YOUR_REDIRECT_URI` with your values
   - Use `http://localhost:3000/auth/zoho/callback` for local development
   - This will redirect you to your callback URL with an authorization code

2. **Exchange Code for Refresh Token**:
   - Make a POST request to `https://accounts.zoho.in/oauth/v2/token` with:
   ```bash
   curl -X POST https://accounts.zoho.in/oauth/v2/token \
     -d "grant_type=authorization_code" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "redirect_uri=YOUR_REDIRECT_URI" \
     -d "code=AUTHORIZATION_CODE"
   ```

### Method 2: Using Postman

1. **Import Zoho Desk API Collection**:
   - Download the collection from Zoho's documentation
   - Import into Postman

2. **Configure OAuth 2.0**:
   - Set up OAuth 2.0 in Postman with your client credentials
   - Use the following scopes: `Desk.tickets.ALL,Desk.contacts.ALL,Desk.basic.ALL`

## Step 4: Environment Configuration

Add the following environment variables to your `.env.local` file:

```env
# Zoho Desk API Configuration
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REFRESH_TOKEN=your_refresh_token_here
ZOHO_BASE_URL=https://desk.zoho.in
ZOHO_ORG_ID=your_organization_id_here
```

### For Sandbox Environment

If you're using Zoho's sandbox environment:

```env
ZOHO_BASE_URL=https://deskapi.zoho.in
```

## Step 5: Test the Integration

1. **Start your application**:
   ```bash
   npm run dev
   ```

2. **Navigate to Admin Support page**:
   - Go to `/admin/support`
   - You should see the Zoho Desk connection test component

3. **Test the connection**:
   - Click "Test Connection" to verify your setup
   - If successful, you'll see ticket data from your Zoho Desk

## Step 6: Security Considerations

### Admin Access Control

The Zoho integration is protected by admin access controls:

- Only users with admin role can access Zoho data
- API credentials are stored server-side and never exposed to clients
- All requests go through secure proxy endpoints

### Rate Limiting

Zoho Desk has API rate limits:
- **Default**: 100 API calls per minute per organization
- **Premium**: Higher limits available

### Token Management

- Access tokens are automatically refreshed using the refresh token
- Tokens are cached server-side for efficiency
- Failed requests trigger automatic token refresh

## Troubleshooting

### Common Issues

1. **"Invalid Client" Error**:
   - Verify your Client ID and Client Secret
   - Check that your redirect URI matches exactly

2. **"Invalid Scope" Error**:
   - Ensure you have the required permissions in your Zoho Desk organization
   - Check that scopes are correctly specified

3. **"Organization ID not found"**:
   - Verify your Organization ID from Zoho Desk settings
   - Ensure you're using the correct data center (US, EU, etc.)

4. **Connection Timeout**:
   - Check your network connectivity
   - Verify the base URL for your region

### Testing API Endpoints

You can test individual endpoints using curl:

```bash
# Test authentication
curl -X POST http://localhost:3000/api/admin/zoho/auth \
  -H "Content-Type: application/json" \
  -d "{}"

# Test tickets endpoint
curl -X GET "http://localhost:3000/api/admin/zoho/tickets?limit=10" \
  -H "Content-Type: application/json"

# Test stats endpoint
curl -X GET "http://localhost:3000/api/admin/zoho/stats?timeframe=thisMonth" \
  -H "Content-Type: application/json"
```

## Data Mapping

### Ticket Fields

The integration maps the following Zoho Desk fields:

| Zoho Field | Display Name | Description |
|------------|--------------|-------------|
| `ticketNumber` | Ticket # | Unique ticket identifier |
| `subject` | Subject | Ticket subject line |
| `status` | Status | Current ticket status |
| `priority` | Priority | Ticket priority level |
| `createdTime` | Created | When ticket was created |
| `contact.firstName` + `contact.lastName` | Customer | Customer name |
| `contact.email` | Email | Customer email |
| `contact.phone` | Phone | Customer phone |
| `assignee` | Assigned To | Staff member assigned |
| `channel` | Channel | How ticket was submitted |

### Status Mapping

| Zoho Status | Display Status | Color |
|-------------|----------------|-------|
| Open | Open | Blue |
| In Progress | In Progress | Yellow |
| Waiting for Customer | Waiting for Customer | Orange |
| Closed | Resolved | Green |
| On Hold | On Hold | Gray |

## Advanced Configuration

### Custom Fields

To include custom fields in the integration:

1. **Identify Custom Field API Names**:
   - In Zoho Desk, go to Setup > Customization > Layouts and Fields
   - Note the API names of custom fields (usually start with `cf_`)

2. **Update Type Definitions**:
   - Add custom fields to `lib/types/zoho.ts`
   - Update the `ZohoTicket` interface

3. **Update Data Transformation**:
   - Modify `app/admin/support/page.tsx` to include custom fields
   - Add new columns to the DataTable

### Webhook Integration

For real-time updates, you can set up Zoho Desk webhooks:

1. **Create Webhook Endpoint**:
   - Add `app/api/webhooks/zoho/route.ts`
   - Implement webhook verification and processing

2. **Configure in Zoho Desk**:
   - Go to Setup > Developer Space > Webhooks
   - Create new webhook pointing to your endpoint

## Support

For additional help:

- **Zoho Desk API Documentation**: [https://desk.zoho.in/DeskAPIDocument](https://desk.zoho.in/DeskAPIDocument)
- **Zoho API Console**: [https://api-console.zoho.in/](https://api-console.zoho.in/)
- **Community Support**: Zoho Developer Community

## Changelog

- **v1.0.0**: Initial Zoho Desk integration
  - Basic ticket fetching and display
  - Statistics dashboard
  - Admin-only access control
  - Error handling and retry logic
