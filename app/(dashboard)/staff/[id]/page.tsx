"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  ArrowRight,
  Calendar,
  Clock,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

// Mock staff data - will be replaced with Firebase
const mockStaffData = {
  id: "1",
  name: "سارة أحمد",
  nameEn: "Sara Ahmed",
  role: "رئيسة تمريض",
  department: "العناية المركزة",
  employeeId: "NRS-001",
  email: "sara.ahmed@hospital.com",
  phone: "+966 50 123 4567",
  joinDate: "2020-03-15",
  status: "active",
  shift: "صباحي",
  address: "الرياض، المملكة العربية السعودية",
  specialization: "العناية المركزة",
  certifications: ["BLS", "ACLS", "PALS"],
}

const mockAttendanceHistory = [
  { date: "2024-01-15", checkIn: "07:00", checkOut: "15:00", status: "حاضر", hours: 8 },
  { date: "2024-01-14", checkIn: "07:05", checkOut: "15:10", status: "حاضر", hours: 8 },
  { date: "2024-01-13", checkIn: "-", checkOut: "-", status: "إجازة", hours: 0 },
  { date: "2024-01-12", checkIn: "07:00", checkOut: "15:00", status: "حاضر", hours: 8 },
  { date: "2024-01-11", checkIn: "07:15", checkOut: "15:00", status: "متأخر", hours: 8 },
]

const mockShiftHistory = [
  { date: "2024-01-15", shift: "صباحي", department: "العناية المركزة", supervisor: "د. محمد علي" },
  { date: "2024-01-14", shift: "صباحي", department: "العناية المركزة", supervisor: "د. محمد علي" },
  { date: "2024-01-12", shift: "صباحي", department: "الطوارئ", supervisor: "د. فاطمة حسن" },
  { date: "2024-01-11", shift: "مسائي", department: "العناية المركزة", supervisor: "د. أحمد سعيد" },
]

export default function StaffDetailsPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("overview")

  const staff = mockStaffData

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">نشط</Badge>
      case "inactive":
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">غير نشط</Badge>
      case "on_leave":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">في إجازة</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case "حاضر":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{status}</Badge>
      case "غائب":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">{status}</Badge>
      case "متأخر":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{status}</Badge>
      case "إجازة":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {staff.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{staff.name}</h1>
            <p className="text-muted-foreground">{staff.role} - {staff.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(staff.status)}
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 me-2" />
            تعديل
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="attendance">الحضور</TabsTrigger>
          <TabsTrigger value="shifts">المناوبات</TabsTrigger>
          <TabsTrigger value="documents">المستندات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">رقم الموظف</span>
                  <span className="font-medium">{staff.employeeId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الاسم بالإنجليزية</span>
                  <span className="font-medium">{staff.nameEn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">التخصص</span>
                  <span className="font-medium">{staff.specialization}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاريخ الالتحاق</span>
                  <span className="font-medium">{staff.joinDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  معلومات التواصل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span dir="ltr">{staff.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  معلومات العمل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">القسم</span>
                  <span className="font-medium">{staff.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الدور الوظيفي</span>
                  <span className="font-medium">{staff.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الوردية الحالية</span>
                  <Badge variant="outline">{staff.shift}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  الشهادات والتراخيص
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {staff.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-sm">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                سجل الحضور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>وقت الدخول</TableHead>
                    <TableHead>وقت الخروج</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>ساعات العمل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttendanceHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell dir="ltr" className="text-end">{record.checkIn}</TableCell>
                      <TableCell dir="ltr" className="text-end">{record.checkOut}</TableCell>
                      <TableCell>{getAttendanceStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.hours} ساعات</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shifts Tab */}
        <TabsContent value="shifts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                سجل المناوبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوردية</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>المشرف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockShiftHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.shift}</Badge>
                      </TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{record.supervisor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                المستندات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد مستندات مرفوعة</p>
                <Button variant="outline" className="mt-4">
                  رفع مستند جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
