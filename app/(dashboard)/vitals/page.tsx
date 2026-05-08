'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
import { toast } from 'sonner'
import {
  HeartPulse,
  Plus,
  Thermometer,
  Activity,
  Wind,
  Droplets,
  AlertTriangle,
  User,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { vitalsService } from '@/lib/services/vitals.service'
import { patientsService } from '@/lib/services/patients.service'
import type { VitalSignsRecord, PatientRecord } from '@/lib/repositories/contracts'

// Normal ranges
const normalRanges = {
  temperature: { min: 36.1, max: 37.5, unit: '°C' },
  bloodPressureSystolic: { min: 90, max: 140, unit: 'mmHg' },
  bloodPressureDiastolic: { min: 60, max: 90, unit: 'mmHg' },
  heartRate: { min: 60, max: 100, unit: 'bpm' },
  respiratoryRate: { min: 12, max: 20, unit: '/min' },
  oxygenSaturation: { min: 95, max: 100, unit: '%' },
  painLevel: { min: 0, max: 3, unit: '/10' },
}

function isAbnormal(key: keyof typeof normalRanges, value: number): boolean {
  const range = normalRanges[key]
  return value < range.min || value > range.max
}

export default function VitalsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [vitals, setVitals] = useState<VitalSignsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newVitals, setNewVitals] = useState({
    temperature: '',
    systolic: '',
    diastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    painLevel: '',
    notes: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const pats = await patientsService.getAll()
      const admittedPatients = pats.filter(p => p.status === 'admitted' || p.status === 'critical')
      setPatients(admittedPatients)
      
      if (admittedPatients.length > 0 && !selectedPatient) {
        setSelectedPatient(admittedPatients[0].id)
      }
    } catch (error) {
      console.error('Error loading patients:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [selectedPatient])

  const loadVitals = useCallback(async () => {
    if (!selectedPatient) return
    try {
      const v = await vitalsService.getByPatientId(selectedPatient)
      setVitals(v.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
    } catch (error) {
      console.error('Error loading vitals:', error)
    }
  }, [selectedPatient])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    loadVitals()
  }, [loadVitals])

  const currentPatient = patients.find(p => p.id === selectedPatient)
  const latestVitals = vitals[vitals.length - 1]

  // Chart data
  const chartData = useMemo(() => vitals.map(v => ({
    time: new Date(v.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    temperature: v.temperature,
    heartRate: v.heartRate,
    oxygenSaturation: v.oxygenSaturation,
    systolic: v.bloodPressureSystolic,
    diastolic: v.bloodPressureDiastolic,
  })), [vitals])

  const handleRecordVitals = async () => {
    if (!selectedPatient) {
      toast.error('يرجى اختيار المريض')
      return
    }

    setSaving(true)
    try {
      await vitalsService.create({
        patientId: selectedPatient,
        timestamp: new Date().toISOString(),
        temperature: parseFloat(newVitals.temperature) || 0,
        bloodPressureSystolic: parseInt(newVitals.systolic) || 0,
        bloodPressureDiastolic: parseInt(newVitals.diastolic) || 0,
        heartRate: parseInt(newVitals.heartRate) || 0,
        respiratoryRate: parseInt(newVitals.respiratoryRate) || 0,
        oxygenSaturation: parseInt(newVitals.oxygenSaturation) || 0,
        painLevel: parseInt(newVitals.painLevel) || 0,
        notes: newVitals.notes,
        recordedBy: 'المستخدم الحالي',
      })

      toast.success('تم تسجيل القراءة')
      setIsDialogOpen(false)
      setNewVitals({
        temperature: '',
        systolic: '',
        diastolic: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        painLevel: '',
        notes: '',
      })
      loadVitals()
    } catch (error) {
      console.error('Error saving vitals:', error)
      toast.error('حدث خطأ في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-20" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">العلامات الحيوية</h1>
          <p className="text-muted-foreground">
            مراقبة وتسجيل العلامات الحيوية للمرضى
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="اختر المريض" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.nameAr} - {patient.bedNumber || patient.mrn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => { loadData(); loadVitals() }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2" disabled={!selectedPatient}>
            <Plus className="h-4 w-4" />
            تسجيل قراءة
          </Button>
        </div>
      </div>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>لا يوجد مرضى مقيمين حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Patient Info */}
          {currentPatient && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentPatient.nameAr}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentPatient.mrn} | {currentPatient.departmentId} | سرير {currentPatient.bedNumber || '-'}
                    </p>
                  </div>
                  {latestVitals && (
                    <div className="mr-auto text-left">
                      <p className="text-sm text-muted-foreground">آخر قراءة</p>
                      <p className="text-sm font-medium">
                        {new Date(latestVitals.timestamp).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Vitals Cards */}
          {latestVitals ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <VitalCard
                icon={Thermometer}
                label="الحرارة"
                value={latestVitals.temperature}
                unit="°C"
                isAbnormal={isAbnormal('temperature', latestVitals.temperature)}
                normalRange="36.1 - 37.5"
              />
              <VitalCard
                icon={Activity}
                label="ضغط الدم"
                value={`${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}`}
                unit="mmHg"
                isAbnormal={
                  isAbnormal('bloodPressureSystolic', latestVitals.bloodPressureSystolic) ||
                  isAbnormal('bloodPressureDiastolic', latestVitals.bloodPressureDiastolic)
                }
                normalRange="90-140/60-90"
              />
              <VitalCard
                icon={HeartPulse}
                label="النبض"
                value={latestVitals.heartRate}
                unit="bpm"
                isAbnormal={isAbnormal('heartRate', latestVitals.heartRate)}
                normalRange="60 - 100"
              />
              <VitalCard
                icon={Wind}
                label="التنفس"
                value={latestVitals.respiratoryRate}
                unit="/min"
                isAbnormal={isAbnormal('respiratoryRate', latestVitals.respiratoryRate)}
                normalRange="12 - 20"
              />
              <VitalCard
                icon={Droplets}
                label="الأكسجين"
                value={latestVitals.oxygenSaturation}
                unit="%"
                isAbnormal={isAbnormal('oxygenSaturation', latestVitals.oxygenSaturation)}
                normalRange="95 - 100"
              />
              <VitalCard
                icon={AlertTriangle}
                label="الألم"
                value={latestVitals.painLevel}
                unit="/10"
                isAbnormal={isAbnormal('painLevel', latestVitals.painLevel)}
                normalRange="0 - 3"
              />
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                لا توجد قراءات مسجلة لهذا المريض
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          {chartData.length > 1 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">الحرارة والنبض</CardTitle>
                  <CardDescription>تتبع خلال اليوم</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis yAxisId="left" domain={[35, 40]} />
                        <YAxis yAxisId="right" orientation="right" domain={[50, 120]} />
                        <Tooltip />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="temperature"
                          stroke="#ef4444"
                          name="الحرارة"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="heartRate"
                          stroke="#3b82f6"
                          name="النبض"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ضغط الدم</CardTitle>
                  <CardDescription>الانقباضي والانبساطي</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={[50, 160]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="systolic"
                          stroke="#8b5cf6"
                          name="الانقباضي"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="diastolic"
                          stroke="#06b6d4"
                          name="الانبساطي"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* History Table */}
          {vitals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>سجل القراءات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-2 text-right font-medium">الوقت</th>
                        <th className="py-3 px-2 text-center font-medium">الحرارة</th>
                        <th className="py-3 px-2 text-center font-medium">الضغط</th>
                        <th className="py-3 px-2 text-center font-medium">النبض</th>
                        <th className="py-3 px-2 text-center font-medium">التنفس</th>
                        <th className="py-3 px-2 text-center font-medium">O2</th>
                        <th className="py-3 px-2 text-center font-medium">الألم</th>
                        <th className="py-3 px-2 text-right font-medium">المسجل</th>
                        <th className="py-3 px-2 text-right font-medium">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...vitals].reverse().map((vital) => (
                        <tr key={vital.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            {new Date(vital.timestamp).toLocaleString('ar-EG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={cn(
                                isAbnormal('temperature', vital.temperature) &&
                                  'text-red-600 font-medium'
                              )}
                            >
                              {vital.temperature}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={cn(
                                (isAbnormal('bloodPressureSystolic', vital.bloodPressureSystolic) ||
                                  isAbnormal('bloodPressureDiastolic', vital.bloodPressureDiastolic)) &&
                                  'text-red-600 font-medium'
                              )}
                            >
                              {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={cn(
                                isAbnormal('heartRate', vital.heartRate) && 'text-red-600 font-medium'
                              )}
                            >
                              {vital.heartRate}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={cn(
                                isAbnormal('respiratoryRate', vital.respiratoryRate) &&
                                  'text-red-600 font-medium'
                              )}
                            >
                              {vital.respiratoryRate}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={cn(
                                isAbnormal('oxygenSaturation', vital.oxygenSaturation) &&
                                  'text-red-600 font-medium'
                              )}
                            >
                              {vital.oxygenSaturation}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={cn(
                                isAbnormal('painLevel', vital.painLevel) && 'text-amber-600 font-medium'
                              )}
                            >
                              {vital.painLevel}
                            </span>
                          </td>
                          <td className="py-3 px-2">{vital.recordedBy}</td>
                          <td className="py-3 px-2 text-muted-foreground max-w-[150px] truncate">
                            {vital.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Record Vitals Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تسجيل قراءة جديدة</DialogTitle>
            <DialogDescription>
              {currentPatient?.nameAr} - سرير {currentPatient?.bedNumber || '-'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الحرارة (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="37.0"
                  value={newVitals.temperature}
                  onChange={(e) => setNewVitals({ ...newVitals, temperature: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>النبض (bpm)</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={newVitals.heartRate}
                  onChange={(e) => setNewVitals({ ...newVitals, heartRate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الضغط الانقباضي (mmHg)</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={newVitals.systolic}
                  onChange={(e) => setNewVitals({ ...newVitals, systolic: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الضغط الانبساطي (mmHg)</Label>
                <Input
                  type="number"
                  placeholder="80"
                  value={newVitals.diastolic}
                  onChange={(e) => setNewVitals({ ...newVitals, diastolic: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>التنفس (/min)</Label>
                <Input
                  type="number"
                  placeholder="16"
                  value={newVitals.respiratoryRate}
                  onChange={(e) => setNewVitals({ ...newVitals, respiratoryRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الأكسجين (%)</Label>
                <Input
                  type="number"
                  placeholder="98"
                  value={newVitals.oxygenSaturation}
                  onChange={(e) => setNewVitals({ ...newVitals, oxygenSaturation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الألم (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0"
                  value={newVitals.painLevel}
                  onChange={(e) => setNewVitals({ ...newVitals, painLevel: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                placeholder="أي ملاحظات إضافية..."
                value={newVitals.notes}
                onChange={(e) => setNewVitals({ ...newVitals, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleRecordVitals} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              حفظ القراءة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function VitalCard({
  icon: Icon,
  label,
  value,
  unit,
  isAbnormal,
  normalRange,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  unit: string
  isAbnormal: boolean
  normalRange: string
}) {
  return (
    <Card className={cn(isAbnormal && 'border-red-200 bg-red-50 dark:bg-red-950/20')}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn('h-4 w-4', isAbnormal ? 'text-red-500' : 'text-muted-foreground')} />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-2xl font-bold', isAbnormal && 'text-red-600')}>
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">طبيعي: {normalRange}</p>
        {isAbnormal && (
          <Badge variant="destructive" className="mt-2 text-xs">
            <AlertTriangle className="h-3 w-3 ml-1" />
            غير طبيعي
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
