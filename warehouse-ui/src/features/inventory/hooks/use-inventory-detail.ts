import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { InventoryDetail } from '../types/inventory.types'

export function useInventoryDetail(materialId: string) {
  const [detail, setDetail] = useState<InventoryDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get<ApiResponse<InventoryDetail>>(`/inventory/${materialId}`)
      setDetail(res.data)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể tải chi tiết tồn kho'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [materialId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { detail, isLoading, error }
}
