import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: 'orange' | 'green'
  trend?: { value: number; label?: string }
}

export function StatsCard({ title, value, icon: Icon, iconColor = 'orange', trend }: StatsCardProps) {
  const trendUp = trend && trend.value >= 0
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card px-5 py-4">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            iconColor === 'orange' && 'bg-primary/10 text-primary',
            iconColor === 'green' && 'bg-emerald-100 text-emerald-600',
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              'mb-0.5 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              trendUp
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
            )}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendUp ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {trend?.label && (
        <p className="text-xs text-muted-foreground -mt-1">{trend.label}</p>
      )}
    </div>
  )
}
