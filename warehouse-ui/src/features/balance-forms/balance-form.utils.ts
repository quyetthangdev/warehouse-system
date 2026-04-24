import type { BalanceFormStatus, BalanceType, DiscrepancyReason } from './types/balance-form.types'

export const MOCK_INSPECTORS = [
  'Nguyễn Văn A',
  'Trần Thị B',
  'Lê Văn C',
  'Phạm Thị D',
  'Hoàng Văn E',
]

export const balanceFormStatusConfig: Record<
  BalanceFormStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft:       { label: 'Nháp',          variant: 'secondary'   },
  in_progress: { label: 'Đang kiểm',     variant: 'default'     },
  completed:   { label: 'Hoàn thành',    variant: 'outline'     },
  cancelled:   { label: 'Đã hủy',        variant: 'destructive' },
}

export const balanceTypeConfig: Record<BalanceType, string> = {
  periodic:   'Định kỳ',
  unplanned:  'Đột xuất',
}

export const discrepancyReasonConfig: Record<DiscrepancyReason, string> = {
  loss_in_use:       'Thất thoát trong sử dụng',
  recording_error:   'Sai sót ghi nhận nhập/xuất',
  unrecorded_damage: 'Hàng hỏng chưa ghi nhận',
  natural_loss:      'Hao hụt tự nhiên',
  counting_error:    'Sai sót khi đếm',
  other:             'Khác',
}

export function calcDiscrepancy(systemQty: number, actualQty: number | null) {
  if (actualQty === null) return { discrepancy: null, discrepancyPercent: null }
  const discrepancy = actualQty - systemQty
  const discrepancyPercent = systemQty === 0 ? null : (discrepancy / systemQty) * 100
  return { discrepancy, discrepancyPercent }
}

export function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
