'use client'

import * as React from 'react'
import { ChevronRight, ChevronLeft, Sun, Sunset, Moon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Demo data - will be replaced with Firebase
const departments = [
  'ICU 3rd',
  'ICU 4th',
  'CCU',
  'ER',
  'NICU',
  'PICU',
  '8th Floor',
  '9th Floor',
]

const staffSchedule: Record<string, Record<string, { morning: string[]; evening: string[]; night: string[] }>> = {
  'ICU 3rd': {
    '2024-01-14': { morning: ['أحمد محمد', 'سارة علي'], evening: ['محمد حسن'], night: ['فاطمة أحمد'] },
    '2024-01-15': { morning: ['أحمد محمد'], evening: ['سارة علي', 'محمد حسن'], night: ['خالد عبدالله'] },
    '2024-01-16': { morning: ['فاطمة أحمد', 'نورة سعيد'], evening: ['أحمد محمد'], night: ['سارة علي'] },
    '2024-01-17': { morning: ['محمد حسن'], evening: ['فاطمة أحمد', 'خالد عبدالله'], night: ['نورة سعيد'] },
    '2024-01-18': { morning: ['سارة علي', 'خالد عبدالله'], evening: ['نورة سعيد'], night: ['أحمد محمد'] },
    '2024-01-19': { morning: ['محمد حسن', 'فاطمة أحمد'], evening: ['سارة علي'], night: ['خالد عبدالله'] },
    '2024-01-20': { morning: ['نورة سعيد'], evening: ['أحمد محمد', 'محمد حسن'], night: ['فاطمة أحمد'] },
  },
  'CCU': {
    '2024-01-14': { morning: ['علي حسن'], evening: ['منى أحمد'], night: ['سعد محمد'] },
    '2024-01-15': { morning: ['منى أحمد', 'سعد محمد'], evening: ['علي حسن'], night: ['هند سعيد'] },
    '2024-01-16': { morning: ['هند سعيد'], evening: ['سعد محمد'], night: ['منى أحمد', 'علي حسن'] },
    '2024-01-17': { morning: ['سعد محمد'], evening: ['هند سعيد', 'علي حسن'], night: ['منى أحمد'] },
    '2024-01-18': { morning: ['علي حسن', 'منى أحمد'], evening: ['سعد محمد'], night: ['هند سعيد'] },
    '2024-01-19': { morning: ['هند سعيد', 'سعد محمد'], evening: ['منى أحمد'], night: ['علي حسن'] },
    '2024-01-20': { morning: ['منى أحمد'], evening: ['علي حسن', 'هند سعيد'], night: ['سعد محمد'] },
  },
  'ER': {
    '2024-01-14': { morning: ['ياسر خالد', 'ريم أحمد'], evening: ['عمر سعيد', 'هالة محمد'], night: ['زياد علي'] },
    '2024-01-15': { morning: ['عمر سعيد', 'زياد علي'], evening: ['ياسر خالد'], night: ['ريم أحمد', 'هالة محمد'] },
    '2024-01-16': { morning: ['هالة محمد'], evening: ['زياد علي', 'ريم أحمد'], night: ['ياسر خالد', 'عمر سعيد'] },
    '2024-01-17': { morning: ['زياد علي', 'هالة محمد'], evening: ['ياسر خالد'], night: ['ريم أحمد'] },
    '2024-01-18': { morning: ['ريم أحمد'], evening: ['هالة محمد', 'عمر سعيد'], night: ['زياد علي', 'ياسر خالد'] },
    '2024-01-19': { morning: ['عمر سعيد', 'ياسر خالد'], evening: ['ريم أحمد', 'زياد علي'], night: ['هالة محمد'] },
    '2024-01-20': { morning: ['هالة محمد', 'زياد علي'], evening: ['عمر سعيد'], night: ['ياسر خالد', 'ريم أحمد'] },
  },
}

// Fill empty departments
departments.forEach(dept => {
  if (!staffSchedule[dept]) {
    staffSchedule[dept] = {}
    for (let i = 14; i <= 20; i++) {
      staffSchedule[dept][`2024-01-${i}`] = { morning: [], evening: [], night: [] }
    }
  }
})

export default function ShiftSchedulePage() {
  const [selectedDepartment, setSelectedDepartment] = React.useState(departments[0])
  const [weekStart, setWeekStart] = React.useState(new Date('2024-01-14'))

  const weekDays = React.useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }, [weekStart])

  const goToPreviousWeek = () => {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() - 7)
    setWeekStart(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() + 7)
    setWeekStart(newDate)
  }

  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('ar-EG', { weekday: 'short' })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">جدول المناوبات</h1>
          <p className="text-muted-foreground">عرض وإدارة جداول الشفتات</p>
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
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

      {/* Week Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                {weekStart.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {weekDays[0].toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            جدول الشفتات - {selectedDepartment}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-right font-semibold w-24">الشفت</th>
                  {weekDays.map((day) => (
                    <th key={day.toISOString()} className="py-3 px-2 text-center font-semibold">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">{getDayName(day)}</span>
                        <span>{day.getDate()}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Morning Shift */}
                <tr className="border-b">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">صباحي</span>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const dateStr = formatDate(day)
                    const schedule = staffSchedule[selectedDepartment]?.[dateStr]
                    return (
                      <td key={day.toISOString()} className="py-2 px-2 text-center">
                        <div className="space-y-1">
                          {schedule?.morning.map((name, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs block"
                            >
                              {name}
                            </Badge>
                          ))}
                          {(!schedule?.morning || schedule.morning.length === 0) && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Evening Shift */}
                <tr className="border-b">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Sunset className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">مسائي</span>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const dateStr = formatDate(day)
                    const schedule = staffSchedule[selectedDepartment]?.[dateStr]
                    return (
                      <td key={day.toISOString()} className="py-2 px-2 text-center">
                        <div className="space-y-1">
                          {schedule?.evening.map((name, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-orange-500/10 text-orange-700 border-orange-500/20 text-xs block"
                            >
                              {name}
                            </Badge>
                          ))}
                          {(!schedule?.evening || schedule.evening.length === 0) && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Night Shift */}
                <tr>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-500" />
                      <span className="font-medium">ليلي</span>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const dateStr = formatDate(day)
                    const schedule = staffSchedule[selectedDepartment]?.[dateStr]
                    return (
                      <td key={day.toISOString()} className="py-2 px-2 text-center">
                        <div className="space-y-1">
                          {schedule?.night.map((name, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-indigo-500/10 text-indigo-700 border-indigo-500/20 text-xs block"
                            >
                              {name}
                            </Badge>
                          ))}
                          {(!schedule?.night || schedule.night.length === 0) && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <span className="text-sm">صباحي (7:00 - 15:00)</span>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="h-4 w-4 text-orange-500" />
              <span className="text-sm">مسائي (15:00 - 23:00)</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-500" />
              <span className="text-sm">ليلي (23:00 - 7:00)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
