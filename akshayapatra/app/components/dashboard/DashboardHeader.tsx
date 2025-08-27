'use client'

import { Menu, Search, Bell, Settings, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown-menu'
interface DashboardHeaderProps {
  onMenuClick: () => void
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [displayName, setDisplayName] = useState('User')
  const [displayPhone, setDisplayPhone] = useState('No phone')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications] = useState([
    { id: 1, message: 'New user registered', time: '2 min ago', unread: true },
    { id: 2, message: 'Payment received', time: '5 min ago', unread: true },
    { id: 3, message: 'System update completed', time: '1 hour ago', unread: false },
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  // Check system theme preference
  useEffect(() => {
    const checkTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(isDark)
    }

    checkTheme()
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', checkTheme)

    return () => mediaQuery.removeEventListener('change', checkTheme)
  }, [])

  // Fetch user data from localStorage
  useEffect(() => {
    const fetchUserData = () => {
      try {
        // Get session data from localStorage
        const sessionData = localStorage.getItem('session')
        const userData = localStorage.getItem('user')
        
        if (sessionData && userData) {
          const session = JSON.parse(sessionData)
          const user = JSON.parse(userData)
          
          // Extract display name from user metadata
          const name = user.user_metadata?.display_name || 
                      user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0] || 
                      'User'
          
          // Extract phone number
          const phone = user.phone || 
                       user.user_metadata?.phone || 
                       'No phone'
          
          // Extract profile image
          const image = user.user_metadata?.profile_image_url || 
                       user.user_metadata?.avatar_url || 
                       null
          
          setDisplayName(name)
          setDisplayPhone(phone)
          setProfileImage(image)
        } else {
          // Fallback: try to get from profile cache
          const profileCache = localStorage.getItem('user_profile_cache')
          if (profileCache) {
            const profile = JSON.parse(profileCache)
            setDisplayName(profile.full_name || 'User')
            setDisplayPhone(profile.phone_number || 'No phone')
            setProfileImage(profile.profile_image_url || null)
          }
        }
      } catch (error) {
        console.warn('Failed to fetch user data from localStorage:', error)
        // Keep default values
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
    
    // Listen for storage changes to update header when user data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session' || e.key === 'user' || e.key === 'user_profile_cache') {
        fetchUserData()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const initials = getInitials(displayName)

  return (
    <header className="border-b border-white border-opacity-10 backdrop-blur-sm">
      <div className="px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Mobile menu and navigation */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 text-white hover:text-orange-200 rounded-lg"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-4 py-2 bg-white text-orange-600 hover:bg-orange-50 rounded-full font-medium"
              >
                Overview
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-4 py-2 text-orange-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-full"
              >
                Segmented
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-4 py-2 text-orange-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-full"
              >
                Lead Funnel
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-4 py-2 text-orange-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-full"
              >
                Team
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-4 py-2 text-orange-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-full"
              >
                Account
              </Button>
            </nav>
          </div>

          {/* Right side - Search, notifications, and profile */}
          <div className="flex items-center space-x-4">
            {/* Search bar */}
            <div className="hidden md:flex items-center relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white text-opacity-60" />
                <Input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-64 rounded-full border-orange-300 border-opacity-40 text-white placeholder-white placeholder-opacity-60 focus:border-orange-400 focus:ring-orange-400"
                  style={{
                    background: 'linear-gradient(to top, #090300 0%, #351603 54%, #6E2B00 78%, #CA5002 100%)'
                  }}
                />
              </div>
            </div>

            {/* Mobile search button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden p-2 text-white hover:text-orange-200 rounded-full"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2 text-white hover:text-orange-200 rounded-full">
              <Bell className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-2 w-2 p-0 text-xs">
                <span className="sr-only">New notifications</span>
              </Badge>
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2 hover:bg-transparent focus:bg-transparent">
                  <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {loading ? '...' : initials}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">
                      {loading ? 'Loading...' : displayName}
                    </p>
                    <p className="text-xs text-orange-200">
                      {loading ? '...' : displayPhone}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-gray-900 border-orange-400 border-opacity-30"
              >
                <DropdownMenuItem className="text-white hover:bg-orange-500 hover:bg-opacity-30 hover:text-white focus:bg-orange-500 focus:bg-opacity-30 focus:text-white">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-orange-500 hover:bg-opacity-30 hover:text-white focus:bg-orange-500 focus:bg-opacity-30 focus:text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-orange-400 bg-opacity-30" />
                <DropdownMenuItem className="text-white hover:bg-red-500 hover:bg-opacity-30 hover:text-white focus:bg-red-500 focus:bg-opacity-30 focus:text-white">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}