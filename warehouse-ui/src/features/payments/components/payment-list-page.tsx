import { useState, useMemo } from 'react'
import { Plus, Download, Ban, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'react-hot-toast'
import { usePayments } from '../hooks/use-payments'
import { PaymentDialog } from './payment-dialog'
import { ReceiptDialog } from './receipt-dialog'
import { PaymentDetailDialog } from './payment-detail-dialog'
import { ReceiptDetailDialog } from './receipt-detail-dialog'
import { getPaymentColumns } from './payment-columns'
import { getReceiptColumns } from './receipt-columns'
import {
  paymentTypeConfig, receiptTypeConfig, paymentStatusConfig, formatVnd,
} from '../payment.utils'
import type { Payment, Receipt, PaymentStatus, PaymentType, ReceiptType } from '../types/payment.types'
import type { PaymentValues, ReceiptValues } from '../schemas/payment.schema'

function exportPaymentsCSV(payments: Payment[]) {
  const headers = ['Mã phiếu', 'Ngày chi', 'Loại chi', 'Tiền trước VAT', 'VAT%', 'Tổng tiền', 'Hình thức TT', 'NCC', 'Phiếu nhập', 'Trạng thái', 'Người tạo', 'Người phê duyệt']
  const rows = payments.map((p) => [
    p.code, p.paymentDate, paymentTypeConfig[p.paymentType],
    p.amountBeforeVat, p.vatPercent, p.totalAmount,
    p.paymentMethod, p.supplierName ?? '', p.importFormRef ?? '',
    paymentStatusConfig[p.status].label, p.createdBy, p.approvedBy ?? '',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `phieu-chi-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function exportReceiptsCSV(receipts: Receipt[]) {
  const headers = ['Mã phiếu', 'Ngày thu', 'Loại thu', 'Tiền trước VAT', 'VAT%', 'Tổng tiền', 'Hình thức thu', 'Đối tác', 'Tham chiếu', 'Trạng thái', 'Người tạo', 'Người phê duyệt']
  const rows = receipts.map((r) => [
    r.code, r.receiptDate, receiptTypeConfig[r.receiptType],
    r.amountBeforeVat, r.vatPercent, r.totalAmount,
    r.receiptMethod, r.supplierName ?? '', r.formRef ?? '',
    paymentStatusConfig[r.status].label, r.createdBy, r.approvedBy ?? '',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `phieu-thu-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function PaymentListPage() {
  const {
    payments, receipts, isLoading,
    createPayment, confirmPayment, cancelPayment,
    createReceipt, confirmReceipt, cancelReceipt,
  } = usePayments()

  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager', 'supervisor']))

  // Payment state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null)
  const [confirmPaymentTarget, setConfirmPaymentTarget] = useState<Payment | undefined>()
  const [cancelPaymentTarget, setCancelPaymentTarget] = useState<Payment | undefined>()
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false)
  const [isCancellingPayment, setIsCancellingPayment] = useState(false)

  // Receipt state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [detailReceipt, setDetailReceipt] = useState<Receipt | null>(null)
  const [confirmReceiptTarget, setConfirmReceiptTarget] = useState<Receipt | undefined>()
  const [cancelReceiptTarget, setCancelReceiptTarget] = useState<Receipt | undefined>()
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false)
  const [isCancellingReceipt, setIsCancellingReceipt] = useState(false)

  // Payment filters
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentType | 'all'>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all')

  // Receipt filters
  const [receiptTypeFilter, setReceiptTypeFilter] = useState<ReceiptType | 'all'>('all')
  const [receiptStatusFilter, setReceiptStatusFilter] = useState<PaymentStatus | 'all'>('all')

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (paymentTypeFilter !== 'all' && p.paymentType !== paymentTypeFilter) return false
      if (paymentStatusFilter !== 'all' && p.status !== paymentStatusFilter) return false
      return true
    })
  }, [payments, paymentTypeFilter, paymentStatusFilter])

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      if (receiptTypeFilter !== 'all' && r.receiptType !== receiptTypeFilter) return false
      if (receiptStatusFilter !== 'all' && r.status !== receiptStatusFilter) return false
      return true
    })
  }, [receipts, receiptTypeFilter, receiptStatusFilter])

  const confirmedPaymentsTotal = useMemo(
    () => payments.filter((p) => p.status === 'confirmed').reduce((sum, p) => sum + p.totalAmount, 0),
    [payments],
  )

  const confirmedReceiptsTotal = useMemo(
    () => receipts.filter((r) => r.status === 'confirmed').reduce((sum, r) => sum + r.totalAmount, 0),
    [receipts],
  )

  const hasPaymentFilters = paymentTypeFilter !== 'all' || paymentStatusFilter !== 'all'
  const hasReceiptFilters = receiptTypeFilter !== 'all' || receiptStatusFilter !== 'all'

  const paymentColumns = useMemo(
    () => getPaymentColumns({
      canEdit,
      onViewDetail: (p) => setDetailPayment(p),
      onConfirm: (p) => setConfirmPaymentTarget(p),
      onCancel: (p) => setCancelPaymentTarget(p),
    }),
    [canEdit],
  )

  const receiptColumns = useMemo(
    () => getReceiptColumns({
      canEdit,
      onViewDetail: (r) => setDetailReceipt(r),
      onConfirm: (r) => setConfirmReceiptTarget(r),
      onCancel: (r) => setCancelReceiptTarget(r),
    }),
    [canEdit],
  )

  async function handleCreatePayment(values: PaymentValues) {
    const { ok, message } = await createPayment(values)
    if (ok) {
      toast.success('Tạo phiếu chi thành công')
      setPaymentDialogOpen(false)
    } else {
      toast.error(message ?? 'Có lỗi xảy ra')
    }
  }

  async function handleCreateReceipt(values: ReceiptValues) {
    const { ok, message } = await createReceipt(values)
    if (ok) {
      toast.success('Tạo phiếu thu thành công')
      setReceiptDialogOpen(false)
    } else {
      toast.error(message ?? 'Có lỗi xảy ra')
    }
  }

  async function handleConfirmPayment() {
    if (!confirmPaymentTarget) return
    setIsConfirmingPayment(true)
    const { ok, message } = await confirmPayment(confirmPaymentTarget.id)
    setIsConfirmingPayment(false)
    if (ok) {
      toast.success('Đã xác nhận phiếu chi')
      setConfirmPaymentTarget(undefined)
    } else {
      toast.error(message ?? 'Không thể xác nhận phiếu chi')
    }
  }

  async function handleCancelPayment() {
    if (!cancelPaymentTarget) return
    setIsCancellingPayment(true)
    const { ok, message } = await cancelPayment(cancelPaymentTarget.id)
    setIsCancellingPayment(false)
    if (ok) {
      toast.success('Đã hủy phiếu chi')
      setCancelPaymentTarget(undefined)
    } else {
      toast.error(message ?? 'Không thể hủy phiếu chi')
    }
  }

  async function handleConfirmReceipt() {
    if (!confirmReceiptTarget) return
    setIsConfirmingReceipt(true)
    const { ok, message } = await confirmReceipt(confirmReceiptTarget.id)
    setIsConfirmingReceipt(false)
    if (ok) {
      toast.success('Đã xác nhận phiếu thu')
      setConfirmReceiptTarget(undefined)
    } else {
      toast.error(message ?? 'Không thể xác nhận phiếu thu')
    }
  }

  async function handleCancelReceipt() {
    if (!cancelReceiptTarget) return
    setIsCancellingReceipt(true)
    const { ok, message } = await cancelReceipt(cancelReceiptTarget.id)
    setIsCancellingReceipt(false)
    if (ok) {
      toast.success('Đã hủy phiếu thu')
      setCancelReceiptTarget(undefined)
    } else {
      toast.error(message ?? 'Không thể hủy phiếu thu')
    }
  }

  return (
    <PageContainer title="Chi phí">
      <Tabs defaultValue="payments">
        <TabsList className="mb-4">
          <TabsTrigger value="payments">
            Phiếu Chi
            {confirmedPaymentsTotal > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
                {formatVnd(confirmedPaymentsTotal)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="receipts">
            Phiếu Thu
            {confirmedReceiptsTotal > 0 && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                {formatVnd(confirmedReceiptsTotal)}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <DataTable
            columns={paymentColumns}
            data={filteredPayments}
            isLoading={isLoading}
            searchPlaceholder="Tìm kiếm phiếu chi..."
            emptyMessage="Chưa có phiếu chi nào"
            filters={
              <>
                <Select
                  value={paymentTypeFilter}
                  onValueChange={(v) => setPaymentTypeFilter(v as PaymentType | 'all')}
                >
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue placeholder="Loại chi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {(Object.entries(paymentTypeConfig) as [PaymentType, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={paymentStatusFilter}
                  onValueChange={(v) => setPaymentStatusFilter(v as PaymentStatus | 'all')}
                >
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>

                {hasPaymentFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-muted-foreground"
                    onClick={() => { setPaymentTypeFilter('all'); setPaymentStatusFilter('all') }}
                  >
                    Xoá bộ lọc
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => exportPaymentsCSV(filteredPayments)}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Xuất file
                </Button>

                {canEdit && (
                  <Button size="sm" className="h-9" onClick={() => setPaymentDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Tạo phiếu chi
                  </Button>
                )}
              </>
            }
          />
        </TabsContent>

        <TabsContent value="receipts">
          <DataTable
            columns={receiptColumns}
            data={filteredReceipts}
            isLoading={isLoading}
            searchPlaceholder="Tìm kiếm phiếu thu..."
            emptyMessage="Chưa có phiếu thu nào"
            filters={
              <>
                <Select
                  value={receiptTypeFilter}
                  onValueChange={(v) => setReceiptTypeFilter(v as ReceiptType | 'all')}
                >
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue placeholder="Loại thu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {(Object.entries(receiptTypeConfig) as [ReceiptType, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={receiptStatusFilter}
                  onValueChange={(v) => setReceiptStatusFilter(v as PaymentStatus | 'all')}
                >
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>

                {hasReceiptFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-muted-foreground"
                    onClick={() => { setReceiptTypeFilter('all'); setReceiptStatusFilter('all') }}
                  >
                    Xoá bộ lọc
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => exportReceiptsCSV(filteredReceipts)}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Xuất file
                </Button>

                {canEdit && (
                  <Button size="sm" className="h-9" onClick={() => setReceiptDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Tạo phiếu thu
                  </Button>
                )}
              </>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Payment dialogs */}
      <PaymentDialog
        open={paymentDialogOpen}
        onSubmit={handleCreatePayment}
        onClose={() => setPaymentDialogOpen(false)}
      />

      <PaymentDetailDialog
        payment={detailPayment}
        canEdit={canEdit}
        onConfirm={(p) => { setDetailPayment(null); setConfirmPaymentTarget(p) }}
        onCancel={(p) => { setDetailPayment(null); setCancelPaymentTarget(p) }}
        onClose={() => setDetailPayment(null)}
      />

      <ConfirmDialog
        open={!!confirmPaymentTarget}
        title="Xác nhận phiếu chi"
        description={`Bạn có chắc muốn xác nhận phiếu "${confirmPaymentTarget?.code}"?`}
        icon={CheckCircle}
        confirmLabel="Xác nhận"
        isLoading={isConfirmingPayment}
        onConfirm={handleConfirmPayment}
        onCancel={() => setConfirmPaymentTarget(undefined)}
      />

      <ConfirmDialog
        open={!!cancelPaymentTarget}
        title="Hủy phiếu chi"
        description={`Bạn có chắc muốn hủy phiếu "${cancelPaymentTarget?.code}"? Hành động này không thể hoàn tác.`}
        icon={Ban}
        confirmLabel="Hủy phiếu"
        confirmVariant="destructive"
        isLoading={isCancellingPayment}
        onConfirm={handleCancelPayment}
        onCancel={() => setCancelPaymentTarget(undefined)}
      />

      {/* Receipt dialogs */}
      <ReceiptDialog
        open={receiptDialogOpen}
        onSubmit={handleCreateReceipt}
        onClose={() => setReceiptDialogOpen(false)}
      />

      <ReceiptDetailDialog
        receipt={detailReceipt}
        canEdit={canEdit}
        onConfirm={(r) => { setDetailReceipt(null); setConfirmReceiptTarget(r) }}
        onCancel={(r) => { setDetailReceipt(null); setCancelReceiptTarget(r) }}
        onClose={() => setDetailReceipt(null)}
      />

      <ConfirmDialog
        open={!!confirmReceiptTarget}
        title="Xác nhận phiếu thu"
        description={`Bạn có chắc muốn xác nhận phiếu "${confirmReceiptTarget?.code}"?`}
        icon={CheckCircle}
        confirmLabel="Xác nhận"
        isLoading={isConfirmingReceipt}
        onConfirm={handleConfirmReceipt}
        onCancel={() => setConfirmReceiptTarget(undefined)}
      />

      <ConfirmDialog
        open={!!cancelReceiptTarget}
        title="Hủy phiếu thu"
        description={`Bạn có chắc muốn hủy phiếu "${cancelReceiptTarget?.code}"? Hành động này không thể hoàn tác.`}
        icon={Ban}
        confirmLabel="Hủy phiếu"
        confirmVariant="destructive"
        isLoading={isCancellingReceipt}
        onConfirm={handleCancelReceipt}
        onCancel={() => setCancelReceiptTarget(undefined)}
      />
    </PageContainer>
  )
}
