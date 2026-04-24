import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import type { Unit } from '../types/unit.types'

const typeLabel: Record<string, string> = {
  weight: 'Khối lượng',
  volume: 'Thể tích',
  quantity: 'Số lượng',
}

interface GetColumnsArgs {
  canEdit: boolean
  canDelete: boolean
  onEdit: (unit: Unit) => void
  onDelete: (unit: Unit) => void
}

export function getColumns({ canEdit, canDelete, onEdit, onDelete }: GetColumnsArgs): ColumnDef<Unit>[] {
  return [
    {
      accessorKey: 'name',
      meta: { label: 'Tên đơn vị' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên đơn vị" />,
    },
    {
      accessorKey: 'symbol',
      meta: { label: 'Ký hiệu' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ký hiệu" />,
    },
    {
      accessorKey: 'type',
      meta: { label: 'Loại' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
      cell: ({ row }) => typeLabel[row.original.type] ?? row.original.type,
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
