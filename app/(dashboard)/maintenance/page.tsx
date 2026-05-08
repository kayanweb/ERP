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
import { Plus, Edit, Trash2, Wrench, CheckCircle2, Clock, AlertTriangle, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'critical'
type TicketCategory = 'electrical' | 'plumbing' | 'equipment' | 'hvac' | 'it' | 'other'

interface MaintenanceTicket {
  id: string
  ticketNo: string
  title: string
  description: string
  location: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  reportedBy: string
  assignedTo?: string
  createdAt: string
  resolvedAt?: string
  notes?: string
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  open:        { label: 'مفتوح', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="h-3 w-3"/> },
  in_progress: { label: 'قيد التنفيذ', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3 w-3"/> },
  resolved:    { label: 'تم الحل', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3"/> },
  closed:      { label: 'مغلق', color: 'bg-gray-100 text-gray-600', icon: <CheckCircle2 className="h-3 w-3"/> },
}

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  low:      { label: 'منخفضة', color: 'bg-gray-100 text-gray-600' },
  medium:   { label: 'متوسطة', color: 'bg-blue-100 text-blue-700' },
  high:     { label: 'عالية', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'حرجة', color: 'bg-red-100 text-red-700 font-bold' },
}

const CATEGORIES: Record<TicketCategory, string> = {
  electrical: 'كهربائي', plumbing: 'سباكة', equipment: 'معدات طبية',
  hvac: 'تكييف وتهوية', it: 'تقنية المعلومات', other: 'أخرى',
}

const LOCATIONS = ['ICU', 'ER', 'الباطنية', 'الجراحة', 'الأطفال', 'الصيدلية', 'المخبر', 'الإدارة', 'الممرات', 'المستودع']

const SAMPLE: MaintenanceTicket[] = [
  { id:'1', ticketNo:'MT-0001', title:'تعطل مكيف غرفة 3 ICU', description:'المكيف لا يعمل منذ الأمس، وارتفعت الحرارة داخل الغرفة', location:'ICU', category:'hvac', priority:'critical', status:'in_progress', reportedBy:'سارة أحمد', assignedTo:'فريق الصيانة A', createdAt:'2025-02-08', notes:'تم الكشف، بانتظار قطعة الغيار' },
  { id:'2', ticketNo:'MT-0002', title:'تسرب مياه في دورة مياه ER', description:'تسرب بسيط من الحنفية الرئيسية', location:'ER', category:'plumbing', priority:'medium', status:'open', reportedBy:'فاطمة خالد', createdAt:'2025-02-09' },
  { id:'3', ticketNo:'MT-0003', title:'خلل في جهاز مراقبة المريض', description:'الشاشة لا تعرض قراءات SpO2 بشكل صحيح', location:'ICU', category:'equipment', priority:'high', status:'resolved', reportedBy:'نورة سعيد', assignedTo:'مهندس الأجهزة الطبية', createdAt:'2025-02-05', resolvedAt:'2025-02-07' },
  { id:'4', ticketNo:'MT-0004', title:'عطل في الإضاءة الطارئة', description:'مصابيح الإضاءة الطارئة في الممر الرئيسي متوقفة', location:'الممرات', category:'electrical', priority:'high', status:'open', reportedBy:'هدى محمد', createdAt:'2025-02-07' },
  { id:'5', ticketNo:'MT-0005', title:'مشكلة في شبكة الواي فاي', description:'ضعف الإشارة في قسم الباطنية مما يؤثر على النظام الإلكتروني', location:'الباطنية', category:'it', priority:'medium', status:'closed', reportedBy:'ليلى عبدالرحمن', assignedTo:'قسم تقنية المعلومات', createdAt:'2025-02-01', resolvedAt:'2025-02-03' },
]

const EMPTY_FORM = {
  title: '', description: '', location: 'ICU', category: 'other' as TicketCategory,
  priority: 'medium' as TicketPriority, reportedBy: '', assignedTo: '', notes: '',
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(SAMPLE)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState<string|null>(null)

  const filtered = useMemo(() => tickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    return true
  }), [tickets, filterStatus, filterPriority])

  const stats = useMemo(() => ({
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    critical: tickets.filter(t => t.priority === 'critical' && t.status !== 'closed').length,
  }), [tickets])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true) }
  const openEdit = (t: MaintenanceTicket) => {
    setEditing(t.id)
    setForm({ title: t.title, description: t.description, location: t.location, category: t.category, priority: t.priority, reportedBy: t.reportedBy, assignedTo: t.assignedTo || '', notes: t.notes || '' })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title) { toast.error('العنوان مطلوب'); return }
    if (editing) {
      setTickets(prev => prev.map(t => t.id === editing ? { ...t, ...form } : t))
      toast.success('تم تعديل التذكرة')
    } else {
      const newNo = `MT-${String(tickets.length + 1).padStart(4, '0')}`
      setTickets(prev => [...prev, { ...form, id: Date.now().toString(), ticketNo: newNo, status: 'open', createdAt: new Date().toISOString().split('T')[0] }])
      toast.success('تم إنشاء تذكرة الصيانة')
    }
    setDialogOpen(false)
  }

  const updateStatus = (id: string, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status, ...(status === 'resolved' ? { resolvedAt: new Date().toISOString().split('T')[0] } : {}) } : t))
    toast.success('تم تحديث حالة التذكرة')
  }

  const handleDelete = () => {
    if (!deleteId) return
    setTickets(prev => prev.filter(t => t.id !== deleteId))
    toast.success('تم حذف التذكرة')
    setDeleteId(null)
  }

  const handleExport = () => {
    const header = 'رقم التذكرة,العنوان,الموقع,الفئة,الأولوية,الحالة,المُبلِّغ,المكلف,تاريخ الإنشاء'
    const rows = filtered.map(t => `${t.ticketNo},${t.title},${t.location},${CATEGORIES[t.category]},${PRIORITY_CONFIG[t.priority].label},${STATUS_CONFIG[t.status].label},${t.reportedBy},${t.assignedTo||'—'},${t.createdAt}`)
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'maintenance.csv'; a.click()
    toast.success('تم تصدير تذاكر الصيانة')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold">طلبات الصيانة</h1><p className="text-sm text-muted-foreground">تتبع وإدارة أعطال ومشاكل الصيانة</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1"/>تصدير</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1"/>تذكرة جديدة</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'مفتوحة', val: stats.open, color: 'text-red-600' },
          { label: 'قيد التنفيذ', val: stats.inProgress, color: 'text-amber-600' },
          { label: 'تم الحل', val: stats.resolved, color: 'text-green-600' },
          { label: 'حرجة مفتوحة', val: stats.critical, color: 'text-red-700' },
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
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-36"><SelectValue placeholder="الأولوية"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأولويات</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">تذاكر الصيانة — {filtered.length} تذكرة</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['رقم التذكرة','العنوان','الموقع','الفئة','الأولوية','الحالة','المُبلِّغ','المكلف','التاريخ','إجراءات'].map(h => (
                    <TableHead key={h} className="text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">لا توجد تذاكر صيانة</TableCell></TableRow>
                )}
                {filtered.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.ticketNo}</TableCell>
                    <TableCell className="font-semibold max-w-[160px]">
                      <div className="truncate">{t.title}</div>
                      {t.notes && <div className="text-xs text-muted-foreground truncate">{t.notes}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{t.location}</TableCell>
                    <TableCell className="text-xs">{CATEGORIES[t.category]}</TableCell>
                    <TableCell><Badge className={cn('text-xs', PRIORITY_CONFIG[t.priority].color)}>{PRIORITY_CONFIG[t.priority].label}</Badge></TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs flex items-center gap-1 w-fit', STATUS_CONFIG[t.status].color)}>
                        {STATUS_CONFIG[t.status].icon}{STATUS_CONFIG[t.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{t.reportedBy}</TableCell>
                    <TableCell className="text-sm">{t.assignedTo || '—'}</TableCell>
                    <TableCell className="text-xs font-mono">{t.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {t.status === 'open' && <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-amber-700" onClick={() => updateStatus(t.id, 'in_progress')}><Wrench className="h-3 w-3"/></Button>}
                        {t.status === 'in_progress' && <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-700" onClick={() => updateStatus(t.id, 'resolved')}><CheckCircle2 className="h-3 w-3"/></Button>}
                        {t.status === 'resolved' && <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-gray-600" onClick={() => updateStatus(t.id, 'closed')}>إغلاق</Button>}
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(t)}><Edit className="h-3 w-3"/></Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-destructive" onClick={() => setDeleteId(t.id)}><Trash2 className="h-3 w-3"/></Button>
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
          <DialogHeader><DialogTitle>{editing ? 'تعديل التذكرة' : 'تذكرة صيانة جديدة'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1"><Label className="text-xs">عنوان المشكلة *</Label><Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}/></div>
            <div className="space-y-1"><Label className="text-xs">الموقع</Label>
              <Select value={form.location} onValueChange={v => setForm(p => ({...p, location: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">الفئة</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({...p, category: v as TicketCategory}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Object.entries(CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">الأولوية</Label>
              <Select value={form.priority} onValueChange={v => setForm(p => ({...p, priority: v as TicketPriority}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Object.entries(PRIORITY_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">المُبلِّغ</Label><Input value={form.reportedBy} onChange={e => setForm(p => ({...p, reportedBy: e.target.value}))}/></div>
            <div className="col-span-2 space-y-1"><Label className="text-xs">المكلف بالإصلاح</Label><Input value={form.assignedTo} onChange={e => setForm(p => ({...p, assignedTo: e.target.value}))} placeholder="اسم الفني أو الفريق"/></div>
            <div className="col-span-2 space-y-1"><Label className="text-xs">وصف المشكلة</Label><Textarea rows={3} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="وصف تفصيلي للمشكلة..."/></div>
            <div className="col-span-2 space-y-1"><Label className="text-xs">ملاحظات</Label><Textarea rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="ملاحظات إضافية..."/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? 'حفظ' : 'إنشاء التذكرة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>سيتم حذف هذه التذكرة نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDelete}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
