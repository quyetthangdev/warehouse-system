import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HandCoins } from 'lucide-react'
import { AppDialog, AppDialogFooter } from '@/components/common/app-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { receiptSchema, type ReceiptValues } from '../schemas/payment.schema'
import { receiptTypeConfig, receiptMethodConfig, formatVnd } from '../payment.utils'
import type { ReceiptType, ReceiptMethod } from '../types/payment.types'

interface ReceiptDialogProps {
  open: boolean
  onSubmit: (values: ReceiptValues) => Promise<void>
  onClose: () => void
}

export function ReceiptDialog({ open, onSubmit, onClose }: ReceiptDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReceiptValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      receiptDate: new Date().toISOString().split('T')[0],
      receiptType: 'other',
      amountBeforeVat: 0,
      vatPercent: 0,
      receiptMethod: 'cash',
      reason: '',
    },
  })

  const amountBeforeVat = watch('amountBeforeVat') ?? 0
  const vatPercent = watch('vatPercent') ?? 0
  const receiptMethod = watch('receiptMethod')
  const receiptType = watch('receiptType')
  const isFormRefRequired = ['refund', 'compensation', 'liquidation'].includes(receiptType)

  const vatAmount = Math.round(amountBeforeVat * vatPercent / 100)
  const totalAmount = amountBeforeVat + vatAmount

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  return (
    <AppDialog open={open} onClose={onClose} icon={HandCoins} title="Tạo phiếu thu" isLoading={isSubmitting}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="receiptDate">Ngày thu</Label>
            <Input id="receiptDate" type="date" {...register('receiptDate')} aria-invalid={!!errors.receiptDate} />
            {errors.receiptDate && <p className="text-sm text-destructive">{errors.receiptDate.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Loại thu</Label>
            <Select
              value={watch('receiptType')}
              onValueChange={(v) => setValue('receiptType', v as ReceiptType, { shouldValidate: true })}
            >
              <SelectTrigger aria-invalid={!!errors.receiptType}>
                <SelectValue placeholder="Chọn loại thu" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(receiptTypeConfig) as ReceiptType[]).map((k) => (
                  <SelectItem key={k} value={k}>{receiptTypeConfig[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.receiptType && <p className="text-sm text-destructive">{errors.receiptType.message}</p>}
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
            <span>Tổng tiền thu:</span>
            <span className="text-green-600 dark:text-green-400">{formatVnd(totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Hình thức thu</Label>
          <Select
            value={receiptMethod}
            onValueChange={(v) => setValue('receiptMethod', v as ReceiptMethod, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(receiptMethodConfig) as ReceiptMethod[]).map((k) => (
                <SelectItem key={k} value={k}>{receiptMethodConfig[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {receiptMethod === 'transfer' && (
          <div className="space-y-1">
            <Label htmlFor="transferCode">Mã chuyển khoản</Label>
            <Input id="transferCode" placeholder="Nhập mã CK" {...register('transferCode')} />
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="formRef">
            Tham chiếu phiếu nhập/xuất
            {isFormRefRequired && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <Input
            id="formRef"
            placeholder="VD: PN-2025-001"
            {...register('formRef')}
            aria-invalid={!!errors.formRef}
          />
          {errors.formRef && (
            <p className="text-sm text-destructive">{errors.formRef.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="reason">
            Lý do thu <span className="text-destructive">*</span>
          </Label>
          <Input
            id="reason"
            placeholder="Nhập lý do thu tiền"
            {...register('reason')}
            aria-invalid={!!errors.reason}
          />
          {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="note">Ghi chú</Label>
          <Input id="note" placeholder="Ghi chú thêm" {...register('note')} />
        </div>

        <AppDialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Tạo phiếu thu'}
          </Button>
        </AppDialogFooter>
      </form>
    </AppDialog>
  )
}
