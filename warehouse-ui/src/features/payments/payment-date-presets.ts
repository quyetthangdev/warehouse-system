export type DatePreset = 'today' | 'this_week' | 'this_month' | 'this_quarter'

function toIso(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

export function getDatePreset(preset: DatePreset): { fromDate: string; toDate: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (preset === 'today') {
    const s = toIso(today)
    return { fromDate: s, toDate: s }
  }

  if (preset === 'this_week') {
    const day = today.getDay() // 0=Sun
    const diff = day === 0 ? -6 : 1 - day // Monday offset
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { fromDate: toIso(monday), toDate: toIso(sunday) }
  }

  if (preset === 'this_month') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { fromDate: toIso(first), toDate: toIso(last) }
  }

  // this_quarter
  const q = Math.floor(today.getMonth() / 3)
  const first = new Date(today.getFullYear(), q * 3, 1)
  const last = new Date(today.getFullYear(), q * 3 + 3, 0)
  return { fromDate: toIso(first), toDate: toIso(last) }
}

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Hôm nay',
  this_week: 'Tuần này',
  this_month: 'Tháng này',
  this_quarter: 'Quý này',
}
