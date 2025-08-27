// app/admin/schemes/[schemeId]/rewards/actions.ts
'use server'

import { supabaseService } from '../../../../../utils/supabase/api'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import path from 'path'

const BUCKET = 'scheme-rewards'

export async function ensurePeriodsAction(formData: FormData) {
  const schemeId = String(formData.get('schemeId') || '')
  const sb = supabaseService()
  const { error } = await sb.rpc('ensure_scheme_periods', { p_scheme_id: schemeId })
  if (error) throw error
  revalidatePath(`/admin/schemes/${schemeId}/rewards`)
}

export async function savePrizeAction(formData: FormData) {
  const schemeId = String(formData.get('schemeId') || '')
  const periodIndex = Number(formData.get('periodIndex') || 0)
  const title = (formData.get('title') as string) || null
  const description = (formData.get('description') as string) || null
  const quantity = Number(formData.get('quantity') || 1)
  const setCover = formData.get('setCover') === 'on'
  const file = formData.get('file') as File | null
  let imageUrl = (formData.get('imageUrl') as string) || ''

  if (!schemeId || !periodIndex) throw new Error('Missing schemeId/periodIndex')

  const sb = supabaseService()

  if (file && file.size > 0) {
    const ext = path.extname(file.name) || '.jpg'
    const key = `scheme-rewards/${schemeId}/period-${String(periodIndex).padStart(2,'0')}/${Date.now()}-${randomUUID()}${ext}`
    const buf = Buffer.from(await file.arrayBuffer())
    const up = await sb.storage.from(BUCKET).upload(key, buf, { upsert: true, contentType: file.type || 'image/jpeg' })
    if (up.error) throw new Error(up.error.message)
    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(key)
    imageUrl = pub.publicUrl
  }
  if (!imageUrl) throw new Error('Provide a file or an image URL')

  const { error } = await sb.rpc('upsert_scheme_period_reward', {
    p_scheme_id: schemeId,
    p_period_index: periodIndex,
    p_image_url: imageUrl,
    p_title: title,
    p_description: description,
    p_quantity: quantity,
    p_position: setCover ? 1 : null
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/schemes/${schemeId}/rewards`)
}

export async function makeCoverAction(formData: FormData) {
  const schemeId = String(formData.get('schemeId') || '')
  const periodIndex = Number(formData.get('periodIndex') || 0)
  const prizeId = String(formData.get('prizeId') || '')
  const currentIds = JSON.parse(String(formData.get('currentIds') || '[]')) as string[]

  const ordered = [prizeId, ...currentIds.filter(id => id !== prizeId)]

  const sb = supabaseService()
  const { error } = await sb.rpc('reorder_scheme_period_rewards', {
    p_scheme_id: schemeId,
    p_period_index: periodIndex,
    p_ids: ordered
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/schemes/${schemeId}/rewards`)
}
