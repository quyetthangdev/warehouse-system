import { useState, useMemo } from 'react'
import { Plus, Download, AlertTriangle, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { useWarehouseStore } from '@/stores/warehouse.store'
import { toast } from 'react-hot-toast'
import { useBalanceForms } from '../hooks/use-balance-forms'
import { BalanceFormDialog } from './balance-form-dialog'
import { BalanceFormDetailDialog } from './balance-form-detail-dialog'
import { getColumns } from './columns'
import { balanceFormStatusConfig, balanceTypeConfig } from '../balance-form.utils'
import type { BalanceForm, BalanceFormStatus, BalanceType } from '../types/balance-form.types'
import type { BalanceFormValues } from '../schemas/balance-form.schema'

function exportToCSV(forms: BalanceForm[]) {
  const headers = ['Mã phiếu', 'Ngày kiểm', 'Loại kiểm', 'Phạm vi', 'Người kiểm', 'Trạng thái', 'Số NVL']
  const rows = forms.map((f) => [
    f.code,
    f.balanceDate,
    balanceTypeConfig[f.balanceType],
    f.scope === 'full' ? 'Toàn bộ' : 'Một phần',
    f.inspectors.join('; '),
    balanceFormStatusConfig[f.status].label,
    String(f.items.length),
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `phieu-kiem-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function BalanceFormListPage() {
  const { forms, isLoading, createForm, cancelForm } = useBalanceForms()
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager', 'supervisor']))
  const lockedByFormId = useWarehouseStore((s) => s.lockedByFormId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<BalanceForm | undefined>()
  const [isCancelling, setIsCancelling] = useState(false)
  const [detailFormId, setDetailFormId] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<BalanceFormStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<BalanceType | 'all'>('all')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')

  const filtered = useMemo(() => {
    return forms.filter((f) => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      if (typeFilter !== 'all' && f.balanceType !== typeFilter) return false
      if (dateFromFilter && f.balanceDate < dateFromFilter) return false
      if (dateToFilter && f.balanceDate > dateToFilter) return false
      return true
    })
  }, [forms, statusFilter, typeFilter, dateFromFilter, dateToFilter])

  const hasActiveFilters =
    statusFilter !== 'all' || typeFilter !== 'all' || !!dateFromFilter || !!dateToFilter

  function clearFilters() {
    setStatusFilter('all')
    setTypeFilter('all')
    setDateFromFilter('')
    setDateToFilter('')
  }

  const columns = useMemo(
    () =>
      getColumns({
        canEdit,
        onViewDetail: (id) => setDetailFormId(id),
        onCancel: (f) => setCancelTarget(f),
      }),
    [canEdit],
  )

  async function handleSubmit(values: BalanceFormValues) {
    const { ok, message } = await createForm(values)
    if (ok) {
      toast.success('Tạo phiếu kiểm kho thành công')
      setDialogOpen(false)
    } else {
      toast.error(message ?? 'Có lỗi xảy ra')
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return
    setIsCancelling(true)
    const { ok, message } = await cancelForm(cancelTarget.id)
    setIsCancelling(false)
    if (ok) {
      toast.success('Đã hủy phiếu kiểm')
      setCancelTarget(undefined)
    } else {
      toast.error(message ?? 'Không thể hủy phiếu')
    }
  }

  return (
    <PageContainer
      title="Kiểm kho"
      actions={
        canEdit ? (
          <Button
            onClick={() => setDialogOpen(true)}
            disabled={!!lockedByFormId}
            title={lockedByFormId ? 'Kho đang trong quá trình kiểm kho' : undefined}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo phiếu kiểm
          </Button>
        ) : undefined
      }
    >
      {lockedByFormId && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300 mb-4">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Kho đang trong quá trình kiểm kho. Không thể tạo phiếu nhập/xuất mới.
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        searchPlaceholder="Tìm kiếm phiếu kiểm..."
        emptyMessage="Chưa có phiếu kiểm nào"
        filters={
          <>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as BalanceType | 'all')}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Loại kiểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {(Object.keys(balanceTypeConfig) as BalanceType[]).map((key) => (
                  <SelectItem key={key} value={key}>{balanceTypeConfig[key]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as BalanceFormStatus | 'all')}
            >
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {(Object.keys(balanceFormStatusConfig) as BalanceFormStatus[]).map((key) => (
                  <SelectItem key={key} value={key}>{balanceFormStatusConfig[key].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="h-9 w-36"
              title="Từ ngày"
            />
            <Input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="h-9 w-36"
              title="Đến ngày"
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-muted-foreground"
                onClick={clearFilters}
              >
                Xoá bộ lọc
              </Button>
            )}

            <Button variant="outline" size="sm" className="h-9" onClick={() => exportToCSV(filtered)}>
              <Download className="h-4 w-4 mr-1.5" />
              Xuất file
            </Button>
          </>
        }
      />

      <BalanceFormDialog
        open={dialogOpen}
        onSubmit={handleSubmit}
        onClose={() => setDialogOpen(false)}
      />

      <BalanceFormDetailDialog
        formId={detailFormId}
        onClose={() => setDetailFormId(null)}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Hủy phiếu kiểm"
        description={`Bạn có chắc muốn hủy phiếu "${cancelTarget?.code}"? Hành động này không thể hoàn tác.`}
        icon={Ban}
        confirmLabel="Hủy phiếu"
        confirmVariant="destructive"
        isLoading={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(undefined)}
      />
    </PageContainer>
  )
}
