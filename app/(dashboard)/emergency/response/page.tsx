'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
  Phone,
  MapPin,
  Clock,
  Users,
  Siren,
  Heart,
  Flame,
  Baby,
  Skull,
  Zap,
  ShieldAlert,
  CheckCircle,
  Radio,
  Mic,
  PhoneCall,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickDialContact {
  id: string
  name: string
  nameAr: string
  number: string
  department: string
  icon: React.ReactNode
  color: string
}

const quickDialContacts: QuickDialContact[] = [
  {
    id: '1',
    name: 'Emergency Room',
    nameAr: 'غرفة الطوارئ',
    number: '1001',
    department: 'الطوارئ',
    icon: <Siren className="h-6 w-6" />,
    color: 'bg-red-500',
  },
  {
    id: '2',
    name: 'ICU',
    nameAr: 'العناية المركزة',
    number: '1002',
    department: 'ICU',
    icon: <Heart className="h-6 w-6" />,
    color: 'bg-pink-500',
  },
  {
    id: '3',
    name: 'Security',
    nameAr: 'الأمن',
    number: '1003',
    department: 'الأمن',
    icon: <ShieldAlert className="h-6 w-6" />,
    color: 'bg-slate-700',
  },
  {
    id: '4',
    name: 'Pharmacy',
    nameAr: 'الصيدلية',
    number: '1004',
    department: 'الصيدلية',
    icon: <Zap className="h-6 w-6" />,
    color: 'bg-green-500',
  },
  {
    id: '5',
    name: 'Lab',
    nameAr: 'المختبر',
    number: '1005',
    department: 'المختبر',
    icon: <Zap className="h-6 w-6" />,
    color: 'bg-purple-500',
  },
  {
    id: '6',
    name: 'Radiology',
    nameAr: 'الأشعة',
    number: '1006',
    department: 'الأشعة',
    icon: <Radio className="h-6 w-6" />,
    color: 'bg-blue-500',
  },
]

const emergencyCodes = [
  {
    code: 'blue',
    name: 'Code Blue',
    nameAr: 'كود أزرق',
    description: 'توقف القلب / التنفس',
    icon: <Heart className="h-8 w-8" />,
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    code: 'red',
    name: 'Code Red',
    nameAr: 'كود أحمر',
    description: 'حريق',
    icon: <Flame className="h-8 w-8" />,
    color: 'bg-red-600 hover:bg-red-700',
  },
  {
    code: 'pink',
    name: 'Code Pink',
    nameAr: 'كود وردي',
    description: 'اختطاف طفل',
    icon: <Baby className="h-8 w-8" />,
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    code: 'black',
    name: 'Code Black',
    nameAr: 'كود أسود',
    description: 'تهديد / عنف',
    icon: <Skull className="h-8 w-8" />,
    color: 'bg-slate-800 hover:bg-slate-900',
  },
  {
    code: 'orange',
    name: 'Code Orange',
    nameAr: 'كود برتقالي',
    description: 'كارثة جماعية',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    code: 'yellow',
    name: 'Code Yellow',
    nameAr: 'كود أصفر',
    description: 'مريض مفقود',
    icon: <AlertTriangle className="h-8 w-8" />,
    color: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  },
]

const departments = [
  'الطوارئ',
  'العناية المركزة',
  'الباطنية',
  'الجراحة',
  'الأطفال',
  'النساء والولادة',
  'العظام',
  'القلب',
]

const floors = ['الطابق الأرضي', 'الطابق 1', 'الطابق 2', 'الطابق 3', 'الطابق 4', 'الطابق 5']

export default function EmergencyResponsePage() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [isActivating, setIsActivating] = useState(false)
  const [activationData, setActivationData] = useState({
    department: '',
    floor: '',
    room: '',
    notes: '',
  })

  const handleActivateCode = () => {
    setIsActivating(false)
    setSelectedCode(null)
    setActivationData({ department: '', floor: '', room: '', notes: '' })
  }

  const handleQuickDial = (contact: QuickDialContact) => {
    alert(`جاري الاتصال بـ ${contact.nameAr}\nالرقم: ${contact.number}`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">الاستجابة السريعة للطوارئ</h1>
        <p className="text-muted-foreground">
          تفعيل أكواد الطوارئ والاتصال السريع بالأقسام
        </p>
      </div>

      {/* Emergency Alert Banner */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 animate-pulse">
              <Siren className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-destructive">نظام الطوارئ جاهز</h3>
              <p className="text-sm text-muted-foreground">
                اضغط على أي كود لتفعيله فوراً - سيتم إخطار جميع الفرق المعنية
              </p>
            </div>
            <Badge variant="outline" className="border-destructive text-destructive">
              <span className="h-2 w-2 rounded-full bg-green-500 ml-2 animate-pulse" />
              متصل
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Codes Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          أكواد الطوارئ - اضغط للتفعيل
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {emergencyCodes.map((emergency) => (
            <Dialog
              key={emergency.code}
              open={selectedCode === emergency.code && isActivating}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedCode(null)
                  setIsActivating(false)
                }
              }}
            >
              <DialogTrigger asChild>
                <button
                  onClick={() => {
                    setSelectedCode(emergency.code)
                    setIsActivating(true)
                  }}
                  className={cn(
                    'p-6 rounded-2xl text-white text-center transition-all transform hover:scale-105 active:scale-95 shadow-lg',
                    emergency.color
                  )}
                >
                  <div className="flex justify-center mb-3">{emergency.icon}</div>
                  <h3 className="font-bold text-lg">{emergency.nameAr}</h3>
                  <p className="text-xs opacity-90 mt-1">{emergency.description}</p>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-destructive">
                    <Siren className="h-6 w-6" />
                    تفعيل {emergency.nameAr}
                  </DialogTitle>
                  <DialogDescription>
                    أدخل تفاصيل الموقع لإرسال التنبيه للفرق المختصة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-3 rounded-lg text-white', emergency.color)}>
                        {emergency.icon}
                      </div>
                      <div>
                        <h4 className="font-bold">{emergency.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {emergency.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>القسم</Label>
                      <Select
                        value={activationData.department}
                        onValueChange={(v) =>
                          setActivationData({ ...activationData, department: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>الطابق</Label>
                      <Select
                        value={activationData.floor}
                        onValueChange={(v) =>
                          setActivationData({ ...activationData, floor: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الطابق" />
                        </SelectTrigger>
                        <SelectContent>
                          {floors.map((floor) => (
                            <SelectItem key={floor} value={floor}>
                              {floor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>رقم الغرفة</Label>
                    <Input
                      value={activationData.room}
                      onChange={(e) =>
                        setActivationData({ ...activationData, room: e.target.value })
                      }
                      placeholder="مثال: 302"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات إضافية</Label>
                    <Textarea
                      value={activationData.notes}
                      onChange={(e) =>
                        setActivationData({ ...activationData, notes: e.target.value })
                      }
                      placeholder="أي تفاصيل إضافية مهمة..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsActivating(false)
                        setSelectedCode(null)
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleActivateCode}
                    >
                      <Siren className="h-4 w-4 ml-2" />
                      تفعيل الكود الآن
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>

      {/* Quick Dial */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          الاتصال السريع
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickDialContacts.map((contact) => (
            <Card
              key={contact.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => handleQuickDial(contact)}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={cn(
                    'mx-auto w-14 h-14 rounded-full flex items-center justify-center text-white mb-3',
                    contact.color
                  )}
                >
                  {contact.icon}
                </div>
                <h3 className="font-semibold text-sm">{contact.nameAr}</h3>
                <p className="text-lg font-mono text-primary mt-1">{contact.number}</p>
                <Button size="sm" variant="ghost" className="mt-2 gap-2">
                  <PhoneCall className="h-4 w-4" />
                  اتصال
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Response Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              فرق الاستجابة للطوارئ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                name: 'فريق الإنعاش القلبي',
                code: 'Code Blue',
                members: 5,
                status: 'ready',
              },
              {
                name: 'فريق الإطفاء',
                code: 'Code Red',
                members: 8,
                status: 'ready',
              },
              {
                name: 'فريق الأمن',
                code: 'Code Black',
                members: 6,
                status: 'ready',
              },
              {
                name: 'فريق الكوارث',
                code: 'Code Orange',
                members: 12,
                status: 'standby',
              },
            ].map((team, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.code} • {team.members} أعضاء
                    </p>
                  </div>
                </div>
                <Badge
                  variant={team.status === 'ready' ? 'default' : 'secondary'}
                  className={cn(
                    team.status === 'ready' && 'bg-green-500 hover:bg-green-600'
                  )}
                >
                  {team.status === 'ready' ? 'جاهز' : 'في الانتظار'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              آخر التنبيهات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                code: 'Code Blue',
                location: 'ICU - غرفة 205',
                time: 'قبل ساعتين',
                status: 'resolved',
              },
              {
                code: 'Code Yellow',
                location: 'الطابق 3',
                time: 'أمس',
                status: 'resolved',
              },
              {
                code: 'Code Red (تدريب)',
                location: 'المبنى الرئيسي',
                time: 'قبل 3 أيام',
                status: 'completed',
              },
            ].map((alert, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">{alert.code}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {alert.location}
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    تم الحل
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            بروتوكولات الطوارئ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'إخلاء المبنى',
                description: 'خطوات إخلاء المبنى في حالات الطوارئ',
                icon: <Building2 className="h-5 w-5" />,
              },
              {
                title: 'الإنعاش القلبي الرئوي',
                description: 'بروتوكول CPR للبالغين والأطفال',
                icon: <Heart className="h-5 w-5" />,
              },
              {
                title: 'مكافحة الحريق',
                description: 'استخدام طفايات الحريق وطرق الإخلاء',
                icon: <Flame className="h-5 w-5" />,
              },
              {
                title: 'التعامل مع العنف',
                description: 'بروتوكول التعامل مع المواقف العنيفة',
                icon: <ShieldAlert className="h-5 w-5" />,
              },
              {
                title: 'الكوارث الجماعية',
                description: 'خطة الاستجابة للحوادث الجماعية',
                icon: <Users className="h-5 w-5" />,
              },
              {
                title: 'حماية الأطفال',
                description: 'بروتوكول حماية الأطفال والرضع',
                icon: <Baby className="h-5 w-5" />,
              },
            ].map((protocol, idx) => (
              <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    {protocol.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{protocol.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {protocol.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
