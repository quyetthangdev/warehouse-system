export type PaymentStatus = 'draft' | 'confirmed' | 'cancelled'

export type PaymentType =
  | 'material_purchase' // Mua NVL
  | 'transport'         // Vận chuyển NVL
  | 'loading'           // Bốc xếp
  | 'storage'           // Lưu kho
  | 'other'             // Chi phí khác

export type ReceiptType =
  | 'refund'            // Hoàn tiền từ NCC
  | 'compensation'      // Bồi thường từ NCC
  | 'liquidation'       // Thanh lý NVL
  | 'scrap'             // Thu phế liệu/bao bì
  | 'other'             // Thu khác

export type PaymentTerms = 'direct' | 'debt'
export type PaymentMethod = 'cash' | 'transfer' | 'card'
export type ReceiptMethod = 'cash' | 'transfer' | 'e_wallet'

export interface Payment {
  id: string
  code: string
  createdAt: string
  paymentDate: string
  paymentType: PaymentType
  amountBeforeVat: number
  vatPercent: number
  vatAmount: number
  totalAmount: number
  paymentTerms: PaymentTerms
  debtDays?: number
  dueDate?: string
  paymentMethod: PaymentMethod
  transferCode?: string
  supplierId?: string
  supplierName?: string
  importFormRef?: string
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  reason?: string
  note?: string
  status: PaymentStatus
  attachments?: string[]
}

export interface Receipt {
  id: string
  code: string
  createdAt: string
  receiptDate: string
  receiptType: ReceiptType
  amountBeforeVat: number
  vatPercent: number
  vatAmount: number
  totalAmount: number
  receiptMethod: ReceiptMethod
  transferCode?: string
  supplierId?: string
  supplierName?: string
  formRef?: string
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  reason: string
  note?: string
  status: PaymentStatus
  attachments?: string[]
}
