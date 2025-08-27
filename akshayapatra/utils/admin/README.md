# Admin Permissions Utilities

This module provides utilities for checking admin permissions in the application.

## Super Admin Check

The `isSuperAdmin` function checks if a user has super admin privileges by examining their app metadata.

### How it works

The function checks the `app_metadata.isSuperAdmin` property of the authenticated user. This property should be set to `true` in Supabase Auth for super admin users.

## Usage Examples

### 1. In API Routes with Enhanced Auth Wrapper

```typescript
import { withEnhancedAuth, ApiResponse } from '@/utils/api/authWrapper'

const handler = withEnhancedAuth(
  async (req, { user, supabase }) => {
    // Your super admin logic here
    return ApiResponse.success({ message: 'Super admin access granted' })
  },
  {
    name: 'SUPER ADMIN API',
    methods: ['GET'],
    superAdminOnly: true,    // ✅ Requires super admin
    requireProfile: true
  }
)

export { handler as GET }
```

### 2. Direct Function Usage

```typescript
import { isSuperAdmin } from '@/utils/admin/permissions'

// In any server-side code
const checkUserPermissions = async (user: User) => {
  if (await isSuperAdmin(user)) {
    console.log('User is super admin')
    // Grant super admin access
  } else {
    console.log('User is not super admin')
    // Regular user flow
  }
}
```

### 3. Multiple Permission Checks

```typescript
import { hasAdminAccess, getAdminLevel } from '@/utils/admin/permissions'

const checkPermissions = async (user: User, supabase: any) => {
  // Check if user has any admin access
  if (await hasAdminAccess(user, supabase)) {
    console.log('User has admin access')
  }
  
  // Get specific admin level
  const level = await getAdminLevel(user, supabase)
  switch (level) {
    case 'super_admin':
      // Super admin privileges
      break
    case 'admin':
      // Regular admin privileges
      break
    case 'none':
      // No admin privileges
      break
  }
}
```

### 4. Client-side Usage (Synchronous)

```typescript
import { isSuperAdminSync } from '@/utils/admin/permissions'

// For client-side components where you already have the user
const MyComponent = ({ user }: { user: User }) => {
  const isSuper = isSuperAdminSync(user)
  
  return (
    <div>
      {isSuper && (
        <button>Super Admin Actions</button>
      )}
    </div>
  )
}
```

## Setting Super Admin in Supabase

To make a user a super admin, update their app metadata in Supabase Auth:

### Using Supabase Dashboard
1. Go to Authentication > Users
2. Click on the user
3. Edit the "User Metadata" section
4. Add to `app_metadata`:
```json
{
  "isSuperAdmin": true
}
```

### Using Supabase Admin SDK
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Set user as super admin
await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { isSuperAdmin: true }
})
```

## Available Functions

- `isSuperAdmin(user)` - Check if user is super admin (async)
- `isSuperAdminSync(user)` - Check if user is super admin (sync)
- `isAdmin(user, supabase)` - Check if user has admin role in database
- `hasAdminAccess(user, supabase)` - Check if user has any admin privileges
- `getAdminLevel(user, supabase)` - Get user's admin level

## Security Notes

- Super admin status is stored in `app_metadata` which can only be modified by service role
- Regular users cannot modify their own `app_metadata`
- Always use server-side checks for sensitive operations
- The sync version should only be used for UI rendering, not access control
