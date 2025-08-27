import type { StaffProfile, Role } from '@/lib/types/rbac'
import { createAdminClient } from './admin'
import { createClient } from './client'

// Server-side client for API routes
export const supabaseAdmin = createAdminClient()

// Client-side client for components
export const supabaseClient = createClient()

export class StaffProfileService {
  // Get staff profile by user ID
  static async getStaffProfile(userId: string): Promise<StaffProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('staff_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching staff profile:', error)
      return null
    }

    return data
  }

  // Get all staff profiles
  static async getAllStaffProfiles(): Promise<StaffProfile[]> {
    const { data, error } = await supabaseAdmin
      .from('staff_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching staff profiles:', error)
      return []
    }

    return data || []
  }

  // Create staff profile
  static async createStaffProfile(profile: Omit<StaffProfile, 'created_at' | 'updated_at'>): Promise<StaffProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('staff_profiles')
      .insert([profile])
      .select()
      .single()

    if (error) {
      console.error('Error creating staff profile:', error)
      return null
    }

    return data
  }

  // Update staff profile
  static async updateStaffProfile(userId: string, updates: Partial<StaffProfile>): Promise<StaffProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('staff_profiles')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating staff profile:', error)
      return null
    }

    return data
  }

  // Update staff role
  static async updateStaffRole(userId: string, role: Role): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('staff_profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating staff role:', error)
      return false
    }

    return true
  }

  // Toggle staff active status
  static async toggleStaffStatus(userId: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('staff_profiles')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating staff status:', error)
      return false
    }

    return true
  }

  // Delete staff profile
  static async deleteStaffProfile(userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('staff_profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting staff profile:', error)
      return false
    }

    return true
  }

  // Get staff by role
  static async getStaffByRole(role: Role): Promise<StaffProfile[]> {
    const { data, error } = await supabaseAdmin
      .from('staff_profiles')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching staff by role:', error)
      return []
    }

    return data || []
  }

  // Get active staff count by role
  static async getStaffCountByRole(): Promise<Record<Role, number>> {
    const { data, error } = await supabaseAdmin
      .from('staff_profiles')
      .select('role')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching staff count:', error)
      return {
        superadmin: 0,
        admin: 0,
        support: 0,
        manager: 0,
        new: 0
      }
    }

    const counts = data?.reduce((acc, profile) => {
      const role = profile.role as Role
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<Role, number>)

    return {
      superadmin: counts?.superadmin || 0,
      admin: counts?.admin || 0,
      support: counts?.support || 0,
      manager: counts?.manager || 0,
      new: counts?.new || 0
    }
  }

  // Check if user exists in staff_profiles
  static async isStaffMember(userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('staff_profiles')
      .select('id')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    return !error && !!data
  }

  // Get user role
  static async getUserRole(userId: string): Promise<Role | null> {
    const { data, error } = await supabaseAdmin
      .from('staff_profiles')
      .select('role')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (error) {
      return null
    }

    return data?.role || null
  }

  // Get staff statistics
  static async getStaffStats(): Promise<{
    totalStaff: number
    supportStaff: number
    newStaff: number
    adminStaff: number
    managerStaff: number
    superadminStaff: number
  }> {
    try {
      // Get all active staff
      const { data, error } = await supabaseAdmin
        .from('staff_profiles')
        .select('role')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching staff stats:', error)
        return {
          totalStaff: 0,
          supportStaff: 0,
          newStaff: 0,
          adminStaff: 0,
          managerStaff: 0,
          superadminStaff: 0
        }
      }

      const staff = data || []
      
      const stats = {
        totalStaff: staff.length,
        supportStaff: staff.filter(s => s.role === 'support').length,
        newStaff: staff.filter(s => s.role === 'new').length,
        adminStaff: staff.filter(s => s.role === 'admin').length,
        managerStaff: staff.filter(s => s.role === 'manager').length,
        superadminStaff: staff.filter(s => s.role === 'superadmin').length
      }

      return stats
    } catch (error) {
      console.error('Error calculating staff stats:', error)
      return {
        totalStaff: 0,
        supportStaff: 0,
        newStaff: 0,
        adminStaff: 0,
        managerStaff: 0,
        superadminStaff: 0
      }
    }
  }
}
