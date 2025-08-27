'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, AlertTriangle, CheckCircle, Clock, Ban } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Card as CardType } from '@/lib/types/cards'

interface UpdateStatusModalProps {
  card: CardType | null
  type: 'status' | 'payment' | 'kyc'
  open: boolean
  onClose: () => void
  onUpdate: (cardId: string, updates: any) => void
}

export default function UpdateStatusModal({
  card,
  type,
  open,
  onClose,
  onUpdate
}: UpdateStatusModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    paymentStatus: '',
    kycStatus: '',
    paymentMethod: '',
    amount: '',
    reason: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (card && open) {
      setFormData({
        status: card.status || 'active',
        paymentStatus: card.paymentStatus || 'pending',
        kycStatus: card.kycStatus || 'pending',
        paymentMethod: '',
        amount: '',
        reason: '',
        notes: ''
      })
      setErrors({})
    }
  }, [card, open, type])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (type === 'status' && !formData.status) {
      newErrors.status = 'Card status is required'
    }

    if (type === 'payment') {
      if (!formData.paymentStatus) {
        newErrors.paymentStatus = 'Payment status is required'
      }
      if (formData.paymentStatus === 'paid' && !formData.paymentMethod) {
        newErrors.paymentMethod = 'Payment method is required for paid status'
      }
      if (formData.paymentStatus === 'partial' && !formData.amount) {
        newErrors.amount = 'Amount is required for partial payment'
      }
    }

    if (type === 'kyc' && !formData.kycStatus) {
      newErrors.kycStatus = 'KYC status is required'
    }

    if ((type === 'status' && ['blocked', 'inactive'].includes(formData.status)) ||
        (type === 'kyc' && formData.kycStatus === 'rejected')) {
      if (!formData.reason.trim()) {
        newErrors.reason = 'Reason is required for this action'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !card) {
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updates: any = {
        updatedAt: new Date().toISOString()
      }

      switch (type) {
        case 'status':
          updates.status = formData.status
          break
        case 'payment':
          updates.paymentStatus = formData.paymentStatus
          if (formData.paymentMethod) {
            updates.lastPaymentMethod = formData.paymentMethod
          }
          if (formData.amount) {
            updates.lastPaymentAmount = parseFloat(formData.amount)
          }
          break
        case 'kyc':
          updates.kycStatus = formData.kycStatus
          break
      }

      if (formData.reason) {
        updates.lastStatusReason = formData.reason
      }
      
      if (formData.notes) {
        updates.notes = formData.notes
      }

      onUpdate(card.id, updates)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getModalTitle = () => {
    switch (type) {
      case 'status':
        return 'Update Card Status'
      case 'payment':
        return 'Update Payment Status'
      case 'kyc':
        return 'Update KYC Status'
      default:
        return 'Update Status'
    }
  }

  const getStatusIcon = (status: string, statusType: string) => {
    if (statusType === 'card') {
      switch (status) {
        case 'active':
          return <CheckCircle className="w-4 h-4 text-green-400" />
        case 'blocked':
          return <Ban className="w-4 h-4 text-red-400" />
        case 'pending':
          return <Clock className="w-4 h-4 text-yellow-400" />
        case 'inactive':
          return <AlertTriangle className="w-4 h-4 text-gray-400" />
        default:
          return null
      }
    }
    return null
  }

  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1a120c] border-orange-600/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              {type === 'status' && getStatusIcon(formData.status, 'card')}
              {type === 'payment' && <CheckCircle className="text-orange-600 dark:text-orange-400 w-4 h-4" />}
              {type === 'kyc' && <CheckCircle className="text-orange-600 dark:text-orange-400 w-4 h-4" />}
            </div>
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status Card */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Card Holder</p>
                  <p className="font-medium text-white">{card.cardholderName}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Member ID</p>
                  <p className="font-medium text-white">{card.id}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Card Status</p>
                  <Badge className="bg-blue-600 text-white capitalize">{card.status || 'active'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Payment Status</p>
                  <Badge className="bg-green-600 text-white capitalize">{card.paymentStatus || 'pending' || 'paid' || 'partial' || 'overdue' || 'failed'  }</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update Form */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Update {type === 'status' ? 'Card' : type === 'payment' ? 'Payment' : 'KYC'} Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Selection */}
              {type === 'status' && (
                <div>
                  <Label htmlFor="status" className="text-sm font-medium">
                    New Card Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className={`bg-zinc-800 border-zinc-600 text-white ${
                      errors.status ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-400" />
                          Inactive
                        </div>
                      </SelectItem>
                      <SelectItem value="blocked">
                        <div className="flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-400" />
                          Blocked
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          Pending
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-red-400 text-xs mt-1">{errors.status}</p>
                  )}
                </div>
              )}

              {/* Payment Status Selection */}
              {type === 'payment' && (
                <>
                  <div>
                    <Label htmlFor="paymentStatus" className="text-sm font-medium">
                      New Payment Status *
                    </Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) => handleInputChange('paymentStatus', value)}
                    >
                      <SelectTrigger className={`bg-zinc-800 border-zinc-600 text-white ${
                        errors.paymentStatus ? 'border-red-500' : ''
                      }`}>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-600">
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentStatus && (
                      <p className="text-red-400 text-xs mt-1">{errors.paymentStatus}</p>
                    )}
                  </div>

                  {(formData.paymentStatus === 'paid' || formData.paymentStatus === 'partial') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentMethod" className="text-sm font-medium">
                          Payment Method {formData.paymentStatus === 'paid' ? '*' : ''}
                        </Label>
                        <Select
                          value={formData.paymentMethod}
                          onValueChange={(value) => handleInputChange('paymentMethod', value)}
                        >
                          <SelectTrigger className={`bg-zinc-800 border-zinc-600 text-white ${
                            errors.paymentMethod ? 'border-red-500' : ''
                          }`}>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-600">
                            <SelectItem value="card">Card Payment</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="netbanking">Net Banking</SelectItem>
                            <SelectItem value="wallet">Digital Wallet</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.paymentMethod && (
                          <p className="text-red-400 text-xs mt-1">{errors.paymentMethod}</p>
                        )}
                      </div>

                      {formData.paymentStatus === 'partial' && (
                        <div>
                          <Label htmlFor="amount" className="text-sm font-medium">
                            Amount Paid *
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => handleInputChange('amount', e.target.value)}
                            placeholder="Enter amount"
                            className={`bg-zinc-800 border-zinc-600 text-white ${
                              errors.amount ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.amount && (
                            <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* KYC Status Selection */}
              {type === 'kyc' && (
                <div>
                  <Label htmlFor="kycStatus" className="text-sm font-medium">
                    New KYC Status *
                  </Label>
                  <Select
                    value={formData.kycStatus}
                    onValueChange={(value) => handleInputChange('kycStatus', value)}
                  >
                    <SelectTrigger className={`bg-zinc-800 border-zinc-600 text-white ${
                      errors.kycStatus ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Select KYC status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      <SelectItem value="verified">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Verified
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          Rejected
                        </div>
                      </SelectItem>
                      <SelectItem value="incomplete">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                          Incomplete
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.kycStatus && (
                    <p className="text-red-400 text-xs mt-1">{errors.kycStatus}</p>
                  )}
                </div>
              )}

              {/* Reason (conditional) */}
              {((type === 'status' && ['blocked', 'inactive'].includes(formData.status)) ||
                (type === 'kyc' && formData.kycStatus === 'rejected')) && (
                <div>
                  <Label htmlFor="reason" className="text-sm font-medium">
                    Reason *
                  </Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    placeholder="Please provide a reason for this action"
                    rows={3}
                    className={`bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400 ${
                      errors.reason ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.reason && (
                    <p className="text-red-400 text-xs mt-1">{errors.reason}</p>
                  )}
                </div>
              )}

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes or comments"
                  rows={3}
                  className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400"
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 text-white hover:bg-orange-500"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
