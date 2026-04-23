// src/features/inventory/components/inventory-list-page.tsx
import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, Check } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const { items, isLoading, error } = useInventory()
  const navigate = useNavigate()

  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])

  // Fix 4 — surface hook errors via toast
  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  // Derive unique supplier names from loaded items
  const supplierOptions = useMemo<string[]>(() => {
    const set = new Set<string>()
    items.forEach((item) => item.supplierNames.forEach((s) => set.add(s)))
    return Array.from(set).sort()
  }, [items])

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        if (
          selectedSuppliers.length > 0 &&
          !item.supplierNames.some((s) => selectedSuppliers.includes(s))
        )
          return false
        return true
      }),
    [items, categoryFilter, statusFilter, selectedSuppliers],
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

  function toggleSupplier(supplier: string) {
    setSelectedSuppliers((prev) =>
      prev.includes(supplier) ? prev.filter((s) => s !== supplier) : [...prev, supplier],
    )
  }

  const supplierButtonLabel =
    selectedSuppliers.length === 0
      ? 'Nhà cung cấp'
      : `Nhà cung cấp (${selectedSuppliers.length})`

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

          {/* Fix 1 — Supplier multi-select filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-52 justify-between font-normal">
                <span>{supplierButtonLabel}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-2">
              {supplierOptions.length === 0 ? (
                <p className="py-2 text-center text-sm text-muted-foreground">Không có dữ liệu</p>
              ) : (
                <ul className="max-h-60 overflow-y-auto space-y-1">
                  {supplierOptions.map((supplier) => {
                    const checked = selectedSuppliers.includes(supplier)
                    return (
                      <li key={supplier}>
                        <button
                          type="button"
                          onClick={() => toggleSupplier(supplier)}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted text-left"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input'
                            }`}
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                          <span className="truncate">{supplier}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
              {selectedSuppliers.length > 0 && (
                <div className="mt-1 border-t pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSuppliers([])}
                    className="w-full rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted text-left"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>

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
          emptyMessage="Chưa có dữ liệu tồn kho"
        />
      </div>
    </PageContainer>
  )
}
