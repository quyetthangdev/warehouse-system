import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ChartPoint } from '../types/dashboard.types'

interface CostChartProps {
  title: string
  data: ChartPoint[]
  filterLabel?: string // e.g. "7 ngày" — shown as subtitle when set
}

function formatVnd(value: number) {
  if (value === 0) return '0 đ'
  return new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value) + ' đ'
}

function formatDateInput(date: Date) {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} 00:00`
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{formatVnd(payload[0].value ?? 0)}</p>
    </div>
  )
}

export function CostChart({ title, data, filterLabel }: CostChartProps) {
  return (
    <div className="rounded-md border bg-card p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mb-4 text-xs text-muted-foreground">
        {filterLabel ? `${filterLabel} — Giá trị (nghìn đồng)` : 'Giá trị (nghìn đồng)'}
      </p>

      <div className="[&_.recharts-bar-rectangle_.recharts-rectangle]:fill-primary">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={formatVnd}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'oklch(0 0 0 / 0.04)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
