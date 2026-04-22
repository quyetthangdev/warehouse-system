import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNotificationStore, type NotificationSeverity } from '@/stores/notification.store'
import { cn } from '@/lib/utils'

const severityStyles: Record<NotificationSeverity, string> = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const severityLabel: Record<NotificationSeverity, string> = {
  critical: 'Khẩn',
  warning: 'Cảnh báo',
  info: 'Thông tin',
}

export function AlertPanel() {
  const notifications = useNotificationStore((s) => s.notifications)
  const unread = notifications.filter((n) => !n.isRead)

  if (unread.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Không có cảnh báo mới.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          Cảnh báo
          <Badge variant="secondary">{unread.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {unread.slice(0, 5).map((n) => (
          <div
            key={n.id}
            className={cn('rounded-md border px-3 py-2 text-sm', severityStyles[n.severity])}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{n.title}</span>
              <Badge variant="outline" className="text-xs">
                {severityLabel[n.severity]}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs opacity-80">{n.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
