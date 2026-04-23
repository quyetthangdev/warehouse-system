// src/features/inventory/components/stat-card.tsx
interface StatCardProps {
  title: string
  value: string | number
  sub?: string
}

export function StatCard({ title, value, sub }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}
