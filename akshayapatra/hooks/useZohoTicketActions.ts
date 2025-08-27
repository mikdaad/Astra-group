/**
 * React Hook for Zoho Ticket Management Actions
 * Provides convenient methods for common ticket operations
 */

'use client'

import { useState, useCallback } from 'react'
import { zohoTicketService } from '@/lib/services/zoho-tickets'
import { ZohoTicket } from '@/lib/types/zoho'

interface UseZohoTicketActionsReturn {
  updateTicket: (ticketId: string, updates: any) => Promise<boolean>
  updateStatus: (ticketId: string, status: string) => Promise<boolean>
  updatePriority: (ticketId: string, priority: string) => Promise<boolean>
  deleteTicket: (ticketId: string) => Promise<boolean>
  loading: boolean
  error: string | null
  clearError: () => void
}

export function useZohoTicketActions(): UseZohoTicketActionsReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const updateTicket = useCallback(async (ticketId: string, updates: any): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await zohoTicketService.updateTicket(ticketId, updates)
      
      if (result.success) {
        return true
      } else {
        setError(result.error || 'Failed to update ticket')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStatus = useCallback(async (ticketId: string, status: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await zohoTicketService.updateTicketStatus(ticketId, status)
      
      if (result.success) {
        return true
      } else {
        setError(result.error || 'Failed to update ticket status')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePriority = useCallback(async (ticketId: string, priority: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await zohoTicketService.updateTicketPriority(ticketId, priority)
      
      if (result.success) {
        return true
      } else {
        setError(result.error || 'Failed to update ticket priority')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTicket = useCallback(async (ticketId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await zohoTicketService.deleteTicket(ticketId)
      
      if (result.success) {
        return true
      } else {
        setError(result.error || 'Failed to delete ticket')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    updateTicket,
    updateStatus,
    updatePriority,
    deleteTicket,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for bulk ticket operations
 */
export function useZohoBulkActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bulkUpdateStatus = useCallback(async (ticketIds: string[], status: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await zohoTicketService.bulkUpdateStatus(ticketIds, status)
      
      if (result.success) {
        return true
      } else {
        setError(result.error || 'Some bulk updates failed')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk update failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    bulkUpdateStatus,
    loading,
    error,
    clearError: () => setError(null)
  }
}
