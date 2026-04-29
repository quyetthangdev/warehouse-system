import { describe, it, expect } from 'vitest'
import { formatVnd, calcDueDate } from './payment.utils'

describe('formatVnd', () => {
  it('formats zero', () => {
    expect(formatVnd(0)).toBe('0 đ')
  })
  it('formats 1500000', () => {
    expect(formatVnd(1500000)).toBe('1.500.000 đ')
  })
})

describe('calcDueDate', () => {
  it('adds debtDays to paymentDate', () => {
    expect(calcDueDate('2025-12-22', 7)).toBe('2025-12-29')
  })
  it('crosses month boundary', () => {
    expect(calcDueDate('2025-12-28', 7)).toBe('2026-01-04')
  })
})
