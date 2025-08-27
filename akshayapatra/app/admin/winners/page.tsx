'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

import { toast } from 'sonner'
import {
  Trophy,
  Download,
  Search,
  Eye,
  Crown,
  Medal,
  Edit,
  X
} from 'lucide-react'
import GlowCard from '../../components/admin/GlowCard'
import { Scheme, Winner, EligibleCard } from '@/lib/types/schemes'

// Winners, schemes, and eligible cards data will be fetched from API

export default function WinnersPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [eligibleCards, setEligibleCards] = useState<EligibleCard[]>([])
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false)
  const [isEligibleModalOpen, setIsEligibleModalOpen] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null)


  const loadData = async () => {
    try {
      setIsLoading(true)
      // TODO: Load real data from API
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDownloadEligibleCSV = async (schemeId: string) => {
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/admin/winners/eligible-cards?schemeId=${schemeId}`)
      if (!response.ok) throw new Error('Failed to fetch eligible cards')

      const cards = await response.json()

      // Convert to CSV
      const headers = ['Card ID', 'User ID', 'Cardholder Name', 'Phone Number', 'Scheme Name', 'Payments Made', 'Status', 'Created Date']
      const csvContent = [
        headers.join(','),
        ...cards.map((card: EligibleCard) => [
          card.id,
          card.userId,
          card.cardholderName,
          card.phoneNumber,
          card.schemeName,
          card.totalPaymentsMade,
          card.subscriptionStatus,
          new Date(card.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `eligible_cards_scheme_${schemeId}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setSuccess('CSV downloaded successfully')
    } catch (error) {
      console.error('Error downloading CSV:', error)
      setError('Failed to download CSV')
    }
  }

  const handleSelectWinners = (scheme: Scheme) => {
    setSelectedScheme(scheme)
    setIsWinnerModalOpen(true)
  }

  const handleViewEligible = (scheme: Scheme) => {
    setSelectedScheme(scheme)
    setIsEligibleModalOpen(true)
  }

  const handleSaveWinners = async (cardIds: string[]) => {
    if (!selectedScheme) return

    setError(null)
    setSuccess(null)
    try {
      const response = await fetch('/api/admin/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: selectedScheme.id,
          cardIds
        })
      })

      if (!response.ok) throw new Error('Failed to save winners')

      setSuccess('Winners saved successfully')
      setIsWinnerModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving winners:', error)
      setError('Failed to save winners')
    }
  }

  const getStatusBadge = (status: Winner['status']) => {
    const config = {
      pending: { label: 'Pending', color: 'yellow' },
      claimed: { label: 'Claimed', color: 'green' },
      delivered: { label: 'Delivered', color: 'blue' },
      cancelled: { label: 'Cancelled', color: 'red' }
    }[status] || { label: 'Unknown', color: 'gray' }

    return (
      <Badge variant="outline" className={`border-${config.color}-600 text-${config.color}-400`}>
        {config.label}
      </Badge>
    )
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />
      case 2: return <Medal className="w-5 h-5 text-gray-400" />
      case 3: return <Trophy className="w-5 h-5 text-amber-600" />
      default: return <Trophy className="w-5 h-5 text-blue-400" />
    }
  }

  const filteredWinners = winners.filter(winner => {
    const matchesSearch = winner.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         winner.userPhone.includes(searchTerm) ||
                         winner.prizeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || winner.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Winners Management</h1>
          <p className="text-zinc-400 mt-2">Manage winners and eligible cards for each scheme</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <Input
              placeholder="Search winners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-700 text-white w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Schemes Overview */
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schemes.map((scheme) => (
          <GlowCard key={scheme.id} className="bg-zinc-900/50 border-zinc-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-white">{scheme.name}</CardTitle>
                  <p className="text-zinc-400 text-sm mt-1">{scheme.description}</p>
                  <div className="flex gap-4 mt-3 text-sm text-zinc-500">
                    <span>Status: <Badge variant="outline" className="ml-1">{scheme.status}</Badge></span>
                    <span>Winners: {scheme.numberOfWinners}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewEligible(scheme)}
                  className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-600/20"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Eligible
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadEligibleCSV(scheme.id)}
                  className="flex-1 border-green-600 text-green-400 hover:bg-green-600/20"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelectWinners(scheme)}
                  className="flex-1 border-orange-600 text-orange-400 hover:bg-orange-600/20"
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  Select Winners
                </Button>
              </div>
            </CardContent>
          </GlowCard>
        ))}
      </div>
}
      {/* Winners List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Recent Winners</h2>

        {filteredWinners.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No winners found</h3>
              <p className="text-zinc-400">Select winners from eligible cards to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredWinners.map((winner) => (
              <Card key={winner.id} className="bg-zinc-900/50 border-zinc-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {getRankIcon(winner.rank)}
                      <div>
                        <CardTitle className="text-lg">{winner.userName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Rank #{winner.rank}
                          </Badge>
                          {getStatusBadge(winner.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedWinner(winner)}
                        className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-400">Prize:</span> {winner.prizeName}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-400">Phone:</span> {winner.userPhone}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-400">Win Date:</span> {new Date(winner.winDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Winner Selection Modal */}
      <WinnerSelectionModal
        scheme={selectedScheme}
        open={isWinnerModalOpen}
        onClose={() => setIsWinnerModalOpen(false)}
        onSave={handleSaveWinners}
        eligibleCards={eligibleCards}
        onError={setError}
      />

      {/* Eligible Cards Modal */}
      <EligibleCardsModal
        scheme={selectedScheme}
        open={isEligibleModalOpen}
        onClose={() => setIsEligibleModalOpen(false)}
        eligibleCards={eligibleCards}
      />
    </div>
  )
}

// Winner Selection Modal Component
interface WinnerSelectionModalProps {
  scheme: Scheme | null
  open: boolean
  onClose: () => void
  onSave: (cardIds: string[]) => void
  eligibleCards: EligibleCard[]
  onError: (message: string) => void
}

function WinnerSelectionModal({ scheme, open, onClose, onSave, eligibleCards, onError }: WinnerSelectionModalProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([])

  const handleSave = () => {
    if (selectedCards.length === 0) {
      onError('Please select at least one winner')
      return
    }
    onSave(selectedCards)
    setSelectedCards([])
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#1a120c] border-orange-600/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <Trophy className="w-6 h-6 text-orange-400" />
            Select Winners - {scheme?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {eligibleCards.map((card) => (
              <Card key={card.id} className="bg-zinc-900/50 border-zinc-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCards([...selectedCards, card.id])
                          } else {
                            setSelectedCards(selectedCards.filter(id => id !== card.id))
                          }
                        }}
                        className="w-4 h-4 text-orange-600 bg-zinc-800 border-zinc-600 rounded"
                      />
                      <div>
                        <p className="font-medium">{card.cardholderName}</p>
                        <p className="text-sm text-zinc-400">{card.phoneNumber}</p>
                        <p className="text-sm text-zinc-400">Payments: {card.totalPaymentsMade}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-600 text-green-400">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-600 text-white hover:bg-orange-500"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Save Winners ({selectedCards.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Eligible Cards Modal Component
interface EligibleCardsModalProps {
  scheme: Scheme | null
  open: boolean
  onClose: () => void
  eligibleCards: EligibleCard[]
}

function EligibleCardsModal({ scheme, open, onClose, eligibleCards }: EligibleCardsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto bg-[#1a120c] border-orange-600/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <Eye className="w-6 h-6 text-orange-400" />
            Eligible Cards - {scheme?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {eligibleCards.map((card) => (
              <Card key={card.id} className="bg-zinc-900/50 border-zinc-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{card.cardholderName}</CardTitle>
                      <p className="text-sm text-zinc-400">{card.phoneNumber}</p>
                    </div>
                    <Badge variant="outline" className="border-green-600 text-green-400">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-400">Scheme:</span> {card.schemeName}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-400">Payments Made:</span> {card.totalPaymentsMade}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-400">Created:</span> {new Date(card.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}