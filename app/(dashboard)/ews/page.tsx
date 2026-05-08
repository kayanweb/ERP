'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  AlertTriangle,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Brain,
  Calculator,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  User,
  Search,
  Plus,
  History,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EWSPatient {
  id: string
  name: string
  mrn: string
  department: string
  room: string
  currentScore: number
  previousScore: number
  lastAssessment: string
  vitals: {
    respiratoryRate: number
    oxygenSaturation: number
    supplementalOxygen: boolean
    temperature: number
    systolicBP: number
    heartRate: number
    consciousness: 'alert' | 'voice' | 'pain' | 'unresponsive'
  }
}

const samplePatients: EWSPatient[] = [
  {
    id: '1',
    name: 'أحمد محمد علي',
    mrn: 'MRN-001234',
    department: 'الباطنية',
    room: '301',
    currentScore: 7,
    previousScore: 5,
    lastAssessment: '2024-01-15T10:00:00.000Z',
    vitals: {
      respiratoryRate: 24,
      oxygenSaturation: 92,
      supplementalOxygen: true,
      temperature: 38.5,
      systolicBP: 95,
      heartRate: 115,
      consciousness: 'alert',
    },
  },
  {
    id: '2',
    name: 'فاطمة خالد',
    mrn: 'MRN-001235',
    department: 'الجراحة',
    room: '205',
    currentScore: 3,
    previousScore: 4,
    lastAssessment: '2024-01-15T09:30:00.000Z',
    vitals: {
      respiratoryRate: 18,
      oxygenSaturation: 96,
      supplementalOxygen: false,
      temperature: 37.2,
      systolicBP: 125,
      heartRate: 88,
      consciousness: 'alert',
    },
  },
  {
    id: '3',
    name: 'محمد عبدالله',
    mrn: 'MRN-001236',
    department: 'ICU',
    room: 'ICU-3',
    currentScore: 9,
    previousScore: 8,
    lastAssessment: '2024-01-15T10:15:00.000Z',
    vitals: {
      respiratoryRate: 28,
      oxygenSaturation: 88,
      supplementalOxygen: true,
      temperature: 39.1,
      systolicBP: 85,
      heartRate: 125,
      consciousness: 'voice',
    },
  },
  {
    id: '4',
    name: 'سارة أحمد',
    mrn: 'MRN-001237',
    department: 'الباطنية',
    room: '308',
    currentScore: 1,
    previousScore: 2,
    lastAssessment: '2024-01-15T08:45:00.000Z',
    vitals: {
      respiratoryRate: 16,
      oxygenSaturation: 98,
      supplementalOxygen: false,
      temperature: 36.8,
      systolicBP: 120,
      heartRate: 72,
      consciousness: 'alert',
    },
  },
]

const getScoreColor = (score: number) => {
  if (score >= 7) return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' }
  if (score >= 5) return { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' }
  if (score >= 3) return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' }
  return { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' }
}

const getScoreLabel = (score: number) => {
  if (score >= 7) return 'حرج - استدعاء فوري'
  if (score >= 5) return 'عالي - مراجعة عاجلة'
  if (score >= 3) return 'متوسط - زيادة المراقبة'
  return 'منخفض - مراقبة روتينية'
}

const getTrend = (current: number, previous: number) => {
  if (current > previous) return { icon: <TrendingUp className="h-4 w-4" />, label: 'تدهور', color: 'text-red-500' }
  if (current < previous) return { icon: <TrendingDown className="h-4 w-4" />, label: 'تحسن', color: 'text-green-500' }
  return { icon: <Minus className="h-4 w-4" />, label: 'مستقر', color: 'text-muted-foreground' }
}

export default function EWSPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<EWSPatient | null>(null)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [filterRisk, setFilterRisk] = useState<string>('all')

  // EWS Calculator State
  const [calcValues, setCalcValues] = useState({
    respiratoryRate: '',
    oxygenSaturation: '',
    supplementalOxygen: 'no',
    temperature: '',
    systolicBP: '',
    heartRate: '',
    consciousness: 'alert',
  })

  const filteredPatients = useMemo(() => {
    return samplePatients.filter((patient) => {
      const matchesSearch =
        patient.name.includes(searchTerm) ||
        patient.mrn.includes(searchTerm) ||
        patient.room.includes(searchTerm)

      if (filterRisk === 'all') return matchesSearch
      if (filterRisk === 'critical') return matchesSearch && patient.currentScore >= 7
      if (filterRisk === 'high') return matchesSearch && patient.currentScore >= 5 && patient.currentScore < 7
      if (filterRisk === 'medium') return matchesSearch && patient.currentScore >= 3 && patient.currentScore < 5
      if (filterRisk === 'low') return matchesSearch && patient.currentScore < 3
      return matchesSearch
    })
  }, [searchTerm, filterRisk])

  const calculateEWS = () => {
    let score = 0
    const rr = parseInt(calcValues.respiratoryRate)
    const spo2 = parseInt(calcValues.oxygenSaturation)
    const temp = parseFloat(calcValues.temperature)
    const sbp = parseInt(calcValues.systolicBP)
    const hr = parseInt(calcValues.heartRate)

    // Respiratory Rate
    if (rr <= 8) score += 3
    else if (rr >= 9 && rr <= 11) score += 1
    else if (rr >= 12 && rr <= 20) score += 0
    else if (rr >= 21 && rr <= 24) score += 2
    else if (rr >= 25) score += 3

    // SpO2
    if (spo2 <= 91) score += 3
    else if (spo2 >= 92 && spo2 <= 93) score += 2
    else if (spo2 >= 94 && spo2 <= 95) score += 1
    else if (spo2 >= 96) score += 0

    // Supplemental Oxygen
    if (calcValues.supplementalOxygen === 'yes') score += 2

    // Temperature
    if (temp <= 35) score += 3
    else if (temp >= 35.1 && temp <= 36) score += 1
    else if (temp >= 36.1 && temp <= 38) score += 0
    else if (temp >= 38.1 && temp <= 39) score += 1
    else if (temp >= 39.1) score += 2

    // Systolic BP
    if (sbp <= 90) score += 3
    else if (sbp >= 91 && sbp <= 100) score += 2
    else if (sbp >= 101 && sbp <= 110) score += 1
    else if (sbp >= 111 && sbp <= 219) score += 0
    else if (sbp >= 220) score += 3

    // Heart Rate
    if (hr <= 40) score += 3
    else if (hr >= 41 && hr <= 50) score += 1
    else if (hr >= 51 && hr <= 90) score += 0
    else if (hr >= 91 && hr <= 110) score += 1
    else if (hr >= 111 && hr <= 130) score += 2
    else if (hr >= 131) score += 3

    // Consciousness
    if (calcValues.consciousness === 'voice') score += 3
    if (calcValues.consciousness === 'pain') score += 3
    if (calcValues.consciousness === 'unresponsive') score += 3

    return score
  }

  const calculatedScore = calculateEWS()

  const stats = {
    critical: samplePatients.filter((p) => p.currentScore >= 7).length,
    high: samplePatients.filter((p) => p.currentScore >= 5 && p.currentScore < 7).length,
    medium: samplePatients.filter((p) => p.currentScore >= 3 && p.currentScore < 5).length,
    low: samplePatients.filter((p) => p.currentScore < 3).length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            نظام الإنذار المبكر (NEWS)
          </h1>
          <p className="text-muted-foreground">
            National Early Warning Score - مراقبة العلامات الحيوية للمرضى
          </p>
        </div>
        <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calculator className="h-4 w-4 ml-2" />
              حاسبة EWS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>حاسبة Early Warning Score</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  معدل التنفس (نفس/دقيقة)
                </Label>
                <Input
                  type="number"
                  value={calcValues.respiratoryRate}
                  onChange={(e) =>
                    setCalcValues({ ...calcValues, respiratoryRate: e.target.value })
                  }
                  placeholder="12-20"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  تشبع الأكسجين (%)
                </Label>
                <Input
                  type="number"
                  value={calcValues.oxygenSaturation}
                  onChange={(e) =>
                    setCalcValues({ ...calcValues, oxygenSaturation: e.target.value })
                  }
                  placeholder="94-100"
                />
              </div>
              <div className="space-y-2">
                <Label>أكسجين إضافي</Label>
                <Select
                  value={calcValues.supplementalOxygen}
                  onValueChange={(v) =>
                    setCalcValues({ ...calcValues, supplementalOxygen: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">لا</SelectItem>
                    <SelectItem value="yes">نعم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  درجة الحرارة (°C)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={calcValues.temperature}
                  onChange={(e) =>
                    setCalcValues({ ...calcValues, temperature: e.target.value })
                  }
                  placeholder="36.5-37.5"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  ضغط الدم الانقباضي
                </Label>
                <Input
                  type="number"
                  value={calcValues.systolicBP}
                  onChange={(e) =>
                    setCalcValues({ ...calcValues, systolicBP: e.target.value })
                  }
                  placeholder="111-219"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  معدل النبض
                </Label>
                <Input
                  type="number"
                  value={calcValues.heartRate}
                  onChange={(e) =>
                    setCalcValues({ ...calcValues, heartRate: e.target.value })
                  }
                  placeholder="51-90"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  مستوى الوعي (AVPU)
                </Label>
                <Select
                  value={calcValues.consciousness}
                  onValueChange={(v) =>
                    setCalcValues({ ...calcValues, consciousness: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alert">Alert - واعي ومنتبه</SelectItem>
                    <SelectItem value="voice">Voice - يستجيب للصوت</SelectItem>
                    <SelectItem value="pain">Pain - يستجيب للألم</SelectItem>
                    <SelectItem value="unresponsive">Unresponsive - لا يستجيب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Result */}
            <div className="mt-6 p-4 rounded-lg border-2 border-dashed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">النتيجة</p>
                  <p className={cn('text-3xl font-bold', getScoreColor(calculatedScore).text)}>
                    {calculatedScore}
                  </p>
                </div>
                <Badge
                  className={cn('text-white', getScoreColor(calculatedScore).bg)}
                >
                  {getScoreLabel(calculatedScore)}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card
          className={cn(
            'cursor-pointer transition-all',
            filterRisk === 'critical' && 'ring-2 ring-red-500'
          )}
          onClick={() => setFilterRisk(filterRisk === 'critical' ? 'all' : 'critical')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">حرج</p>
                <p className="text-3xl font-bold text-red-500">{stats.critical}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">نقاط 7+</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all',
            filterRisk === 'high' && 'ring-2 ring-orange-500'
          )}
          onClick={() => setFilterRisk(filterRisk === 'high' ? 'all' : 'high')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عالي</p>
                <p className="text-3xl font-bold text-orange-500">{stats.high}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">نقاط 5-6</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all',
            filterRisk === 'medium' && 'ring-2 ring-yellow-500'
          )}
          onClick={() => setFilterRisk(filterRisk === 'medium' ? 'all' : 'medium')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.medium}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">نقاط 3-4</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all',
            filterRisk === 'low' && 'ring-2 ring-green-500'
          )}
          onClick={() => setFilterRisk(filterRisk === 'low' ? 'all' : 'low')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">منخفض</p>
                <p className="text-3xl font-bold text-green-500">{stats.low}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">نقاط 0-2</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو رقم الملف أو الغرفة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        {filterRisk !== 'all' && (
          <Button variant="outline" onClick={() => setFilterRisk('all')}>
            إظهار الكل
          </Button>
        )}
      </div>

      {/* Patients List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => {
          const scoreColor = getScoreColor(patient.currentScore)
          const trend = getTrend(patient.currentScore, patient.previousScore)

          return (
            <Card
              key={patient.id}
              className={cn(
                'cursor-pointer hover:shadow-lg transition-all',
                selectedPatient?.id === patient.id && 'ring-2 ring-primary'
              )}
              onClick={() => setSelectedPatient(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Score Circle */}
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-full text-white font-bold text-2xl shrink-0',
                      scoreColor.bg
                    )}
                  >
                    {patient.currentScore}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.mrn} • غرفة {patient.room}
                        </p>
                      </div>
                      <div className={cn('flex items-center gap-1', trend.color)}>
                        {trend.icon}
                        <span className="text-xs">{trend.label}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">{patient.department}</Badge>
                      <Badge className={cn('text-white', scoreColor.bg)}>
                        {getScoreLabel(patient.currentScore)}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span>{patient.vitals.heartRate} bpm</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-orange-500" />
                        <span>{patient.vitals.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-blue-500" />
                        <span>{patient.vitals.oxygenSaturation}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* EWS Scale Reference */}
      <Card>
        <CardHeader>
          <CardTitle>مقياس NEWS المرجعي</CardTitle>
          <CardDescription>
            National Early Warning Score - الإجراءات المطلوبة حسب النتيجة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  0-2
                </div>
                <span className="font-semibold text-green-700">منخفض</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• مراقبة روتينية كل 12 ساعة</li>
                <li>• استمرار الرعاية العادية</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold">
                  3-4
                </div>
                <span className="font-semibold text-yellow-700">متوسط</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• زيادة المراقبة كل 4-6 ساعات</li>
                <li>• إبلاغ الممرضة المسؤولة</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  5-6
                </div>
                <span className="font-semibold text-orange-700">عالي</span>
              </div>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• مراقبة كل ساعة على الأقل</li>
                <li>• إبلاغ الطبيب المناوب فوراً</li>
                <li>• تقييم حالة المريض</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                  7+
                </div>
                <span className="font-semibold text-red-700">حرج</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• مراقبة مستمرة</li>
                <li>• استدعاء فريق الاستجابة السريعة</li>
                <li>• نقل للعناية المركزة</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
