# Phase 2A — Shared DataTable + Units Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build reusable `DataTable` component (TanStack Table v8), shared `ConfirmDialog` and `StatusBadge`, and the Units CRUD module (list page + create/edit/delete dialog).

**Architecture:** Feature-based, nhất quán Phase 1. DataTable tại `src/components/common/`. Units module tại `src/features/units/`. Server state local trong `useUnits` hook, không Zustand. MSW handlers dùng hardcoded `http://localhost:3000`. RBAC check qua `useAuthStore((s) => s.hasPermission)`.

**Tech Stack:** React 19, TypeScript, TanStack Table v8 (mới), shadcn/ui (Table, Select, Dialog), React Hook Form + Zod, MSW v2, Vitest + RTL, Axios, Sonner toasts.

---

## File Map

```
warehouse-ui/
├── package.json                                    [MODIFY] add @tanstack/react-table
└── src/
    ├── components/
    │   └── common/
    │       ├── data-table.tsx                      [CREATE]
    │       ├── confirm-dialog.tsx                  [CREATE]
    │       └── status-badge.tsx                    [CREATE]
    ├── features/
    │   └── units/
    │       ├── types/unit.types.ts                 [CREATE]
    │       ├── schemas/unit.schema.ts              [CREATE]
    │       ├── hooks/use-units.ts                  [CREATE]
    │       ├── hooks/use-units.test.ts             [CREATE]
    │       ├── components/unit-list-page.tsx       [CREATE]
    │       ├── components/unit-dialog.tsx          [CREATE]
    │       └── index.ts                            [CREATE]
    ├── services/
    │   └── unit.service.ts                         [CREATE]
    ├── mocks/handlers/
    │   ├── unit.handler.ts                         [CREATE]
    │   └── index.ts                                [MODIFY] add unitHandlers
    └── router/
        └── index.tsx                               [MODIFY] add /units route
```

---

## Task 1: Cài @tanstack/react-table + shadcn Table và Select

**Files:**
- Modify: `warehouse-ui/package.json`
- Create: `warehouse-ui/src/components/ui/table.tsx` (via shadcn)
- Create: `warehouse-ui/src/components/ui/select.tsx` (via shadcn)

- [ ] **Step 1: Cài @tanstack/react-table**

```bash
cd /Users/phanquyetthang/warehouse-system/warehouse-ui
npm install @tanstack/react-table
```

Expected: `added 1 package` (no errors)

- [ ] **Step 2: Thêm shadcn Table component**

```bash
npx shadcn add table
```

Expected: File `src/components/ui/table.tsx` được tạo.

- [ ] **Step 3: Thêm shadcn Select component**

```bash
npx shadcn add select
```

Expected: File `src/components/ui/select.tsx` được tạo.

- [ ] **Step 4: Chạy build để xác nhận không có lỗi**

```bash
npm run build
```

Expected: Build thành công, không có TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/ui/table.tsx src/components/ui/select.tsx
git commit -m "chore: add TanStack Table and shadcn table/select components"
```

---

## Task 2: Shared components — StatusBadge và ConfirmDialog

**Files:**
- Create: `warehouse-ui/src/components/common/status-badge.tsx`
- Create: `warehouse-ui/src/components/common/confirm-dialog.tsx`

- [ ] **Step 1: Tạo status-badge.tsx**

```tsx
// warehouse-ui/src/components/common/status-badge.tsx
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  active: boolean
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return active ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Hoạt động</Badge>
  ) : (
    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Ngừng dùng</Badge>
  )
}
```

- [ ] **Step 2: Tạo confirm-dialog.tsx**

```tsx
// warehouse-ui/src/components/common/confirm-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Chạy build**

```bash
npm run build
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/common/
git commit -m "feat: add shared StatusBadge and ConfirmDialog components"
```

---

## Task 3: DataTable component (TanStack Table v8)

**Files:**
- Create: `warehouse-ui/src/components/common/data-table.tsx`

- [ ] **Step 1: Tạo data-table.tsx**

```tsx
// warehouse-ui/src/components/common/data-table.tsx
import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  searchPlaceholder?: string
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  searchPlaceholder = 'Tìm kiếm...',
}: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const filteredCount = table.getFilteredRowModel().rows.length
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount)

  return (
    <div className="space-y-4">
      <Input
        placeholder={searchPlaceholder}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-muted-foreground"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredCount === 0
            ? 'Không có kết quả'
            : `Hiển thị ${from}–${to} / ${filteredCount} kết quả`}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ‹
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Chạy build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/data-table.tsx
git commit -m "feat: add generic DataTable component with TanStack Table v8"
```

---

## Task 4: Unit types + schema + service + MSW handler

**Files:**
- Create: `warehouse-ui/src/features/units/types/unit.types.ts`
- Create: `warehouse-ui/src/features/units/schemas/unit.schema.ts`
- Create: `warehouse-ui/src/services/unit.service.ts`
- Create: `warehouse-ui/src/mocks/handlers/unit.handler.ts`
- Modify: `warehouse-ui/src/mocks/handlers/index.ts`

- [ ] **Step 1: Tạo unit.types.ts**

```ts
// warehouse-ui/src/features/units/types/unit.types.ts
export type UnitType = 'weight' | 'volume' | 'quantity'

export interface Unit {
  id: string
  name: string
  symbol: string
  type: UnitType
}

export interface CreateUnitRequest {
  name: string
  symbol: string
  type: UnitType
}

export type UpdateUnitRequest = CreateUnitRequest
```

- [ ] **Step 2: Tạo unit.schema.ts**

```ts
// warehouse-ui/src/features/units/schemas/unit.schema.ts
import { z } from 'zod'

export const unitSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  symbol: z.string().min(1, 'Ký hiệu không được để trống'),
  type: z.enum(['weight', 'volume', 'quantity'], {
    required_error: 'Chọn loại đơn vị',
  }),
})

export type UnitFormValues = z.infer<typeof unitSchema>
```

- [ ] **Step 3: Tạo unit.service.ts**

```ts
// warehouse-ui/src/services/unit.service.ts
import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '@/features/units/types/unit.types'

export const unitService = {
  getAll() {
    return api.get<ApiResponse<Unit[]>>('/units')
  },

  create(payload: CreateUnitRequest) {
    return api.post<ApiResponse<Unit>>('/units', payload)
  },

  update(id: string, payload: UpdateUnitRequest) {
    return api.put<ApiResponse<Unit>>(`/units/${id}`, payload)
  },

  remove(id: string) {
    return api.delete<ApiResponse<void>>(`/units/${id}`)
  },
}
```

- [ ] **Step 4: Tạo unit.handler.ts**

```ts
// warehouse-ui/src/mocks/handlers/unit.handler.ts
import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { Unit } from '@/features/units/types/unit.types'

const BASE_URL = 'http://localhost:3000'

let units: Unit[] = [
  { id: 'unit-001', name: 'Kilogram', symbol: 'kg', type: 'weight' },
  { id: 'unit-002', name: 'Gram', symbol: 'g', type: 'weight' },
  { id: 'unit-003', name: 'Lít', symbol: 'l', type: 'volume' },
  { id: 'unit-004', name: 'Mililít', symbol: 'ml', type: 'volume' },
  { id: 'unit-005', name: 'Cái', symbol: 'cái', type: 'quantity' },
]

export const unitHandlers = [
  http.get(`${BASE_URL}/units`, () => {
    const response: ApiResponse<Unit[]> = { statusCode: 200, message: 'OK', data: units }
    return HttpResponse.json(response)
  }),

  http.post(`${BASE_URL}/units`, async ({ request }) => {
    const body = await request.json() as Omit<Unit, 'id'>
    const newUnit: Unit = { ...body, id: `unit-${Date.now()}` }
    units = [...units, newUnit]
    const response: ApiResponse<Unit> = { statusCode: 201, message: 'Tạo thành công', data: newUnit }
    return HttpResponse.json(response, { status: 201 })
  }),

  http.put(`${BASE_URL}/units/:id`, async ({ request, params }) => {
    const body = await request.json() as Omit<Unit, 'id'>
    units = units.map((u) => (u.id === params.id ? { ...u, ...body } : u))
    const updated = units.find((u) => u.id === params.id)!
    const response: ApiResponse<Unit> = { statusCode: 200, message: 'Cập nhật thành công', data: updated }
    return HttpResponse.json(response)
  }),

  http.delete(`${BASE_URL}/units/:id`, ({ params }) => {
    if (params.id === 'unit-in-use') {
      return HttpResponse.json(
        { statusCode: 409, message: 'Đơn vị đang được sử dụng, không thể xóa' },
        { status: 409 },
      )
    }
    units = units.filter((u) => u.id !== params.id)
    const response: ApiResponse<void> = { statusCode: 200, message: 'Xóa thành công', data: undefined }
    return HttpResponse.json(response)
  }),
]
```

- [ ] **Step 5: Cập nhật handlers/index.ts**

```ts
// warehouse-ui/src/mocks/handlers/index.ts
import { authHandlers } from './auth.handler'
import { notificationHandlers } from './notification.handler'
import { dashboardHandlers } from './dashboard.handler'
import { unitHandlers } from './unit.handler'

export const handlers = [...authHandlers, ...notificationHandlers, ...dashboardHandlers, ...unitHandlers]
```

- [ ] **Step 6: Chạy build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/units/types/ src/features/units/schemas/ src/services/unit.service.ts src/mocks/handlers/unit.handler.ts src/mocks/handlers/index.ts
git commit -m "feat: add unit types, schema, service, and MSW handler"
```

---

## Task 5: useUnits hook (TDD)

**Files:**
- Create: `warehouse-ui/src/features/units/hooks/use-units.test.ts`
- Create: `warehouse-ui/src/features/units/hooks/use-units.ts`

- [ ] **Step 1: Viết failing tests**

```ts
// warehouse-ui/src/features/units/hooks/use-units.test.ts
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useUnits } from './use-units'

const mockUnits = [
  { id: 'unit-001', name: 'Kilogram', symbol: 'kg', type: 'weight' },
  { id: 'unit-002', name: 'Lít', symbol: 'l', type: 'volume' },
]

const server = setupServer(
  http.get('http://localhost:3000/units', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: mockUnits }),
  ),
  http.post('http://localhost:3000/units', async ({ request }) => {
    const body = await request.json() as { name: string; symbol: string; type: string }
    return HttpResponse.json(
      { statusCode: 201, message: 'OK', data: { id: 'new-id', ...body } },
      { status: 201 },
    )
  }),
  http.delete('http://localhost:3000/units/:id', ({ params }) => {
    if (params.id === 'unit-in-use') {
      return HttpResponse.json(
        { statusCode: 409, message: 'Đang được sử dụng' },
        { status: 409 },
      )
    }
    return HttpResponse.json({ statusCode: 200, message: 'OK', data: undefined })
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useUnits', () => {
  it('fetch danh sách thành công', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.units).toHaveLength(2)
    expect(result.current.units[0].name).toBe('Kilogram')
  })

  it('createUnit trả về true khi thành công', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let ok: boolean
    await act(async () => {
      ok = await result.current.createUnit({ name: 'Gram', symbol: 'g', type: 'weight' })
    })
    expect(ok!).toBe(true)
  })

  it('removeUnit với id đang dùng trả về ok=false và message', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.removeUnit('unit-in-use')
    })
    expect(res!.ok).toBe(false)
    expect(res!.message).toBeTruthy()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

```bash
npm run test -- --run src/features/units/hooks/use-units.test.ts
```

Expected: FAIL — `Cannot find module './use-units'`

- [ ] **Step 3: Tạo use-units.ts**

```ts
// warehouse-ui/src/features/units/hooks/use-units.ts
import { useState, useEffect, useCallback } from 'react'
import { unitService } from '@/services/unit.service'
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '../types/unit.types'

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await unitService.getAll()
      setUnits(res.data)
    } catch {
      setError('Không thể tải danh sách đơn vị')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function createUnit(payload: CreateUnitRequest): Promise<boolean> {
    try {
      await unitService.create(payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function updateUnit(id: string, payload: UpdateUnitRequest): Promise<boolean> {
    try {
      await unitService.update(id, payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function removeUnit(id: string): Promise<{ ok: boolean; message?: string }> {
    try {
      await unitService.remove(id)
      await fetchAll()
      return { ok: true }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể xóa đơn vị'
      return { ok: false, message }
    }
  }

  return { units, isLoading, error, createUnit, updateUnit, removeUnit }
}
```

- [ ] **Step 4: Chạy tests**

```bash
npm run test -- --run src/features/units/hooks/use-units.test.ts
```

Expected: `3 tests passed`

- [ ] **Step 5: Chạy toàn bộ tests**

```bash
npm run test -- --run
```

Expected: `22 tests passed` (19 cũ + 3 mới)

- [ ] **Step 6: Commit**

```bash
git add src/features/units/hooks/
git commit -m "feat: add useUnits hook with TDD (fetch, create, delete)"
```

---

## Task 6: UnitDialog + UnitListPage

**Files:**
- Create: `warehouse-ui/src/features/units/components/unit-dialog.tsx`
- Create: `warehouse-ui/src/features/units/components/unit-list-page.tsx`
- Create: `warehouse-ui/src/features/units/index.ts`

- [ ] **Step 1: Tạo unit-dialog.tsx**

```tsx
// warehouse-ui/src/features/units/components/unit-dialog.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { unitSchema, type UnitFormValues } from '../schemas/unit.schema'
import type { Unit } from '../types/unit.types'

interface UnitDialogProps {
  open: boolean
  unit?: Unit
  onSubmit: (values: UnitFormValues) => Promise<void>
  onClose: () => void
}

const typeOptions = [
  { value: 'weight', label: 'Khối lượng' },
  { value: 'volume', label: 'Thể tích' },
  { value: 'quantity', label: 'Số lượng' },
] as const

export function UnitDialog({ open, unit, onSubmit, onClose }: UnitDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (open) {
      reset(
        unit
          ? { name: unit.name, symbol: unit.symbol, type: unit.type }
          : { name: '', symbol: '' },
      )
    }
  }, [open, unit, reset])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{unit ? 'Sửa đơn vị tính' : 'Thêm đơn vị tính'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="unit-name">Tên đơn vị *</Label>
            <Input
              id="unit-name"
              placeholder="VD: Kilogram"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="unit-symbol">Ký hiệu *</Label>
            <Input
              id="unit-symbol"
              placeholder="VD: kg"
              {...register('symbol')}
              aria-invalid={!!errors.symbol}
            />
            {errors.symbol && (
              <p className="text-sm text-destructive">{errors.symbol.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Loại đơn vị *</Label>
            <div className="flex gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('type', opt.value, { shouldValidate: true })}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-2 text-sm transition-colors',
                    selectedType === opt.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-muted',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Tạo unit-list-page.tsx**

```tsx
// warehouse-ui/src/features/units/components/unit-list-page.tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { useUnits } from '../hooks/use-units'
import { UnitDialog } from './unit-dialog'
import type { Unit } from '../types/unit.types'
import type { UnitFormValues } from '../schemas/unit.schema'

const typeLabel: Record<string, string> = {
  weight: 'Khối lượng',
  volume: 'Thể tích',
  quantity: 'Số lượng',
}

export function UnitListPage() {
  const { units, isLoading, createUnit, updateUnit, removeUnit } = useUnits()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canEdit = hasPermission(['admin', 'manager'])
  const canDelete = hasPermission(['admin'])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editUnit, setEditUnit] = useState<Unit | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Unit | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)

  const columns: ColumnDef<Unit>[] = [
    { accessorKey: 'name', header: 'Tên đơn vị' },
    { accessorKey: 'symbol', header: 'Ký hiệu' },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => typeLabel[row.original.type] ?? row.original.type,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditUnit(row.original)
                setDialogOpen(true)
              }}
            >
              Sửa
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(row.original)}
            >
              Xóa
            </Button>
          )}
        </div>
      ),
    },
  ]

  async function handleSubmit(values: UnitFormValues) {
    const ok = editUnit
      ? await updateUnit(editUnit.id, values)
      : await createUnit(values)
    if (ok) {
      toast.success(editUnit ? 'Cập nhật thành công' : 'Thêm thành công')
      setDialogOpen(false)
      setEditUnit(undefined)
    } else {
      toast.error('Có lỗi xảy ra, thử lại sau')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const { ok, message } = await removeUnit(deleteTarget.id)
    setIsDeleting(false)
    if (ok) {
      toast.success('Xóa thành công')
      setDeleteTarget(undefined)
    } else {
      toast.error(message ?? 'Không thể xóa')
    }
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Đơn vị tính</h1>
          {canEdit && (
            <Button
              onClick={() => {
                setEditUnit(undefined)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm đơn vị
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={units}
          isLoading={isLoading}
          searchPlaceholder="Tìm kiếm đơn vị..."
        />
      </div>

      <UnitDialog
        open={dialogOpen}
        unit={editUnit}
        onSubmit={handleSubmit}
        onClose={() => {
          setDialogOpen(false)
          setEditUnit(undefined)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa đơn vị tính"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageContainer>
  )
}
```

- [ ] **Step 3: Tạo features/units/index.ts**

```ts
// warehouse-ui/src/features/units/index.ts
export { UnitListPage } from './components/unit-list-page'
```

- [ ] **Step 4: Chạy build**

```bash
npm run build
```

Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/units/components/ src/features/units/index.ts
git commit -m "feat: add UnitListPage and UnitDialog components"
```

---

## Task 7: Wire /units vào router + cập nhật sidebar

**Files:**
- Modify: `warehouse-ui/src/router/index.tsx`
- Modify: `warehouse-ui/src/components/layout/app-sidebar.tsx`

- [ ] **Step 1: Cập nhật router/index.tsx — thêm /units route**

```tsx
// warehouse-ui/src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './auth-guard'
import { LoginPage } from '@/features/auth'
import { RootLayout } from '@/components/layout/root-layout'
import { DashboardPage } from '@/features/dashboard'
import { UnitListPage } from '@/features/units'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/units', element: <UnitListPage /> },
        ],
      },
    ],
  },
])
```

- [ ] **Step 2: Cập nhật app-sidebar.tsx — thêm link /units và /suppliers**

Thêm `Ruler` và `Truck` vào imports lucide-react, thêm 2 nav items:

```tsx
// warehouse-ui/src/components/layout/app-sidebar.tsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Archive, ArrowDownToLine,
  ArrowUpFromLine, ClipboardList, Wallet, BarChart3,
  Settings, Users, ChevronLeft, Ruler, Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/materials', icon: Package, label: 'Nguyên vật liệu' },
  { to: '/units', icon: Ruler, label: 'Đơn vị tính' },
  { to: '/suppliers', icon: Truck, label: 'Nhà cung cấp' },
  { to: '/inventory', icon: Archive, label: 'Tồn kho' },
  { to: '/import-forms', icon: ArrowDownToLine, label: 'Nhập kho' },
  { to: '/export-forms', icon: ArrowUpFromLine, label: 'Xuất kho' },
  { to: '/balance-forms', icon: ClipboardList, label: 'Kiểm kho' },
  { to: '/payments', icon: Wallet, label: 'Chi kho' },
  { to: '/reports', icon: BarChart3, label: 'Báo cáo' },
]

const adminItems = [
  { to: '/users', icon: Users, label: 'Người dùng' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
]

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm">Trend Coffee</span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    'hover:bg-muted',
                    isActive ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {hasPermission(['admin']) && (
          <div className="mt-4 px-2">
            {!sidebarCollapsed && (
              <p className="mb-1 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quản trị
              </p>
            )}
            <ul className="space-y-1">
              {adminItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        'hover:bg-muted',
                        isActive ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 3: Chạy toàn bộ tests**

```bash
npm run test -- --run
```

Expected: `22 tests passed` — không có test nào fail.

- [ ] **Step 4: Chạy build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 5: Khởi động dev server và verify thủ công**

```bash
npm run dev
```

Mở `http://localhost:5173`, login với `admin@trendcoffee.vn` / `password123`:
- Sidebar có mục "Đơn vị tính" và "Nhà cung cấp" ✓
- Click "Đơn vị tính" → `/units` hiển thị bảng với 5 đơn vị mock ✓
- Tìm kiếm "kg" → filter còn 2 rows ✓
- Click "Thêm đơn vị" → dialog mở, điền form, lưu → toast "Thêm thành công" ✓
- Click "Sửa" → dialog mở với data cũ, sửa, lưu → toast "Cập nhật thành công" ✓
- Click "Xóa" → ConfirmDialog mở, xác nhận → toast "Xóa thành công" ✓
- Kill dev server (Ctrl+C)

- [ ] **Step 6: Final commit**

```bash
git add src/router/index.tsx src/components/layout/app-sidebar.tsx
git commit -m "feat: wire Units module into router and sidebar navigation"
```
