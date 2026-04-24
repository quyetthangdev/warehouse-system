import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { BalanceForm } from '@/features/balance-forms/types/balance-form.types'
import type { BalanceFormValues } from '@/features/balance-forms/schemas/balance-form.schema'

export const balanceFormService = {
  getAll() {
    return api.get<ApiResponse<BalanceForm[]>>('/balance-forms')
  },
  getById(id: string) {
    return api.get<ApiResponse<BalanceForm>>(`/balance-forms/${id}`)
  },
  create(payload: BalanceFormValues) {
    return api.post<ApiResponse<BalanceForm>>('/balance-forms', payload)
  },
  updateItems(id: string, items: BalanceForm['items']) {
    return api.put<ApiResponse<BalanceForm>>(`/balance-forms/${id}`, { items })
  },
  start(id: string) {
    return api.post<ApiResponse<BalanceForm>>(`/balance-forms/${id}/start`, {})
  },
  complete(id: string, items: BalanceForm['items']) {
    return api.post<ApiResponse<BalanceForm>>(`/balance-forms/${id}/complete`, { items })
  },
  cancel(id: string) {
    return api.post<ApiResponse<BalanceForm>>(`/balance-forms/${id}/cancel`, {})
  },
}
