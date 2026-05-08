'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { Building2, Users, Bed, AlertTriangle, Eye, Plus, Edit, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Department {
  id: string
  name: string
  nameAr: string
  beds: number
  patients: number
  nurses: number
  isolationCases: number
}

const INITIAL_DEPARTMENTS: Department[] = [
  { id: '1', name: 'ICU 3rd', nameAr: 'العناية المركزة 3', beds: 15, patients: 7, nurses: 5, isolationCases: 2 },
  { id: '2', name: 'ICU 4th', nameAr: 'العناية المركزة 4', beds: 6, patients: 2, nurses: 1, isolationCases: 0 },
  { id: '3', name: 'CCU', nameAr: 'وحدة العناية القلبية', beds: 11, patients: 2, nurses: 2, isolationCases: 0 },
  { id: '4', name: 'ER', nameAr: 'قسم الطوارئ', beds: 11, patients: 29, nurses: 3, isolationCases: 1 },
  { id: '5', name: 'NICU', nameAr: 'عناية حديثي الولادة', beds: 2, patients: 0, nurses: 1, isolationCases: 0 },
  { id: '6', name: 'PICU', nameAr: 'عناية الأطفال', beds: 4, patients: 3, nurses: 1, isolationCases: 1 },
  { id: '7', name: '8th Floor', nameAr: 'الطابق الثامن', beds: 17, patients: 2, nurses: 1, isolationCases: 0 },
  { id: '8', name: '9th Floor', nameAr: 'الطابق التاسع', beds: 17, patients: 9, nurses: 2, isolationCases: 0 },
  { id: '9', name: '11th Floor', nameAr: 'الطابق الحادي عشر', beds: 14, patients: 1, nurses: 1, isolationCases: 0 },
]

const EMPTY_FORM: Omit<Department, 'id'> = {
  name: '', nameAr: '', beds: 10, patients: 0, nurses: 2, isolationCases: 0,
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const totalBeds = departments.reduce((s, d) => s + d.beds, 0)
  const totalPatients = departments.reduce((s, d) => s + d.patients, 0)
  const totalNurses = departments.reduce((s, d) => s + d.nurses, 0)
  const totalIsolation = departments.reduce((s, d) => s + d.isolationCases, 0)

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true) }
  const openEdit = (d: Department) => {
    setEditing(d.id)
    setForm({ name: d.name, nameAr: d.nameAr, beds: d.beds, patients: d.patients, nurses: d.nurses, isolationCases: d.isolationCases })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.nameAr) { toast.error('اسم القسم مطلوب'); return }
    if (editing) {
      setDepartments(prev => prev.map(d => d.id === editing ? { ...d, ...form } : d))
      toast.success('تم تعديل القسم')
    } else {
      setDepartments(prev => [...prev, { ...form, id: Date.now().toString() }])
      toast.success('تمت إضافة القسم')
    }
    setDialogOpen(false)
  }

  const handleDelete = () => {
    if (!deleteId) return
    setDepartments(prev => prev.filter(d => d.id !== deleteId))
    toast.success('تم حذف القسم')
    setDeleteId(null)
  }

  const setField = (key: keyof typeof EMPTY_FORM, val: string | number) =>
    setForm(p => ({ ...p, [key]: val }))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الأقسام</h1>
          <p className="text-muted-foreground text-sm">نظرة عامة على جميع أقسام المستشفى</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1"/>إضافة قسم</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Building2, val: departments.length, label: 'الأقسام', color: 'bg-primary/10 text-primary' },
          { icon: Bed, val: totalBeds, label: 'إجمالي الأسرة', color: 'bg-green-100 text-green-600' },
          { icon: Users, val: totalPatients, label: 'إجمالي المرضى', color: 'bg-blue-100 text-blue-600' },
          { icon: AlertTriangle, val: totalIsolation, label: 'حالات العزل', color: 'bg-amber-100 text-amber-600' },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div><p className="text-2xl font-bold">{s.val}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const occupancy = Math.round((dept.patients / dept.beds) * 100)
          const isOver = dept.patients > dept.beds
          const isHigh = occupancy >= 80
          const ratio = dept.patients > 0 ? (dept.patients / dept.nurses).toFixed(1) : '0'

          return (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{dept.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{dept.nameAr}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isOver && <Badge variant="destructive" className="text-xs">تجاوز السعة</Badge>}
                    {!isOver && dept.isolationCases > 0 && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">{dept.isolationCases} عزل</Badge>}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(dept)}><Edit className="h-3 w-3"/></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteId(dept.id)}><Trash2 className="h-3 w-3"/></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">نسبة الإشغال</span>
                    <span className={cn('font-medium', isOver ? 'text-destructive' : isHigh ? 'text-amber-600' : 'text-green-600')}>{occupancy}%</span>
                  </div>
                  <Progress value={Math.min(occupancy, 100)} className={cn('h-2', isOver ? '[&>div]:bg-destructive' : isHigh ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500')} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[{ v: dept.beds, l: 'أسرة' }, { v: dept.patients, l: 'مرضى' }, { v: dept.nurses, l: 'ممرضون' }].map(s => (
                    <div key={s.l} className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold">{s.v}</p>
                      <p className="text-xs text-muted-foreground">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">نسبة المرضى/الممرض</span>
                  <Badge variant="secondary">{ratio}:1</Badge>
                </div>
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <Link href={`/departments/${dept.id}`}><Eye className="h-4 w-4 ml-2"/>عرض التفاصيل</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'تعديل القسم' : 'إضافة قسم جديد'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1"><Label className="text-xs">اسم القسم (EN) *</Label><Input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="ICU"/></div>
            <div className="space-y-1"><Label className="text-xs">اسم القسم (AR) *</Label><Input value={form.nameAr} onChange={e => setField('nameAr', e.target.value)} placeholder="العناية المركزة"/></div>
            <div className="space-y-1"><Label className="text-xs">عدد الأسرة</Label><Input type="number" min={1} value={form.beds} onChange={e => setField('beds', Number(e.target.value))}/></div>
            <div className="space-y-1"><Label className="text-xs">عدد المرضى</Label><Input type="number" min={0} value={form.patients} onChange={e => setField('patients', Number(e.target.value))}/></div>
            <div className="space-y-1"><Label className="text-xs">عدد الممرضين</Label><Input type="number" min={1} value={form.nurses} onChange={e => setField('nurses', Number(e.target.value))}/></div>
            <div className="space-y-1"><Label className="text-xs">حالات العزل</Label><Input type="number" min={0} value={form.isolationCases} onChange={e => setField('isolationCases', Number(e.target.value))}/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? 'حفظ التعديلات' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>سيتم حذف هذا القسم نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDelete}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
