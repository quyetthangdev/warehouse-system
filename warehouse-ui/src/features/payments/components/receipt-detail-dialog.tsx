import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/status-badge'
import {
  receiptTypeConfig, paymentStatusConfig, receiptMethodConfig, formatVnd, formatDate,
} from '../payment.utils'
import type { Receipt } from '../types/payment.types'

interface ReceiptDetailDialogProps {
  receipt: Receipt | null
  canEdit: boolean
  onConfirm: (receipt: Receipt) => void
  onCancel: (receipt: Receipt) => void
  onClose: () => void
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0 text-sm">
      <span className="text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-right font-medium">{value ?? '—'}</span>
    </div>
  )
}

export function ReceiptDetailDialog({ receipt, canEdit, onConfirm, onCancel, onClose }: ReceiptDetailDialogProps) {
  if (!receipt) return null
  const cfg = paymentStatusConfig[receipt.status]
  const isDraft = receipt.status === 'draft'

  return (
    <Dialog open={!!receipt} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu thu — {receipt.code}</DialogTitle>
        </DialogHeader>

        <div className="divide-y">
          <Row label="Trạng thái" value={<StatusBadge label={cfg.label} variant={cfg.variant} />} />
          <Row label="Ngày thu" value={formatDate(receipt.receiptDate)} />
          <Row label="Loại thu" value={receiptTypeConfig[receipt.receiptType]} />
          <Row label="Tiền trước VAT" value={formatVnd(receipt.amountBeforeVat)} />
          <Row label={`VAT (${receipt.vatPercent}%)`} value={formatVnd(receipt.vatAmount)} />
          <Row label="Tổng tiền thu" value={
            <span className="text-base font-semibold text-green-600 dark:text-green-400">
              {formatVnd(receipt.totalAmount)}
            </span>
          } />
          <Row label="Hình thức thu" value={receiptMethodConfig[receipt.receiptMethod]} />
          {receipt.transferCode && <Row label="Mã chuyển khoản" value={receipt.transferCode} />}
          <Row label="Đối tác" value={receipt.supplierName} />
          <Row label="Tham chiếu phiếu" value={receipt.formRef} />
          <Row label="Lý do thu" value={receipt.reason} />
          <Row label="Ghi chú" value={receipt.note} />
          <Row label="Người tạo" value={receipt.createdBy} />
          <Row label="Người phê duyệt" value={receipt.approvedBy} />
          {receipt.approvedAt && (
            <Row label="Ngày phê duyệt" value={formatDate(receipt.approvedAt.split('T')[0])} />
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          {canEdit && isDraft && (
            <>
              <Button variant="destructive" onClick={() => onCancel(receipt)}>Hủy phiếu</Button>
              <Button onClick={() => onConfirm(receipt)}>Xác nhận</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
