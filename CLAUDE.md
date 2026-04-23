# Warehouse System — Claude Guidelines

## Project Overview

**TREND COFFEE WAREHOUSE** — hệ thống quản lý kho nguyên vật liệu cho chuỗi cà phê.

Monorepo với một workspace:
- `warehouse-ui/` — React + TypeScript frontend (Vite, Tailwind v4, shadcn/ui)

Backend chưa có; toàn bộ API được mock bằng MSW trong quá trình phát triển.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) + shadcn/ui (radix-nova) |
| State | Zustand |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Data fetching | Axios (custom instance) |
| API mocking | MSW (Mock Service Worker) |
| Testing | Vitest + Testing Library (jsdom) |
| Charts | Recharts |

---

## File Structure

```
warehouse-system/
├── CLAUDE.md                   ← you are here
└── warehouse-ui/
    ├── src/
    │   ├── features/           ← domain modules (see below)
    │   ├── components/
    │   │   ├── ui/             ← shadcn primitives (do NOT edit manually)
    │   │   ├── layout/         ← RootLayout, AppHeader, AppSidebar, AppBreadcrumb
    │   │   └── common/         ← shared reusable components
    │   ├── services/           ← axios-based API calls (one file per domain)
    │   ├── stores/             ← Zustand stores (auth, ui, notification)
    │   ├── router/             ← createBrowserRouter + AuthGuard
    │   ├── mocks/
    │   │   ├── browser.ts      ← MSW browser setup
    │   │   └── handlers/       ← one handler file per domain + index.ts
    │   ├── lib/utils.ts        ← cn() and shared utils
    │   ├── types/              ← global types (api.types.ts)
    │   ├── index.css           ← Tailwind v4 + design tokens
    │   └── test/setup.ts       ← Vitest global setup
    └── public/mockServiceWorker.js
```

### Feature module structure (follow exactly)

Every feature under `src/features/<domain>/` has:

```
<domain>/
├── types/<domain>.types.ts       ← TypeScript interfaces only
├── schemas/<domain>.schema.ts    ← Zod schema + inferred FormValues type
├── hooks/
│   ├── use-<domain>.ts           ← data fetching + mutations hook
│   └── use-<domain>.test.ts      ← Vitest tests (colocated)
├── components/
│   ├── <domain>-list-page.tsx    ← page component
│   └── <domain>-dialog.tsx       ← create/edit dialog
├── services/<domain>.service.ts  ← axios calls (optional if simple)
├── mocks/<domain>.mock.ts        ← mock data for MSW handlers
└── index.ts                      ← barrel export
```

---

## Design System

- **Primary color**: `oklch(0.736 0.184 29.8)` = #FF8614 (TREND COFFEE orange)
- **Font**: Roboto Flex Variable (`@fontsource-variable/roboto-flex`)
- **Tokens**: CSS custom properties in `src/index.css`, mapped via `@theme inline`
- **Tailwind v4**: CSS variables use oklch — never wrap in `hsl()`. Use `var(--primary)` or `fill-primary` via CSS class.
- **Dark mode**: use semantic tokens (`bg-card`, `bg-background`, `text-foreground`) — never `bg-white` or `text-black`

### shadcn components

- Install with `npx shadcn@latest add <component> --yes`
- Do NOT edit files in `src/components/ui/` manually unless standardizing shared behavior (e.g., dialog.tsx spacing)

---

## Git Workflow

### Branch naming

```
feature/<scope>-<short-description>   # new features
fix/<scope>-<short-description>       # bug fixes
chore/<description>                   # tooling, deps, config
```

Current active branch: `feature/phase2-master-data`
Base branch: `main`

### Commit format — Conventional Commits

```
feat: <description>          # new feature
fix: <description>           # bug fix
refactor: <description>      # code restructure, no behavior change
chore: <description>         # tooling, deps
style: <description>         # UI/CSS only, no logic change
test: <description>          # tests only
```

Rules:
- One logical unit per commit (don't bundle unrelated changes)
- Never commit `.superpowers/`, `docs/*.png`, or `node_modules/`
- Stage specific files — avoid `git add .`
- Always run `npx tsc --noEmit` before committing

### PR flow

`feature/*` → PR → `main`

---

## Running the Project

```bash
# Dev server (warehouse-ui)
cd warehouse-ui && npm run dev
# or from root:
npm run ui:dev

# Type check
cd warehouse-ui && npx tsc --noEmit

# Tests
cd warehouse-ui && npm test
# or from root:
npm run ui:test

# Build
cd warehouse-ui && npm run build
```

Dev server: `http://localhost:5173`

---

## API & Mock Pattern

All API calls are intercepted by MSW in development. No real backend.

### Adding a new endpoint

1. Add handler in `src/mocks/handlers/<domain>.handler.ts`:
```ts
http.get('/api/<domain>', () => HttpResponse.json({ ok: true, data: [...] }))
```

2. Export from `src/mocks/handlers/index.ts`

3. Add mock data in `src/features/<domain>/mocks/<domain>.mock.ts`

### API response shape

All endpoints return `ApiResponse<T>`:
```ts
{ ok: boolean; data: T; message?: string }
```

Mutations return `{ ok: boolean; message: string }`.

---

## Hook pattern

Hooks use `useState` + `useEffect` for fetching, and call service functions for mutations. They return `{ data, isLoading, error, refetch, create<X>, update<X>, delete<X> }`.

Mutation responses follow `{ ok, message }` — always handle both `ok: true` and `ok: false` cases.

Example:
```ts
async function createUnit(values: UnitFormValues) {
  const res = await unitService.create(values)
  if (!res.ok) throw new Error(res.message)
}
```

---

## Testing Conventions

- Framework: **Vitest** with `jsdom` environment
- Colocate tests next to source: `use-units.test.ts` beside `use-units.ts`
- Test hooks with `@testing-library/react` `renderHook`
- Mock MSW handlers are reused in tests via `src/test/setup.ts`
- Test IDs: prefer accessible queries (`getByRole`, `getByLabelText`) over `getByTestId`

```bash
npm test                    # watch mode
npm test -- --run           # single run
npm test -- --run --reporter=verbose
```

---

## Common Mistakes to Avoid

- **Never** use `bg-white` — use `bg-card` or `bg-background`
- **Never** use `hsl(var(--primary))` — the variable is oklch, not HSL values
- **Never** edit `src/components/ui/` shadcn primitives for one-off style fixes — override via className
- **Never** put business logic in page components — it belongs in hooks
- **Never** skip TypeScript check before committing
- **Don't** add a new shadcn component by hand — use the CLI

---

## Pages Status

| Route | Page | Status |
|---|---|---|
| `/dashboard` | Tổng quan | ✅ Done |
| `/units` | Đơn vị tính | ✅ Done |
| `/materials` | Nguyên vật liệu | ✅ Done |
| `/suppliers` | Nhà cung cấp | ✅ Done |
| `/inventory` | Tồn kho | 🔲 Pending |
| `/import-forms` | Nhập kho | 🔲 Pending |
| `/export-forms` | Xuất kho | 🔲 Pending |
| `/balance-forms` | Kiểm kho | 🔲 Pending |
| `/payments` | Chi phí | 🔲 Pending |
| `/reports` | Báo cáo | 🔲 Pending |
| `/users` | Người dùng | 🔲 Pending |
| `/settings` | Cài đặt | 🔲 Pending |
