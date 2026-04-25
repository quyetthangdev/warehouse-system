import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Wallet } from 'lucide-react'
import { AppDialog, AppDialogFooter } from '@/components/common/app-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { paymentSchema, type PaymentValues } from '../schemas/payment.schema'
import { paymentTypeConfig, paymentMethodConfig, paymentTermsConfig, calcDueDate, formatVnd } from '../payment.utils'
import type { PaymentType, PaymentMethod, PaymentTerms } from '../types/payment.types'

interface PaymentDialogProps {
  open: boolean
  onSubmit: (values: PaymentValues) => Promise<void>
  onClose: () => void
}

const DEBT_DAYS_OPTIONS = [7, 15, 30]

export function PaymentDialog({ open, onSubmit, onClose }: PaymentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: 'transport',
      amountBeforeVat: 0,
      vatPercent: 0,
      paymentTerms: 'direct',
      paymentMethod: 'cash',
    },
  })

  const amountBeforeVat = watch('amountBeforeVat') ?? 0
  const vatPercent = watch('vatPercent') ?? 0
  const paymentTerms = watch('paymentTerms')
  const paymentDate = watch('paymentDate')
  const debtDays = watch('debtDays')
  const paymentMethod = watch('paymentMethod')

  const vatAmount = Math.round(amountBeforeVat * vatPercent / 100)
  const totalAmount = amountBeforeVat + vatAmount
  const dueDate = paymentTerms === 'debt' && paymentDate && debtDays
    ? calcDueDate(paymentDate, debtDays)
    : null

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  return (
    <AppDialog open={open} onClose={onClose} icon={Wallet} title="Tạo phiếu chi" isLoading={isSubmitting}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="paymentDate">Ngày chi</Label>
            <Input id="paymentDate" type="date" {...register('paymentDate')} aria-invalid={!!errors.paymentDate} />
            {errors.paymentDate && <p className="text-sm text-destructive">{errors.paymentDate.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Loại chi</Label>
            <Select
              value={watch('paymentType')}
              onValueChange={(v) => setValue('paymentType', v as PaymentType, { shouldValidate: true })}
            >
              <SelectTrigger aria-invalid={!!errors.paymentType}>
                <SelectValue placeholder="Chọn loại chi" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(paymentTypeConfig) as PaymentType[]).map((k) => (
                  <SelectItem key={k} value={k}>{paymentTypeConfig[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentType && <p className="text-sm text-destructive">{errors.paymentType.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="amountBeforeVat">Số tiền trước VAT (đ)</Label>
            <Input
              id="amountBeforeVat"
              type="number"
              min={0}
              {...register('amountBeforeVat', { valueAsNumber: true })}
              aria-invalid={!!errors.amountBeforeVat}
            />
            {errors.amountBeforeVat && <p className="text-sm text-destructive">{errors.amountBeforeVat.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="vatPercent">VAT (%)</Label>
            <Input
              id="vatPercent"
              type="number"
              min={0}
              max={20}
              {...register('vatPercent', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tiền VAT:</span>
            <span>{formatVnd(vatAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Tổng tiền:</span>
            <span>{formatVnd(totalAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Điều khoản thanh toán</Label>
            <Select
              value={paymentTerms}
              onValueChange={(v) => setValue('paymentTerms', v as PaymentTerms, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(paymentTermsConfig) as PaymentTerms[]).map((k) => (
                  <SelectItem key={k} value={k}>{paymentTermsConfig[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {paymentTerms === 'debt' && (
            <div className="space-y-1">
              <Label>Số ngày công nợ</Label>
              <Select
                value={debtDays?.toString()}
                onValueChange={(v) => setValue('debtDays', Number(v), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn số ngày" />
                </SelectTrigger>
                <SelectContent>
                  {DEBT_DAYS_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d.toString()}>{d} ngày</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {dueDate && (
          <p className="text-xs text-muted-foreground">
            Ngày đến hạn: <span className="font-medium text-foreground">{dueDate.split('-').reverse().join('/')}</span>
          </p>
        )}

        <div className="space-y-1">
          <Label>Hình thức thanh toán</Label>
          <Select
            value={paymentMethod}
            onValueChange={(v) => setValue('paymentMethod', v as PaymentMethod, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(paymentMethodConfig) as PaymentMethod[]).map((k) => (
                <SelectItem key={k} value={k}>{paymentMethodConfig[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === 'transfer' && (
          <div className="space-y-1">
            <Label htmlFor="transferCode">Mã chuyển khoản</Label>
            <Input id="transferCode" placeholder="Nhập mã CK" {...register('transferCode')} />
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="importFormRef">Tham chiếu phiếu nhập</Label>
          <Input id="importFormRef" placeholder="VD: PN-2025-001" {...register('importFormRef')} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="reason">Lý do chi</Label>
          <Input id="reason" placeholder="Nhập lý do (nếu có)" {...register('reason')} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="note">Ghi chú</Label>
          <Input id="note" placeholder="Ghi chú thêm" {...register('note')} />
        </div>

        <AppDialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Tạo phiếu chi'}
          </Button>
        </AppDialogFooter>
      </form>
    </AppDialog>
  )
}
