import { useState, useEffect, useCallback } from 'react'
import { exportFormService } from '@/services/export-form.service'
import type { ExportForm } from '../types/export-form.types'
import type { ExportFormItemValues } from '../schemas/export-form.schema'

type MutationResult = { ok: boolean; message?: string }

function extractMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  )
}

export function useExportFormDetail(id: string) {
  const [form, setForm] = useState<ExportForm | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await exportFormService.getById(id)
      setForm(res.data)
    } catch {
      setError('Không thể tải thông tin phiếu xuất')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const confirmForm = useCallback(async (): Promise<MutationResult> => {
    try {
      await exportFormService.confirm(id)
      await fetchDetail()
      return { ok: true }
    } catch (err) {
      return { ok: false, message: extractMessage(err, 'Không thể xác nhận phiếu xuất') }
    }
  }, [id, fetchDetail])

  const cancelForm = useCallback(async (): Promise<MutationResult> => {
    try {
      await exportFormService.cancel(id)
      await fetchDetail()
      return { ok: true }
    } catch (err) {
      return { ok: false, message: extractMessage(err, 'Không thể hủy phiếu xuất') }
    }
  }, [id, fetchDetail])

  const addItem = useCallback(async (item: ExportFormItemValues): Promise<MutationResult> => {
    try {
      await exportFormService.addItem(id, item)
      await fetchDetail()
      return { ok: true }
    } catch (err) {
      return { ok: false, message: extractMessage(err, 'Không thể thêm sản phẩm') }
    }
  }, [id, fetchDetail])

  return { form, isLoading, error, confirmForm, cancelForm, addItem }
}
