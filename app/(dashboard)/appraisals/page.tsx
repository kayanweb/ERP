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
import { Plus, Edit, Trash2, Download, Star, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

type AppraisalStatus = 'draft' | 'submitted' | 'approved'
type AppraisalPeriod = 'H1' | 'H2' | 'annual'

interface Criterion {
  key: string
  label: string
  score: number
  maxScore: number
}

interface Appraisal {
  id: string
  empId: string
  empName: string
  title: string
  unit: string
  period: AppraisalPeriod
  year: number
  criteria: Criterion[]
  totalScore: number
  maxTotal: number
  grade: string
  comments: string
  evaluatorName: string
  status: AppraisalStatus
  createdAt: string
}

const DEFAULT_CRITERIA: Omit<Criterion, 'score'>[] = [
  { key: 'technical',     label: 'المهارات التقنية',       maxScore: 25 },
  { key: 'communication', label: 'مهارات التواصل',         maxScore: 20 },
  { key: 'teamwork',      label: 'العمل الجماعي',           maxScore: 20 },
  { key: 'punctuality',   label: 'الانضباط والمواظبة',     maxScore: 15 },
  { key: 'initiative',    label: 'المبادرة والإبداع',       maxScore: 10 },
  { key: 'patient_care',  label: 'جودة رعاية المريض',      maxScore: 10 },
]

const calcGrade = (score: number, max: number): string => {
  const pct = (score / max) * 100
  if (pct >= 90) return 'ممتاز'
  if (pct >= 80) return 'جيد جداً'
  if (pct >= 70) return 'جيد'
  if (pct >= 60) return 'مقبول'
  return 'ضعيف'
}

const GRADE_COLOR: Record<string, string> = {
  'ممتاز':    'bg-green-100 text-green-700',
  'جيد جداً': 'bg-blue-100 text-blue-700',
  'جيد':      'bg-cyan-100 text-cyan-700',
  'مقبول':    'bg-amber-100 text-amber-700',
  'ضعيف':     'bg-red-100 text-red-700',
}

const STATUS_CONFIG: Record<AppraisalStatus, { label: string; color: string }> = {
  draft:     { label: 'مسودة', color: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'مُقدَّم', color: 'bg-amber-100 text-amber-700' },
  approved:  { label: 'معتمد', color: 'bg-green-100 text-green-700' },
}

const PERIODS: Record<AppraisalPeriod, string> = {
  H1: 'النصف الأول', H2: 'النصف الثاني', annual: 'سنوي'
}

function makeSample(): Appraisal[] {
  const emp = [
    { id:'E001', name:'سارة أحمد محمد', title:'CN', unit:'ICU' },
    { id:'E002', name:'فاطمة خالد', title:'SN', unit:'ICU' },
    { id:'E003', name:'نورة سعيد', title:'SN', unit:'ER' },
  ]
  const scores = [[23,18,17,14,9,9],[20,16,15,13,7,8],[22,17,16,13,8,9]]
  return emp.map((e, i) => {
    const criteria = DEFAULT_CRITERIA.map((c, j) => ({ ...c, score: scores[i][j] }))
    const totalScore = criteria.reduce((s, c) => s + c.score, 0)
    const maxTotal = criteria.reduce((s, c) => s + c.maxScore, 0)
    return {
      id: String(i+1), empId: e.id, empName: e.name, title: e.title, unit: e.unit,
      period: 'H1', year: 2025, criteria, totalScore, maxTotal,
      grade: calcGrade(totalScore, maxTotal),
      comments: 'أداء متميز وملتزم بمعايير الجودة.',
      evaluatorName: 'رئيسة قسم ICU',
      status: i === 0 ? 'approved' : i === 1 ? 'submitted' : 'draft',
      createdAt: '2025-07-01',
    }
  })
}

const SAMPLE = makeSample()

const EMPTY_CRITERIA = DEFAULT_CRITERIA.map(c => ({ ...c, score: 0 }))

export default function AppraisalsPage() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>(SAMPLE)
  const [filterYear, setFilterYear] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [viewItem, setViewItem] = useState<Appraisal|null>(null)
  const [editing, setEditing] = useState<string|null>(null)

  const [empName, setEmpName] = useState('')
  const [empTitle, setEmpTitle] = useState('SN')
  const [empUnit, setEmpUnit] = useState('ICU')
  const [period, setPeriod] = useState<AppraisalPeriod>('H1')
  const [year, setYear] = useState(2025)
  const [criteria, setCriteria] = useState<Criterion[]>(EMPTY_CRITERIA)
  const [evaluatorName, setEvaluatorName] = useState('')
  const [comments, setComments] = useState('')
  const [status, setStatus] = useState<AppraisalStatus>('draft')

  const filtered = useMemo(() => appraisals.filter(a => {
    if (filterYear !== 'all' && a.year !== Number(filterYear)) return false
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    return true
  }), [appraisals, filterYear, filterStatus])

  const stats = useMemo(() => ({
    total: appraisals.length,
    approved: appraisals.filter(a => a.status === 'approved').length,
    avgScore: appraisals.length ? Math.round(appraisals.reduce((s, a) => s + (a.totalScore / a.maxTotal) * 100, 0) / appraisals.length) : 0,
    excellent: appraisals.filter(a => a.grade === 'ممتاز').length,
  }), [appraisals])

  const openAdd = () => {
    setEditing(null); setEmpName(''); setEmpTitle('SN'); setEmpUnit('ICU'); setPeriod('H1'); setYear(2025)
    setCriteria(EMPTY_CRITERIA); setEvaluatorName(''); setComments(''); setStatus('draft'); setDialogOpen(true)
  }

  const openEdit = (a: Appraisal) => {
    setEditing(a.id); setEmpName(a.empName); setEmpTitle(a.title); setEmpUnit(a.unit); setPeriod(a.period); setYear(a.year)
    setCriteria([...a.criteria.map(c => ({...c}))]); setEvaluatorName(a.evaluatorName); setComments(a.comments); setStatus(a.status); setDialogOpen(true)
  }

  const totalScore = criteria.reduce((s, c) => s + c.score, 0)
  const maxTotal = criteria.reduce((s, c) => s + c.maxScore, 0)
  const currentGrade = calcGrade(totalScore, maxTotal)

  const handleSave = () => {
    if (!empName) { toast.error('اسم الموظف مطلوب'); return }
    const rec: Appraisal = {
      id: editing || Date.now().toString(), empId: '', empName, title: empTitle, unit: empUnit,
      period, year, criteria: criteria.map(c => ({...c})), totalScore, maxTotal,
      grade: currentGrade, comments, evaluatorName, status, createdAt: new Date().toISOString().split('T')[0],
    }
    if (editing) {
      setAppraisals(prev => prev.map(a => a.id === editing ? rec : a))
      toast.success('تم تعديل التقييم')
    } else {
      setAppraisals(prev => [...prev, rec])
      toast.success('تم حفظ التقييم')
    }
    setDialogOpen(false)
  }

  const handleDelete = () => {
    if (!deleteId) return
    setAppraisals(prev => prev.filter(a => a.id !== deleteId))
    toast.success('تم حذف التقييم')
    setDeleteId(null)
  }

  const handleExport = () => {
    const header = 'الاسم,الرتبة,الوحدة,الفترة,السنة,الدرجة,التقدير,الحالة,المقيِّم'
    const rows = filtered.map(a => `${a.empName},${a.title},${a.unit},${PERIODS[a.period]},${a.year},${a.totalScore}/${a.maxTotal},${a.grade},${STATUS_CONFIG[a.status].label},${a.evaluatorName}`)
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'appraisals.csv'; a.click()
    toast.success('تم تصدير التقييمات')
  }

  const ScoreBar = ({ score, max }: { score: number; max: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${(score/max)*100}%` }}/>
      </div>
      <span className="text-xs font-mono w-10 text-right">{score}/{max}</span>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold">تقييم الأداء</h1><p className="text-sm text-muted-foreground">تقييمات الكادر التمريضي الدورية</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1"/>تصدير</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1"/>تقييم جديد</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي التقييمات', val: stats.total, color: 'text-foreground', suffix: '' },
          { label: 'معتمدة', val: stats.approved, color: 'text-green-600', suffix: '' },
          { label: 'متوسط الأداء', val: stats.avgScore, color: 'text-blue-600', suffix: '%' },
          { label: 'تقدير ممتاز', val: stats.excellent, color: 'text-amber-600', suffix: '' },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-4 pb-3 text-center"><p className={cn('text-3xl font-black', s.color)}>{s.val}{s.suffix}</p><p className="text-xs text-muted-foreground mt-1">{s.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <Card><CardContent className="pt-4 pb-3">
        <div className="flex flex-wrap gap-3">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-28"><SelectValue placeholder="السنة"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل السنوات</SelectItem>
              {[2024,2025,2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="الحالة"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">سجلات التقييم — {filtered.length} تقييم</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['#','الاسم','الرتبة','الوحدة','الفترة','السنة','الدرجة','التقدير','الحالة','المقيِّم','إجراءات'].map(h => (
                    <TableHead key={h} className="text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">لا توجد تقييمات</TableCell></TableRow>
                )}
                {filtered.map((a, i) => (
                  <TableRow key={a.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setViewItem(a)}>
                    <TableCell className="text-muted-foreground">{i+1}</TableCell>
                    <TableCell className="font-semibold">{a.empName}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{a.title}</Badge></TableCell>
                    <TableCell className="text-sm">{a.unit}</TableCell>
                    <TableCell className="text-sm">{PERIODS[a.period]}</TableCell>
                    <TableCell className="font-mono">{a.year}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{a.totalScore}</span>
                        <span className="text-muted-foreground text-xs">/{a.maxTotal}</span>
                        <span className="text-xs text-muted-foreground">({Math.round((a.totalScore/a.maxTotal)*100)}%)</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className={cn('text-xs', GRADE_COLOR[a.grade])}><Star className="h-3 w-3 ml-1 inline"/>{a.grade}</Badge></TableCell>
                    <TableCell><Badge className={cn('text-xs', STATUS_CONFIG[a.status].color)}>{STATUS_CONFIG[a.status].label}</Badge></TableCell>
                    <TableCell className="text-sm">{a.evaluatorName}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(a)}><Edit className="h-3 w-3"/></Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-destructive" onClick={() => setDeleteId(a.id)}><Trash2 className="h-3 w-3"/></Button>
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
          <DialogHeader><DialogTitle>{editing ? 'تعديل تقييم الأداء' : 'تقييم أداء جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label className="text-xs">اسم الموظف *</Label><Input value={empName} onChange={e => setEmpName(e.target.value)}/></div>
              <div className="space-y-1"><Label className="text-xs">الرتبة</Label>
                <Select value={empTitle} onValueChange={setEmpTitle}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="CN">CN</SelectItem><SelectItem value="SN">SN</SelectItem><SelectItem value="NA">NA</SelectItem><SelectItem value="INT">INT</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">الوحدة</Label>
                <Select value={empUnit} onValueChange={setEmpUnit}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{'ICU,ER,الباطنية,الجراحة'.split(',').map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">الفترة</Label>
                <Select value={period} onValueChange={v => setPeriod(v as AppraisalPeriod)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{Object.entries(PERIODS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">السنة</Label>
                <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{[2024,2025,2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Criteria */}
            <div className="space-y-3 border rounded-lg p-3 bg-muted/20">
              <p className="text-xs font-bold text-muted-foreground uppercase">معايير التقييم</p>
              {criteria.map((c, idx) => (
                <div key={c.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{c.label}</Label>
                    <span className="text-xs font-mono">{c.score}/{c.maxScore}</span>
                  </div>
                  <input
                    type="range" min={0} max={c.maxScore} value={c.score}
                    onChange={e => setCriteria(prev => prev.map((x, i) => i === idx ? {...x, score: Number(e.target.value)} : x))}
                    className="w-full accent-primary"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-bold">المجموع: {totalScore}/{maxTotal}</span>
                <Badge className={cn('text-sm', GRADE_COLOR[currentGrade])}><Award className="h-3 w-3 ml-1 inline"/>{currentGrade}</Badge>
              </div>
            </div>

            <div className="space-y-1"><Label className="text-xs">المقيِّم</Label><Input value={evaluatorName} onChange={e => setEvaluatorName(e.target.value)}/></div>
            <div className="space-y-1"><Label className="text-xs">ملاحظات وتوصيات</Label><Textarea rows={3} value={comments} onChange={e => setComments(e.target.value)} placeholder="ملاحظات المقيِّم وتوصياته..."/></div>
            <div className="space-y-1"><Label className="text-xs">الحالة</Label>
              <Select value={status} onValueChange={v => setStatus(v as AppraisalStatus)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? 'حفظ' : 'إضافة التقييم'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        {viewItem && (
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">{viewItem.title}</Badge>
                <Badge variant="outline" className="text-xs">{viewItem.unit}</Badge>
                <Badge className={cn('text-xs', STATUS_CONFIG[viewItem.status].color)}>{STATUS_CONFIG[viewItem.status].label}</Badge>
              </div>
              <DialogTitle>{viewItem.empName}</DialogTitle>
              <p className="text-sm text-muted-foreground">{PERIODS[viewItem.period]} {viewItem.year}</p>
            </DialogHeader>
            <div className="space-y-3">
              {viewItem.criteria.map(c => (
                <div key={c.key}>
                  <div className="flex justify-between text-xs mb-1"><span>{c.label}</span><span className="font-mono">{c.score}/{c.maxScore}</span></div>
                  <div className="bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${(c.score/c.maxScore)*100}%` }}/>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div><p className="text-xs text-muted-foreground">الدرجة الكلية</p><p className="text-2xl font-black">{viewItem.totalScore}<span className="text-sm text-muted-foreground">/{viewItem.maxTotal}</span></p></div>
                <Badge className={cn('text-lg px-3 py-1', GRADE_COLOR[viewItem.grade])}>{viewItem.grade}</Badge>
              </div>
              {viewItem.comments && <div><p className="text-xs text-muted-foreground mb-1">ملاحظات المقيِّم</p><p className="text-sm bg-muted/30 p-2 rounded">{viewItem.comments}</p></div>}
              <p className="text-xs text-muted-foreground">قيّمه: {viewItem.evaluatorName} · {viewItem.createdAt}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewItem(null)}>إغلاق</Button>
              <Button onClick={() => { openEdit(viewItem); setViewItem(null) }}><Edit className="h-4 w-4 ml-1"/>تعديل</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>سيتم حذف هذا التقييم نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDelete}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
