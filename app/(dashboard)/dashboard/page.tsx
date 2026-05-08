'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Users,
  Bed,
  UserCheck,
  UserX,
  AlertTriangle,
  Activity,
  RefreshCw,
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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { departmentsService } from '@/lib/services/departments.service'
import { employeesService } from '@/lib/services/employees.service'
import { patientsService } from '@/lib/services/patients.service'
import { attendanceService } from '@/lib/services/attendance.service'
import type { DepartmentRecord, EmployeeRecord, PatientRecord, AttendanceRecord } from '@/lib/repositories/contracts'
import type { Alert } from '@/types'

export default function DashboardPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<DepartmentRecord[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [depts, emps, pats, att] = await Promise.all([
        departmentsService.getAll(),
        employeesService.getAll(),
        patientsService.getAll(),
        attendanceService.getTodayRecords()
      ])
      setDepartments(depts)
      setEmployees(emps)
      setPatients(pats)
      setAttendance(att)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calculate stats from real data
  const stats = useMemo(() => {
    const activeEmployees = employees.filter(e => e.status === 'active')
    const admittedPatients = patients.filter(p => p.status === 'admitted')
    const isolationPatients = patients.filter(p => p.isolationStatus && p.isolationStatus !== 'none')
    const totalBeds = departments.reduce((sum, d) => sum + d.totalBeds, 0)
    const occupancyRate = totalBeds > 0 ? Math.round((admittedPatients.length / totalBeds) * 100) : 0
    
    // Count absences from today's attendance
    const todayAbsences = attendance.filter(a => a.status === 'absent').length

    return {
      totalBeds,
      totalPatients: admittedPatients.length,
      occupancyRate,
      totalStaff: activeEmployees.length,
      absences: todayAbsences,
      isolationCases: isolationPatients.length,
    }
  }, [departments, employees, patients, attendance])

  // Calculate department data for charts
  const departmentData = useMemo(() => {
    return departments.map(dept => {
      const deptPatients = patients.filter(p => p.departmentId === dept.id && p.status === 'admitted')
      const deptEmployees = employees.filter(e => e.departmentId === dept.id && e.status === 'active')
      return {
        name: dept.name,
        nameAr: dept.nameAr || dept.name,
        patients: deptPatients.length,
        beds: dept.totalBeds,
        nurses: deptEmployees.length,
      }
    }).filter(d => d.beds > 0)
  }, [departments, patients, employees])

  // Calculate staff distribution
  const staffDistribution = useMemo(() => {
    const activeStaff = employees.filter(e => e.status === 'active')
    const nurses = activeStaff.filter(e => e.level === 'nurse' || !e.level).length
    const seniorNurses = activeStaff.filter(e => e.level === 'senior').length
    const supervisors = activeStaff.filter(e => e.level === 'supervisor' || e.level === 'head').length
    
    return [
      { name: 'ممرضين', value: nurses || activeStaff.length, color: 'hsl(var(--chart-1))' },
      { name: 'كبار الممرضين', value: seniorNurses || Math.floor(activeStaff.length * 0.2), color: 'hsl(var(--chart-2))' },
      { name: 'مشرفين', value: supervisors || Math.floor(activeStaff.length * 0.1), color: 'hsl(var(--chart-3))' },
    ].filter(s => s.value > 0)
  }, [employees])

  // Generate alerts based on real data
  const alerts: Alert[] = useMemo(() => {
    const generatedAlerts: Alert[] = []

    // Check for over-capacity departments
    departmentData.forEach(dept => {
      if (dept.patients > dept.beds) {
        generatedAlerts.push({
          id: `over-${dept.name}`,
          type: 'over_capacity',
          message: `${dept.name} department is over capacity`,
          messageAr: `قسم ${dept.nameAr} تجاوز السعة المحددة (${dept.patients} مريض / ${dept.beds} سرير)`,
          department: dept.nameAr,
          severity: 'critical',
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Check for low staff ratios
    departmentData.forEach(dept => {
      if (dept.patients > 0 && dept.nurses > 0) {
        const ratio = dept.patients / dept.nurses
        if (ratio > 6) {
          generatedAlerts.push({
            id: `ratio-${dept.name}`,
            type: 'low_staff',
            message: `Low nurse to patient ratio in ${dept.name}`,
            messageAr: `نسبة الممرضين للمرضى منخفضة في قسم ${dept.nameAr}`,
            department: dept.nameAr,
            severity: 'warning',
            timestamp: new Date().toISOString(),
          })
        }
      }
    })

    // Check for isolation cases
    const isolationPatients = patients.filter(p => p.isolationStatus && p.isolationStatus !== 'none')
    isolationPatients.slice(0, 2).forEach(p => {
      generatedAlerts.push({
        id: `isolation-${p.id}`,
        type: 'isolation',
        message: `Isolation case: ${p.isolationStatus}`,
        messageAr: `حالة عزل جديدة - ${p.isolationStatus?.toUpperCase()} isolation`,
        department: p.departmentId,
        severity: 'warning',
        timestamp: new Date().toISOString(),
      })
    })

    return generatedAlerts.slice(0, 5) // Limit to 5 alerts
  }, [departmentData, patients])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'لوحة التحكم' : 'Dashboard'}</h1>
          <p className="text-muted-foreground">
            {isAr ? 'نظرة عامة على حالة المستشفى والإحصائيات' : 'Hospital status overview and statistics'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 ml-2" />
          {isAr ? 'تحديث' : 'Refresh'}
        </Button>
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
            {departmentData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                لا توجد بيانات للأقسام
              </div>
            ) : (
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
            )}
          </div>
        </ChartCard>

        {/* Pie Chart - Staff Distribution */}
        <ChartCard title="توزيع الكادر التمريضي" subtitle="حسب المستوى الوظيفي">
          <div className="h-[300px] mt-4">
            {staffDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                لا توجد بيانات للكادر
              </div>
            ) : (
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
            )}
          </div>
        </ChartCard>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && <AlertCard alerts={alerts} />}

      {/* Department Overview Table */}
      <ChartCard title="نظرة عامة على الأقسام" subtitle="حالة كل قسم في الوقت الحالي">
        <div className="overflow-x-auto mt-4">
          {departmentData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات للأقسام
            </div>
          ) : (
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
                  const occupancy = dept.beds > 0 ? Math.round((dept.patients / dept.beds) * 100) : 0
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
          )}
        </div>
      </ChartCard>
    </div>
  )
}
