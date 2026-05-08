'use client'

import { useState } from 'react'
import {
  ClipboardList,
  Check,
  X,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Users,
  Share2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const DAYS_AR = ['أح','اث','ث','أر','خ','ج','س']
const SHIFTS = ['D', 'N', 'DN', 'OFF', '']

const shiftColors: Record<string, string> = {
  D:   'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300',
  N:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300',
  DN:  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300',
  OFF: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300',
  '': 'bg-muted/30 text-muted-foreground border-dashed',
}

// Staff with their pending preferences
const staffPrefs = [
  {
    id: 's1', name: 'أحمد محمد علي', code: 'S001', unit: 'ICU 3rd', title: 'SN',
    status: 'pending', submittedAt: '2026-05-06 09:00',
    prefs: { '2026-06-01': 'D', '2026-06-02': 'D', '2026-06-05': 'N', '2026-06-06': 'N', '2026-06-10': 'OFF', '2026-06-15': 'D' },
  },
  {
    id: 's2', name: 'سارة خالد', code: 'S002', unit: 'ICU 3rd', title: 'CN',
    status: 'approved', submittedAt: '2026-05-05 14:00',
    prefs: { '2026-06-01': 'N', '2026-06-03': 'OFF', '2026-06-08': 'D', '2026-06-12': 'N' },
  },
  {
    id: 's3', name: 'محمد حسن', code: 'S003', unit: 'CCU', title: 'SN',
    status: 'pending', submittedAt: '2026-05-04 11:00',
    prefs: { '2026-06-02': 'D', '2026-06-04': 'OFF', '2026-06-07': 'N', '2026-06-14': 'D' },
  },
  {
    id: 's4', name: 'نورة أحمد', code: 'S004', unit: 'ICU 3rd', title: 'NA',
    status: 'rejected', submittedAt: '2026-05-03 08:00',
    prefs: { '2026-06-05': 'OFF', '2026-06-10': 'D', '2026-06-15': 'N' },
  },
  {
    id: 's5', name: 'خالد عبدالله', code: 'S005', unit: 'ER', title: 'SN',
    status: 'none', submittedAt: '',
    prefs: {},
  },
]

const statusConfig = {
  pending:  { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'موافق', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <X className="h-3 w-3" /> },
  none:     { label: 'لم يُقدَّم', color: 'bg-muted text-muted-foreground', icon: <AlertTriangle className="h-3 w-3" /> },
}

export default function PreferencesPage() {
  const today = new Date()
  const [prefMonth, setPrefMonth] = useState(today.getMonth() + 1 < 12 ? today.getMonth() + 1 : 0)
  const [prefYear, setPrefYear] = useState(today.getMonth() + 1 < 12 ? today.getFullYear() : today.getFullYear() + 1)
  const [staff, setStaff] = useState(staffPrefs)
  const [selectedStaff, setSelectedStaff] = useState<typeof staffPrefs[0] | null>(null)

  // Personal preferences editor
  const [myPrefs, setMyPrefs] = useState<Record<string, string>>({})

  const daysInMonth = new Date(prefYear, prefMonth + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const key = `${prefYear}-${String(prefMonth + 1).padStart(2,'0')}-${String(i + 1).padStart(2,'0')}`
    const dow = new Date(prefYear, prefMonth, i + 1).getDay()
    return { key, day: i + 1, name: DAYS_AR[dow] }
  })

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    if (selectedStaff?.id === id) setSelectedStaff(prev => prev ? { ...prev, status } : null)
  }

  const cycleMyPref = (key: string) => {
    const cur = myPrefs[key] || ''
    const idx = SHIFTS.indexOf(cur)
    const next = SHIFTS[(idx + 1) % SHIFTS.length]
    setMyPrefs(prev => ({ ...prev, [key]: next }))
  }

  const pending = staff.filter(s => s.status === 'pending').length
  const approved = staff.filter(s => s.status === 'approved').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">رغبات الشيفت</h1>
        <p className="text-muted-foreground text-sm">
          إدارة ومراجعة رغبات الكادر للشيفتات القادمة
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الكادر', value: staff.length, color: 'text-primary' },
          { label: 'قيد المراجعة', value: pending, color: 'text-yellow-600' },
          { label: 'تمت الموافقة', value: approved, color: 'text-green-600' },
          { label: 'لم يُقدَّم', value: staff.filter(s => s.status === 'none').length, color: 'text-muted-foreground' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">👨‍💼 مراجعة الرغبات</TabsTrigger>
          <TabsTrigger value="my">📝 رغباتي الشخصية</TabsTrigger>
        </TabsList>

        {/* Review tab — supervisor view */}
        <TabsContent value="review" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Staff list */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" /> قائمة الكادر
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select value={String(prefMonth)} onValueChange={v => setPrefMonth(+v)}>
                      <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {staff.map(s => {
                    const sc = statusConfig[s.status as keyof typeof statusConfig]
                    return (
                      <button
                        key={s.id}
                        className={cn(
                          'w-full text-right p-3 hover:bg-muted/50 flex items-center gap-3',
                          selectedStaff?.id === s.id && 'bg-muted'
                        )}
                        onClick={() => setSelectedStaff(s)}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {s.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.unit} · {s.title}</p>
                        </div>
                        <Badge className={cn('text-[9px] border-0 shrink-0 flex items-center gap-0.5', sc.color)}>
                          {sc.icon} {sc.label}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Staff detail */}
            <Card className="lg:col-span-2">
              {selectedStaff ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <CardTitle className="text-base">{selectedStaff.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {selectedStaff.unit} · {selectedStaff.code} · مقدم في: {selectedStaff.submittedAt || 'لم يُقدَّم'}
                        </p>
                      </div>
                      {selectedStaff.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => updateStatus(selectedStaff.id, 'approved')}
                          >
                            <Check className="h-3.5 w-3.5" /> موافقة
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => updateStatus(selectedStaff.id, 'rejected')}
                          >
                            <X className="h-3.5 w-3.5" /> رفض
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {Object.keys(selectedStaff.prefs).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>لم يُقدِّم هذا الموظف أي رغبات بعد</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedStaff.prefs).map(([date, shift]) => (
                          <div
                            key={date}
                            className={cn('px-3 py-2 rounded-lg border text-center min-w-[60px]', shiftColors[shift as string])}
                          >
                            <div className="text-[10px] opacity-70">{date.slice(5)}</div>
                            <div className="text-sm font-bold">{shift}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mb-3 opacity-30" />
                  <p>اختر موظفاً لعرض رغباته</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* My preferences tab */}
        <TabsContent value="my" className="mt-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-teal-600" />
                    تفضيلاتي للشيفت — {MONTHS[prefMonth]} {prefYear}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">اضغط على اليوم للتبديل بين الشيفتات</p>
                </div>
                <div className="flex gap-2">
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
                {days.map(d => {
                  const pref = myPrefs[d.key] || ''
                  return (
                    <button
                      key={d.key}
                      onClick={() => cycleMyPref(d.key)}
                      className={cn(
                        'rounded-lg px-3 py-2 text-center min-w-[52px] border-2 transition-all hover:scale-105',
                        pref ? shiftColors[pref] : 'border-dashed border-border bg-muted/20 text-muted-foreground'
                      )}
                    >
                      <div className="text-[10px] opacity-70">{d.name} {d.day}</div>
                      <div className="text-sm font-bold mt-0.5">{pref || '—'}</div>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm">
                  <Check className="h-4 w-4 ml-1" /> حفظ الرغبات
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 ml-1" /> إرسال للمشرف
                </Button>
                <Button variant="outline" size="sm" className="text-green-700 border-green-300">
                  <Share2 className="h-4 w-4 ml-1" /> واتساب
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setMyPrefs({})}>
                  🗑 مسح
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
