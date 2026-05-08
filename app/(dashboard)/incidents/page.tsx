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
import { Checkbox } from '@/components/ui/checkbox'
import { IncidentReport, IncidentType, IncidentSeverity } from '@/types'
import {
  FileWarning,
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  Activity,
  Pill,
  Syringe,
  Bug,
  Wrench,
  MessageSquareWarning,
  Filter,
  Eye,
  Clock,
  User,
  MapPin,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const incidentTypeConfig: Record<IncidentType, {
  label: string
  icon: React.ElementType
  color: string
}> = {
  fall: { label: 'سقوط مريض', icon: TrendingDown, color: 'text-orange-600' },
  medication_error: { label: 'خطأ دوائي', icon: Pill, color: 'text-red-600' },
  pressure_ulcer: { label: 'قرحة الضغط', icon: Activity, color: 'text-purple-600' },
  infection: { label: 'عدوى', icon: Bug, color: 'text-green-600' },
  equipment_failure: { label: 'عطل معدات', icon: Wrench, color: 'text-blue-600' },
  needle_stick: { label: 'وخز إبرة', icon: Syringe, color: 'text-pink-600' },
  patient_complaint: { label: 'شكوى مريض', icon: MessageSquareWarning, color: 'text-amber-600' },
  other: { label: 'أخرى', icon: AlertTriangle, color: 'text-gray-600' },
}

const severityConfig: Record<IncidentSeverity, {
  label: string
  color: string
  bgColor: string
}> = {
  near_miss: { label: 'كاد أن يحدث', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  minor: { label: 'بسيط', color: 'text-green-600', bgColor: 'bg-green-100' },
  moderate: { label: 'متوسط', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  major: { label: 'كبير', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  catastrophic: { label: 'كارثي', color: 'text-red-600', bgColor: 'bg-red-100' },
}

const statusConfig = {
  reported: { label: 'تم الإبلاغ', color: 'bg-blue-500' },
  investigating: { label: 'قيد التحقيق', color: 'bg-amber-500' },
  resolved: { label: 'تم الحل', color: 'bg-green-500' },
  closed: { label: 'مغلق', color: 'bg-gray-500' },
}

// Sample data
const sampleIncidents: IncidentReport[] = [
  {
    id: '1',
    type: 'fall',
    severity: 'moderate',
    department: 'الباطنية',
    location: 'غرفة 205',
    dateTime: '2024-01-15T08:30:00.000Z',
    reportedBy: 'سارة محمد',
    reportedById: '1',
    patientInvolved: true,
    patientId: 'P001',
    patientName: 'أحمد علي',
    description: 'سقط المريض أثناء محاولته النهوض من السرير بدون مساعدة. تم العثور عليه على الأرض بجانب السرير.',
    immediateActions: 'تم فحص المريض فوراً، تم طلب أشعة على الحوض، تم رفع حواجز السرير',
    witnesses: ['نورة أحمد', 'محمد سعيد'],
    status: 'investigating',
  },
  {
    id: '2',
    type: 'medication_error',
    severity: 'near_miss',
    department: 'ICU',
    location: 'الوحدة الأولى',
    dateTime: '2024-01-15T14:00:00.000Z',
    reportedBy: 'فاطمة علي',
    reportedById: '2',
    patientInvolved: true,
    patientId: 'P002',
    patientName: 'خالد محمد',
    description: 'تم اكتشاف خطأ في جرعة الأنسولين قبل إعطائها للمريض. الجرعة المحضرة كانت ضعف الجرعة الموصوفة.',
    immediateActions: 'تم إيقاف الدواء فوراً، تم إبلاغ الطبيب، تم تصحيح الجرعة',
    witnesses: ['أحمد حسن'],
    status: 'resolved',
    rootCause: 'خطأ في قراءة الوصفة الطبية',
    correctiveActions: 'تم تفعيل نظام التحقق المزدوج من الجرعات',
  },
  {
    id: '3',
    type: 'equipment_failure',
    severity: 'major',
    department: 'غرف العمليات',
    location: 'غرفة العمليات 3',
    dateTime: '2024-01-14T16:45:00.000Z',
    reportedBy: 'محمد أحمد',
    reportedById: '3',
    patientInvolved: false,
    description: 'توقف جهاز التخدير فجأة أثناء عملية جراحية. تم الانتقال فوراً للجهاز الاحتياطي.',
    immediateActions: 'تم استبدال الجهاز فوراً، تم إبلاغ الصيانة، تم إكمال العملية بنجاح',
    witnesses: ['د. سعيد علي', 'فهد محمد'],
    status: 'closed',
    rootCause: 'عطل في المكون الإلكتروني',
    correctiveActions: 'تم سحب الجهاز للصيانة الشاملة، تم تحديث جدول الصيانة الوقائية',
  },
]

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentReport[]>(sampleIncidents)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null)
  const [newIncident, setNewIncident] = useState({
    type: '' as IncidentType | '',
    severity: '' as IncidentSeverity | '',
    department: '',
    location: '',
    patientInvolved: false,
    patientName: '',
    description: '',
    immediateActions: '',
    witnesses: '',
  })

  // Stats
  const totalIncidents = incidents.length
  const openIncidents = incidents.filter((i) => i.status !== 'closed').length
  const criticalIncidents = incidents.filter(
    (i) => i.severity === 'major' || i.severity === 'catastrophic'
  ).length

  const filteredIncidents = incidents.filter((i) => {
    const matchesSearch =
      i.description.includes(searchQuery) ||
      i.department.includes(searchQuery) ||
      (i.patientName?.includes(searchQuery) ?? false)
    const matchesType = filterType === 'all' || i.type === filterType
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateIncident = () => {
    if (!newIncident.type || !newIncident.severity || !newIncident.department) return

    const incident: IncidentReport = {
      id: Date.now().toString(),
      type: newIncident.type as IncidentType,
      severity: newIncident.severity as IncidentSeverity,
      department: newIncident.department,
      location: newIncident.location,
      dateTime: new Date().toISOString(),
      reportedBy: 'المستخدم الحالي',
      reportedById: 'current',
      patientInvolved: newIncident.patientInvolved,
      patientName: newIncident.patientName || undefined,
      description: newIncident.description,
      immediateActions: newIncident.immediateActions,
      witnesses: newIncident.witnesses.split('\n').filter((w) => w.trim()),
      status: 'reported',
    }

    setIncidents([incident, ...incidents])
    setIsDialogOpen(false)
    setNewIncident({
      type: '',
      severity: '',
      department: '',
      location: '',
      patientInvolved: false,
      patientName: '',
      description: '',
      immediateActions: '',
      witnesses: '',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تقارير الحوادث والسلامة</h1>
          <p className="text-muted-foreground">
            نظام الإبلاغ عن الحوادث ومتابعة إجراءات السلامة
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إبلاغ عن حادث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الحوادث</p>
                <p className="text-3xl font-bold">{totalIncidents}</p>
              </div>
              <FileWarning className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">حوادث مفتوحة</p>
                <p className="text-3xl font-bold text-amber-600">{openIncidents}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">حوادث كبيرة/كارثية</p>
                <p className="text-3xl font-bold text-red-600">{criticalIncidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">معدل الإغلاق</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalIncidents > 0
                    ? Math.round(
                        (incidents.filter((i) => i.status === 'closed').length /
                          totalIncidents) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="نوع الحادث" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {(Object.keys(incidentTypeConfig) as IncidentType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {incidentTypeConfig[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="reported">تم الإبلاغ</SelectItem>
                <SelectItem value="investigating">قيد التحقيق</SelectItem>
                <SelectItem value="resolved">تم الحل</SelectItem>
                <SelectItem value="closed">مغلق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد حوادث مطابقة للبحث
            </CardContent>
          </Card>
        ) : (
          filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onView={() => setSelectedIncident(incident)}
            />
          ))
        )}
      </div>

      {/* Create Incident Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5" />
              الإبلاغ عن حادث جديد
            </DialogTitle>
            <DialogDescription>
              يرجى ملء جميع المعلومات المطلوبة بدقة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Type & Severity */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>نوع الحادث *</Label>
                <Select
                  value={newIncident.type}
                  onValueChange={(value: IncidentType) =>
                    setNewIncident({ ...newIncident, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(incidentTypeConfig) as IncidentType[]).map((type) => {
                      const config = incidentTypeConfig[type]
                      const Icon = config.icon
                      return (
                        <SelectItem key={type} value={type}>
                          <span className="flex items-center gap-2">
                            <Icon className={cn('h-4 w-4', config.color)} />
                            {config.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>شدة الحادث *</Label>
                <Select
                  value={newIncident.severity}
                  onValueChange={(value: IncidentSeverity) =>
                    setNewIncident({ ...newIncident, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الشدة" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(severityConfig) as IncidentSeverity[]).map((sev) => (
                      <SelectItem key={sev} value={sev}>
                        <span className={severityConfig[sev].color}>
                          {severityConfig[sev].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>القسم *</Label>
                <Select
                  value={newIncident.department}
                  onValueChange={(value) =>
                    setNewIncident({ ...newIncident, department: value })
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
                    <SelectItem value="غرف العمليات">غرف العمليات</SelectItem>
                    <SelectItem value="الأطفال">الأطفال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الموقع المحدد</Label>
                <Input
                  value={newIncident.location}
                  onChange={(e) =>
                    setNewIncident({ ...newIncident, location: e.target.value })
                  }
                  placeholder="مثال: غرفة 205، السرير 2"
                />
              </div>
            </div>

            {/* Patient Involvement */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="patient-involved"
                  checked={newIncident.patientInvolved}
                  onCheckedChange={(checked) =>
                    setNewIncident({ ...newIncident, patientInvolved: checked as boolean })
                  }
                />
                <Label htmlFor="patient-involved">الحادث يتعلق بمريض</Label>
              </div>
              {newIncident.patientInvolved && (
                <div className="space-y-2">
                  <Label>اسم المريض</Label>
                  <Input
                    value={newIncident.patientName}
                    onChange={(e) =>
                      setNewIncident({ ...newIncident, patientName: e.target.value })
                    }
                    placeholder="اسم المريض"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>وصف الحادث *</Label>
              <Textarea
                value={newIncident.description}
                onChange={(e) =>
                  setNewIncident({ ...newIncident, description: e.target.value })
                }
                placeholder="اشرح ما حدث بالتفصيل..."
                rows={4}
              />
            </div>

            {/* Immediate Actions */}
            <div className="space-y-2">
              <Label>الإجراءات الفورية المتخذة *</Label>
              <Textarea
                value={newIncident.immediateActions}
                onChange={(e) =>
                  setNewIncident({ ...newIncident, immediateActions: e.target.value })
                }
                placeholder="ما الإجراءات التي تم اتخاذها فوراً؟"
                rows={3}
              />
            </div>

            {/* Witnesses */}
            <div className="space-y-2">
              <Label>الشهود (سطر لكل شاهد)</Label>
              <Textarea
                value={newIncident.witnesses}
                onChange={(e) =>
                  setNewIncident({ ...newIncident, witnesses: e.target.value })
                }
                placeholder="أسماء الشهود..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreateIncident}
              disabled={
                !newIncident.type ||
                !newIncident.severity ||
                !newIncident.department ||
                !newIncident.description ||
                !newIncident.immediateActions
              }
            >
              إرسال التقرير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Incident Dialog */}
      <Dialog
        open={!!selectedIncident}
        onOpenChange={() => setSelectedIncident(null)}
      >
        {selectedIncident && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const config = incidentTypeConfig[selectedIncident.type]
                    const Icon = config.icon
                    return (
                      <>
                        <Icon className={cn('h-5 w-5', config.color)} />
                        {config.label}
                      </>
                    )
                  })()}
                </DialogTitle>
                <Badge className={statusConfig[selectedIncident.status].color}>
                  {statusConfig[selectedIncident.status].label}
                </Badge>
              </div>
              <DialogDescription>
                تقرير رقم: {selectedIncident.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Severity & Info */}
              <div className="flex flex-wrap gap-4">
                <Badge
                  className={cn(
                    severityConfig[selectedIncident.severity].bgColor,
                    severityConfig[selectedIncident.severity].color
                  )}
                >
                  الشدة: {severityConfig[selectedIncident.severity].label}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selectedIncident.department} - {selectedIncident.location}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(selectedIncident.dateTime).toLocaleString('ar-EG')}
                </span>
              </div>

              {/* Patient Info */}
              {selectedIncident.patientInvolved && selectedIncident.patientName && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    معلومات المريض
                  </h4>
                  <p className="text-sm">{selectedIncident.patientName}</p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-semibold">وصف الحادث</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Immediate Actions */}
              <div className="space-y-2">
                <h4 className="font-semibold">الإجراءات الفورية</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedIncident.immediateActions}
                </p>
              </div>

              {/* Root Cause & Corrective Actions */}
              {selectedIncident.rootCause && (
                <div className="space-y-2">
                  <h4 className="font-semibold">السبب الجذري</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedIncident.rootCause}
                  </p>
                </div>
              )}
              {selectedIncident.correctiveActions && (
                <div className="space-y-2">
                  <h4 className="font-semibold">الإجراءات التصحيحية</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedIncident.correctiveActions}
                  </p>
                </div>
              )}

              {/* Witnesses */}
              {selectedIncident.witnesses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">الشهود</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.witnesses.map((witness, i) => (
                      <Badge key={i} variant="outline">
                        {witness}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reporter */}
              <div className="text-sm text-muted-foreground">
                أبلغ بواسطة: {selectedIncident.reportedBy}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedIncident(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

function IncidentCard({
  incident,
  onView,
}: {
  incident: IncidentReport
  onView: () => void
}) {
  const typeConfig = incidentTypeConfig[incident.type]
  const Icon = typeConfig.icon

  return (
    <Card
      className="transition-all hover:shadow-md cursor-pointer"
      onClick={onView}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted',
                typeConfig.color
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{typeConfig.label}</h3>
                <Badge
                  className={cn(
                    severityConfig[incident.severity].bgColor,
                    severityConfig[incident.severity].color,
                    'text-xs'
                  )}
                >
                  {severityConfig[incident.severity].label}
                </Badge>
                <Badge className={cn(statusConfig[incident.status].color, 'text-xs')}>
                  {statusConfig[incident.status].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {incident.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {incident.department}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(incident.dateTime).toLocaleDateString('ar-EG')}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {incident.reportedBy}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
