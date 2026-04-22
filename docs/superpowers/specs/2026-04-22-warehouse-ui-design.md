# Warehouse UI — Frontend Design Spec

**Date:** 2026-04-22
**Project:** Warehouse Management System — Trend Coffee
**Scope:** `warehouse-ui` frontend application

---

## 1. Context

Hệ thống quản lý kho cho Trend Coffee gồm 2 folder trong monorepo:
- `warehouse-api` — NestJS backend (làm sau)
- `warehouse-ui` — ReactJS frontend (làm trước, dùng mock data)

FE sẽ dùng MSW để mock API, switch sang BE thật chỉ cần đổi env variable — không đổi code feature.

---

## 2. Tech Stack

| Hạng mục | Thư viện |
|---|---|
| Framework | React 19.2 + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS v4 |
| State (global) | Zustand |
| Routing | React Router v6 |
| Form | React Hook Form + Zod |
| HTTP | Axios |
| Mock API | MSW v2 |
| Table | TanStack Table v8 |
| Charts | Recharts |
| Date | date-fns |
| Export | SheetJS (Excel) + jsPDF (PDF) |
| Icons | Lucide React |
| Test | Vitest + React Testing Library |
| Linting | ESLint + Prettier |

---

## 3. Monorepo Structure

```
warehouse-system/
├── warehouse-api/          ← NestJS (BE, làm sau)
├── warehouse-ui/           ← ReactJS (FE)
│   ├── src/
│   │   ├── features/       ← business modules
│   │   ├── components/     ← shared UI
│   │   ├── stores/         ← Zustand stores
│   │   ├── services/       ← Axios API layer
│   │   ├── mocks/          ← MSW handlers
│   │   ├── hooks/          ← shared custom hooks
│   │   ├── types/          ← shared TypeScript types
│   │   ├── lib/            ← utils, constants, helpers
│   │   └── router/         ← React Router config + guards
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
└── package.json            ← root workspace scripts
```

### Feature module structure

Mỗi feature có cấu trúc tự chứa:

```
features/<feature-name>/
├── components/     ← UI components riêng của feature
├── hooks/          ← custom hooks (useXxxList, useXxxDetail...)
├── types/          ← interfaces riêng của feature
├── mocks/          ← mock data
└── index.ts        ← public API của feature
```

---

## 4. Kiến trúc Folder Chi Tiết

### 4.1 Shared Components (`src/components/`)

```
components/
├── layout/
│   ├── app-sidebar.tsx       ← sidebar navigation
│   ├── app-header.tsx        ← breadcrumb, notification bell, avatar
│   └── page-container.tsx    ← wrapper padding/max-width chuẩn
├── common/
│   ├── data-table.tsx        ← TanStack Table wrapper
│   ├── status-badge.tsx      ← Draft/Confirmed/Cancelled
│   ├── alert-badge.tsx       ← đỏ/vàng/xanh cảnh báo tồn kho
│   ├── confirm-dialog.tsx    ← dialog xác nhận approve/cancel
│   ├── file-upload.tsx       ← upload hóa đơn, ảnh minh chứng
│   └── print-wrapper.tsx     ← wrapper cho chế độ in
└── form/
    ├── form-field.tsx        ← RHF + shadcn Input/Select wrapper
    ├── date-picker.tsx       ← shadcn Calendar + date-fns
    └── number-input.tsx      ← nhập số lượng, giá tiền (VND)
```

### 4.2 Zustand Stores (`src/stores/`)

Chỉ giữ global UI state và cross-feature state. Server state giữ trong hook-local.

```
stores/
├── auth.store.ts         ← user, accessToken, permissions, login(), logout()
├── notification.store.ts ← notifications[], unreadCount, markRead(), fetchNotifications()
├── inventory.store.ts    ← stocks{}, lastUpdated, startPolling(), stopPolling()
└── ui.store.ts           ← sidebarCollapsed, toggleSidebar()
```

### 4.3 Services (`src/services/`)

```
services/
├── axios.instance.ts     ← Axios instance + interceptors
├── auth.service.ts
├── material.service.ts
├── import-form.service.ts
├── export-form.service.ts
├── balance-form.service.ts
├── inventory.service.ts
├── payment.service.ts
└── report.service.ts
```

### 4.4 MSW Mocks (`src/mocks/`)

```
mocks/
├── browser.ts            ← MSW setup
└── handlers/
    ├── auth.handler.ts
    ├── material.handler.ts
    ├── import-form.handler.ts
    ├── export-form.handler.ts
    ├── balance-form.handler.ts
    ├── inventory.handler.ts
    └── payment.handler.ts
```

Enable mock: `VITE_USE_MOCK=true` trong `.env.local`. Không đổi code feature khi switch sang BE thật.

---

## 5. Routing & Phân Quyền

### 5.1 Route Map

```
/                           → redirect /dashboard
/login                      → LoginPage (public)
/dashboard                  → DashboardPage
/materials                  → MaterialListPage
/materials/:id              → MaterialDetailPage
/units                      → UnitListPage
/suppliers                  → SupplierListPage
/products                   → ProductListPage
/recipes                    → RecipeListPage
/import-forms               → ImportFormListPage
/import-forms/new           → ImportFormCreatePage
/import-forms/:id           → ImportFormDetailPage
/export-forms               → ExportFormListPage
/export-forms/new           → ExportFormCreatePage
/export-forms/:id           → ExportFormDetailPage
/balance-forms              → BalanceFormListPage
/balance-forms/new          → BalanceFormCreatePage
/balance-forms/:id          → BalanceFormDetailPage
/inventory                  → InventoryPage
/payments                   → PaymentListPage
/payments/new               → PaymentCreatePage
/payments/:id               → PaymentDetailPage
/reports                    → ReportPage
/settings                   → SettingsPage (Admin only)
/users                      → UserListPage (Admin only)
```

### 5.2 Guard Pattern

```
RouterProvider
└── RootLayout               ← sidebar, header, notification
    ├── AuthGuard            ← redirect /login nếu chưa đăng nhập
    └── PermissionGuard      ← kiểm tra role cho route nhạy cảm
```

### 5.3 RBAC Matrix

| Action | Admin | Manager | Supervisor |
|---|:---:|:---:|:---:|
| Duyệt phiếu nhập/xuất/kiểm | ✓ | ✓ | ✗ |
| Tạo phiếu nhập/xuất/kiểm | ✓ | ✓ | ✓ |
| Quản lý NVL / NCC / đơn vị | ✓ | ✓ | ✗ |
| Quản lý user | ✓ | ✗ | ✗ |
| Xem báo cáo | ✓ | ✓ | ✗ |
| Xem dashboard / tồn kho | ✓ | ✓ | ✓ |

Permission check ở component level:
```ts
const canApprove = hasPermission("import:approve") && form.status === "DRAFT"
```

---

## 6. Data Flow

### 6.1 Nguyên tắc

- **Server state** (API data) — fetch trong hook-local, không đưa vào Zustand
- **Global state** — Zustand chỉ giữ auth, notifications, inventory polling, UI state

### 6.2 Flow chuẩn

```
Page → hook (useXxxList / useXxxDetail)
     → service (Axios / MSW)
     → useState / useReducer local
     → render
```

### 6.3 Polling tồn kho

```ts
startPolling(30_000)  // poll mỗi 30 giây
// Dừng khi tab ẩn (Page Visibility API), resume khi tab active lại
```

### 6.4 JWT Refresh Flow

```
Request → 401
        → interceptor queue pending requests
        → POST /auth/refresh → token mới
        → retry tất cả queued requests
        → nếu refresh fail → logout()
```

### 6.5 Optimistic Update (useOptimistic)

Dùng cho approve/cancel phiếu: UI cập nhật trạng thái ngay, rollback nếu API lỗi.

---

## 7. UI Patterns

### 7.1 List Page Pattern

```
ListPage
├── PageHeader (title + nút "Tạo mới")
├── FilterBar (kỳ, trạng thái, NCC, loại...)
├── DataTable (TanStack Table, sort + pagination)
│   └── row: status badge + action buttons (theo role)
└── Pagination
```

### 7.2 Form Page Pattern (Create/Edit/Detail)

```
FormPage
├── PageHeader
├── FormHeader      ← thông tin chung (NCC, ngày, số PO...)
├── ItemTable       ← dynamic rows, inline warning khi nhập
├── FileUpload      ← đính kèm hóa đơn / ảnh
├── FormFooter      ← tổng tiền, nút Save Draft
└── ApproveBar      ← Confirm / Cancel (chỉ hiện theo role + status DRAFT)
```

### 7.3 Status Colors

| Status | Color |
|---|---|
| Draft | Gray |
| Confirmed | Green |
| Cancelled | Red |
| Cảnh báo đỏ | Out of stock, chênh lệch >10% |
| Cảnh báo vàng | Tồn thấp, HSD <30 ngày |
| Cảnh báo xanh | Thông tin thông thường |

### 7.4 Page States

Mỗi trang phải xử lý 3 states:
- **Loading** — shadcn Skeleton (không dùng spinner toàn trang)
- **Error** — inline error card + nút "Thử lại"
- **Empty** — empty state + CTA

### 7.5 Print

Mỗi phiếu có `PrintView` component dùng `@media print` CSS, trigger `window.print()`.

---

## 8. Error Handling

### 8.1 HTTP Errors (Axios interceptor)

| Code | Xử lý |
|---|---|
| 400 | Hiển thị validation message từ BE |
| 401 | Auto refresh token, nếu fail → logout |
| 403 | Toast "Bạn không có quyền thực hiện thao tác này" |
| 404 | Redirect /404 |
| 500 | Toast "Lỗi hệ thống, vui lòng thử lại" |
| Network | Toast "Mất kết nối, kiểm tra mạng" |

### 8.2 Form Validation (Zod)

Validate trước khi submit, hiển thị lỗi inline dưới field. Ví dụ:

```ts
importItemSchema = z.object({
  quantity:   z.number().positive("Số lượng phải > 0"),
  price:      z.number().positive("Giá nhập phải > 0"),
  expiryDate: z.date().min(today, "HSD phải sau ngày nhập"),
})
```

### 8.3 Inline Warnings (không block submit)

- Giá nhập chênh >20% so với lần trước → warning màu vàng
- HSD <30 ngày → warning màu vàng
- Nhập vượt mức tồn tối đa → warning màu cam

---

## 9. Testing Strategy

| Loại | Tool | Phạm vi |
|---|---|---|
| Unit | Vitest | hooks, utils, Zod schemas, Zustand stores |
| Component | React Testing Library | form interactions, status badges, permission guards |
| E2E | Playwright (sau khi có BE) | luồng nhập kho, xuất kho end-to-end |

Giai đoạn đầu (FE mock): tập trung unit test business logic — validation schema, stock calculation, FEFO logic.

---

## 10. Thứ Tự Implementation

1. **Scaffold monorepo** — Vite + React 19.2 + shadcn + Zustand + MSW setup
2. **Auth + Layout** — login, JWT flow, sidebar, header, guards
3. **Dashboard** — tổng quan tồn kho, widget cảnh báo, polling
4. **Master Data** — Material, Unit, Supplier, Product
5. **Recipe** — VariantMaterial mapping
6. **Import Form** — nhập kho (nghiệp vụ cốt lõi)
7. **Export Form** — xuất kho
8. **Balance Form** — kiểm kho
9. **Inventory** — tồn kho real-time
10. **Payment** — chi kho
11. **Reports** — báo cáo + export Excel/PDF

---

## 11. Naming Conventions (theo Coding Standards)

| Thành phần | Rule | Ví dụ |
|---|---|---|
| Folder | kebab-case | `import-form/` |
| File | kebab-case | `import-form-table.tsx` |
| Component | PascalCase | `ImportFormTable` |
| Hook | camelCase + `use` prefix | `useImportList` |
| Store | kebab-case + `.store.ts` | `auth.store.ts` |
| Service | kebab-case + `.service.ts` | `import-form.service.ts` |
| Type/Interface | PascalCase | `ImportForm`, `ImportItem` |
| Constant | UPPER_CASE_SNAKE_CASE | `MAX_FILE_SIZE` |
| Enum key | UPPER_CASE_SNAKE_CASE | `DRAFT`, `CONFIRMED` |
