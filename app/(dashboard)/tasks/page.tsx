'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NursingTask } from '@/types'
import {
  ListTodo,
  Plus,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Pill,
  Stethoscope,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Calendar,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const taskTypeConfig = {
  medication: { label: 'دواء', icon: Pill, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  assessment: { label: 'تقييم', icon: Stethoscope, color: 'text-green-600', bgColor: 'bg-green-100' },
  procedure: { label: 'إجراء', icon: MoreHorizontal, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  documentation: { label: 'توثيق', icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  communication: { label: 'تواصل', icon: MessageSquare, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  other: { label: 'أخرى', icon: ListTodo, color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

const priorityConfig = {
  low: { label: 'منخفضة', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'متوسطة', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'عالية', color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'عاجلة', color: 'bg-red-100 text-red-700' },
}

const statusConfig = {
  pending: { label: 'في الانتظار', color: 'text-gray-600' },
  in_progress: { label: 'قيد التنفيذ', color: 'text-blue-600' },
  completed: { label: 'مكتمل', color: 'text-green-600' },
  overdue: { label: 'متأخر', color: 'text-red-600' },
  cancelled: { label: 'ملغي', color: 'text-gray-400' },
}

// Sample Tasks
const sampleTasks: NursingTask[] = [
  {
    id: '1',
    patientId: 'P001',
    patientName: 'أحمد محمد علي',
    department: 'ICU',
    type: 'medication',
    title: 'إعطاء أنسولين',
    description: 'إعطاء 10 وحدات أنسولين تحت الجلد قبل الوجبة',
    priority: 'high',
    assignedTo: 'سارة محمد',
    assignedToId: 'S001',
    dueTime: '2024-01-15T10:00:00.000Z',
    status: 'pending',
  },
  {
    id: '2',
    patientId: 'P002',
    patientName: 'خالد سعيد',
    department: 'الجراحة',
    type: 'assessment',
    title: 'قياس العلامات الحيوية',
    description: 'قياس ضغط الدم، الحرارة، النبض، التنفس',
    priority: 'medium',
    assignedTo: 'سارة محمد',
    assignedToId: 'S001',
    dueTime: '2024-01-15T10:30:00.000Z',
    status: 'in_progress',
  },
  {
    id: '3',
    patientId: 'P003',
    patientName: 'فاطمة أحمد',
    department: 'الباطنية',
    type: 'procedure',
    title: 'تغيير الضمادة',
    description: 'تغيير ضمادة الجرح مع تنظيف',
    priority: 'medium',
    assignedTo: 'نورة علي',
    assignedToId: 'S002',
    dueTime: '2024-01-15T11:00:00.000Z',
    status: 'pending',
  },
  {
    id: '4',
    department: 'ICU',
    type: 'documentation',
    title: 'توثيق تقرير المناوبة',
    description: 'إكمال توثيق تقرير نهاية المناوبة',
    priority: 'low',
    assignedTo: 'سارة محمد',
    assignedToId: 'S001',
    dueTime: '2024-01-15T14:00:00.000Z',
    status: 'pending',
  },
  {
    id: '5',
    patientId: 'P004',
    patientName: 'محمد سالم',
    department: 'ICU',
    type: 'medication',
    title: 'إعطاء مضاد حيوي',
    description: 'إعطاء Vancomycin 1g IV',
    priority: 'urgent',
    assignedTo: 'سارة محمد',
    assignedToId: 'S001',
    dueTime: '2024-01-15T09:00:00.000Z',
    status: 'overdue',
  },
  {
    id: '6',
    patientId: 'P001',
    patientName: 'أحمد محمد علي',
    department: 'ICU',
    type: 'communication',
    title: 'إبلاغ الطبيب',
    description: 'إبلاغ الطبيب المعالج بنتائج التحاليل',
    priority: 'high',
    assignedTo: 'سارة محمد',
    assignedToId: 'S001',
    dueTime: '2024-01-15T12:00:00.000Z',
    status: 'completed',
    completedAt: '2024-01-15T11:45:00.000Z',
    completedBy: 'سارة محمد',
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<NursingTask[]>(sampleTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('active')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Stats
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress')
  const overdueTasks = tasks.filter((t) => t.status === 'overdue')
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed')

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.includes(searchQuery) ||
      (t.patientName?.includes(searchQuery) ?? false)
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && (t.status === 'pending' || t.status === 'in_progress' || t.status === 'overdue')) ||
      t.status === filterStatus
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'completed' ? 'pending' : 'completed',
              completedAt: t.status === 'completed' ? undefined : new Date().toISOString(),
              completedBy: t.status === 'completed' ? undefined : 'المستخدم الحالي',
            }
          : t
      )
    )
  }

  const handleStartTask = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, status: 'in_progress' as const } : t
      )
    )
  }

  // Group tasks by time
  const groupedTasks = filteredTasks.reduce(
    (acc, task) => {
      const hour = new Date(task.dueTime).getHours()
      const key = `${hour}:00`
      if (!acc[key]) acc[key] = []
      acc[key].push(task)
      return acc
    },
    {} as Record<string, NursingTask[]>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">قائمة المهام</h1>
          <p className="text-muted-foreground">
            إدارة ومتابعة المهام التمريضية اليومية
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          مهمة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مهام نشطة</p>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
              </div>
              <ListTodo className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متأخرة</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عاجلة</p>
                <p className="text-2xl font-bold text-amber-600">{urgentTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مكتملة اليوم</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث عن مهمة..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">النشطة</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
                <SelectItem value="overdue">متأخرة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="urgent">عاجلة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="low">منخفضة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {Object.entries(groupedTasks)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([time, timeTasks]) => (
            <div key={time} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {time}
              </h3>
              <div className="space-y-2">
                {timeTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onStart={handleStartTask}
                  />
                ))}
              </div>
            </div>
          ))}
        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد مهام مطابقة
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onToggleComplete,
  onStart,
}: {
  task: NursingTask
  onToggleComplete: (id: string) => void
  onStart: (id: string) => void
}) {
  const typeConfig = taskTypeConfig[task.type]
  const Icon = typeConfig.icon
  const isCompleted = task.status === 'completed'
  const isOverdue = task.status === 'overdue'

  return (
    <Card
      className={cn(
        'transition-all',
        isCompleted && 'opacity-60',
        isOverdue && 'border-red-200 bg-red-50/50 dark:bg-red-950/20'
      )}
    >
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1"
          />
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              typeConfig.bgColor
            )}
          >
            <Icon className={cn('h-5 w-5', typeConfig.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={cn(
                  'font-medium',
                  isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </h4>
              <Badge className={priorityConfig[task.priority].color}>
                {priorityConfig[task.priority].label}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive">متأخر</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            {task.patientName && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                <User className="h-3 w-3" />
                {task.patientName}
              </p>
            )}
          </div>
          <div className="text-left shrink-0">
            <p className="text-sm font-medium">
              {new Date(task.dueTime).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-xs text-muted-foreground">{task.department}</p>
            {task.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => onStart(task.id)}
              >
                ابدأ
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
