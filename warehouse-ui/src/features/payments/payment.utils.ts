import type { PaymentStatus, PaymentType, ReceiptType, PaymentTerms, PaymentMethod, ReceiptMethod } from './types/payment.types'

export const paymentTypeConfig: Record<PaymentType, string> = {
  material_purchase: 'Mua NVL',
  transport: 'Vận chuyển',
  loading: 'Bốc xếp',
  storage: 'Lưu kho',
  other: 'Chi phí khác',
}

export const receiptTypeConfig: Record<ReceiptType, string> = {
  refund: 'Hoàn tiền từ NCC',
  compensation: 'Bồi thường',
  liquidation: 'Thanh lý NVL',
  scrap: 'Thu phế liệu',
  other: 'Thu khác',
}

export const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft: { label: 'Nháp', variant: 'secondary' },
  confirmed: { label: 'Đã xác nhận', variant: 'default' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
}

export const paymentMethodConfig: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  card: 'Thẻ tín dụng',
}

export const receiptMethodConfig: Record<ReceiptMethod, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  e_wallet: 'Ví điện tử',
}

export const paymentTermsConfig: Record<PaymentTerms, string> = {
  direct: 'Trực tiếp',
  debt: 'Công nợ',
}

export function formatVnd(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return '—'
  if (amount === 0) return '0 đ'
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ'
}

export function formatDate(d: string): string {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export function calcDueDate(paymentDate: string, debtDays: number): string {
  const [y, m, d] = paymentDate.split('-').map(Number)
  const date = new Date(y, m - 1, d + debtDays)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}
