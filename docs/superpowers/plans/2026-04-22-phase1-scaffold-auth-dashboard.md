# Warehouse UI Phase 1 — Scaffold + Auth + Layout + Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the `warehouse-ui` React app với login/JWT auth, sidebar + header layout, và dashboard hiển thị mock inventory stats và cảnh báo.

**Architecture:** Feature-based modules dưới `src/features/`, shared components trong `src/components/`, Zustand stores cho global state, MSW v2 mock API. Tất cả API call đi qua Axios instance tự động refresh JWT.

**Tech Stack:** React 19.2, TypeScript, Vite 6, shadcn/ui, Tailwind CSS v4, Zustand 5, React Router v6, MSW v2, React Hook Form, Zod, Axios, Recharts, Vitest, React Testing Library

---

## File Map

```
warehouse-system/
├── package.json                              [CREATE] root workspace
└── warehouse-ui/
    ├── package.json                          [CREATE]
    ├── vite.config.ts                        [CREATE]
    ├── tsconfig.json                         [CREATE]
    ├── tsconfig.app.json                     [CREATE]
    ├── tsconfig.node.json                    [CREATE]
    ├── components.json                       [CREATE] shadcn config
    ├── vitest.config.ts                      [CREATE]
    ├── .env.local                            [CREATE]
    ├── index.html                            [CREATE]
    └── src/
        ├── main.tsx                          [CREATE]
        ├── app.tsx                           [CREATE]
        ├── index.css                         [CREATE]
        ├── vite-env.d.ts                     [CREATE]
        ├── lib/
        │   ├── utils.ts                      [CREATE] cn helper
        │   └── utils.test.ts                 [CREATE]
        ├── types/
        │   ├── auth.types.ts                 [CREATE]
        │   └── api.types.ts                  [CREATE]
        ├── services/
        │   ├── axios.instance.ts             [CREATE] Axios + interceptors
        │   └── auth.service.ts               [CREATE]
        ├── mocks/
        │   ├── browser.ts                    [CREATE] MSW setup
        │   └── handlers/
        │       ├── index.ts                  [CREATE]
        │       └── auth.handler.ts           [CREATE]
        ├── stores/
        │   ├── auth.store.ts                 [CREATE]
        │   ├── auth.store.test.ts            [CREATE]
        │   ├── ui.store.ts                   [CREATE]
        │   ├── ui.store.test.ts              [CREATE]
        │   └── notification.store.ts         [CREATE]
        ├── router/
        │   ├── index.tsx                     [CREATE]
        │   └── auth-guard.tsx                [CREATE]
        ├── components/
        │   ├── layout/
        │   │   ├── app-sidebar.tsx           [CREATE]
        │   │   ├── app-header.tsx            [CREATE]
        │   │   ├── root-layout.tsx           [CREATE]
        │   │   └── page-container.tsx        [CREATE]
        │   └── common/
        │       ├── status-badge.tsx          [CREATE]
        │       └── alert-badge.tsx           [CREATE]
        └── features/
            ├── auth/
            │   ├── schemas/
            │   │   ├── login.schema.ts       [CREATE]
            │   │   └── login.schema.test.ts  [CREATE]
            │   ├── hooks/
            │   │   ├── use-login.ts          [CREATE]
            │   │   └── use-login.test.ts     [CREATE]
            │   ├── components/
            │   │   ├── login-form.tsx        [CREATE]
            │   │   └── login-page.tsx        [CREATE]
            │   └── index.ts                  [CREATE]
            └── dashboard/
                ├── types/
                │   └── dashboard.types.ts    [CREATE]
                ├── mocks/
                │   └── dashboard.mock.ts     [CREATE]
                ├── hooks/
                │   ├── use-dashboard.ts      [CREATE]
                │   └── use-dashboard.test.ts [CREATE]
                ├── components/
                │   ├── stats-card.tsx        [CREATE]
                │   ├── alert-panel.tsx       [CREATE]
                │   ├── cost-chart.tsx        [CREATE]
                │   └── dashboard-page.tsx    [CREATE]
                └── index.ts                  [CREATE]
```

---

## Task 1: Monorepo scaffold + Vite project

**Files:**
- Create: `warehouse-system/package.json`
- Create: `warehouse-ui/package.json`
- Create: `warehouse-ui/index.html`
- Create: `warehouse-ui/vite.config.ts`
- Create: `warehouse-ui/tsconfig.json`
- Create: `warehouse-ui/tsconfig.app.json`
- Create: `warehouse-ui/tsconfig.node.json`
- Create: `warehouse-ui/src/vite-env.d.ts`
- Create: `warehouse-ui/src/main.tsx`
- Create: `warehouse-ui/src/app.tsx`

- [ ] **Step 1: Tạo root package.json**

```json
// warehouse-system/package.json
{
  "name": "warehouse-system",
  "private": true,
  "workspaces": ["warehouse-ui"],
  "scripts": {
    "ui:dev": "npm run dev --workspace=warehouse-ui",
    "ui:build": "npm run build --workspace=warehouse-ui",
    "ui:test": "npm run test --workspace=warehouse-ui"
  }
}
```

- [ ] **Step 2: Scaffold warehouse-ui**

```bash
cd /Users/phanquyetthang/warehouse-system
npm create vite@latest warehouse-ui -- --template react-ts
cd warehouse-ui
```

- [ ] **Step 3: Cập nhật warehouse-ui/package.json — thêm dependencies**

```json
{
  "name": "warehouse-ui",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^6.28.0",
    "axios": "^1.7.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.54.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "recharts": "^2.14.0",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.468.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "msw": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "~5.6.0",
    "vite": "^6.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^25.0.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0"
  }
}
```

- [ ] **Step 4: Cập nhật vite.config.ts**

```ts
// warehouse-ui/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 5: Cập nhật tsconfig.app.json**

```json
// warehouse-ui/tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Tạo src/index.css (Tailwind v4)**

```css
/* warehouse-ui/src/index.css */
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: system-ui, -apple-system, sans-serif;
  }
}
```

- [ ] **Step 7: Tạo src/vite-env.d.ts**

```ts
// warehouse-ui/src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 8: Tạo .env.local**

```
# warehouse-ui/.env.local
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=true
```

- [ ] **Step 9: Tạo src/app.tsx tạm thời để verify build**

```tsx
// warehouse-ui/src/app.tsx
export function App() {
  return <div>Warehouse System</div>
}
```

- [ ] **Step 10: Cập nhật src/main.tsx**

```tsx
// warehouse-ui/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { App } from '@/app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 11: Cài dependencies và verify dev server chạy**

```bash
cd warehouse-ui
npm install
npm run dev
```

Expected: Dev server chạy tại `http://localhost:5173`, browser hiển thị "Warehouse System".

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: scaffold warehouse-ui with Vite + React 19 + Tailwind v4"
```

---

## Task 2: Cài và cấu hình shadcn/ui

**Files:**
- Create: `warehouse-ui/components.json`
- Create: `warehouse-ui/src/lib/utils.ts`
- Create: `warehouse-ui/src/lib/utils.test.ts`

- [ ] **Step 1: Init shadcn**

```bash
cd warehouse-ui
npx shadcn@latest init
```

Khi được hỏi, chọn:
- Style: New York
- Base color: Slate
- CSS variables: Yes

Lệnh này sẽ tạo `components.json` và cập nhật `src/lib/utils.ts`.

- [ ] **Step 2: Cài các shadcn components cần dùng**

```bash
npx shadcn@latest add button input label card badge toast avatar dropdown-menu separator sheet skeleton dialog
```

- [ ] **Step 3: Xác nhận src/lib/utils.ts đúng nội dung**

```ts
// warehouse-ui/src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Viết test cho utils**

```ts
// warehouse-ui/src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignores falsy values', () => {
    expect(cn('px-2', false && 'hidden', undefined)).toBe('px-2')
  })
})
```

- [ ] **Step 5: Chạy test**

```bash
cd warehouse-ui
npm run test -- --run src/lib/utils.test.ts
```

Expected: `3 tests passed`

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui components and cn utility"
```

---

## Task 3: Vitest setup + testing infrastructure

**Files:**
- Create: `warehouse-ui/vitest.config.ts`
- Create: `warehouse-ui/src/test/setup.ts`

- [ ] **Step 1: Tạo vitest.config.ts**

```ts
// warehouse-ui/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Tạo src/test/setup.ts**

```ts
// warehouse-ui/src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Cài @testing-library/jest-dom**

```bash
npm install -D @testing-library/jest-dom
```

- [ ] **Step 4: Chạy toàn bộ tests để xác nhận setup hoạt động**

```bash
npm run test -- --run
```

Expected: All existing tests pass, no config errors.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: configure Vitest with jsdom and testing-library"
```

---

## Task 4: Core TypeScript types

**Files:**
- Create: `warehouse-ui/src/types/auth.types.ts`
- Create: `warehouse-ui/src/types/api.types.ts`

- [ ] **Step 1: Tạo auth.types.ts**

```ts
// warehouse-ui/src/types/auth.types.ts
export type UserRole = 'admin' | 'manager' | 'supervisor'

export interface User {
  id: string
  slug: string
  fullName: string
  email: string
  phoneNumber: string
  role: UserRole
  isActive: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}
```

- [ ] **Step 2: Tạo api.types.ts**

```ts
// warehouse-ui/src/types/api.types.ts
export interface ApiResponse<T> {
  data: T
  message: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add core TypeScript types for auth and API"
```

---

## Task 5: Axios instance với JWT interceptors

**Files:**
- Create: `warehouse-ui/src/services/axios.instance.ts`
- Create: `warehouse-ui/src/services/auth.service.ts`

- [ ] **Step 1: Tạo axios.instance.ts**

```ts
// warehouse-ui/src/services/axios.instance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError, AuthTokens } from '@/types/api.types'

const BASE_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

// Gắn access token vào mọi request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Tự động refresh khi 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post<{ tokens: AuthTokens }>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
      )

      localStorage.setItem('accessToken', data.tokens.accessToken)
      localStorage.setItem('refreshToken', data.tokens.refreshToken)

      processQueue(null, data.tokens.accessToken)
      originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
```

- [ ] **Step 2: Tạo auth.service.ts**

```ts
// warehouse-ui/src/services/auth.service.ts
import { api } from './axios.instance'
import type { ApiResponse, AuthTokens } from '@/types/api.types'
import type { LoginRequest, LoginResponse, User } from '@/types/auth.types'

export const authService = {
  login(payload: LoginRequest) {
    return api.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  },

  refresh(refreshToken: string) {
    return api.post<ApiResponse<{ tokens: AuthTokens }>>('/auth/refresh', { refreshToken })
  },

  getMe() {
    return api.get<ApiResponse<User>>('/auth/me')
  },

  logout() {
    return api.post('/auth/logout')
  },
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add Axios instance with JWT auto-refresh interceptor"
```

---

## Task 6: MSW v2 setup + auth mock handler

**Files:**
- Create: `warehouse-ui/src/mocks/browser.ts`
- Create: `warehouse-ui/src/mocks/handlers/auth.handler.ts`
- Create: `warehouse-ui/src/mocks/handlers/index.ts`

- [ ] **Step 1: Khởi tạo MSW service worker**

```bash
cd warehouse-ui
npx msw init public/ --save
```

Expected: File `public/mockServiceWorker.js` được tạo.

- [ ] **Step 2: Tạo auth.handler.ts**

```ts
// warehouse-ui/src/mocks/handlers/auth.handler.ts
import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'
import type { LoginResponse, User } from '@/types/auth.types'

const BASE_URL = import.meta.env.VITE_API_URL

const mockUser: User = {
  id: 'user-001',
  slug: 'admin-user',
  fullName: 'Nguyễn Văn Admin',
  email: 'admin@trendcoffee.vn',
  phoneNumber: '0901234567',
  role: 'manager',
  isActive: true,
}

export const authHandlers = [
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    if (body.email === 'admin@trendcoffee.vn' && body.password === 'password123') {
      const response: ApiResponse<LoginResponse> = {
        statusCode: 200,
        message: 'Đăng nhập thành công',
        data: {
          user: mockUser,
          tokens: {
            accessToken: 'mock-access-token-xyz',
            refreshToken: 'mock-refresh-token-xyz',
          },
        },
      }
      return HttpResponse.json(response)
    }

    return HttpResponse.json(
      { statusCode: 401, message: 'Email hoặc mật khẩu không đúng' },
      { status: 401 },
    )
  }),

  http.get(`${BASE_URL}/auth/me`, () => {
    const response: ApiResponse<User> = {
      statusCode: 200,
      message: 'OK',
      data: mockUser,
    }
    return HttpResponse.json(response)
  }),

  http.post(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ statusCode: 200, message: 'Đã đăng xuất' })
  }),
]
```

- [ ] **Step 3: Tạo handlers/index.ts**

```ts
// warehouse-ui/src/mocks/handlers/index.ts
import { authHandlers } from './auth.handler'

export const handlers = [...authHandlers]
```

- [ ] **Step 4: Tạo browser.ts**

```ts
// warehouse-ui/src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

- [ ] **Step 5: Kích hoạt MSW trong main.tsx**

```tsx
// warehouse-ui/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { App } from '@/app'

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return
  const { worker } = await import('@/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

- [ ] **Step 6: Verify MSW hoạt động — chạy dev server**

```bash
npm run dev
```

Mở browser console, expected: `[MSW] Mocking enabled.`

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add MSW v2 with auth mock handlers"
```

---

## Task 7: Zustand stores (auth + ui)

**Files:**
- Create: `warehouse-ui/src/stores/auth.store.ts`
- Create: `warehouse-ui/src/stores/auth.store.test.ts`
- Create: `warehouse-ui/src/stores/ui.store.ts`
- Create: `warehouse-ui/src/stores/ui.store.test.ts`

- [ ] **Step 1: Viết failing tests cho auth store**

```ts
// warehouse-ui/src/stores/auth.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null })
  })

  it('khởi đầu không có user', () => {
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('setUser cập nhật user', () => {
    const user = { id: '1', slug: 'a', fullName: 'Test', email: 'a@b.com', phoneNumber: '0900000000', role: 'manager' as const, isActive: true }
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().user?.fullName).toBe('Test')
  })

  it('hasPermission trả về true khi role khớp', () => {
    const user = { id: '1', slug: 'a', fullName: 'Test', email: 'a@b.com', phoneNumber: '0900000000', role: 'manager' as const, isActive: true }
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().hasPermission(['manager', 'admin'])).toBe(true)
  })

  it('hasPermission trả về false khi role không khớp', () => {
    const user = { id: '1', slug: 'a', fullName: 'Test', email: 'a@b.com', phoneNumber: '0900000000', role: 'supervisor' as const, isActive: true }
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().hasPermission(['manager', 'admin'])).toBe(false)
  })

  it('logout xóa user và token', () => {
    const user = { id: '1', slug: 'a', fullName: 'Test', email: 'a@b.com', phoneNumber: '0900000000', role: 'manager' as const, isActive: true }
    useAuthStore.setState({ user, accessToken: 'token-abc' })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

```bash
npm run test -- --run src/stores/auth.store.test.ts
```

Expected: `Cannot find module './auth.store'`

- [ ] **Step 3: Tạo auth.store.ts**

```ts
// warehouse-ui/src/stores/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types/auth.types'

interface AuthState {
  user: User | null
  accessToken: string | null
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
  hasPermission: (roles: UserRole[]) => boolean
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({ accessToken })
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null })
      },

      hasPermission: (roles) => {
        const { user } = get()
        if (!user) return false
        return roles.includes(user.role)
      },

      isAuthenticated: () => {
        const { user, accessToken } = get()
        return !!user && !!accessToken
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
)
```

- [ ] **Step 4: Chạy auth store tests**

```bash
npm run test -- --run src/stores/auth.store.test.ts
```

Expected: `5 tests passed`

- [ ] **Step 5: Viết failing tests cho ui store**

```ts
// warehouse-ui/src/stores/ui.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from './ui.store'

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ sidebarCollapsed: false })
  })

  it('sidebar mặc định không collapsed', () => {
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
  })

  it('toggleSidebar đổi trạng thái', () => {
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarCollapsed).toBe(true)
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
  })
})
```

- [ ] **Step 6: Tạo ui.store.ts**

```ts
// warehouse-ui/src/stores/ui.store.ts
import { create } from 'zustand'

interface UiState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}))
```

- [ ] **Step 7: Chạy ui store tests**

```bash
npm run test -- --run src/stores/ui.store.test.ts
```

Expected: `2 tests passed`

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add auth and ui Zustand stores with tests"
```

---

## Task 8: Login schema + hook

**Files:**
- Create: `warehouse-ui/src/features/auth/schemas/login.schema.ts`
- Create: `warehouse-ui/src/features/auth/schemas/login.schema.test.ts`
- Create: `warehouse-ui/src/features/auth/hooks/use-login.ts`
- Create: `warehouse-ui/src/features/auth/hooks/use-login.test.ts`

- [ ] **Step 1: Viết failing tests cho login schema**

```ts
// warehouse-ui/src/features/auth/schemas/login.schema.test.ts
import { describe, it, expect } from 'vitest'
import { loginSchema } from './login.schema'

describe('loginSchema', () => {
  it('accept email và password hợp lệ', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'password123' }).success).toBe(true)
  })

  it('reject email rỗng', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('reject email không đúng format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('reject password dưới 6 ký tự', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

```bash
npm run test -- --run src/features/auth/schemas/login.schema.test.ts
```

Expected: `Cannot find module './login.schema'`

- [ ] **Step 3: Tạo login.schema.ts**

```ts
// warehouse-ui/src/features/auth/schemas/login.schema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không đúng định dạng'),
  password: z
    .string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
```

- [ ] **Step 4: Chạy schema tests**

```bash
npm run test -- --run src/features/auth/schemas/login.schema.test.ts
```

Expected: `4 tests passed`

- [ ] **Step 5: Viết failing tests cho use-login hook**

```ts
// warehouse-ui/src/features/auth/hooks/use-login.test.ts
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useLogin } from './use-login'
import { useAuthStore } from '@/stores/auth.store'

const server = setupServer(
  http.post('http://localhost:3000/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    if (body.email === 'admin@trendcoffee.vn' && body.password === 'password123') {
      return HttpResponse.json({
        statusCode: 200,
        message: 'OK',
        data: {
          user: { id: '1', slug: 'a', fullName: 'Admin', email: 'admin@trendcoffee.vn', phoneNumber: '0900000000', role: 'manager', isActive: true },
          tokens: { accessToken: 'acc-token', refreshToken: 'ref-token' },
        },
      })
    }
    return HttpResponse.json({ statusCode: 401, message: 'Sai thông tin' }, { status: 401 })
  }),
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  useAuthStore.setState({ user: null, accessToken: null })
})
afterAll(() => server.close())

describe('useLogin', () => {
  it('login thành công cập nhật auth store', async () => {
    const { result } = renderHook(() => useLogin())
    await act(async () => {
      await result.current.login({ email: 'admin@trendcoffee.vn', password: 'password123' })
    })
    await waitFor(() => {
      expect(useAuthStore.getState().user?.email).toBe('admin@trendcoffee.vn')
    })
  })

  it('login thất bại trả về error message', async () => {
    const { result } = renderHook(() => useLogin())
    await act(async () => {
      await result.current.login({ email: 'wrong@email.com', password: 'wrongpass' })
    })
    await waitFor(() => {
      expect(result.current.error).toBe('Sai thông tin')
    })
  })
})
```

- [ ] **Step 6: Chạy test để xác nhận fail**

```bash
npm run test -- --run src/features/auth/hooks/use-login.test.ts
```

Expected: `Cannot find module './use-login'`

- [ ] **Step 7: Tạo use-login.ts**

```ts
// warehouse-ui/src/features/auth/hooks/use-login.ts
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginFormValues } from '../schemas/login.schema'

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser, setTokens } = useAuthStore()
  const navigate = useNavigate()

  async function login(values: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await authService.login(values)
      setUser(res.data.user)
      setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Đăng nhập thất bại'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
```

- [ ] **Step 8: Chạy hook tests**

```bash
npm run test -- --run src/features/auth/hooks/use-login.test.ts
```

Expected: `2 tests passed`

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add login schema and use-login hook with tests"
```

---

## Task 9: Login page + form component

**Files:**
- Create: `warehouse-ui/src/features/auth/components/login-form.tsx`
- Create: `warehouse-ui/src/features/auth/components/login-page.tsx`
- Create: `warehouse-ui/src/features/auth/index.ts`

- [ ] **Step 1: Tạo login-form.tsx**

```tsx
// warehouse-ui/src/features/auth/components/login-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void
  isLoading: boolean
  error: string | null
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@trendcoffee.vn"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Tạo login-page.tsx**

```tsx
// warehouse-ui/src/features/auth/components/login-page.tsx
import { useLogin } from '../hooks/use-login'
import { LoginForm } from './login-form'

export function LoginPage() {
  const { login, isLoading, error } = useLogin()

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-background p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Trend Coffee</h1>
          <p className="text-sm text-muted-foreground">Hệ thống quản lý kho</p>
        </div>
        <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Tạo features/auth/index.ts**

```ts
// warehouse-ui/src/features/auth/index.ts
export { LoginPage } from './components/login-page'
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add login page and form component"
```

---

## Task 10: React Router v6 + Auth Guard

**Files:**
- Create: `warehouse-ui/src/router/auth-guard.tsx`
- Create: `warehouse-ui/src/router/index.tsx`
- Modify: `warehouse-ui/src/app.tsx`

- [ ] **Step 1: Tạo auth-guard.tsx**

```tsx
// warehouse-ui/src/router/auth-guard.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
```

- [ ] **Step 2: Tạo router/index.tsx**

```tsx
// warehouse-ui/src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './auth-guard'
import { LoginPage } from '@/features/auth'
import { RootLayout } from '@/components/layout/root-layout'
import { DashboardPage } from '@/features/dashboard'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
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
```

- [ ] **Step 3: Cập nhật app.tsx**

```tsx
// warehouse-ui/src/app.tsx
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'

export function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add React Router v6 with AuthGuard"
```

---

## Task 11: Layout components (sidebar + header + root layout)

**Files:**
- Create: `warehouse-ui/src/components/layout/app-sidebar.tsx`
- Create: `warehouse-ui/src/components/layout/app-header.tsx`
- Create: `warehouse-ui/src/components/layout/page-container.tsx`
- Create: `warehouse-ui/src/components/layout/root-layout.tsx`

- [ ] **Step 1: Tạo app-sidebar.tsx**

```tsx
// warehouse-ui/src/components/layout/app-sidebar.tsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Archive, ArrowDownToLine,
  ArrowUpFromLine, ClipboardList, Wallet, BarChart3,
  Settings, Users, ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/materials', icon: Package, label: 'Nguyên vật liệu' },
  { to: '/inventory', icon: Archive, label: 'Tồn kho' },
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
  const hasPermission = useAuthStore((s) => s.hasPermission)

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

        {hasPermission(['admin']) && (
          <ul className="mt-4 space-y-1 border-t px-2 pt-4">
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
        )}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Tạo app-header.tsx**

```tsx
// warehouse-ui/src/components/layout/app-header.tsx
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'

export function AppHeader() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const unreadCount = useNotificationStore((s) => s.unreadCount)

  const initials = user?.fullName
    .split(' ')
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U'

  return (
    <header className="flex h-14 items-center justify-end gap-3 border-b bg-background px-6">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user?.fullName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={logout} className="text-red-600">
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
```

- [ ] **Step 3: Tạo page-container.tsx**

```tsx
// warehouse-ui/src/components/layout/page-container.tsx
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-6', className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Tạo root-layout.tsx**

```tsx
// warehouse-ui/src/components/layout/root-layout.tsx
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'

export function RootLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add app layout components (sidebar, header, root layout)"
```

---

## Task 12: Notification store

**Files:**
- Create: `warehouse-ui/src/stores/notification.store.ts`
- Create: `warehouse-ui/src/mocks/handlers/notification.handler.ts`
- Modify: `warehouse-ui/src/mocks/handlers/index.ts`

- [ ] **Step 1: Tạo notification.store.ts**

```ts
// warehouse-ui/src/stores/notification.store.ts
import { create } from 'zustand'

export type AlertLevel = 'red' | 'yellow' | 'green'

export interface Notification {
  id: string
  type: 'low_stock' | 'near_expiry' | 'out_of_stock' | 'high_discrepancy' | 'info'
  level: AlertLevel
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  fetchNotifications: () => Promise<void>
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`)
      const json = await res.json()
      const notifications: Notification[] = json.data ?? []
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      })
    } catch {
      // silent fail — notifications không block UI
    }
  },

  markRead: (id) => {
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      )
      return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length }
    })
  },

  markAllRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },
}))
```

- [ ] **Step 2: Tạo notification.handler.ts**

```ts
// warehouse-ui/src/mocks/handlers/notification.handler.ts
import { http, HttpResponse } from 'msw'
import type { Notification } from '@/stores/notification.store'

const BASE_URL = import.meta.env.VITE_API_URL

const mockNotifications: Notification[] = [
  {
    id: 'n-001',
    type: 'low_stock',
    level: 'yellow',
    title: 'Tồn kho thấp',
    message: 'Cà phê Arabica còn 2kg, dưới mức tối thiểu 5kg',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-002',
    type: 'near_expiry',
    level: 'yellow',
    title: 'Sắp hết hạn',
    message: 'Sữa tươi Vinamilk (lô 2024-11) hết hạn sau 7 ngày',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-003',
    type: 'out_of_stock',
    level: 'red',
    title: 'Hết hàng',
    message: 'Ly nhựa size M đã hết kho',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
]

export const notificationHandlers = [
  http.get(`${BASE_URL}/notifications`, () => {
    return HttpResponse.json({ statusCode: 200, message: 'OK', data: mockNotifications })
  }),
]
```

- [ ] **Step 3: Cập nhật handlers/index.ts**

```ts
// warehouse-ui/src/mocks/handlers/index.ts
import { authHandlers } from './auth.handler'
import { notificationHandlers } from './notification.handler'

export const handlers = [...authHandlers, ...notificationHandlers]
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add notification store and mock handler"
```

---

## Task 13: Dashboard types + mock data

**Files:**
- Create: `warehouse-ui/src/features/dashboard/types/dashboard.types.ts`
- Create: `warehouse-ui/src/features/dashboard/mocks/dashboard.mock.ts`
- Create: `warehouse-ui/src/mocks/handlers/dashboard.handler.ts`
- Modify: `warehouse-ui/src/mocks/handlers/index.ts`

- [ ] **Step 1: Tạo dashboard.types.ts**

```ts
// warehouse-ui/src/features/dashboard/types/dashboard.types.ts
export interface StatsOverview {
  totalMaterials: number
  totalStockValue: number
  lowStockCount: number
  nearExpiryCount: number
  outOfStockCount: number
  pendingImports: number
}

export interface CostChartPoint {
  date: string
  materials: number
  shipping: number
  other: number
}

export interface DashboardData {
  stats: StatsOverview
  costChart: CostChartPoint[]
}
```

- [ ] **Step 2: Tạo dashboard.mock.ts**

```ts
// warehouse-ui/src/features/dashboard/mocks/dashboard.mock.ts
import type { DashboardData } from '../types/dashboard.types'

export const mockDashboardData: DashboardData = {
  stats: {
    totalMaterials: 48,
    totalStockValue: 12_500_000,
    lowStockCount: 5,
    nearExpiryCount: 3,
    outOfStockCount: 1,
    pendingImports: 2,
  },
  costChart: Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      materials: Math.floor(Math.random() * 5_000_000) + 2_000_000,
      shipping: Math.floor(Math.random() * 500_000) + 100_000,
      other: Math.floor(Math.random() * 200_000) + 50_000,
    }
  }),
}
```

- [ ] **Step 3: Tạo dashboard.handler.ts**

```ts
// warehouse-ui/src/mocks/handlers/dashboard.handler.ts
import { http, HttpResponse } from 'msw'
import { mockDashboardData } from '@/features/dashboard/mocks/dashboard.mock'

const BASE_URL = import.meta.env.VITE_API_URL

export const dashboardHandlers = [
  http.get(`${BASE_URL}/dashboard`, () => {
    return HttpResponse.json({ statusCode: 200, message: 'OK', data: mockDashboardData })
  }),
]
```

- [ ] **Step 4: Cập nhật handlers/index.ts**

```ts
// warehouse-ui/src/mocks/handlers/index.ts
import { authHandlers } from './auth.handler'
import { notificationHandlers } from './notification.handler'
import { dashboardHandlers } from './dashboard.handler'

export const handlers = [...authHandlers, ...notificationHandlers, ...dashboardHandlers]
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add dashboard types, mock data, and API handler"
```

---

## Task 14: Dashboard hook + components

**Files:**
- Create: `warehouse-ui/src/features/dashboard/hooks/use-dashboard.ts`
- Create: `warehouse-ui/src/features/dashboard/hooks/use-dashboard.test.ts`
- Create: `warehouse-ui/src/features/dashboard/components/stats-card.tsx`
- Create: `warehouse-ui/src/features/dashboard/components/alert-panel.tsx`
- Create: `warehouse-ui/src/features/dashboard/components/cost-chart.tsx`

- [ ] **Step 1: Viết failing tests cho use-dashboard hook**

```ts
// warehouse-ui/src/features/dashboard/hooks/use-dashboard.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { useDashboard } from './use-dashboard'
import { mockDashboardData } from '../mocks/dashboard.mock'

const server = setupServer(
  http.get('http://localhost:3000/dashboard', () => {
    return HttpResponse.json({ statusCode: 200, message: 'OK', data: mockDashboardData })
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useDashboard', () => {
  it('khởi đầu ở trạng thái loading', () => {
    const { result } = renderHook(() => useDashboard())
    expect(result.current.isLoading).toBe(true)
  })

  it('load dữ liệu thành công', async () => {
    const { result } = renderHook(() => useDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.stats.totalMaterials).toBe(48)
  })

  it('trả về error khi API fail', async () => {
    server.use(
      http.get('http://localhost:3000/dashboard', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeTruthy()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

```bash
npm run test -- --run src/features/dashboard/hooks/use-dashboard.test.ts
```

Expected: `Cannot find module './use-dashboard'`

- [ ] **Step 3: Tạo use-dashboard.ts**

```ts
// warehouse-ui/src/features/dashboard/hooks/use-dashboard.ts
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/axios.instance'
import type { DashboardData } from '../types/dashboard.types'

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get<{ data: DashboardData }>('/dashboard')
      setData(res.data)
    } catch {
      setError('Không thể tải dữ liệu dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
```

- [ ] **Step 4: Chạy tests**

```bash
npm run test -- --run src/features/dashboard/hooks/use-dashboard.test.ts
```

Expected: `3 tests passed`

- [ ] **Step 5: Tạo stats-card.tsx**

```tsx
// warehouse-ui/src/features/dashboard/components/stats-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  variant?: 'default' | 'warning' | 'danger'
}

export function StatsCard({ title, value, icon: Icon, description, variant = 'default' }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon
          className={cn(
            'h-4 w-4',
            variant === 'warning' && 'text-yellow-500',
            variant === 'danger' && 'text-red-500',
            variant === 'default' && 'text-muted-foreground',
          )}
        />
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'text-2xl font-bold',
            variant === 'warning' && 'text-yellow-600',
            variant === 'danger' && 'text-red-600',
          )}
        >
          {value}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 6: Tạo alert-panel.tsx**

```tsx
// warehouse-ui/src/features/dashboard/components/alert-panel.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNotificationStore, type AlertLevel } from '@/stores/notification.store'
import { cn } from '@/lib/utils'

const levelStyles: Record<AlertLevel, string> = {
  red: 'bg-red-50 border-red-200 text-red-800',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  green: 'bg-green-50 border-green-200 text-green-800',
}

const badgeStyles: Record<AlertLevel, string> = {
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700',
}

export function AlertPanel() {
  const notifications = useNotificationStore((s) => s.notifications)
  const unread = notifications.filter((n) => !n.isRead)

  if (unread.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Không có cảnh báo mới.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          Cảnh báo
          <Badge variant="secondary">{unread.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {unread.slice(0, 5).map((n) => (
          <div
            key={n.id}
            className={cn('rounded-md border px-3 py-2 text-sm', levelStyles[n.level])}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{n.title}</span>
              <Badge className={cn('text-xs', badgeStyles[n.level])} variant="outline">
                {n.level === 'red' ? 'Khẩn' : n.level === 'yellow' ? 'Cảnh báo' : 'Thông tin'}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs opacity-80">{n.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 7: Tạo cost-chart.tsx**

```tsx
// warehouse-ui/src/features/dashboard/components/cost-chart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CostChartPoint } from '../types/dashboard.types'

interface CostChartProps {
  data: CostChartPoint[]
}

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value)
}

export function CostChart({ data }: CostChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Chi phí kho 7 ngày qua</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatVnd} tick={{ fontSize: 11 }} width={72} />
            <Tooltip formatter={(v: number) => formatVnd(v)} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="materials" name="Nguyên liệu" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="shipping" name="Vận chuyển" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="other" name="Khác" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add dashboard hook, stats card, alert panel, and cost chart"
```

---

## Task 15: Dashboard page + wire everything up

**Files:**
- Create: `warehouse-ui/src/features/dashboard/components/dashboard-page.tsx`
- Create: `warehouse-ui/src/features/dashboard/index.ts`

- [ ] **Step 1: Tạo dashboard-page.tsx**

```tsx
// warehouse-ui/src/features/dashboard/components/dashboard-page.tsx
import { useEffect } from 'react'
import { Package, AlertTriangle, Clock, XCircle, TrendingDown } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotificationStore } from '@/stores/notification.store'
import { useDashboard } from '../hooks/use-dashboard'
import { StatsCard } from './stats-card'
import { AlertPanel } from './alert-panel'
import { CostChart } from './cost-chart'

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard()
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{' '}
          <button onClick={refetch} className="underline">
            Thử lại
          </button>
        </div>
      </PageContainer>
    )
  }

  const { stats, costChart } = data!

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            title="Tổng nguyên vật liệu"
            value={stats.totalMaterials}
            icon={Package}
          />
          <StatsCard
            title="Tồn kho thấp"
            value={stats.lowStockCount}
            icon={TrendingDown}
            variant={stats.lowStockCount > 0 ? 'warning' : 'default'}
            description="nguyên vật liệu dưới mức tối thiểu"
          />
          <StatsCard
            title="Sắp hết hạn"
            value={stats.nearExpiryCount}
            icon={Clock}
            variant={stats.nearExpiryCount > 0 ? 'warning' : 'default'}
            description="còn dưới 30 ngày"
          />
          <StatsCard
            title="Hết hàng"
            value={stats.outOfStockCount}
            icon={XCircle}
            variant={stats.outOfStockCount > 0 ? 'danger' : 'default'}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CostChart data={costChart} />
          </div>
          <AlertPanel />
        </div>
      </div>
    </PageContainer>
  )
}
```

- [ ] **Step 2: Tạo features/dashboard/index.ts**

```ts
// warehouse-ui/src/features/dashboard/index.ts
export { DashboardPage } from './components/dashboard-page'
```

- [ ] **Step 3: Chạy toàn bộ tests**

```bash
npm run test -- --run
```

Expected: All tests pass. Không có test fail.

- [ ] **Step 4: Chạy dev server và verify UI**

```bash
npm run dev
```

Mở `http://localhost:5173`:
- Redirect về `/login` ✓
- Đăng nhập với `admin@trendcoffee.vn` / `password123` ✓
- Redirect về `/dashboard` ✓
- Sidebar hiển thị đúng navigation ✓
- Stats cards hiển thị số liệu mock ✓
- Bar chart hiển thị chi phí 7 ngày ✓
- Alert panel hiển thị 2 cảnh báo chưa đọc ✓

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete Phase 1 — scaffold, auth, layout, dashboard"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Monorepo structure (warehouse-ui + warehouse-api) | Task 1 |
| React 19.2 + Vite + TypeScript | Task 1 |
| shadcn/ui + Tailwind CSS v4 | Task 2 |
| Vitest setup | Task 3 |
| Axios + JWT auto-refresh interceptor | Task 5 |
| MSW v2 mock setup | Task 6 |
| Zustand auth store + hasPermission | Task 7 |
| Zustand ui store (sidebar toggle) | Task 7 |
| Login schema (Zod) + validation | Task 8 |
| Login hook (useLogin) | Task 8 |
| Login page + form | Task 9 |
| React Router v6 + AuthGuard | Task 10 |
| App sidebar (navigation + role-based admin items) | Task 11 |
| App header (notification bell + user dropdown) | Task 11 |
| Page container | Task 11 |
| Root layout | Task 11 |
| Notification store + mock | Task 12 |
| Dashboard types + mock data | Task 13 |
| useDashboard hook | Task 14 |
| Stats cards (total, low stock, near expiry, out of stock) | Task 14 |
| Alert panel (đỏ/vàng) | Task 14 |
| Cost chart (Recharts bar chart) | Task 14 |
| Dashboard page (loading/error/empty states) | Task 15 |
| Naming conventions (kebab-case files) | All tasks |
| VITE_USE_MOCK env toggle | Task 6 |

**Placeholder scan:** Không tìm thấy TBD, TODO, hay incomplete sections.

**Type consistency:** 
- `DashboardData` định nghĩa Task 13, dùng đúng trong Task 14 (`useDashboard`) và Task 15 (`dashboard-page`)
- `Notification` định nghĩa trong `notification.store.ts` (Task 12), dùng đúng trong `alert-panel.tsx` (Task 14)
- `User`, `AuthTokens`, `LoginResponse` từ Task 4, dùng đúng trong Tasks 6, 7, 8
- `StatsOverview`, `CostChartPoint` từ Task 13, dùng đúng trong Task 14-15
