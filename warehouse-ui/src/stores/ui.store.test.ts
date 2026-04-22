import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from './ui.store'

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ sidebarCollapsed: false })
  })

  it('sidebar mặc định không collapsed', () => {
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
  })

  it('toggleSidebar đổi trạng thái', () => {
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarCollapsed).toBe(true)
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
  })
})
