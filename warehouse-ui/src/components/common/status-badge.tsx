import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  label: string
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function StatusBadge({ label, className, variant }: StatusBadgeProps) {
  return <Badge variant={variant} className={className}>{label}</Badge>
}
