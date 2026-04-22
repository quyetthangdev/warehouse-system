import { useEffect } from 'react'
import { Package, TrendingDown, Clock, XCircle } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/axios.instance'
import { useNotificationStore } from '@/stores/notification.store'
import type { ApiResponse } from '@/types/api.types'
import type { Notification } from '@/stores/notification.store'
import { useDashboard } from '../hooks/use-dashboard'
import { StatsCard } from './stats-card'
import { AlertPanel } from './alert-panel'
import { CostChart } from './cost-chart'

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard()
  const setNotifications = useNotificationStore((s) => s.setNotifications)

  useEffect(() => {
    api
      .get<ApiResponse<Notification[]>>('/notifications')
      .then(({ data: res }) => setNotifications(res.data))
      .catch(() => {})
  }, [setNotifications])

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{' '}
          <button onClick={refetch} className="underline">
            Thử lại
          </button>
        </div>
      </PageContainer>
    )
  }

  const { stats, costChart } = data!

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            title="Tổng nguyên vật liệu"
            value={stats.totalMaterials}
            icon={Package}
          />
          <StatsCard
            title="Tồn kho thấp"
            value={stats.lowStockCount}
            icon={TrendingDown}
            variant={stats.lowStockCount > 0 ? 'warning' : 'default'}
            description="nguyên vật liệu dưới mức tối thiểu"
          />
          <StatsCard
            title="Sắp hết hạn"
            value={stats.nearExpiryCount}
            icon={Clock}
            variant={stats.nearExpiryCount > 0 ? 'warning' : 'default'}
            description="còn dưới 30 ngày"
          />
          <StatsCard
            title="Hết hàng"
            value={stats.outOfStockCount}
            icon={XCircle}
            variant={stats.outOfStockCount > 0 ? 'danger' : 'default'}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CostChart data={costChart} />
          </div>
          <AlertPanel />
        </div>
      </div>
    </PageContainer>
  )
}
