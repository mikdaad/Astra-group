# Database-Driven Role-Based Access Control (RBAC) System

## Overview

This document describes the new database-driven RBAC system that allows you to store role configurations and permissions in the database instead of hardcoding them. This provides flexibility to modify permissions without code changes and enables dynamic role management.

## Architecture

### Tables

1. **`role_configurations`** - Stores role definitions with permissions
2. **`custom_permissions`** - Stores available permissions with metadata
3. **`user_role_assignments`** - Links users to roles with custom permissions
4. **`role_permission_history`** - Audit trail for role changes

### Key Features

- **Backward Compatibility**: Works alongside existing hardcoded system
- **Fallback Mechanism**: Automatically falls back to hardcoded system if database is unavailable
- **Hierarchy Support**: Maintains role hierarchy levels
- **Custom Permissions**: Users can have additional permissions beyond their role
- **Audit Trail**: Tracks all role and permission changes
- **Caching**: Redis caching for performance
- **Row Level Security**: Supabase RLS policies for data protection

## Database Schema

### Role Configurations Table

```sql
CREATE TABLE public.role_configurations (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  role_name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  hierarchy_level integer NOT NULL DEFAULT 0,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  accessible_pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  api_endpoints jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_system_role boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.user_profiles(id)
);
```

### Custom Permissions Table

```sql
CREATE TABLE public.custom_permissions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  permission_key text NOT NULL UNIQUE,
  resource text NOT NULL,
  action text NOT NULL,
  display_name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```

### User Role Assignments Table

```sql
CREATE TABLE public.user_role_assignments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role_config_id uuid NOT NULL REFERENCES public.role_configurations(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.user_profiles(id),
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  custom_permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
```

## Setup Instructions

### 1. Run Database Schema

Execute the SQL schema in `database_schema.sql`:

```bash
psql -d your_database -f database_schema.sql
```

### 2. Run Setup Script

```bash
node scripts/setup-role-config-system.js
```

### 3. Verify Setup

Check that the system is working:

```bash
# Test API endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/role-configs
```

## Usage

### Basic Permission Checking

```typescript
import { RBACService } from '@/lib/auth/rbac'
import { PERMISSIONS } from '@/lib/types/rbac'

// Check if user has permission
const hasPermission = await RBACService.hasPermission(userId, PERMISSIONS.USERS_EDIT)

// Check if user can access page
const canAccess = await RBACService.canAccessPage(userId, '/admin/users')

// Check if user can access API
const canAccessAPI = await RBACService.canAccessAPI(userId, '/api/admin/users')
```

### Managing Role Configurations

```typescript
import { RoleConfigService } from '@/utils/supabase/roleConfig'

// Create new role
const newRole = await RoleConfigService.createRoleConfig({
  role_name: 'moderator',
  display_name: 'Moderator',
  description: 'Can moderate content but not manage users',
  hierarchy_level: 3,
  permissions: ['users:view', 'schemes:view', 'schemes:edit'],
  accessible_pages: ['/admin/schemes', '/admin/users'],
  api_endpoints: ['/api/admin/schemes/*', '/api/admin/users/view']
})

// Update role
await RoleConfigService.updateRoleConfig(roleId, {
  permissions: [...existingPermissions, 'new:permission']
})

// Delete role
await RoleConfigService.deleteRoleConfig(roleId)
```

### Managing User Role Assignments

```typescript
// Assign role to user
await RoleConfigService.assignRoleToUser(
  userId,
  roleConfigId,
  assignedBy,
  ['custom:permission1', 'custom:permission2'],
  '2024-12-31T23:59:59Z' // expires_at
)

// Get user's effective permissions
const permissions = await RoleConfigService.getUserEffectivePermissions(userId)

// Remove role from user
await RoleConfigService.removeRoleFromUser(userId, roleConfigId)
```

### API Endpoints

#### Role Configurations

- `GET /api/admin/role-configs` - Get all role configurations
- `POST /api/admin/role-configs` - Create new role configuration
- `GET /api/admin/role-configs/[id]` - Get specific role configuration
- `PUT /api/admin/role-configs/[id]` - Update role configuration
- `DELETE /api/admin/role-configs/[id]` - Delete role configuration

#### User Role Assignments

- `GET /api/admin/user-roles?userId=123` - Get user's role assignments
- `GET /api/admin/user-roles` - Get all role assignments (admin view)
- `POST /api/admin/user-roles` - Assign role to user

## Migration from Hardcoded System

The system automatically migrates users from the hardcoded system:

1. **Automatic Detection**: Checks if user exists in database system
2. **Fallback**: Uses hardcoded system if database system unavailable
3. **Migration**: Automatically migrates users when they first access the system
4. **Backward Compatibility**: Existing code continues to work

### Manual Migration

```typescript
// Migrate specific user
await RBACService.migrateUserToDatabaseSystem(userId)

// Check if database system is available
const isAvailable = await RBACService.isDatabaseSystemAvailable()
```

## Permission Categories

Permissions are organized into categories:

- **dashboard** - Dashboard access
- **user_management** - User CRUD operations
- **staff_management** - Staff member management
- **schemes** - Lottery and investment schemes
- **cards** - Card management
- **financial** - Income and financial data
- **referrals** - Referral system
- **support** - Support ticket system
- **settings** - System settings
- **profile** - User profile management

## Role Hierarchy

The system maintains a role hierarchy:

1. **new** (1) - Basic access only
2. **support** (2) - Read-only access to most features
3. **manager** (3) - Can edit most content, no staff management
4. **admin** (4) - Full access except staff management
5. **superadmin** (5) - Complete system access

Users can only manage users with lower hierarchy levels.

## Security Features

### Row Level Security (RLS)

All tables have RLS policies:

- Only superadmins can modify role configurations
- Users can view their own role assignments
- Read access to active configurations for all authenticated users

### Permission Validation

- All API endpoints validate permissions
- Page access is checked on navigation
- Component rendering is gated by permissions

### Audit Trail

All role and permission changes are logged in `role_permission_history` table.

## Performance Considerations

### Caching

- User permissions are cached in Redis (1 hour TTL)
- Role configurations are cached (24 hour TTL)
- Cache is automatically invalidated on changes

### Database Optimization

- Indexes on frequently queried columns
- JSONB for flexible permission storage
- Efficient joins for permission checking

## Monitoring and Debugging

### Logging

The system provides detailed logging:

```typescript
// Check user permissions
const permissions = await RBACService.getUserPermissions(userId)
console.log('User permissions:', permissions)

// Check specific permission
const canEdit = await RBACService.hasPermission(userId, 'users:edit')
console.log('Can edit users:', canEdit)

// Clear user cache
await RBACService.clearUserCache(userId)
```

### Common Issues

1. **Permission Denied**: Check if user has required role in database
2. **Cache Issues**: Clear user cache with `RBACService.clearUserCache(userId)`
3. **Database Errors**: Verify tables exist and have correct schema
4. **API 403 Errors**: Verify endpoint permissions match user's role permissions

## Best Practices

### Role Design

1. **Principle of Least Privilege**: Give users minimum required permissions
2. **Role Hierarchy**: Use hierarchy levels for management relationships
3. **Custom Permissions**: Use sparingly for exceptional cases
4. **Documentation**: Document role purposes and permissions

### Security

1. **Regular Audits**: Review role assignments periodically
2. **Permission Reviews**: Validate permissions are still needed
3. **Access Logs**: Monitor permission usage
4. **Testing**: Test permission changes in staging environment

### Performance

1. **Cache Management**: Monitor cache hit rates
2. **Database Queries**: Optimize permission checking queries
3. **Batch Operations**: Use batch operations for bulk changes
4. **Monitoring**: Monitor system performance metrics

## Troubleshooting

### Setup Issues

1. **Tables Missing**: Run database schema
2. **Permissions Missing**: Run setup script
3. **Migration Failed**: Check user data integrity

### Runtime Issues

1. **Permission Errors**: Check user role assignments
2. **Cache Issues**: Clear Redis cache
3. **Database Errors**: Check connection and permissions
4. **API Errors**: Verify endpoint permissions

### Performance Issues

1. **Slow Queries**: Check database indexes
2. **Cache Misses**: Monitor Redis performance
3. **Memory Usage**: Check for memory leaks
4. **Network Latency**: Optimize database queries

## Future Enhancements

1. **Permission Groups**: Group related permissions
2. **Time-based Permissions**: Temporary permission grants
3. **Conditional Permissions**: Context-aware permission checking
4. **Permission Analytics**: Usage tracking and reporting
5. **Role Templates**: Predefined role configurations
6. **Bulk Operations**: Mass role assignments
7. **Webhook Integration**: External system notifications
8. **Advanced Auditing**: Detailed change tracking
