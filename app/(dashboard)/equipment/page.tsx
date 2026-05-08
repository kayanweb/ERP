'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Equipment, EquipmentStatus } from '@/types'
import {
  Wrench,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  MapPin,
  Calendar,
  BarChart3,
  Filter,
  Download,
  QrCode,
  Edit,
  Trash2,
} from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const statusConfig: Record<EquipmentStatus, {
  label: string
  color: string
  bgColor: string
}> = {
  available: { label: 'متاح', color: 'text-green-600', bgColor: 'bg-green-100' },
  in_use: { label: 'قيد الاستخدام', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  maintenance: { label: 'صيانة', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  broken: { label: 'معطل', color: 'text-red-600', bgColor: 'bg-red-100' },
  retired: { label: 'خارج الخدمة', color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

// Sample data
const sampleEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Ventilator',
    nameAr: 'جهاز تنفس صناعي',
    serialNumber: 'VNT-2024-001',
    category: 'أجهزة تنفسية',
    department: 'ICU',
    location: 'غرفة 301',
    status: 'in_use',
    lastMaintenance: '2024-01-01',
    nextMaintenance: '2024-04-01',
    purchaseDate: '2022-06-15',
    warrantyExpiry: '2025-06-15',
    assignedTo: 'المريض أحمد محمد',
  },
  {
    id: '2',
    name: 'Infusion Pump',
    nameAr: 'مضخة تسريب',
    serialNumber: 'INF-2024-015',
    category: 'مضخات',
    department: 'الجراحة',
    location: 'غرفة 205',
    status: 'available',
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-03-15',
    purchaseDate: '2023-01-20',
    warrantyExpiry: '2026-01-20',
  },
  {
    id: '3',
    name: 'Patient Monitor',
    nameAr: 'جهاز مراقبة المريض',
    serialNumber: 'MON-2024-008',
    category: 'أجهزة مراقبة',
    department: 'الطوارئ',
    location: 'غرفة الإنعاش',
    status: 'maintenance',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-01-25',
    purchaseDate: '2021-08-10',
    warrantyExpiry: '2024-08-10',
    notes: 'في انتظار قطع غيار',
  },
  {
    id: '4',
    name: 'Defibrillator',
    nameAr: 'جهاز صدمات القلب',
    serialNumber: 'DEF-2024-003',
    category: 'أجهزة طوارئ',
    department: 'الطوارئ',
    location: 'عربة الإنعاش',
    status: 'available',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-02-05',
    purchaseDate: '2023-03-01',
    warrantyExpiry: '2028-03-01',
  },
  {
    id: '5',
    name: 'ECG Machine',
    nameAr: 'جهاز تخطيط القلب',
    serialNumber: 'ECG-2024-012',
    category: 'أجهزة تشخيصية',
    department: 'الباطنية',
    location: 'غرفة الفحص',
    status: 'broken',
    lastMaintenance: '2023-11-20',
    purchaseDate: '2020-05-15',
    warrantyExpiry: '2023-05-15',
    notes: 'يحتاج استبدال',
  },
]

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>(sampleEquipment)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Stats
  const totalEquipment = equipment.length
  const availableCount = equipment.filter((e) => e.status === 'available').length
  const inUseCount = equipment.filter((e) => e.status === 'in_use').length
  const maintenanceCount = equipment.filter(
    (e) => e.status === 'maintenance' || e.status === 'broken'
  ).length
  const upcomingMaintenance = equipment.filter((e) => {
    if (!e.nextMaintenance) return false
    const daysUntil = Math.ceil(
      (new Date(e.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysUntil <= 7 && daysUntil >= 0
  }).length

  const filteredEquipment = equipment.filter((e) => {
    const matchesSearch =
      e.nameAr.includes(searchQuery) ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.serialNumber.includes(searchQuery)
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus
    const matchesDepartment = filterDepartment === 'all' || e.department === filterDepartment
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const departments = [...new Set(equipment.map((e) => e.department))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المعدات الطبية</h1>
          <p className="text-muted-foreground">
            تتبع وإدارة جميع المعدات والأجهزة الطبية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة معدة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المعدات</p>
                <p className="text-2xl font-bold">{totalEquipment}</p>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متاحة</p>
                <p className="text-2xl font-bold text-green-600">{availableCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد الاستخدام</p>
                <p className="text-2xl font-bold text-blue-600">{inUseCount}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صيانة/معطل</p>
                <p className="text-2xl font-bold text-amber-600">{maintenanceCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صيانة قريبة</p>
                <p className="text-2xl font-bold text-purple-600">{upcomingMaintenance}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
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
                placeholder="بحث بالاسم أو الرقم التسلسلي..."
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
                {(Object.keys(statusConfig) as EquipmentStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusConfig[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المعدات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المعدة</TableHead>
                  <TableHead>الرقم التسلسلي</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الصيانة القادمة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد معدات مطابقة
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEquipment(item)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.nameAr}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            statusConfig[item.status].bgColor,
                            statusConfig[item.status].color
                          )}
                        >
                          {statusConfig[item.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.nextMaintenance ? (
                          <span className="text-sm">
                            {new Date(item.nextMaintenance).toLocaleDateString('ar-EG')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setSelectedEquipment(item)}>عرض</Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-3 w-3"/></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Equipment Dialog */}
      <Dialog
        open={!!selectedEquipment}
        onOpenChange={() => setSelectedEquipment(null)}
      >
        {selectedEquipment && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedEquipment.nameAr}</DialogTitle>
              <DialogDescription>{selectedEquipment.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Badge
                  className={cn(
                    statusConfig[selectedEquipment.status].bgColor,
                    statusConfig[selectedEquipment.status].color,
                    'text-sm'
                  )}
                >
                  {statusConfig[selectedEquipment.status].label}
                </Badge>
                <Button variant="outline" size="sm" className="gap-1">
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>
              </div>

              <div className="grid gap-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">الرقم التسلسلي</p>
                    <p className="font-mono">{selectedEquipment.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الفئة</p>
                    <p>{selectedEquipment.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">القسم</p>
                    <p>{selectedEquipment.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الموقع</p>
                    <p>{selectedEquipment.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">تاريخ الشراء</p>
                    <p>
                      {new Date(selectedEquipment.purchaseDate).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">انتهاء الضمان</p>
                    <p>
                      {selectedEquipment.warrantyExpiry
                        ? new Date(selectedEquipment.warrantyExpiry).toLocaleDateString('ar-EG')
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">آخر صيانة</p>
                    <p>
                      {selectedEquipment.lastMaintenance
                        ? new Date(selectedEquipment.lastMaintenance).toLocaleDateString('ar-EG')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الصيانة القادمة</p>
                    <p>
                      {selectedEquipment.nextMaintenance
                        ? new Date(selectedEquipment.nextMaintenance).toLocaleDateString('ar-EG')
                        : '-'}
                    </p>
                  </div>
                </div>
                {selectedEquipment.assignedTo && (
                  <div>
                    <p className="text-muted-foreground">مخصص لـ</p>
                    <p>{selectedEquipment.assignedTo}</p>
                  </div>
                )}
                {selectedEquipment.notes && (
                  <div>
                    <p className="text-muted-foreground">ملاحظات</p>
                    <p>{selectedEquipment.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEquipment(null)}>
                إغلاق
              </Button>
              <Button>تعديل</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
