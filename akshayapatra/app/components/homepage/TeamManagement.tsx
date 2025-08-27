'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, RefreshCw, ChevronDown, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useData } from '@/app/lib/contexts/DataContext';

const filterOptions = ['Direct', 'InDirect'] as const;
const monthOptions = ['This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Last Year'];

export default function TeamManagement() {
  const { teamFilter, setTeamFilter, isLoading, refreshData, filteredTableData } = useData();
  
  const handleFilterChange = (type: 'Direct' | 'InDirect') => {
    setTeamFilter({ ...teamFilter, type });
  };
  
  const handleMonthChange = (month: string) => {
    setTeamFilter({ ...teamFilter, month });
  };
  
  const handleExport = () => {
    // Generate CSV data
    const csvData = filteredTableData.map(row => ({
      Name: row.name,
      Source: row.source,
      Status: row.status,
      Date: row.date,
      Email: row.email,
      Mobile: row.mobile,
      Assigned: row.assigned,
      Amount: row.amount
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-data-${teamFilter.type}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  const getTeamStats = () => {
    const total = filteredTableData.length;
    const paid = filteredTableData.filter(row => row.status === 'Paid').length;
    const inProgress = filteredTableData.filter(row => row.status === 'In Progress').length;
    const pending = filteredTableData.filter(row => row.status === 'Pending').length;
    
    return { total, paid, inProgress, pending };
  };
  
  const stats = getTeamStats();

  return (
    <Card className="w-full  md:h-44 mb-8 bg-orange-950/50 border-orange-600 text-white">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold font-['Poppins'] text-white mb-2">
              Team Management
            </CardTitle>
            <p className="text-xs font-normal font-['Poppins'] text-white/50">
              Keep tabs on your leads&apos; performance from every angle of Team management.
            </p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs">
              <span>Total: <strong>{stats.total}</strong></span>
              <span>Paid: <strong className="text-green-400">{stats.paid}</strong></span>
              <span>In Progress: <strong className="text-yellow-400">{stats.inProgress}</strong></span>
              {stats.pending > 0 && (
                <span>Pending: <strong className="text-orange-400">{stats.pending}</strong></span>
              )}
            </div>
          </div>
          
          {/* Top Right Controls */}
          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="secondary" 
              size="sm"
              className="h-8 bg-white text-black hover:bg-gray-100"
              disabled={isLoading}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {getCurrentDate()}
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              className="h-8 bg-white text-black hover:bg-gray-100"
              onClick={handleExport}
              disabled={isLoading || filteredTableData.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 rounded-full border-orange-600 text-white hover:bg-orange-600/20"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {filterOptions.map((filter) => (
              <Badge
                key={filter}
                variant={teamFilter.type === filter ? "default" : "secondary"}
                className={`h-8 px-4 cursor-pointer transition-colors ${
                  teamFilter.type === filter 
                    ? "bg-white text-orange-600 hover:bg-gray-100 shadow-md" 
                    : "bg-white/80 text-orange-600 hover:bg-white"
                }`}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
                <span className="ml-1 text-xs opacity-70">
                  ({filter === 'Direct' ? stats.paid : stats.inProgress})
                </span>
              </Badge>
            ))}
          </div>
          
          {/* Bottom Right Controls */}
          <div className="flex gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 border-orange-600 text-white hover:bg-orange-600/20"
                  disabled={isLoading}
                >
                  {teamFilter.month}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {monthOptions.map((month) => (
                  <DropdownMenuItem
                    key={month}
                    onClick={() => handleMonthChange(month)}
                    className={teamFilter.month === month ? 'bg-orange-50' : ''}
                  >
                    {month}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              size="sm"
              className="h-8 bg-gradient-to-b from-orange-600 to-amber-800 hover:opacity-90"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Segment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
