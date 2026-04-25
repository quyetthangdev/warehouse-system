import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { ImportForm } from '@/features/import-forms/types/import-form.types'
import { WAREHOUSES } from '@/features/import-forms/import-form.utils'

const BASE_URL = 'http://localhost:3000'

let forms: ImportForm[] = [
  {
    id: 'pn-001',
    code: 'PN-2025-001',
    supplierId: 'sup-001',
    supplierName: 'Công ty TNHH Cà Phê Việt',
    warehouseId: 'wh-001',
    warehouseName: 'Kho tổng',
    invoiceNumber: 'HD-2025-001',
    poNumber: 'PO-001',
    importDate: '2025-12-22',
    importType: 'Mua hàng',
    note: 'Hàng nhập cuối năm',
    status: 'draft',
    requestedBy: 'Nguyễn Văn A',
    createdBy: 'Nguyễn Văn A',
    createdAt: '2025-12-22T08:00:00Z',
    items: [
      {
        id: 'item-001',
        materialId: 'mat-001',
        materialName: 'Cam tươi',
        unit: 'kg',
        quantity: 100,
        unitPrice: 15000,
        batchNumber: 'L001',
        mfgDate: '2025-12-20',
        expiryDate: '2026-01-20',
      },
    ],
  },
  {
    id: 'pn-002',
    code: 'PN-2025-002',
    supplierId: 'sup-002',
    supplierName: 'HTX Nông sản Đà Lạt',
    warehouseId: 'wh-002',
    warehouseName: 'Kho chi nhánh 1',
    invoiceNumber: 'HD-2025-002',
    poNumber: 'PO-002',
    importDate: '2025-12-22',
    importType: 'Mua hàng',
    status: 'confirmed',
    requestedBy: 'Nguyễn Văn A',
    approvedBy: 'Nguyễn Văn B',
    createdBy: 'Nguyễn Văn A',
    createdAt: '2025-12-22T09:00:00Z',
    updatedAt: '2025-12-22T10:00:00Z',
    totalValue: 50 * 22000 + 30 * 35000,
    items: [
      {
        id: 'item-002',
        materialId: 'mat-002',
        materialName: 'Đường kính trắng',
        unit: 'kg',
        quantity: 50,
        unitPrice: 22000,
        batchNumber: 'L002',
        mfgDate: '2025-11-01',
        expiryDate: '2026-11-01',
      },
      {
        id: 'item-003',
        materialId: 'mat-003',
        materialName: 'Sữa tươi không đường',
        unit: 'l',
        quantity: 30,
        unitPrice: 35000,
        batchNumber: 'L003',
        mfgDate: '2025-12-15',
        expiryDate: '2026-01-15',
      },
    ],
  },
  {
    id: 'pn-003',
    code: 'PN-2025-003',
    supplierId: 'sup-001',
    supplierName: 'Công ty TNHH Cà Phê Việt',
    invoiceNumber: 'HD-2025-003',
    poNumber: 'PO-003',
    importDate: '2025-12-22',
    importType: 'Nhập trả lại',
    status: 'cancelled',
    requestedBy: 'Nguyễn Văn A',
    createdBy: 'Nguyễn Văn A',
    createdAt: '2025-12-22T10:00:00Z',
    totalValue: 10000,
    items: [],
  },
]

let itemCounter = 100

export const importFormHandlers = [
  http.get(`${BASE_URL}/import-forms`, () => {
    return HttpResponse.json<ApiResponse<ImportForm[]>>({
      statusCode: 200, message: 'OK', data: forms,
    })
  }),

  http.get(`${BASE_URL}/import-forms/:id`, ({ params }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy phiếu nhập' }, { status: 404 })
    }
    return HttpResponse.json<ApiResponse<ImportForm>>({ statusCode: 200, message: 'OK', data: form })
  }),

  http.post(`${BASE_URL}/import-forms`, async ({ request }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any
    const warehouse = WAREHOUSES.find((w) => w.id === body.warehouseId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newItems = (body.items ?? []).map((item: any) => ({ ...item, id: `item-${++itemCounter}` }))
    const newForm: ImportForm = {
      ...body,
      id: `pn-${Date.now()}`,
      code: `PN-${new Date().getFullYear()}-${String(forms.length + 1).padStart(3, '0')}`,
      warehouseName: warehouse?.name,
      status: 'draft',
      requestedBy: 'Nguyễn Văn A',
      createdBy: 'Nguyễn Văn A',
      createdAt: new Date().toISOString(),
      totalValue: newItems.reduce((sum: number, i: { unitPrice?: number; quantity: number }) => sum + (i.unitPrice ?? 0) * i.quantity, 0),
      items: newItems,
    }
    forms = [...forms, newForm]
    return HttpResponse.json<ApiResponse<ImportForm>>(
      { statusCode: 201, message: 'Tạo thành công', data: newForm },
      { status: 201 },
    )
  }),

  http.put(`${BASE_URL}/import-forms/:id`, async ({ request, params }) => {
    const existing = forms.find((f) => f.id === params.id)
    if (!existing) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any
    const updated: ImportForm = {
      ...existing,
      ...body,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (body.items ?? existing.items).map((item: any) => ({
        ...item,
        id: item.id ?? `item-${++itemCounter}`,
      })),
      updatedAt: new Date().toISOString(),
    }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<ImportForm>>({ statusCode: 200, message: 'Cập nhật thành công', data: updated })
  }),

  http.post(`${BASE_URL}/import-forms/:id/cancel`, ({ params }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    }
    if (form.status !== 'draft') {
      return HttpResponse.json(
        { statusCode: 400, message: 'Chỉ có thể hủy phiếu ở trạng thái nháp' },
        { status: 400 },
      )
    }
    const updated = { ...form, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<ImportForm>>({ statusCode: 200, message: 'Đã hủy phiếu', data: updated })
  }),

  http.post(`${BASE_URL}/import-forms/:id/items`, async ({ request, params }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    }
    if (form.status !== 'draft') {
      return HttpResponse.json(
        { statusCode: 400, message: 'Chỉ có thể thêm sản phẩm vào phiếu nháp' },
        { status: 400 },
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any
    const newItem = { ...body, id: `item-${++itemCounter}` }
    const updated = { ...form, items: [...form.items, newItem], updatedAt: new Date().toISOString() }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<ImportForm>>(
      { statusCode: 201, message: 'Thêm sản phẩm thành công', data: updated },
      { status: 201 },
    )
  }),

  http.post(`${BASE_URL}/import-forms/:id/confirm`, ({ params }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    }
    if (form.status !== 'draft') {
      return HttpResponse.json(
        { statusCode: 400, message: 'Chỉ có thể xác nhận phiếu ở trạng thái nháp' },
        { status: 400 },
      )
    }
    const updated = {
      ...form,
      status: 'confirmed' as const,
      approvedBy: 'Nguyễn Văn B',
      updatedAt: new Date().toISOString(),
    }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<ImportForm>>({
      statusCode: 200, message: 'Đã xác nhận phiếu nhập', data: updated,
    })
  }),
]
