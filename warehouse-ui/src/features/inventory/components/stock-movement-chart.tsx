// src/features/inventory/components/stock-movement-chart.tsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { MovementPoint } from '../types/inventory.types'

interface StockMovementChartProps {
  data: MovementPoint[]
}

// Recharts requires concrete color strings; CSS variables cannot be used directly
const SERIES = [
  { key: 'import' as const, label: 'Nhập kho', color: '#22c55e' },
  { key: 'export' as const, label: 'Xuất kho', color: '#f97316' },
  { key: 'balance' as const, label: 'Tồn kho', color: '#3b82f6' },
]

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="space-y-1 rounded-lg border bg-card px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {SERIES.find((s) => s.key === p.name)?.label ?? p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function StockMovementChart({ data }: StockMovementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          {SERIES.map(({ key, color }) => (
            <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          formatter={(value) => SERIES.find((s) => s.key === value)?.label ?? value}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />
        {SERIES.map(({ key, color }) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${key})`}
            dot={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
