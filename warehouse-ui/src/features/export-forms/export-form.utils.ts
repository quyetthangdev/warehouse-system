import type { ExportFormStatus, ExportType, DisposalReason } from './types/export-form.types'

export const WAREHOUSES = [
  { id: 'wh-001', name: 'Kho tổng' },
  { id: 'wh-002', name: 'Kho chi nhánh 1' },
  { id: 'wh-003', name: 'Kho chi nhánh 2' },
]

export const exportFormStatusConfig: Record<
  ExportFormStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft:     { label: 'Nháp',          variant: 'secondary'    },
  confirmed: { label: 'Đã xác nhận',   variant: 'default'      },
  cancelled: { label: 'Đã hủy',        variant: 'destructive'  },
}

export const exportTypeConfig: Record<ExportType, { label: string }> = {
  production: { label: 'Xuất sản xuất' },
  disposal:   { label: 'Xuất hủy'      },
  transfer:   { label: 'Luân chuyển'   },
  other:      { label: 'Xuất khác'     },
}

export const disposalReasonConfig: Record<DisposalReason, string> = {
  expired:       'Hết hạn',
  damaged:       'Hỏng',
  contaminated:  'Nhiễm khuẩn',
  other:         'Khác',
}

export function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
