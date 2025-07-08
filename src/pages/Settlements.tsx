import React, { useState } from 'react'
import { motion } from 'framer-motion'
import DataTable, { Column } from '../components/ui/DataTable'
import { useSettlements } from '../hooks/useSettlements'
import { Settlement, FilterOptions, SortOptions } from '../types'
import { 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { formatCurrency, formatDate } from '../utils/validation'

const Settlements: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sort, setSort] = useState<SortOptions>({ field: 'dateUpdated', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { 
    settlements, 
    loading, 
    error, 
    pagination, 
    createSettlement,
    updateSettlement,
    deleteSettlement 
  } = useSettlements(filters, sort, page, limit)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'disputed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'status-badge'
    switch (status) {
      case 'completed':
        return `${baseClasses} status-approved`
      case 'approved':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'pending':
        return `${baseClasses} status-pending`
      case 'disputed':
        return `${baseClasses} status-rejected`
      default:
        return baseClasses
    }
  }

  const columns: Column<Settlement>[] = [
    {
      key: 'caseNumber',
      title: 'Case Number',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => setSelectedSettlement(row)}
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          {value}
        </button>
      )
    },
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={getStatusBadge(value)}>
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'plaintiff',
      title: 'Plaintiff',
      sortable: true,
      filterable: true
    },
    {
      key: 'dateUpdated',
      title: 'Last Updated',
      sortable: true,
      render: (value) => formatDate(value, 'relative')
    }
  ]

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSort({ field, direction })
  }

  const handleFilterChange = (value: string) => {
    setFilters({ ...filters, search: value })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settlements</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your legal settlements and claims
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setShowCreateModal(true)}>
            Create New Settlement
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={settlements}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          limit,
          total: pagination.total,
          onPageChange: setPage,
          onLimitChange: setLimit
        }}
        sorting={{
          field: sort.field,
          direction: sort.direction,
          onSort: handleSort
        }}
        filtering={{
          value: filters.search || '',
          onChange: handleFilterChange
        }}
        actions={[
          {
            label: 'View',
            onClick: (row) => setSelectedSettlement(row),
            icon: <Eye className="h-4 w-4 mr-1" />,
            variant: 'ghost'
          },
          {
            label: 'Download',
            onClick: (row) => console.log('Download', row),
            icon: <Download className="h-4 w-4 mr-1" />,
            variant: 'ghost'
          }
        ]}
        emptyState={
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No settlements found</h3>
            <p className="mt-1 text-gray-500">
              Create your first settlement to get started.
            </p>
            <Button 
              className="mt-4"
              onClick={() => setShowCreateModal(true)}
            >
              Create Settlement
            </Button>
          </div>
        }
      />

      {/* Settlement Detail Modal */}
      <Modal
        isOpen={!!selectedSettlement}
        onClose={() => setSelectedSettlement(null)}
        title={selectedSettlement?.title}
        size="lg"
      >
        {selectedSettlement && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Settlement Amount</h3>
                <p className="text-2xl font-semibold text-green-600">
                  {formatCurrency(selectedSettlement.amount)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedSettlement.status)}
                  <span className={getStatusBadge(selectedSettlement.status)}>
                    {selectedSettlement.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{selectedSettlement.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Plaintiff</h3>
                <p className="text-gray-600">{selectedSettlement.plaintiff}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Defendant</h3>
                <p className="text-gray-600">{selectedSettlement.defendant}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Created</h3>
                <p className="text-gray-600">{formatDate(selectedSettlement.dateCreated, 'long')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Last Updated</h3>
                <p className="text-gray-600">{formatDate(selectedSettlement.dateUpdated, 'long')}</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
          <Button variant="outline">Download Report</Button>
          <Button>View Documents</Button>
        </div>
      </Modal>

      {/* Create Settlement Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Settlement"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Settlement Title"
            placeholder="Enter settlement title..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Case Number"
              placeholder="JF-2024-XXX"
            />
            <Input
              label="Settlement Amount"
              placeholder="0.00"
              type="number"
            />
          </div>
          <Input
            label="Defendant Address"
            placeholder="0x..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              className="input-field resize-none"
              placeholder="Describe the settlement..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowCreateModal(false)}>
            Create Settlement
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Settlements
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedSettlement.title}</h2>
                  <p className="text-gray-600">Case #{selectedSettlement.caseNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedSettlement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Settlement Amount</h3>
                    <p className="text-2xl font-semibold text-green-600">{selectedSettlement.amount}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedSettlement.status)}
                      <span className={getStatusBadge(selectedSettlement.status)}>
                        {selectedSettlement.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedSettlement.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Plaintiff</h3>
                    <p className="text-gray-600">{selectedSettlement.plaintiff}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Defendant</h3>
                    <p className="text-gray-600">{selectedSettlement.defendant}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Created</h3>
                    <p className="text-gray-600">{selectedSettlement.dateCreated}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Last Updated</h3>
                    <p className="text-gray-600">{selectedSettlement.dateUpdated}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline">Download Report</Button>
                  <Button>View Documents</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Settlements