'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Plus, Download, Archive, Save, Trash2, MoreVertical, UserPlus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────
type ShiftCode = '' | 'D' | 'N' | 'DN' | 'OFF' | 'ABS'
const SHIFT_CYCLE: ShiftCode[] = ['', 'D', 'N', 'DN', 'OFF', 'ABS']

type Title = 'CN' | 'SN' | 'NA' | 'INT'
const TITLES: Record<Title, string> = { CN: 'رئيس تمريض', SN: 'ممرضة', NA: 'مساعد', INT: 'متدرب' }

interface StaffMember {
  id: string
  name: string
  code: string
  title: Title
  unit: string
  shifts: Record<string, ShiftCode>
}

// ─── Shift Styles ──────────────────────────────────────
const SHIFT_STYLE: Record<string, string> = {
  D:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  N:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  DN:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  OFF: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  ABS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  '': 'text-muted-foreground',
}

// ─── Sample Data ───────────────────────────────────────
const UNITS = ['ICU', 'ER', 'الباطنية', 'الجراحة', 'الأطفال']

function generateStaff(): StaffMember[] {
  return [
    { id: '1', name: 'سارة أحمد', code: '20001', title: 'CN', unit: 'ICU', shifts: {} },
    { id: '2', name: 'نورة سعيد', code: '20002', title: 'SN', unit: 'ICU', shifts: {} },
    { id: '3', name: 'ليلى عبدالرحمن', code: '20003', title: 'SN', unit: 'ICU', shifts: {} },
    { id: '4', name: 'هدى محمد', code: '20004', title: 'SN', unit: 'ICU', shifts: {} },
    { id: '5', name: 'أمل علي', code: '20005', title: 'NA', unit: 'ICU', shifts: {} },
    { id: '6', name: 'فاطمة حسن', code: '20006', title: 'CN', unit: 'ER', shifts: {} },
    { id: '7', name: 'منى خالد', code: '20007', title: 'SN', unit: 'ER', shifts: {} },
    { id: '8', name: 'رنا أحمد', code: '20008', title: 'SN', unit: 'ER', shifts: {} },
    { id: '9', name: 'دينا علي', code: '20009', title: 'INT', unit: 'ER', shifts: {} },
  ]
}

function buildDateRange(month: number, year: number): Date[] {
  // 16th of month to 15th of next month
  const start = new Date(year, month, 16)
  const end = new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 15)
  const dates: Date[] = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }
  return dates
}

// ─── Component ────────────────────────────────────────
export default function RosterPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [activeUnit, setActiveUnit] = useState(UNITS[0])
  const [staff, setStaff] = useState<StaffMember[]>(generateStaff)
  const [addOpen, setAddOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archives, setArchives] = useState<{ name: string; date: string; unit: string }[]>([])
  const [newStaff, setNewStaff] = useState({ name: '', code: '', title: 'SN' as Title })
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)

  const dates = useMemo(() => buildDateRange(month, year), [month, year])
  const unitStaff = useMemo(() => staff.filter(s => s.unit === activeUnit), [staff, activeUnit])

  const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  const DAYS_AR = ['أح','إث','ث','أر','خ','ج','س']

  const cycleShift = useCallback((sid: string, dateStr: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id !== sid) return s
      const cur = s.shifts[dateStr] ?? ''
      const idx = SHIFT_CYCLE.indexOf(cur)
      const next = SHIFT_CYCLE[(idx + 1) % SHIFT_CYCLE.length]
      return { ...s, shifts: { ...s.shifts, [dateStr]: next } }
    }))
  }, [])

  const getSummary = (s: StaffMember) => {
    const vals = Object.values(s.shifts)
    return {
      D: vals.filter(v => v === 'D').length,
      N: vals.filter(v => v === 'N').length,
      DN: vals.filter(v => v === 'DN').length,
      ABS: vals.filter(v => v === 'ABS').length,
      TOT: vals.filter(v => v !== '' && v !== 'OFF').length,
    }
  }

  const getBalanceRow = (date: Date) => {
    const ds = date.toISOString().split('T')[0]
    const dayStaff = unitStaff.filter(s => s.shifts[ds] === 'D').length
    const nightStaff = unitStaff.filter(s => s.shifts[ds] === 'N').length
    return { D: dayStaff, N: nightStaff }
  }

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.code) { toast.error('يرجى ملء الاسم والكود'); return }
    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id
        ? { ...s, name: newStaff.name, code: newStaff.code, title: newStaff.title }
        : s))
      toast.success('تم تعديل الموظف')
    } else {
      const ns: StaffMember = {
        id: Date.now().toString(),
        name: newStaff.name, code: newStaff.code,
        title: newStaff.title, unit: activeUnit, shifts: {},
      }
      setStaff(prev => [...prev, ns])
      toast.success('تم إضافة الموظف')
    }
    setAddOpen(false)
    setEditingStaff(null)
    setNewStaff({ name: '', code: '', title: 'SN' })
  }

  const handleDeleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id))
    toast.success('تم حذف الموظف')
  }

  const handleArchive = () => {
    const name = `${activeUnit} — ${MONTHS[month]} ${year}`
    setArchives(prev => [{ name, date: new Date().toLocaleDateString('ar-EG'), unit: activeUnit }, ...prev])
    toast.success(`تم أرشفة ${name}`)
    setArchiveOpen(false)
  }

  const handleExportCSV = () => {
    const header = ['الاسم', 'الكود', 'الرتبة', ...dates.map(d => d.toLocaleDateString('ar-EG')), 'D', 'N', 'ABS', 'TOT']
    const rows = unitStaff.map(s => {
      const sum = getSummary(s)
      return [s.name, s.code, TITLES[s.title], ...dates.map(d => s.shifts[d.toISOString().split('T')[0]] || ''), sum.D, sum.N, sum.ABS, sum.TOT]
    })
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `roster-${activeUnit}-${month+1}-${year}.csv`; a.click()
    toast.success('تم تصدير الروستر')
  }

  const handleClearUnit = () => {
    setStaff(prev => prev.map(s => s.unit === activeUnit ? { ...s, shifts: {} } : s))
    toast.info('تم مسح جدول الوردية')
  }

  const titleColor: Record<Title, string> = {
    CN: 'text-blue-500', SN: 'text-green-500', INT: 'text-purple-500', NA: 'text-amber-500',
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">الروستر / جدول المناوبات</h1>
          <p className="text-sm text-muted-foreground">إدارة مناوبات التمريض — اضغط على الخلية لتغيير الوردية</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="h-4 w-4 ml-1"/>تصدير</Button>
          <Button variant="outline" size="sm" onClick={() => setArchiveOpen(true)}><Archive className="h-4 w-4 ml-1"/>أرشفة</Button>
          <Button variant="outline" size="sm" onClick={handleClearUnit}><RefreshCw className="h-4 w-4 ml-1"/>مسح</Button>
          <Button size="sm" onClick={() => { setEditingStaff(null); setNewStaff({ name:'', code:'', title:'SN' }); setAddOpen(true) }}>
            <UserPlus className="h-4 w-4 ml-1"/>إضافة موظف
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">الشهر</Label>
              <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
                <SelectTrigger className="w-32"><SelectValue/></SelectTrigger>
                <SelectContent>{MONTHS.map((m,i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">السنة</Label>
              <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
                <SelectTrigger className="w-24"><SelectValue/></SelectTrigger>
                <SelectContent>{[2024,2025,2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="h-px w-px self-stretch bg-border mx-1"/>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">الوحدة</Label>
              <div className="flex gap-2 flex-wrap">
                {UNITS.map(u => (
                  <button key={u} onClick={() => setActiveUnit(u)}
                    className={cn('px-3 py-1 rounded-md text-xs font-semibold border transition-colors',
                      activeUnit === u ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary')}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(SHIFT_STYLE).filter(([k]) => k !== '').map(([code, cls]) => (
          <span key={code} className={cn('px-2 py-0.5 rounded font-bold', cls)}>{code}
            {code === 'D' ? ' صباح' : code === 'N' ? ' مساء' : code === 'DN' ? ' 24س' : code === 'OFF' ? ' إجازة' : ' غياب'}
          </span>
        ))}
      </div>

      {/* Roster Table */}
      <Card className="overflow-hidden shadow-md">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span>{activeUnit} — {MONTHS[month]} {year} (16/{month+1} → 15/{month === 11 ? 1 : month+2})</span>
            <span className="text-muted-foreground font-normal text-xs">{unitStaff.length} موظف</span>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse text-[11px] whitespace-nowrap">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 bg-muted/80 border border-border px-1 py-1 text-center w-7 text-muted-foreground">#</th>
                <th className="sticky top-0 z-10 bg-muted/80 border border-border px-2 py-1 text-right min-w-[140px] text-muted-foreground">الاسم</th>
                <th className="sticky top-0 z-10 bg-muted/80 border border-border px-1 py-1 text-center w-14 text-muted-foreground">كود</th>
                <th className="sticky top-0 z-10 bg-muted/80 border border-border px-1 py-1 text-center w-10 text-muted-foreground">رتبة</th>
                {dates.map(d => {
                  const isFri = d.getDay() === 5
                  return (
                    <th key={d.toISOString()} className={cn('sticky top-0 z-10 border border-border px-0.5 py-1 text-center w-7 text-muted-foreground', isFri ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-muted/80')}>
                      <div className="text-[9px]">{DAYS_AR[d.getDay()]}</div>
                      <div className="font-bold">{d.getDate()}</div>
                    </th>
                  )
                })}
                <th className="sticky top-0 z-10 bg-green-50 dark:bg-green-900/20 border border-border px-1 py-1 text-center text-green-700 text-[9px] w-7">D</th>
                <th className="sticky top-0 z-10 bg-amber-50 dark:bg-amber-900/20 border border-border px-1 py-1 text-center text-amber-700 text-[9px] w-7">N</th>
                <th className="sticky top-0 z-10 bg-purple-50 dark:bg-purple-900/20 border border-border px-1 py-1 text-center text-purple-700 text-[9px] w-8">ABS</th>
                <th className="sticky top-0 z-10 bg-muted/80 border border-border px-1 py-1 text-center text-[9px] w-8">TOT</th>
                <th className="sticky top-0 z-10 bg-muted/80 border border-border px-1 py-1 text-center w-10"></th>
              </tr>
            </thead>
            <tbody>
              {unitStaff.length === 0 && (
                <tr><td colSpan={dates.length + 9} className="text-center py-12 text-muted-foreground">لا يوجد موظفون في هذه الوحدة</td></tr>
              )}
              {unitStaff.map((s, idx) => {
                const sum = getSummary(s)
                return (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="border border-border text-center text-muted-foreground">{idx + 1}</td>
                    <td className="border border-border px-2 py-0.5">
                      <div className="font-semibold">{s.name}</div>
                    </td>
                    <td className="border border-border text-center font-mono text-muted-foreground">{s.code}</td>
                    <td className={cn('border border-border text-center font-bold', titleColor[s.title])}>{s.title}</td>
                    {dates.map(d => {
                      const ds = d.toISOString().split('T')[0]
                      const shift = s.shifts[ds] ?? ''
                      const isFri = d.getDay() === 5
                      return (
                        <td key={ds}
                          onClick={() => cycleShift(s.id, ds)}
                          className={cn('border border-border text-center cursor-pointer font-bold transition-transform hover:scale-110 h-7',
                            isFri ? 'bg-amber-50/30 dark:bg-amber-900/10' : '',
                            shift ? SHIFT_STYLE[shift] : '')}>
                          {shift}
                        </td>
                      )
                    })}
                    <td className="border border-border text-center bg-green-50/50 dark:bg-green-900/10 text-green-700 font-bold">{sum.D}</td>
                    <td className="border border-border text-center bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 font-bold">{sum.N}</td>
                    <td className="border border-border text-center bg-purple-50/50 dark:bg-purple-900/10 text-purple-700 font-bold">{sum.ABS}</td>
                    <td className="border border-border text-center font-black text-sm">{sum.TOT}</td>
                    <td className="border border-border text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreVertical className="h-3 w-3"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingStaff(s); setNewStaff({ name: s.name, code: s.code, title: s.title }); setAddOpen(true) }}>تعديل</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteStaff(s.id)}>حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
              {/* Balance Row */}
              <tr className="bg-muted/40">
                <td colSpan={4} className="border border-border px-2 py-1 text-xs font-bold text-muted-foreground">توازن اليوم</td>
                {dates.map(d => {
                  const bal = getBalanceRow(d)
                  return (
                    <td key={d.toISOString()} className="border border-border text-center p-0">
                      <div className="text-[9px] text-green-600 font-bold leading-tight">{bal.D}</div>
                      <div className="text-[9px] text-amber-600 font-bold leading-tight">{bal.N}</div>
                    </td>
                  )
                })}
                <td colSpan={5} className="border border-border"/>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editingStaff ? 'تعديل موظف' : 'إضافة موظف جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>الاسم *</Label>
              <Input value={newStaff.name} onChange={e => setNewStaff(p => ({...p, name: e.target.value}))} placeholder="اسم الموظف"/>
            </div>
            <div className="space-y-1">
              <Label>كود الموظف *</Label>
              <Input value={newStaff.code} onChange={e => setNewStaff(p => ({...p, code: e.target.value}))} placeholder="20001"/>
            </div>
            <div className="space-y-1">
              <Label>الرتبة</Label>
              <Select value={newStaff.title} onValueChange={v => setNewStaff(p => ({...p, title: v as Title}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Object.entries(TITLES).map(([k,v]) => <SelectItem key={k} value={k}>{k} — {v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddStaff}>{editingStaff ? 'حفظ التعديلات' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>أرشفة الروستر</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">سيتم حفظ روستر <strong>{activeUnit}</strong> لشهر <strong>{MONTHS[month]} {year}</strong> في الأرشيف.</p>
          {archives.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase">الأرشيف السابق</p>
              {archives.map((a,i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded border bg-muted/30 text-sm">
                  <span>{a.name}</span><span className="text-xs text-muted-foreground">{a.date}</span>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>إلغاء</Button>
            <Button onClick={handleArchive}><Archive className="h-4 w-4 ml-1"/>أرشفة الآن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
