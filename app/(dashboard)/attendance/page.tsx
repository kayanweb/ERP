'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Download, RefreshCw, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { attendanceService } from '@/lib/services/attendance.service'
import { employeesService } from '@/lib/services/employees.service'
import { departmentsService } from '@/lib/services/departments.service'
import type { AttendanceRecord, EmployeeRecord } from '@/lib/repositories/contracts'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
type ShiftType = 'morning' | 'evening' | 'night'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: { label: 'حاضر', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  absent: { label: 'غائب', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3.5 w-3.5" /> },
  late: { label: 'متأخر', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  excused: { label: 'مستأذن', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <Clock className="h-3.5 w-3.5" /> },
}

const SHIFT_LABELS: Record<ShiftType, string> = {
  morning: 'صباحي',
  evening: 'مسائي',
  night: 'ليلي',
}

const SHIFT_TIMES: Record<ShiftType, { start: string; end: string }> = {
  morning: { start: '07:00', end: '15:00' },
  evening: { start: '15:00', end: '23:00' },
  night: { start: '23:00', end: '07:00' },
}

interface FormData {
  employeeId: string
  employeeName: string
  departmentId: string
  date: string
  shift: ShiftType
  scheduledStart: string
  scheduledEnd: string
  actualStart: string
  actualEnd: string
  status: AttendanceStatus
  notes: string
}

const today = new Date().toISOString().split('T')[0]

const EMPTY_FORM: FormData = {
  employeeId: '',
  employeeName: '',
  departmentId: '',
  date: today,
  shift: 'morning',
  scheduledStart: '07:00',
  scheduledEnd: '15:00',
  actualStart: '',
  actualEnd: '',
  status: 'present',
  notes: '',
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterDate, setFilterDate] = useState(today)
  const [filterDept, setFilterDept] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [editing, setEditing] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [att, emps, depts] = await Promise.all([
        attendanceService.getByDate(filterDate),
        employeesService.getAll(),
        departmentsService.getAll()
      ])
      setRecords(att)
      setEmployees(emps)
      setDepartments(depts.map(d => ({ id: d.id, name: d.nameAr || d.name })))
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [filterDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => records.filter(r => {
    if (filterDept !== 'all' && r.departmentId !== filterDept) return false
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    return true
  }), [records, filterDept, filterStatus])

  const stats = useMemo(() => ({
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
  }), [records])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, date: filterDate })
    setDialogOpen(true)
  }

  const openEdit = (r: AttendanceRecord) => {
    setEditing(r.id)
    setForm({
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      departmentId: r.departmentId,
      date: r.date,
      shift: r.shift as ShiftType,
      scheduledStart: r.scheduledStart,
      scheduledEnd: r.scheduledEnd,
      actualStart: r.actualStart || '',
      actualEnd: r.actualEnd || '',
      status: r.status as AttendanceStatus,
      notes: r.notes || '',
    })
    setDialogOpen(true)
  }

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => e.id === empId)
    if (emp) {
      setForm(p => ({
        ...p,
        employeeId: emp.id,
        employeeName: emp.nameAr,
        departmentId: emp.departmentId,
      }))
    }
  }

  const handleShiftChange = (shift: ShiftType) => {
    const times = SHIFT_TIMES[shift]
    setForm(p => ({
      ...p,
      shift,
      scheduledStart: times.start,
      scheduledEnd: times.end,
    }))
  }

  const calculateLateMinutes = (scheduled: string, actual: string): number => {
    if (!scheduled || !actual) return 0
    const [sh, sm] = scheduled.split(':').map(Number)
    const [ah, am] = actual.split(':').map(Number)
    const schedMins = sh * 60 + sm
    const actMins = ah * 60 + am
    return Math.max(0, actMins - schedMins)
  }

  const handleSave = async () => {
    if (!form.employeeId || !form.date) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setSaving(true)
    try {
      const lateMinutes = calculateLateMinutes(form.scheduledStart, form.actualStart)
      const data = {
        ...form,
        lateMinutes,
        status: lateMinutes > 15 && form.status === 'present' ? 'late' as AttendanceStatus : form.status,
      }

      if (editing) {
        await attendanceService.update(editing, data)
        toast.success('تم تعديل سجل الحضور')
      } else {
        await attendanceService.recordAttendance(data)
        toast.success('تم تسجيل الحضور')
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast.error('حدث خطأ في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const header = 'الاسم,القسم,التاريخ,الوردية,المقرر,الفعلي,الحالة,التأخير'
    const rows = filtered.map(r =>
      `${r.employeeName},${r.departmentId},${r.date},${SHIFT_LABELS[r.shift as ShiftType]},${r.scheduledStart},${r.actualStart || '-'},${STATUS_CONFIG[r.status as AttendanceStatus]?.label},${r.lateMinutes || 0} دقيقة`
    )
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `attendance-${filterDate}.csv`
    a.click()
    toast.success('تم تصدير سجل الحضور')
  }

  const handleMarkAllPresent = async () => {
    const activeEmployees = employees.filter(e => e.status === 'active')
    const existingIds = new Set(records.map(r => r.employeeId))
    const missing = activeEmployees.filter(e => !existingIds.has(e.id))

    if (missing.length === 0) {
      toast.info('جميع الموظفين مسجلون بالفعل')
      return
    }

    setSaving(true)
    try {
      for (const emp of missing) {
        await attendanceService.recordAttendance({
          employeeId: emp.id,
          employeeName: emp.nameAr,
          departmentId: emp.departmentId,
          date: filterDate,
          shift: 'morning',
          scheduledStart: '07:00',
          scheduledEnd: '15:00',
          actualStart: '07:00',
          status: 'present',
          notes: '',
        })
      }
      toast.success(`تم تسجيل حضور ${missing.length} موظف`)
      loadData()
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('حدث خطأ في تسجيل الحضور')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">سجل الحضور والانصراف</h1>
          <p className="text-sm text-muted-foreground">متابعة حضور الكادر التمريضي يومياً</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 ml-1" />تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 ml-1" />تصدير
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkAllPresent} disabled={saving}>
            <CheckCircle2 className="h-4 w-4 ml-1" />تسجيل الكل حاضر
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 ml-1" />تسجيل حضور
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي المسجلين', val: stats.total, color: 'text-foreground', icon: Clock },
          { label: 'حاضرون', val: stats.present, color: 'text-green-600', icon: CheckCircle2 },
          { label: 'غائبون', val: stats.absent, color: 'text-red-600', icon: XCircle },
          { label: 'متأخرون', val: stats.late, color: 'text-amber-600', icon: AlertTriangle },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-2xl font-black', s.color)}>{s.val}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
                <s.icon className={cn('h-8 w-8 opacity-20', s.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">التاريخ</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-40"><SelectValue placeholder="القسم" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأقسام</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>سجل الحضور — {filterDate}</span>
            <span className="text-muted-foreground font-normal">{filtered.length} سجل</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['#', 'الاسم', 'القسم', 'الوردية', 'المقرر', 'الحضور الفعلي', 'الانصراف', 'التأخير', 'الحالة', 'إجراءات'].map(h => (
                    <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                      لا يوجد سجلات حضور لهذا اليوم
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-semibold">{r.employeeName}</TableCell>
                    <TableCell className="text-sm">{r.departmentId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {SHIFT_LABELS[r.shift as ShiftType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{r.scheduledStart}</TableCell>
                    <TableCell className="font-mono text-sm">{r.actualStart || '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{r.actualEnd || '—'}</TableCell>
                    <TableCell>
                      {r.lateMinutes && r.lateMinutes > 0 ? (
                        <span className="text-amber-600 font-semibold">{r.lateMinutes} د</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs flex items-center gap-1 w-fit', STATUS_CONFIG[r.status as AttendanceStatus]?.color)}>
                        {STATUS_CONFIG[r.status as AttendanceStatus]?.icon}
                        {STATUS_CONFIG[r.status as AttendanceStatus]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openEdit(r)}>
                        تعديل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل سجل الحضور' : 'تسجيل حضور جديد'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">الموظف *</Label>
              <Select value={form.employeeId} onValueChange={handleEmployeeChange}>
                <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'active').map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.nameAr} ({e.employeeCode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">التاريخ *</Label>
              <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الوردية</Label>
              <Select value={form.shift} onValueChange={v => handleShiftChange(v as ShiftType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SHIFT_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">وقت البدء المقرر</Label>
              <Input type="time" value={form.scheduledStart} onChange={e => setForm(p => ({ ...p, scheduledStart: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">وقت الانتهاء المقرر</Label>
              <Input type="time" value={form.scheduledEnd} onChange={e => setForm(p => ({ ...p, scheduledEnd: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">وقت الحضور الفعلي</Label>
              <Input type="time" value={form.actualStart} onChange={e => setForm(p => ({ ...p, actualStart: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">وقت الانصراف الفعلي</Label>
              <Input type="time" value={form.actualEnd} onChange={e => setForm(p => ({ ...p, actualEnd: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as AttendanceStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">ملاحظات</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات إضافية..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              {editing ? 'حفظ' : 'تسجيل'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
