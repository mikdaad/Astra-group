# Environment Variables

This document lists all environment variables used in the Golden Diamond Investment application.

## Database & Authentication

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URL (for Supabase or direct PostgreSQL)
DATABASE_URL=your_database_connection_string
```

## Redis Configuration (Required for RBAC System)

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_URL=redis://:your_redis_password@localhost:6379

# JWT Secret (for session management)
JWT_SECRET=your_jwt_secret_key_here
```

## External APIs

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Zoho Desk API (Sandbox Environment)
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_BASE_URL=https://desk.zoho.in # Use https://desk.zoho.in for production
ZOHO_ORG_ID=your_zoho_org_id
```

## Development

```env
# Next.js Environment
NODE_ENV=development # or production
NEXT_PUBLIC_APP_URL=http://localhost:3000 # or your production URL
```

## Setup Instructions

1. **Redis Setup** (Required for RBAC):
   - **Local Development**: Install Redis locally or use Docker
   - **Docker**: `docker run -d -p 6379:6379 redis:alpine`
   - **Cloud**: Use Redis Cloud, Upstash, or AWS ElastiCache
   - Set `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` accordingly
   - For local development without password: `REDIS_PASSWORD=` (empty)

2. **Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Geocoding API
   - Create an API key with appropriate restrictions
   - Add the key as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

3. **Supabase Configuration**:
   - Create a Supabase project
   - Copy the project URL and anon key from Settings > API
   - Generate a service role key for server-side operations

4. **Zoho Desk API Setup**:
   - Create a Zoho Desk account and organization
   - Go to Setup > Developer Space > Zoho API Console
   - Create a new Server-based Application
   - Note down the Client ID and Client Secret
   - Set up OAuth consent screen and redirect URI
   - Generate refresh token using OAuth 2.0 flow
   - **Find your Organization ID**: Go to Setup > General > Company Profile and copy the "Organization ID" number

5. **Environment Files**:
   - Copy `.env.example` to `.env.local` for local development
   - Add all required variables to your deployment platform (Vercel, Railway, etc.)

## Security Notes

- Never commit `.env.local` or `.env` files to version control
- Use environment variable restrictions in production
- Rotate API keys regularly
- Use service role keys only on the server side
- Keep Redis password secure and use strong passwords in production