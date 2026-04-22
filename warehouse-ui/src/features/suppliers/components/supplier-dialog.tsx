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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supplierSchema, type SupplierFormValues } from '../schemas/supplier.schema'
import type { Supplier } from '../types/supplier.types'

interface SupplierDialogProps {
  open: boolean
  supplier?: Supplier
  onSubmit: (values: SupplierFormValues) => Promise<void>
  onClose: () => void
}

const paymentTermsOptions = [
  { value: 'cod', label: 'COD (Thanh toán ngay)' },
  { value: '7_days', label: '7 ngày' },
  { value: '15_days', label: '15 ngày' },
  { value: '30_days', label: '30 ngày' },
] as const

export function SupplierDialog({ open, supplier, onSubmit, onClose }: SupplierDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
  })

  const selectedPaymentTerms = watch('paymentTerms')

  useEffect(() => {
    if (open) {
      reset(
        supplier
          ? {
              code: supplier.code,
              name: supplier.name,
              contactPerson: supplier.contactPerson,
              phone: supplier.phone,
              email: supplier.email,
              location: supplier.location,
              taxCode: supplier.taxCode,
              paymentTerms: supplier.paymentTerms,
              note: supplier.note ?? '',
            }
          : {
              code: '',
              name: '',
              contactPerson: '',
              phone: '',
              email: '',
              location: '',
              taxCode: '',
              note: '',
            },
      )
    }
  }, [open, supplier, reset])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="sup-code">Mã nhà cung cấp *</Label>
              <Input
                id="sup-code"
                placeholder="VD: NCC001"
                {...register('code')}
                aria-invalid={!!errors.code}
              />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-name">Tên nhà cung cấp *</Label>
              <Input
                id="sup-name"
                placeholder="VD: Công ty Cà Phê Việt"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-contact">Người liên hệ *</Label>
              <Input
                id="sup-contact"
                placeholder="Nguyễn Văn A"
                {...register('contactPerson')}
                aria-invalid={!!errors.contactPerson}
              />
              {errors.contactPerson && (
                <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-phone">Số điện thoại *</Label>
              <Input
                id="sup-phone"
                placeholder="0901234567"
                {...register('phone')}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-email">Email *</Label>
              <Input
                id="sup-email"
                type="email"
                placeholder="contact@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-location">Địa chỉ *</Label>
              <Input
                id="sup-location"
                placeholder="TP. Hồ Chí Minh"
                {...register('location')}
                aria-invalid={!!errors.location}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-tax">Mã số thuế *</Label>
              <Input
                id="sup-tax"
                placeholder="0123456789"
                {...register('taxCode')}
                aria-invalid={!!errors.taxCode}
              />
              {errors.taxCode && (
                <p className="text-sm text-destructive">{errors.taxCode.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Điều khoản thanh toán *</Label>
              <Select
                value={selectedPaymentTerms}
                onValueChange={(v) =>
                  setValue('paymentTerms', v as SupplierFormValues['paymentTerms'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger aria-invalid={!!errors.paymentTerms}>
                  <SelectValue placeholder="Chọn điều khoản" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermsOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentTerms && (
                <p className="text-sm text-destructive">{errors.paymentTerms.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="sup-note">Ghi chú</Label>
              <Textarea
                id="sup-note"
                placeholder="Ghi chú thêm..."
                className="resize-none"
                rows={3}
                {...register('note')}
              />
            </div>
          </div>

          <DialogFooter>
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
