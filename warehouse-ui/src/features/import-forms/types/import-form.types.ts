export type ImportFormStatus = 'draft' | 'confirmed' | 'cancelled'

export interface ImportFormItem {
  id: string
  materialId: string
  materialName: string
  unit: string
  quantity: number
  batchNumber?: string
  mfgDate?: string
  expiryDate?: string
  note?: string
}

export interface ImportForm {
  id: string
  code: string
  supplierId: string
  supplierName: string
  warehouseId?: string
  warehouseName?: string
  invoiceNumber: string
  poNumber?: string
  importDate: string
  importType?: string
  note?: string
  invoiceImageName?: string
  attachmentNames?: string[]
  status: ImportFormStatus
  requestedBy: string
  approvedBy?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
  items: ImportFormItem[]
}
