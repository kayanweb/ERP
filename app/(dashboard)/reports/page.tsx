'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus, Eye, FileText, Filter, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { DataTable, Column } from '@/components/ui/data-table'

// Demo data - will be replaced with Firebase
const reports = [
  {
    id: '1',
    date: '2024-01-15',
    shift: 'morning' as const,
    supervisor: 'أحمد محمد',
    status: 'approved' as const,
    totalPatients: 57,
    totalStaff: 45,
    createdAt: '2024-01-15T07:00:00Z',
  },
  {
    id: '2',
    date: '2024-01-15',
    shift: 'evening' as const,
    supervisor: 'سارة علي',
    status: 'submitted' as const,
    totalPatients: 62,
    totalStaff: 42,
    createdAt: '2024-01-15T15:00:00Z',
  },
  {
    id: '3',
    date: '2024-01-14',
    shift: 'night' as const,
    supervisor: 'محمد حسن',
    status: 'approved' as const,
    totalPatients: 55,
    totalStaff: 38,
    createdAt: '2024-01-14T23:00:00Z',
  },
  {
    id: '4',
    date: '2024-01-14',
    shift: 'morning' as const,
    supervisor: 'فاطمة أحمد',
    status: 'approved' as const,
    totalPatients: 58,
    totalStaff: 44,
    createdAt: '2024-01-14T07:00:00Z',
  },
  {
    id: '5',
    date: '2024-01-13',
    shift: 'evening' as const,
    supervisor: 'أحمد محمد',
    status: 'draft' as const,
    totalPatients: 54,
    totalStaff: 41,
    createdAt: '2024-01-13T15:00:00Z',
  },
]

type Report = (typeof reports)[0]

export default function ReportsArchivePage() {
  const [dateFilter, setDateFilter] = React.useState('')
  const [shiftFilter, setShiftFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const filteredReports = React.useMemo(() => {
    return reports.filter((report) => {
      if (dateFilter && !report.date.includes(dateFilter)) return false
      if (shiftFilter !== 'all' && report.shift !== shiftFilter) return false
      if (statusFilter !== 'all' && report.status !== statusFilter) return false
      return true
    })
  }, [dateFilter, shiftFilter, statusFilter])

  const columns: Column<Report>[] = [
    {
      key: 'date',
      header: 'التاريخ',
      cell: (row) => (
        <span className="font-medium">
          {new Date(row.date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'shift',
      header: 'الشفت',
      cell: (row) => <StatusBadge status={row.shift} />,
    },
    {
      key: 'supervisor',
      header: 'المشرف',
    },
    {
      key: 'totalPatients',
      header: 'المرضى',
    },
    {
      key: 'totalStaff',
      header: 'الكادر',
    },
    {
      key: 'status',
      header: 'الحالة',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/reports/${row.id}`}>
              <Eye className="h-4 w-4 ml-1" />
              عرض
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">أرشيف التقارير</h1>
          <p className="text-muted-foreground">
            عرض وإدارة جميع تقارير المناوبات
          </p>
        </div>
        <Button asChild>
          <Link href="/reports/create">
            <Plus className="h-4 w-4 ml-2" />
            تقرير جديد
          </Link>
        </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">التاريخ</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الشفت</label>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الشفتات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الشفتات</SelectItem>
                  <SelectItem value="morning">صباحي</SelectItem>
                  <SelectItem value="evening">مسائي</SelectItem>
                  <SelectItem value="night">ليلي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الحالة</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="submitted">مُرسل</SelectItem>
                  <SelectItem value="approved">معتمد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setDateFilter('')
                  setShiftFilter('all')
                  setStatusFilter('all')
                }}
              >
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={filteredReports}
            searchKey="supervisor"
            searchPlaceholder="البحث بالمشرف..."
            emptyMessage="لا توجد تقارير مطابقة للفلاتر المحددة"
          />
        </CardContent>
      </Card>
    </div>
  )
}
