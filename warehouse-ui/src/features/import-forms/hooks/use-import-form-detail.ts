import { useState, useEffect, useCallback } from 'react'
import { importFormService } from '@/services/import-form.service'
import type { ImportForm } from '../types/import-form.types'
import type { ImportFormItemValues } from '../schemas/import-form.schema'

type MutationResult = { ok: boolean; message?: string }

function extractMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  )
}

export function useImportFormDetail(id: string) {
  const [form, setForm] = useState<ImportForm | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await importFormService.getById(id)
      setForm(res.data)
    } catch {
      setError('Không thể tải thông tin phiếu nhập')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const cancelForm = useCallback(async (): Promise<MutationResult> => {
    try {
      await importFormService.cancel(id)
      await fetchDetail()
      return { ok: true }
    } catch (err) {
      return { ok: false, message: extractMessage(err, 'Không thể hủy phiếu nhập') }
    }
  }, [id, fetchDetail])

  const confirmForm = useCallback(async (): Promise<MutationResult> => {
    try {
      await importFormService.confirm(id)
      await fetchDetail()
      return { ok: true }
    } catch (err) {
      return { ok: false, message: extractMessage(err, 'Không thể xác nhận phiếu nhập') }
    }
  }, [id, fetchDetail])

  const addItem = useCallback(async (item: ImportFormItemValues): Promise<MutationResult> => {
    try {
      await importFormService.addItem(id, item)
      await fetchDetail()
      return { ok: true }
    } catch (err) {
      return { ok: false, message: extractMessage(err, 'Không thể thêm sản phẩm') }
    }
  }, [id, fetchDetail])

  return { form, isLoading, error, cancelForm, confirmForm, addItem }
}
