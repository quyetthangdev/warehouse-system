import { Link, useLocation } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FilterDropdown } from '@/components/common/filter-dropdown'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Trang tổng quan',
  '/materials': 'Nguyên vật liệu',
  '/units': 'Đơn vị tính',
  '/suppliers': 'Nhà cung cấp',
  '/inventory': 'Tồn kho',
  '/import-forms': 'Nhập kho',
  '/export-forms': 'Xuất kho',
  '/balance-forms': 'Kiểm kho',
  '/payments': 'Chi phí',
  '/reports': 'Báo cáo',
  '/users': 'Người dùng',
  '/settings': 'Cài đặt',
}

export function AppBreadcrumb() {
  const { pathname } = useLocation()
  const label = routeLabels[pathname]

  if (!label) return null

  return (
    <div className="flex items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Wrench />
          Chọn công cụ
        </Button>
        <FilterDropdown />
      </div>
    </div>
  )
}
