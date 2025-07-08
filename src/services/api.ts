import { Settlement, User, Document, FilterOptions, SortOptions, PaginatedResponse, ApiResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      }

      // Add auth token if available
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: response.headers.get('x-request-id') || '',
          version: response.headers.get('x-api-version') || '1.0'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { endpoint, options }
        }
      }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return this.request<T>(url.pathname + url.search)
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

const apiClient = new ApiClient(API_BASE_URL)

// Settlements API
export const settlementsApi = {
  async getSettlements(params: {
    filters?: FilterOptions
    sort?: SortOptions
    page?: number
    limit?: number
  }): Promise<ApiResponse<PaginatedResponse<Settlement>>> {
    return apiClient.get('/settlements', params)
  },

  async getSettlement(id: string): Promise<ApiResponse<Settlement>> {
    return apiClient.get(`/settlements/${id}`)
  },

  async createSettlement(data: Partial<Settlement>): Promise<ApiResponse<Settlement>> {
    return apiClient.post('/settlements', data)
  },

  async updateSettlement(id: string, data: Partial<Settlement>): Promise<ApiResponse<Settlement>> {
    return apiClient.patch(`/settlements/${id}`, data)
  },

  async deleteSettlement(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/settlements/${id}`)
  },

  async getSettlementTimeline(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/settlements/${id}/timeline`)
  },

  async addSettlementComment(id: string, comment: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/settlements/${id}/comments`, { comment })
  }
}

// Users API
export const usersApi = {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get('/users/me')
  },

  async updateProfile(data: Partial<User['profile']>): Promise<ApiResponse<User>> {
    return apiClient.patch('/users/me/profile', data)
  },

  async updatePreferences(data: Partial<User['preferences']>): Promise<ApiResponse<User>> {
    return apiClient.patch('/users/me/preferences', data)
  },

  async getKYCStatus(): Promise<ApiResponse<User['kyc']>> {
    return apiClient.get('/users/me/kyc')
  },

  async submitKYC(data: any): Promise<ApiResponse<User['kyc']>> {
    return apiClient.post('/users/me/kyc', data)
  }
}

// Documents API
export const documentsApi = {
  async uploadDocument(file: File, metadata: any): Promise<ApiResponse<Document>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify(metadata))

    return apiClient.request('/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
  },

  async getDocument(id: string): Promise<ApiResponse<Document>> {
    return apiClient.get(`/documents/${id}`)
  },

  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/documents/${id}`)
  },

  async verifyDocument(id: string): Promise<ApiResponse<Document>> {
    return apiClient.post(`/documents/${id}/verify`)
  }
}

// Analytics API
export const analyticsApi = {
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/analytics/dashboard')
  },

  async getSettlementAnalytics(params: any): Promise<ApiResponse<any>> {
    return apiClient.get('/analytics/settlements', params)
  }
}

export default apiClient