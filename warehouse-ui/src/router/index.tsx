import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AuthGuard } from './auth-guard'
import { LoginPage } from '@/features/auth'

function RootLayout() {
  return <Outlet />
}

function DashboardPage() {
  return <div>Dashboard</div>
}

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
        ],
      },
    ],
  },
])
