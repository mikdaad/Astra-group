# Supabase Redis Wrapper Alternative

## Overview

Supabase provides a Redis wrapper that allows you to query Redis data directly from your Postgres database using SQL. This is an alternative to using `ioredis` directly.

## When to Use Supabase Redis Wrapper

### ✅ Good for:
- **Read-only operations** - Analytics, reporting, data inspection
- **SQL-based queries** - Complex queries across Redis and Postgres data
- **Managed infrastructure** - No need to manage Redis separately
- **Data exploration** - Easy to query Redis data with SQL tools

### ❌ Not suitable for:
- **Write operations** - RBAC caching requires SET/DEL operations
- **Performance-critical operations** - Direct Redis access is faster
- **Real-time caching** - RBAC permission checks need immediate responses

## Setup Instructions

### 1. Enable Wrappers Extension

```sql
-- Enable the wrappers extension
create extension if not exists wrappers with schema extensions;
```

### 2. Enable Redis Wrapper

```sql
-- Enable the redis_wrapper FDW
create foreign data wrapper redis_wrapper 
  handler redis_fdw_handler 
  validator redis_fdw_validator;
```

### 3. Store Redis Credentials (Optional - Use Vault)

```sql
-- Save your Redis connection URL in Vault
select vault.create_secret(
  'redis://username:password@127.0.0.1:6379/db',
  'redis',
  'Redis connection URL for Wrappers'
);
```

### 4. Create Redis Server

```sql
-- With Vault (recommended)
create server redis_server
  foreign data wrapper redis_wrapper
  options (
    conn_url_id '<key_ID>' -- The Key ID from above
  );

-- Without Vault (less secure)
create server redis_server
  foreign data wrapper redis_wrapper
  options (
    conn_url 'redis://username:password@127.0.0.1:6379/db'
  );
```

### 5. Create Schema

```sql
-- Create a schema for Redis foreign tables
create schema if not exists redis;
```

### 6. Create Foreign Tables

```sql
-- For user permissions (hash type)
create foreign table redis.user_permissions (
  key text,
  value text
)
server redis_server
options (
  src_type 'hash',
  src_key 'permissions:*'
);

-- For role permissions (hash type)
create foreign table redis.role_permissions (
  key text,
  value text
)
server redis_server
options (
  src_type 'hash',
  src_key 'role:*:permissions'
);

-- For user sessions (hash type)
create foreign table redis.user_sessions (
  key text,
  value text
)
server redis_server
options (
  src_type 'hash',
  src_key 'session:*'
);
```

## Usage Examples

### Query User Permissions

```sql
-- Get all user permissions
SELECT * FROM redis.user_permissions;

-- Get permissions for specific user
SELECT * FROM redis.user_permissions 
WHERE key = 'permissions:user123';

-- Join with Postgres user data
SELECT 
  u.email,
  up.value as permissions
FROM auth.users u
JOIN redis.user_permissions up ON up.key = 'permissions:' || u.id;
```

### Query Role Permissions

```sql
-- Get all role permissions
SELECT * FROM redis.role_permissions;

-- Get permissions for admin role
SELECT * FROM redis.role_permissions 
WHERE key = 'role:admin:permissions';
```

### Analytics Queries

```sql
-- Count active sessions
SELECT COUNT(*) as active_sessions 
FROM redis.user_sessions;

-- Find users with specific permissions
SELECT 
  u.email,
  up.value as permissions
FROM auth.users u
JOIN redis.user_permissions up ON up.key = 'permissions:' || u.id
WHERE up.value LIKE '%admin%';
```

## Limitations

1. **Read-only access** - Cannot perform SET, DEL, or other write operations
2. **No TTL support** - Cannot set or check expiration times
3. **Limited Redis features** - Only basic data retrieval
4. **Performance overhead** - SQL layer adds latency compared to direct Redis access

## Current RBAC System

For the RBAC system, we continue using `ioredis` because:

1. **Write operations needed** - Caching requires SET operations
2. **Performance critical** - Permission checks must be fast
3. **TTL support** - Need to set cache expiration times
4. **Real-time operations** - Immediate cache invalidation

## Hybrid Approach

You could use both:

- **ioredis** for RBAC caching (write operations, performance)
- **Supabase Redis wrapper** for analytics and reporting (read operations, SQL queries)

This gives you the best of both worlds!
