import { useState } from 'react'
import { SlidersHorizontal, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterDropdownProps {
  onApply?: (filter: { frequency: string; startDate: string; endDate: string }) => void
  triggerClassName?: string
}

function fmt(date: Date) {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

export function FilterDropdown({ onApply, triggerClassName }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const [frequency, setFrequency] = useState('7')
  const [startDate, setStartDate] = useState<Date>(() => daysAgo(7))
  const [endDate, setEndDate] = useState<Date>(() => new Date())
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  function handleFrequencyChange(val: string) {
    setFrequency(val)
    setStartDate(daysAgo(Number(val)))
    setEndDate(new Date())
  }

  function handleApply() {
    onApply?.({ frequency, startDate: fmt(startDate), endDate: fmt(endDate) })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <SlidersHorizontal />
          Bộ lọc
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-4">
        <p className="mb-3 text-sm font-medium">Tần suất</p>

        <Select value={frequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger className="mb-4 h-9 w-full text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 ngày</SelectItem>
            <SelectItem value="14">14 ngày</SelectItem>
            <SelectItem value="30">30 ngày</SelectItem>
            <SelectItem value="90">90 ngày</SelectItem>
          </SelectContent>
        </Select>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Ngày bắt đầu</p>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <button className="flex h-9 w-full items-center gap-2 rounded-md border px-3 text-xs transition-colors hover:bg-accent">
                  <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{fmt(startDate)}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => { if (d) { setStartDate(d); setStartOpen(false) } }}
                  disabled={(d) => d > endDate}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Ngày kết thúc</p>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <button className="flex h-9 w-full items-center gap-2 rounded-md border px-3 text-xs transition-colors hover:bg-accent">
                  <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{fmt(endDate)}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" side="bottom">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => { if (d) { setEndDate(d); setEndOpen(false) } }}
                  disabled={(d) => d < startDate || d > new Date()}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Huỷ</Button>
          <Button size="sm" onClick={handleApply}>Áp dụng</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
