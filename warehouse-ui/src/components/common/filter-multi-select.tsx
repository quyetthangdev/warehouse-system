import { ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface FilterMultiSelectProps {
  label: string
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

export function FilterMultiSelect({ label, options, selected, onChange, className }: FilterMultiSelectProps) {
  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('justify-between font-normal', className)}>
          <span className="truncate">
            {selected.length === 0 ? label : `${label} (${selected.length})`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        {options.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">Không có dữ liệu</p>
        ) : (
          <ul className="max-h-52 overflow-y-auto space-y-1">
            {options.map((opt) => {
              const checked = selected.includes(opt.value)
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted text-left"
                  >
                    <span className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                      checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input'
                    )}>
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {selected.length > 0 && (
          <div className="mt-1 border-t pt-1">
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted text-left"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
