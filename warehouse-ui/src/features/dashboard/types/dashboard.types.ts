export interface StatsOverview {
  totalMaterials: number
  totalStockValue: number
  lowStockCount: number
  nearExpiryCount: number
}

export interface ChartPoint {
  date: string
  value: number
}

export interface InventoryItem {
  name: string
  batch: number
  expiryDate: string
  remaining: number
  status: string
}

export interface DashboardData {
  stats: StatsOverview
  importChart: ChartPoint[]
  exportChart: ChartPoint[]
  inventory: InventoryItem[]
}
