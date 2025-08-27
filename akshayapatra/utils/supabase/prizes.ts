import { createAdminClient } from './admin'

const supabase = createAdminClient()

export type PrizeRow = {
  id: string
  scheme_id: string
  name: string
  description: string | null
  rank: number
  image_url: string | null
  prize_type: string
  cash_amount: number | null
  product_details: any
  is_active: boolean
  created_at: string | null
  updated_at: string | null
  created_by: string | null
}

export const PrizeStorage = {
  bucket: 'prize-images',
  async uploadImage(prizeId: string, file: File): Promise<{ publicUrl: string; path: string } | null> {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${prizeId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from(this.bucket).upload(path, await file.arrayBuffer(), {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })
    if (error) {
      console.error('Upload prize image failed:', error)
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

export const PrizeService = {
  async listByScheme(schemeId: string): Promise<PrizeRow[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('scheme_id', schemeId)
      .eq('is_active', true)
      .order('rank', { ascending: true })
    if (error) {
      console.error('List prizes error:', error)
      return []
    }
    return data as PrizeRow[]
  },

  async get(id: string): Promise<PrizeRow | null> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data as PrizeRow
  },

  async create(payload: Partial<PrizeRow>): Promise<PrizeRow | null> {
    const { data, error } = await supabase
      .from('prizes')
      .insert([payload])
      .select('*')
      .single()
    if (error) {
      console.error('Create prize error:', error)
      return null
    }
    return data as PrizeRow
  },

  async update(id: string, updates: Partial<PrizeRow>): Promise<PrizeRow | null> {
    const { data, error } = await supabase
      .from('prizes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      console.error('Update prize error:', error)
      return null
    }
    return data as PrizeRow
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('prizes')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('Delete prize error:', error)
      return false
    }
    return true
  }
}
