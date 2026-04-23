---
name: api-convention
description: Trigger when creating API services, handling requests/responses, managing authentication, dealing with errors, or any API-related code. Ensures consistent API integration patterns.
---

# API & Service Layer Convention

This project uses **Axios** as the HTTP client with **plain React state** (`useState` + `useEffect`) for data management. There is **no React Query**, no query keys, and no cache invalidation.

## HTTP Client

### Axios Instance

**File**: `src/services/axios.instance.ts`

```ts
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach Bearer token from auth store on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Import everywhere as:**

```ts
import { api } from '@/services/axios.instance'
```

Never create a second `axios.create()` call anywhere in the codebase.

## API Response Type

```ts
// src/types/api.types.ts
export interface ApiResponse<T> {
  ok: boolean
  data: T
  message?: string
}
```

Every server endpoint returns this shape. MSW handlers must also return this shape.

## Service File Pattern

Service files live in `src/services/` and are **optional** — simple fetches can be written directly inside the hook. Use a service file when the hook would otherwise become large or when an endpoint is called from multiple hooks.

```ts
// src/services/unit.service.ts
import { api } from '@/services/axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { Unit, CreateUnitPayload, UpdateUnitPayload } from '@/features/units/types/unit.types'

export async function getUnits(): Promise<ApiResponse<Unit[]>> {
  const res = await api.get<ApiResponse<Unit[]>>('/units')
  return res.data
}

export async function createUnit(payload: CreateUnitPayload): Promise<ApiResponse<Unit>> {
  const res = await api.post<ApiResponse<Unit>>('/units', payload)
  return res.data
}

export async function updateUnit(id: string, payload: UpdateUnitPayload): Promise<ApiResponse<Unit>> {
  const res = await api.put<ApiResponse<Unit>>(`/units/${id}`, payload)
  return res.data
}

export async function deleteUnit(id: string): Promise<ApiResponse<null>> {
  const res = await api.delete<ApiResponse<null>>(`/units/${id}`)
  return res.data
}
```

### Service function rules

- One function per endpoint.
- Name follows HTTP verb: `get*`, `create*`, `update*`, `delete*`.
- Always declare the return type: `Promise<ApiResponse<T>>`.
- Always type the generic on the axios call: `api.get<ApiResponse<T>>(...)`.
- Return `res.data` (unwrap Axios wrapper). Do **not** return the raw `AxiosResponse`.
- No error handling inside service functions — let the hook handle errors.

## Hook Pattern

Hooks live in `src/features/<domain>/hooks/use-<domain>.ts`.

```ts
// src/features/units/hooks/use-units.ts
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { Unit } from '@/features/units/types/unit.types'

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Read ──────────────────────────────────────────────
  const fetchUnits = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.get<ApiResponse<Unit[]>>('/units')
      if (!res.data.ok) throw new Error(res.data.message ?? 'Failed to fetch units')
      setUnits(res.data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchUnits() }, [fetchUnits])

  // ── Create ────────────────────────────────────────────
  const createUnit = async (payload: { name: string; symbol: string }): Promise<{ ok: boolean; message?: string }> => {
    const res = await api.post<ApiResponse<Unit>>('/units', payload)
    if (res.data.ok) {
      await fetchUnits()
    }
    return { ok: res.data.ok, message: res.data.message }
  }

  // ── Update ────────────────────────────────────────────
  const updateUnit = async (id: string, payload: { name: string; symbol: string }): Promise<{ ok: boolean; message?: string }> => {
    const res = await api.put<ApiResponse<Unit>>(`/units/${id}`, payload)
    if (res.data.ok) {
      await fetchUnits()
    }
    return { ok: res.data.ok, message: res.data.message }
  }

  // ── Delete ────────────────────────────────────────────
  const deleteUnit = async (id: string): Promise<{ ok: boolean; message?: string }> => {
    const res = await api.delete<ApiResponse<null>>(`/units/${id}`)
    if (res.data.ok) {
      await fetchUnits()
    }
    return { ok: res.data.ok, message: res.data.message }
  }

  return { units, isLoading, error, fetchUnits, createUnit, updateUnit, deleteUnit }
}
```

### Hook rules

- `useState` + `useEffect` for the initial data load.
- Mutation functions (`create*`, `update*`, `delete*`) are plain `async` functions — **not** `useCallback` unless memoisation is explicitly needed.
- Mutation functions return `{ ok: boolean; message?: string }` so callers can show toasts.
- After a successful mutation, call `fetchUnits()` (or the equivalent) to re-sync state — there is no cache to invalidate.
- **No React Query**, no `useMutation`, no `useQuery`, no query keys.

## MSW Handler Pattern

Handlers live in `src/mocks/handlers/<domain>.handler.ts`.

```ts
// src/mocks/handlers/unit.handler.ts
import { http, HttpResponse } from 'msw'
import { mockUnits } from '@/features/units/mocks/unit.mock'

export const unitHandlers = [
  http.get('/api/units', () =>
    HttpResponse.json({ ok: true, data: mockUnits }),
  ),

  http.post('/api/units', async ({ request }) => {
    const body = await request.json() as { name: string; symbol: string }
    const newUnit = { id: crypto.randomUUID(), ...body }
    mockUnits.push(newUnit)
    return HttpResponse.json({ ok: true, data: newUnit })
  }),

  http.put('/api/units/:id', async ({ params, request }) => {
    const body = await request.json() as { name: string; symbol: string }
    const idx = mockUnits.findIndex((u) => u.id === params.id)
    if (idx === -1) return HttpResponse.json({ ok: false, message: 'Not found' }, { status: 404 })
    mockUnits[idx] = { ...mockUnits[idx], ...body }
    return HttpResponse.json({ ok: true, data: mockUnits[idx] })
  }),

  http.delete('/api/units/:id', ({ params }) => {
    const idx = mockUnits.findIndex((u) => u.id === params.id)
    if (idx === -1) return HttpResponse.json({ ok: false, message: 'Not found' }, { status: 404 })
    mockUnits.splice(idx, 1)
    return HttpResponse.json({ ok: true, data: null })
  }),
]
```

Spread every handler array into `src/mocks/handlers/index.ts`:

```ts
// src/mocks/handlers/index.ts
import { unitHandlers } from './unit.handler'
import { materialHandlers } from './material.handler'
import { supplierHandlers } from './supplier.handler'
import { authHandlers } from './auth.handler'

export const handlers = [
  ...unitHandlers,
  ...materialHandlers,
  ...supplierHandlers,
  ...authHandlers,
]
```

### MSW rules

- Always return `{ ok: boolean; data: T; message?: string }` — same shape as the real API.
- URL prefix must match `VITE_API_URL` (default `/api`): use `/api/<resource>`.
- Import mock data from `src/features/<domain>/mocks/<domain>.mock.ts` — keep handlers thin.

## Error Handling Pattern

```ts
// In a component or dialog
const handleSubmit = async (values: FormValues) => {
  try {
    const result = await createUnit(values)
    if (result.ok) {
      toast.success('Unit created')
      onClose()
    } else {
      toast.error(result.message ?? 'Something went wrong')
    }
  } catch {
    toast.error('Network error')
  }
}
```

- Mutations return `{ ok, message }` — always check `ok` before showing success.
- Wrap in `try/catch` to handle network-level failures (no response at all).
- Show feedback with **Sonner** (`import { toast } from 'sonner'`).
- Never `console.error` in production paths — surface errors to the user.

## Auth

- Token is stored in `auth.store.ts` (Zustand, persisted to `localStorage`).
- The Axios interceptor (in `axios.instance.ts`) reads the token via `useAuthStore.getState().token` and attaches `Authorization: Bearer <token>` automatically.
- Never pass the token manually in individual service calls.

## Environment Variables

```
VITE_API_URL=/api          # dev (MSW intercepts)
VITE_API_URL=https://...   # production
```

Access in code:

```ts
import.meta.env.VITE_API_URL
```

Never use `process.env` — this is a Vite project.

## Common Mistakes

| Do NOT                                    | Do instead                                          |
| ----------------------------------------- | --------------------------------------------------- |
| `import { useQuery } from '@tanstack/...'`| `useState` + `useEffect`                            |
| `import { useMutation } from '...'`       | plain `async` function in the hook                  |
| `process.env.REACT_APP_*`                 | `import.meta.env.VITE_*`                            |
| `EXPO_PUBLIC_*` env vars                  | `VITE_*` env vars                                   |
| Create a second `axios.create()`          | import `api` from `axios.instance.ts`               |
| `hsl(var(--primary))`                     | `bg-primary` (Tailwind class via `@theme inline`)   |
| `import { View, Text } from 'react-native'` | standard HTML elements + Tailwind classes          |
| Return raw `AxiosResponse`                | return `res.data`                                   |
| Skip `ok` check on mutation result        | always check `result.ok` before showing success     |
