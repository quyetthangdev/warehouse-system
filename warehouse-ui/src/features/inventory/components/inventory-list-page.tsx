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
import type { InventoryItem, StockStatus } from '../types/inventory.types'

const categoryLabel: Record<string, string> = {
  main_ingredient: 'Nguyên liệu chính',
  supporting: 'Hỗ trợ',
  packaging: 'Bao bì',
  consumable: 'Tiêu hao',
  spare_part: 'Phụ tùng',
}

const statusConfig: Record<
  StockStatus,
  { label: string; variant: 'destructive' | 'outline' | 'default' | 'secondary' }
> = {
  out: { label: 'Hết hàng', variant: 'destructive' },
  low: { label: 'Tồn thấp', variant: 'destructive' },
  normal: { label: 'Bình thường', variant: 'outline' },
  high: { label: 'Tồn cao', variant: 'secondary' },
}

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

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
        cell: ({ row }) => categoryLabel[row.original.category] ?? row.original.category,
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
          const cfg = statusConfig[row.original.status]
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
              <StatCard label="Tổng nguyên vật liệu" value={stats.total} sub="loại" />
              <StatCard label="Tổng giá trị tồn" value={formatVnd(stats.totalValue)} />
              <StatCard
                label="Tồn thấp / hết hàng"
                value={stats.lowCount}
                sub="loại cần bổ sung"
              />
              <StatCard
                label="Lô sắp hết hạn"
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
              <SelectItem value="main_ingredient">Nguyên liệu chính</SelectItem>
              <SelectItem value="supporting">Hỗ trợ</SelectItem>
              <SelectItem value="packaging">Bao bì</SelectItem>
              <SelectItem value="consumable">Tiêu hao</SelectItem>
              <SelectItem value="spare_part">Phụ tùng</SelectItem>
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
