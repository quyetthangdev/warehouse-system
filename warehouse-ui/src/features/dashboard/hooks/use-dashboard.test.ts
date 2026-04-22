import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useDashboard } from './use-dashboard'
import { mockDashboardData } from '../mocks/dashboard.mock'

const server = setupServer(
  http.get('http://localhost:3000/dashboard', () => {
    return HttpResponse.json({ statusCode: 200, message: 'OK', data: mockDashboardData })
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useDashboard', () => {
  it('khởi đầu ở trạng thái loading', () => {
    const { result } = renderHook(() => useDashboard())
    expect(result.current.isLoading).toBe(true)
  })

  it('load dữ liệu thành công', async () => {
    const { result } = renderHook(() => useDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.stats.totalMaterials).toBe(48)
  })

  it('trả về error khi API fail', async () => {
    server.use(
      http.get('http://localhost:3000/dashboard', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeTruthy()
  })
})
