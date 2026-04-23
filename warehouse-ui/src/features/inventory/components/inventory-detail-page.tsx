// src/features/inventory/components/inventory-detail-page.tsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DataTable } from '@/components/common/data-table'
import { PageContainer } from '@/components/layout/page-container'
import { toast } from 'sonner'
import { useInventoryDetail } from '../hooks/use-inventory-detail'
import { StockMovementChart } from './stock-movement-chart'
import { StatCard } from './stat-card'
import type { StockTransaction, StockBatch, StockStatus, TransactionType } from '../types/inventory.types'

const statusConfig: Record<
  StockStatus,
  { label: string; variant: 'destructive' | 'outline' | 'default' | 'secondary' }
> = {
  out: { label: 'Hết hàng', variant: 'destructive' },
  low: { label: 'Tồn thấp', variant: 'destructive' },
  normal: { label: 'Bình thường', variant: 'outline' },
  high: { label: 'Tồn cao', variant: 'secondary' },
}

const txTypeConfig: Record<TransactionType, { label: string; className: string }> = {
  import: { label: 'Nhập kho', className: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800' },
  export: { label: 'Xuất kho', className: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' },
  balance: { label: 'Kiểm kho', className: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
}

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

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

  // toast survives component unmount via portal; navigate fires immediately after
  useEffect(() => {
    if (error) {
      toast.error(error)
      navigate('/inventory')
    }
  }, [error, navigate])

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
              {detail.movementChart.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu biến động
                </p>
              ) : (
                <StockMovementChart data={detail.movementChart} />
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
