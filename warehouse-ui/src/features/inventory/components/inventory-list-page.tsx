// src/features/inventory/components/inventory-list-page.tsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/common/data-table'
import { PageContainer } from '@/components/layout/page-container'
import { useInventory } from '../hooks/use-inventory'
import { StatCard } from './stat-card'
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

export function InventoryListPage() {
  const { items, isLoading } = useInventory()
  const navigate = useNavigate()

  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        return true
      }),
    [items, categoryFilter, statusFilter],
  )

  const stats = useMemo(
    () => ({
      total: items.length,
      totalValue: items.reduce((sum, i) => sum + i.stockValue, 0),
      lowCount: items.filter((i) => i.status === 'low' || i.status === 'out').length,
      nearExpiryCount: items.filter((i) => i.nearExpiryBatchCount > 0).length,
    }),
    [items],
  )

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      { accessorKey: 'materialCode', header: 'Mã NVL' },
      { accessorKey: 'materialName', header: 'Tên nguyên vật liệu' },
      {
        accessorKey: 'category',
        header: 'Loại',
        cell: ({ row }) => CATEGORY_OPTIONS.find(o => o.value === row.original.category)?.label ?? row.original.category,
      },
      { accessorKey: 'unit', header: 'Đơn vị' },
      {
        accessorKey: 'currentStock',
        header: 'Tồn kho',
        cell: ({ row }) => `${row.original.currentStock} ${row.original.unit}`,
      },
      { accessorKey: 'minThreshold', header: 'Tối thiểu' },
      { accessorKey: 'maxThreshold', header: 'Tối đa' },
      {
        accessorKey: 'stockValue',
        header: 'Giá trị tồn',
        cell: ({ row }) => formatVnd(row.original.stockValue),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const cfg = statusConfig[row.original.status] ?? { label: row.original.status, variant: 'outline' as const }
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={() => navigate(`/inventory/${row.original.materialId}`)}
            className="flex items-center text-muted-foreground hover:text-foreground"
            aria-label="Xem chi tiết"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [navigate],
  )

  return (
    <PageContainer>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Tồn kho</h1>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))
          ) : (
            <>
              <StatCard title="Tổng nguyên vật liệu" value={stats.total} sub="loại" />
              <StatCard title="Tổng giá trị tồn" value={formatVnd(stats.totalValue)} />
              <StatCard
                title="Tồn thấp / hết hàng"
                value={stats.lowCount}
                sub="loại cần bổ sung"
              />
              <StatCard
                title="Lô sắp hết hạn"
                value={stats.nearExpiryCount}
                sub="trong 30 ngày"
              />
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại NVL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="out">Hết hàng</SelectItem>
              <SelectItem value="low">Tồn thấp</SelectItem>
              <SelectItem value="normal">Bình thường</SelectItem>
              <SelectItem value="high">Tồn cao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          searchPlaceholder="Tìm theo tên hoặc mã NVL..."
        />
      </div>
    </PageContainer>
  )
}
