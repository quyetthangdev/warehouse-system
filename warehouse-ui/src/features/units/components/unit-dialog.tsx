// warehouse-ui/src/features/units/components/unit-dialog.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { unitSchema, type UnitFormValues } from '../schemas/unit.schema'
import type { Unit } from '../types/unit.types'

interface UnitDialogProps {
  open: boolean
  unit?: Unit
  onSubmit: (values: UnitFormValues) => Promise<void>
  onClose: () => void
}

const typeOptions = [
  { value: 'weight', label: 'Khối lượng' },
  { value: 'volume', label: 'Thể tích' },
  { value: 'quantity', label: 'Số lượng' },
] as const

export function UnitDialog({ open, unit, onSubmit, onClose }: UnitDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: '', symbol: '' },
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (open) {
      if (unit) {
        reset({ name: unit.name, symbol: unit.symbol, type: unit.type })
      } else {
        reset()
      }
    }
  }, [open, unit, reset])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{unit ? 'Sửa đơn vị tính' : 'Thêm đơn vị tính'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="unit-name">Tên đơn vị *</Label>
            <Input
              id="unit-name"
              placeholder="VD: Kilogram"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="unit-symbol">Ký hiệu *</Label>
            <Input
              id="unit-symbol"
              placeholder="VD: kg"
              {...register('symbol')}
              aria-invalid={!!errors.symbol}
            />
            {errors.symbol && (
              <p className="text-sm text-destructive">{errors.symbol.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Loại đơn vị *</Label>
            <div className="flex gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('type', opt.value, { shouldValidate: true })}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-2 text-sm transition-colors',
                    selectedType === opt.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-muted',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
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
