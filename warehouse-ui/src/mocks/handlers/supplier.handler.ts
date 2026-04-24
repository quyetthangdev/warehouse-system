import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { Supplier } from '@/features/suppliers/types/supplier.types'

const BASE_URL = 'http://localhost:3000'

let suppliers: Supplier[] = [
  {
    id: 'sup-001',
    code: 'NCC001',
    name: 'Công ty TNHH Cà Phê Việt',
    contactPerson: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an@caphe-viet.com',
    location: 'TP. Hồ Chí Minh',
    taxCode: '0123456789',
    websiteUrl: 'https://www.capheviet.com',
    paymentTerms: '30_days',
    isActive: true,
  },
  {
    id: 'sup-002',
    code: 'NCC002',
    name: 'HTX Nông sản Đà Lạt',
    contactPerson: 'Trần Thị Bình',
    phone: '0912345678',
    email: 'binh@nongsan-dalat.vn',
    location: 'Đà Lạt, Lâm Đồng',
    taxCode: '9876543210',
    websiteUrl: 'https://nongsandalat.vn',
    paymentTerms: '15_days',
    isActive: true,
  },
  {
    id: 'sup-003',
    code: 'NCC003',
    name: 'Công ty Bao Bì Xanh',
    contactPerson: 'Lê Minh Cường',
    phone: '0923456789',
    email: 'cuong@baobixa.vn',
    location: 'Hà Nội',
    taxCode: '1234567890',
    paymentTerms: 'cod',
    isActive: false,
  },
]

export const supplierHandlers = [
  http.get(`${BASE_URL}/suppliers`, () => {
    const response: ApiResponse<Supplier[]> = { statusCode: 200, message: 'OK', data: suppliers }
    return HttpResponse.json(response)
  }),

  http.post(`${BASE_URL}/suppliers`, async ({ request }) => {
    const body = await request.json() as Omit<Supplier, 'id' | 'isActive'>
    const newSupplier: Supplier = { ...body, id: `sup-${Date.now()}`, isActive: true }
    suppliers = [...suppliers, newSupplier]
    const response: ApiResponse<Supplier> = { statusCode: 201, message: 'Tạo thành công', data: newSupplier }
    return HttpResponse.json(response, { status: 201 })
  }),

  http.put(`${BASE_URL}/suppliers/:id`, async ({ request, params }) => {
    const exists = suppliers.some((s) => s.id === params.id)
    if (!exists) {
      return HttpResponse.json(
        { statusCode: 404, message: 'Không tìm thấy nhà cung cấp' },
        { status: 404 },
      )
    }
    const body = await request.json() as Omit<Supplier, 'id' | 'isActive'>
    suppliers = suppliers.map((s) => (s.id === params.id ? { ...s, ...body } : s))
    const updated = suppliers.find((s) => s.id === params.id)!
    const response: ApiResponse<Supplier> = { statusCode: 200, message: 'Cập nhật thành công', data: updated }
    return HttpResponse.json(response)
  }),

  http.delete(`${BASE_URL}/suppliers/:id`, ({ params }) => {
    if (params.id === 'supplier-in-use') {
      return HttpResponse.json(
        { statusCode: 409, message: 'Nhà cung cấp đang được liên kết với nguyên vật liệu, không thể xóa' },
        { status: 409 },
      )
    }
    suppliers = suppliers.filter((s) => s.id !== params.id)
    const response: ApiResponse<void> = { statusCode: 200, message: 'Xóa thành công', data: undefined }
    return HttpResponse.json(response)
  }),
]
