import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types/auth.types'

interface AuthState {
  user: User | null
  accessToken: string | null
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
  hasPermission: (roles: UserRole[]) => boolean
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({ accessToken })
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null })
      },

      hasPermission: (roles) => {
        const { user } = get()
        if (!user) return false
        return roles.includes(user.role)
      },

      isAuthenticated: () => {
        const { user, accessToken } = get()
        return !!user && !!accessToken
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
)
