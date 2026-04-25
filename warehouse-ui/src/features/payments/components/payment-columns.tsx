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
  paymentTypeConfig, paymentStatusConfig, paymentMethodConfig, formatVnd, formatDate,
} from '../payment.utils'
import type { Payment } from '../types/payment.types'

interface GetColumnsArgs {
  canEdit: boolean
  onViewDetail: (payment: Payment) => void
  onConfirm: (payment: Payment) => void
  onCancel: (payment: Payment) => void
}

export function getPaymentColumns({ canEdit, onViewDetail, onConfirm, onCancel }: GetColumnsArgs): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: 'code',
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã phiếu" />,
    },
    {
      accessorKey: 'paymentDate',
      size: 110,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày chi" />,
      cell: ({ row }) => formatDate(row.original.paymentDate),
    },
    {
      accessorKey: 'paymentType',
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại chi" />,
      cell: ({ row }) => paymentTypeConfig[row.original.paymentType],
    },
    {
      accessorKey: 'totalAmount',
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng tiền" />,
      cell: ({ row }) => (
        <span className="font-medium">{formatVnd(row.original.totalAmount)}</span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hình thức TT" />,
      cell: ({ row }) => paymentMethodConfig[row.original.paymentMethod],
    },
    {
      accessorKey: 'supplierName',
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nhà cung cấp" />,
      cell: ({ row }) => row.original.supplierName ?? '—',
    },
    {
      accessorKey: 'importFormRef',
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phiếu nhập" />,
      cell: ({ row }) => row.original.importFormRef ?? '—',
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
      accessorKey: 'createdBy',
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Người tạo" />,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      size: 80,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original
        const isDraft = p.status === 'draft'
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
              <DropdownMenuItem onClick={() => onViewDetail(p)}>
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              {canEdit && isDraft && (
                <DropdownMenuItem onClick={() => onConfirm(p)}>
                  <CheckCircle className="h-4 w-4" />
                  Xác nhận
                </DropdownMenuItem>
              )}
              {canEdit && isDraft && (
                <DropdownMenuItem variant="destructive" onClick={() => onCancel(p)}>
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
