import { useState, useMemo } from 'react'
import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { Ban } from 'lucide-react'
import { useMaterials } from '@/features/materials/hooks/use-materials'
import { useInventory } from '@/features/inventory/hooks/use-inventory'
import { useExportForms } from '../hooks/use-export-forms'
import { ExportFormDialog } from './export-form-dialog'
import { ExportFormDetailDialog } from './export-form-detail-dialog'
import { getColumns } from './columns'
import { exportFormStatusConfig, exportTypeConfig } from '../export-form.utils'
import type { ExportForm, ExportFormStatus, ExportType } from '../types/export-form.types'
import type { ExportFormValues } from '../schemas/export-form.schema'

function exportToCSV(forms: ExportForm[]) {
  const headers = ['Mã phiếu', 'Ngày xuất', 'Loại xuất', 'Người xuất', 'Người nhận', 'Trạng thái', 'Ghi chú']
  const rows = forms.map((f) => [
    f.code, f.exportDate, exportTypeConfig[f.exportType]?.label ?? f.exportType,
    f.exportedBy, f.recipient ?? '', exportFormStatusConfig[f.status].label, f.note ?? '',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `phieu-xuat-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function ExportFormListPage() {
  const { forms, isLoading, createForm, updateForm, cancelForm } = useExportForms()
  const { materials } = useMaterials()
  const { items: inventoryItems } = useInventory()
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager', 'supervisor']))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<ExportForm | undefined>()
  const [cancelTarget, setCancelTarget] = useState<ExportForm | undefined>()
  const [isCancelling, setIsCancelling] = useState(false)
  const [detailFormId, setDetailFormId] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<ExportFormStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ExportType | 'all'>('all')
  const [exportedByFilter, setExportedByFilter] = useState<string>('all')
  const [materialFilter, setMaterialFilter] = useState<string>('all')
  const [dateFromFilter, setDateFromFilter] = useState<string>('')
  const [dateToFilter, setDateToFilter] = useState<string>('')

  const exportedByOptions = useMemo(
    () => [...new Set(forms.map((f) => f.exportedBy))].sort(),
    [forms],
  )

  const filtered = useMemo(() => {
    return forms.filter((f) => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      if (typeFilter !== 'all' && f.exportType !== typeFilter) return false
      if (exportedByFilter !== 'all' && f.exportedBy !== exportedByFilter) return false
      if (materialFilter !== 'all' && !f.items.some((i) => i.materialId === materialFilter)) return false
      if (dateFromFilter && f.exportDate < dateFromFilter) return false
      if (dateToFilter && f.exportDate > dateToFilter) return false
      return true
    })
  }, [forms, statusFilter, typeFilter, exportedByFilter, materialFilter, dateFromFilter, dateToFilter])

  const columns = useMemo(
    () =>
      getColumns({
        canEdit,
        onViewDetail: (id) => setDetailFormId(id),
        onEdit: (f) => { setEditForm(f); setDialogOpen(true) },
        onCancel: (f) => setCancelTarget(f),
      }),
    [canEdit],
  )

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || exportedByFilter !== 'all' || materialFilter !== 'all' || !!dateFromFilter || !!dateToFilter

  function clearFilters() {
    setStatusFilter('all')
    setTypeFilter('all')
    setExportedByFilter('all')
    setMaterialFilter('all')
    setDateFromFilter('')
    setDateToFilter('')
  }

  async function handleSubmit(values: ExportFormValues) {
    const { ok, message } = editForm
      ? await updateForm(editForm.id, values)
      : await createForm(values)
    if (ok) {
      toast.success(editForm ? 'Cập nhật thành công' : 'Tạo phiếu xuất thành công')
      setDialogOpen(false)
      setEditForm(undefined)
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
      toast.success('Đã hủy phiếu xuất')
      setCancelTarget(undefined)
    } else {
      toast.error(message ?? 'Không thể hủy phiếu')
    }
  }

  return (
    <PageContainer
      title="Xuất kho"
      actions={
        canEdit ? (
          <Button onClick={() => { setEditForm(undefined); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo phiếu xuất
          </Button>
        ) : undefined
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        searchPlaceholder="Tìm kiếm phiếu xuất..."
        emptyMessage="Chưa có phiếu xuất nào"
        filters={
          <>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ExportType | 'all')}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Loại xuất" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {(Object.keys(exportTypeConfig) as ExportType[]).map((key) => (
                  <SelectItem key={key} value={key}>{exportTypeConfig[key].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ExportFormStatus | 'all')}
            >
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={exportedByFilter} onValueChange={setExportedByFilter}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Người xuất" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả người xuất</SelectItem>
                {exportedByOptions.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={materialFilter} onValueChange={setMaterialFilter}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Nguyên vật liệu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả NVL</SelectItem>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
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
              <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground" onClick={clearFilters}>
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

      <ExportFormDialog
        open={dialogOpen}
        form={editForm}
        materials={materials}
        inventoryItems={inventoryItems}
        onSubmit={handleSubmit}
        onClose={() => { setDialogOpen(false); setEditForm(undefined) }}
      />

      <ExportFormDetailDialog
        formId={detailFormId}
        onClose={() => setDetailFormId(null)}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Hủy phiếu xuất"
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
