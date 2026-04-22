import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { Material } from '@/features/materials/types/material.types'

const BASE_URL = 'http://localhost:3000'

type CreateMaterialBody = {
  name: string
  category: Material['category']
  baseUnitId: string
  minimumInventory: number
  maximumInventory: number
  supplierIds: string[]
}

let materials: Material[] = [
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
  {
    id: 'mat-002',
    code: 'NVL002',
    name: 'Sữa tươi',
    category: 'main_ingredient',
    baseUnitId: 'unit-003',
    baseUnit: { id: 'unit-003', name: 'Lít', symbol: 'l', type: 'volume' },
    minimumInventory: 20,
    maximumInventory: 200,
    supplierIds: ['sup-001', 'sup-002'],
    isActive: true,
  },
  {
    id: 'mat-003',
    code: 'NVL003',
    name: 'Cốc nhựa 16oz',
    category: 'packaging',
    baseUnitId: 'unit-005',
    baseUnit: { id: 'unit-005', name: 'Cái', symbol: 'cái', type: 'quantity' },
    minimumInventory: 100,
    maximumInventory: 1000,
    supplierIds: ['sup-003'],
    isActive: false,
  },
]

let codeCounter = 4

export const materialHandlers = [
  http.get(`${BASE_URL}/materials`, () => {
    const response: ApiResponse<Material[]> = { statusCode: 200, message: 'OK', data: materials }
    return HttpResponse.json(response)
  }),

  http.post(`${BASE_URL}/materials`, async ({ request }) => {
    const body = await request.json() as CreateMaterialBody
    const code = `NVL${String(codeCounter).padStart(3, '0')}`
    codeCounter++
    const newMaterial: Material = {
      ...body,
      id: `mat-${Date.now()}`,
      code,
      baseUnit: { id: body.baseUnitId, name: 'Đơn vị', symbol: '-', type: 'quantity' },
      isActive: true,
    }
    materials = [...materials, newMaterial]
    const response: ApiResponse<Material> = { statusCode: 201, message: 'Tạo thành công', data: newMaterial }
    return HttpResponse.json(response, { status: 201 })
  }),

  http.put(`${BASE_URL}/materials/:id`, async ({ request, params }) => {
    const exists = materials.some((m) => m.id === params.id)
    if (!exists) {
      return HttpResponse.json(
        { statusCode: 404, message: 'Không tìm thấy nguyên vật liệu' },
        { status: 404 },
      )
    }
    const body = await request.json() as Partial<Material>
    materials = materials.map((m) => (m.id === params.id ? { ...m, ...body } : m))
    const updated = materials.find((m) => m.id === params.id)!
    const response: ApiResponse<Material> = { statusCode: 200, message: 'Cập nhật thành công', data: updated }
    return HttpResponse.json(response)
  }),

  http.delete(`${BASE_URL}/materials/:id`, ({ params }) => {
    if (params.id === 'material-in-use') {
      return HttpResponse.json(
        { statusCode: 409, message: 'Nguyên vật liệu đang được sử dụng, không thể xóa' },
        { status: 409 },
      )
    }
    materials = materials.filter((m) => m.id !== params.id)
    const response: ApiResponse<void> = { statusCode: 200, message: 'Xóa thành công', data: undefined }
    return HttpResponse.json(response)
  }),
]
