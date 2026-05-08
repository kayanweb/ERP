'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Star,
  Search,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Users,
  Calendar,
  FileText,
  ChevronLeft,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StaffPerformance {
  id: string
  name: string
  department: string
  position: string
  avatar?: string
  overallScore: number
  previousScore: number
  metrics: {
    attendance: number
    patientCare: number
    teamwork: number
    documentation: number
    communication: number
    professionalism: number
  }
  achievements: string[]
  improvements: string[]
  lastReview: string
  nextReview: string
}

const samplePerformances: StaffPerformance[] = [
  {
    id: '1',
    name: 'سارة أحمد الخالدي',
    department: 'الطوارئ',
    position: 'ممرضة أولى',
    overallScore: 92,
    previousScore: 88,
    metrics: {
      attendance: 95,
      patientCare: 94,
      teamwork: 90,
      documentation: 88,
      communication: 92,
      professionalism: 96,
    },
    achievements: [
      'حصلت على شهادة BLS المتقدمة',
      'صفر حوادث سلامة خلال الربع',
      'تدريب 3 ممرضات جدد',
    ],
    improvements: ['تحسين سرعة التوثيق'],
    lastReview: '2024-01-01',
    nextReview: '2024-04-01',
  },
  {
    id: '2',
    name: 'محمد علي حسن',
    department: 'العناية المركزة',
    position: 'ممرض',
    overallScore: 78,
    previousScore: 82,
    metrics: {
      attendance: 72,
      patientCare: 85,
      teamwork: 80,
      documentation: 75,
      communication: 78,
      professionalism: 80,
    },
    achievements: ['إكمال دورة العناية الحرجة'],
    improvements: [
      'تحسين الالتزام بالمواعيد',
      'زيادة دقة التوثيق',
      'تطوير مهارات القيادة',
    ],
    lastReview: '2024-01-01',
    nextReview: '2024-04-01',
  },
  {
    id: '3',
    name: 'فاطمة خالد العمري',
    department: 'الباطنية',
    position: 'مشرفة تمريض',
    overallScore: 96,
    previousScore: 94,
    metrics: {
      attendance: 98,
      patientCare: 96,
      teamwork: 95,
      documentation: 94,
      communication: 97,
      professionalism: 98,
    },
    achievements: [
      'قيادة مبادرة تحسين الجودة',
      'أفضل مشرفة للربع الأول',
      'تطوير بروتوكول جديد للتوثيق',
    ],
    improvements: [],
    lastReview: '2024-01-01',
    nextReview: '2024-04-01',
  },
]

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-500'
  if (score >= 75) return 'text-yellow-500'
  if (score >= 60) return 'text-orange-500'
  return 'text-red-500'
}

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'ممتاز'
  if (score >= 75) return 'جيد جداً'
  if (score >= 60) return 'جيد'
  return 'يحتاج تحسين'
}

const getTrend = (current: number, previous: number) => {
  const diff = current - previous
  if (diff > 0) {
    return {
      icon: <TrendingUp className="h-4 w-4" />,
      label: `+${diff}`,
      color: 'text-green-500',
    }
  }
  if (diff < 0) {
    return {
      icon: <TrendingDown className="h-4 w-4" />,
      label: `${diff}`,
      color: 'text-red-500',
    }
  }
  return { icon: null, label: '0', color: 'text-muted-foreground' }
}

const metricLabels: Record<string, string> = {
  attendance: 'الحضور والانضباط',
  patientCare: 'رعاية المرضى',
  teamwork: 'العمل الجماعي',
  documentation: 'التوثيق',
  communication: 'التواصل',
  professionalism: 'المهنية',
}

export default function PerformancePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStaff, setSelectedStaff] = useState<StaffPerformance | null>(null)

  const filteredStaff = samplePerformances.filter((staff) => {
    const matchesSearch = staff.name.includes(searchTerm)
    const matchesDepartment =
      selectedDepartment === 'all' || staff.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const averageScore =
    samplePerformances.reduce((sum, s) => sum + s.overallScore, 0) /
    samplePerformances.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            تقييم الأداء
          </h1>
          <p className="text-muted-foreground">
            متابعة وتقييم أداء طاقم التمريض
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 ml-2" />
          تقرير الأداء الشامل
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{samplePerformances.length}</p>
                <p className="text-xs text-muted-foreground">إجمالي الموظفين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', getScoreColor(averageScore))}>
                  {averageScore.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">متوسط التقييم</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {samplePerformances.filter((s) => s.overallScore >= 90).length}
                </p>
                <p className="text-xs text-muted-foreground">أداء ممتاز</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {samplePerformances.filter((s) => s.overallScore < 75).length}
                </p>
                <p className="text-xs text-muted-foreground">يحتاج متابعة</p>
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
            placeholder="بحث بالاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأقسام</SelectItem>
            <SelectItem value="الطوارئ">الطوارئ</SelectItem>
            <SelectItem value="العناية المركزة">العناية المركزة</SelectItem>
            <SelectItem value="الباطنية">الباطنية</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Staff Performance List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredStaff.map((staff) => {
            const trend = getTrend(staff.overallScore, staff.previousScore)
            return (
              <Card
                key={staff.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedStaff?.id === staff.id && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedStaff(staff)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {staff.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{staff.name}</h3>
                        <div className={cn('flex items-center gap-1', trend.color)}>
                          {trend.icon}
                          <span className="text-sm">{trend.label}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {staff.position} • {staff.department}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={staff.overallScore} className="flex-1 h-2" />
                        <span
                          className={cn(
                            'text-sm font-bold',
                            getScoreColor(staff.overallScore)
                          )}
                        >
                          {staff.overallScore}%
                        </span>
                      </div>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Staff Detail */}
        <div className="lg:col-span-2">
          {selectedStaff ? (
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {selectedStaff.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle>{selectedStaff.name}</CardTitle>
                    <CardDescription>
                      {selectedStaff.position} • {selectedStaff.department}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge
                        className={cn(
                          selectedStaff.overallScore >= 90
                            ? 'bg-green-500'
                            : selectedStaff.overallScore >= 75
                            ? 'bg-yellow-500'
                            : 'bg-orange-500'
                        )}
                      >
                        {getScoreLabel(selectedStaff.overallScore)}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        التقييم القادم:{' '}
                        {new Date(selectedStaff.nextReview).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        'text-4xl font-bold',
                        getScoreColor(selectedStaff.overallScore)
                      )}
                    >
                      {selectedStaff.overallScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">التقييم العام</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Performance Metrics */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    مؤشرات الأداء
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedStaff.metrics).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metricLabels[key]}</span>
                          <span className={getScoreColor(value)}>{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                {selectedStaff.achievements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                      <ThumbsUp className="h-4 w-4" />
                      الإنجازات
                    </h4>
                    <ul className="space-y-2">
                      {selectedStaff.achievements.map((achievement, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded-lg"
                        >
                          <Star className="h-4 w-4 text-green-500 shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas for Improvement */}
                {selectedStaff.improvements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      مجالات التحسين
                    </h4>
                    <ul className="space-y-2">
                      {selectedStaff.improvements.map((improvement, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm bg-orange-50 p-2 rounded-lg"
                        >
                          <Target className="h-4 w-4 text-orange-500 shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="h-4 w-4 ml-2" />
                    إضافة ملاحظة
                  </Button>
                  <Button className="flex-1">
                    <FileText className="h-4 w-4 ml-2" />
                    تقييم جديد
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <Award className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">اختر موظفاً لعرض تفاصيل الأداء</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
