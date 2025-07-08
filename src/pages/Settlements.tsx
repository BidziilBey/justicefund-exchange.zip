import React, { useState } from 'react'
import { motion } from 'framer-motion'
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

interface Settlement {
  id: string
  caseNumber: string
  title: string
  amount: string
  status: 'pending' | 'approved' | 'completed' | 'disputed'
  plaintiff: string
  defendant: string
  dateCreated: string
  dateUpdated: string
  description: string
  documents: number
}

const Settlements: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)

  const settlements: Settlement[] = [
    {
      id: '1',
      caseNumber: 'JF-2024-001',
      title: 'Personal Injury Settlement - Motor Vehicle Accident',
      amount: '$125,000',
      status: 'completed',
      plaintiff: 'John Smith',
      defendant: 'ABC Insurance Co.',
      dateCreated: '2024-01-10',
      dateUpdated: '2024-01-15',
      description: 'Settlement for injuries sustained in motor vehicle accident on Highway 101.',
      documents: 8
    },
    {
      id: '2',
      caseNumber: 'JF-2024-002',
      title: 'Medical Malpractice Settlement',
      amount: '$450,000',
      status: 'approved',
      plaintiff: 'Sarah Johnson',
      defendant: 'City General Hospital',
      dateCreated: '2024-01-12',
      dateUpdated: '2024-01-14',
      description: 'Settlement for medical malpractice resulting in permanent disability.',
      documents: 15
    },
    {
      id: '3',
      caseNumber: 'JF-2024-003',
      title: 'Workers Compensation Claim',
      amount: '$75,000',
      status: 'pending',
      plaintiff: 'Michael Brown',
      defendant: 'Construction Corp LLC',
      dateCreated: '2024-01-14',
      dateUpdated: '2024-01-14',
      description: 'Workers compensation claim for workplace injury.',
      documents: 6
    },
    {
      id: '4',
      caseNumber: 'JF-2024-004',
      title: 'Product Liability Settlement',
      amount: '$200,000',
      status: 'disputed',
      plaintiff: 'Emily Davis',
      defendant: 'TechCorp Industries',
      dateCreated: '2024-01-08',
      dateUpdated: '2024-01-13',
      description: 'Product liability case involving defective electronic device.',
      documents: 12
    }
  ]

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

  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch = settlement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         settlement.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         settlement.plaintiff.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || settlement.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: settlements.length,
    pending: settlements.filter(s => s.status === 'pending').length,
    approved: settlements.filter(s => s.status === 'approved').length,
    completed: settlements.filter(s => s.status === 'completed').length,
    disputed: settlements.filter(s => s.status === 'disputed').length,
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
          <Button>Create New Settlement</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <Card 
              className={`cursor-pointer transition-colors duration-200 ${
                statusFilter === status ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{status}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search settlements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="disputed">Disputed</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Settlements List */}
      <div className="space-y-4">
        {filteredSettlements.map((settlement, index) => (
          <motion.div
            key={settlement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="cursor-pointer" onClick={() => setSelectedSettlement(settlement)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{settlement.title}</h3>
                    <span className="text-sm text-gray-500">#{settlement.caseNumber}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{settlement.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">{settlement.amount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{settlement.plaintiff}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Updated {settlement.dateUpdated}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{settlement.documents} documents</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(settlement.status)}
                    <span className={getStatusBadge(settlement.status)}>
                      {settlement.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {filteredSettlements.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No settlements found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Create your first settlement to get started.'
                }
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Settlement Detail Modal */}
      {selectedSettlement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSettlement(null)}
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