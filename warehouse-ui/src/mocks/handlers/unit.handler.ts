import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { Unit } from '@/features/units/types/unit.types'

const BASE_URL = 'http://localhost:3000'

let units: Unit[] = [
  { id: 'unit-001', name: 'Kilogram', symbol: 'kg', type: 'weight' },
  { id: 'unit-002', name: 'Gram', symbol: 'g', type: 'weight' },
  { id: 'unit-003', name: 'Lít', symbol: 'l', type: 'volume' },
  { id: 'unit-004', name: 'Mililít', symbol: 'ml', type: 'volume' },
  { id: 'unit-005', name: 'Cái', symbol: 'cái', type: 'quantity' },
]

export const unitHandlers = [
  http.get(`${BASE_URL}/units`, () => {
    const response: ApiResponse<Unit[]> = { statusCode: 200, message: 'OK', data: units }
    return HttpResponse.json(response)
  }),

  http.post(`${BASE_URL}/units`, async ({ request }) => {
    const body = await request.json() as Omit<Unit, 'id'>
    const newUnit: Unit = { ...body, id: `unit-${Date.now()}` }
    units = [...units, newUnit]
    const response: ApiResponse<Unit> = { statusCode: 201, message: 'Tạo thành công', data: newUnit }
    return HttpResponse.json(response, { status: 201 })
  }),

  http.put(`${BASE_URL}/units/:id`, async ({ request, params }) => {
    const exists = units.some((u) => u.id === params.id)
    if (!exists) {
      return HttpResponse.json(
        { statusCode: 404, message: 'Không tìm thấy đơn vị' },
        { status: 404 },
      )
    }
    const body = await request.json() as Omit<Unit, 'id'>
    units = units.map((u) => (u.id === params.id ? { ...u, ...body } : u))
    const updated = units.find((u) => u.id === params.id)!
    const response: ApiResponse<Unit> = { statusCode: 200, message: 'Cập nhật thành công', data: updated }
    return HttpResponse.json(response)
  }),

  http.delete(`${BASE_URL}/units/:id`, ({ params }) => {
    if (params.id === 'unit-in-use') {
      return HttpResponse.json(
        { statusCode: 409, message: 'Đơn vị đang được sử dụng, không thể xóa' },
        { status: 409 },
      )
    }
    units = units.filter((u) => u.id !== params.id)
    const response: ApiResponse<void> = { statusCode: 200, message: 'Xóa thành công', data: undefined }
    return HttpResponse.json(response)
  }),
]
