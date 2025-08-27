"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Calendar, Trophy, Package, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GlowCard from "../../components/admin/GlowCard";
import { toast } from "sonner";
import SchemeEditModal from "@/app/components/admin/SchemeEditModal";
import ProductManagementModal from "@/app/components/admin/ProductManagementModal";

// Types
interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  type: "monthly" | "quarterly" | "yearly";
  prizeType: "product" | "money" | "both";
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  maxParticipants: number;
  subscriptionAmount: number;
  totalPrizes: number;
  numberOfWinners: number;
  registeredUsers: number;
  createdAt: string;
  updatedAt?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rank: number;
  imageUrl?: string;
  specifications?: Record<string, unknown>;
}

// Schemes data will be fetched from API

export default function InvestmentPlansPage() {
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/admin/schemes', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load investment plans')
        // Map backend rows to UI fields (basic mapping; adjust later for full parity)
        const mapped: InvestmentPlan[] = (json.data || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description || '',
          imageUrl: r.image_url || undefined,
          type: (r.subscription_cycle || 'monthly') as any,
          prizeType: 'product',
          status: (r.status === 'active' ? 'active' : r.status === 'draft' ? 'draft' : 'inactive') as any,
          startDate: r.start_date,
          endDate: r.end_date,
          totalPrizes: r.number_of_winners || 1,
          registeredUsers: r.max_participants || 0,
          createdAt: r.created_at
        }))
        setInvestmentPlans(mapped)
      } catch (e: any) {
        setError(e?.message || 'Failed to load investment plans')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, []);

  const getStatusBadge = (status: InvestmentPlan['status']) => {
    const statusConfig = {
      active: { color: "bg-green-600", text: "Active" },
      paused: { color: "bg-orange-600", text: "Paused" },
      completed: { color: "bg-blue-600", text: "Completed" },
      cancelled: { color: "bg-red-600", text: "Cancelled" },
      draft: { color: "bg-yellow-600", text: "Draft" }
    };
    
    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  const getPrizeTypeIcon = (type: InvestmentPlan['prizeType']) => {
    switch (type) {
      case "product": return <Package className="w-4 h-4" />;
      case "money": return <DollarSign className="w-4 h-4" />;
      case "both": return <Trophy className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const filteredPlans = investmentPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setIsEditModalOpen(true);
  };

  const handleEditPlan = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleManageProducts = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setIsProductModalOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("Are you sure you want to delete this investment plan? This action cannot be undone.")) {
      setInvestmentPlans(investmentPlans.filter(p => p.id !== planId));
    }
  };

  const handleSavePlan = async ({ payload, imageFile }: { payload: any; imageFile: File | null }) => {
    setError(null);
    setSuccess(null);
    try {
      const form = new FormData()
      form.append('payload', JSON.stringify(payload))
      if (imageFile) form.append('image', imageFile)
      if (selectedPlan) {
        const res = await fetch(`/api/admin/schemes/${selectedPlan.id}`, { method: 'PATCH', body: form })
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to update investment plan')
        setSuccess('Investment plan updated')
      } else {
        const res = await fetch('/api/admin/schemes', { method: 'POST', body: form })
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to create investment plan')
        setSuccess('Investment plan created')
      }
      // refresh list
      const res = await fetch('/api/admin/schemes', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json?.success) {
        const mapped: InvestmentPlan[] = (json.data || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description || '',
          imageUrl: r.image_url || undefined,
          type: (r.subscription_cycle || 'monthly') as any,
          prizeType: 'product',
          status: (r.status === 'active' ? 'active' : r.status === 'draft' ? 'draft' : r.status === 'paused' ? 'paused' : r.status === 'completed' ? 'completed' : 'cancelled') as any,
          startDate: r.start_date,
          endDate: r.end_date,
          maxParticipants: r.max_participants || 1000,
          subscriptionAmount: r.subscription_amount || 0,
          totalPrizes: r.number_of_winners || 1,
          numberOfWinners: r.number_of_winners || 1,
          registeredUsers: r.registered_users || 0,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
        setInvestmentPlans(mapped)
      }
    } catch (e: any) {
      setError(e?.message || 'Save failed')
    } finally {
      setIsEditModalOpen(false)
      setSelectedPlan(null)
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-sans">
            Investment Plans Management
          </h1>
          <p className="mt-1 text-sm text-zinc-300 font-sans">
            Create and manage gold & diamond investment plans, add products, and track performance.
          </p>
        </div>
        <Button 
          onClick={handleAddPlan}
          className="bg-orange-600 text-white hover:bg-orange-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Investment Plan
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search investment plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-zinc-900 text-white placeholder:text-zinc-500"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a120c] border-zinc-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-zinc-400">Total Investment Plans</p>
                <p className="text-2xl font-bold">{investmentPlans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1a120c] border-zinc-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-zinc-400">Active Investment Plans</p>
                <p className="text-2xl font-bold">
                  {investmentPlans.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a120c] border-zinc-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-zinc-400">Total Rewards</p>
                <p className="text-2xl font-bold">
                  {investmentPlans.reduce((acc, p) => acc + p.totalPrizes, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a120c] border-zinc-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-zinc-400">Total Investors</p>
                <p className="text-2xl font-bold">
                  {investmentPlans.reduce((acc, p) => acc + p.registeredUsers, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <GlowCard key={plan.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getPrizeTypeIcon(plan.prizeType)}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                {getStatusBadge(plan.status)}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1">
              {plan.imageUrl && (
                <div className="mb-3">
                  <img src={plan.imageUrl} alt={plan.name} className="h-36 w-full object-cover rounded border border-zinc-800" />
                </div>
              )}
              <p className="text-sm text-zinc-300 mb-4 line-clamp-3">
                {plan.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Type:</span>
                  <span className="capitalize">{plan.type}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-400">Reward Type:</span>
                  <span className="capitalize">{plan.prizeType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Rewards:</span>
                  <span>{plan.totalPrizes}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-400">Investors:</span>
                  <span>{plan.registeredUsers}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-400">Duration:</span>
                  <span className="text-xs">
                    {new Date(plan.startDate).toLocaleDateString()} - {' '}
                    {new Date(plan.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1 border-orange-600 text-orange-400 hover:bg-orange-600/20"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleManageProducts(plan)}
                  className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-600/20"
                >
                  <Package className="w-3 h-3 mr-1" />
                  Products
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeletePlan(plan.id)}
                  className="border-red-600 text-red-400 hover:bg-red-600/20"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </GlowCard>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No investment plans found</h3>
          <p className="text-zinc-400 mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first investment plan"}
          </p>
          {!searchTerm && (
            <Button 
              onClick={handleAddPlan}
              className="bg-orange-600 text-white hover:bg-orange-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Investment Plan
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <SchemeEditModal
        scheme={selectedPlan}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSavePlan}
      />

      <ProductManagementModal
        scheme={selectedPlan}
        open={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
}
