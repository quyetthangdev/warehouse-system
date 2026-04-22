// warehouse-ui/src/features/units/hooks/use-units.ts
import { useState, useEffect, useCallback } from 'react'
import { unitService } from '@/services/unit.service'
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '../types/unit.types'

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await unitService.getAll()
      setUnits(res.data)
    } catch {
      setError('Không thể tải danh sách đơn vị')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function createUnit(payload: CreateUnitRequest): Promise<boolean> {
    try {
      await unitService.create(payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function updateUnit(id: string, payload: UpdateUnitRequest): Promise<boolean> {
    try {
      await unitService.update(id, payload)
      await fetchAll()
      return true
    } catch {
      return false
    }
  }

  async function removeUnit(id: string): Promise<{ ok: boolean; message?: string }> {
    try {
      await unitService.remove(id)
      await fetchAll()
      return { ok: true }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể xóa đơn vị'
      return { ok: false, message }
    }
  }

  return { units, isLoading, error, createUnit, updateUnit, removeUnit }
}
