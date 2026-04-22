import { authHandlers } from './auth.handler'
import { notificationHandlers } from './notification.handler'
import { dashboardHandlers } from './dashboard.handler'

export const handlers = [...authHandlers, ...notificationHandlers, ...dashboardHandlers]
