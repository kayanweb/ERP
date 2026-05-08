'use client'

import * as React from 'react'
import { Shield, AlertTriangle, Clock, Building2, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable, Column } from '@/components/ui/data-table'

// Demo data - will be replaced with Firebase
const isolationCases = [
  {
    id: '1',
    patientName: 'سارة علي',
    mrn: '123457',
    department: 'ICU 3rd',
    bedNumber: '302',
    isolationType: 'contact' as const,
    diagnosis: 'MRSA',
    startDate: '2024-01-10',
    status: 'active' as const,
    precautions: ['قفازات', 'عزل غرفة', 'ثوب واقي'],
  },
  {
    id: '2',
    patientName: 'خالد عبدالله',
    mrn: '123460',
    department: 'ICU 3rd',
    bedNumber: '308',
    isolationType: 'droplet' as const,
    diagnosis: 'COVID-19',
    startDate: '2024-01-12',
    status: 'active' as const,
    precautions: ['كمامة N95', 'نظارات واقية', 'عزل غرفة'],
  },
  {
    id: '3',
    patientName: 'سمية أحمد',
    mrn: '323459',
    department: 'ER',
    bedNumber: 'E04',
    isolationType: 'airborne' as const,
    diagnosis: 'السل',
    startDate: '2024-01-14',
    status: 'active' as const,
    precautions: ['غرفة ضغط سالب', 'كمامة N95', 'عزل تام'],
  },
  {
    id: '4',
    patientName: 'منى أحمد',
    mrn: '223458',
    department: 'PICU',
    bedNumber: 'P03',
    isolationType: 'contact' as const,
    diagnosis: 'VRE',
    startDate: '2024-01-08',
    status: 'active' as const,
    precautions: ['قفازات', 'ثوب واقي'],
  },
]

type IsolationCase = (typeof isolationCases)[0]

const isolationTypeConfig = {
  contact: { label: 'تلامسي', color: 'bg-warning/10 text-warning border-warning/20' },
  droplet: { label: 'رذاذي', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  airborne: { label: 'هوائي', color: 'bg-destructive/10 text-destructive border-destructive/20' },
}

export default function IsolationCasesPage() {
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = React.useState<string>('all')

  const filteredCases = React.useMemo(() => {
    return isolationCases.filter((c) => {
      if (typeFilter !== 'all' && c.isolationType !== typeFilter) return false
      if (departmentFilter !== 'all' && c.department !== departmentFilter) return false
      return true
    })
  }, [typeFilter, departmentFilter])

  const stats = {
    total: isolationCases.length,
    contact: isolationCases.filter((c) => c.isolationType === 'contact').length,
    droplet: isolationCases.filter((c) => c.isolationType === 'droplet').length,
    airborne: isolationCases.filter((c) => c.isolationType === 'airborne').length,
  }

  const columns: Column<IsolationCase>[] = [
    {
      key: 'patientName',
      header: 'المريض',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-destructive/10 text-destructive text-sm">
              <Shield className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.patientName}</p>
            <p className="text-xs text-muted-foreground">رقم الملف: {row.mrn}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'القسم',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.department}</p>
          <p className="text-xs text-muted-foreground">سرير {row.bedNumber}</p>
        </div>
      ),
    },
    {
      key: 'isolationType',
      header: 'نوع العزل',
      cell: (row) => (
        <Badge
          variant="outline"
          className={isolationTypeConfig[row.isolationType].color}
        >
          {isolationTypeConfig[row.isolationType].label}
        </Badge>
      ),
    },
    {
      key: 'diagnosis',
      header: 'التشخيص',
    },
    {
      key: 'startDate',
      header: 'تاريخ البدء',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {new Date(row.startDate).toLocaleDateString('ar-EG')}
        </div>
      ),
    },
    {
      key: 'precautions',
      header: 'الاحتياطات',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.precautions.slice(0, 2).map((p, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {p}
            </Badge>
          ))}
          {row.precautions.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{row.precautions.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">حالات العزل</h1>
        <p className="text-muted-foreground">متابعة وإدارة حالات العزل في المستشفى</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي الحالات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.contact}</p>
                <p className="text-sm text-muted-foreground">عزل تلامسي</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.droplet}</p>
                <p className="text-sm text-muted-foreground">عزل رذاذي</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.airborne}</p>
                <p className="text-sm text-muted-foreground">عزل هوائي</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            تصفية النتائج
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع العزل</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="contact">تلامسي</SelectItem>
                  <SelectItem value="droplet">رذاذي</SelectItem>
                  <SelectItem value="airborne">هوائي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">القسم</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  <SelectItem value="ICU 3rd">ICU 3rd</SelectItem>
                  <SelectItem value="ER">ER</SelectItem>
                  <SelectItem value="PICU">PICU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setTypeFilter('all')
                  setDepartmentFilter('all')
                }}
              >
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={filteredCases}
            searchKey="patientName"
            searchPlaceholder="البحث باسم المريض..."
            emptyMessage="لا توجد حالات عزل مطابقة للفلاتر"
          />
        </CardContent>
      </Card>
    </div>
  )
}
