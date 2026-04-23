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
  http.put('http://localhost:3000/suppliers/:id', async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: { id: params.id, ...body, isActive: true },
    })
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

  it('createSupplier trả về ok=true khi thành công', async () => {
    const { result } = renderHook(() => useSuppliers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.createSupplier({
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
    expect(res!.ok).toBe(true)
  })

  it('updateSupplier trả về ok=true khi thành công', async () => {
    const { result } = renderHook(() => useSuppliers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.updateSupplier('sup-001', {
        code: 'NCC001',
        name: 'Cập nhật tên',
        contactPerson: 'Nguyễn Văn An',
        phone: '0901234567',
        email: 'an@caphe-viet.com',
        location: 'TP. Hồ Chí Minh',
        taxCode: '0123456789',
        paymentTerms: '30_days',
      })
    })
    expect(res!.ok).toBe(true)
  })

  it('removeSupplier đang liên kết trả về ok=false và message chính xác', async () => {
    const { result } = renderHook(() => useSuppliers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.removeSupplier('supplier-in-use')
    })
    expect(res!.ok).toBe(false)
    expect(res!.message).toBe('Đang được liên kết')
  })
})
