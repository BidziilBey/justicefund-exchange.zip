import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react'
import Button from './Button'
import Input from './Input'
import LoadingSpinner from './LoadingSpinner'

export interface Column<T> {
  key: keyof T | string
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
  }
  sorting?: {
    field: string
    direction: 'asc' | 'desc'
    onSort: (field: string, direction: 'asc' | 'desc') => void
  }
  filtering?: {
    value: string
    onChange: (value: string) => void
  }
  selection?: {
    selectedRows: T[]
    onSelectionChange: (rows: T[]) => void
    getRowId: (row: T) => string
  }
  actions?: {
    label: string
    onClick: (row: T) => void
    icon?: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  }[]
  emptyState?: React.ReactNode
  className?: string
}

function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  filtering,
  selection,
  actions,
  emptyState,
  className = ''
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState('')

  const filteredData = useMemo(() => {
    if (!filtering && !localSearch) return data

    const searchTerm = (filtering?.value || localSearch).toLowerCase()
    if (!searchTerm) return data

    return data.filter(row =>
      columns.some(column => {
        if (!column.filterable && !filtering) return false
        const value = row[column.key as keyof T]
        return String(value).toLowerCase().includes(searchTerm)
      })
    )
  }, [data, columns, filtering?.value, localSearch])

  const handleSort = (field: string) => {
    if (!sorting) return
    
    const newDirection = 
      sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc'
    sorting.onSort(field, newDirection)
  }

  const handleSelectAll = (checked: boolean) => {
    if (!selection) return
    
    if (checked) {
      selection.onSelectionChange(filteredData)
    } else {
      selection.onSelectionChange([])
    }
  }

  const handleSelectRow = (row: T, checked: boolean) => {
    if (!selection) return
    
    const rowId = selection.getRowId(row)
    const currentSelection = selection.selectedRows
    
    if (checked) {
      selection.onSelectionChange([...currentSelection, row])
    } else {
      selection.onSelectionChange(
        currentSelection.filter(r => selection.getRowId(r) !== rowId)
      )
    }
  }

  const isRowSelected = (row: T): boolean => {
    if (!selection) return false
    const rowId = selection.getRowId(row)
    return selection.selectedRows.some(r => selection.getRowId(r) === rowId)
  }

  const allSelected = selection ? 
    filteredData.length > 0 && filteredData.every(row => isRowSelected(row)) : false
  const someSelected = selection ? 
    selection.selectedRows.length > 0 && !allSelected : false

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {(filtering || !filtering) && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={filtering?.value || localSearch}
                  onChange={(e) => {
                    if (filtering) {
                      filtering.onChange(e.target.value)
                    } else {
                      setLocalSearch(e.target.value)
                    }
                  }}
                  className="pl-10 w-64"
                />
              </div>
            )}
            
            {selection && selection.selectedRows.length > 0 && (
              <span className="text-sm text-gray-600">
                {selection.selectedRows.length} selected
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selection && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                      if (input) input.indeterminate = someSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(String(column.key))}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>{column.title}</span>
                      {sorting?.field === column.key && (
                        sorting.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
              
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selection ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center"
                >
                  {emptyState || (
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No data found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <motion.tr
                  key={selection ? selection.getRowId(row) : index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  {selection && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={(e) => handleSelectRow(row, e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {column.render ? 
                        column.render(row[column.key as keyof T], row, index) :
                        String(row[column.key as keyof T] || '')
                      }
                    </td>
                  ))}
                  
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant={action.variant || 'ghost'}
                            size="sm"
                            onClick={() => action.onClick(row)}
                          >
                            {action.icon}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={pagination.limit}
                onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">
                of {pagination.total} results
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable