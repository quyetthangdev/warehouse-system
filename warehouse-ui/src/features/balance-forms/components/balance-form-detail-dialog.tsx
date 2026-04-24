import { useState, useEffect } from 'react'
import { Ban, CheckCircle, Play, Printer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DialogClose } from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { WideDialog } from '@/components/common/wide-dialog'
import { StatusBadge } from '@/components/common/status-badge'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAuthStore } from '@/stores/auth.store'
import { useWarehouseStore } from '@/stores/warehouse.store'
import toast from 'react-hot-toast'
import { useBalanceFormDetail } from '../hooks/use-balance-form-detail'
import {
  balanceFormStatusConfig,
  balanceTypeConfig,
  discrepancyReasonConfig,
  calcDiscrepancy,
  formatDate,
} from '../balance-form.utils'
import type { BalanceFormItem, DiscrepancyReason } from '../types/balance-form.types'
import { buildPrintHtml } from './balance-form-print-view'

function DetailContent({ formId, onClose }: { formId: string; onClose: () => void }) {
  const { form, isLoading, startForm, completeForm, cancelForm } = useBalanceFormDetail(formId)
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager', 'supervisor']))
  const { lockWarehouse, unlockWarehouse } = useWarehouseStore()

  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isActioning, setIsActioning] = useState(false)

  // Local editable items state
  const [editedItems, setEditedItems] = useState<BalanceFormItem[]>([])

  useEffect(() => {
    if (form) setEditedItems(form.items)
  }, [form])

  void onClose

  function updateItem(idx: number, field: keyof BalanceFormItem, value: unknown) {
    setEditedItems((prev) => {
      const updated = [...prev]
      const item = { ...updated[idx], [field]: value }
      if (field === 'actualQuantity') {
        const { discrepancy, discrepancyPercent } = calcDiscrepancy(item.systemQuantity, value as number | null)
        item.discrepancy = discrepancy
        item.discrepancyPercent = discrepancyPercent
      }
      updated[idx] = item
      return updated
    })
  }

  async function handleStart() {
    setIsActioning(true)
    const { ok, message } = await startForm()
    setIsActioning(false)
    if (ok) {
      lockWarehouse(formId)
      toast.success('Đã bắt đầu kiểm kho')
      setShowStartDialog(false)
    } else {
      toast.error(message ?? 'Không thể bắt đầu kiểm kho')
    }
  }

  async function handleComplete() {
    // BR-BAL-002: items >5% phải có reason
    const missing = editedItems.find(
      (item) =>
        item.discrepancyPercent !== null &&
        Math.abs(item.discrepancyPercent) > 5 &&
        !item.reason,
    )
    if (missing) {
      toast.error(`"${missing.materialName}" chênh lệch >5% — vui lòng chọn nguyên nhân`)
      setShowCompleteDialog(false)
      return
    }
    setIsActioning(true)
    const { ok, message } = await completeForm(editedItems)
    setIsActioning(false)
    if (ok) {
      unlockWarehouse()
      toast.success('Đã hoàn thành kiểm kho, tồn kho đã được cập nhật')
      setShowCompleteDialog(false)
    } else {
      toast.error(message ?? 'Không thể hoàn thành kiểm kho')
    }
  }

  async function handleCancel() {
    setIsActioning(true)
    const { ok, message } = await cancelForm()
    setIsActioning(false)
    if (ok) {
      if (form?.status === 'in_progress') unlockWarehouse()
      toast.success('Đã hủy phiếu kiểm')
      setShowCancelDialog(false)
    } else {
      toast.error(message ?? 'Không thể hủy phiếu')
    }
  }

  function handlePrint() {
    if (!form) return
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(buildPrintHtml(form))
    win.document.close()
    win.focus()
    win.onafterprint = () => win.close()
    win.print()
  }

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <Skeleton className="h-6 w-32" />
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm"><X className="h-4 w-4" /></Button>
          </DialogClose>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </>
    )
  }

  if (!form) {
    return (
      <>
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <p className="font-semibold">Phiếu kiểm</p>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm"><X className="h-4 w-4" /></Button>
          </DialogClose>
        </div>
        <div className="flex-1 p-6">
          <p className="text-muted-foreground">Không tìm thấy phiếu kiểm.</p>
        </div>
      </>
    )
  }

  const statusCfg = balanceFormStatusConfig[form.status]
  const isDraft = form.status === 'draft'
  const isInProgress = form.status === 'in_progress'
  const isEditable = isInProgress

  return (
    <>
      {/* Sticky header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold">{form.code}</h2>
          <StatusBadge label={statusCfg.label} variant={statusCfg.variant} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            In phiếu
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm"><X className="h-4 w-4" /></Button>
          </DialogClose>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Info */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Thông tin phiếu kiểm</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Loại kiểm</p>
              <p className="text-sm font-medium">{balanceTypeConfig[form.balanceType]}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Phạm vi</p>
              <p className="text-sm font-medium">{form.scope === 'full' ? 'Toàn bộ' : 'Một phần'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Ngày kiểm</p>
              <p className="text-sm font-medium">{formatDate(form.balanceDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Người tạo</p>
              <p className="text-sm font-medium">{form.createdBy}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-0.5">Người kiểm</p>
              <p className="text-sm font-medium">{form.inspectors.join(', ')}</p>
            </div>
            {form.note && (
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs text-muted-foreground mb-0.5">Ghi chú</p>
                <p className="text-sm font-medium">{form.note}</p>
              </div>
            )}
            {form.attachmentNames && form.attachmentNames.length > 0 && (
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs text-muted-foreground mb-0.5">File đính kèm</p>
                <p className="text-sm font-medium">{form.attachmentNames.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-border" />

        {/* Items table */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Danh sách NVL
            <span className="ml-2 normal-case font-normal">({editedItems.length})</span>
          </h3>

          {isInProgress && (
            <p className="text-xs text-muted-foreground mb-3">Nhập số lượng thực tế cho từng nguyên vật liệu.</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-muted-foreground">NVL</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground w-16">ĐVT</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground w-24">Sổ sách</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground w-28">Thực tế</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground w-20">CL</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground w-16">%</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground w-40">Nguyên nhân</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {editedItems.map((item, idx) => {
                  const pct = item.discrepancyPercent
                  const isHighAlert = pct !== null && Math.abs(pct) > 10
                  const isMedAlert = pct !== null && Math.abs(pct) > 5 && !isHighAlert
                  const pctColor = isHighAlert ? 'text-destructive font-semibold' : isMedAlert ? 'text-yellow-600' : ''

                  return (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 pr-2">{item.materialName}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{item.unit}</td>
                      <td className="py-2 pr-2 text-right">{item.systemQuantity}</td>
                      <td className="py-2 pr-2">
                        {isEditable ? (
                          <Input
                            type="number"
                            min={0}
                            value={item.actualQuantity ?? ''}
                            onChange={(e) => updateItem(idx, 'actualQuantity', e.target.value === '' ? null : Number(e.target.value))}
                            className="h-7 w-20 text-right"
                          />
                        ) : (
                          <span className="text-right block">{item.actualQuantity ?? '—'}</span>
                        )}
                      </td>
                      <td className={`py-2 pr-2 text-right ${pctColor}`}>
                        {item.discrepancy !== null ? (item.discrepancy > 0 ? '+' : '') + item.discrepancy : '—'}
                      </td>
                      <td className={`py-2 pr-2 text-right ${pctColor}`}>
                        {pct !== null ? (pct > 0 ? '+' : '') + pct.toFixed(1) + '%' : '—'}
                      </td>
                      <td className="py-2 pr-2">
                        {isEditable ? (
                          <div className="space-y-1">
                            <Select
                              value={item.reason ?? ''}
                              onValueChange={(v) => updateItem(idx, 'reason', v as DiscrepancyReason)}
                            >
                              <SelectTrigger className="h-7 w-36 text-xs">
                                <SelectValue placeholder="Chọn..." />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(discrepancyReasonConfig) as DiscrepancyReason[]).map((key) => (
                                  <SelectItem key={key} value={key} className="text-xs">
                                    {discrepancyReasonConfig[key]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {item.reason === 'other' && (
                              <Input
                                placeholder="Mô tả..."
                                value={item.reasonText ?? ''}
                                onChange={(e) => updateItem(idx, 'reasonText', e.target.value)}
                                className="h-7 text-xs w-36"
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {item.reason ? discrepancyReasonConfig[item.reason] : '—'}
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        {isEditable ? (
                          <Input
                            placeholder="Ghi chú"
                            value={item.note ?? ''}
                            onChange={(e) => updateItem(idx, 'note', e.target.value)}
                            className="h-7 text-xs"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">{item.note ?? '—'}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      {canEdit && (isDraft || isInProgress) && (
        <div className="border-t px-6 py-3 flex justify-end gap-2 shrink-0 bg-background">
          <Button variant="destructive" size="sm" onClick={() => setShowCancelDialog(true)}>
            <Ban className="h-4 w-4 mr-1.5" />
            Hủy phiếu
          </Button>
          {isDraft && (
            <Button size="sm" onClick={() => setShowStartDialog(true)}>
              <Play className="h-4 w-4 mr-1.5" />
              Bắt đầu kiểm
            </Button>
          )}
          {isInProgress && (
            <Button size="sm" onClick={() => setShowCompleteDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Hoàn thành kiểm kho
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={showStartDialog}
        title="Bắt đầu kiểm kho"
        description={`Bắt đầu kiểm kho phiếu "${form.code}"? Kho sẽ bị khóa tạo phiếu nhập/xuất trong thời gian kiểm.`}
        icon={Play}
        confirmLabel="Bắt đầu"
        isLoading={isActioning}
        onConfirm={handleStart}
        onCancel={() => setShowStartDialog(false)}
      />
      <ConfirmDialog
        open={showCompleteDialog}
        title="Hoàn thành kiểm kho"
        description="Xác nhận hoàn thành? Tồn kho sẽ được điều chỉnh theo số liệu thực tế."
        icon={CheckCircle}
        confirmLabel="Hoàn thành"
        isLoading={isActioning}
        onConfirm={handleComplete}
        onCancel={() => setShowCompleteDialog(false)}
      />
      <ConfirmDialog
        open={showCancelDialog}
        title="Hủy phiếu kiểm"
        description={`Bạn có chắc muốn hủy phiếu "${form.code}"?`}
        icon={Ban}
        confirmLabel="Hủy phiếu"
        confirmVariant="destructive"
        isLoading={isActioning}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
    </>
  )
}

export function BalanceFormDetailDialog({
  formId,
  onClose,
}: {
  formId: string | null
  onClose: () => void
}) {
  return (
    <WideDialog open={!!formId} onClose={onClose}>
      {formId && <DetailContent formId={formId} onClose={onClose} />}
    </WideDialog>
  )
}
