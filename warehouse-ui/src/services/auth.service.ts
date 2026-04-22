import { api } from './axios.instance'
import type { ApiResponse } from '@/types/api.types'
import type { AuthTokens, LoginRequest, LoginResponse, User } from '@/types/auth.types'

export const authService = {
  login(payload: LoginRequest) {
    return api.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  },

  refresh(refreshToken: string) {
    return api.post<ApiResponse<{ tokens: AuthTokens }>>('/auth/refresh', { refreshToken })
  },

  getMe() {
    return api.get<ApiResponse<User>>('/auth/me')
  },

  logout() {
    return api.post('/auth/logout')
  },
}
