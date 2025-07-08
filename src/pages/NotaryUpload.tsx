import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Plus
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Label from '../components/ui/Label'

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  status: 'pending' | 'verified' | 'rejected'
  notaryInfo?: {
    name: string
    license: string
    state: string
  }
}

const NotaryUpload: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Settlement Agreement #2847',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      status: 'verified',
      notaryInfo: {
        name: 'Sarah Johnson',
        license: 'NY123456',
        state: 'New York'
      }
    },
    {
      id: '2',
      name: 'Medical Records Summary',
      type: 'PDF',
      size: '1.8 MB',
      uploadDate: '2024-01-14',
      status: 'pending'
    }
  ])

  const [isUploading, setIsUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    documentType: '',
    description: '',
    notaryName: '',
    notaryLicense: '',
    notaryState: '',
    notaryExpiration: ''
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true)
      
      // Simulate upload process
      setTimeout(() => {
        const newDoc: Document = {
          id: Date.now().toString(),
          name: e.target.files![0].name,
          type: e.target.files![0].type.split('/')[1].toUpperCase(),
          size: `${(e.target.files![0].size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          notaryInfo: {
            name: uploadForm.notaryName,
            license: uploadForm.notaryLicense,
            state: uploadForm.notaryState
          }
        }
        
        setDocuments([newDoc, ...documents])
        setIsUploading(false)
        setUploadForm({
          documentType: '',
          description: '',
          notaryName: '',
          notaryLicense: '',
          notaryState: '',
          notaryExpiration: ''
        })
      }, 2000)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUploadForm({
      ...uploadForm,
      [e.target.name]: e.target.value
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'status-badge'
    switch (status) {
      case 'verified':
        return `${baseClasses} status-approved`
      case 'pending':
        return `${baseClasses} status-pending`
      case 'rejected':
        return `${baseClasses} status-rejected`
      default:
        return baseClasses
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notarized Document Upload</h1>
        <p className="mt-2 text-gray-600">
          Upload and manage your notarized legal documents for settlement processing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload New Document</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Document Type</Label>
                <select
                  name="documentType"
                  value={uploadForm.documentType}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                >
                  <option value="">Select document type</option>
                  <option value="settlement_agreement">Settlement Agreement</option>
                  <option value="medical_records">Medical Records</option>
                  <option value="insurance_claim">Insurance Claim</option>
                  <option value="court_order">Court Order</option>
                  <option value="power_of_attorney">Power of Attorney</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field mt-1 resize-none"
                  placeholder="Brief description of the document..."
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Notary Information</h3>
                
                <div className="space-y-3">
                  <Input
                    label="Notary Name"
                    name="notaryName"
                    value={uploadForm.notaryName}
                    onChange={handleInputChange}
                    placeholder="Full name of notary"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="License Number"
                      name="notaryLicense"
                      value={uploadForm.notaryLicense}
                      onChange={handleInputChange}
                      placeholder="License #"
                    />
                    
                    <div>
                      <Label>State</Label>
                      <select
                        name="notaryState"
                        value={uploadForm.notaryState}
                        onChange={handleInputChange}
                        className="input-field mt-1"
                      >
                        <option value="">Select state</option>
                        <option value="NY">New York</option>
                        <option value="CA">California</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        {/* Add more states as needed */}
                      </select>
                    </div>
                  </div>
                  
                  <Input
                    label="Commission Expiration"
                    name="notaryExpiration"
                    type="date"
                    value={uploadForm.notaryExpiration}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label>Upload Document</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                loading={isUploading}
                disabled={!uploadForm.documentType || !uploadForm.notaryName}
              >
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Document List */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Uploaded Documents</h2>
              <span className="text-sm text-gray-500">{documents.length} documents</span>
            </div>

            <div className="space-y-4">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Uploaded {doc.uploadDate}</span>
                        </div>
                        {doc.notaryInfo && (
                          <div className="mt-2 text-xs text-gray-600">
                            <p>Notarized by: {doc.notaryInfo.name}</p>
                            <p>License: {doc.notaryInfo.license} ({doc.notaryInfo.state})</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(doc.status)}
                        <span className={getStatusBadge(doc.status)}>
                          {doc.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {documents.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload your first notarized document to get started.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Requirements Card */}
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Requirements</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Documents must be notarized by a licensed notary public</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>File formats: PDF, DOC, DOCX (max 10MB)</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>All text must be clearly legible and complete</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Notary seal and signature must be visible</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Documents are verified within 24-48 hours</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NotaryUpload