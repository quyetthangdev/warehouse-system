import { useState, useEffect, useCallback } from 'react'
import { balanceFormService } from '@/services/balance-form.service'
import type { BalanceForm, BalanceFormItem } from '../types/balance-form.types'

type MutationResult = { ok: boolean; message?: string }

function extractMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  )
}

export function useBalanceFormDetail(id: string) {
  const [form, setForm] = useState<BalanceForm | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDetail = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: res } = await balanceFormService.getById(id)
      setForm(res.data)
    } catch {
      setForm(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const startForm = useCallback(async (): Promise<MutationResult> => {
    try {
      const { data: res } = await balanceFormService.start(id)
      setForm(res.data)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: extractMessage(err, 'Không thể bắt đầu kiểm kho') }
    }
  }, [id])

  const completeForm = useCallback(
    async (items: BalanceFormItem[]): Promise<MutationResult> => {
      try {
        const { data: res } = await balanceFormService.complete(id, items)
        setForm(res.data)
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractMessage(err, 'Không thể hoàn thành kiểm kho') }
      }
    },
    [id],
  )

  const cancelForm = useCallback(async (): Promise<MutationResult> => {
    try {
      const { data: res } = await balanceFormService.cancel(id)
      setForm(res.data)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: extractMessage(err, 'Không thể hủy phiếu kiểm') }
    }
  }, [id])

  return { form, isLoading, startForm, completeForm, cancelForm }
}
