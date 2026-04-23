---
name: ui-components
description: Trigger when building UI, using or creating components, designing screens, implementing interactive elements. Always check for existing components first before creating new ones. Reuse and compose when possible.
---

# UI Components Library

This project uses **shadcn/ui** (radix-nova style) with Tailwind CSS v4. Always check existing components before creating new ones.

## Checking & Installing Components

```bash
# Check what shadcn components are already installed
ls src/components/ui/

# Install a new shadcn component
npx shadcn@latest add <name> --yes
```

**Never edit files inside `src/components/ui/` manually for one-off styling.** Use the `className` prop instead.

---

## Available shadcn Components

button, input, label, select, dialog, popover, calendar, breadcrumb, badge, skeleton, sonner, table, tabs, textarea, dropdown-menu, separator, card, sheet, avatar

---

## Core Component Patterns

### Button

```tsx
import { Button } from '@/components/ui/button'

// Variants: default | outline | ghost | destructive
// Sizes: sm | default | lg | icon | icon-sm

<Button variant="outline" size="sm" onClick={handleClick}>
  Cancel
</Button>

<Button variant="destructive" onClick={handleDelete}>
  Delete
</Button>

<Button disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

### Input with Label and Error

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="flex flex-col gap-1.5">
  <Label htmlFor="name">Name</Label>
  <Input
    id="name"
    placeholder="Enter name"
    aria-invalid={!!errors.name}
    {...register('name')}
  />
  {errors.name && (
    <p className="text-sm text-destructive">{errors.name.message}</p>
  )}
</div>
```

### Select

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'

// DialogHeader has border-b
// DialogFooter has border-t + muted background
// Use sm:max-w-md for small dialogs, sm:max-w-2xl for large ones
// showCloseButton prop controls the X button

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-md" showCloseButton>
    <DialogHeader>
      <DialogTitle className="font-semibold">Dialog Title</DialogTitle>
    </DialogHeader>
    <div className="p-4">
      {/* content */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
      <Button type="submit">Lưu</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Popover

```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    {/* filter panel, dropdown content, etc. */}
  </PopoverContent>
</Popover>
```

### Calendar

```tsx
import { Calendar } from '@/components/ui/calendar'

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => date > new Date()}
/>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
  </TabsList>
  <TabsContent value="general">
    {/* general tab content */}
  </TabsContent>
  <TabsContent value="suppliers">
    {/* suppliers tab content */}
  </TabsContent>
</Tabs>
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge'

// Variants: default | outline | secondary | destructive
<Badge variant="outline">Active</Badge>
<Badge variant="destructive">Inactive</Badge>
```

### Skeleton (Loading States)

```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-10 w-full rounded-md" />
<Skeleton className="h-4 w-32" />
```

### Toast (Sonner)

```tsx
import { toast } from 'sonner'

toast.success('Saved successfully')
toast.error('Something went wrong')
```

---

## Form Pattern (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
})

type FormValues = z.infer<typeof schema>

export function MyForm({ onClose }: { onClose: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (data) => {
    // submit logic
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogFooter>
    </form>
  )
}
```

---

## List Page Pattern

```tsx
// Toolbar: search Input + FilterDropdown + action Button
// Then: table
<div className="flex items-center gap-2">
  <Input
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-64"
  />
  <FilterDropdown ... />
  <Button onClick={() => setDialogOpen(true)}>Add New</Button>
</div>

<Table>
  <TableHeader>...</TableHeader>
  <TableBody>...</TableBody>
</Table>
```

---

## Common Utility Components

### Confirm Dialog

Use the shared component — do NOT build a custom one:

```tsx
import { ConfirmDialog } from '@/components/common/confirm-dialog'

<ConfirmDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Delete item?"
  description="This action cannot be undone."
  onConfirm={handleDelete}
/>
```

### Filter Dropdown

```tsx
import { FilterDropdown } from '@/components/common/filter-dropdown'

<FilterDropdown
  label="Status"
  options={statusOptions}
  value={statusFilter}
  onChange={setStatusFilter}
/>
```

### Page Container

Use `PageContainer` if it exists, otherwise use a simple div:

```tsx
import { PageContainer } from '@/components/layout/page-container'
// or fallback:
<div className="p-6">...</div>
```

---

## Dark Mode

Always use semantic tokens — never hardcode `bg-white` or `text-gray-*`:

```tsx
// ✅ Correct — uses CSS variables, works in dark mode
<div className="bg-card text-foreground">
  <p className="text-muted-foreground">Subtitle</p>
</div>

// ❌ Wrong — hardcoded colors break dark mode
<div className="bg-white text-gray-900">
  <p className="text-gray-500">Subtitle</p>
</div>
```

| Semantic token          | Use case                     |
| ----------------------- | ---------------------------- |
| `bg-background`         | Page/root background         |
| `bg-card`               | Card, dialog, panel surfaces |
| `text-foreground`       | Primary text                 |
| `text-muted-foreground` | Secondary/label text         |
| `border-border`         | Dividers, input borders      |

---

## Creating New Components

Before creating anything new:

1. Check `ls src/components/ui/` — already installed?
2. Check `src/components/common/` — shared utility component?
3. Check `src/features/<domain>/components/` — domain component?
4. Build from shadcn primitives + className — avoid from-scratch implementations

### Component Template

```tsx
// src/features/<domain>/components/my-component.tsx
import { cn } from '@/lib/utils'

interface MyComponentProps {
  title: string
  variant?: 'default' | 'secondary'
  className?: string
}

export function MyComponent({ title, variant = 'default', className }: MyComponentProps) {
  return (
    <div
      className={cn(
        'rounded-md px-4 py-2',
        variant === 'secondary' && 'bg-muted',
        className,
      )}
    >
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
  )
}
```

---

**Rule**: Before creating any new UI element, check existing components. Use shadcn primitives + `className` prop. Never edit `src/components/ui/` files directly for one-offs.
