"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  ArrowRight,
  Bed,
  Users,
  User,
  AlertTriangle,
  TrendingUp,
  Clock,
  Edit,
  Plus,
} from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatsCard } from "@/components/dashboard/stats-card"

// Mock department data - will be replaced with Firebase
const mockDepartmentData = {
  id: "icu",
  name: "العناية المركزة",
  nameEn: "Intensive Care Unit",
  totalBeds: 20,
  occupiedBeds: 18,
  totalStaff: 25,
  activeStaff: 22,
  patientsCount: 18,
  criticalCases: 5,
  isolationCases: 2,
  headNurse: "سارة أحمد",
  supervisor: "د. محمد علي",
  avgStayDays: 4.5,
  nurseToPatientRatio: "1:2",
}

const mockBeds = [
  { id: "ICU-01A", status: "occupied", patient: "أحمد محمد", condition: "حرج" },
  { id: "ICU-01B", status: "occupied", patient: "فاطمة حسن", condition: "مستقر" },
  { id: "ICU-02A", status: "available", patient: null, condition: null },
  { id: "ICU-02B", status: "occupied", patient: "عبدالله سعيد", condition: "حرج" },
  { id: "ICU-03A", status: "maintenance", patient: null, condition: null },
  { id: "ICU-03B", status: "occupied", patient: "مريم خالد", condition: "عزل" },
  { id: "ICU-04A", status: "occupied", patient: "محمد عبدالعزيز", condition: "مستقر" },
  { id: "ICU-04B", status: "available", patient: null, condition: null },
]

const mockStaff = [
  { id: "1", name: "سارة أحمد", role: "رئيسة تمريض", shift: "صباحي", status: "حاضر" },
  { id: "2", name: "نورة سعيد", role: "ممرضة", shift: "صباحي", status: "حاضر" },
  { id: "3", name: "ليلى عبدالرحمن", role: "ممرضة", shift: "صباحي", status: "حاضر" },
  { id: "4", name: "هدى محمد", role: "ممرضة", shift: "مسائي", status: "غير متاح" },
  { id: "5", name: "أمل علي", role: "مساعدة تمريض", shift: "صباحي", status: "إجازة" },
]

const mockPatients = [
  { id: "1", name: "أحمد محمد", bed: "ICU-01A", admissionDate: "2024-01-10", status: "حرج", nurse: "سارة أحمد" },
  { id: "2", name: "فاطمة حسن", bed: "ICU-01B", admissionDate: "2024-01-12", status: "مستقر", nurse: "نورة سعيد" },
  { id: "3", name: "عبدالله سعيد", bed: "ICU-02B", admissionDate: "2024-01-14", status: "حرج", nurse: "ليلى عبدالرحمن" },
  { id: "4", name: "مريم خالد", bed: "ICU-03B", admissionDate: "2024-01-08", status: "عزل", nurse: "سارة أحمد" },
]

export default function DepartmentDetailsPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("overview")

  const dept = mockDepartmentData
  const occupancyRate = Math.round((dept.occupiedBeds / dept.totalBeds) * 100)

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-primary"
      case "available":
        return "bg-emerald-500"
      case "maintenance":
        return "bg-amber-500"
      default:
        return "bg-gray-300"
    }
  }

  const getConditionBadge = (condition: string | null) => {
    if (!condition) return null
    switch (condition) {
      case "حرج":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">{condition}</Badge>
      case "مستقر":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">{condition}</Badge>
      case "عزل":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">{condition}</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{condition}</Badge>
    }
  }

  const getStaffStatusBadge = (status: string) => {
    switch (status) {
      case "حاضر":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{status}</Badge>
      case "غير متاح":
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">{status}</Badge>
      case "إجازة":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/departments" className="hover:text-foreground">
          الأقسام
        </Link>
        <ArrowRight className="h-4 w-4 rotate-180" />
        <span className="text-foreground">{dept.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dept.name}</h1>
          <p className="text-muted-foreground">{dept.nameEn}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 me-2" />
            تعديل
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 me-2" />
            إضافة مريض
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="نسبة الإشغال"
          value={`${occupancyRate}%`}
          icon={Bed}
          description={`${dept.occupiedBeds} من ${dept.totalBeds} سرير`}
          variant={occupancyRate > 85 ? "danger" : occupancyRate > 70 ? "warning" : "default"}
        />
        <StatsCard
          title="عدد المرضى"
          value={dept.patientsCount}
          icon={User}
          description={`${dept.criticalCases} حالة حرجة`}
        />
        <StatsCard
          title="الطاقم الحالي"
          value={dept.activeStaff}
          icon={Users}
          description={`من ${dept.totalStaff} موظف`}
        />
        <StatsCard
          title="نسبة التمريض"
          value={dept.nurseToPatientRatio}
          icon={TrendingUp}
          description="ممرضة لكل مريض"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="beds">الأسرّة</TabsTrigger>
          <TabsTrigger value="patients">المرضى</TabsTrigger>
          <TabsTrigger value="staff">الطاقم</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Department Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات القسم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">رئيسة التمريض</span>
                  <span className="font-medium">{dept.headNurse}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المشرف الطبي</span>
                  <span className="font-medium">{dept.supervisor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">متوسط مدة الإقامة</span>
                  <span className="font-medium">{dept.avgStayDays} أيام</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">حالات العزل</span>
                  <Badge variant="outline">{dept.isolationCases}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Occupancy Chart */}
            <Card>
              <CardHeader>
                <CardTitle>نسبة الإشغال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>الأسرّة المشغولة</span>
                    <span className="font-medium">{dept.occupiedBeds} / {dept.totalBeds}</span>
                  </div>
                  <Progress value={occupancyRate} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{dept.occupiedBeds}</div>
                    <div className="text-xs text-muted-foreground">مشغول</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{dept.totalBeds - dept.occupiedBeds}</div>
                    <div className="text-xs text-muted-foreground">متاح</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">1</div>
                    <div className="text-xs text-muted-foreground">صيانة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Beds Tab */}
        <TabsContent value="beds">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  خريطة الأسرّة
                </span>
                <div className="flex items-center gap-4 text-sm font-normal">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span>مشغول</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                    <span>متاح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span>صيانة</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mockBeds.map((bed) => (
                  <div
                    key={bed.id}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      bed.status === "occupied"
                        ? "border-primary/30 bg-primary/5"
                        : bed.status === "available"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-amber-500/30 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium">{bed.id}</span>
                      <div className={`h-2.5 w-2.5 rounded-full ${getBedStatusColor(bed.status)}`}></div>
                    </div>
                    {bed.patient ? (
                      <div>
                        <p className="text-sm font-medium truncate">{bed.patient}</p>
                        {getConditionBadge(bed.condition)}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {bed.status === "maintenance" ? "تحت الصيانة" : "متاح"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                المرضى الحاليون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المريض</TableHead>
                    <TableHead>السرير</TableHead>
                    <TableHead>تاريخ الدخول</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الممرضة المسؤولة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {patient.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{patient.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{patient.bed}</TableCell>
                      <TableCell>{patient.admissionDate}</TableCell>
                      <TableCell>{getConditionBadge(patient.status)}</TableCell>
                      <TableCell>{patient.nurse}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                طاقم القسم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>الدور الوظيفي</TableHead>
                    <TableHead>الوردية</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {staff.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{staff.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.shift}</Badge>
                      </TableCell>
                      <TableCell>{getStaffStatusBadge(staff.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
