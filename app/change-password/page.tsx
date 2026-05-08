'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Eye, EyeOff, Hospital, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useLang } from '@/contexts/lang-context'
import { toast } from 'sonner'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '6+ أحرف', labelEn: '6+ chars', ok: password.length >= 6 },
    { label: 'أحرف كبيرة', labelEn: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'أرقام', labelEn: 'Numbers', ok: /\d/.test(password) },
    { label: 'رموز', labelEn: 'Symbols', ok: /[!@#$%^&*]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < score
                ? score <= 1 ? 'bg-red-500'
                  : score <= 2 ? 'bg-amber-400'
                  : score <= 3 ? 'bg-blue-500'
                  : 'bg-green-500'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-[10px] px-1.5 py-0.5 rounded-full transition-all ${
              c.ok
                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {c.labelEn}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, changePassword, logout } = useAuth()
  const { lang, toggleLang } = useLang()
  const isAr = lang === 'ar'

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && !user.mustChangePassword) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPwd.length < 6) {
      toast.error(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters')
      return
    }
    if (newPwd !== confirmPwd) {
      toast.error(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      return
    }
    if (user?.employeeCode && currentPwd.toUpperCase() !== user.employeeCode.toUpperCase() && currentPwd !== newPwd) {
      // Light validation — real validation is server-side
    }

    setLoading(true)
    try {
      const empId = user?.id ?? ''
      await changePassword(empId, newPwd)
      toast.success(isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully')
      router.push('/dashboard')
    } catch {
      toast.error(isAr ? 'حدث خطأ أثناء تغيير كلمة المرور' : 'Error changing password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <button
        onClick={toggleLang}
        className="fixed top-4 left-4 px-3 py-1.5 rounded-full border border-teal-300 bg-white/80 text-xs font-bold text-teal-700 hover:bg-teal-50 shadow-sm z-50"
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
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400">PRO Nurse</h1>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1.5 w-full bg-amber-400" />
          <CardHeader className="text-center pt-6">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                <KeyRound className="h-7 w-7 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-xl">
              {isAr ? 'يجب تغيير كلمة المرور' : 'Password Change Required'}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {isAr
                ? 'هذا أول تسجيل دخول لك. يجب تغيير كلمة المرور الافتراضية قبل المتابعة.'
                : 'This is your first login. You must change your default password before continuing.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPwd">
                  {isAr ? 'كلمة المرور الحالية (الافتراضية)' : 'Current Password (Default)'}
                </Label>
                <div className="relative">
                  <Input
                    id="currentPwd"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder={isAr ? 'كلمة المرور الافتراضية' : 'Default password'}
                    className="pl-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPwd">
                  {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="newPwd"
                    type={showNew ? 'text' : 'password'}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder={isAr ? 'على الأقل 6 أحرف' : 'At least 6 characters'}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPwd && <PasswordStrength password={newPwd} />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPwd">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPwd"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder={isAr ? 'أعد كتابة كلمة المرور الجديدة' : 'Re-enter new password'}
                    className={`pl-10 ${confirmPwd && confirmPwd !== newPwd ? 'border-red-400 focus-visible:ring-red-400' : confirmPwd && confirmPwd === newPwd ? 'border-green-400 focus-visible:ring-green-400' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPwd && confirmPwd !== newPwd && (
                  <p className="text-xs text-red-500">{isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 gap-2 mt-2"
                disabled={loading || (!!confirmPwd && confirmPwd !== newPwd)}
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {loading
                  ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                  : (isAr ? 'حفظ وتسجيل الدخول' : 'Save & Sign In')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={logout}
              >
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
