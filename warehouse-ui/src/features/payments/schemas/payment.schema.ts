import { z } from 'zod'

export const paymentSchema = z
  .object({
    paymentDate: z.string().min(1, 'Chọn ngày chi'),
    paymentType: z.enum(['material_purchase', 'transport', 'loading', 'storage', 'other']),
    amountBeforeVat: z.number({ invalid_type_error: 'Nhập số tiền' }).positive('Số tiền phải > 0'),
    vatPercent: z.number().min(0).max(20).default(0),
    paymentTerms: z.enum(['direct', 'debt']),
    debtDays: z.number().optional(),
    paymentMethod: z.enum(['cash', 'transfer', 'card']),
    transferCode: z.string().optional(),
    supplierId: z.string().optional(),
    importFormRef: z.string().optional(),
    reason: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentType === 'material_purchase' && !data.importFormRef?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['importFormRef'],
        message: 'Loại "Mua NVL" bắt buộc phải có tham chiếu phiếu nhập',
      })
    }
  })

export const receiptSchema = z
  .object({
    receiptDate: z.string().min(1, 'Chọn ngày thu'),
    receiptType: z.enum(['refund', 'compensation', 'liquidation', 'scrap', 'other']),
    amountBeforeVat: z.number({ invalid_type_error: 'Nhập số tiền' }).positive('Số tiền phải > 0'),
    vatPercent: z.number().min(0).max(20).default(0),
    receiptMethod: z.enum(['cash', 'transfer', 'e_wallet']),
    transferCode: z.string().optional(),
    supplierId: z.string().optional(),
    formRef: z.string().optional(),
    reason: z.string().min(1, 'Nhập lý do thu'),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      ['refund', 'compensation', 'liquidation'].includes(data.receiptType) &&
      !data.formRef?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['formRef'],
        message: 'Loại này bắt buộc phải có tham chiếu phiếu nhập/xuất',
      })
    }
  })

export type PaymentValues = z.infer<typeof paymentSchema>
export type ReceiptValues = z.infer<typeof receiptSchema>
