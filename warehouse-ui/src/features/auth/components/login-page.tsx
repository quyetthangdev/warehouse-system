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
