import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  title?: string
  actions?: React.ReactNode
}

export function PageContainer({ children, className, title, actions }: PageContainerProps) {
  return (
    <div className={cn('flex-1 overflow-auto p-7', className)}>
      {(title || actions) && (
        <div className="mb-6 flex items-center justify-between">
          {title && <h1 className="text-2xl font-semibold">{title}</h1>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
