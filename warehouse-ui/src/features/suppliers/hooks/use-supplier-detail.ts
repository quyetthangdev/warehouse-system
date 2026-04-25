import { useState, useEffect } from 'react'
import { api } from '@/services/axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { ImportForm } from '@/features/import-forms/types/import-form.types'

export function useSupplierDetail(supplierId: string | null) {
  const [transactions, setTransactions] = useState<ImportForm[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supplierId) {
      setTransactions([])
      return
    }
    setIsLoading(true)
    setError(null)
    api
      .get<ApiResponse<ImportForm[]>>(`/suppliers/${supplierId}/transactions`)
      .then(({ data: res }) => setTransactions(res.data))
      .catch(() => setError('Không thể tải lịch sử giao dịch'))
      .finally(() => setIsLoading(false))
  }, [supplierId])

  return { transactions, isLoading, error }
}
