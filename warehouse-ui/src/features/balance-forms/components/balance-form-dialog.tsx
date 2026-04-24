import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppDialog, AppDialogFooter } from '@/components/common/app-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useInventory } from '@/features/inventory/hooks/use-inventory'
import { balanceFormSchema, type BalanceFormValues } from '../schemas/balance-form.schema'
import { MOCK_INSPECTORS, balanceTypeConfig } from '../balance-form.utils'

interface BalanceFormDialogProps {
  open: boolean
  onSubmit: (values: BalanceFormValues) => Promise<void>
  onClose: () => void
}

export function BalanceFormDialog({ open, onSubmit, onClose }: BalanceFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BalanceFormValues>({
    resolver: zodResolver(balanceFormSchema),
    defaultValues: { balanceDate: '', inspectors: [], items: [] },
  })

  const { items: inventoryItems } = useInventory()

  const scope = watch('scope')
  const inspectors = watch('inspectors') ?? []
  const [attachmentInput, setAttachmentInput] = useState('')
  const [attachmentNames, setAttachmentNames] = useState<string[]>([])

  // Items state for partial scope
  const [partialItems, setPartialItems] = useState<BalanceFormValues['items']>([])
  const [addMaterialId, setAddMaterialId] = useState('')

  useEffect(() => {
    if (open) {
      reset({ balanceDate: new Date().toISOString().split('T')[0], inspectors: [], items: [] })
      setAttachmentNames([])
      setAttachmentInput('')
      setPartialItems([])
      setAddMaterialId('')
    }
  }, [open, reset])

  // When scope = full, auto-populate items from inventory
  useEffect(() => {
    if (scope === 'full') {
      const items = inventoryItems.map((inv) => ({
        materialId: inv.materialId,
        materialName: inv.materialName,
        unit: inv.unit,
        systemQuantity: inv.currentStock,
      }))
      setValue('items', items)
    } else if (scope === 'partial') {
      setValue('items', partialItems)
    }
  }, [scope, inventoryItems, partialItems, setValue])

  function toggleInspector(name: string) {
    const current = inspectors
    const updated = current.includes(name)
      ? current.filter((n) => n !== name)
      : [...current, name]
    setValue('inspectors', updated, { shouldValidate: true })
  }

  function addAttachment() {
    if (!attachmentInput.trim()) return
    const updated = [...attachmentNames, attachmentInput.trim()]
    setAttachmentNames(updated)
    setValue('attachmentNames', updated)
    setAttachmentInput('')
  }

  function removeAttachment(idx: number) {
    const updated = attachmentNames.filter((_, i) => i !== idx)
    setAttachmentNames(updated)
    setValue('attachmentNames', updated)
  }

  function addPartialMaterial() {
    if (!addMaterialId) return
    const inv = inventoryItems.find((i) => i.materialId === addMaterialId)
    if (!inv) return
    if (partialItems.some((i) => i.materialId === addMaterialId)) return
    const newItem = {
      materialId: inv.materialId,
      materialName: inv.materialName,
      unit: inv.unit,
      systemQuantity: inv.currentStock,
    }
    const updated = [...partialItems, newItem]
    setPartialItems(updated)
    setValue('items', updated)
    setAddMaterialId('')
  }

  function removePartialMaterial(materialId: string) {
    const updated = partialItems.filter((i) => i.materialId !== materialId)
    setPartialItems(updated)
    setValue('items', updated)
  }

  async function handleFormSubmit(values: BalanceFormValues) {
    await onSubmit(values)
  }

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      icon={ClipboardList}
      title="Tạo phiếu kiểm kho"
      isLoading={isSubmitting}
      className="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Thông tin phiếu</TabsTrigger>
            <TabsTrigger value="items">Danh sách NVL</TabsTrigger>
          </TabsList>

          <div className="min-h-[360px] overflow-y-auto">
            <TabsContent value="info" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Loại kiểm *</Label>
                  <Select
                    value={watch('balanceType')}
                    onValueChange={(v) => setValue('balanceType', v as BalanceFormValues['balanceType'], { shouldValidate: true })}
                  >
                    <SelectTrigger aria-invalid={!!errors.balanceType}>
                      <SelectValue placeholder="Chọn loại kiểm" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(balanceTypeConfig) as BalanceFormValues['balanceType'][]).map((key) => (
                        <SelectItem key={key} value={key}>{balanceTypeConfig[key]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.balanceType && <p className="text-sm text-destructive">{errors.balanceType.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Phạm vi *</Label>
                  <Select
                    value={scope}
                    onValueChange={(v) => setValue('scope', v as BalanceFormValues['scope'], { shouldValidate: true })}
                  >
                    <SelectTrigger aria-invalid={!!errors.scope}>
                      <SelectValue placeholder="Chọn phạm vi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Toàn bộ kho</SelectItem>
                      <SelectItem value="partial">Một phần</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.scope && <p className="text-sm text-destructive">{errors.scope.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="balanceDate">Ngày kiểm *</Label>
                  <Input id="balanceDate" type="date" {...register('balanceDate')} aria-invalid={!!errors.balanceDate} />
                  {errors.balanceDate && <p className="text-sm text-destructive">{errors.balanceDate.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Input id="note" placeholder="Ghi chú" {...register('note')} />
                </div>
              </div>

              {/* Inspectors */}
              <div className="space-y-2">
                <Label>Người kiểm * <span className="text-xs text-muted-foreground">(chọn ít nhất 2)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {MOCK_INSPECTORS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleInspector(name)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        inspectors.includes(name)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-muted'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                {errors.inspectors && <p className="text-sm text-destructive">{errors.inspectors.message}</p>}
              </div>

              {/* Attachment names */}
              <div className="space-y-2">
                <Label>File đính kèm</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="VD: anh-kiem-kho-01.jpg"
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttachment() } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addAttachment}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {attachmentNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {attachmentNames.map((name, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1.5">
                        {name}
                        <button type="button" onClick={() => removeAttachment(idx)} className="hover:text-destructive">×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="items" className="mt-0 space-y-3">
              {scope === 'full' && (
                <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Phạm vi toàn bộ: tự động thêm <span className="font-medium text-foreground">{inventoryItems.length} NVL</span> từ tồn kho hiện tại.
                </div>
              )}

              {scope === 'partial' && (
                <>
                  <div className="flex items-center gap-2">
                    <Select value={addMaterialId} onValueChange={setAddMaterialId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Chọn NVL để thêm..." />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems
                          .filter((inv) => !partialItems.some((i) => i.materialId === inv.materialId))
                          .map((inv) => (
                            <SelectItem key={inv.materialId} value={inv.materialId}>
                              {inv.materialName} (tồn: {inv.currentStock} {inv.unit})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" size="sm" onClick={addPartialMaterial} disabled={!addMaterialId}>
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm
                    </Button>
                  </div>

                  {partialItems.length > 0 && (
                    <ul className="space-y-1.5">
                      {partialItems.map((item) => (
                        <li key={item.materialId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                          <span>
                            <span className="font-medium">{item.materialName}</span>
                            <span className="ml-2 text-muted-foreground">tồn: {item.systemQuantity} {item.unit}</span>
                          </span>
                          <Button
                            type="button" variant="ghost" size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removePartialMaterial(item.materialId)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {!scope && (
                <p className="text-sm text-muted-foreground py-4 text-center">Chọn phạm vi kiểm ở tab Thông tin phiếu</p>
              )}

              {errors.items && <p className="text-sm text-destructive">{errors.items.message}</p>}
            </TabsContent>
          </div>
        </Tabs>

        <AppDialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Tạo phiếu'}
          </Button>
        </AppDialogFooter>
      </form>
    </AppDialog>
  )
}
