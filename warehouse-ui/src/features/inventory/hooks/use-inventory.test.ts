import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useInventory } from './use-inventory'
import type { InventoryItem } from '../types/inventory.types'

const mockItems: InventoryItem[] = [
  {
    materialId: 'mat-001',
    materialCode: 'NVL-001',
    materialName: 'Cam tươi',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 5,
    stockValue: 150_000,
    minThreshold: 20,
    maxThreshold: 200,
    status: 'low',
    supplierNames: ['Công ty TNHH Rau Quả Tươi'],
    nearExpiryBatchCount: 1,
  },
  {
    materialId: 'mat-002',
    materialCode: 'NVL-002',
    materialName: 'Đường kính trắng',
    category: 'main_ingredient',
    unit: 'kg',
    currentStock: 80,
    stockValue: 1_200_000,
    minThreshold: 30,
    maxThreshold: 150,
    status: 'normal',
    supplierNames: ['Công ty CP Đường Biên Hòa'],
    nearExpiryBatchCount: 0,
  },
]

const server = setupServer(
  http.get('http://localhost:3000/inventory', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: mockItems }),
  ),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useInventory', () => {
  it('fetches list on mount', async () => {
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].materialName).toBe('Cam tươi')
    expect(result.current.error).toBeNull()
  })

  it('sets error when fetch fails', async () => {
    server.use(
      http.get('http://localhost:3000/inventory', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).not.toBeNull()
    expect(result.current.items).toHaveLength(0)
  })
})
