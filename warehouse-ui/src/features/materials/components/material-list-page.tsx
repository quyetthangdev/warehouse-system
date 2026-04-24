import { useState, useMemo } from 'react'
import { Plus, SlidersHorizontal, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/common/data-table'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FilterMultiSelect } from '@/components/common/filter-multi-select'
import { PageContainer } from '@/components/layout/page-container'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { useMaterials } from '../hooks/use-materials'
import { useUnits } from '@/features/units/hooks/use-units'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import { MaterialDialog } from './material-dialog'
import { getColumns } from './columns'
import type { Material } from '../types/material.types'
import type { MaterialFormValues } from '../schemas/material.schema'

const CATEGORY_OPTIONS = [
  { value: 'main_ingredient', label: 'Nguyên liệu chính' },
  { value: 'supporting', label: 'Phụ liệu' },
  { value: 'packaging', label: 'Bao bì' },
  { value: 'consumable', label: 'Vật tư tiêu hao' },
  { value: 'spare_part', label: 'Phụ tùng' },
]

export function MaterialListPage() {
  const { materials, isLoading, createMaterial, updateMaterial, removeMaterial } = useMaterials()
  const { units } = useUnits()
  const { suppliers } = useSuppliers()

  const canEdit = useAuthStore((s) => s.hasPermission(['admin', 'manager']))
  const canDelete = useAuthStore((s) => s.hasPermission(['admin', 'manager']))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMaterial, setEditMaterial] = useState<Material | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Material | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)

  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ id: s.id, name: s.name })),
    [suppliers],
  )

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchCategory = categoryFilter === 'all' || m.category === categoryFilter
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && m.isActive) ||
        (statusFilter === 'inactive' && !m.isActive)
      const matchSupplier =
        selectedSuppliers.length === 0 ||
        m.supplierIds.some((id) => selectedSuppliers.includes(id))
      return matchCategory && matchStatus && matchSupplier
    })
  }, [materials, categoryFilter, statusFilter, selectedSuppliers])

  const columns = useMemo(
    () =>
      getColumns({
        canEdit,
        canDelete,
        onEdit: (m) => { setEditMaterial(m); setDialogOpen(true) },
        onDelete: (m) => setDeleteTarget(m),
      }),
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

  const activeFilterCount = [
    categoryFilter !== 'all',
    statusFilter !== 'all',
    selectedSuppliers.length > 0,
  ].filter(Boolean).length

  function clearFilters() {
    setCategoryFilter('all')
    setStatusFilter('all')
    setSelectedSuppliers([])
  }

  return (
    <PageContainer
      title="Nguyên vật liệu"
      actions={
        canEdit ? (
          <Button onClick={() => { setEditMaterial(undefined); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nguyên liệu
          </Button>
        ) : undefined
      }
    >
      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials">Nguyên liệu</TabsTrigger>
          <TabsTrigger value="products">Mặt hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <DataTable
            columns={columns}
            data={filteredMaterials}
            isLoading={isLoading}
            searchPlaceholder="Tìm kiếm NVL..."
            emptyMessage="Chưa có nguyên vật liệu"
            filters={
              <>
                <Select>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Vị trí lưu kho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vị trí</SelectItem>
                  </SelectContent>
                </Select>

                <FilterMultiSelect
                  label="Nhà cung cấp"
                  options={supplierOptions.map((s) => ({ value: s.id, label: s.name }))}
                  selected={selectedSuppliers}
                  onChange={setSelectedSuppliers}
                  className="w-44"
                />

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Loại NVL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>

                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-muted-foreground"
                    onClick={clearFilters}
                  >
                    Xoá bộ lọc
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className={activeFilterCount > 0 ? 'border-primary/60 text-primary hover:text-primary' : ''}
                  onClick={activeFilterCount > 0 ? clearFilters : undefined}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                  Bộ lọc
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 h-4 min-w-4 rounded-full px-1 text-[10px] leading-none">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1.5" />
                  Xuất file
                </Button>
              </>
            }
          />
        </TabsContent>

        <TabsContent value="products">
          <div className="py-12 text-center text-muted-foreground">Tính năng đang phát triển</div>
        </TabsContent>
      </Tabs>

      <MaterialDialog
        open={dialogOpen}
        material={editMaterial}
        units={units}
        suppliers={suppliers}
        onSubmit={handleSubmit}
        onClose={() => { setDialogOpen(false); setEditMaterial(undefined) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa nguyên vật liệu"
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
