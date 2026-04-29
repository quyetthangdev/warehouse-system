import { useState, useEffect } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { AppDialog, AppDialogFooter } from '@/components/common/app-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import { paymentTypeConfig, paymentStatusConfig, paymentMethodConfig } from '../payment.utils'
import { getDatePreset, DATE_PRESET_LABELS, type DatePreset } from '../payment-date-presets'
import { PAYMENT_FILTER_DEFAULT } from '../payment-filters'
import type { PaymentFilterState } from '../payment-filters'
import type { PaymentType, PaymentStatus, PaymentMethod } from '../types/payment.types'

interface PaymentFilterDialogProps {
  open: boolean
  filter: PaymentFilterState
  onApply: (filter: PaymentFilterState) => void
  onClose: () => void
}

export function PaymentFilterDialog({ open, filter, onApply, onClose }: PaymentFilterDialogProps) {
  const [draft, setDraft] = useState<PaymentFilterState>(filter)
  const { suppliers } = useSuppliers()

  useEffect(() => {
    if (open) setDraft(filter)
  }, [open, filter])

  function applyPreset(preset: DatePreset) {
    const { fromDate, toDate } = getDatePreset(preset)
    setDraft((d) => ({ ...d, fromDate, toDate, activePreset: preset }))
  }

  function handleApply() {
    onApply(draft)
    onClose()
  }

  function handleReset() {
    setDraft(PAYMENT_FILTER_DEFAULT)
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      icon={SlidersHorizontal}
      title="Bộ lọc phiếu chi"
      className="sm:max-w-md"
    >
      <div className="space-y-4">
        {/* Date section */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Khoảng thời gian
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(DATE_PRESET_LABELS) as DatePreset[]).map((p) => (
              <Button
                key={p}
                type="button"
                variant={draft.activePreset === p ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => applyPreset(p)}
              >
                {DATE_PRESET_LABELS[p]}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Từ ngày</Label>
              <input
                type="date"
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                value={draft.fromDate}
                onChange={(e) => setDraft((d) => ({ ...d, fromDate: e.target.value, activePreset: null }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Đến ngày</Label>
              <input
                type="date"
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                value={draft.toDate}
                onChange={(e) => setDraft((d) => ({ ...d, toDate: e.target.value, activePreset: null }))}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Filter selects */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Bộ lọc
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Loại chi</Label>
              <Select
                value={draft.type}
                onValueChange={(v) => setDraft((d) => ({ ...d, type: v as PaymentType | 'all' }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {(Object.entries(paymentTypeConfig) as [PaymentType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select
                value={draft.status}
                onValueChange={(v) => setDraft((d) => ({ ...d, status: v as PaymentStatus | 'all' }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {(Object.entries(paymentStatusConfig) as [PaymentStatus, { label: string }][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Hình thức TT</Label>
              <Select
                value={draft.method}
                onValueChange={(v) => setDraft((d) => ({ ...d, method: v as PaymentMethod | 'all' }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {(Object.entries(paymentMethodConfig) as [PaymentMethod, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Nhà cung cấp</Label>
              <Select
                value={draft.supplier}
                onValueChange={(v) => setDraft((d) => ({ ...d, supplier: v }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả NCC</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <AppDialogFooter>
        <Button type="button" variant="ghost" onClick={handleReset}>Đặt lại</Button>
        <Button type="button" onClick={handleApply}>Áp dụng</Button>
      </AppDialogFooter>
    </AppDialog>
  )
}
