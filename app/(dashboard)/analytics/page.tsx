'use client'

import * as React from 'react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, TrendingDown, Users, Bed, Activity, AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartCard } from '@/components/dashboard/chart-card'

// Demo data - will be replaced with Firebase
const occupancyTrend = [
  { date: '1/1', occupancy: 65, patients: 65 },
  { date: '2/1', occupancy: 68, patients: 68 },
  { date: '3/1', occupancy: 62, patients: 62 },
  { date: '4/1', occupancy: 70, patients: 70 },
  { date: '5/1', occupancy: 75, patients: 75 },
  { date: '6/1', occupancy: 72, patients: 72 },
  { date: '7/1', occupancy: 78, patients: 78 },
  { date: '8/1', occupancy: 74, patients: 74 },
  { date: '9/1', occupancy: 80, patients: 80 },
  { date: '10/1', occupancy: 77, patients: 77 },
  { date: '11/1', occupancy: 82, patients: 82 },
  { date: '12/1', occupancy: 79, patients: 79 },
  { date: '13/1', occupancy: 85, patients: 85 },
  { date: '14/1', occupancy: 57, patients: 57 },
]

const nursePatientRatio = [
  { department: 'ICU 3rd', ratio: 1.4, target: 2 },
  { department: 'ICU 4th', ratio: 2.0, target: 2 },
  { department: 'CCU', ratio: 1.0, target: 2 },
  { department: 'ER', ratio: 9.7, target: 4 },
  { department: 'NICU', ratio: 0, target: 2 },
  { department: 'PICU', ratio: 3.0, target: 2 },
]

const shiftComparison = [
  { name: 'صباحي', patients: 57, staff: 25, incidents: 2 },
  { name: 'مسائي', patients: 62, staff: 22, incidents: 3 },
  { name: 'ليلي', patients: 55, staff: 18, incidents: 1 },
]

const departmentPerformance = [
  { name: 'ICU 3rd', score: 92 },
  { name: 'ICU 4th', score: 88 },
  { name: 'CCU', score: 95 },
  { name: 'ER', score: 78 },
  { name: 'NICU', score: 90 },
  { name: 'PICU', score: 85 },
]

const kpiData = [
  {
    title: 'متوسط نسبة الإشغال',
    value: '73%',
    change: 5.2,
    isPositive: true,
    icon: Bed,
  },
  {
    title: 'متوسط مدة الإقامة',
    value: '4.2 يوم',
    change: -8.3,
    isPositive: true,
    icon: Activity,
  },
  {
    title: 'نسبة الممرضين/المرضى',
    value: '1:3.5',
    change: 2.1,
    isPositive: false,
    icon: Users,
  },
  {
    title: 'حوادث هذا الشهر',
    value: '6',
    change: -25,
    isPositive: true,
    icon: AlertTriangle,
  },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState('week')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">التحليلات والإحصائيات</h1>
          <p className="text-muted-foreground">تحليل أداء المستشفى ومؤشرات الأداء الرئيسية</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">آخر أسبوع</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
            <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
            <SelectItem value="year">آخر سنة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {kpi.isPositive ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <span
                        className={
                          kpi.isPositive ? 'text-success' : 'text-destructive'
                        }
                      >
                        {Math.abs(kpi.change)}%
                      </span>
                      <span className="text-muted-foreground">من الشهر الماضي</span>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trend */}
        <ChartCard
          title="اتجاه نسبة الإشغال"
          subtitle="نسبة الإشغال اليومية خلال الفترة المحددة"
        >
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyTrend}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'نسبة الإشغال']}
                />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#occupancyGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Nurse to Patient Ratio */}
        <ChartCard
          title="نسبة الممرضين للمرضى"
          subtitle="مقارنة النسبة الفعلية بالنسبة المستهدفة"
        >
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nursePatientRatio} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis dataKey="department" type="category" width={70} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}:1`,
                    name === 'ratio' ? 'النسبة الفعلية' : 'المستهدف',
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === 'ratio' ? 'النسبة الفعلية' : 'المستهدف'
                  }
                />
                <Bar dataKey="ratio" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="target" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shift Comparison */}
        <ChartCard
          title="مقارنة الشفتات"
          subtitle="إحصائيات كل شفت"
        >
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'patients' ? 'المرضى' : name === 'staff' ? 'الكادر' : 'الحوادث',
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === 'patients' ? 'المرضى' : value === 'staff' ? 'الكادر' : 'الحوادث'
                  }
                />
                <Bar dataKey="patients" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="staff" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="incidents" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Department Performance */}
        <ChartCard
          title="أداء الأقسام"
          subtitle="مؤشر الأداء لكل قسم"
          className="lg:col-span-2"
        >
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'مؤشر الأداء']}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {departmentPerformance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.score >= 90
                          ? 'hsl(var(--success))'
                          : entry.score >= 80
                          ? 'hsl(var(--chart-1))'
                          : 'hsl(var(--warning))'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
