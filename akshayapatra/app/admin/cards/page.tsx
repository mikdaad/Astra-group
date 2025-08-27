"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Eye,
  CheckCircle,
  Wallet,
  TrendingUp,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "../../components/admin/StatCard";
import DataTable from "../../components/admin/DataTable";
import SkeletonCard from "../../components/admin/SkeletonCard";
import CardDetailsModal from "../../components/admin/CardDetailsModal";
import UpdateStatusModal from "../../components/admin/UpdateStatusModal";
import type { Card, CardStats } from "@/lib/types/cards";
import { SUBSCRIPTION_STATUSES, PAYMENT_METHODS, KYC_STATUSES } from "@/lib/types/cards";
import { toast } from 'sonner';

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [cardStats, setCardStats] = useState<CardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalType, setStatusModalType] = useState<'status' | 'payment' | 'kyc'>('status');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load cards data
      const cardsResponse = await fetch('/api/admin/cards', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!cardsResponse.ok) {
        throw new Error('Failed to load cards data');
      }

      const cardsData = await cardsResponse.json();
      setCards(cardsData.data || []);

      // Load stats from API endpoint
      try {
        const statsResponse = await fetch('/api/admin/cards/stats', {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setCardStats(statsData);
        } else {
          console.error('Stats endpoint returned error:', statsResponse.status);
          setError('Failed to load card statistics');
        }
      } catch (error) {
        console.error('Stats endpoint not available:', error);
        setError('Card statistics service unavailable');
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter cards based on search and filters
  const filteredCards = cards.filter(card => {
    const matchesSearch =
      card.cardholderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.phoneNumber.includes(searchTerm) ||
      card.schemeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.userProfile?.referralCode?.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || card.subscriptionStatus === statusFilter;
    const matchesPayment = paymentFilter === "all" || card.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Map cards to rows compatible with DataTable's TableRowData
  const tableRows: Array<{ [key: string]: string | number | boolean | null | undefined }> = filteredCards.map((c) => ({
    id: c.id,
    cardholderName: c.cardholderName,
    phoneNumber: c.phoneNumber,
    schemeName: c.schemeName || 'No Scheme',
    subscriptionStatus: c.subscriptionStatus,
    paymentMethod: c.paymentMethod,
    totalWalletBalance: c.totalWalletBalance,
    commissionWalletBalance: c.commissionWalletBalance,
    kycStatus: c.userProfile?.kycVerified || false,
    totalPaymentsMade: c.totalPaymentsMade,
  }))

  // Get status badge component
  const getStatusBadge = (status: Card['subscriptionStatus']) => {
    const config = SUBSCRIPTION_STATUSES[status] || { color: 'bg-gray-600', label: 'Unknown' };

    return (
      <Badge className={`bg-${config.color}-600 text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: Card['paymentMethod']) => {
    const config = PAYMENT_METHODS[method] || { color: 'bg-gray-600', label: 'Unknown' };

    return (
      <Badge className={`bg-${config.color}-600 text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getKycBadge = (verified: boolean) => {
    const config = KYC_STATUSES[verified.toString()] || { color: 'bg-gray-600', label: 'Unknown' };

    return (
      <Badge className={`bg-${config.color}-600 text-white`}>
        {config.label}
      </Badge>
    );
  };

  // Handle actions
  const handleViewCard = (card: Card) => {
    setSelectedCard(card);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = (card: Card, type: 'status' | 'payment' | 'kyc') => {
    setSelectedCard(card);
    setStatusModalType(type);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdate = async (cardId: string, updates: any) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update card status');
      }

      // Update local state
      setCards(cards.map(card =>
        card.id === cardId
          ? { ...card, ...updates, updatedAt: new Date().toISOString() }
          : card
      ));

      setSuccess('Card status updated successfully');
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error('Error updating card status:', error);
      setError('Failed to update card status');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // DataTable columns
  const columns: Array<{ key: string; label: string; sortable?: boolean; render?: (value: unknown, row: { [key: string]: string | number | boolean | null | undefined }) => React.ReactNode }> = [
    {
      key: 'cardholderName',
      label: 'Cardholder Name',
      sortable: true,
      render: (value: unknown, row: { [key: string]: string | number | boolean | null | undefined }) => (
        <div>
          <div className="font-medium text-white">{String(value)}</div>
          <div className="text-sm text-zinc-400">{String(row.phoneNumber)}</div>
        </div>
      )
    },
    {
      key: 'schemeName',
      label: 'Scheme',
      sortable: true,
      render: (value: unknown) => (
        <div className="text-white">{String(value)}</div>
      )
    },
    {
      key: 'subscriptionStatus',
      label: 'Status',
      sortable: true,
      render: (value: unknown) => getStatusBadge(value as Card['subscriptionStatus'])
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      sortable: true,
      render: (value: unknown) => getPaymentMethodBadge(value as Card['paymentMethod'])
    },
    {
      key: 'totalWalletBalance',
      label: 'Wallet Balance',
      sortable: true,
      render: (value: unknown, row: { [key: string]: string | number | boolean | null | undefined }) => (
        <div>
          <div className="font-medium text-white">{formatCurrency(Number(value))}</div>
          <div className="text-sm text-zinc-400">
            Commission: {formatCurrency(Number(row.commissionWalletBalance))}
          </div>
        </div>
      )
    },
    {
      key: 'kycStatus',
      label: 'KYC',
      sortable: true,
      render: (value: unknown) => getKycBadge(Boolean(value))
    },
    {
      key: 'totalPaymentsMade',
      label: 'Payments',
      sortable: true,
      render: (value: unknown) => (
        <div className="text-white">{String(value)}</div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: { [key: string]: string | number | boolean | null | undefined }) => {
        const cardId = String(row.id)
        const found = cards.find(c => c.id === cardId)
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => found && handleViewCard(found)}
              className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        )
      }
    }
  ];

  // Statistics data
  const statsData = cardStats ? [
    {
      title: 'Total Cards',
      value: cardStats.totalCards.toLocaleString(),
      subtitle: 'All Time',
      change: { value: '12.5%', type: 'increase' as const, period: 'vs last month' },
      icon: CreditCard
    },
    {
      title: 'Active Cards',
      value: cardStats.activeCards.toLocaleString(),
      subtitle: 'Currently Active',
      change: { value: '8.2%', type: 'increase' as const, period: 'vs last month' },
      icon: CheckCircle
    },
    {
      title: 'Total Balance',
      value: formatCurrency(cardStats.totalBalance),
      subtitle: 'Available Balance',
      change: { value: '15.3%', type: 'increase' as const, period: 'vs last month' },
      icon: Wallet
    },
    {
      title: 'Monthly Volume',
      value: formatCurrency(cardStats.monthlyTransactionVolume),
      subtitle: 'Transaction Volume',
      change: { value: '22.1%', type: 'increase' as const, period: 'vs last month' },
      icon: TrendingUp
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-10 bg-white/20 rounded w-80 animate-pulse" />
            <div className="h-5 bg-white/15 rounded w-96 animate-pulse" />
          </div>
          <div className="h-10 bg-white/15 rounded w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} variant="stat" />
          ))}
        </div>
        <SkeletonCard variant="chart" className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-sans">
            Card Management
          </h1>
          <p className="mt-1 text-sm text-zinc-300 font-sans">
            Track card status, payments, and manage customer accounts.
          </p>
        </div>

      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <p className="text-red-700 font-medium">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
            <p className="text-green-700 font-medium">{success}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by name, member ID, card number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-zinc-900 text-white">
            <SelectValue placeholder="Subscription Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[180px] bg-zinc-900 text-white">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="upi_mandate">UPI Mandate</SelectItem>
            <SelectItem value="card">Card Payment</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards Table */}
      <DataTable
        columns={columns}
        data={tableRows}
        title="Card Management"
        searchable={false}
        filterable={false}
        exportable={true}
        pagination={true}
        pageSize={10}
      />

      {/* Modals */}
      <CardDetailsModal
        card={selectedCard}
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onUpdateStatus={handleStatusUpdate}
      />

      <UpdateStatusModal
        card={selectedCard}
        type={statusModalType}
        open={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}
