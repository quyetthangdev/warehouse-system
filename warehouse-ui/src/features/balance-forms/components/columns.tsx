import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/common/status-badge'
import { DataTableColumnHeader } from '@/components/common/data-table-column-header'
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
      meta: { label: 'Mã phiếu' },
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã phiếu" />,
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
      meta: { label: 'Ngày kiểm' },
      size: 110,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày kiểm" />,
      cell: ({ row }) => formatDate(row.original.balanceDate),
    },
    {
      accessorKey: 'balanceType',
      meta: { label: 'Loại kiểm' },
      size: 110,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại kiểm" />,
      cell: ({ row }) => balanceTypeConfig[row.original.balanceType],
    },
    {
      accessorKey: 'scope',
      meta: { label: 'Phạm vi' },
      size: 100,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phạm vi" />,
      cell: ({ row }) => row.original.scope === 'full' ? 'Toàn bộ' : 'Một phần',
    },
    {
      accessorKey: 'inspectors',
      meta: { label: 'Người kiểm' },
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Người kiểm" />,
      cell: ({ row }) => row.original.inspectors.join(', '),
    },
    {
      id: 'itemCount',
      meta: { label: 'Số NVL' },
      size: 80,
      header: 'Số NVL',
      enableSorting: false,
      cell: ({ row }) => row.original.items.length,
    },
    {
      accessorKey: 'status',
      meta: { label: 'Trạng thái' },
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => {
        const cfg = balanceFormStatusConfig[row.original.status]
        return <StatusBadge label={cfg.label} variant={cfg.variant} />
      },
    },
    {
      id: 'actions',
      size: 80,
      enableSorting: false,
      enableHiding: false,
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
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetail(form.id)}>
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              {canCancel && (
                <DropdownMenuItem variant="destructive" onClick={() => onCancel(form)}>
                  <Ban className="h-4 w-4" />
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
