import { authHandlers } from './auth.handler'
import { notificationHandlers } from './notification.handler'
import { dashboardHandlers } from './dashboard.handler'
import { unitHandlers } from './unit.handler'
import { supplierHandlers } from './supplier.handler'
import { materialHandlers } from './material.handler'
import { inventoryHandlers } from './inventory.handler'
import { importFormHandlers } from './import-form.handler'
import { exportFormHandlers } from './export-form.handler'
import { balanceFormHandlers } from './balance-form.handler'
import { paymentHandlers } from './payment.handler'

export const handlers = [
  ...authHandlers,
  ...notificationHandlers,
  ...dashboardHandlers,
  ...unitHandlers,
  ...supplierHandlers,
  ...materialHandlers,
  ...inventoryHandlers,
  ...importFormHandlers,
  ...exportFormHandlers,
  ...balanceFormHandlers,
  ...paymentHandlers,
]
