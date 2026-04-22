import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError, ApiResponse } from '@/types/api.types'
import type { AuthTokens } from '@/types/auth.types'

const BASE_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (!error.config) return Promise.reject(error)
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post<ApiResponse<{ tokens: AuthTokens }>>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
      )

      localStorage.setItem('accessToken', data.data.tokens.accessToken)
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken)

      processQueue(null, data.data.tokens.accessToken)
      originalRequest.headers.Authorization = `Bearer ${data.data.tokens.accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
