import { z } from 'zod'

export const importFormItemSchema = z.object({
  materialId: z.string(),
  materialName: z.string(),
  unit: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0, 'Đơn giá phải >= 0'),
  batchNumber: z.string().optional(),
  mfgDate: z.string().optional(),
  expiryDate: z.string().optional(),
  note: z.string().optional(),
})

export const importFormSchema = z.object({
  supplierId: z.string().min(1, 'Chọn nhà cung cấp'),
  warehouseId: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Nhập số hóa đơn'),
  poNumber: z.string().optional(),
  importDate: z.string().min(1, 'Chọn ngày nhập'),
  importType: z.string().optional(),
  note: z.string().optional(),
  items: z.array(importFormItemSchema).default([]),
})

export type ImportFormValues = z.infer<typeof importFormSchema>
export type ImportFormItemValues = z.infer<typeof importFormItemSchema>
