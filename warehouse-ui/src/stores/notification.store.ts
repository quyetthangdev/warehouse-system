import { create } from 'zustand'

export type NotificationSeverity = 'critical' | 'warning' | 'info'

export interface Notification {
  id: string
  title: string
  message: string
  severity: NotificationSeverity
  createdAt: string
  isRead: boolean
}

interface NotificationState {
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  markRead: (id: string) => void
  unreadCount: () => number
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    })),

  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}))
