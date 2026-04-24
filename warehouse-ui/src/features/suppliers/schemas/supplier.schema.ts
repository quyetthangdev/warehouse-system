import { z } from 'zod'

export const supplierSchema = z.object({
  code: z.string().min(1, 'Mã không được để trống'),
  name: z.string().min(1, 'Tên không được để trống'),
  contactPerson: z.string().min(1, 'Người liên hệ không được để trống'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không đúng định dạng'),
  location: z.string().min(1, 'Địa chỉ không được để trống'),
  taxCode: z.string().min(1, 'Mã số thuế không được để trống'),
  paymentTerms: z.enum(['cod', '7_days', '15_days', '30_days'], {
    required_error: 'Chọn điều khoản thanh toán',
    invalid_type_error: 'Điều khoản thanh toán không hợp lệ',
  }),
  websiteUrl: z.string().optional(),
  note: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>
