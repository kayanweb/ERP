'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Handover } from '@/types'
import {
  ArrowLeftRight,
  Plus,
  Search,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Stethoscope,
  ClipboardList,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample handover data
const sampleHandovers: Handover[] = [
  {
    id: '1',
    patientId: 'P001',
    patientName: 'محمد أحمد علي',
    mrn: 'MRN-2024-001',
    department: 'ICU',
    fromNurse: 'سارة محمد',
    toNurse: 'فاطمة أحمد',
    shift: 'morning',
    date: '2024-01-15',
    situation: 'مريض 65 سنة، يعاني من قصور في الجهاز التنفسي، على جهاز التنفس الصناعي منذ 3 أيام',
    background: 'تم إدخاله بسبب التهاب رئوي حاد. تاريخ مرضي: سكري، ضغط دم مرتفع. حساسية من البنسلين',
    assessment: 'العلامات الحيوية مستقرة. SpO2 94% على FiO2 40%. درجة الوعي: مستجيب للأوامر الصوتية',
    recommendation: 'متابعة العلامات الحيوية كل ساعة. تحضير للفطام من جهاز التنفس. مراجعة نتائج الأشعة الصباحية',
    criticalAlerts: ['حساسية البنسلين', 'خطر السقوط'],
    pendingTasks: ['صورة أشعة الساعة 10', 'تحليل غازات الدم', 'زيارة الطبيب'],
    status: 'pending',
  },
  {
    id: '2',
    patientId: 'P002',
    patientName: 'أحمد سعيد',
    mrn: 'MRN-2024-002',
    department: 'الجراحة',
    fromNurse: 'نورة علي',
    toNurse: 'هدى محمد',
    shift: 'evening',
    date: '2024-01-15',
    situation: 'مريض 45 سنة، ما بعد عملية استئصال المرارة بالمنظار',
    background: 'العملية تمت بنجاح أمس. لا تاريخ مرضي سابق. لا حساسية معروفة',
    assessment: 'الجرح نظيف وجاف. الألم 3/10 مع المسكنات. بدأ المشي',
    recommendation: 'متابعة الجرح. تشجيع على المشي. تحضير للخروج غداً',
    criticalAlerts: [],
    pendingTasks: ['إزالة القسطرة', 'تعليمات الخروج'],
    status: 'acknowledged',
  },
]

const shiftLabels = {
  morning: { label: 'صباحي', color: 'bg-amber-500' },
  evening: { label: 'مسائي', color: 'bg-blue-500' },
  night: { label: 'ليلي', color: 'bg-indigo-500' },
}

export default function HandoverPage() {
  const [handovers, setHandovers] = useState<Handover[]>(sampleHandovers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterShift, setFilterShift] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedHandover, setSelectedHandover] = useState<Handover | null>(null)
  const [newHandover, setNewHandover] = useState({
    patientName: '',
    mrn: '',
    department: '',
    toNurse: '',
    shift: 'morning' as 'morning' | 'evening' | 'night',
    situation: '',
    background: '',
    assessment: '',
    recommendation: '',
    criticalAlerts: '',
    pendingTasks: '',
  })

  const pendingHandovers = handovers.filter((h) => h.status === 'pending')
  const acknowledgedHandovers = handovers.filter((h) => h.status === 'acknowledged')
  const completedHandovers = handovers.filter((h) => h.status === 'completed')

  const filteredHandovers = handovers.filter((h) => {
    const matchesSearch =
      h.patientName.includes(searchQuery) ||
      h.mrn.includes(searchQuery) ||
      h.department.includes(searchQuery)
    const matchesShift = filterShift === 'all' || h.shift === filterShift
    return matchesSearch && matchesShift
  })

  const handleAcknowledge = (id: string) => {
    setHandovers(
      handovers.map((h) =>
        h.id === id ? { ...h, status: 'acknowledged' as const } : h
      )
    )
  }

  const handleComplete = (id: string) => {
    setHandovers(
      handovers.map((h) =>
        h.id === id ? { ...h, status: 'completed' as const } : h
      )
    )
  }

  const handleCreateHandover = () => {
    const handover: Handover = {
      id: Date.now().toString(),
      patientId: `P${Date.now()}`,
      patientName: newHandover.patientName,
      mrn: newHandover.mrn,
      department: newHandover.department,
      fromNurse: 'المستخدم الحالي',
      toNurse: newHandover.toNurse,
      shift: newHandover.shift,
      date: new Date().toISOString().split('T')[0],
      situation: newHandover.situation,
      background: newHandover.background,
      assessment: newHandover.assessment,
      recommendation: newHandover.recommendation,
      criticalAlerts: newHandover.criticalAlerts
        .split('\n')
        .filter((a) => a.trim()),
      pendingTasks: newHandover.pendingTasks.split('\n').filter((t) => t.trim()),
      status: 'pending',
    }
    setHandovers([handover, ...handovers])
    setIsDialogOpen(false)
    setNewHandover({
      patientName: '',
      mrn: '',
      department: '',
      toNurse: '',
      shift: 'morning',
      situation: '',
      background: '',
      assessment: '',
      recommendation: '',
      criticalAlerts: '',
      pendingTasks: '',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تسليم المناوبة (SBAR)</h1>
          <p className="text-muted-foreground">
            نظام التواصل الموحد لتسليم المرضى بين المناوبات
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          تسليم جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">في انتظار التسليم</p>
                <p className="text-3xl font-bold text-amber-600">{pendingHandovers.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تم الاستلام</p>
                <p className="text-3xl font-bold text-blue-600">{acknowledgedHandovers.length}</p>
              </div>
              <ArrowLeftRight className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مكتمل</p>
                <p className="text-3xl font-bold text-green-600">{completedHandovers.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو رقم الملف..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterShift} onValueChange={setFilterShift}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="المناوبة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المناوبات</SelectItem>
            <SelectItem value="morning">صباحي</SelectItem>
            <SelectItem value="evening">مسائي</SelectItem>
            <SelectItem value="night">ليلي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Handover Cards */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            في الانتظار
            {pendingHandovers.length > 0 && (
              <Badge variant="secondary">{pendingHandovers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingHandovers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                لا توجد تسليمات في الانتظار
              </CardContent>
            </Card>
          ) : (
            pendingHandovers.map((handover) => (
              <HandoverCard
                key={handover.id}
                handover={handover}
                onAcknowledge={handleAcknowledge}
                onComplete={handleComplete}
                onView={() => setSelectedHandover(handover)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredHandovers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                لا توجد تسليمات
              </CardContent>
            </Card>
          ) : (
            filteredHandovers.map((handover) => (
              <HandoverCard
                key={handover.id}
                handover={handover}
                onAcknowledge={handleAcknowledge}
                onComplete={handleComplete}
                onView={() => setSelectedHandover(handover)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Handover Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تسليم مريض جديد (SBAR)</DialogTitle>
            <DialogDescription>
              أدخل معلومات التسليم باستخدام نموذج SBAR
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Patient Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>اسم المريض *</Label>
                <Input
                  value={newHandover.patientName}
                  onChange={(e) =>
                    setNewHandover({ ...newHandover, patientName: e.target.value })
                  }
                  placeholder="الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الملف الطبي *</Label>
                <Input
                  value={newHandover.mrn}
                  onChange={(e) =>
                    setNewHandover({ ...newHandover, mrn: e.target.value })
                  }
                  placeholder="MRN-XXXX-XXX"
                />
              </div>
              <div className="space-y-2">
                <Label>القسم *</Label>
                <Select
                  value={newHandover.department}
                  onValueChange={(value) =>
                    setNewHandover({ ...newHandover, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICU">العناية المركزة</SelectItem>
                    <SelectItem value="ER">الطوارئ</SelectItem>
                    <SelectItem value="الجراحة">الجراحة</SelectItem>
                    <SelectItem value="الباطنية">الباطنية</SelectItem>
                    <SelectItem value="الأطفال">الأطفال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المناوبة *</Label>
                <Select
                  value={newHandover.shift}
                  onValueChange={(value: 'morning' | 'evening' | 'night') =>
                    setNewHandover({ ...newHandover, shift: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">صباحي</SelectItem>
                    <SelectItem value="evening">مسائي</SelectItem>
                    <SelectItem value="night">ليلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SBAR Sections */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">
                    S
                  </span>
                  الموقف (Situation) *
                </Label>
                <Textarea
                  value={newHandover.situation}
                  onChange={(e) =>
                    setNewHandover({ ...newHandover, situation: e.target.value })
                  }
                  placeholder="ما هو الوضع الحالي للمريض؟"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">
                    B
                  </span>
                  الخلفية (Background) *
                </Label>
                <Textarea
                  value={newHandover.background}
                  onChange={(e) =>
                    setNewHandover({ ...newHandover, background: e.target.value })
                  }
                  placeholder="التاريخ المرضي، سبب الدخول، الحساسية..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">
                    A
                  </span>
                  التقييم (Assessment) *
                </Label>
                <Textarea
                  value={newHandover.assessment}
                  onChange={(e) =>
                    setNewHandover({ ...newHandover, assessment: e.target.value })
                  }
                  placeholder="العلامات الحيوية، الحالة العامة..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">
                    R
                  </span>
                  التوصيات (Recommendation) *
                </Label>
                <Textarea
                  value={newHandover.recommendation}
                  onChange={(e) =>
                    setNewHandover({ ...newHandover, recommendation: e.target.value })
                  }
                  placeholder="ما المطلوب عمله؟"
                  rows={2}
                />
              </div>
            </div>

            {/* Alerts & Tasks */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  تنبيهات حرجة (سطر لكل تنبيه)
                </Label>
                <Textarea
                  value={newHandover.criticalAlerts}
                  onChange={(e) =>
                    setNewHandover({ ...newHandover, criticalAlerts: e.target.value })
                  }
                  placeholder="مثال: حساسية من البنسلين&#10;خطر السقوط"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  مهام معلقة (سطر لكل مهمة)
                </Label>
                <Textarea
                  value={newHandover.pendingTasks}
                  onChange={(e) =>
                    setNewHandover({ ...newHandover, pendingTasks: e.target.value })
                  }
                  placeholder="مثال: تحليل دم الساعة 10&#10;زيارة الطبيب"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreateHandover}
              disabled={
                !newHandover.patientName ||
                !newHandover.mrn ||
                !newHandover.department ||
                !newHandover.situation ||
                !newHandover.background ||
                !newHandover.assessment ||
                !newHandover.recommendation
              }
            >
              إنشاء التسليم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Handover Dialog */}
      <Dialog
        open={!!selectedHandover}
        onOpenChange={() => setSelectedHandover(null)}
      >
        {selectedHandover && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>تفاصيل التسليم</DialogTitle>
                <Badge className={shiftLabels[selectedHandover.shift].color}>
                  {shiftLabels[selectedHandover.shift].label}
                </Badge>
              </div>
              <DialogDescription>
                {selectedHandover.patientName} - {selectedHandover.mrn}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* SBAR Display */}
              <div className="space-y-4">
                <SBARSection
                  letter="S"
                  title="الموقف (Situation)"
                  content={selectedHandover.situation}
                  icon={Stethoscope}
                />
                <SBARSection
                  letter="B"
                  title="الخلفية (Background)"
                  content={selectedHandover.background}
                  icon={FileText}
                />
                <SBARSection
                  letter="A"
                  title="التقييم (Assessment)"
                  content={selectedHandover.assessment}
                  icon={ClipboardList}
                />
                <SBARSection
                  letter="R"
                  title="التوصيات (Recommendation)"
                  content={selectedHandover.recommendation}
                  icon={MessageSquare}
                />
              </div>

              {/* Critical Alerts */}
              {selectedHandover.criticalAlerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    تنبيهات حرجة
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHandover.criticalAlerts.map((alert, i) => (
                      <Badge key={i} variant="destructive">
                        {alert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Tasks */}
              {selectedHandover.pendingTasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    مهام معلقة
                  </h4>
                  <ul className="space-y-1">
                    {selectedHandover.pendingTasks.map((task, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedHandover(null)}>
                إغلاق
              </Button>
              {selectedHandover.status === 'pending' && (
                <Button
                  onClick={() => {
                    handleAcknowledge(selectedHandover.id)
                    setSelectedHandover(null)
                  }}
                >
                  تأكيد الاستلام
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

function HandoverCard({
  handover,
  onAcknowledge,
  onComplete,
  onView,
}: {
  handover: Handover
  onAcknowledge: (id: string) => void
  onComplete: (id: string) => void
  onView: () => void
}) {
  const statusConfig = {
    pending: { label: 'في الانتظار', variant: 'secondary' as const },
    acknowledged: { label: 'تم الاستلام', variant: 'default' as const },
    completed: { label: 'مكتمل', variant: 'outline' as const },
  }

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md cursor-pointer',
        handover.status === 'pending' && 'border-amber-200'
      )}
      onClick={onView}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{handover.patientName}</CardTitle>
              <CardDescription>
                {handover.mrn} | {handover.department}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={shiftLabels[handover.shift].color}>
              {shiftLabels[handover.shift].label}
            </Badge>
            <Badge variant={statusConfig[handover.status].variant}>
              {statusConfig[handover.status].label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          <strong>الموقف:</strong> {handover.situation}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            من: {handover.fromNurse}
          </span>
          <span className="flex items-center gap-1">
            <ArrowLeftRight className="h-4 w-4" />
            إلى: {handover.toNurse || 'غير محدد'}
          </span>
        </div>
        {handover.criticalAlerts.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {handover.criticalAlerts.slice(0, 2).map((alert, i) => (
              <Badge key={i} variant="destructive" className="text-xs">
                {alert}
              </Badge>
            ))}
            {handover.criticalAlerts.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{handover.criticalAlerts.length - 2}
              </Badge>
            )}
          </div>
        )}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          {handover.status === 'pending' && (
            <Button size="sm" onClick={() => onAcknowledge(handover.id)}>
              تأكيد الاستلام
            </Button>
          )}
          {handover.status === 'acknowledged' && (
            <Button size="sm" onClick={() => onComplete(handover.id)}>
              إتمام التسليم
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SBARSection({
  letter,
  title,
  content,
  icon: Icon,
}: {
  letter: string
  title: string
  content: string
  icon: React.ElementType
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm text-primary-foreground font-bold">
          {letter}
        </span>
        <h4 className="font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </h4>
      </div>
      <p className="text-sm text-muted-foreground mr-11">{content}</p>
    </div>
  )
}
