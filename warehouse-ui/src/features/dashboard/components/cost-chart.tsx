import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { TooltipProps } from 'recharts'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ChartPoint } from '../types/dashboard.types'

interface CostChartProps {
  title: string
  data: ChartPoint[]
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

export function CostChart({ title, data }: CostChartProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [frequency, setFrequency] = useState('7')

  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)

  return (
    <div className="relative rounded-md border bg-card p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mb-4 text-xs text-muted-foreground">Giá trị (nghìn đồng)</p>

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

      {/* Tần suất filter panel */}
      {filterOpen && (
        <div className="absolute right-4 top-12 z-10 w-72 rounded-md border bg-card p-4 shadow-md">
          <p className="mb-3 text-sm font-medium">Tần suất</p>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="mb-4 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày</SelectItem>
              <SelectItem value="14">14 ngày</SelectItem>
              <SelectItem value="30">30 ngày</SelectItem>
              <SelectItem value="90">90 ngày</SelectItem>
            </SelectContent>
          </Select>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Ngày bắt đầu</p>
              <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-xs">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>{formatDateInput(weekAgo)}</span>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Ngày kết thúc</p>
              <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-xs">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>{formatDateInput(today)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={() => setFilterOpen(false)}>
              Áp dụng
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setFilterOpen((v) => !v)}
        className="absolute right-4 top-4 text-xs text-muted-foreground hover:text-foreground"
      >
        Tần suất
      </button>
    </div>
  )
}
