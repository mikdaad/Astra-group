# Admin Signup with Access Key Setup

This document explains the admin signup flow with access key verification that has been implemented.

## Overview

The admin signup process now requires a valid access key before allowing users to create an admin account. The flow includes:

1. **Access Key Verification** - User enters access key
2. **Key Storage** - Valid key stored in localStorage
3. **Admin Signup** - Standard phone-based signup 
4. **Staff Profile Creation** - Creates staff profile via RPC function
5. **Cleanup** - Access key removed from localStorage

## Implementation Details

### 1. Access Key Form (`/app/components/admin/AccessKeyForm.tsx`)
- Clean UI matching admin theme
- Validates access key via API call
- Stores valid key in localStorage
- Shows appropriate error messages

### 2. API Endpoint (`/app/api/admin/auth/checkaccess/route.ts`)
- **POST** `/api/admin/auth/checkaccess`
- Accepts: `{ accessKey: string }`
- Returns: `{ isValid: boolean, message: string }`
- Calls `validate_admin_access_key()` RPC function

### 3. Admin Signup Flow (`/app/admin/signup/page.tsx`)
- Shows AccessKeyForm first
- Only displays PhoneSignupForm after valid access key
- Seamless transition between steps

### 4. Enhanced Signup Form (`/app/components/auth/PhoneSignupForm.tsx`)
- Detects admin context via pathname
- Retrieves access key from localStorage
- Sends access key with OTP verification
- Clears access key after success

### 5. Admin Verify API (`/app/api/admin/auth/phone/verify-signup-otp/route.ts`)
- Accepts additional `accessKey` parameter
- Calls `create_staff_profile()` RPC function
- Creates staff profile with verification

## Required Supabase Functions

### 1. Access Key Verification
```sql
CREATE OR REPLACE FUNCTION verify_admin_access_key(access_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check against predefined keys
    IF access_key IN ('ADMIN_KEY_2024', 'SUPER_ADMIN_ACCESS', 'DEV_ADMIN_KEY') THEN
        RETURN TRUE;
    END IF;
    
    -- Optional: Check against database table
    -- Log access attempts
    
    RETURN FALSE;
END;
$$;
```

### 2. Staff Profile Creation
```sql
CREATE OR REPLACE FUNCTION create_staff(
    access_key TEXT,
    phone_number TEXT,
    name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    result JSONB;
BEGIN
    -- Verify access key
    IF NOT verify_admin_access_key(access_key) THEN
        RAISE EXCEPTION 'Invalid access key';
    END IF;
    
    -- Get authenticated user ID
    SELECT auth.uid() INTO user_id;
    
    -- Create staff profile
    INSERT INTO staff_profiles (
        id, full_name, phone_number, phone_verified, 
        is_active, role, created_at, updated_at
    ) VALUES (
        user_id, name, phone_number, TRUE, 
        TRUE, 'staff', NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone_number = EXCLUDED.phone_number,
        phone_verified = EXCLUDED.phone_verified,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'user_id', user_id,
        'message', 'Staff profile created successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', SQLERRM
        );
END;
$$;
```

## Database Schema Requirements

### staff_profiles Table
```sql
CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    role TEXT DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Optional: Access Keys Table
```sql
CREATE TABLE admin_access_keys (
    id SERIAL PRIMARY KEY,
    key_value TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id)
);
```

### Optional: Access Logs Table
```sql
CREATE TABLE admin_access_logs (
    id SERIAL PRIMARY KEY,
    access_key_attempted TEXT NOT NULL,
    is_valid BOOLEAN NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

## Security Features

✅ **Access Control** - No signup without valid key
✅ **Server-side Validation** - RPC functions run securely
✅ **Audit Trail** - Optional access attempt logging
✅ **Key Management** - Flexible key storage options
✅ **Session Cleanup** - Keys removed after use

## Configuration

### Default Access Keys
- `ADMIN_KEY_2024`
- `SUPER_ADMIN_ACCESS`
- `DEV_ADMIN_KEY`

### Customization
1. **Modify keys** in `verify_admin_access_key()` function
2. **Create database table** for dynamic key management
3. **Add expiration logic** for time-limited keys
4. **Implement role-based keys** for different admin levels

## Testing

1. Navigate to `/admin/signup`
2. Enter valid access key (e.g., `ADMIN_KEY_2024`)
3. Complete phone-based signup
4. Verify staff profile creation in database
5. Check localStorage cleanup

## Troubleshooting

### Common Issues
- **"Access key not found"** - User refreshed page or cleared localStorage
- **"Invalid access key"** - Key not in allowed list or RPC function error
- **"Failed to create staff profile"** - Database permissions or table missing

### Debug Steps
1. Check browser console for detailed error logs
2. Verify Supabase functions are deployed
3. Confirm staff_profiles table exists and has correct schema
4. Test RPC functions directly in Supabase SQL editor
