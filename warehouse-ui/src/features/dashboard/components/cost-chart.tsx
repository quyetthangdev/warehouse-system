import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CostChartPoint } from '../types/dashboard.types'

interface CostChartProps {
  data: CostChartPoint[]
}

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value)
}

export function CostChart({ data }: CostChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Chi phí kho 7 ngày qua</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatVnd} tick={{ fontSize: 11 }} width={72} />
            <Tooltip formatter={(v: unknown) => formatVnd(v as number)} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="materials" name="Nguyên liệu" fill="#3b82f6" radius={[2, 2, 0, 0] as [number, number, number, number]} />
            <Bar dataKey="shipping" name="Vận chuyển" fill="#f59e0b" radius={[2, 2, 0, 0] as [number, number, number, number]} />
            <Bar dataKey="other" name="Khác" fill="#8b5cf6" radius={[2, 2, 0, 0] as [number, number, number, number]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
