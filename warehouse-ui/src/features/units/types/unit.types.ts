export type UnitType = 'weight' | 'volume' | 'quantity'

export interface Unit {
  id: string
  name: string
  symbol: string
  type: UnitType
}

export interface CreateUnitRequest {
  name: string
  symbol: string
  type: UnitType
}

export type UpdateUnitRequest = CreateUnitRequest
