import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { withAuthRetry } from '@/lib/retry-utils'
import { serverSupabaseConfig } from '@/lib/supabase-config'

export async function updateSession(request: NextRequest) {
  // For public access, simply return the next response without any authentication checks
  return NextResponse.next({
    request,
  })
}
