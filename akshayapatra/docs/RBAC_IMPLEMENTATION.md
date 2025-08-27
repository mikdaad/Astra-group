# RBAC (Role-Based Access Control) Implementation

This document explains the comprehensive RBAC system implemented for the admin panel using Redis caching and Supabase database.

## Overview

The system provides role-based access control with the following components:
- **5 User Roles**: superadmin, admin, support, manager, new
- **Redis Caching**: For fast permission lookups and session management
- **Supabase Integration**: Database storage for staff profiles and roles
- **Middleware Protection**: Automatic route and API protection
- **React Hooks**: Easy permission checking in components

## Database Schema

```sql
-- Supabase table: staff_profiles
create table public.staff_profiles (
  id uuid not null,
  full_name text not null,
  phone_number text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  role public.roles not null default 'new'::roles,
  constraint staff_profiles_pkey primary key (id),
  constraint staff_profiles_phone_number_key unique (phone_number),
  constraint staff_profiles_id_fkey foreign KEY (id) references auth.users (id) on update CASCADE on delete CASCADE
);

-- Enum for roles
create type public.roles as enum ('superadmin', 'admin', 'support', 'manager', 'new');
```

## Role Permissions

### Role Hierarchy (low to high)
1. **new** - Basic access only
2. **support** - Read-only access to most features
3. **manager** - Can edit most content, no staff management
4. **admin** - Full access except staff management
5. **superadmin** - Complete system access

### Permission Matrix

| Resource | new | support | manager | admin | superadmin |
|----------|-----|---------|---------|-------|------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Users | ❌ | 👁️ | ✏️ | ✏️ | ✏️ |
| Schemes | ❌ | 👁️ | ✏️ | ✏️ | ✏️ |
| Cards | ❌ | 👁️ | ✏️ | ✏️ | ✏️ |
| Staff | ❌ | ❌ | ❌ | ❌ | ✏️ |
| Income | ❌ | 👁️ | 👁️ | ✏️ | ✏️ |
| Support | ❌ | ✏️ | ✏️ | ✏️ | ✏️ |
| Settings | 👁️ | 👁️ | 👁️ | ✏️ | ✏️ |

Legend: ✅ Access, 👁️ View Only, ✏️ Full Access, ❌ No Access

## Environment Variables

Add these to your `.env.local`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Usage Examples

### 1. Using RBAC Hooks in Components

```tsx
import { useRBAC, usePermission, usePermissionGate } from '@/hooks/useRBAC'
import { PERMISSIONS } from '@/lib/types/rbac'

function AdminComponent() {
  const { role, hasPermission, isAdmin } = useRBAC()
  const { hasPermission: canEditUsers } = usePermission(PERMISSIONS.USERS_EDIT)
  const PermissionGate = usePermissionGate(PERMISSIONS.SCHEMES_EDIT)

  return (
    <div>
      <h1>Current Role: {role}</h1>
      
      {/* Conditional rendering based on role */}
      {isAdmin && <AdminControls />}
      
      {/* Permission-based rendering */}
      {canEditUsers && <EditUserButton />}
      
      {/* Using permission gate */}
      <PermissionGate fallback={<ReadOnlyView />}>
        <EditableSchemeForm />
      </PermissionGate>
    </div>
  )
}
```

### 2. Protecting API Routes

```tsx
// app/api/admin/example/route.ts
import { withAuth, withSuperAdmin, AuthErrors } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'

// Basic permission check
export const GET = withAuth(async (req, context, user) => {
  // Your API logic here
  return Response.json({ data: 'success' })
}, { requiredPermission: PERMISSIONS.USERS_VIEW })

// Role-specific protection
export const DELETE = withSuperAdmin(async (req, context, user) => {
  // Only superadmin can access this
  return Response.json({ message: 'Deleted' })
})

// Multiple permissions
export const POST = withAuth(async (req, context, user) => {
  // Check additional permissions manually if needed
  const canCreate = await RBACService.hasPermission(user.id, PERMISSIONS.USERS_EDIT)
  
  if (!canCreate) {
    return AuthErrors.forbidden('Cannot create users')
  }
  
  return Response.json({ message: 'Created' })
}, { minimumRole: 'admin' })
```

### 3. Manual Permission Checks

```tsx
import { RBACService, PermissionChecks } from '@/lib/auth/rbac'

// Direct service calls
const hasPermission = await RBACService.hasPermission(userId, 'users:edit')
const canAccessPage = await RBACService.canAccessPage(userId, '/admin/staff')
const isAdmin = await RBACService.isAdmin(userId)

// Convenient permission checks
const canViewUsers = await PermissionChecks.canViewUsers(userId)
const canEditSchemes = await PermissionChecks.canEditSchemes(userId)
```

### 4. Staff Profile Management

```tsx
import { StaffProfileService } from '@/utils/supabase/staff'

// Get staff profile
const profile = await StaffProfileService.getStaffProfile(userId)

// Update role
await StaffProfileService.updateStaffRole(userId, 'admin')

// Toggle status
await StaffProfileService.toggleStaffStatus(userId, false)

// Get role counts
const counts = await StaffProfileService.getStaffCountByRole()
```

## Navigation Integration

The `GlobalSidebar` component automatically filters navigation items based on user permissions and roles:

```tsx
// The GlobalSidebar automatically handles role-based filtering
import GlobalSidebar from '@/app/shared/GlobalSidebar'

function Layout({ children }) {
  return (
    <div>
      <GlobalSidebar />
      {children}
    </div>
  )
}
```

The sidebar automatically:
- Shows different routes for admin vs user pages
- Filters admin routes based on user permissions
- Hides staff management for non-superadmin users
- Shows loading state while permissions are being fetched

## Middleware Protection

All admin routes and APIs are automatically protected:

- `/admin/*` routes require staff access
- `/api/admin/*` endpoints require appropriate permissions
- Unauthorized access redirects to access denied page
- API calls return proper HTTP status codes

## Redis Caching

The system uses Redis for:
- **User Sessions**: 1 hour TTL
- **User Permissions**: 1 hour TTL  
- **Role Permissions**: 24 hour TTL

Cache keys:
- `session:{userId}` - User session data
- `permissions:{userId}` - User's permissions array
- `role:{role}:permissions` - Role's permission template

## Security Features

1. **Role Hierarchy**: Users can only manage others with lower roles
2. **Self-Protection**: Users cannot modify their own roles or delete themselves
3. **Permission Validation**: All actions validated against current permissions
4. **Cache Invalidation**: User cache cleared when roles/permissions change
5. **Audit Trail**: All role changes logged with timestamps

## Common Patterns

### Page Protection
```tsx
// In page components
const { canAccessPage } = usePageAccess('/admin/staff')

if (!canAccessPage) {
  return <AccessDenied />
}
```

### Button Permissions
```tsx
const { hasPermission } = useRBAC()

<Button 
  disabled={!hasPermission(PERMISSIONS.USERS_DELETE)}
  onClick={deleteUser}
>
  Delete User
</Button>
```

### Conditional Features
```tsx
const { isRole, hasMinimumRole } = useRBAC()

return (
  <div>
    {hasMinimumRole('admin') && <AdminPanel />}
    {isRole('superadmin') && <SuperAdminControls />}
  </div>
)
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check if user has required role in staff_profiles table
2. **Cache Issues**: Permissions might be cached - try clearing with `RBACService.clearUserCache(userId)`
3. **Navigation Not Updating**: The `GlobalSidebar` automatically handles role-based filtering
4. **API 403 Errors**: Verify endpoint permissions match user's role permissions

### Debug Commands

```tsx
// Get current user data
const userData = await RBACService.getUserPermissions(userId)
console.log('User permissions:', userData)

// Check specific permission
const canEdit = await RBACService.hasPermission(userId, 'users:edit')
console.log('Can edit users:', canEdit)

// Verify role
const role = await StaffProfileService.getUserRole(userId)
console.log('User role:', role)
```

This RBAC system provides secure, scalable role-based access control with excellent performance through Redis caching and comprehensive protection across both UI and API layers.
