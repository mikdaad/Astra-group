'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
  count?: number
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export default function TabNavigation({ tabs, activeTab, onTabChange, className }: TabNavigationProps) {
  return (
    <div className={clsx('border-b border-orange-600/30', className)}>
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors relative',
              activeTab === tab.id
                ? 'border-orange-600 text-white'
                : 'border-transparent text-white/70 hover:text-white hover:border-orange-600/50'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={clsx(
                'ml-2 px-2 py-1 text-xs rounded-full',
                activeTab === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-600/20 text-orange-300'
              )}>
                {tab.count}
              </span>
            )}
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}