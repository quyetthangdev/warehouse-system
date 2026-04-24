import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useExportForms } from './use-export-forms'
import type { ExportForm } from '../types/export-form.types'

const mockForms: ExportForm[] = [
  {
    id: 'px-001',
    code: 'PX-2025-001',
    exportType: 'production',
    exportDate: '2025-12-22',
    exportedBy: 'Nguyễn Văn A',
    status: 'draft',
    createdBy: 'Nguyễn Văn A',
    createdAt: '2025-12-22T07:00:00Z',
    items: [],
  },
]

const server = setupServer(
  http.get('http://localhost:3000/export-forms', () =>
    HttpResponse.json({ statusCode: 200, message: 'OK', data: mockForms }),
  ),
  http.post('http://localhost:3000/export-forms', () =>
    HttpResponse.json({ statusCode: 201, message: 'Tạo thành công', data: { ...mockForms[0], id: 'px-new' } }, { status: 201 }),
  ),
  http.post('http://localhost:3000/export-forms/px-001/cancel', () =>
    HttpResponse.json({ statusCode: 200, message: 'Đã hủy phiếu', data: { ...mockForms[0], status: 'cancelled' } }),
  ),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useExportForms', () => {
  it('fetches list on mount', async () => {
    const { result } = renderHook(() => useExportForms())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.forms).toHaveLength(1)
    expect(result.current.forms[0].code).toBe('PX-2025-001')
    expect(result.current.error).toBeNull()
  })

  it('sets error when fetch fails', async () => {
    server.use(
      http.get('http://localhost:3000/export-forms', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useExportForms())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).not.toBeNull()
    expect(result.current.forms).toHaveLength(0)
  })

  it('createForm returns ok:true on success', async () => {
    const { result } = renderHook(() => useExportForms())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => {
      res = await result.current.createForm({
        exportType: 'production',
        exportDate: '2025-12-22',
        items: [],
      })
    })
    expect(res.ok).toBe(true)
  })

  it('cancelForm returns ok:true on success', async () => {
    const { result } = renderHook(() => useExportForms())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let res: { ok: boolean; message?: string } = { ok: false }
    await act(async () => {
      res = await result.current.cancelForm('px-001')
    })
    expect(res.ok).toBe(true)
  })
})
