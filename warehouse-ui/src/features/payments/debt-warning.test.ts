import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getDebtWarnings } from './debt-warning'
import type { Payment } from './types/payment.types'

const BASE: Payment = {
  id: 'pc-001',
  code: 'PC-001',
  createdAt: '2026-01-01T00:00:00Z',
  paymentDate: '2026-01-01',
  paymentType: 'material_purchase',
  amountBeforeVat: 1000000,
  vatPercent: 0,
  vatAmount: 0,
  totalAmount: 1000000,
  paymentTerms: 'debt',
  debtDays: 30,
  paymentMethod: 'transfer',
  createdBy: 'User A',
  status: 'draft',
}

describe('getDebtWarnings', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-29'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns overdue entry for dueDate in the past', () => {
    const payment = { ...BASE, dueDate: '2026-04-20' }
    const warnings = getDebtWarnings([payment])
    expect(warnings).toHaveLength(1)
    expect(warnings[0].type).toBe('overdue')
    expect(warnings[0].code).toBe('PC-001')
  })

  it('returns due_soon entry for dueDate within 7 days', () => {
    const payment = { ...BASE, dueDate: '2026-05-03' }
    const warnings = getDebtWarnings([payment])
    expect(warnings).toHaveLength(1)
    expect(warnings[0].type).toBe('due_soon')
  })

  it('returns no warning for dueDate more than 7 days away', () => {
    const payment = { ...BASE, dueDate: '2026-06-01' }
    const warnings = getDebtWarnings([payment])
    expect(warnings).toHaveLength(0)
  })

  it('ignores confirmed payments', () => {
    const payment = { ...BASE, dueDate: '2026-04-20', status: 'confirmed' as const }
    const warnings = getDebtWarnings([payment])
    expect(warnings).toHaveLength(0)
  })

  it('ignores payments without dueDate', () => {
    const payment = { ...BASE, dueDate: undefined }
    const warnings = getDebtWarnings([payment])
    expect(warnings).toHaveLength(0)
  })

  it('ignores direct-payment-terms payments', () => {
    const payment = { ...BASE, paymentTerms: 'direct' as const, dueDate: '2026-04-20' }
    const warnings = getDebtWarnings([payment])
    expect(warnings).toHaveLength(0)
  })
})
