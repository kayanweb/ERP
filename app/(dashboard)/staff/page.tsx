'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus, Eye, Edit, MoreHorizontal, UserCheck, UserX } from 'lucide-react'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DataTable, Column } from '@/components/ui/data-table'

// Demo data - will be replaced with Firebase
const staffData = [
  {
    id: '1',
    name: 'أحمد محمد علي',
    email: 'ahmed@hospital.com',
    phone: '0501234567',
    role: 'senior_nurse' as const,
    department: 'ICU 3rd',
    status: 'active' as const,
    shift: 'morning' as const,
  },
  {
    id: '2',
    name: 'سارة علي حسن',
    email: 'sara@hospital.com',
    phone: '0507654321',
    role: 'nurse' as const,
    department: 'ER',
    status: 'active' as const,
    shift: 'evening' as const,
  },
  {
    id: '3',
    name: 'محمد حسن أحمد',
    email: 'mohamed@hospital.com',
    phone: '0509876543',
    role: 'supervisor' as const,
    department: 'CCU',
    status: 'active' as const,
    shift: 'night' as const,
  },
  {
    id: '4',
    name: 'فاطمة أحمد محمود',
    email: 'fatma@hospital.com',
    phone: '0501112233',
    role: 'nurse' as const,
    department: 'NICU',
    status: 'on_leave' as const,
    shift: 'morning' as const,
  },
  {
    id: '5',
    name: 'خالد عبدالله',
    email: 'khaled@hospital.com',
    phone: '0504445566',
    role: 'nurse' as const,
    department: 'PICU',
    status: 'absent' as const,
    shift: 'morning' as const,
  },
  {
    id: '6',
    name: 'نورة سعيد',
    email: 'noura@hospital.com',
    phone: '0507778899',
    role: 'head_nurse' as const,
    department: 'ICU 4th',
    status: 'active' as const,
    shift: 'morning' as const,
  },
]

type Staff = (typeof staffData)[0]

const roleLabels = {
  nurse: 'ممرض',
  senior_nurse: 'ممرض أول',
  head_nurse: 'رئيس تمريض',
  supervisor: 'مشرف',
}

const statusLabels = {
  active: 'نشط',
  on_leave: 'إجازة',
  absent: 'غائب',
}

const statusColors = {
  active: 'bg-success/10 text-success border-success/20',
  on_leave: 'bg-warning/10 text-warning border-warning/20',
  absent: 'bg-destructive/10 text-destructive border-destructive/20',
}

const shiftLabels = {
  morning: 'صباحي',
  evening: 'مسائي',
  night: 'ليلي',
}

export default function StaffListPage() {
  const [departmentFilter, setDepartmentFilter] = React.useState<string>('all')
  const [roleFilter, setRoleFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const filteredStaff = React.useMemo(() => {
    return staffData.filter((staff) => {
      if (departmentFilter !== 'all' && staff.department !== departmentFilter) return false
      if (roleFilter !== 'all' && staff.role !== roleFilter) return false
      if (statusFilter !== 'all' && staff.status !== statusFilter) return false
      return true
    })
  }, [departmentFilter, roleFilter, statusFilter])

  const columns: Column<Staff>[] = [
    {
      key: 'name',
      header: 'الموظف',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {row.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'الوظيفة',
      cell: (row) => (
        <Badge variant="secondary">{roleLabels[row.role]}</Badge>
      ),
    },
    {
      key: 'department',
      header: 'القسم',
    },
    {
      key: 'shift',
      header: 'الشفت',
      cell: (row) => (
        <Badge variant="outline">{shiftLabels[row.shift]}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      cell: (row) => (
        <Badge variant="outline" className={statusColors[row.status]}>
          {statusLabels[row.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/staff/${row.id}`}>
                <Eye className="h-4 w-4 ml-2" />
                عرض التفاصيل
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const activeCount = staffData.filter((s) => s.status === 'active').length
  const absentCount = staffData.filter((s) => s.status === 'absent').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الموظفين</h1>
          <p className="text-muted-foreground">عرض وإدارة كادر التمريض</p>
        </div>
        <Button asChild>
          <Link href="/staff/add">
            <Plus className="h-4 w-4 ml-2" />
            إضافة موظف
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staffData.length}</p>
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
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">نشط</p>
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
                <p className="text-2xl font-bold">{absentCount}</p>
                <p className="text-sm text-muted-foreground">غائب</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <UserCheck className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staffData.filter((s) => s.status === 'on_leave').length}
                </p>
                <p className="text-sm text-muted-foreground">إجازة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الأقسام" />
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الوظائف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الوظائف</SelectItem>
                <SelectItem value="nurse">ممرض</SelectItem>
                <SelectItem value="senior_nurse">ممرض أول</SelectItem>
                <SelectItem value="head_nurse">رئيس تمريض</SelectItem>
                <SelectItem value="supervisor">مشرف</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="on_leave">إجازة</SelectItem>
                <SelectItem value="absent">غائب</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setDepartmentFilter('all')
                setRoleFilter('all')
                setStatusFilter('all')
              }}
            >
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={filteredStaff}
            searchKey="name"
            searchPlaceholder="البحث بالاسم..."
            emptyMessage="لا يوجد موظفين مطابقين للفلاتر"
          />
        </CardContent>
      </Card>
    </div>
  )
}
