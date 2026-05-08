'use client'

import { useState } from 'react'
import {
  UtensilsCrossed,
  Printer,
  Download,
  Share2,
  Calendar,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const DEPTS = ['ICU 3rd','ICU 4th','CCU','ER','NICU']

const shiftColors: Record<string, string> = {
  D:   'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  N:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  DN:  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  OFF: 'bg-muted text-muted-foreground',
  ABS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

// Demo meal data for a unit
const mealStaff = [
  { id: 1, name: 'أحمد محمد علي', title: 'SN', shifts: ['D','N','OFF','D','DN','OFF','D','N','OFF','D','D','N','OFF','D','DN'] },
  { id: 2, name: 'سارة خالد', title: 'CN', shifts: ['N','D','D','OFF','N','D','D','N','OFF','D','D','D','OFF','N','D'] },
  { id: 3, name: 'محمد حسن', title: 'SN', shifts: ['D','D','OFF','N','D','D','OFF','DN','D','N','OFF','D','D','OFF','N'] },
  { id: 4, name: 'نورة أحمد', title: 'NA', shifts: ['OFF','D','N','D','OFF','N','D','D','N','OFF','D','D','N','D','OFF'] },
  { id: 5, name: 'خالد عبدالله', title: 'SN', shifts: ['D','OFF','D','D','N','OFF','D','N','D','D','OFF','N','D','D','OFF'] },
  { id: 6, name: 'فاطمة علي', title: 'SN', shifts: ['N','D','D','N','OFF','D','D','OFF','N','D','D','OFF','D','N','D'] },
]

// Calculate meals per shift
const getMeal = (shift: string): string => {
  if (shift === 'D') return 'غداء'
  if (shift === 'N') return 'عشاء'
  if (shift === 'DN') return 'غداء+عشاء'
  return '—'
}

const getMealCount = (shifts: string[]) => {
  let lunch = 0, dinner = 0
  shifts.forEach(s => {
    if (s === 'D') lunch++
    else if (s === 'N') dinner++
    else if (s === 'DN') { lunch++; dinner++ }
  })
  return { lunch, dinner, total: lunch + dinner }
}

export default function MealsPage() {
  const today = new Date()
  const [dept, setDept] = useState('ICU 3rd')
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [viewMode, setViewMode] = useState<'table' | 'form'>('table')

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Total lunch/dinner per day
  const getDayTotals = (day: number) => {
    const idx = day - 1
    let lunch = 0, dinner = 0
    mealStaff.forEach(s => {
      const shift = s.shifts[idx % s.shifts.length] || ''
      if (shift === 'D') lunch++
      else if (shift === 'N') dinner++
      else if (shift === 'DN') { lunch++; dinner++ }
    })
    return { lunch, dinner }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الوجبات</h1>
          <p className="text-muted-foreground text-sm">
            جدول وجبات الكادر التمريضي حسب الشيفتات
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 ml-1" /> طباعة
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-1" /> PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 ml-1" /> واتساب
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">القسم</p>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEPTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">الشهر</p>
            <Select value={String(month)} onValueChange={v => setMonth(+v)}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">السنة</p>
            <Select value={String(year)} onValueChange={v => setYear(+v)}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button>
            <RefreshCw className="h-4 w-4 ml-1" /> توليد الجدول
          </Button>
          <div className="flex gap-1 ml-auto">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >جدول</Button>
            <Button
              variant={viewMode === 'form' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('form')}
            >نموذج الطباعة</Button>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'إجمالي وجبات الغداء', value: mealStaff.reduce((a, s) => a + getMealCount(s.shifts).lunch, 0), icon: <Sun className="h-5 w-5" />, color: 'text-amber-600' },
              { label: 'إجمالي وجبات العشاء', value: mealStaff.reduce((a, s) => a + getMealCount(s.shifts).dinner, 0), icon: <Moon className="h-5 w-5" />, color: 'text-blue-600' },
              { label: 'الإجمالي الكلي', value: mealStaff.reduce((a, s) => a + getMealCount(s.shifts).total, 0), icon: <UtensilsCrossed className="h-5 w-5" />, color: 'text-primary' },
            ].map(s => (
              <Card key={s.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('h-10 w-10 rounded-lg bg-muted flex items-center justify-center', s.color)}>
                    {s.icon}
                  </div>
                  <div>
                    <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Meals table */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">
                🍽 جدول الوجبات — {dept} — {MONTHS[month]} {year}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="sticky right-0 bg-muted/30 text-right py-2 px-3 font-bold min-w-[140px] border-l">الموظف</th>
                      {days.slice(0, 15).map(d => (
                        <th key={d} className="py-2 px-1 font-bold text-center min-w-[40px] border-l">{d}</th>
                      ))}
                      <th className="py-2 px-2 font-bold text-center border-l">غداء</th>
                      <th className="py-2 px-2 font-bold text-center">عشاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealStaff.map(staff => {
                      const counts = getMealCount(staff.shifts)
                      return (
                        <tr key={staff.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="sticky right-0 bg-card py-2 px-3 font-medium border-l whitespace-nowrap">
                            <div>{staff.name}</div>
                            <div className="text-[10px] text-muted-foreground">{staff.title}</div>
                          </td>
                          {days.slice(0, 15).map(d => {
                            const shift = staff.shifts[(d - 1) % staff.shifts.length] || ''
                            const meal = getMeal(shift)
                            return (
                              <td key={d} className="py-1 px-1 text-center border-l">
                                {meal !== '—' ? (
                                  <span className={cn('text-[10px] font-bold px-1 py-0.5 rounded', shiftColors[shift])}>
                                    {meal === 'غداء' ? 'غ' : meal === 'عشاء' ? 'ع' : 'غ+ع'}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            )
                          })}
                          <td className="py-2 px-2 text-center font-bold text-amber-600 border-l">{counts.lunch}</td>
                          <td className="py-2 px-2 text-center font-bold text-blue-600">{counts.dinner}</td>
                        </tr>
                      )
                    })}
                    {/* Totals row */}
                    <tr className="bg-muted/30 font-bold">
                      <td className="sticky right-0 bg-muted/30 py-2 px-3 border-l">الإجمالي اليومي</td>
                      {days.slice(0, 15).map(d => {
                        const t = getDayTotals(d)
                        return (
                          <td key={d} className="py-1 px-1 text-center border-l">
                            <div className="text-[9px] text-amber-600">{t.lunch > 0 ? `غ:${t.lunch}` : ''}</div>
                            <div className="text-[9px] text-blue-600">{t.dinner > 0 ? `ع:${t.dinner}` : ''}</div>
                          </td>
                        )
                      })}
                      <td className="py-2 px-2 text-center text-amber-600 border-l">
                        {mealStaff.reduce((a, s) => a + getMealCount(s.shifts).lunch, 0)}
                      </td>
                      <td className="py-2 px-2 text-center text-blue-600">
                        {mealStaff.reduce((a, s) => a + getMealCount(s.shifts).dinner, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Print form view */
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-center text-lg">مستشفى بهية — نموذج طلب الوجبات</CardTitle>
            <p className="text-center text-sm text-muted-foreground">القسم: {dept} | الشهر: {MONTHS[month]} {year}</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="border border-border p-2 text-right">م</th>
                    <th className="border border-border p-2 text-right">الاسم</th>
                    <th className="border border-border p-2 text-center">التاريخ</th>
                    <th className="border border-border p-2 text-center">الشيفت</th>
                    <th className="border border-border p-2 text-center">الوجبة</th>
                    <th className="border border-border p-2 text-center">الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {mealStaff.flatMap((staff, si) =>
                    days.slice(0, 7).map(d => {
                      const shift = staff.shifts[(d - 1) % staff.shifts.length] || ''
                      const meal = getMeal(shift)
                      if (meal === '—') return null
                      return (
                        <tr key={`${si}-${d}`} className="hover:bg-muted/20">
                          <td className="border border-border p-2 text-muted-foreground">{si + 1}</td>
                          <td className="border border-border p-2 font-medium">{staff.name}</td>
                          <td className="border border-border p-2 text-center">{year}-{String(month+1).padStart(2,'0')}-{String(d).padStart(2,'0')}</td>
                          <td className="border border-border p-2 text-center">
                            <span className={cn('px-2 py-0.5 rounded text-xs font-bold', shiftColors[shift])}>{shift}</span>
                          </td>
                          <td className="border border-border p-2 text-center font-medium">{meal}</td>
                          <td className="border border-border p-2 text-center text-muted-foreground">
                            {shift === 'D' ? '13:00' : shift === 'N' ? '21:00' : '13:00 / 21:00'}
                          </td>
                        </tr>
                      )
                    }).filter(Boolean)
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-6 pt-4 border-t text-sm text-muted-foreground">
              <span>توقيع المشرف: _______________</span>
              <span>توقيع المطبخ: _______________</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
