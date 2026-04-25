import { useState, useEffect, useCallback } from 'react'
import { paymentService } from '@/services/payment.service'
import type { Payment, Receipt } from '../types/payment.types'
import type { PaymentValues, ReceiptValues } from '../schemas/payment.schema'

type MutationResult = { ok: boolean; message?: string }

function extractMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  )
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [{ data: paymentsData }, { data: receiptsData }] = await Promise.all([
        paymentService.getAllPayments(),
        paymentService.getAllReceipts(),
      ])
      setPayments(paymentsData.data)
      setReceipts(receiptsData.data)
    } catch {
      setError('Không thể tải dữ liệu thu chi')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const createPayment = useCallback(
    async (payload: PaymentValues): Promise<MutationResult> => {
      try {
        await paymentService.createPayment(payload)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        return { ok: false, message: extractMessage(err, 'Không thể tạo phiếu chi') }
      }
    },
    [fetchAll],
  )

  const confirmPayment = useCallback(
    async (id: string): Promise<MutationResult> => {
      try {
        await paymentService.confirmPayment(id)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        return { ok: false, message: extractMessage(err, 'Không thể xác nhận phiếu chi') }
      }
    },
    [fetchAll],
  )

  const cancelPayment = useCallback(
    async (id: string): Promise<MutationResult> => {
      try {
        await paymentService.cancelPayment(id)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        return { ok: false, message: extractMessage(err, 'Không thể hủy phiếu chi') }
      }
    },
    [fetchAll],
  )

  const createReceipt = useCallback(
    async (payload: ReceiptValues): Promise<MutationResult> => {
      try {
        await paymentService.createReceipt(payload)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        return { ok: false, message: extractMessage(err, 'Không thể tạo phiếu thu') }
      }
    },
    [fetchAll],
  )

  const confirmReceipt = useCallback(
    async (id: string): Promise<MutationResult> => {
      try {
        await paymentService.confirmReceipt(id)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        return { ok: false, message: extractMessage(err, 'Không thể xác nhận phiếu thu') }
      }
    },
    [fetchAll],
  )

  const cancelReceipt = useCallback(
    async (id: string): Promise<MutationResult> => {
      try {
        await paymentService.cancelReceipt(id)
        await fetchAll()
        return { ok: true }
      } catch (err: unknown) {
        return { ok: false, message: extractMessage(err, 'Không thể hủy phiếu thu') }
      }
    },
    [fetchAll],
  )

  return {
    payments,
    receipts,
    isLoading,
    error,
    refetch: fetchAll,
    createPayment,
    confirmPayment,
    cancelPayment,
    createReceipt,
    confirmReceipt,
    cancelReceipt,
  }
}
