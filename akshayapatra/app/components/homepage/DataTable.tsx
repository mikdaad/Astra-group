'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  MoreVertical, 
  Plus, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useData, type TableRowData } from '@/app/lib/contexts/DataContext';

type SortField = keyof TableRowData;
type SortDirection = 'asc' | 'desc' | null;

interface TableState {
  sortField: SortField | null;
  sortDirection: SortDirection;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
  statusFilter: string;
}

export default function DataTable() {
  const { 
    filteredTableData, 
    isLoading, 
    searchQuery, 
    setSearchQuery,
    updateTableRow,
    deleteTableRow,
    addTableRow 
  } = useData();

  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);
  const [tableState, setTableState] = React.useState<TableState>({
    sortField: null,
    sortDirection: null,
    currentPage: 1,
    itemsPerPage: 5,
    searchQuery: '',
    statusFilter: 'all'
  });

  // Local search state for real-time search
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Apply sorting and filtering
  const processedData = React.useMemo(() => {
    let data = [...filteredTableData];

    // Apply status filter
    if (tableState.statusFilter !== 'all') {
      data = data.filter(row => row.status === tableState.statusFilter);
    }

    // Apply sorting
    if (tableState.sortField && tableState.sortDirection) {
      data.sort((a, b) => {
        const aValue = a[tableState.sortField!];
        const bValue = b[tableState.sortField!];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return tableState.sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return tableState.sortDirection === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
    }

    return data;
  }, [filteredTableData, tableState.statusFilter, tableState.sortField, tableState.sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / tableState.itemsPerPage);
  const startIndex = (tableState.currentPage - 1) * tableState.itemsPerPage;
  const paginatedData = processedData.slice(startIndex, startIndex + tableState.itemsPerPage);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedRows(checked ? paginatedData.map(row => row.id) : []);
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, rowId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== rowId));
      setSelectAll(false);
    }
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    setTableState(prev => ({
      ...prev,
      sortField: field,
      sortDirection: 
        prev.sortField === field 
          ? prev.sortDirection === 'asc' ? 'desc' : prev.sortDirection === 'desc' ? null : 'asc'
          : 'asc',
      currentPage: 1
    }));
  };

  // Status filter handler
  const handleStatusFilter = (status: string) => {
    setTableState(prev => ({
      ...prev,
      statusFilter: status,
      currentPage: 1
    }));
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setTableState(prev => ({ ...prev, currentPage: page }));
  };

  // CRUD operations
  const handleEdit = (row: TableRowData) => {
    // Simulate edit - in real app, this would open a modal
    const newStatus = row.status === 'Paid' ? 'In Progress' : 'Paid';
    updateTableRow(row.id, { status: newStatus });
  };

  const handleDelete = (rowId: string) => {
    if (confirm('Are you sure you want to delete this row?')) {
      deleteTableRow(rowId);
      setSelectedRows(prev => prev.filter(id => id !== rowId));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedRows.length} selected rows?`)) {
      selectedRows.forEach(id => deleteTableRow(id));
      setSelectedRows([]);
      setSelectAll(false);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (tableState.sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    if (tableState.sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4" />;
    }
    if (tableState.sortDirection === 'desc') {
      return <ArrowDown className="w-4 h-4" />;
    }
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
      case 'In Progress':
        return 'bg-amber-400/20 text-amber-400 hover:bg-amber-400/30';
      case 'Pending':
        return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30';
      case 'Failed':
        return 'bg-red-500/20 text-red-500 hover:bg-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-[1080px] bg-orange-950/50 border-orange-600">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-white/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              placeholder="Search team members..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-white/10 border-orange-600/30 text-white placeholder:text-white/50"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-orange-600 text-white hover:bg-orange-600/20">
                <Filter className="w-4 h-4 mr-2" />
                Status: {tableState.statusFilter === 'all' ? 'All' : tableState.statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleStatusFilter('all')}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('Paid')}>
                Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('In Progress')}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('Pending')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter('Failed')}>
                Failed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedRows.length} selected
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            className="h-8 bg-gradient-to-b from-orange-600 to-amber-800 hover:opacity-90"
            onClick={() => setTableState(prev => ({ ...prev, currentPage: 1 }))}
          >
            View All ({processedData.length})
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 rounded-full border-orange-600 text-white hover:bg-orange-600/20"
            onClick={() => addTableRow({
              name: "New User",
              source: "Manual",
              status: "Pending",
              date: new Date().toISOString().split('T')[0],
              email: "new@example.com",
              mobile: "+1 000 000 0000",
              assigned: "System",
              amount: 0
            })}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="w-full bg-orange-950/50 border-orange-600 overflow-x-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-orange-600/30 bg-orange-600/20 hover:bg-orange-600/30">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    className="border-orange-500 data-[state=checked]:bg-orange-500"
                  />
                </TableHead>
                <TableHead className="text-white font-normal font-['Poppins']">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="text-white hover:bg-white/10"
                  >
                    Name {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="text-white font-normal font-['Poppins']">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('source')}
                    className="text-white hover:bg-white/10"
                  >
                    Source {getSortIcon('source')}
                  </Button>
                </TableHead>
                <TableHead className="text-white font-normal font-['Poppins']">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('status')}
                    className="text-white hover:bg-white/10"
                  >
                    Status {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead className="text-white font-normal font-['Poppins']">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('date')}
                    className="text-white hover:bg-white/10"
                  >
                    Date {getSortIcon('date')}
                  </Button>
                </TableHead>
                <TableHead className="text-white font-normal font-['Poppins']">Email</TableHead>
                <TableHead className="text-white font-normal font-['Poppins']">Mobile</TableHead>
                <TableHead className="text-white font-normal font-['Poppins']">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('assigned')}
                    className="text-white hover:bg-white/10"
                  >
                    Assigned {getSortIcon('assigned')}
                  </Button>
                </TableHead>
                <TableHead className="text-white font-normal font-['Poppins']">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('amount')}
                    className="text-white hover:bg-white/10"
                  >
                    Amount {getSortIcon('amount')}
                  </Button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="border-orange-600/20 hover:bg-orange-950/30 transition-colors"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                      className="border-orange-500 data-[state=checked]:bg-orange-500"
                    />
                  </TableCell>
                  <TableCell className="text-white font-normal font-['Poppins'] font-medium">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-white font-normal font-['Poppins']">
                    <Badge variant="outline" className="border-orange-600/50 text-orange-300">
                      {row.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusVariant(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white font-normal font-['Poppins']">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell className="text-white font-normal font-['Poppins'] text-sm">
                    {row.email}
                  </TableCell>
                  <TableCell className="text-white font-normal font-['Poppins'] text-sm">
                    {row.mobile}
                  </TableCell>
                  <TableCell className="text-white font-normal font-['Poppins']">
                    {row.assigned}
                  </TableCell>
                  <TableCell className="text-white font-normal font-['Poppins'] font-medium">
                    ₹{row.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-orange-600/20"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(row)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Toggle Status
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Empty state */}
          {paginatedData.length === 0 && (
            <div className="text-center py-8 text-white/50">
              <p>No data found matching your criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-orange-600/30">
              <div className="text-white/70 text-sm">
                Showing {startIndex + 1} to {Math.min(startIndex + tableState.itemsPerPage, processedData.length)} of {processedData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(tableState.currentPage - 1)}
                  disabled={tableState.currentPage === 1}
                  className="border-orange-600 text-white hover:bg-orange-600/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={tableState.currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(index + 1)}
                    className={
                      tableState.currentPage === index + 1
                        ? "bg-orange-600 text-white"
                        : "border-orange-600 text-white hover:bg-orange-600/20"
                    }
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(tableState.currentPage + 1)}
                  disabled={tableState.currentPage === totalPages}
                  className="border-orange-600 text-white hover:bg-orange-600/20"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
