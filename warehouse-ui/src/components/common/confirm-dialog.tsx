import type { ComponentType } from 'react'
import { AlertTriangle, CircleCheck } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import { AppDialog, AppDialogFooter } from './app-dialog'

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>

const VARIANT_DEFAULT_ICON: Record<string, ComponentType<{ className?: string }>> = {
  destructive: AlertTriangle,
  default:     CircleCheck,
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  children?: React.ReactNode
  icon?: ComponentType<{ className?: string }>
  isLoading?: boolean
  confirmLabel?: string
  confirmLoadingLabel?: string
  confirmVariant?: ButtonVariant
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  children,
  icon,
  isLoading,
  confirmLabel = 'Xác nhận',
  confirmLoadingLabel,
  confirmVariant = 'default',
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const iconVariant = confirmVariant === 'destructive' ? 'destructive' : 'default'
  const Icon = icon ?? VARIANT_DEFAULT_ICON[iconVariant] ?? CircleCheck

  return (
    <AppDialog
      open={open}
      onClose={onCancel}
      icon={Icon}
      iconVariant={iconVariant}
      title={title}
      description={description}
      isLoading={isLoading}
    >
      {children && <div className="text-sm">{children}</div>}

      <AppDialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? (confirmLoadingLabel ?? `${confirmLabel}...`) : confirmLabel}
        </Button>
      </AppDialogFooter>
    </AppDialog>
  )
}
