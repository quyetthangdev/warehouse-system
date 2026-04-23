---
name: tdd-workflow
description: Trigger when writing tests, adding test files, or when the user asks how to test a component, hook, store, or service in this React + Vite warehouse project. Provides the testing stack, file conventions, and Arrange/Act/Assert patterns specific to this codebase.
---

# TDD Workflow — Warehouse System (React + Vite)

## Testing Stack

| Tool                              | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| **Vitest**                        | Test runner (NOT Jest) — configured in vite.config |
| **jsdom**                         | Browser environment for component/hook tests      |
| **@testing-library/react**        | `renderHook`, `render`, `screen`, `act`, `waitFor` |
| **MSW** (`msw/node`)              | API mocking via `setupServer` in test files       |
| **Zod**                           | Schema validation tested independently            |

Run commands:

```bash
npm test                              # vitest watch mode
npm test -- --run                     # single run, CI-friendly
npm test -- --run --reporter=verbose  # verbose output per test
```

---

## File Conventions

Colocate the test file next to the file under test — **no `__tests__` subfolder**.

```
src/features/units/hooks/use-units.ts
src/features/units/hooks/use-units.test.ts        ✅ colocated

src/features/materials/hooks/use-materials.ts
src/features/materials/hooks/use-materials.test.ts ✅ colocated

src/stores/auth.store.ts
src/stores/auth.store.test.ts                      ✅ colocated

src/features/units/hooks/__tests__/use-units.test.ts ❌ wrong — no __tests__ subfolder
```

**Rules:**

- Filename: `<source-file>.test.ts` (hooks, services, stores) or `<source-file>.test.tsx` (components)
- Use `vi.fn()` not `jest.fn()` — this is Vitest, not Jest
- Import `describe`, `it`, `expect`, `beforeAll`, `afterAll`, `afterEach`, `vi` from `'vitest'` explicitly

---

## Arrange / Act / Assert Pattern

Every test block follows this structure:

```ts
it('should return units after successful fetch', async () => {
  // Arrange — render the hook
  const { result } = renderHook(() => useUnits())

  // Act — wait for async state to settle
  await waitFor(() => expect(result.current.isLoading).toBe(false))

  // Assert — verify the outcome
  expect(result.current.units).toHaveLength(2)
  expect(result.current.error).toBeNull()
})
```

---

## Hook Tests

Hook tests are the primary target in this codebase. Use `renderHook` from `@testing-library/react`.
Set up an MSW server in the same file — no shared test setup needed for simple cases.

**Full example matching the `use-units.ts` pattern:**

```ts
// src/features/units/hooks/use-units.test.ts
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
  it('fetches list on mount', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.units).toHaveLength(2)
    expect(result.current.units[0].name).toBe('Kilogram')
  })

  it('createUnit returns ok=true on success', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.createUnit({ name: 'Gram', symbol: 'g', type: 'weight' })
    })
    expect(res!.ok).toBe(true)
  })

  it('removeUnit returns ok=false with server message when item is in use', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.removeUnit('unit-in-use')
    })
    expect(res!.ok).toBe(false)
    expect(res!.message).toBe('Đang được sử dụng')
  })

  it('sets error state when fetch fails', async () => {
    server.use(
      http.get('http://localhost:3000/units', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).not.toBeNull()
  })
})
```

**Key points:**

- `waitFor(() => expect(result.current.isLoading).toBe(false))` — always wait for async fetch before asserting data
- `await act(async () => { ... })` — wrap mutation calls
- `server.use(...)` inside a test overrides handlers for that test only; `afterEach(server.resetHandlers)` restores the default

---

## Zod Schema Tests

Test schemas independently — they are pure functions with no side effects.

```ts
// src/features/units/schemas/unit.schema.test.ts
import { describe, it, expect } from 'vitest'
import { createUnitSchema } from './unit.schema'

describe('createUnitSchema', () => {
  it('accepts valid input', () => {
    const result = createUnitSchema.safeParse({ name: 'Gram', symbol: 'g', type: 'weight' })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createUnitSchema.safeParse({ name: '', symbol: 'g', type: 'weight' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('name')
  })

  it('rejects unknown type', () => {
    const result = createUnitSchema.safeParse({ name: 'X', symbol: 'x', type: 'invalid' })
    expect(result.success).toBe(false)
  })
})
```

---

## Component Tests

Use `render` + `screen` queries from `@testing-library/react`. Prefer semantic queries.

**Query priority (most to least preferred):**

1. `getByRole` — button, textbox, combobox, heading (best for accessibility)
2. `getByLabelText` — form inputs associated with a label
3. `getByText` — visible text content
4. `getByDisplayValue` — input current value
5. `getByTestId` — last resort only; do not add `data-testid` just for tests

```tsx
// src/features/units/components/unit-dialog.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UnitDialog } from './unit-dialog'

describe('UnitDialog', () => {
  it('renders the form fields when open', () => {
    render(<UnitDialog open onOpenChange={vi.fn()} onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/tên đơn vị/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ký hiệu/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lưu/i })).toBeInTheDocument()
  })

  it('calls onSubmit with form values', async () => {
    const onSubmit = vi.fn()
    render(<UnitDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/tên đơn vị/i), {
      target: { value: 'Gram' },
    })
    fireEvent.click(screen.getByRole('button', { name: /lưu/i }))

    // waitFor if onSubmit is async
    expect(onSubmit).toHaveBeenCalled()
  })
})
```

---

## Zustand Store Tests

```ts
// src/stores/ui.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from './ui.store'

beforeEach(() => {
  useUiStore.setState(useUiStore.getInitialState())
})

describe('uiStore', () => {
  it('initial sidebar state is false', () => {
    expect(useUiStore.getState().sidebarOpen).toBe(false)
  })

  it('toggleSidebar flips the state', () => {
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarOpen).toBe(true)
  })
})
```

---

## What to Test vs. What Not to Test

### Always test

- Hook state transitions: initial state, loading, data, error
- Mutation return values: `{ ok: boolean; message?: string }` shape
- Zod schema validation: valid inputs, each invalid field, edge values
- MSW happy path: data is populated after fetch resolves
- MSW error path: `error` state is set when server returns 4xx/5xx
- Edge cases: empty array responses, undefined `data`, network failure

### Never test

- Tailwind CSS class names — implementation detail, changes freely
- shadcn/ui internals (Radix primitives, portal rendering)
- MSW handler internals — test the hook behavior, not the mock
- `console.log` / `console.error` output
- Component pixel layout or visual positioning

---

## TDD Cycle

```
1. RED    — Write a failing test for the desired behavior
2. GREEN  — Write the minimum code to make it pass
3. REFACTOR — Clean up without breaking the test

Repeat per behavior unit.
```

**Practical rule:** Write the test first for hooks and Zod schemas (shape is clear upfront). Write the component first for new UI where the exact prop API is still being explored, then add tests once it stabilizes.
