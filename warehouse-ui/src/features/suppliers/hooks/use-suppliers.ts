// warehouse-ui/src/features/suppliers/hooks/use-suppliers.ts
import { useState, useEffect, useCallback } from 'react'
import { supplierService } from '@/services/supplier.service'
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../types/supplier.types'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await supplierService.getAll()
      setSuppliers(res.data)
    } catch {
      setError('Không thể tải danh sách nhà cung cấp')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const createSupplier = useCallback(
    async (payload: CreateSupplierRequest): Promise<{ ok: boolean; message?: string }> => {
      try {
        await supplierService.create(payload)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không thể tạo nhà cung cấp'
        return { ok: false, message }
      }
    },
    [fetchAll],
  )

  const updateSupplier = useCallback(
    async (id: string, payload: UpdateSupplierRequest): Promise<{ ok: boolean; message?: string }> => {
      try {
        await supplierService.update(id, payload)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không thể cập nhật nhà cung cấp'
        return { ok: false, message }
      }
    },
    [fetchAll],
  )

  const removeSupplier = useCallback(
    async (id: string): Promise<{ ok: boolean; message?: string }> => {
      try {
        await supplierService.remove(id)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không thể xóa nhà cung cấp'
        return { ok: false, message }
      }
    },
    [fetchAll],
  )

  return { suppliers, isLoading, error, createSupplier, updateSupplier, removeSupplier }
}
