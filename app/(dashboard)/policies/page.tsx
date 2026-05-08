'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Search, FileText, BookOpen, Shield, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

type PolicyCategory = 'clinical' | 'admin' | 'safety' | 'infection' | 'emergency' | 'hr'
type PolicyStatus = 'active' | 'under_review' | 'archived'

interface Policy {
  id: string
  policyNo: string
  title: string
  content: string
  category: PolicyCategory
  status: PolicyStatus
  version: string
  effectiveDate: string
  reviewDate: string
  author: string
  approvedBy: string
  tags: string[]
}

const CATEGORIES: Record<PolicyCategory, { label: string; color: string; icon: React.ReactNode }> = {
  clinical:   { label: 'إكلينيكي', color: 'bg-blue-100 text-blue-700', icon: <BookOpen className="h-3 w-3"/> },
  admin:      { label: 'إداري', color: 'bg-purple-100 text-purple-700', icon: <FileText className="h-3 w-3"/> },
  safety:     { label: 'سلامة', color: 'bg-amber-100 text-amber-700', icon: <Shield className="h-3 w-3"/> },
  infection:  { label: 'مكافحة العدوى', color: 'bg-red-100 text-red-700', icon: <Shield className="h-3 w-3"/> },
  emergency:  { label: 'طوارئ', color: 'bg-orange-100 text-orange-700', icon: <Shield className="h-3 w-3"/> },
  hr:         { label: 'الموارد البشرية', color: 'bg-green-100 text-green-700', icon: <FileText className="h-3 w-3"/> },
}

const STATUS_CONFIG: Record<PolicyStatus, { label: string; color: string }> = {
  active:       { label: 'نشط', color: 'bg-green-100 text-green-700' },
  under_review: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700' },
  archived:     { label: 'مؤرشف', color: 'bg-gray-100 text-gray-600' },
}

const SAMPLE: Policy[] = [
  { id:'1', policyNo:'POL-001', title:'بروتوكول غسل الأيدي ومكافحة العدوى', content:'يجب على جميع الكادر الطبي التقيد بمعايير غسل الأيدي وفق بروتوكول منظمة الصحة العالمية WHO قبل وبعد كل إجراء طبي. يشمل ذلك الغسل لمدة 20 ثانية على الأقل باستخدام الماء والصابون أو المطهر الكحولي...', category:'infection', status:'active', version:'3.1', effectiveDate:'2024-01-01', reviewDate:'2025-01-01', author:'لجنة مكافحة العدوى', approvedBy:'مدير المستشفى', tags:['عدوى','نظافة','بروتوكول'] },
  { id:'2', policyNo:'POL-002', title:'سياسة تسليم المناوبة SBAR', content:'تُستخدم تقنية SBAR (الحالة - الخلفية - التقييم - التوصية) في جميع عمليات تسليم المناوبة. يجب على كل ممرضة تسليم معلومات كاملة ودقيقة عن كل مريض...', category:'clinical', status:'active', version:'2.0', effectiveDate:'2023-06-01', reviewDate:'2025-06-01', author:'قسم الجودة', approvedBy:'رئيسة التمريض', tags:['SBAR','مناوبة','تسليم'] },
  { id:'3', policyNo:'POL-003', title:'إجراءات الطوارئ — كود أحمر', content:'عند إعلان الكود الأحمر (حريق) يجب على الكادر اتباع بروتوكول RACE: Rescue, Alarm, Contain, Extinguish. يجب الإخلاء الفوري للمرضى القريبين من مصدر الخطر...', category:'emergency', status:'active', version:'1.5', effectiveDate:'2024-03-01', reviewDate:'2025-03-01', author:'قسم السلامة', approvedBy:'مدير المستشفى', tags:['طوارئ','حريق','إخلاء'] },
  { id:'4', policyNo:'POL-004', title:'سياسة التقييم الدوري للأداء', content:'يُجرى تقييم أداء جميع موظفي التمريض كل ستة أشهر باستخدام النماذج المعتمدة. يشمل التقييم المهارات التقنية والسلوكية والالتزام بمعايير الجودة...', category:'hr', status:'under_review', version:'2.2', effectiveDate:'2024-01-01', reviewDate:'2025-07-01', author:'الموارد البشرية', approvedBy:'مدير التمريض', tags:['تقييم','أداء','موظفين'] },
  { id:'5', policyNo:'POL-005', title:'سياسة إدارة الأدوية عالية التنبيه', content:'تشمل الأدوية عالية التنبيه: الأنسولين، الكيموثيرابي، المسكنات الأفيونية، والمخففات الدموية. يجب التحقق المزدوج من الجرعة والطريقة والمريض قبل أي إعطاء...', category:'clinical', status:'active', version:'4.0', effectiveDate:'2024-06-01', reviewDate:'2025-06-01', author:'لجنة الصيدلة السريرية', approvedBy:'مدير المستشفى', tags:['أدوية','سلامة','التحقق المزدوج'] },
]

const EMPTY_FORM = {
  policyNo: '', title: '', content: '', category: 'clinical' as PolicyCategory,
  status: 'active' as PolicyStatus, version: '1.0', effectiveDate: '', reviewDate: '',
  author: '', approvedBy: '', tags: [] as string[],
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(SAMPLE)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [viewItem, setViewItem] = useState<Policy|null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState<string|null>(null)
  const [tagInput, setTagInput] = useState('')

  const filtered = useMemo(() => policies.filter(p => {
    if (search && !p.title.includes(search) && !p.policyNo.includes(search) && !p.tags.some(t => t.includes(search))) return false
    if (filterCategory !== 'all' && p.category !== filterCategory) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    return true
  }), [policies, search, filterCategory, filterStatus])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setTagInput(''); setDialogOpen(true) }
  const openEdit = (p: Policy) => {
    setEditing(p.id)
    setForm({ policyNo: p.policyNo, title: p.title, content: p.content, category: p.category, status: p.status, version: p.version, effectiveDate: p.effectiveDate, reviewDate: p.reviewDate, author: p.author, approvedBy: p.approvedBy, tags: [...p.tags] })
    setTagInput('')
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title || !form.policyNo) { toast.error('رقم السياسة والعنوان مطلوبان'); return }
    if (editing) {
      setPolicies(prev => prev.map(p => p.id === editing ? { ...p, ...form } : p))
      toast.success('تم تعديل السياسة')
    } else {
      setPolicies(prev => [...prev, { ...form, id: Date.now().toString() }])
      toast.success('تمت إضافة السياسة')
    }
    setDialogOpen(false)
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(p => ({...p, tags: [...p.tags, tagInput.trim()]}))
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => setForm(p => ({...p, tags: p.tags.filter(t => t !== tag)}))

  const handleDelete = () => {
    if (!deleteId) return
    setPolicies(prev => prev.filter(p => p.id !== deleteId))
    toast.success('تم حذف السياسة')
    setDeleteId(null)
  }

  const handleExport = () => {
    const header = 'رقم السياسة,العنوان,الفئة,الحالة,الإصدار,تاريخ السريان,تاريخ المراجعة,المؤلف,المعتمد من'
    const rows = filtered.map(p => `${p.policyNo},${p.title},${CATEGORIES[p.category].label},${STATUS_CONFIG[p.status].label},${p.version},${p.effectiveDate},${p.reviewDate},${p.author},${p.approvedBy}`)
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'policies.csv'; a.click()
    toast.success('تم تصدير السياسات')
  }

  const isExpiring = (date: string) => date && new Date(date) < new Date(Date.now() + 30*24*60*60*1000)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold">السياسات والإجراءات</h1><p className="text-sm text-muted-foreground">مكتبة السياسات والبروتوكولات التمريضية</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 ml-1"/>تصدير</Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1"/>إضافة سياسة</Button>
        </div>
      </div>

      {/* Filters */}
      <Card><CardContent className="pt-4 pb-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input className="pr-9" placeholder="بحث بالعنوان أو الرقم أو الوسوم..." value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40"><SelectValue placeholder="الفئة"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              {Object.entries(CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
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

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30"/><p>لا توجد سياسات مطابقة</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(pol => (
            <Card key={pol.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewItem(pol)}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap gap-1">
                    <Badge className={cn('text-xs flex items-center gap-1', CATEGORIES[pol.category].color)}>
                      {CATEGORIES[pol.category].icon}{CATEGORIES[pol.category].label}
                    </Badge>
                    <Badge className={cn('text-xs', STATUS_CONFIG[pol.status].color)}>{STATUS_CONFIG[pol.status].label}</Badge>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{pol.policyNo}</span>
                </div>
                <h3 className="font-bold text-sm mb-1 line-clamp-2">{pol.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{pol.content}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {pol.tags.map(tag => <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{tag}</span>)}
                </div>
                {isExpiring(pol.reviewDate) && (
                  <p className="text-[10px] text-amber-600 mb-2">⚠ موعد المراجعة قارب الانتهاء</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>v{pol.version} · {pol.effectiveDate}</span>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(pol)}><Edit className="h-3 w-3"/></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteId(pol.id)}><Trash2 className="h-3 w-3"/></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'تعديل السياسة' : 'إضافة سياسة جديدة'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1"><Label className="text-xs">رقم السياسة *</Label><Input value={form.policyNo} onChange={e => setForm(p => ({...p, policyNo: e.target.value}))} placeholder="POL-001"/></div>
            <div className="space-y-1"><Label className="text-xs">الإصدار</Label><Input value={form.version} onChange={e => setForm(p => ({...p, version: e.target.value}))} placeholder="1.0"/></div>
            <div className="col-span-2 space-y-1"><Label className="text-xs">عنوان السياسة *</Label><Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}/></div>
            <div className="space-y-1"><Label className="text-xs">الفئة</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({...p, category: v as PolicyCategory}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Object.entries(CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({...p, status: v as PolicyStatus}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_CONFIG).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">تاريخ السريان</Label><Input type="date" value={form.effectiveDate} onChange={e => setForm(p => ({...p, effectiveDate: e.target.value}))}/></div>
            <div className="space-y-1"><Label className="text-xs">تاريخ المراجعة</Label><Input type="date" value={form.reviewDate} onChange={e => setForm(p => ({...p, reviewDate: e.target.value}))}/></div>
            <div className="space-y-1"><Label className="text-xs">المؤلف</Label><Input value={form.author} onChange={e => setForm(p => ({...p, author: e.target.value}))}/></div>
            <div className="space-y-1"><Label className="text-xs">اعتمد من</Label><Input value={form.approvedBy} onChange={e => setForm(p => ({...p, approvedBy: e.target.value}))}/></div>
            <div className="col-span-2 space-y-1"><Label className="text-xs">محتوى السياسة</Label><Textarea rows={4} value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} placeholder="نص السياسة التفصيلي..."/></div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">الوسوم</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="أضف وسماً..."/>
                <Button type="button" variant="outline" size="sm" onClick={addTag}>إضافة</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {form.tags.map(tag => (
                  <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                    {tag}<button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? 'حفظ' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        {viewItem && (
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex flex-wrap gap-2 mb-1">
                <Badge className={cn('text-xs', CATEGORIES[viewItem.category].color)}>{CATEGORIES[viewItem.category].label}</Badge>
                <Badge className={cn('text-xs', STATUS_CONFIG[viewItem.status].color)}>{STATUS_CONFIG[viewItem.status].label}</Badge>
                <span className="text-xs font-mono text-muted-foreground">{viewItem.policyNo} · v{viewItem.version}</span>
              </div>
              <DialogTitle>{viewItem.title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm leading-relaxed whitespace-pre-wrap border rounded-lg p-3 bg-muted/30">{viewItem.content}</p>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
              {[
                ['تاريخ السريان', viewItem.effectiveDate],
                ['تاريخ المراجعة', viewItem.reviewDate],
                ['المؤلف', viewItem.author],
                ['اعتمد من', viewItem.approvedBy],
              ].map(([k,v]) => <div key={k}><p className="text-muted-foreground">{k}</p><p className="font-semibold">{v||'—'}</p></div>)}
            </div>
            {viewItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1"><p className="text-xs text-muted-foreground w-full mb-1">الوسوم:</p>{viewItem.tags.map(t => <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded">{t}</span>)}</div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewItem(null)}>إغلاق</Button>
              <Button onClick={() => { openEdit(viewItem); setViewItem(null) }}><Edit className="h-4 w-4 ml-1"/>تعديل</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>سيتم حذف هذه السياسة نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDelete}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
