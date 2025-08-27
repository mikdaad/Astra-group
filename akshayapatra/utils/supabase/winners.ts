import { createAdminClient } from './admin'

const supabase = createAdminClient()

export type WinnerRow = {
  id: string
  scheme_id: string
  prize_id: string
  card_id: string
  user_id: string
  user_name: string
  user_email: string
  user_phone: string
  rank: number
  prize_name: string
  prize_value: number
  win_date: string
  status: 'pending' | 'claimed' | 'delivered' | 'cancelled'
  claimed_at?: string
  delivered_at?: string
  delivery_address?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by: string
}

export const WinnerService = {
  async list(filters: {
    schemeId?: string
    status?: string
    cardId?: string
  }): Promise<WinnerRow[]> {
    let query = supabase
      .from('winners')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (filters.schemeId) {
      query = query.eq('scheme_id', filters.schemeId)
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters.cardId) {
      query = query.eq('card_id', filters.cardId)
    }

    const { data, error } = await query
    if (error) {
      console.error('List winners error:', error)
      return []
    }
    return data as WinnerRow[]
  },

  async get(id: string): Promise<WinnerRow | null> {
    const { data, error } = await supabase
      .from('winners')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data as WinnerRow
  },

  async createMultiple({ schemeId, cardIds, createdBy }: {
    schemeId: string
    cardIds: string[]
    createdBy: string
  }): Promise<WinnerRow[] | null> {
    try {
      // Get scheme and prizes info
      const { data: scheme } = await supabase
        .from('schemes')
        .select('number_of_winners')
        .eq('id', schemeId)
        .single()

      if (!scheme) throw new Error('Scheme not found')

      // Get prizes for this scheme
      const { data: prizes } = await supabase
        .from('prizes')
        .select('*')
        .eq('scheme_id', schemeId)
        .eq('is_active', true)
        .order('rank', { ascending: true })
        .limit(scheme.number_of_winners)

      if (!prizes || prizes.length === 0) {
        throw new Error('No active prizes found for this scheme')
      }

      // Get card details for user info
      const { data: cards } = await supabase
        .from('cards')
        .select(`
          id,
          user_id,
          cardholder_name,
          phone_number,
          user_profiles:ref_l1_user_id (
            full_name,
            phone_number
          )
        `)
        .in('id', cardIds)

      if (!cards || cards.length === 0) {
        throw new Error('No valid cards found')
      }

      // Create winners array
      const winnersToCreate = cardIds.slice(0, scheme.number_of_winners).map((cardId, index) => {
        const card = cards.find(c => c.id === cardId)
        const prize = prizes[index] || prizes[prizes.length - 1] // Fallback to last prize if not enough

        return {
          scheme_id: schemeId,
          prize_id: prize.id,
          card_id: cardId,
          user_id: card?.user_id || '',
          user_name: card?.cardholder_name || '',
          user_email: '', // Will be populated from user_profiles if needed
          user_phone: card?.phone_number || '',
          rank: index + 1,
          prize_name: prize.name,
          prize_value: prize.cash_amount || prize.product_details?.estimatedValue || 0,
          win_date: new Date().toISOString(),
          status: 'pending',
          created_by: createdBy
        }
      })

      const { data, error } = await supabase
        .from('winners')
        .insert(winnersToCreate)
        .select('*')

      if (error) {
        console.error('Create winners error:', error)
        return null
      }

      return data as WinnerRow[]
    } catch (error) {
      console.error('Error creating winners:', error)
      return null
    }
  },

  async update(id: string, updates: Partial<WinnerRow>): Promise<WinnerRow | null> {
    const { data, error } = await supabase
      .from('winners')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    if (error) {
      console.error('Update winner error:', error)
      return null
    }
    return data as WinnerRow
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('winners')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('Delete winner error:', error)
      return false
    }
    return true
  }
}
