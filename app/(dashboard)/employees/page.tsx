'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Plus, Search, Edit, Trash2, Phone, Mail, Download, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Title = 'CN' | 'SN' | 'NA' | 'INT'
type Status = 'active' | 'inactive'
type Contract = 'permanent' | 'temporary' | 'intern' | 'part'

interface Employee {
  id: string
  nameAr: string
  nameEn: string
  code: string
  title: Title
  unit: string
  phone: string
  email: string
  hireDate: string
  contract: Contract
  status: Status
  blsExpiry: string
  licenseExpiry: string
  notes: string
}

const TITLES: Record<Title, { label: string; color: string }> = {
  CN:  { label: 'رئيس تمريض', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  SN:  { label: 'ممرضة', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  INT: { label: 'متدرب', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  NA:  { label: 'مساعد تمريض', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
}
const CONTRACTS: Record<Contract, string> = { permanent: 'دائم', temporary: 'مؤقت', intern: 'متدرب', part: 'جزئي' }
const UNITS = ['ICU', 'ER', 'الباطنية', 'الجراحة', 'الأطفال', 'النساء والولادة', 'العظام']

const SAMPLE: Employee[] = [
  { id:'1', nameAr:'سارة أحمد محمد', nameEn:'Sara Ahmed', code:'20001', title:'CN', unit:'ICU', phone:'+966501234567', email:'sara@hospital.com', hireDate:'2020-03-01', contract:'permanent', status:'active', blsExpiry:'2025-06-15', licenseExpiry:'2025-12-01', notes:'' },
  { id:'2', nameAr:'فاطمة خالد حسن', nameEn:'Fatima Khalid', code:'20002', title:'SN', unit:'ICU', phone:'+966502345678', email:'fatima@hospital.com', hireDate:'2021-06-15', contract:'permanent', status:'active', blsExpiry:'2025-08-20', licenseExpiry:'2026-01-01', notes:'' },
  { id:'3', nameAr:'نورة سعيد العلي', nameEn:'Noura Said', code:'20003', title:'SN', unit:'ER', phone:'+966503456789', email:'noura@hospital.com', hireDate:'2022-01-10', contract:'temporary', status:'active', blsExpiry:'2024-08-15', licenseExpiry:'2025-06-01', notes:'بحاجة تجديد BLS' },
  { id:'4', nameAr:'منى علي الزهراني', nameEn:'Mona Ali', code:'20004', title:'NA', unit:'ER', phone:'+966504567890', email:'mona@hospital.com', hireDate:'2023-09-01', contract:'intern', status:'active', blsExpiry:'2025-09-01', licenseExpiry:'2025-09-01', notes:'' },
  { id:'5', nameAr:'هدى محمد القرشي', nameEn:'Huda Mohammed', code:'20005', title:'SN', unit:'الباطنية', phone:'+966505678901', email:'huda@hospital.com', hireDate:'2019-05-20', contract:'permanent', status:'inactive', blsExpiry:'2023-05-20', licenseExpiry:'2024-12-01', notes:'في إجازة' },
]

const EMPTY: Omit<Employee,'id'> = { nameAr:'', nameEn:'', code:'', title:'SN', unit:UNITS[0], phone:'', email:'', hireDate:'', contract:'permanent', status:'active', blsExpiry:'', licenseExpiry:'', notes:'' }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(SAMPLE)
  const [search, setSearch] = useState('')
  const [filterUnit, setFilterUnit] = useState('all')
  const [filterTitle, setFilterTitle] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [viewEmp, setViewEmp] = useState<Employee|null>(null)
  const [form, setForm] = useState<Omit<Employee,'id'>>(EMPTY)
  const [editing, setEditing] = useState<string|null>(null)

  const filtered = useMemo(() => employees.filter(e => {
    if (search && !e.nameAr.includes(search) && !e.code.includes(search) && !e.nameEn.toLowerCase().includes(search.toLowerCase())) return false
    if (filterUnit !== 'all' && e.unit !== filterUnit) return false
    if (filterTitle !== 'all' && e.title !== filterTitle) return false
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    return true
  }), [employees, search, filterUnit, filterTitle, filterStatus])

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
    expiring: employees.filter(e => {
      const bls = e.blsExpiry && new Date(e.blsExpiry) < new Date(Date.now() + 30*24*60*60*1000)
      return bls
    }).length,
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true) }
  const openEdit = (e: Employee) => { setEditing(e.id); setForm({ nameAr:e.nameAr, nameEn:e.nameEn, code:e.code, title:e.title, unit:e.unit, phone:e.phone, email:e.email, hireDate:e.hireDate, contract:e.contract, status:e.status, blsExpiry:e.blsExpiry, licenseExpiry:e.licenseExpiry, notes:e.notes }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.nameAr || !form.code) { toast.error('الاسم والكود مطلوبان'); return }
    if (editing) {
      setEmployees(prev => prev.map(e => e.id === editing ? { ...form, id: editing } : e))
      toast.success('تم تعديل بيانات الموظف')
    } else {
      setEmployees(prev => [...prev, { ...form, id: Date.now().toString() }])
      toast.success('تم إضافة موظف جديد')
    }
    setDialogOpen(false)
  }

  const handleDelete = () => {
    if (!deleteId) return
    setEmployees(prev => prev.filter(e => e.id !== deleteId))
    toast.success('تم حذف الموظف')
    setDeleteId(null)
  }

  const handleExport = () => {
    const csv = ['الاسم,الكود,الرتبة,الوحدة,الهاتف,البريد,الحالة',
      ...employees.map(e => `${e.nameAr},${e.code},${e.title},${e.unit},${e.phone},${e.email},${e.status}`)
    ].join('\n')
    const blob = new Blob(['\uFEFF'+csv], {type:'text/csv'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'employees.csv'; a.click()
    toast.success('تم تصدير بيانات الموظفين')
  }

  const isExpiring = (date: string) => date && new Date(date) < new Date(Date.now() + 30*24*60*60*1000)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الموظفين</h1>
          <p className="text-sm text-muted-foreground">بيانات الكادر التمريضي كاملة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1"/>تصدير</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1"/>إضافة موظف</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'إجمالي الموظفين', val: stats.total, color:'text-foreground' },
          { label:'نشطون', val: stats.active, color:'text-green-600' },
          { label:'غير نشطين', val: stats.inactive, color:'text-muted-foreground' },
          { label:'شهادات قاربت الانتهاء', val: stats.expiring, color:'text-amber-600' },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-4 pb-3 text-center"><p className={cn('text-3xl font-black', s.color)}>{s.val}</p><p className="text-xs text-muted-foreground mt-1">{s.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <Card><CardContent className="pt-4 pb-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input className="pr-9" placeholder="بحث بالاسم أو الكود..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <Select value={filterUnit} onValueChange={setFilterUnit}>
            <SelectTrigger className="w-36"><SelectValue placeholder="الوحدة"/></SelectTrigger>
            <SelectContent><SelectItem value="all">كل الوحدات</SelectItem>{UNITS.map(u=><SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterTitle} onValueChange={setFilterTitle}>
            <SelectTrigger className="w-36"><SelectValue placeholder="الرتبة"/></SelectTrigger>
            <SelectContent><SelectItem value="all">كل الرتب</SelectItem>{Object.entries(TITLES).map(([k,v])=><SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32"><SelectValue placeholder="الحالة"/></SelectTrigger>
            <SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="active">نشط</SelectItem><SelectItem value="inactive">غير نشط</SelectItem></SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      {/* Employee Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-3 opacity-30"/><p>لا يوجد موظفون مطابقون</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(emp => (
            <Card key={emp.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={()=>setViewEmp(emp)}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 text-base font-bold">
                    <AvatarFallback className="bg-primary/10 text-primary">{emp.nameAr.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{emp.nameAr}</p>
                    <p className="text-xs text-muted-foreground truncate">{emp.nameEn}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <Badge className={cn('text-[10px] px-1.5 py-0', TITLES[emp.title].color)}>{emp.title}</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{emp.unit}</Badge>
                      {emp.status === 'inactive' && <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-700">غير نشط</Badge>}
                    </div>
                    {isExpiring(emp.blsExpiry) && (
                      <p className="text-[10px] text-amber-600 mt-1">⚠ BLS قارب الانتهاء</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 mt-3" onClick={e=>e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={()=>openEdit(emp)}><Edit className="h-3 w-3 ml-1"/>تعديل</Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={()=>setDeleteId(emp.id)}><Trash2 className="h-3 w-3"/></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'تعديل موظف' : 'إضافة موظف جديد'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {[
              { label:'الاسم بالعربية *', key:'nameAr', type:'text', col:2 },
              { label:'الاسم بالإنجليزية', key:'nameEn', type:'text', col:2 },
              { label:'كود الموظف *', key:'code', type:'text', col:1 },
              { label:'رقم الهاتف', key:'phone', type:'tel', col:1 },
              { label:'البريد الإلكتروني', key:'email', type:'email', col:2 },
              { label:'تاريخ التوظيف', key:'hireDate', type:'date', col:1 },
              { label:'تاريخ انتهاء BLS', key:'blsExpiry', type:'date', col:1 },
              { label:'انتهاء الترخيص', key:'licenseExpiry', type:'date', col:1 },
            ].map(f => (
              <div key={f.key} className={f.col === 2 ? 'col-span-2 space-y-1' : 'space-y-1'}>
                <Label className="text-xs">{f.label}</Label>
                <Input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}/>
              </div>
            ))}
            <div className="space-y-1">
              <Label className="text-xs">الرتبة</Label>
              <Select value={form.title} onValueChange={v=>setForm(p=>({...p,title:v as Title}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Object.entries(TITLES).map(([k,v])=><SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الوحدة</Label>
              <Select value={form.unit} onValueChange={v=>setForm(p=>({...p,unit:v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{UNITS.map(u=><SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">نوع العقد</Label>
              <Select value={form.contract} onValueChange={v=>setForm(p=>({...p,contract:v as Contract}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Object.entries(CONTRACTS).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الحالة</Label>
              <Select value={form.status} onValueChange={v=>setForm(p=>({...p,status:v as Status}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="active">نشط</SelectItem><SelectItem value="inactive">غير نشط</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">ملاحظات</Label>
              <Textarea rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="ملاحظات إضافية..."/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? 'حفظ التعديلات' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewEmp} onOpenChange={()=>setViewEmp(null)}>
        {viewEmp && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-primary text-xl">{viewEmp.nameAr.charAt(0)}</AvatarFallback></Avatar>
                <div>
                  <DialogTitle>{viewEmp.nameAr}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{viewEmp.nameEn}</p>
                </div>
              </div>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              {[
                ['الكود', viewEmp.code], ['الرتبة', TITLES[viewEmp.title].label],
                ['الوحدة', viewEmp.unit], ['العقد', CONTRACTS[viewEmp.contract]],
                ['الهاتف', viewEmp.phone], ['البريد', viewEmp.email],
                ['تاريخ التوظيف', viewEmp.hireDate], ['انتهاء BLS', viewEmp.blsExpiry],
                ['انتهاء الترخيص', viewEmp.licenseExpiry], ['الحالة', viewEmp.status === 'active' ? 'نشط' : 'غير نشط'],
              ].map(([k,v]) => (
                <div key={k}><p className="text-xs text-muted-foreground">{k}</p><p className="font-semibold">{v||'—'}</p></div>
              ))}
              {viewEmp.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground">ملاحظات</p><p>{viewEmp.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setViewEmp(null)}>إغلاق</Button>
              <Button onClick={()=>{ openEdit(viewEmp); setViewEmp(null) }}><Edit className="h-4 w-4 ml-1"/>تعديل</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={()=>setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDelete}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
