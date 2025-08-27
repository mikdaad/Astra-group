import { createAdminClient } from './admin'

const supabase = createAdminClient()

export type SchemeRow = {
  id: string
  name: string
  description: string | null
  subscription_amount: string
  image_url: string | null
  scheme_type: string | null
  max_participants: number | null
  number_of_winners: number | null
  start_date: string
  end_date: string
  draw_date: string | null
  subscription_cycle: string | null
  auto_renewal: boolean | null
  status: string | null
  winner_selection_criteria: any
  terms_and_conditions: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export const SchemeStorage = {
  bucket: 'scheme-images',
  async uploadImage(schemeId: string, file: File): Promise<{ publicUrl: string; path: string } | null> {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${schemeId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from(this.bucket).upload(path, await file.arrayBuffer(), {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })
    if (error) {
      console.error('Upload image failed:', error)
      return null
    }
    const { data: pub } = supabase.storage.from(this.bucket).getPublicUrl(path)
    return { publicUrl: pub.publicUrl, path }
  },
  async deleteByPublicUrl(publicUrl: string): Promise<void> {
    const marker = `/object/public/${this.bucket}/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return
    const path = publicUrl.substring(idx + marker.length)
    await supabase.storage.from(this.bucket).remove([path])
  }
}

export const SchemeService = {
  async list(): Promise<SchemeRow[]> {
    const { data, error } = await supabase.from('schemes').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('List schemes error:', error)
      return []
    }
    return data as SchemeRow[]
  },
  async get(id: string): Promise<SchemeRow | null> {
    const { data, error } = await supabase.from('schemes').select('*').eq('id', id).single()
    if (error) return null
    return data as SchemeRow
  },
  async create(payload: Partial<SchemeRow>): Promise<SchemeRow | null> {
    const { data, error } = await supabase.from('schemes').insert([payload]).select('*').single()
    if (error) {
      console.error('Create scheme error:', error)
      return null
    }
    return data as SchemeRow
  },
  async update(id: string, updates: Partial<SchemeRow>): Promise<SchemeRow | null> {
    const { data, error } = await supabase.from('schemes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select('*').single()
    if (error) {
      console.error('Update scheme error:', error)
      return null
    }
    return data as SchemeRow
  },
}

export type EligibleCandidate = { scheme_id: string; month: string; user_id: string; created_at: string }
export type WinnerRow = { scheme_id: string; month: string; user_id: string; allow_future_participation: boolean; created_at: string }

export const SchemeDrawService = {
  async listEligible(schemeId: string, month: string): Promise<EligibleCandidate[]> {
    const { data, error } = await supabase
      .from('scheme_eligible_candidates')
      .select('*')
      .eq('scheme_id', schemeId)
      .eq('month', month)
      .order('created_at', { ascending: true })
    if (error) {
      console.error('Eligible fetch error:', error)
      return []
    }
    return data as EligibleCandidate[]
  },
  async listWinners(schemeId: string, month: string): Promise<WinnerRow[]> {
    const { data, error } = await supabase
      .from('scheme_winners')
      .select('*')
      .eq('scheme_id', schemeId)
      .eq('month', month)
      .order('created_at', { ascending: true })
    if (error) {
      console.error('Winners fetch error:', error)
      return []
    }
    return data as WinnerRow[]
  },
  async addWinners(schemeId: string, month: string, winners: { user_id: string; allow_future_participation: boolean }[]): Promise<boolean> {
    if (!winners?.length) return true
    const payload = winners.map(w => ({ scheme_id: schemeId, month, user_id: w.user_id, allow_future_participation: !!w.allow_future_participation }))
    const { error } = await supabase.from('scheme_winners').insert(payload)
    if (error) {
      console.error('Insert winners error:', error)
      return false
    }
    return true
  }
}


