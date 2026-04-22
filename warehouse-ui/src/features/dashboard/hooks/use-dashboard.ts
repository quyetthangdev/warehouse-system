import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { DashboardData } from '../types/dashboard.types'

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get<ApiResponse<DashboardData>>('/dashboard')
      setData(res.data)
    } catch {
      setError('Không thể tải dữ liệu dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
