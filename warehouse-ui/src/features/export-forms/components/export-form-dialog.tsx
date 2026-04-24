import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppDialog, AppDialogFooter } from '@/components/common/app-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { exportFormSchema, type ExportFormValues } from '../schemas/export-form.schema'
import { WAREHOUSES, exportTypeConfig, disposalReasonConfig } from '../export-form.utils'
import type { ExportForm, ExportFormItem } from '../types/export-form.types'
import type { Material } from '@/features/materials/types/material.types'
import { toast } from 'react-hot-toast'
import type { InventoryItem } from '@/features/inventory/types/inventory.types'

interface ExportFormDialogProps {
  open: boolean
  form?: ExportForm
  materials: Material[]
  inventoryItems: InventoryItem[]
  onSubmit: (values: ExportFormValues) => Promise<void>
  onClose: () => void
}

const emptyItem = { materialId: '', materialName: '', unit: '', quantity: 1, expiryDate: '', note: '' }

export function ExportFormDialog({ open, form, materials, inventoryItems, onSubmit, onClose }: ExportFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: { exportDate: '', items: [] },
  })

  const exportType = watch('exportType')
  const disposalReason = watch('disposalReason')

  const [items, setItems] = useState<ExportFormItem[]>([])
  const [addItem, setAddItem] = useState({ ...emptyItem })
  const [showAddRow, setShowAddRow] = useState(false)

  const currentStock = addItem.materialId
    ? (inventoryItems.find((i) => i.materialId === addItem.materialId)?.currentStock ?? null)
    : null
  const stockExceeded = currentStock !== null && addItem.quantity > currentStock

  useEffect(() => {
    if (open) {
      if (form) {
        reset({
          exportType: form.exportType,
          exportDate: form.exportDate,
          recipient: form.recipient,
          note: form.note,
          disposalReason: form.disposalReason,
          disposalReasonText: form.disposalReasonText,
          destinationWarehouseId: form.destinationWarehouseId,
          customReason: form.customReason,
          items: form.items,
        })
        setItems(form.items)
      } else {
        reset({ exportDate: new Date().toISOString().split('T')[0], items: [] })
        setItems([])
      }
      setShowAddRow(false)
      setAddItem({ ...emptyItem })
    }
  }, [open, form, reset])

  function handleSelectMaterial(materialId: string) {
    const mat = materials.find((m) => m.id === materialId)
    setAddItem((prev) => ({ ...prev, materialId, materialName: mat?.name ?? '', unit: mat?.baseUnit?.symbol ?? '' }))
  }

  function confirmAddItem() {
    if (!addItem.materialId || addItem.quantity <= 0 || !addItem.expiryDate) return
    const newItem: ExportFormItem = { ...addItem, id: `tmp-${Date.now()}` }
    const updated = [...items, newItem]
    setItems(updated)
    setValue('items', updated as ExportFormValues['items'])
    setAddItem({ ...emptyItem })
    setShowAddRow(false)
  }

  function removeItem(idx: number) {
    const updated = items.filter((_, i) => i !== idx)
    setItems(updated)
    setValue('items', updated as ExportFormValues['items'])
  }

  async function handleFormSubmit(values: ExportFormValues) {
    const exceeded = items.find((item) => {
      const stock = inventoryItems.find((i) => i.materialId === item.materialId)?.currentStock ?? Infinity
      return item.quantity > stock
    })
    if (exceeded) {
      toast.error(`"${exceeded.materialName}" vượt tồn kho hiện tại`)
      return
    }
    await onSubmit({ ...values, items: items as ExportFormValues['items'] })
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      icon={form ? Pencil : Package2}
      title={form ? 'Sửa phiếu xuất' : 'Tạo phiếu xuất'}
      isLoading={isSubmitting}
      className="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Thông tin phiếu</TabsTrigger>
            <TabsTrigger value="items">Danh sách NVL</TabsTrigger>
          </TabsList>

          <div className="min-h-[360px] overflow-y-auto">

            <TabsContent value="info" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Loại xuất *</Label>
                  <Select
                    value={exportType}
                    onValueChange={(v) => setValue('exportType', v as ExportFormValues['exportType'], { shouldValidate: true })}
                  >
                    <SelectTrigger aria-invalid={!!errors.exportType}>
                      <SelectValue placeholder="Chọn loại xuất" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(exportTypeConfig) as (keyof typeof exportTypeConfig)[]).map((key) => (
                        <SelectItem key={key} value={key}>{exportTypeConfig[key].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.exportType && <p className="text-sm text-destructive">{errors.exportType.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="exportDate">Ngày xuất *</Label>
                  <Input
                    id="exportDate"
                    type="date"
                    {...register('exportDate')}
                    aria-invalid={!!errors.exportDate}
                  />
                  {errors.exportDate && <p className="text-sm text-destructive">{errors.exportDate.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="recipient">Người nhận</Label>
                  <Input id="recipient" placeholder="VD: Barista ca sáng" {...register('recipient')} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Input id="note" placeholder="Ghi chú" {...register('note')} />
                </div>
              </div>

              {exportType === 'disposal' && (
                <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                  <p className="text-sm font-medium">Thông tin xuất hủy</p>
                  <div className="space-y-1">
                    <Label>Lý do hủy *</Label>
                    <Select
                      value={disposalReason}
                      onValueChange={(v) => setValue('disposalReason', v as ExportFormValues['disposalReason'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lý do" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(disposalReasonConfig) as (keyof typeof disposalReasonConfig)[]).map((key) => (
                          <SelectItem key={key} value={key}>{disposalReasonConfig[key]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {disposalReason === 'other' && (
                    <div className="space-y-1">
                      <Label htmlFor="disposalReasonText">Mô tả lý do *</Label>
                      <Input id="disposalReasonText" placeholder="Nhập lý do chi tiết..." {...register('disposalReasonText')} />
                    </div>
                  )}
                </div>
              )}

              {exportType === 'transfer' && (
                <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                  <p className="text-sm font-medium">Thông tin luân chuyển</p>
                  <div className="space-y-1">
                    <Label>Kho nhận *</Label>
                    <Select
                      value={watch('destinationWarehouseId')}
                      onValueChange={(v) => setValue('destinationWarehouseId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn kho nhận" />
                      </SelectTrigger>
                      <SelectContent>
                        {WAREHOUSES.map((w) => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {exportType === 'other' && (
                <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                  <p className="text-sm font-medium">Mục đích xuất khác</p>
                  <div className="space-y-1">
                    <Label htmlFor="customReason">Lý do *</Label>
                    <Input id="customReason" placeholder="VD: Mẫu thử nghiệm menu mới" {...register('customReason')} />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="items" className="mt-0 space-y-3">
              {items.length === 0 && !showAddRow && (
                <p className="text-sm text-muted-foreground py-4 text-center">Chưa có sản phẩm nào</p>
              )}

              {items.length > 0 && (
                <ul className="space-y-2">
                  {items.map((item, idx) => (
                    <li key={item.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium">{item.materialName}</span>
                        <span className="ml-2 text-muted-foreground">{item.quantity} {item.unit}</span>
                        {item.expiryDate && (
                          <span className="ml-2 text-xs text-muted-foreground">HSD: {item.expiryDate}</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {showAddRow && (
                <div className="rounded-md border p-3 space-y-3 bg-muted/30">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <Label className="text-xs">NVL *</Label>
                      <Select value={addItem.materialId} onValueChange={handleSelectMaterial}>
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
                          type="number"
                          min={1}
                          value={addItem.quantity}
                          onChange={(e) => setAddItem((p) => ({ ...p, quantity: Number(e.target.value) }))}
                          className={`flex-1 ${stockExceeded ? 'border-destructive' : ''}`}
                        />
                        {addItem.unit && <span className="text-sm text-muted-foreground shrink-0">{addItem.unit}</span>}
                      </div>
                      {stockExceeded && currentStock !== null && (
                        <p className="text-xs text-destructive">
                          Vượt tồn kho (còn {currentStock} {addItem.unit})
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hạn sử dụng *</Label>
                      <Input
                        type="date"
                        value={addItem.expiryDate}
                        onChange={(e) => setAddItem((p) => ({ ...p, expiryDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-3">
                      <Label className="text-xs">Ghi chú</Label>
                      <Input
                        placeholder="Ghi chú"
                        value={addItem.note}
                        onChange={(e) => setAddItem((p) => ({ ...p, note: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => { setShowAddRow(false); setAddItem({ ...emptyItem }) }}>
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!addItem.materialId || addItem.quantity <= 0 || !addItem.expiryDate}
                      onClick={confirmAddItem}
                    >
                      Thêm
                    </Button>
                  </div>
                </div>
              )}

              {!showAddRow && (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddRow(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Thêm sản phẩm
                </Button>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <AppDialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </AppDialogFooter>
      </form>
    </AppDialog>
  )
}
