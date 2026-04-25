import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  const form = useForm<PaymentValues>({
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

  const amountBeforeVat = useWatch({ control: form.control, name: 'amountBeforeVat' }) ?? 0
  const vatPercent = useWatch({ control: form.control, name: 'vatPercent' }) ?? 0
  const paymentTerms = useWatch({ control: form.control, name: 'paymentTerms' })
  const paymentDate = useWatch({ control: form.control, name: 'paymentDate' })
  const debtDays = useWatch({ control: form.control, name: 'debtDays' })
  const paymentMethod = useWatch({ control: form.control, name: 'paymentMethod' })

  const vatAmount = Math.round(amountBeforeVat * vatPercent / 100)
  const totalAmount = amountBeforeVat + vatAmount
  const dueDate = paymentTerms === 'debt' && paymentDate && debtDays
    ? calcDueDate(paymentDate, debtDays)
    : null

  useEffect(() => {
    if (!open) form.reset()
  }, [open, form])

  async function handleSubmit(values: PaymentValues) {
    await onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo phiếu chi</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày chi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại chi</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại chi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(paymentTypeConfig) as PaymentType[]).map((k) => (
                          <SelectItem key={k} value={k}>{paymentTypeConfig[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amountBeforeVat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền trước VAT (đ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điều khoản thanh toán</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(paymentTermsConfig) as PaymentTerms[]).map((k) => (
                          <SelectItem key={k} value={k}>{paymentTermsConfig[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {paymentTerms === 'debt' && (
                <FormField
                  control={form.control}
                  name="debtDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số ngày công nợ</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn số ngày" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEBT_DAYS_OPTIONS.map((d) => (
                            <SelectItem key={d} value={d.toString()}>{d} ngày</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {dueDate && (
              <p className="text-xs text-muted-foreground">
                Ngày đến hạn: <span className="font-medium text-foreground">{dueDate.split('-').reverse().join('/')}</span>
              </p>
            )}

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình thức thanh toán</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(paymentMethodConfig) as PaymentMethod[]).map((k) => (
                        <SelectItem key={k} value={k}>{paymentMethodConfig[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentMethod === 'transfer' && (
              <FormField
                control={form.control}
                name="transferCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã chuyển khoản</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập mã CK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="importFormRef"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tham chiếu phiếu nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: PN-2025-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do chi</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập lý do (nếu có)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Input placeholder="Ghi chú thêm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Đang lưu...' : 'Tạo phiếu chi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
