import type { DashboardData } from '../types/dashboard.types'

function makeDateLabel(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} 12:00`
}

export const mockDashboardData: DashboardData = {
  stats: {
    totalMaterials: 88,
    totalStockValue: 12_000_000,
    lowStockCount: 4,
    nearExpiryCount: 2,
  },
  importChart: Array.from({ length: 7 }, (_, i) => ({
    date: makeDateLabel(6 - i),
    value: Math.floor(Math.random() * 8_000_000) + 1_000_000,
  })),
  exportChart: Array.from({ length: 7 }, (_, i) => ({
    date: makeDateLabel(6 - i),
    value: Math.floor(Math.random() * 5_000_000) + 500_000,
  })),
  inventory: [
    { name: 'Cam tươi', batch: 1, expiryDate: '03/01/2026', remaining: 12, status: '' },
    { name: 'Đường', batch: 1, expiryDate: '03/01/2026', remaining: 13, status: '' },
    { name: 'Sữa tươi', batch: 1, expiryDate: '03/01/2026', remaining: 14, status: '' },
    { name: 'Cà phê', batch: 2, expiryDate: '15/03/2026', remaining: 50, status: '' },
    { name: 'Trà xanh', batch: 1, expiryDate: '20/06/2026', remaining: 30, status: '' },
  ],
}
