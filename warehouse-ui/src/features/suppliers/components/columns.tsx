import { type ColumnDef } from '@tanstack/react-table'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import type { Supplier } from '../types/supplier.types'

const paymentTermsLabel: Record<string, string> = {
  cod: 'COD',
  '7_days': '7 ngày',
  '15_days': '15 ngày',
  '30_days': '30 ngày',
}

interface GetColumnsArgs {
  canEdit: boolean
  canDelete: boolean
  onViewDetail: (supplier: Supplier) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
}

export function getColumns({ canEdit, canDelete, onViewDetail, onEdit, onDelete }: GetColumnsArgs): ColumnDef<Supplier>[] {
  return [
    {
      accessorKey: 'name',
      meta: { label: 'Tên nhà cung cấp' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên nhà cung cấp" />,
    },
    {
      accessorKey: 'code',
      meta: { label: 'Code' },
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    },
    {
      accessorKey: 'contactPerson',
      meta: { label: 'Người liên hệ' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Người liên hệ" />,
    },
    {
      accessorKey: 'phone',
      meta: { label: 'Số điện thoại' },
      header: 'Số điện thoại',
      enableSorting: false,
    },
    {
      accessorKey: 'paymentTerms',
      meta: { label: 'Điều khoản thanh toán' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Điều khoản TT" />,
      cell: ({ row }) => paymentTermsLabel[row.original.paymentTerms] ?? row.original.paymentTerms,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      size: 80,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetail(row.original)}>
              <Eye className="h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}>
                <Trash2 className="h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
