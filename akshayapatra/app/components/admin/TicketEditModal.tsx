'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TICKET_STATUS_MAP, PRIORITY_MAP, CHANNEL_MAP, type ZohoTicket } from '@/lib/types/zoho'
import { motion, AnimatePresence } from 'framer-motion'

interface TicketEditModalProps {
  ticket: ZohoTicket | null
  open: boolean
  onClose: () => void
  onSave: (ticketId: string, updates: any) => Promise<void>
}

export default function TicketEditModal({
  ticket,
  open,
  onClose,
  onSave
}: TicketEditModalProps) {
  const [loading, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    status: '',
    priority: '',
    category: '',
    subCategory: '',
    assigneeId: '',
    departmentId: '',
    dueDate: '',
    tags: [] as string[]
  })

  // Reset form when ticket changes
  useEffect(() => {
    if (ticket) {
      setFormData({
        subject: ticket.subject || '',
        description: ticket.description || '',
        status: ticket.status || '',
        priority: ticket.priority || '',
        category: ticket.category || '',
        subCategory: ticket.subCategory || '',
        assigneeId: ticket.assignee?.id || '',
        departmentId: ticket.department?.id || '',
        dueDate: ticket.dueDate ? ticket.dueDate.split('T')[0] : '',
        tags: ticket.tags || []
      })
    }
  }, [ticket])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticket) return

    setSaving(true)
    try {
      await onSave(ticket.id, formData)
      onClose()
    } catch (error) {
      console.error('Error updating ticket:', error)
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to update ticket'
      alert(`Update failed: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!ticket) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                #{ticket.ticketNumber}
              </span>
            </div>
            Edit Ticket
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ticket Info Header */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Ticket Information
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {CHANNEL_MAP[ticket.channel as keyof typeof CHANNEL_MAP]?.icon} {' '}
                    {CHANNEL_MAP[ticket.channel as keyof typeof CHANNEL_MAP]?.label || ticket.channel}
                  </Badge>
                  <Badge variant="secondary">
                    Created: {new Date(ticket.createdTime).toLocaleDateString()}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Enter ticket subject"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter ticket description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status & Priority */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TICKET_STATUS_MAP).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${config.color}-500`}></div>
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_MAP).map(([priority, config]) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${config.color}-500`}></div>
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Category & Assignment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Category & Assignment</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Enter category"
                />
              </div>

              {/* Sub Category */}
              <div className="space-y-2">
                <Label htmlFor="subCategory">Sub Category</Label>
                <Input
                  id="subCategory"
                  value={formData.subCategory}
                  onChange={(e) => handleInputChange('subCategory', e.target.value)}
                  placeholder="Enter sub category"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {ticket.contact && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name</Label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {ticket.contact.firstName} {ticket.contact.lastName}
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {ticket.contact.email}
                  </div>
                </div>
                {ticket.contact.phone && (
                  <div>
                    <Label>Phone</Label>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {ticket.contact.phone}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
