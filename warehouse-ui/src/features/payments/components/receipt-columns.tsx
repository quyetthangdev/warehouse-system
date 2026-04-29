import type { ColumnDef } from '@tanstack/react-table'
import { Eye, MoreHorizontal, CheckCircle, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/status-badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/common/data-table-column-header'
import {
  receiptTypeConfig, paymentStatusConfig, receiptMethodConfig, formatVnd, formatDate,
} from '../payment.utils'
import type { Receipt } from '../types/payment.types'

interface GetColumnsArgs {
  canEdit: boolean
  onViewDetail: (receipt: Receipt) => void
  onConfirm: (receipt: Receipt) => void
  onCancel: (receipt: Receipt) => void
}

export function getReceiptColumns({ canEdit, onViewDetail, onConfirm, onCancel }: GetColumnsArgs): ColumnDef<Receipt>[] {
  return [
    {
      accessorKey: 'code',
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã phiếu" />,
    },
    {
      accessorKey: 'receiptDate',
      size: 110,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày thu" />,
      cell: ({ row }) => formatDate(row.original.receiptDate),
    },
    {
      accessorKey: 'receiptType',
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại thu" />,
      cell: ({ row }) => receiptTypeConfig[row.original.receiptType],
    },
    {
      accessorKey: 'totalAmount',
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng tiền" />,
      cell: ({ row }) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          {formatVnd(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: 'receiptMethod',
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hình thức thu" />,
      cell: ({ row }) => receiptMethodConfig[row.original.receiptMethod],
    },
    {
      accessorKey: 'supplierName',
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Đối tác" />,
      cell: ({ row }) => row.original.supplierName ?? '—',
    },
    {
      accessorKey: 'formRef',
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tham chiếu" />,
      cell: ({ row }) => row.original.formRef ?? '—',
    },
    {
      accessorKey: 'status',
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => {
        const cfg = paymentStatusConfig[row.original.status]
        return <StatusBadge label={cfg.label} variant={cfg.variant} />
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      size: 80,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const r = row.original
        const isDraft = r.status === 'draft'
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
              <DropdownMenuItem onClick={() => onViewDetail(r)}>
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              {canEdit && isDraft && (
                <DropdownMenuItem onClick={() => onConfirm(r)}>
                  <CheckCircle className="h-4 w-4" />
                  Xác nhận
                </DropdownMenuItem>
              )}
              {canEdit && isDraft && (
                <DropdownMenuItem variant="destructive" onClick={() => onCancel(r)}>
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
