'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { useDirtyFlags } from '@/app/hooks/useDirtyFlags';
import { ls } from '@/lib/local';
import { getUserDashboardStats, getTeamTransactionsPage, type TeamTxRow, type DashboardStats } from '@/app/lib/rpc';

// Types
export interface DashboardData {
  totalIncome: number;
  directCommission: number;
  indirectCommission: number;
  incomePercentage: number;
  commissionPercentage: number;
}

export interface ChartDataPoint {
  month: string;
  value: number;
  date: string;
}

export interface TableRowData {
  id: string;
  name: string;
  source: string;
  status: 'Paid' | 'In Progress' | 'Pending' | 'Failed';
  date: string;
  email: string;
  mobile: string;
  assigned: string;
  amount: number;
}

export interface TeamFilter {
  type: 'Direct' | 'InDirect';
  month: string;
  status?: string;
}

interface DataContextType {
  // Dashboard Data
  dashboardData: DashboardData;
  setDashboardData: (data: DashboardData) => void;
  
  // Chart Data
  lineChartData: ChartDataPoint[];
  barChartData: ChartDataPoint[];
  setLineChartData: (data: ChartDataPoint[]) => void;
  setBarChartData: (data: ChartDataPoint[]) => void;
  
  // Table Data
  tableData: TableRowData[];
  setTableData: (data: TableRowData[]) => void;
  filteredTableData: TableRowData[];
  
  // Filters and Search
  teamFilter: TeamFilter;
  setTeamFilter: (filter: TeamFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  addTableRow: (row: Omit<TableRowData, 'id'>) => void;
  updateTableRow: (id: string, updates: Partial<TableRowData>) => void;
  deleteTableRow: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// LocalStorage keys
const LS_KEYS = {
  dashboard: 'home:dashboardData',
  lineChart: 'home:lineChartData',
  barChart: 'home:barChartData',
  table: 'home:tableData'
} as const;

function monthKey(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleDateString('en-US', { month: 'short' });
}

function toNumber(n: string | number | null | undefined): number {
  const v = Number(n ?? 0);
  return Number.isFinite(v) ? v : 0;
}

function mapTxToTableRow(t: TeamTxRow): TableRowData {
  return {
    id: t.id,
    name: t.payer_name ?? '—',
    source: t.level === 1 ? 'Direct' : 'Indirect',
    status: t.status === 'completed' ? 'Paid' : t.status === 'pending' ? 'In Progress' : 'Failed',
    date: new Date(t.created_at).toISOString().slice(0, 10),
    email: '',
    mobile: '',
    assigned: '',
    amount: toNumber(t.commission_amount ?? t.amount)
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  // State
  const [dashboardData, setDashboardData] = useState<DashboardData>(() => ls.get<DashboardData>(LS_KEYS.dashboard, {
    totalIncome: 0,
    directCommission: 0,
    indirectCommission: 0,
    incomePercentage: 0,
    commissionPercentage: 0,
  }));
  
  const [lineChartData, setLineChartData] = useState<ChartDataPoint[]>(() => ls.get<ChartDataPoint[]>(LS_KEYS.lineChart, []));
  const [barChartData, setBarChartData] = useState<ChartDataPoint[]>(() => ls.get<ChartDataPoint[]>(LS_KEYS.barChart, []));
  const [tableData, setTableData] = useState<TableRowData[]>(() => ls.get<TableRowData[]>(LS_KEYS.table, []));
  
  const [teamFilter, setTeamFilter] = useState<TeamFilter>({
    type: 'Direct',
    month: 'This Month',
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { flags, acknowledge } = useDirtyFlags();
  const supabase = createSupabaseClient();
  
  // Computed values
  const filteredTableData = React.useMemo(() => {
    let filtered = tableData;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(row => 
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.assigned.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter if set
    if (teamFilter.status) {
      filtered = filtered.filter(row => row.status === teamFilter.status);
    }
    
    return filtered;
  }, [tableData, searchQuery, teamFilter]);
  
  // Actions
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Dashboard stats
      const statsArr = await getUserDashboardStats({}, supabase).catch(() => [] as DashboardStats[]);
      const s = Array.isArray(statsArr) ? (statsArr[0] ?? null) : statsArr;
      const totalIncome = toNumber(s?.total_income);
      const directCommission = toNumber(s?.direct_income);
      const indirectCommission = toNumber(s?.indirect_commission);
      const denom = Math.max(1, directCommission + indirectCommission);
      const newDashboard: DashboardData = {
        totalIncome,
        directCommission,
        indirectCommission,
        incomePercentage: Math.round((directCommission / denom) * 100),
        commissionPercentage: Math.round((indirectCommission / denom) * 100),
      };
      setDashboardData(newDashboard);
      ls.set(LS_KEYS.dashboard, newDashboard);

      // Team transactions for charts and table
      const tx = await getTeamTransactionsPage({ levels: [1,2], onlyCompleted: true, limit: 250 }, supabase).catch(() => [] as TeamTxRow[]);

      // Build last 6 month buckets
      const now = new Date();
      const months: { key: string; date: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ key: d.toLocaleDateString('en-US', { month: 'short' }), date: d.toISOString() });
      }
      const byMonthTotal: Record<string, number> = Object.fromEntries(months.map(m => [m.key, 0]));
      tx.forEach(t => {
        const mk = monthKey(t.created_at);
        if (mk in byMonthTotal) byMonthTotal[mk] += toNumber(t.commission_amount ?? t.amount);
      });
      const lineData: ChartDataPoint[] = months.map(m => ({ month: m.key, value: byMonthTotal[m.key] || 0, date: m.date }));
      setLineChartData(lineData);
      ls.set(LS_KEYS.lineChart, lineData);

      // Bar chart: same totals for now
      const barData: ChartDataPoint[] = lineData.slice(-4);
      setBarChartData(barData);
      ls.set(LS_KEYS.barChart, barData);

      // Table: map recent 30 rows
      const table: TableRowData[] = tx.slice(0, 30).map(mapTxToTableRow);
      setTableData(table);
      ls.set(LS_KEYS.table, table);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, setIsLoading, setDashboardData, setLineChartData, setBarChartData, setTableData]);
  
  const addTableRow = (row: Omit<TableRowData, 'id'>) => {
    const newRow: TableRowData = {
      ...row,
      id: Date.now().toString(),
    };
    setTableData(prev => [newRow, ...prev]);
  };
  
  const updateTableRow = (id: string, updates: Partial<TableRowData>) => {
    setTableData(prev => prev.map(row => 
      row.id === id ? { ...row, ...updates } : row
    ));
  };
  
  const deleteTableRow = (id: string) => {
    setTableData(prev => prev.filter(row => row.id !== id));
  };
  
  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // React to dirty flags
  useEffect(() => {
    const need = flags.transactions || flags.referral || flags.referral2;
    if (!need) return;
    (async () => {
      await refreshData();
      await acknowledge();
    })();
  }, [flags, acknowledge, refreshData]);
  
  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshData]);
  
  const value: DataContextType = {
    dashboardData,
    setDashboardData,
    lineChartData,
    barChartData,
    setLineChartData,
    setBarChartData,
    tableData,
    setTableData,
    filteredTableData,
    teamFilter,
    setTeamFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    refreshData,
    addTableRow,
    updateTableRow,
    deleteTableRow,
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}



