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
import { Plus, Edit, Trash2, Download, Star, Award, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { evaluationsService } from '@/lib/services/evaluations.service'
import { employeesService } from '@/lib/services/employees.service'
import { departmentsService } from '@/lib/services/departments.service'
import type { EvaluationRecord, EmployeeRecord } from '@/lib/repositories/contracts'

type AppraisalStatus = 'draft' | 'submitted' | 'acknowledged'
type AppraisalPeriod = 'H1' | 'H2' | 'annual'

interface Criterion {
  category: string
  score: number
  weight: number
  comments?: string
}

const DEFAULT_CRITERIA: Omit<Criterion, 'score' | 'comments'>[] = [
  { category: 'المهارات التقنية', weight: 25 },
  { category: 'مهارات التواصل', weight: 20 },
  { category: 'العمل الجماعي', weight: 20 },
  { category: 'الانضباط والمواظبة', weight: 15 },
  { category: 'المبادرة والإبداع', weight: 10 },
  { category: 'جودة رعاية المريض', weight: 10 },
]

const calcGrade = (score: number): string => {
  if (score >= 4.5) return 'ممتاز'
  if (score >= 3.5) return 'جيد جداً'
  if (score >= 2.5) return 'جيد'
  if (score >= 1.5) return 'مقبول'
  return 'ضعيف'
}

const GRADE_COLOR: Record<string, string> = {
  'ممتاز': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'جيد جداً': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'جيد': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'مقبول': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'ضعيف': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const STATUS_CONFIG: Record<AppraisalStatus, { label: string; color: string }> = {
  draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-300' },
  submitted: { label: 'مُقدَّم', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  acknowledged: { label: 'معتمد', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
}

const PERIODS: Record<AppraisalPeriod, string> = {
  H1: 'النصف الأول', H2: 'النصف الثاني', annual: 'سنوي'
}

interface FormData {
  employeeId: string
  employeeName: string
  departmentId: string
  period: string
  criteria: Criterion[]
  evaluatorName: string
  strengths: string
  areasForImprovement: string
  goals: string
  status: AppraisalStatus
}

const EMPTY_CRITERIA = DEFAULT_CRITERIA.map(c => ({ ...c, score: 3, comments: '' }))

const EMPTY_FORM: FormData = {
  employeeId: '',
  employeeName: '',
  departmentId: '',
  period: new Date().getFullYear() + '-H1',
  criteria: EMPTY_CRITERIA,
  evaluatorName: '',
  strengths: '',
  areasForImprovement: '',
  goals: '',
  status: 'draft',
}

export default function AppraisalsPage() {
  const [appraisals, setAppraisals] = useState<EvaluationRecord[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterYear, setFilterYear] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<EvaluationRecord | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [evals, emps, depts] = await Promise.all([
        evaluationsService.getAll(),
        employeesService.getAll(),
        departmentsService.getAll()
      ])
      setAppraisals(evals)
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

  const filtered = useMemo(() => appraisals.filter(a => {
    if (filterYear !== 'all' && !a.period.startsWith(filterYear)) return false
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    return true
  }), [appraisals, filterYear, filterStatus])

  const stats = useMemo(() => ({
    total: appraisals.length,
    acknowledged: appraisals.filter(a => a.status === 'acknowledged').length,
    avgScore: appraisals.length ? (appraisals.reduce((s, a) => s + a.overallScore, 0) / appraisals.length).toFixed(1) : '0',
    excellent: appraisals.filter(a => a.overallScore >= 4.5).length,
  }), [appraisals])

  const calculateOverallScore = (criteria: Criterion[]): number => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
    const weightedSum = criteria.reduce((sum, c) => sum + (c.score * c.weight), 0)
    return weightedSum / totalWeight
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (a: EvaluationRecord) => {
    setEditing(a.id)
    setForm({
      employeeId: a.employeeId,
      employeeName: a.employeeName,
      departmentId: a.departmentId,
      period: a.period,
      criteria: a.categories as Criterion[],
      evaluatorName: a.evaluatorName,
      strengths: a.strengths || '',
      areasForImprovement: a.areasForImprovement || '',
      goals: a.goals || '',
      status: a.status as AppraisalStatus,
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

  const updateCriterionScore = (index: number, score: number) => {
    setForm(p => ({
      ...p,
      criteria: p.criteria.map((c, i) => i === index ? { ...c, score } : c)
    }))
  }

  const overallScore = calculateOverallScore(form.criteria)
  const currentGrade = calcGrade(overallScore)

  const handleSave = async () => {
    if (!form.employeeId) {
      toast.error('يرجى اختيار الموظف')
      return
    }

    setSaving(true)
    try {
      const data = {
        employeeId: form.employeeId,
        employeeName: form.employeeName,
        departmentId: form.departmentId,
        evaluatorId: 'current-user',
        evaluatorName: form.evaluatorName || 'المشرف',
        period: form.period,
        evaluationDate: new Date().toISOString().split('T')[0],
        overallScore,
        categories: form.criteria,
        strengths: form.strengths,
        areasForImprovement: form.areasForImprovement,
        goals: form.goals,
        status: form.status,
      }

      if (editing) {
        await evaluationsService.update(editing, data)
        toast.success('تم تعديل التقييم')
      } else {
        await evaluationsService.create(data)
        toast.success('تم حفظ التقييم')
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving evaluation:', error)
      toast.error('حدث خطأ في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await evaluationsService.delete(deleteId)
      toast.success('تم حذف التقييم')
      setDeleteId(null)
      loadData()
    } catch (error) {
      console.error('Error deleting evaluation:', error)
      toast.error('حدث خطأ في الحذف')
    }
  }

  const handleExport = () => {
    const header = 'الاسم,القسم,الفترة,الدرجة,التقدير,الحالة,المقيِّم'
    const rows = filtered.map(a =>
      `${a.employeeName},${a.departmentId},${a.period},${a.overallScore.toFixed(2)},${calcGrade(a.overallScore)},${STATUS_CONFIG[a.status as AppraisalStatus]?.label},${a.evaluatorName}`
    )
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'appraisals.csv'
    link.click()
    toast.success('تم تصدير التقييمات')
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
          <h1 className="text-2xl font-bold">تقييم الأداء</h1>
          <p className="text-sm text-muted-foreground">تقييمات الكادر التمريضي الدورية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 ml-1" />تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 ml-1" />تصدير
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 ml-1" />تقييم جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي التقييمات', val: stats.total, color: 'text-foreground', suffix: '' },
          { label: 'معتمدة', val: stats.acknowledged, color: 'text-green-600', suffix: '' },
          { label: 'متوسط الأداء', val: stats.avgScore, color: 'text-blue-600', suffix: '/5' },
          { label: 'تقدير ممتاز', val: stats.excellent, color: 'text-amber-600', suffix: '' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className={cn('text-3xl font-black', s.color)}>{s.val}<span className="text-sm font-normal">{s.suffix}</span></p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3">
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-28"><SelectValue placeholder="السنة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل السنوات</SelectItem>
                {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
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
          <CardTitle className="text-sm">سجلات التقييم — {filtered.length} تقييم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['#', 'الاسم', 'القسم', 'الفترة', 'الدرجة', 'التقدير', 'الحالة', 'المقيِّم', 'إجراءات'].map(h => (
                    <TableHead key={h} className="text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      لا توجد تقييمات
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((a, i) => {
                  const grade = calcGrade(a.overallScore)
                  return (
                    <TableRow key={a.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setViewItem(a)}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-semibold">{a.employeeName}</TableCell>
                      <TableCell className="text-sm">{a.departmentId}</TableCell>
                      <TableCell className="font-mono text-sm">{a.period}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{a.overallScore.toFixed(2)}</span>
                          <span className="text-muted-foreground text-xs">/5</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', GRADE_COLOR[grade])}>
                          <Star className="h-3 w-3 ml-1 inline" />{grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', STATUS_CONFIG[a.status as AppraisalStatus]?.color)}>
                          {STATUS_CONFIG[a.status as AppraisalStatus]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{a.evaluatorName}</TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(a)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-destructive" onClick={() => setDeleteId(a.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل تقييم الأداء' : 'تقييم أداء جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">الموظف *</Label>
                <Select value={form.employeeId} onValueChange={handleEmployeeChange}>
                  <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.status === 'active').map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الفترة</Label>
                <Select value={form.period} onValueChange={v => setForm(p => ({ ...p, period: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].flatMap(y =>
                      Object.entries(PERIODS).map(([k, v]) => (
                        <SelectItem key={`${y}-${k}`} value={`${y}-${k}`}>{y} - {v}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as AppraisalStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Criteria */}
            <div className="space-y-3 border rounded-lg p-3 bg-muted/20">
              <p className="text-xs font-bold text-muted-foreground uppercase">معايير التقييم (1-5)</p>
              {form.criteria.map((c, idx) => (
                <div key={c.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{c.category} ({c.weight}%)</Label>
                    <span className="text-sm font-bold">{c.score}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.5}
                    value={c.score}
                    onChange={e => updateCriterionScore(idx, Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-bold">التقييم الإجمالي: {overallScore.toFixed(2)}/5</span>
                <Badge className={cn('text-sm', GRADE_COLOR[currentGrade])}>
                  <Award className="h-3 w-3 ml-1 inline" />{currentGrade}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">المقيِّم</Label>
              <Input value={form.evaluatorName} onChange={e => setForm(p => ({ ...p, evaluatorName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">نقاط القوة</Label>
              <Textarea rows={2} value={form.strengths} onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))} placeholder="نقاط القوة..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">مجالات التحسين</Label>
              <Textarea rows={2} value={form.areasForImprovement} onChange={e => setForm(p => ({ ...p, areasForImprovement: e.target.value }))} placeholder="مجالات تحتاج تطوير..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الأهداف</Label>
              <Textarea rows={2} value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} placeholder="أهداف الفترة القادمة..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              {editing ? 'حفظ' : 'إضافة التقييم'}
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
                <Badge className={cn('text-xs', STATUS_CONFIG[viewItem.status as AppraisalStatus]?.color)}>
                  {STATUS_CONFIG[viewItem.status as AppraisalStatus]?.label}
                </Badge>
              </div>
              <DialogTitle>{viewItem.employeeName}</DialogTitle>
              <p className="text-sm text-muted-foreground">فترة: {viewItem.period}</p>
            </DialogHeader>
            <div className="space-y-3">
              {viewItem.categories.map(c => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{c.category}</span>
                    <span className="font-mono">{c.score}/5</span>
                  </div>
                  <div className="bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${(c.score / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">الدرجة الكلية</p>
                  <p className="text-2xl font-black">
                    {viewItem.overallScore.toFixed(2)}
                    <span className="text-sm text-muted-foreground">/5</span>
                  </p>
                </div>
                <Badge className={cn('text-lg px-3 py-1', GRADE_COLOR[calcGrade(viewItem.overallScore)])}>
                  {calcGrade(viewItem.overallScore)}
                </Badge>
              </div>
              {viewItem.strengths && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">نقاط القوة</p>
                  <p className="text-sm">{viewItem.strengths}</p>
                </div>
              )}
              {viewItem.areasForImprovement && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">مجالات التحسين</p>
                  <p className="text-sm">{viewItem.areasForImprovement}</p>
                </div>
              )}
              {viewItem.goals && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الأهداف</p>
                  <p className="text-sm">{viewItem.goals}</p>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                المقيِّم: {viewItem.evaluatorName}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewItem(null)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع.</AlertDialogDescription>
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
