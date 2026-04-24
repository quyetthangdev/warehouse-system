# Kiểm kho (Balance Forms) — Design Spec

## Goal

Xây dựng module quản lý kiểm kho (`/balance-forms`) cho hệ thống TREND COFFEE WAREHOUSE, bao gồm tạo phiếu, nhập số liệu thực tế, tính chênh lệch, hoàn thành và cập nhật tồn kho.

## Architecture

Feature module độc lập theo pattern hiện có (`import-forms`, `export-forms`). Thêm `warehouse.store.ts` để quản lý trạng thái khóa kho cross-module. Chi tiết phiếu hiển thị qua wide dialog. Dữ liệu mock bằng MSW.

## Tech Stack

React 18, TypeScript, Zod, React Hook Form, MSW, shadcn/ui, Tailwind CSS v4, Zustand, Vitest.

---

## Data Model

### Types

```ts
type BalanceFormStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled'
type BalanceType = 'periodic' | 'unplanned'
type BalanceScope = 'full' | 'partial'
type DiscrepancyReason =
  | 'loss_in_use'
  | 'recording_error'
  | 'unrecorded_damage'
  | 'natural_loss'
  | 'counting_error'
  | 'other'

interface BalanceFormItem {
  id: string
  materialId: string
  materialName: string
  unit: string
  systemQuantity: number        // tồn sổ sách tại thời điểm tạo phiếu
  actualQuantity: number | null // nhập thực tế, null khi chưa nhập
  discrepancy: number | null    // actualQuantity - systemQuantity
  discrepancyPercent: number | null  // discrepancy / systemQuantity * 100
  reason?: DiscrepancyReason
  reasonText?: string           // bắt buộc khi reason = 'other'
  note?: string
}

interface BalanceForm {
  id: string
  code: string                  // PK-2026-001
  balanceType: BalanceType
  scope: BalanceScope
  status: BalanceFormStatus
  balanceDate: string           // YYYY-MM-DD
  createdBy: string
  inspectors: string[]          // ≥2 người (BR-BAL-001)
  note?: string
  attachmentNames?: string[]    // placeholder text (BR-BAL-003)
  items: BalanceFormItem[]
  createdAt: string
  completedAt?: string
  completedBy?: string
}
```

### Status Flow

```
draft → in_progress (Bắt đầu kiểm → lock warehouse)
     → cancelled

in_progress → completed (Hoàn thành → update stock, unlock)
           → cancelled (unlock)
```

---

## Components

### BalanceFormListPage (`/balance-forms`)

- `DataTable` với columns: mã phiếu, ngày kiểm, loại, phạm vi, người kiểm, số NVL, trạng thái, actions
- Filters: trạng thái, loại kiểm, ngày từ/đến
- Nút "Tạo phiếu kiểm" (canEdit) — disabled + banner khi warehouse locked
- Nút "Xem chi tiết" → mở `BalanceFormDetailDialog`
- CSV export

### BalanceFormDialog (tạo mới)

Tab "Thông tin":
- Loại kiểm: Định kỳ / Đột xuất
- Phạm vi: Toàn bộ / Một phần
- Ngày kiểm
- Inspectors: multi-select từ mock users, validate ≥2
- Ghi chú
- Tên file đính kèm (text, placeholder cho BR-BAL-003)

Tab "Danh sách NVL":
- Nếu scope = `full`: auto-load tất cả NVL từ inventory
- Nếu scope = `partial`: chọn NVL từ danh sách, systemQuantity tự điền

### BalanceFormDetailDialog (wide)

Sticky header: mã phiếu, badge trạng thái, nút "In phiếu", nút đóng

Body:
- Section "Thông tin phiếu": loại, phạm vi, ngày, người tạo, inspectors, ghi chú
- Section "Danh sách NVL": bảng có columns:
  - NVL, Đơn vị, Tồn sổ sách, Thực tế (input khi in_progress), Chênh lệch, %, Nguyên nhân (select khi in_progress), Ghi chú

Chênh lệch visual:
- `|%| > 10%` → text đỏ, ô highlight
- `5% < |%| ≤ 10%` → text vàng

Sticky footer (canEdit + đúng trạng thái):
- `draft`: nút "Bắt đầu kiểm", "Hủy phiếu"
- `in_progress`: nút "Hoàn thành kiểm kho", "Hủy phiếu"

### BalanceFormPrintView

`buildPrintHtml(form)` → HTML string cho `window.open` + `window.print()`.
Gồm: thông tin phiếu, bảng NVL (sổ sách, thực tế, chênh lệch, nguyên nhân), ký tên.

---

## Warehouse Store

```ts
// src/stores/warehouse.store.ts
interface WarehouseState {
  lockedByFormId: string | null
  lockWarehouse: (formId: string) => void
  unlockWarehouse: () => void
}
```

`import-form-list-page` và `export-form-list-page`:
- Check `lockedByFormId !== null`
- Hiện banner: "Kho đang trong quá trình kiểm kho. Không thể tạo phiếu nhập/xuất."
- Disable nút "Tạo phiếu"

---

## MSW Handlers

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/balance-forms` | Danh sách |
| POST | `/balance-forms` | Tạo mới (status: draft) |
| GET | `/balance-forms/:id` | Chi tiết |
| PUT | `/balance-forms/:id` | Cập nhật items (actualQuantity, reason) |
| POST | `/balance-forms/:id/start` | draft → in_progress |
| POST | `/balance-forms/:id/complete` | in_progress → completed, cập nhật tồn kho |
| POST | `/balance-forms/:id/cancel` | → cancelled |

`complete` handler: với mỗi item có `actualQuantity`, set `mockInventoryItems[i].currentStock = actualQuantity`.

---

## Business Rules

| Rule | Xử lý |
|---|---|
| BR-BAL-001: ≥2 inspectors | Validate trong schema + form |
| BR-BAL-002: >5% phải có reason | Block "Hoàn thành" nếu có item >5% chưa có reason |
| BR-BAL-003: ảnh thực tế | Placeholder text field `attachmentNames` |
| BR-BAL-004: khóa nhập/xuất | Zustand `warehouse.store` |
| BR-BAL-005: không sửa completed | Handler trả 400 nếu status !== draft/in_progress |
| BR-BAL-006: cập nhật tồn kho | `complete` handler mutate `mockInventoryItems` |

---

## Decisions

- **Người kiểm**: multi-select từ mock users list (không phải text tự do)
- **Khóa kho**: Zustand store, ảnh hưởng import-forms + export-forms list pages
- **Ảnh minh chứng**: text field placeholder (file upload chưa có trong codebase)
- **Nguyên nhân**: per-item
- **Giao diện chi tiết**: wide dialog (không phải trang riêng)
- **In phiếu**: `window.open` + HTML string builder
- **Export**: CSV (giữ nhất quán với các module khác)
