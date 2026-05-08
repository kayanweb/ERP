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
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Pin, PinOff, Megaphone, Bell, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type AnnouncementCategory = 'general' | 'urgent' | 'training' | 'policy' | 'event'
type AnnouncementAudience = 'all' | 'ICU' | 'ER' | 'الباطنية' | 'الجراحة' | 'CN' | 'SN'

interface Announcement {
  id: string
  title: string
  content: string
  category: AnnouncementCategory
  audience: AnnouncementAudience
  pinned: boolean
  expiryDate?: string
  author: string
  createdAt: string
}

const CATEGORIES: Record<AnnouncementCategory, { label: string; color: string; icon: React.ReactNode }> = {
  general:  { label: 'عام', color: 'bg-blue-100 text-blue-700', icon: <Info className="h-3 w-3"/> },
  urgent:   { label: 'عاجل', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="h-3 w-3"/> },
  training: { label: 'تدريب', color: 'bg-purple-100 text-purple-700', icon: <Bell className="h-3 w-3"/> },
  policy:   { label: 'سياسات', color: 'bg-amber-100 text-amber-700', icon: <Megaphone className="h-3 w-3"/> },
  event:    { label: 'فعالية', color: 'bg-green-100 text-green-700', icon: <Bell className="h-3 w-3"/> },
}

const AUDIENCES: Record<AnnouncementAudience, string> = {
  all: 'الجميع', ICU: 'ICU', ER: 'ER', 'الباطنية': 'الباطنية', 'الجراحة': 'الجراحة', CN: 'رؤساء التمريض', SN: 'الممرضات'
}

const SAMPLE: Announcement[] = [
  { id:'1', title:'اجتماع الجودة الشهري', content:'يُعقد اجتماع لجنة الجودة يوم الأحد الموافق 2025/02/09 الساعة 10 صباحاً في قاعة الاجتماعات الرئيسية. الحضور إلزامي لجميع رؤساء الأقسام.', category:'event', audience:'CN', pinned:true, expiryDate:'2025-02-09', author:'إدارة التمريض', createdAt:'2025-02-01' },
  { id:'2', title:'تحديث بروتوكول العدوى', content:'تم تحديث بروتوكول مكافحة العدوى الخاص بـ COVID-19. يُرجى الاطلاع على النسخة الجديدة وتطبيقها فوراً.', category:'urgent', audience:'all', pinned:true, expiryDate:'', author:'قسم مكافحة العدوى', createdAt:'2025-01-28' },
  { id:'3', title:'دورة BLS المتجددة', content:'ستُعقد دورة إنعاش القلب والرئة BLS يومي الثلاثاء والأربعاء القادمين. التسجيل مفتوح حتى 2025/02/03.', category:'training', audience:'all', pinned:false, expiryDate:'2025-02-03', author:'قسم التدريب', createdAt:'2025-01-25' },
  { id:'4', title:'تعديل جدول الوردية الليلية', content:'اعتباراً من أول الشهر القادم سيتم تعديل توقيت الوردية الليلية لتكون من 11م إلى 7ص بدلاً من 10م إلى 6ص.', category:'policy', audience:'all', pinned:false, expiryDate:'', author:'مدير التمريض', createdAt:'2025-01-20' },
  { id:'5', title:'إغلاق مؤقت لغرفة المخزن B', content:'سيتم إغلاق مخزن الأدوية B للصيانة يوم الأربعاء من 8ص حتى 2م. يُرجى تجهيز الاحتياجات اللازمة مسبقاً.', category:'general', audience:'ICU', pinned:false, expiryDate:'2025-02-12', author:'إدارة الصيانة', createdAt:'2025-02-08' },
]

const EMPTY_FORM = {
  title: '', content: '', category: 'general' as AnnouncementCategory, audience: 'all' as AnnouncementAudience,
  pinned: false, expiryDate: '', author: '',
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(SAMPLE)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAudience, setFilterAudience] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [viewItem, setViewItem] = useState<Announcement|null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState<string|null>(null)

  const filtered = useMemo(() => {
    let list = [...announcements].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    if (filterCategory !== 'all') list = list.filter(a => a.category === filterCategory)
    if (filterAudience !== 'all') list = list.filter(a => a.audience === filterAudience || a.audience === 'all')
    return list
  }, [announcements, filterCategory, filterAudience])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true) }
  const openEdit = (a: Announcement) => {
    setEditing(a.id)
    setForm({ title: a.title, content: a.content, category: a.category, audience: a.audience, pinned: a.pinned, expiryDate: a.expiryDate || '', author: a.author })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title || !form.content) { toast.error('العنوان والمحتوى مطلوبان'); return }
    if (editing) {
      setAnnouncements(prev => prev.map(a => a.id === editing ? { ...a, ...form } : a))
      toast.success('تم تعديل الإعلان')
    } else {
      setAnnouncements(prev => [...prev, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] }])
      toast.success('تم نشر الإعلان')
    }
    setDialogOpen(false)
  }

  const togglePin = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a))
    toast.success('تم تحديث تثبيت الإعلان')
  }

  const handleDelete = () => {
    if (!deleteId) return
    setAnnouncements(prev => prev.filter(a => a.id !== deleteId))
    toast.success('تم حذف الإعلان')
    setDeleteId(null)
  }

  const isExpired = (date?: string) => date && new Date(date) < new Date()

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold">الإعلانات والتنبيهات</h1><p className="text-sm text-muted-foreground">إدارة الإعلانات الداخلية للكادر التمريضي</p></div>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1"/>إعلان جديد</Button>
      </div>

      {/* Filters */}
      <Card><CardContent className="pt-4 pb-3">
        <div className="flex flex-wrap gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36"><SelectValue placeholder="الفئة"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              {Object.entries(CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterAudience} onValueChange={setFilterAudience}>
            <SelectTrigger className="w-40"><SelectValue placeholder="الجمهور المستهدف"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              {Object.entries(AUDIENCES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      {/* Announcements Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30"/><p>لا توجد إعلانات</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ann => (
            <Card
              key={ann.id}
              className={cn('relative cursor-pointer hover:shadow-md transition-shadow', ann.pinned && 'ring-2 ring-primary/30', isExpired(ann.expiryDate) && 'opacity-60')}
              onClick={() => setViewItem(ann)}
            >
              {ann.pinned && (
                <div className="absolute top-2 left-2 text-primary"><Pin className="h-4 w-4"/></div>
              )}
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-2 mb-2">
                  <Badge className={cn('text-xs flex items-center gap-1', CATEGORIES[ann.category].color)}>
                    {CATEGORIES[ann.category].icon}{CATEGORIES[ann.category].label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{AUDIENCES[ann.audience]}</Badge>
                  {isExpired(ann.expiryDate) && <Badge className="text-xs bg-gray-100 text-gray-500">منتهي</Badge>}
                </div>
                <h3 className="font-bold text-sm mb-1 line-clamp-2">{ann.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{ann.content}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span>{ann.author}</span>
                    <span className="mx-1">·</span>
                    <span>{ann.createdAt}</span>
                    {ann.expiryDate && <span className="mr-1 text-amber-600"> · ينتهي {ann.expiryDate}</span>}
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => togglePin(ann.id)} title={ann.pinned ? 'إلغاء التثبيت' : 'تثبيت'}>
                      {ann.pinned ? <PinOff className="h-3 w-3"/> : <Pin className="h-3 w-3"/>}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(ann)}><Edit className="h-3 w-3"/></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteId(ann.id)}><Trash2 className="h-3 w-3"/></Button>
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
          <DialogHeader><DialogTitle>{editing ? 'تعديل الإعلان' : 'إعلان جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label className="text-xs">عنوان الإعلان *</Label><Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">الفئة</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({...p, category: v as AnnouncementCategory}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{Object.entries(CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">الجمهور المستهدف</Label>
                <Select value={form.audience} onValueChange={v => setForm(p => ({...p, audience: v as AnnouncementAudience}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{Object.entries(AUDIENCES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label className="text-xs">محتوى الإعلان *</Label><Textarea rows={4} value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} placeholder="اكتب نص الإعلان هنا..."/></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">المُعلِن / المصدر</Label><Input value={form.author} onChange={e => setForm(p => ({...p, author: e.target.value}))} placeholder="إدارة التمريض"/></div>
              <div className="space-y-1"><Label className="text-xs">تاريخ الانتهاء (اختياري)</Label><Input type="date" value={form.expiryDate} onChange={e => setForm(p => ({...p, expiryDate: e.target.value}))}/></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(p => ({...p, pinned: e.target.checked}))} className="rounded"/>
              <span className="text-sm">تثبيت الإعلان في أعلى القائمة</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? 'حفظ' : 'نشر الإعلان'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        {viewItem && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn('text-xs flex items-center gap-1', CATEGORIES[viewItem.category].color)}>
                  {CATEGORIES[viewItem.category].icon}{CATEGORIES[viewItem.category].label}
                </Badge>
                <Badge variant="outline" className="text-xs">{AUDIENCES[viewItem.audience]}</Badge>
                {viewItem.pinned && <Badge className="text-xs bg-primary/10 text-primary"><Pin className="h-3 w-3 inline ml-1"/>مثبت</Badge>}
              </div>
              <DialogTitle className="text-base mt-1">{viewItem.title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewItem.content}</p>
            <div className="text-xs text-muted-foreground flex gap-3 pt-2 border-t">
              <span>بواسطة: {viewItem.author}</span>
              <span>تاريخ النشر: {viewItem.createdAt}</span>
              {viewItem.expiryDate && <span className="text-amber-600">ينتهي: {viewItem.expiryDate}</span>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewItem(null)}>إغلاق</Button>
              <Button onClick={() => { openEdit(viewItem); setViewItem(null) }}><Edit className="h-4 w-4 ml-1"/>تعديل</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>سيتم حذف هذا الإعلان نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDelete}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
