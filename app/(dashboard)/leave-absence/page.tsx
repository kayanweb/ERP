'use client'

import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Printer,
  Filter,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const UNITS = ['الكل','ICU 3rd','ICU 4th','CCU','ER','NICU','PICU','الطابق 8','الطابق 9']

const leaveRequests = [
  { id: 'LR1', staff: 'أحمد محمد علي', unit: 'ICU 3rd', type: 'سنوية', start: '2026-05-10', end: '2026-05-15', days: 6, status: 'approved', requestDate: '2026-05-01', approvedBy: 'مدير التمريض' },
  { id: 'LR2', staff: 'سارة خالد', unit: 'ER', type: 'مرضية', start: '2026-05-08', end: '2026-05-09', days: 2, status: 'pending', requestDate: '2026-05-06', approvedBy: '' },
  { id: 'LR3', staff: 'محمد حسن', unit: 'CCU', type: 'طارئة', start: '2026-05-07', end: '2026-05-07', days: 1, status: 'approved', requestDate: '2026-05-07', approvedBy: 'مشرف الوحدة' },
  { id: 'LR4', staff: 'نورة أحمد', unit: 'ICU 3rd', type: 'سنوية', start: '2026-06-01', end: '2026-06-10', days: 10, status: 'pending', requestDate: '2026-05-05', approvedBy: '' },
  { id: 'LR5', staff: 'خالد عبدالله', unit: 'ER', type: 'بدون راتب', start: '2026-05-20', end: '2026-05-22', days: 3, status: 'rejected', requestDate: '2026-05-03', approvedBy: '' },
  { id: 'LR6', staff: 'فاطمة علي', unit: 'NICU', type: 'أمومة', start: '2026-06-15', end: '2026-09-15', days: 90, status: 'approved', requestDate: '2026-04-20', approvedBy: 'إدارة الموارد البشرية' },
]

const absenceRecords = [
  { id: 'AB1', staff: 'أحمد محمد علي', unit: 'ICU 3rd', date: '2026-05-06', shift: 'D', reason: 'مرض', hasDoc: true },
  { id: 'AB2', staff: 'محمد حسن', unit: 'CCU', date: '2026-05-06', shift: 'D', reason: 'غياب بدون إذن', hasDoc: false },
  { id: 'AB3', staff: 'فاطمة علي', unit: 'NICU', date: '2026-05-06', shift: 'N', reason: 'إجازة طارئة', hasDoc: false },
  { id: 'AB4', staff: 'ريم محمود', unit: 'ICU 4th', date: '2026-05-05', shift: 'N', reason: 'مرض', hasDoc: true },
  { id: 'AB5', staff: 'سارة خالد', unit: 'ER', date: '2026-05-04', shift: 'D', reason: 'ظروف خاصة', hasDoc: false },
]

const statusConfig = {
  pending:  { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'موافق', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> },
}

export default function LeaveAbsencePage() {
  const [requests, setRequests] = useState(leaveRequests)
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('الكل')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredRequests = requests.filter(r => {
    const matchSearch = r.staff.includes(search)
    const matchUnit = unitFilter === 'الكل' || r.unit === unitFilter
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchType = typeFilter === 'all' || r.type === typeFilter
    return matchSearch && matchUnit && matchStatus && matchType
  })

  const pending = requests.filter(r => r.status === 'pending').length
  const approved = requests.filter(r => r.status === 'approved').length
  const rejected = requests.filter(r => r.status === 'rejected').length

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, approvedBy: status === 'approved' ? 'مدير التمريض' : '' } : r))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">الإجازات والغياب</h1>
          <p className="text-muted-foreground text-sm">
            إدارة طلبات الإجازات وسجلات الغياب
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-1" /> تصدير CSV
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 ml-1" /> طباعة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: requests.length, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'قيد الانتظار', value: pending, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
          { label: 'موافق عليها', value: approved, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
          { label: 'مرفوضة', value: rejected, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
        ].map(s => (
          <Card key={s.label} className={cn('p-4 border-0', s.bg)}>
            <p className={cn('text-3xl font-black', s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">📋 طلبات الإجازة</TabsTrigger>
          <TabsTrigger value="absence">🚫 سجل الغياب</TabsTrigger>
          <TabsTrigger value="balances">📊 الأرصدة</TabsTrigger>
        </TabsList>

        {/* Leave requests */}
        <TabsContent value="requests" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="approved">موافق</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                <SelectItem value="سنوية">سنوية</SelectItem>
                <SelectItem value="مرضية">مرضية</SelectItem>
                <SelectItem value="طارئة">طارئة</SelectItem>
                <SelectItem value="أمومة">أمومة</SelectItem>
                <SelectItem value="بدون راتب">بدون راتب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      {['الموظف','الوحدة','نوع الإجازة','من','إلى','الأيام','تاريخ الطلب','الحالة','إجراء'].map(h => (
                        <th key={h} className="text-right py-3 px-3 font-semibold text-xs text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(req => {
                      const sc = statusConfig[req.status as keyof typeof statusConfig]
                      return (
                        <tr key={req.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-medium whitespace-nowrap">{req.staff}</td>
                          <td className="py-2.5 px-3 text-muted-foreground text-xs">{req.unit}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className="text-xs">{req.type}</Badge>
                          </td>
                          <td className="py-2.5 px-3 text-xs">{req.start}</td>
                          <td className="py-2.5 px-3 text-xs">{req.end}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{req.days}</td>
                          <td className="py-2.5 px-3 text-xs text-muted-foreground">{req.requestDate}</td>
                          <td className="py-2.5 px-3">
                            <Badge className={cn('text-xs border-0 flex items-center gap-1 w-fit', sc.color)}>
                              {sc.icon} {sc.label}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            {req.status === 'pending' && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-green-700 border-green-300" onClick={() => updateStatus(req.id, 'approved')}>
                                  موافقة
                                </Button>
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-red-700 border-red-300" onClick={() => updateStatus(req.id, 'rejected')}>
                                  رفض
                                </Button>
                              </div>
                            )}
                            {req.status !== 'pending' && req.approvedBy && (
                              <span className="text-[10px] text-muted-foreground">{req.approvedBy}</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Absence records */}
        <TabsContent value="absence" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      {['الموظف','الوحدة','التاريخ','الشيفت','السبب','مستند طبي'].map(h => (
                        <th key={h} className="text-right py-3 px-4 font-semibold text-xs text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {absenceRecords.map(rec => (
                      <tr key={rec.id} className="border-b last:border-0 hover:bg-muted/20 bg-red-50/30 dark:bg-red-900/5">
                        <td className="py-2.5 px-4 font-medium">{rec.staff}</td>
                        <td className="py-2.5 px-4 text-muted-foreground text-xs">{rec.unit}</td>
                        <td className="py-2.5 px-4 text-xs">{rec.date}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant="outline" className="text-xs">{rec.shift}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-sm">{rec.reason}</td>
                        <td className="py-2.5 px-4">
                          {rec.hasDoc
                            ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0 text-xs">مقدم ✓</Badge>
                            : <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-0 text-xs">غير مقدم</Badge>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balances */}
        <TabsContent value="balances" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'أحمد محمد علي', unit: 'ICU 3rd', annual: { total: 21, used: 6, pending: 0 }, sick: { total: 14, used: 0 } },
              { name: 'سارة خالد', unit: 'ER', annual: { total: 21, used: 3, pending: 0 }, sick: { total: 14, used: 2 } },
              { name: 'محمد حسن', unit: 'CCU', annual: { total: 21, used: 0, pending: 0 }, sick: { total: 14, used: 1 } },
              { name: 'نورة أحمد', unit: 'ICU 3rd', annual: { total: 21, used: 0, pending: 10 }, sick: { total: 14, used: 0 } },
              { name: 'فاطمة علي', unit: 'NICU', annual: { total: 21, used: 5, pending: 0 }, sick: { total: 14, used: 0 } },
            ].map(emp => {
              const annualRemaining = emp.annual.total - emp.annual.used - emp.annual.pending
              return (
                <Card key={emp.name} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.unit}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>سنوية ({annualRemaining} متبقي)</span>
                        <span>{emp.annual.used + emp.annual.pending}/{emp.annual.total}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(annualRemaining / emp.annual.total) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>مرضية ({emp.sick.total - emp.sick.used} متبقي)</span>
                        <span>{emp.sick.used}/{emp.sick.total}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((emp.sick.total - emp.sick.used) / emp.sick.total) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
