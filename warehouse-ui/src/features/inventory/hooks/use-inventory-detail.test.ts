import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useInventoryDetail } from './use-inventory-detail'
import type { InventoryDetail } from '../types/inventory.types'

const mockDetail: InventoryDetail = {
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
  movementChart: [{ date: '2026-04-01', import: 30, export: 15, balance: 0 }],
  transactions: [
    {
      id: 'tx-001',
      date: '2026-04-22',
      type: 'import',
      quantity: 30,
      stockBefore: 0,
      stockAfter: 30,
      userName: 'Nguyễn Văn A',
      referenceId: 'PN-2026-001',
      referenceType: 'import',
    },
  ],
  batches: [
    {
      id: 'batch-001',
      batchNumber: 'LOT-20260101',
      quantity: 5,
      mfgDate: '2026-01-01',
      expiryDate: '2026-05-01',
      supplierName: 'Công ty TNHH Rau Quả Tươi',
      importFormId: 'PN-2026-001',
    },
  ],
}

const server = setupServer(
  http.get('http://localhost:3000/inventory/:materialId', ({ params }) => {
    if (params.materialId === 'mat-001') {
      return HttpResponse.json({ statusCode: 200, message: 'OK', data: mockDetail })
    }
    return HttpResponse.json(
      { statusCode: 404, message: 'Không tìm thấy nguyên vật liệu' },
      { status: 404 },
    )
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useInventoryDetail', () => {
  it('fetches detail by materialId', async () => {
    const { result } = renderHook(() => useInventoryDetail('mat-001'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.detail).not.toBeNull()
    expect(result.current.detail?.materialName).toBe('Cam tươi')
    expect(result.current.detail?.transactions).toHaveLength(1)
    expect(result.current.detail?.batches).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('sets error for unknown materialId (404)', async () => {
    const { result } = renderHook(() => useInventoryDetail('mat-999'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Không tìm thấy nguyên vật liệu')
    expect(result.current.detail).toBeNull()
  })
})
