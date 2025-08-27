'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Phone, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import PhoneUpdateModal from '@/app/components/admin/PhoneUpdateModal'
import GlowCard from '@/app/components/admin/GlowCard'
import { useRBAC } from '@/hooks/useRBAC'

// Staff profile interface matching database schema
interface StaffProfile {
  id: string
  full_name: string
  phone_number: string | null
  is_active: boolean
  role: string
  created_at: string
  updated_at: string
}

// Admin data interface for UI
interface AdminData {
  id: string
  name: string
  phone: string
  employeeId: string
  avatar: string | null
  roles: Array<{
    id: string
    name: string
    label: string
    description: string
    assignedDate: string
    assignedBy: string
    isActive: boolean
  }>
  permissions: string[]
  department: string
  status: string
}

const permissionLabels: Record<string, string> = {
  user_management: 'User Management',
  staff_management: 'Staff Management',
  financial_oversight: 'Financial Oversight',
  system_configuration: 'System Configuration',
  data_export: 'Data Export',
  audit_logs: 'Audit Logs'
}

export default function AdminProfilePage() {
  const { user, role, permissions, loading: rbacLoading } = useRBAC()
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  // Transform staff profile to admin data format
  const transformStaffProfileToAdminData = (profile: StaffProfile): AdminData => {
    const roleLabels: Record<string, string> = {
      superadmin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      support: 'Support',
      new: 'New Staff'
    }

    const roleDescriptions: Record<string, string> = {
      superadmin: 'Full system access and control',
      admin: 'Administrative access to most features',
      manager: 'Management access with limited admin features',
      support: 'Support access for customer assistance',
      new: 'Basic access for new staff members'
    }

    return {
      id: profile.id,
      name: profile.full_name,
      phone: profile.phone_number || 'Not provided',
      employeeId: profile.id.substring(0, 8).toUpperCase(),
      avatar: null,
      roles: [{
        id: 'role_1',
        name: profile.role,
        label: roleLabels[profile.role] || profile.role,
        description: roleDescriptions[profile.role] || 'Staff member',
        assignedDate: profile.created_at,
        assignedBy: 'system',
        isActive: profile.is_active
      }],
      permissions: permissions,
      department: 'Administration',
      status: profile.is_active ? 'active' : 'inactive'
    }
  }

  // Fetch staff profile data
  const fetchProfileData = async () => {
    if (!user?.id) return

    try {
      setIsDataLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/profile')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }
      
      if (data.success && data.profile) {
        setStaffProfile(data.profile)
        const transformedData = transformStaffProfileToAdminData(data.profile)
        setAdminData(transformedData)
        setNameValue(data.profile.full_name)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    if (!rbacLoading && user?.id) {
      fetchProfileData()
    }
  }, [rbacLoading, user?.id])

  useEffect(() => {
    if (adminData) {
      setNameValue(adminData.name)
    }
  }, [adminData])

  const handleNameEdit = () => {
    setIsEditingName(true)
    setNameValue(adminData?.name ?? '')
    setErrors({})
  }

  const handleNameCancel = () => {
    setIsEditingName(false)
    setNameValue(adminData?.name ?? '')
    setErrors({})
  }

  const handleNameSave = async () => {
    if (!nameValue.trim()) {
      setErrors({ name: 'Name is required' })
      return
    }

    if (nameValue.length < 2) {
      setErrors({ name: 'Name must be at least 2 characters' })
      return
    }

    if (!staffProfile) {
      setErrors({ name: 'Profile data not available' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: nameValue.trim()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }
      
      if (data.success && data.profile) {
        setStaffProfile(data.profile)
        const transformedData = transformStaffProfileToAdminData(data.profile)
        setAdminData(transformedData)
        setIsEditingName(false)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({ name: error instanceof Error ? error.message : 'Failed to update name. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneUpdate = async (newPhone: string) => {
    if (!staffProfile) {
      console.error('Profile data not available')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: newPhone
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update phone')
      }
      
      if (data.success && data.profile) {
        setStaffProfile(data.profile)
        const transformedData = transformStaffProfileToAdminData(data.profile)
        setAdminData(transformedData)
        setIsPhoneModalOpen(false)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Failed to update phone:', error)
      // Handle error appropriately - could show toast or error message
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return '👑'
      case 'manager':
        return '🛡️'
      case 'support':
        return '🎧'
      default:
        return '⭐'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Loading state
  if (isDataLoading || rbacLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
            <span className="text-zinc-300">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-white">Failed to load profile</h3>
              <p className="text-zinc-400 mt-1">{error}</p>
            </div>
            <Button onClick={fetchProfileData} variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!adminData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <User className="h-12 w-12 text-zinc-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-white">No profile data</h3>
              <p className="text-zinc-400 mt-1">Unable to load profile information</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-sans">
            Admin Profile
          </h1>
          <p className="mt-1 text-sm text-zinc-300 font-sans">
            Manage your profile information and view account details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="space-y-6">
          {/* Basic Info Card */}
          <GlowCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={adminData?.avatar || ''} alt={adminData?.name} />
                  <AvatarFallback className="text-xl font-bold bg-orange-600 text-white">
                    {adminData?.name ? getInitials(adminData.name) : 'NA'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{adminData?.name}</h3>
                  <p className="text-zinc-400 font-mono">{adminData?.employeeId}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                    <Badge variant="outline" className="border-orange-600 text-orange-400">
                      {adminData?.department}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-700" />

              {/* Name Field */}
              <div>
                <Label className="text-sm font-medium text-zinc-300">Full Name</Label>
                <div className="mt-2">
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          value={nameValue}
                          onChange={(e) => {
                            setNameValue(e.target.value)
                            if (errors.name) {
                              setErrors({ ...errors, name: '' })
                            }
                          }}
                          placeholder="Enter your full name"
                          className={`bg-zinc-800 border-zinc-600 text-white ${
                            errors.name ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.name && (
                          <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={handleNameSave}
                        disabled={isLoading}
                        className="bg-orange-600 hover:bg-orange-500"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleNameCancel}
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <span className="text-white font-medium">{adminData?.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleNameEdit}
                        className="text-orange-400 hover:bg-orange-600/20"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>



              {/* Phone Field */}
              <div>
                <Label className="text-sm font-medium text-zinc-300">Phone Number</Label>
                <div className="mt-2 flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span className="text-white font-medium">{adminData?.phone}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="text-orange-400 hover:bg-orange-600/20"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  OTP verification required for phone number changes.
                </p>
              </div>
            </CardContent>
          </GlowCard>

          {/* Roles & Permissions */}
          <GlowCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Roles */}
              <div>
                <Label className="text-sm font-medium text-zinc-300 mb-3 block">
                  Current Roles
                </Label>
                <div className="space-y-3">
                  {adminData?.roles?.map((role) => (
                    <div key={role.id} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getRoleIcon(role.name)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white">{role.label}</h4>
                            <Badge className="bg-green-600 text-white text-xs">Active</Badge>
                          </div>
                          <p className="text-sm text-zinc-400">{role.description}</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Assigned on {formatDate(role.assignedDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-zinc-700" />

              {/* Permissions */}
              <div>
                <Label className="text-sm font-medium text-zinc-300 mb-3 block">
                  System Permissions
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {adminData?.permissions?.map((permission) => (
                    <div key={permission} className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">
                        {permissionLabels[permission] || permission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </GlowCard>
        </div>

        {/* Security Note */}
        <div className="space-y-6">
          <GlowCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Security Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-zinc-400">
                <p>
                  Your admin account has elevated privileges. Always:
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Keep your credentials secure</li>
                  <li>• Log out from shared devices</li>
                  <li>• Report suspicious activity</li>
                  <li>• Use strong, unique passwords</li>
                </ul>
              </div>
            </CardContent>
          </GlowCard>
        </div>
      </div>

      {/* Phone Update Modal */}
      <PhoneUpdateModal
        open={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        currentPhone={adminData?.phone || ''}
        onUpdate={handlePhoneUpdate}
      />
    </div>
  )
}
