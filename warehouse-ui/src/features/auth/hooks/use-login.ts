import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginFormValues } from '../schemas/login.schema'

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser, setTokens } = useAuthStore()
  const navigate = useNavigate()

  async function login(values: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await authService.login(values)
      setUser(res.data.user)
      setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Đăng nhập thất bại'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
