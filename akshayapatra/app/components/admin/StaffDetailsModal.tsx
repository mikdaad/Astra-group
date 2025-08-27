'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Clock,
  Shield,
  Crown,
  UserCheck,
  Star,
  Edit,
  MapPin,
  Users
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { Staff, StaffActivity } from '@/lib/types/staff'

interface StaffDetailsModalProps {
  staff: Staff | null
  open: boolean
  onClose: () => void
  onEdit: (staff: Staff) => void
}

// Activities will be fetched from API when endpoint is available

export default function StaffDetailsModal({
  staff,
  open,
  onClose,
  onEdit
}: StaffDetailsModalProps) {
  const [activities, setActivities] = useState<StaffActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && staff) {
      // Activities feature not yet implemented
      // TODO: Implement staff activities API endpoint
      setActivities([])
      setIsLoading(false)
    }
  }, [open, staff])

  if (!staff) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
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

  const getRoleBadge = (roleName: string) => {
    const config = {
      admin: { color: "bg-red-600", text: "Admin" },
      manager: { color: "bg-purple-600", text: "Manager" },
      support: { color: "bg-green-600", text: "Support" },
      new: { color: "bg-blue-600", text: "New" }
    }[roleName] || { color: "bg-gray-600", text: roleName }

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        {getRoleIcon(roleName)}
        {config.text}
      </Badge>
    )
  }

  const getStatusBadge = (status: Staff['status']) => {
    const config = {
      active: { color: "bg-green-600", text: "Active" },
      inactive: { color: "bg-gray-600", text: "Inactive" },
      suspended: { color: "bg-red-600", text: "Suspended" }
    }[status]
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a120c] border-orange-600/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <User className="text-orange-600 dark:text-orange-400 w-4 h-4" />
            </div>
            Staff Details - {staff.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Staff Profile Header */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <Avatar className="w-20 h-20">
                  <AvatarImage src={staff.avatar} alt={staff.name} />
                  <AvatarFallback className="text-xl font-bold bg-orange-600 text-white">
                    {getInitials(staff.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Basic Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{staff.name}</h3>
                      <p className="text-zinc-400 font-mono">{staff.employeeId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(staff.status)}
                      <Button
                        size="sm"
                        onClick={() => onEdit(staff)}
                        className="bg-orange-600 hover:bg-orange-500"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Roles */}
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {staff.roles.filter(role => role.isActive).map((role) => (
                        <div key={role.id}>
                          {getRoleBadge(role.name)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-700">
                    <div>
                      <p className="text-sm text-zinc-400">Department</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-medium">{staff.department}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Joined</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-medium">{formatDate(staff.joiningDate)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Last Login</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-medium">
                          {staff.lastLoginDate ? formatDate(staff.lastLoginDate) : 'Never'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Reports To</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-medium">
                          {staff.managedBy ? 'Manager' : 'Direct Report'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-400" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-sm text-zinc-400">Email</p>
                    <p className="text-white">{staff.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-sm text-zinc-400">Phone</p>
                    <p className="text-white">{staff.phone}</p>
                  </div>
                </div>
                {staff.address && (
                  <div className="flex items-center gap-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-zinc-400" />
                    <div>
                      <p className="text-sm text-zinc-400">Address</p>
                      <p className="text-white">{staff.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {staff.emergencyContact && (
                <>
                  <Separator className="bg-zinc-700" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-zinc-400">Name</p>
                        <p className="text-white">{staff.emergencyContact.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Phone</p>
                        <p className="text-white">{staff.emergencyContact.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Relation</p>
                        <p className="text-white">{staff.emergencyContact.relation}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Role History */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                Role History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staff.roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(role.name)}
                      <div>
                        <p className="font-medium text-white capitalize">{role.name}</p>
                        <p className="text-sm text-zinc-400">
                          Assigned on {formatDate(role.assignedDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {role.isActive ? (
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-600 text-white">Inactive</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-3 h-16" />
                  ))
                ) : activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-white">{activity.action}</p>
                            <p className="text-sm text-zinc-300 mt-1">{activity.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <Badge variant="outline" className="text-xs">
                              {activity.module}
                            </Badge>
                            <p className="text-xs text-zinc-400 mt-1">
                              {formatDateTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    No recent activities found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {staff.notes && (
            <Card className="bg-zinc-900/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300">{staff.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
