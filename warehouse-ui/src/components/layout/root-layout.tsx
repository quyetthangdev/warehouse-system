import { Outlet } from 'react-router-dom'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import { AppBreadcrumb } from './app-breadcrumb'

export function RootLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <div className="bg-muted/40 px-6 py-2">
          <AppBreadcrumb />
        </div>
        <main className="flex-1 overflow-auto bg-muted/40">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
