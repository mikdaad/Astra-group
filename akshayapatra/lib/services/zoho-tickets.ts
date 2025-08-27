/**
 * Zoho Desk Ticket Management Service
 * Enhanced service for ticket CRUD operations
 */

import { ZohoTicket } from '@/lib/types/zoho'

interface TicketUpdateData {
  subject?: string
  description?: string
  status?: string
  priority?: string
  assigneeId?: string
  departmentId?: string
  category?: string
  subCategory?: string
  dueDate?: string
  tags?: string[]
  customFields?: Record<string, any>
}

class ZohoTicketService {
  private baseUrl = '/api/admin/zoho/tickets'

  /**
   * Get single ticket details
   */
  async getTicket(ticketId: string): Promise<{ success: boolean; ticket?: ZohoTicket; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${ticketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching ticket:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ticket'
      }
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(
    ticketId: string, 
    updates: TicketUpdateData
  ): Promise<{ success: boolean; ticket?: ZohoTicket; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating ticket:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update ticket'
      }
    }
  }

  /**
   * Delete ticket
   */
  async deleteTicket(ticketId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error deleting ticket:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete ticket'
      }
    }
  }

  /**
   * Update ticket status only
   */
  async updateTicketStatus(
    ticketId: string, 
    status: string
  ): Promise<{ success: boolean; ticket?: ZohoTicket; error?: string }> {
    return this.updateTicket(ticketId, { status })
  }

  /**
   * Update ticket priority only
   */
  async updateTicketPriority(
    ticketId: string, 
    priority: string
  ): Promise<{ success: boolean; ticket?: ZohoTicket; error?: string }> {
    return this.updateTicket(ticketId, { priority })
  }

  /**
   * Assign ticket to agent
   */
  async assignTicket(
    ticketId: string, 
    assigneeId: string
  ): Promise<{ success: boolean; ticket?: ZohoTicket; error?: string }> {
    return this.updateTicket(ticketId, { assigneeId })
  }

  /**
   * Set ticket due date
   */
  async setDueDate(
    ticketId: string, 
    dueDate: string
  ): Promise<{ success: boolean; ticket?: ZohoTicket; error?: string }> {
    return this.updateTicket(ticketId, { dueDate })
  }

  /**
   * Add tags to ticket
   */
  async updateTicketTags(
    ticketId: string, 
    tags: string[]
  ): Promise<{ success: boolean; ticket?: ZohoTicket; error?: string }> {
    return this.updateTicket(ticketId, { tags })
  }

  /**
   * Bulk status update for multiple tickets
   */
  async bulkUpdateStatus(
    ticketIds: string[], 
    status: string
  ): Promise<{ success: boolean; results?: any[]; error?: string }> {
    try {
      const promises = ticketIds.map(id => this.updateTicketStatus(id, status))
      const results = await Promise.all(promises)
      
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      return {
        success: failed === 0,
        results,
        error: failed > 0 ? `${failed} out of ${ticketIds.length} updates failed` : undefined
      }
    } catch (error) {
      console.error('Error in bulk update:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk update failed'
      }
    }
  }
}

// Export singleton instance
export const zohoTicketService = new ZohoTicketService()
export default zohoTicketService
