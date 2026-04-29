import { Paperclip } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/status-badge'
import {
  paymentTypeConfig, paymentStatusConfig, paymentMethodConfig,
  paymentTermsConfig, formatVnd, formatDate,
} from '../payment.utils'
import type { Payment } from '../types/payment.types'
import { useAuthStore } from '@/stores/auth.store'

interface PaymentDetailDialogProps {
  payment: Payment | null
  canEdit: boolean
  onConfirm: (payment: Payment) => void
  onCancel: (payment: Payment) => void
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

export function PaymentDetailDialog({ payment, canEdit, onConfirm, onCancel, onClose }: PaymentDetailDialogProps) {
  const currentUserName = useAuthStore((s) => s.user?.fullName ?? '')
  if (!payment) return null
  const cfg = paymentStatusConfig[payment.status]
  const isDraft = payment.status === 'draft'
  const isSameAsCreator = currentUserName !== '' && currentUserName === payment.createdBy

  return (
    <Dialog open={!!payment} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết phiếu chi — {payment.code}</DialogTitle>
        </DialogHeader>

        <div className="divide-y">
          <Row label="Trạng thái" value={<StatusBadge label={cfg.label} variant={cfg.variant} />} />
          <Row label="Ngày chi" value={formatDate(payment.paymentDate)} />
          <Row label="Loại chi" value={paymentTypeConfig[payment.paymentType]} />
          <Row label="Tiền trước VAT" value={formatVnd(payment.amountBeforeVat)} />
          <Row label={`VAT (${payment.vatPercent}%)`} value={formatVnd(payment.vatAmount)} />
          <Row label="Tổng tiền" value={
            <span className="text-base font-semibold">{formatVnd(payment.totalAmount)}</span>
          } />
          <Row label="Điều khoản TT" value={paymentTermsConfig[payment.paymentTerms]} />
          {payment.debtDays && <Row label="Số ngày công nợ" value={`${payment.debtDays} ngày`} />}
          {payment.dueDate && <Row label="Ngày đến hạn" value={formatDate(payment.dueDate)} />}
          <Row label="Hình thức TT" value={paymentMethodConfig[payment.paymentMethod]} />
          {payment.transferCode && <Row label="Mã chuyển khoản" value={payment.transferCode} />}
          <Row label="Nhà cung cấp" value={payment.supplierName} />
          <Row label="Phiếu nhập tham chiếu" value={payment.importFormRef} />
          <Row label="Lý do chi" value={payment.reason} />
          <Row label="Ghi chú" value={payment.note} />
          <Row label="Người tạo" value={payment.createdBy} />
          <Row label="Người phê duyệt" value={payment.approvedBy} />
          {payment.approvedAt && (
            <Row label="Ngày phê duyệt" value={formatDate(payment.approvedAt.split('T')[0])} />
          )}
          {payment.attachments && payment.attachments.length > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground w-40 shrink-0">Chứng từ</span>
              <ul className="text-right space-y-0.5">
                {payment.attachments.map((f) => (
                  <li key={f} className="flex items-center justify-end gap-1.5 text-xs">
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-[180px]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          {canEdit && isDraft && (
            <>
              <Button variant="destructive" onClick={() => onCancel(payment)}>Hủy phiếu</Button>
              <div className="flex flex-col items-end gap-1">
                {isSameAsCreator && (
                  <p className="text-xs text-muted-foreground">
                    Người tạo phiếu không thể tự phê duyệt
                  </p>
                )}
                <Button onClick={() => onConfirm(payment)} disabled={isSameAsCreator}>
                  Xác nhận
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
