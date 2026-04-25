import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { Payment, Receipt } from '@/features/payments/types/payment.types'
import type { PaymentValues, ReceiptValues } from '@/features/payments/schemas/payment.schema'

export const paymentService = {
  getAllPayments() {
    return api.get<ApiResponse<Payment[]>>('/payments')
  },
  createPayment(payload: PaymentValues) {
    return api.post<ApiResponse<Payment>>('/payments', payload)
  },
  confirmPayment(id: string) {
    return api.patch<ApiResponse<Payment>>(`/payments/${id}/confirm`)
  },
  cancelPayment(id: string) {
    return api.patch<ApiResponse<Payment>>(`/payments/${id}/cancel`)
  },
  getAllReceipts() {
    return api.get<ApiResponse<Receipt[]>>('/receipts')
  },
  createReceipt(payload: ReceiptValues) {
    return api.post<ApiResponse<Receipt>>('/receipts', payload)
  },
  confirmReceipt(id: string) {
    return api.patch<ApiResponse<Receipt>>(`/receipts/${id}/confirm`)
  },
  cancelReceipt(id: string) {
    return api.patch<ApiResponse<Receipt>>(`/receipts/${id}/cancel`)
  },
}
