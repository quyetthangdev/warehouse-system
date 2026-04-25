import { X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DialogClose } from '@/components/ui/dialog'
import { WideDialog } from '@/components/common/wide-dialog'
import { StatusBadge } from '@/components/common/status-badge'
import { useSuppliers } from '../hooks/use-suppliers'
import { useSupplierDetail } from '../hooks/use-supplier-detail'
import type { ImportFormStatus } from '@/features/import-forms/types/import-form.types'

const paymentTermsLabel: Record<string, string> = {
  cod: 'COD',
  '7_days': '7 ngày',
  '15_days': '15 ngày',
  '30_days': '30 ngày',
}

const importStatusConfig: Record<ImportFormStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Nháp', variant: 'secondary' },
  confirmed: { label: 'Đã xác nhận', variant: 'default' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

interface DetailContentProps {
  supplierId: string
}

function DetailContent({ supplierId }: DetailContentProps) {
  const { suppliers } = useSuppliers()
  const { transactions, isLoading: txLoading, error: txError } = useSupplierDetail(supplierId)

  const supplier = suppliers.find((s) => s.id === supplierId)

  if (!supplier) {
    return (
      <>
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <p className="font-semibold">Chi tiết nhà cung cấp</p>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm"><X className="h-4 w-4" /></Button>
          </DialogClose>
        </div>
        <div className="flex-1 p-6">
          <p className="text-muted-foreground">Không tìm thấy nhà cung cấp.</p>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold">{supplier.name}</h2>
          <StatusBadge
            label={supplier.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
            variant={supplier.isActive ? 'default' : 'secondary'}
          />
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon-sm"><X className="h-4 w-4" /></Button>
        </DialogClose>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="transactions">Lịch sử giao dịch</TabsTrigger>
          </TabsList>

          {/* Info tab */}
          <TabsContent value="info">
            <div className="rounded-lg border bg-card p-5">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                <InfoRow label="Mã nhà cung cấp" value={supplier.code} />
                <InfoRow label="Người liên hệ" value={supplier.contactPerson} />
                <InfoRow label="Số điện thoại" value={supplier.phone} />
                <InfoRow label="Email" value={supplier.email} />
                <InfoRow label="Địa chỉ" value={supplier.location} />
                <InfoRow label="Mã số thuế" value={supplier.taxCode} />
                <InfoRow label="Điều khoản thanh toán" value={paymentTermsLabel[supplier.paymentTerms] ?? supplier.paymentTerms} />
                <InfoRow label="Website" value={supplier.websiteUrl ?? '—'} />
                {supplier.note && (
                  <div className="col-span-2 sm:col-span-3">
                    <InfoRow label="Ghi chú" value={supplier.note} />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Transactions tab */}
          <TabsContent value="transactions">
            <div className="rounded-lg border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">
                Lịch sử giao dịch
                {!txLoading && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    ({transactions.length})
                  </span>
                )}
              </h3>

              {txLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : txError ? (
                <p className="text-sm text-destructive">{txError}</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Chưa có giao dịch nào
                </p>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Mã phiếu</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Ngày nhập</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Loại nhập</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Trạng thái</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Người tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const statusCfg = importStatusConfig[tx.status]
                        return (
                          <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-2.5 font-medium">{tx.code}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{formatDate(tx.importDate)}</td>
                            <td className="px-4 py-2.5">{tx.importType ?? '—'}</td>
                            <td className="px-4 py-2.5">
                              <StatusBadge label={statusCfg.label} variant={statusCfg.variant} />
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">{tx.createdBy}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export function SupplierDetailDialog({
  supplierId,
  onClose,
}: {
  supplierId: string | null
  onClose: () => void
}) {
  return (
    <WideDialog open={!!supplierId} onClose={onClose}>
      {supplierId && <DetailContent supplierId={supplierId} />}
    </WideDialog>
  )
}
