'use client'

import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Save,
  X 
} from 'lucide-react'
import DashboardCard from '../../components/dashboard/DashboardCard'

import { Button } from '../../../components/ui/button'

import { Badge } from '../../../components/ui/badge'
import { useEffect, useState } from 'react'

const mockData = {
  categories: [
    { icon: User, name: 'Profile & Security', active: true },
    { icon: Bell, name: 'Notifications', active: false },
  ],
  generalSettings: [
    {
      title: 'Enable Biometric Login',
      description: 'Use Face ID or Fingerprint for secure access',
      enabled: true
    },
    {
      title: 'Enable Investment Notifications',
      description: 'Receive alerts for market changes and portfolio updates',
      enabled: true
    },
    {
      title: 'Location Access for Pricing',
      description: 'Use location for accurate market pricing',
      enabled: false
    }
  ],
  profileSettings: [
    {
      title: 'Edit Personal Information',
      description: 'Update your name, phone, and address',
      enabled: true
    },
    {
      title: 'Investment Preferences',
      description: 'Set your gold vs diamond allocation',
      enabled: true
    },
    {
      title: 'Security Settings',
      description: 'Manage password and authentication',
      enabled: true
    }
  ]
}

export default function SettingsPage() {
  // Local storage keys
  const STORAGE_KEYS = {
    activeCategory: 'settings.activeCategory',
    general: 'settings.general',
    profile: 'settings.profile',
  } as const

  // Persisted UI state
  const [activeCategory, setActiveCategory] = useState<number>(0)
  const [generalSettings, setGeneralSettings] = useState(
    () => mockData.generalSettings.map(s => ({ ...s }))
  )
  const [profileSettings, setProfileSettings] = useState(
    () => mockData.profileSettings.map(s => ({ ...s }))
  )

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const rawActive = window.localStorage.getItem(STORAGE_KEYS.activeCategory)
      if (rawActive !== null) {
        const idx = Number(rawActive)
        if (Number.isFinite(idx)) setActiveCategory(idx)
      }

      const rawGeneral = window.localStorage.getItem(STORAGE_KEYS.general)
      if (rawGeneral) {
        const parsed: Array<{ title: string; enabled: boolean }> = JSON.parse(rawGeneral)
        // Merge by title to preserve order/labels from mockData
        const merged = mockData.generalSettings.map(s => {
          const found = parsed.find(p => p.title === s.title)
          return { ...s, enabled: found?.enabled ?? s.enabled }
        })
        setGeneralSettings(merged)
      }

      const rawProfile = window.localStorage.getItem(STORAGE_KEYS.profile)
      if (rawProfile) {
        const parsed: Array<{ title: string; enabled: boolean }> = JSON.parse(rawProfile)
        const merged = mockData.profileSettings.map(s => {
          const found = parsed.find(p => p.title === s.title)
          return { ...s, enabled: found?.enabled ?? s.enabled }
        })
        setProfileSettings(merged)
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [])

  // Persist helpers
  const persistAll = () => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.activeCategory, String(activeCategory))
      window.localStorage.setItem(
        STORAGE_KEYS.general,
        JSON.stringify(generalSettings.map(({ title, enabled }) => ({ title, enabled })))
      )
      window.localStorage.setItem(
        STORAGE_KEYS.profile,
        JSON.stringify(profileSettings.map(({ title, enabled }) => ({ title, enabled })))
      )
    } catch (e) {
      // ignore
    }
  }

  // Auto-persist on change
  useEffect(() => {
    persistAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, generalSettings, profileSettings])

  const toggleGeneral = (index: number) => {
    setGeneralSettings(prev => prev.map((s, i) => i === index ? { ...s, enabled: !s.enabled } : s))
  }
  const toggleProfile = (index: number) => {
    setProfileSettings(prev => prev.map((s, i) => i === index ? { ...s, enabled: !s.enabled } : s))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Investment Settings</h1>
          <p className="text-orange-200">Manage your investment platform preferences</p>
        </div>

        {/* Investor Settings Badge */}
        <div className="mb-6">
          <Badge className="bg-orange-500 text-white px-6 py-2 text-sm font-medium rounded-full">
            Investor Settings
          </Badge>
        </div>
      </section>

      {/* Category Navigation */}
      <section>
        <DashboardCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockData.categories.map((category, index) => (
              <Button
                key={index}
                onClick={() => setActiveCategory(index)}
                variant={activeCategory === index ? "default" : "outline"}
                className={`flex items-center space-x-3 p-4 h-auto ${
                  activeCategory === index
                    ? 'bg-white text-orange-600 hover:bg-orange-50'
                    : 'bg-transparent text-white border-white border-opacity-30 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <category.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{category.name}</span>
              </Button>
            ))}
          </div>
        </DashboardCard>
      </section>

      {/* Settings Content */}
      <section className="grid grid-cols-1 gap-6">
        {/* General Settings */}
        <DashboardCard>
          <h3 className="text-xl font-bold text-white mb-6">Platform Settings</h3>
          
          <div className="space-y-4">
            {generalSettings.map((setting, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-black bg-opacity-10 rounded-lg hover:bg-opacity-15 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{setting.title}</h4>
                  <p className="text-sm text-orange-200">{setting.description}</p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => toggleGeneral(index)}
                    role="switch"
                    aria-checked={setting.enabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      setting.enabled ? 'bg-orange-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </DashboardCard>

        {/* Profile Settings */}
        <DashboardCard>
          <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
          
          <div className="space-y-4">
            {profileSettings.map((setting, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-black bg-opacity-10 rounded-lg hover:bg-opacity-15 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{setting.title}</h4>
                  <p className="text-sm text-orange-200">{setting.description}</p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => toggleProfile(index)}
                    role="switch"
                    aria-checked={setting.enabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      setting.enabled ? 'bg-orange-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </DashboardCard>
      </section>

      {/* Action Buttons */}
      <section>
        <DashboardCard gradient={false} className="bg-gray-900 bg-opacity-60">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-semibold text-white mb-1">Save Investment Settings</h4>
              <p className="text-orange-200 text-sm">Apply changes to your investment preferences</p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="text-white border-white border-opacity-50 hover:bg-white hover:bg-opacity-10 px-6"
                onClick={() => {
                  // Reset to defaults and persist
                  setGeneralSettings(mockData.generalSettings.map(s => ({ ...s })))
                  setProfileSettings(mockData.profileSettings.map(s => ({ ...s })))
                  setActiveCategory(0)
                  // persist explicitly
                  setTimeout(() => persistAll(), 0)
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                onClick={persistAll}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </DashboardCard>
      </section>
    </div>
  )
}
