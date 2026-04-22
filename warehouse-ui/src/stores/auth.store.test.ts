import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ user: null, accessToken: null })
  })

  it('khởi đầu không có user', () => {
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('setUser cập nhật user', () => {
    const user = { id: '1', slug: 'a', fullName: 'Test', email: 'a@b.com', phoneNumber: '0900000000', role: 'manager' as const, isActive: true }
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().user?.fullName).toBe('Test')
  })

  it('hasPermission trả về true khi role khớp', () => {
    const user = { id: '1', slug: 'a', fullName: 'Test', email: 'a@b.com', phoneNumber: '0900000000', role: 'manager' as const, isActive: true }
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().hasPermission(['manager', 'admin'])).toBe(true)
  })

  it('hasPermission trả về false khi role không khớp', () => {
    const user = { id: '1', slug: 'a', fullName: 'Test', email: 'a@b.com', phoneNumber: '0900000000', role: 'supervisor' as const, isActive: true }
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().hasPermission(['manager', 'admin'])).toBe(false)
  })

  it('logout xóa user và token', () => {
    const user = { id: '1', slug: 'a', fullName: 'Test', email: 'a@b.com', phoneNumber: '0900000000', role: 'manager' as const, isActive: true }
    useAuthStore.setState({ user, accessToken: 'token-abc' })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
