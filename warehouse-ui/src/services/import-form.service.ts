import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { ImportForm } from '@/features/import-forms/types/import-form.types'
import type { ImportFormValues, ImportFormItemValues } from '@/features/import-forms/schemas/import-form.schema'

export const importFormService = {
  getAll() {
    return api.get<ApiResponse<ImportForm[]>>('/import-forms')
  },
  getById(id: string) {
    return api.get<ApiResponse<ImportForm>>(`/import-forms/${id}`)
  },
  create(payload: ImportFormValues) {
    return api.post<ApiResponse<ImportForm>>('/import-forms', payload)
  },
  update(id: string, payload: Partial<ImportFormValues>) {
    return api.put<ApiResponse<ImportForm>>(`/import-forms/${id}`, payload)
  },
  cancel(id: string) {
    return api.post<ApiResponse<ImportForm>>(`/import-forms/${id}/cancel`, {})
  },
  confirm(id: string) {
    return api.post<ApiResponse<ImportForm>>(`/import-forms/${id}/confirm`, {})
  },
  addItem(id: string, item: ImportFormItemValues) {
    return api.post<ApiResponse<ImportForm>>(`/import-forms/${id}/items`, item)
  },
}
