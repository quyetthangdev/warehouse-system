import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppDialog, AppDialogFooter } from '@/components/common/app-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { importFormSchema, type ImportFormValues } from '../schemas/import-form.schema'
import { WAREHOUSES } from '../import-form.utils'
import type { ImportForm } from '../types/import-form.types'
import type { Material } from '@/features/materials/types/material.types'
import type { Supplier } from '@/features/suppliers/types/supplier.types'

interface ImportFormDialogProps {
  open: boolean
  form?: ImportForm
  materials: Material[]
  suppliers: Supplier[]
  onSubmit: (values: ImportFormValues) => Promise<void>
  onClose: () => void
}

interface LocalItem {
  materialId: string
  materialName: string
  unit: string
  quantity: number
  unitPrice: number
  batchNumber: string
  mfgDate: string
  expiryDate: string
  note: string
}

const emptyAddItem: LocalItem = {
  materialId: '', materialName: '', unit: '',
  quantity: 1, unitPrice: 0, batchNumber: '', mfgDate: '', expiryDate: '', note: '',
}

const importTypeOptions = ['Mua hàng', 'Nhập trả lại', 'Điều chuyển', 'Khác']

export function ImportFormDialog({
  open,
  form,
  materials,
  suppliers,
  onSubmit,
  onClose,
}: ImportFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      supplierId: '',
      invoiceNumber: '',
      poNumber: '',
      importDate: new Date().toISOString().split('T')[0],
      importType: '',
      note: '',
      items: [],
    },
  })

  const selectedSupplierId = watch('supplierId')
  const selectedImportType = watch('importType')
  const selectedWarehouseId = watch('warehouseId')

  const [items, setItems] = useState<LocalItem[]>([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [addItem, setAddItem] = useState<LocalItem>({ ...emptyAddItem })

  useEffect(() => {
    if (open) {
      if (form) {
        reset({
          supplierId: form.supplierId,
          warehouseId: form.warehouseId ?? '',
          invoiceNumber: form.invoiceNumber,
          poNumber: form.poNumber ?? '',
          importDate: form.importDate,
          importType: form.importType ?? '',
          note: form.note ?? '',
          items: [],
        })
        setItems(
          form.items.map((i) => ({
            materialId: i.materialId,
            materialName: i.materialName,
            unit: i.unit,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            batchNumber: i.batchNumber ?? '',
            mfgDate: i.mfgDate ?? '',
            expiryDate: i.expiryDate ?? '',
            note: i.note ?? '',
          })),
        )
      } else {
        reset({
          supplierId: '',
          warehouseId: '',
          invoiceNumber: '',
          poNumber: '',
          importDate: new Date().toISOString().split('T')[0],
          importType: '',
          note: '',
          items: [],
        })
        setItems([])
      }
      setShowAddItem(false)
      setAddItem({ ...emptyAddItem })
    }
  }, [open, form, reset])

  function handleSelectMaterial(materialId: string) {
    const mat = materials.find((m) => m.id === materialId)
    setAddItem((prev) => ({
      ...prev,
      materialId,
      materialName: mat?.name ?? '',
      unit: mat?.baseUnit?.symbol ?? '',
    }))
  }

  function handleConfirmAddItem() {
    if (!addItem.materialId || addItem.quantity <= 0) return
    setItems((prev) => [...prev, { ...addItem }])
    setAddItem({ ...emptyAddItem })
    setShowAddItem(false)
  }

  function handleRemoveItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleFormSubmit(values: ImportFormValues) {
    await onSubmit({
      ...values,
      items: items.map((item) => ({
        materialId: item.materialId,
        materialName: item.materialName,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        batchNumber: item.batchNumber || undefined,
        mfgDate: item.mfgDate || undefined,
        expiryDate: item.expiryDate || undefined,
        note: item.note || undefined,
      })),
    })
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      icon={form ? Pencil : ClipboardList}
      title={form ? 'Chỉnh sửa phiếu nhập' : 'Tạo phiếu nhập'}
      isLoading={isSubmitting}
      className="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Thông tin phiếu</TabsTrigger>
            <TabsTrigger value="items">
              Danh sách sản phẩm{items.length > 0 && ` (${items.length})`}
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[360px] overflow-y-auto">
            {/* Tab 1 */}
            <TabsContent value="info" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="space-y-1">
                  <Label>Nhà cung cấp *</Label>
                  <Select
                    value={selectedSupplierId}
                    onValueChange={(v) => setValue('supplierId', v, { shouldValidate: true })}
                  >
                    <SelectTrigger aria-invalid={!!errors.supplierId}>
                      <SelectValue placeholder="Chọn nhà cung cấp" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplierId && (
                    <p className="text-sm text-destructive">{errors.supplierId.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="if-invoice">Số hóa đơn *</Label>
                  <Input
                    id="if-invoice"
                    placeholder="VD: HD-2025-001"
                    {...register('invoiceNumber')}
                    aria-invalid={!!errors.invoiceNumber}
                  />
                  {errors.invoiceNumber && (
                    <p className="text-sm text-destructive">{errors.invoiceNumber.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="if-po">Số PO</Label>
                  <Input id="if-po" placeholder="VD: PO-001" {...register('poNumber')} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="if-date">Ngày nhập *</Label>
                  <Input
                    id="if-date"
                    type="date"
                    {...register('importDate')}
                    aria-invalid={!!errors.importDate}
                  />
                  {errors.importDate && (
                    <p className="text-sm text-destructive">{errors.importDate.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Kho nhập</Label>
                  <Select
                    value={selectedWarehouseId ?? ''}
                    onValueChange={(v) => setValue('warehouseId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kho nhập" />
                    </SelectTrigger>
                    <SelectContent>
                      {WAREHOUSES.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Loại nhập</Label>
                  <Select
                    value={selectedImportType ?? ''}
                    onValueChange={(v) => setValue('importType', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại nhập" />
                    </SelectTrigger>
                    <SelectContent>
                      {importTypeOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-1">
                  <Label htmlFor="if-note">Ghi chú</Label>
                  <Textarea
                    id="if-note"
                    placeholder="Nhập ghi chú"
                    className="resize-none"
                    rows={2}
                    {...register('note')}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2 */}
            <TabsContent value="items" className="mt-0 space-y-3">
              {items.length === 0 && !showAddItem && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Chưa có sản phẩm nào
                </p>
              )}

              {items.length > 0 && (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-md border px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.materialName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit}
                          {item.batchNumber && ` · Lô ${item.batchNumber}`}
                          {item.expiryDate && ` · HSD ${item.expiryDate}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showAddItem ? (
                <div className="rounded-md border p-3 space-y-3 bg-muted/30">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nguyên vật liệu *</Label>
                      <Select
                        value={addItem.materialId}
                        onValueChange={handleSelectMaterial}
                      >
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
                          value={addItem.quantity}
                          onChange={(e) =>
                            setAddItem((p) => ({ ...p, quantity: Number(e.target.value) }))
                          }
                          className="flex-1"
                        />
                        {addItem.unit && (
                          <span className="text-sm text-muted-foreground shrink-0">
                            {addItem.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Đơn giá (VNĐ) *</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="VD: 15000"
                        value={addItem.unitPrice || ''}
                        onChange={(e) =>
                          setAddItem((prev) => ({ ...prev, unitPrice: Number(e.target.value) }))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Số lô</Label>
                      <Input
                        placeholder="VD: L001"
                        value={addItem.batchNumber}
                        onChange={(e) =>
                          setAddItem((p) => ({ ...p, batchNumber: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Ngày sản xuất</Label>
                      <Input
                        type="date"
                        value={addItem.mfgDate}
                        onChange={(e) => setAddItem((p) => ({ ...p, mfgDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Hạn sử dụng</Label>
                      <Input
                        type="date"
                        value={addItem.expiryDate}
                        onChange={(e) =>
                          setAddItem((p) => ({ ...p, expiryDate: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Ghi chú</Label>
                      <Input
                        placeholder="Ghi chú"
                        value={addItem.note}
                        onChange={(e) => setAddItem((p) => ({ ...p, note: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddItem(false)
                        setAddItem({ ...emptyAddItem })
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConfirmAddItem}
                      disabled={!addItem.materialId || addItem.quantity <= 0}
                    >
                      Thêm
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => setShowAddItem(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm sản phẩm
                </Button>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <AppDialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu phiếu'}
          </Button>
        </AppDialogFooter>
      </form>
    </AppDialog>
  )
}
