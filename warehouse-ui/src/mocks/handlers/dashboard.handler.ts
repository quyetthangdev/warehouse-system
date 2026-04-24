import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { DashboardData } from '@/features/dashboard/types/dashboard.types'
import { mockDashboardData } from '@/features/dashboard/mocks/dashboard.mock'

const BASE_URL = 'http://localhost:3000'

function makeDateLabel(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

function seedRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export const dashboardHandlers = [
  http.get(`${BASE_URL}/dashboard`, ({ request }) => {
    const url = new URL(request.url)
    const days = Math.min(Math.max(Number(url.searchParams.get('days')) || 7, 1), 90)

    const rand = seedRand(days * 31337)
    const importChart = Array.from({ length: days }, (_, i) => ({
      date: makeDateLabel(days - 1 - i),
      value: Math.floor(rand() * 8_000_000) + 1_000_000,
    }))
    const exportChart = Array.from({ length: days }, (_, i) => ({
      date: makeDateLabel(days - 1 - i),
      value: Math.floor(rand() * 5_000_000) + 500_000,
    }))

    const data: DashboardData = { ...mockDashboardData, importChart, exportChart }
    const response: ApiResponse<DashboardData> = { statusCode: 200, message: 'OK', data }
    return HttpResponse.json(response)
  }),
]
