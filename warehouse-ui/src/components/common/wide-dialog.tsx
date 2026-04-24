import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface WideDialogProps {
  open: boolean
  onClose: () => void
  children?: React.ReactNode
  className?: string
}

export function WideDialog({ open, onClose, children, className }: WideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn('sm:max-w-5xl p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col', className)}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}
