import type { Payment } from './types/payment.types'

export type DebtWarning = {
  id: string
  code: string
  dueDate: string
  type: 'overdue' | 'due_soon'
}

export function getDebtWarnings(payments: Payment[]): DebtWarning[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)

  return payments
    .filter((p) => p.status === 'draft' && p.paymentTerms === 'debt' && !!p.dueDate)
    .flatMap((p): DebtWarning[] => {
      const due = new Date(p.dueDate!)
      due.setHours(0, 0, 0, 0)
      if (due < today) {
        return [{ id: p.id, code: p.code, dueDate: p.dueDate!, type: 'overdue' }]
      }
      if (due <= sevenDaysLater) {
        return [{ id: p.id, code: p.code, dueDate: p.dueDate!, type: 'due_soon' }]
      }
      return []
    })
}
