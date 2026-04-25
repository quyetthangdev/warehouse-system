import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/common/data-table'
import { FilterMultiSelect } from '@/components/common/filter-multi-select'
import { PageContainer } from '@/components/layout/page-container'
import { useInventory } from '../hooks/use-inventory'
import { getColumns } from './columns'
import type { MaterialCategory } from '@/features/materials/types/material.types'
import type { InventoryItem } from '../types/inventory.types'

function exportToCSV(items: InventoryItem[]) {
  const headers = [
    'Mã NVL', 'Tên NVL', 'Phân loại', 'Tồn khả dụng', 'ĐVT',
    'Giá trị tồn (VNĐ)', 'Trạng thái', 'Ngưỡng tối thiểu', 'Ngưỡng tối đa',
  ]
  const categoryLabel: Record<string, string> = {
    main_ingredient: 'Nguyên liệu chính',
    supporting: 'Nguyên liệu phụ',
    packaging: 'Bao bì',
    consumable: 'Vật tư tiêu hao',
    spare_part: 'Phụ tùng',
  }
  const statusLabel: Record<string, string> = {
    out: 'Hết hàng',
    low: 'Tồn thấp',
    normal: 'Bình thường',
    high: 'Tồn cao',
  }
  const rows = items.map((item) => [
    item.materialCode,
    item.materialName,
    categoryLabel[item.category] ?? item.category,
    String(item.currentStock),
    item.unit,
    String(item.stockValue),
    statusLabel[item.status] ?? item.status,
    String(item.minThreshold),
    String(item.maxThreshold),
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ton-kho-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

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
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const supplierOptions = useMemo<string[]>(() => {
    const set = new Set<string>()
    items.forEach((item) => item.supplierNames.forEach((s) => set.add(s)))
    return Array.from(set).sort()
  }, [items])

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        if (selectedSuppliers.length > 0 && !item.supplierNames.some((s) => selectedSuppliers.includes(s)))
          return false
        if (dateFrom && item.nearestExpiryDate && item.nearestExpiryDate < dateFrom) return false
        if (dateTo && item.nearestExpiryDate && item.nearestExpiryDate > dateTo) return false
        return true
      }),
    [items, categoryFilter, statusFilter, selectedSuppliers, dateFrom, dateTo],
  )

  const columns = useMemo(
    () => getColumns({ onNavigate: (id) => navigate(`/inventory/${id}`) }),
    [navigate],
  )

  return (
    <PageContainer title="Tồn kho">
      <DataTable
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        searchPlaceholder="Tìm kiếm NVL..."
        emptyMessage="Chưa có dữ liệu tồn kho"
        filters={
          <>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40 h-9"
              aria-label="Từ ngày"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40 h-9"
              aria-label="Đến ngày"
            />

            <FilterMultiSelect
              label="Nhà cung cấp"
              options={supplierOptions.map((s) => ({ value: s, label: s }))}
              selected={selectedSuppliers}
              onChange={setSelectedSuppliers}
              className="w-52"
            />

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
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

            <Button variant="outline" size="sm" className="h-9" onClick={() => exportToCSV(filteredItems)}>
              <Download className="h-4 w-4 mr-1.5" />
              Xuất file
            </Button>
          </>
        }
      />
    </PageContainer>
  )
}
