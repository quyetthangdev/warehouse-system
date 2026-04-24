import { useState, useEffect, useCallback } from 'react'
import { importFormService } from '@/services/import-form.service'
import type { ImportForm } from '../types/import-form.types'
import type { ImportFormValues } from '../schemas/import-form.schema'

type MutationResult = { ok: boolean; message?: string }

function extractMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  )
}

export function useImportForms() {
  const [forms, setForms] = useState<ImportForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await importFormService.getAll()
      setForms(res.data)
    } catch {
      setError('Không thể tải danh sách phiếu nhập')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const createForm = useCallback(
    async (payload: ImportFormValues): Promise<MutationResult> => {
      try {
        await importFormService.create(payload)
        await fetchAll()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractMessage(err, 'Không thể tạo phiếu nhập') }
      }
    },
    [fetchAll],
  )

  const updateForm = useCallback(
    async (id: string, payload: Partial<ImportFormValues>): Promise<MutationResult> => {
      try {
        await importFormService.update(id, payload)
        await fetchAll()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractMessage(err, 'Không thể cập nhật phiếu nhập') }
      }
    },
    [fetchAll],
  )

  const cancelForm = useCallback(
    async (id: string): Promise<MutationResult> => {
      try {
        await importFormService.cancel(id)
        await fetchAll()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: extractMessage(err, 'Không thể hủy phiếu nhập') }
      }
    },
    [fetchAll],
  )

  return { forms, isLoading, error, createForm, updateForm, cancelForm }
}
