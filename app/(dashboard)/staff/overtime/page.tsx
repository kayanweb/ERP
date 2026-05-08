'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Clock,
  Plus,
  Search,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OvertimeRequest {
  id: string
  staffId: string
  staffName: string
  department: string
  date: string
  startTime: string
  endTime: string
  hours: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  notes?: string
}

const sampleRequests: OvertimeRequest[] = [
  {
    id: '1',
    staffId: 's1',
    staffName: 'سارة أحمد',
    department: 'الطوارئ',
    date: '2024-01-15',
    startTime: '19:00',
    endTime: '23:00',
    hours: 4,
    reason: 'نقص في الطاقم بسبب الإجازات',
    status: 'pending',
  },
  {
    id: '2',
    staffId: 's2',
    staffName: 'محمد علي',
    department: 'العناية المركزة',
    date: '2024-01-14',
    startTime: '07:00',
    endTime: '15:00',
    hours: 8,
    reason: 'حالات طوارئ متعددة',
    status: 'approved',
    approvedBy: 'أ. فاطمة خالد',
    approvedAt: '2024-01-14T10:00:00.000Z',
  },
  {
    id: '3',
    staffId: 's3',
    staffName: 'نورة حسن',
    department: 'الباطنية',
    date: '2024-01-13',
    startTime: '15:00',
    endTime: '19:00',
    hours: 4,
    reason: 'تغطية مناوبة زميلة مريضة',
    status: 'approved',
    approvedBy: 'أ. فاطمة خالد',
    approvedAt: '2024-01-13T16:00:00.000Z',
  },
  {
    id: '4',
    staffId: 's4',
    staffName: 'خالد عبدالله',
    department: 'الجراحة',
    date: '2024-01-12',
    startTime: '23:00',
    endTime: '07:00',
    hours: 8,
    reason: 'عمليات طارئة',
    status: 'rejected',
    notes: 'تجاوز الحد الأقصى للساعات الإضافية هذا الشهر',
  },
]

const staffList = [
  { id: 's1', name: 'سارة أحمد', department: 'الطوارئ' },
  { id: 's2', name: 'محمد علي', department: 'العناية المركزة' },
  { id: 's3', name: 'نورة حسن', department: 'الباطنية' },
  { id: 's4', name: 'خالد عبدالله', department: 'الجراحة' },
  { id: 's5', name: 'فاطمة محمد', department: 'الأطفال' },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
          <AlertCircle className="h-3 w-3 ml-1" />
          قيد المراجعة
        </Badge>
      )
    case 'approved':
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 ml-1" />
          معتمد
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 ml-1" />
          مرفوض
        </Badge>
      )
    default:
      return null
  }
}

export default function OvertimePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null)
  const [newRequest, setNewRequest] = useState({
    staffId: '',
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
  })

  const filteredRequests = sampleRequests.filter((req) => {
    const matchesSearch =
      req.staffName.includes(searchTerm) || req.department.includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: sampleRequests.length,
    pending: sampleRequests.filter((r) => r.status === 'pending').length,
    approved: sampleRequests.filter((r) => r.status === 'approved').length,
    rejected: sampleRequests.filter((r) => r.status === 'rejected').length,
    totalHours: sampleRequests
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + r.hours, 0),
  }

  const handleSubmit = () => {
    setIsDialogOpen(false)
    setNewRequest({ staffId: '', date: '', startTime: '', endTime: '', reason: '' })
  }

  const handleApprove = (_id: string) => {
    // TODO: update overtime request status in Firestore
  }

  const handleReject = (_id: string) => {
    // TODO: update overtime request status in Firestore
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            إدارة العمل الإضافي
          </h1>
          <p className="text-muted-foreground">
            طلبات واعتماد ساعات العمل الإضافية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                طلب جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>طلب ساعات إضافية</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>الموظف</Label>
                  <Select
                    value={newRequest.staffId}
                    onValueChange={(v) =>
                      setNewRequest({ ...newRequest, staffId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name} - {staff.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input
                    type="date"
                    value={newRequest.date}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, date: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>وقت البداية</Label>
                    <Input
                      type="time"
                      value={newRequest.startTime}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>وقت النهاية</Label>
                    <Input
                      type="time"
                      value={newRequest.endTime}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>سبب الطلب</Label>
                  <Textarea
                    value={newRequest.reason}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, reason: e.target.value })
                    }
                    placeholder="اذكر سبب طلب العمل الإضافي..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleSubmit}>إرسال الطلب</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">قيد المراجعة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">معتمدة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">مرفوضة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalHours}</p>
                <p className="text-xs text-muted-foreground">ساعات معتمدة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو القسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="approved">معتمدة</SelectItem>
            <SelectItem value="rejected">مرفوضة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوقت</TableHead>
                <TableHead>الساعات</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{request.staffName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>
                    {new Date(request.date).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {request.startTime} - {request.endTime}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.hours} ساعات</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {request.reason}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    {request.status === 'pending' ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedRequest(request)}
                      >
                        عرض
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ملخص الشهر الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'الطوارئ', hours: 24, budget: 40 },
                { name: 'العناية المركزة', hours: 32, budget: 40 },
                { name: 'الباطنية', hours: 16, budget: 30 },
                { name: 'الجراحة', hours: 20, budget: 35 },
              ].map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{dept.name}</span>
                    <span className="text-muted-foreground">
                      {dept.hours}/{dept.budget} ساعة
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        dept.hours / dept.budget > 0.8
                          ? 'bg-red-500'
                          : dept.hours / dept.budget > 0.6
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      )}
                      style={{ width: `${(dept.hours / dept.budget) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              تقدير التكاليف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span>إجمالي الساعات المعتمدة</span>
                <span className="font-bold">{stats.totalHours} ساعة</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span>متوسط سعر الساعة</span>
                <span className="font-bold">150 ر.س</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="font-medium">التكلفة التقديرية</span>
                <span className="font-bold text-primary">
                  {(stats.totalHours * 150).toLocaleString('ar-EG')} ر.س
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
