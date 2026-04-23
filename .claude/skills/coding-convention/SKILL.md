---
name: coding-convention
description: Trigger when writing any code (components, hooks, services, utilities, types). Guide all code structure, naming, formatting, imports, and patterns to maintain consistency.
---

# Coding Conventions

This project uses **React 18 + TypeScript strict mode**, **Vite**, **Tailwind CSS v4** (oklch color space), and **shadcn/ui (radix-nova)** web components.

---

## General Format Rules

- **No semicolons** at end of statements
- **Single quotes** for strings
- **Trailing commas** in multiline arrays/objects
- **Print width**: 80 characters
- **Prettier** auto-formats on save

---

## Naming Conventions

### Files & Folders

| Type                | File name  | Export name | Example                                                  |
| ------------------- | ---------- | ----------- | -------------------------------------------------------- |
| Component           | kebab-case | PascalCase  | `unit-dialog.tsx` → `export const UnitDialog`            |
| Hook                | kebab-case | camelCase   | `use-units.ts` → `export function useUnits`              |
| Service             | kebab-case | object      | `unit.service.ts` → `export const unitService`           |
| Util                | kebab-case | camelCase   | `cn.ts` → `export function cn`                           |
| Type/Interface file | kebab-case | PascalCase  | `unit.types.ts` → `export interface Unit`                |
| Store               | kebab-case | camelCase   | `auth.store.ts` → `export const useAuthStore`            |
| Schema              | kebab-case | camelCase   | `unit.schema.ts` → `export const createUnitSchema`       |

### Feature module structure

```
src/features/<domain>/
  types/          ← <domain>.types.ts
  schemas/        ← <domain>.schema.ts (Zod)
  hooks/          ← use-<domain>.ts  +  use-<domain>.test.ts
  components/     ← <domain>-list-page.tsx, <domain>-dialog.tsx
  mocks/          ← handlers.ts (MSW)
```

---

## Types & Interfaces

- **No `I` prefix** on interfaces — use `Unit`, not `IUnit`
- Use `interface` for object shapes
- Use `type` for unions, aliases, and derived types

```ts
// ✅ Correct
export interface Unit {
  id: string
  name: string
  symbol: string
  type: UnitType
}

export type UnitType = 'weight' | 'volume' | 'quantity'
export type UpdateUnitRequest = CreateUnitRequest

// ❌ Wrong
export interface IUnit { ... }   // no I prefix
```

### ApiResponse shape

```ts
// src/types/api.types.ts
export interface ApiResponse<T> {
  data: T
  message: string
  statusCode: number
}
```

Mutations return a plain object — not wrapped in `ApiResponse`:

```ts
// Hook mutation return type
{ ok: boolean; message?: string }
```

---

## Import Order

Enforce this order (leave a blank line between groups):

```ts
// 1. React
import { useState, useEffect, useCallback } from 'react'

// 2. External libraries
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// 3. shadcn/ui components
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// 4. Layout components
import { PageHeader } from '@/components/layout/page-header'

// 5. Common / shared components
import { DataTable } from '@/components/common/data-table'

// 6. Feature components and hooks
import { UnitDialog } from '@/features/units/components/unit-dialog'
import { useUnits } from '@/features/units/hooks/use-units'

// 7. Services and stores
import { unitService } from '@/services/unit.service'
import { useAuthStore } from '@/stores/auth.store'

// 8. Lib utilities
import { cn } from '@/lib/utils'

// 9. Types (use `import type`)
import type { Unit, CreateUnitRequest } from '@/features/units/types/unit.types'
import type { ApiResponse } from '@/types/api.types'
```

---

## Styling

This project uses **Tailwind CSS v4** with the oklch color space.

```tsx
// ✅ Use semantic color tokens
<div className="bg-card text-card-foreground" />
<div className="bg-background text-foreground" />
<div className="border border-border" />

// ❌ Never use raw colors — they ignore dark mode and oklch tokens
<div className="bg-white text-black" />

// ❌ Never use hsl() CSS variables — color space is oklch in v4
style={{ color: 'hsl(var(--primary))' }}  // wrong
```

Use `cn()` from `@/lib/utils` for conditional class merging:

```tsx
import { cn } from '@/lib/utils'

<button className={cn('rounded px-4 py-2', isActive && 'bg-primary text-primary-foreground')} />
```

---

## Component Pattern

Function components with named exports. No `forwardRef` required for standard web components in React 18. No `displayName` required. No `React.memo` by default — add it only when profiling shows a specific re-render problem.

```tsx
// src/features/units/components/unit-dialog.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createUnitSchema } from '../schemas/unit.schema'
import type { Unit, CreateUnitRequest } from '../types/unit.types'

interface UnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit?: Unit | null
  onSubmit: (payload: CreateUnitRequest) => Promise<{ ok: boolean; message?: string }>
}

export function UnitDialog({ open, onOpenChange, unit, onSubmit }: UnitDialogProps) {
  const isEditMode = !!unit

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateUnitRequest>({
    resolver: zodResolver(createUnitSchema),
  })

  // Reset form to unit values (or blank) whenever the dialog opens
  useEffect(() => {
    if (open) {
      reset(unit ?? { name: '', symbol: '', type: 'weight' })
    }
  }, [open, unit, reset])

  const handleFormSubmit = async (values: CreateUnitRequest) => {
    const res = await onSubmit(values)
    if (res.ok) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Tên đơn vị</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Key points:**

- Props interface defined directly above the component (or inline for simple cases)
- Named export (not default export)
- No `React.memo` unless profiling shows a problem
- No `forwardRef` unless specifically needed (e.g. for a custom input that must be used with `ref`)

---

## Hook Pattern

Use `useState` + `useEffect` for data fetching. No React Query. Service functions handle mutations, hooks coordinate state.

```ts
// src/features/units/hooks/use-units.ts
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

  const createUnit = useCallback(
    async (payload: CreateUnitRequest): Promise<{ ok: boolean; message?: string }> => {
      try {
        await unitService.create(payload)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không thể tạo đơn vị'
        return { ok: false, message }
      }
    },
    [fetchAll],
  )

  return { units, isLoading, error, createUnit }
}
```

**Key points:**

- Fetch in `useCallback` so the reference is stable for `useEffect`
- Mutations return `{ ok: boolean; message?: string }` — never throw, let the page handle display
- On success, call `fetchAll()` to keep the list in sync (no manual cache updates)
- Error message extracted from `err.response.data.message` if available, else a fallback string

---

## Service Pattern

```ts
// src/services/unit.service.ts
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

**Key points:**

- One service object per domain, exported as a `const`
- Always type generic param: `api.get<ApiResponse<Unit[]>>(...)`
- Function names match HTTP semantics: `getAll`, `create`, `update`, `remove`
- Import from `./axios.instance` (the project's custom Axios instance at `src/services/axios.instance.ts`)

---

## Form Pattern

React Hook Form + Zod resolver. Always define the schema in a `schemas/` file, not inline.

```ts
// src/features/units/schemas/unit.schema.ts
import { z } from 'zod'

export const createUnitSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  symbol: z.string().min(1, 'Ký hiệu không được để trống'),
  type: z.enum(['weight', 'volume', 'quantity']),
})

export type CreateUnitFormValues = z.infer<typeof createUnitSchema>
```

```tsx
// In the component
const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
  useForm<CreateUnitFormValues>({ resolver: zodResolver(createUnitSchema) })
```

Guard the submit button with `disabled={isSubmitting}` to prevent double-submission.

---

## Zustand Pattern

```ts
// src/stores/ui.store.ts
import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
```

**Consuming stores — always select specific slices:**

```ts
// ✅ Select only what you need — avoids re-render on unrelated state changes
const sidebarOpen = useUiStore((s) => s.sidebarOpen)
const toggleSidebar = useUiStore((s) => s.toggleSidebar)

// ❌ Never consume the whole store
const store = useUiStore()   // re-renders on every store change
```

---

## TypeScript Strict Mode

All files must pass:

```bash
npx tsc --noEmit   # run from warehouse-ui/
```

Rules enforced by strict mode:

- No `any` types — use `unknown` and narrow, or a precise type
- Explicit return types on exported functions
- No implicit null/undefined — handle explicitly
- Props interfaces always typed

```ts
// ✅ Typed
interface Props {
  unitId: string
  onClose: () => void
}

function UnitDetail({ unitId, onClose }: Props): JSX.Element { ... }

// ❌ Fails typecheck
function UnitDetail({ unitId, onClose }) { ... }  // implicit any
```

---

## Anti-Patterns to Avoid

| Don't                                      | Do instead                                         |
| ------------------------------------------ | -------------------------------------------------- |
| `import type { IUnit }`                    | No `I` prefix — `import type { Unit }`             |
| `bg-white`, `text-black` in className      | Use `bg-card`, `bg-background`, `text-foreground`  |
| `hsl(var(--primary))` in inline styles     | Use Tailwind token classes — oklch space in v4     |
| `useStore()` (whole store)                 | `useStore((s) => s.field)` (slice selector)        |
| `throw error` in hook mutations            | Return `{ ok: false, message }` instead            |
| Default exports for components             | Named exports only                                 |
| `React.memo` everywhere by default         | Add only when profiling identifies a problem       |
| Inline objects/arrays as props             | Extract to variable or `useMemo`                   |
| Abbreviate variable names (`u`, `m`, `s`)  | Use descriptive names (`unit`, `material`, `spec`) |
| Comments that say "what"                   | Comment only the "why" (non-obvious decisions)     |
| Nested ternaries                           | Early returns or explicit if/else                  |
