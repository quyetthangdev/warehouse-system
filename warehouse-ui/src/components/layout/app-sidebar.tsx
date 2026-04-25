import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, PackageSearch, ArrowDownToLine,
  ArrowUpFromLine, ClipboardList, Wallet, BarChart3,
  Settings, Users, ChevronLeft, Ruler, Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/materials', icon: Package, label: 'Nguyên vật liệu' },
  { to: '/units', icon: Ruler, label: 'Đơn vị tính' },
  { to: '/suppliers', icon: Truck, label: 'Nhà cung cấp' },
  { to: '/inventory', icon: PackageSearch, label: 'Tồn kho' },
  { to: '/import-forms', icon: ArrowDownToLine, label: 'Nhập kho' },
  { to: '/export-forms', icon: ArrowUpFromLine, label: 'Xuất kho' },
  { to: '/balance-forms', icon: ClipboardList, label: 'Kiểm kho' },
  { to: '/payments', icon: Wallet, label: 'Chi kho' },
  { to: '/reports', icon: BarChart3, label: 'Báo cáo' },
]

const adminItems = [
  { to: '/users', icon: Users, label: 'Người dùng' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
]

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const canAdmin = useAuthStore((s) => s.hasPermission(['admin']))

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm">Trend Coffee</span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {canAdmin && (
          <div className="mt-4 px-2">
            {!sidebarCollapsed && (
              <p className="mb-1 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quản trị
              </p>
            )}
            <ul className="space-y-1">
              {adminItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        'hover:bg-muted',
                        isActive ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  )
}
