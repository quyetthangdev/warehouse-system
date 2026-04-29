import { useState, useMemo } from 'react'
import { Plus, Download, Ban, CheckCircle, AlertTriangle, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { AppDialog, AppDialogFooter } from '@/components/common/app-dialog'
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
import { PaymentFilterDialog } from './payment-filter-dialog'
import { ReceiptFilterDialog } from './receipt-filter-dialog'
import {
  PAYMENT_FILTER_DEFAULT, RECEIPT_FILTER_DEFAULT,
} from '../payment-filters'
import type { PaymentFilterState, ReceiptFilterState } from '../payment-filters'
import {
  paymentTypeConfig, receiptTypeConfig, paymentStatusConfig, formatDate, formatVnd,
} from '../payment.utils'
import { getDebtWarnings } from '../debt-warning'
import type { DebtWarning } from '../debt-warning'
import type { Payment, Receipt } from '../types/payment.types'
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

function countActiveFilters(f: PaymentFilterState | ReceiptFilterState): number {
  let count = 0
  if (f.fromDate || f.toDate) count++
  if (f.type !== 'all') count++
  if (f.status !== 'all') count++
  if (f.supplier !== 'all') count++
  if ('method' in f && f.method !== 'all') count++
  return count
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

  const [activeTab, setActiveTab] = useState<'payments' | 'receipts'>('payments')

  // Filter state
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterState>(PAYMENT_FILTER_DEFAULT)
  const [receiptFilter, setReceiptFilter] = useState<ReceiptFilterState>(RECEIPT_FILTER_DEFAULT)
  const [paymentFilterOpen, setPaymentFilterOpen] = useState(false)
  const [receiptFilterOpen, setReceiptFilterOpen] = useState(false)

  // Debt warning dialog
  const [debtWarningOpen, setDebtWarningOpen] = useState(true)

  const filteredPayments = useMemo(() => {
    const { fromDate, toDate, type, status, method, supplier } = paymentFilter
    return payments.filter((p) => {
      if (type !== 'all' && p.paymentType !== type) return false
      if (status !== 'all' && p.status !== status) return false
      if (fromDate && p.paymentDate < fromDate) return false
      if (toDate && p.paymentDate > toDate) return false
      if (method !== 'all' && p.paymentMethod !== method) return false
      if (supplier !== 'all' && p.supplierId !== supplier) return false
      return true
    })
  }, [payments, paymentFilter])

  const filteredReceipts = useMemo(() => {
    const { fromDate, toDate, type, status, supplier } = receiptFilter
    return receipts.filter((r) => {
      if (type !== 'all' && r.receiptType !== type) return false
      if (status !== 'all' && r.status !== status) return false
      if (fromDate && r.receiptDate < fromDate) return false
      if (toDate && r.receiptDate > toDate) return false
      if (supplier !== 'all' && r.supplierId !== supplier) return false
      return true
    })
  }, [receipts, receiptFilter])

  const debtWarnings = useMemo(() => getDebtWarnings(payments), [payments])

  const paymentSummary = useMemo(() => {
    const confirmed = filteredPayments.filter((p) => p.status === 'confirmed')
    const draft = filteredPayments.filter((p) => p.status === 'draft')
    const totalConfirmed = confirmed.reduce((sum, p) => sum + p.totalAmount, 0)
    const totalDraft = draft.reduce((sum, p) => sum + p.totalAmount, 0)
    const totalDebt = draft
      .filter((p) => p.paymentTerms === 'debt')
      .reduce((sum, p) => sum + p.totalAmount, 0)
    return { totalConfirmed, totalDraft, totalDebt, confirmedCount: confirmed.length }
  }, [filteredPayments])

  const receiptSummary = useMemo(() => {
    const confirmed = filteredReceipts.filter((r) => r.status === 'confirmed')
    const totalConfirmed = confirmed.reduce((sum, r) => sum + r.totalAmount, 0)
    const totalAll = filteredReceipts.reduce((sum, r) => sum + r.totalAmount, 0)
    return { totalConfirmed, confirmedCount: confirmed.length, totalAll }
  }, [filteredReceipts])

  const paymentFilterCount = useMemo(() => countActiveFilters(paymentFilter), [paymentFilter])
  const receiptFilterCount = useMemo(() => countActiveFilters(receiptFilter), [receiptFilter])

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
    <PageContainer
      title="Chi phí"
      actions={
        canEdit ? (
          activeTab === 'payments' ? (
            <Button onClick={() => setPaymentDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Tạo phiếu chi
            </Button>
          ) : (
            <Button onClick={() => setReceiptDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Tạo phiếu thu
            </Button>
          )
        ) : undefined
      }
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'payments' | 'receipts')}>
        <TabsList>
          <TabsTrigger value="payments">Phiếu Chi</TabsTrigger>
          <TabsTrigger value="receipts">Phiếu Thu</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="rounded-lg border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Đã xác nhận</p>
              <p className="text-lg font-semibold mt-0.5">{formatVnd(paymentSummary.totalConfirmed)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{paymentSummary.confirmedCount} phiếu</p>
            </div>
            <div className="rounded-lg border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Chờ duyệt</p>
              <p className="text-lg font-semibold mt-0.5">{formatVnd(paymentSummary.totalDraft)}</p>
            </div>
            <div className="rounded-lg border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                Tổng công nợ
                {debtWarnings.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDebtWarningOpen(true)}
                    className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {debtWarnings.length}
                  </button>
                )}
              </p>
              <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                {formatVnd(paymentSummary.totalDebt)}
              </p>
            </div>
          </div>
          <DataTable
            columns={paymentColumns}
            data={filteredPayments}
            isLoading={isLoading}
            searchPlaceholder="Tìm kiếm phiếu chi..."
            emptyMessage="Chưa có phiếu chi nào"
            filters={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => setPaymentFilterOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                  {paymentFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 text-xs">
                      {paymentFilterCount}
                    </Badge>
                  )}
                </Button>
                {paymentFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-muted-foreground"
                    onClick={() => setPaymentFilter(PAYMENT_FILTER_DEFAULT)}
                  >
                    Xoá lọc
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
              </div>
            }
          />
        </TabsContent>

        <TabsContent value="receipts">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Đã xác nhận</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-0.5">
                {formatVnd(receiptSummary.totalConfirmed)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{receiptSummary.confirmedCount} phiếu</p>
            </div>
            <div className="rounded-lg border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Tổng thu (lọc hiện tại)</p>
              <p className="text-lg font-semibold mt-0.5">
                {formatVnd(receiptSummary.totalAll)}
              </p>
            </div>
          </div>
          <DataTable
            columns={receiptColumns}
            data={filteredReceipts}
            isLoading={isLoading}
            searchPlaceholder="Tìm kiếm phiếu thu..."
            emptyMessage="Chưa có phiếu thu nào"
            filters={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => setReceiptFilterOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                  {receiptFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 text-xs">
                      {receiptFilterCount}
                    </Badge>
                  )}
                </Button>
                {receiptFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-muted-foreground"
                    onClick={() => setReceiptFilter(RECEIPT_FILTER_DEFAULT)}
                  >
                    Xoá lọc
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
              </div>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Debt warning dialog */}
      <AppDialog
        open={debtWarnings.length > 0 && debtWarningOpen}
        onClose={() => setDebtWarningOpen(false)}
        icon={AlertTriangle}
        title={`Cảnh báo công nợ (${debtWarnings.length} phiếu)`}
        description="Một số phiếu chi công nợ cần được chú ý:"
      >
        <ul className="text-sm space-y-1.5 max-h-48 overflow-y-auto">
          {debtWarnings.map((w: DebtWarning) => (
            <li key={w.id} className="flex items-start gap-2">
              <span className={
                w.type === 'overdue'
                  ? 'text-destructive font-medium'
                  : 'text-amber-600 dark:text-amber-400 font-medium'
              }>
                {w.type === 'overdue' ? 'Quá hạn' : 'Sắp hạn'}
              </span>
              <span className="text-muted-foreground">
                {w.code} — {formatDate(w.dueDate)}
              </span>
            </li>
          ))}
        </ul>
        <AppDialogFooter>
          <Button type="button" onClick={() => setDebtWarningOpen(false)}>Đã hiểu</Button>
        </AppDialogFooter>
      </AppDialog>

      {/* Filter dialogs */}
      <PaymentFilterDialog
        open={paymentFilterOpen}
        filter={paymentFilter}
        onApply={setPaymentFilter}
        onClose={() => setPaymentFilterOpen(false)}
      />

      <ReceiptFilterDialog
        open={receiptFilterOpen}
        filter={receiptFilter}
        onApply={setReceiptFilter}
        onClose={() => setReceiptFilterOpen(false)}
      />

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
