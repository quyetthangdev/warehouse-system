import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useBalanceForms } from './use-balance-forms'
import { mockBalanceForms } from '../mocks/balance-form.mock'

const server = setupServer(
  http.get('http://localhost:3000/balance-forms', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: mockBalanceForms }),
  ),
  http.post('http://localhost:3000/balance-forms', () =>
    HttpResponse.json({ statusCode: 201, message: 'Tạo thành công', data: mockBalanceForms[0] }, { status: 201 }),
  ),
  http.post('http://localhost:3000/balance-forms/:id/cancel', () =>
    HttpResponse.json({ statusCode: 200, message: 'Đã hủy', data: { ...mockBalanceForms[0], status: 'cancelled' } }),
  ),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useBalanceForms', () => {
  it('tải danh sách phiếu kiểm thành công', async () => {
    const { result } = renderHook(() => useBalanceForms())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.forms).toHaveLength(mockBalanceForms.length)
  })

  it('tạo phiếu kiểm thành công', async () => {
    const { result } = renderHook(() => useBalanceForms())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res!: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.createForm({
        balanceType: 'periodic',
        scope: 'full',
        balanceDate: '2026-04-24',
        inspectors: ['A', 'B'],
        items: [{ materialId: 'mat-001', materialName: 'Cam', unit: 'kg', systemQuantity: 10 }],
      })
    })
    expect(res.ok).toBe(true)
  })

  it('hủy phiếu kiểm thành công', async () => {
    const { result } = renderHook(() => useBalanceForms())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res!: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.cancelForm('pk-001')
    })
    expect(res.ok).toBe(true)
  })
})
