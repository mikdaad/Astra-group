'use client'

import { ArrowLeft, Download, Calendar, RefreshCw, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  showExportButton?: boolean
  showDateFilter?: boolean
  showRefreshButton?: boolean
  showFilterButton?: boolean
  customActions?: React.ReactNode
  onBack?: () => void
  onExport?: () => void
  onRefresh?: () => void
  onFilter?: () => void
}

export default function PageHeader({
  title,
  subtitle,
  showBackButton = false,
  showExportButton = false,
  showDateFilter = false,
  showRefreshButton = false,
  showFilterButton = false,
  customActions,
  onBack,
  onExport,
  onRefresh,
  onFilter
}: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={onBack}
            className="mr-4 p-2 text-white hover:text-white rounded-lg hover:bg-orange-600/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        
        <div>
          <h1 className="text-3xl font-bold text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/70 mt-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {showDateFilter && (
          <button className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-orange-600/30 text-white hover:bg-orange-600/20 transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            December 2024
          </button>
        )}

        {showFilterButton && (
          <button
            onClick={onFilter}
            className="p-2 text-white hover:text-white rounded-lg hover:bg-orange-600/20 transition-colors"
          >
            <Filter className="h-5 w-5" />
          </button>
        )}

        {showRefreshButton && (
          <button
            onClick={onRefresh}
            className="p-2 text-white hover:text-white rounded-lg hover:bg-orange-600/20 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        )}

        {showExportButton && (
          <button
            onClick={onExport}
            className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-orange-600/30 text-white hover:bg-orange-600/20 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        )}

        {customActions}
      </div>
    </motion.div>
  )
}