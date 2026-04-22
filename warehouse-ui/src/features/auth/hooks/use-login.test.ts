import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useLogin } from './use-login'
import { useAuthStore } from '@/stores/auth.store'

// Mock useNavigate — react-router-dom is not available in test env
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

const server = setupServer(
  http.post('http://localhost:3000/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    if (body.email === 'admin@trendcoffee.vn' && body.password === 'password123') {
      return HttpResponse.json({
        statusCode: 200,
        message: 'OK',
        data: {
          user: { id: '1', slug: 'a', fullName: 'Admin', email: 'admin@trendcoffee.vn', phoneNumber: '0900000000', role: 'manager', isActive: true },
          tokens: { accessToken: 'acc-token', refreshToken: 'ref-token' },
        },
      })
    }
    return HttpResponse.json({ statusCode: 401, message: 'Sai thông tin' }, { status: 401 })
  }),
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
  useAuthStore.setState({ user: null, accessToken: null })
})
afterAll(() => server.close())

describe('useLogin', () => {
  it('login thành công cập nhật auth store', async () => {
    const { result } = renderHook(() => useLogin())
    await act(async () => {
      await result.current.login({ email: 'admin@trendcoffee.vn', password: 'password123' })
    })
    await waitFor(() => {
      expect(useAuthStore.getState().user?.email).toBe('admin@trendcoffee.vn')
    })
  })

  it('login thất bại trả về error message', async () => {
    const { result } = renderHook(() => useLogin())
    await act(async () => {
      await result.current.login({ email: 'wrong@email.com', password: 'wrongpass' })
    })
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })
})
