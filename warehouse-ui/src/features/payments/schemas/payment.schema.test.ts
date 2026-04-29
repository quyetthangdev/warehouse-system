import { describe, it, expect } from 'vitest'
import { paymentSchema, receiptSchema } from './payment.schema'

describe('paymentSchema', () => {
  it('requires importFormRef when paymentType is material_purchase', () => {
    const result = paymentSchema.safeParse({
      paymentDate: '2026-01-01',
      paymentType: 'material_purchase',
      amountBeforeVat: 100000,
      vatPercent: 0,
      paymentTerms: 'direct',
      paymentMethod: 'cash',
      importFormRef: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const importFormRefError = result.error.issues.find(
        (i) => i.path.includes('importFormRef'),
      )
      expect(importFormRefError).toBeDefined()
    }
  })

  it('does not require importFormRef for non-material types', () => {
    const result = paymentSchema.safeParse({
      paymentDate: '2026-01-01',
      paymentType: 'transport',
      amountBeforeVat: 100000,
      vatPercent: 0,
      paymentTerms: 'direct',
      paymentMethod: 'cash',
    })
    expect(result.success).toBe(true)
  })
})

describe('receiptSchema', () => {
  it('requires formRef when receiptType is refund', () => {
    const result = receiptSchema.safeParse({
      receiptDate: '2026-01-01',
      receiptType: 'refund',
      amountBeforeVat: 100000,
      vatPercent: 0,
      receiptMethod: 'cash',
      reason: 'Hoàn tiền',
      formRef: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const formRefError = result.error.issues.find((i) => i.path.includes('formRef'))
      expect(formRefError).toBeDefined()
    }
  })

  it('does not require formRef for scrap type', () => {
    const result = receiptSchema.safeParse({
      receiptDate: '2026-01-01',
      receiptType: 'scrap',
      amountBeforeVat: 100000,
      vatPercent: 0,
      receiptMethod: 'cash',
      reason: 'Bán bao bì',
    })
    expect(result.success).toBe(true)
  })
})
