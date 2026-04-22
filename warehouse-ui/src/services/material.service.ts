import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { Material, CreateMaterialRequest, UpdateMaterialRequest } from '@/features/materials/types/material.types'

export const materialService = {
  getAll() {
    return api.get<ApiResponse<Material[]>>('/materials')
  },

  create(payload: CreateMaterialRequest) {
    return api.post<ApiResponse<Material>>('/materials', payload)
  },

  update(id: string, payload: UpdateMaterialRequest) {
    return api.put<ApiResponse<Material>>(`/materials/${id}`, payload)
  },

  remove(id: string) {
    return api.delete<ApiResponse<void>>(`/materials/${id}`)
  },
}
