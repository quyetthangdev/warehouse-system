import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  label: string
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function StatusBadge({ label, className, variant }: StatusBadgeProps) {
  return <Badge variant={variant} className={className}>{label}</Badge>
}
