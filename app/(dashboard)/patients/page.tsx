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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Plus, Edit, Trash2, Download, RefreshCw, Loader2, Search,
  User, Bed, Heart, AlertTriangle, Shield, Activity, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { patientsService } from '@/lib/services/patients.service'
import { departmentsService } from '@/lib/services/departments.service'
import type { PatientRecord, DepartmentRecord } from '@/lib/repositories/contracts'

type PatientStatus = 'admitted' | 'discharged' | 'transferred' | 'critical'
type IsolationType = 'none' | 'contact' | 'droplet' | 'airborne' | 'combined'

const STATUS_CONFIG: Record<PatientStatus, { label: string; color: string }> = {
  admitted: { label: 'مقيم', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  discharged: { label: 'خرج', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-300' },
  transferred: { label: 'منقول', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  critical: { label: 'حرج', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

const ISOLATION_CONFIG: Record<IsolationType, { label: string; color: string }> = {
  none: { label: 'لا يوجد', color: 'bg-gray-100 text-gray-600' },
  contact: { label: 'تماس', color: 'bg-yellow-100 text-yellow-700' },
  droplet: { label: 'رذاذي', color: 'bg-orange-100 text-orange-700' },
  airborne: { label: 'هوائي', color: 'bg-red-100 text-red-700' },
  combined: { label: 'مشترك', color: 'bg-purple-100 text-purple-700' },
}

interface FormData {
  mrn: string
  nameAr: string
  nameEn: string
  dateOfBirth: string
  gender: 'male' | 'female'
  departmentId: string
  bedNumber: string
  admissionDate: string
  diagnosis: string
  attendingPhysician: string
  status: PatientStatus
  isolationStatus: IsolationType
  notes: string
}

const EMPTY_FORM: FormData = {
  mrn: '',
  nameAr: '',
  nameEn: '',
  dateOfBirth: '',
  gender: 'male',
  departmentId: '',
  bedNumber: '',
  admissionDate: new Date().toISOString().split('T')[0],
  diagnosis: '',
  attendingPhysician: '',
  status: 'admitted',
  isolationStatus: 'none',
  notes: '',
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [departments, setDepartments] = useState<DepartmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<PatientRecord | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pats, depts] = await Promise.all([
        patientsService.getAll(),
        departmentsService.getAll()
      ])
      setPatients(pats)
      setDepartments(depts)
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

  const filtered = useMemo(() => patients.filter(p => {
    const matchesSearch = p.nameAr.includes(searchQuery) ||
      p.mrn.includes(searchQuery) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()))
    if (!matchesSearch) return false
    if (filterDept !== 'all' && p.departmentId !== filterDept) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    return true
  }), [patients, searchQuery, filterDept, filterStatus])

  const stats = useMemo(() => ({
    total: patients.length,
    admitted: patients.filter(p => p.status === 'admitted').length,
    critical: patients.filter(p => p.status === 'critical').length,
    isolation: patients.filter(p => p.isolationStatus && p.isolationStatus !== 'none').length,
  }), [patients])

  const getDeptName = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId)
    return dept?.nameAr || dept?.name || deptId
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (p: PatientRecord) => {
    setEditing(p.id)
    setForm({
      mrn: p.mrn,
      nameAr: p.nameAr,
      nameEn: p.nameEn || '',
      dateOfBirth: p.dateOfBirth || '',
      gender: p.gender || 'male',
      departmentId: p.departmentId,
      bedNumber: p.bedNumber || '',
      admissionDate: p.admissionDate || '',
      diagnosis: p.diagnosis || '',
      attendingPhysician: p.attendingPhysician || '',
      status: p.status as PatientStatus,
      isolationStatus: (p.isolationStatus as IsolationType) || 'none',
      notes: p.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.mrn || !form.nameAr || !form.departmentId) {
      toast.error('يرجى ملء الحقول المطلوبة')
      return
    }

    setSaving(true)
    try {
      const data = {
        mrn: form.mrn,
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        departmentId: form.departmentId,
        bedNumber: form.bedNumber,
        admissionDate: form.admissionDate,
        diagnosis: form.diagnosis,
        attendingPhysician: form.attendingPhysician,
        status: form.status,
        isolationStatus: form.isolationStatus,
        notes: form.notes,
      }

      if (editing) {
        await patientsService.update(editing, data)
        toast.success('تم تعديل بيانات المريض')
      } else {
        await patientsService.create(data)
        toast.success('تم إضافة المريض')
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving patient:', error)
      toast.error('حدث خطأ في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await patientsService.delete(deleteId)
      toast.success('تم حذف المريض')
      setDeleteId(null)
      loadData()
    } catch (error) {
      console.error('Error deleting patient:', error)
      toast.error('حدث خطأ في الحذف')
    }
  }

  const handleExport = () => {
    const header = 'رقم الملف,الاسم,القسم,السرير,التشخيص,الحالة,العزل,تاريخ الدخول'
    const rows = filtered.map(p =>
      `${p.mrn},${p.nameAr},${getDeptName(p.departmentId)},${p.bedNumber || '-'},${p.diagnosis || '-'},${STATUS_CONFIG[p.status as PatientStatus]?.label || p.status},${ISOLATION_CONFIG[(p.isolationStatus as IsolationType) || 'none']?.label},${p.admissionDate || '-'}`
    )
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'patients.csv'
    link.click()
    toast.success('تم تصدير البيانات')
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المرضى</h1>
          <p className="text-sm text-muted-foreground">سجل المرضى المقيمين بالمستشفى</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 ml-1" />تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 ml-1" />تصدير
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 ml-1" />مريض جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black">{stats.total}</p>
                <p className="text-xs text-muted-foreground">إجمالي المرضى</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Bed className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-green-600">{stats.admitted}</p>
                <p className="text-xs text-muted-foreground">مقيمين</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-red-600">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">حالات حرجة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-amber-600">{stats.isolation}</p>
                <p className="text-xs text-muted-foreground">عزل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pr-10"
                placeholder="بحث بالاسم أو رقم الملف..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-40"><SelectValue placeholder="القسم" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأقسام</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">سجل المرضى — {filtered.length} مريض</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['رقم الملف', 'الاسم', 'القسم', 'السرير', 'التشخيص', 'الحالة', 'العزل', 'إجراءات'].map(h => (
                    <TableHead key={h} className="text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      لا يوجد مرضى
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map(p => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setViewItem(p)}>
                    <TableCell className="font-mono text-sm">{p.mrn}</TableCell>
                    <TableCell className="font-semibold">{p.nameAr}</TableCell>
                    <TableCell className="text-sm">{getDeptName(p.departmentId)}</TableCell>
                    <TableCell className="font-mono">{p.bedNumber || '-'}</TableCell>
                    <TableCell className="text-sm max-w-32 truncate">{p.diagnosis || '-'}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', STATUS_CONFIG[p.status as PatientStatus]?.color)}>
                        {STATUS_CONFIG[p.status as PatientStatus]?.label || p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.isolationStatus && p.isolationStatus !== 'none' && (
                        <Badge className={cn('text-xs', ISOLATION_CONFIG[p.isolationStatus as IsolationType]?.color)}>
                          <AlertTriangle className="h-3 w-3 ml-1" />
                          {ISOLATION_CONFIG[p.isolationStatus as IsolationType]?.label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(p)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-destructive" onClick={() => setDeleteId(p.id)}>
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
            <DialogTitle>{editing ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">رقم الملف *</Label>
                <Input value={form.mrn} onChange={e => setForm(p => ({ ...p, mrn: e.target.value }))} placeholder="MRN-XXXX" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الجنس</Label>
                <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v as 'male' | 'female' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">الاسم بالعربي *</Label>
                <Input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الاسم بالإنجليزي</Label>
                <Input value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">تاريخ الميلاد</Label>
                <Input type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">تاريخ الدخول</Label>
                <Input type="date" value={form.admissionDate} onChange={e => setForm(p => ({ ...p, admissionDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">القسم *</Label>
                <Select value={form.departmentId} onValueChange={v => setForm(p => ({ ...p, departmentId: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">رقم السرير</Label>
                <Input value={form.bedNumber} onChange={e => setForm(p => ({ ...p, bedNumber: e.target.value }))} placeholder="301" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as PatientStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">العزل</Label>
                <Select value={form.isolationStatus} onValueChange={v => setForm(p => ({ ...p, isolationStatus: v as IsolationType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ISOLATION_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الطبيب المعالج</Label>
              <Input value={form.attendingPhysician} onChange={e => setForm(p => ({ ...p, attendingPhysician: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">التشخيص</Label>
              <Textarea rows={2} value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} placeholder="التشخيص الرئيسي..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">ملاحظات</Label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات إضافية..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              {editing ? 'حفظ' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        {viewItem && (
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn('text-xs', STATUS_CONFIG[viewItem.status as PatientStatus]?.color)}>
                  {STATUS_CONFIG[viewItem.status as PatientStatus]?.label}
                </Badge>
                {viewItem.isolationStatus && viewItem.isolationStatus !== 'none' && (
                  <Badge className={cn('text-xs', ISOLATION_CONFIG[viewItem.isolationStatus as IsolationType]?.color)}>
                    <AlertTriangle className="h-3 w-3 ml-1" />
                    {ISOLATION_CONFIG[viewItem.isolationStatus as IsolationType]?.label}
                  </Badge>
                )}
              </div>
              <DialogTitle>{viewItem.nameAr}</DialogTitle>
              <DialogDescription>{viewItem.mrn}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">القسم</p>
                  <p className="font-medium">{getDeptName(viewItem.departmentId)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">السرير</p>
                  <p className="font-medium">{viewItem.bedNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الدخول</p>
                  <p className="font-medium">{viewItem.admissionDate || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الطبيب المعالج</p>
                  <p className="font-medium">{viewItem.attendingPhysician || '-'}</p>
                </div>
              </div>
              {viewItem.diagnosis && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">التشخيص</p>
                  <p className="text-sm">{viewItem.diagnosis}</p>
                </div>
              )}
              {viewItem.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
                  <p className="text-sm">{viewItem.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewItem(null)}>إغلاق</Button>
              <Button onClick={() => { setViewItem(null); openEdit(viewItem) }}>تعديل</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا المريض؟ لا يمكن التراجع.</AlertDialogDescription>
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
