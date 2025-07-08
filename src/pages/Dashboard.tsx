import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  FileCheck, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Settlements',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: FileCheck,
    },
    {
      name: 'Active Cases',
      value: '156',
      change: '+4.3%',
      changeType: 'positive',
      icon: Clock,
    },
    {
      name: 'Settlement Value',
      value: '$12.4M',
      change: '+8.2%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: 'Verified Users',
      value: '1,234',
      change: '+15.1%',
      changeType: 'positive',
      icon: Users,
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'settlement',
      title: 'Personal Injury Settlement #2847',
      amount: '$45,000',
      status: 'completed',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'kyc',
      title: 'KYC Verification Approved',
      user: 'John Smith',
      status: 'approved',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'document',
      title: 'Notarized Document Uploaded',
      document: 'Settlement Agreement #2846',
      status: 'pending',
      time: '6 hours ago',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'status-badge'
    switch (status) {
      case 'completed':
      case 'approved':
        return `${baseClasses} status-approved`
      case 'pending':
        return `${baseClasses} status-pending`
      default:
        return `${baseClasses} status-rejected`
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to JusticeFund Exchange - Your blockchain settlement platform
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link to="/settlements">
            <Button variant="outline">View All Settlements</Button>
          </Link>
          <Link to="/kyc">
            <Button>Start KYC Process</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card hover>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link to="/settlements" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {activity.amount && (
                      <span className="text-sm font-semibold text-gray-900">{activity.amount}</span>
                    )}
                    <span className={getStatusBadge(activity.status)}>
                      {activity.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link to="/kyc" className="block">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-600 rounded-lg">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Complete KYC</p>
                      <p className="text-xs text-gray-500">Verify your identity</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary-600" />
                </motion.div>
              </Link>

              <Link to="/notary" className="block">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-justice-50 rounded-lg hover:bg-justice-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-justice-600 rounded-lg">
                      <FileCheck className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Upload Documents</p>
                      <p className="text-xs text-gray-500">Submit notarized files</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-justice-600" />
                </motion.div>
              </Link>

              <Link to="/settlements" className="block">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">View Settlements</p>
                      <p className="text-xs text-gray-500">Track your cases</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </motion.div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard