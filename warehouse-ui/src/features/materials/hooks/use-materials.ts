import { useState, useEffect, useCallback } from 'react'
import { materialService } from '@/services/material.service'
import type { Material, CreateMaterialRequest, UpdateMaterialRequest } from '../types/material.types'

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await materialService.getAll()
      setMaterials(res.data)
    } catch {
      setError('Không thể tải danh sách nguyên vật liệu')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const createMaterial = useCallback(
    async (payload: CreateMaterialRequest): Promise<{ ok: boolean; message?: string }> => {
      try {
        await materialService.create(payload)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không thể tạo nguyên vật liệu'
        return { ok: false, message }
      }
    },
    [fetchAll],
  )

  const updateMaterial = useCallback(
    async (id: string, payload: UpdateMaterialRequest): Promise<{ ok: boolean; message?: string }> => {
      try {
        await materialService.update(id, payload)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không thể cập nhật nguyên vật liệu'
        return { ok: false, message }
      }
    },
    [fetchAll],
  )

  const removeMaterial = useCallback(
    async (id: string): Promise<{ ok: boolean; message?: string }> => {
      try {
        await materialService.remove(id)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Không thể xóa nguyên vật liệu'
        return { ok: false, message }
      }
    },
    [fetchAll],
  )

  return { materials, isLoading, error, createMaterial, updateMaterial, removeMaterial }
}
