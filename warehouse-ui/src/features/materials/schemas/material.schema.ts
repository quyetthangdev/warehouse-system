import { z } from 'zod'

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
  })
  .refine((d) => d.maximumInventory >= d.minimumInventory, {
    message: 'Tồn kho tối đa phải ≥ tối thiểu',
    path: ['maximumInventory'],
  })

export type MaterialFormValues = z.infer<typeof materialSchema>
