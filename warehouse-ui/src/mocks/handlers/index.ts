import { authHandlers } from './auth.handler'
import { notificationHandlers } from './notification.handler'
import { dashboardHandlers } from './dashboard.handler'
import { unitHandlers } from './unit.handler'
import { supplierHandlers } from './supplier.handler'
import { materialHandlers } from './material.handler'
import { inventoryHandlers } from './inventory.handler'
import { importFormHandlers } from './import-form.handler'

export const handlers = [
  ...authHandlers,
  ...notificationHandlers,
  ...dashboardHandlers,
  ...unitHandlers,
  ...supplierHandlers,
  ...materialHandlers,
  ...inventoryHandlers,
  ...importFormHandlers,
]
