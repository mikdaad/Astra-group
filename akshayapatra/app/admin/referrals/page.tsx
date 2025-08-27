'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Settings, Percent, Users, TrendingUp, DollarSign, BarChart3, UserPlus, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import GlowCard from '@/app/components/admin/GlowCard'
import ReferralSettingsDialog from '@/app/components/admin/ReferralSettingsDialog'
import { Badge } from '@/components/ui/badge'
import { useRBAC } from '@/hooks/useRBAC'
import { toast } from 'sonner'

import { createClient } from '@/utils/supabase/client'

interface ReferralLevel {
  id: string
  level: number
  commission_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_commission: number
  monthly_commission: number
  level_breakdown: {
    level: number
    count: number
    commission: number
  }[]
}

export default function ReferralDashboardPage() {
  const { hasPermission, loading: rbacLoading } = useRBAC()
  const [levels, setLevels] = useState<ReferralLevel[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Check permissions
  const canViewReferrals = hasPermission('referrals:view')
  const canEditReferrals = hasPermission('referrals:edit')
  
  // Form state for editing/creating
  const [formData, setFormData] = useState({
    level: 1,
    commission_percentage: 0,
    is_active: true
  })

  const supabase = createClient()

  // Fetch referral levels and stats
  const fetchLevels = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('referral_levels')
        .select('*')
        .order('level', { ascending: true })

      if (error) {
        throw error
      }

      setLevels(data || [])
      await fetchStats(data || [])
    } catch (err) {
      console.error('Error fetching referral levels:', err)
      setError('Failed to load referral levels')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (levelsData: ReferralLevel[]) => {
    try {
      // Fetch from mv_admin_overview view - now contains daily stats
      const { data: overviewData, error: overviewError } = await supabase
        .from('mv_admin_overview')
        .select('*')
        .order('created_at', { ascending: false })

      if (overviewError) {
        console.error('Error fetching overview stats:', overviewError)
        // Set default stats if there's an error
        setStats({
          total_referrals: 0,
          active_referrals: 0,
          total_commission: 0,
          monthly_commission: 0,
          level_breakdown: levelsData.map(level => ({
            level: level.level,
            count: 0,
            commission: 0
          }))
        })
        return
      }

      if (!overviewData || overviewData.length === 0) {
        console.log('No overview data available - setting default stats')
        // Set default stats if no data is available
        setStats({
          total_referrals: 0,
          active_referrals: 0,
          total_commission: 0,
          monthly_commission: 0,
          level_breakdown: levelsData.map(level => ({
            level: level.level,
            count: 0,
            commission: 0
          }))
        })
        return
      }

      // Aggregate all daily stats for totals
      const totals = overviewData.reduce((acc, day) => {
        acc.total_referrals_direct += day.total_referrals_direct || 0
        acc.total_referrals_indirect += day.total_referrals_indirect || 0
        acc.total_commission_direct += day.total_commission_direct || 0
        acc.total_commission_indirect += day.total_commission_indirect || 0
        acc.total_referral_income += day.total_referral_income || 0
        acc.active_users = Math.max(acc.active_users, day.active_users || 0) // Use latest active users count
        return acc
      }, {
        total_referrals_direct: 0,
        total_referrals_indirect: 0,
        total_commission_direct: 0,
        total_commission_indirect: 0,
        total_referral_income: 0,
        active_users: 0
      })

      // Calculate monthly commission (current month)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyCommission = overviewData
        .filter(day => {
          const dayDate = new Date(day.created_at || day.date)
          return dayDate.getMonth() === currentMonth && dayDate.getFullYear() === currentYear
        })
        .reduce((sum, day) => sum + (day.total_referral_income || 0), 0)

      // Calculate level breakdown using aggregated data
      const levelBreakdown = levelsData.map(level => {
        let referralCount = 0
        let commissionTotal = 0
        
        if (level.level === 1) {
          referralCount = totals.total_referrals_direct
          commissionTotal = totals.total_commission_direct
        } else if (level.level === 2) {
          referralCount = totals.total_referrals_indirect
          commissionTotal = totals.total_commission_indirect
        }
        // For levels 3 and 4, we'll need to add these fields to the view later
        
        return {
          level: level.level,
          count: referralCount,
          commission: commissionTotal
        }
      })

      setStats({
        total_referrals: totals.total_referrals_direct + totals.total_referrals_indirect,
        active_referrals: totals.active_users,
        total_commission: totals.total_referral_income,
        monthly_commission: monthlyCommission,
        level_breakdown: levelBreakdown
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set default stats if there's an error
      setStats({
        total_referrals: 0,
        active_referrals: 0,
        total_commission: 0,
        monthly_commission: 0,
        level_breakdown: levelsData.map(level => ({
          level: level.level,
          count: 0,
          commission: 0
        }))
      })
    }
  }

  useEffect(() => {
    if (!rbacLoading && !canViewReferrals) {
      setError('Access denied. You do not have permission to view referrals.')
      setLoading(false)
      return
    }
    if (canViewReferrals) {
      fetchLevels()
    }
  }, [rbacLoading, canViewReferrals])

  // Create new level
  const createLevel = async () => {
    setError(null)
    setSuccess(null)
    if (!canEditReferrals) {
      setError('Access denied. You do not have permission to edit referrals.')
      return
    }
    
    try {
      setSaving(true)
      setError(null)

      const { data, error } = await supabase
        .from('referral_levels')
        .insert([formData])
        .select()
        .single()

      if (error) {
        throw error
      }

      setLevels(prev => [...prev, data])
      setSuccess('Referral level created successfully')
      resetForm()
    } catch (err: any) {
      console.error('Error creating referral level:', err)
      setError(err.message || 'Failed to create referral level')
    } finally {
      setSaving(false)
    }
  }

  // Update existing level
  const updateLevel = async () => {
    if (!editingId) return
    
    setError(null)
    setSuccess(null)
    if (!canEditReferrals) {
      setError('Access denied. You do not have permission to edit referrals.')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const { data, error } = await supabase
        .from('referral_levels')
        .update(formData)
        .eq('id', editingId)
        .select()
        .single()

      if (error) {
        throw error
      }

      setLevels(prev => prev.map(level => 
        level.id === editingId ? data : level
      ))
      setSuccess('Referral level updated successfully')
      resetForm()
    } catch (err: any) {
      console.error('Error updating referral level:', err)
      setError(err.message || 'Failed to update referral level')
    } finally {
      setSaving(false)
    }
  }

  // Delete level
  const deleteLevel = async (id: string) => {
    setError(null)
    setSuccess(null)
    if (!canEditReferrals) {
      setError('Access denied. You do not have permission to edit referrals.')
      return
    }
    
    if (!confirm('Are you sure you want to delete this referral level?')) return

    try {
      const { error } = await supabase
        .from('referral_levels')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setLevels(prev => prev.filter(level => level.id !== id))
      setSuccess('Referral level deleted successfully')
    } catch (err: any) {
      console.error('Error deleting referral level:', err)
      setError(err.message || 'Failed to delete referral level')
    }
  }

  // Toggle level active status
  const toggleLevelStatus = async (id: string, currentStatus: boolean) => {
    setError(null)
    setSuccess(null)
    if (!canEditReferrals) {
      setError('Access denied. You do not have permission to edit referrals.')
      return
    }
    
    try {
      const { error } = await supabase
        .from('referral_levels')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) {
        throw error
      }

      setLevels(prev => prev.map(level => 
        level.id === id ? { ...level, is_active: !currentStatus } : level
      ))
      setSuccess('Level status updated successfully')
    } catch (err: any) {
      console.error('Error toggling level status:', err)
      setError(err.message || 'Failed to update level status')
    }
  }

  // Start editing
  const startEdit = (level: ReferralLevel) => {
    setEditingId(level.id)
    setFormData({
      level: level.level,
      commission_percentage: level.commission_percentage,
      is_active: level.is_active
    })
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    resetForm()
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      level: 1,
      commission_percentage: 0,
      is_active: true
    })
    setEditingId(null)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateLevel()
    } else {
      createLevel()
    }
  }

  // Clear messages
  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  useEffect(() => {
    const timer = setTimeout(clearMessages, 5000)
    return () => clearTimeout(timer)
  }, [error, success])

  if (loading || rbacLoading) {
    return (
      <div className="min-h-screen w-full">
        <div className="space-y-6 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show skeleton loading state while RBAC is loading
  if (rbacLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-10 w-64 bg-zinc-700 rounded animate-pulse"></div>
            <div className="mt-1 h-4 w-96 bg-zinc-700 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-zinc-700 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <GlowCard key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-zinc-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-zinc-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-32 bg-zinc-700 rounded animate-pulse"></div>
              </CardContent>
            </GlowCard>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <GlowCard>
            <CardHeader>
              <div className="h-6 w-32 bg-zinc-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-zinc-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlowCard>

          <GlowCard>
            <CardHeader>
              <div className="h-6 w-40 bg-zinc-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-zinc-700 rounded">
                    <div className="space-y-1">
                      <div className="h-4 w-16 bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-12 bg-zinc-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlowCard>
        </div>
      </div>
    )
  }

  if (!canViewReferrals) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-sans">
            Referral Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-300 font-sans">
            Overview of referral system performance and statistics
          </p>
        </div>
        <div className="flex gap-2">
            {canEditReferrals && (
              <ReferralSettingsDialog onLevelsUpdate={fetchLevels} />
            )}
          </div>
         </div>

      {error && (
        <div className="rounded border border-red-600 bg-red-600/10 p-3 text-red-300">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-red-600 text-red-300 hover:bg-red-600/20" onClick={() => fetchLevels()}>
                Retry
              </Button>
              <Button size="sm" variant="outline" className="border-red-600 text-red-300 hover:bg-red-600/20" onClick={() => setError(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded border border-green-600 bg-green-600/10 p-3 text-green-300">
          <div className="flex items-center justify-between gap-4">
            <span>{success}</span>
            <Button size="sm" variant="outline" className="border-green-600 text-green-300 hover:bg-green-600/20" onClick={() => setSuccess(null)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlowCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_referrals || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.active_referrals || 0} active
              </p>
            </CardContent>
          </GlowCard>

          <GlowCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats?.total_commission?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">
                All time earnings
              </p>
            </CardContent>
          </GlowCard>

          <GlowCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Commission</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats?.monthly_commission?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </GlowCard>

          <GlowCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Levels</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{levels.filter(l => l.is_active).length}</div>
              <p className="text-xs text-muted-foreground">
                of {levels.length} total levels
              </p>
            </CardContent>
          </GlowCard>
      </div>

      {/* Level Breakdown */}
      <GlowCard>
          <CardHeader>
            <CardTitle>Referral Levels Overview</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Performance breakdown by referral level
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {levels.map((level) => {
                const levelStats = stats?.level_breakdown.find(lb => lb.level === level.level)
                return (
                  <div key={level.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant={level.is_active ? "default" : "secondary"}>
                        Level {level.level}
                      </Badge>
                      <div>
                        <h3 className="font-semibold">
                          {level.level === 1 ? 'Direct Referral' : 
                           level.level === 2 ? 'Indirect Referral' : 
                           level.level === 3 ? 'Third Level Referral' :
                           level.level === 4 ? 'Fourth Level Referral' :
                           `Level ${level.level} Referral`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {level.commission_percentage}% Commission
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium">{levelStats?.count || 0} Referrals</p>
                          <p className="text-xs text-gray-500">
                            ₹{levelStats?.commission?.toFixed(2) || '0.00'} earned
                          </p>
                        </div>
                        <Badge variant={level.is_active ? "default" : "secondary"}>
                          {level.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
      </GlowCard>

      {/* Empty State */}
      {levels.length === 0 && (
        <GlowCard>
            <CardContent className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Referral Levels Configured
              </h3>
              <p className="text-gray-500 mb-4">
                Configure referral levels to start tracking commission structures.
              </p>
              {canEditReferrals && (
                <Link href="/admin/referrals/settings">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Levels
                  </Button>
                </Link>
              )}
            </CardContent>
         </GlowCard>
       )}

       {/* Information Card */}
       <GlowCard className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How Referral Levels Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              <p>• <strong>Level 1 (Direct):</strong> Commission for direct referrals</p>
              <p>• <strong>Level 2 (Indirect):</strong> Commission for referrals of referrals</p>
              <p>• <strong>Level 3 & 4:</strong> Commission for deeper referral chains</p>
              <p>• <strong>Commission Range:</strong> 0% to 100% per level</p>
              <p>• <strong>Active Status:</strong> Only active levels are used in calculations</p>
              <p>• <strong>System Constraint:</strong> Up to 4 referral levels are supported</p>
            </div>
          </CardContent>
       </GlowCard>
     </div>
   )
 }