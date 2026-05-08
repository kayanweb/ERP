'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus, Eye, FileText, Filter, Download, RefreshCw, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { DataTable, Column } from '@/components/ui/data-table'
import { toast } from 'sonner'
import { shiftReportsService } from '@/lib/services/shift-reports.service'
import type { ShiftReportRecord } from '@/lib/repositories/contracts'

export default function ReportsArchivePage() {
  const [reports, setReports] = React.useState<ShiftReportRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dateFilter, setDateFilter] = React.useState('')
  const [shiftFilter, setShiftFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const loadReports = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await shiftReportsService.getAll()
      setReports(data)
    } catch (error) {
      console.error('Error loading reports:', error)
      toast.error('حدث خطأ في تحميل التقارير')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadReports()
  }, [loadReports])

  const filteredReports = React.useMemo(() => {
    return reports.filter((report) => {
      if (dateFilter && !report.date.includes(dateFilter)) return false
      if (shiftFilter !== 'all' && report.shift !== shiftFilter) return false
      if (statusFilter !== 'all' && report.status !== statusFilter) return false
      return true
    })
  }, [reports, dateFilter, shiftFilter, statusFilter])

  const stats = React.useMemo(() => ({
    total: reports.length,
    approved: reports.filter(r => r.status === 'approved').length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    draft: reports.filter(r => r.status === 'draft').length,
  }), [reports])

  const handleExport = () => {
    const header = 'التاريخ,الشفت,المشرف,عدد المرضى,عدد الكادر,الحالة'
    const rows = filteredReports.map(r => 
      `${r.date},${r.shift},${r.supervisorName || ''},${r.totalPatients},${r.staffCount},${r.status}`
    )
    const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'shift-reports.csv'
    link.click()
    toast.success('تم تصدير التقارير')
  }

  const columns: Column<ShiftReportRecord>[] = [
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
      key: 'supervisorName',
      header: 'المشرف',
      cell: (row) => row.supervisorName || '—'
    },
    {
      key: 'totalPatients',
      header: 'المرضى',
    },
    {
      key: 'staffCount',
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadReports}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Button asChild>
            <Link href="/reports/create">
              <Plus className="h-4 w-4 ml-2" />
              تقرير جديد
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <FileText className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">إجمالي التقارير</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-muted-foreground">معتمدة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.submitted}</p>
            <p className="text-xs text-muted-foreground">مُرسلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            <p className="text-xs text-muted-foreground">مسودة</p>
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
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>لا توجد تقارير مطابقة للفلاتر المحددة</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/reports/create">
                  <Plus className="h-4 w-4 ml-1" />إنشاء تقرير جديد
                </Link>
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredReports}
              searchKey="supervisorName"
              searchPlaceholder="البحث بالمشرف..."
              emptyMessage="لا توجد تقارير مطابقة للفلاتر المحددة"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
