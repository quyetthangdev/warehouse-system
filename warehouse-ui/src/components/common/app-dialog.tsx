import type { ComponentType } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type IconVariant = 'default' | 'destructive'

const VARIANT_COLOR: Record<IconVariant, { ring: string; icon: string }> = {
  default:     { ring: 'bg-primary/10',    icon: 'text-primary' },
  destructive: { ring: 'bg-destructive/10', icon: 'text-destructive' },
}

export interface AppDialogProps {
  open: boolean
  onClose: () => void
  icon: ComponentType<{ className?: string }>
  iconVariant?: IconVariant
  title: string
  description?: string
  isLoading?: boolean
  className?: string
  children?: React.ReactNode
}

export function AppDialog({
  open,
  onClose,
  icon: Icon,
  iconVariant = 'default',
  title,
  description,
  isLoading,
  className,
  children,
}: AppDialogProps) {
  const colors = VARIANT_COLOR[iconVariant]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isLoading && onClose()}>
      <DialogContent showCloseButton={false} className={cn('sm:max-w-sm', className)}>

        {/* Top row: icon + close */}
        <div className="flex items-center justify-between">
          <div className={cn('rounded-full p-2', colors.ring)}>
            <Icon className={cn('size-5', colors.icon)} />
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" disabled={isLoading}>
              <X />
              <span className="sr-only">Đóng</span>
            </Button>
          </DialogClose>
        </div>

        {/* Title + optional description */}
        <div className="space-y-1">
          <p className="text-base font-semibold leading-snug">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>

        {children}

      </DialogContent>
    </Dialog>
  )
}

/** Standard footer row used inside AppDialog — right-aligned, no border */
export function AppDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}
