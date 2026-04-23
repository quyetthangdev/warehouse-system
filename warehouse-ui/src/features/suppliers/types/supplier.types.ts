export type PaymentTerms = 'cod' | '7_days' | '15_days' | '30_days'

export interface Supplier {
  id: string
  code: string
  name: string
  contactPerson: string
  phone: string
  email: string
  location: string
  taxCode: string
  paymentTerms: PaymentTerms
  note?: string
  isActive: boolean
}

export interface CreateSupplierRequest {
  code: string
  name: string
  contactPerson: string
  phone: string
  email: string
  location: string
  taxCode: string
  paymentTerms: PaymentTerms
  note?: string
}

export type UpdateSupplierRequest = CreateSupplierRequest
