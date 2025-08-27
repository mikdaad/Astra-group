'use client'

import { useState } from 'react'
import { Headphones, CheckCircle, Clock, Phone, MessageCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import SupportStatCard from '../../components/admin/SupportStatCard'
import DataTable from '../../components/admin/DataTable'
import SkeletonCard from '../../components/admin/SkeletonCard'
import { useZohoStats, useZohoTickets } from '@/hooks/useZohoDesk'
import { TICKET_STATUS_MAP, CHANNEL_MAP, type ZohoTicket } from '@/lib/types/zoho'
import { Button } from '@/components/ui/button'
import TicketActions from '../../components/admin/TicketActions'
import TicketEditModal from '../../components/admin/TicketEditModal'
import { zohoTicketService } from '@/lib/services/zoho-tickets'
import type { ReactNode } from 'react'


export default function SupportPage() {
  // State for ticket management
  const [selectedTicket, setSelectedTicket] = useState<ZohoTicket | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch Zoho Desk statistics
  const { 
    stats, 
    loading: statsLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = useZohoStats({ timeframe: 'thisMonth' })

  // Fetch recent tickets for the table
  const { 
    tickets, 
    loading: ticketsLoading, 
    error: ticketsError, 
    refetch: refetchTickets 
  } = useZohoTickets({ limit: 50, sortBy: 'modifiedTime' })

  const isLoading = statsLoading || ticketsLoading
  const hasError = statsError || ticketsError

  // Handle refresh
  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchTickets()])
  }

  // Ticket action handlers
  const handleEditTicket = (ticket: ZohoTicket) => {
    setSelectedTicket(ticket)
    setEditModalOpen(true)
  }

  const handleSaveTicket = async (ticketId: string, updates: Record<string, unknown>) => {
    const result = await zohoTicketService.updateTicket(ticketId, updates)
    if (result.success) {
      await refetchTickets() // Refresh the ticket list
    } else {
      throw new Error(result.error || 'Failed to update ticket')
    }
  }

  const handleStatusChange = async (ticketId: string, status: string) => {
    setActionLoading(ticketId)
    try {
      const result = await zohoTicketService.updateTicketStatus(ticketId, status)
      if (result.success) {
        await refetchTickets() // Refresh the ticket list
      } else {
        alert(result.error || 'Failed to update ticket status')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handlePriorityChange = async (ticketId: string, priority: string) => {
    setActionLoading(ticketId)
    try {
      const result = await zohoTicketService.updateTicketPriority(ticketId, priority)
      if (result.success) {
        await refetchTickets() // Refresh the ticket list
      } else {
        alert(result.error || 'Failed to update ticket priority')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    setActionLoading(ticketId)
    try {
      const result = await zohoTicketService.deleteTicket(ticketId)
      if (result.success) {
        await refetchTickets() // Refresh the ticket list
      } else {
        alert(result.error || 'Failed to delete ticket')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewTicket = (ticket: ZohoTicket) => {
    // For now, just open edit modal in view mode
    // In the future, could open a dedicated view modal
    handleEditTicket(ticket)
  }
  // Generate stats from Zoho data
  const supportStats = stats ? [
    {
      title: 'Total Tickets',
      value: stats.totalTickets.toLocaleString(),
      subtitle: 'This Month',
      change: { value: '10.55%', type: 'increase' as const, period: 'vs last month' },
      icon: Headphones
    },
    {
      title: 'Resolved Tickets',
      value: stats.resolvedTickets.toLocaleString(),
      subtitle: 'This Month',
      change: { value: '5.75%', type: 'increase' as const, period: 'vs last month' },
      icon: CheckCircle
    },
    {
      title: 'Pending Tickets',
      value: stats.pendingTickets.toLocaleString(),
      subtitle: 'Currently Open',
      change: { 
        value: '3.25%', 
        type: stats.pendingTickets > stats.resolvedTickets ? 'increase' as const : 'decrease' as const, 
        period: 'vs last month' 
      },
      icon: Clock
    },
    {
      title: 'Overdue Tickets',
      value: stats.overdueTickets.toLocaleString(),
      subtitle: 'Need Attention',
      change: { 
        value: '2.15%', 
        type: stats.overdueTickets > 0 ? 'increase' as const : 'decrease' as const, 
        period: 'vs last month' 
      },
      icon: AlertTriangle
    }
  ] : []

  // Generate channel stats from Zoho data
  const channelStats = stats ? [
    {
      title: 'WhatsApp Requests',
      value: (stats.ticketsByChannel['WhatsApp'] || 0).toLocaleString(),
      subtitle: 'This Month',
      change: { value: '10.55%', type: 'increase' as const, period: 'vs last month' },
      icon: MessageCircle
    },
    {
      title: 'Phone Requests',
      value: (stats.ticketsByChannel['Phone'] || 0).toLocaleString(),
      subtitle: 'This Month',
      change: { value: '8.25%', type: 'increase' as const, period: 'vs last month' },
      icon: Phone
    },
    {
      title: 'Live Chat',
      value: (stats.ticketsByChannel['Chat'] || 0).toLocaleString(),
      subtitle: 'This Month',
      change: { value: '5.75%', type: 'decrease' as const, period: 'vs last month' },
      icon: MessageCircle
    }
  ] : []

  // Transform Zoho tickets for DataTable
  const supportData = tickets.map((ticket: ZohoTicket) => {
    const createdDate = new Date(ticket.createdTime)
    const modifiedDate = new Date(ticket.modifiedTime)
    const timeDiff = modifiedDate.getTime() - createdDate.getTime()
    
    // Calculate time taken
    let timeTaken = 'Ongoing'
    if (ticket.status === 'Closed' && ticket.closedTime) {
      const closedDate = new Date(ticket.closedTime)
      const resolutionTime = closedDate.getTime() - createdDate.getTime()
      const hours = Math.floor(resolutionTime / (1000 * 60 * 60))
      const days = Math.floor(hours / 24)
      
      if (days > 0) {
        timeTaken = `${days} Day${days > 1 ? 's' : ''}`
      } else if (hours > 0) {
        timeTaken = `${hours} Hr${hours > 1 ? 's' : ''}`
      } else {
        timeTaken = '< 1 Hr'
      }
    } else if (ticket.status !== 'Closed') {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      const days = Math.floor(hours / 24)
      
      if (days > 0) {
        timeTaken = `${days} Day${days > 1 ? 's' : ''} (Open)`
      } else if (hours > 0) {
        timeTaken = `${hours} Hr${hours > 1 ? 's' : ''} (Open)`
      }
    }

    return {
      name: ticket.contact?.firstName && ticket.contact?.lastName 
        ? `${ticket.contact.firstName} ${ticket.contact.lastName}`
        : ticket.contact?.email?.split('@')[0] || 'Unknown',
      ticketNumber: ticket.ticketNumber,
      email: ticket.contact?.email || 'N/A',
      phone: ticket.contact?.phone || ticket.contact?.mobile || 'N/A',
      subject: ticket.subject,
      category: ticket.category || 'General',
      date: createdDate.toLocaleDateString(),
      status: TICKET_STATUS_MAP[ticket.status as keyof typeof TICKET_STATUS_MAP]?.label || ticket.status,
      priority: ticket.priority,
      timeTaken,
      assignedTo: ticket.assignee?.firstName && ticket.assignee?.lastName
        ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
        : ticket.assignee?.email || 'Unassigned',
      channel: CHANNEL_MAP[ticket.channel as keyof typeof CHANNEL_MAP]?.label || ticket.channel || 'Email'
    }
  })

  const columns: Array<{
    key: string
    label: string
    sortable: boolean
    render?: (value: unknown, row: Record<string, unknown>) => ReactNode
  }> =[
    { key: 'ticketNumber', label: 'Ticket #', sortable: true },
    { key: 'name', label: 'Customer', sortable: true },
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'channel', label: 'Channel', sortable: true },
    { key: 'date', label: 'Created', sortable: true },
    { key: 'timeTaken', label: 'Time Taken', sortable: true },
    { key: 'assignedTo', label: 'Assigned To', sortable: true },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const originalTicket = tickets.find(t => t.ticketNumber === row.ticketNumber)
        if (!originalTicket) return null
        
        return (
          <TicketActions
            ticket={originalTicket}
            onEdit={handleEditTicket}
            onDelete={handleDeleteTicket}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onView={handleViewTicket}
          />
        )
      }
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-white/20 rounded w-64 animate-pulse" />
            <div className="h-5 bg-white/15 rounded w-96 animate-pulse" />
          </div>
        </div>

        {/* Main Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <SupportStatCard key={index} title="" value="" loading={true} icon={Headphones} />
          ))}
        </div>

        {/* Channel Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <SupportStatCard key={index} title="" value="" loading={true} icon={MessageCircle} />
          ))}
        </div>

        {/* Table Skeleton */}
        <SkeletonCard variant="table" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Support Request Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and monitor support tickets from Zoho Desk integration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasError && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Connection Error</span>
            </div>
          )}
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">
                Zoho Desk Connection Error
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {statsError || ticketsError || 'Unable to connect to Zoho Desk. Please check your configuration.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {supportStats.map((stat, index) => (
          <SupportStatCard key={index} {...stat} loading={false} />
        ))}
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {channelStats.map((stat, index) => (
          <SupportStatCard key={index} {...stat} loading={false} />
        ))}
      </div>

      {/* Support Details Table */}
      <DataTable
        title="Support Tickets (Zoho Desk)"
        columns={columns}
        data={supportData}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={10}
      />

      {/* Ticket Edit Modal */}
      <TicketEditModal
        ticket={selectedTicket}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedTicket(null)
        }}
        onSave={handleSaveTicket}
      />
    </div>
  )
}