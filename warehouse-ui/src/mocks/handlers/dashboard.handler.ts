import { http, HttpResponse } from 'msw'
import { mockDashboardData } from '@/features/dashboard/mocks/dashboard.mock'

const BASE_URL = 'http://localhost:3000'

export const dashboardHandlers = [
  http.get(`${BASE_URL}/dashboard`, () => {
    return HttpResponse.json({ statusCode: 200, message: 'OK', data: mockDashboardData })
  }),
]
