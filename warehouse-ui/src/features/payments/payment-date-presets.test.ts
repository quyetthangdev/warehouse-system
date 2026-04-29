import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getDatePreset } from './payment-date-presets'

describe('getDatePreset', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-29'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('today returns fromDate === toDate === 2026-04-29', () => {
    const { fromDate, toDate } = getDatePreset('today')
    expect(fromDate).toBe('2026-04-29')
    expect(toDate).toBe('2026-04-29')
  })

  it('this_week returns Monday to Sunday of current week', () => {
    const { fromDate, toDate } = getDatePreset('this_week')
    expect(fromDate).toBe('2026-04-27') // Monday
    expect(toDate).toBe('2026-05-03')   // Sunday
  })

  it('this_week handles Sunday correctly (returns Monday of same week)', () => {
    vi.setSystemTime(new Date('2026-04-26')) // Sunday
    const { fromDate, toDate } = getDatePreset('this_week')
    expect(fromDate).toBe('2026-04-20') // Monday of that week
    expect(toDate).toBe('2026-04-26')   // Sunday of that week
  })

  it('this_month returns 2026-04-01 to 2026-04-30', () => {
    const { fromDate, toDate } = getDatePreset('this_month')
    expect(fromDate).toBe('2026-04-01')
    expect(toDate).toBe('2026-04-30')
  })

  it('this_quarter returns 2026-04-01 to 2026-06-30 (Q2)', () => {
    const { fromDate, toDate } = getDatePreset('this_quarter')
    expect(fromDate).toBe('2026-04-01')
    expect(toDate).toBe('2026-06-30')
  })
})
