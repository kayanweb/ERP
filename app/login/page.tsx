'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, IdCard, Hospital, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useLang } from '@/contexts/lang-context'
import { toast } from 'sonner'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { loginWithGoogle, loginWithEmployeeCode } = useAuth()
  const { lang, toggleLang } = useLang()
  const isAr = lang === 'ar'

  const [tab, setTab] = useState<'employee' | 'google'>('employee')
  const [empCode, setEmpCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empCode.trim() || !password.trim()) {
      toast.error(isAr ? 'أدخل كود الموظف وكلمة المرور' : 'Enter employee code and password')
      return
    }
    setIsLoading(true)
    try {
      const res = await loginWithEmployeeCode(empCode.trim(), password.trim())
      if (!res.success) {
        toast.error(isAr ? 'خطأ في بيانات الدخول' : 'Login failed', { description: res.error })
      } else if (res.mustChangePassword) {
        // Auth context already sets user state and redirects to /change-password
        router.push('/change-password')
      } else {
        toast.success(isAr ? 'مرحباً بك' : 'Welcome back!')
        router.push('/dashboard')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      toast.success(isAr ? 'تم تسجيل الدخول بـ Google' : 'Signed in with Google')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      toast.error(isAr ? 'فشل تسجيل الدخول بـ Google' : 'Google sign-in failed', { description: msg })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <button
        onClick={toggleLang}
        className="fixed top-4 left-4 px-3 py-1.5 rounded-full border border-teal-300 bg-white/80 text-xs font-bold text-teal-700 hover:bg-teal-50 transition-all shadow-sm z-50"
      >
        {isAr ? 'EN' : 'ع'}
      </button>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 shadow-lg">
              <Hospital className="h-9 w-9 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400">PRO Nurse</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isAr ? 'نظام إدارة التمريض المتكامل' : 'Integrated Nursing Management System'}
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{isAr ? 'تسجيل الدخول' : 'Sign In'}</CardTitle>
            <CardDescription>{isAr ? 'اختر طريقة تسجيل الدخول' : 'Choose your sign-in method'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setTab('employee')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${tab === 'employee' ? 'bg-white dark:bg-slate-800 shadow text-teal-700 dark:text-teal-400' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <IdCard className="h-4 w-4" />
                  {isAr ? 'كود الموظف' : 'Employee Code'}
                </span>
              </button>
              <button
                onClick={() => setTab('google')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${tab === 'google' ? 'bg-white dark:bg-slate-800 shadow text-teal-700 dark:text-teal-400' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <GoogleIcon />
                  Google
                </span>
              </button>
            </div>

            {tab === 'employee' && (
              <form onSubmit={handleEmployeeLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empCode">{isAr ? 'كود الموظف' : 'Employee Code'}</Label>
                  <div className="relative">
                    <IdCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="empCode"
                      type="text"
                      placeholder={isAr ? 'مثال: EMP001' : 'e.g. EMP001'}
                      className="pr-10 uppercase"
                      value={empCode}
                      onChange={(e) => setEmpCode(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{isAr ? 'كلمة المرور' : 'Password'}</Label>
                  <p className="text-xs text-muted-foreground -mt-1">
                    {isAr ? 'كلمة المرور الافتراضية هي كود الموظف' : 'Default password is your employee code'}
                  </p>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-10 pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {isAr ? 'جاري التحقق...' : 'Verifying...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {isAr ? 'تسجيل الدخول' : 'Sign In'}
                    </span>
                  )}
                </Button>
              </div>
            )}

            {tab === 'google' && (
              <div className="space-y-4 py-2">
                <p className="text-sm text-center text-muted-foreground">
                  {isAr ? 'سجّل دخولك باستخدام حساب Google الخاص بك' : 'Sign in using your Google account'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-3 h-11 border-2 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                >
                  {googleLoading
                    ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                    : <GoogleIcon />
                  }
                  <span className="font-medium">{isAr ? 'الدخول عبر Google' : 'Continue with Google'}</span>
                </Button>
                <p className="text-xs text-center text-muted-foreground px-4">
                  {isAr ? 'يتطلب ضبط Firebase — راجع ملف .env.local' : 'Requires Firebase setup — see .env.local file'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          {isAr ? 'نظام إدارة التمريض ©' : 'PRO Nurse ©'} {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
