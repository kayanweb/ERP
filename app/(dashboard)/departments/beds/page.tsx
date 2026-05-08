'use client'

import * as React from 'react'
import { Bed, User, AlertTriangle, Shield, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// Demo data - will be replaced with Firebase
type BedStatus = 'available' | 'occupied' | 'isolation' | 'maintenance'

interface BedData {
  id: string
  number: string
  status: BedStatus
  patient?: {
    name: string
    mrn: string
    diagnosis?: string
    isolationType?: 'contact' | 'droplet' | 'airborne'
  }
}

const departmentBeds: Record<string, BedData[]> = {
  'ICU 3rd': [
    { id: '1', number: '301', status: 'occupied', patient: { name: 'أحمد محمد', mrn: '123456', diagnosis: 'ذات الرئة' } },
    { id: '2', number: '302', status: 'isolation', patient: { name: 'سارة علي', mrn: '123457', isolationType: 'contact' } },
    { id: '3', number: '303', status: 'available' },
    { id: '4', number: '304', status: 'occupied', patient: { name: 'محمد حسن', mrn: '123458', diagnosis: 'قصور قلب' } },
    { id: '5', number: '305', status: 'maintenance' },
    { id: '6', number: '306', status: 'available' },
    { id: '7', number: '307', status: 'occupied', patient: { name: 'فاطمة أحمد', mrn: '123459', diagnosis: 'سكتة دماغية' } },
    { id: '8', number: '308', status: 'isolation', patient: { name: 'خالد عبدالله', mrn: '123460', isolationType: 'droplet' } },
    { id: '9', number: '309', status: 'available' },
    { id: '10', number: '310', status: 'available' },
    { id: '11', number: '311', status: 'occupied', patient: { name: 'نورة سعيد', mrn: '123461', diagnosis: 'فشل كلوي' } },
    { id: '12', number: '312', status: 'available' },
    { id: '13', number: '313', status: 'occupied', patient: { name: 'عمر سعيد', mrn: '123462', diagnosis: 'حادث سير' } },
    { id: '14', number: '314', status: 'available' },
    { id: '15', number: '315', status: 'occupied', patient: { name: 'ريم أحمد', mrn: '123463', diagnosis: 'تسمم' } },
  ],
  'CCU': [
    { id: '1', number: '401', status: 'occupied', patient: { name: 'علي حسن', mrn: '223456', diagnosis: 'جلطة قلبية' } },
    { id: '2', number: '402', status: 'available' },
    { id: '3', number: '403', status: 'occupied', patient: { name: 'منى أحمد', mrn: '223457', diagnosis: 'قصور قلب' } },
    { id: '4', number: '404', status: 'available' },
    { id: '5', number: '405', status: 'available' },
    { id: '6', number: '406', status: 'available' },
    { id: '7', number: '407', status: 'available' },
    { id: '8', number: '408', status: 'available' },
    { id: '9', number: '409', status: 'available' },
    { id: '10', number: '410', status: 'maintenance' },
    { id: '11', number: '411', status: 'available' },
  ],
  'ER': [
    { id: '1', number: 'E01', status: 'occupied', patient: { name: 'ياسر خالد', mrn: '323456' } },
    { id: '2', number: 'E02', status: 'occupied', patient: { name: 'هالة محمد', mrn: '323457' } },
    { id: '3', number: 'E03', status: 'occupied', patient: { name: 'زياد علي', mrn: '323458' } },
    { id: '4', number: 'E04', status: 'isolation', patient: { name: 'سمية أحمد', mrn: '323459', isolationType: 'airborne' } },
    { id: '5', number: 'E05', status: 'occupied', patient: { name: 'عادل محمود', mrn: '323460' } },
    { id: '6', number: 'E06', status: 'occupied', patient: { name: 'مريم سالم', mrn: '323461' } },
    { id: '7', number: 'E07', status: 'occupied', patient: { name: 'كريم أحمد', mrn: '323462' } },
    { id: '8', number: 'E08', status: 'occupied', patient: { name: 'لينا عمر', mrn: '323463' } },
    { id: '9', number: 'E09', status: 'available' },
    { id: '10', number: 'E10', status: 'occupied', patient: { name: 'طارق حسين', mrn: '323464' } },
    { id: '11', number: 'E11', status: 'occupied', patient: { name: 'سلمى خالد', mrn: '323465' } },
  ],
}

const departments = Object.keys(departmentBeds)

const statusConfig: Record<BedStatus, { label: string; color: string; bgColor: string }> = {
  available: { label: 'متاح', color: 'text-success', bgColor: 'bg-success/10 border-success/30' },
  occupied: { label: 'مشغول', color: 'text-primary', bgColor: 'bg-primary/10 border-primary/30' },
  isolation: { label: 'عزل', color: 'text-destructive', bgColor: 'bg-destructive/10 border-destructive/30' },
  maintenance: { label: 'صيانة', color: 'text-muted-foreground', bgColor: 'bg-muted border-muted-foreground/30' },
}

export default function BedManagementPage() {
  const [selectedDepartment, setSelectedDepartment] = React.useState(departments[0])
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const beds = departmentBeds[selectedDepartment] || []

  const filteredBeds = React.useMemo(() => {
    if (statusFilter === 'all') return beds
    return beds.filter((bed) => bed.status === statusFilter)
  }, [beds, statusFilter])

  const stats = {
    total: beds.length,
    available: beds.filter((b) => b.status === 'available').length,
    occupied: beds.filter((b) => b.status === 'occupied').length,
    isolation: beds.filter((b) => b.status === 'isolation').length,
    maintenance: beds.filter((b) => b.status === 'maintenance').length,
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة الأسرة</h1>
            <p className="text-muted-foreground">عرض مرئي لحالة الأسرة في كل قسم</p>
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">إجمالي</p>
            </CardContent>
          </Card>
          <Card className="border-success/30 bg-success/5">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-success">{stats.available}</p>
              <p className="text-sm text-muted-foreground">متاح</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-primary">{stats.occupied}</p>
              <p className="text-sm text-muted-foreground">مشغول</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-destructive">{stats.isolation}</p>
              <p className="text-sm text-muted-foreground">عزل</p>
            </CardContent>
          </Card>
          <Card className="border-muted-foreground/30">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-muted-foreground">{stats.maintenance}</p>
              <p className="text-sm text-muted-foreground">صيانة</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">تصفية:</span>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                الكل
              </Button>
              <Button
                variant={statusFilter === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('available')}
                className={statusFilter === 'available' ? '' : 'text-success border-success/30'}
              >
                متاح
              </Button>
              <Button
                variant={statusFilter === 'occupied' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('occupied')}
                className={statusFilter === 'occupied' ? '' : 'text-primary border-primary/30'}
              >
                مشغول
              </Button>
              <Button
                variant={statusFilter === 'isolation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('isolation')}
                className={statusFilter === 'isolation' ? '' : 'text-destructive border-destructive/30'}
              >
                عزل
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bed Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              {selectedDepartment}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredBeds.map((bed) => (
                <Tooltip key={bed.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-all hover:scale-105',
                        statusConfig[bed.status].bgColor
                      )}
                    >
                      <span className="font-bold text-lg">{bed.number}</span>
                      {bed.status === 'occupied' && (
                        <User className="h-4 w-4 text-primary mt-1" />
                      )}
                      {bed.status === 'isolation' && (
                        <Shield className="h-4 w-4 text-destructive mt-1" />
                      )}
                      {bed.status === 'available' && (
                        <Bed className="h-4 w-4 text-success mt-1" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-bold">سرير {bed.number}</p>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', statusConfig[bed.status].color)}
                      >
                        {statusConfig[bed.status].label}
                      </Badge>
                      {bed.patient && (
                        <div className="pt-2 border-t mt-2">
                          <p className="font-medium">{bed.patient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            رقم الملف: {bed.patient.mrn}
                          </p>
                          {bed.patient.diagnosis && (
                            <p className="text-xs">التشخيص: {bed.patient.diagnosis}</p>
                          )}
                          {bed.patient.isolationType && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              {bed.patient.isolationType === 'contact' && 'عزل تلامسي'}
                              {bed.patient.isolationType === 'droplet' && 'عزل رذاذي'}
                              {bed.patient.isolationType === 'airborne' && 'عزل هوائي'}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-6">
              {Object.entries(statusConfig).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={cn('w-4 h-4 rounded border-2', config.bgColor)} />
                  <span className="text-sm">{config.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
