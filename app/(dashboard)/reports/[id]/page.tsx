'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Printer, FileSpreadsheet, FileText, Check, Clock, Minus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/ui/status-badge'

// Demo data - will be replaced with Firebase fetch
const reportData = {
  id: '1',
  date: '2024-01-15',
  shift: 'morning' as const,
  supervisor: 'أحمد محمد',
  supervisorId: '1',
  status: 'approved' as const,
  departments: [
    { name: 'ICU 3rd', beds: 15, patients: 7, nurses: 5 },
    { name: 'ICU 4th', beds: 6, patients: 2, nurses: 1 },
    { name: 'CCU', beds: 11, patients: 2, nurses: 2 },
    { name: 'ER', beds: 11, patients: 29, nurses: 3 },
    { name: 'NICU', beds: 2, patients: 0, nurses: 1 },
    { name: 'PICU', beds: 4, patients: 3, nurses: 1 },
  ],
  checklist: [
    {
      name: 'Assignment Sheet',
      nameAr: 'ورقة التوزيع',
      departments: [
        { dept: 'ICU 3rd', status: 'done' },
        { dept: 'ICU 4th', status: 'done' },
        { dept: 'CCU', status: 'done' },
        { dept: 'ER', status: 'pending' },
        { dept: 'NICU', status: 'done' },
        { dept: 'PICU', status: 'done' },
      ],
    },
    {
      name: 'Infection Control',
      nameAr: 'مكافحة العدوى',
      departments: [
        { dept: 'ICU 3rd', status: 'done' },
        { dept: 'ICU 4th', status: 'done' },
        { dept: 'CCU', status: 'done' },
        { dept: 'ER', status: 'done' },
        { dept: 'NICU', status: 'done' },
        { dept: 'PICU', status: 'pending' },
      ],
    },
    {
      name: 'Room Temperature',
      nameAr: 'درجة حرارة الغرفة',
      departments: [
        { dept: 'ICU 3rd', status: 'done' },
        { dept: 'ICU 4th', status: 'done' },
        { dept: 'CCU', status: 'done' },
        { dept: 'ER', status: 'done' },
        { dept: 'NICU', status: 'done' },
        { dept: 'PICU', status: 'done' },
      ],
    },
    {
      name: 'PPE Kit',
      nameAr: 'معدات الوقاية',
      departments: [
        { dept: 'ICU 3rd', status: 'done' },
        { dept: 'ICU 4th', status: 'na' },
        { dept: 'CCU', status: 'done' },
        { dept: 'ER', status: 'done' },
        { dept: 'NICU', status: 'done' },
        { dept: 'PICU', status: 'done' },
      ],
    },
  ],
  problems: [
    { type: 'مشكلة مريض', details: '1107 - زكريا عبدالسلام - ألم شديد' },
    { type: 'عزل', details: 'ICU 6 - أسامة قرني - CONTACT' },
  ],
  absences: [
    { type: 'غياب', name: 'محمد طارق', details: 'بدون إذن' },
    { type: 'انتداب', name: 'سمية أحمد', details: 'من KTU إلى IMCU' },
  ],
  notes: 'تم مراجعة جميع الأقسام. قسم الطوارئ يحتاج دعم إضافي بسبب الضغط المرتفع.',
  createdAt: '2024-01-15T07:00:00Z',
  updatedAt: '2024-01-15T07:30:00Z',
}

export default function ViewReportPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    window.print()
  }

  const handleExportExcel = () => {
    // XLSX export — placeholder for future integration
  }

  const totalPatients = reportData.departments.reduce((sum, d) => sum + d.patients, 0)
  const totalBeds = reportData.departments.reduce((sum, d) => sum + d.beds, 0)
  const totalNurses = reportData.departments.reduce((sum, d) => sum + d.nurses, 0)

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'done') return <Check className="h-4 w-4 text-success" />
    if (status === 'pending') return <Clock className="h-4 w-4 text-warning" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">عرض التقرير</h1>
            <p className="text-muted-foreground">
              تقرير الشفت {reportData.shift === 'morning' ? 'الصباحي' : reportData.shift === 'evening' ? 'المسائي' : 'الليلي'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 ml-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 ml-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">PRO Nurse - تقرير المناوبة</h1>
        <p className="text-muted-foreground">نظام إدارة التمريض المتقدم</p>
      </div>

      {/* Report Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>معلومات التقرير</CardTitle>
            <StatusBadge status={reportData.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">التاريخ</p>
              <p className="font-medium">
                {new Date(reportData.date).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الشفت</p>
              <StatusBadge status={reportData.shift} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المشرف</p>
              <p className="font-medium">{reportData.supervisor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">وقت الإنشاء</p>
              <p className="font-medium">
                {new Date(reportData.createdAt).toLocaleTimeString('ar-EG')}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalPatients}</p>
              <p className="text-sm text-muted-foreground">إجمالي المرضى</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalBeds}</p>
              <p className="text-sm text-muted-foreground">إجمالي الأسرة</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalNurses}</p>
              <p className="text-sm text-muted-foreground">إجمالي الكادر</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Census */}
      <Card>
        <CardHeader>
          <CardTitle>تعداد الأقسام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-semibold text-sm">القسم</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">الأسرة</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">المرضى</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">الممرضين</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">الإشغال</th>
                </tr>
              </thead>
              <tbody>
                {reportData.departments.map((dept, index) => {
                  const occupancy = Math.round((dept.patients / dept.beds) * 100)
                  const isOverCapacity = dept.patients > dept.beds

                  return (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{dept.name}</td>
                      <td className="py-3 px-4">{dept.beds}</td>
                      <td className="py-3 px-4">{dept.patients}</td>
                      <td className="py-3 px-4">{dept.nurses}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={isOverCapacity ? 'destructive' : occupancy >= 80 ? 'default' : 'secondary'}
                        >
                          {occupancy}%
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفحص الفني</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-semibold text-sm">البند</th>
                  {reportData.checklist[0].departments.map((d) => (
                    <th key={d.dept} className="text-center py-3 px-2 font-semibold text-sm">
                      {d.dept}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.checklist.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.nameAr}</td>
                    {item.departments.map((d, i) => (
                      <td key={i} className="py-3 px-2 text-center">
                        <div className="flex justify-center">
                          <StatusIcon status={d.status} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Problems & Absences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المشاكل والعزل</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.problems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد مشاكل مسجلة
              </p>
            ) : (
              <div className="space-y-3">
                {reportData.problems.map((problem, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline">{problem.type}</Badge>
                    <p className="text-sm">{problem.details}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الغياب والانتداب</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.absences.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا يوجد غياب أو انتداب
              </p>
            ) : (
              <div className="space-y-3">
                {reportData.absences.map((absence, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline">{absence.type}</Badge>
                    <div>
                      <p className="text-sm font-medium">{absence.name}</p>
                      <p className="text-xs text-muted-foreground">{absence.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {reportData.notes && (
        <Card>
          <CardHeader>
            <CardTitle>ملاحظات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{reportData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
