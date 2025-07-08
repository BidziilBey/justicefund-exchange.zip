import { z } from 'zod'

// Settlement validation schemas
export const settlementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    },
    'Amount must be a positive number'
  ),
  defendant: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  caseNumber: z.string().min(1, 'Case number is required').max(50, 'Case number must be less than 50 characters'),
  category: z.enum(['personal_injury', 'medical_malpractice', 'workers_compensation', 'product_liability', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
})

// User profile validation schemas
export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().min(1, 'Country is required')
  })
})

// KYC validation schemas
export const kycSchema = z.object({
  idType: z.enum(['passport', 'drivers_license', 'national_id']),
  idNumber: z.string().min(1, 'ID number is required'),
  dateOfBirth: z.string().refine(
    (val) => {
      const date = new Date(val)
      const now = new Date()
      const age = now.getFullYear() - date.getFullYear()
      return age >= 18 && age <= 120
    },
    'Must be between 18 and 120 years old'
  )
})

// Document validation schemas
export const documentSchema = z.object({
  type: z.enum(['settlement_agreement', 'medical_records', 'insurance_claim', 'court_order', 'power_of_attorney', 'other']),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  notaryInfo: z.object({
    name: z.string().min(1, 'Notary name is required'),
    license: z.string().min(1, 'License number is required'),
    state: z.string().min(1, 'State is required'),
    expiration: z.string().refine(
      (val) => new Date(val) > new Date(),
      'Notary commission must not be expired'
    )
  }).optional()
})

// Validation helper functions
export const validateFile = (file: File, options: {
  maxSize?: number
  allowedTypes?: string[]
  maxFiles?: number
}) => {
  const errors: string[] = []
  
  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`File size must be less than ${formatFileSize(options.maxSize)}`)
  }
  
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${options.allowedTypes.join(', ')}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export const validateAmount = (amount: string): { isValid: boolean; error?: string } => {
  const num = parseFloat(amount)
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Amount must be a number' }
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Amount must be positive' }
  }
  
  if (num > 1000000000) {
    return { isValid: false, error: 'Amount is too large' }
  }
  
  return { isValid: true }
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatCurrency = (amount: string | number, currency: string = 'USD'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  switch (format) {
    case 'long':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    case 'relative':
      const now = new Date()
      const diff = now.getTime() - d.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return 'Today'
      if (days === 1) return 'Yesterday'
      if (days < 7) return `${days} days ago`
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`
      if (days < 365) return `${Math.floor(days / 30)} months ago`
      return `${Math.floor(days / 365)} years ago`
    default:
      return d.toLocaleDateString('en-US')
  }
}

// Form validation hook
export const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
  const validate = (data: unknown): { isValid: boolean; errors: Record<string, string>; data?: T } => {
    try {
      const validatedData = schema.parse(data)
      return { isValid: true, errors: {}, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        return { isValid: false, errors }
      }
      return { isValid: false, errors: { general: 'Validation failed' } }
    }
  }
  
  return { validate }
}