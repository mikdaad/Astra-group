/**
 * Zoho Desk API Types and Interfaces
 * These types match the Zoho Desk API response structure
 */

export interface ZohoContact {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  mobile?: string
  accountId?: string
}

export interface ZohoAssignee {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  photoURL?: string
}

export interface ZohoDepartment {
  id?: string
  name: string
  description?: string
}

export interface ZohoTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  createdTime: string
  modifiedTime: string
  dueDate?: string
  closedTime?: string
  contact?: ZohoContact
  assignee?: ZohoAssignee
  department?: ZohoDepartment
  category?: string
  subCategory?: string
  channel?: 'Email' | 'Phone' | 'Chat' | 'Web' | 'Facebook' | 'Twitter' | 'Forums' | 'WhatsApp'
  classification?: string
  source?: string
  tags?: string[]
  cf?: Record<string, any> // Custom fields
  threadCount?: number
  commentCount?: number
  attachmentCount?: number
  resolution?: string
  customerResponseTime?: string
  agentResponseTime?: string
}

export interface ZohoTicketsResponse {
  data: ZohoTicket[]
  info: {
    count: number
    moreRecords: boolean
    perPage: number
    page: number
  }
}

export interface ZohoStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  pendingTickets: number
  overdueTickets: number
  ticketsByStatus: Record<string, number>
  ticketsByPriority: Record<string, number>
  ticketsByChannel: Record<string, number>
  avgResolutionTime: number // in hours
  avgResponseTime: number // in hours
}

export interface ZohoApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: string
}

export interface ZohoTicketsApiResponse extends ZohoApiResponse {
  tickets?: ZohoTicket[]
  info?: {
    from: number
    limit: number
    status: string
    sortBy: string
    sortOrder: string
  }
}

export interface ZohoStatsApiResponse extends ZohoApiResponse {
  stats?: ZohoStats
  meta?: {
    dateRange: {
      from: string
      to: string
    }
    timeframe: string
    totalTicketsAnalyzed: number
  }
}

// For creating new tickets
export interface CreateTicketRequest {
  subject: string
  description: string
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
  status?: string
  departmentId?: string
  category?: string
  subCategory?: string
  channel?: string
  contact?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  assigneeId?: string
  dueDate?: string
  tags?: string[]
  cf?: Record<string, any>
}

// Status mapping for better UX
export const TICKET_STATUS_MAP = {
  'Open': { label: 'Open', color: 'blue', severity: 'info' },
  'In Progress': { label: 'In Progress', color: 'yellow', severity: 'warning' },
  'Waiting for Customer': { label: 'Waiting for Customer', color: 'orange', severity: 'warning' },
  'Waiting for Third Party': { label: 'Waiting for Third Party', color: 'purple', severity: 'info' },
  'Closed': { label: 'Resolved', color: 'green', severity: 'success' },
  'On Hold': { label: 'On Hold', color: 'gray', severity: 'secondary' }
} as const

export const PRIORITY_MAP = {
  'Low': { label: 'Low', color: 'gray', severity: 'secondary' },
  'Medium': { label: 'Medium', color: 'blue', severity: 'info' },
  'High': { label: 'High', color: 'orange', severity: 'warning' },
  'Urgent': { label: 'Urgent', color: 'red', severity: 'error' }
} as const

export const CHANNEL_MAP = {
  'Email': { label: 'Email', icon: '📧' },
  'Phone': { label: 'Phone', icon: '📞' },
  'Chat': { label: 'Live Chat', icon: '💬' },
  'Web': { label: 'Web Form', icon: '🌐' },
  'Facebook': { label: 'Facebook', icon: '📘' },
  'Twitter': { label: 'Twitter', icon: '🐦' },
  'Forums': { label: 'Forums', icon: '💭' },
  'WhatsApp': { label: 'WhatsApp', icon: '📱' }
} as const

// Utility types
export type TicketStatus = keyof typeof TICKET_STATUS_MAP
export type TicketPriority = keyof typeof PRIORITY_MAP
export type TicketChannel = keyof typeof CHANNEL_MAP
