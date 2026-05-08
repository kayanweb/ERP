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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Download, Edit, Trash2, CheckCircle2, XCircle, Clock, Calendar, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { vacationsService } from '@/lib/services/vacations.service'
import { employeesService } from '@/lib/services/employees.service'
import type { VacationRecord, EmployeeRecord } from '@/lib/repositories/contracts'

type VacationType = 'annual' | 'sick' | 'emergency' | 'maternity' | 'unpaid' | 'other'
type VacationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

const VACATION_TYPES: Record<VacationType, { label: string; color: string }> = {
  annual: { label: 'سنوية', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  sick: { label: 'مرضية', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  emergency: { label: 'طارئة', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  unpaid: { label: 'بدون راتب', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
  maternity: { label: 'أمومة', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  other: { label: 'أخرى', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
}

const STATUS_CONFIG: Record<VacationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'موافق عليها', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: 'مرفوضة', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: 'ملغية', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300', icon: <XCircle className="h-3 w-3" /> },
}

const calcDays = (start: string, end: string) => {
  if (!start || !end) return 0
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1)
}

interface FormData {
  employeeId: string
  employeeName: string
  departmentId: string
  type: VacationType
  startDate: string
  endDate: string
  reason: string
}

const EMPTY_FORM: FormData = {
  employeeId: '',
  employeeName: '',
  departmentId: '',
  type: 'annual',
  startDate: '',
  endDate: '',
  reason: '',
}

export default function VacationsPage() {
  const [requests, setRequests] = useState<VacationRecord[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [editing, setEditing] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [vacs, emps] = await Promise.all([
        vacationsService.getAll(),
        employeesService.getAll()
      ])
      setRequests(vacs)
      setEmployees(emps)
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

  const filtered = useMemo(() => requests.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (filterType !== 'all' && r.type !== filterType) return false
    return true
  }), [requests, filterStatus, filterType])

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (r: VacationRecord) => {
    setEditing(r.id)
    setForm({
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      departmentId: r.departmentId,
      type: r.type as VacationType,
      startDate: r.startDate,
      endDate: r.endDate,
      reason: r.reason,
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

  const handleSave = async () => {
    if (!form.employeeId || !form.startDate || !form.endDate) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const totalDays = calcDays(form.startDate, form.endDate)

    setSaving(true)
    try {
      if (editing) {
        await vacationsService.update(editing, {
          ...form,
          totalDays,
        })
        toast.success('تم تعديل الطلب')
      } else {
        await vacationsService.request({
          ...form,
          totalDays,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        })
        toast.success('تم إضافة طلب الإجازة')
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving vacation:', error)
      toast.error('حدث خطأ في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await vacationsService.approve(id, 'المدير')
      toast.success('تمت الموافقة على الإجازة')
      loadData()
    } catch (error) {
      console.error('Error approving vacation:', error)
      toast.error('حدث خطأ')
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    try {
      await vacationsService.reject(rejectId, 'المدير', rejectReason)
      toast.success('تم رفض الطلب')
      setRejectId(null)
      setRejectReason('')
      loadData()
    } catch (error) {
      console.error('Error rejecting vacation:', error)
      toast.error('حدث خطأ')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await vacationsService.delete(deleteId)
      toast.success('تم حذف الطلب')
      setDeleteId(null)
      loadData()
    } catch (error) {
      console.error('Error deleting vacation:', error)
      toast.error('حدث خطأ')
    }
  }

  const handleExport = () => {
    const header = 'الاسم,نوع الإجازة,من,إلى,الأيام,الحالة,السبب'
    const rows = filtered.map(r =>
      `${r.employeeName},${VACATION_TYPES[r.type as VacationType]?.label},${r.startDate},${r.endDate},${r.totalDays},${STATUS_CONFIG[r.status as VacationStatus]?.label},${r.reason}`
    )
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'vacations.csv'
    a.click()
    toast.success('تم تصدير طلبات الإجازات')
  }

  const days = calcDays(form.startDate, form.endDate)

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الإجازات</h1>
          <p className="text-sm text-muted-foreground">طلبات وتتبع إجازات الكادر التمريضي</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 ml-1" />تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 ml-1" />تصدير
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 ml-1" />طلب إجازة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الطلبات', val: stats.total, color: 'text-foreground' },
          { label: 'قيد المراجعة', val: stats.pending, color: 'text-amber-600' },
          { label: 'موافق عليها', val: stats.approved, color: 'text-green-600' },
          { label: 'مرفوضة', val: stats.rejected, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className={cn('text-3xl font-black', s.color)}>{s.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
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
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40"><SelectValue placeholder="نوع الإجازة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                {Object.entries(VACATION_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">طلبات الإجازة — {filtered.length} طلب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['#', 'الاسم', 'نوع الإجازة', 'من', 'إلى', 'الأيام', 'السبب', 'الحالة', 'إجراءات'].map(h => (
                    <TableHead key={h} className="text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      لا توجد طلبات إجازة
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-semibold">{r.employeeName}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', VACATION_TYPES[r.type as VacationType]?.color)}>
                        {VACATION_TYPES[r.type as VacationType]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{r.startDate}</TableCell>
                    <TableCell className="text-sm font-mono">{r.endDate}</TableCell>
                    <TableCell className="font-bold text-center">{r.totalDays}</TableCell>
                    <TableCell className="text-sm max-w-[140px] truncate" title={r.reason}>{r.reason}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs flex items-center gap-1 w-fit', STATUS_CONFIG[r.status as VacationStatus]?.color)}>
                        {STATUS_CONFIG[r.status as VacationStatus]?.icon}
                        {STATUS_CONFIG[r.status as VacationStatus]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-700" onClick={() => handleApprove(r.id)}>
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-700" onClick={() => { setRejectId(r.id); setRejectReason('') }}>
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(r)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-destructive" onClick={() => setDeleteId(r.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل طلب الإجازة' : 'طلب إجازة جديد'}</DialogTitle>
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
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">نوع الإجازة</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as VacationType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(VACATION_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">تاريخ البدء *</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">تاريخ الانتهاء *</Label>
              <Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
            {form.startDate && form.endDate && (
              <div className="col-span-2 p-2 bg-muted/50 rounded text-sm text-center">
                <Calendar className="h-4 w-4 inline ml-1" />
                <strong>{days}</strong> يوم
              </div>
            )}
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">سبب الإجازة</Label>
              <Textarea rows={2} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="أسباب طلب الإجازة..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              {editing ? 'حفظ' : 'تقديم الطلب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>رفض طلب الإجازة</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">سبب الرفض</Label>
            <Textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="اذكر سبب رفض الطلب..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleReject}>رفض الطلب</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف هذا الطلب نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
