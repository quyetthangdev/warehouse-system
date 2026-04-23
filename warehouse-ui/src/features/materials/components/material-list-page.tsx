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
import { useMaterials } from '../hooks/use-materials'
import { useUnits } from '@/features/units/hooks/use-units'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import { MaterialDialog } from './material-dialog'
import type { Material } from '../types/material.types'
import type { MaterialFormValues } from '../schemas/material.schema'

const categoryLabel: Record<string, string> = {
  main_ingredient: 'Nguyên liệu chính',
  supporting: 'Phụ liệu',
  packaging: 'Bao bì',
  consumable: 'Vật tư tiêu hao',
  spare_part: 'Phụ tùng',
}

export function MaterialListPage() {
  const { materials, isLoading, createMaterial, updateMaterial, removeMaterial } = useMaterials()
  const { units } = useUnits()
  const { suppliers } = useSuppliers()

  // Reactive RBAC — derive boolean in selector
  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager']))
  const canDelete = useAuthStore((s) => s.hasPermission(['admin']))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMaterial, setEditMaterial] = useState<Material | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Material | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)

  const columns = useMemo<ColumnDef<Material>[]>(
    () => [
      { accessorKey: 'code', header: 'Mã' },
      { accessorKey: 'name', header: 'Tên' },
      {
        accessorKey: 'category',
        header: 'Danh mục',
        cell: ({ row }) => categoryLabel[row.original.category] ?? row.original.category,
      },
      {
        accessorKey: 'baseUnit',
        header: 'Đơn vị cơ bản',
        cell: ({ row }) =>
          `${row.original.baseUnit.name} (${row.original.baseUnit.symbol})`,
      },
      {
        accessorKey: 'minimumInventory',
        header: 'Tồn tối thiểu',
        cell: ({ row }) =>
          `${row.original.minimumInventory} ${row.original.baseUnit.symbol}`,
      },
      {
        accessorKey: 'maximumInventory',
        header: 'Tồn tối đa',
        cell: ({ row }) =>
          `${row.original.maximumInventory} ${row.original.baseUnit.symbol}`,
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
                  setEditMaterial(row.original)
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

  async function handleSubmit(values: MaterialFormValues) {
    const { ok, message } = editMaterial
      ? await updateMaterial(editMaterial.id, values)
      : await createMaterial(values)
    if (ok) {
      toast.success(editMaterial ? 'Cập nhật thành công' : 'Thêm thành công')
      setDialogOpen(false)
      setEditMaterial(undefined)
    } else {
      toast.error(message ?? 'Có lỗi xảy ra, thử lại sau')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const { ok, message } = await removeMaterial(deleteTarget.id)
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
          <h1 className="text-xl font-semibold">Nguyên vật liệu</h1>
          {canEdit && (
            <Button
              onClick={() => {
                setEditMaterial(undefined)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm nguyên vật liệu
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={materials}
          isLoading={isLoading}
          searchPlaceholder="Tìm kiếm nguyên vật liệu..."
        />
      </div>

      <MaterialDialog
        open={dialogOpen}
        material={editMaterial}
        units={units}
        suppliers={suppliers}
        onSubmit={handleSubmit}
        onClose={() => {
          setDialogOpen(false)
          setEditMaterial(undefined)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa nguyên vật liệu"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageContainer>
  )
}
