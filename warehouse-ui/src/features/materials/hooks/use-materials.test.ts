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
  http.put('http://localhost:3000/materials/:id', async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: { id: params.id, code: 'NVL001', ...body, isActive: true },
    })
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

  it('createMaterial trả về ok=true khi thành công', async () => {
    const { result } = renderHook(() => useMaterials())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.createMaterial({
        name: 'Sữa tươi',
        category: 'main_ingredient',
        baseUnitId: 'unit-003',
        minimumInventory: 20,
        maximumInventory: 200,
        supplierIds: [],
        isExpiry: false,
      })
    })
    expect(res!.ok).toBe(true)
  })

  it('updateMaterial trả về ok=true khi thành công', async () => {
    const { result } = renderHook(() => useMaterials())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.updateMaterial('mat-001', {
        name: 'Cà phê Arabica cập nhật',
        category: 'main_ingredient',
        baseUnitId: 'unit-001',
        minimumInventory: 10,
        maximumInventory: 100,
        supplierIds: ['sup-001'],
        isExpiry: true,
      })
    })
    expect(res!.ok).toBe(true)
  })

  it('removeMaterial với id đang dùng trả về ok=false và message chính xác', async () => {
    const { result } = renderHook(() => useMaterials())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string }
    await act(async () => {
      res = await result.current.removeMaterial('material-in-use')
    })
    expect(res!.ok).toBe(false)
    expect(res!.message).toBe('Đang được sử dụng')
  })
})
