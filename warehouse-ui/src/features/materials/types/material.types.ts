import type { Unit } from '@/features/units/types/unit.types'

export type MaterialCategory =
  | 'main_ingredient'
  | 'supporting'
  | 'packaging'
  | 'consumable'
  | 'spare_part'

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
}

export interface CreateMaterialRequest {
  name: string
  category: MaterialCategory
  baseUnitId: string
  minimumInventory: number
  maximumInventory: number
  supplierIds: string[]
}

export type UpdateMaterialRequest = CreateMaterialRequest
