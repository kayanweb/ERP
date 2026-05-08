'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Save, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AddStaffPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    shift: '',
    hireDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: save new staff member to Firestore users collection
    router.push('/staff')
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إضافة موظف جديد</h1>
          <p className="text-muted-foreground">إدخال بيانات الموظف الجديد</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="أدخل الاسم الكامل"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="example@hospital.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="05XXXXXXXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">تاريخ التعيين</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => updateField('hireDate', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Work Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات العمل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">الوظيفة</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => updateField('role', value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="اختر الوظيفة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">ممرض</SelectItem>
                    <SelectItem value="senior_nurse">ممرض أول</SelectItem>
                    <SelectItem value="head_nurse">رئيس تمريض</SelectItem>
                    <SelectItem value="supervisor">مشرف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">القسم</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => updateField('department', value)}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICU 3rd">ICU 3rd</SelectItem>
                    <SelectItem value="ICU 4th">ICU 4th</SelectItem>
                    <SelectItem value="CCU">CCU</SelectItem>
                    <SelectItem value="ER">ER</SelectItem>
                    <SelectItem value="NICU">NICU</SelectItem>
                    <SelectItem value="PICU">PICU</SelectItem>
                    <SelectItem value="8th Floor">8th Floor</SelectItem>
                    <SelectItem value="9th Floor">9th Floor</SelectItem>
                    <SelectItem value="11th Floor">11th Floor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">الشفت الافتراضي</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value) => updateField('shift', value)}
                >
                  <SelectTrigger id="shift">
                    <SelectValue placeholder="اختر الشفت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">صباحي</SelectItem>
                    <SelectItem value="evening">مسائي</SelectItem>
                    <SelectItem value="night">ليلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
          <Button type="submit">
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة الموظف
          </Button>
        </div>
      </form>
    </div>
  )
}
