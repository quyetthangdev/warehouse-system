import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { ExportForm } from '@/features/export-forms/types/export-form.types'
import { mockExportForms } from '@/features/export-forms/mocks/export-form.mock'
import { WAREHOUSES } from '@/features/export-forms/export-form.utils'

const BASE_URL = 'http://localhost:3000'

let forms: ExportForm[] = [...mockExportForms]
let itemCounter = 200

export const exportFormHandlers = [
  http.get(`${BASE_URL}/export-forms`, () => {
    return HttpResponse.json<ApiResponse<ExportForm[]>>({
      statusCode: 200, message: 'OK', data: forms,
    })
  }),

  http.get(`${BASE_URL}/export-forms/:id`, ({ params }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy phiếu xuất' }, { status: 404 })
    }
    return HttpResponse.json<ApiResponse<ExportForm>>({ statusCode: 200, message: 'OK', data: form })
  }),

  http.post(`${BASE_URL}/export-forms`, async ({ request }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any
    const warehouse = WAREHOUSES.find((w) => w.id === body.destinationWarehouseId)
    const newForm: ExportForm = {
      ...body,
      id: `px-${Date.now()}`,
      code: `PX-${new Date().getFullYear()}-${String(forms.length + 1).padStart(3, '0')}`,
      destinationWarehouseName: warehouse?.name,
      status: 'draft',
      exportedBy: 'Nguyễn Văn A',
      createdBy: 'Nguyễn Văn A',
      createdAt: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (body.items ?? []).map((item: any) => ({ ...item, id: `eitem-${++itemCounter}` })),
    }
    forms = [...forms, newForm]
    return HttpResponse.json<ApiResponse<ExportForm>>(
      { statusCode: 201, message: 'Tạo thành công', data: newForm },
      { status: 201 },
    )
  }),

  http.put(`${BASE_URL}/export-forms/:id`, async ({ request, params }) => {
    const existing = forms.find((f) => f.id === params.id)
    if (!existing) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any
    const warehouse = WAREHOUSES.find((w) => w.id === body.destinationWarehouseId)
    const updated: ExportForm = {
      ...existing,
      ...body,
      destinationWarehouseName: warehouse?.name ?? existing.destinationWarehouseName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (body.items ?? existing.items).map((item: any) => ({
        ...item,
        id: item.id ?? `eitem-${++itemCounter}`,
      })),
      updatedAt: new Date().toISOString(),
    }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<ExportForm>>({ statusCode: 200, message: 'Cập nhật thành công', data: updated })
  }),

  http.post(`${BASE_URL}/export-forms/:id/cancel`, ({ params }) => {
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
    return HttpResponse.json<ApiResponse<ExportForm>>({ statusCode: 200, message: 'Đã hủy phiếu', data: updated })
  }),

  http.post(`${BASE_URL}/export-forms/:id/confirm`, ({ params }) => {
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
    return HttpResponse.json<ApiResponse<ExportForm>>({ statusCode: 200, message: 'Đã xác nhận phiếu xuất', data: updated })
  }),

  http.post(`${BASE_URL}/export-forms/:id/items`, async ({ request, params }) => {
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
    const newItem = { ...body, id: `eitem-${++itemCounter}` }
    const updated = { ...form, items: [...form.items, newItem], updatedAt: new Date().toISOString() }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<ExportForm>>(
      { statusCode: 201, message: 'Thêm sản phẩm thành công', data: updated },
      { status: 201 },
    )
  }),
]
