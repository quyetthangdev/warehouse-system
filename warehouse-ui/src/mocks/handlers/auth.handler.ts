import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { LoginResponse, User } from '@/types/auth.types'

const BASE_URL = 'http://localhost:3000'

const mockUser: User = {
  id: 'user-001',
  slug: 'admin-user',
  fullName: 'Nguyễn Văn Admin',
  email: 'admin@trendcoffee.vn',
  phoneNumber: '0901234567',
  role: 'admin',
  isActive: true,
}

export const authHandlers = [
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    if (body.email === 'admin@trendcoffee.vn' && body.password === 'password123') {
      const response: ApiResponse<LoginResponse> = {
        statusCode: 200,
        message: 'Đăng nhập thành công',
        data: {
          user: mockUser,
          tokens: {
            accessToken: 'mock-access-token-xyz',
            refreshToken: 'mock-refresh-token-xyz',
          },
        },
      }
      return HttpResponse.json(response)
    }

    return HttpResponse.json(
      { statusCode: 401, message: 'Email hoặc mật khẩu không đúng' },
      { status: 401 },
    )
  }),

  http.get(`${BASE_URL}/auth/me`, () => {
    const response: ApiResponse<User> = {
      statusCode: 200,
      message: 'OK',
      data: mockUser,
    }
    return HttpResponse.json(response)
  }),

  http.post(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ statusCode: 200, message: 'Đã đăng xuất' })
  }),
]
