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
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { Ban } from 'lucide-react'
import { useMaterials } from '@/features/materials/hooks/use-materials'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import { useImportForms } from '../hooks/use-import-forms'
import { ImportFormDialog } from './import-form-dialog'
import { ImportFormDetailDialog } from './import-form-detail-dialog'
import { getColumns } from './columns'
import { importFormStatusConfig, WAREHOUSES } from '../import-form.utils'
import type { ImportForm, ImportFormStatus } from '../types/import-form.types'
import type { ImportFormValues } from '../schemas/import-form.schema'

const IMPORT_TYPES = ['Mua hàng', 'Nhập trả lại', 'Điều chuyển', 'Khác']

function exportToCSV(forms: ImportForm[]) {
  const headers = [
    'Mã phiếu', 'Ngày nhập', 'Nhà cung cấp', 'Kho nhập', 'Số PO',
    'Số hóa đơn', 'Trạng thái', 'Loại nhập', 'Người yêu cầu',
    'Người phê duyệt', 'Ghi chú', 'Người tạo',
  ]
  const rows = forms.map((f) => [
    f.code, f.importDate, f.supplierName, f.warehouseName ?? '', f.poNumber ?? '',
    f.invoiceNumber, importFormStatusConfig[f.status].label, f.importType ?? '',
    f.requestedBy, f.approvedBy ?? '', f.note ?? '', f.createdBy,
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `phieu-nhap-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function ImportFormListPage() {
  const { forms, isLoading, createForm, updateForm, cancelForm } = useImportForms()
  const { materials } = useMaterials()
  const { suppliers } = useSuppliers()
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager', 'supervisor']))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<ImportForm | undefined>()
  const [cancelTarget, setCancelTarget] = useState<ImportForm | undefined>()
  const [isCancelling, setIsCancelling] = useState(false)
  const [detailFormId, setDetailFormId] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<ImportFormStatus | 'all'>('all')
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all')
  const [supplierFilter, setSupplierFilter] = useState<string>('all')
  const [importTypeFilter, setImportTypeFilter] = useState<string>('all')

  const supplierOptions = useMemo(() => {
    const seen = new Set<string>()
    return forms.reduce<{ id: string; name: string }[]>((acc, f) => {
      if (!seen.has(f.supplierId)) {
        seen.add(f.supplierId)
        acc.push({ id: f.supplierId, name: f.supplierName })
      }
      return acc
    }, [])
  }, [forms])

  const filtered = useMemo(() => {
    return forms.filter((f) => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      if (warehouseFilter !== 'all' && f.warehouseId !== warehouseFilter) return false
      if (supplierFilter !== 'all' && f.supplierId !== supplierFilter) return false
      if (importTypeFilter !== 'all' && f.importType !== importTypeFilter) return false
      return true
    })
  }, [forms, statusFilter, warehouseFilter, supplierFilter, importTypeFilter])

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

  const hasActiveFilters =
    statusFilter !== 'all' || warehouseFilter !== 'all' ||
    supplierFilter !== 'all' || importTypeFilter !== 'all'

  function clearFilters() {
    setStatusFilter('all'); setWarehouseFilter('all')
    setSupplierFilter('all'); setImportTypeFilter('all')
  }

  async function handleSubmit(values: ImportFormValues) {
    const { ok, message } = editForm
      ? await updateForm(editForm.id, values)
      : await createForm(values)
    if (ok) {
      toast.success(editForm ? 'Cập nhật thành công' : 'Tạo phiếu nhập thành công')
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
      toast.success('Đã hủy phiếu nhập')
      setCancelTarget(undefined)
    } else {
      toast.error(message ?? 'Không thể hủy phiếu')
    }
  }

  return (
    <PageContainer
      title="Nhập kho"
      actions={
        canEdit ? (
          <Button onClick={() => { setEditForm(undefined); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo phiếu nhập
          </Button>
        ) : undefined
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        searchPlaceholder="Tìm kiếm phiếu nhập..."
        emptyMessage="Chưa có phiếu nhập nào"
        filters={
          <>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-28 h-9">
                <SelectValue placeholder="Kho nhập" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kho</SelectItem>
                {WAREHOUSES.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Nhà cung cấp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả NCC</SelectItem>
                {supplierOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={importTypeFilter} onValueChange={setImportTypeFilter}>
              <SelectTrigger className="w-28 h-9">
                <SelectValue placeholder="Loại nhập" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {IMPORT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ImportFormStatus | 'all')}
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

      <ImportFormDialog
        open={dialogOpen}
        form={editForm}
        materials={materials}
        suppliers={suppliers}
        onSubmit={handleSubmit}
        onClose={() => { setDialogOpen(false); setEditForm(undefined) }}
      />

      <ImportFormDetailDialog
        formId={detailFormId}
        onClose={() => setDetailFormId(null)}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Hủy phiếu nhập"
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
