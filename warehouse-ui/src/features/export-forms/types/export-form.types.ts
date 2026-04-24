export type ExportFormStatus = 'draft' | 'confirmed' | 'cancelled'

export type ExportType = 'production' | 'disposal' | 'transfer' | 'other'

export type DisposalReason = 'expired' | 'damaged' | 'contaminated' | 'other'

export interface ExportFormItem {
  id: string
  materialId: string
  materialName: string
  unit: string
  quantity: number
  expiryDate: string
  note?: string
}

export interface ExportForm {
  id: string
  code: string
  exportType: ExportType
  exportDate: string
  exportedBy: string
  status: ExportFormStatus
  approvedBy?: string
  recipient?: string
  note?: string
  attachmentNames?: string[]
  // disposal-specific
  disposalReason?: DisposalReason
  disposalReasonText?: string
  // transfer-specific
  destinationWarehouseId?: string
  destinationWarehouseName?: string
  // other-specific
  customReason?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
  items: ExportFormItem[]
}
