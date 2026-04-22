export type UserRole = 'admin' | 'manager' | 'supervisor'

export interface User {
  id: string
  slug: string
  fullName: string
  email: string
  phoneNumber: string
  role: UserRole
  isActive: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}
