'use client'

import * as React from 'react'
import { Calendar, UserCheck, UserX, Clock, Filter } from 'lucide-react'

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

// Demo data - will be replaced with Firebase
const attendanceData = [
  {
    id: '1',
    staffName: 'أحمد محمد علي',
    department: 'ICU 3rd',
    date: '2024-01-15',
    shift: 'morning',
    checkIn: '07:00',
    checkOut: '15:00',
    status: 'present',
  },
  {
    id: '2',
    staffName: 'سارة علي حسن',
    department: 'ER',
    date: '2024-01-15',
    shift: 'evening',
    checkIn: '15:00',
    checkOut: '23:00',
    status: 'present',
  },
  {
    id: '3',
    staffName: 'محمد حسن أحمد',
    department: 'CCU',
    date: '2024-01-15',
    shift: 'morning',
    checkIn: null,
    checkOut: null,
    status: 'absent',
  },
  {
    id: '4',
    staffName: 'فاطمة أحمد محمود',
    department: 'NICU',
    date: '2024-01-15',
    shift: 'morning',
    checkIn: '07:30',
    checkOut: '15:00',
    status: 'late',
  },
  {
    id: '5',
    staffName: 'خالد عبدالله',
    department: 'PICU',
    date: '2024-01-15',
    shift: 'morning',
    checkIn: '07:00',
    checkOut: null,
    status: 'on_duty',
  },
]

const statusConfig = {
  present: { label: 'حاضر', color: 'bg-success/10 text-success border-success/20' },
  absent: { label: 'غائب', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  late: { label: 'متأخر', color: 'bg-warning/10 text-warning border-warning/20' },
  on_duty: { label: 'في العمل', color: 'bg-primary/10 text-primary border-primary/20' },
  on_leave: { label: 'إجازة', color: 'bg-muted text-muted-foreground' },
}

export default function AttendancePage() {
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])
  const [shiftFilter, setShiftFilter] = React.useState('all')
  const [departmentFilter, setDepartmentFilter] = React.useState('all')

  const filteredData = React.useMemo(() => {
    return attendanceData.filter((item) => {
      if (shiftFilter !== 'all' && item.shift !== shiftFilter) return false
      if (departmentFilter !== 'all' && item.department !== departmentFilter) return false
      return true
    })
  }, [shiftFilter, departmentFilter])

  const stats = {
    total: filteredData.length,
    present: filteredData.filter((d) => d.status === 'present' || d.status === 'on_duty').length,
    absent: filteredData.filter((d) => d.status === 'absent').length,
    late: filteredData.filter((d) => d.status === 'late').length,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الحضور والغياب</h1>
        <p className="text-muted-foreground">متابعة حضور وغياب الموظفين</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي الكادر</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.present}</p>
                <p className="text-sm text-muted-foreground">حاضر</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <UserX className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.absent}</p>
                <p className="text-sm text-muted-foreground">غائب</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.late}</p>
                <p className="text-sm text-muted-foreground">متأخر</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">التاريخ</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الشفت</label>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger>
                  <SelectValue />
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
              <label className="text-sm font-medium">القسم</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  <SelectItem value="ICU 3rd">ICU 3rd</SelectItem>
                  <SelectItem value="ICU 4th">ICU 4th</SelectItem>
                  <SelectItem value="CCU">CCU</SelectItem>
                  <SelectItem value="ER">ER</SelectItem>
                  <SelectItem value="NICU">NICU</SelectItem>
                  <SelectItem value="PICU">PICU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShiftFilter('all')
                  setDepartmentFilter('all')
                }}
              >
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            سجل الحضور - {new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredData.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {record.staffName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{record.staffName}</p>
                    <p className="text-sm text-muted-foreground">{record.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center hidden sm:block">
                    <p className="text-xs text-muted-foreground">الحضور</p>
                    <p className="font-medium">{record.checkIn || '-'}</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-xs text-muted-foreground">الانصراف</p>
                    <p className="font-medium">{record.checkOut || '-'}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusConfig[record.status as keyof typeof statusConfig].color}
                  >
                    {statusConfig[record.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
