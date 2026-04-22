import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  active: boolean
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return active ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Hoạt động</Badge>
  ) : (
    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Ngừng dùng</Badge>
  )
}
