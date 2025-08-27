import { withAuth, ApiResponse } from '@/utils/api/authWrapper'

// GET - Fetch all referral levels
const GET = withAuth(
  async (req, { user, supabase }) => {
    try {
      const { data, error } = await supabase
        .from('referral_levels')
        .select('*')
        .order('level', { ascending: true })

      if (error) {
        throw error
      }

      return ApiResponse.success(data, 'Referral levels fetched successfully')
    } catch (err: any) {
      console.error('Error fetching referral levels:', err)
      return ApiResponse.error('Failed to fetch referral levels', 500)
    }
  },
  {
    name: 'GET REFERRAL LEVELS',
    methods: ['GET']
  }
)

// POST - Create new referral level
const POST = withAuth(
  async (req, { user, supabase }) => {
    try {
      const { level, commission_percentage, is_active } = await req.json()

      // Validation
      if (!level || ![1, 2].includes(level)) {
        return ApiResponse.error('Level must be 1 or 2', 400)
      }

      if (typeof commission_percentage !== 'number' || commission_percentage < 0 || commission_percentage > 100) {
        return ApiResponse.error('Commission percentage must be between 0 and 100', 400)
      }

      // Check if level already exists
      const { data: existingLevel } = await supabase
        .from('referral_levels')
        .select('id')
        .eq('level', level)
        .single()

      if (existingLevel) {
        return ApiResponse.error(`Level ${level} already exists`, 400)
      }

      // Create new level
      const { data, error } = await supabase
        .from('referral_levels')
        .insert([{
          level,
          commission_percentage,
          is_active: is_active ?? true,
          created_by: user.id
        }])
        .select()
        .single()

      if (error) {
        throw error
      }

      return ApiResponse.success(data, 'Referral level created successfully')
    } catch (err: any) {
      console.error('Error creating referral level:', err)
      return ApiResponse.error('Failed to create referral level', 500)
    }
  },
  {
    name: 'CREATE REFERRAL LEVEL',
    methods: ['POST']
  }
)

export { GET, POST }
