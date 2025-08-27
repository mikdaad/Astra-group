'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Menu, Bell, Settings, User, ChevronDown, Clock, TrendingUp, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface AdminHeaderProps {
  onMenuClick: () => void
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleItems, setVisibleItems] = useState<string[]>(['ABOUT', 'SERVICES', 'CONTACT'])
  const [hiddenItems, setHiddenItems] = useState<string[]>([])
  const [displayName, setDisplayName] = useState('Admin')
  const [displayEmail, setDisplayEmail] = useState('admin@example.com')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Navigation items configuration
  const navigationItems = [
    { id: 'ABOUT', label: 'ABOUT', href: '#' },
    { id: 'SERVICES', label: 'SERVICES', href: '#' },
    { id: 'CONTACT', label: 'CONTACT', href: '#' },
  ]

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
                      'Admin'
          
          // Extract email
          const email = user.email || 'admin@example.com'
          
          // Extract profile image
          const image = user.user_metadata?.profile_image_url || 
                       user.user_metadata?.avatar_url || 
                       null
          
          setDisplayName(name)
          setDisplayEmail(email)
          setProfileImage(image)
        } else {
          // Fallback: try to get from profile cache
          const profileCache = localStorage.getItem('user_profile_cache')
          if (profileCache) {
            const profile = JSON.parse(profileCache)
            setDisplayName(profile.full_name || 'Admin')
            setDisplayEmail(profile.email || 'admin@example.com')
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

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Responsive navigation logic
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      
      // Define breakpoints for responsive behavior
      if (containerWidth < 768) {
        // Mobile: show no items, all in MORE
        setVisibleItems([])
        setHiddenItems(navigationItems.map(item => item.id))
      } else if (containerWidth < 1024) {
        // Tablet: show 1-2 items max
        const maxItems = containerWidth < 900 ? 1 : 2
        setVisibleItems(navigationItems.slice(0, maxItems).map(item => item.id))
        setHiddenItems(navigationItems.slice(maxItems).map(item => item.id))
      } else if (containerWidth < 1200) {
        // Small desktop: show 2 items
        setVisibleItems(navigationItems.slice(0, 2).map(item => item.id))
        setHiddenItems(navigationItems.slice(2).map(item => item.id))
      } else {
        // Large desktop: show all items
        setVisibleItems(navigationItems.map(item => item.id))
        setHiddenItems([])
      }
    }

    handleResize()
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Fallback to window resize for older browsers
    window.addEventListener('resize', handleResize)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Mock search results
  const searchResults = [
    { type: 'Users', title: 'John Doe', description: 'Active user with premium account', icon: Users },
    { type: 'Income', title: 'Monthly Revenue Report', description: '₹45,000 collected this month', icon: TrendingUp },
    { type: 'Support', title: 'Ticket #SP001', description: 'Payment issue from Jane Smith', icon: FileText },
    { type: 'Recent', title: 'Dashboard Overview', description: 'Last visited 2 hours ago', icon: Clock },
  ].filter(result => 
    searchQuery === '' || 
    result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <header 
      ref={containerRef}
      className="flex items-center justify-between px-6 py-4 text-white shadow-lg" 
      style={{
        backgroundImage: 'var(--astra-background, linear-gradient(355deg, #090300 3.07%, #351603 54.29%, #6E2B00 76.89%, #CA5002 97.23%))'
      }}
    >
      {/* Left Section - Logo and Navigation */}
      <div className="flex items-center space-x-8">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-white hover:bg-orange-600/20"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Responsive Navigation Links */}
        <nav ref={navRef} className="hidden md:flex items-center space-x-8">
          {/* Visible navigation items */}
          {navigationItems
            .filter(item => visibleItems.includes(item.id))
            .map(item => (
              <a 
                key={item.id}
                href={item.href} 
                className="text-white hover:text-white/80 transition-colors font-medium whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          
          {/* MORE dropdown - always visible, contains overflow items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`text-white hover:text-white hover:bg-orange-600/20 font-medium relative ${
                  hiddenItems.length > 0 ? 'after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-orange-300 after:rounded-full' : ''
                }`}
              >
                MORE
                <ChevronDown className="ml-1 h-4 w-4" />
                {hiddenItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-300 rounded-full"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-orange-950/50 border-orange-600">
              {/* Hidden navigation items */}
              {navigationItems
                .filter(item => hiddenItems.includes(item.id))
                .map(item => (
                  <DropdownMenuItem key={item.id} className="text-white hover:bg-orange-600 focus:bg-orange-600">
                    <a href={item.href} className="w-full">
                      {item.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              
              {/* Separator only if there are hidden items */}
              {hiddenItems.length > 0 && <DropdownMenuSeparator className="bg-orange-600" />}
              
              {/* Always visible MORE items */}
              <DropdownMenuItem className="text-white hover:bg-orange-600 focus:bg-orange-600">
                Documentation
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-orange-600 focus:bg-orange-600">
                Support
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-orange-600 focus:bg-orange-600">
                API
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <Button
          variant="ghost"
          className="w-full justify-start bg-white/10 border-orange-600/30 text-white/70 hover:bg-orange-600/20 hover:border-orange-600"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="mr-3 h-4 w-4" />
          <span className="text-white/50">Search...</span>
          <div className="ml-auto flex items-center space-x-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
      </div>

      {/* Right Section - Actions and Profile */}
      <div className="flex items-center space-x-4">
        {/* Action Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-orange-600/20"
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
              3
            </span>
          </div>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-orange-600/20"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 text-white hover:bg-orange-600/20 px-3 py-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profileImage || "/placeholder-avatar.jpg"} alt={displayName} />
                <AvatarFallback className="text-white text-sm bg-orange-600">
                  {loading ? '...' : initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{loading ? 'Loading...' : displayName}</div>
                <div className="text-xs text-white/70">{loading ? '...' : displayEmail}</div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-orange-950/50 border-orange-600" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{loading ? 'Loading...' : displayName}</p>
                <p className="text-xs leading-none text-white/70">
                  {loading ? '...' : displayEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-orange-600" />
            <DropdownMenuItem className="text-white hover:bg-orange-600 focus:bg-orange-600">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-orange-600 focus:bg-orange-600">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-orange-600" />
            <DropdownMenuItem className="text-red-300 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white">
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl bg-orange-950/50 border-orange-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Search</DialogTitle>
            <DialogDescription className="text-white/70">
              Search for users, reports, tickets, and more...
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border-orange-600/30 text-white placeholder:text-white/50 focus:border-orange-600 focus:ring-orange-600"
                autoFocus
              />
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result, index) => {
                    const IconComponent = result.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => {
                          // Handle result click
                          setSearchOpen(false)
                          setSearchQuery('')
                        }}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white truncate">
                              {result.title}
                            </p>
                            <span className="ml-2 text-xs text-orange-400 bg-orange-900 px-2 py-1 rounded">
                              {result.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8">
                  <Search className="mx-auto h-12 w-12 text-gray-600" />
                  <h3 className="mt-2 text-sm font-medium text-white">No results found</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Try searching with different keywords
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                        <Users className="mr-2 h-4 w-4" />
                        View All Users
                      </Button>
                      <Button variant="outline" className="justify-start bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Income Reports
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Recent Searches</h3>
                    <div className="space-y-1">
                      {['Dashboard overview', 'User analytics', 'Support tickets'].map((item, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                          onClick={() => setSearchQuery(item)}
                        >
                          <Clock className="inline mr-2 h-3 w-3" />
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}