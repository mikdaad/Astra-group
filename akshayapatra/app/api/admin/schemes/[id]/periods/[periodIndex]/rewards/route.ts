import { NextResponse } from 'next/server'
import { supabaseService } from '../../../../../../../../utils/supabase/api'
import { randomUUID } from 'crypto'
import path from 'path'

const BUCKET = 'scheme-rewards'

// GET handler
export async function GET(req: Request, { params }: { params: Promise<{ id: string; periodIndex: string }> }) {
  const sb = supabaseService()
  const { id, periodIndex } = await params
  const { data, error } = await sb.rpc('get_scheme_period_rewards', {
    p_scheme_id: id,
    p_period_index: Number(periodIndex),
  })
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data })
}

// POST handler
export async function POST(req: Request, { params }: { params: Promise<{ id: string; periodIndex: string }> }) {
  const sb = supabaseService()
  const fd = await req.formData()
  const { id, periodIndex: periodIndexStr } = await params
  console.log('SERVER: Received request with params:', periodIndexStr)
  console.log('SERVER: Received request with params:', id)

  const schemeId = id
  const periodIndex = Number(periodIndexStr)
  const title = (fd.get('title') as string) || null
  const description = (fd.get('description') as string) || null
  const quantity = Number(fd.get('quantity') || 1)
  const setCover = fd.get('setCover') === 'on'
  let imageUrl = (fd.get('imageUrl') as string) || ''
  const file = fd.get('file') as File | null

  try {
    if (!schemeId || !periodIndex) throw new Error('Missing schemeId/periodIndex')

    // If file present, upload to Storage and make public URL
    if (file && file.size > 0) {
      const ext = path.extname(file.name) || '.jpg'
      const key = `scheme-rewards/${schemeId}/period-${String(periodIndex).padStart(2, '0')}/${Date.now()}-${randomUUID()}${ext}`
      const buf = Buffer.from(await file.arrayBuffer())
      const up = await sb.storage.from(BUCKET).upload(key, buf, { upsert: true, contentType: file.type || 'image/jpeg' })
      if (up.error) throw up.error
      const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(key)
      imageUrl = pub.publicUrl
    }

    if (!imageUrl) throw new Error('Provide a file or an image URL')

    const { data, error } = await sb.rpc('upsert_scheme_period_reward', {
      p_scheme_id: schemeId,
      p_period_index: periodIndex,
      p_image_url: imageUrl,
      p_title: title,
      p_description: description,
      p_quantity: quantity,
      p_position: setCover ? 0 : null,
    })
    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, rewardId: data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 400 })
  }
}
