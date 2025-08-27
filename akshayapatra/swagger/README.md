# Akshayapatra Platform API Documentation

This directory contains comprehensive API documentation for the Akshayapatra lottery platform, including authentication and admin APIs.

## 🚨 IMPORTANT: Testing Mode

**Admin APIs are currently in TESTING MODE with authentication DISABLED.**

- No authentication headers required for admin endpoints
- APIs use Supabase Service Role Key internally for full database access
- All authentication and role checks are commented out in the code
- Mock user objects are used where user context is needed

### Required Environment Variables for Testing

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

See `../environment-variables.md` for detailed setup instructions.

## Files

### Documentation Files
- `openapi.yaml` - Complete OpenAPI 3.0 specification (Auth + Admin APIs overview)
- `admin-api.yaml` - Detailed OpenAPI specification for Admin APIs
- `index.html` - HTML viewer for the OpenAPI documentation
- `serve-docs.js` - Simple server to view the documentation locally

### Postman Collections
- `akshayapatra-auth-api.postman_collection.json` - Authentication endpoints
- `admin-api.postman_collection.json` - Admin API endpoints with role-based access

## Viewing Documentation

### Option 1: View in Browser (Recommended)
1. Install dependencies: `npm install swagger-ui-express`
2. Run the documentation server: `node serve-docs.js`
3. Open your browser to `http://localhost:3001`

### Option 2: Use Swagger UI Online
1. Go to [editor.swagger.io](https://editor.swagger.io/)
2. Copy and paste the contents of `openapi.yaml` (overview) or `admin-api.yaml` (detailed admin docs)

### Option 3: Import to Postman (Best for Testing)
1. Open Postman
2. Click "Import"
3. Import both collections:
   - `akshayapatra-auth-api.postman_collection.json` (Authentication)
   - `admin-api.postman_collection.json` (Admin APIs)

### Option 4: VS Code Extension
Install the "OpenAPI (Swagger) Editor" extension in VS Code to view and edit the YAML files with syntax highlighting and validation.

## API Overview

### Authentication APIs
The authentication system provides endpoints for:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/google` | Google OAuth authentication |
| POST | `/api/auth/phone/send-otp` | Send OTP for phone login |
| POST | `/api/auth/phone/verify-otp` | Verify OTP for phone login |
| POST | `/api/auth/phone/send-signup-otp` | Send OTP for phone signup |
| POST | `/api/auth/phone/verify-signup-otp` | Verify OTP for phone signup |

### Admin APIs
The admin system provides comprehensive management endpoints:

#### Dashboard & Analytics
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/admin/dashboard` | Dashboard overview with metrics | Staff+ |
| POST | `/api/admin/dashboard` | Quick search across platform | Staff+ |

#### User Management
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/admin/users` | List users with filtering and pagination | Staff+ |
| POST | `/api/admin/users` | Create new user | Admin+ |
| GET | `/api/admin/users/{id}` | Get user details | Staff+ |
| PUT | `/api/admin/users/{id}` | Update user | Admin+ |
| DELETE | `/api/admin/users/{id}` | Deactivate user | SuperAdmin |

#### Card Management
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/admin/cards` | List cards with comprehensive filtering | Staff+ |
| POST | `/api/admin/cards` | Create new card | Admin+ |
| GET | `/api/admin/cards/{id}` | Get card details with referral tree | Staff+ |
| PUT | `/api/admin/cards/{id}` | Update/suspend card | Admin+ |
| DELETE | `/api/admin/cards/{id}` | Deactivate card | SuperAdmin |

#### Transaction Management
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/admin/transactions` | List transactions with advanced filtering | Staff+/Payments |
| POST | `/api/admin/transactions` | Create new transaction | Admin+/Payments |

#### Income Analytics
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/admin/income` | Comprehensive income analytics | Admin+/Payments |
| POST | `/api/admin/income` | Generate detailed income reports | Admin+ |

#### Referral Management
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/admin/referrals` | Referral data with statistics | Staff+ |
| POST | `/api/admin/referrals` | Get complete referral tree | Staff+ |

#### Staff Management
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/admin/staff` | List staff members with roles | Admin+ |
| POST | `/api/admin/staff` | Assign/remove/create roles | Admin+ |

#### System Settings
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/admin/settings` | Get system configuration | Admin+ |
| POST | `/api/admin/settings` | Update settings/referral levels/roles | Admin+ |

#### Support & Audit
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/admin/support` | Get tickets/audit logs/system logs | Staff+ |
| POST | `/api/admin/support` | Manage support operations/export data | Staff+ |

#### Payment Processing
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/api/admin/payments` | Process invoice payments or bulk payments | Payments |

## Role-Based Access Control

Admin APIs use role-based permissions:

| Role | Hierarchy | Permissions |
|------|-----------|-------------|
| **SuperAdmin** | Highest | Full access to all endpoints including deletions |
| **Admin** | High | Access to most endpoints except sensitive system operations |
| **Support** | Medium | Read access and limited write access for support operations |
| **Payments** | Medium | Access to payment and transaction related endpoints |
| **User** | Lowest | Standard user access (no admin endpoints) |

**Legend**: 
- Staff+ = Support, Admin, SuperAdmin
- Admin+ = Admin, SuperAdmin
- Payments = Payments, Admin, SuperAdmin

## Environment Variables

Set the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url

# Database (for PostgreSQL functions)
DATABASE_URL=your_supabase_database_connection_string
```

## Authentication & Authorization

### For Regular APIs
Authentication is handled through Supabase Auth:
```bash
Authorization: Bearer <supabase_jwt_token>
```

### For Admin APIs
Admin APIs require both authentication AND appropriate role permissions:
1. **Authentication**: Valid Supabase JWT token
2. **Authorization**: User must have appropriate role (SuperAdmin, Admin, Support, or Payments)

Role checking is done via database functions:
- `app_is_staff()` - Checks for SuperAdmin, Admin, or Support roles
- `app_is_admin()` - Checks for SuperAdmin or Admin roles
- `app_is_payments()` - Checks for Payments, Admin, or SuperAdmin roles

## Response Format

All API endpoints return consistent JSON responses:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "pagination": {  // For paginated endpoints
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional error details (optional)"
}
```

## Database Functions

The APIs leverage PostgreSQL functions for:
- **Permission checking**: `app_is_staff()`, `app_is_admin()`, `app_is_payments()`
- **Payment processing**: `mark_invoice_paid()` (atomic payment operations)
- **Statistics**: `get_user_stats()`, `get_income_analytics()`, etc.
- **Referral trees**: `get_complete_referral_tree()`

## Testing

### Using Postman (Recommended)
1. Import both collections
2. Set environment variables:
   - `baseUrl`: http://localhost:3000 (or your server URL)
   - `authToken`: NOT_REQUIRED_FOR_TESTING (admin APIs)
3. **For Authentication APIs**: Test auth endpoints to get valid tokens
4. **For Admin APIs**: No authentication required - call endpoints directly

### Using curl

#### Authentication Examples
```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword123"}'

# Phone OTP
curl -X POST http://localhost:3000/api/auth/phone/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

#### Admin API Examples (No Auth Required for Testing)
```bash
# Get dashboard overview
curl "http://localhost:3000/api/admin/dashboard?period=month"

# Create user
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"full_name":"John Doe","phone_number":"+1234567890"}' \
     "http://localhost:3000/api/admin/users"

# Get users with filters
curl "http://localhost:3000/api/admin/users?page=1&limit=10&status=active&kyc_verified=true"

# Ban/unban user
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"action":"ban","user_id":"user-uuid","duration":"876600h","reason":"Testing"}' \
     "http://localhost:3000/api/admin/users/ban"

# Create role
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"action":"create_role","name":"test_role","description":"Test Role","hierarchy_level":5}' \
     "http://localhost:3000/api/admin/roles"

# Process payment
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"action":"mark_invoice_paid","invoice_id":"UUID","amount":100.00,"method":"upi_one_time"}' \
     "http://localhost:3000/api/admin/payments"
```

### Frontend Integration (Testing Mode)
```typescript
// Example: Fetch users in React component (No auth required for testing)
const fetchUsers = async (filters = {}) => {
  const response = await fetch('/api/admin/users?' + new URLSearchParams(filters), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

// Example: Ban/unban user
const banUser = async (userId, duration = "876600h", reason = "Testing") => {
  const response = await fetch('/api/admin/users/ban', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'ban',
      user_id: userId,
      duration,
      reason
    })
  });
  return response.json();
};

// Example: Process payment
const processPayment = async (paymentData) => {
  const response = await fetch('/api/admin/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'mark_invoice_paid',
      ...paymentData
    })
  });
  return response.json();
};

// Note: When authentication is re-enabled, add this header:
// 'Authorization': `Bearer ${supabaseToken}`,
```

## Rate Limiting

Admin operations have rate limits:
- **General admin operations**: 100 requests per minute
- **Data export operations**: 10 requests per hour
- **Bulk operations**: 20 requests per minute

## Common Error Codes

| HTTP Code | Description | Common Causes |
|-----------|-------------|---------------|
| 200 | Success | Operation completed successfully |
| 400 | Bad Request | Validation errors, missing required fields |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | Insufficient role permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate creation) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Database errors, function failures |

## Filtering and Pagination

### Standard Query Parameters
Most GET endpoints support these parameters:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number (1-based) | 1 |
| `limit` | integer | Items per page (max 100) | 10 |
| `search` | string | Search query (min 2 chars) | - |
| `sort_by` | string | Field to sort by | created_at |
| `sort_order` | string | Sort order (asc/desc) | desc |

### Entity-Specific Filters
Each endpoint supports additional filters relevant to the entity (users, cards, transactions, etc.). See the detailed API documentation for complete filter lists.

## Contributing

When adding new endpoints or modifying existing ones:

1. Update the appropriate OpenAPI YAML file (`openapi.yaml` or `admin-api.yaml`)
2. Add the endpoint to the relevant Postman collection
3. Add appropriate examples and descriptions
4. Update this README if needed
5. Test the documentation using Swagger UI
6. Deploy database functions if new ones are created

## Support

For API support or questions:
- **General Documentation**: See `openapi.yaml` and `admin-api.yaml`
- **Database Functions**: See `../tables_supabase.md` for function definitions
- **Implementation Details**: See `../app/api/admin/UPDATED_API_DESIGN.md`
- **Admin Interface**: See admin components in `../app/components/admin/`

## Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)