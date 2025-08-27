import { supabaseService } from '../../../../../../utils/supabase/api'
// app/api/admin/schemes/[schemeId]/periods/route.ts
import { NextResponse } from 'next/server'


type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const sb = supabaseService()
  const { id } = await params
  console.log('SERVER: Received request with params:', { id });
  const { data, error } = await sb.rpc('get_scheme_periods', { p_scheme_id: id })
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
  return NextResponse.json({ success: true, data })
}

export async function POST(_: Request, { params }: Params) {
  const sb = supabaseService()
  const { id } = await params

  // OPTIONAL: auto-create periods if missing
  const { error: e1 } = await sb.rpc('ensure_scheme_periods', { p_scheme_id: id })
  if (e1) {
    return NextResponse.json({ success: false, error: e1.message }, { status: 400 })
  }

  const { data, error: e2 } = await sb.rpc('get_scheme_periods', { p_scheme_id: id })
  if (e2) {
    return NextResponse.json({ success: false, error: e2.message }, { status: 400 })
  }
  return NextResponse.json({ success: true, data })
}



