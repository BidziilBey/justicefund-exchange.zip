export interface Settlement {
  id: string
  caseNumber: string
  title: string
  amount: string
  status: SettlementStatus
  plaintiff: string
  defendant: string
  dateCreated: string
  dateUpdated: string
  description: string
  documents: Document[]
  timeline: TimelineEvent[]
  metadata: SettlementMetadata
}

export type SettlementStatus = 'pending' | 'approved' | 'completed' | 'disputed' | 'cancelled' | 'rejected'

export interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  status: 'pending' | 'verified' | 'rejected'
  hash: string
  notaryInfo?: NotaryInfo
  url?: string
}

export interface NotaryInfo {
  name: string
  license: string
  state: string
  expiration: string
  seal?: string
}

export interface TimelineEvent {
  id: string
  type: 'created' | 'status_change' | 'document_added' | 'funds_deposited' | 'funds_released' | 'comment_added'
  title: string
  description: string
  timestamp: string
  actor: string
  metadata?: Record<string, any>
}

export interface SettlementMetadata {
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  estimatedResolutionDate?: string
  legalRepresentation?: {
    plaintiff: LegalRepresentative
    defendant: LegalRepresentative
  }
}

export interface LegalRepresentative {
  name: string
  firm: string
  barNumber: string
  email: string
  phone: string
}

export interface User {
  id: string
  address: string
  profile: UserProfile
  kyc: KYCStatus
  permissions: UserPermissions
  preferences: UserPreferences
}

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: Address
  avatar?: string
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface KYCStatus {
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  level: 'basic' | 'enhanced' | 'premium'
  verifiedAt?: string
  expiresAt?: string
  documents: KYCDocument[]
  riskScore?: number
}

export interface KYCDocument {
  type: 'id_front' | 'id_back' | 'selfie' | 'proof_of_address' | 'bank_statement'
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
  reviewedAt?: string
  rejectionReason?: string
}

export interface UserPermissions {
  canCreateSettlements: boolean
  canViewAllSettlements: boolean
  canApproveSettlements: boolean
  canManageUsers: boolean
  canAccessAnalytics: boolean
}

export interface UserPreferences {
  notifications: NotificationPreferences
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  settlementUpdates: boolean
  documentVerification: boolean
  securityAlerts: boolean
  marketingEmails: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: {
    timestamp: string
    requestId: string
    version: string
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  stack?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface FilterOptions {
  status?: SettlementStatus[]
  dateRange?: {
    start: string
    end: string
  }
  amountRange?: {
    min: number
    max: number
  }
  category?: string[]
  priority?: string[]
  search?: string
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface ContractConfig {
  address: string
  abi: any[]
  network: string
  gasLimit: number
  gasPrice?: string
}

export interface TransactionStatus {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  confirmations: number
  gasUsed?: number
  effectiveGasPrice?: string
  blockNumber?: number
  timestamp?: string
}