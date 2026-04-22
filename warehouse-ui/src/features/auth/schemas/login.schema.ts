import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không đúng định dạng'),
  password: z
    .string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
