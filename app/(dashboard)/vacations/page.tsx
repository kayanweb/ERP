'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Download, Edit, Trash2, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

type VacationType = 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'hajj'
type VacationStatus = 'pending' | 'approved' | 'rejected'

interface VacationRequest {
  id: string
  empId: string
  empName: string
  title: string
  unit: string
  type: VacationType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: VacationStatus
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  createdAt: string
}

const VACATION_TYPES: Record<VacationType, { label: string; color: string }> = {
  annual:    { label: 'سنوية', color: 'bg-blue-100 text-blue-700' },
  sick:      { label: 'مرضية', color: 'bg-red-100 text-red-700' },
  emergency: { label: 'طارئة', color: 'bg-orange-100 text-orange-700' },
  unpaid:    { label: 'بدون راتب', color: 'bg-gray-100 text-gray-700' },
  maternity: { label: 'أمومة', color: 'bg-pink-100 text-pink-700' },
  hajj:      { label: 'حج', color: 'bg-green-100 text-green-700' },
}

const STATUS_CONFIG: Record<VacationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3 w-3"/> },
  approved: { label: 'موافق عليها', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3"/> },
  rejected: { label: 'مرفوضة', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3"/> },
}

const calcDays = (start: string, end: string) => {
  if (!start || !end) return 0
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1)
}

const SAMPLE: VacationRequest[] = [
  { id:'1', empId:'E001', empName:'سارة أحمد محمد', title:'CN', unit:'ICU', type:'annual', startDate:'2025-02-01', endDate:'2025-02-14', days:14, reason:'إجازة سنوية مستحقة', status:'approved', approvedBy:'مدير التمريض', approvedAt:'2025-01-20', createdAt:'2025-01-15' },
  { id:'2', empId:'E002', empName:'فاطمة خالد', title:'SN', unit:'ICU', type:'sick', startDate:'2025-01-20', endDate:'2025-01-25', days:6, reason:'مرض وإجراء عملية', status:'approved', approvedBy:'رئيس القسم', approvedAt:'2025-01-19', createdAt:'2025-01-18' },
  { id:'3', empId:'E003', empName:'نورة سعيد', title:'SN', unit:'ER', type:'emergency', startDate:'2025-02-05', endDate:'2025-02-07', days:3, reason:'وفاة أحد أفراد الأسرة', status:'approved', approvedBy:'مدير التمريض', approvedAt:'2025-02-05', createdAt:'2025-02-05' },
  { id:'4', empId:'E004', empName:'هدى محمد', title:'NA', unit:'ER', type:'annual', startDate:'2025-03-01', endDate:'2025-03-10', days:10, reason:'إجازة مخطط لها', status:'pending', createdAt:'2025-02-10' },
  { id:'5', empId:'E005', empName:'ليلى عبدالرحمن', title:'CN', unit:'الباطنية', type:'maternity', startDate:'2025-04-01', endDate:'2025-07-01', days:91, reason:'إجازة أمومة', status:'pending', createdAt:'2025-03-01' },
  { id:'6', empId:'E006', empName:'منى علي', title:'SN', unit:'الجراحة', type:'unpaid', startDate:'2025-02-15', endDate:'2025-02-28', days:14, reason:'سفر للخارج', status:'rejected', rejectedReason:'نقص الكادر في هذه الفترة', createdAt:'2025-02-01' },
]

const EMPTY_FORM = {
  empId: '', empName: '', title: 'SN', unit: 'ICU',
  type: 'annual' as VacationType,
  startDate: '', endDate: '', reason: '', status: 'pending' as VacationStatus,
}

export default function VacationsPage() {
  const [requests, setRequests] = useState<VacationRequest[]>(SAMPLE)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [rejectId, setRejectId] = useState<string|null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState<string|null>(null)

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

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true) }
  const openEdit = (r: VacationRequest) => {
    setEditing(r.id)
    setForm({ empId: r.empId, empName: r.empName, title: r.title, unit: r.unit, type: r.type, startDate: r.startDate, endDate: r.endDate, reason: r.reason, status: r.status })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.empName || !form.startDate || !form.endDate) { toast.error('يرجى ملء جميع الحقول المطلوبة'); return }
    const days = calcDays(form.startDate, form.endDate)
    if (editing) {
      setRequests(prev => prev.map(r => r.id === editing ? { ...r, ...form, days } : r))
      toast.success('تم تعديل الطلب')
    } else {
      setRequests(prev => [...prev, { ...form, id: Date.now().toString(), days, createdAt: new Date().toISOString().split('T')[0] }])
      toast.success('تم إضافة طلب الإجازة')
    }
    setDialogOpen(false)
  }

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', approvedBy: 'المدير', approvedAt: new Date().toISOString().split('T')[0] } : r))
    toast.success('تمت الموافقة على الإجازة')
  }

  const handleReject = () => {
    if (!rejectId) return
    setRequests(prev => prev.map(r => r.id === rejectId ? { ...r, status: 'rejected', rejectedReason: rejectReason } : r))
    toast.success('تم رفض الطلب')
    setRejectId(null)
    setRejectReason('')
  }

  const handleDelete = () => {
    if (!deleteId) return
    setRequests(prev => prev.filter(r => r.id !== deleteId))
    toast.success('تم حذف الطلب')
    setDeleteId(null)
  }

  const handleExport = () => {
    const header = 'الاسم,الرتبة,الوحدة,نوع الإجازة,من,إلى,الأيام,الحالة,السبب'
    const rows = filtered.map(r => `${r.empName},${r.title},${r.unit},${VACATION_TYPES[r.type].label},${r.startDate},${r.endDate},${r.days},${STATUS_CONFIG[r.status].label},${r.reason}`)
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vacations.csv'; a.click()
    toast.success('تم تصدير طلبات الإجازات')
  }

  const days = calcDays(form.startDate, form.endDate)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold">إدارة الإجازات</h1><p className="text-sm text-muted-foreground">طلبات وتتبع إجازات الكادر التمريضي</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1"/>تصدير</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1"/>طلب إجازة</Button>
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
          <Card key={s.label}><CardContent className="pt-4 pb-3 text-center"><p className={cn('text-3xl font-black', s.color)}>{s.val}</p><p className="text-xs text-muted-foreground mt-1">{s.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <Card><CardContent className="pt-4 pb-3">
        <div className="flex flex-wrap gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="الحالة"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40"><SelectValue placeholder="نوع الإجازة"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأنواع</SelectItem>
              {Object.entries(VACATION_TYPES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">طلبات الإجازة — {filtered.length} طلب</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['#','الاسم','الرتبة','الوحدة','نوع الإجازة','من','إلى','الأيام','السبب','الحالة','إجراءات'].map(h => (
                    <TableHead key={h} className="text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">لا توجد طلبات إجازة</TableCell></TableRow>
                )}
                {filtered.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground">{i+1}</TableCell>
                    <TableCell className="font-semibold">{r.empName}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{r.title}</Badge></TableCell>
                    <TableCell className="text-sm">{r.unit}</TableCell>
                    <TableCell><Badge className={cn('text-xs', VACATION_TYPES[r.type].color)}>{VACATION_TYPES[r.type].label}</Badge></TableCell>
                    <TableCell className="text-sm font-mono">{r.startDate}</TableCell>
                    <TableCell className="text-sm font-mono">{r.endDate}</TableCell>
                    <TableCell className="font-bold text-center">{r.days}</TableCell>
                    <TableCell className="text-sm max-w-[140px] truncate" title={r.reason}>{r.reason}</TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs flex items-center gap-1 w-fit', STATUS_CONFIG[r.status].color)}>
                        {STATUS_CONFIG[r.status].icon}{STATUS_CONFIG[r.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-700" onClick={() => handleApprove(r.id)}><CheckCircle2 className="h-3 w-3"/></Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-700" onClick={() => { setRejectId(r.id); setRejectReason('') }}><XCircle className="h-3 w-3"/></Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(r)}><Edit className="h-3 w-3"/></Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3 w-3"/></Button>
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
          <DialogHeader><DialogTitle>{editing ? 'تعديل طلب الإجازة' : 'طلب إجازة جديد'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1"><Label className="text-xs">اسم الموظف *</Label><Input value={form.empName} onChange={e => setForm(p => ({...p, empName: e.target.value}))}/></div>
            <div className="space-y-1"><Label className="text-xs">الرتبة</Label>
              <Select value={form.title} onValueChange={v => setForm(p => ({...p, title: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="CN">CN</SelectItem><SelectItem value="SN">SN</SelectItem><SelectItem value="NA">NA</SelectItem><SelectItem value="INT">INT</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">الوحدة</Label>
              <Select value={form.unit} onValueChange={v => setForm(p => ({...p, unit: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{'ICU,ER,الباطنية,الجراحة'.split(',').map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label className="text-xs">نوع الإجازة</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({...p, type: v as VacationType}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Object.entries(VACATION_TYPES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">تاريخ البدء *</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))}/></div>
            <div className="space-y-1"><Label className="text-xs">تاريخ الانتهاء *</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))}/></div>
            {form.startDate && form.endDate && (
              <div className="col-span-2 p-2 bg-muted/50 rounded text-sm text-center">
                <Calendar className="h-4 w-4 inline ml-1"/><strong>{days}</strong> يوم
              </div>
            )}
            <div className="col-span-2 space-y-1"><Label className="text-xs">سبب الإجازة</Label><Textarea rows={2} value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))} placeholder="أسباب طلب الإجازة..."/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? 'حفظ' : 'تقديم الطلب'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>رفض طلب الإجازة</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">سبب الرفض</Label>
            <Textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="اذكر سبب رفض الطلب..."/>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleReject}>رفض الطلب</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>سيتم حذف هذا الطلب نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDelete}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
