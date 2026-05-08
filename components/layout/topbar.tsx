'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  Bell,
  Moon,
  Sun,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Clock,
  UserCheck,
  Shield,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useLang } from '@/contexts/lang-context'
import { useRouter } from 'next/navigation'
import { getPendingUsers } from '@/lib/pending-users'
import Link from 'next/link'

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const { user, logout, can } = useAuth()
  const { lang, toggleLang } = useLang()
  const router = useRouter()
  const [pendingCount, setPendingCount] = React.useState(0)

  React.useEffect(() => {
    const refresh = async () => {
      if (can('users.approve')) {
        const list = await getPendingUsers()
        setPendingCount(list.filter((u) => u.status === 'pending').length)
      }
    }
    refresh()
    const interval = setInterval(refresh, 8000)
    return () => clearInterval(interval)
  }, [can])
  const [currentTime, setCurrentTime] = React.useState<string>('')

  React.useEffect(() => {
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US'
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleString(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [lang])

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-mr-1" />
      <Separator orientation="vertical" className="mx-2 h-4" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={lang === 'ar' ? 'البحث...' : 'Search...'}
          className="pr-9 bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      <div className="flex-1" />

      {/* Current Time */}
      <div className="hidden lg:block text-sm text-muted-foreground">
        {currentTime}
      </div>

      <Separator orientation="vertical" className="mx-2 h-4 hidden lg:block" />

      {/* Pending approval badge — admin/head_nurse only */}
      {can('users.approve') && pendingCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="relative gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950 px-2"
          onClick={() => router.push('/admin/users')}
          title={lang === 'ar' ? 'طلبات انتظار الموافقة' : 'Pending approval requests'}
        >
          <UserCheck className="h-4 w-4" />
          <span className="text-xs font-bold hidden sm:inline">
            {lang === 'ar' ? `${pendingCount} طلب` : `${pendingCount} request${pendingCount > 1 ? 's' : ''}`}
          </span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold sm:hidden">
            {pendingCount}
          </span>
        </Button>
      )}

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -left-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
            <span className="sr-only">الإشعارات</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <span className="font-medium">{lang === 'ar' ? 'تنبيه: ارتفاع نسبة الإشغال' : 'Alert: High Occupancy Rate'}</span>
            <span className="text-xs text-muted-foreground">
              {lang === 'ar' ? 'قسم ICU تجاوز 90% من السعة' : 'ICU exceeded 90% capacity'}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <span className="font-medium">{lang === 'ar' ? 'تقرير جديد للمراجعة' : 'New Report for Review'}</span>
            <span className="text-xs text-muted-foreground">
              {lang === 'ar' ? 'تقرير الشفت الصباحي بانتظار الاعتماد' : 'Morning shift report pending approval'}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <span className="font-medium">{lang === 'ar' ? 'حالة عزل جديدة' : 'New Isolation Case'}</span>
            <span className="text-xs text-muted-foreground">
              {lang === 'ar' ? 'تم تسجيل حالة عزل في قسم الطوارئ' : 'An isolation case was recorded in Emergency'}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-center text-primary">
            {lang === 'ar' ? 'عرض جميع الإشعارات' : 'View All Notifications'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Pending Approval Badge */}
      {pendingCount > 0 && (
        <Link href="/admin/users">
          <Button variant="outline" size="sm" className="relative gap-2 border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">{lang === 'ar' ? 'طلبات معلّقة' : 'Pending'}</span>
            <Badge variant="destructive" className="h-5 min-w-5 rounded-full p-0 text-xs flex items-center justify-center">{pendingCount}</Badge>
          </Button>
        </Link>
      )}

      {/* Language Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLang}
        className="h-8 px-2 text-xs font-bold gap-1 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
        title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <span className={lang === 'ar' ? 'text-primary' : 'text-muted-foreground'}>ع</span>
        <span className="text-muted-foreground">/</span>
        <span className={lang === 'en' ? 'text-primary' : 'text-muted-foreground'}>EN</span>
      </Button>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">تبديل الوضع</span>
      </Button>

      <Separator orientation="vertical" className="mx-2 h-4" />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {user?.nameAr?.charAt(0) || 'م'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start text-sm">
              <span className="font-medium">{user?.nameAr}</span>
              <span className="text-xs text-muted-foreground">
                {user?.role === 'admin' && (lang === 'ar' ? 'مدير النظام' : 'System Admin')}
                {user?.role === 'head_nurse' && (lang === 'ar' ? 'رئيس التمريض' : 'Head Nurse')}
                {user?.role === 'supervisor' && (lang === 'ar' ? 'مشرف' : 'Supervisor')}
                {user?.role === 'staff' && (lang === 'ar' ? 'موظف' : 'Staff')}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{lang === 'ar' ? 'حسابي' : 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="ml-2 h-4 w-4" />
            {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="ml-2 h-4 w-4" />
            {lang === 'ar' ? 'الإعدادات' : 'Settings'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={logout}
          >
            <LogOut className="ml-2 h-4 w-4" />
            {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
