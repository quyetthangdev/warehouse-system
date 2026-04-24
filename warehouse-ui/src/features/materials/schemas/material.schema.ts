import { z } from 'zod'

const unitConversionSchema = z.object({
  id: z.string(),
  fromQty: z.number().min(1, 'Số lượng tối thiểu là 1'),
  fromUnitId: z.string().min(1, 'Chọn đơn vị'),
  toQty: z.number().min(1, 'Số lượng tối thiểu là 1'),
  toUnitId: z.string().min(1, 'Chọn đơn vị'),
})

export const materialSchema = z
  .object({
    name: z.string().min(1, 'Tên không được để trống'),
    category: z.enum(
      ['main_ingredient', 'supporting', 'packaging', 'consumable', 'spare_part'],
      { required_error: 'Chọn danh mục', invalid_type_error: 'Danh mục không hợp lệ' },
    ),
    baseUnitId: z.string().min(1, 'Chọn đơn vị tính'),
    minimumInventory: z.number({ invalid_type_error: 'Nhập số' }).min(0, 'Tối thiểu là 0'),
    maximumInventory: z.number({ invalid_type_error: 'Nhập số' }).min(0, 'Tối thiểu là 0'),
    supplierIds: z.array(z.string()),
    conversions: z.array(unitConversionSchema).optional(),
  })
  .refine((d) => d.maximumInventory >= d.minimumInventory, {
    message: 'Tồn kho tối đa phải ≥ tối thiểu',
    path: ['maximumInventory'],
  })

export type MaterialFormValues = z.infer<typeof materialSchema>
