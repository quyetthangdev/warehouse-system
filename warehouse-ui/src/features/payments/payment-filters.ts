import type { DatePreset } from './payment-date-presets'
import type { PaymentType, PaymentStatus, PaymentMethod, ReceiptType } from './types/payment.types'

export interface PaymentFilterState {
  fromDate: string
  toDate: string
  activePreset: DatePreset | null
  type: PaymentType | 'all'
  status: PaymentStatus | 'all'
  method: PaymentMethod | 'all'
  supplier: string
}

export const PAYMENT_FILTER_DEFAULT: PaymentFilterState = {
  fromDate: '',
  toDate: '',
  activePreset: null,
  type: 'all',
  status: 'all',
  method: 'all',
  supplier: 'all',
}

export interface ReceiptFilterState {
  fromDate: string
  toDate: string
  activePreset: DatePreset | null
  type: ReceiptType | 'all'
  status: PaymentStatus | 'all'
  supplier: string
}

export const RECEIPT_FILTER_DEFAULT: ReceiptFilterState = {
  fromDate: '',
  toDate: '',
  activePreset: null,
  type: 'all',
  status: 'all',
  supplier: 'all',
}
