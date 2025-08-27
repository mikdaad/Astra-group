import { createAdminClient } from './admin'

const supabase = createAdminClient()

export const EligibleCardService = {
  async getByScheme(schemeId: string): Promise<any[]> {
    try {
      // Get cards that are active, have made at least minimum payments, and are subscribed to the scheme
      const { data, error } = await supabase
        .from('cards')
        .select(`
          id,
          user_id,
          cardholder_name,
          phone_number,
          scheme_id,
          schemes:name,
          subscription_status,
          total_payments_made,
          is_active,
          created_at
        `)
        .eq('scheme_id', schemeId)
        .eq('subscription_status', 'active')
        .eq('is_active', true)
        .gte('total_payments_made', 1) // At least 1 payment made
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Get eligible cards error:', error)
        return []
      }

      return data.map(card => ({
        id: card.id,
        userId: card.user_id,
        cardholderName: card.cardholder_name,
        phoneNumber: card.phone_number,
        schemeId: card.scheme_id,
        schemeName: card.schemes?.name || 'Unknown Scheme',
        subscriptionStatus: card.subscription_status,
        totalPaymentsMade: card.total_payments_made,
        isActive: card.is_active,
        createdAt: card.created_at
      }))
    } catch (error) {
      console.error('Error fetching eligible cards:', error)
      return []
    }
  }
}
