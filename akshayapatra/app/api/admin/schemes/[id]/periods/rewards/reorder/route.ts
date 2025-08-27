import { NextResponse } from 'next/server'
import { supabaseService } from '../../../../../../../../utils/supabase/api'

export async function POST(req: Request, { params }: { params: Promise<{ schemeId: string; periodIndex: string }>}) {
  const sb = supabaseService()
  const body = await req.json().catch(() => ({} as any))
  const ids: string[] = body?.ids || []
  if (!ids.length) return NextResponse.json({ success: false, error: 'Missing ids' }, { status: 400 })

  const { schemeId, periodIndex } = await params
  const { error } = await sb.rpc('reorder_scheme_period_rewards', {
    p_scheme_id: schemeId,
    p_period_index: Number(periodIndex),
    p_ids: ids,
  })
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
