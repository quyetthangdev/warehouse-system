// src/features/inventory/types/inventory.types.ts
import type { MaterialCategory } from '@/features/materials/types/material.types'

export type StockStatus = 'out' | 'low' | 'normal' | 'high'
export type TransactionType = 'import' | 'export' | 'balance'

export interface InventoryItem {
  materialId: string
  materialCode: string
  materialName: string
  category: MaterialCategory
  unit: string // denormalized symbol (e.g. "kg", "l") — not a unit id
  currentStock: number
  stockValue: number
  minThreshold: number
  maxThreshold: number
  status: StockStatus
  supplierNames: string[]
  nearExpiryBatchCount: number
}

export interface StockTransaction {
  id: string
  date: string             // ISO 8601
  type: TransactionType
  quantity: number         // positive = import, negative = export
  stockBefore: number
  stockAfter: number
  userName: string
  referenceId: string      // e.g. "PN-2026-001"
  referenceType: TransactionType
}

export interface StockBatch {
  id: string
  batchNumber: string
  quantity: number
  mfgDate: string          // ISO 8601
  expiryDate: string       // ISO 8601
  supplierName: string
  importFormId: string
}

export interface MovementPoint {
  date: string             // ISO 8601 date string (YYYY-MM-DD)
  import: number
  export: number
  balance: number
}

export interface InventoryDetail extends InventoryItem {
  movementChart: MovementPoint[]
  transactions: StockTransaction[]
  batches: StockBatch[]
}
