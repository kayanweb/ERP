'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Hospital, Clock, CheckCircle2, XCircle, RefreshCw, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useLang } from '@/contexts/lang-context'
import { getPendingUserById } from '@/lib/services/pending-users.service'
import { getUserById } from '@/lib/services/users.service'
import { isFirebaseConfigured } from '@/lib/firebase'

export default function PendingApprovalPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { lang, toggleLang } = useLang()
  const isAr = lang === 'ar'

  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [checking, setChecking] = useState(false)

  const checkStatus = useCallback(async () => {
    setChecking(true)
    try {
      if (!isFirebaseConfigured()) {
        router.push('/login')
        return
      }

      if (!user) {
        router.push('/login')
        return
      }

      const entry = await getPendingUserById(user.id)
      if (!entry) {
        router.push('/login')
        return
      }

      if (entry.status === 'approved' && entry.role) {
        setStatus('approved')
        // The admin's approve action already created the user record via approveUser()
        // Verify user exists then redirect
        const userExists = await getUserById(entry.id)
        if (userExists) {
          setTimeout(() => router.push('/dashboard'), 1500)
        } else {
          // User not yet created - should not happen, but handle gracefully
          setStatus('pending')
        }
      } else if (entry.status === 'rejected') {
        setStatus('rejected')
      } else {
        setStatus('pending')
      }
    } catch {
      setStatus('pending')
    } finally {
      setTimeout(() => setChecking(false), 600)
    }
  }, [router, user])

  // Auto-check every 10 seconds
  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [checkStatus])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Lang toggle */}
      <button
        onClick={toggleLang}
        className="fixed top-4 left-4 px-3 py-1.5 rounded-full border border-teal-300 bg-white/80 text-xs font-bold text-teal-700 hover:bg-teal-50 z-50 shadow-sm"
      >
        {isAr ? 'EN' : 'ع'}
      </button>

      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 shadow-lg">
              <Hospital className="h-9 w-9 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-teal-700 dark:text-teal-400">PRO Nurse</h1>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
          {/* Colored top bar */}
          <div className={`h-1.5 w-full ${
            status === 'approved' ? 'bg-green-500' :
            status === 'rejected' ? 'bg-red-500' :
            'bg-amber-400'
          }`} />

          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-5">
            {/* Icon */}
            {status === 'pending' && (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950 animate-pulse">
                <Clock className="h-10 w-10 text-amber-500" />
              </div>
            )}
            {status === 'approved' && (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            )}
            {status === 'rejected' && (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
            )}

            {/* Text */}
            {status === 'pending' && (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">
                    {isAr ? 'في انتظار الموافقة' : 'Awaiting Approval'}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                    {isAr
                      ? 'تم تسجيل طلبك بنجاح. يرجى الانتظار حتى يقوم المدير أو المسؤول بمراجعة طلبك ومنحك الصلاحيات المناسبة.'
                      : 'Your request has been submitted. Please wait for an admin or supervisor to review and assign your role.'}
                  </p>
                </div>

                {/* Steps */}
                <div className="w-full space-y-2 text-sm">
                  {[
                    { done: true,  ar: 'تسجيل الدخول بـ Google',      en: 'Signed in with Google' },
                    { done: true,  ar: 'إرسال طلب الوصول',            en: 'Access request submitted' },
                    { done: false, ar: 'مراجعة الطلب من المدير',       en: 'Admin review in progress' },
                    { done: false, ar: 'تفعيل الحساب ومنح الصلاحية', en: 'Account activation' },
                  ].map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${step.done ? 'bg-green-50 dark:bg-green-950/40' : 'bg-muted/50'}`}>
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.done ? 'bg-green-500 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      <span className={step.done ? 'text-green-700 dark:text-green-400 font-medium' : 'text-muted-foreground'}>
                        {isAr ? step.ar : step.en}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 w-full pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={checkStatus}
                    disabled={checking}
                  >
                    <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
                    {isAr ? 'تحديث الحالة' : 'Check Status'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-2 text-muted-foreground"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    {isAr ? 'خروج' : 'Logout'}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  {isAr ? 'يتم التحديث تلقائياً كل 10 ثوانٍ' : 'Auto-refreshes every 10 seconds'}
                </p>
              </>
            )}

            {status === 'approved' && (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
                    {isAr ? 'تمت الموافقة! 🎉' : 'Approved! 🎉'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {isAr ? 'تمت الموافقة على حسابك. جاري توجيهك للوحة التحكم...' : 'Your account has been approved. Redirecting to dashboard...'}
                  </p>
                </div>
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
              </>
            )}

            {status === 'rejected' && (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                    {isAr ? 'تم رفض الطلب' : 'Request Rejected'}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                    {isAr
                      ? 'تم رفض طلب وصولك. يرجى التواصل مع مدير النظام للمزيد من المعلومات.'
                      : 'Your access request was rejected. Please contact the system administrator for more information.'}
                  </p>
                </div>
                <Button onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
