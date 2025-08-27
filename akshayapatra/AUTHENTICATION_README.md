# Authentication System Documentation

This document describes the authentication system implemented in the Akshayapatra application using Next.js, Supabase, and localStorage/sessionStorage for persistence.

## 🏗️ Architecture Overview

The authentication system follows a client-side approach with API routes for backend communication:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Supabase      │
│   (React)       │◄──►│   (Next.js)     │◄──►│   (Auth)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ localStorage/   │    │ Middleware      │    │ Database        │
│ sessionStorage  │    │ (Route Guard)   │    │ (Users)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
├── utils/
│   ├── storage/
│   │   └── auth-storage.ts          # Storage service for auth data
│   └── supabase/
│       ├── client.ts                # Client-side Supabase instance
│       ├── server.ts                # Server-side Supabase instance
│       ├── api.ts                   # API routes Supabase instance
│       └── middleware.ts            # Next.js middleware
├── hooks/
│   └── useAuth.ts                   # React hook for auth state
├── contexts/
│   └── AuthContext.tsx              # React context provider
├── app/
│   ├── api/auth/                    # API routes
│   │   ├── login/route.ts
│   │   ├── signup/route.ts
│   │   ├── logout/route.ts
│   │   ├── forgot-password/route.ts
│   │   └── reset-password/route.ts
│   ├── login/page.tsx               # Login/signup page
│   ├── private/page.tsx             # Protected page
│   ├── logout/page.tsx              # Logout page
│   └── layout.tsx                   # Root layout with AuthProvider
└── middleware.ts                    # Next.js middleware
```

## 🔧 Core Components

### 1. AuthStorageService (`utils/storage/auth-storage.ts`)

A comprehensive storage service that handles:
- **localStorage** for persistent sessions (remember me)
- **sessionStorage** for session-only storage
- Automatic data validation and error handling
- Session expiration checking
- Storage migration between types

**Key Features:**
- Type-safe storage operations
- Server-side rendering compatibility
- Automatic cleanup of expired sessions
- Remember me functionality
- Cross-tab synchronization

### 2. useAuth Hook (`hooks/useAuth.ts`)

React hook that provides:
- Authentication state management
- Login/logout functions
- User data updates
- Automatic state persistence
- Loading states

**Usage:**
```typescript
const { user, isAuthenticated, login, logout } = useAuth()
```

### 3. AuthContext (`contexts/AuthContext.tsx`)

React context provider that:
- Wraps the entire application
- Provides authentication state globally
- Includes route protection utilities

**Usage:**
```typescript
const { user, isAuthenticated } = useAuthContext()
```

## 🔐 Authentication Flow

### 1. User Registration
```
1. User fills signup form
2. Frontend calls /api/auth/signup
3. Supabase creates user account
4. Confirmation email sent
5. User confirms email via link
```

### 2. User Login
```
1. User fills login form
2. Frontend calls /api/auth/login
3. Supabase validates credentials
4. JWT tokens returned
5. Tokens stored in localStorage/sessionStorage
6. User redirected to protected page
```

### 3. Session Management
```
1. App loads → Check localStorage/sessionStorage
2. Valid session found → Restore auth state
3. Expired session → Clear data, redirect to login
4. No session → Show login page
```

### 4. User Logout
```
1. User clicks logout
2. Frontend calls /api/auth/logout
3. Supabase invalidates session
4. Clear localStorage/sessionStorage
5. Redirect to home page
```

## 🛡️ Security Features

### 1. Token Management
- JWT access tokens for API authentication
- Refresh tokens for session renewal
- Automatic token expiration checking
- Secure token storage

### 2. Route Protection
- Client-side route guards
- Middleware-based protection
- Automatic redirects for unauthenticated users

### 3. Data Validation
- Input validation on frontend and backend
- Type-safe data handling
- Error boundary protection

### 4. Storage Security
- Namespaced storage keys
- Automatic data cleanup
- Cross-site scripting protection

## 📱 Usage Examples

### Basic Authentication Check
```typescript
import { useAuthContext } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated } = useAuthContext()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return <div>Welcome, {user?.email}!</div>
}
```

### Protected Route Component
```typescript
import { withAuth } from '@/contexts/AuthContext'

function ProtectedPage() {
  return <div>This is a protected page</div>
}

export default withAuth(ProtectedPage, '/login')
```

### Custom Storage Usage
```typescript
import { authStorage } from '@/utils/storage/auth-storage'

// Save authentication data
authStorage.saveAuth(user, session)

// Check if authenticated
const isAuth = authStorage.isAuthenticated()

// Get access token
const token = authStorage.getAccessToken()
```

## 🔄 State Management

### Authentication State
```typescript
interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

### User Data
```typescript
interface AuthUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at: string
  last_sign_in_at?: string
}
```

### Session Data
```typescript
interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
}
```

## 🚀 Best Practices

### 1. Error Handling
- Always wrap storage operations in try-catch
- Provide meaningful error messages
- Graceful fallbacks for storage failures

### 2. Performance
- Lazy load authentication state
- Minimize re-renders with proper memoization
- Use lightweight hooks for simple checks

### 3. Security
- Never store sensitive data in localStorage
- Validate all user inputs
- Implement proper CSRF protection
- Use HTTPS in production

### 4. User Experience
- Show loading states during authentication
- Provide clear feedback for actions
- Remember user preferences
- Smooth transitions between states

## 🧪 Testing

### Unit Tests
```typescript
// Test storage service
describe('AuthStorageService', () => {
  it('should save and retrieve user data', () => {
    const user = { id: '1', email: 'test@example.com' }
    authStorage.saveUser(user)
    expect(authStorage.getUser()).toEqual(user)
  })
})
```

### Integration Tests
```typescript
// Test authentication flow
describe('Authentication Flow', () => {
  it('should login user and persist session', async () => {
    // Test login API call
    // Verify storage persistence
    // Check state updates
  })
})
```

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

### Storage Configuration
```typescript
// Initialize with remember me preference
authStorage.initializeStorage(rememberMe)

// Set storage type manually
authStorage.setStorageType('localStorage')
```

## 🐛 Troubleshooting

### Common Issues

1. **Session not persisting**
   - Check if localStorage is available
   - Verify storage permissions
   - Check for storage quota exceeded

2. **Authentication state not updating**
   - Ensure AuthProvider wraps the app
   - Check for context usage errors
   - Verify storage data integrity

3. **API calls failing**
   - Check environment variables
   - Verify Supabase configuration
   - Check network connectivity

### Debug Tools
```typescript
// Enable debug logging
console.log('Auth state:', authStorage.getAuthState())
console.log('User data:', authStorage.getUser())
console.log('Session data:', authStorage.getSession())
```

## 📚 Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Context API](https://react.dev/reference/react/createContext)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) 