import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Plus, Trash2, Package, Pencil } from 'lucide-react'
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
import { materialSchema, type MaterialFormValues } from '../schemas/material.schema'
import type { Material, UnitConversion } from '../types/material.types'
import type { Unit } from '@/features/units/types/unit.types'
import type { Supplier } from '@/features/suppliers/types/supplier.types'

interface MaterialDialogProps {
  open: boolean
  material?: Material
  units: Unit[]
  suppliers: Supplier[]
  onSubmit: (values: MaterialFormValues) => Promise<void>
  onClose: () => void
}

const categoryOptions = [
  { value: 'main_ingredient', label: 'Nguyên liệu chính' },
  { value: 'supporting', label: 'Phụ liệu' },
  { value: 'packaging', label: 'Bao bì' },
  { value: 'consumable', label: 'Vật tư tiêu hao' },
  { value: 'spare_part', label: 'Phụ tùng' },
] as const

export function MaterialDialog({
  open,
  material,
  units,
  suppliers,
  onSubmit,
  onClose,
}: MaterialDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: { name: '', minimumInventory: 0, maximumInventory: 0, supplierIds: [], conversions: [] },
  })

  const selectedCategory = watch('category')
  const selectedBaseUnitId = watch('baseUnitId')
  const supplierIds = watch('supplierIds') ?? []

  const [conversions, setConversions] = useState<UnitConversion[]>([])

  useEffect(() => {
    if (open) {
      if (material) {
        reset({
          name: material.name,
          category: material.category,
          baseUnitId: material.baseUnitId,
          minimumInventory: material.minimumInventory,
          maximumInventory: material.maximumInventory,
          supplierIds: material.supplierIds,
          conversions: material.conversions,
        })
        setConversions(material.conversions ?? [])
      } else {
        reset({
          name: '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          category: undefined as any,
          baseUnitId: '',
          minimumInventory: 0,
          maximumInventory: 0,
          supplierIds: [],
          conversions: [],
        })
        setConversions([])
      }
    }
  }, [open, material, reset])

  function addSupplier(supplierId: string) {
    if (!supplierIds.includes(supplierId)) {
      setValue('supplierIds', [...supplierIds, supplierId], { shouldValidate: true })
    }
  }

  function removeSupplierLink(supplierId: string) {
    setValue(
      'supplierIds',
      supplierIds.filter((id) => id !== supplierId),
      { shouldValidate: true },
    )
  }

  function addConversion() {
    const newConv: UnitConversion = {
      id: Date.now().toString(),
      fromQty: 1,
      fromUnitId: units[0]?.id ?? '',
      toQty: 1,
      toUnitId: units[1]?.id ?? units[0]?.id ?? '',
    }
    setConversions((prev) => [...prev, newConv])
  }

  function removeConversion(id: string) {
    setConversions((prev) => prev.filter((c) => c.id !== id))
  }

  function updateConversion(id: string, patch: Partial<UnitConversion>) {
    setConversions((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  const linkedSuppliers = suppliers.filter((s) => supplierIds.includes(s.id))
  const availableSuppliers = suppliers.filter((s) => !supplierIds.includes(s.id))

  async function handleFormSubmit(values: MaterialFormValues) {
    await onSubmit({ ...values, conversions })
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      icon={material ? Pencil : Package}
      title={material ? 'Sửa nguyên vật liệu' : 'Thêm nguyên vật liệu'}
      isLoading={isSubmitting}
      className="sm:max-w-2xl"
    >
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Thông tin chung</TabsTrigger>
              <TabsTrigger value="conversions">Quy đổi đơn vị</TabsTrigger>
              <TabsTrigger value="linked">Thông tin liên kết mặt hàng</TabsTrigger>
            </TabsList>

            {/* Fixed-height container prevents dialog resize when switching tabs */}
            <div className="min-h-[360px] overflow-y-auto">

            {/* Tab 1: Thông tin chung */}
            <TabsContent value="info" className="space-y-4 mt-0">
              {material && (
                <div className="space-y-1">
                  <Label>Mã nguyên vật liệu</Label>
                  <Input value={material.code} readOnly className="bg-muted" />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="mat-name">Tên nguyên vật liệu *</Label>
                <Input
                  id="mat-name"
                  placeholder="VD: Cà phê Arabica"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Danh mục *</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(v) =>
                      setValue('category', v as MaterialFormValues['category'], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger aria-invalid={!!errors.category}>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Đơn vị tính *</Label>
                  <Select
                    value={selectedBaseUnitId}
                    onValueChange={(v) =>
                      setValue('baseUnitId', v, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger aria-invalid={!!errors.baseUnitId}>
                      <SelectValue placeholder="Chọn đơn vị" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.baseUnitId && (
                    <p className="text-sm text-destructive">{errors.baseUnitId.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mat-min">Tồn kho tối thiểu *</Label>
                  <Input
                    id="mat-min"
                    type="number"
                    min={0}
                    {...register('minimumInventory', { valueAsNumber: true })}
                    aria-invalid={!!errors.minimumInventory}
                  />
                  {errors.minimumInventory && (
                    <p className="text-sm text-destructive">{errors.minimumInventory.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mat-max">Tồn kho tối đa *</Label>
                  <Input
                    id="mat-max"
                    type="number"
                    min={0}
                    {...register('maximumInventory', { valueAsNumber: true })}
                    aria-invalid={!!errors.maximumInventory}
                  />
                  {errors.maximumInventory && (
                    <p className="text-sm text-destructive">{errors.maximumInventory.message}</p>
                  )}
                </div>
              </div>

              {/* Supplier linking kept in "Thông tin chung" tab */}
              <div className="space-y-2">
                <Label>Nhà cung cấp đang liên kết</Label>
                {linkedSuppliers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có nhà cung cấp nào</p>
                ) : (
                  <ul className="space-y-2">
                    {linkedSuppliers.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <span className="text-sm">{s.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSupplierLink(s.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                {availableSuppliers.length > 0 && (
                  <Select key={supplierIds.length} onValueChange={(v) => addSupplier(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhà cung cấp để thêm..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSuppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </TabsContent>

            {/* Tab 2: Quy đổi đơn vị */}
            <TabsContent value="conversions" className="space-y-4 mt-0">
              <div className="space-y-2">
                {conversions.map((conv) => (
                  <div key={conv.id} className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={conv.fromQty}
                      onChange={(e) =>
                        updateConversion(conv.id, { fromQty: Number(e.target.value) })
                      }
                      className="w-16"
                      min={1}
                    />
                    <Select
                      value={conv.fromUnitId}
                      onValueChange={(v) => updateConversion(conv.id, { fromUnitId: v })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">=</span>
                    <Input
                      type="number"
                      value={conv.toQty}
                      onChange={(e) =>
                        updateConversion(conv.id, { toQty: Number(e.target.value) })
                      }
                      className="w-16"
                      min={1}
                    />
                    <Select
                      value={conv.toUnitId}
                      onValueChange={(v) => updateConversion(conv.id, { toUnitId: v })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => removeConversion(conv.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addConversion}
                  className="text-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm đơn vị quy đổi
                </Button>
              </div>
            </TabsContent>

            {/* Tab 3: Thông tin liên kết mặt hàng */}
            <TabsContent value="linked" className="mt-0">
              <div className="py-8 text-center text-sm text-muted-foreground">
                Những mặt hàng/nhóm lựa chọn sử dụng nguyên liệu này đã liên kết khi hàng
              </div>
            </TabsContent>

            </div>{/* end fixed-height container */}
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
