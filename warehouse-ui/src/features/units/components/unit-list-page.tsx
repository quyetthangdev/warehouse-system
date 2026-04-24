import { useState, useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { useUnits } from '../hooks/use-units'
import { UnitDialog } from './unit-dialog'
import { getColumns } from './columns'
import type { Unit } from '../types/unit.types'
import type { UnitFormValues } from '../schemas/unit.schema'

export function UnitListPage() {
  const { units, isLoading, createUnit, updateUnit, removeUnit } = useUnits()
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager']))
  const canDelete = useAuthStore((s) => s.hasPermission(['admin', 'manager']))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editUnit, setEditUnit] = useState<Unit | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Unit | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)

  const columns = useMemo(
    () =>
      getColumns({
        canEdit,
        canDelete,
        onEdit: (unit) => { setEditUnit(unit); setDialogOpen(true) },
        onDelete: (unit) => setDeleteTarget(unit),
      }),
    [canEdit, canDelete],
  )

  async function handleSubmit(values: UnitFormValues) {
    const { ok, message } = editUnit
      ? await updateUnit(editUnit.id, values)
      : await createUnit(values)
    if (ok) {
      toast.success(editUnit ? 'Cập nhật thành công' : 'Thêm thành công')
      setDialogOpen(false)
      setEditUnit(undefined)
    } else {
      toast.error(message ?? 'Có lỗi xảy ra, thử lại sau')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const { ok, message } = await removeUnit(deleteTarget.id)
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
      title="Đơn vị tính"
      actions={
        canEdit ? (
          <Button onClick={() => { setEditUnit(undefined); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm đơn vị
          </Button>
        ) : undefined
      }
    >
      <DataTable
        columns={columns}
        data={units}
        isLoading={isLoading}
        searchPlaceholder="Tìm kiếm đơn vị..."
        emptyMessage="Chưa có đơn vị nào"
      />

      <UnitDialog
        open={dialogOpen}
        unit={editUnit}
        onSubmit={handleSubmit}
        onClose={() => { setDialogOpen(false); setEditUnit(undefined) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa đơn vị"
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
