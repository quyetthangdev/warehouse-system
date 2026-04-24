import { type ColumnDef } from '@tanstack/react-table'
import { Ban, Eye, MoreHorizontal, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/common/data-table-column-header'
import { importFormStatusConfig, formatDate } from '../import-form.utils'
import type { ImportForm } from '../types/import-form.types'

interface GetColumnsArgs {
  canEdit: boolean
  onViewDetail: (id: string) => void
  onEdit: (form: ImportForm) => void
  onCancel: (form: ImportForm) => void
}

export function getColumns({ canEdit, onViewDetail, onEdit, onCancel }: GetColumnsArgs): ColumnDef<ImportForm>[] {
  return [
    {
      accessorKey: 'code',
      meta: { label: 'Mã phiếu' },
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã phiếu" />,
    },
    {
      accessorKey: 'importDate',
      meta: { label: 'Ngày nhập' },
      size: 110,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày nhập" />,
      cell: ({ row }) => formatDate(row.original.importDate),
    },
    {
      accessorKey: 'supplierName',
      meta: { label: 'Nhà cung cấp' },
      size: 190,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nhà cung cấp" />,
    },
    {
      accessorKey: 'warehouseName',
      meta: { label: 'Kho nhập' },
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kho nhập" />,
      cell: ({ row }) => row.original.warehouseName ?? '—',
    },
    {
      accessorKey: 'poNumber',
      meta: { label: 'Số PO' },
      size: 100,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Số PO" />,
      cell: ({ row }) => row.original.poNumber ?? '—',
    },
    {
      accessorKey: 'status',
      meta: { label: 'Trạng thái' },
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => {
        const cfg = importFormStatusConfig[row.original.status]
        return <StatusBadge label={cfg.label} variant={cfg.variant} />
      },
    },
    {
      accessorKey: 'importType',
      meta: { label: 'Loại nhập' },
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại nhập" />,
      cell: ({ row }) => row.original.importType ?? '—',
    },
    {
      accessorKey: 'requestedBy',
      meta: { label: 'Người yêu cầu' },
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Người yêu cầu" />,
    },
    {
      accessorKey: 'approvedBy',
      meta: { label: 'Người phê duyệt' },
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Người phê duyệt" />,
      cell: ({ row }) => row.original.approvedBy ?? '—',
    },
    {
      accessorKey: 'note',
      meta: { label: 'Ghi chú' },
      size: 160,
      header: 'Ghi chú',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="truncate block max-w-[140px]">{row.original.note ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'createdBy',
      meta: { label: 'Người tạo' },
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
        const f = row.original
        const isDraft = f.status === 'draft'
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
              <DropdownMenuItem onClick={() => onViewDetail(f.id)}>
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              {canEdit && isDraft && (
                <DropdownMenuItem onClick={() => onEdit(f)}>
                  <Pencil className="h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
              )}
              {canEdit && isDraft && (
                <DropdownMenuItem variant="destructive" onClick={() => onCancel(f)}>
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
