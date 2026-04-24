import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { ExportForm } from '@/features/export-forms/types/export-form.types'
import type { ExportFormValues, ExportFormItemValues } from '@/features/export-forms/schemas/export-form.schema'

export const exportFormService = {
  getAll() {
    return api.get<ApiResponse<ExportForm[]>>('/export-forms')
  },
  getById(id: string) {
    return api.get<ApiResponse<ExportForm>>(`/export-forms/${id}`)
  },
  create(payload: ExportFormValues) {
    return api.post<ApiResponse<ExportForm>>('/export-forms', payload)
  },
  update(id: string, payload: Partial<ExportFormValues>) {
    return api.put<ApiResponse<ExportForm>>(`/export-forms/${id}`, payload)
  },
  cancel(id: string) {
    return api.post<ApiResponse<ExportForm>>(`/export-forms/${id}/cancel`, {})
  },
  confirm(id: string) {
    return api.post<ApiResponse<ExportForm>>(`/export-forms/${id}/confirm`, {})
  },
  addItem(id: string, item: ExportFormItemValues) {
    return api.post<ApiResponse<ExportForm>>(`/export-forms/${id}/items`, item)
  },
}
