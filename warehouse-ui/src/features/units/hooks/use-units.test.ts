// warehouse-ui/src/features/units/hooks/use-units.test.ts
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useUnits } from './use-units'

const mockUnits = [
  { id: 'unit-001', name: 'Kilogram', symbol: 'kg', type: 'weight' },
  { id: 'unit-002', name: 'Lít', symbol: 'l', type: 'volume' },
]

const server = setupServer(
  http.get('http://localhost:3000/units', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: mockUnits }),
  ),
  http.post('http://localhost:3000/units', async ({ request }) => {
    const body = await request.json() as { name: string; symbol: string; type: string }
    return HttpResponse.json(
      { statusCode: 201, message: 'OK', data: { id: 'new-id', ...body } },
      { status: 201 },
    )
  }),
  http.put('http://localhost:3000/units/:id', async ({ request, params }) => {
    const body = await request.json() as { name: string; symbol: string; type: string }
    return HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: { id: params.id, ...body },
    })
  }),
  http.delete('http://localhost:3000/units/:id', ({ params }) => {
    if (params.id === 'unit-in-use') {
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

describe('useUnits', () => {
  it('fetch danh sách thành công', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.units).toHaveLength(2)
    expect(result.current.units[0].name).toBe('Kilogram')
  })

  it('createUnit trả về ok=true khi thành công', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.createUnit({ name: 'Gram', symbol: 'g', type: 'weight' })
    })
    expect(res!.ok).toBe(true)
  })

  it('updateUnit trả về ok=true khi thành công', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.updateUnit('unit-001', { name: 'Kilogram cập nhật', symbol: 'kg', type: 'weight' })
    })
    expect(res!.ok).toBe(true)
  })

  it('removeUnit với id đang dùng trả về ok=false và message chính xác', async () => {
    const { result } = renderHook(() => useUnits())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.removeUnit('unit-in-use')
    })
    expect(res!.ok).toBe(false)
    expect(res!.message).toBe('Đang được sử dụng')
  })
})
