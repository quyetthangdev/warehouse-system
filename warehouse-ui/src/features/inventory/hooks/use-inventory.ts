import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { InventoryItem } from '../types/inventory.types'

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get<ApiResponse<InventoryItem[]>>('/inventory')
      setItems(res.data)
    } catch {
      setError('Không thể tải dữ liệu tồn kho')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { items, isLoading, error }
}
