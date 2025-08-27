/**
 * Zoho Desk Service Functions
 * Client-side service for interacting with our Zoho proxy APIs
 */

import {
  ZohoTicketsApiResponse,
  ZohoStatsApiResponse,
  ZohoApiResponse,
  CreateTicketRequest,
  ZohoTicket
} from '@/lib/types/zoho'

class ZohoDeskService {
  private baseUrl = '/api/admin/zoho'

  /**
   * Fetch tickets from Zoho Desk
   */
  async getTickets(params: {
    from?: number
    limit?: number
    status?: string
    sortBy?: string
    // Note: sortOrder not supported by Zoho Desk API
  } = {}): Promise<ZohoTicketsApiResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.from !== undefined) searchParams.set('from', params.from.toString())
    if (params.limit !== undefined) searchParams.set('limit', params.limit.toString())
    if (params.status) searchParams.set('status', params.status)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    // sortOrder not supported by Zoho Desk API

    const url = `${this.baseUrl}/tickets?${searchParams.toString()}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: ZohoTicketsApiResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching tickets:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tickets'
      }
    }
  }

  /**
   * Get ticket statistics from Zoho Desk
   */
  async getStats(params: {
    startDate?: string
    endDate?: string
    timeframe?: 'thisWeek' | 'thisMonth' | 'thisYear'
  } = {}): Promise<ZohoStatsApiResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)
    if (params.timeframe) searchParams.set('timeframe', params.timeframe)

    const url = `${this.baseUrl}/stats?${searchParams.toString()}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: ZohoStatsApiResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching stats:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics'
      }
    }
  }

  /**
   * Create a new ticket in Zoho Desk
   */
  async createTicket(ticketData: CreateTicketRequest): Promise<ZohoApiResponse<ZohoTicket>> {
    try {
      const response = await fetch(`${this.baseUrl}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: ZohoApiResponse<ZohoTicket> = await response.json()
      return data
    } catch (error) {
      console.error('Error creating ticket:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create ticket'
      }
    }
  }

  /**
   * Test Zoho authentication
   */
  async testAuth(): Promise<ZohoApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: ZohoApiResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error testing auth:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication test failed'
      }
    }
  }

  /**
   * Get tickets by status with caching
   */
  async getTicketsByStatus(status: string, limit: number = 100): Promise<ZohoTicketsApiResponse> {
    return this.getTickets({
      status,
      limit,
      sortBy: 'modifiedTime'
    })
  }

  /**
   * Get recent tickets (last 30 days)
   */
  async getRecentTickets(limit: number = 50): Promise<ZohoTicketsApiResponse> {
    return this.getTickets({
      limit,
      sortBy: 'createdTime'
    })
  }

  /**
   * Get overdue tickets
   */
  async getOverdueTickets(): Promise<ZohoTicketsApiResponse> {
    // Get open tickets and filter on client side for overdue ones
    const response = await this.getTickets({
      status: 'Open',
      limit: 200,
      sortBy: 'dueDate'
    })

    if (response.success && response.tickets) {
      const now = new Date()
      const overdueTickets = response.tickets.filter(ticket => 
        ticket.dueDate && new Date(ticket.dueDate) < now
      )

      return {
        ...response,
        tickets: overdueTickets,
        info: {
          ...response.info!,
          from: 0,
          limit: overdueTickets.length,
          status: 'overdue'
        }
      }
    }

    return response
  }
}

// Export singleton instance
export const zohoDeskService = new ZohoDeskService()
export default zohoDeskService
