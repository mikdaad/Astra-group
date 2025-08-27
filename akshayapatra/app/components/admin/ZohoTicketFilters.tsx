'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, RotateCcw } from 'lucide-react'
import { TICKET_STATUS_MAP, PRIORITY_MAP, CHANNEL_MAP } from '@/lib/types/zoho'

interface ZohoTicketFiltersProps {
  onFiltersChange: (filters: TicketFilters) => void
  currentFilters: TicketFilters
  className?: string
}

export interface TicketFilters {
  status: string
  priority: string
  channel: string
  timeframe: string
  sortBy: string
  sortOrder: 'asc' | 'desc' // UI-only; Zoho API may ignore
}

export default function ZohoTicketFilters({
  onFiltersChange,
  currentFilters,
  className,
}: ZohoTicketFiltersProps) {
  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    const newFilters = { ...currentFilters, [key]: value }
    onFiltersChange(newFilters as TicketFilters)
  }

  const handleReset = () => {
    const defaultFilters: TicketFilters = {
      status: 'all',
      priority: 'all',
      channel: 'all',
      timeframe: 'thisMonth',
      sortBy: 'modifiedTime',
      sortOrder: 'desc',
    }
    onFiltersChange(defaultFilters)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Ticket Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Status
            </label>
            <Select
              value={currentFilters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(TICKET_STATUS_MAP).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Priority
            </label>
            <Select
              value={currentFilters.priority}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(PRIORITY_MAP).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Channel Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Channel
            </label>
            <Select
              value={currentFilters.channel}
              onValueChange={(value) => handleFilterChange('channel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {Object.entries(CHANNEL_MAP).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {/* If CHANNEL_MAP.icon is a component, render it as <val.icon className="mr-2 h-4 w-4" /> */}
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeframe Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Timeframe
            </label>
            <Select
              value={currentFilters.timeframe}
              onValueChange={(value) => handleFilterChange('timeframe', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="This Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Sort By
            </label>
            <Select
              value={currentFilters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Modified Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdTime">Created Date</SelectItem>
                <SelectItem value="modifiedTime">Modified Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order (UI-only) */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Order
            </label>
            <Select
              value={currentFilters.sortOrder}
              onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
