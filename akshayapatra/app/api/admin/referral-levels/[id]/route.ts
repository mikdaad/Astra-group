import { withAuth, AuthErrors } from '@/utils/api/withAuth'

// PUT - Update referral level
const PUT = withAuth(
  async (req, { params }, user) => {
    try {
      const { id } = params
      const { commission_percentage, is_active } = await req.json()

      // Validation
      if (typeof commission_percentage !== 'number' || commission_percentage < 0 || commission_percentage > 100) {
        return AuthErrors.badRequest('Commission percentage must be between 0 and 100')
      }

      // Create Supabase client
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()

      // Check if level exists
      const { data: existingLevel } = await supabase
        .from('referral_levels')
        .select('id, level, is_active')
        .eq('id', id)
        .single()

      if (!existingLevel) {
        return AuthErrors.notFound('Referral level not found')
      }

      // Update level
      const { data, error } = await supabase
        .from('referral_levels')
        .update({
          commission_percentage,
          is_active: is_active ?? existingLevel.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return Response.json({ success: true, data, message: 'Referral level updated successfully' })
    } catch (err: any) {
      console.error('Error updating referral level:', err)
      return AuthErrors.internalError()
    }
  },
  {
    requiredPermission: 'referral_levels_edit'
  }
)

// DELETE - Delete referral level
const DELETE = withAuth(
  async (req, { params }, user) => {
    try {
      const { id } = params

      // Create Supabase client
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()

      // Check if level exists
      const { data: existingLevel } = await supabase
        .from('referral_levels')
        .select('id, level')
        .eq('id', id)
        .single()

      if (!existingLevel) {
        return AuthErrors.notFound('Referral level not found')
      }

      // Delete level
      const { error } = await supabase
        .from('referral_levels')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      return Response.json({ success: true, message: `Level ${existingLevel.level} deleted successfully` })
    } catch (err: any) {
      console.error('Error deleting referral level:', err)
      return AuthErrors.internalError()
    }
  },
  {
    requiredPermission: 'referral_levels_delete'
  }
)

export { PUT, DELETE }
