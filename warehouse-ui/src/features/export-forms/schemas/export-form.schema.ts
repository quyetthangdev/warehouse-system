import { z } from 'zod'

export const exportFormItemSchema = z.object({
  materialId: z.string().min(1, 'Chọn nguyên vật liệu'),
  materialName: z.string(),
  unit: z.string(),
  quantity: z.number().positive('Số lượng phải lớn hơn 0'),
  expiryDate: z.string().min(1, 'Hạn sử dụng là bắt buộc'),
  note: z.string().optional(),
})

export const exportFormSchema = z.object({
  exportType: z.enum(['production', 'disposal', 'transfer', 'other'], {
    required_error: 'Chọn loại xuất',
  }),
  exportDate: z.string().min(1, 'Chọn ngày xuất'),
  recipient: z.string().optional(),
  note: z.string().optional(),
  disposalReason: z.enum(['expired', 'damaged', 'contaminated', 'other']).optional(),
  disposalReasonText: z.string().optional(),
  destinationWarehouseId: z.string().optional(),
  customReason: z.string().optional(),
  items: z.array(exportFormItemSchema).default([]),
})

export type ExportFormValues = z.infer<typeof exportFormSchema>
export type ExportFormItemValues = z.infer<typeof exportFormItemSchema>
