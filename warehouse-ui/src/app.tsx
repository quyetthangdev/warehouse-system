import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { router } from '@/router'

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  )
}
