import { createClient } from '@supabase/supabase-js'

// Service key client for admin operations
// This bypasses RLS and provides full access to the database
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or Service Role Key. Check environment variables.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// For testing purposes - bypasses all auth checks
export const createTestAdminClient = () => {
  // TODO: Remove this when proper auth is implemented
  // This is for testing only and bypasses all security
  return createAdminClient()
}
