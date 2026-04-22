# Phase 2 — Master Data (Units, Materials, Suppliers) Design

## Goal

Xây dựng 3 module CRUD master data: **Đơn vị tính (Units)**, **Nguyên vật liệu (Materials)**, **Nhà cung cấp (Suppliers)**. Đây là nền tảng cho các module ImportForm/ExportForm ở Phase 3.

## Architecture

Feature-based, nhất quán với Phase 1. Server state local trong hook, không đưa vào Zustand. MSW mock toggle qua `VITE_USE_MOCK=true`. Tất cả API response wrap trong `ApiResponse<T>` hoặc `ApiResponse<PaginatedResponse<T>>`.

Thêm `@tanstack/react-table` v8 để build generic `DataTable` component tái dụng cho cả 3 module và các phase sau.

## Tech Stack

React 19, TypeScript, TanStack Table v8 (mới thêm), shadcn/ui Dialog/Table/Select, React Hook Form + Zod, MSW v2, Vitest + RTL — nhất quán với Phase 1.

---

## File Structure

```
src/
├── components/
│   └── common/
│       ├── data-table.tsx          TanStack Table wrapper
│       ├── confirm-dialog.tsx      Dialog xác nhận xóa
│       └── status-badge.tsx        Badge active/inactive
├── features/
│   ├── units/
│   │   ├── types/unit.types.ts
│   │   ├── schemas/unit.schema.ts
│   │   ├── hooks/use-units.ts
│   │   ├── hooks/use-units.test.ts
│   │   ├── components/unit-list-page.tsx
│   │   ├── components/unit-dialog.tsx
│   │   └── index.ts
│   ├── materials/
│   │   ├── types/material.types.ts
│   │   ├── schemas/material.schema.ts
│   │   ├── hooks/use-materials.ts
│   │   ├── hooks/use-materials.test.ts
│   │   ├── components/material-list-page.tsx
│   │   ├── components/material-dialog.tsx
│   │   └── index.ts
│   └── suppliers/
│       ├── types/supplier.types.ts
│       ├── schemas/supplier.schema.ts
│       ├── hooks/use-suppliers.ts
│       ├── hooks/use-suppliers.test.ts
│       ├── components/supplier-list-page.tsx
│       ├── components/supplier-dialog.tsx
│       └── index.ts
├── services/
│   ├── unit.service.ts
│   ├── material.service.ts
│   └── supplier.service.ts
└── mocks/handlers/
    ├── unit.handler.ts
    ├── material.handler.ts
    └── supplier.handler.ts
```

---

## Shared Components

### DataTable (`src/components/common/data-table.tsx`)

Generic table wrapper dùng TanStack Table v8:

```ts
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  searchPlaceholder?: string
}
```

- Search: global filter client-side (TanStack `globalFilter`) — tìm kiếm trên tất cả string columns
- Loading: hiển thị skeleton rows (5 rows)
- Empty state: "Không có dữ liệu"
- Pagination: 10 rows/trang, nút Prev/Next + hiển thị "1–10 / 48 kết quả"

### ConfirmDialog (`src/components/common/confirm-dialog.tsx`)

```ts
interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}
```

Dùng shadcn `Dialog`. Nút xác nhận màu `destructive`.

### StatusBadge (`src/components/common/status-badge.tsx`)

```ts
interface StatusBadgeProps {
  active: boolean
}
```

- `active: true` → Badge xanh "Hoạt động"
- `active: false` → Badge vàng "Ngừng dùng"

---

## Module: Units

### Types

```ts
// src/features/units/types/unit.types.ts
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

### Schema (Zod)

```ts
// src/features/units/schemas/unit.schema.ts
export const unitSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  symbol: z.string().min(1, 'Ký hiệu không được để trống'),
  type: z.enum(['weight', 'volume', 'quantity'], { required_error: 'Chọn loại đơn vị' }),
})
export type UnitFormValues = z.infer<typeof unitSchema>
```

### Hook

```ts
// src/features/units/hooks/use-units.ts
export function useUnits() {
  // state: units[], isLoading, error
  // fetch: GET /units
  // create: POST /units  → refetch
  // update: PUT /units/:id → refetch
  // remove: DELETE /units/:id → refetch (409 → toast lỗi "Đang được sử dụng")
  return { units, isLoading, error, createUnit, updateUnit, removeUnit }
}
```

Tests (MSW/node server):
- Fetch danh sách thành công
- Create unit mới → xuất hiện trong danh sách
- Delete trả 409 → không xóa, error state đúng

### UI

**`unit-list-page.tsx`**:
- `DataTable` với columns: Tên, Ký hiệu, Loại, Actions (Sửa / Xóa)
- Nút "+ Thêm đơn vị" (Admin + Manager)
- Xóa → `ConfirmDialog` → gọi `removeUnit`

**`unit-dialog.tsx`**:
- Props: `open`, `onClose`, `unit?: Unit` (undefined = create mode)
- Form: Name, Symbol, Type (Select: Khối lượng / Thể tích / Số lượng)
- Submit: gọi `createUnit` hoặc `updateUnit`

### MSW Handler

```ts
// GET  /units          → trả mảng Unit[]
// POST /units          → tạo mới, trả Unit
// PUT  /units/:id      → cập nhật, trả Unit
// DELETE /units/:id    → xóa (mock: luôn thành công trừ id='in-use' → 409)
```

---

## Module: Materials

### Types

```ts
// src/features/materials/types/material.types.ts
export type MaterialCategory =
  | 'main_ingredient'
  | 'supporting'
  | 'packaging'
  | 'consumable'
  | 'spare_part'

export interface Material {
  id: string
  code: string           // auto-generated, read-only
  name: string
  category: MaterialCategory
  baseUnitId: string
  baseUnit: Unit         // populated
  minimumInventory: number
  maximumInventory: number
  supplierIds: string[]  // liên kết với Supplier
  isActive: boolean
}

export interface CreateMaterialRequest {
  name: string
  category: MaterialCategory
  baseUnitId: string
  minimumInventory: number
  maximumInventory: number
  supplierIds: string[]
}

export type UpdateMaterialRequest = CreateMaterialRequest
```

### Schema (Zod)

```ts
export const materialSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  category: z.enum(['main_ingredient', 'supporting', 'packaging', 'consumable', 'spare_part']),
  baseUnitId: z.string().min(1, 'Chọn đơn vị tính'),
  minimumInventory: z.number({ invalid_type_error: 'Nhập số' }).min(0),
  maximumInventory: z.number({ invalid_type_error: 'Nhập số' }).min(0),
  supplierIds: z.array(z.string()),
}).refine(
  (d) => d.maximumInventory >= d.minimumInventory,
  { message: 'Tồn kho tối đa phải ≥ tối thiểu', path: ['maximumInventory'] }
)
export type MaterialFormValues = z.infer<typeof materialSchema>
```

### Hook

```ts
// src/features/materials/hooks/use-materials.ts
export function useMaterials() {
  // fetch: GET /materials (includes baseUnit populated)
  // create: POST /materials
  // update: PUT /materials/:id
  // remove: DELETE /materials/:id (409 nếu đang được dùng trong recipe)
  return { materials, isLoading, error, createMaterial, updateMaterial, removeMaterial }
}
```

Tests:
- Fetch danh sách thành công
- Validation: maximumInventory < minimumInventory → lỗi schema
- Create material → xuất hiện trong danh sách

### UI

**`material-list-page.tsx`**:
- `DataTable` với columns: Mã, Tên, Danh mục, Đơn vị cơ bản, Tồn tối thiểu, Tồn tối đa, Trạng thái (`StatusBadge`), Actions
- Search theo tên/mã
- Nút "+ Thêm nguyên vật liệu" (Admin + Manager)

**`material-dialog.tsx`** — 2 tabs:
- **Tab "Thông tin"**: Code (read-only), Name, Category (Select), BaseUnit (Select từ danh sách Units), MinInventory, MaxInventory
- **Tab "Nhà cung cấp"**: Danh sách supplier đã liên kết (tên + nút Gỡ liên kết), dropdown tìm + thêm supplier mới

### MSW Handler

```ts
// GET  /materials       → Material[] (với baseUnit populated)
// POST /materials       → tạo mới
// PUT  /materials/:id   → cập nhật (bao gồm cả isActive)
// DELETE /materials/:id → xóa (409 nếu đang dùng)
```

---

## Module: Suppliers

### Types

```ts
// src/features/suppliers/types/supplier.types.ts
export type PaymentTerms = 'cod' | '7_days' | '15_days' | '30_days'

export interface Supplier {
  id: string
  code: string
  name: string
  contactPerson: string
  phone: string
  email: string
  location: string
  taxCode: string
  paymentTerms: PaymentTerms
  note?: string
  isActive: boolean
}

export interface CreateSupplierRequest {
  code: string
  name: string
  contactPerson: string
  phone: string
  email: string
  location: string
  taxCode: string
  paymentTerms: PaymentTerms
  note?: string
}

export type UpdateSupplierRequest = CreateSupplierRequest
```

### Schema (Zod)

```ts
export const supplierSchema = z.object({
  code: z.string().min(1, 'Mã không được để trống'),
  name: z.string().min(1, 'Tên không được để trống'),
  contactPerson: z.string().min(1, 'Người liên hệ không được để trống'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không đúng định dạng'),
  location: z.string().min(1, 'Địa chỉ không được để trống'),
  taxCode: z.string().min(1, 'Mã số thuế không được để trống'),
  paymentTerms: z.enum(['cod', '7_days', '15_days', '30_days']),
  note: z.string().optional(),
})
export type SupplierFormValues = z.infer<typeof supplierSchema>
```

### Hook

```ts
// src/features/suppliers/hooks/use-suppliers.ts
export function useSuppliers() {
  // fetch: GET /suppliers
  // create: POST /suppliers
  // update: PUT /suppliers/:id
  // remove: DELETE /suppliers/:id (409 nếu đang liên kết với material)
  return { suppliers, isLoading, error, createSupplier, updateSupplier, removeSupplier }
}
```

Tests:
- Fetch danh sách thành công
- Create supplier → xuất hiện trong danh sách
- Delete supplier đang liên kết → error state đúng

### UI

**`supplier-list-page.tsx`**:
- `DataTable` với columns: Mã, Tên, Người liên hệ, Điện thoại, Email, Điều khoản TT, Trạng thái, Actions
- Search theo tên/mã/người liên hệ

**`supplier-dialog.tsx`**:
- 1 tab, 2 cột: Code, Name, ContactPerson, Phone, Email, Location, TaxCode, PaymentTerms (Select), Note (textarea full-width)

### MSW Handler

```ts
// GET  /suppliers       → Supplier[]
// POST /suppliers       → tạo mới
// PUT  /suppliers/:id   → cập nhật
// DELETE /suppliers/:id → xóa (409 nếu đang liên kết)
```

---

## Routing

Thêm vào `src/router/index.tsx` bên trong `AuthGuard > RootLayout`:

```
/units      → UnitListPage
/materials  → MaterialListPage
/suppliers  → SupplierListPage
```

Sidebar đã có sẵn các NavLink tương ứng từ Phase 1.

---

## RBAC

| Hành động | Admin | Manager | Supervisor |
|---|---|---|---|
| Xem danh sách | ✓ | ✓ | ✓ |
| Tạo mới | ✓ | ✓ | ✗ |
| Sửa | ✓ | ✓ | ✗ |
| Xóa | ✓ | ✗ | ✗ |

Implement ở component level: nút "Thêm mới" và actions "Sửa/Xóa" chỉ hiển thị khi `hasPermission(['admin', 'manager'])`. Nút "Xóa" chỉ hiển thị khi `hasPermission(['admin'])`.

---

## Error Handling

- **409 khi xóa**: Toast lỗi "Không thể xóa — đang được sử dụng"
- **Network error**: Toast lỗi generic "Có lỗi xảy ra, thử lại sau"
- **Validation**: Hiển thị lỗi inline dưới từng field (React Hook Form pattern)
- **Empty state**: "Chưa có dữ liệu. Nhấn + Thêm để bắt đầu."

---

## Testing Strategy

Mỗi hook có test file dùng MSW/node server (pattern từ `use-dashboard.test.ts`):
- Happy path: fetch thành công, data đúng
- Create/Update: state cập nhật sau mutation
- Error path: 409, network error → error state đúng

Shared components (DataTable, ConfirmDialog): không cần test riêng — được cover qua hook tests.

---

## Out of Scope (Phase 3)

- `MaterialUnitCanHave`: unit phụ với conversion rate
- Import price history per Supplier
- Supplier rating / transaction history
- Material image/photo upload
