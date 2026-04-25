import { useState } from 'react'
import { Ban, CheckCircle, Plus, Printer, X } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { DialogClose } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WideDialog } from '@/components/common/wide-dialog'
import { StatusBadge } from '@/components/common/status-badge'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAuthStore } from '@/stores/auth.store'
import { useMaterials } from '@/features/materials/hooks/use-materials'
import { useInventory } from '@/features/inventory/hooks/use-inventory'
import { toast } from 'react-hot-toast'
import { useExportFormDetail } from '../hooks/use-export-form-detail'
import { exportFormStatusConfig, exportTypeConfig, disposalReasonConfig, formatDate } from '../export-form.utils'
import type { ExportFormItem } from '../types/export-form.types'
import { buildPrintHtml } from './export-form-print-view'

const emptyAddItem = { materialId: '', materialName: '', unit: '', quantity: 1, expiryDate: '', note: '' }

const itemColumns: ColumnDef<ExportFormItem>[] = [
  { accessorKey: 'materialName', header: 'Nguyên vật liệu', size: 200 },
  {
    accessorKey: 'quantity',
    header: 'Số lượng',
    size: 100,
    cell: ({ row }) => `${row.original.quantity} ${row.original.unit}`,
  },
  {
    accessorKey: 'unitPrice',
    header: 'Đơn giá',
    size: 120,
    cell: ({ row }) =>
      row.original.unitPrice != null
        ? new Intl.NumberFormat('vi-VN').format(row.original.unitPrice) + ' đ'
        : '—',
  },
  {
    id: 'lineTotal',
    header: 'Thành tiền',
    size: 130,
    cell: ({ row }) => {
      const total = (row.original.unitPrice ?? 0) * row.original.quantity
      return new Intl.NumberFormat('vi-VN').format(total) + ' đ'
    },
  },
  {
    accessorKey: 'expiryDate',
    header: 'Hạn SD',
    size: 110,
    cell: ({ row }) => formatDate(row.original.expiryDate),
  },
  {
    accessorKey: 'note',
    header: 'Ghi chú',
    cell: ({ row }) => row.original.note ?? '—',
  },
]

function InfoRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

function DetailContent({ formId, onClose }: { formId: string; onClose: () => void }) {
  const { form, isLoading, confirmForm, cancelForm, addItem } = useExportFormDetail(formId)
  const { materials } = useMaterials()
  const { items: inventoryItems } = useInventory()
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager', 'supervisor']))

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isActioning, setIsActioning] = useState(false)
  const [showAddRow, setShowAddRow] = useState(false)
  const [addRowItem, setAddRowItem] = useState({ ...emptyAddItem })
  const [isAddingItem, setIsAddingItem] = useState(false)

  const addRowStock = addRowItem.materialId
    ? (inventoryItems.find((i) => i.materialId === addRowItem.materialId)?.currentStock ?? null)
    : null
  const addRowStockExceeded = addRowStock !== null && addRowItem.quantity > addRowStock

  void onClose

  function handleSelectMaterial(materialId: string) {
    const mat = materials.find((m) => m.id === materialId)
    setAddRowItem((prev) => ({
      ...prev, materialId, materialName: mat?.name ?? '', unit: mat?.baseUnit?.symbol ?? '',
    }))
  }

  async function handleAddItem() {
    if (!addRowItem.materialId || addRowItem.quantity <= 0 || !addRowItem.expiryDate) return
    if (addRowStockExceeded && addRowStock !== null) {
      toast.error(`Số lượng xuất vượt tồn kho hiện tại (còn ${addRowStock} ${addRowItem.unit})`)
      return
    }
    setIsAddingItem(true)
    const { ok, message } = await addItem({
      materialId: addRowItem.materialId,
      materialName: addRowItem.materialName,
      unit: addRowItem.unit,
      quantity: addRowItem.quantity,
      expiryDate: addRowItem.expiryDate,
      note: addRowItem.note || undefined,
    })
    setIsAddingItem(false)
    if (ok) {
      toast.success('Đã thêm sản phẩm')
      setAddRowItem({ ...emptyAddItem })
      setShowAddRow(false)
    } else {
      toast.error(message ?? 'Không thể thêm sản phẩm')
    }
  }

  async function handleCancel() {
    setIsActioning(true)
    const { ok, message } = await cancelForm()
    setIsActioning(false)
    if (ok) {
      toast.success('Đã hủy phiếu xuất')
      setShowCancelDialog(false)
    } else {
      toast.error(message ?? 'Không thể hủy phiếu')
    }
  }

  async function handleConfirm() {
    setIsActioning(true)
    const { ok, message } = await confirmForm()
    setIsActioning(false)
    if (ok) {
      toast.success('Đã xác nhận xuất kho')
      setShowConfirmDialog(false)
      // BR-EXP-003: cảnh báo nếu tồn sau xuất < ngưỡng tối thiểu
      const lowStockItems = form!.items.filter((item) => {
        const inv = inventoryItems.find((i) => i.materialId === item.materialId)
        if (!inv) return false
        return (inv.currentStock - item.quantity) < inv.minThreshold
      })
      if (lowStockItems.length > 0) {
        const names = lowStockItems.map((i) => i.materialName).join(', ')
        toast(`⚠️ Tồn kho dưới mức tối thiểu: ${names}`, { duration: 5000 })
      }
    } else {
      toast.error(message ?? 'Không thể xác nhận phiếu')
    }
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
          <p className="font-semibold">Phiếu xuất</p>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm"><X className="h-4 w-4" /></Button>
          </DialogClose>
        </div>
        <div className="flex-1 p-6">
          <p className="text-muted-foreground">Không tìm thấy phiếu xuất.</p>
        </div>
      </>
    )
  }

  function handlePrint() {
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(buildPrintHtml(form!))
    win.document.close()
    win.focus()
    win.onafterprint = () => win.close()
    win.print()
  }

  const statusCfg = exportFormStatusConfig[form.status]
  const isDraft = form.status === 'draft'

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
        {/* Info grid */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Thông tin phiếu xuất</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <InfoRow label="Loại xuất" value={exportTypeConfig[form.exportType]?.label ?? form.exportType} />
            <InfoRow label="Ngày xuất" value={formatDate(form.exportDate)} />
            <InfoRow label="Người xuất" value={form.exportedBy} />
            {form.recipient && <InfoRow label="Người nhận" value={form.recipient} />}
            {form.approvedBy && <InfoRow label="Người phê duyệt" value={form.approvedBy} />}
            {/* Disposal */}
            {form.disposalReason && (
              <InfoRow label="Lý do hủy" value={disposalReasonConfig[form.disposalReason]} />
            )}
            {form.disposalReasonText && (
              <InfoRow label="Chi tiết lý do" value={form.disposalReasonText} />
            )}
            {/* Transfer */}
            {form.destinationWarehouseName && (
              <InfoRow label="Kho nhận" value={form.destinationWarehouseName} />
            )}
            {/* Other */}
            {form.customReason && (
              <InfoRow label="Mục đích xuất" value={form.customReason} />
            )}
            {form.note && (
              <InfoRow label="Ghi chú" value={form.note} className="col-span-2 sm:col-span-3" />
            )}
            {(form.totalValue != null || form.items.length > 0) && (
              <div className="col-span-2 sm:col-span-3 pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-0.5">Tổng giá trị</p>
                <p className="text-sm font-semibold text-primary">
                  {new Intl.NumberFormat('vi-VN').format(
                    form.totalValue ?? form.items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0)
                  )} đ
                </p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-border" />

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Danh sách sản phẩm
              <span className="ml-2 normal-case font-normal">({form.items.length})</span>
            </h3>
            {canEdit && isDraft && !showAddRow && (
              <Button size="sm" variant="outline" onClick={() => setShowAddRow(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm sản phẩm
              </Button>
            )}
          </div>

          {form.items.length === 0 && !showAddRow ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Chưa có sản phẩm nào</p>
          ) : (
            <DataTable columns={itemColumns} data={form.items} hideToolbar emptyMessage="Chưa có sản phẩm nào" />
          )}

          {showAddRow && (
            <div className="mt-4 rounded-md border p-4 space-y-3 bg-muted/30">
              <p className="text-sm font-medium">Thêm sản phẩm</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <Label className="text-xs">NVL *</Label>
                  <Select value={addRowItem.materialId} onValueChange={handleSelectMaterial}>
                    <SelectTrigger><SelectValue placeholder="Chọn NVL" /></SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name} ({m.baseUnit.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Số lượng *</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number" min={1}
                      value={addRowItem.quantity}
                      onChange={(e) => setAddRowItem((p) => ({ ...p, quantity: Number(e.target.value) }))}
                      className={`flex-1 ${addRowStockExceeded ? 'border-destructive' : ''}`}
                    />
                    {addRowItem.unit && <span className="text-sm text-muted-foreground shrink-0">{addRowItem.unit}</span>}
                  </div>
                  {addRowStockExceeded && addRowStock !== null && (
                    <p className="text-xs text-destructive">
                      Vượt tồn kho (còn {addRowStock} {addRowItem.unit})
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Hạn sử dụng *</Label>
                  <Input
                    type="date"
                    value={addRowItem.expiryDate}
                    onChange={(e) => setAddRowItem((p) => ({ ...p, expiryDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-3">
                  <Label className="text-xs">Ghi chú</Label>
                  <Input
                    placeholder="Ghi chú"
                    value={addRowItem.note}
                    onChange={(e) => setAddRowItem((p) => ({ ...p, note: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button" variant="outline" size="sm" disabled={isAddingItem}
                  onClick={() => { setShowAddRow(false); setAddRowItem({ ...emptyAddItem }) }}
                >
                  Hủy
                </Button>
                <Button
                  type="button" size="sm"
                  disabled={!addRowItem.materialId || addRowItem.quantity <= 0 || !addRowItem.expiryDate || isAddingItem}
                  onClick={handleAddItem}
                >
                  {isAddingItem ? 'Đang thêm...' : 'Thêm'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer — draft + canEdit only */}
      {canEdit && isDraft && (
        <div className="border-t px-6 py-3 flex justify-end gap-2 shrink-0 bg-background">
          <Button variant="destructive" size="sm" onClick={() => setShowCancelDialog(true)}>
            <Ban className="h-4 w-4 mr-1.5" />
            Hủy phiếu
          </Button>
          <Button size="sm" onClick={() => setShowConfirmDialog(true)}>
            <CheckCircle className="h-4 w-4 mr-1.5" />
            Xác nhận xuất kho
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={showCancelDialog}
        title="Hủy phiếu xuất"
        description={`Bạn có chắc muốn hủy phiếu "${form.code}"? Hành động này không thể hoàn tác.`}
        icon={Ban}
        confirmLabel="Hủy phiếu"
        confirmVariant="destructive"
        isLoading={isActioning}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
      <ConfirmDialog
        open={showConfirmDialog}
        title="Xác nhận xuất kho"
        description={`Xác nhận xuất kho phiếu "${form.code}"? Tồn kho sẽ được cập nhật sau khi xác nhận.`}
        icon={CheckCircle}
        confirmLabel="Xác nhận"
        isLoading={isActioning}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  )
}

export function ExportFormDetailDialog({
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
