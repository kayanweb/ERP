'use client'

import { useState } from 'react'
import {
  Phone,
  Mail,
  MessageSquare,
  Search,
  Plus,
  Building2,
  User,
  Stethoscope,
  Shield,
  Wrench,
  HeartPulse,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const contacts = [
  // Medical Staff
  { id: 'c1', name: 'د. أحمد سالم', role: 'طبيب رئيسي', dept: 'ICU 3rd', phone: '0501001001', ext: '101', email: 'ahmed.salem@baheya.com', category: 'medical', available: true },
  { id: 'c2', name: 'د. سارة محمد', role: 'طبيبة قلب', dept: 'CCU', phone: '0501002002', ext: '102', email: 'sara.med@baheya.com', category: 'medical', available: false },
  { id: 'c3', name: 'د. خالد حسن', role: 'طبيب طوارئ', dept: 'ER', phone: '0501003003', ext: '103', email: 'khaled.h@baheya.com', category: 'medical', available: true },
  // Nursing
  { id: 'c4', name: 'فاطمة علي', role: 'مدير التمريض', dept: 'الإدارة', phone: '0502001001', ext: '201', email: 'fatma.ali@baheya.com', category: 'nursing', available: true },
  { id: 'c5', name: 'نورة أحمد', role: 'مشرفة وحدة ICU', dept: 'ICU 3rd', phone: '0502002002', ext: '202', email: 'noura@baheya.com', category: 'nursing', available: true },
  { id: 'c6', name: 'حسام فارس', role: 'ممرض أول', dept: 'ER', phone: '0502003003', ext: '203', email: 'hussam@baheya.com', category: 'nursing', available: false },
  // Administration
  { id: 'c7', name: 'محمد السيد', role: 'مدير المستشفى', dept: 'الإدارة العليا', phone: '0503001001', ext: '300', email: 'director@baheya.com', category: 'admin', available: true },
  { id: 'c8', name: 'آية رمضان', role: 'المدير المالي', dept: 'المالية', phone: '0503002002', ext: '301', email: 'finance@baheya.com', category: 'admin', available: true },
  // Technical
  { id: 'c9', name: 'كريم ناصر', role: 'مهندس صيانة', dept: 'الصيانة', phone: '0504001001', ext: '401', email: 'maintenance@baheya.com', category: 'technical', available: true },
  { id: 'c10', name: 'علي صادق', role: 'مختص IT', dept: 'تقنية المعلومات', phone: '0504002002', ext: '402', email: 'it@baheya.com', category: 'technical', available: false },
]

const emergencyContacts = [
  { name: 'كود أزرق — توقف قلب', phone: '111', desc: 'فريق الإنعاش القلبي الرئوي' },
  { name: 'كود أحمر — حريق', phone: '112', desc: 'الدفاع المدني والإخلاء' },
  { name: 'كود وردي — اختطاف طفل', phone: '113', desc: 'إجراءات الطوارئ الخاصة' },
  { name: 'كود أصفر — فيضان/كارثة', phone: '114', desc: 'إدارة الكوارث' },
  { name: 'الحارس الأمني', phone: '199', desc: 'الأمن والحراسة' },
  { name: 'صيدلية الطوارئ', phone: '188', desc: 'الأدوية العاجلة' },
]

const categoryIcons: Record<string, React.ReactNode> = {
  medical: <Stethoscope className="h-4 w-4" />,
  nursing: <HeartPulse className="h-4 w-4" />,
  admin: <Building2 className="h-4 w-4" />,
  technical: <Wrench className="h-4 w-4" />,
}

const categoryColors: Record<string, string> = {
  medical: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  nursing: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  technical: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}

const categoryLabels: Record<string, string> = {
  medical: 'طاقم طبي',
  nursing: 'تمريض',
  admin: 'إدارة',
  technical: 'فني',
}

export default function ContactHubPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = contacts.filter(c => {
    const matchSearch =
      c.name.includes(search) ||
      c.role.includes(search) ||
      c.dept.includes(search) ||
      c.phone.includes(search)
    const matchCat = activeCategory === 'all' || c.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">دليل الاتصالات</h1>
          <p className="text-muted-foreground text-sm">
            جميع أرقام وجهات اتصال المستشفى
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-1" />
          إضافة جهة اتصال
        </Button>
      </div>

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">📒 الدليل</TabsTrigger>
          <TabsTrigger value="emergency">🚨 الطوارئ</TabsTrigger>
        </TabsList>

        {/* Directory */}
        <TabsContent value="directory" className="space-y-4 mt-4">
          {/* Search + filter */}
          <Card>
            <CardContent className="pt-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم، القسم، الهاتف..."
                  className="pr-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'medical', 'nursing', 'admin', 'technical'].map(cat => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === 'all' ? '🌐 الكل' : categoryLabels[cat]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'الكادر الطبي', count: contacts.filter(c => c.category === 'medical').length, color: 'text-blue-600' },
              { label: 'التمريض', count: contacts.filter(c => c.category === 'nursing').length, color: 'text-pink-600' },
              { label: 'الإدارة', count: contacts.filter(c => c.category === 'admin').length, color: 'text-purple-600' },
              { label: 'الفنيين', count: contacts.filter(c => c.category === 'technical').length, color: 'text-orange-600' },
            ].map(s => (
              <Card key={s.label} className="p-3">
                <p className={cn('text-2xl font-bold', s.color)}>{s.count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Contacts grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(contact => (
              <Card key={contact.id} className="hover:border-primary transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card',
                        contact.available ? 'bg-green-500' : 'bg-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className="font-bold text-sm truncate">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.role}</p>
                        </div>
                        <Badge className={cn('text-[10px] shrink-0 border-0', categoryColors[contact.category])}>
                          {categoryLabels[contact.category]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">📍 {contact.dept}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <Phone className="h-3 w-3" /> {contact.phone}
                        </a>
                        <span className="text-xs text-muted-foreground">تحويل: {contact.ext}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1" asChild>
                          <a href={`tel:${contact.phone}`}><Phone className="h-3 w-3" />اتصال</a>
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1" asChild>
                          <a href={`mailto:${contact.email}`}><Mail className="h-3 w-3" />بريد</a>
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Emergency contacts */}
        <TabsContent value="emergency" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((ec, i) => (
              <Card key={i} className="border-red-200 dark:border-red-900/50 hover:border-red-400 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{ec.name}</p>
                      <p className="text-xs text-muted-foreground">{ec.desc}</p>
                      <a
                        href={`tel:${ec.phone}`}
                        className="inline-flex items-center gap-1 mt-2 text-red-600 font-bold text-lg hover:underline"
                      >
                        <Phone className="h-4 w-4" /> {ec.phone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">⚠️ تعليمات الطوارئ</p>
            <p className="text-xs text-red-600 dark:text-red-300">
              في حالة الطوارئ، اتصل فوراً برقم الطوارئ المناسب، أبلغ بمكانك والحالة بوضوح، وابقَ هادئاً وانتظر فريق الاستجابة.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
