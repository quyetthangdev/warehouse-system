import { type ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/common/status-badge'
import { DataTableColumnHeader } from '@/components/common/data-table-column-header'
import { statusConfig, formatVnd } from '../inventory.utils'
import type { InventoryItem } from '../types/inventory.types'
import type { MaterialCategory } from '@/features/materials/types/material.types'

const CATEGORY_OPTIONS: { value: MaterialCategory; label: string }[] = [
  { value: 'main_ingredient', label: 'Nguyên liệu chính' },
  { value: 'supporting', label: 'Nguyên liệu phụ' },
  { value: 'packaging', label: 'Bao bì' },
  { value: 'consumable', label: 'Vật tư tiêu hao' },
  { value: 'spare_part', label: 'Phụ tùng' },
]

const DAYS_30 = 30 * 24 * 60 * 60 * 1000
const DAYS_90 = 90 * 24 * 60 * 60 * 1000

interface GetColumnsArgs {
  onNavigate: (materialId: string) => void
}

export function getColumns({ onNavigate }: GetColumnsArgs): ColumnDef<InventoryItem>[] {
  return [
    {
      accessorKey: 'materialName',
      meta: { label: 'NVL' },
      size: 220,
      header: ({ column }) => <DataTableColumnHeader column={column} title="NVL" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.materialName}</p>
          <p className="text-xs text-muted-foreground">{row.original.materialCode}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      meta: { label: 'Phân loại' },
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phân loại" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {CATEGORY_OPTIONS.find((o) => o.value === row.original.category)?.label ?? row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: 'maxThreshold',
      meta: { label: 'Tồn kho tối đa' },
      size: 150,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho tối đa" />,
      cell: ({ row }) => `${row.original.maxThreshold} ${row.original.unit}`,
    },
    {
      accessorKey: 'minThreshold',
      meta: { label: 'Tồn kho tối thiểu' },
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho tối thiểu" />,
      cell: ({ row }) => `${row.original.minThreshold} ${row.original.unit}`,
    },
    {
      accessorKey: 'batchCount',
      meta: { label: 'Lô' },
      size: 70,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Lô" />,
    },
    {
      accessorKey: 'nearestExpiryDate',
      meta: { label: 'HSD' },
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="HSD" />,
      cell: ({ row }) => {
        const d = row.original.nearestExpiryDate
        const count = row.original.nearExpiryBatchCount
        if (!d) return <span className="text-muted-foreground">—</span>
        const [y, m, day] = d.split('-')
        const formatted = `${day}/${m}/${y}`
        const msLeft = new Date(d).getTime() - Date.now()
        const isCritical = count > 0 && msLeft <= DAYS_30
        const isWarning = count > 0 && msLeft > DAYS_30 && msLeft <= DAYS_90
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={isCritical ? 'text-destructive font-medium' : isWarning ? 'text-yellow-600' : ''}>
              {formatted}
            </span>
            {isCritical && (
              <Badge variant="destructive" className="text-xs px-1 py-0 h-4">Sắp HH</Badge>
            )}
            {isWarning && (
              <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-yellow-400 text-yellow-600">
                {count} lô
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'currentStock',
      meta: { label: 'Tồn kho khả dụng' },
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho khả dụng" />,
      cell: ({ row }) => `${row.original.currentStock} ${row.original.unit}`,
    },
    {
      accessorKey: 'stockValue',
      meta: { label: 'Giá trị tồn' },
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Giá trị tồn" />,
      cell: ({ row }) => formatVnd(row.original.stockValue),
    },
    {
      accessorKey: 'status',
      meta: { label: 'Trạng thái' },
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status] ?? { label: row.original.status, variant: 'outline' as const }
        return <StatusBadge label={cfg.label} variant={cfg.variant} />
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      size: 80,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <button
          onClick={() => onNavigate(row.original.materialId)}
          className="flex items-center text-muted-foreground hover:text-foreground"
          aria-label="Xem chi tiết"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ),
    },
  ]
}
