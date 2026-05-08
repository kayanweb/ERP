'use client'

import { useState } from 'react'
import {
  Archive,
  Download,
  Eye,
  Trash2,
  Search,
  Calendar,
  Users,
  FileText,
  FolderOpen,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// Demo archived schedules/data
const archiveItems = [
  {
    id: 'a1',
    name: 'روستر — أبريل 2026',
    unit: 'ICU 3rd',
    month: 'أبريل',
    year: 2026,
    staffCount: 18,
    createdAt: '2026-04-30 23:55',
    createdBy: 'مدير النظام',
    type: 'roster',
    size: '124 KB',
  },
  {
    id: 'a2',
    name: 'روستر — مارس 2026',
    unit: 'ICU 3rd',
    month: 'مارس',
    year: 2026,
    staffCount: 17,
    createdAt: '2026-03-31 23:50',
    createdBy: 'مدير النظام',
    type: 'roster',
    size: '118 KB',
  },
  {
    id: 'a3',
    name: 'روستر — أبريل 2026',
    unit: 'ER',
    month: 'أبريل',
    year: 2026,
    staffCount: 22,
    createdAt: '2026-04-30 22:30',
    createdBy: 'مشرف الطوارئ',
    type: 'roster',
    size: '156 KB',
  },
  {
    id: 'a4',
    name: 'تقرير غياب — أبريل 2026',
    unit: 'كل الوحدات',
    month: 'أبريل',
    year: 2026,
    staffCount: 55,
    createdAt: '2026-05-01 08:00',
    createdBy: 'مدير الموارد البشرية',
    type: 'report',
    size: '88 KB',
  },
  {
    id: 'a5',
    name: 'روستر — فبراير 2026',
    unit: 'CCU',
    month: 'فبراير',
    year: 2026,
    staffCount: 14,
    createdAt: '2026-02-28 23:00',
    createdBy: 'مشرف CCU',
    type: 'roster',
    size: '102 KB',
  },
  {
    id: 'a6',
    name: 'كشف رواتب — مارس 2026',
    unit: 'كل الوحدات',
    month: 'مارس',
    year: 2026,
    staffCount: 55,
    createdAt: '2026-04-01 10:00',
    createdBy: 'المدير المالي',
    type: 'payroll',
    size: '200 KB',
  },
]

const typeConfig = {
  roster: { label: 'روستر', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <Calendar className="h-4 w-4" /> },
  report: { label: 'تقرير', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <FileText className="h-4 w-4" /> },
  payroll: { label: 'رواتب', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: <FileText className="h-4 w-4" /> },
}

export default function ArchivePage() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(archiveItems)
  const [previewItem, setPreviewItem] = useState<typeof archiveItems[0] | null>(null)

  const filtered = items.filter(
    a =>
      a.name.includes(search) ||
      a.unit.includes(search) ||
      a.createdBy.includes(search)
  )

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">الأرشيف</h1>
          <p className="text-muted-foreground text-sm">
            الجداول والتقارير والسجلات المحفوظة
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-1" />
          أرشفة الآن
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المحفوظات', value: items.length, icon: <Archive className="h-5 w-5" />, color: 'text-primary' },
          { label: 'روسترات', value: items.filter(i => i.type === 'roster').length, icon: <Calendar className="h-5 w-5" />, color: 'text-blue-600' },
          { label: 'تقارير', value: items.filter(i => i.type === 'report').length, icon: <FileText className="h-5 w-5" />, color: 'text-green-600' },
          { label: 'كشوف رواتب', value: items.filter(i => i.type === 'payroll').length, icon: <FolderOpen className="h-5 w-5" />, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-lg bg-muted flex items-center justify-center', s.color)}>
                {s.icon}
              </div>
              <div>
                <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث في الأرشيف..."
          className="pr-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Archive list */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">لا توجد محفوظات</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const tc = typeConfig[item.type as keyof typeof typeConfig]
            return (
              <Card key={item.id} className="hover:border-primary transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-primary">
                        {tc.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.unit}</p>
                      </div>
                    </div>
                    <Badge className={cn('text-[10px] border-0 shrink-0', tc.color)}>
                      {tc.label}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{item.staffCount} موظف</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{item.createdAt}</span>
                    </div>
                    <div>بواسطة: {item.createdBy}</div>
                    <div>الحجم: {item.size}</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs gap-1"
                      onClick={() => setPreviewItem(item)}
                    >
                      <Eye className="h-3 w-3" /> عرض
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <Download className="h-3 w-3" /> تنزيل
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Preview modal */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewItem?.name}</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'الوحدة', value: previewItem.unit },
                  { label: 'عدد الموظفين', value: previewItem.staffCount },
                  { label: 'تاريخ الإنشاء', value: previewItem.createdAt },
                  { label: 'أنشأ بواسطة', value: previewItem.createdBy },
                  { label: 'حجم الملف', value: previewItem.size },
                  { label: 'النوع', value: typeConfig[previewItem.type as keyof typeof typeConfig].label },
                ].map(f => (
                  <div key={f.label} className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="font-semibold mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-1">
                  <Download className="h-4 w-4" /> تنزيل الملف
                </Button>
                <Button variant="outline" className="gap-1">
                  🖨 طباعة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
