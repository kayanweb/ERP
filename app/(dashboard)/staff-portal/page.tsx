'use client'

import { useState } from 'react'
import {
  Calendar,
  CalendarDays,
  MessageSquare,
  UtensilsCrossed,
  DollarSign,
  User,
  ClipboardList,
  Send,
  Lock,
  Camera,
  Printer,
  ChevronDown,
  Check,
  X,
  Clock,
  Sun,
  Moon,
  RefreshCw,
  Inbox,
  PlusCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────────────────────────
// Demo data
// ──────────────────────────────────────────────────────────────

const currentStaff = {
  id: 'S001',
  name: 'أحمد محمد علي',
  nameEn: 'Ahmed Mohammed Ali',
  title: 'SN',
  titleLabel: 'ممرض مقيم',
  unit: 'ICU 3rd',
  code: 'S001',
  phone: '0501234567',
  email: 'ahmed@baheya.com',
  vacationBalance: { annual: 21, sick: 14, used: 7 },
}

const MONTHS = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
]

const DAYS_AR = ['أح','اث','ث','أر','خ','ج','س']

const SHIFTS = ['D', 'N', 'DN', 'OFF', 'ABS', '']

const shiftColors: Record<string, string> = {
  D:   'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  N:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  DN:  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  OFF: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  ABS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  '': 'bg-muted text-muted-foreground',
}

// Shift display label with icon
const shiftLabel: Record<string, string> = {
  D:   '☀ D نهاري',
  N:   '🌙 N ليلي',
  DN:  '⟳ DN مزدوج',
  OFF: 'OFF راحة',
  ABS: 'ABS غياب',
  '':  '—',
}

// Build demo schedule for current month
function buildDemoSchedule(month: number, year: number): Record<string, string> {
  const shifts: Record<string, string> = {}
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const pattern = ['D','D','N','N','OFF','OFF','D','D','N','DN','OFF','ABS']
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    shifts[key] = pattern[(d - 1) % pattern.length]
  }
  return shifts
}

const today = new Date()
const demoSchedule = buildDemoSchedule(today.getMonth(), today.getFullYear())

// Demo leave requests
const initialLeaveRequests = [
  { id: 'L1', type: 'إجازة سنوية', start: '2026-05-10', end: '2026-05-15', days: 6, reason: 'إجازة عائلية', status: 'approved' },
  { id: 'L2', type: 'إجازة مرضية', start: '2026-04-22', end: '2026-04-23', days: 2, reason: 'حالة طارئة', status: 'pending' },
  { id: 'L3', type: 'إجازة طارئة', start: '2026-03-05', end: '2026-03-05', days: 1, reason: 'ظروف خاصة', status: 'rejected' },
]

// Demo messages
const initialMessages = [
  { id: 'M1', from: 'مدير التمريض', subject: 'اجتماع الفريق الشهري', body: 'يُعقد الاجتماع الشهري يوم الأحد القادم الساعة 2 ظهراً في قاعة الاجتماعات. الحضور إلزامي.', time: '2026-05-06 10:00', read: false },
  { id: 'M2', from: 'مشرف الوحدة', subject: 'تغيير جدول الشيفت', body: 'سيتم تعديل جدول الشيفت الأسبوع القادم نظراً لوجود إجازات. يرجى الاطلاع على الجدول الجديد.', time: '2026-05-05 08:30', read: true },
  { id: 'M3', from: 'إدارة التمريض', subject: 'تذكير: تقديم رغبات الشيفت', body: 'يُرجى تقديم رغبات الشيفت لشهر يونيو قبل تاريخ 20 مايو.', time: '2026-05-04 09:00', read: true },
]

// Demo meals
const mealData = [
  { date: '2026-05-07', shift: 'D', meal: 'غداء', time: '13:00' },
  { date: '2026-05-08', shift: 'N', meal: 'عشاء', time: '21:00' },
  { date: '2026-05-09', shift: 'D', meal: 'غداء', time: '13:00' },
  { date: '2026-05-10', shift: 'DN', meal: 'غداء + عشاء', time: '13:00 / 21:00' },
  { date: '2026-05-11', shift: 'OFF', meal: '—', time: '—' },
  { date: '2026-05-12', shift: 'D', meal: 'غداء', time: '13:00' },
]

// Demo finance
const financeData = {
  basicSalary: 8500,
  allowances: 1500,
  overtime: 420,
  deductions: 200,
  netSalary: 10220,
  month: 'أبريل 2026',
  paymentDate: '2026-04-30',
  items: [
    { label: 'الراتب الأساسي', amount: 8500, type: 'credit' },
    { label: 'بدل تمريض', amount: 1000, type: 'credit' },
    { label: 'بدل ساعات إضافية', amount: 420, type: 'credit' },
    { label: 'بدل مواصلات', amount: 500, type: 'credit' },
    { label: 'خصم تأخير', amount: -200, type: 'debit' },
    { label: 'الصافي', amount: 10220, type: 'net' },
  ],
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export default function StaffPortalPage() {
  const [scheduleMonth, setScheduleMonth] = useState(today.getMonth())
  const [scheduleYear, setScheduleYear] = useState(today.getFullYear())

  // Prefs tab
  const [prefMonth, setPrefMonth] = useState(today.getMonth())
  const [prefYear, setPrefYear] = useState(today.getFullYear())
  const [prefs, setPrefs] = useState<Record<string, string>>({})
  const [prefsSaved, setPrefsSaved] = useState(false)

  // Leave tab
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests)
  const [leaveType, setLeaveType] = useState('إجازة سنوية')
  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')
  const [leaveReason, setLeaveReason] = useState('')

  // Messages tab
  const [messages, setMessages] = useState(initialMessages)
  const [selectedMsg, setSelectedMsg] = useState<typeof initialMessages[0] | null>(null)
  const [composeTo, setComposeTo] = useState('unit_supervisor')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')

  // Profile tab
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passSaved, setPassSaved] = useState(false)

  // ── Helpers ──────────────────────────────────────────────────

  const buildDates = (month: number, year: number) => {
    const days = []
    const count = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= count; d++) {
      const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const dow = new Date(year, month, d).getDay()
      days.push({ key, day: d, dow, name: DAYS_AR[dow] })
    }
    return days
  }

  const cycleShift = (key: string, map: Record<string, string>, setMap: (m: Record<string, string>) => void) => {
    const cur = map[key] || ''
    const idx = SHIFTS.indexOf(cur)
    const next = SHIFTS[(idx + 1) % SHIFTS.length]
    setMap({ ...map, [key]: next })
  }

  const submitLeave = () => {
    if (!leaveStart || !leaveEnd) return
    const start = new Date(leaveStart)
    const end = new Date(leaveEnd)
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
    setLeaveRequests([
      { id: `L${Date.now()}`, type: leaveType, start: leaveStart, end: leaveEnd, days, reason: leaveReason, status: 'pending' },
      ...leaveRequests,
    ])
    setLeaveStart(''); setLeaveEnd(''); setLeaveReason('')
  }

  const sendMessage = () => {
    if (!composeSubject || !composeBody) return
    const toLabel: Record<string, string> = {
      unit_supervisor: 'مشرف الوحدة',
      head_nurse: 'مدير التمريض',
      hospital_supervisor: 'مشرف المستشفى',
      all_supervisors: 'كل المشرفين',
    }
    const newMsg = {
      id: `M${Date.now()}`,
      from: `أنا → ${toLabel[composeTo]}`,
      subject: composeSubject,
      body: composeBody,
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: true,
    }
    setMessages([newMsg, ...messages])
    setComposeSubject(''); setComposeBody('')
  }

  const savePrefs = () => {
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 2000)
  }

  const savePassword = () => {
    if (!newPass) return
    setOldPass(''); setNewPass('')
    setPassSaved(true)
    setTimeout(() => setPassSaved(false), 2000)
  }

  const printSchedule = () => {
    const rows = scheduleDates.map(d => {
      const s = demoSchedule[d.key] || ''
      const colorMap: Record<string,string> = {
        D: 'background:#dcfce7;color:#166534', N: 'background:#fef9c3;color:#854d0e',
        DN: 'background:#dbeafe;color:#1e40af', OFF: 'background:#fee2e2;color:#991b1b',
        ABS: 'background:#f3e8ff;color:#6b21a8',
      }
      return `<td style="border:1px solid #e5e7eb;text-align:center;padding:6px 8px;${colorMap[s]||''}">
        <div style="font-size:11px;color:#6b7280">${d.name} ${d.day}</div>
        <div style="font-weight:bold;font-size:13px">${shiftLabel[s] || '—'}</div>
      </td>`
    })
    const chunks: string[][] = []
    for (let i = 0; i < rows.length; i += 7) chunks.push(rows.slice(i, i+7))
    const tableRows = chunks.map(chunk => `<tr>${chunk.join('')}</tr>`).join('')
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html dir="rtl"><head><meta charset="utf-8"><title>جدولي</title>
      <style>body{font-family:Arial;padding:20px;direction:rtl}h2{color:#0d9488}.meta{color:#6b7280;font-size:12px;margin-bottom:12px}table{border-collapse:collapse;width:100%}.sum{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;font-size:12px}.leg{padding:3px 8px;border-radius:4px}.sig{display:flex;justify-content:space-between;margin-top:20px;font-size:12px;color:#6b7280}@media print{body{padding:10px}}</style>
      </head><body>
      <h2>جدولي — ${MONTHS[scheduleMonth]} ${scheduleYear}</h2>
      <div class="meta">${currentStaff.name} · ${currentStaff.titleLabel} · ${currentStaff.unit}</div>
      <table><tbody>${tableRows}</tbody></table>
      <div class="sum">
        <span class="leg" style="background:#dcfce7;color:#166534">☀ D نهاري: ${counts['D']||0} يوم</span>
        <span class="leg" style="background:#fef9c3;color:#854d0e">🌙 N ليلي: ${counts['N']||0} يوم</span>
        <span class="leg" style="background:#dbeafe;color:#1e40af">⟳ DN مزدوج: ${counts['DN']||0} يوم</span>
        <span class="leg" style="background:#fee2e2;color:#991b1b">OFF: ${counts['OFF']||0}</span>
        <span class="leg" style="background:#e5e7eb;color:#374151">إجمالي: ${((counts['D']||0)+(counts['N']||0))*12+(counts['DN']||0)*24} ساعة</span>
      </div>
      <div class="sig"><span>الموظف: ___________</span><span>التوقيع: ___________</span></div>
      <script>window.print();window.close();</script>
      </body></html>
    `)
    win.document.close()
  }

  const printPayslip = () => {
    const rows = financeData.items.map(item =>
      `<tr style="${item.type==='net'?'background:#f0fdf4;font-weight:bold':''}">
        <td style="border:1px solid #e5e7eb;padding:8px 12px">${item.label}</td>
        <td style="border:1px solid #e5e7eb;padding:8px 12px;font-family:monospace;color:${item.amount<0?'#dc2626':item.type==='net'?'#16a34a':'inherit'}">${item.amount.toLocaleString()} ج.م</td>
      </tr>`
    ).join('')
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html dir="rtl"><head><meta charset="utf-8"><title>بيان الراتب</title>
      <style>body{font-family:Arial;padding:30px;direction:rtl}h2{color:#0d9488}.meta{color:#6b7280;font-size:13px;margin-bottom:16px}table{border-collapse:collapse;width:100%;max-width:500px}.sig{display:flex;justify-content:space-between;margin-top:30px;font-size:12px;color:#6b7280}@media print{body{padding:10px}}</style>
      </head><body>
      <h2>بيان الراتب — ${financeData.month}</h2>
      <div class="meta">الموظف: <strong>${currentStaff.name}</strong> · ${currentStaff.titleLabel} · ${currentStaff.unit}</div>
      <table><thead><tr style="background:#f3f4f6"><th style="border:1px solid #e5e7eb;padding:8px 12px;text-align:right">البند</th><th style="border:1px solid #e5e7eb;padding:8px 12px;text-align:right">المبلغ</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="sig"><span>تاريخ الصرف: ${financeData.paymentDate}</span><span>التوقيع: ___________</span></div>
      <script>window.print();window.close();</script>
      </body></html>
    `)
    win.document.close()
  }

  const statusBadge = (s: string) => {
    if (s === 'approved') return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0">موافق ✓</Badge>
    if (s === 'rejected') return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-0">مرفوض ✗</Badge>
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-0">قيد المراجعة</Badge>
  }

  const unread = messages.filter(m => !m.read).length

  const scheduleDates = buildDates(scheduleMonth, scheduleYear)
  const prefDates = buildDates(prefMonth, prefYear)

  // summary counts for schedule
  const counts = scheduleDates.reduce((acc, d) => {
    const v = demoSchedule[d.key] || ''
    acc[v] = (acc[v] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
              {currentStaff.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{currentStaff.name}</h1>
            <p className="text-muted-foreground text-sm">
              {currentStaff.titleLabel} · {currentStaff.unit} · {currentStaff.code}
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                إجازة سنوية: {currentStaff.vacationBalance.annual - currentStaff.vacationBalance.used} يوم متبقي
              </Badge>
              <Badge variant="outline" className="text-xs">
                مرضية: {currentStaff.vacationBalance.sick} يوم
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 ml-1" />
          رسالة للمشرف
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 mb-2">
          <TabsTrigger value="schedule" className="gap-1 text-xs sm:text-sm">
            <Calendar className="h-4 w-4" /> جدولي
          </TabsTrigger>
          <TabsTrigger value="prefs" className="gap-1 text-xs sm:text-sm">
            <ClipboardList className="h-4 w-4" /> رغباتي
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-1 text-xs sm:text-sm">
            <CalendarDays className="h-4 w-4" /> الإجازات
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1 text-xs sm:text-sm relative">
            <MessageSquare className="h-4 w-4" /> الرسائل
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                {unread}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="meals" className="gap-1 text-xs sm:text-sm">
            <UtensilsCrossed className="h-4 w-4" /> وجباتي
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-1 text-xs sm:text-sm">
            <DollarSign className="h-4 w-4" /> ماليتي
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1 text-xs sm:text-sm">
            <User className="h-4 w-4" /> ملفي
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: My Schedule ─────────────────────────────────── */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  جدولك الحالي
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Select value={String(scheduleMonth)} onValueChange={v => setScheduleMonth(+v)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={String(scheduleYear)} onValueChange={v => setScheduleYear(+v)}>
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-8" onClick={printSchedule}>
                    <Printer className="h-3.5 w-3.5 ml-1" /> طباعة
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Calendar grid */}
              <div className="flex flex-wrap gap-1.5">
                {scheduleDates.map(d => {
                  const shift = demoSchedule[d.key] || ''
                  const isToday = d.key === today.toISOString().slice(0,10)
                  return (
                    <div
                      key={d.key}
                      className={cn(
                        'rounded-lg px-2 py-1.5 text-center min-w-[54px] border',
                        shiftColors[shift] || shiftColors[''],
                        isToday && 'ring-2 ring-primary'
                      )}
                    >
                      <div className="text-[9px] opacity-70 leading-none">{d.name} {d.day}</div>
                      <div className="text-xs font-bold mt-0.5 leading-tight">
                        {shift === 'D'   ? '☀ D' :
                         shift === 'N'   ? '🌙 N' :
                         shift === 'DN'  ? '⟳ DN' :
                         shift === 'OFF' ? 'OFF' :
                         shift === 'ABS' ? 'ABS' : '—'}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              <div className="flex gap-2 flex-wrap mt-4">
                {[
                  { label: 'D نهاري', count: counts['D'] || 0, cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
                  { label: 'N ليلي', count: counts['N'] || 0, cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
                  { label: 'DN مزدوج', count: counts['DN'] || 0, cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
                  { label: 'OFF إجازة', count: counts['OFF'] || 0, cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
                  { label: 'ABS غياب', count: counts['ABS'] || 0, cls: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
                ].map(s => (
                  <span key={s.label} className={cn('px-3 py-1.5 rounded-lg text-sm font-bold', s.cls)}>
                    {s.label}: {s.count}
                  </span>
                ))}
                <span className="px-3 py-1.5 rounded-lg text-sm font-bold bg-primary/10 text-primary">
                  إجمالي الساعات: {((counts['D']||0) + (counts['N']||0)) * 12 + (counts['DN']||0) * 24}
                </span>
              </div>

              {/* Legend */}
              <div className="flex gap-4 flex-wrap mt-4 pt-4 border-t text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Sun className="h-3 w-3 text-green-600" />D = نهاري</span>
                <span className="flex items-center gap-1"><Moon className="h-3 w-3 text-yellow-600" />N = ليلي</span>
                <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 text-blue-600" />DN = مزدوج</span>
                <span className="flex items-center gap-1"><X className="h-3 w-3 text-red-600" />OFF = راحة</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-purple-600" />ABS = غياب</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Preferences ────────────────────────────────── */}
        <TabsContent value="prefs">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-teal-600" />
                    رغباتي — تفضيلات الشيفت
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    اختر الشيفتات المناسبة — سيتم إرسالها للمشرف للمراجعة
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={String(prefMonth)} onValueChange={v => setPrefMonth(+v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={String(prefYear)} onValueChange={v => setPrefYear(+v)}>
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {prefDates.map(d => {
                  const pref = prefs[d.key] || ''
                  return (
                    <button
                      key={d.key}
                      onClick={() => cycleShift(d.key, prefs, setPrefs)}
                      className={cn(
                        'rounded-lg px-2 py-1.5 text-center min-w-[54px] border-2 transition-all hover:scale-105 active:scale-95',
                        pref ? shiftColors[pref] : 'border-dashed border-border bg-muted/30 text-muted-foreground',
                        pref && 'border-primary/50'
                      )}
                    >
                      <div className="text-[9px] opacity-70 leading-none">{d.name} {d.day}</div>
                      <div className="text-xs font-bold mt-0.5 leading-tight">
                        {pref === 'D'   ? '☀ D' :
                         pref === 'N'   ? '🌙 N' :
                         pref === 'DN'  ? '⟳ DN' :
                         pref === 'OFF' ? 'OFF' :
                         pref === 'ABS' ? 'ABS' : '—'}
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mb-4">💡 اضغط على اليوم للتبديل بين: D → N → DN → OFF → ABS → (فارغ)</p>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={savePrefs} size="sm">
                  {prefsSaved ? <Check className="h-4 w-4 ml-1" /> : null}
                  {prefsSaved ? 'تم الحفظ!' : '💾 حفظ الرغبات'}
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 ml-1" /> إرسال للمشرف
                </Button>
                <Button variant="outline" size="sm" className="text-green-700 border-green-300">
                  💬 مشاركة واتساب
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setPrefs({})}
                >
                  🗑 مسح
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Leave & Absence ───────────────────────────── */}
        <TabsContent value="leave">
          <div className="space-y-4">
            {/* New request form */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-amber-600" />
                  تقديم طلب إجازة / غياب
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">نوع الطلب</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="إجازة سنوية">🏖 إجازة سنوية</SelectItem>
                      <SelectItem value="إجازة مرضية">🏥 إجازة مرضية</SelectItem>
                      <SelectItem value="إجازة طارئة">⚡ إجازة طارئة</SelectItem>
                      <SelectItem value="غياب">🚫 غياب</SelectItem>
                      <SelectItem value="إجازة أمومة">👶 إجازة أمومة</SelectItem>
                      <SelectItem value="إجازة بدون راتب">📋 بدون راتب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">من تاريخ</Label>
                  <Input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">إلى تاريخ</Label>
                  <Input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">سبب / ملاحظات</Label>
                  <Input
                    placeholder="اكتب السبب أو الملاحظات..."
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button onClick={submitLeave} className="w-full">
                    <Send className="h-4 w-4 ml-1" />
                    إرسال الطلب للمشرف
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Request history */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base">📋 طلباتي السابقة</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {leaveRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between px-4 py-3 gap-4 flex-wrap">
                      <div>
                        <div className="font-medium text-sm">{req.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {req.start} → {req.end} ({req.days} يوم/أيام)
                        </div>
                        {req.reason && <div className="text-xs text-muted-foreground mt-0.5">{req.reason}</div>}
                      </div>
                      {statusBadge(req.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 4: Messages ──────────────────────────────────── */}
        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Compose */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Send className="h-4 w-4 text-primary" />
                  إرسال رسالة
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">إرسال إلى</Label>
                  <Select value={composeTo} onValueChange={setComposeTo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit_supervisor">مشرف الوحدة</SelectItem>
                      <SelectItem value="head_nurse">مدير التمريض</SelectItem>
                      <SelectItem value="hospital_supervisor">مشرف المستشفى</SelectItem>
                      <SelectItem value="all_supervisors">كل المشرفين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">الموضوع</Label>
                  <Input placeholder="موضوع الرسالة" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">نص الرسالة</Label>
                  <Textarea
                    placeholder="اكتب رسالتك هنا..."
                    rows={4}
                    value={composeBody}
                    onChange={e => setComposeBody(e.target.value)}
                  />
                </div>
                <Button onClick={sendMessage} className="w-full" size="sm">
                  <Send className="h-4 w-4 ml-1" /> إرسال
                </Button>
              </CardContent>
            </Card>

            {/* Inbox */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Inbox className="h-4 w-4 text-primary" />
                    صندوق الوارد
                  </CardTitle>
                  {unread > 0 && <Badge variant="destructive" className="text-xs">{unread} جديدة</Badge>}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-80 overflow-y-auto">
                  {messages.map(msg => (
                    <button
                      key={msg.id}
                      className={cn(
                        'w-full text-right px-4 py-3 hover:bg-muted/50 transition-colors',
                        !msg.read && 'bg-primary/5',
                        selectedMsg?.id === msg.id && 'bg-muted'
                      )}
                      onClick={() => {
                        setSelectedMsg(msg)
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn('font-medium text-sm', !msg.read && 'font-bold')}>{msg.from}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <div className="text-xs truncate text-muted-foreground">{msg.subject}</div>
                    </button>
                  ))}
                </div>
                {selectedMsg && (
                  <div className="p-4 border-t">
                    <div className="font-bold text-sm mb-1">{selectedMsg.subject}</div>
                    <div className="text-xs text-muted-foreground mb-2">من: {selectedMsg.from} · {selectedMsg.time}</div>
                    <p className="text-sm leading-relaxed">{selectedMsg.body}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 5: Meals ─────────────────────────────────────── */}
        <TabsContent value="meals">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-green-600" />
                وجباتي
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                جدول وجباتك المقررة حسب شيفتاتك
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2 px-3 font-semibold text-xs text-muted-foreground">التاريخ</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs text-muted-foreground">الشيفت</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs text-muted-foreground">الوجبة</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs text-muted-foreground">الوقت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealData.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-3">{row.date}</td>
                        <td className="py-2 px-3">
                          <span className={cn('px-2 py-0.5 rounded text-xs font-bold', shiftColors[row.shift] || '')}>{row.shift}</span>
                        </td>
                        <td className="py-2 px-3 font-medium">{row.meal}</td>
                        <td className="py-2 px-3 text-muted-foreground">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                💡 يتم تخصيص الوجبات تلقائياً حسب جدول الشيفت. شيفت D يحصل على غداء, شيفت N على عشاء, شيفت DN على الاثنين.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 6: Finance ───────────────────────────────────── */}
        <TabsContent value="finance">
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'الراتب الأساسي', value: financeData.basicSalary, color: 'text-primary' },
                { label: 'البدلات', value: financeData.allowances, color: 'text-green-600' },
                { label: 'ساعات إضافية', value: financeData.overtime, color: 'text-amber-600' },
                { label: 'صافي الراتب', value: financeData.netSalary, color: 'text-emerald-600' },
              ].map(c => (
                <Card key={c.label} className="p-4">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className={cn('text-xl font-bold mt-1', c.color)}>
                    {c.value.toLocaleString()} ج.م
                  </p>
                </Card>
              ))}
            </div>

            {/* Pay slip */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-pink-600" />
                    بيان الراتب — {financeData.month}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={printPayslip}>
                    <Printer className="h-4 w-4 ml-1" /> طباعة
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-2 px-3 font-semibold text-xs text-muted-foreground">البند</th>
                        <th className="text-right py-2 px-3 font-semibold text-xs text-muted-foreground">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeData.items.map((item, i) => (
                        <tr
                          key={i}
                          className={cn(
                            'border-b last:border-0',
                            item.type === 'net' ? 'font-bold bg-muted/30' : 'hover:bg-muted/30'
                          )}
                        >
                          <td className="py-2 px-3">{item.label}</td>
                          <td className={cn(
                            'py-2 px-3 font-mono',
                            item.amount < 0 ? 'text-destructive' : item.type === 'net' ? 'text-emerald-600 text-base' : 'text-foreground'
                          )}>
                            {item.amount.toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  تاريخ الصرف: {financeData.paymentDate}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 7: Profile ───────────────────────────────────── */}
        <TabsContent value="profile">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Personal info */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  البيانات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                        {currentStaff.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    <p className="font-bold">{currentStaff.name}</p>
                    <p className="text-xs text-muted-foreground">{currentStaff.nameEn}</p>
                  </div>
                </div>
                {[
                  { label: 'كود الموظف', value: currentStaff.code },
                  { label: 'المسمى الوظيفي', value: currentStaff.titleLabel },
                  { label: 'الوحدة', value: currentStaff.unit },
                  { label: 'الهاتف', value: currentStaff.phone },
                  { label: 'البريد الإلكتروني', value: currentStaff.email },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <span className="text-xs text-muted-foreground">{f.label}</span>
                    <span className="text-sm font-medium">{f.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Password change */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-600" />
                  تغيير كلمة المرور
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">كلمة المرور الحالية</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={oldPass}
                    onChange={e => setOldPass(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">كلمة المرور الجديدة</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                  />
                </div>
                <Button onClick={savePassword} className="w-full" size="sm">
                  {passSaved ? <><Check className="h-4 w-4 ml-1" /> تم الحفظ!</> : <>حفظ كلمة المرور</>}
                </Button>

                {/* Vacation balance */}
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">رصيد الإجازات</p>
                  {[
                    { label: 'الإجازة السنوية', total: currentStaff.vacationBalance.annual, used: currentStaff.vacationBalance.used },
                    { label: 'الإجازة المرضية', total: currentStaff.vacationBalance.sick, used: 0 },
                  ].map(b => (
                    <div key={b.label} className="mb-2">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>{b.label}</span>
                        <span>{b.total - b.used} / {b.total} يوم</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${((b.total - b.used) / b.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
