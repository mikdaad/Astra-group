'use client'

import { useState, useEffect } from 'react'
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react'
import StatCard from '../../components/admin/StatCard'
import DataTable from '../../components/admin/DataTable'
import SimpleChart from '../../components/admin/SimpleChart'
import SkeletonCard from '../../components/admin/SkeletonCard'

export default function IncomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])
  // Income data will be fetched from API
  const incomeStats: any[] = []
  const transactionData: any[] = []
  const incomeBreakdownData: any[] = []
  const directIncomeData: any[] = []
  const indirectIncomeData: any[] = []

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'source', label: 'Source', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'date', label: 'Date', sortable: true }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-white/20 rounded w-64 animate-pulse" />
            <div className="h-5 bg-white/15 rounded w-96 animate-pulse" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, index) => (
            <SkeletonCard key={index} variant="stat" />
          ))}
        </div>

        {/* Income Breakdown & Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard variant="chart" className="lg:col-span-1" />
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard variant="stat" />
            <SkeletonCard variant="stat" />
          </div>
        </div>

        {/* Table Skeleton */}
        <SkeletonCard variant="table" />

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard variant="chart" />
          <SkeletonCard variant="chart" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Total Income Collected
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and monitor the performance of your leads from all aspects of Leads Management.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {incomeStats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={false} />
        ))}
      </div>

      {/* Income Breakdown & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SimpleChart
          data={incomeBreakdownData}
          type="doughnut"
          title="Income Breakdown"
          className="lg:col-span-1"
        />

        <div className="lg:col-span-2 space-y-6">
          {/* Direct Income */}
          <StatCard
            title="Direct Income Collected"
            value="₹45,000"
            subtitle="This Month"
            icon={TrendingUp}
            change={{ value: '15%', type: 'increase', period: 'vs last month' }}
            className="bg-gradient-to-r from-green-500 to-green-600"
            loading={false}
          />

          {/* In-Direct Income */}
          <StatCard
            title="In-Direct Income Collected"
            value="₹4,250"
            subtitle="This Month"
            icon={TrendingDown}
            change={{ value: '8%', type: 'decrease', period: 'vs last month' }}
            className="bg-gradient-to-r from-blue-500 to-blue-600"
            loading={false}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <DataTable
        title="Recent Transactions"
        columns={columns}
        data={transactionData}
        searchable={true}
        filterable={true}
        exportable={true}
        pagination={true}
        pageSize={6}
      />

      {/* Income Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          data={directIncomeData}
          type="bar"
          title="Direct Income Trend (₹45,000)"
          className="lg:col-span-1"
        />

        <SimpleChart
          data={indirectIncomeData}
          type="bar"
          title="In-Direct Income Trend (₹4,250)"
          className="lg:col-span-1"
        />
      </div>
    </div>
  )
}