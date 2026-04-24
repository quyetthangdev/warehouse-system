import { type ColumnDef } from '@tanstack/react-table'
import { Ban, Eye, MoreHorizontal, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/common/data-table-column-header'
import { StatusBadge } from '@/components/common/status-badge'
import { exportFormStatusConfig, exportTypeConfig, formatDate } from '../export-form.utils'
import type { ExportForm } from '../types/export-form.types'

interface GetColumnsArgs {
  canEdit: boolean
  onViewDetail: (id: string) => void
  onEdit: (form: ExportForm) => void
  onCancel: (form: ExportForm) => void
}

export function getColumns({ canEdit, onViewDetail, onEdit, onCancel }: GetColumnsArgs): ColumnDef<ExportForm>[] {
  return [
    {
      accessorKey: 'code',
      meta: { label: 'Mã phiếu' },
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã phiếu" />,
    },
    {
      accessorKey: 'exportDate',
      meta: { label: 'Ngày xuất' },
      size: 110,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày xuất" />,
      cell: ({ row }) => formatDate(row.original.exportDate),
    },
    {
      accessorKey: 'exportType',
      meta: { label: 'Loại xuất' },
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại xuất" />,
      cell: ({ row }) => exportTypeConfig[row.original.exportType]?.label ?? row.original.exportType,
    },
    {
      accessorKey: 'exportedBy',
      meta: { label: 'Người xuất' },
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Người xuất" />,
    },
    {
      accessorKey: 'recipient',
      meta: { label: 'Người nhận' },
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Người nhận" />,
      cell: ({ row }) => row.original.recipient ?? '—',
    },
    {
      accessorKey: 'status',
      meta: { label: 'Trạng thái' },
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => {
        const cfg = exportFormStatusConfig[row.original.status]
        return <StatusBadge label={cfg.label} variant={cfg.variant} />
      },
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
