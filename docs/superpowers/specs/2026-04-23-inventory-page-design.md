# Inventory Page Design — Tồn kho

**Date:** 2026-04-23
**Branch:** feature/inventory-page
**SRS Reference:** Section 4.6 — Inventory Tracking

---

## Overview

Two-level List + Detail pattern under `/inventory`. The list page gives an overview of all materials' current stock. The detail page drills into a single material's stock history, transaction log, and batch/lot tracking.

No forms — this module is read-only. Data comes from import, export, and balance operations (mocked via MSW for now).

---

## Routes

| Route | Component | Purpose |
|---|---|---|
| `/inventory` | `InventoryListPage` | All materials with current stock levels |
| `/inventory/:materialId` | `InventoryDetailPage` | Single material: chart, transactions, batches |

---

## Page 1 — `/inventory` (List)

### Layout

1. **Stats row** (4 cards, same pattern as Dashboard)
   - Tổng NVL (total materials tracked)
   - Tổng giá trị tồn (total stock value in VND)
   - Tồn thấp (materials below min threshold)
   - Sắp hết hạn (batches expiring within 30 days)

2. **Toolbar**
   - Search input: tìm theo tên hoặc mã NVL
   - Filter: Loại NVL (`main_ingredient | supporting | packaging | consumable | spare_part`)
   - Filter: Nhà cung cấp (supplier name, multi-select)
   - Filter: Trạng thái (`out | low | normal | high`)

3. **Table columns**

   | Column | Notes |
   |---|---|
   | Mã NVL | Material code |
   | Tên nguyên vật liệu | Material name |
   | Loại | Category badge |
   | Đơn vị | Base unit symbol |
   | Tồn kho | Current stock quantity |
   | Tối thiểu | Min threshold |
   | Tối đa | Max threshold |
   | Giá trị tồn | Stock value (VND, formatted) |
   | Trạng thái | `StatusBadge`: Hết / Thấp / Bình thường / Cao |
   | → | Row click navigates to detail |

### States
- Loading: skeleton rows
- Empty: "Chưa có dữ liệu tồn kho"
- Error: toast error, empty table

---

## Page 2 — `/inventory/:materialId` (Detail)

### Layout

1. **Breadcrumb**: Tồn kho > [Tên NVL]

2. **Header**: material name, mã NVL, badge loại, badge trạng thái

3. **Stats row** (4 cards)
   - Tồn hiện tại (quantity + unit)
   - Giá trị tồn (VND)
   - Tối thiểu
   - Tối đa

4. **Tabs** (3 tabs)

   **Tab 1 — Biến động**
   - Date range filter (reuses `FilterDropdown` date pickers)
   - Recharts `AreaChart` with 3 series: Nhập / Xuất / Kiểm kho
   - X-axis: date, Y-axis: quantity
   - Tooltip shows all 3 values on hover

   **Tab 2 — Lịch sử giao dịch**
   - Table columns: Ngày | Loại | Số lượng | Tồn trước | Tồn sau | Người thực hiện | Mã chứng từ
   - Loại uses colored badge: Nhập (green) / Xuất (orange) / Kiểm (blue)
   - Mã chứng từ is plain text (no link — import/export pages not built yet)
   - No pagination for MVP (mock data will be ≤ 50 rows)

   **Tab 3 — Lô hàng**
   - Table columns: Số lô | Số lượng | Ngày SX | HSD | Nhà cung cấp | Mã phiếu nhập
   - HSD highlighted red if expiring within 30 days, yellow within 90 days
   - Sorted by HSD ascending (nearest expiry first)

### States
- Loading: skeleton
- `materialId` not found: toast error + navigate(`/inventory`)

---

## Data Models

```ts
// inventory.types.ts

type StockStatus = 'out' | 'low' | 'normal' | 'high'
type TransactionType = 'import' | 'export' | 'balance'

interface InventoryItem {
  materialId: string
  materialCode: string
  materialName: string
  category: string
  unit: string             // base unit symbol, e.g. "kg"
  currentStock: number
  stockValue: number       // VND
  minThreshold: number
  maxThreshold: number
  status: StockStatus
  supplierNames: string[]
}

interface StockTransaction {
  id: string
  date: string             // ISO 8601
  type: TransactionType
  quantity: number         // positive for import, negative for export
  stockBefore: number
  stockAfter: number
  userName: string
  referenceId: string      // e.g. "PN-2024-001"
  referenceType: TransactionType
}

interface StockBatch {
  id: string
  batchNumber: string
  quantity: number
  mfgDate: string          // ISO 8601
  expiryDate: string       // ISO 8601
  supplierName: string
  importFormId: string     // e.g. "PN-2024-001"
}

interface MovementPoint {
  date: string
  import: number
  export: number
  balance: number
}

interface InventoryDetail extends InventoryItem {
  movementChart: MovementPoint[]
  transactions: StockTransaction[]
  batches: StockBatch[]
}
```

---

## API (MSW)

```
GET /inventory                    → { data: InventoryItem[] }
GET /inventory/:materialId        → { data: InventoryDetail }
```

Error case: `GET /inventory/unknown-id` → `{ statusCode: 404, message: 'Không tìm thấy nguyên vật liệu' }`

---

## Feature Structure

```
src/features/inventory/
├── types/inventory.types.ts
├── hooks/
│   ├── use-inventory.ts              ← fetches InventoryItem[], supports search/filter
│   ├── use-inventory.test.ts
│   ├── use-inventory-detail.ts       ← fetches InventoryDetail by materialId
│   └── use-inventory-detail.test.ts
├── components/
│   ├── inventory-list-page.tsx
│   ├── inventory-detail-page.tsx
│   └── stock-movement-chart.tsx      ← Recharts AreaChart, receives MovementPoint[]
├── mocks/inventory.mock.ts           ← seed data for MSW handlers
└── index.ts                          ← barrel export
```

MSW handler: `src/mocks/handlers/inventory.handler.ts`

---

## Hooks API

```ts
// use-inventory.ts
function useInventory(): {
  items: InventoryItem[]
  isLoading: boolean
  error: string | null
}

// use-inventory-detail.ts
function useInventoryDetail(materialId: string): {
  detail: InventoryDetail | null
  isLoading: boolean
  error: string | null
}
```

Search and filter are applied client-side in `InventoryListPage` (list is small enough — warehouse typically < 500 materials).

---

## Testing Plan

### `use-inventory.test.ts`
- Fetches list on mount → returns `InventoryItem[]` with correct shape
- Fetch fail → `error` state set, `items` stays empty

### `use-inventory-detail.test.ts`
- Fetches detail by `materialId` → returns `InventoryDetail` with transactions and batches
- Unknown `materialId` (404) → `error` state set, `detail` stays null

---

## Out of Scope (this iteration)

- Export to Excel (requires a library, deferred)
- Pagination (mock data is small)
- Edit/adjust stock directly (done via balance forms, not built yet)
- Links from Mã chứng từ to import/export detail pages (those pages not built yet)
