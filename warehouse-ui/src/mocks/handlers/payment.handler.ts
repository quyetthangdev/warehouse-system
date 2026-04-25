import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { Payment, Receipt } from '@/features/payments/types/payment.types'
import { MOCK_PAYMENTS, MOCK_RECEIPTS } from '@/features/payments/mocks/payment.mock'

const BASE_URL = 'http://localhost:3000'

let payments: Payment[] = [...MOCK_PAYMENTS]
let receipts: Receipt[] = [...MOCK_RECEIPTS]

export const paymentHandlers = [
  // ── Phiếu Chi ──
  http.get(`${BASE_URL}/payments`, () =>
    HttpResponse.json<ApiResponse<Payment[]>>({
      statusCode: 200, message: 'OK', data: payments,
    }),
  ),

  http.post(`${BASE_URL}/payments`, async ({ request }) => {
    const body = await request.json() as Partial<Payment>
    const vatAmount = Math.round((body.amountBeforeVat ?? 0) * (body.vatPercent ?? 0) / 100)
    const newPayment: Payment = {
      id: `pc-${Date.now()}`,
      code: `PC-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      paymentDate: body.paymentDate ?? new Date().toISOString().split('T')[0],
      paymentType: body.paymentType ?? 'other',
      amountBeforeVat: body.amountBeforeVat ?? 0,
      vatPercent: body.vatPercent ?? 0,
      vatAmount,
      totalAmount: (body.amountBeforeVat ?? 0) + vatAmount,
      paymentTerms: body.paymentTerms ?? 'direct',
      debtDays: body.debtDays,
      dueDate: body.dueDate,
      paymentMethod: body.paymentMethod ?? 'cash',
      transferCode: body.transferCode,
      supplierId: body.supplierId,
      supplierName: body.supplierName,
      importFormRef: body.importFormRef,
      createdBy: 'Nguyễn Văn A',
      reason: body.reason,
      note: body.note,
      status: 'draft',
    }
    payments = [...payments, newPayment]
    return HttpResponse.json<ApiResponse<Payment>>(
      { statusCode: 201, message: 'Tạo thành công', data: newPayment },
      { status: 201 },
    )
  }),

  http.patch(`${BASE_URL}/payments/:id/confirm`, ({ params }) => {
    const idx = payments.findIndex((p) => p.id === params.id)
    if (idx === -1) return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    payments[idx] = {
      ...payments[idx],
      status: 'confirmed',
      approvedBy: 'Nguyễn Văn B',
      approvedAt: new Date().toISOString(),
    }
    return HttpResponse.json<ApiResponse<Payment>>({ statusCode: 200, message: 'Xác nhận thành công', data: payments[idx] })
  }),

  http.patch(`${BASE_URL}/payments/:id/cancel`, ({ params }) => {
    const idx = payments.findIndex((p) => p.id === params.id)
    if (idx === -1) return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    payments[idx] = { ...payments[idx], status: 'cancelled' }
    return HttpResponse.json<ApiResponse<Payment>>({ statusCode: 200, message: 'Đã hủy', data: payments[idx] })
  }),

  // ── Phiếu Thu ──
  http.get(`${BASE_URL}/receipts`, () =>
    HttpResponse.json<ApiResponse<Receipt[]>>({
      statusCode: 200, message: 'OK', data: receipts,
    }),
  ),

  http.post(`${BASE_URL}/receipts`, async ({ request }) => {
    const body = await request.json() as Partial<Receipt>
    const vatAmount = Math.round((body.amountBeforeVat ?? 0) * (body.vatPercent ?? 0) / 100)
    const newReceipt: Receipt = {
      id: `pt-${Date.now()}`,
      code: `PT-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      receiptDate: body.receiptDate ?? new Date().toISOString().split('T')[0],
      receiptType: body.receiptType ?? 'other',
      amountBeforeVat: body.amountBeforeVat ?? 0,
      vatPercent: body.vatPercent ?? 0,
      vatAmount,
      totalAmount: (body.amountBeforeVat ?? 0) + vatAmount,
      receiptMethod: body.receiptMethod ?? 'cash',
      transferCode: body.transferCode,
      supplierId: body.supplierId,
      supplierName: body.supplierName,
      formRef: body.formRef,
      createdBy: 'Nguyễn Văn A',
      reason: body.reason ?? '',
      note: body.note,
      status: 'draft',
    }
    receipts = [...receipts, newReceipt]
    return HttpResponse.json<ApiResponse<Receipt>>(
      { statusCode: 201, message: 'Tạo thành công', data: newReceipt },
      { status: 201 },
    )
  }),

  http.patch(`${BASE_URL}/receipts/:id/confirm`, ({ params }) => {
    const idx = receipts.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    receipts[idx] = {
      ...receipts[idx],
      status: 'confirmed',
      approvedBy: 'Nguyễn Văn B',
      approvedAt: new Date().toISOString(),
    }
    return HttpResponse.json<ApiResponse<Receipt>>({ statusCode: 200, message: 'Xác nhận thành công', data: receipts[idx] })
  }),

  http.patch(`${BASE_URL}/receipts/:id/cancel`, ({ params }) => {
    const idx = receipts.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 })
    receipts[idx] = { ...receipts[idx], status: 'cancelled' }
    return HttpResponse.json<ApiResponse<Receipt>>({ statusCode: 200, message: 'Đã hủy', data: receipts[idx] })
  }),
]
