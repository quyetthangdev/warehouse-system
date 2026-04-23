---
name: design-tokens
description: Trigger when creating components, updating styles, adding colors, or working with typography, spacing, shadows, or design tokens. Always reference these tokens when styling UI elements in this React + Tailwind CSS v4 web app.
---

# Design Tokens & Theme System

This project uses **Tailwind CSS v4** with `@import "tailwindcss"`. Colors are defined in **oklch** color space as CSS custom properties in `src/index.css`. There is no `tailwind.config.js` — all configuration is in CSS.

**No NativeWind. No React Native. No HSL values.**

## How Tokens Work

```css
/* src/index.css */
@import "tailwindcss";

/* 1. Define CSS custom properties (oklch) */
:root {
  --primary: oklch(0.736 0.184 29.8);
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... */
}

/* 2. Map to Tailwind utility classes */
@theme inline {
  --color-primary:          var(--primary);
  --color-background:       var(--background);
  --color-foreground:       var(--foreground);
  --color-card:             var(--card);
  --color-muted:            var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border:           var(--border);
  --color-destructive:      var(--destructive);
  --color-sidebar:          var(--sidebar);
  --color-sidebar-primary:  var(--sidebar-primary);
}
```

Once mapped, Tailwind generates `bg-primary`, `text-primary`, `border-primary`, `fill-primary`, `ring-primary`, etc. automatically.

## Token Reference

### Light Mode (`:root`)

| CSS Variable          | oklch Value                   | Approx Hex | Tailwind Class(es)                         |
| --------------------- | ----------------------------- | ---------- | ------------------------------------------ |
| `--primary`           | `oklch(0.736 0.184 29.8)`     | #FF8614    | `bg-primary` `text-primary` `border-primary` `fill-primary` |
| `--background`        | `oklch(1 0 0)`                | #FFFFFF    | `bg-background`                            |
| `--foreground`        | `oklch(0.145 0 0)`            | ~#111      | `text-foreground`                          |
| `--card`              | `oklch(1 0 0)`                | #FFFFFF    | `bg-card`                                  |
| `--muted`             | `oklch(0.97 0 0)`             | ~#F7F7F7   | `bg-muted`                                 |
| `--muted-foreground`  | `oklch(0.672 0 0)`            | ~#6B7280   | `text-muted-foreground`                    |
| `--border`            | `oklch(0.922 0 0)`            | ~#E5E7EB   | `border-border` `divide-border`            |
| `--destructive`       | `oklch(0.628 0.258 29.2)`     | ~#EF4444   | `bg-destructive` `text-destructive`        |
| `--sidebar`           | `oklch(1 0 0)`                | #FFFFFF    | `bg-sidebar`                               |
| `--sidebar-primary`   | same as `--primary`           | #FF8614    | `bg-sidebar-primary` `text-sidebar-primary` |
| `--radius`            | `0.5rem`                      | —          | `rounded-lg` `rounded-md` `rounded-sm`    |

### Dark Mode (`.dark`)

Dark mode variables are declared under `.dark { }` in `src/index.css` and switch automatically:

| CSS Variable    | Dark oklch Value          |
| --------------- | ------------------------- |
| `--primary`     | `oklch(0.656 0.164 29.8)` |
| `--card`        | `oklch(0.205 0 0)`        |
| `--background`  | `oklch(0.145 0 0)`        |
| `--foreground`  | `oklch(0.985 0 0)`        |

Components automatically use dark values when the `.dark` class is on `<html>` — no extra code needed.

## Typography

**Font**: Roboto Flex Variable  
**Package**: `@fontsource-variable/roboto-flex`  
**Import**: `import '@fontsource-variable/roboto-flex'` (in `main.tsx` or `index.css`)

Standard weight/size classes:

```tsx
<h1 className="text-2xl font-bold text-foreground" />
<p  className="text-sm text-muted-foreground" />
<span className="text-base font-medium text-foreground" />
```

## Tailwind Class Rules

### Always use semantic tokens

```tsx
// ✅ Correct
<div className="bg-card text-foreground border border-border rounded-lg p-4" />
<button className="bg-primary text-white rounded-md px-4 py-2" />
<p className="text-muted-foreground text-sm" />

// ❌ Wrong — hardcoded colors break dark mode and theme consistency
<div className="bg-white text-black" />
<div style={{ backgroundColor: '#FF8614' }} />
<div className="bg-orange-500" />
```

### NEVER use HSL with these variables

The CSS variables are oklch values, **not** HSL channel triplets. The following will produce broken output:

```css
/* ❌ NEVER */
background-color: hsl(var(--primary));   /* --primary is oklch, not hsl channels */
color: hsl(var(--foreground));
```

Instead, always use the Tailwind utility classes (which resolve through `@theme inline`):

```tsx
// ✅ Correct
<div className="bg-primary" />        /* resolves to oklch(0.736 0.184 29.8) */
<div className="text-foreground" />
```

### NEVER hardcode oklch inline in className

```tsx
// ❌ Wrong
<div className="bg-[oklch(0.736_0.184_29.8)]" />

// ✅ Correct — define a CSS var in index.css first, then map in @theme
```

### bg-card not bg-white

```tsx
// ❌ Wrong
<div className="bg-white" />

// ✅ Correct
<div className="bg-card" />
```

## Border Radius

Defined via `--radius: 0.5rem`:

| Class        | Value                        |
| ------------ | ---------------------------- |
| `rounded-sm` | `calc(var(--radius) - 4px)`  |
| `rounded-md` | `calc(var(--radius) - 2px)`  |
| `rounded-lg` | `var(--radius)` = 0.5rem     |
| `rounded-xl` | `calc(var(--radius) + 4px)`  |
| `rounded-full` | 9999px (avatars, badges)   |

## Spacing

Standard scales — use Tailwind classes, not inline styles:

```tsx
// Compact
<div className="px-3 py-2" />
// Standard
<div className="px-4 py-3" />
// Spacious
<div className="px-6 py-4" />
// Page-level
<div className="px-8 py-6" />
```

## SVG / Recharts Fill

For Recharts or raw SVG that needs the brand color, use the `fill-primary` utility class or the CSS custom property:

```tsx
// Recharts bar fill via Tailwind selector
<BarChart className="[&_.recharts-bar-rectangle_.recharts-rectangle]:fill-primary" />

// Inline SVG
<svg className="fill-primary" />

// If you must use a raw CSS value (avoid where possible):
fill: oklch(0.736 0.184 29.8)
```

## shadcn/ui Components

### Installation (only via CLI)

```bash
npx shadcn@latest add <component> --yes
```

### Installed components

`avatar` `badge` `breadcrumb` `button` `card` `calendar` `dialog` `dropdown-menu` `input` `label` `popover` `select` `separator` `sheet` `skeleton` `sonner` `table` `tabs` `textarea`

### Usage rules

- **Never** edit files under `src/components/ui/` manually. Apply one-off style overrides via `className` at the call site.
- Dialog layout convention: `p-6` padding on content, `border-b` on `DialogHeader`, `bg-muted/40` on footer.

```tsx
// Standard dialog structure
<Dialog>
  <DialogContent className="sm:max-w-md">
    <DialogHeader className="border-b pb-4">
      <DialogTitle>Edit Unit</DialogTitle>
    </DialogHeader>
    <div className="p-6">
      {/* form content */}
    </div>
    <DialogFooter className="bg-muted/40 px-6 py-4">
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Quick Reference — Do / Don't

| Do NOT                                  | Do instead                                    |
| --------------------------------------- | --------------------------------------------- |
| `hsl(var(--primary))`                   | `bg-primary` / `text-primary`                 |
| `bg-white` for element backgrounds      | `bg-card`                                     |
| `text-black` / `text-gray-900`          | `text-foreground`                             |
| `text-gray-500`                         | `text-muted-foreground`                       |
| `border-gray-200`                       | `border-border`                               |
| Inline oklch in `className`             | define a `--css-var` first, then `@theme` it  |
| Import colors from a constants file     | use Tailwind utility classes                  |
| `style={{ color: '#FF8614' }}`          | `className="text-primary"`                    |
| Any NativeWind / React Native class     | standard Tailwind CSS utility classes         |
| `<View>`, `<Text>`, `<Pressable>`       | `<div>`, `<p>`, `<button>`                    |
