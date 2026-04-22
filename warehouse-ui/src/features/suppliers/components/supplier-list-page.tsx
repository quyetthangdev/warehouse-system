import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { StatusBadge } from '@/components/common/status-badge'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { useSuppliers } from '../hooks/use-suppliers'
import { SupplierDialog } from './supplier-dialog'
import type { Supplier } from '../types/supplier.types'
import type { SupplierFormValues } from '../schemas/supplier.schema'

const paymentTermsLabel: Record<string, string> = {
  cod: 'COD',
  '7_days': '7 ngày',
  '15_days': '15 ngày',
  '30_days': '30 ngày',
}

export function SupplierListPage() {
  const { suppliers, isLoading, createSupplier, updateSupplier, removeSupplier } = useSuppliers()

  // Reactive RBAC selectors — derive boolean in the selector (NOT extracting the function)
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager']))
  const canDelete = useAuthStore((s) => s.hasPermission(['admin']))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Supplier | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)

  const columns = useMemo<ColumnDef<Supplier>[]>(
    () => [
      { accessorKey: 'code', header: 'Mã NCC' },
      { accessorKey: 'name', header: 'Tên nhà cung cấp' },
      { accessorKey: 'contactPerson', header: 'Người liên hệ' },
      { accessorKey: 'phone', header: 'Điện thoại' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'paymentTerms',
        header: 'Điều khoản TT',
        cell: ({ row }) => paymentTermsLabel[row.original.paymentTerms] ?? row.original.paymentTerms,
      },
      {
        accessorKey: 'isActive',
        header: 'Trạng thái',
        cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditSupplier(row.original)
                  setDialogOpen(true)
                }}
              >
                Sửa
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(row.original)}
              >
                Xóa
              </Button>
            )}
          </div>
        ),
      },
    ],
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
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Nhà cung cấp</h1>
          {canEdit && (
            <Button
              onClick={() => {
                setEditSupplier(undefined)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm nhà cung cấp
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={suppliers}
          isLoading={isLoading}
          searchPlaceholder="Tìm kiếm nhà cung cấp..."
        />
      </div>

      <SupplierDialog
        open={dialogOpen}
        supplier={editSupplier}
        onSubmit={handleSubmit}
        onClose={() => {
          setDialogOpen(false)
          setEditSupplier(undefined)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa nhà cung cấp"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageContainer>
  )
}
