import { describe, it, expect } from 'vitest'
import { loginSchema } from './login.schema'

describe('loginSchema', () => {
  it('accept email và password hợp lệ', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'password123' }).success).toBe(true)
  })

  it('reject email rỗng', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('reject email không đúng format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('reject password dưới 6 ký tự', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })
})
