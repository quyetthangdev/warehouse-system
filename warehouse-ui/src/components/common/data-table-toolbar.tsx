import { type ReactNode } from 'react'
import { type Table } from '@tanstack/react-table'
import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  hideSearch?: boolean
  filters?: ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Tìm kiếm...',
  hideSearch = false,
  filters,
}: DataTableToolbarProps<TData>) {
  const hideableColumns = table.getAllColumns().filter((col) => col.getCanHide())

  return (
    <div className="flex items-center gap-3">
      {!hideSearch && (
        <Input
          placeholder={searchPlaceholder}
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      )}
      <div className="ml-auto flex items-center gap-2">
        {filters}
        {hideableColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-1.5" />
                Cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Cột hiển thị</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hideableColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {col.columnDef.meta?.label ??
                    (typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
