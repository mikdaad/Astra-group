'use client'

import { motion } from 'framer-motion'
import DashboardCard from '../../components/dashboard/DashboardCard'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Shield, 
  Bell,
  Settings as SettingsIcon,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react'
import { useState } from 'react'

type AccountUserData = {
  profile?: {
    name?: string
    userId?: string
    status?: string
    email?: string
    phone?: string
    address?: string
  }
}

// Menu items configuration (static)
const menuItems = [
  { icon: Phone, title: 'Need Help?', subtitle: 'Live chat support', href: '/dashboard/support' },
  { icon: CreditCard, title: 'Wallet', subtitle: 'Manage your funds', href: '/dashboard/wallet' },
  { icon: CreditCard, title: 'Instalments', subtitle: 'Payment plans', href: '/dashboard/instalments' },
  { icon: SettingsIcon, title: 'Transaction History', subtitle: 'View all transactions', href: '/dashboard/transactions' },
  { icon: User, title: "Winner's List", subtitle: 'Competition results', href: '/dashboard/winners' },
  { icon: Bell, title: "Promoter's", subtitle: 'Referral program', href: '/dashboard/promoters' },
  { icon: Shield, title: 'Rewards', subtitle: 'Your achievements', href: '/dashboard/rewards' },
  { icon: User, title: "Achiever's", subtitle: 'Top performers', href: '/dashboard/achievers' },
  { icon: CreditCard, title: 'Commissions', subtitle: 'Earnings overview', href: '/dashboard/commissions' },
  { icon: SettingsIcon, title: 'Brochure', subtitle: 'Marketing materials', href: '/dashboard/brochure' }
]

export default function AccountPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userData, setUserData] = useState<AccountUserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // TODO: Implement user data fetching from API
  // useEffect(() => {
  //   fetchUserProfile()
  // }, [])

  const initials = (userData?.profile?.name || '')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('') || 'U'

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <section>
        <DashboardCard>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{userData?.profile?.name || 'Loading...'}</h2>
              <p className="text-orange-200">User ID : {userData?.profile?.userId || 'Loading...'}</p>
            </div>
            <Badge variant="secondary" className="bg-green-600 text-white">
              {userData?.profile?.status || 'Loading...'}
            </Badge>
          </div>
        </DashboardCard>
      </section>

      {/* Account Menu Grid */}
      <section>
        <DashboardCard gradient={false} className="bg-gray-900 bg-opacity-80">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-black bg-opacity-40 rounded-lg p-4 hover:bg-opacity-60 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500 bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-colors">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-orange-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400">{item.subtitle}</p>
                  </div>
                  <div className="text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </DashboardCard>
      </section>

      {/* Profile Settings */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <DashboardCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Personal Information</h3>
            <Button size="sm" variant="outline" className="text-white border-white border-opacity-30">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-orange-200">Full Name</p>
                <p className="font-medium">{userData?.profile?.name || 'Not available'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-orange-200">Email Address</p>
                <p className="font-medium">{userData?.profile?.email || 'Not available'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-orange-200">Phone Number</p>
                <p className="font-medium">{userData?.profile?.phone || 'Not available'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-orange-200">Address</p>
                <p className="font-medium">{userData?.profile?.address || 'Not available'}</p>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Security Settings */}
        <DashboardCard>
          <h3 className="text-xl font-bold mb-6">Security Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-orange-200 mb-2">Current Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value="••••••••••"
                  className="bg-white bg-opacity-10 border-orange-300 border-opacity-40 text-white"
                  readOnly
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-orange-200 mb-2">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="bg-white bg-opacity-10 border-orange-300 border-opacity-40 text-white placeholder-white placeholder-opacity-60"
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-sm text-green-400">Two-factor authentication enabled</span>
              </div>
            </div>
            
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              Update Security Settings
            </Button>
          </div>
        </DashboardCard>
      </section>
    </div>
  )
}