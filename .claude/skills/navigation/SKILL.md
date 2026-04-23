---
name: navigation
description: Trigger when creating pages, adding routes, setting up navigation guards, implementing breadcrumbs, or working on any routing-related code.
---

# Navigation & Routing Convention

This project uses **React Router v6** with `createBrowserRouter`. There is no file-based routing, no Expo Router, no deep links, and no native tab navigation.

---

## Router Setup

**File**: `src/router/index.tsx`

The router is created with `createBrowserRouter` and follows a protected-layout pattern:

```
/login              → LoginPage (public, no auth required)
/                   → AuthGuard → RootLayout (Outlet)
  /dashboard        → DashboardPage
  /units            → UnitListPage
  /materials        → MaterialListPage
  /suppliers        → SupplierListPage
  (pending)
  /inventory        → InventoryPage
  /import-forms     → ImportFormsPage
  /export-forms     → ExportFormsPage
  /balance-forms    → BalanceFormsPage
  /payments         → PaymentsPage
  /reports          → ReportsPage
  /users            → UsersPage
  /settings         → SettingsPage
```

---

## Adding a New Route

Follow these 4 steps in order:

### 1. Create the page component

```
src/features/<domain>/components/<domain>-list-page.tsx
```

```tsx
export function SupplierListPage() {
  return <div className="p-6">Supplier list</div>
}
```

### 2. Export from the feature barrel

```ts
// src/features/<domain>/index.ts
export { SupplierListPage } from './components/supplier-list-page'
```

### 3. Add the route in `src/router/index.tsx`

```tsx
import { SupplierListPage } from '@/features/suppliers'

// Inside the authenticated children array:
{ path: 'suppliers', element: <SupplierListPage /> },
```

### 4. Add the label in `src/components/layout/app-breadcrumb.tsx`

```tsx
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  units: 'Đơn vị tính',
  materials: 'Nguyên vật liệu',
  suppliers: 'Nhà cung cấp',
  // add new entry here
}
```

---

## AuthGuard

**File**: `src/features/auth/components/auth-guard.tsx` (or similar)

- Reads authentication state from `auth.store` (Zustand)
- Redirects to `/login` if not authenticated
- Renders `<Outlet />` for authenticated users

```tsx
export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
```

---

## Navigation in Components

### Programmatic navigation

```tsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// Push to history
navigate('/materials')

// Replace (no history entry)
navigate('/login', { replace: true })

// Go back
navigate(-1)
```

### Link component

```tsx
import { Link } from 'react-router-dom'

<Link to="/dashboard">Dashboard</Link>
```

### Redirect (in render)

```tsx
import { Navigate } from 'react-router-dom'

if (!isAuthenticated) {
  return <Navigate to="/login" replace />
}
```

---

## Reading Route Info

### Current pathname

```tsx
import { useLocation } from 'react-router-dom'

const { pathname } = useLocation()
// pathname === '/materials'
```

### Route params

```tsx
import { useParams } from 'react-router-dom'

// Route: /materials/:id
const { id } = useParams<{ id: string }>()
```

---

## RootLayout

**File**: `src/components/layout/root-layout.tsx` (or similar)

Contains the sidebar/navbar and an `<Outlet />` for rendering child routes:

```tsx
import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

---

## Breadcrumbs

**File**: `src/components/layout/app-breadcrumb.tsx`

Breadcrumbs are derived from `useLocation().pathname`. Each path segment is looked up in the `routeLabels` map. Always add a new entry when adding a new route.

---

## What NOT to Use

- No `useRouter()` from expo-router
- No `useLocalSearchParams()` — use `useParams()` or `useSearchParams()` instead
- No `router.push()` — use `navigate()` from `useNavigate()`
- No file-based `app/` directory routing
- No nested tab navigators or bottom sheets from `@gorhom/bottom-sheet`
- No `Stack`, `Tabs`, or `Drawer` from React Navigation

---

**Key Rule**: Every new page must follow the 4-step process: create component → export from barrel → add route → add breadcrumb label.
