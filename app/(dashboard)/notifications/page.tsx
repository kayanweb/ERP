'use client'

import React, { useState } from 'react'
import {
  Bell, CheckCheck, Trash2, AlertTriangle, Info,
  CheckCircle, MessageSquare, Calendar, UserCheck,
  Clock, Filter, Search, X, RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
type NotifType = 'info' | 'success' | 'warning' | 'error' | 'message' | 'leave' | 'roster'

interface Notif {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
  category: string
  actionLabel?: string
  actionHref?: string
}

// ─── Config ───────────────────────────────────────────────────────────────────
const notifConfig: Record<NotifType, { icon: React.ReactElement; color: string; label: string }> = {
  info:    { icon: <Info className="h-4 w-4" />,           color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',     label: 'معلومة' },
  success: { icon: <CheckCircle className="h-4 w-4" />,    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',  label: 'نجاح' },
  warning: { icon: <AlertTriangle className="h-4 w-4" />,  color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'تحذير' },
  error:   { icon: <AlertTriangle className="h-4 w-4" />,  color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',         label: 'تنبيه' },
  message: { icon: <MessageSquare className="h-4 w-4" />,  color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', label: 'رسالة' },
  leave:   { icon: <Calendar className="h-4 w-4" />,       color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',  label: 'إجازة' },
  roster:  { icon: <UserCheck className="h-4 w-4" />,      color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',     label: 'جدول' },
}

const initialNotifs: Notif[] = [
  { id: 'N1',  type: 'warning', title: 'نسبة غياب مرتفعة',              body: 'وحدة ICU 3rd لديها 3 غيابات اليوم — تجاوز الحد المسموح', time: '2026-05-07 08:30', read: false, category: 'roster', actionLabel: 'عرض الغياب', actionHref: '/absence' },
  { id: 'N2',  type: 'message', title: 'رسالة جديدة من مدير التمريض',   body: 'يُرجى مراجعة جدول شيفت الأسبوع القادم وتأكيد الحضور',      time: '2026-05-07 08:00', read: false, category: 'message', actionLabel: 'فتح الرسائل', actionHref: '/messages' },
  { id: 'N3',  type: 'leave',   title: 'طلب إجازة جديد',                body: 'أحمد محمد علي طلب إجازة من 2026-05-10 إلى 2026-05-15',        time: '2026-05-06 16:00', read: false, category: 'leave', actionLabel: 'مراجعة الطلب', actionHref: '/leave-absence' },
  { id: 'N4',  type: 'success', title: 'تمت أرشفة الروستر',             body: 'تم حفظ روستر شهر أبريل 2026 بنجاح في الأرشيف',              time: '2026-05-06 00:01', read: true,  category: 'roster', actionLabel: 'عرض الأرشيف', actionHref: '/archive' },
  { id: 'N5',  type: 'info',    title: 'تذكير: اجتماع الفريق الشهري',  body: 'الاجتماع الشهري غداً الأحد الساعة 2 ظهراً — قاعة الاجتماعات الرئيسية', time: '2026-05-05 12:00', read: true, category: 'message' },
  { id: 'N6',  type: 'warning', title: 'مخزون أدوية منخفض',             body: 'مستوى دواء Morphine في الصيدلية وصل للحد الأدنى — يُرجى إعادة الطلب', time: '2026-05-05 09:00', read: true, category: 'system' },
  { id: 'N7',  type: 'leave',   title: 'موافقة على طلب إجازة',          body: 'تمت الموافقة على طلب إجازتك من 2026-05-20 إلى 2026-05-25',   time: '2026-05-04 14:00', read: true,  category: 'leave' },
  { id: 'N8',  type: 'roster',  title: 'تحديث الجدول الأسبوعي',         body: 'تم تحديث جدول شيفت الأسبوع القادم. يُرجى المراجعة.',          time: '2026-05-04 10:00', read: true,  category: 'roster', actionLabel: 'عرض الجدول', actionHref: '/monthly-roster' },
  { id: 'N9',  type: 'error',   title: 'تنبيه: شيفت بدون تغطية',       body: 'شيفت ليل الجمعة 2026-05-09 في وحدة CCU لا يوجد به تغطية كافية', time: '2026-05-04 08:00', read: true, category: 'roster' },
  { id: 'N10', type: 'success', title: 'كلمة مرور محدثة',               body: 'تم تغيير كلمة مرور حسابك بنجاح',                              time: '2026-05-03 20:00', read: true,  category: 'system' },
  { id: 'N11', type: 'info',    title: 'تحديث النظام',                   body: 'سيتوقف النظام للصيانة يوم الجمعة 2026-05-08 من 2-4 فجراً',    time: '2026-05-03 10:00', read: true,  category: 'system' },
  { id: 'N12', type: 'message', title: 'رسالة من فاطمة علي',             body: 'شكراً جزيلاً على الموافقة على طلب التبديل. أقدر تعاونكم.',    time: '2026-05-02 14:30', read: true,  category: 'message', actionLabel: 'فتح الرسائل', actionHref: '/messages' },
]

function formatTime(t: string) {
  try {
    const d = new Date(t.replace(' ', 'T'))
    const now = new Date()
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000)
    if (diffMin < 1) return 'الآن'
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `منذ ${diffH} ساعة`
    const diffD = Math.floor(diffH / 24)
    if (diffD === 1) return 'أمس'
    if (diffD < 7) return `منذ ${diffD} أيام`
    return d.toLocaleDateString('ar-EG')
  } catch { return t }
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs)
  const [typeFilter, setTypeFilter] = useState('all')
  const [readFilter, setReadFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = notifs.filter(n => {
    const matchType  = typeFilter === 'all' || n.type === typeFilter
    const matchRead  = readFilter === 'all' || (readFilter === 'unread' ? !n.read : n.read)
    const matchSearch = !search || n.title.includes(search) || n.body.includes(search)
    return matchType && matchRead && matchSearch
  })

  const unreadCount   = notifs.filter(n => !n.read).length
  const warningCount  = notifs.filter(n => n.type === 'warning' || n.type === 'error').length
  const messageCount  = notifs.filter(n => n.type === 'message').length

  const markAllRead   = () => setNotifs(p => p.map(n => ({ ...n, read: true })))
  const clearAll      = () => { setNotifs([]); setExpanded(null) }
  const markRead      = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  const deleteOne     = (id: string) => { setNotifs(p => p.filter(n => n.id !== id)); if (expanded === id) setExpanded(null) }
  const toggleExpand  = (id: string) => {
    setExpanded(p => p === id ? null : id)
    markRead(id)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            الإشعارات
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount} جديد</Badge>}
          </h1>
          <p className="text-muted-foreground text-sm">تنبيهات وإشعارات النظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4 ml-1" />قراءة الكل
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={clearAll}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 ml-1" />مسح الكل
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'الكل',      value: notifs.length,   color: 'text-primary',         bg: 'bg-primary/10',        icon: <Bell className="h-4 w-4" /> },
          { label: 'غير مقروء', value: unreadCount,      color: 'text-red-600',          bg: 'bg-red-100 dark:bg-red-900/20', icon: <AlertTriangle className="h-4 w-4" /> },
          { label: 'تنبيهات',  value: warningCount,     color: 'text-yellow-600',       bg: 'bg-yellow-100 dark:bg-yellow-900/20', icon: <AlertTriangle className="h-4 w-4" /> },
          { label: 'رسائل',     value: messageCount,     color: 'text-purple-600',       bg: 'bg-purple-100 dark:bg-purple-900/20', icon: <MessageSquare className="h-4 w-4" /> },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', s.bg, s.color)}>{s.icon}</div>
              <div>
                <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="بحث في الإشعارات..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-9 h-9 text-sm"
          />
          {search && (
            <button className="absolute left-2 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 h-9">
            <Filter className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {Object.entries(notifConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                <span className="flex items-center gap-1.5">{v.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-32 h-9"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="unread">غير مقروء</SelectItem>
            <SelectItem value="read">مقروء</SelectItem>
          </SelectContent>
        </Select>
        {(typeFilter !== 'all' || readFilter !== 'all' || search) && (
          <Button variant="ghost" size="sm" className="h-9 text-xs gap-1" onClick={() => { setTypeFilter('all'); setReadFilter('all'); setSearch('') }}>
            <RefreshCw className="h-3.5 w-3.5" />مسح الفلاتر
          </Button>
        )}
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(notif => {
                const cfg = notifConfig[notif.type] || notifConfig.info
                const isExpanded = expanded === notif.id
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      'transition-colors',
                      !notif.read && 'bg-primary/5',
                      isExpanded && 'bg-muted/30'
                    )}
                  >
                    {/* Main row */}
                    <div
                      className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/20"
                      onClick={() => toggleExpand(notif.id)}
                    >
                      {/* Type icon */}
                      <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.color)}>
                        {cfg.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn('text-sm', !notif.read && 'font-bold')}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!notif.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />{formatTime(notif.time)}
                            </span>
                          </div>
                        </div>
                        <p className={cn('text-xs text-muted-foreground mt-0.5 leading-relaxed', !isExpanded && 'truncate')}>
                          {notif.body}
                        </p>

                        {/* Expanded: actions */}
                        {isExpanded && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {notif.actionLabel && notif.actionHref && (
                              <a href={notif.actionHref}>
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  {notif.actionLabel}
                                </Button>
                              </a>
                            )}
                            <Badge variant="outline" className="text-[10px]">{cfg.label}</Badge>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        {!notif.read && (
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => markRead(notif.id)}
                            title="تعيين كمقروء"
                          >
                            <CheckCheck className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        )}
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteOne(notif.id)}
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
