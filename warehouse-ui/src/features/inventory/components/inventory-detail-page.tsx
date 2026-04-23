// src/features/inventory/components/inventory-detail-page.tsx
import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { DataTable } from '@/components/common/data-table'
import { PageContainer } from '@/components/layout/page-container'
import { toast } from 'sonner'
import { useInventoryDetail } from '../hooks/use-inventory-detail'
import { StockMovementChart } from './stock-movement-chart'
import { StatCard } from './stat-card'
import { statusConfig, formatVnd } from '../inventory.utils'
import type { StockTransaction, StockBatch, TransactionType } from '../types/inventory.types'

const txTypeConfig: Record<TransactionType, { label: string; className: string }> = {
  import: { label: 'Nhập kho', className: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800' },
  export: { label: 'Xuất kho', className: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' },
  balance: { label: 'Kiểm kho', className: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
}

function getExpiryClass(expiryDate: string): string {
  const msLeft = new Date(expiryDate).getTime() - Date.now()
  if (msLeft < 30 * 24 * 60 * 60 * 1000) return 'text-destructive font-medium'
  if (msLeft < 90 * 24 * 60 * 60 * 1000) return 'text-yellow-600'
  return ''
}

const transactionColumns: ColumnDef<StockTransaction>[] = [
  {
    accessorKey: 'date',
    header: 'Ngày',
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString('vi-VN'),
  },
  {
    accessorKey: 'type',
    header: 'Loại',
    cell: ({ row }) => {
      const cfg = txTypeConfig[row.original.type] ?? { label: row.original.type, className: '' }
      return (
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
        >
          {cfg.label}
        </span>
      )
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Số lượng',
    cell: ({ row }) => {
      const q = row.original.quantity
      return (
        <span className={q >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
          {q >= 0 ? `+${q}` : q}
        </span>
      )
    },
  },
  { accessorKey: 'stockBefore', header: 'Tồn trước' },
  { accessorKey: 'stockAfter', header: 'Tồn sau' },
  { accessorKey: 'userName', header: 'Người thực hiện' },
  { accessorKey: 'referenceId', header: 'Mã chứng từ' },
]

const batchColumns: ColumnDef<StockBatch>[] = [
  { accessorKey: 'batchNumber', header: 'Số lô' },
  { accessorKey: 'quantity', header: 'Số lượng' },
  {
    accessorKey: 'mfgDate',
    header: 'Ngày SX',
    cell: ({ row }) => new Date(row.original.mfgDate).toLocaleDateString('vi-VN'),
  },
  {
    accessorKey: 'expiryDate',
    header: 'HSD',
    cell: ({ row }) => {
      const date = row.original.expiryDate
      return (
        <span className={getExpiryClass(date)}>
          {new Date(date).toLocaleDateString('vi-VN')}
        </span>
      )
    },
  },
  { accessorKey: 'supplierName', header: 'Nhà cung cấp' },
  { accessorKey: 'importFormId', header: 'Mã phiếu nhập' },
]

export function InventoryDetailPage() {
  const { materialId } = useParams<{ materialId: string }>()
  const navigate = useNavigate()
  const { detail, isLoading, error } = useInventoryDetail(materialId ?? '')

  // Fix 3 — date range filter state
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // toast survives component unmount via portal; navigate fires immediately after
  useEffect(() => {
    if (error) {
      toast.error(error)
      navigate('/inventory')
    }
  }, [error, navigate])

  // Fix 3 — filtered movement chart
  const filteredChart = useMemo(() => {
    if (!detail) return []
    return detail.movementChart.filter((p) => {
      if (dateFrom && p.date < dateFrom) return false
      if (dateTo && p.date > dateTo) return false
      return true
    })
  }, [detail, dateFrom, dateTo])

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </PageContainer>
    )
  }

  if (!detail) return null

  const statusCfg = statusConfig[detail.status] ?? { label: detail.status, variant: 'outline' as const }
  const sortedBatches = [...detail.batches].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
  )

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Fix 2 — Breadcrumb: Tồn kho > [Tên NVL] */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/inventory">Tồn kho</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{detail.materialName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold">{detail.materialName}</h1>
            <p className="text-sm text-muted-foreground">{detail.materialCode}</p>
          </div>
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard title="Tồn hiện tại" value={`${detail.currentStock} ${detail.unit}`} />
          <StatCard title="Giá trị tồn" value={formatVnd(detail.stockValue)} />
          <StatCard title="Tối thiểu" value={`${detail.minThreshold} ${detail.unit}`} />
          <StatCard title="Tối đa" value={`${detail.maxThreshold} ${detail.unit}`} />
        </div>

        <Tabs defaultValue="movement">
          <TabsList>
            <TabsTrigger value="movement">Biến động</TabsTrigger>
            <TabsTrigger value="transactions">Lịch sử giao dịch</TabsTrigger>
            <TabsTrigger value="batches">Lô hàng</TabsTrigger>
          </TabsList>

          <TabsContent value="movement" className="mt-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="mb-4 text-sm font-medium">
                Biến động nhập/xuất/kiểm 30 ngày gần nhất
              </p>

              {/* Fix 3 — Date range filter */}
              <div className="mb-4 flex flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="date-from" className="text-xs text-muted-foreground">
                    Từ ngày
                  </label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="date-to" className="text-xs text-muted-foreground">
                    Đến ngày
                  </label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>

              {filteredChart.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu biến động
                </p>
              ) : (
                <StockMovementChart data={filteredChart} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <DataTable
              columns={transactionColumns}
              data={detail.transactions}
              isLoading={false}
              searchPlaceholder="Tìm theo mã chứng từ, người thực hiện..."
            />
          </TabsContent>

          <TabsContent value="batches" className="mt-4">
            <DataTable
              columns={batchColumns}
              data={sortedBatches}
              isLoading={false}
              searchPlaceholder="Tìm theo số lô, nhà cung cấp..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}
