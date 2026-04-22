import type { DashboardData } from '../types/dashboard.types'

export const mockDashboardData: DashboardData = {
  stats: {
    totalMaterials: 48,
    totalStockValue: 12_500_000,
    lowStockCount: 5,
    nearExpiryCount: 3,
    outOfStockCount: 1,
    pendingImports: 2,
  },
  costChart: Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      materials: Math.floor(Math.random() * 5_000_000) + 2_000_000,
      shipping: Math.floor(Math.random() * 500_000) + 100_000,
      other: Math.floor(Math.random() * 200_000) + 50_000,
    }
  }),
}
