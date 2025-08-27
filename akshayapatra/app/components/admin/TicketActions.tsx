'use client'

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Eye, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { TICKET_STATUS_MAP, PRIORITY_MAP, type ZohoTicket } from '@/lib/types/zoho'

interface TicketActionsProps {
  ticket: ZohoTicket
  onEdit?: (ticket: ZohoTicket) => void
  onDelete?: (ticketId: string) => void
  onStatusChange?: (ticketId: string, status: string) => void
  onPriorityChange?: (ticketId: string, priority: string) => void
  onView?: (ticket: ZohoTicket) => void
  className?: string
}

// Allowed color unions (match your map typings)
type StatusColor = 'green' | 'blue' | 'yellow' | 'orange' | 'gray' | 'purple'
type PriorityColor = 'red' | 'orange' | 'blue' | 'gray'

// Explicit class maps (avoid dynamic bg-${color}-500 which Tailwind can purge)
const STATUS_BADGE_CLASSES: Record<StatusColor, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
}

const STATUS_DOT_CLASSES: Record<StatusColor, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-500',
  purple: 'bg-purple-500',
}

const PRIORITY_BADGE_CLASSES: Record<PriorityColor, string> = {
  red: 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400',
  orange: 'border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400',
  blue: 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400',
  gray: 'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400',
}

const PRIORITY_DOT_CLASSES: Record<PriorityColor, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-500',
}

export default function TicketActions({
  ticket,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onView,
  className,
}: TicketActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatusChange = async (status: string) => {
    if (!onStatusChange) return
    setLoading('status')
    try {
      await onStatusChange(ticket.id, status)
    } finally {
      setLoading(null)
    }
  }

  const handlePriorityChange = async (priority: string) => {
    if (!onPriorityChange) return
    setLoading('priority')
    try {
      await onPriorityChange(ticket.id, priority)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = () => {
    if (!onDelete) return
    const confirmed = window.confirm(
      `Are you sure you want to delete ticket #${ticket.ticketNumber}? This action cannot be undone.`
    )
    if (confirmed) onDelete(ticket.id)
  }

  const statusConfig = TICKET_STATUS_MAP[ticket.status as keyof typeof TICKET_STATUS_MAP]
  const priorityConfig = PRIORITY_MAP[ticket.priority as keyof typeof PRIORITY_MAP]

  const statusBadgeClass =
    statusConfig && STATUS_BADGE_CLASSES[(statusConfig.color as StatusColor) ?? 'gray']
  const priorityBadgeClass =
    priorityConfig && PRIORITY_BADGE_CLASSES[(priorityConfig.color as PriorityColor) ?? 'gray']

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      {/* Status Badge */}
      <Badge
        variant={statusConfig?.severity === 'success' ? 'default' : 'secondary'}
        className={statusBadgeClass}
      >
        {statusConfig?.label || ticket.status}
      </Badge>

      {/* Priority Badge */}
      <Badge variant="outline" className={priorityBadgeClass}>
        {priorityConfig?.label || ticket.priority}
      </Badge>

      {/* Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Ticket Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* View Action */}
          {onView && (
            <DropdownMenuItem onClick={() => onView(ticket)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}

          {/* Edit Action */}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(ticket)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Ticket
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Status Change Submenu */}
          {onStatusChange && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={loading === 'status'}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Change Status
                {loading === 'status' && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600"></div>
                  </div>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {Object.entries(TICKET_STATUS_MAP).map(([status, config]) => {
                  const dotClass = STATUS_DOT_CLASSES[(config.color as StatusColor) ?? 'gray']
                  return (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={status === ticket.status}
                    >
                      <div className={`mr-2 h-2 w-2 rounded-full ${dotClass}`}></div>
                      {config.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* Priority Change Submenu */}
          {onPriorityChange && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={loading === 'priority'}>
                <Clock className="mr-2 h-4 w-4" />
                Change Priority
                {loading === 'priority' && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600"></div>
                  </div>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {Object.entries(PRIORITY_MAP).map(([priority, config]) => {
                  const dotClass = PRIORITY_DOT_CLASSES[(config.color as PriorityColor) ?? 'gray']
                  return (
                    <DropdownMenuItem
                      key={priority}
                      onClick={() => handlePriorityChange(priority)}
                      disabled={priority === ticket.priority}
                    >
                      <div className={`mr-2 h-2 w-2 rounded-full ${dotClass}`}></div>
                      {config.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* Delete Action */}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Ticket
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
