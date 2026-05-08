"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Plus,
  User,
  Bed,
  Calendar,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatsCard } from "@/components/dashboard/stats-card"

// Mock patients data - will be replaced with Firebase
const mockPatients = [
  {
    id: "1",
    name: "أحمد محمد علي",
    mrn: "MRN-001234",
    age: 45,
    gender: "ذكر",
    department: "العناية المركزة",
    room: "ICU-01",
    bed: "A",
    admissionDate: "2024-01-10",
    diagnosis: "التهاب رئوي حاد",
    status: "critical",
    attendingNurse: "سارة أحمد",
    isolation: false,
  },
  {
    id: "2",
    name: "فاطمة حسن محمود",
    mrn: "MRN-001235",
    age: 62,
    gender: "أنثى",
    department: "الباطنية",
    room: "201",
    bed: "B",
    admissionDate: "2024-01-12",
    diagnosis: "داء السكري - مضاعفات",
    status: "stable",
    attendingNurse: "نورة سعيد",
    isolation: false,
  },
  {
    id: "3",
    name: "عبدالله سعيد",
    mrn: "MRN-001236",
    age: 28,
    gender: "ذكر",
    department: "الجراحة",
    room: "305",
    bed: "A",
    admissionDate: "2024-01-14",
    diagnosis: "ما بعد عملية الزائدة",
    status: "recovering",
    attendingNurse: "ليلى عبدالرحمن",
    isolation: false,
  },
  {
    id: "4",
    name: "مريم خالد",
    mrn: "MRN-001237",
    age: 55,
    gender: "أنثى",
    department: "العناية المركزة",
    room: "ICU-03",
    bed: "A",
    admissionDate: "2024-01-08",
    diagnosis: "كوفيد-19",
    status: "critical",
    attendingNurse: "سارة أحمد",
    isolation: true,
  },
  {
    id: "5",
    name: "محمد عبدالعزيز",
    mrn: "MRN-001238",
    age: 70,
    gender: "ذكر",
    department: "القلب",
    room: "401",
    bed: "A",
    admissionDate: "2024-01-11",
    diagnosis: "قصور في القلب",
    status: "stable",
    attendingNurse: "هدى محمد",
    isolation: false,
  },
]

const departments = [
  "جميع الأقسام",
  "العناية المركزة",
  "الباطنية",
  "الجراحة",
  "القلب",
  "الأطفال",
  "الطوارئ",
]

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("جميع الأقسام")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredPatients = mockPatients.filter((patient) => {
    const matchesSearch =
      patient.name.includes(searchTerm) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === "جميع الأقسام" || patient.department === selectedDepartment
    const matchesStatus =
      statusFilter === "all" || patient.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            حرج
          </Badge>
        )
      case "stable":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            مستقر
          </Badge>
        )
      case "recovering":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            في التعافي
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Calculate stats
  const totalPatients = mockPatients.length
  const criticalPatients = mockPatients.filter((p) => p.status === "critical").length
  const isolationPatients = mockPatients.filter((p) => p.isolation).length
  const icuPatients = mockPatients.filter((p) => p.department === "العناية المركزة").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تتبع المرضى</h1>
          <p className="text-muted-foreground">
            إدارة ومتابعة حالات المرضى في جميع الأقسام
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 me-2" />
          إضافة مريض
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="إجمالي المرضى"
          value={totalPatients}
          icon={User}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="الحالات الحرجة"
          value={criticalPatients}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="حالات العزل"
          value={isolationPatients}
          icon={Bed}
          variant="warning"
        />
        <StatsCard
          title="العناية المركزة"
          value={icuPatients}
          icon={Bed}
          variant="default"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو رقم الملف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
                <SelectItem value="stable">مستقر</SelectItem>
                <SelectItem value="recovering">في التعافي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المرضى</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المريض</TableHead>
                  <TableHead>رقم الملف</TableHead>
                  <TableHead>القسم / الغرفة</TableHead>
                  <TableHead>التشخيص</TableHead>
                  <TableHead>تاريخ الدخول</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الممرضة المسؤولة</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {patient.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {patient.name}
                            {patient.isolation && (
                              <Badge variant="destructive" className="text-xs">
                                عزل
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {patient.age} سنة - {patient.gender}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {patient.mrn}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patient.department}</div>
                        <div className="text-sm text-muted-foreground">
                          غرفة {patient.room} - سرير {patient.bed}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {patient.diagnosis}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {patient.admissionDate}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell>{patient.attendingNurse}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 me-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 me-2" />
                            تعديل البيانات
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 me-2" />
                            السجل الطبي
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد نتائج مطابقة للبحث</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
