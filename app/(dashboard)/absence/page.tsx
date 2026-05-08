'use client'

import { useState } from 'react'
import {
  UserX,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const UNITS = ['الكل','ICU 3rd','ICU 4th','CCU','ER','NICU','PICU','الطابق 8','الطابق 9']
const REASONS = ['مرض','إجازة طارئة','غياب بدون إذن','تأخر','ظروف خاصة','أخرى']

const absenceData = [
  { id: 'A1', name: 'أحمد محمد علي', code: 'S001', unit: 'ICU 3rd', title: 'SN', date: '2026-05-06', shift: 'D', status: 'absent', reason: 'مرض', notes: 'يرقد المستشفى' },
  { id: 'A2', name: 'سارة خالد', code: 'S002', unit: 'ER', title: 'CN', date: '2026-05-06', shift: 'N', status: 'present', reason: '', notes: '' },
  { id: 'A3', name: 'محمد حسن', code: 'S003', unit: 'CCU', title: 'SN', date: '2026-05-06', shift: 'D', status: 'absent', reason: 'غياب بدون إذن', notes: '' },
  { id: 'A4', name: 'نورة أحمد', code: 'S004', unit: 'ICU 3rd', title: 'NA', date: '2026-05-06', shift: 'DN', status: 'present', reason: '', notes: '' },
  { id: 'A5', name: 'خالد عبدالله', code: 'S005', unit: 'ER', title: 'SN', date: '2026-05-06', shift: 'D', status: 'off', reason: '', notes: '' },
  { id: 'A6', name: 'فاطمة علي', code: 'S006', unit: 'NICU', title: 'CN', date: '2026-05-06', shift: 'N', status: 'absent', reason: 'إجازة طارئة', notes: '' },
  { id: 'A7', name: 'حسام فارس', code: 'S007', unit: 'CCU', title: 'INT', date: '2026-05-06', shift: 'D', status: 'present', reason: '', notes: '' },
  { id: 'A8', name: 'ريم محمود', code: 'S008', unit: 'ICU 4th', title: 'SN', date: '2026-05-06', shift: 'N', status: 'absent', reason: 'مرض', notes: 'تقرير طبي مقدم' },
]

const statusConfig = {
  present: { label: 'حاضر', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle className="h-3 w-3" /> },
  absent: { label: 'غائب', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> },
  off: { label: 'إجازة', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <Clock className="h-3 w-3" /> },
  late: { label: 'متأخر', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <AlertTriangle className="h-3 w-3" /> },
}

export default function AbsencePage() {
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('الكل')
  const [monthFilter, setMonthFilter] = useState('4')
  const [yearFilter, setYearFilter] = useState('2026')
  const [records, setRecords] = useState(absenceData)

  // Log form
  const [logUnit, setLogUnit] = useState('ICU 3rd')
  const [logStaff, setLogStaff] = useState('')
  const [logDate, setLogDate] = useState('')
  const [logShift, setLogShift] = useState('D')
  const [logReason, setLogReason] = useState('مرض')
  const [logNotes, setLogNotes] = useState('')

  const filtered = records.filter(r => {
    const matchSearch = r.name.includes(search) || r.code.includes(search)
    const matchUnit = unitFilter === 'الكل' || r.unit === unitFilter
    return matchSearch && matchUnit
  })

  const totalStaff = records.length
  const present = records.filter(r => r.status === 'present').length
  const absent = records.filter(r => r.status === 'absent').length
  const off = records.filter(r => r.status === 'off').length
  const absRate = Math.round((absent / totalStaff) * 100)

  const logAbsence = () => {
    if (!logStaff || !logDate) return
    const newRec = {
      id: `A${Date.now()}`,
      name: logStaff,
      code: `S${Date.now()}`.slice(-4),
      unit: logUnit,
      title: 'SN',
      date: logDate,
      shift: logShift,
      status: 'absent',
      reason: logReason,
      notes: logNotes,
    }
    setRecords(prev => [newRec, ...prev])
    setLogStaff(''); setLogDate(''); setLogNotes('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">تقرير الغياب</h1>
          <p className="text-muted-foreground text-sm">
            تتبع وإدارة الغياب عبر جميع الوحدات
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-1" /> CSV
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 ml-1" /> طباعة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الكادر', value: totalStaff, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'حاضرون', value: present, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
          { label: 'غائبون', value: absent, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
          { label: 'نسبة الغياب', value: `${absRate}%`, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
        ].map(s => (
          <Card key={s.label} className={cn('p-4', s.bg, 'border-0')}>
            <p className={cn('text-3xl font-black', s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الكود..."
                className="pr-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Absence table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground">#</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground">الموظف</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground">الوحدة</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground">التاريخ</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground">الشيفت</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground">الحالة</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground">السبب</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const sc = statusConfig[row.status as keyof typeof statusConfig]
                  return (
                    <tr key={row.id} className={cn(
                      'border-b last:border-0 hover:bg-muted/30',
                      row.status === 'absent' && 'bg-red-50/50 dark:bg-red-900/10'
                    )}>
                      <td className="py-2.5 px-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.code} · {row.title}</div>
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground">{row.unit}</td>
                      <td className="py-2.5 px-4">{row.date}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant="outline" className="text-xs">{row.shift}</Badge>
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge className={cn('text-xs border-0 flex items-center gap-1 w-fit', sc.color)}>
                          {sc.icon} {sc.label}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground text-xs">{row.reason || '—'}</td>
                      <td className="py-2.5 px-4 text-muted-foreground text-xs">{row.notes || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Log absence form */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5 text-purple-600" />
            تسجيل غياب يدوي
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">الوحدة</Label>
              <Select value={logUnit} onValueChange={setLogUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.filter(u => u !== 'الكل').map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">اسم الموظف</Label>
              <Input placeholder="الاسم" value={logStaff} onChange={e => setLogStaff(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">التاريخ</Label>
              <Input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الشيفت</Label>
              <Select value={logShift} onValueChange={setLogShift}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['D','N','DN'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">السبب</Label>
              <Select value={logReason} onValueChange={setLogReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={logAbsence} className="mt-5">
              <Plus className="h-4 w-4 ml-1" /> تسجيل
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
