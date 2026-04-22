import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { Notification } from '@/stores/notification.store'

const BASE_URL = 'http://localhost:3000'

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    title: 'Tồn kho thấp',
    message: 'Cà phê Arabica còn 2kg, dưới mức tối thiểu (5kg)',
    severity: 'critical',
    createdAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: 'notif-002',
    title: 'Sắp hết hạn',
    message: 'Sữa tươi Vinamilk hết hạn trong 3 ngày',
    severity: 'warning',
    createdAt: new Date().toISOString(),
    isRead: false,
  },
  {
    id: 'notif-003',
    title: 'Nhập kho thành công',
    message: 'Đã nhập 50kg đường vào kho',
    severity: 'info',
    createdAt: new Date().toISOString(),
    isRead: true,
  },
]

export const notificationHandlers = [
  http.get(`${BASE_URL}/notifications`, () => {
    const response: ApiResponse<Notification[]> = {
      statusCode: 200,
      message: 'OK',
      data: mockNotifications,
    }
    return HttpResponse.json(response)
  }),

  http.patch(`${BASE_URL}/notifications/:id/read`, ({ params }) => {
    const response: ApiResponse<{ id: string }> = {
      statusCode: 200,
      message: 'Đã đánh dấu đã đọc',
      data: { id: params.id as string },
    }
    return HttpResponse.json(response)
  }),
]
