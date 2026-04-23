# Inventory Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/inventory` (list) and `/inventory/:materialId` (detail) pages with stock tracking, movement chart, transaction history, and batch/lot management per SRS 4.6.

**Architecture:** Read-only two-level List + Detail. Client-side search/filter on the list page (dataset is small). Hooks call `{ api }` from `@/services/axios.instance` directly — no separate service file needed. `StockMovementChart` is a standalone Recharts AreaChart component.

**Tech Stack:** React 18 + TypeScript, Recharts (AreaChart), shadcn/ui (Tabs, Badge, Skeleton, Select), TanStack Table via DataTable, MSW (mock), Vitest + Testing Library (Vitest, NOT Jest)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/features/inventory/types/inventory.types.ts` | Create | All TypeScript interfaces |
| `src/features/inventory/mocks/inventory.mock.ts` | Create | Seed data for MSW |
| `src/mocks/handlers/inventory.handler.ts` | Create | MSW GET /inventory, /inventory/:id |
| `src/mocks/handlers/index.ts` | Modify | Add inventoryHandlers |
| `src/features/inventory/hooks/use-inventory.ts` | Create | Fetch InventoryItem list |
| `src/features/inventory/hooks/use-inventory.test.ts` | Create | Hook tests |
| `src/features/inventory/hooks/use-inventory-detail.ts` | Create | Fetch InventoryDetail by materialId |
| `src/features/inventory/hooks/use-inventory-detail.test.ts` | Create | Hook tests |
| `src/features/inventory/components/stock-movement-chart.tsx` | Create | Recharts AreaChart, 3 series |
| `src/features/inventory/components/inventory-list-page.tsx` | Create | List page with stats + filters + table |
| `src/features/inventory/components/inventory-detail-page.tsx` | Create | Detail page with 3 tabs |
| `src/features/inventory/index.ts` | Create | Barrel export |
| `src/router/index.tsx` | Modify | Add /inventory and /inventory/:materialId |

---

## Task 1: Types

**Files:**
- Create: `src/features/inventory/types/inventory.types.ts`

- [ ] **Step 1.1: Create the types file**

```ts
// src/features/inventory/types/inventory.types.ts
export type StockStatus = 'out' | 'low' | 'normal' | 'high'
export type TransactionType = 'import' | 'export' | 'balance'

export interface InventoryItem {
  materialId: string
  materialCode: string
  materialName: string
  category: string
  unit: string
  currentStock: number
  stockValue: number
  minThreshold: number
  maxThreshold: number
  status: StockStatus
  supplierNames: string[]
  nearExpiryBatchCount: number
}

export interface StockTransaction {
  id: string
  date: string             // ISO 8601
  type: TransactionType
  quantity: number         // positive = import, negative = export
  stockBefore: number
  stockAfter: number
  userName: string
  referenceId: string      // e.g. "PN-2026-001"
  referenceType: TransactionType
}

export interface StockBatch {
  id: string
  batchNumber: string
  quantity: number
  mfgDate: string          // ISO 8601
  expiryDate: string       // ISO 8601
  supplierName: string
  importFormId: string
}

export interface MovementPoint {
  date: string             // ISO 8601 date string (YYYY-MM-DD)
  import: number
  export: number
  balance: number
}

export interface InventoryDetail extends InventoryItem {
  movementChart: MovementPoint[]
  transactions: StockTransaction[]
  batches: StockBatch[]
}
```

- [ ] **Step 1.2: Commit**

```bash
git add src/features/inventory/types/inventory.types.ts
git commit -m "feat(inventory): add TypeScript types"
```

---

## Task 2: Mock Data

**Files:**
- Create: `src/features/inventory/mocks/inventory.mock.ts`

- [ ] **Step 2.1: Create mock data**

```ts
// src/features/inventory/mocks/inventory.mock.ts
import type { InventoryItem, InventoryDetail, MovementPoint } from '../types/inventory.types'

export const mockInventoryItems: InventoryItem[] = [
  {
    materialId: 'mat-001',
    materialCode: 'NVL-001',
    materialName: 'Cam tươi',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 5,
    stockValue: 150_000,
    minThreshold: 20,
    maxThreshold: 200,
    status: 'low',
    supplierNames: ['Công ty TNHH Rau Quả Tươi'],
    nearExpiryBatchCount: 1,
  },
  {
    materialId: 'mat-002',
    materialCode: 'NVL-002',
    materialName: 'Đường kính trắng',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 80,
    stockValue: 1_200_000,
    minThreshold: 30,
    maxThreshold: 150,
    status: 'normal',
    supplierNames: ['Công ty CP Đường Biên Hòa'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-003',
    materialCode: 'NVL-003',
    materialName: 'Sữa tươi không đường',
    category: 'main_ingredient',
    unit: 'l',
    currentStock: 0,
    stockValue: 0,
    minThreshold: 50,
    maxThreshold: 300,
    status: 'out',
    supplierNames: ['Vinamilk'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-004',
    materialCode: 'NVL-004',
    materialName: 'Cà phê Arabica rang xay',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 180,
    stockValue: 18_000_000,
    minThreshold: 20,
    maxThreshold: 100,
    status: 'high',
    supplierNames: ['Dalat Farm Coffee', 'Công ty CP Trung Nguyên'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-005',
    materialCode: 'NVL-005',
    materialName: 'Trà xanh Thái Nguyên',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 40,
    stockValue: 2_400_000,
    minThreshold: 10,
    maxThreshold: 80,
    status: 'normal',
    supplierNames: ['HTX Chè Thái Nguyên'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-006',
    materialCode: 'NVL-006',
    materialName: 'Ly giấy 500ml',
    category: 'packaging',
    unit: 'cái',
    currentStock: 200,
    stockValue: 400_000,
    minThreshold: 500,
    maxThreshold: 5000,
    status: 'low',
    supplierNames: ['Bao Bì Xanh Co.'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-007',
    materialCode: 'NVL-007',
    materialName: 'Ống hút giấy',
    category: 'packaging',
    unit: 'cái',
    currentStock: 2000,
    stockValue: 200_000,
    minThreshold: 500,
    maxThreshold: 10000,
    status: 'normal',
    supplierNames: ['Bao Bì Xanh Co.'],
    nearExpiryBatchCount: 0,
  },
  {
    materialId: 'mat-008',
    materialCode: 'NVL-008',
    materialName: 'Lá bạc hà',
    category: 'supporting',
    unit: 'kg',
    currentStock: 2,
    stockValue: 60_000,
    minThreshold: 5,
    maxThreshold: 30,
    status: 'low',
    supplierNames: ['Vườn Rau Hữu Cơ Đà Lạt'],
    nearExpiryBatchCount: 2,
  },
]

function makeDateLabel(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function makeMovementChart(): MovementPoint[] {
  return Array.from({ length: 30 }, (_, i) => ({
    date: makeDateLabel(29 - i),
    import: Math.floor(Math.random() * 50),
    export: Math.floor(Math.random() * 30),
    balance: 0,
  }))
}

export const mockInventoryDetail: InventoryDetail = {
  ...mockInventoryItems[0],
  movementChart: makeMovementChart(),
  transactions: [
    {
      id: 'tx-001',
      date: makeDateLabel(1),
      type: 'import',
      quantity: 30,
      stockBefore: 0,
      stockAfter: 30,
      userName: 'Nguyễn Văn A',
      referenceId: 'PN-2026-001',
      referenceType: 'import',
    },
    {
      id: 'tx-002',
      date: makeDateLabel(2),
      type: 'export',
      quantity: -15,
      stockBefore: 30,
      stockAfter: 15,
      userName: 'Trần Thị B',
      referenceId: 'PX-2026-001',
      referenceType: 'export',
    },
    {
      id: 'tx-003',
      date: makeDateLabel(5),
      type: 'balance',
      quantity: -10,
      stockBefore: 15,
      stockAfter: 5,
      userName: 'Lê Văn C',
      referenceId: 'KK-2026-001',
      referenceType: 'balance',
    },
  ],
  batches: [
    {
      id: 'batch-001',
      batchNumber: 'LOT-20260101',
      quantity: 5,
      mfgDate: '2026-01-01',
      expiryDate: '2026-05-01',
      supplierName: 'Công ty TNHH Rau Quả Tươi',
      importFormId: 'PN-2026-001',
    },
  ],
}
```

- [ ] **Step 2.2: Commit**

```bash
git add src/features/inventory/mocks/inventory.mock.ts
git commit -m "feat(inventory): add mock seed data"
```

---

## Task 3: MSW Handler

**Files:**
- Create: `src/mocks/handlers/inventory.handler.ts`
- Modify: `src/mocks/handlers/index.ts`

- [ ] **Step 3.1: Create the handler**

```ts
// src/mocks/handlers/inventory.handler.ts
import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { InventoryItem, InventoryDetail } from '@/features/inventory/types/inventory.types'
import { mockInventoryItems, mockInventoryDetail } from '@/features/inventory/mocks/inventory.mock'

const BASE_URL = 'http://localhost:3000'

export const inventoryHandlers = [
  http.get(`${BASE_URL}/inventory`, () => {
    const response: ApiResponse<InventoryItem[]> = {
      statusCode: 200,
      message: 'OK',
      data: mockInventoryItems,
    }
    return HttpResponse.json(response)
  }),

  http.get(`${BASE_URL}/inventory/:materialId`, ({ params }) => {
    const item = mockInventoryItems.find((i) => i.materialId === params.materialId)
    if (!item) {
      return HttpResponse.json(
        { statusCode: 404, message: 'Không tìm thấy nguyên vật liệu' },
        { status: 404 },
      )
    }
    const detail: InventoryDetail =
      params.materialId === mockInventoryDetail.materialId
        ? mockInventoryDetail
        : { ...item, movementChart: [], transactions: [], batches: [] }
    const response: ApiResponse<InventoryDetail> = {
      statusCode: 200,
      message: 'OK',
      data: detail,
    }
    return HttpResponse.json(response)
  }),
]
```

- [ ] **Step 3.2: Add to handlers index**

Edit `src/mocks/handlers/index.ts` — add the import and spread:

```ts
// src/mocks/handlers/index.ts
import { authHandlers } from './auth.handler'
import { notificationHandlers } from './notification.handler'
import { dashboardHandlers } from './dashboard.handler'
import { unitHandlers } from './unit.handler'
import { supplierHandlers } from './supplier.handler'
import { materialHandlers } from './material.handler'
import { inventoryHandlers } from './inventory.handler'

export const handlers = [
  ...authHandlers,
  ...notificationHandlers,
  ...dashboardHandlers,
  ...unitHandlers,
  ...supplierHandlers,
  ...materialHandlers,
  ...inventoryHandlers,
]
```

- [ ] **Step 3.3: Commit**

```bash
git add src/mocks/handlers/inventory.handler.ts src/mocks/handlers/index.ts
git commit -m "feat(inventory): add MSW handlers for /inventory endpoints"
```

---

## Task 4: useInventory Hook + Tests

**Files:**
- Create: `src/features/inventory/hooks/use-inventory.ts`
- Create: `src/features/inventory/hooks/use-inventory.test.ts`

- [ ] **Step 4.1: Write the failing tests first**

```ts
// src/features/inventory/hooks/use-inventory.test.ts
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useInventory } from './use-inventory'
import type { InventoryItem } from '../types/inventory.types'

const mockItems: InventoryItem[] = [
  {
    materialId: 'mat-001',
    materialCode: 'NVL-001',
    materialName: 'Cam tươi',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 5,
    stockValue: 150_000,
    minThreshold: 20,
    maxThreshold: 200,
    status: 'low',
    supplierNames: ['Công ty TNHH Rau Quả Tươi'],
    nearExpiryBatchCount: 1,
  },
  {
    materialId: 'mat-002',
    materialCode: 'NVL-002',
    materialName: 'Đường kính trắng',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 80,
    stockValue: 1_200_000,
    minThreshold: 30,
    maxThreshold: 150,
    status: 'normal',
    supplierNames: ['Công ty CP Đường Biên Hòa'],
    nearExpiryBatchCount: 0,
  },
]

const server = setupServer(
  http.get('http://localhost:3000/inventory', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: mockItems }),
  ),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useInventory', () => {
  it('fetches list on mount', async () => {
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].materialName).toBe('Cam tươi')
    expect(result.current.error).toBeNull()
  })

  it('sets error when fetch fails', async () => {
    server.use(
      http.get('http://localhost:3000/inventory', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).not.toBeNull()
    expect(result.current.items).toHaveLength(0)
  })
})
```

- [ ] **Step 4.2: Run — confirm FAIL**

```bash
cd warehouse-ui && npm test -- --run src/features/inventory/hooks/use-inventory.test.ts
```

Expected: FAIL — `Cannot find module './use-inventory'`

- [ ] **Step 4.3: Implement the hook**

```ts
// src/features/inventory/hooks/use-inventory.ts
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { InventoryItem } from '../types/inventory.types'

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get<ApiResponse<InventoryItem[]>>('/inventory')
      setItems(res.data)
    } catch {
      setError('Không thể tải dữ liệu tồn kho')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { items, isLoading, error }
}
```

- [ ] **Step 4.4: Run — confirm PASS**

```bash
cd warehouse-ui && npm test -- --run src/features/inventory/hooks/use-inventory.test.ts
```

Expected: PASS — 2 tests

- [ ] **Step 4.5: Commit**

```bash
git add src/features/inventory/hooks/use-inventory.ts src/features/inventory/hooks/use-inventory.test.ts
git commit -m "feat(inventory): add useInventory hook with tests"
```

---

## Task 5: useInventoryDetail Hook + Tests

**Files:**
- Create: `src/features/inventory/hooks/use-inventory-detail.ts`
- Create: `src/features/inventory/hooks/use-inventory-detail.test.ts`

- [ ] **Step 5.1: Write the failing tests first**

```ts
// src/features/inventory/hooks/use-inventory-detail.test.ts
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useInventoryDetail } from './use-inventory-detail'
import type { InventoryDetail } from '../types/inventory.types'

const mockDetail: InventoryDetail = {
  materialId: 'mat-001',
  materialCode: 'NVL-001',
  materialName: 'Cam tươi',
  category: 'main_ingredient',
  unit: 'kg',
  currentStock: 5,
  stockValue: 150_000,
  minThreshold: 20,
  maxThreshold: 200,
  status: 'low',
  supplierNames: ['Công ty TNHH Rau Quả Tươi'],
  nearExpiryBatchCount: 1,
  movementChart: [{ date: '2026-04-01', import: 30, export: 15, balance: 0 }],
  transactions: [
    {
      id: 'tx-001',
      date: '2026-04-22',
      type: 'import',
      quantity: 30,
      stockBefore: 0,
      stockAfter: 30,
      userName: 'Nguyễn Văn A',
      referenceId: 'PN-2026-001',
      referenceType: 'import',
    },
  ],
  batches: [
    {
      id: 'batch-001',
      batchNumber: 'LOT-20260101',
      quantity: 5,
      mfgDate: '2026-01-01',
      expiryDate: '2026-05-01',
      supplierName: 'Công ty TNHH Rau Quả Tươi',
      importFormId: 'PN-2026-001',
    },
  ],
}

const server = setupServer(
  http.get('http://localhost:3000/inventory/:materialId', ({ params }) => {
    if (params.materialId === 'mat-001') {
      return HttpResponse.json({ statusCode: 200, message: 'OK', data: mockDetail })
    }
    return HttpResponse.json(
      { statusCode: 404, message: 'Không tìm thấy nguyên vật liệu' },
      { status: 404 },
    )
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useInventoryDetail', () => {
  it('fetches detail by materialId', async () => {
    const { result } = renderHook(() => useInventoryDetail('mat-001'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.detail).not.toBeNull()
    expect(result.current.detail?.materialName).toBe('Cam tươi')
    expect(result.current.detail?.transactions).toHaveLength(1)
    expect(result.current.detail?.batches).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('sets error for unknown materialId (404)', async () => {
    const { result } = renderHook(() => useInventoryDetail('mat-999'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).not.toBeNull()
    expect(result.current.detail).toBeNull()
  })
})
```

- [ ] **Step 5.2: Run — confirm FAIL**

```bash
cd warehouse-ui && npm test -- --run src/features/inventory/hooks/use-inventory-detail.test.ts
```

Expected: FAIL — `Cannot find module './use-inventory-detail'`

- [ ] **Step 5.3: Implement the hook**

```ts
// src/features/inventory/hooks/use-inventory-detail.ts
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { InventoryDetail } from '../types/inventory.types'

export function useInventoryDetail(materialId: string) {
  const [detail, setDetail] = useState<InventoryDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get<ApiResponse<InventoryDetail>>(`/inventory/${materialId}`)
      setDetail(res.data)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể tải chi tiết tồn kho'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [materialId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { detail, isLoading, error }
}
```

- [ ] **Step 5.4: Run — confirm PASS**

```bash
cd warehouse-ui && npm test -- --run src/features/inventory/hooks/use-inventory-detail.test.ts
```

Expected: PASS — 2 tests

- [ ] **Step 5.5: Commit**

```bash
git add src/features/inventory/hooks/use-inventory-detail.ts src/features/inventory/hooks/use-inventory-detail.test.ts
git commit -m "feat(inventory): add useInventoryDetail hook with tests"
```

---

## Task 6: StockMovementChart

**Files:**
- Create: `src/features/inventory/components/stock-movement-chart.tsx`

- [ ] **Step 6.1: Create the component**

```tsx
// src/features/inventory/components/stock-movement-chart.tsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { MovementPoint } from '../types/inventory.types'

interface StockMovementChartProps {
  data: MovementPoint[]
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="space-y-1 rounded-lg border bg-card px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {SERIES.find((s) => s.key === p.name)?.label ?? p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

const SERIES = [
  { key: 'import' as const, label: 'Nhập kho', color: '#22c55e' },
  { key: 'export' as const, label: 'Xuất kho', color: '#f97316' },
  { key: 'balance' as const, label: 'Kiểm kho', color: '#3b82f6' },
]

export function StockMovementChart({ data }: StockMovementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          {SERIES.map(({ key, color }) => (
            <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          formatter={(value) => SERIES.find((s) => s.key === value)?.label ?? value}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />
        {SERIES.map(({ key, color }) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${key})`}
            dot={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 6.2: Commit**

```bash
git add src/features/inventory/components/stock-movement-chart.tsx
git commit -m "feat(inventory): add StockMovementChart component"
```

---

## Task 7: InventoryListPage

**Files:**
- Create: `src/features/inventory/components/inventory-list-page.tsx`

- [ ] **Step 7.1: Create the page**

```tsx
// src/features/inventory/components/inventory-list-page.tsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/common/data-table'
import { PageContainer } from '@/components/layout/page-container'
import { useInventory } from '../hooks/use-inventory'
import type { InventoryItem, StockStatus } from '../types/inventory.types'

const categoryLabel: Record<string, string> = {
  main_ingredient: 'Nguyên liệu chính',
  supporting: 'Hỗ trợ',
  packaging: 'Bao bì',
  consumable: 'Tiêu hao',
  spare_part: 'Phụ tùng',
}

const statusConfig: Record<
  StockStatus,
  { label: string; variant: 'destructive' | 'outline' | 'default' | 'secondary' }
> = {
  out: { label: 'Hết hàng', variant: 'destructive' },
  low: { label: 'Tồn thấp', variant: 'destructive' },
  normal: { label: 'Bình thường', variant: 'outline' },
  high: { label: 'Tồn cao', variant: 'secondary' },
}

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function InventoryListPage() {
  const { items, isLoading } = useInventory()
  const navigate = useNavigate()

  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        return true
      }),
    [items, categoryFilter, statusFilter],
  )

  const stats = useMemo(
    () => ({
      total: items.length,
      totalValue: items.reduce((sum, i) => sum + i.stockValue, 0),
      lowCount: items.filter((i) => i.status === 'low' || i.status === 'out').length,
      nearExpiryCount: items.filter((i) => i.nearExpiryBatchCount > 0).length,
    }),
    [items],
  )

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      { accessorKey: 'materialCode', header: 'Mã NVL' },
      { accessorKey: 'materialName', header: 'Tên nguyên vật liệu' },
      {
        accessorKey: 'category',
        header: 'Loại',
        cell: ({ row }) => categoryLabel[row.original.category] ?? row.original.category,
      },
      { accessorKey: 'unit', header: 'Đơn vị' },
      {
        accessorKey: 'currentStock',
        header: 'Tồn kho',
        cell: ({ row }) => `${row.original.currentStock} ${row.original.unit}`,
      },
      { accessorKey: 'minThreshold', header: 'Tối thiểu' },
      { accessorKey: 'maxThreshold', header: 'Tối đa' },
      {
        accessorKey: 'stockValue',
        header: 'Giá trị tồn',
        cell: ({ row }) => formatVnd(row.original.stockValue),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const cfg = statusConfig[row.original.status]
          return <Badge variant={cfg.variant}>{cfg.label}</Badge>
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={() => navigate(`/inventory/${row.original.materialId}`)}
            className="flex items-center text-muted-foreground hover:text-foreground"
            aria-label="Xem chi tiết"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [navigate],
  )

  return (
    <PageContainer>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Tồn kho</h1>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))
          ) : (
            <>
              <StatCard label="Tổng nguyên vật liệu" value={stats.total} sub="loại" />
              <StatCard label="Tổng giá trị tồn" value={formatVnd(stats.totalValue)} />
              <StatCard
                label="Tồn thấp / hết hàng"
                value={stats.lowCount}
                sub="loại cần bổ sung"
              />
              <StatCard
                label="Lô sắp hết hạn"
                value={stats.nearExpiryCount}
                sub="trong 30 ngày"
              />
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại NVL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="main_ingredient">Nguyên liệu chính</SelectItem>
              <SelectItem value="supporting">Hỗ trợ</SelectItem>
              <SelectItem value="packaging">Bao bì</SelectItem>
              <SelectItem value="consumable">Tiêu hao</SelectItem>
              <SelectItem value="spare_part">Phụ tùng</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="out">Hết hàng</SelectItem>
              <SelectItem value="low">Tồn thấp</SelectItem>
              <SelectItem value="normal">Bình thường</SelectItem>
              <SelectItem value="high">Tồn cao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          searchPlaceholder="Tìm theo tên hoặc mã NVL..."
        />
      </div>
    </PageContainer>
  )
}
```

- [ ] **Step 7.2: Commit**

```bash
git add src/features/inventory/components/inventory-list-page.tsx
git commit -m "feat(inventory): add InventoryListPage with stats and filters"
```

---

## Task 8: InventoryDetailPage

**Files:**
- Create: `src/features/inventory/components/inventory-detail-page.tsx`

- [ ] **Step 8.1: Create the page**

```tsx
// src/features/inventory/components/inventory-detail-page.tsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DataTable } from '@/components/common/data-table'
import { PageContainer } from '@/components/layout/page-container'
import { toast } from 'sonner'
import { useInventoryDetail } from '../hooks/use-inventory-detail'
import { StockMovementChart } from './stock-movement-chart'
import type { StockTransaction, StockBatch, StockStatus, TransactionType } from '../types/inventory.types'

const statusConfig: Record<
  StockStatus,
  { label: string; variant: 'destructive' | 'outline' | 'default' | 'secondary' }
> = {
  out: { label: 'Hết hàng', variant: 'destructive' },
  low: { label: 'Tồn thấp', variant: 'destructive' },
  normal: { label: 'Bình thường', variant: 'outline' },
  high: { label: 'Tồn cao', variant: 'secondary' },
}

const txTypeConfig: Record<TransactionType, { label: string; className: string }> = {
  import: { label: 'Nhập kho', className: 'text-green-600 bg-green-50 border-green-200' },
  export: { label: 'Xuất kho', className: 'text-orange-600 bg-orange-50 border-orange-200' },
  balance: { label: 'Kiểm kho', className: 'text-blue-600 bg-blue-50 border-blue-200' },
}

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

function isNearExpiry(expiryDate: string): boolean {
  return new Date(expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
}

function isExpiringSoon(expiryDate: string): boolean {
  return new Date(expiryDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000
}

const transactionColumns: ColumnDef<StockTransaction>[] = [
  {
    accessorKey: 'date',
    header: 'Ngày',
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString('vi-VN'),
  },
  {
    accessorKey: 'type',
    header: 'Loại',
    cell: ({ row }) => {
      const cfg = txTypeConfig[row.original.type]
      return (
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
        >
          {cfg.label}
        </span>
      )
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Số lượng',
    cell: ({ row }) => {
      const q = row.original.quantity
      return (
        <span className={q >= 0 ? 'text-green-600' : 'text-destructive'}>
          {q >= 0 ? `+${q}` : q}
        </span>
      )
    },
  },
  { accessorKey: 'stockBefore', header: 'Tồn trước' },
  { accessorKey: 'stockAfter', header: 'Tồn sau' },
  { accessorKey: 'userName', header: 'Người thực hiện' },
  { accessorKey: 'referenceId', header: 'Mã chứng từ' },
]

const batchColumns: ColumnDef<StockBatch>[] = [
  { accessorKey: 'batchNumber', header: 'Số lô' },
  { accessorKey: 'quantity', header: 'Số lượng' },
  {
    accessorKey: 'mfgDate',
    header: 'Ngày SX',
    cell: ({ row }) => new Date(row.original.mfgDate).toLocaleDateString('vi-VN'),
  },
  {
    accessorKey: 'expiryDate',
    header: 'HSD',
    cell: ({ row }) => {
      const date = row.original.expiryDate
      const near = isNearExpiry(date)
      const soon = isExpiringSoon(date)
      return (
        <span
          className={
            near ? 'font-medium text-destructive' : soon ? 'font-medium text-yellow-600' : ''
          }
        >
          {new Date(date).toLocaleDateString('vi-VN')}
        </span>
      )
    },
  },
  { accessorKey: 'supplierName', header: 'Nhà cung cấp' },
  { accessorKey: 'importFormId', header: 'Mã phiếu nhập' },
]

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function InventoryDetailPage() {
  const { materialId } = useParams<{ materialId: string }>()
  const navigate = useNavigate()
  const { detail, isLoading, error } = useInventoryDetail(materialId ?? '')

  useEffect(() => {
    if (error) {
      toast.error(error)
      navigate('/inventory')
    }
  }, [error, navigate])

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </PageContainer>
    )
  }

  if (!detail) return null

  const statusCfg = statusConfig[detail.status]
  const sortedBatches = [...detail.batches].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
  )

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold">{detail.materialName}</h1>
            <p className="text-sm text-muted-foreground">{detail.materialCode}</p>
          </div>
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Tồn hiện tại" value={`${detail.currentStock} ${detail.unit}`} />
          <StatCard label="Giá trị tồn" value={formatVnd(detail.stockValue)} />
          <StatCard label="Tối thiểu" value={`${detail.minThreshold} ${detail.unit}`} />
          <StatCard label="Tối đa" value={`${detail.maxThreshold} ${detail.unit}`} />
        </div>

        <Tabs defaultValue="movement">
          <TabsList>
            <TabsTrigger value="movement">Biến động</TabsTrigger>
            <TabsTrigger value="transactions">Lịch sử giao dịch</TabsTrigger>
            <TabsTrigger value="batches">Lô hàng</TabsTrigger>
          </TabsList>

          <TabsContent value="movement" className="mt-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="mb-4 text-sm font-medium">
                Biến động nhập/xuất/kiểm 30 ngày gần nhất
              </p>
              {detail.movementChart.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu biến động
                </p>
              ) : (
                <StockMovementChart data={detail.movementChart} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <DataTable
              columns={transactionColumns}
              data={detail.transactions}
              isLoading={false}
              searchPlaceholder="Tìm theo mã chứng từ, người thực hiện..."
            />
          </TabsContent>

          <TabsContent value="batches" className="mt-4">
            <DataTable
              columns={batchColumns}
              data={sortedBatches}
              isLoading={false}
              searchPlaceholder="Tìm theo số lô, nhà cung cấp..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}
```

- [ ] **Step 8.2: Commit**

```bash
git add src/features/inventory/components/inventory-detail-page.tsx
git commit -m "feat(inventory): add InventoryDetailPage with tabs"
```

---

## Task 9: Barrel + Router

**Files:**
- Create: `src/features/inventory/index.ts`
- Modify: `src/router/index.tsx`

- [ ] **Step 9.1: Create barrel**

```ts
// src/features/inventory/index.ts
export { InventoryListPage } from './components/inventory-list-page'
export { InventoryDetailPage } from './components/inventory-detail-page'
```

- [ ] **Step 9.2: Update router**

```tsx
// src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './auth-guard'
import { LoginPage } from '@/features/auth'
import { RootLayout } from '@/components/layout/root-layout'
import { DashboardPage } from '@/features/dashboard'
import { UnitListPage } from '@/features/units'
import { MaterialListPage } from '@/features/materials'
import { SupplierListPage } from '@/features/suppliers'
import { InventoryListPage, InventoryDetailPage } from '@/features/inventory'

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
          { path: '/materials', element: <MaterialListPage /> },
          { path: '/suppliers', element: <SupplierListPage /> },
          { path: '/inventory', element: <InventoryListPage /> },
          { path: '/inventory/:materialId', element: <InventoryDetailPage /> },
        ],
      },
    ],
  },
])
```

- [ ] **Step 9.3: Commit**

```bash
git add src/features/inventory/index.ts src/router/index.tsx
git commit -m "feat(inventory): wire up routes and barrel export"
```

---

## Task 10: Typecheck + Smoke Test

- [ ] **Step 10.1: Run full typecheck**

```bash
cd warehouse-ui && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 10.2: Run all tests**

```bash
cd warehouse-ui && npm test -- --run
```

Expected: all prior tests still pass + 4 new inventory tests pass

- [ ] **Step 10.3: Smoke test in browser**

```bash
cd warehouse-ui && npm run dev
```

Open http://localhost:5173/inventory and verify:
- 4 stat cards show: 8 NVL, total value, 4 tồn thấp/hết, 2 lô sắp hết hạn
- Table shows 8 rows
- Filter "Tồn thấp" → 3 rows (Cam tươi, Ly giấy 500ml, Lá bạc hà)
- Filter "Hết hàng" → 1 row (Sữa tươi)
- Click Cam tươi → navigates to /inventory/mat-001
- Detail shows 4 stat cards
- Tab "Biến động" → AreaChart với 30 điểm, 3 series
- Tab "Lịch sử giao dịch" → 3 rows, quantities colored green/red
- Tab "Lô hàng" → 1 row, HSD highlighted red (expires 2026-05-01)
- Navigate to /inventory/mat-999 → toast error + redirect to /inventory

---

## Spec Coverage

| Spec requirement | Covered by |
|---|---|
| `/inventory` list page | Task 7 |
| Stats: tổng NVL, giá trị, tồn thấp, sắp hết hạn | Task 7 |
| Search by name/code | Task 7 (DataTable globalFilter) |
| Filter by category | Task 7 |
| Filter by status | Task 7 |
| `/inventory/:materialId` detail page | Task 8 |
| Detail stats (current, value, min, max) | Task 8 |
| Tab Biến động: AreaChart 3 series | Tasks 6 + 8 |
| Tab Lịch sử giao dịch: typed + colored | Task 8 |
| Tab Lô hàng: sorted by HSD, expiry highlight | Task 8 |
| Origin tracing (supplier + importFormId) | Task 8 (batchColumns) |
| 404 → toast + redirect | Task 8 |
| MSW handlers | Task 3 |
| Hook tests (list + detail) | Tasks 4 + 5 |
| Filter by supplier | DataTable search covers this (type supplier name in search box) |
