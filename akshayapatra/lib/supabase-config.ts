// lib/supabase-config.ts
import { SupabaseClientOptions } from '@supabase/supabase-js'

/**
 * Enhanced Supabase client configuration to prevent network-related auth issues
 */
export const supabaseConfig: SupabaseClientOptions<any> = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  global: {
    headers: {
      'x-client-info': 'akshayapatra-web@1.0.0'
    }
    // No custom fetch - use default to ensure API key headers work correctly
  }
}

/**
 * Server-side Supabase configuration
 * Less aggressive timeouts for server environments
 */
export const serverSupabaseConfig: SupabaseClientOptions<any> = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-client-info': 'akshayapatra-server@1.0.0'
    },
    fetch: (url: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for server
      
      const enhancedInit: RequestInit = {
        ...init,
        signal: controller.signal
      }
      
      return fetch(url, enhancedInit)
        .then(response => {
          clearTimeout(timeoutId)
          return response
        })
        .catch(error => {
          clearTimeout(timeoutId)
          throw error
        })
    }
  }
}

/**
 * API client configuration for API routes
 */
export const apiSupabaseConfig: SupabaseClientOptions<any> = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'x-client-info': 'akshayapatra-api@1.0.0'
    }
  }
}