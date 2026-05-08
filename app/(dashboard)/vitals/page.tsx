'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { VitalSigns } from '@/types'
import {
  HeartPulse,
  Plus,
  Search,
  Thermometer,
  Activity,
  Wind,
  Droplets,
  AlertTriangle,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
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

// Sample Vitals Data
const sampleVitals: VitalSigns[] = [
  {
    id: '1',
    patientId: 'P001',
    timestamp: '2024-01-15T08:00:00.000Z',
    temperature: 37.2,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    heartRate: 72,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    painLevel: 2,
    recordedBy: 'سارة محمد',
  },
  {
    id: '2',
    patientId: 'P001',
    timestamp: '2024-01-15T12:00:00.000Z',
    temperature: 37.5,
    bloodPressureSystolic: 125,
    bloodPressureDiastolic: 82,
    heartRate: 78,
    respiratoryRate: 18,
    oxygenSaturation: 97,
    painLevel: 3,
    recordedBy: 'نورة علي',
  },
  {
    id: '3',
    patientId: 'P001',
    timestamp: '2024-01-15T16:00:00.000Z',
    temperature: 38.1,
    bloodPressureSystolic: 130,
    bloodPressureDiastolic: 85,
    heartRate: 88,
    respiratoryRate: 20,
    oxygenSaturation: 96,
    painLevel: 4,
    recordedBy: 'فاطمة أحمد',
    notes: 'ارتفاع في الحرارة - تم إبلاغ الطبيب',
  },
  {
    id: '4',
    patientId: 'P001',
    timestamp: '2024-01-15T20:00:00.000Z',
    temperature: 37.8,
    bloodPressureSystolic: 122,
    bloodPressureDiastolic: 78,
    heartRate: 75,
    respiratoryRate: 17,
    oxygenSaturation: 98,
    painLevel: 2,
    recordedBy: 'سارة محمد',
    notes: 'تحسن بعد إعطاء خافض الحرارة',
  },
]

const patients = [
  { id: 'P001', name: 'أحمد محمد علي', mrn: 'MRN-001', department: 'ICU', bed: '301' },
  { id: 'P002', name: 'خالد سعيد', mrn: 'MRN-002', department: 'الجراحة', bed: '205' },
  { id: 'P003', name: 'فاطمة أحمد', mrn: 'MRN-003', department: 'الباطنية', bed: '412' },
]

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
  const [selectedPatient, setSelectedPatient] = useState<string>('P001')
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

  const patientVitals = sampleVitals.filter((v) => v.patientId === selectedPatient)
  const latestVitals = patientVitals[patientVitals.length - 1]
  const currentPatient = patients.find((p) => p.id === selectedPatient)

  // Chart data
  const chartData = patientVitals.map((v) => ({
    time: new Date(v.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    temperature: v.temperature,
    heartRate: v.heartRate,
    oxygenSaturation: v.oxygenSaturation,
    systolic: v.bloodPressureSystolic,
    diastolic: v.bloodPressureDiastolic,
  }))

  const handleRecordVitals = () => {
    // In real app, this would save to database
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
                  {patient.name} - {patient.bed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            تسجيل قراءة
          </Button>
        </div>
      </div>

      {/* Patient Info */}
      {currentPatient && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{currentPatient.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentPatient.mrn} | {currentPatient.department} | سرير {currentPatient.bed}
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
      {latestVitals && (
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
      )}

      {/* Charts */}
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

      {/* History Table */}
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
                {patientVitals.map((vital) => (
                  <tr key={vital.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">
                      {new Date(vital.timestamp).toLocaleTimeString('ar-EG', {
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

      {/* Record Vitals Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تسجيل قراءة جديدة</DialogTitle>
            <DialogDescription>
              {currentPatient?.name} - سرير {currentPatient?.bed}
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
            <Button onClick={handleRecordVitals}>حفظ القراءة</Button>
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
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-2xl font-bold', isAbnormal && 'text-red-600')}>{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          طبيعي: {normalRange}
        </p>
        {isAbnormal && (
          <Badge variant="destructive" className="mt-2 text-xs">
            غير طبيعي
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
