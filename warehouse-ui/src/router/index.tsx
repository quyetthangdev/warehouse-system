import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './auth-guard'
import { LoginPage } from '@/features/auth'
import { RootLayout } from '@/components/layout/root-layout'
import { DashboardPage } from '@/features/dashboard'
import { UnitListPage } from '@/features/units'

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
        ],
      },
    ],
  },
])
