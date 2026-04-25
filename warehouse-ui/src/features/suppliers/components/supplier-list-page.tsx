import { useState, useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { toast } from 'react-hot-toast'
import { useSuppliers } from '../hooks/use-suppliers'
import { SupplierDialog } from './supplier-dialog'
import { SupplierDetailDialog } from './supplier-detail-dialog'
import { getColumns } from './columns'
import type { Supplier } from '../types/supplier.types'
import type { SupplierFormValues } from '../schemas/supplier.schema'

const paymentTermsOptions = [
  { value: 'cod', label: 'COD' },
  { value: '7_days', label: '7 ngày' },
  { value: '15_days', label: '15 ngày' },
  { value: '30_days', label: '30 ngày' },
]

export function SupplierListPage() {
  const { suppliers, isLoading, createSupplier, updateSupplier, removeSupplier } = useSuppliers()
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager']))
  const canDelete = useAuthStore((s) => s.hasPermission(['admin', 'manager']))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Supplier | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)
  const [detailSupplierId, setDetailSupplierId] = useState<string | null>(null)

  const [paymentTermsFilter, setPaymentTermsFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      if (paymentTermsFilter !== 'all' && s.paymentTerms !== paymentTermsFilter) return false
      if (statusFilter === 'active' && !s.isActive) return false
      if (statusFilter === 'inactive' && s.isActive) return false
      return true
    })
  }, [suppliers, paymentTermsFilter, statusFilter])

  const columns = useMemo(
    () =>
      getColumns({
        canEdit,
        canDelete,
        onViewDetail: (s) => setDetailSupplierId(s.id),
        onEdit: (s) => { setEditSupplier(s); setDialogOpen(true) },
        onDelete: (s) => setDeleteTarget(s),
      }),
    [canEdit, canDelete],
  )

  async function handleSubmit(values: SupplierFormValues) {
    const { ok, message } = editSupplier
      ? await updateSupplier(editSupplier.id, values)
      : await createSupplier(values)
    if (ok) {
      toast.success(editSupplier ? 'Cập nhật thành công' : 'Thêm thành công')
      setDialogOpen(false)
      setEditSupplier(undefined)
    } else {
      toast.error(message ?? 'Có lỗi xảy ra, thử lại sau')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const { ok, message } = await removeSupplier(deleteTarget.id)
    setIsDeleting(false)
    if (ok) {
      toast.success('Xóa thành công')
      setDeleteTarget(undefined)
    } else {
      toast.error(message ?? 'Không thể xóa')
    }
  }

  return (
    <PageContainer
      title="Nhà cung cấp"
      actions={
        canEdit ? (
          <Button onClick={() => { setEditSupplier(undefined); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhà cung cấp
          </Button>
        ) : undefined
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        searchPlaceholder="Tìm kiếm nhà cung cấp..."
        emptyMessage="Chưa có nhà cung cấp nào"
        filters={
          <>
            <Select value={paymentTermsFilter} onValueChange={setPaymentTermsFilter}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Điều khoản TT" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {paymentTermsOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <SupplierDialog
        open={dialogOpen}
        supplier={editSupplier}
        onSubmit={handleSubmit}
        onClose={() => { setDialogOpen(false); setEditSupplier(undefined) }}
      />

      <SupplierDetailDialog
        supplierId={detailSupplierId}
        onClose={() => setDetailSupplierId(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa nhà cung cấp"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        icon={Trash2}
        confirmLabel="Xóa"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageContainer>
  )
}
