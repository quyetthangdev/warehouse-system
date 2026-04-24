import type { StockStatus } from './types/inventory.types'

export const statusConfig: Record<
  StockStatus,
  { label: string; variant: 'destructive' | 'outline' | 'default' | 'secondary' }
> = {
  out: { label: 'Hết hàng', variant: 'destructive' },
  low: { label: 'Tồn thấp', variant: 'destructive' },
  normal: { label: 'Bình thường', variant: 'outline' },
  high: { label: 'Tồn cao', variant: 'secondary' },
}

export const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
