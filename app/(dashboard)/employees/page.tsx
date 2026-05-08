'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Plus, Search, Edit, Trash2, Download, Users, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { employeesService } from '@/lib/services/employees.service'
import { departmentsService } from '@/lib/services/departments.service'
import type { EmployeeRecord } from '@/lib/repositories/contracts'

type Title = 'nurse' | 'senior_nurse' | 'head_nurse' | 'supervisor' | 'admin'
type Status = 'active' | 'on_leave' | 'absent' | 'terminated'

const TITLES: Record<Title, { label: string; color: string }> = {
  head_nurse: { label: 'رئيس تمريض', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  senior_nurse: { label: 'ممرضة أولى', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  nurse: { label: 'ممرضة', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  supervisor: { label: 'مشرفة', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  admin: { label: 'إداري', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
}

const STATUS_LABELS: Record<Status, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-green-100 text-green-700' },
  on_leave: { label: 'في إجازة', color: 'bg-blue-100 text-blue-700' },
  absent: { label: 'غائب', color: 'bg-red-100 text-red-700' },
  terminated: { label: 'منتهي', color: 'bg-gray-100 text-gray-700' },
}

const CONTRACTS = { permanent: 'دائم', temporary: 'مؤقت', intern: 'متدرب', part: 'جزئي' }

interface FormData {
  nameAr: string
  name: string
  employeeCode: string
  email: string
  phone: string
  nationalId: string
  dateOfBirth: string
  gender: 'male' | 'female'
  nationality: string
  address: string
  role: Title
  departmentId: string
  status: Status
  hireDate: string
  contractEndDate: string
  salary: string
  bankAccount: string
  emergencyContact: string
  emergencyPhone: string
  notes: string
}

const EMPTY_FORM: FormData = {
  nameAr: '', name: '', employeeCode: '', email: '', phone: '', nationalId: '',
  dateOfBirth: '', gender: 'female', nationality: 'سعودية', address: '',
  role: 'nurse', departmentId: '', status: 'active', hireDate: '',
  contractEndDate: '', salary: '', bankAccount: '', emergencyContact: '',
  emergencyPhone: '', notes: ''
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewEmp, setViewEmp] = useState<EmployeeRecord | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [editing, setEditing] = useState<string | null>(null)

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [emps, depts] = await Promise.all([
        employeesService.getAll(),
        departmentsService.getAll()
      ])
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

  const filtered = useMemo(() => employees.filter(e => {
    if (search && !e.nameAr.includes(search) && !e.employeeCode.includes(search) && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterDept !== 'all' && e.departmentId !== filterDept) return false
    if (filterRole !== 'all' && e.role !== filterRole) return false
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    return true
  }), [employees, search, filterDept, filterRole, filterStatus])

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    onLeave: employees.filter(e => e.status === 'on_leave').length,
    terminated: employees.filter(e => e.status === 'terminated').length,
  }), [employees])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (e: EmployeeRecord) => {
    setEditing(e.id)
    setForm({
      nameAr: e.nameAr,
      name: e.name,
      employeeCode: e.employeeCode,
      email: e.email,
      phone: e.phone,
      nationalId: e.nationalId || '',
      dateOfBirth: e.dateOfBirth || '',
      gender: e.gender || 'female',
      nationality: e.nationality || 'سعودية',
      address: e.address || '',
      role: e.role as Title,
      departmentId: e.departmentId,
      status: e.status as Status,
      hireDate: e.hireDate,
      contractEndDate: e.contractEndDate || '',
      salary: e.salary?.toString() || '',
      bankAccount: e.bankAccount || '',
      emergencyContact: e.emergencyContact || '',
      emergencyPhone: e.emergencyPhone || '',
      notes: e.notes || ''
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nameAr || !form.employeeCode) {
      toast.error('الاسم والكود مطلوبان')
      return
    }

    setSaving(true)
    try {
      const dept = departments.find(d => d.id === form.departmentId)
      const data = {
        ...form,
        departmentName: dept?.name,
        salary: form.salary ? parseFloat(form.salary) : undefined,
      }

      if (editing) {
        await employeesService.update(editing, data)
        toast.success('تم تعديل بيانات الموظف')
      } else {
        await employeesService.create(data)
        toast.success('تم إضافة موظف جديد')
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving employee:', error)
      toast.error('حدث خطأ في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await employeesService.delete(deleteId)
      toast.success('تم حذف الموظف')
      setDeleteId(null)
      loadData()
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('حدث خطأ في حذف الموظف')
    }
  }

  const handleExport = () => {
    const csv = ['الاسم,الكود,الرتبة,القسم,الهاتف,البريد,الحالة',
      ...employees.map(e => `${e.nameAr},${e.employeeCode},${TITLES[e.role as Title]?.label || e.role},${e.departmentName || ''},${e.phone},${e.email},${STATUS_LABELS[e.status as Status]?.label || e.status}`)
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'employees.csv'
    a.click()
    toast.success('تم تصدير بيانات الموظفين')
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الموظفين</h1>
          <p className="text-sm text-muted-foreground">بيانات الكادر التمريضي كاملة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 ml-1" />تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 ml-1" />تصدير
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 ml-1" />إضافة موظف
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الموظفين', val: stats.total, color: 'text-foreground' },
          { label: 'نشطون', val: stats.active, color: 'text-green-600' },
          { label: 'في إجازة', val: stats.onLeave, color: 'text-blue-600' },
          { label: 'منتهي الخدمة', val: stats.terminated, color: 'text-muted-foreground' },
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
            <div className="relative flex-1 min-w-48">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pr-9" placeholder="بحث بالاسم أو الكود..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-36"><SelectValue placeholder="القسم" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأقسام</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-36"><SelectValue placeholder="الرتبة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الرتب</SelectItem>
                {Object.entries(TITLES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا يوجد موظفون مطابقون</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(emp => (
            <Card key={emp.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewEmp(emp)}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 text-base font-bold">
                    <AvatarFallback className="bg-primary/10 text-primary">{emp.nameAr.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{emp.nameAr}</p>
                    <p className="text-xs text-muted-foreground truncate">{emp.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <Badge className={cn('text-[10px] px-1.5 py-0', TITLES[emp.role as Title]?.color)}>
                        {TITLES[emp.role as Title]?.label || emp.role}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{emp.departmentName}</Badge>
                      {emp.status !== 'active' && (
                        <Badge className={cn('text-[10px] px-1.5 py-0', STATUS_LABELS[emp.status as Status]?.color)}>
                          {STATUS_LABELS[emp.status as Status]?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mt-3" onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => openEdit(emp)}>
                    <Edit className="h-3 w-3 ml-1" />تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(emp.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل موظف' : 'إضافة موظف جديد'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">الاسم بالعربية *</Label>
              <Input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">الاسم بالإنجليزية</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">كود الموظف *</Label>
              <Input value={form.employeeCode} onChange={e => setForm(p => ({ ...p, employeeCode: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">رقم الهوية</Label>
              <Input value={form.nationalId} onChange={e => setForm(p => ({ ...p, nationalId: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">رقم الهاتف</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">البريد الإلكتروني</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">تاريخ الميلاد</Label>
              <Input type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الجنس</Label>
              <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v as 'male' | 'female' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">أنثى</SelectItem>
                  <SelectItem value="male">ذكر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الجنسية</Label>
              <Input value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الرتبة</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v as Title }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TITLES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">القسم</Label>
              <Select value={form.departmentId} onValueChange={v => setForm(p => ({ ...p, departmentId: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as Status }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">تاريخ التوظيف</Label>
              <Input type="date" value={form.hireDate} onChange={e => setForm(p => ({ ...p, hireDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">نهاية العقد</Label>
              <Input type="date" value={form.contractEndDate} onChange={e => setForm(p => ({ ...p, contractEndDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الراتب</Label>
              <Input type="number" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الحساب البنكي</Label>
              <Input value={form.bankAccount} onChange={e => setForm(p => ({ ...p, bankAccount: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">جهة اتصال الطوارئ</Label>
              <Input value={form.emergencyContact} onChange={e => setForm(p => ({ ...p, emergencyContact: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">هاتف الطوارئ</Label>
              <Input value={form.emergencyPhone} onChange={e => setForm(p => ({ ...p, emergencyPhone: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">العنوان</Label>
              <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">ملاحظات</Label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات إضافية..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              {editing ? 'حفظ التعديلات' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewEmp} onOpenChange={() => setViewEmp(null)}>
        {viewEmp && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">{viewEmp.nameAr.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle>{viewEmp.nameAr}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{viewEmp.name}</p>
                </div>
              </div>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              {[
                ['الكود', viewEmp.employeeCode],
                ['الرتبة', TITLES[viewEmp.role as Title]?.label || viewEmp.role],
                ['القسم', viewEmp.departmentName],
                ['الهاتف', viewEmp.phone],
                ['البريد', viewEmp.email],
                ['تاريخ التوظيف', viewEmp.hireDate],
                ['الحالة', STATUS_LABELS[viewEmp.status as Status]?.label || viewEmp.status],
                ['الجنسية', viewEmp.nationality],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="font-semibold">{v || '—'}</p>
                </div>
              ))}
              {viewEmp.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">ملاحظات</p>
                  <p>{viewEmp.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewEmp(null)}>إغلاق</Button>
              <Button onClick={() => { openEdit(viewEmp); setViewEmp(null) }}>
                <Edit className="h-4 w-4 ml-1" />تعديل
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع.</AlertDialogDescription>
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
