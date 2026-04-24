import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './auth-guard'
import { LoginPage } from '@/features/auth'
import { RootLayout } from '@/components/layout/root-layout'
import { DashboardPage } from '@/features/dashboard'
import { UnitListPage } from '@/features/units'
import { MaterialListPage } from '@/features/materials'
import { SupplierListPage } from '@/features/suppliers'
import { InventoryListPage, InventoryDetailPage } from '@/features/inventory'
import { ImportFormListPage, ImportFormDetailPage } from '@/features/import-forms'
import { ExportFormListPage } from '@/features/export-forms'
import { BalanceFormListPage } from '@/features/balance-forms'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/units', element: <UnitListPage /> },
          { path: '/materials', element: <MaterialListPage /> },
          { path: '/suppliers', element: <SupplierListPage /> },
          { path: '/inventory', element: <InventoryListPage /> },
          { path: '/inventory/:materialId', element: <InventoryDetailPage /> },
          { path: '/import-forms', element: <ImportFormListPage /> },
          { path: '/import-forms/:id', element: <ImportFormDetailPage /> },
          { path: '/export-forms', element: <ExportFormListPage /> },
          { path: '/balance-forms', element: <BalanceFormListPage /> },
        ],
      },
    ],
  },
])
