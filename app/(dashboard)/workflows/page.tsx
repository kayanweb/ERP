'use client'

import { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Filter,
  Search,
  ChevronDown,
  MessageSquare,
  CalendarDays,
  Repeat,
  Star,
  Wrench,
  FileText,
  Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const requestTypes = [
  { value: 'shift_swap', label: 'تبادل شيفت', icon: <Repeat className="h-4 w-4" /> },
  { value: 'vacation', label: 'طلب إجازة', icon: <CalendarDays className="h-4 w-4" /> },
  { value: 'overtime', label: 'ساعات إضافية', icon: <Clock className="h-4 w-4" /> },
  { value: 'appraisal', label: 'طلب تقييم', icon: <Star className="h-4 w-4" /> },
  { value: 'maintenance', label: 'طلب صيانة', icon: <Wrench className="h-4 w-4" /> },
  { value: 'report', label: 'طلب تقرير', icon: <FileText className="h-4 w-4" /> },
]

const initialRequests = [
  {
    id: 'W1',
    type: 'shift_swap',
    typeLabel: 'تبادل شيفت',
    from: 'أحمد محمد',
    fromUnit: 'ICU 3rd',
    to: 'سارة خالد',
    details: 'طلب تبادل شيفت يوم الخميس 2026-05-09 من نهاري إلى ليلي',
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-05-06 09:00',
    comments: [],
  },
  {
    id: 'W2',
    type: 'vacation',
    typeLabel: 'طلب إجازة',
    from: 'نورة أحمد',
    fromUnit: 'ER',
    to: 'مدير التمريض',
    details: 'إجازة سنوية من 2026-05-15 إلى 2026-05-20 (6 أيام)',
    status: 'approved',
    priority: 'low',
    createdAt: '2026-05-05 14:00',
    comments: ['تمت الموافقة بشرط إيجاد بديل في الجدول'],
  },
  {
    id: 'W3',
    type: 'overtime',
    typeLabel: 'ساعات إضافية',
    from: 'حسام فارس',
    fromUnit: 'CCU',
    to: 'مشرف الوحدة',
    details: 'طلب تسجيل 8 ساعات إضافية ليوم 2026-05-04',
    status: 'pending',
    priority: 'high',
    createdAt: '2026-05-05 08:30',
    comments: [],
  },
  {
    id: 'W4',
    type: 'maintenance',
    typeLabel: 'طلب صيانة',
    from: 'فاطمة علي',
    fromUnit: 'NICU',
    to: 'قسم الصيانة',
    details: 'عطل في جهاز الأكسجين — غرفة 412 — طارئ',
    status: 'rejected',
    priority: 'urgent',
    createdAt: '2026-05-04 22:00',
    comments: ['تم إحالة الطلب لفريق الصيانة الخارجي'],
  },
  {
    id: 'W5',
    type: 'appraisal',
    typeLabel: 'طلب تقييم',
    from: 'خالد عبدالله',
    fromUnit: 'ICU 3rd',
    to: 'مشرف الوحدة',
    details: 'طلب إجراء تقييم أداء الربع الثاني 2026',
    status: 'approved',
    priority: 'low',
    createdAt: '2026-05-03 11:00',
    comments: ['مجدول ليوم 2026-05-12'],
  },
]

const statusConfig = {
  pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'موافق', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> },
}

const priorityConfig = {
  urgent: { label: 'عاجل', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  high: { label: 'مهم', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  medium: { label: 'متوسط', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
  low: { label: 'عادي', color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20' },
}

export default function WorkflowsPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [newType, setNewType] = useState('shift_swap')
  const [newDetails, setNewDetails] = useState('')
  const [newPriority, setNewPriority] = useState('medium')

  const filtered = requests.filter(r => {
    const matchSearch = r.from.includes(search) || r.details.includes(search) || r.typeLabel.includes(search)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const pending = requests.filter(r => r.status === 'pending')
  const approved = requests.filter(r => r.status === 'approved')
  const rejected = requests.filter(r => r.status === 'rejected')

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const submitNew = () => {
    const typeInfo = requestTypes.find(t => t.value === newType)
    setRequests(prev => [
      {
        id: `W${Date.now()}`,
        type: newType,
        typeLabel: typeInfo?.label || newType,
        from: 'المستخدم الحالي',
        fromUnit: 'وحدتي',
        to: 'مدير التمريض',
        details: newDetails,
        status: 'pending',
        priority: newPriority,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        comments: [],
      },
      ...prev,
    ])
    setIsNewOpen(false)
    setNewDetails('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">الطلبات والموافقات</h1>
          <p className="text-muted-foreground text-sm">
            إدارة طلبات الموافقة والتدفق الوظيفي
          </p>
        </div>
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-1" />
              طلب جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء طلب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">نوع الطلب</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {requestTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الأولوية</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">عاجل</SelectItem>
                    <SelectItem value="high">مهم</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">عادي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">تفاصيل الطلب</Label>
                <Textarea
                  placeholder="اشرح طلبك بالتفصيل..."
                  rows={4}
                  value={newDetails}
                  onChange={e => setNewDetails(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={submitNew} className="flex-1">إرسال الطلب</Button>
                <Button variant="outline" onClick={() => setIsNewOpen(false)}>إلغاء</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: requests.length, color: 'text-primary', icon: <FileText className="h-5 w-5" /> },
          { label: 'قيد المراجعة', value: pending.length, color: 'text-yellow-600', icon: <Clock className="h-5 w-5" /> },
          { label: 'موافق عليها', value: approved.length, color: 'text-green-600', icon: <CheckCircle className="h-5 w-5" /> },
          { label: 'مرفوضة', value: rejected.length, color: 'text-red-600', icon: <XCircle className="h-5 w-5" /> },
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الطلبات..."
            className="pr-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="approved">موافق</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">لا توجد طلبات</p>
          </Card>
        ) : (
          filtered.map(req => {
            const sc = statusConfig[req.status as keyof typeof statusConfig]
            const pc = priorityConfig[req.priority as keyof typeof priorityConfig]
            const typeInfo = requestTypes.find(t => t.value === req.type)
            return (
              <Card key={req.id} className={cn(
                'transition-colors',
                req.status === 'pending' && 'border-yellow-200 dark:border-yellow-900/50'
              )}>
                <CardContent className="pt-4">
                  <div className="flex flex-col sm:flex-row items-start gap-3">
                    {/* Icon */}
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-primary shrink-0">
                      {typeInfo?.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{req.typeLabel}</span>
                        <Badge className={cn('text-[10px] border-0 flex items-center gap-1', sc.color)}>
                          {sc.icon} {sc.label}
                        </Badge>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded font-medium', pc.color)}>
                          {pc.label}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{req.details}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        <span>من: <strong className="text-foreground">{req.from}</strong> ({req.fromUnit})</span>
                        <span>إلى: <strong className="text-foreground">{req.to}</strong></span>
                        <span>{req.createdAt}</span>
                      </div>
                      {req.comments.length > 0 && (
                        <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                          💬 {req.comments[req.comments.length - 1]}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {req.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() => updateStatus(req.id, 'approved')}
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 text-red-700 border-red-300 hover:bg-red-50"
                          onClick={() => updateStatus(req.id, 'rejected')}
                        >
                          <XCircle className="h-3.5 w-3.5" /> رفض
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
