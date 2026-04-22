import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '@/features/suppliers/types/supplier.types'

export const supplierService = {
  getAll() {
    return api.get<ApiResponse<Supplier[]>>('/suppliers')
  },

  create(payload: CreateSupplierRequest) {
    return api.post<ApiResponse<Supplier>>('/suppliers', payload)
  },

  update(id: string, payload: UpdateSupplierRequest) {
    return api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, payload)
  },

  remove(id: string) {
    return api.delete<ApiResponse<void>>(`/suppliers/${id}`)
  },
}
