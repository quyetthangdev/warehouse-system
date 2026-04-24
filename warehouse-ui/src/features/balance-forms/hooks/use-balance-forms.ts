import { useState, useEffect, useCallback } from 'react'
import { balanceFormService } from '@/services/balance-form.service'
import type { BalanceForm } from '../types/balance-form.types'
import type { BalanceFormValues } from '../schemas/balance-form.schema'

type MutationResult = { ok: boolean; message?: string }

function extractMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  )
}

export function useBalanceForms() {
  const [forms, setForms] = useState<BalanceForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await balanceFormService.getAll()
      setForms(res.data)
    } catch {
      setError('Không thể tải danh sách phiếu kiểm')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const createForm = useCallback(
    async (payload: BalanceFormValues): Promise<MutationResult> => {
      try {
        await balanceFormService.create(payload)
        await fetchAll()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractMessage(err, 'Không thể tạo phiếu kiểm') }
      }
    },
    [fetchAll],
  )

  const cancelForm = useCallback(
    async (id: string): Promise<MutationResult> => {
      try {
        await balanceFormService.cancel(id)
        await fetchAll()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractMessage(err, 'Không thể hủy phiếu kiểm') }
      }
    },
    [fetchAll],
  )

  return { forms, isLoading, error, createForm, cancelForm }
}
