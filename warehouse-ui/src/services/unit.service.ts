import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '@/features/units/types/unit.types'

export const unitService = {
  getAll() {
    return api.get<ApiResponse<Unit[]>>('/units')
  },

  create(payload: CreateUnitRequest) {
    return api.post<ApiResponse<Unit>>('/units', payload)
  },

  update(id: string, payload: UpdateUnitRequest) {
    return api.put<ApiResponse<Unit>>(`/units/${id}`, payload)
  },

  remove(id: string) {
    return api.delete<ApiResponse<void>>(`/units/${id}`)
  },
}
