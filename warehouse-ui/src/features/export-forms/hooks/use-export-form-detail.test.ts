import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useExportFormDetail } from './use-export-form-detail'
import type { ExportForm } from '../types/export-form.types'

const mockForm: ExportForm = {
  id: 'px-001',
  code: 'PX-2025-001',
  exportType: 'production',
  exportDate: '2025-12-22',
  exportedBy: 'Nguyễn Văn A',
  status: 'draft',
  createdBy: 'Nguyễn Văn A',
  createdAt: '2025-12-22T07:00:00Z',
  items: [],
}

const server = setupServer(
  http.get('http://localhost:3000/export-forms/px-001', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: mockForm }),
  ),
  http.post('http://localhost:3000/export-forms/px-001/confirm', () =>
    HttpResponse.json({ statusCode: 200, message: 'Đã xác nhận', data: { ...mockForm, status: 'confirmed' } }),
  ),
  http.post('http://localhost:3000/export-forms/px-001/cancel', () =>
    HttpResponse.json({ statusCode: 200, message: 'Đã hủy', data: { ...mockForm, status: 'cancelled' } }),
  ),
  http.post('http://localhost:3000/export-forms/px-001/items', () =>
    HttpResponse.json({ statusCode: 201, message: 'Thêm thành công', data: mockForm }, { status: 201 }),
  ),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useExportFormDetail', () => {
  it('fetches detail on mount', async () => {
    const { result } = renderHook(() => useExportFormDetail('px-001'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.form?.code).toBe('PX-2025-001')
    expect(result.current.error).toBeNull()
  })

  it('confirmForm returns ok:true', async () => {
    const { result } = renderHook(() => useExportFormDetail('px-001'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => { res = await result.current.confirmForm() })
    expect(res.ok).toBe(true)
  })

  it('cancelForm returns ok:true', async () => {
    const { result } = renderHook(() => useExportFormDetail('px-001'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => { res = await result.current.cancelForm() })
    expect(res.ok).toBe(true)
  })

  it('addItem returns ok:true', async () => {
    const { result } = renderHook(() => useExportFormDetail('px-001'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => {
      res = await result.current.addItem({
        materialId: 'mat-001', materialName: 'Cam tươi',
        unit: 'kg', quantity: 2, expiryDate: '2026-01-20',
      })
    })
    expect(res.ok).toBe(true)
  })
})
