import { type ColumnDef } from '@tanstack/react-table'
import { format, parseISO } from 'date-fns'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import type { Material } from '../types/material.types'

const CATEGORY_OPTIONS = [
  { value: 'main_ingredient', label: 'Nguyên liệu chính' },
  { value: 'supporting', label: 'Phụ liệu' },
  { value: 'packaging', label: 'Bao bì' },
  { value: 'consumable', label: 'Vật tư tiêu hao' },
  { value: 'spare_part', label: 'Phụ tùng' },
]

function formatExpiryDate(date: string | null): string {
  if (!date) return '—'
  try { return format(parseISO(date), 'dd/MM/yyyy') } catch { return '—' }
}

interface GetColumnsArgs {
  canEdit: boolean
  canDelete: boolean
  onEdit: (material: Material) => void
  onDelete: (material: Material) => void
}

export function getColumns({ canEdit, canDelete, onEdit, onDelete }: GetColumnsArgs): ColumnDef<Material>[] {
  return [
    {
      accessorKey: 'name',
      meta: { label: 'NVL' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="NVL" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      meta: { label: 'Loại' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
      cell: ({ row }) => {
        const opt = CATEGORY_OPTIONS.find((o) => o.value === row.original.category)
        return <Badge variant="outline">{opt?.label ?? row.original.category}</Badge>
      },
    },
    {
      accessorKey: 'maximumInventory',
      meta: { label: 'Tồn kho tối đa' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho tối đa" />,
      cell: ({ row }) => `${row.original.maximumInventory} ${row.original.baseUnit.symbol}`,
    },
    {
      accessorKey: 'minimumInventory',
      meta: { label: 'Tồn kho tối thiểu' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho tối thiểu" />,
      cell: ({ row }) => `${row.original.minimumInventory} ${row.original.baseUnit.symbol}`,
    },
    {
      accessorKey: 'batchCount',
      meta: { label: 'Lô' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Lô" />,
    },
    {
      accessorKey: 'nearestExpiryDate',
      meta: { label: 'HSD' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="HSD" />,
      cell: ({ row }) => formatExpiryDate(row.original.nearestExpiryDate),
    },
    {
      accessorKey: 'availableStock',
      meta: { label: 'Tồn kho khả dụng' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho khả dụng" />,
      cell: ({ row }) => `${row.original.availableStock} ${row.original.baseUnit.symbol}`,
    },
    {
      accessorKey: 'isActive',
      meta: { label: 'Trạng thái' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) =>
        row.original.isActive ? (
          <StatusBadge label="Hoạt động" className="bg-green-100 text-green-700 hover:bg-green-100" />
        ) : (
          <StatusBadge label="Ngừng dùng" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100" />
        ),
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
