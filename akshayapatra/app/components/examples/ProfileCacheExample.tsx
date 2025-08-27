'use client'

import React, { useState } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useProfileUpdate } from '@/hooks/useProfileUpdate'
import { getProfileCacheInfo, clearCachedProfile } from '@/utils/profileCache'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Trash2, User, Phone, Mail } from 'lucide-react'

export default function ProfileCacheExample() {
  const { profile, loading, error, refetch, clearCache } = useUserProfile()
  const { updateName, updatePhone, updating, error: updateError } = useProfileUpdate()
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [cacheInfo, setCacheInfo] = useState(getProfileCacheInfo())

  const handleUpdateName = async () => {
    if (newName.trim()) {
      const success = await updateName(newName.trim())
      if (success) {
        setNewName('')
        setCacheInfo(getProfileCacheInfo())
      }
    }
  }

  const handleUpdatePhone = async () => {
    if (newPhone.trim()) {
      const success = await updatePhone(newPhone.trim())
      if (success) {
        setNewPhone('')
        setCacheInfo(getProfileCacheInfo())
      }
    }
  }

  const handleRefreshCache = async () => {
    await refetch()
    setCacheInfo(getProfileCacheInfo())
  }

  const handleClearCache = () => {
    clearCache()
    clearCachedProfile()
    setCacheInfo(getProfileCacheInfo())
  }

  const refreshCacheInfo = () => {
    setCacheInfo(getProfileCacheInfo())
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Cache Example</h1>
        <p className="text-gray-600">Demonstrates localStorage caching for user profile data</p>
      </div>

      {/* Cache Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Cache Information
            <Button variant="outline" size="sm" onClick={refreshCacheInfo}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Cache Status</p>
              <Badge variant={cacheInfo.hasCache ? (cacheInfo.isValid ? "default" : "secondary") : "destructive"}>
                {cacheInfo.hasCache ? (cacheInfo.isValid ? "Valid" : "Expired") : "No Cache"}
              </Badge>
            </div>
            {cacheInfo.hasCache && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Updated</p>
                  <p className="text-sm text-gray-600">{cacheInfo.lastUpdated}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Age</p>
                  <p className="text-sm text-gray-600">{cacheInfo.ageInMinutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">User ID</p>
                  <p className="text-sm text-gray-600">{cacheInfo.userId}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Data
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefreshCache} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refetch
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading profile data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error: {error}</p>
            </div>
          ) : profile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Full Name</p>
                    <p className="text-lg font-semibold">{profile.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone Number</p>
                    <p className="text-lg font-semibold">{profile.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-lg font-semibold">{profile.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">User Code</p>
                  <p className="text-lg font-semibold">{profile.user_code}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>No profile data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{updateError}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Name</label>
                <div className="flex space-x-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name"
                    disabled={updating}
                  />
                  <Button onClick={handleUpdateName} disabled={updating || !newName.trim()}>
                    {updating ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Phone</label>
                <div className="flex space-x-2">
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Enter new phone"
                    disabled={updating}
                  />
                  <Button onClick={handleUpdatePhone} disabled={updating || !newPhone.trim()}>
                    {updating ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• <strong>Cache First:</strong> Profile data is cached in localStorage for 24 hours</p>
            <p>• <strong>Automatic Invalidation:</strong> Cache is cleared when profile is updated</p>
            <p>• <strong>Fallback:</strong> Uses cached data if network request fails</p>
            <p>• <strong>Optimistic Updates:</strong> UI updates immediately, reverts on error</p>
            <p>• <strong>Performance:</strong> Reduces API calls and improves load times</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
