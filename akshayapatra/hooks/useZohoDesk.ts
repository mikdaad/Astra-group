/**
 * React Hooks for Zoho Desk Integration
 * These hooks provide easy access to Zoho Desk data with loading states and error handling
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { zohoDeskService } from '@/lib/services/zoho'
import {
  ZohoTicket,
  ZohoStats,
  ZohoTicketsApiResponse,
  ZohoStatsApiResponse,
  CreateTicketRequest
} from '@/lib/types/zoho'

interface UseZohoTicketsParams {
  from?: number
  limit?: number
  status?: string
  sortBy?: string
  // Note: sortOrder is not supported by Zoho Desk API
  autoFetch?: boolean
}

interface UseZohoTicketsReturn {
  tickets: ZohoTicket[]
  loading: boolean
  error: string | null
  info: {
    from: number
    limit: number
    status: string
    sortBy: string
    sortOrder: string
  } | null
  refetch: () => Promise<void>
  createTicket: (ticketData: CreateTicketRequest) => Promise<boolean>
  creating: boolean
}

/**
 * Hook for fetching and managing Zoho Desk tickets
 */
export function useZohoTickets(params: UseZohoTicketsParams = {}): UseZohoTicketsReturn {
  const [tickets, setTickets] = useState<ZohoTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<UseZohoTicketsReturn['info']>(null)

  const {
    from = 0,
    limit = 100,
    status = 'all',
    sortBy = 'modifiedTime',
    // sortOrder not supported by Zoho API
    autoFetch = true
  } = params

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await zohoDeskService.getTickets({
        from,
        limit,
        status: status === 'all' ? undefined : status,
        sortBy,
      })

      if (response.success && response.tickets) {
        setTickets(response.tickets)
        setInfo(response.info || null)
      } else {
        setError(response.error || 'Failed to fetch tickets')
        setTickets([])
        setInfo(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setTickets([])
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [from, limit, status, sortBy])

  const createTicket = useCallback(async (ticketData: CreateTicketRequest): Promise<boolean> => {
    setCreating(true)
    setError(null)

    try {
      const response = await zohoDeskService.createTicket(ticketData)

      if (response.success) {
        // Refresh tickets after creation
        await fetchTickets()
        return true
      } else {
        setError(response.error || 'Failed to create ticket')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
      return false
    } finally {
      setCreating(false)
    }
  }, [fetchTickets])

  useEffect(() => {
    if (autoFetch) {
      fetchTickets()
    }
  }, [fetchTickets, autoFetch])

  return {
    tickets,
    loading,
    error,
    info,
    refetch: fetchTickets,
    createTicket,
    creating
  }
}

interface UseZohoStatsParams {
  startDate?: string
  endDate?: string
  timeframe?: 'thisWeek' | 'thisMonth' | 'thisYear'
  autoFetch?: boolean
}

interface UseZohoStatsReturn {
  stats: ZohoStats | null
  loading: boolean
  error: string | null
  meta: {
    dateRange: { from: string; to: string }
    timeframe: string
    totalTicketsAnalyzed: number
  } | null
  refetch: () => Promise<void>
}

/**
 * Hook for fetching Zoho Desk statistics
 */
export function useZohoStats(params: UseZohoStatsParams = {}): UseZohoStatsReturn {
  const [stats, setStats] = useState<ZohoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<UseZohoStatsReturn['meta']>(null)

  const {
    startDate,
    endDate,
    timeframe = 'thisMonth',
    autoFetch = true
  } = params

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await zohoDeskService.getStats({
        startDate,
        endDate,
        timeframe
      })

      if (response.success && response.stats) {
        setStats(response.stats)
        setMeta(response.meta || null)
      } else {
        setError(response.error || 'Failed to fetch statistics')
        setStats(null)
        setMeta(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStats(null)
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, timeframe])

  useEffect(() => {
    if (autoFetch) {
      fetchStats()
    }
  }, [fetchStats, autoFetch])

  return {
    stats,
    loading,
    error,
    meta,
    refetch: fetchStats
  }
}

/**
 * Hook for testing Zoho authentication
 */
export function useZohoAuth() {
  const [testing, setTesting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testAuth = useCallback(async () => {
    setTesting(true)
    setError(null)

    try {
      const response = await zohoDeskService.testAuth()

      if (response.success) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        setError(response.error || 'Authentication failed')
      }
    } catch (err) {
      setIsAuthenticated(false)
      setError(err instanceof Error ? err.message : 'Authentication test failed')
    } finally {
      setTesting(false)
    }
  }, [])

  return {
    testing,
    isAuthenticated,
    error,
    testAuth
  }
}

/**
 * Hook for getting tickets by specific status
 */
export function useZohoTicketsByStatus(status: string, limit?: number) {
  return useZohoTickets({
    status,
    limit,
    sortBy: 'modifiedTime',
  })
}

/**
 * Hook for getting recent tickets
 */
export function useZohoRecentTickets(limit: number = 50) {
  return useZohoTickets({
    limit,
    sortBy: 'createdTime',
  })
}

/**
 * Hook for getting overdue tickets
 */
export function useZohoOverdueTickets() {
  const [overdueTickets, setOverdueTickets] = useState<ZohoTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOverdueTickets = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await zohoDeskService.getOverdueTickets()

      if (response.success && response.tickets) {
        setOverdueTickets(response.tickets)
      } else {
        setError(response.error || 'Failed to fetch overdue tickets')
        setOverdueTickets([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setOverdueTickets([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverdueTickets()
  }, [fetchOverdueTickets])

  return {
    overdueTickets,
    loading,
    error,
    refetch: fetchOverdueTickets
  }
}
