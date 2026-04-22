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

  async function createSupplier(payload: CreateSupplierRequest): Promise<boolean> {
    try {
      await supplierService.create(payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function updateSupplier(id: string, payload: UpdateSupplierRequest): Promise<boolean> {
    try {
      await supplierService.update(id, payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function removeSupplier(id: string): Promise<{ ok: boolean; message?: string }> {
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
  }

  return { suppliers, isLoading, error, createSupplier, updateSupplier, removeSupplier }
}
