import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { router } from '@/router'

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <RouterProvider router={router} />
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </ThemeProvider>
  )
}
