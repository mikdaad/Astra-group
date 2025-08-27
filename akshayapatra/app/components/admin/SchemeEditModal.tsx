'use client'

import { useState, useEffect } from 'react'
import { Loader2, Calendar, Trophy, Package, DollarSign } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Scheme as BaseScheme } from '@/lib/types/schemes'

// Local interface that matches what we need for the UI
interface Scheme extends BaseScheme {
  imageUrl?: string;
}

type FormState = {
  name: string
  description: string
  subscriptionAmount: string
  type: Scheme['type']
  prizeType: Scheme['prizeType']
  status: Scheme['status']
  startDate: string
  endDate: string
  totalPrizes: number
}

interface SchemeEditModalProps {
  scheme: Scheme | null
  open: boolean
  onClose: () => void
  onSave: (args: { payload: any; imageFile: File | null }) => void
}

export default function SchemeEditModal({
  scheme,
  open,
  onClose,
  onSave,
}: SchemeEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    subscriptionAmount: string;
    type: 'monthly' | 'quarterly' | 'yearly';
    prizeType: 'product' | 'money' | 'both';
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
    startDate: string;
    endDate: string;
    totalPrizes: number;
  }>({
    name: '',
    description: '',
    subscriptionAmount: '',
    type: 'monthly',
    prizeType: 'product',
    status: 'active',
    startDate: '',
    endDate: '',
    totalPrizes: 1,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (scheme) {
      setFormData({
        name: scheme.name,
        description: scheme.description,
        subscriptionAmount: '',
        type: scheme.type,
        prizeType: scheme.prizeType,
        status: scheme.status,
        startDate: scheme.startDate,
        endDate: scheme.endDate,
        totalPrizes: scheme.totalPrizes,
      })
      setImageFile(null)
      setImagePreview(null)
    } else {
      // Reset form for new scheme
      const today = new Date().toISOString().split('T')[0]
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)

      setFormData({
        name: '',
        description: '',
        subscriptionAmount: '',
        type: 'monthly',
        prizeType: 'product',
        status: 'active',
        startDate: today,
        endDate: nextYear.toISOString().split('T')[0],
        totalPrizes: 1,
      })
      setImageFile(null)
      setImagePreview(null)
    }
    setErrors({})
  }, [scheme, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Scheme name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Scheme name must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (formData.totalPrizes < 1) {
      newErrors.totalPrizes = 'Must have at least 1 prize'
    } else if (formData.totalPrizes > 100) {
      newErrors.totalPrizes = 'Cannot exceed 100 prizes'
    }

    if (!formData.subscriptionAmount || Number(formData.subscriptionAmount) <= 0) {
      newErrors.subscriptionAmount = 'Subscription amount must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      onSave({
        payload: {
          name: formData.name,
          description: formData.description,
          subscription_amount: formData.subscriptionAmount,
          scheme_type: formData.prizeType === 'money' ? 'investment' : 'lottery',
          number_of_winners: formData.totalPrizes,
          start_date: new Date(formData.startDate).toISOString(),
          end_date: new Date(formData.endDate).toISOString(),
          status: formData.status,
          subscription_cycle: formData.type,
        },
        imageFile
      })
    } catch (error) {
      console.error('Error saving scheme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: '' }))
    }
  }

  const getPrizeTypeIcon = (type: 'product' | 'money' | 'both') => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4" />
      case 'money':
        return <DollarSign className="w-4 h-4" />
      case 'both':
        return <Trophy className="w-4 h-4" />
      default:
        return <Trophy className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a120c] border-orange-600/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Trophy className="text-orange-600 dark:text-orange-400 w-4 h-4" />
            </div>
            {scheme ? 'Edit Scheme' : 'Create New Scheme'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Scheme Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter scheme name"
                    className={`bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your scheme in detail"
                    rows={3}
                    className={`bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label htmlFor="subscriptionAmount" className="text-sm font-medium">
                    Subscription Amount (INR) *
                  </Label>
                  <Input
                    id="subscriptionAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.subscriptionAmount}
                    onChange={(e) => handleInputChange('subscriptionAmount', e.target.value)}
                    placeholder="e.g. 499.00"
                    className={`bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400 ${
                      errors.subscriptionAmount ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.subscriptionAmount && (
                    <p className="text-red-400 text-xs mt-1">{errors.subscriptionAmount}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Scheme Image</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null
                        setImageFile(f)
                        if (f) {
                          const url = URL.createObjectURL(f)
                          setImagePreview(url)
                        } else {
                          setImagePreview(null)
                        }
                      }}
                      className="bg-zinc-800 border-zinc-600 text-white"
                    />
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" className="h-12 w-12 rounded object-cover border border-zinc-700" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheme Configuration */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" />
                Scheme Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-sm font-medium">
                    Scheme Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value as Scheme['type'])}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prizeType" className="text-sm font-medium">
                    Prize Type
                  </Label>
                  <Select
                    value={formData.prizeType}
                    onValueChange={(value) => handleInputChange('prizeType', value as Scheme['prizeType'])}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                      <div className="flex items-center gap-2">
                        {getPrizeTypeIcon(formData.prizeType)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      <SelectItem value="product">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Products Only
                        </div>
                      </SelectItem>
                      <SelectItem value="money">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Cash Only
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Products & Cash
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="totalPrizes" className="text-sm font-medium">
                    Total Prizes *
                  </Label>
                  <Input
                    id="totalPrizes"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.totalPrizes}
                    onChange={(e) => handleInputChange('totalPrizes', Number(e.target.value) || 1)}
                    className={`bg-zinc-800 border-zinc-600 text-white ${errors.totalPrizes ? 'border-red-500' : ''}`}
                  />
                  {errors.totalPrizes && <p className="text-red-400 text-xs mt-1">{errors.totalPrizes}</p>}
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value as Scheme['status'])}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`bg-zinc-800 border-zinc-600 text-white ${errors.startDate ? 'border-red-500' : ''}`}
                  />
                  {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`bg-zinc-800 border-zinc-600 text-white ${errors.endDate ? 'border-red-500' : ''}`}
                  />
                  {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
                </div>
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
            <Button type="submit" disabled={isLoading} className="bg-orange-600 text-white hover:bg-orange-500">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {scheme ? 'Update Scheme' : 'Create Scheme'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
