import { useState } from 'react'
import { Ban, CheckCircle, ImageIcon, Paperclip, Plus, X } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/status-badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { DialogClose } from '@/components/ui/dialog'
import { WideDialog } from '@/components/common/wide-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAuthStore } from '@/stores/auth.store'
import { useMaterials } from '@/features/materials/hooks/use-materials'
import { toast } from 'sonner'
import { useImportFormDetail } from '../hooks/use-import-form-detail'
import { importFormStatusConfig, formatDate } from '../import-form.utils'
import type { ImportFormItem } from '../types/import-form.types'

interface LocalAddItem {
  materialId: string
  materialName: string
  unit: string
  quantity: number
  batchNumber: string
  mfgDate: string
  expiryDate: string
  note: string
}

const emptyAddItem: LocalAddItem = {
  materialId: '', materialName: '', unit: '',
  quantity: 1, batchNumber: '', mfgDate: '', expiryDate: '', note: '',
}

const itemColumns: ColumnDef<ImportFormItem>[] = [
  { accessorKey: 'materialName', header: 'Nguyên vật liệu', size: 200 },
  {
    accessorKey: 'quantity',
    header: 'Số lượng',
    size: 100,
    cell: ({ row }) => `${row.original.quantity} ${row.original.unit}`,
  },
  {
    accessorKey: 'batchNumber',
    header: 'Số lô',
    size: 100,
    cell: ({ row }) => row.original.batchNumber ?? '—',
  },
  {
    accessorKey: 'mfgDate',
    header: 'Ngày SX',
    size: 100,
    cell: ({ row }) =>
      row.original.mfgDate
        ? formatDate(row.original.mfgDate)
        : <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: 'expiryDate',
    header: 'Hạn SD',
    size: 100,
    cell: ({ row }) =>
      row.original.expiryDate
        ? formatDate(row.original.expiryDate)
        : <span className="text-muted-foreground">—</span>,
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
  const { form, isLoading, cancelForm, confirmForm, addItem } = useImportFormDetail(formId)
  const { materials } = useMaterials()
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager']))

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isActioning, setIsActioning] = useState(false)
  const [showAddRow, setShowAddRow] = useState(false)
  const [addRowItem, setAddRowItem] = useState<LocalAddItem>({ ...emptyAddItem })
  const [isAddingItem, setIsAddingItem] = useState(false)

  function handleSelectMaterial(materialId: string) {
    const mat = materials.find((m) => m.id === materialId)
    setAddRowItem((prev) => ({
      ...prev,
      materialId,
      materialName: mat?.name ?? '',
      unit: mat?.baseUnit?.symbol ?? '',
    }))
  }

  async function handleAddItem() {
    if (!addRowItem.materialId || addRowItem.quantity <= 0) return
    setIsAddingItem(true)
    const { ok, message } = await addItem({
      materialId: addRowItem.materialId,
      materialName: addRowItem.materialName,
      unit: addRowItem.unit,
      quantity: addRowItem.quantity,
      batchNumber: addRowItem.batchNumber || undefined,
      mfgDate: addRowItem.mfgDate || undefined,
      expiryDate: addRowItem.expiryDate || undefined,
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
      toast.success('Đã hủy phiếu nhập')
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
      toast.success('Đã xác nhận nhập kho')
      setShowConfirmDialog(false)
    } else {
      toast.error(message ?? 'Không thể xác nhận phiếu')
    }
  }

  if (isLoading) {
    return (
      <>
        {/* Header skeleton */}
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
          <p className="font-semibold">Phiếu nhập</p>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm"><X className="h-4 w-4" /></Button>
          </DialogClose>
        </div>
        <div className="flex-1 p-6">
          <p className="text-muted-foreground">Không tìm thấy phiếu nhập.</p>
        </div>
      </>
    )
  }

  const statusCfg = importFormStatusConfig[form.status]
  const isDraft = form.status === 'draft'

  return (
    <>
      {/* Sticky header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold">{form.code}</h2>
          <StatusBadge label={statusCfg.label} variant={statusCfg.variant} />
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon-sm"><X className="h-4 w-4" /></Button>
        </DialogClose>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Info grid */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Thông tin phiếu nhập</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <InfoRow label="Nhà cung cấp" value={form.supplierName} />
            <InfoRow label="Người tạo" value={form.createdBy} />
            <InfoRow label="Người yêu cầu" value={form.requestedBy} />
            <InfoRow label="Số hóa đơn" value={form.invoiceNumber} />
            <InfoRow label="Số PO" value={form.poNumber ?? '—'} />
            <InfoRow label="Ngày nhập" value={formatDate(form.importDate)} />
            <InfoRow label="Kho nhập" value={form.warehouseName ?? '—'} />
            <InfoRow label="Loại nhập" value={form.importType ?? '—'} />
            <InfoRow label="Người phê duyệt" value={form.approvedBy ?? '—'} />
            {form.note && (
              <InfoRow label="Ghi chú" value={form.note} className="col-span-2 sm:col-span-3" />
            )}
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              Danh sách sản phẩm
              <span className="ml-2 font-normal text-muted-foreground">({form.items.length})</span>
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
            <DataTable
              columns={itemColumns}
              data={form.items}
              hideToolbar
              emptyMessage="Chưa có sản phẩm nào"
            />
          )}

          {showAddRow && (
            <div className="mt-4 rounded-md border p-4 space-y-3 bg-muted/30">
              <p className="text-sm font-medium">Thêm sản phẩm</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <Label className="text-xs">Nguyên vật liệu *</Label>
                  <Select value={addRowItem.materialId} onValueChange={handleSelectMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn NVL" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({m.baseUnit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Số lượng *</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={1}
                      value={addRowItem.quantity}
                      onChange={(e) => setAddRowItem((p) => ({ ...p, quantity: Number(e.target.value) }))}
                      className="flex-1"
                    />
                    {addRowItem.unit && (
                      <span className="text-sm text-muted-foreground shrink-0">{addRowItem.unit}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Số lô</Label>
                  <Input
                    placeholder="VD: L001"
                    value={addRowItem.batchNumber}
                    onChange={(e) => setAddRowItem((p) => ({ ...p, batchNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ngày sản xuất</Label>
                  <Input
                    type="date"
                    value={addRowItem.mfgDate}
                    onChange={(e) => setAddRowItem((p) => ({ ...p, mfgDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Hạn sử dụng</Label>
                  <Input
                    type="date"
                    value={addRowItem.expiryDate}
                    onChange={(e) => setAddRowItem((p) => ({ ...p, expiryDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
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
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAddingItem}
                  onClick={() => { setShowAddRow(false); setAddRowItem({ ...emptyAddItem }) }}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!addRowItem.materialId || addRowItem.quantity <= 0 || isAddingItem}
                  onClick={handleAddItem}
                >
                  {isAddingItem ? 'Đang thêm...' : 'Thêm'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Invoice image */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Ảnh hóa đơn</h3>
          </div>
          {form.invoiceImageName ? (
            <div className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span>{form.invoiceImageName}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8 text-center">
              <ImageIcon className="h-7 w-7 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Chưa có ảnh hóa đơn</p>
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">File đính kèm</h3>
          </div>
          {form.attachmentNames && form.attachmentNames.length > 0 ? (
            <div className="space-y-2">
              {form.attachmentNames.map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8 text-center">
              <Paperclip className="h-7 w-7 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Chưa có file đính kèm</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer — only for draft + canEdit */}
      {canEdit && isDraft && (
        <div className="border-t px-6 py-3 flex justify-end gap-2 shrink-0 bg-background">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
          >
            <Ban className="h-4 w-4 mr-1.5" />
            Hủy phiếu
          </Button>
          <Button size="sm" onClick={() => setShowConfirmDialog(true)}>
            <CheckCircle className="h-4 w-4 mr-1.5" />
            Xác nhận nhập kho
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={showCancelDialog}
        title="Hủy phiếu nhập"
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
        title="Xác nhận nhập kho"
        description={`Xác nhận nhập kho phiếu "${form.code}"? Tồn kho sẽ được cập nhật sau khi xác nhận.`}
        icon={CheckCircle}
        confirmLabel="Xác nhận"
        isLoading={isActioning}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  )
}

export function ImportFormDetailDialog({
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
