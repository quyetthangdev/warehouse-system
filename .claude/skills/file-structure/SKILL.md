---
name: file-structure
description: Trigger when creating new files, adding features, creating components/hooks/services, moving files, or refactoring structure. Always place files in the correct directory following this structure.
---

# File & Folder Structure

## Project Root Structure

```
warehouse-system/
├── CLAUDE.md
└── warehouse-ui/           ← all React code lives here
    ├── src/
    │   ├── features/       ← one folder per domain
    │   │   ├── auth/       ← hooks/use-login.ts, components/login-page.tsx
    │   │   ├── dashboard/  ← types, hooks, components, mocks
    │   │   ├── units/      ← types, schemas, hooks, components, index.ts
    │   │   ├── materials/  ← same pattern as units
    │   │   └── suppliers/  ← same pattern as units
    │   ├── components/
    │   │   ├── ui/         ← shadcn primitives (DO NOT edit manually)
    │   │   ├── layout/     ← root-layout, app-header, app-sidebar, app-breadcrumb
    │   │   └── common/     ← filter-dropdown, confirm-dialog, page-container
    │   ├── services/       ← axios.instance.ts + optional domain service files
    │   ├── stores/         ← auth.store.ts, ui.store.ts, notification.store.ts
    │   ├── router/         ← index.tsx (createBrowserRouter), auth-guard.tsx
    │   ├── mocks/
    │   │   ├── browser.ts
    │   │   └── handlers/   ← one file per domain + index.ts barrel
    │   ├── types/          ← api.types.ts (global ApiResponse<T> etc.)
    │   ├── lib/            ← utils.ts (cn helper)
    │   ├── test/           ← setup.ts (Vitest global setup)
    │   └── index.css       ← Tailwind v4 @import + design tokens
    ├── public/
    │   └── mockServiceWorker.js
    ├── components.json     ← shadcn/ui config
    ├── vite.config.ts
    └── vitest.config.ts
```

## Feature Module Pattern

Every domain feature follows this exact layout:

```
src/features/<domain>/
├── types/<domain>.types.ts       ← TypeScript interfaces only (no Zod here)
├── schemas/<domain>.schema.ts    ← Zod schema + inferred FormValues type
├── hooks/
│   ├── use-<domain>.ts           ← data fetching + mutation functions hook
│   └── use-<domain>.test.ts      ← Vitest tests, colocated (NOT in __tests__/)
├── components/
│   ├── <domain>-list-page.tsx    ← full page component
│   └── <domain>-dialog.tsx       ← create/edit dialog
├── mocks/<domain>.mock.ts        ← static mock data consumed by MSW handlers
└── index.ts                      ← barrel export for the feature
```

### Example — `units` feature

```
src/features/units/
├── types/unit.types.ts
├── schemas/unit.schema.ts
├── hooks/
│   ├── use-units.ts
│   └── use-units.test.ts
├── components/
│   ├── unit-list-page.tsx
│   └── unit-dialog.tsx
├── mocks/unit.mock.ts
└── index.ts
```

## Directory Details & Rules

### `src/features/<domain>/` — Feature Modules

- **types/**: pure TypeScript `interface` and `type` declarations, no runtime code.
- **schemas/**: Zod schemas for form validation; export both the schema and the inferred `FormValues` type.
- **hooks/**: one hook file per domain; tests sit right next to the hook file (colocated).
- **components/**: page component + dialog component per domain.
- **mocks/**: raw mock arrays/objects used by MSW handlers — no React code here.
- **index.ts**: re-exports everything the rest of the app needs from this feature.

### `src/components/ui/` — shadcn Primitives

- **Never edit manually** — all changes go through the CLI:
  ```
  npx shadcn@latest add <component> --yes
  ```
- Never create a barrel `index.ts` for this folder.
- Apply one-off style overrides via `className` prop at the call site.

### `src/components/layout/` — App Shell

- `root-layout.tsx` — wraps the entire app (providers, MSW init)
- `app-header.tsx` — top navigation bar
- `app-sidebar.tsx` — collapsible sidebar
- `app-breadcrumb.tsx` — breadcrumb derived from current route

### `src/components/common/` — Shared UI Helpers

Reusable non-shadcn components:

- `filter-dropdown.tsx`
- `confirm-dialog.tsx`
- `page-container.tsx`

### `src/services/` — HTTP Layer

- `axios.instance.ts` — configured Axios instance with auth interceptor; **this is the only Axios instance in the app**.
- Optional domain service files (e.g., `unit.service.ts`) if the hook becomes too large; simple fetches can live directly in the hook.

### `src/stores/` — Zustand State

| File                     | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `auth.store.ts`          | token, user info, login/logout actions       |
| `ui.store.ts`            | sidebar open/close, theme toggle             |
| `notification.store.ts`  | toast queue consumed by Sonner               |

### `src/router/` — React Router v6

- `index.tsx` — `createBrowserRouter` with all route definitions.
- `auth-guard.tsx` — `<Outlet>` wrapper that redirects unauthenticated users.

### `src/mocks/` — MSW (Mock Service Worker)

```
src/mocks/
├── browser.ts          ← setupWorker(...handlers)
└── handlers/
    ├── unit.handler.ts
    ├── material.handler.ts
    ├── supplier.handler.ts
    ├── auth.handler.ts
    └── index.ts        ← [...unitHandlers, ...materialHandlers, ...]
```

### `src/types/` — Global Types

- `api.types.ts` — `ApiResponse<T>`, `PaginatedData<T>`, and other shared interfaces.

### `src/lib/` — Utilities

- `utils.ts` — exports the `cn` helper (`clsx` + `tailwind-merge`).

### `src/test/` — Test Setup

- `setup.ts` — Vitest setup file (MSW server start/reset/stop, `@testing-library/jest-dom` matchers).

### `src/index.css` — Tailwind v4 Entry

```css
@import "tailwindcss";

@theme inline {
  --color-primary: var(--primary);
  /* ... other token mappings */
}

:root {
  --primary: oklch(0.736 0.184 29.8);
  /* ... */
}
```

## File & Export Naming Conventions

| Category         | Location                          | File name        | Export style        |
| ---------------- | --------------------------------- | ---------------- | ------------------- |
| Page component   | `features/<d>/components/`        | kebab-case.tsx   | Named PascalCase    |
| Dialog component | `features/<d>/components/`        | kebab-case.tsx   | Named PascalCase    |
| Hook             | `features/<d>/hooks/`             | use-kebab.ts     | Named camelCase     |
| Hook test        | `features/<d>/hooks/`             | use-kebab.test.ts| —                   |
| Types            | `features/<d>/types/`             | kebab.types.ts   | Named (no `I` prefix) |
| Schema           | `features/<d>/schemas/`           | kebab.schema.ts  | Named               |
| Mock data        | `features/<d>/mocks/`             | kebab.mock.ts    | Named const         |
| MSW handler      | `mocks/handlers/`                 | kebab.handler.ts | Named array         |
| Service          | `services/`                       | kebab.service.ts | Named functions     |
| Common component | `components/common/`              | kebab-case.tsx   | Named PascalCase    |
| Layout component | `components/layout/`              | kebab-case.tsx   | Named PascalCase    |

**Rules:**

- kebab-case for all file names.
- PascalCase for React component exports.
- camelCase for hook and util exports.
- No `I` prefix on interfaces.
- No barrel `index.ts` for `src/components/ui/`.
- Each feature has exactly one `index.ts` barrel at `src/features/<domain>/index.ts`.

## Import Path Alias

`@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`).

```ts
import { api } from '@/services/axios.instance'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types/api.types'
import { UnitListPage } from '@/features/units'
import { Button } from '@/components/ui/button'   // no barrel for ui/
```

## Adding a New Feature

1. Create the folder tree under `src/features/<domain>/`.
2. Add the MSW handler file at `src/mocks/handlers/<domain>.handler.ts`.
3. Spread the handler array into `src/mocks/handlers/index.ts`.
4. Add the route to `src/router/index.tsx`.
5. Export the page component from `src/features/<domain>/index.ts`.

## Rules Summary

- **Never** use React Native, Expo, or NativeWind — this is a Vite + React 18 web app.
- **Never** use React Query — state is `useState` + `useEffect` for reads, async functions for mutations.
- **Never** edit `src/components/ui/` files directly — use the shadcn CLI.
- **Never** hardcode colors or create a new Axios instance — use tokens and the shared `api` instance.
- Service files are optional; simple fetches may live directly in the hook.
