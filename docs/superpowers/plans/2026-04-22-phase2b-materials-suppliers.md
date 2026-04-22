# Phase 2B — Materials + Suppliers Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Suppliers and Materials CRUD modules (list page + create/edit/delete dialog) on top of the shared DataTable, ConfirmDialog, StatusBadge, and Units module from Plan A.

**Architecture:** Feature-based, nhất quán Plan A. Suppliers module trước (đơn giản hơn), Materials module sau (phụ thuộc Units + Suppliers). Server state local trong hooks, không Zustand. MaterialDialog dùng shadcn Tabs (Tab Thông tin + Tab Nhà cung cấp). MaterialListPage gọi cả `useUnits()` và `useSuppliers()` để cung cấp dữ liệu cho dialog.

**Tech Stack:** React 19, TypeScript, TanStack Table v8, shadcn/ui (Tabs, Textarea, Select, Dialog), React Hook Form + Zod, MSW v2, Vitest + RTL, Axios, Sonner toasts.

**Prerequisite:** Plan A (Phase 2A) đã được execute xong — `@tanstack/react-table`, shadcn Table/Select/Dialog đã cài, Units module và shared components đã có.

---

## File Map

```
warehouse-ui/
└── src/
    ├── components/ui/
    │   ├── tabs.tsx                                    [CREATE via shadcn]
    │   └── textarea.tsx                                [CREATE via shadcn]
    ├── features/
    │   ├── suppliers/
    │   │   ├── types/supplier.types.ts                 [CREATE]
    │   │   ├── schemas/supplier.schema.ts              [CREATE]
    │   │   ├── hooks/use-suppliers.ts                  [CREATE]
    │   │   ├── hooks/use-suppliers.test.ts             [CREATE]
    │   │   ├── components/supplier-dialog.tsx          [CREATE]
    │   │   ├── components/supplier-list-page.tsx       [CREATE]
    │   │   └── index.ts                                [CREATE]
    │   └── materials/
    │       ├── types/material.types.ts                 [CREATE]
    │       ├── schemas/material.schema.ts              [CREATE]
    │       ├── hooks/use-materials.ts                  [CREATE]
    │       ├── hooks/use-materials.test.ts             [CREATE]
    │       ├── components/material-dialog.tsx          [CREATE]
    │       ├── components/material-list-page.tsx       [CREATE]
    │       └── index.ts                                [CREATE]
    ├── services/
    │   ├── supplier.service.ts                         [CREATE]
    │   └── material.service.ts                         [CREATE]
    ├── mocks/handlers/
    │   ├── supplier.handler.ts                         [CREATE]
    │   ├── material.handler.ts                         [CREATE]
    │   └── index.ts                                    [MODIFY] add supplier + material handlers
    └── router/
        └── index.tsx                                   [MODIFY] add /materials + /suppliers routes
```

---

## Task 1: Cài shadcn Tabs và Textarea

**Files:**
- Create: `warehouse-ui/src/components/ui/tabs.tsx` (via shadcn)
- Create: `warehouse-ui/src/components/ui/textarea.tsx` (via shadcn)

- [ ] **Step 1: Thêm shadcn Tabs component**

```bash
cd /Users/phanquyetthang/warehouse-system/warehouse-ui
npx shadcn add tabs
```

Expected: File `src/components/ui/tabs.tsx` được tạo.

- [ ] **Step 2: Thêm shadcn Textarea component**

```bash
npx shadcn add textarea
```

Expected: File `src/components/ui/textarea.tsx` được tạo.

- [ ] **Step 3: Chạy build**

```bash
npm run build
```

Expected: Build thành công, không có TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/tabs.tsx src/components/ui/textarea.tsx
git commit -m "chore: add shadcn tabs and textarea components"
```

---

## Task 2: Supplier types + schema + service + MSW handler

**Files:**
- Create: `warehouse-ui/src/features/suppliers/types/supplier.types.ts`
- Create: `warehouse-ui/src/features/suppliers/schemas/supplier.schema.ts`
- Create: `warehouse-ui/src/services/supplier.service.ts`
- Create: `warehouse-ui/src/mocks/handlers/supplier.handler.ts`
- Modify: `warehouse-ui/src/mocks/handlers/index.ts`

- [ ] **Step 1: Tạo supplier.types.ts**

```ts
// warehouse-ui/src/features/suppliers/types/supplier.types.ts
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

- [ ] **Step 2: Tạo supplier.schema.ts**

```ts
// warehouse-ui/src/features/suppliers/schemas/supplier.schema.ts
import { z } from 'zod'

export const supplierSchema = z.object({
  code: z.string().min(1, 'Mã không được để trống'),
  name: z.string().min(1, 'Tên không được để trống'),
  contactPerson: z.string().min(1, 'Người liên hệ không được để trống'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không đúng định dạng'),
  location: z.string().min(1, 'Địa chỉ không được để trống'),
  taxCode: z.string().min(1, 'Mã số thuế không được để trống'),
  paymentTerms: z.enum(['cod', '7_days', '15_days', '30_days'], {
    required_error: 'Chọn điều khoản thanh toán',
  }),
  note: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>
```

- [ ] **Step 3: Tạo supplier.service.ts**

```ts
// warehouse-ui/src/services/supplier.service.ts
import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '@/features/suppliers/types/supplier.types'

export const supplierService = {
  getAll() {
    return api.get<ApiResponse<Supplier[]>>('/suppliers')
  },

  create(payload: CreateSupplierRequest) {
    return api.post<ApiResponse<Supplier>>('/suppliers', payload)
  },

  update(id: string, payload: UpdateSupplierRequest) {
    return api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, payload)
  },

  remove(id: string) {
    return api.delete<ApiResponse<void>>(`/suppliers/${id}`)
  },
}
```

- [ ] **Step 4: Tạo supplier.handler.ts**

```ts
// warehouse-ui/src/mocks/handlers/supplier.handler.ts
import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { Supplier } from '@/features/suppliers/types/supplier.types'

const BASE_URL = 'http://localhost:3000'

let suppliers: Supplier[] = [
  {
    id: 'sup-001',
    code: 'NCC001',
    name: 'Công ty TNHH Cà Phê Việt',
    contactPerson: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an@caphe-viet.com',
    location: 'TP. Hồ Chí Minh',
    taxCode: '0123456789',
    paymentTerms: '30_days',
    isActive: true,
  },
  {
    id: 'sup-002',
    code: 'NCC002',
    name: 'HTX Nông sản Đà Lạt',
    contactPerson: 'Trần Thị Bình',
    phone: '0912345678',
    email: 'binh@nongsan-dalat.vn',
    location: 'Đà Lạt, Lâm Đồng',
    taxCode: '9876543210',
    paymentTerms: '15_days',
    isActive: true,
  },
  {
    id: 'sup-003',
    code: 'NCC003',
    name: 'Công ty Bao Bì Xanh',
    contactPerson: 'Lê Minh Cường',
    phone: '0923456789',
    email: 'cuong@baobixa.vn',
    location: 'Hà Nội',
    taxCode: '1234567890',
    paymentTerms: 'cod',
    isActive: false,
  },
]

export const supplierHandlers = [
  http.get(`${BASE_URL}/suppliers`, () => {
    const response: ApiResponse<Supplier[]> = { statusCode: 200, message: 'OK', data: suppliers }
    return HttpResponse.json(response)
  }),

  http.post(`${BASE_URL}/suppliers`, async ({ request }) => {
    const body = await request.json() as Omit<Supplier, 'id' | 'isActive'>
    const newSupplier: Supplier = { ...body, id: `sup-${Date.now()}`, isActive: true }
    suppliers = [...suppliers, newSupplier]
    const response: ApiResponse<Supplier> = { statusCode: 201, message: 'Tạo thành công', data: newSupplier }
    return HttpResponse.json(response, { status: 201 })
  }),

  http.put(`${BASE_URL}/suppliers/:id`, async ({ request, params }) => {
    const body = await request.json() as Omit<Supplier, 'id' | 'isActive'>
    suppliers = suppliers.map((s) => (s.id === params.id ? { ...s, ...body } : s))
    const updated = suppliers.find((s) => s.id === params.id)!
    const response: ApiResponse<Supplier> = { statusCode: 200, message: 'Cập nhật thành công', data: updated }
    return HttpResponse.json(response)
  }),

  http.delete(`${BASE_URL}/suppliers/:id`, ({ params }) => {
    if (params.id === 'supplier-in-use') {
      return HttpResponse.json(
        { statusCode: 409, message: 'Nhà cung cấp đang được liên kết với nguyên vật liệu, không thể xóa' },
        { status: 409 },
      )
    }
    suppliers = suppliers.filter((s) => s.id !== params.id)
    const response: ApiResponse<void> = { statusCode: 200, message: 'Xóa thành công', data: undefined }
    return HttpResponse.json(response)
  }),
]
```

- [ ] **Step 5: Cập nhật handlers/index.ts (thêm supplierHandlers)**

```ts
// warehouse-ui/src/mocks/handlers/index.ts
import { authHandlers } from './auth.handler'
import { notificationHandlers } from './notification.handler'
import { dashboardHandlers } from './dashboard.handler'
import { unitHandlers } from './unit.handler'
import { supplierHandlers } from './supplier.handler'

export const handlers = [
  ...authHandlers,
  ...notificationHandlers,
  ...dashboardHandlers,
  ...unitHandlers,
  ...supplierHandlers,
]
```

- [ ] **Step 6: Chạy build**

```bash
npm run build
```

Expected: No TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/suppliers/types/ src/features/suppliers/schemas/ src/services/supplier.service.ts src/mocks/handlers/supplier.handler.ts src/mocks/handlers/index.ts
git commit -m "feat: add supplier types, schema, service, and MSW handler"
```

---

## Task 3: useSuppliers hook (TDD)

**Files:**
- Create: `warehouse-ui/src/features/suppliers/hooks/use-suppliers.test.ts`
- Create: `warehouse-ui/src/features/suppliers/hooks/use-suppliers.ts`

- [ ] **Step 1: Viết failing tests**

```ts
// warehouse-ui/src/features/suppliers/hooks/use-suppliers.test.ts
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useSuppliers } from './use-suppliers'

const mockSuppliers = [
  {
    id: 'sup-001',
    code: 'NCC001',
    name: 'Công ty TNHH Cà Phê Việt',
    contactPerson: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an@caphe-viet.com',
    location: 'TP. Hồ Chí Minh',
    taxCode: '0123456789',
    paymentTerms: '30_days',
    isActive: true,
  },
]

const server = setupServer(
  http.get('http://localhost:3000/suppliers', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: mockSuppliers }),
  ),
  http.post('http://localhost:3000/suppliers', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json(
      { statusCode: 201, message: 'OK', data: { id: 'new-id', ...body, isActive: true } },
      { status: 201 },
    )
  }),
  http.delete('http://localhost:3000/suppliers/:id', ({ params }) => {
    if (params.id === 'supplier-in-use') {
      return HttpResponse.json(
        { statusCode: 409, message: 'Đang được liên kết' },
        { status: 409 },
      )
    }
    return HttpResponse.json({ statusCode: 200, message: 'OK', data: undefined })
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useSuppliers', () => {
  it('fetch danh sách thành công', async () => {
    const { result } = renderHook(() => useSuppliers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.suppliers).toHaveLength(1)
    expect(result.current.suppliers[0].name).toBe('Công ty TNHH Cà Phê Việt')
  })

  it('createSupplier trả về true khi thành công', async () => {
    const { result } = renderHook(() => useSuppliers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let ok: boolean
    await act(async () => {
      ok = await result.current.createSupplier({
        code: 'NCC999',
        name: 'Test NCC',
        contactPerson: 'Người Test',
        phone: '0999999999',
        email: 'test@test.com',
        location: 'Hà Nội',
        taxCode: '0000000000',
        paymentTerms: 'cod',
      })
    })
    expect(ok!).toBe(true)
  })

  it('removeSupplier đang liên kết trả về ok=false và message', async () => {
    const { result } = renderHook(() => useSuppliers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.removeSupplier('supplier-in-use')
    })
    expect(res!.ok).toBe(false)
    expect(res!.message).toBeTruthy()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

```bash
npm run test -- --run src/features/suppliers/hooks/use-suppliers.test.ts
```

Expected: FAIL — `Cannot find module './use-suppliers'`

- [ ] **Step 3: Tạo use-suppliers.ts**

```ts
// warehouse-ui/src/features/suppliers/hooks/use-suppliers.ts
import { useState, useEffect, useCallback } from 'react'
import { supplierService } from '@/services/supplier.service'
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../types/supplier.types'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await supplierService.getAll()
      setSuppliers(res.data)
    } catch {
      setError('Không thể tải danh sách nhà cung cấp')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function createSupplier(payload: CreateSupplierRequest): Promise<boolean> {
    try {
      await supplierService.create(payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function updateSupplier(id: string, payload: UpdateSupplierRequest): Promise<boolean> {
    try {
      await supplierService.update(id, payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function removeSupplier(id: string): Promise<{ ok: boolean; message?: string }> {
    try {
      await supplierService.remove(id)
      await fetchAll()
      return { ok: true }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể xóa nhà cung cấp'
      return { ok: false, message }
    }
  }

  return { suppliers, isLoading, error, createSupplier, updateSupplier, removeSupplier }
}
```

- [ ] **Step 4: Chạy tests**

```bash
npm run test -- --run src/features/suppliers/hooks/use-suppliers.test.ts
```

Expected: `3 tests passed`

- [ ] **Step 5: Chạy toàn bộ tests**

```bash
npm run test -- --run
```

Expected: `25 tests passed` (22 từ Plan A + 3 mới)

- [ ] **Step 6: Commit**

```bash
git add src/features/suppliers/hooks/
git commit -m "feat: add useSuppliers hook with TDD (fetch, create, delete)"
```

---

## Task 4: SupplierDialog + SupplierListPage

**Files:**
- Create: `warehouse-ui/src/features/suppliers/components/supplier-dialog.tsx`
- Create: `warehouse-ui/src/features/suppliers/components/supplier-list-page.tsx`
- Create: `warehouse-ui/src/features/suppliers/index.ts`

- [ ] **Step 1: Tạo supplier-dialog.tsx**

```tsx
// warehouse-ui/src/features/suppliers/components/supplier-dialog.tsx
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supplierSchema, type SupplierFormValues } from '../schemas/supplier.schema'
import type { Supplier } from '../types/supplier.types'

interface SupplierDialogProps {
  open: boolean
  supplier?: Supplier
  onSubmit: (values: SupplierFormValues) => Promise<void>
  onClose: () => void
}

const paymentTermsOptions = [
  { value: 'cod', label: 'COD (Thanh toán ngay)' },
  { value: '7_days', label: '7 ngày' },
  { value: '15_days', label: '15 ngày' },
  { value: '30_days', label: '30 ngày' },
] as const

export function SupplierDialog({ open, supplier, onSubmit, onClose }: SupplierDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
  })

  const selectedPaymentTerms = watch('paymentTerms')

  useEffect(() => {
    if (open) {
      reset(
        supplier
          ? {
              code: supplier.code,
              name: supplier.name,
              contactPerson: supplier.contactPerson,
              phone: supplier.phone,
              email: supplier.email,
              location: supplier.location,
              taxCode: supplier.taxCode,
              paymentTerms: supplier.paymentTerms,
              note: supplier.note ?? '',
            }
          : {
              code: '',
              name: '',
              contactPerson: '',
              phone: '',
              email: '',
              location: '',
              taxCode: '',
              note: '',
            },
      )
    }
  }, [open, supplier, reset])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="sup-code">Mã nhà cung cấp *</Label>
              <Input
                id="sup-code"
                placeholder="VD: NCC001"
                {...register('code')}
                aria-invalid={!!errors.code}
              />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-name">Tên nhà cung cấp *</Label>
              <Input
                id="sup-name"
                placeholder="VD: Công ty Cà Phê Việt"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-contact">Người liên hệ *</Label>
              <Input
                id="sup-contact"
                placeholder="Nguyễn Văn A"
                {...register('contactPerson')}
                aria-invalid={!!errors.contactPerson}
              />
              {errors.contactPerson && (
                <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-phone">Số điện thoại *</Label>
              <Input
                id="sup-phone"
                placeholder="0901234567"
                {...register('phone')}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-email">Email *</Label>
              <Input
                id="sup-email"
                type="email"
                placeholder="contact@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-location">Địa chỉ *</Label>
              <Input
                id="sup-location"
                placeholder="TP. Hồ Chí Minh"
                {...register('location')}
                aria-invalid={!!errors.location}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-tax">Mã số thuế *</Label>
              <Input
                id="sup-tax"
                placeholder="0123456789"
                {...register('taxCode')}
                aria-invalid={!!errors.taxCode}
              />
              {errors.taxCode && (
                <p className="text-sm text-destructive">{errors.taxCode.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Điều khoản thanh toán *</Label>
              <Select
                value={selectedPaymentTerms}
                onValueChange={(v) =>
                  setValue('paymentTerms', v as SupplierFormValues['paymentTerms'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger aria-invalid={!!errors.paymentTerms}>
                  <SelectValue placeholder="Chọn điều khoản" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermsOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentTerms && (
                <p className="text-sm text-destructive">{errors.paymentTerms.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="sup-note">Ghi chú</Label>
              <Textarea
                id="sup-note"
                placeholder="Ghi chú thêm..."
                className="resize-none"
                rows={3}
                {...register('note')}
              />
            </div>
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

- [ ] **Step 2: Tạo supplier-list-page.tsx**

```tsx
// warehouse-ui/src/features/suppliers/components/supplier-list-page.tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { StatusBadge } from '@/components/common/status-badge'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { useSuppliers } from '../hooks/use-suppliers'
import { SupplierDialog } from './supplier-dialog'
import type { Supplier } from '../types/supplier.types'
import type { SupplierFormValues } from '../schemas/supplier.schema'

const paymentTermsLabel: Record<string, string> = {
  cod: 'COD',
  '7_days': '7 ngày',
  '15_days': '15 ngày',
  '30_days': '30 ngày',
}

export function SupplierListPage() {
  const { suppliers, isLoading, createSupplier, updateSupplier, removeSupplier } = useSuppliers()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canEdit = hasPermission(['admin', 'manager'])
  const canDelete = hasPermission(['admin'])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Supplier | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)

  const columns: ColumnDef<Supplier>[] = [
    { accessorKey: 'code', header: 'Mã NCC' },
    { accessorKey: 'name', header: 'Tên nhà cung cấp' },
    { accessorKey: 'contactPerson', header: 'Người liên hệ' },
    { accessorKey: 'phone', header: 'Điện thoại' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'paymentTerms',
      header: 'Điều khoản TT',
      cell: ({ row }) => paymentTermsLabel[row.original.paymentTerms] ?? row.original.paymentTerms,
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
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
                setEditSupplier(row.original)
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

  async function handleSubmit(values: SupplierFormValues) {
    const ok = editSupplier
      ? await updateSupplier(editSupplier.id, values)
      : await createSupplier(values)
    if (ok) {
      toast.success(editSupplier ? 'Cập nhật thành công' : 'Thêm thành công')
      setDialogOpen(false)
      setEditSupplier(undefined)
    } else {
      toast.error('Có lỗi xảy ra, thử lại sau')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const { ok, message } = await removeSupplier(deleteTarget.id)
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
          <h1 className="text-xl font-semibold">Nhà cung cấp</h1>
          {canEdit && (
            <Button
              onClick={() => {
                setEditSupplier(undefined)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm nhà cung cấp
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={suppliers}
          isLoading={isLoading}
          searchPlaceholder="Tìm kiếm nhà cung cấp..."
        />
      </div>

      <SupplierDialog
        open={dialogOpen}
        supplier={editSupplier}
        onSubmit={handleSubmit}
        onClose={() => {
          setDialogOpen(false)
          setEditSupplier(undefined)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa nhà cung cấp"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageContainer>
  )
}
```

- [ ] **Step 3: Tạo features/suppliers/index.ts**

```ts
// warehouse-ui/src/features/suppliers/index.ts
export { SupplierListPage } from './components/supplier-list-page'
```

- [ ] **Step 4: Chạy build**

```bash
npm run build
```

Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/suppliers/components/ src/features/suppliers/index.ts
git commit -m "feat: add SupplierListPage and SupplierDialog components"
```

---

## Task 5: Material types + schema + service + MSW handler

**Files:**
- Create: `warehouse-ui/src/features/materials/types/material.types.ts`
- Create: `warehouse-ui/src/features/materials/schemas/material.schema.ts`
- Create: `warehouse-ui/src/services/material.service.ts`
- Create: `warehouse-ui/src/mocks/handlers/material.handler.ts`
- Modify: `warehouse-ui/src/mocks/handlers/index.ts`

- [ ] **Step 1: Tạo material.types.ts**

```ts
// warehouse-ui/src/features/materials/types/material.types.ts
import type { Unit } from '@/features/units/types/unit.types'

export type MaterialCategory =
  | 'main_ingredient'
  | 'supporting'
  | 'packaging'
  | 'consumable'
  | 'spare_part'

export interface Material {
  id: string
  code: string
  name: string
  category: MaterialCategory
  baseUnitId: string
  baseUnit: Unit
  minimumInventory: number
  maximumInventory: number
  supplierIds: string[]
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

- [ ] **Step 2: Tạo material.schema.ts**

```ts
// warehouse-ui/src/features/materials/schemas/material.schema.ts
import { z } from 'zod'

export const materialSchema = z
  .object({
    name: z.string().min(1, 'Tên không được để trống'),
    category: z.enum(
      ['main_ingredient', 'supporting', 'packaging', 'consumable', 'spare_part'],
      { required_error: 'Chọn danh mục' },
    ),
    baseUnitId: z.string().min(1, 'Chọn đơn vị tính'),
    minimumInventory: z.number({ invalid_type_error: 'Nhập số' }).min(0, 'Tối thiểu là 0'),
    maximumInventory: z.number({ invalid_type_error: 'Nhập số' }).min(0, 'Tối thiểu là 0'),
    supplierIds: z.array(z.string()),
  })
  .refine((d) => d.maximumInventory >= d.minimumInventory, {
    message: 'Tồn kho tối đa phải ≥ tối thiểu',
    path: ['maximumInventory'],
  })

export type MaterialFormValues = z.infer<typeof materialSchema>
```

- [ ] **Step 3: Tạo material.service.ts**

```ts
// warehouse-ui/src/services/material.service.ts
import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { Material, CreateMaterialRequest, UpdateMaterialRequest } from '@/features/materials/types/material.types'

export const materialService = {
  getAll() {
    return api.get<ApiResponse<Material[]>>('/materials')
  },

  create(payload: CreateMaterialRequest) {
    return api.post<ApiResponse<Material>>('/materials', payload)
  },

  update(id: string, payload: UpdateMaterialRequest) {
    return api.put<ApiResponse<Material>>(`/materials/${id}`, payload)
  },

  remove(id: string) {
    return api.delete<ApiResponse<void>>(`/materials/${id}`)
  },
}
```

- [ ] **Step 4: Tạo material.handler.ts**

```ts
// warehouse-ui/src/mocks/handlers/material.handler.ts
import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { Material } from '@/features/materials/types/material.types'

const BASE_URL = 'http://localhost:3000'

let materials: Material[] = [
  {
    id: 'mat-001',
    code: 'NVL001',
    name: 'Cà phê Arabica',
    category: 'main_ingredient',
    baseUnitId: 'unit-001',
    baseUnit: { id: 'unit-001', name: 'Kilogram', symbol: 'kg', type: 'weight' },
    minimumInventory: 10,
    maximumInventory: 100,
    supplierIds: ['sup-001'],
    isActive: true,
  },
  {
    id: 'mat-002',
    code: 'NVL002',
    name: 'Sữa tươi',
    category: 'main_ingredient',
    baseUnitId: 'unit-003',
    baseUnit: { id: 'unit-003', name: 'Lít', symbol: 'l', type: 'volume' },
    minimumInventory: 20,
    maximumInventory: 200,
    supplierIds: ['sup-001', 'sup-002'],
    isActive: true,
  },
  {
    id: 'mat-003',
    code: 'NVL003',
    name: 'Cốc nhựa 16oz',
    category: 'packaging',
    baseUnitId: 'unit-005',
    baseUnit: { id: 'unit-005', name: 'Cái', symbol: 'cái', type: 'quantity' },
    minimumInventory: 100,
    maximumInventory: 1000,
    supplierIds: ['sup-003'],
    isActive: false,
  },
]

let codeCounter = 4

export const materialHandlers = [
  http.get(`${BASE_URL}/materials`, () => {
    const response: ApiResponse<Material[]> = { statusCode: 200, message: 'OK', data: materials }
    return HttpResponse.json(response)
  }),

  http.post(`${BASE_URL}/materials`, async ({ request }) => {
    const body = await request.json() as CreateMaterialBody
    const code = `NVL${String(codeCounter).padStart(3, '0')}`
    codeCounter++
    const newMaterial: Material = {
      ...body,
      id: `mat-${Date.now()}`,
      code,
      baseUnit: { id: body.baseUnitId, name: 'Đơn vị', symbol: '-', type: 'quantity' },
      isActive: true,
    }
    materials = [...materials, newMaterial]
    const response: ApiResponse<Material> = { statusCode: 201, message: 'Tạo thành công', data: newMaterial }
    return HttpResponse.json(response, { status: 201 })
  }),

  http.put(`${BASE_URL}/materials/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<Material>
    materials = materials.map((m) => (m.id === params.id ? { ...m, ...body } : m))
    const updated = materials.find((m) => m.id === params.id)!
    const response: ApiResponse<Material> = { statusCode: 200, message: 'Cập nhật thành công', data: updated }
    return HttpResponse.json(response)
  }),

  http.delete(`${BASE_URL}/materials/:id`, ({ params }) => {
    if (params.id === 'material-in-use') {
      return HttpResponse.json(
        { statusCode: 409, message: 'Nguyên vật liệu đang được sử dụng, không thể xóa' },
        { status: 409 },
      )
    }
    materials = materials.filter((m) => m.id !== params.id)
    const response: ApiResponse<void> = { statusCode: 200, message: 'Xóa thành công', data: undefined }
    return HttpResponse.json(response)
  }),
]

type CreateMaterialBody = {
  name: string
  category: Material['category']
  baseUnitId: string
  minimumInventory: number
  maximumInventory: number
  supplierIds: string[]
}
```

- [ ] **Step 5: Cập nhật handlers/index.ts (thêm materialHandlers)**

```ts
// warehouse-ui/src/mocks/handlers/index.ts
import { authHandlers } from './auth.handler'
import { notificationHandlers } from './notification.handler'
import { dashboardHandlers } from './dashboard.handler'
import { unitHandlers } from './unit.handler'
import { supplierHandlers } from './supplier.handler'
import { materialHandlers } from './material.handler'

export const handlers = [
  ...authHandlers,
  ...notificationHandlers,
  ...dashboardHandlers,
  ...unitHandlers,
  ...supplierHandlers,
  ...materialHandlers,
]
```

- [ ] **Step 6: Chạy build**

```bash
npm run build
```

Expected: No TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/materials/types/ src/features/materials/schemas/ src/services/material.service.ts src/mocks/handlers/material.handler.ts src/mocks/handlers/index.ts
git commit -m "feat: add material types, schema, service, and MSW handler"
```

---

## Task 6: useMaterials hook (TDD)

**Files:**
- Create: `warehouse-ui/src/features/materials/hooks/use-materials.test.ts`
- Create: `warehouse-ui/src/features/materials/hooks/use-materials.ts`

- [ ] **Step 1: Viết failing tests**

```ts
// warehouse-ui/src/features/materials/hooks/use-materials.test.ts
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useMaterials } from './use-materials'
import { materialSchema } from '../schemas/material.schema'

const mockMaterials = [
  {
    id: 'mat-001',
    code: 'NVL001',
    name: 'Cà phê Arabica',
    category: 'main_ingredient',
    baseUnitId: 'unit-001',
    baseUnit: { id: 'unit-001', name: 'Kilogram', symbol: 'kg', type: 'weight' },
    minimumInventory: 10,
    maximumInventory: 100,
    supplierIds: ['sup-001'],
    isActive: true,
  },
]

const server = setupServer(
  http.get('http://localhost:3000/materials', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: mockMaterials }),
  ),
  http.post('http://localhost:3000/materials', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json(
      {
        statusCode: 201,
        message: 'OK',
        data: {
          id: 'new-id',
          code: 'NVL999',
          ...body,
          baseUnit: { id: body.baseUnitId, name: 'Kilogram', symbol: 'kg', type: 'weight' },
          isActive: true,
        },
      },
      { status: 201 },
    )
  }),
  http.delete('http://localhost:3000/materials/:id', ({ params }) => {
    if (params.id === 'material-in-use') {
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

describe('materialSchema', () => {
  it('lỗi khi maximumInventory nhỏ hơn minimumInventory', () => {
    const result = materialSchema.safeParse({
      name: 'Test',
      category: 'main_ingredient',
      baseUnitId: 'unit-001',
      minimumInventory: 100,
      maximumInventory: 50,
      supplierIds: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const err = result.error.errors.find((e) => e.path.includes('maximumInventory'))
      expect(err?.message).toBe('Tồn kho tối đa phải ≥ tối thiểu')
    }
  })
})

describe('useMaterials', () => {
  it('fetch danh sách thành công', async () => {
    const { result } = renderHook(() => useMaterials())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.materials).toHaveLength(1)
    expect(result.current.materials[0].name).toBe('Cà phê Arabica')
  })

  it('createMaterial trả về true khi thành công', async () => {
    const { result } = renderHook(() => useMaterials())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let ok: boolean
    await act(async () => {
      ok = await result.current.createMaterial({
        name: 'Sữa tươi',
        category: 'main_ingredient',
        baseUnitId: 'unit-003',
        minimumInventory: 20,
        maximumInventory: 200,
        supplierIds: [],
      })
    })
    expect(ok!).toBe(true)
  })

  it('removeMaterial với id đang dùng trả về ok=false và message', async () => {
    const { result } = renderHook(() => useMaterials())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.removeMaterial('material-in-use')
    })
    expect(res!.ok).toBe(false)
    expect(res!.message).toBeTruthy()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

```bash
npm run test -- --run src/features/materials/hooks/use-materials.test.ts
```

Expected: FAIL — `Cannot find module './use-materials'`

- [ ] **Step 3: Tạo use-materials.ts**

```ts
// warehouse-ui/src/features/materials/hooks/use-materials.ts
import { useState, useEffect, useCallback } from 'react'
import { materialService } from '@/services/material.service'
import type { Material, CreateMaterialRequest, UpdateMaterialRequest } from '../types/material.types'

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await materialService.getAll()
      setMaterials(res.data)
    } catch {
      setError('Không thể tải danh sách nguyên vật liệu')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function createMaterial(payload: CreateMaterialRequest): Promise<boolean> {
    try {
      await materialService.create(payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function updateMaterial(id: string, payload: UpdateMaterialRequest): Promise<boolean> {
    try {
      await materialService.update(id, payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function removeMaterial(id: string): Promise<{ ok: boolean; message?: string }> {
    try {
      await materialService.remove(id)
      await fetchAll()
      return { ok: true }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể xóa nguyên vật liệu'
      return { ok: false, message }
    }
  }

  return { materials, isLoading, error, createMaterial, updateMaterial, removeMaterial }
}
```

- [ ] **Step 4: Chạy tests**

```bash
npm run test -- --run src/features/materials/hooks/use-materials.test.ts
```

Expected: `4 tests passed`

- [ ] **Step 5: Chạy toàn bộ tests**

```bash
npm run test -- --run
```

Expected: `29 tests passed` (25 từ các task trước + 4 mới)

- [ ] **Step 6: Commit**

```bash
git add src/features/materials/hooks/
git commit -m "feat: add useMaterials hook with TDD (schema validation, fetch, create, delete)"
```

---

## Task 7: MaterialDialog + MaterialListPage

**Files:**
- Create: `warehouse-ui/src/features/materials/components/material-dialog.tsx`
- Create: `warehouse-ui/src/features/materials/components/material-list-page.tsx`
- Create: `warehouse-ui/src/features/materials/index.ts`

- [ ] **Step 1: Tạo material-dialog.tsx**

```tsx
// warehouse-ui/src/features/materials/components/material-dialog.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { materialSchema, type MaterialFormValues } from '../schemas/material.schema'
import type { Material } from '../types/material.types'
import type { Unit } from '@/features/units/types/unit.types'
import type { Supplier } from '@/features/suppliers/types/supplier.types'

interface MaterialDialogProps {
  open: boolean
  material?: Material
  units: Unit[]
  suppliers: Supplier[]
  onSubmit: (values: MaterialFormValues) => Promise<void>
  onClose: () => void
}

const categoryOptions = [
  { value: 'main_ingredient', label: 'Nguyên liệu chính' },
  { value: 'supporting', label: 'Phụ liệu' },
  { value: 'packaging', label: 'Bao bì' },
  { value: 'consumable', label: 'Vật tư tiêu hao' },
  { value: 'spare_part', label: 'Phụ tùng' },
] as const

export function MaterialDialog({
  open,
  material,
  units,
  suppliers,
  onSubmit,
  onClose,
}: MaterialDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: { supplierIds: [] },
  })

  const selectedCategory = watch('category')
  const selectedBaseUnitId = watch('baseUnitId')
  const supplierIds = watch('supplierIds') ?? []

  useEffect(() => {
    if (open) {
      reset(
        material
          ? {
              name: material.name,
              category: material.category,
              baseUnitId: material.baseUnitId,
              minimumInventory: material.minimumInventory,
              maximumInventory: material.maximumInventory,
              supplierIds: material.supplierIds,
            }
          : {
              name: '',
              baseUnitId: '',
              minimumInventory: 0,
              maximumInventory: 0,
              supplierIds: [],
            },
      )
    }
  }, [open, material, reset])

  function addSupplier(supplierId: string) {
    if (!supplierIds.includes(supplierId)) {
      setValue('supplierIds', [...supplierIds, supplierId], { shouldValidate: true })
    }
  }

  function removeSupplier(supplierId: string) {
    setValue(
      'supplierIds',
      supplierIds.filter((id) => id !== supplierId),
      { shouldValidate: true },
    )
  }

  const linkedSuppliers = suppliers.filter((s) => supplierIds.includes(s.id))
  const availableSuppliers = suppliers.filter((s) => !supplierIds.includes(s.id))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {material ? 'Sửa nguyên vật liệu' : 'Thêm nguyên vật liệu'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="suppliers">
                Nhà cung cấp ({supplierIds.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              {material && (
                <div className="space-y-1">
                  <Label>Mã nguyên vật liệu</Label>
                  <Input value={material.code} readOnly className="bg-muted" />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="mat-name">Tên nguyên vật liệu *</Label>
                <Input
                  id="mat-name"
                  placeholder="VD: Cà phê Arabica"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Danh mục *</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(v) =>
                      setValue('category', v as MaterialFormValues['category'], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger aria-invalid={!!errors.category}>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Đơn vị tính *</Label>
                  <Select
                    value={selectedBaseUnitId}
                    onValueChange={(v) =>
                      setValue('baseUnitId', v, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger aria-invalid={!!errors.baseUnitId}>
                      <SelectValue placeholder="Chọn đơn vị" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.baseUnitId && (
                    <p className="text-sm text-destructive">{errors.baseUnitId.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mat-min">Tồn kho tối thiểu *</Label>
                  <Input
                    id="mat-min"
                    type="number"
                    min={0}
                    {...register('minimumInventory', { valueAsNumber: true })}
                    aria-invalid={!!errors.minimumInventory}
                  />
                  {errors.minimumInventory && (
                    <p className="text-sm text-destructive">{errors.minimumInventory.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mat-max">Tồn kho tối đa *</Label>
                  <Input
                    id="mat-max"
                    type="number"
                    min={0}
                    {...register('maximumInventory', { valueAsNumber: true })}
                    aria-invalid={!!errors.maximumInventory}
                  />
                  {errors.maximumInventory && (
                    <p className="text-sm text-destructive">{errors.maximumInventory.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4">
              <div className="space-y-2">
                <Label>Nhà cung cấp đang liên kết</Label>
                {linkedSuppliers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có nhà cung cấp nào</p>
                ) : (
                  <ul className="space-y-2">
                    {linkedSuppliers.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <span className="text-sm">{s.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSupplier(s.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {availableSuppliers.length > 0 && (
                <div className="space-y-1">
                  <Label>Thêm nhà cung cấp</Label>
                  <Select onValueChange={(v) => addSupplier(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhà cung cấp để thêm..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSuppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
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

- [ ] **Step 2: Tạo material-list-page.tsx**

```tsx
// warehouse-ui/src/features/materials/components/material-list-page.tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { StatusBadge } from '@/components/common/status-badge'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { useMaterials } from '../hooks/use-materials'
import { useUnits } from '@/features/units/hooks/use-units'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import { MaterialDialog } from './material-dialog'
import type { Material } from '../types/material.types'
import type { MaterialFormValues } from '../schemas/material.schema'

const categoryLabel: Record<string, string> = {
  main_ingredient: 'Nguyên liệu chính',
  supporting: 'Phụ liệu',
  packaging: 'Bao bì',
  consumable: 'Vật tư tiêu hao',
  spare_part: 'Phụ tùng',
}

export function MaterialListPage() {
  const { materials, isLoading, createMaterial, updateMaterial, removeMaterial } = useMaterials()
  const { units } = useUnits()
  const { suppliers } = useSuppliers()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canEdit = hasPermission(['admin', 'manager'])
  const canDelete = hasPermission(['admin'])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMaterial, setEditMaterial] = useState<Material | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Material | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)

  const columns: ColumnDef<Material>[] = [
    { accessorKey: 'code', header: 'Mã NVL' },
    { accessorKey: 'name', header: 'Tên nguyên vật liệu' },
    {
      accessorKey: 'category',
      header: 'Danh mục',
      cell: ({ row }) => categoryLabel[row.original.category] ?? row.original.category,
    },
    {
      accessorKey: 'baseUnit',
      header: 'Đơn vị cơ bản',
      cell: ({ row }) =>
        `${row.original.baseUnit.name} (${row.original.baseUnit.symbol})`,
    },
    {
      accessorKey: 'minimumInventory',
      header: 'Tồn tối thiểu',
      cell: ({ row }) =>
        `${row.original.minimumInventory} ${row.original.baseUnit.symbol}`,
    },
    {
      accessorKey: 'maximumInventory',
      header: 'Tồn tối đa',
      cell: ({ row }) =>
        `${row.original.maximumInventory} ${row.original.baseUnit.symbol}`,
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
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
                setEditMaterial(row.original)
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

  async function handleSubmit(values: MaterialFormValues) {
    const ok = editMaterial
      ? await updateMaterial(editMaterial.id, values)
      : await createMaterial(values)
    if (ok) {
      toast.success(editMaterial ? 'Cập nhật thành công' : 'Thêm thành công')
      setDialogOpen(false)
      setEditMaterial(undefined)
    } else {
      toast.error('Có lỗi xảy ra, thử lại sau')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const { ok, message } = await removeMaterial(deleteTarget.id)
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
          <h1 className="text-xl font-semibold">Nguyên vật liệu</h1>
          {canEdit && (
            <Button
              onClick={() => {
                setEditMaterial(undefined)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm nguyên vật liệu
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={materials}
          isLoading={isLoading}
          searchPlaceholder="Tìm kiếm nguyên vật liệu..."
        />
      </div>

      <MaterialDialog
        open={dialogOpen}
        material={editMaterial}
        units={units}
        suppliers={suppliers}
        onSubmit={handleSubmit}
        onClose={() => {
          setDialogOpen(false)
          setEditMaterial(undefined)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa nguyên vật liệu"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageContainer>
  )
}
```

- [ ] **Step 3: Tạo features/materials/index.ts**

```ts
// warehouse-ui/src/features/materials/index.ts
export { MaterialListPage } from './components/material-list-page'
```

- [ ] **Step 4: Chạy build**

```bash
npm run build
```

Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/materials/components/ src/features/materials/index.ts
git commit -m "feat: add MaterialListPage and MaterialDialog with supplier tab"
```

---

## Task 8: Wire /materials và /suppliers vào router

**Files:**
- Modify: `warehouse-ui/src/router/index.tsx`

Note: Sidebar đã có link `/materials` và `/suppliers` từ Plan A Task 7. Chỉ cần thêm routes.

- [ ] **Step 1: Cập nhật router/index.tsx**

```tsx
// warehouse-ui/src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './auth-guard'
import { LoginPage } from '@/features/auth'
import { RootLayout } from '@/components/layout/root-layout'
import { DashboardPage } from '@/features/dashboard'
import { UnitListPage } from '@/features/units'
import { MaterialListPage } from '@/features/materials'
import { SupplierListPage } from '@/features/suppliers'

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
        ],
      },
    ],
  },
])
```

- [ ] **Step 2: Chạy toàn bộ tests**

```bash
npm run test -- --run
```

Expected: `29 tests passed` — không có test nào fail.

- [ ] **Step 3: Chạy build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 4: Khởi động dev server và verify thủ công**

```bash
npm run dev
```

Mở `http://localhost:5173`, login với `admin@trendcoffee.vn` / `password123`:

**Suppliers:**
- Click "Nhà cung cấp" → `/suppliers` hiển thị bảng với 3 suppliers mock ✓
- Tìm kiếm "Đà Lạt" → filter còn 1 row ✓
- Click "Thêm nhà cung cấp" → dialog mở với 2-column grid, Note textarea full-width ✓
- Điền form, chọn PaymentTerms, lưu → toast "Thêm thành công" ✓
- Click "Sửa" → dialog pre-populated, sửa, lưu → toast "Cập nhật thành công" ✓
- Click "Xóa" → ConfirmDialog → xác nhận → toast "Xóa thành công" ✓
- StatusBadge: "Hoạt động" (xanh) / "Ngừng dùng" (vàng) hiển thị đúng ✓

**Materials:**
- Click "Nguyên vật liệu" → `/materials` hiển thị bảng với 3 materials mock ✓
- Tìm kiếm "cà phê" → filter còn 1 row ✓
- Click "Thêm nguyên vật liệu" → dialog mở với 2 tabs ✓
- Tab "Thông tin": điền Name, chọn Danh mục, chọn Đơn vị từ dropdown (kg, l, cái...) ✓
- Nhập MaxInventory < MinInventory → lỗi "Tồn kho tối đa phải ≥ tối thiểu" hiển thị ✓
- Tab "Nhà cung cấp": chọn supplier từ dropdown → xuất hiện trong danh sách liên kết ✓
- Click X → supplier bị gỡ khỏi danh sách ✓
- Lưu → toast "Thêm thành công" ✓
- Click "Sửa" → dialog pre-populated cả 2 tabs ✓
- Kill dev server (Ctrl+C)

- [ ] **Step 5: Final commit**

```bash
git add src/router/index.tsx
git commit -m "feat: wire Materials and Suppliers modules into router"
```
