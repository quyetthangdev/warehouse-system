---
name: animation
description: Trigger when writing animations, transitions, hover states, loading states, or any motion-related code. This is a warehouse management web app — keep animations minimal and functional.
---

# Animation & Transitions

This project uses **Tailwind CSS transition utilities** and **shadcn/ui's built-in Radix animations**. There is no Reanimated, no React Native Animated, no worklets, and no animation library — only CSS transitions.

---

## Golden Rules

```
1. Animations should be minimal — this is a data-heavy warehouse tool, not a consumer app.
2. Primary tool: Tailwind transition utilities (transition-colors, transition-opacity, duration-150).
3. Dialog/popover/sheet enter+exit: handled automatically by shadcn/ui Radix primitives.
4. Loading states: use the Skeleton component (CSS shimmer, no JS needed).
5. Chart animations: use Recharts' built-in isAnimationActive prop.
6. DO NOT add JS-based animations, spring physics, or heavy keyframe sequences.
```

---

## Tailwind Transition Utilities

Use these on interactive elements for a snappy, professional feel:

```tsx
// ✅ Color transition on hover (buttons, links, table rows)
<button className="bg-primary transition-colors duration-150 hover:bg-primary/90">
  Save
</button>

// ✅ Opacity fade for show/hide
<div className={cn('transition-opacity duration-150', isVisible ? 'opacity-100' : 'opacity-0')}>
  Tooltip content
</div>

// ✅ Table row hover highlight
<tr className="transition-colors duration-150 hover:bg-muted/50">
  ...
</tr>

// ✅ Icon button hover
<button className="rounded-md p-1.5 transition-colors duration-150 hover:bg-accent">
  <TrashIcon className="h-4 w-4" />
</button>
```

**Standard duration**: `duration-150` for interactive feedback. Use `duration-200` at most for slightly larger state changes. Avoid anything longer on frequently-clicked elements.

---

## shadcn/ui Built-in Animations

shadcn components (Dialog, Popover, Sheet, DropdownMenu, etc.) use `tw-animate-css` via `data-[state=open]` / `data-[state=closed]` attributes. These are already set up in `index.css` — **do not fight them**.

```tsx
// ✅ Just use the component — enter/exit animation is automatic
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* slides in on open, fades out on close — Radix handles it */}
  </DialogContent>
</Dialog>

// ✅ Same for Popover, Sheet, DropdownMenu, Tooltip
<Popover>
  <PopoverTrigger>...</PopoverTrigger>
  <PopoverContent>
    {/* animated automatically */}
  </PopoverContent>
</Popover>

// ❌ Do NOT manually animate Dialog visibility with CSS classes
// ❌ Do NOT add your own keyframes to override shadcn animation
```

---

## Loading States — Skeleton

Use the `Skeleton` component for content placeholders. It uses a CSS shimmer animation (no JS):

```tsx
import { Skeleton } from '@/components/ui/skeleton'

// Table loading state
function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  )
}

// Card loading state
function CardSkeleton() {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
```

---

## Chart Animations (Recharts)

Recharts has built-in animation via the `isAnimationActive` prop. Use it on first load; disable for real-time data updates:

```tsx
import { BarChart, Bar } from 'recharts'

// ✅ Animate on first render
<Bar dataKey="value" isAnimationActive={true} animationDuration={400} />

// ✅ Disable for live-updating charts to prevent jank
<Bar dataKey="value" isAnimationActive={false} />
```

---

## What NOT to Do

| Do not                                                    | Do instead                                            |
| --------------------------------------------------------- | ----------------------------------------------------- |
| Import `react-native-reanimated`                          | Use Tailwind `transition-*` utilities                 |
| Use `useSharedValue`, `useAnimatedStyle`, `withSpring`    | CSS transitions or shadcn built-ins                   |
| Write `worklet` functions                                 | Plain JS in event handlers                            |
| Use `runOnJS` or `scheduleTransitionTask`                 | No equivalent needed — web transitions are CSS-native |
| Import from `react-native` (`Animated`, `useColorScheme`) | Use Tailwind `dark:` prefix and React hooks           |
| Add `Reanimated` to package.json                          | It's a React Native library — wrong platform          |
| Use shared element transitions                            | Not applicable in this web app                        |
| Add `duration-500+` on hover states                       | Keep interactions at `duration-150`                   |
| Animate every state change                                | Reserve transitions for interactive feedback only     |

---

## Checklist — New Animation

- [ ] Is `transition-colors duration-150` enough? (Usually yes for hover states)
- [ ] Dialog/Popover/Sheet? → No extra animation needed, Radix handles it
- [ ] Loading state? → Use `<Skeleton>` component
- [ ] Chart? → Use Recharts `isAnimationActive`
- [ ] No Reanimated imports anywhere in the component
- [ ] No `useColorScheme` from `react-native` — use Tailwind `dark:` prefix
