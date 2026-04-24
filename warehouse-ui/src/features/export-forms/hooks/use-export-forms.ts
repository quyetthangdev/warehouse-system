import { useState, useEffect, useCallback } from 'react'
import { exportFormService } from '@/services/export-form.service'
import type { ExportForm } from '../types/export-form.types'
import type { ExportFormValues } from '../schemas/export-form.schema'

type MutationResult = { ok: boolean; message?: string }

function extractMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  )
}

export function useExportForms() {
  const [forms, setForms] = useState<ExportForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await exportFormService.getAll()
      setForms(res.data)
    } catch {
      setError('Không thể tải danh sách phiếu xuất')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const createForm = useCallback(
    async (payload: ExportFormValues): Promise<MutationResult> => {
      try {
        await exportFormService.create(payload)
        await fetchAll()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractMessage(err, 'Không thể tạo phiếu xuất') }
      }
    },
    [fetchAll],
  )

  const updateForm = useCallback(
    async (id: string, payload: Partial<ExportFormValues>): Promise<MutationResult> => {
      try {
        await exportFormService.update(id, payload)
        await fetchAll()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractMessage(err, 'Không thể cập nhật phiếu xuất') }
      }
    },
    [fetchAll],
  )

  const cancelForm = useCallback(
    async (id: string): Promise<MutationResult> => {
      try {
        await exportFormService.cancel(id)
        await fetchAll()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractMessage(err, 'Không thể hủy phiếu xuất') }
      }
    },
    [fetchAll],
  )

  return { forms, isLoading, error, createForm, updateForm, cancelForm }
}
