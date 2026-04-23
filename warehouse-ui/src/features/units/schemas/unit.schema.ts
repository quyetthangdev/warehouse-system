import { z } from 'zod'

export const unitSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  symbol: z.string().min(1, 'Ký hiệu không được để trống'),
  type: z.enum(['weight', 'volume', 'quantity'], {
    required_error: 'Chọn loại đơn vị',
    invalid_type_error: 'Loại đơn vị không hợp lệ',
  }),
})

export type UnitFormValues = z.infer<typeof unitSchema>
