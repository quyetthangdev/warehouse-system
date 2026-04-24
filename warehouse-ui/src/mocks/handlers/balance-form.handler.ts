import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { BalanceForm } from '@/features/balance-forms/types/balance-form.types'
import { mockBalanceForms } from '@/features/balance-forms/mocks/balance-form.mock'
import { mockInventoryItems } from '@/features/inventory/mocks/inventory.mock'

const BASE_URL = 'http://localhost:3000'

let forms: BalanceForm[] = [...mockBalanceForms]
let itemCounter = 100

export const balanceFormHandlers = [
  http.get(`${BASE_URL}/balance-forms`, () => {
    return HttpResponse.json<ApiResponse<BalanceForm[]>>({
      statusCode: 200, message: 'OK', data: forms,
    })
  }),

  http.get(`${BASE_URL}/balance-forms/:id`, ({ params }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy phiếu kiểm' }, { status: 404 })
    }
    return HttpResponse.json<ApiResponse<BalanceForm>>({ statusCode: 200, message: 'OK', data: form })
  }),

  http.post(`${BASE_URL}/balance-forms`, async ({ request }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any
    const newForm: BalanceForm = {
      id: `pk-${Date.now()}`,
      code: `PK-${new Date().getFullYear()}-${String(forms.length + 1).padStart(3, '0')}`,
      balanceType: body.balanceType,
      scope: body.scope,
      status: 'draft',
      balanceDate: body.balanceDate,
      createdBy: 'Nguyễn Văn A',
      inspectors: body.inspectors,
      note: body.note,
      attachmentNames: body.attachmentNames,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (body.items ?? []).map((item: any) => ({
        ...item,
        id: `pki-${++itemCounter}`,
        actualQuantity: null,
        discrepancy: null,
        discrepancyPercent: null,
      })),
      createdAt: new Date().toISOString(),
    }
    forms = [...forms, newForm]
    return HttpResponse.json<ApiResponse<BalanceForm>>(
      { statusCode: 201, message: 'Tạo thành công', data: newForm },
      { status: 201 },
    )
  }),

  http.put(`${BASE_URL}/balance-forms/:id`, async ({ params, request }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    }
    if (form.status === 'completed' || form.status === 'cancelled') {
      return HttpResponse.json({ statusCode: 400, message: 'Không thể chỉnh sửa phiếu đã hoàn thành/hủy' }, { status: 400 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any
    const updated = { ...form, items: body.items ?? form.items, updatedAt: new Date().toISOString() }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<BalanceForm>>({ statusCode: 200, message: 'Cập nhật thành công', data: updated })
  }),

  http.post(`${BASE_URL}/balance-forms/:id/start`, ({ params }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    }
    if (form.status !== 'draft') {
      return HttpResponse.json({ statusCode: 400, message: 'Chỉ có thể bắt đầu phiếu ở trạng thái nháp' }, { status: 400 })
    }
    const updated = { ...form, status: 'in_progress' as const }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<BalanceForm>>({ statusCode: 200, message: 'Đã bắt đầu kiểm kho', data: updated })
  }),

  http.post(`${BASE_URL}/balance-forms/:id/complete`, async ({ params, request }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    }
    if (form.status !== 'in_progress') {
      return HttpResponse.json({ statusCode: 400, message: 'Chỉ có thể hoàn thành phiếu đang kiểm' }, { status: 400 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any
    const items = body.items ?? form.items
    // BR-BAL-006: cập nhật tồn kho theo actualQuantity
    items.forEach((item: BalanceForm['items'][number]) => {
      if (item.actualQuantity !== null) {
        const inv = mockInventoryItems.find((i) => i.materialId === item.materialId)
        if (inv) inv.currentStock = item.actualQuantity
      }
    })
    const updated: BalanceForm = {
      ...form,
      status: 'completed' as const,
      items,
      completedAt: new Date().toISOString(),
      completedBy: 'Nguyễn Văn A',
    }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<BalanceForm>>({ statusCode: 200, message: 'Đã hoàn thành kiểm kho', data: updated })
  }),

  http.post(`${BASE_URL}/balance-forms/:id/cancel`, ({ params }) => {
    const form = forms.find((f) => f.id === params.id)
    if (!form) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    }
    if (form.status === 'completed') {
      return HttpResponse.json({ statusCode: 400, message: 'Không thể hủy phiếu đã hoàn thành' }, { status: 400 })
    }
    const updated = { ...form, status: 'cancelled' as const }
    forms = forms.map((f) => (f.id === params.id ? updated : f))
    return HttpResponse.json<ApiResponse<BalanceForm>>({ statusCode: 200, message: 'Đã hủy phiếu kiểm', data: updated })
  }),
]
