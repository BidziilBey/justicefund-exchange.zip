import { useState, useEffect, useCallback } from 'react'
import { Settlement, FilterOptions, SortOptions, PaginatedResponse } from '../types'
import { settlementsApi } from '../services/api'
import { useToast } from './useToast'

export const useSettlements = (
  filters?: FilterOptions,
  sort?: SortOptions,
  page: number = 1,
  limit: number = 10
) => {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const { showToast } = useToast()

  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await settlementsApi.getSettlements({
        filters,
        sort,
        page,
        limit
      })

      if (response.success && response.data) {
        setSettlements(response.data.items)
        setPagination(response.data.pagination)
      } else {
        throw new Error(response.error?.message || 'Failed to fetch settlements')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      showToast('Error fetching settlements', 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, sort, page, limit, showToast])

  const createSettlement = useCallback(async (settlementData: Partial<Settlement>) => {
    try {
      setLoading(true)
      const response = await settlementsApi.createSettlement(settlementData)
      
      if (response.success && response.data) {
        setSettlements(prev => [response.data!, ...prev])
        showToast('Settlement created successfully', 'success')
        return response.data
      } else {
        throw new Error(response.error?.message || 'Failed to create settlement')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create settlement'
      showToast(errorMessage, 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const updateSettlement = useCallback(async (id: string, updates: Partial<Settlement>) => {
    try {
      const response = await settlementsApi.updateSettlement(id, updates)
      
      if (response.success && response.data) {
        setSettlements(prev => 
          prev.map(settlement => 
            settlement.id === id ? { ...settlement, ...response.data } : settlement
          )
        )
        showToast('Settlement updated successfully', 'success')
        return response.data
      } else {
        throw new Error(response.error?.message || 'Failed to update settlement')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settlement'
      showToast(errorMessage, 'error')
      throw err
    }
  }, [showToast])

  const deleteSettlement = useCallback(async (id: string) => {
    try {
      const response = await settlementsApi.deleteSettlement(id)
      
      if (response.success) {
        setSettlements(prev => prev.filter(settlement => settlement.id !== id))
        showToast('Settlement deleted successfully', 'success')
      } else {
        throw new Error(response.error?.message || 'Failed to delete settlement')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete settlement'
      showToast(errorMessage, 'error')
      throw err
    }
  }, [showToast])

  useEffect(() => {
    fetchSettlements()
  }, [fetchSettlements])

  return {
    settlements,
    loading,
    error,
    pagination,
    refetch: fetchSettlements,
    createSettlement,
    updateSettlement,
    deleteSettlement
  }
}