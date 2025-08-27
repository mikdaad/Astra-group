'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, ArrowLeft, Phone, Bell, ChevronDown } from 'lucide-react';
import ReferralButton from '../shared/ReferralButton';

// Updated navigation items with correct links and labels
const navigationItems = [
  { name: 'ABOUT', href: '/about' },
  { name: 'PRIVACY POLICY', href: '/privacy-policy' }
];

export default function Header() {
  const [displayName, setDisplayName] = useState('User');
  const [displayPhone, setDisplayPhone] = useState('No phone');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Fetch user data from localStorage
  useEffect(() => {
    const fetchUserData = () => {
      try {
        // Get session data from localStorage
        const sessionData = localStorage.getItem('session');
        const userData = localStorage.getItem('user');
        
        if (sessionData && userData) {
          const session = JSON.parse(sessionData);
          const user = JSON.parse(userData);
          
          // Extract display name from user metadata
          const name = user.user_metadata?.display_name || 
                      user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0] || 
                      'User';
          
          // Extract phone number
          const phone = user.phone || 
                       user.user_metadata?.phone || 
                       'No phone';
          
          // Extract profile image
          const image = user.user_metadata?.profile_image_url || 
                       user.user_metadata?.avatar_url || 
                       null;
          
          setDisplayName(name);
          setDisplayPhone(phone);
          setProfileImage(image);
        } else {
          // Fallback: try to get from profile cache
          const profileCache = localStorage.getItem('user_profile_cache');
          if (profileCache) {
            const profile = JSON.parse(profileCache);
            setDisplayName(profile.full_name || 'User');
            setDisplayPhone(profile.phone_number || 'No phone');
            setProfileImage(profile.profile_image_url || null);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch user data from localStorage:', error);
        // Keep default values
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    // Listen for storage changes to update header when user data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session' || e.key === 'user' || e.key === 'user_profile_cache') {
        fetchUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const initials = getInitials(displayName)

  return (
    <header className="w-full h-16 md:h-20 absolute top-0 left-0 bg-gradient-to-b from-orange-600 to-amber-800 z-10">
      <div className="flex items-center h-full px-4">
        {/* Left Navigation */}
        <nav className="hidden md:flex items-center gap-2 ml-24">
          {navigationItems.map((item) => (
            <Link key={item.name} href={item.href} passHref>
              <Button
                variant="ghost"
                className="h-10 px-4 text-white font-semibold font-['Poppins'] hover:bg-white/10"
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="relative ml-auto md:ml-[180px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
          <Input
            placeholder="Search"
            className="w-52 h-10 pl-10 bg-zinc-300/20 border-none rounded-3xl text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/30"
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 md:gap-4 ml-3 md:ml-12">
          {/* Referral Button */}
          <ReferralButton variant="desktop" />

          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30"
          >
            <ArrowLeft className="w-4 h-4 text-stone-400" />
          </Button>

          {/* Phone Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-gradient-to-b from-orange-600 to-amber-800 border border-white hover:opacity-90"
          >
            <Phone className="w-4 h-4 text-black" />
          </Button>

          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white/20 rounded-full hover:bg-white/30"
          >
            <Bell className="w-4 h-4 text-stone-400" />
          </Button>
        </div>

        {/* User Profile Dropdown */}
        <div className="hidden md:block ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-60 h-10 bg-white/20 rounded-full px-0 hover:bg-white/30"
              >
                <div className="flex items-center w-full">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profileImage || "https://placehold.co/40x40"} alt="Profile" />
                    <AvatarFallback>
                      {loading ? '...' : initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start ml-3 mr-auto">
                    <span className="text-stone-50 text-sm font-normal font-['Poppins']">
                      {loading ? 'Loading...' : displayName}
                    </span>
                    <span className="text-stone-50 text-xs font-normal font-['Poppins'] tracking-tight">
                      {loading ? '...' : displayPhone}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-orange-500 mr-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}