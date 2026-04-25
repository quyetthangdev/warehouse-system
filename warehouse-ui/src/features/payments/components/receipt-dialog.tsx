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
import { receiptSchema, type ReceiptValues } from '../schemas/payment.schema'
import { receiptTypeConfig, receiptMethodConfig, formatVnd } from '../payment.utils'
import type { ReceiptType, ReceiptMethod } from '../types/payment.types'

interface ReceiptDialogProps {
  open: boolean
  onSubmit: (values: ReceiptValues) => Promise<void>
  onClose: () => void
}

export function ReceiptDialog({ open, onSubmit, onClose }: ReceiptDialogProps) {
  const form = useForm<ReceiptValues>({
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

  const amountBeforeVat = useWatch({ control: form.control, name: 'amountBeforeVat' }) ?? 0
  const vatPercent = useWatch({ control: form.control, name: 'vatPercent' }) ?? 0
  const receiptMethod = useWatch({ control: form.control, name: 'receiptMethod' })

  const vatAmount = Math.round(amountBeforeVat * vatPercent / 100)
  const totalAmount = amountBeforeVat + vatAmount

  useEffect(() => {
    if (!open) form.reset()
  }, [open, form])

  async function handleSubmit(values: ReceiptValues) {
    await onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo phiếu thu</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="receiptDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày thu</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiptType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại thu</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại thu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(receiptTypeConfig) as ReceiptType[]).map((k) => (
                          <SelectItem key={k} value={k}>{receiptTypeConfig[k]}</SelectItem>
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
                <span>Tổng tiền thu:</span>
                <span className="text-green-600 dark:text-green-400">{formatVnd(totalAmount)}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="receiptMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình thức thu</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(receiptMethodConfig) as ReceiptMethod[]).map((k) => (
                        <SelectItem key={k} value={k}>{receiptMethodConfig[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {receiptMethod === 'transfer' && (
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
              name="formRef"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tham chiếu phiếu nhập/xuất</FormLabel>
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
                  <FormLabel>Lý do thu <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập lý do thu tiền" {...field} />
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
                {form.formState.isSubmitting ? 'Đang lưu...' : 'Tạo phiếu thu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
