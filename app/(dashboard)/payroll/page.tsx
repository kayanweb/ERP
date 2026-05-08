'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Plus, Download, Edit, Trash2, CheckCircle2, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PayrollRecord {
  id: string
  empId: string
  name: string
  title: string
  unit: string
  month: number
  year: number
  base: number
  otHours: number
  allowances: number
  bonus: number
  deductions: number
  status: 'pending' | 'paid'
  paidAt?: string
}

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

const calcOT = (base: number, hours: number) => Math.round((base / (26*8)) * hours * 1.5)
const calcNet = (r: PayrollRecord) => r.base + calcOT(r.base, r.otHours) + r.allowances + r.bonus - r.deductions

const SAMPLE: PayrollRecord[] = [
  { id:'1', empId:'E001', name:'سارة أحمد محمد', title:'CN', unit:'ICU', month:0, year:2025, base:8000, otHours:12, allowances:1500, bonus:500, deductions:200, status:'paid', paidAt:'2025-01-31' },
  { id:'2', empId:'E002', name:'فاطمة خالد', title:'SN', unit:'ICU', month:0, year:2025, base:6000, otHours:8, allowances:1000, bonus:0, deductions:150, status:'paid', paidAt:'2025-01-31' },
  { id:'3', empId:'E003', name:'نورة سعيد', title:'SN', unit:'ER', month:0, year:2025, base:6000, otHours:16, allowances:1200, bonus:300, deductions:100, status:'pending' },
  { id:'4', empId:'E004', name:'هدى محمد', title:'NA', unit:'ER', month:0, year:2025, base:4500, otHours:0, allowances:800, bonus:0, deductions:50, status:'pending' },
  { id:'5', empId:'E005', name:'ليلى عبدالرحمن', title:'CN', unit:'الباطنية', month:0, year:2025, base:8000, otHours:20, allowances:1500, bonus:1000, deductions:300, status:'pending' },
]

const EMPTY_FORM = { empId:'', name:'', title:'SN', unit:'ICU', month: new Date().getMonth(), year: new Date().getFullYear(), base:0, otHours:0, allowances:0, bonus:0, deductions:0, status:'pending' as const }

export default function PayrollPage() {
  const now = new Date()
  const [records, setRecords] = useState<PayrollRecord[]>(SAMPLE)
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth()))
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [form, setForm] = useState<Omit<PayrollRecord,'id'>>(EMPTY_FORM)
  const [editing, setEditing] = useState<string|null>(null)

  const filtered = useMemo(() => records.filter(r =>
    r.month === Number(filterMonth) && r.year === Number(filterYear)
  ), [records, filterMonth, filterYear])

  const totals = useMemo(() => ({
    net: filtered.reduce((s,r) => s + calcNet(r), 0),
    paid: filtered.filter(r=>r.status==='paid').reduce((s,r)=>s+calcNet(r),0),
    pending: filtered.filter(r=>r.status==='pending').reduce((s,r)=>s+calcNet(r),0),
    deductions: filtered.reduce((s,r)=>s+r.deductions,0),
  }), [filtered])

  const fmt = (n: number) => n.toLocaleString('ar-EG') + ' ر.س'

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY_FORM, month:Number(filterMonth), year:Number(filterYear) }); setDialogOpen(true) }
  const openEdit = (r: PayrollRecord) => { setEditing(r.id); setForm({empId:r.empId,name:r.name,title:r.title,unit:r.unit,month:r.month,year:r.year,base:r.base,otHours:r.otHours,allowances:r.allowances,bonus:r.bonus,deductions:r.deductions,status:r.status,paidAt:r.paidAt}); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.name) { toast.error('الاسم مطلوب'); return }
    if (editing) {
      setRecords(prev => prev.map(r => r.id === editing ? { ...form, id: editing } : r))
      toast.success('تم تعديل السجل')
    } else {
      setRecords(prev => [...prev, { ...form, id: Date.now().toString() }])
      toast.success('تم إضافة سجل الراتب')
    }
    setDialogOpen(false)
  }

  const handleMarkPaid = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status:'paid', paidAt:new Date().toISOString().split('T')[0] } : r))
    toast.success('تم تأكيد الصرف')
  }

  const handleDelete = () => {
    if (!deleteId) return
    setRecords(prev => prev.filter(r => r.id !== deleteId))
    toast.success('تم حذف السجل')
    setDeleteId(null)
  }

  const handleExport = () => {
    const header = 'الاسم,الرتبة,الوحدة,الراتب الأساسي,ساعات إضافي,بدل إضافي,علاوات,مكافآت,خصومات,الصافي,الحالة'
    const rows = filtered.map(r => `${r.name},${r.title},${r.unit},${r.base},${r.otHours},${calcOT(r.base,r.otHours)},${r.allowances},${r.bonus},${r.deductions},${calcNet(r)},${r.status==='paid'?'مصروف':'معلق'}`)
    const blob = new Blob(['\uFEFF'+[header,...rows].join('\n')],{type:'text/csv'})
    const a = document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`payroll-${filterMonth}-${filterYear}.csv`;a.click()
    toast.success('تم تصدير كشف الرواتب')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold">كشف الرواتب</h1><p className="text-sm text-muted-foreground">إدارة وصرف رواتب الموظفين</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1"/>تصدير</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1"/>إضافة</Button>
        </div>
      </div>

      {/* Month Filter */}
      <Card><CardContent className="pt-4 pb-3">
        <div className="flex gap-3 flex-wrap items-end">
          <div className="space-y-1"><Label className="text-xs">الشهر</Label>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-32"><SelectValue/></SelectTrigger>
              <SelectContent>{MONTHS.map((m,i)=><SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-xs">السنة</Label>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-24"><SelectValue/></SelectTrigger>
              <SelectContent>{[2024,2025,2026].map(y=><SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="mb-1">{MONTHS[Number(filterMonth)]} {filterYear}</Badge>
        </div>
      </CardContent></Card>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'الإجمالي الكلي', val:fmt(totals.net), color:'text-foreground' },
          { label:'المصروف', val:fmt(totals.paid), color:'text-green-600' },
          { label:'المعلق', val:fmt(totals.pending), color:'text-amber-600' },
          { label:'إجمالي الخصومات', val:fmt(totals.deductions), color:'text-red-600' },
        ].map(s=>(
          <Card key={s.label}><CardContent className="pt-4 pb-3 text-center"><p className={cn('text-xl font-black', s.color)}>{s.val}</p><p className="text-xs text-muted-foreground mt-1">{s.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">سجلات الرواتب — {filtered.length} موظف</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['#','الاسم','الرتبة','الوحدة','الأساسي','إ.إضافي','بدل OT','علاوات','مكافآت','خصومات','الصافي','الحالة','إجراءات'].map(h=>(
                    <TableHead key={h} className="text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={13} className="text-center py-12 text-muted-foreground">لا توجد سجلات لهذا الشهر</TableCell></TableRow>
                )}
                {filtered.map((r,i) => {
                  const ot = calcOT(r.base, r.otHours)
                  const net = calcNet(r)
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-muted-foreground">{i+1}</TableCell>
                      <TableCell className="font-semibold">{r.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{r.title}</Badge></TableCell>
                      <TableCell className="text-sm">{r.unit}</TableCell>
                      <TableCell className="font-mono">{r.base.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-blue-600">{r.otHours}s</TableCell>
                      <TableCell className="font-mono text-blue-600">{ot.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-green-600">+{r.allowances.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-green-600">+{r.bonus.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-red-600">-{r.deductions.toLocaleString()}</TableCell>
                      <TableCell className="font-black text-base">{net.toLocaleString()}</TableCell>
                      <TableCell>
                        {r.status === 'paid'
                          ? <Badge className="bg-green-100 text-green-700 text-xs">✓ مصروف</Badge>
                          : <Badge className="bg-amber-100 text-amber-700 text-xs">⏳ معلق</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {r.status === 'pending' && <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-700" onClick={()=>handleMarkPaid(r.id)}><CheckCircle2 className="h-3 w-3"/></Button>}
                          <Button size="sm" variant="outline" className="h-7 px-2" onClick={()=>openEdit(r)}><Edit className="h-3 w-3"/></Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-destructive" onClick={()=>setDeleteId(r.id)}><Trash2 className="h-3 w-3"/></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'تعديل سجل الراتب' : 'إضافة سجل راتب'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1"><Label className="text-xs">اسم الموظف *</Label><Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            <div className="space-y-1"><Label className="text-xs">الرتبة</Label>
              <Select value={form.title} onValueChange={v=>setForm(p=>({...p,title:v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="CN">CN</SelectItem><SelectItem value="SN">SN</SelectItem><SelectItem value="NA">NA</SelectItem><SelectItem value="INT">INT</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">الوحدة</Label>
              <Select value={form.unit} onValueChange={v=>setForm(p=>({...p,unit:v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{'ICU,ER,الباطنية,الجراحة'.split(',').map(u=><SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {[
              { label:'الراتب الأساسي', key:'base' },
              { label:'ساعات العمل الإضافي', key:'otHours' },
              { label:'العلاوات', key:'allowances' },
              { label:'المكافآت', key:'bonus' },
              { label:'الخصومات', key:'deductions' },
            ].map(f=>(
              <div key={f.key} className="space-y-1">
                <Label className="text-xs">{f.label}</Label>
                <Input type="number" value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:Number(e.target.value)}))}/>
              </div>
            ))}
            <div className="col-span-2 p-3 bg-muted/50 rounded-lg text-sm font-bold text-center">
              الصافي المتوقع: {calcNet({ ...form, id:'' } as any).toLocaleString()} ر.س
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? 'حفظ' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={()=>setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>سيتم حذف هذا السجل نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDelete}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
