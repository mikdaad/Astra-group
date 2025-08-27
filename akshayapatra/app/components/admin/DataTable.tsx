'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, Download, MoreHorizontal, X, Check } from 'lucide-react'
import { clsx } from 'clsx'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '../../../components/ui/dropdown-menu'

interface TableRowData {
  [key: string]: string | number | boolean | null | undefined;
}

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: TableRowData) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: TableRowData[]
  title?: string
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  pagination?: boolean
  pageSize?: number
  className?: string
}

export default function DataTable({
  columns,
  data,
  title,
  searchable = true,
  filterable = true,
  exportable = true,
  pagination = true,
  pageSize = 7,
  className
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)

  // Get unique values for filterable columns
  const getFilterableColumns = () => {
    const filterableColumns = ['status', 'priority', 'category', 'channel', 'assignedTo']
    const availableColumns = columns.filter(col => filterableColumns.includes(col.key))
    
    return availableColumns.map(column => ({
      key: column.key,
      label: column.label,
      values: [...new Set(data.map(row => String(row[column.key] || '')).filter(Boolean))]
        .sort()
    }))
  }

  // Apply filters and search
  const filteredData = data.filter(row => {
    // Apply search filter
    const matchesSearch = Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (!matchesSearch) return false
    
    // Apply column filters
    return Object.entries(activeFilters).every(([columnKey, filterValues]) => {
      if (filterValues.length === 0) return true
      const rowValue = String(row[columnKey] || '')
      return filterValues.includes(rowValue)
    })
  })

  // Handle filter changes
  const handleFilterChange = (columnKey: string, value: string, checked: boolean) => {
    setActiveFilters(prev => {
      const currentFilters = prev[columnKey] || []
      
      if (checked) {
        return {
          ...prev,
          [columnKey]: [...currentFilters, value]
        }
      } else {
        return {
          ...prev,
          [columnKey]: currentFilters.filter(v => v !== value)
        }
      }
    })
    
    // Reset to first page when filters change
    setCurrentPage(1)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({})
    setCurrentPage(1)
  }

  // Clear specific filter
  const clearFilter = (columnKey: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnKey]
      return newFilters
    })
    setCurrentPage(1)
  }

  // Get total active filter count
  const activeFilterCount = Object.values(activeFilters)
    .reduce((total, filters) => total + filters.length, 0)

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = pagination 
    ? sortedData.slice(startIndex, startIndex + pageSize)
    : sortedData

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'Paid': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      'Unpaid': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      'Resolved': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      'Not Solve': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
    }

    return (
      <span className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
      )}>
        {status}
      </span>
    )
  }

  return (
    <Card 
      className={clsx('bg-orange-950/50 border-orange-600 text-white', className)}
      style={{
        backgroundImage: 'var(--astra-background, linear-gradient(355deg, #090300 3.07%, #351603 54.29%, #6E2B00 76.89%, #CA5002 97.23%))'
      }}
    >
      <CardHeader className="border-b border-orange-600/30 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h3>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {filterable && (
              <DropdownMenu open={filterDropdownOpen} onOpenChange={setFilterDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-orange-600 text-white hover:bg-orange-600/20 text-xs sm:text-sm relative"
                  >
                    <span className="hidden sm:inline">
                      {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filter'}
                    </span>
                    <span className="sm:hidden">Filter</span>
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-80 bg-gray-900 border-orange-600/30 text-white"
                  align="end"
                >
                  <DropdownMenuLabel className="text-white">Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-orange-600/30" />
                  
                  {getFilterableColumns().map((column) => (
                    <div key={column.key} className="p-2">
                      <div className="text-sm font-medium text-orange-200 mb-2 flex items-center justify-between">
                        {column.label}
                        {activeFilters[column.key]?.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearFilter(column.key)}
                            className="h-6 px-2 text-xs text-orange-300 hover:text-white hover:bg-orange-600/20"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {column.values.map((value) => (
                          <DropdownMenuCheckboxItem
                            key={value}
                            checked={activeFilters[column.key]?.includes(value) || false}
                            onCheckedChange={(checked) => handleFilterChange(column.key, value, checked)}
                            className="text-white hover:bg-orange-600/20 focus:bg-orange-600/20"
                          >
                            {value}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {activeFilterCount > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-orange-600/30" />
                      <DropdownMenuItem 
                        onClick={clearAllFilters}
                        className="text-orange-300 hover:text-white hover:bg-orange-600/20 focus:bg-orange-600/20"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {exportable && (
              <Button 
                variant="outline" 
                size="sm"
                className="border-orange-600 text-white hover:bg-orange-600/20 text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
          </div>
        </div>

        {searchable && (
          <div className="mt-3 sm:mt-4">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border-orange-600/30 text-white placeholder:text-white/50 text-sm sm:text-base"
            />
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-3 sm:mt-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-orange-200">Active filters:</span>
              {Object.entries(activeFilters).map(([columnKey, filterValues]) =>
                filterValues.map((value) => (
                  <span
                    key={`${columnKey}-${value}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-orange-600/20 border border-orange-600/30 rounded text-xs text-white"
                  >
                    {columns.find(col => col.key === columnKey)?.label}: {value}
                    <button
                      onClick={() => handleFilterChange(columnKey, value, false)}
                      className="hover:text-orange-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-orange-300 hover:text-white underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Table container with horizontal scroll */}
        <div className="overflow-x-auto">
          <Table className="w-full table-auto">
            <TableHeader className="bg-orange-600/20">
              <TableRow className="border-orange-600/30 hover:bg-orange-600/30">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-orange-600/20 whitespace-nowrap"
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="truncate">{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-orange-500 flex-shrink-0">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-transparent divide-y divide-orange-600/30">
              {paginatedData.map((row, index) => (
                <TableRow 
                  key={index}
                  className="border-orange-600/30 hover:bg-orange-950/30"
                  style={{
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: `fadeInUp 0.3s ease forwards ${index * 0.05}s`
                  }}
                >
                    {columns.map((column) => (
                      <TableCell 
                        key={column.key} 
                        className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-white"
                      >
                        <div className="truncate" title={String(row[column.key])}>
                          {column.render 
                            ? column.render(row[column.key], row)
                            : column.key === 'status' 
                              ? getStatusBadge(String(row[column.key]))
                              : row[column.key]
                          }
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination */}
      {pagination && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-orange-600/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-white">
                Show Data
              </span>
              <select className="ml-2 px-2 sm:px-3 py-1 border border-orange-600/30 rounded bg-white/10 text-white text-xs sm:text-sm">
                <option>{pageSize}</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-orange-600/20 hover:text-white disabled:opacity-50 p-1 sm:p-2"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              {/* Show limited page numbers on mobile */}
              <div className="flex items-center space-x-1">
                {totalPages <= 5 ? (
                  // Show all pages if 5 or fewer
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      className={clsx(
                        'text-xs sm:text-sm min-w-[32px] sm:min-w-[36px] h-8',
                        currentPage === page
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'text-white hover:bg-orange-600/20 hover:text-white'
                      )}
                    >
                      {page}
                    </Button>
                  ))
                ) : (
                  // Show condensed pagination for many pages
                  <>
                    {currentPage > 2 && (
                      <>
                        <Button
                          onClick={() => setCurrentPage(1)}
                          variant="ghost"
                          size="sm"
                          className="text-xs sm:text-sm text-white hover:bg-orange-600/20 hover:text-white min-w-[32px] sm:min-w-[36px] h-8"
                        >
                          1
                        </Button>
                        {currentPage > 3 && <span className="text-white text-xs sm:text-sm">...</span>}
                      </>
                    )}
                    
                    {/* Show current page and adjacent pages */}
                    {[currentPage - 1, currentPage, currentPage + 1]
                      .filter(page => page >= 1 && page <= totalPages)
                      .map((page) => (
                        <Button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          className={clsx(
                            'text-xs sm:text-sm min-w-[32px] sm:min-w-[36px] h-8',
                            currentPage === page
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'text-white hover:bg-orange-600/20 hover:text-white'
                          )}
                        >
                          {page}
                        </Button>
                      ))
                    }
                    
                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && <span className="text-white text-xs sm:text-sm">...</span>}
                        <Button
                          onClick={() => setCurrentPage(totalPages)}
                          variant="ghost"
                          size="sm"
                          className="text-xs sm:text-sm text-white hover:bg-orange-600/20 hover:text-white min-w-[32px] sm:min-w-[36px] h-8"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>

              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-orange-600/20 hover:text-white disabled:opacity-50 p-1 sm:p-2"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}