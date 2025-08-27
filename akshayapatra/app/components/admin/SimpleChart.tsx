'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartDataPoint[]
  type: 'bar' | 'line' | 'doughnut'
  title?: string
  className?: string
  showLabels?: boolean
}

export default function SimpleChart({
  data,
  type,
  title,
  className,
  showLabels = true
}: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))

  if (type === 'bar') {
    return (
      <div className={clsx('bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm', className)}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        )}
        <div className="flex items-end justify-between h-32 space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / maxValue) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={clsx(
                  'w-full rounded-t-md',
                  item.color || 'bg-gradient-to-t from-orange-400 to-orange-500'
                )}
                style={{ minHeight: '8px' }}
              />
              {showLabels && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'doughnut') {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let accumulatedPercentage = 0

    return (
      <div className={clsx('bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm', className)}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage} ${100 - percentage}`
                const strokeDashoffset = -accumulatedPercentage
                accumulatedPercentage += percentage

                return (
                  <motion.path
                    key={index}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    initial={{ strokeDasharray: '0 100' }}
                    animate={{ strokeDasharray, strokeDashoffset }}
                    transition={{ delay: index * 0.2, duration: 0.8 }}
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{total}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>
        {showLabels && (
          <div className="mt-4 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Line chart placeholder (simplified)
  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <div className="h-32 flex items-end justify-between space-x-1">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="w-2 bg-gradient-to-t from-orange-400 to-orange-500 rounded-full"
            style={{ minHeight: '4px' }}
          />
        ))}
      </div>
    </div>
  )
}