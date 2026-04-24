import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Package, BarChart2, AlertTriangle, Clock, Search, Download, Bell } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterDropdown } from '@/components/common/filter-dropdown'
import { api } from '@/services/axios.instance'
import { useNotificationStore } from '@/stores/notification.store'
import type { ApiResponse } from '@/types/api.types'
import type { Notification } from '@/stores/notification.store'
import { useDashboard } from '../hooks/use-dashboard'
import { StatsCard } from './stats-card'
import { CostChart } from './cost-chart'

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ'
}

export function DashboardPage() {
  const setNotifications = useNotificationStore((s) => s.setNotifications)
  const [selectedDays, setSelectedDays] = useState(7)
  const { data, isLoading, error, refetch } = useDashboard(selectedDays)
  const filterLabel = `${selectedDays} ngày`

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
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <button onClick={refetch} className="underline">
            Thử lại
          </button>
        </div>
      </PageContainer>
    )
  }

  const { stats, importChart, exportChart, inventory } = data!

  return (
    <PageContainer
      title="Tổng quan"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Thành công!')}>
            <Bell className="h-4 w-4 mr-1.5" />
            Test Toast
          </Button>
          <FilterDropdown
            onApply={({ frequency }) => setSelectedDays(Number(frequency))}
          />
        </div>
      }
    >
      <div className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          <StatsCard
            title="Tổng số nguyên vật liệu"
            value={stats.totalMaterials}
            icon={Package}
            iconColor="orange"
          />
          <StatsCard
            title="Tổng giá trị tồn kho"
            value={formatVnd(stats.totalStockValue)}
            icon={BarChart2}
            iconColor="green"
          />
          <StatsCard
            title="Số NVL tồn thấp"
            value={stats.lowStockCount}
            icon={AlertTriangle}
            iconColor="orange"
          />
          <StatsCard
            title="Số NVL sắp hết hạn"
            value={stats.nearExpiryCount}
            icon={Clock}
            iconColor="orange"
          />
        </div>

        <CostChart title="Biểu đồ nhập kho" data={importChart} filterLabel={filterLabel} />
        <CostChart title="Biểu đồ xuất kho" data={exportChart} filterLabel={filterLabel} />

        {/* Inventory table */}
        <div className="rounded-md border bg-card">
          <div className="p-4">
            <p className="mb-4 text-sm font-medium">Danh sách tồn kho</p>
            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Tìm kiếm..." className="pl-8" />
              </div>
              <div className="ml-auto">
                <Button variant="outline" size="sm">
                  <Download />
                  Xuất file
                </Button>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium text-muted-foreground">NVL</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Lô</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">HSD</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Số lượng còn</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3">{item.name}</td>
                    <td className="py-3">{item.batch}</td>
                    <td className="py-3">{item.expiryDate}</td>
                    <td className="py-3">{item.remaining}</td>
                    <td className="py-3">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </PageContainer>
  )
}
