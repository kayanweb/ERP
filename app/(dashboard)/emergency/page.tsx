'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogTrigger,
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
import { EmergencyCode, EmergencyCodeType } from '@/types'
import {
  Siren,
  Heart,
  Flame,
  Baby,
  AlertTriangle,
  Activity,
  Shield,
  Plus,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const codeConfig: Record<EmergencyCodeType, { 
  label: string
  labelAr: string
  color: string
  bgColor: string
  icon: React.ElementType
  description: string
}> = {
  blue: {
    label: 'Code Blue',
    labelAr: 'كود أزرق',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    icon: Heart,
    description: 'توقف القلب / التنفس',
  },
  red: {
    label: 'Code Red',
    labelAr: 'كود أحمر',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    icon: Flame,
    description: 'حريق',
  },
  pink: {
    label: 'Code Pink',
    labelAr: 'كود وردي',
    color: 'text-pink-600',
    bgColor: 'bg-pink-500',
    icon: Baby,
    description: 'اختطاف طفل / رضيع',
  },
  orange: {
    label: 'Code Orange',
    labelAr: 'كود برتقالي',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    icon: AlertTriangle,
    description: 'كوارث / إصابات جماعية',
  },
  yellow: {
    label: 'Code Yellow',
    labelAr: 'كود أصفر',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
    icon: Activity,
    description: 'مريض مفقود',
  },
  black: {
    label: 'Code Black',
    labelAr: 'كود أسود',
    color: 'text-gray-900',
    bgColor: 'bg-gray-800',
    icon: Shield,
    description: 'تهديد / قنبلة',
  },
  green: {
    label: 'Code Green',
    labelAr: 'كود أخضر',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    icon: Shield,
    description: 'إخلاء',
  },
}

// Sample data
const sampleCodes: EmergencyCode[] = [
  {
    id: '1',
    type: 'blue',
    location: 'غرفة 301',
    department: 'ICU',
    calledBy: 'أحمد محمد',
    calledById: '1',
    status: 'active',
    startTime: '2024-01-15T10:30:00.000Z',
    responders: ['فريق الإنعاش', 'طبيب العناية المركزة'],
    notes: 'مريض في حالة توقف قلبي',
  },
  {
    id: '2',
    type: 'red',
    location: 'المطبخ - الطابق الأرضي',
    department: 'الخدمات',
    calledBy: 'محمد علي',
    calledById: '2',
    status: 'resolved',
    startTime: '2024-01-15T08:15:00.000Z',
    endTime: '2024-01-15T08:45:00.000Z',
    responders: ['فريق الإطفاء', 'الأمن'],
    notes: 'دخان من أحد الأجهزة',
    outcome: 'تم السيطرة على الموقف - لا إصابات',
  },
]

export default function EmergencyCodesPage() {
  const [codes, setCodes] = useState<EmergencyCode[]>(sampleCodes)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCodeType, setSelectedCodeType] = useState<EmergencyCodeType | null>(null)
  const [newCode, setNewCode] = useState({
    location: '',
    department: '',
    notes: '',
  })

  const activeCodes = codes.filter((c) => c.status === 'active')
  const recentCodes = codes.filter((c) => c.status !== 'active').slice(0, 5)

  const handleActivateCode = (type: EmergencyCodeType) => {
    setSelectedCodeType(type)
    setIsDialogOpen(true)
  }

  const handleSubmitCode = () => {
    if (!selectedCodeType || !newCode.location || !newCode.department) return

    const code: EmergencyCode = {
      id: Date.now().toString(),
      type: selectedCodeType,
      location: newCode.location,
      department: newCode.department,
      calledBy: 'المستخدم الحالي',
      calledById: 'current',
      status: 'active',
      startTime: new Date().toISOString(),
      responders: [],
      notes: newCode.notes,
    }

    setCodes([code, ...codes])
    setIsDialogOpen(false)
    setSelectedCodeType(null)
    setNewCode({ location: '', department: '', notes: '' })
  }

  const handleResolveCode = (id: string) => {
    setCodes(
      codes.map((c) =>
        c.id === id
          ? { ...c, status: 'resolved' as const, endTime: new Date().toISOString() }
          : c
      )
    )
  }

  const handleCancelCode = (id: string) => {
    setCodes(
      codes.map((c) =>
        c.id === id
          ? { ...c, status: 'cancelled' as const, endTime: new Date().toISOString() }
          : c
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">أكواد الطوارئ</h1>
          <p className="text-muted-foreground">
            نظام الاستجابة السريعة للحالات الطارئة
          </p>
        </div>
        <Button variant="destructive" size="lg" className="gap-2">
          <Phone className="h-5 w-5" />
          اتصال طوارئ
        </Button>
      </div>

      {/* Active Codes Alert */}
      {activeCodes.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Siren className="h-5 w-5 animate-pulse" />
              أكواد نشطة ({activeCodes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCodes.map((code) => {
              const config = codeConfig[code.type]
              const Icon = config.icon
              return (
                <div
                  key={code.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-background rounded-lg border border-destructive/20"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full text-white animate-pulse',
                        config.bgColor
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn('font-bold text-lg', config.color)}>
                          {config.labelAr}
                        </span>
                        <Badge variant="destructive" className="animate-pulse">
                          نشط
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {code.location} - {code.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {code.calledBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(code.startTime).toLocaleTimeString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelCode(code.id)}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      إلغاء
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleResolveCode(code.id)}
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      تم الحل
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Activation Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تفعيل كود طوارئ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {(Object.keys(codeConfig) as EmergencyCodeType[]).map((type) => {
              const config = codeConfig[type]
              const Icon = config.icon
              return (
                <button
                  key={type}
                  onClick={() => handleActivateCode(type)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-lg',
                    'border-border hover:border-current',
                    config.color
                  )}
                >
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full text-white',
                      config.bgColor
                    )}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="font-semibold text-sm">{config.labelAr}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {config.description}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Codes History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">السجل الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا توجد أكواد سابقة
            </p>
          ) : (
            <div className="space-y-3">
              {recentCodes.map((code) => {
                const config = codeConfig[code.type]
                const Icon = config.icon
                return (
                  <div
                    key={code.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full text-white opacity-75',
                          config.bgColor
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{config.labelAr}</span>
                          <Badge
                            variant={
                              code.status === 'resolved' ? 'default' : 'secondary'
                            }
                          >
                            {code.status === 'resolved' ? 'تم الحل' : 'ملغي'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {code.location} - {code.department}
                        </p>
                      </div>
                    </div>
                    <div className="text-left text-sm text-muted-foreground">
                      <p>{new Date(code.startTime).toLocaleDateString('ar-EG')}</p>
                      <p>{new Date(code.startTime).toLocaleTimeString('ar-EG')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {selectedCodeType && (
              <>
                <DialogTitle
                  className={cn('flex items-center gap-2', codeConfig[selectedCodeType].color)}
                >
                  {(() => {
                    const Icon = codeConfig[selectedCodeType].icon
                    return <Icon className="h-5 w-5" />
                  })()}
                  تفعيل {codeConfig[selectedCodeType].labelAr}
                </DialogTitle>
                <DialogDescription>
                  {codeConfig[selectedCodeType].description}
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الموقع *</Label>
              <Input
                placeholder="مثال: غرفة 301، الطابق الثالث"
                value={newCode.location}
                onChange={(e) =>
                  setNewCode({ ...newCode, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>القسم *</Label>
              <Select
                value={newCode.department}
                onValueChange={(value) =>
                  setNewCode({ ...newCode, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICU">العناية المركزة</SelectItem>
                  <SelectItem value="ER">الطوارئ</SelectItem>
                  <SelectItem value="OR">غرف العمليات</SelectItem>
                  <SelectItem value="ward">الأجنحة</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                placeholder="وصف موجز للحالة..."
                value={newCode.notes}
                onChange={(e) =>
                  setNewCode({ ...newCode, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitCode}
              disabled={!newCode.location || !newCode.department}
            >
              <Siren className="h-4 w-4 ml-2" />
              تفعيل الكود
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
