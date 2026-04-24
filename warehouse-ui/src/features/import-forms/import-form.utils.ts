import type { ImportFormStatus } from './types/import-form.types'

export const WAREHOUSES = [
  { id: 'wh-001', name: 'Kho tổng' },
  { id: 'wh-002', name: 'Kho chi nhánh 1' },
  { id: 'wh-003', name: 'Kho chi nhánh 2' },
]

export const importFormStatusConfig: Record<
  ImportFormStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft: { label: 'Nháp', variant: 'secondary' },
  confirmed: { label: 'Đã xác nhận', variant: 'default' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
}

export function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
