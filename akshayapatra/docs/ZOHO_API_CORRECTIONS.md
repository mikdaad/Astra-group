# Zoho Desk API Corrections

Based on the official Zoho Desk API documentation and testing, here are the corrections made to our integration:

## ❌ **Issues Found**

### 1. Invalid Parameter: `sortOrder`
**Error Message:**
```
422 {"errorCode":"UNPROCESSABLE_ENTITY","message":"Extra query parameter 'sortOrder' is present in the input."}
```

**Problem:** 
- Our code was trying to use `sortOrder` parameter
- Zoho Desk API **does not support `sortOrder`**
- Only `sortBy` is supported

**References:**
- [Zoho Desk API Documentation](https://desk.zoho.com/DeskAPIDocument#Tickets#Tickets_Listalltickets)

## ✅ **Corrections Made**

### 1. Removed `sortOrder` Parameter
- **Files Updated:**
  - `app/api/admin/zoho/tickets/route.ts`
  - `app/api/admin/zoho/stats/route.ts`  
  - `hooks/useZohoDesk.ts`
  - `lib/services/zoho.ts`
  - `app/admin/support/page.tsx`
  - `app/components/admin/ZohoTicketFilters.tsx`

### 2. Valid Zoho Desk API Parameters for Tickets

Based on the official documentation, these are the **supported parameters** for `/api/v1/tickets`:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `from` | integer | Starting record number | `0` |
| `limit` | integer | Number of records (max 100) | `100` |
| `sortBy` | string | Field to sort by | `modifiedTime`, `createdTime`, `dueDate` |
| `status` | string | Filter by ticket status | `Open`, `Closed`, `In Progress` |
| `departmentId` | string | Filter by department | `123456789` |
| `viewId` | string | Use predefined view | `987654321` |

### 3. Valid `sortBy` Values

According to Zoho documentation, common `sortBy` values include:
- `modifiedTime` (default)
- `createdTime`
- `dueDate`
- `priority`
- `status`
- `ticketNumber`

**Note:** Zoho API handles sort direction automatically - typically newest first for time fields.

## 🔧 **Current Working Configuration**

### Environment Variables Required:
```env
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret  
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_BASE_URL=https://desk.zoho.in  # India data center
ZOHO_ORG_ID=your_organization_id
```

### Data Center URLs:
- **India**: `https://desk.zoho.in` (as detected from your setup)
- **US**: `https://desk.zoho.com`
- **EU**: `https://desk.zoho.eu`
- **Australia**: `https://desk.zoho.com.au`

### Token Endpoints:
- **India**: `https://accounts.zoho.in/oauth/v2/token`
- **US**: `https://accounts.zoho.com/oauth/v2/token`
- **EU**: `https://accounts.zoho.eu/oauth/v2/token`
- **Australia**: `https://accounts.zoho.com.au/oauth/v2/token`

## 📋 **Required Headers for API Calls**

All Zoho Desk API calls require:
```
Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN
orgId: YOUR_ORGANIZATION_ID
Content-Type: application/json
```

## 🧪 **Testing the Fixed Integration**

### 1. Test Ticket Fetching:
```bash
curl -X GET "http://localhost:3000/api/admin/zoho/tickets?limit=10&sortBy=modifiedTime"
```

### 2. Test Statistics:
```bash
curl -X GET "http://localhost:3000/api/admin/zoho/stats?timeframe=thisMonth"
```

### 3. Test Authentication:
```bash
curl -X POST "http://localhost:3000/api/admin/zoho/auth"
```

## 📚 **Additional Resources**

- [Zoho Desk API Documentation](https://desk.zoho.com/DeskAPIDocument)
- [OAuth 2.0 Setup Guide](https://desk.zoho.com/DeskAPIDocument#Authentication)
- [API Rate Limits](https://desk.zoho.com/DeskAPIDocument#API_Limits)

## 🐛 **Common Issues & Solutions**

### Issue: "Extra query parameter" errors
**Solution:** Remove unsupported parameters like `sortOrder`

### Issue: 401 Unauthorized
**Solution:** Check access token and orgId header

### Issue: 422 Unprocessable Entity  
**Solution:** Verify all parameters are valid per API documentation

### Issue: Wrong data center
**Solution:** Match your Zoho account's data center in both base URL and token endpoint
