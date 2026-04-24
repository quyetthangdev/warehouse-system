import { Link, useLocation } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

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
  )
}
