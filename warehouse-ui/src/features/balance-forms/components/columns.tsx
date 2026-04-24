import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/common/status-badge'
import { balanceFormStatusConfig, balanceTypeConfig, formatDate } from '../balance-form.utils'
import type { BalanceForm } from '../types/balance-form.types'

interface ColumnOptions {
  canEdit: boolean
  onViewDetail: (id: string) => void
  onCancel: (form: BalanceForm) => void
}

export function getColumns({ canEdit, onViewDetail, onCancel }: ColumnOptions): ColumnDef<BalanceForm>[] {
  return [
    {
      accessorKey: 'code',
      header: 'Mã phiếu',
      cell: ({ row }) => (
        <button
          className="font-medium text-primary hover:underline"
          onClick={() => onViewDetail(row.original.id)}
        >
          {row.original.code}
        </button>
      ),
    },
    {
      accessorKey: 'balanceDate',
      header: 'Ngày kiểm',
      cell: ({ row }) => formatDate(row.original.balanceDate),
    },
    {
      accessorKey: 'balanceType',
      header: 'Loại kiểm',
      cell: ({ row }) => balanceTypeConfig[row.original.balanceType],
    },
    {
      accessorKey: 'scope',
      header: 'Phạm vi',
      cell: ({ row }) => row.original.scope === 'full' ? 'Toàn bộ' : 'Một phần',
    },
    {
      accessorKey: 'inspectors',
      header: 'Người kiểm',
      cell: ({ row }) => row.original.inspectors.join(', '),
    },
    {
      id: 'itemCount',
      header: 'Số NVL',
      cell: ({ row }) => row.original.items.length,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const cfg = balanceFormStatusConfig[row.original.status]
        return <StatusBadge label={cfg.label} variant={cfg.variant} />
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const form = row.original
        const canCancel = canEdit && (form.status === 'draft' || form.status === 'in_progress')
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetail(form.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              {canCancel && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onCancel(form)}
                >
                  Hủy phiếu
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
