import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { InventoryItem, InventoryDetail } from '@/features/inventory/types/inventory.types'
import { mockInventoryItems, mockInventoryDetail } from '@/features/inventory/mocks/inventory.mock'

const BASE_URL = 'http://localhost:3000'

export const inventoryHandlers = [
  http.get(`${BASE_URL}/inventory`, () => {
    const response: ApiResponse<InventoryItem[]> = {
      statusCode: 200,
      message: 'OK',
      data: mockInventoryItems,
    }
    return HttpResponse.json(response)
  }),

  http.get(`${BASE_URL}/inventory/:materialId`, ({ params }) => {
    const item = mockInventoryItems.find((i) => i.materialId === params.materialId)
    if (!item) {
      return HttpResponse.json(
        { statusCode: 404, message: 'Không tìm thấy nguyên vật liệu' },
        { status: 404 },
      )
    }
    const detail: InventoryDetail =
      params.materialId === mockInventoryDetail.materialId
        ? mockInventoryDetail
        : { ...item, movementChart: [], transactions: [], batches: [] }
    const response: ApiResponse<InventoryDetail> = {
      statusCode: 200,
      message: 'OK',
      data: detail,
    }
    return HttpResponse.json(response)
  }),
]
