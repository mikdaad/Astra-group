'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, User, Crown, Shield, UserCheck, Star, Ban, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface StaffProfile {
  id: string
  full_name: string
  phone_number: string | null
  is_active: boolean
  role: string
  created_at: string
  updated_at: string
}

interface StaffEditModalProps {
  staff: StaffProfile | null
  open: boolean
  onClose: () => void
  onSave: (staffId: string | null, staffData: any) => void
  existingStaff: StaffProfile[]
}

export default function StaffEditModal({
  staff,
  open,
  onClose,
  onSave,
  existingStaff
}: StaffEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isActive, setIsActive] = useState(true)
  const [reason, setReason] = useState('')
  const [activeTab, setActiveTab] = useState('roles')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (staff && open) {
      setSelectedRole(staff.role)
      setIsActive(staff.is_active)
      setReason('')
      setActiveTab('roles')
    }
    setErrors({})
  }, [staff, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (activeTab === 'roles' && !selectedRole) {
      newErrors.roles = 'A role must be selected'
    }

    if (activeTab === 'status' && !isActive && !reason.trim()) {
      newErrors.reason = 'Reason is required when deactivating staff'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !staff) {
      return
    }

    setIsLoading(true)
    
    try {
      let updates: any = {}

      if (activeTab === 'roles') {
        updates.role = selectedRole
      }

      if (activeTab === 'status') {
        updates.is_active = isActive
      }

      onSave(staff.id, updates)
    } catch (error) {
      console.error('Error updating staff:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = (roleName: string) => {
    setSelectedRole(roleName)
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: '' }))
    }
  }

  const handleStatusChange = (newStatus: boolean) => {
    setIsActive(newStatus)
    if (newStatus) {
      setReason('')
    }
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: '' }))
    }
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'superadmin':
        return <Crown className="w-4 h-4 text-red-600" />
      case 'admin':
        return <Crown className="w-4 h-4 text-red-400" />
      case 'manager':
        return <Shield className="w-4 h-4 text-purple-400" />
      case 'support':
        return <UserCheck className="w-4 h-4 text-green-400" />
      case 'new':
        return <Star className="w-4 h-4 text-blue-400" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const availableRoles = [
    { name: 'new', label: 'New Staff', description: 'Recently joined staff with basic permissions' },
    { name: 'support', label: 'Support', description: 'Customer support and assistance team' },
    { name: 'manager', label: 'Manager', description: 'Team manager with supervisory permissions' },
    { name: 'admin', label: 'Admin', description: 'Full administrative access and control' },
    { name: 'superadmin', label: 'Super Admin', description: 'Highest level administrative access' }
  ]

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (!staff) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Staff Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Staff Info Card */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-zinc-700 text-white">
                    {getInitials(staff.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg font-semibold">{staff.full_name}</div>
                  <div className="text-sm text-zinc-400">ID: {staff.id.slice(0, 8)}...</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Phone:</span>
                  <div className="text-white">{staff.phone_number || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Joined:</span>
                  <div className="text-white">
                    {new Date(staff.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800 border border-zinc-700 rounded-lg p-1">
              <TabsTrigger
                value="roles"
                className="text-zinc-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow transition-colors"
              >
                Roles
              </TabsTrigger>
              <TabsTrigger
                value="status"
                className="text-zinc-300 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow transition-colors"
              >
                Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-4">
              <div>
                <Label className="text-white">Current Role</Label>
                <div className="mt-2 flex items-center gap-2">
                  {getRoleIcon(staff.role)}
                  <Badge className="bg-zinc-700 text-white">
                    {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-white">Change Role</Label>
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="mt-2 bg-zinc-800 text-white border-zinc-600">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    {availableRoles.map((role) => (
                      <SelectItem key={role.name} value={role.name} className="text-white">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.name)}
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-zinc-400">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roles && (
                  <p className="text-red-400 text-sm mt-1">{errors.roles}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div>
                <Label className="text-white">Current Status</Label>
                <div className="mt-2 flex items-center gap-2">
                  {staff.is_active ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Ban className="w-5 h-5 text-red-400" />
                  )}
                  <Badge className={staff.is_active ? "bg-green-600" : "bg-red-600"}>
                    {staff.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-white">Change Status</Label>
                <div className="mt-2 space-y-2">
                  <Button
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => handleStatusChange(true)}
                    className={isActive ? "bg-green-600 hover:bg-green-700" : "border-zinc-600 text-white"}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Active
                  </Button>
                  <Button
                    type="button"
                    variant={!isActive ? "default" : "outline"}
                    onClick={() => handleStatusChange(false)}
                    className={!isActive ? "bg-red-600 hover:bg-red-700" : "border-zinc-600 text-white"}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Inactive
                  </Button>
                </div>
              </div>

              {!isActive && (
                <div>
                  <Label className="text-white">Reason for Deactivation</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for deactivating this staff member..."
                    className="mt-2 bg-zinc-800 text-white border-zinc-600"
                    rows={3}
                  />
                  {errors.reason && (
                    <p className="text-red-400 text-sm mt-1">{errors.reason}</p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-zinc-600 text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}