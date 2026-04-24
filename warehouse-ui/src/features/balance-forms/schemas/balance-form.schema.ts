import { z } from 'zod'

export const balanceFormItemSchema = z.object({
  materialId: z.string().min(1, 'Chọn nguyên vật liệu'),
  materialName: z.string(),
  unit: z.string(),
  systemQuantity: z.number().nonnegative(),
})

export const balanceFormSchema = z.object({
  balanceType: z.enum(['periodic', 'unplanned'], { required_error: 'Chọn loại kiểm' }),
  scope: z.enum(['full', 'partial'], { required_error: 'Chọn phạm vi' }),
  balanceDate: z.string().min(1, 'Chọn ngày kiểm'),
  inspectors: z.array(z.string()).min(2, 'Phải có ít nhất 2 người kiểm'),
  note: z.string().optional(),
  attachmentNames: z.array(z.string()).optional(),
  items: z.array(balanceFormItemSchema).min(1, 'Phải có ít nhất 1 nguyên vật liệu'),
})

export type BalanceFormValues = z.infer<typeof balanceFormSchema>
