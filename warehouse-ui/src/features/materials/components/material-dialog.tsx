import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import type { Material } from '../types/material.types'
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
    defaultValues: { name: '', minimumInventory: 0, maximumInventory: 0, supplierIds: [] },
  })

  const selectedCategory = watch('category')
  const selectedBaseUnitId = watch('baseUnitId')
  const supplierIds = watch('supplierIds') ?? []

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
        })
      } else {
        reset()
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

  const linkedSuppliers = suppliers.filter((s) => supplierIds.includes(s.id))
  const availableSuppliers = suppliers.filter((s) => !supplierIds.includes(s.id))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {material ? 'Sửa nguyên vật liệu' : 'Thêm nguyên vật liệu'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="suppliers">
                Nhà cung cấp ({supplierIds.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4">
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
              </div>

              {availableSuppliers.length > 0 && (
                <div className="space-y-1">
                  <Label>Thêm nhà cung cấp</Label>
                  <Select onValueChange={(v) => addSupplier(v)}>
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
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
