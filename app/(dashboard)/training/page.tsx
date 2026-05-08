'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Training, StaffCertification } from '@/types'
import {
  GraduationCap,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Award,
  BookOpen,
  FileText,
  Download,
  Filter,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample Training Programs
const trainings: Training[] = [
  {
    id: '1',
    name: 'BLS Certification',
    nameAr: 'شهادة الإنعاش القلبي الأساسي',
    type: 'mandatory',
    duration: 8,
    validityPeriod: 24,
    provider: 'American Heart Association',
    description: 'تدريب إلزامي على الإنعاش القلبي الرئوي الأساسي',
  },
  {
    id: '2',
    name: 'ACLS Certification',
    nameAr: 'شهادة الإنعاش المتقدم',
    type: 'specialized',
    duration: 16,
    validityPeriod: 24,
    provider: 'American Heart Association',
    description: 'للعاملين في العناية المركزة والطوارئ',
  },
  {
    id: '3',
    name: 'Infection Control',
    nameAr: 'مكافحة العدوى',
    type: 'mandatory',
    duration: 4,
    validityPeriod: 12,
    provider: 'التعليم الطبي المستمر',
    description: 'تدريب على إجراءات مكافحة العدوى',
  },
  {
    id: '4',
    name: 'Fire Safety',
    nameAr: 'السلامة من الحرائق',
    type: 'mandatory',
    duration: 2,
    validityPeriod: 12,
    provider: 'إدارة السلامة',
    description: 'التعامل مع الحرائق وإجراءات الإخلاء',
  },
  {
    id: '5',
    name: 'Wound Care',
    nameAr: 'العناية بالجروح',
    type: 'optional',
    duration: 6,
    validityPeriod: 36,
    provider: 'التعليم الطبي المستمر',
    description: 'تدريب متقدم على العناية بالجروح',
  },
  {
    id: '6',
    name: 'IV Therapy',
    nameAr: 'العلاج الوريدي',
    type: 'mandatory',
    duration: 8,
    validityPeriod: 24,
    provider: 'التعليم الطبي المستمر',
    description: 'تركيب وإدارة العلاج الوريدي',
  },
]

// Sample Staff Certifications
const staffCertifications: StaffCertification[] = [
  {
    id: '1',
    staffId: 'S001',
    staffName: 'سارة محمد أحمد',
    trainingId: '1',
    trainingName: 'شهادة الإنعاش القلبي الأساسي',
    completedDate: '2023-06-15',
    expiryDate: '2025-06-15',
    status: 'valid',
  },
  {
    id: '2',
    staffId: 'S001',
    staffName: 'سارة محمد أحمد',
    trainingId: '3',
    trainingName: 'مكافحة العدوى',
    completedDate: '2024-01-10',
    expiryDate: '2025-01-10',
    status: 'valid',
  },
  {
    id: '3',
    staffId: 'S002',
    staffName: 'أحمد علي محمد',
    trainingId: '1',
    trainingName: 'شهادة الإنعاش القلبي الأساسي',
    completedDate: '2023-02-20',
    expiryDate: '2025-02-20',
    status: 'expiring_soon',
  },
  {
    id: '4',
    staffId: 'S002',
    staffName: 'أحمد علي محمد',
    trainingId: '2',
    trainingName: 'شهادة الإنعاش المتقدم',
    completedDate: '2022-08-15',
    expiryDate: '2024-08-15',
    status: 'expired',
  },
  {
    id: '5',
    staffId: 'S003',
    staffName: 'فاطمة خالد سعيد',
    trainingId: '1',
    trainingName: 'شهادة الإنعاش القلبي الأساسي',
    completedDate: '2024-01-05',
    expiryDate: '2026-01-05',
    status: 'valid',
  },
  {
    id: '6',
    staffId: 'S003',
    staffName: 'فاطمة خالد سعيد',
    trainingId: '4',
    trainingName: 'السلامة من الحرائق',
    completedDate: '2023-12-01',
    expiryDate: '2024-12-01',
    status: 'valid',
  },
  {
    id: '7',
    staffId: 'S004',
    staffName: 'محمد سعيد علي',
    trainingId: '3',
    trainingName: 'مكافحة العدوى',
    completedDate: '2023-11-15',
    expiryDate: '2024-11-15',
    status: 'valid',
  },
]

const typeConfig = {
  mandatory: { label: 'إلزامي', color: 'bg-red-100 text-red-700' },
  optional: { label: 'اختياري', color: 'bg-blue-100 text-blue-700' },
  specialized: { label: 'تخصصي', color: 'bg-purple-100 text-purple-700' },
}

const statusConfig = {
  valid: { label: 'سارية', color: 'text-green-600', bgColor: 'bg-green-100' },
  expiring_soon: { label: 'قريبة الانتهاء', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  expired: { label: 'منتهية', color: 'text-red-600', bgColor: 'bg-red-100' },
}

export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)

  // Stats
  const totalCertifications = staffCertifications.length
  const validCerts = staffCertifications.filter((c) => c.status === 'valid').length
  const expiringSoon = staffCertifications.filter((c) => c.status === 'expiring_soon').length
  const expiredCerts = staffCertifications.filter((c) => c.status === 'expired').length

  // Group certifications by staff
  const staffGroups = staffCertifications.reduce(
    (acc, cert) => {
      if (!acc[cert.staffId]) {
        acc[cert.staffId] = {
          staffId: cert.staffId,
          staffName: cert.staffName,
          certifications: [],
        }
      }
      acc[cert.staffId].certifications.push(cert)
      return acc
    },
    {} as Record<string, { staffId: string; staffName: string; certifications: StaffCertification[] }>
  )

  const filteredCertifications = staffCertifications.filter((cert) => {
    const matchesSearch = cert.staffName.includes(searchQuery) || cert.trainingName.includes(searchQuery)
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const filteredTrainings = trainings.filter((t) => {
    const matchesSearch = t.nameAr.includes(searchQuery) || t.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">التدريب والشهادات</h1>
          <p className="text-muted-foreground">
            متابعة برامج التدريب وشهادات الموظفين
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            إرسال تذكيرات
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            تسجيل شهادة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الشهادات</p>
                <p className="text-2xl font-bold">{totalCertifications}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">سارية</p>
                <p className="text-2xl font-bold text-green-600">{validCerts}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قريبة الانتهاء</p>
                <p className="text-2xl font-bold text-amber-600">{expiringSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">منتهية</p>
                <p className="text-2xl font-bold text-red-600">{expiredCerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(expiringSoon > 0 || expiredCerts > 0) && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات الشهادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {staffCertifications
                .filter((c) => c.status === 'expired' || c.status === 'expiring_soon')
                .map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-background border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {cert.staffName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{cert.staffName}</p>
                        <p className="text-xs text-muted-foreground">{cert.trainingName}</p>
                      </div>
                    </div>
                    <Badge className={cn(statusConfig[cert.status].bgColor, statusConfig[cert.status].color)}>
                      {statusConfig[cert.status].label}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="certifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="certifications">شهادات الموظفين</TabsTrigger>
          <TabsTrigger value="programs">برامج التدريب</TabsTrigger>
          <TabsTrigger value="by-staff">حسب الموظف</TabsTrigger>
        </TabsList>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="بحث بالاسم أو الشهادة..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="valid">سارية</SelectItem>
                    <SelectItem value="expiring_soon">قريبة الانتهاء</SelectItem>
                    <SelectItem value="expired">منتهية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>سجل الشهادات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>الشهادة</TableHead>
                    <TableHead>تاريخ الإتمام</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        لا توجد شهادات مطابقة
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCertifications.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {cert.staffName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{cert.staffName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{cert.trainingName}</TableCell>
                        <TableCell>
                          {new Date(cert.completedDate).toLocaleDateString('ar-EG')}
                        </TableCell>
                        <TableCell>
                          {new Date(cert.expiryDate).toLocaleDateString('ar-EG')}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(statusConfig[cert.status].bgColor, statusConfig[cert.status].color)}>
                            {statusConfig[cert.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="بحث عن برنامج تدريبي..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="mandatory">إلزامي</SelectItem>
                    <SelectItem value="optional">اختياري</SelectItem>
                    <SelectItem value="specialized">تخصصي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrainings.map((training) => (
              <Card
                key={training.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTraining(training)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <Badge className={typeConfig[training.type].color}>
                      {typeConfig[training.type].label}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{training.nameAr}</CardTitle>
                  <CardDescription>{training.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>المدة: {training.duration} ساعات</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>صلاحية: {training.validityPeriod} شهر</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{training.provider}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* By Staff Tab */}
        <TabsContent value="by-staff" className="space-y-4">
          {Object.values(staffGroups).map((staff) => {
            const validCount = staff.certifications.filter((c) => c.status === 'valid').length
            const totalMandatory = trainings.filter((t) => t.type === 'mandatory').length
            const completionRate = Math.round((validCount / totalMandatory) * 100)

            return (
              <Card key={staff.staffId}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {staff.staffName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{staff.staffName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {staff.certifications.length} شهادات
                        </p>
                      </div>
                    </div>
                    <div className="w-full md:w-64">
                      <div className="flex justify-between text-sm mb-1">
                        <span>نسبة الامتثال</span>
                        <span className={cn(completionRate >= 100 ? 'text-green-600' : 'text-amber-600')}>
                          {completionRate}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(completionRate, 100)}
                        className={cn(
                          'h-2',
                          completionRate >= 100 ? '[&>div]:bg-green-500' : '[&>div]:bg-amber-500'
                        )}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {staff.certifications.map((cert) => (
                      <Badge
                        key={cert.id}
                        variant="outline"
                        className={cn(
                          cert.status === 'valid' && 'border-green-300 text-green-700',
                          cert.status === 'expiring_soon' && 'border-amber-300 text-amber-700',
                          cert.status === 'expired' && 'border-red-300 text-red-700'
                        )}
                      >
                        {cert.trainingName}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>

      {/* Training Detail Dialog */}
      <Dialog open={!!selectedTraining} onOpenChange={() => setSelectedTraining(null)}>
        {selectedTraining && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTraining.nameAr}</DialogTitle>
              <DialogDescription>{selectedTraining.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge className={typeConfig[selectedTraining.type].color}>
                  {typeConfig[selectedTraining.type].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedTraining.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">المدة</p>
                  <p className="font-medium">{selectedTraining.duration} ساعات</p>
                </div>
                <div>
                  <p className="text-muted-foreground">صلاحية الشهادة</p>
                  <p className="font-medium">{selectedTraining.validityPeriod} شهر</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">الجهة المقدمة</p>
                  <p className="font-medium">{selectedTraining.provider}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTraining(null)}>
                إغلاق
              </Button>
              <Button>تسجيل موظف</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
