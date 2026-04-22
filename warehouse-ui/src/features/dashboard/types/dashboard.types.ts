export interface StatsOverview {
  totalMaterials: number
  totalStockValue: number
  lowStockCount: number
  nearExpiryCount: number
  outOfStockCount: number
  pendingImports: number
}

export interface CostChartPoint {
  date: string
  materials: number
  shipping: number
  other: number
}

export interface DashboardData {
  stats: StatsOverview
  costChart: CostChartPoint[]
}
