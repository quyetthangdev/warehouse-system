import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useBalanceFormDetail } from './use-balance-form-detail'
import { mockBalanceForms } from '../mocks/balance-form.mock'

const form = mockBalanceForms[1] // draft form (id: 'pk-002')

const server = setupServer(
  http.get(`http://localhost:3000/balance-forms/${form.id}`, () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: form }),
  ),
  http.post(`http://localhost:3000/balance-forms/${form.id}/start`, () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...form, status: 'in_progress' } }),
  ),
  http.post(`http://localhost:3000/balance-forms/${form.id}/complete`, () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...form, status: 'completed' } }),
  ),
  http.post(`http://localhost:3000/balance-forms/${form.id}/cancel`, () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: { ...form, status: 'cancelled' } }),
  ),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useBalanceFormDetail', () => {
  it('tải chi tiết phiếu thành công', async () => {
    const { result } = renderHook(() => useBalanceFormDetail(form.id))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.form?.code).toBe(form.code)
  })

  it('bắt đầu kiểm kho thành công', async () => {
    const { result } = renderHook(() => useBalanceFormDetail(form.id))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res!: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.startForm()
    })
    expect(res.ok).toBe(true)
  })

  it('hoàn thành kiểm kho thành công', async () => {
    const { result } = renderHook(() => useBalanceFormDetail(form.id))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res!: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.completeForm(form.items)
    })
    expect(res.ok).toBe(true)
  })

  it('hủy phiếu thành công', async () => {
    const { result } = renderHook(() => useBalanceFormDetail(form.id))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res!: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.cancelForm()
    })
    expect(res.ok).toBe(true)
  })
})
