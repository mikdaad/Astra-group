"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Edit,
  UserCheck,
  Shield,
  Crown,
  Star,
  Clock,
  Phone,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "../../components/admin/StatCard";
import DataTable from "../../components/admin/DataTable";
import SkeletonCard from "../../components/admin/SkeletonCard";
import StaffEditModal from "../../components/admin/StaffEditModal";

import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// API types
interface StaffStatsData {
  totalStaff: number
  supportStaff: number
  newStaff: number
  adminStaff: number
  managerStaff: number
  superadminStaff: number
}

interface StaffProfile {
  id: string
  full_name: string
  phone_number: string | null
  is_active: boolean
  role: string
  created_at: string
  updated_at: string
}

export default function StaffPage() {
  const { user } = useAuth();
  const { role } = useRBAC();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [staffStats, setStaffStats] = useState<StaffStatsData>({
    totalStaff: 0,
    supportStaff: 0,
    newStaff: 0,
    adminStaff: 0,
    managerStaff: 0,
    superadminStaff: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch staff data
  const fetchStaffData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch staff list
      const staffResponse = await fetch('/api/admin/staff');
      let staffData: { success?: boolean; data?: StaffProfile[]; message?: string } | null = null;
      try { staffData = await staffResponse.json(); } catch {}
      
      if (staffResponse.ok && staffData?.success) {
        setStaff(staffData.data as StaffProfile[]);
        setSuccess("Loaded staff list");
      } else {
        throw new Error(staffData?.message || 'Failed to load staff list');
      }
      
      // Fetch staff stats
      const statsResponse = await fetch('/api/admin/staff/stats');
      let statsData: { success?: boolean; data?: StaffStatsData; message?: string } | null = null;
      try { statsData = await statsResponse.json(); } catch {}
      
      if (statsResponse.ok && statsData?.success) {
        setStaffStats(statsData.data as StaffStatsData);
        setSuccess("Loaded staff statistics");
      } else {
        throw new Error(statsData?.message || 'Failed to load staff statistics');
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
      const message = error instanceof Error ? error.message : 'Something went wrong while loading staff data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Filter staff based on search and filters
  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.phone_number && member.phone_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && member.is_active) ||
      (statusFilter === "inactive" && !member.is_active);
    
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get role badge component
  const getRoleBadge = (role: string) => {
    const configs = {
      superadmin: { color: "bg-red-800", text: "Super Admin", icon: Crown },
      admin: { color: "bg-red-600", text: "Admin", icon: Crown },
      manager: { color: "bg-purple-600", text: "Manager", icon: Shield },
      support: { color: "bg-green-600", text: "Support", icon: UserCheck },
      new: { color: "bg-blue-600", text: "New", icon: Star }
    };
    
    const config = configs[role as keyof typeof configs] || configs.new;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    const config = isActive 
      ? { color: "bg-green-600", text: "Active" }
      : { color: "bg-gray-600", text: "Inactive" };
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  // Handle actions
  const handleEditStaff = (staffMember: StaffProfile) => {
    // Prevent editing self on client
    if (user?.id && staffMember.id === user.id) {
      setError("You can't edit your own account");
      return;
    }
    setSelectedStaff(staffMember);
    setIsEditModalOpen(true);
  };

  const handleStaffUpdate = async (staffId: string | null, updates: any) => {
    setError(null);
    setSuccess(null);
    
    if (staffId) {
      // Update existing staff
      try {
        const response = await fetch(`/api/admin/staff/${staffId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        
        if (response.ok) {
          // Refresh data
          fetchStaffData();
          setSuccess('Staff updated successfully');
        } else {
          let data: any = null;
          try { data = await response.json(); } catch {}
          const message = data?.message || 'Failed to update staff member';
          setError(message);
        }
      } catch (error) {
        console.error('Error updating staff:', error);
        const message = error instanceof Error ? error.message : 'Failed to update staff member';
        setError(message);
      }
    }
    setIsEditModalOpen(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // DataTable columns
  const columns: Array<{ key: string; label: string; sortable?: boolean; render?: (value: unknown, row: { [key: string]: string | number | boolean | null | undefined }) => React.ReactNode }> = [
    { 
      key: 'full_name', 
      label: 'Name', 
      sortable: true,
      render: (value: unknown, row: { [key: string]: string | number | boolean | null | undefined }) => (
        <div>
          <div className="font-medium text-white">{String(value)}</div>
          <div className="text-sm text-zinc-400">ID: {String(row.id).slice(0, 8)}...</div>
        </div>
      )
    },
    { 
      key: 'phone_number', 
      label: 'Phone', 
      sortable: true,
      render: (value: unknown) => (
        <div className="flex items-center gap-2 text-white">
          <Phone className="w-3 h-3 text-zinc-400" />
          <span className="text-sm">{(value as string) || 'N/A'}</span>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Role', 
      sortable: true,
      render: (value: unknown) => getRoleBadge(String(value))
    },
    { 
      key: 'is_active', 
      label: 'Status', 
      sortable: true,
      render: (value: unknown) => getStatusBadge(Boolean(value))
    },
    { 
      key: 'created_at', 
      label: 'Joined', 
      sortable: true,
      render: (value: unknown) => (
        <div>
          <div className="text-white">{formatDate(String(value))}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: { [key: string]: string | number | boolean | null | undefined }) => {
        const staffId = String(row.id)
        const staffRow = staff.find(s => s.id === staffId)
        const isSelf = user?.id && staffId === user.id;
        const isSuperAdmin = role === 'superadmin';
        const allowed = isSuperAdmin && !isSelf;
        const tooltipText = !isSuperAdmin
          ? 'Only superadmin can edit staff'
          : isSelf
            ? "You can't edit your own account"
            : ''
        return (
          <div className="flex gap-2">
            {allowed ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => staffRow && handleEditStaff(staffRow)}
                className="border-orange-600 text-orange-400 hover:bg-orange-600/20"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit Roles
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex" tabIndex={0}>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="border-zinc-700 text-zinc-400 cursor-not-allowed"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit Roles
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                    {tooltipText}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      }
    }
  ];

  // Statistics data
  const statisticsCards = [
    {
      title: 'Total Staff',
      value: staffStats.totalStaff.toString(),
      subtitle: 'All Employees',
      icon: Users
    },
    {
      title: 'Support Staff',
      value: staffStats.supportStaff.toString(),
      subtitle: 'Customer Support',
      icon: UserCheck
    },
    {
      title: 'New Staff',
      value: staffStats.newStaff.toString(),
      subtitle: 'New accounts',
      icon: Clock
    },
    {
      title: 'Admins & Managers',
      value: (staffStats.adminStaff + staffStats.managerStaff).toString(),
      subtitle: 'Leadership Team',
      icon: Crown
    }
  ];

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
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-zinc-300 font-sans">
            Manage staff members, roles, and permissions across departments.
          </p>
        </div>

      </div>

      {error && (
        <div className="rounded border border-red-600 bg-red-600/10 p-3 text-red-300">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-red-600 text-red-300 hover:bg-red-600/20" onClick={fetchStaffData}>
                Retry
              </Button>
              <Button size="sm" variant="outline" className="border-red-600 text-red-300 hover:bg-red-600/20" onClick={() => setError(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded border border-green-600 bg-green-600/10 p-3 text-green-300">
          <div className="flex items-center justify-between gap-4">
            <span>{success}</span>
            <Button size="sm" variant="outline" className="border-green-600 text-green-300 hover:bg-green-600/20" onClick={() => setSuccess(null)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statisticsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by name, email, employee ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-zinc-900 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px] bg-zinc-900 text-white">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="new">New Staff</SelectItem>
          </SelectContent>
        </Select>


      </div>

      {/* Staff Table */}
      <DataTable
        columns={columns}
        data={filteredStaff.map(s => ({
          id: s.id,
          full_name: s.full_name,
          phone_number: s.phone_number,
          is_active: s.is_active,
          role: s.role,
          created_at: s.created_at,
        }))}
        title="Staff Members"
        searchable={false}
        filterable={false}
        exportable={true}
        pagination={true}
        pageSize={10}
      />

      {/* Edit Modal */}
      <StaffEditModal
        staff={selectedStaff}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleStaffUpdate}
        existingStaff={staff}
      />
    </div>
  );
}