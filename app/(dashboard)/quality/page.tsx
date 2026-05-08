'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  CheckCircle2,
  Users,
  Shield,
  Heart,
  Bug,
  Bed,
  Clock,
  Download,
  Calendar,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { cn } from '@/lib/utils'

// Quality Indicators Data
const qualityIndicators = [
  {
    id: '1',
    name: 'معدل السقوط',
    nameEn: 'Fall Rate',
    category: 'patient_safety',
    value: 1.2,
    target: 2.0,
    unit: 'لكل 1000 يوم مريض',
    trend: 'down' as const,
    previousValue: 1.8,
    description: 'عدد حالات السقوط لكل 1000 يوم مريض',
  },
  {
    id: '2',
    name: 'عدوى الدم المرتبطة بالقسطرة',
    nameEn: 'CLABSI',
    category: 'clinical',
    value: 0.8,
    target: 1.0,
    unit: 'لكل 1000 يوم قسطرة',
    trend: 'stable' as const,
    previousValue: 0.9,
    description: 'Central Line-Associated Bloodstream Infection',
  },
  {
    id: '3',
    name: 'التهاب المسالك البولية',
    nameEn: 'CAUTI',
    category: 'clinical',
    value: 1.5,
    target: 1.2,
    unit: 'لكل 1000 يوم قسطرة',
    trend: 'up' as const,
    previousValue: 1.2,
    description: 'Catheter-Associated Urinary Tract Infection',
  },
  {
    id: '4',
    name: 'قرحة الضغط',
    nameEn: 'Pressure Ulcer Rate',
    category: 'patient_safety',
    value: 2.1,
    target: 2.5,
    unit: '%',
    trend: 'down' as const,
    previousValue: 2.8,
    description: 'نسبة قرحة الضغط المكتسبة في المستشفى',
  },
  {
    id: '5',
    name: 'نسبة الممرضين للمرضى',
    nameEn: 'Nurse-Patient Ratio',
    category: 'operational',
    value: 1,
    target: 1,
    unit: ': 4',
    trend: 'stable' as const,
    previousValue: 1,
    description: 'متوسط نسبة الممرضين للمرضى',
  },
  {
    id: '6',
    name: 'معدل دوران الموظفين',
    nameEn: 'Staff Turnover',
    category: 'staff',
    value: 8.5,
    target: 10,
    unit: '%',
    trend: 'down' as const,
    previousValue: 12,
    description: 'معدل دوران الموظفين السنوي',
  },
  {
    id: '7',
    name: 'رضا المرضى',
    nameEn: 'Patient Satisfaction',
    category: 'patient_safety',
    value: 87,
    target: 85,
    unit: '%',
    trend: 'up' as const,
    previousValue: 82,
    description: 'نسبة رضا المرضى عن الخدمات التمريضية',
  },
  {
    id: '8',
    name: 'معدل إشغال الأسرة',
    nameEn: 'Bed Occupancy',
    category: 'operational',
    value: 78,
    target: 85,
    unit: '%',
    trend: 'stable' as const,
    previousValue: 76,
    description: 'نسبة إشغال الأسرة',
  },
]

// Monthly Trends Data
const monthlyTrends = [
  { month: 'يناير', falls: 1.8, infections: 0.9, satisfaction: 82 },
  { month: 'فبراير', falls: 1.6, infections: 1.0, satisfaction: 83 },
  { month: 'مارس', falls: 1.5, infections: 0.8, satisfaction: 84 },
  { month: 'أبريل', falls: 1.4, infections: 0.9, satisfaction: 85 },
  { month: 'مايو', falls: 1.3, infections: 0.7, satisfaction: 86 },
  { month: 'يونيو', falls: 1.2, infections: 0.8, satisfaction: 87 },
]

// Department Comparison
const departmentComparison = [
  { department: 'ICU', falls: 0.5, infections: 1.2, satisfaction: 90 },
  { department: 'الجراحة', falls: 1.8, infections: 0.6, satisfaction: 85 },
  { department: 'الباطنية', falls: 2.1, infections: 0.9, satisfaction: 82 },
  { department: 'الطوارئ', falls: 1.5, infections: 0.4, satisfaction: 78 },
  { department: 'الأطفال', falls: 0.8, infections: 0.5, satisfaction: 92 },
]

// Compliance Data
const complianceData = [
  { name: 'نظافة اليدين', value: 94, target: 95 },
  { name: 'توثيق الأدوية', value: 98, target: 95 },
  { name: 'تقييم السقوط', value: 92, target: 90 },
  { name: 'تقييم الألم', value: 88, target: 90 },
  { name: 'خطة الرعاية', value: 95, target: 95 },
  { name: 'تثقيف المريض', value: 85, target: 90 },
]

// Radar Chart Data
const radarData = [
  { subject: 'السلامة', A: 92, fullMark: 100 },
  { subject: 'الجودة', A: 88, fullMark: 100 },
  { subject: 'الكفاءة', A: 85, fullMark: 100 },
  { subject: 'رضا المريض', A: 87, fullMark: 100 },
  { subject: 'التوثيق', A: 95, fullMark: 100 },
  { subject: 'التدريب', A: 82, fullMark: 100 },
]

const COLORS = ['#0d9488', '#0891b2', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899']

const categoryConfig = {
  patient_safety: { label: 'سلامة المريض', icon: Shield, color: 'text-green-600' },
  clinical: { label: 'سريرية', icon: Heart, color: 'text-red-600' },
  operational: { label: 'تشغيلية', icon: Activity, color: 'text-blue-600' },
  staff: { label: 'الموظفين', icon: Users, color: 'text-purple-600' },
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

export default function QualityPage() {
  const achievedTargets = qualityIndicators.filter(
    (i) => (i.trend === 'down' ? i.value <= i.target : i.value >= i.target)
  ).length
  const totalIndicators = qualityIndicators.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">مؤشرات الجودة والامتثال</h1>
          <p className="text-muted-foreground">
            لوحة متابعة مؤشرات الأداء الرئيسية ومعايير الجودة
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="current">
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">الشهر الحالي</SelectItem>
              <SelectItem value="quarter">الربع الحالي</SelectItem>
              <SelectItem value="year">السنة الحالية</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الأهداف المحققة</p>
                <p className="text-3xl font-bold text-green-600">
                  {achievedTargets}/{totalIndicators}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Target className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">رضا المرضى</p>
                <p className="text-3xl font-bold text-blue-600">87%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مؤشرات تحتاج تحسين</p>
                <p className="text-3xl font-bold text-amber-600">
                  {totalIndicators - achievedTargets}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الامتثال العام</p>
                <p className="text-3xl font-bold text-purple-600">92%</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="indicators" className="space-y-6">
        <TabsList>
          <TabsTrigger value="indicators">المؤشرات</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="compliance">الامتثال</TabsTrigger>
          <TabsTrigger value="comparison">مقارنة الأقسام</TabsTrigger>
        </TabsList>

        {/* Indicators Tab */}
        <TabsContent value="indicators" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {qualityIndicators.map((indicator) => {
              const category = categoryConfig[indicator.category as keyof typeof categoryConfig]
              const TrendIcon = trendIcons[indicator.trend]
              const isAchieved =
                indicator.trend === 'down'
                  ? indicator.value <= indicator.target
                  : indicator.value >= indicator.target
              const progress = Math.min(
                (indicator.value / indicator.target) * 100,
                100
              )

              return (
                <Card key={indicator.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-xs">
                        {category.label}
                      </Badge>
                      <TrendIcon
                        className={cn(
                          'h-4 w-4',
                          indicator.trend === 'up' && 'text-green-500',
                          indicator.trend === 'down' && 'text-red-500',
                          indicator.trend === 'stable' && 'text-gray-500'
                        )}
                      />
                    </div>
                    <CardTitle className="text-sm font-medium mt-2">
                      {indicator.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{indicator.value}</span>
                        <span className="text-sm text-muted-foreground">
                          {indicator.unit}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>الهدف: {indicator.target}</span>
                          <span
                            className={cn(
                              isAchieved ? 'text-green-600' : 'text-amber-600'
                            )}
                          >
                            {isAchieved ? 'محقق' : 'غير محقق'}
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className={cn(
                            'h-2',
                            isAchieved ? '[&>div]:bg-green-500' : '[&>div]:bg-amber-500'
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>اتجاه معدل السقوط والعدوى</CardTitle>
                <CardDescription>آخر 6 أشهر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="falls"
                        stroke="#f97316"
                        name="معدل السقوط"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="infections"
                        stroke="#ef4444"
                        name="معدل العدوى"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>اتجاه رضا المرضى</CardTitle>
                <CardDescription>آخر 6 أشهر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[70, 100]} />
                      <Tooltip />
                      <Bar
                        dataKey="satisfaction"
                        fill="#0d9488"
                        name="رضا المرضى %"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>نسب الامتثال</CardTitle>
                <CardDescription>مقارنة بالأهداف المحددة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.map((item, index) => {
                    const isAchieved = item.value >= item.target
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span
                            className={cn(
                              'font-bold',
                              isAchieved ? 'text-green-600' : 'text-amber-600'
                            )}
                          >
                            {item.value}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress
                            value={item.value}
                            className={cn(
                              'h-3',
                              isAchieved
                                ? '[&>div]:bg-green-500'
                                : '[&>div]:bg-amber-500'
                            )}
                          />
                          <div
                            className="absolute top-0 h-3 w-0.5 bg-gray-800 dark:bg-white"
                            style={{ left: `${item.target}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          الهدف: {item.target}%
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نظرة عامة على الأداء</CardTitle>
                <CardDescription>تقييم شامل للمجالات الرئيسية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="الأداء الحالي"
                        dataKey="A"
                        stroke="#0d9488"
                        fill="#0d9488"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة الأقسام</CardTitle>
              <CardDescription>مقارنة المؤشرات الرئيسية بين الأقسام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentComparison} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="department" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="falls"
                      fill="#f97316"
                      name="معدل السقوط"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="infections"
                      fill="#ef4444"
                      name="معدل العدوى"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-5">
            {departmentComparison.map((dept, index) => (
              <Card key={index}>
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold mb-2">{dept.department}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رضا المرضى</span>
                      <span className="font-medium text-green-600">{dept.satisfaction}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">السقوط</span>
                      <span className="font-medium">{dept.falls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">العدوى</span>
                      <span className="font-medium">{dept.infections}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
