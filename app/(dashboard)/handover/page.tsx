"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Loader2,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { handoverService, HandoverWithDetails } from "@/lib/services/handover.service"
import { patientsService } from "@/lib/services/patients.service"
import { employeesService } from "@/lib/services/employees.service"
import { departmentsService } from "@/lib/services/departments.service"
import type { PatientRecord, EmployeeRecord, Department, ShiftType } from "@/lib/repositories/contracts"

const shiftLabels = {
  morning: { label: "صباحي", color: "bg-amber-500" },
  evening: { label: "مسائي", color: "bg-blue-500" },
  night: { label: "ليلي", color: "bg-indigo-500" },
}

export default function HandoverPage() {
  const [handovers, setHandovers] = useState<HandoverWithDetails[]>([])
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterShift, setFilterShift] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedHandover, setSelectedHandover] = useState<HandoverWithDetails | null>(null)

  const [newHandover, setNewHandover] = useState({
    patientId: "",
    departmentId: "",
    fromNurseId: "",
    toNurseId: "",
    shift: "morning" as ShiftType,
    situation: "",
    background: "",
    assessment: "",
    recommendation: "",
    criticalAlerts: "",
    pendingTasks: "",
    medications: "",
    allergies: "",
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [handoversData, patientsData, employeesData, departmentsData] = await Promise.all([
        handoverService.getAll(),
        patientsService.getAdmitted(),
        employeesService.getAll(),
        departmentsService.getAll(),
      ])
      setHandovers(handoversData)
      setPatients(patientsData)
      setEmployees(employeesData)
      setDepartments(departmentsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const pendingHandovers = handovers.filter((h) => h.status === "pending")
  const acknowledgedHandovers = handovers.filter((h) => h.status === "acknowledged")
  const completedHandovers = handovers.filter((h) => h.status === "completed")

  const filteredHandovers = handovers.filter((h) => {
    const matchesSearch =
      h.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesShift = filterShift === "all" || h.shift === filterShift
    return matchesSearch && matchesShift
  })

  const handleAcknowledge = async (id: string) => {
    try {
      await handoverService.acknowledge(id)
      toast.success("تم تأكيد استلام التسليم")
      loadData()
    } catch (error) {
      console.error("Error acknowledging handover:", error)
      toast.error("حدث خطأ أثناء تأكيد الاستلام")
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await handoverService.complete(id)
      toast.success("تم إكمال التسليم بنجاح")
      loadData()
    } catch (error) {
      console.error("Error completing handover:", error)
      toast.error("حدث خطأ أثناء إكمال التسليم")
    }
  }

  const handleCreateHandover = async () => {
    if (!newHandover.patientId || !newHandover.fromNurseId || !newHandover.toNurseId) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    if (newHandover.fromNurseId === newHandover.toNurseId) {
      toast.error("لا يمكن التسليم لنفس الممرض")
      return
    }

    try {
      setSaving(true)
      const patient = patients.find((p) => p.id === newHandover.patientId)
      const fromNurse = employees.find((e) => e.id === newHandover.fromNurseId)
      const toNurse = employees.find((e) => e.id === newHandover.toNurseId)
      const department = departments.find((d) => d.id === newHandover.departmentId)

      await handoverService.create({
        patientId: newHandover.patientId,
        patientName: patient?.name || "",
        mrn: patient?.mrn || "",
        departmentId: newHandover.departmentId,
        departmentName: department?.name || "",
        fromNurseId: newHandover.fromNurseId,
        fromNurseName: fromNurse?.name || "",
        toNurseId: newHandover.toNurseId,
        toNurseName: toNurse?.name || "",
        shift: newHandover.shift,
        date: new Date().toISOString().split("T")[0],
        situation: newHandover.situation,
        background: newHandover.background,
        assessment: newHandover.assessment,
        recommendation: newHandover.recommendation,
        criticalAlerts: newHandover.criticalAlerts ? newHandover.criticalAlerts.split("\n").filter(Boolean) : undefined,
        pendingTasks: newHandover.pendingTasks ? newHandover.pendingTasks.split("\n").filter(Boolean) : undefined,
        medications: newHandover.medications ? newHandover.medications.split("\n").filter(Boolean) : undefined,
        allergies: newHandover.allergies ? newHandover.allergies.split("\n").filter(Boolean) : undefined,
        status: "pending",
      })

      toast.success("تم إنشاء تقرير التسليم بنجاح")
      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Error creating handover:", error)
      toast.error("حدث خطأ أثناء إنشاء تقرير التسليم")
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setNewHandover({
      patientId: "",
      departmentId: "",
      fromNurseId: "",
      toNurseId: "",
      shift: "morning",
      situation: "",
      background: "",
      assessment: "",
      recommendation: "",
      criticalAlerts: "",
      pendingTasks: "",
      medications: "",
      allergies: "",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تسليم المناوبة (SBAR)</h1>
          <p className="text-muted-foreground">نظام التواصل الموحد لتسليم المرضى بين المناوبات</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true) }} className="gap-2">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تسليم مريض جديد (SBAR)</DialogTitle>
            <DialogDescription>أدخل معلومات التسليم باستخدام نموذج SBAR</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Patient Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>القسم *</Label>
                <Select
                  value={newHandover.departmentId}
                  onValueChange={(value) => setNewHandover({ ...newHandover, departmentId: value, patientId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المريض *</Label>
                <Select
                  value={newHandover.patientId}
                  onValueChange={(value) => setNewHandover({ ...newHandover, patientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المريض" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients
                      .filter((p) => !newHandover.departmentId || p.departmentId === newHandover.departmentId)
                      .map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - {patient.mrn}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الممرض المسلم *</Label>
                <Select
                  value={newHandover.fromNurseId}
                  onValueChange={(value) => setNewHandover({ ...newHandover, fromNurseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الممرض" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter((e) => e.role === "nurse" || e.role === "senior_nurse" || e.role === "head_nurse")
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الممرض المستلم *</Label>
                <Select
                  value={newHandover.toNurseId}
                  onValueChange={(value) => setNewHandover({ ...newHandover, toNurseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الممرض" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter((e) => (e.role === "nurse" || e.role === "senior_nurse" || e.role === "head_nurse") && e.id !== newHandover.fromNurseId)
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المناوبة *</Label>
                <Select
                  value={newHandover.shift}
                  onValueChange={(value: ShiftType) => setNewHandover({ ...newHandover, shift: value })}
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
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">S</span>
                  الموقف (Situation) *
                </Label>
                <Textarea
                  value={newHandover.situation}
                  onChange={(e) => setNewHandover({ ...newHandover, situation: e.target.value })}
                  placeholder="ما هو الوضع الحالي للمريض؟"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">B</span>
                  الخلفية (Background) *
                </Label>
                <Textarea
                  value={newHandover.background}
                  onChange={(e) => setNewHandover({ ...newHandover, background: e.target.value })}
                  placeholder="التاريخ المرضي، سبب الدخول، الحساسية..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">A</span>
                  التقييم (Assessment) *
                </Label>
                <Textarea
                  value={newHandover.assessment}
                  onChange={(e) => setNewHandover({ ...newHandover, assessment: e.target.value })}
                  placeholder="العلامات الحيوية، الحالة العامة..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">R</span>
                  التوصيات (Recommendation) *
                </Label>
                <Textarea
                  value={newHandover.recommendation}
                  onChange={(e) => setNewHandover({ ...newHandover, recommendation: e.target.value })}
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
                  onChange={(e) => setNewHandover({ ...newHandover, criticalAlerts: e.target.value })}
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
                  onChange={(e) => setNewHandover({ ...newHandover, pendingTasks: e.target.value })}
                  placeholder="مثال: تحليل دم الساعة 10&#10;زيارة الطبيب"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>الأدوية الحالية (سطر لكل دواء)</Label>
                <Textarea
                  value={newHandover.medications}
                  onChange={(e) => setNewHandover({ ...newHandover, medications: e.target.value })}
                  placeholder="أدخل الأدوية..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>الحساسية (سطر لكل نوع)</Label>
                <Textarea
                  value={newHandover.allergies}
                  onChange={(e) => setNewHandover({ ...newHandover, allergies: e.target.value })}
                  placeholder="أدخل أنواع الحساسية..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleCreateHandover}
              disabled={
                saving ||
                !newHandover.patientId ||
                !newHandover.fromNurseId ||
                !newHandover.toNurseId ||
                !newHandover.situation ||
                !newHandover.background ||
                !newHandover.assessment ||
                !newHandover.recommendation
              }
            >
              {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              إنشاء التسليم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Handover Dialog */}
      <Dialog open={!!selectedHandover} onOpenChange={() => setSelectedHandover(null)}>
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
              {/* Transfer Info */}
              <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <User className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-medium">{selectedHandover.fromNurseName}</p>
                  <p className="text-xs text-muted-foreground">المسلم</p>
                </div>
                <ArrowLeftRight className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <User className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-medium">{selectedHandover.toNurseName}</p>
                  <p className="text-xs text-muted-foreground">المستلم</p>
                </div>
              </div>

              {/* SBAR Display */}
              <div className="space-y-4">
                <SBARSection letter="S" title="الموقف (Situation)" content={selectedHandover.situation} icon={Stethoscope} />
                <SBARSection letter="B" title="الخلفية (Background)" content={selectedHandover.background} icon={FileText} />
                <SBARSection letter="A" title="التقييم (Assessment)" content={selectedHandover.assessment} icon={ClipboardList} />
                <SBARSection letter="R" title="التوصيات (Recommendation)" content={selectedHandover.recommendation} icon={MessageSquare} />
              </div>

              {/* Critical Alerts */}
              {selectedHandover.criticalAlerts && selectedHandover.criticalAlerts.length > 0 && (
                <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h4 className="font-semibold text-destructive">تنبيهات حرجة</h4>
                  </div>
                  <ul className="space-y-1">
                    {selectedHandover.criticalAlerts.map((alert, i) => (
                      <li key={i} className="text-sm text-destructive flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pending Tasks */}
              {selectedHandover.pendingTasks && selectedHandover.pendingTasks.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">مهام معلقة</h4>
                  </div>
                  <ul className="space-y-1">
                    {selectedHandover.pendingTasks.map((task, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Allergies */}
              {selectedHandover.allergies && selectedHandover.allergies.length > 0 && (
                <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-700 mb-2">الحساسية</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHandover.allergies.map((allergy, i) => (
                      <Badge key={i} variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedHandover(null)}>إغلاق</Button>
              {selectedHandover.status === "pending" && (
                <Button onClick={() => { handleAcknowledge(selectedHandover.id); setSelectedHandover(null) }}>
                  تأكيد الاستلام
                </Button>
              )}
              {selectedHandover.status === "acknowledged" && (
                <Button onClick={() => { handleComplete(selectedHandover.id); setSelectedHandover(null) }}>
                  إكمال التسليم
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

// SBAR Section Component
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
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">
          {letter}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
    </div>
  )
}

// Handover Card Component
function HandoverCard({
  handover,
  onAcknowledge,
  onComplete,
  onView,
}: {
  handover: HandoverWithDetails
  onAcknowledge: (id: string) => void
  onComplete: (id: string) => void
  onView: () => void
}) {
  const statusConfig = {
    pending: { label: "في الانتظار", variant: "outline" as const, color: "text-amber-600 border-amber-300 bg-amber-50" },
    acknowledged: { label: "تم الاستلام", variant: "outline" as const, color: "text-blue-600 border-blue-300 bg-blue-50" },
    completed: { label: "مكتمل", variant: "outline" as const, color: "text-green-600 border-green-300 bg-green-50" },
  }

  return (
    <Card className={cn(handover.status === "pending" && "border-amber-200")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{handover.patientName}</CardTitle>
            <CardDescription>
              {handover.mrn} | {handover.departmentName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={shiftLabels[handover.shift].color}>
              {shiftLabels[handover.shift].label}
            </Badge>
            <Badge variant={statusConfig[handover.status].variant} className={statusConfig[handover.status].color}>
              {statusConfig[handover.status].label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>من: {handover.fromNurseName}</span>
          </div>
          <ArrowLeftRight className="h-4 w-4" />
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>إلى: {handover.toNurseName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(handover.date).toLocaleDateString("ar-SA")}</span>
          </div>
        </div>

        {/* Critical Alerts Preview */}
        {handover.criticalAlerts && handover.criticalAlerts.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-destructive/10 rounded text-destructive text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{handover.criticalAlerts.join(" | ")}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="h-4 w-4 ml-1" />
            عرض التفاصيل
          </Button>
          {handover.status === "pending" && (
            <Button size="sm" onClick={() => onAcknowledge(handover.id)}>
              <CheckCircle2 className="h-4 w-4 ml-1" />
              تأكيد الاستلام
            </Button>
          )}
          {handover.status === "acknowledged" && (
            <Button size="sm" variant="default" onClick={() => onComplete(handover.id)}>
              <CheckCircle2 className="h-4 w-4 ml-1" />
              إكمال التسليم
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
