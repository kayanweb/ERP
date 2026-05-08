'use client'

import {
  Users,
  Bed,
  UserCheck,
  UserX,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

import { StatsCard } from '@/components/dashboard/stats-card'
import { useLang } from '@/contexts/lang-context'
import { ChartCard } from '@/components/dashboard/chart-card'
import { AlertCard } from '@/components/dashboard/alert-card'
import { Alert } from '@/types'

// Demo data - will be replaced with Firebase data
const stats = {
  totalBeds: 100,
  totalPatients: 57,
  occupancyRate: 57,
  totalStaff: 45,
  absences: 3,
  isolationCases: 4,
}

const departmentData = [
  { name: 'ICU 3rd', nameAr: 'العناية 3', patients: 7, beds: 15, nurses: 5 },
  { name: 'ICU 4th', nameAr: 'العناية 4', patients: 2, beds: 6, nurses: 1 },
  { name: 'CCU', nameAr: 'القلب', patients: 2, beds: 11, nurses: 2 },
  { name: 'ER', nameAr: 'الطوارئ', patients: 29, beds: 11, nurses: 3 },
  { name: 'NICU', nameAr: 'حديثي الولادة', patients: 0, beds: 2, nurses: 1 },
  { name: 'PICU', nameAr: 'أطفال العناية', patients: 3, beds: 4, nurses: 1 },
  { name: '8th Floor', nameAr: 'الطابق 8', patients: 2, beds: 17, nurses: 1 },
  { name: '9th Floor', nameAr: 'الطابق 9', patients: 9, beds: 17, nurses: 2 },
  { name: '11th Floor', nameAr: 'الطابق 11', patients: 1, beds: 14, nurses: 1 },
]

const staffDistribution = [
  { name: 'ممرضين', value: 30, color: 'hsl(var(--chart-1))' },
  { name: 'كبار الممرضين', value: 10, color: 'hsl(var(--chart-2))' },
  { name: 'مشرفين', value: 5, color: 'hsl(var(--chart-3))' },
]

const alerts: Alert[] = [
  {
    id: '1',
    type: 'over_capacity',
    message: 'ER department is over capacity',
    messageAr: 'قسم الطوارئ تجاوز السعة المحددة (29 مريض / 11 سرير)',
    department: 'الطوارئ',
    severity: 'critical',
    timestamp: '2024-01-15T10:30:00.000Z',
  },
  {
    id: '2',
    type: 'low_staff',
    message: 'Low nurse to patient ratio',
    messageAr: 'نسبة الممرضين للمرضى منخفضة في قسم الطابق 9',
    department: 'الطابق 9',
    severity: 'warning',
    timestamp: '2024-01-15T09:30:00.000Z',
  },
  {
    id: '3',
    type: 'isolation',
    message: 'New isolation case registered',
    messageAr: 'تم تسجيل حالة عزل جديدة - CONTACT isolation',
    department: 'ICU 3rd',
    severity: 'warning',
    timestamp: '2024-01-15T08:30:00.000Z',
  },
]

export default function DashboardPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'لوحة التحكم' : 'Dashboard'}</h1>
        <p className="text-muted-foreground">
          {isAr ? 'نظرة عامة على حالة المستشفى والإحصائيات' : 'Hospital status overview and statistics'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title={isAr ? 'إجمالي الأسرة' : 'Total Beds'}
          value={stats.totalBeds}
          icon={Bed}
          variant="default"
        />
        <StatsCard
          title={isAr ? 'إجمالي المرضى' : 'Total Patients'}
          value={stats.totalPatients}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title={isAr ? 'نسبة الإشغال' : 'Occupancy Rate'}
          value={`${stats.occupancyRate}%`}
          icon={Activity}
          variant="primary"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title={isAr ? 'إجمالي الكادر' : 'Total Staff'}
          value={stats.totalStaff}
          icon={UserCheck}
          variant="success"
        />
        <StatsCard
          title={isAr ? 'الغياب' : 'Absences'}
          value={stats.absences}
          icon={UserX}
          variant="warning"
        />
        <StatsCard
          title={isAr ? 'حالات العزل' : 'Isolation Cases'}
          value={stats.isolationCases}
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Patients per Department */}
        <ChartCard
          title="المرضى حسب الأقسام"
          subtitle="توزيع المرضى على أقسام المستشفى"
          className="lg:col-span-2"
        >
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis
                  dataKey={isAr ? 'nameAr' : 'name'}
                  type="category"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'patients' ? 'المرضى' : name === 'beds' ? 'الأسرة' : name,
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === 'patients' ? 'المرضى' : value === 'beds' ? 'الأسرة' : value
                  }
                />
                <Bar dataKey="patients" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="beds" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Pie Chart - Staff Distribution */}
        <ChartCard title="توزيع الكادر التمريضي" subtitle="حسب المستوى الوظيفي">
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={staffDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {staffDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Alerts Panel */}
      <AlertCard alerts={alerts} />

      {/* Department Overview Table */}
      <ChartCard title="نظرة عامة على الأقسام" subtitle="حالة كل قسم في الوقت الحالي">
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4 font-semibold text-sm">القسم</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">الأسرة</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">المرضى</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">الممرضين</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">الإشغال</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept) => {
                const occupancy = Math.round((dept.patients / dept.beds) * 100)
                const isOverCapacity = dept.patients > dept.beds
                const isHighOccupancy = occupancy >= 80

                return (
                  <tr key={dept.name} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{dept.nameAr}</td>
                    <td className="py-3 px-4">{dept.beds}</td>
                    <td className="py-3 px-4">{dept.patients}</td>
                    <td className="py-3 px-4">{dept.nurses}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className={`h-full rounded-full ${
                              isOverCapacity
                                ? 'bg-destructive'
                                : isHighOccupancy
                                ? 'bg-warning'
                                : 'bg-success'
                            }`}
                            style={{ width: `${Math.min(occupancy, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{occupancy}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOverCapacity
                            ? 'bg-destructive/10 text-destructive'
                            : isHighOccupancy
                            ? 'bg-warning/10 text-warning'
                            : 'bg-success/10 text-success'
                        }`}
                      >
                        {isOverCapacity ? 'تجاوز السعة' : isHighOccupancy ? 'مرتفع' : 'طبيعي'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
