'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  CreditCard, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText,
  Eye,
  Edit,
  Download,
  RefreshCw
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import type { 
  Card as CardType, 
  Transaction, 
  Invoice, 
  PaymentHistory 
} from '@/lib/types/cards'

interface CardDetailsModalProps {
  card: CardType | null
  open: boolean
  onClose: () => void
  onUpdateStatus: (cardId: string, updates: any) => void
}

// Mock data for transactions, invoices, and payment history
const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    cardId: "1",
    amount: 2500,
    type: "debit",
    description: "Online Purchase - Amazon",
    merchant: "Amazon India",
    category: "Shopping",
    status: "completed",
    paymentMethod: "card",
    transactionDate: "2024-12-10T14:30:00Z",
    referenceNumber: "TXN123456789",
    balanceAfter: 22500,
    location: "Online",
    createdAt: "2024-12-10T14:30:00Z"
  },
  {
    id: "txn_002",
    cardId: "1",
    amount: 5000,
    type: "credit",
    description: "Salary Credit",
    category: "Income",
    status: "completed",
    paymentMethod: "netbanking",
    transactionDate: "2024-12-08T10:00:00Z",
    referenceNumber: "SAL789456123",
    balanceAfter: 25000,
    createdAt: "2024-12-08T10:00:00Z"
  },
  {
    id: "txn_003",
    cardId: "1",
    amount: 150,
    type: "fee",
    description: "Annual Maintenance Fee",
    category: "Fees",
    status: "completed",
    paymentMethod: "card",
    transactionDate: "2024-12-05T09:15:00Z",
    referenceNumber: "FEE456789123",
    balanceAfter: 20000,
    createdAt: "2024-12-05T09:15:00Z"
  }
];

const mockInvoices: Invoice[] = [
  {
    id: "inv_001",
    cardId: "1",
    userId: "user_001",
    invoiceNumber: "INV-2024-001",
    amount: 1200,
    dueAmount: 0,
    paidAmount: 1200,
    status: "paid",
    dueDate: "2024-12-15",
    issueDate: "2024-11-15",
    paidDate: "2024-12-10",
    paymentMethod: "upi",
    description: "Monthly Service Charges",
    items: [
      {
        id: "item_1",
        description: "Card Maintenance",
        quantity: 1,
        unitPrice: 500,
        totalPrice: 500,
        category: "Service"
      },
      {
        id: "item_2",
        description: "Transaction Fees",
        quantity: 1,
        unitPrice: 700,
        totalPrice: 700,
        category: "Fee"
      }
    ],
    taxes: [
      {
        id: "tax_1",
        name: "GST (18%)",
        rate: 18,
        amount: 216
      }
    ],
    discounts: [],
    createdAt: "2024-11-15T10:00:00Z"
  },
  {
    id: "inv_002",
    cardId: "1",
    userId: "user_001",
    invoiceNumber: "INV-2024-002",
    amount: 800,
    dueAmount: 800,
    paidAmount: 0,
    status: "overdue",
    dueDate: "2024-12-01",
    issueDate: "2024-11-01",
    description: "Premium Service Package",
    items: [
      {
        id: "item_3",
        description: "Premium Features",
        quantity: 1,
        unitPrice: 800,
        totalPrice: 800,
        category: "Service"
      }
    ],
    taxes: [],
    discounts: [],
    createdAt: "2024-11-01T10:00:00Z"
  }
];

const mockPaymentHistory: PaymentHistory[] = [
  {
    id: "pay_001",
    cardId: "1",
    invoiceId: "inv_001",
    amount: 1200,
    paymentMethod: "upi",
    status: "success",
    transactionId: "UPI789456123",
    paidDate: "2024-12-10T15:30:00Z",
    createdAt: "2024-12-10T15:30:00Z"
  },
  {
    id: "pay_002",
    cardId: "1",
    amount: 500,
    paymentMethod: "card",
    status: "failed",
    transactionId: "CARD123789456",
    failureReason: "Insufficient balance",
    paidDate: "2024-12-05T12:00:00Z",
    createdAt: "2024-12-05T12:00:00Z"
  }
];

export default function CardDetailsModal({
  card,
  open,
  onClose,
  onUpdateStatus
}: CardDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])

  useEffect(() => {
    if (open && card) {
      setIsLoading(true)
      // Simulate API loading
      setTimeout(() => {
        setTransactions(mockTransactions)
        setInvoices(mockInvoices)
        setPaymentHistory(mockPaymentHistory)
        setIsLoading(false)
      }, 500)
    }
  }, [open, card])

  if (!card) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string, type: 'card' | 'payment' | 'transaction' | 'invoice') => {
    let config = { color: '', text: status }
    
    switch (type) {
      case 'card':
        config = {
          active: { color: "bg-green-600", text: "Active" },
          inactive: { color: "bg-gray-600", text: "Inactive" },
          blocked: { color: "bg-red-600", text: "Blocked" },
          pending: { color: "bg-yellow-600", text: "Pending" },
          expired: { color: "bg-orange-600", text: "Expired" }
        }[status] || config
        break
      case 'payment':
        config = {
          paid: { color: "bg-green-600", text: "Paid" },
          pending: { color: "bg-yellow-600", text: "Pending" },
          overdue: { color: "bg-red-600", text: "Overdue" },
          failed: { color: "bg-red-600", text: "Failed" },
          partial: { color: "bg-orange-600", text: "Partial" }
        }[status] || config
        break
      case 'transaction':
        config = {
          completed: { color: "bg-green-600", text: "Completed" },
          pending: { color: "bg-yellow-600", text: "Pending" },
          failed: { color: "bg-red-600", text: "Failed" },
          cancelled: { color: "bg-gray-600", text: "Cancelled" }
        }[status] || config
        break
      case 'invoice':
        config = {
          draft: { color: "bg-gray-600", text: "Draft" },
          sent: { color: "bg-blue-600", text: "Sent" },
          paid: { color: "bg-green-600", text: "Paid" },
          overdue: { color: "bg-red-600", text: "Overdue" },
          cancelled: { color: "bg-gray-600", text: "Cancelled" },
          partial: { color: "bg-orange-600", text: "Partial" }
        }[status] || config
        break
    }
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
      case 'topup':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'debit':
      case 'fee':
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Wallet className="w-4 h-4 text-blue-400" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#1a120c] border-orange-600/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <CreditCard className="text-orange-600 dark:text-orange-400 w-4 h-4" />
            </div>
            Card Details - {card.cardholderName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card Information Header */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Card Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-sm text-zinc-400">Card Number</p>
                          <p className="font-mono text-white">**** **** **** {card.id.slice(-4)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-sm text-zinc-400">Holder Name</p>
                          <p className="text-white">{card.cardholderName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-sm text-zinc-400">Member ID</p>
                          <p className="text-white">{card.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Payment Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Status Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Card Status</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(card.status || 'active', 'card')}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(card.id, { action: 'update_status' })}
                            className="border-orange-600 text-orange-400 hover:bg-orange-600/20"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Payment Status</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(card.paymentStatus || 'pending', 'payment')}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(card.id, { action: 'update_payment' })}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">KYC Status</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(card.kycStatus || 'pending', 'card')}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(card.id, { action: 'update_kyc' })}
                            className="border-green-600 text-green-400 hover:bg-green-600/20"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Financial Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-zinc-400">Current Balance</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(card.totalWalletBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Credit Limit</p>
                        <p className="text-lg font-semibold text-white">₹0.00</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Available Credit</p>
                        <p className="text-lg font-semibold text-blue-400">
                          ₹0.00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <Separator className="my-6 bg-zinc-700" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm text-zinc-400">Email</p>
                    <p className="text-white">{card.userProfile?.fullName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm text-zinc-400">Phone</p>
                    <p className="text-white">{card.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm text-zinc-400">Assigned To</p>
                    <p className="text-white">Unassigned</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm text-zinc-400">Expiry Date</p>
                    <p className="text-white">N/A</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
              <TabsTrigger value="transactions" className="data-[state=active]:bg-orange-600">
                Transactions
              </TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-orange-600">
                Invoices
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-orange-600">
                Payment History
              </TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-zinc-600 text-zinc-300">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-600 text-zinc-300">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-4 h-16" />
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <Card key={transaction.id} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium text-white">{transaction.description}</p>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span>{formatDate(transaction.transactionDate)}</span>
                                <span>•</span>
                                <span className="capitalize">{transaction.paymentMethod}</span>
                                <span>•</span>
                                <span>{transaction.referenceNumber}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'credit' || transaction.type === 'topup' 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              {transaction.type === 'credit' || transaction.type === 'topup' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(transaction.status, 'transaction')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    No transactions found
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Invoice History</h3>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-500">
                  Create Invoice
                </Button>
              </div>
              
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-6 h-32" />
                  ))
                ) : invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <Card key={invoice.id} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-orange-400" />
                              <div>
                                <p className="font-semibold text-white">{invoice.invoiceNumber}</p>
                                <p className="text-sm text-zinc-400">{invoice.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                              <span>Issue: {formatDate(invoice.issueDate)}</span>
                              <span>Due: {formatDate(invoice.dueDate)}</span>
                              {invoice.paidDate && (
                                <span>Paid: {formatDate(invoice.paidDate)}</span>
                              )}
                            </div>
                            <div className="text-sm">
                              <span className="text-zinc-400">Items: </span>
                              <span className="text-white">
                                {invoice.items.map(item => item.description).join(', ')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(invoice.amount)}
                            </p>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(invoice.status, 'invoice')}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-orange-600 text-orange-400 hover:bg-orange-600/20"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Update
                              </Button>
                            </div>
                            {invoice.dueAmount > 0 && (
                              <p className="text-sm text-red-400">
                                Due: {formatCurrency(invoice.dueAmount)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    No invoices found
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Payment History Tab */}
            <TabsContent value="payments" className="space-y-4">
              <h3 className="text-lg font-semibold">Payment History</h3>
              
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-4 h-20" />
                  ))
                ) : paymentHistory.length > 0 ? (
                  paymentHistory.map((payment) => (
                    <Card key={payment.id} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Wallet className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="font-medium text-white">
                                Payment via {payment.paymentMethod.toUpperCase()}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span>{formatDate(payment.paidDate)}</span>
                                <span>•</span>
                                <span>{payment.transactionId}</span>
                                {payment.invoiceId && (
                                  <>
                                    <span>•</span>
                                    <span>Invoice: {payment.invoiceId}</span>
                                  </>
                                )}
                              </div>
                              {payment.failureReason && (
                                <p className="text-sm text-red-400 mt-1">
                                  Reason: {payment.failureReason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(payment.amount)}
                            </p>
                            {getStatusBadge(payment.status, 'transaction')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    No payment history found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
