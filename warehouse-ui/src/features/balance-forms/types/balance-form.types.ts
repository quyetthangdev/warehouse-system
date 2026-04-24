export type BalanceFormStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled'
export type BalanceType = 'periodic' | 'unplanned'
export type BalanceScope = 'full' | 'partial'
export type DiscrepancyReason =
  | 'loss_in_use'
  | 'recording_error'
  | 'unrecorded_damage'
  | 'natural_loss'
  | 'counting_error'
  | 'other'

export interface BalanceFormItem {
  id: string
  materialId: string
  materialName: string
  unit: string
  systemQuantity: number
  actualQuantity: number | null
  discrepancy: number | null
  discrepancyPercent: number | null
  reason?: DiscrepancyReason
  reasonText?: string
  note?: string
}

export interface BalanceForm {
  id: string
  code: string
  balanceType: BalanceType
  scope: BalanceScope
  status: BalanceFormStatus
  balanceDate: string
  createdBy: string
  inspectors: string[]
  note?: string
  attachmentNames?: string[]
  items: BalanceFormItem[]
  createdAt: string
  completedAt?: string
  completedBy?: string
}
