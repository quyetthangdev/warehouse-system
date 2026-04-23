---
name: security-review
description: Trigger when writing auth flows, API interceptors, token handling, form validation, environment variables, or any code that touches user credentials or external input. Ensures OWASP Web Top 10 compliance for this React web app.
---

# Security Review

This is an **internal warehouse management web app** for a coffee chain. It handles staff login credentials but has no payment flows and minimal PII. Apply OWASP Web Top 10 principles — not mobile security patterns.

---

## 1. Auth Token Storage

```ts
// ✅ Acceptable for this internal tool: localStorage via Zustand persist
// Zustand's persist middleware writes to localStorage automatically
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      setToken: (token: string) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: 'auth-storage' },
  ),
)

// ❌ NEVER use httpOnly-less cookies manually (less ergonomic, same risk)
// ❌ NEVER store tokens in sessionStorage for a persistent login experience
// ❌ NEVER store tokens as plain JS variables that survive hot reload
```

**What to check:**

- Token is read from `auth.store`, not scattered in component state
- `logout()` clears the entire auth store (and any other user-related stores)
- No token logged via `console.log`

---

## 2. API Calls

All HTTP calls go through the axios instance — never construct raw fetch calls in components:

```ts
// ✅ Axios instance with Bearer token injected by interceptor
// File: src/lib/axios.ts (or similar)
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ❌ Never inject token manually in a component
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` }, // wrong layer
})
```

**What to check:**

- All API calls use the shared axios instance, not raw `fetch`
- No `console.log` of API responses that contain user data
- Error responses from the API are mapped to friendly messages — raw API errors never shown directly in UI

---

## 3. Input Validation

Always validate with a Zod schema before sending data to the API. Never trust client-side input alone:

```ts
// ✅ Zod schema enforces types, lengths, and formats
const materialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  supplierId: z.string().uuid(),
})

// ❌ Raw form values sent directly to API without validation
await createMaterial({ name: formName, code: formCode })
```

**What to check:**

- Every form uses a Zod schema via `zodResolver`
- String fields have `max()` constraints to prevent oversized payloads
- ID fields are validated as UUID or expected format before API calls

---

## 4. XSS Prevention

React escapes JSX output by default. Keep it that way:

```tsx
// ✅ React escapes this automatically
<span>{userInput}</span>

// ❌ NEVER use dangerouslySetInnerHTML with user-controlled data
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**What to check:**

- Zero usage of `dangerouslySetInnerHTML` with dynamic data
- No `eval()`, `new Function()`, or `document.write()` calls
- If markdown rendering is ever added, use a sanitized library (DOMPurify)

---

## 5. Environment Variables

```bash
# ✅ Safe for client — bundled by Vite, visible in browser
VITE_API_URL=https://api.internal.example.com

# ❌ NEVER put real secrets in VITE_* vars (they end up in the JS bundle)
VITE_DB_PASSWORD=...        # NEVER
VITE_SECRET_KEY=...         # NEVER
```

**What to check:**

- `VITE_API_URL` is the only env var the frontend reads
- `.env.local` is in `.gitignore` and never committed
- No API keys, passwords, or private tokens in any `VITE_*` variable

---

## 6. Form Security

```ts
// ✅ Zod enforces types + constraints before any API call
// ✅ isSubmitting guard prevents double-submission
const { handleSubmit, formState: { isSubmitting } } = useForm({
  resolver: zodResolver(schema),
})

<Button type="submit" disabled={isSubmitting}>Save</Button>

// ❌ Submit handler called multiple times because button not disabled
```

---

## 7. MSW (Dev-Only Mock Service Worker)

MSW must never run in production:

```ts
// ✅ Guard with import.meta.env.DEV
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser')
  await worker.start()
}

// ❌ Starting MSW unconditionally
worker.start()
```

**What to check:**

- MSW start call is wrapped in `import.meta.env.DEV` check
- Mock files are not imported in production bundles

---

## 8. TypeScript Strict Mode

`strict: true` in `tsconfig.json` eliminates entire classes of runtime bugs:

- No implicit `any` — every variable has a known type
- Strict null checks — `undefined` access caught at compile time
- Exact optional property types

Run `npx tsc --noEmit` (or the stop-typecheck hook) before every commit.

---

## Anti-Patterns Summary

| Do not                                   | Do instead                                      |
| ---------------------------------------- | ----------------------------------------------- |
| Store token outside Zustand persist      | Use Zustand `persist` middleware                |
| Inject Bearer token in component code    | Let the axios interceptor do it                 |
| Send raw form values to API              | Validate with Zod schema first                  |
| Use `dangerouslySetInnerHTML`            | Let React escape output naturally               |
| Put secrets in `VITE_*` vars            | Keep secrets server-side only                   |
| Start MSW in production                  | Guard with `import.meta.env.DEV`                |
| Show raw API error messages in UI        | Map to user-friendly messages                   |
| Skip `disabled={isSubmitting}` on submit | Always guard the submit button with isSubmitting |
| Use SecureStore / AsyncStorage           | This is a web app — those are React Native APIs |
| Add payment flows                        | Out of scope for this internal warehouse tool   |
