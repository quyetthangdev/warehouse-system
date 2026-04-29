import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { usePayments } from './use-payments'
import type { Payment, Receipt } from '../types/payment.types'

const mockPayment: Payment = {
  id: 'pc-001',
  code: 'PC-2025-001',
  createdAt: '2025-12-22T10:00:00Z',
  paymentDate: '2025-12-22',
  paymentType: 'material_purchase',
  amountBeforeVat: 1500000,
  vatPercent: 10,
  vatAmount: 150000,
  totalAmount: 1650000,
  paymentTerms: 'direct',
  paymentMethod: 'transfer',
  createdBy: 'Nguyễn Văn A',
  status: 'draft',
}

const mockReceipt: Receipt = {
  id: 'pt-001',
  code: 'PT-2025-001',
  createdAt: '2025-12-23T14:00:00Z',
  receiptDate: '2025-12-23',
  receiptType: 'refund',
  amountBeforeVat: 500000,
  vatPercent: 0,
  vatAmount: 0,
  totalAmount: 500000,
  receiptMethod: 'transfer',
  createdBy: 'Nguyễn Văn A',
  reason: 'Hoàn tiền hàng lỗi',
  status: 'draft',
}

const server = setupServer(
  http.get('http://localhost:3000/payments', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: [mockPayment] }),
  ),
  http.get('http://localhost:3000/receipts', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: [mockReceipt] }),
  ),
  http.post('http://localhost:3000/payments', () =>
    HttpResponse.json({ statusCode: 201, message: 'Tạo thành công', data: { ...mockPayment, id: 'pc-new' } }, { status: 201 }),
  ),
  http.post('http://localhost:3000/receipts', () =>
    HttpResponse.json({ statusCode: 201, message: 'Tạo thành công', data: { ...mockReceipt, id: 'pt-new' } }, { status: 201 }),
  ),
  http.patch('http://localhost:3000/payments/pc-001/confirm', () =>
    HttpResponse.json({ statusCode: 200, message: 'Xác nhận thành công', data: { ...mockPayment, status: 'confirmed' } }),
  ),
  http.patch('http://localhost:3000/payments/pc-001/cancel', () =>
    HttpResponse.json({ statusCode: 200, message: 'Đã hủy', data: { ...mockPayment, status: 'cancelled' } }),
  ),
  http.patch('http://localhost:3000/receipts/pt-001/confirm', () =>
    HttpResponse.json({ statusCode: 200, message: 'Xác nhận thành công', data: { ...mockReceipt, status: 'confirmed' } }),
  ),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('usePayments', () => {
  it('fetches payments and receipts on mount', async () => {
    const { result } = renderHook(() => usePayments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.payments).toHaveLength(1)
    expect(result.current.payments[0].code).toBe('PC-2025-001')
    expect(result.current.receipts).toHaveLength(1)
    expect(result.current.receipts[0].code).toBe('PT-2025-001')
    expect(result.current.error).toBeNull()
  })

  it('sets error when payments fetch fails', async () => {
    server.use(
      http.get('http://localhost:3000/payments', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => usePayments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).not.toBeNull()
  })

  it('createPayment returns ok:true on success', async () => {
    const { result } = renderHook(() => usePayments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => {
      res = await result.current.createPayment({
        paymentDate: '2025-12-25',
        paymentType: 'transport',
        amountBeforeVat: 300000,
        vatPercent: 0,
        paymentTerms: 'direct',
        paymentMethod: 'cash',
      })
    })
    expect(res.ok).toBe(true)
  })

  it('confirmPayment returns ok:true on success', async () => {
    const { result } = renderHook(() => usePayments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => {
      res = await result.current.confirmPayment('pc-001')
    })
    expect(res.ok).toBe(true)
  })

  it('cancelPayment returns ok:true on success', async () => {
    const { result } = renderHook(() => usePayments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => {
      res = await result.current.cancelPayment('pc-001')
    })
    expect(res.ok).toBe(true)
  })

  it('createReceipt returns ok:true on success', async () => {
    const { result } = renderHook(() => usePayments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => {
      res = await result.current.createReceipt({
        receiptDate: '2025-12-25',
        receiptType: 'scrap',
        amountBeforeVat: 100000,
        vatPercent: 0,
        receiptMethod: 'cash',
        reason: 'Bán bao bì cũ',
      })
    })
    expect(res.ok).toBe(true)
  })

  it('confirmReceipt returns ok:true on success', async () => {
    const { result } = renderHook(() => usePayments())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => {
      res = await result.current.confirmReceipt('pt-001')
    })
    expect(res.ok).toBe(true)
  })
})
