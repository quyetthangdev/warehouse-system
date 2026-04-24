import type { Unit } from '@/features/units/types/unit.types'

export type MaterialCategory =
  | 'main_ingredient'
  | 'supporting'
  | 'packaging'
  | 'consumable'
  | 'spare_part'

export interface UnitConversion {
  id: string
  fromQty: number
  fromUnitId: string
  toQty: number
  toUnitId: string
}

export interface Material {
  id: string
  code: string
  name: string
  category: MaterialCategory
  baseUnitId: string
  baseUnit: Unit
  minimumInventory: number
  maximumInventory: number
  supplierIds: string[]
  isActive: boolean
  batchCount: number
  nearestExpiryDate: string | null
  availableStock: number
  conversions: UnitConversion[]
}

export interface CreateMaterialRequest {
  name: string
  category: MaterialCategory
  baseUnitId: string
  minimumInventory: number
  maximumInventory: number
  supplierIds: string[]
  conversions?: UnitConversion[]
}

export type UpdateMaterialRequest = CreateMaterialRequest
