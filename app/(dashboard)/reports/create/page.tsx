'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'

// Demo data - will be replaced with Firebase
const initialDepartments = [
  { id: '1', name: 'ICU 3rd', beds: 15, patients: 0, nurses: 0 },
  { id: '2', name: 'ICU 4th', beds: 6, patients: 0, nurses: 0 },
  { id: '3', name: 'CCU', beds: 11, patients: 0, nurses: 0 },
  { id: '4', name: 'ER', beds: 11, patients: 0, nurses: 0 },
  { id: '5', name: 'NICU', beds: 2, patients: 0, nurses: 0 },
  { id: '6', name: 'PICU', beds: 4, patients: 0, nurses: 0 },
  { id: '7', name: '8th Floor', beds: 17, patients: 0, nurses: 0 },
  { id: '8', name: '9th Floor', beds: 17, patients: 0, nurses: 0 },
  { id: '9', name: '11th Floor', beds: 14, patients: 0, nurses: 0 },
]

const checklistItems = [
  { id: '1', name: 'Assignment Sheet', nameAr: 'ورقة التوزيع' },
  { id: '2', name: 'Infection Control', nameAr: 'مكافحة العدوى' },
  { id: '3', name: 'Room Temperature', nameAr: 'درجة حرارة الغرفة' },
  { id: '4', name: 'Refrigerator Temperature', nameAr: 'درجة حرارة الثلاجة' },
  { id: '5', name: 'PPE Kit', nameAr: 'معدات الوقاية' },
  { id: '6', name: 'Crash Cart', nameAr: 'عربة الطوارئ' },
  { id: '7', name: 'Medication Check', nameAr: 'فحص الأدوية' },
  { id: '8', name: 'Patient Safety', nameAr: 'سلامة المريض' },
]

const supervisors = [
  { id: '1', name: 'أحمد محمد' },
  { id: '2', name: 'سارة علي' },
  { id: '3', name: 'محمد حسن' },
  { id: '4', name: 'فاطمة أحمد' },
]

type CheckStatus = 'done' | 'pending' | 'na'

export default function CreateReportPage() {
  const router = useRouter()
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])
  const [shift, setShift] = React.useState<'morning' | 'evening' | 'night'>('morning')
  const [supervisor, setSupervisor] = React.useState('')
  const [departments, setDepartments] = React.useState(initialDepartments)
  const [checklistStatus, setChecklistStatus] = React.useState<
    Record<string, Record<string, CheckStatus>>
  >({})
  const [notes, setNotes] = React.useState('')

  const updateDepartment = (
    id: string,
    field: 'patients' | 'nurses',
    value: number
  ) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === id ? { ...dept, [field]: value } : dept
      )
    )
  }

  const updateChecklistStatus = (
    itemId: string,
    deptId: string,
    status: CheckStatus
  ) => {
    setChecklistStatus((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [deptId]: status,
      },
    }))
  }

  const getCheckStatus = (itemId: string, deptId: string): CheckStatus => {
    return checklistStatus[itemId]?.[deptId] || 'pending'
  }

  const handleSaveDraft = () => {
    // TODO: save draft to Firestore reports collection
  }

  const handleSubmit = () => {
    // TODO: submit report to Firestore reports collection
    router.push('/reports')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إنشاء تقرير جديد</h1>
          <p className="text-muted-foreground">
            تقرير تعداد الأقسام والفحص الفني
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 ml-2" />
            حفظ كمسودة
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 ml-2" />
            إرسال التقرير
          </Button>
        </div>
      </div>

      {/* Report Info */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">الشفت</Label>
              <Select
                value={shift}
                onValueChange={(value: 'morning' | 'evening' | 'night') =>
                  setShift(value)
                }
              >
                <SelectTrigger id="shift">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">صباحي</SelectItem>
                  <SelectItem value="evening">مسائي</SelectItem>
                  <SelectItem value="night">ليلي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor">المشرف</Label>
              <Select value={supervisor} onValueChange={setSupervisor}>
                <SelectTrigger id="supervisor">
                  <SelectValue placeholder="اختر المشرف" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Census Table */}
      <Card>
        <CardHeader>
          <CardTitle>تعداد الأقسام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-semibold text-sm">
                    القسم
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">
                    الأسرة
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">
                    المرضى
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">
                    الممرضين
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">
                    نسبة الإشغال
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => {
                  const occupancy =
                    dept.beds > 0
                      ? Math.round((dept.patients / dept.beds) * 100)
                      : 0
                  const isOverCapacity = dept.patients > dept.beds

                  return (
                    <tr
                      key={dept.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 font-medium">{dept.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {dept.beds}
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min={0}
                          value={dept.patients}
                          onChange={(e) =>
                            updateDepartment(
                              dept.id,
                              'patients',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min={0}
                          value={dept.nurses}
                          onChange={(e) =>
                            updateDepartment(
                              dept.id,
                              'nurses',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            isOverCapacity
                              ? 'bg-destructive/10 text-destructive'
                              : occupancy >= 80
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                          )}
                        >
                          {occupancy}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفحص الفني</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-semibold text-sm sticky right-0 bg-card">
                    البند
                  </th>
                  {departments.slice(0, 6).map((dept) => (
                    <th
                      key={dept.id}
                      className="text-center py-3 px-2 font-semibold text-sm min-w-[100px]"
                    >
                      {dept.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checklistItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-4 font-medium sticky right-0 bg-card">
                      {item.nameAr}
                    </td>
                    {departments.slice(0, 6).map((dept) => {
                      const status = getCheckStatus(item.id, dept.id)
                      return (
                        <td key={dept.id} className="py-3 px-2 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() =>
                                updateChecklistStatus(item.id, dept.id, 'done')
                              }
                              className={cn(
                                'px-2 py-1 rounded text-xs font-bold transition-colors',
                                status === 'done'
                                  ? 'bg-success text-success-foreground'
                                  : 'bg-muted text-muted-foreground hover:bg-success/20'
                              )}
                            >
                              تم
                            </button>
                            <button
                              onClick={() =>
                                updateChecklistStatus(item.id, dept.id, 'pending')
                              }
                              className={cn(
                                'px-2 py-1 rounded text-xs font-bold transition-colors',
                                status === 'pending'
                                  ? 'bg-warning text-warning-foreground'
                                  : 'bg-muted text-muted-foreground hover:bg-warning/20'
                              )}
                            >
                              انتظار
                            </button>
                            <button
                              onClick={() =>
                                updateChecklistStatus(item.id, dept.id, 'na')
                              }
                              className={cn(
                                'px-2 py-1 rounded text-xs font-bold transition-colors',
                                status === 'na'
                                  ? 'bg-muted-foreground text-muted'
                                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                              )}
                            >
                              غ/م
                            </button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>ملاحظات إضافية</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="أضف أي ملاحظات أو مشاكل أو توصيات..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>
    </div>
  )
}
