// src/features/inventory/components/inventory-list-page.tsx
import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, Check, Download } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/common/data-table'
import { PageContainer } from '@/components/layout/page-container'
import { useInventory } from '../hooks/use-inventory'
import { statusConfig } from '../inventory.utils'
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

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  // Derive unique supplier names from loaded items
  const supplierOptions = useMemo<string[]>(() => {
    const set = new Set<string>()
    items.forEach((item) => item.supplierNames.forEach((s) => set.add(s)))
    return Array.from(set).sort()
  }, [items])

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (search) {
          const q = search.toLowerCase()
          if (
            !item.materialName.toLowerCase().includes(q) &&
            !item.materialCode.toLowerCase().includes(q)
          )
            return false
        }
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        if (
          selectedSuppliers.length > 0 &&
          !item.supplierNames.some((s) => selectedSuppliers.includes(s))
        )
          return false
        if (dateFrom && item.nearestExpiryDate && item.nearestExpiryDate < dateFrom) return false
        if (dateTo && item.nearestExpiryDate && item.nearestExpiryDate > dateTo) return false
        return true
      }),
    [items, search, categoryFilter, statusFilter, selectedSuppliers, dateFrom, dateTo],
  )

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'materialName',
        header: 'NVL',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.materialName}</p>
            <p className="text-xs text-muted-foreground">{row.original.materialCode}</p>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Phân loại',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {CATEGORY_OPTIONS.find((o) => o.value === row.original.category)?.label ??
              row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: 'maxThreshold',
        header: 'Tồn kho tối đa',
        cell: ({ row }) => `${row.original.maxThreshold} ${row.original.unit}`,
      },
      {
        accessorKey: 'minThreshold',
        header: 'Tồn kho tối thiểu',
        cell: ({ row }) => `${row.original.minThreshold} ${row.original.unit}`,
      },
      {
        accessorKey: 'batchCount',
        header: 'Lô',
      },
      {
        accessorKey: 'nearestExpiryDate',
        header: 'HSD',
        cell: ({ row }) => {
          const d = row.original.nearestExpiryDate
          if (!d) return <span className="text-muted-foreground">—</span>
          const [y, m, day] = d.split('-')
          return <span>{`${day}/${m}/${y}`}</span>
        },
      },
      {
        accessorKey: 'currentStock',
        header: 'Số lượng',
        cell: ({ row }) => `${row.original.currentStock} ${row.original.unit}`,
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const cfg = statusConfig[row.original.status] ?? {
            label: row.original.status,
            variant: 'outline' as const,
          }
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>
        },
      },
      {
        id: 'actions',
        header: 'Thao tác',
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
    <PageContainer
      title="Tồn kho"
      actions={
        <Button size="sm">
          <Download className="h-4 w-4 mr-1.5" />
          Xuất file
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border bg-card">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b">
            {/* Search — left side */}
            <Input
              placeholder="Tìm kiếm NVL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-60"
            />

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {/* Date range */}
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
                aria-label="Từ ngày"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
                aria-label="Đến ngày"
              />

              {/* Nhà cung cấp multi-select */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-52 justify-between font-normal">
                    <span>{supplierButtonLabel}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-2">
                  {supplierOptions.length === 0 ? (
                    <p className="py-2 text-center text-sm text-muted-foreground">
                      Không có dữ liệu
                    </p>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
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
                                  checked
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-input'
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

              {/* Loại NVL */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Loại NVL" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Trạng thái */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
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
          </div>

          {/* Table — search is handled externally via filteredItems */}
          <div className="p-4">
            <DataTable
              columns={columns}
              data={filteredItems}
              isLoading={isLoading}
              emptyMessage="Chưa có dữ liệu tồn kho"
              hideSearch
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
