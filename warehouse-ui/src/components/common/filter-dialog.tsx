import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply?: (filter: { frequency: string; startDate: string; endDate: string }) => void
}

function formatDate(date: Date) {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} 00:00`
}

export function FilterDialog({ open, onOpenChange, onApply }: FilterDialogProps) {
  const [frequency, setFrequency] = useState('7')

  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - Number(frequency))

  function handleApply() {
    onApply?.({ frequency, startDate: formatDate(startDate), endDate: formatDate(today) })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">Tần suất</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày</SelectItem>
              <SelectItem value="14">14 ngày</SelectItem>
              <SelectItem value="30">30 ngày</SelectItem>
              <SelectItem value="90">90 ngày</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Ngày bắt đầu</p>
              <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{formatDate(startDate)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Ngày kết thúc</p>
              <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{formatDate(today)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button size="sm" onClick={handleApply}>
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
