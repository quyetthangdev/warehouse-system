import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: 'orange' | 'green'
}

export function StatsCard({ title, value, icon: Icon, iconColor = 'orange' }: StatsCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card px-6 py-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            iconColor === 'orange' && 'bg-primary/10 text-primary',
            iconColor === 'green' && 'bg-emerald-100 text-emerald-600',
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <span className="text-3xl font-bold tracking-tight">{value}</span>
    </div>
  )
}
