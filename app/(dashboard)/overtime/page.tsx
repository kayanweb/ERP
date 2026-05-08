'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Download, RefreshCw, Clock, CheckCircle2, XCircle, Loader2, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { overtimeService } from '@/lib/services/overtime.service'
import { employeesService } from '@/lib/services/employees.service'
import { departmentsService } from '@/lib/services/departments.service'
import type { OvertimeRecord, EmployeeRecord } from '@/lib/repositories/contracts'

type OvertimeStatus = 'pending' | 'approved' | 'rejected'

const STATUS_CONFIG: Record<OvertimeStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { label: 'موافق عليه', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3.5 w-3.5" /> },
}

interface FormData {
  employeeId: string
  employeeName: string
  departmentId: string
  date: string
  startTime: string
  endTime: string
  reason: string
}

const today = new Date().toISOString().split('T')[0]

const EMPTY_FORM: FormData = {
  employeeId: '',
  employeeName: '',
  departmentId: '',
  date: today,
  startTime: '15:00',
  endTime: '19:00',
  reason: '',
}

export default function OvertimePage() {
  const [records, setRecords] = useState<OvertimeRecord[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [editing, setEditing] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [ot, emps, depts] = await Promise.all([
        overtimeService.getAll(),
        employeesService.getAll(),
        departmentsService.getAll()
      ])
      setRecords(ot)
      setEmployees(emps)
      setDepartments(depts.map(d => ({ id: d.id, name: d.nameAr || d.name })))
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => records.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (filterDept !== 'all' && r.departmentId !== filterDept) return false
    return true
  }), [records, filterStatus, filterDept])

  const stats = useMemo(() => {
    const totalHours = records.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.totalHours, 0)
    return {
      total: records.length,
      pending: records.filter(r => r.status === 'pending').length,
      approved: records.filter(r => r.status === 'approved').length,
      totalHours: totalHours.toFixed(1),
    }
  }, [records])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
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

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const startMins = sh * 60 + sm
    const endMins = eh * 60 + em
    return Math.max(0, (endMins - startMins) / 60)
  }

  const handleSave = async () => {
    if (!form.employeeId || !form.date || !form.startTime || !form.endTime) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const totalHours = calculateHours(form.startTime, form.endTime)
    if (totalHours <= 0) {
      toast.error('يرجى التأكد من أوقات العمل الإضافي')
      return
    }

    setSaving(true)
    try {
      await overtimeService.request({
        ...form,
        totalHours,
        status: 'pending',
      })
      toast.success('تم تقديم طلب العمل الإضافي')
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving overtime:', error)
      toast.error('حدث خطأ في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await overtimeService.approve(id, 'المدير')
      toast.success('تمت الموافقة على العمل الإضافي')
      loadData()
    } catch (error) {
      console.error('Error approving overtime:', error)
      toast.error('حدث خطأ')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await overtimeService.reject(id)
      toast.success('تم رفض طلب العمل الإضافي')
      loadData()
    } catch (error) {
      console.error('Error rejecting overtime:', error)
      toast.error('حدث خطأ')
    }
  }

  const handleExport = () => {
    const header = 'الاسم,القسم,التاريخ,من,إلى,الساعات,السبب,الحالة'
    const rows = filtered.map(r =>
      `${r.employeeName},${r.departmentId},${r.date},${r.startTime},${r.endTime},${r.totalHours},${r.reason},${STATUS_CONFIG[r.status as OvertimeStatus]?.label}`
    )
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `overtime-${today}.csv`
    a.click()
    toast.success('تم تصدير سجل العمل الإضافي')
  }

  const hours = calculateHours(form.startTime, form.endTime)

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
          <h1 className="text-2xl font-bold">العمل الإضافي</h1>
          <p className="text-sm text-muted-foreground">إدارة طلبات وسجلات العمل الإضافي</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 ml-1" />تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 ml-1" />تصدير
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 ml-1" />طلب عمل إضافي
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الطلبات', val: stats.total, color: 'text-foreground', icon: Timer },
          { label: 'قيد المراجعة', val: stats.pending, color: 'text-amber-600', icon: Clock },
          { label: 'موافق عليها', val: stats.approved, color: 'text-green-600', icon: CheckCircle2 },
          { label: 'إجمالي الساعات', val: stats.totalHours, color: 'text-blue-600', icon: Timer, suffix: 'ساعة' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-2xl font-black', s.color)}>
                    {s.val}
                    {s.suffix && <span className="text-sm font-normal mr-1">{s.suffix}</span>}
                  </p>
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
          <div className="flex flex-wrap gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-40"><SelectValue placeholder="القسم" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأقسام</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>سجل العمل الإضافي</span>
            <span className="text-muted-foreground font-normal">{filtered.length} طلب</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['#', 'الاسم', 'القسم', 'التاريخ', 'من', 'إلى', 'الساعات', 'السبب', 'الحالة', 'إجراءات'].map(h => (
                    <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                      لا يوجد طلبات عمل إضافي
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-semibold">{r.employeeName}</TableCell>
                    <TableCell className="text-sm">{r.departmentId}</TableCell>
                    <TableCell className="font-mono text-sm">{r.date}</TableCell>
                    <TableCell className="font-mono text-sm">{r.startTime}</TableCell>
                    <TableCell className="font-mono text-sm">{r.endTime}</TableCell>
                    <TableCell className="font-bold text-center">{r.totalHours.toFixed(1)}</TableCell>
                    <TableCell className="text-sm max-w-[140px] truncate" title={r.reason}>{r.reason}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs flex items-center gap-1 w-fit', STATUS_CONFIG[r.status as OvertimeStatus]?.color)}>
                        {STATUS_CONFIG[r.status as OvertimeStatus]?.icon}
                        {STATUS_CONFIG[r.status as OvertimeStatus]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-700" onClick={() => handleApprove(r.id)}>
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-700" onClick={() => handleReject(r.id)}>
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>طلب عمل إضافي جديد</DialogTitle>
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
            <div className="space-y-1 opacity-50">
              <Label className="text-xs">الساعات المحسوبة</Label>
              <div className="h-9 flex items-center justify-center bg-muted rounded-md font-bold text-lg">
                {hours.toFixed(1)} ساعة
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">من الساعة *</Label>
              <Input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">إلى الساعة *</Label>
              <Input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">سبب العمل الإضافي</Label>
              <Textarea
                rows={2}
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="وصف سبب الحاجة للعمل الإضافي..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              تقديم الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
