import { createClient } from '@supabase/supabase-js'
import { apiSupabaseConfig } from '@/lib/supabase-config'

export function createApiClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    apiSupabaseConfig
  )
} 

export function supabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
  return createClient(url, key, { 
    ...apiSupabaseConfig,
    auth: { persistSession: false } 
  })
}
