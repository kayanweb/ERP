'use client'

import { useState } from 'react'
import { Printer, Download, Sun, Moon, X, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const DAYS_AR = ['أح','اث','ث','أر','خ','ج','س']
const UNITS   = ['ICU 3rd','ICU 4th','CCU','ER','NICU','PICU']

// ─── Shift styling ────────────────────────────────────────────────────────────
// D  = Day shift   (صباحي/نهاري) — green
// N  = Night shift (ليلي)        — yellow/amber
// DN = Double (نهاري+ليلي 24h)   — blue
// OFF = إجازة/راحة               — red
// ABS = غياب                     — purple
const shiftStyle: Record<string, { cell: string; label: string; hours: number; icon?: string }> = {
  D:   { cell: 'bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300',  label: 'نهاري',  hours: 12, icon: '☀' },
  N:   { cell: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', label: 'ليلي',   hours: 12, icon: '🌙' },
  DN:  { cell: 'bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300',   label: '24 ساعة', hours: 24, icon: '⟳' },
  OFF: { cell: 'bg-red-100    text-red-800    dark:bg-red-900/40    dark:text-red-300',    label: 'راحة',   hours: 0  },
  ABS: { cell: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', label: 'غياب',   hours: 0  },
  '':  { cell: 'text-muted-foreground',                                                    label: '—',      hours: 0  },
}

// ─── Staff data ───────────────────────────────────────────────────────────────
const allStaff = [
  { id: 's1',  name: 'أحمد محمد علي',    code: 'S001', title: 'CN',  unit: 'ICU 3rd', pattern: ['D','D','N','N','OFF','OFF','D','D','N','N','OFF','OFF'] },
  { id: 's2',  name: 'سارة خالد حسن',    code: 'S002', title: 'SN',  unit: 'ICU 3rd', pattern: ['N','OFF','D','D','N','OFF','D','D','N','OFF','D','D'] },
  { id: 's3',  name: 'نورة أحمد',        code: 'S003', title: 'SN',  unit: 'ICU 3rd', pattern: ['OFF','D','D','N','OFF','D','D','N','OFF','D','D','N'] },
  { id: 's4',  name: 'فاطمة محمد',       code: 'S004', title: 'NA',  unit: 'ICU 3rd', pattern: ['D','N','OFF','D','D','N','OFF','D','D','N','OFF','D'] },
  { id: 's5',  name: 'خالد عبدالله',     code: 'S005', title: 'CN',  unit: 'ICU 4th', pattern: ['D','D','OFF','N','N','OFF','D','D','OFF','N','N','OFF'] },
  { id: 's6',  name: 'ريم محمود',        code: 'S006', title: 'SN',  unit: 'ICU 4th', pattern: ['N','N','D','OFF','D','D','N','N','D','OFF','D','D'] },
  { id: 's7',  name: 'حسام فارس',        code: 'S007', title: 'SN',  unit: 'CCU',     pattern: ['D','OFF','D','N','D','OFF','D','N','D','OFF','D','N'] },
  { id: 's8',  name: 'منى سالم',         code: 'S008', title: 'INT', unit: 'CCU',     pattern: ['N','D','OFF','D','N','D','OFF','D','N','D','OFF','D'] },
  { id: 's9',  name: 'علي صادق',         code: 'S009', title: 'SN',  unit: 'ER',      pattern: ['DN','OFF','D','N','DN','OFF','D','N','DN','OFF','D','N'] },
  { id: 's10', name: 'آية رمضان',        code: 'S010', title: 'NA',  unit: 'ER',      pattern: ['OFF','N','D','OFF','N','D','OFF','N','D','OFF','N','D'] },
  { id: 's11', name: 'سلمى إبراهيم',     code: 'S011', title: 'SN',  unit: 'NICU',    pattern: ['D','D','N','OFF','D','D','N','OFF','D','D','N','OFF'] },
  { id: 's12', name: 'هاني عبد الرحمن',  code: 'S012', title: 'NA',  unit: 'NICU',    pattern: ['N','OFF','D','D','N','OFF','D','D','N','OFF','D','D'] },
  { id: 's13', name: 'مريم السيد',       code: 'S013', title: 'SN',  unit: 'PICU',    pattern: ['D','N','OFF','D','D','N','OFF','D','D','N','OFF','D'] },
  { id: 's14', name: 'طارق حسين',        code: 'S014', title: 'CN',  unit: 'PICU',    pattern: ['OFF','D','N','D','OFF','D','N','D','OFF','D','N','D'] },
]

const titleColors: Record<string, string> = {
  CN: 'text-blue-600 dark:text-blue-400',
  SN: 'text-green-600 dark:text-green-400',
  NA: 'text-amber-600 dark:text-amber-400',
  INT:'text-purple-600 dark:text-purple-400',
}

export default function MonthlyRosterPage() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year,  setYear]  = useState(today.getFullYear())
  const [unit,  setUnit]  = useState('ICU 3rd')

  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const days         = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const staffInUnit  = allStaff.filter(s => s.unit === unit)

  const getShift   = (staff: typeof allStaff[0], day: number) =>
    staff.pattern[(day - 1) % staff.pattern.length] || ''
  const getDayName = (day: number) => DAYS_AR[new Date(year, month, day).getDay()]
  const isFriday   = (day: number) => new Date(year, month, day).getDay() === 5

  const getSummary = (staff: typeof allStaff[0]) => {
    const c = { D: 0, N: 0, DN: 0, OFF: 0, ABS: 0, hours: 0 }
    days.forEach(d => {
      const s = getShift(staff, d)
      if (s === 'D')   { c.D++;   c.hours += 12 }
      if (s === 'N')   { c.N++;   c.hours += 12 }
      if (s === 'DN')  { c.DN++;  c.hours += 24 }
      if (s === 'OFF')   c.OFF++
      if (s === 'ABS')   c.ABS++
    })
    return c
  }

  const getDayBalance = (day: number) => {
    const shifts = staffInUnit.map(s => getShift(s, day))
    return {
      D: shifts.filter(s => s === 'D' || s === 'DN').length,
      N: shifts.filter(s => s === 'N' || s === 'DN').length,
    }
  }

  // ─── Print ─────────────────────────────────────────────────────────────────
  function handlePrint() {
    const rows = staffInUnit.map((staff, si) => {
      const sum = getSummary(staff)
      const cells = days.map(d => {
        const s = getShift(staff, d)
        const friday = isFriday(d)
        const style = s === 'D' ? 'background:#dcfce7;color:#166534'
          : s === 'N'  ? 'background:#fef9c3;color:#854d0e'
          : s === 'DN' ? 'background:#dbeafe;color:#1e40af'
          : s === 'OFF'? 'background:#fee2e2;color:#991b1b'
          : s === 'ABS'? 'background:#f3e8ff;color:#6b21a8'
          : ''
        return `<td style="border:1px solid #e5e7eb;text-align:center;padding:2px 3px;font-size:10px;${friday?'background:#fffbeb':''};${style}">${s||'—'}</td>`
      }).join('')
      return `<tr>
        <td style="border:1px solid #e5e7eb;padding:3px 6px;font-size:10px;text-align:center">${si+1}</td>
        <td style="border:1px solid #e5e7eb;padding:3px 8px;font-size:10px;font-weight:bold;white-space:nowrap">${staff.name}</td>
        <td style="border:1px solid #e5e7eb;padding:3px 6px;font-size:10px;text-align:center">${staff.code}</td>
        <td style="border:1px solid #e5e7eb;padding:3px 6px;font-size:10px;text-align:center;font-weight:bold">${staff.title}</td>
        ${cells}
        <td style="border:1px solid #e5e7eb;text-align:center;padding:2px;font-size:10px;background:#f0fdf4;color:#166534;font-weight:bold">${sum.D}</td>
        <td style="border:1px solid #e5e7eb;text-align:center;padding:2px;font-size:10px;background:#fefce8;color:#854d0e;font-weight:bold">${sum.N}</td>
        <td style="border:1px solid #e5e7eb;text-align:center;padding:2px;font-size:10px;background:#eff6ff;color:#1e40af;font-weight:bold">${sum.DN}</td>
        <td style="border:1px solid #e5e7eb;text-align:center;padding:2px;font-size:10px;background:#fef2f2;color:#991b1b;font-weight:bold">${sum.OFF}</td>
        <td style="border:1px solid #e5e7eb;text-align:center;padding:2px;font-size:10px;font-weight:900">${sum.hours}س</td>
      </tr>`
    }).join('')

    const dayHeaders = days.map(d => {
      const friday = isFriday(d)
      return `<th style="border:1px solid #e5e7eb;text-align:center;padding:2px 1px;font-size:9px;min-width:22px;${friday?'background:#fffbeb;color:#92400e':''}">
        <div style="font-size:8px;color:#6b7280">${getDayName(d)}</div>
        <div>${d}</div>
      </th>`
    }).join('')

    const balanceRow = days.map(d => {
      const b = getDayBalance(d)
      const friday = isFriday(d)
      return `<td style="border:1px solid #e5e7eb;text-align:center;padding:1px;font-size:8px;${friday?'background:#fffbeb':''}">
        ${b.D > 0 ? `<div style="color:#166534">D:${b.D}</div>` : ''}
        ${b.N > 0 ? `<div style="color:#854d0e">N:${b.N}</div>` : ''}
      </td>`
    }).join('')

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html dir="rtl"><head><meta charset="utf-8">
      <title>الروستر الشهري — ${unit} — ${MONTHS[month]} ${year}</title>
      <style>
        body { font-family: 'Arial', sans-serif; padding: 20px; direction: rtl; }
        h2 { color: #0d9488; margin-bottom: 4px; }
        .meta { color: #6b7280; font-size: 12px; margin-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; }
        th { background: #f3f4f6; border: 1px solid #e5e7eb; padding: 4px 6px; font-size: 11px; }
        .legend { display: flex; gap: 10px; margin: 10px 0; flex-wrap: wrap; font-size: 11px; }
        .leg { padding: 2px 8px; border-radius: 4px; }
        .sig { display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px; color: #6b7280; }
        @media print { body { padding: 10px; } }
      </style>
      </head><body>
      <h2>الروستر الشهري الكامل</h2>
      <div class="meta">الوحدة: <strong>${unit}</strong> &nbsp;|&nbsp; الشهر: <strong>${MONTHS[month]} ${year}</strong> &nbsp;|&nbsp; عدد الموظفين: <strong>${staffInUnit.length}</strong></div>
      <div class="legend">
        <span class="leg" style="background:#dcfce7;color:#166534">☀ D = نهاري (12س)</span>
        <span class="leg" style="background:#fef9c3;color:#854d0e">🌙 N = ليلي (12س)</span>
        <span class="leg" style="background:#dbeafe;color:#1e40af">⟳ DN = مزدوج (24س)</span>
        <span class="leg" style="background:#fee2e2;color:#991b1b">OFF = راحة</span>
        <span class="leg" style="background:#f3e8ff;color:#6b21a8">ABS = غياب</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="min-width:20px">#</th>
            <th style="min-width:110px;text-align:right">الاسم</th>
            <th style="min-width:45px">الكود</th>
            <th style="min-width:35px">رتبة</th>
            ${dayHeaders}
            <th style="background:#f0fdf4;color:#166534">D</th>
            <th style="background:#fefce8;color:#854d0e">N</th>
            <th style="background:#eff6ff;color:#1e40af">DN</th>
            <th style="background:#fef2f2;color:#991b1b">OFF</th>
            <th style="min-width:40px">Σ</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr style="background:#f9fafb;font-weight:bold;border-top:2px solid #e5e7eb">
            <td style="border:1px solid #e5e7eb"></td>
            <td style="border:1px solid #e5e7eb;padding:3px 8px;font-size:10px" colspan="3">التوازن اليومي</td>
            ${balanceRow}
            <td colspan="5"></td>
          </tr>
        </tbody>
      </table>
      <div class="sig">
        <span>رئيس التمريض (CNO): ___________________________</span>
        <span>التوقيع: _______________</span>
        <span>التاريخ: _______________</span>
      </div>
      <script>window.print();window.close();</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">الروستر الشهري الكامل</h1>
          <p className="text-muted-foreground text-sm">عرض شامل لجميع الشيفتات — نهاري / ليلي / مزدوج</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 ml-1" />طباعة
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-4 pb-3 flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">الوحدة</p>
            <div className="flex gap-1 flex-wrap">
              {UNITS.map(u => (
                <Button
                  key={u}
                  variant={unit === u ? 'default' : 'outline'}
                  size="sm" className="h-7 text-xs"
                  onClick={() => setUnit(u)}
                >{u}</Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mr-auto">
            <Select value={String(month)} onValueChange={v => setMonth(+v)}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={v => setYear(+v)}>
              <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-2 flex-wrap text-xs">
        {[
          { code: 'D',   icon: <Sun  className="h-3 w-3" /> },
          { code: 'N',   icon: <Moon className="h-3 w-3" /> },
          { code: 'DN',  icon: <RefreshCw className="h-3 w-3" /> },
          { code: 'OFF', icon: <X className="h-3 w-3" /> },
          { code: 'ABS', icon: null },
        ].map(s => (
          <span key={s.code} className={cn('px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium', shiftStyle[s.code]?.cell)}>
            {s.icon}<strong>{s.code}</strong>
            <span className="font-normal text-[10px]">
              = {shiftStyle[s.code]?.label}
              {shiftStyle[s.code]?.hours ? ` (${shiftStyle[s.code].hours}س)` : ''}
            </span>
          </span>
        ))}
      </div>

      {/* Roster table */}
      <Card>
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {unit} — {MONTHS[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>موظفون: <strong>{staffInUnit.length}</strong></span>
              <span>أيام: <strong>{daysInMonth}</strong></span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs" style={{ minWidth: `${daysInMonth * 30 + 280}px` }}>
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="sticky right-0 bg-muted/40 text-center px-2 py-2 w-7 border-l border-border">#</th>
                  <th className="sticky text-right px-3 py-2 min-w-[130px] bg-muted/40 border-l border-border" style={{right:'28px'}}>الاسم</th>
                  <th className="sticky text-center px-2 py-2 w-12 bg-muted/40 border-l border-border" style={{right:'158px'}}>الكود</th>
                  <th className="sticky text-center px-2 py-2 w-12 bg-muted/40 border-l-2 border-border" style={{right:'210px'}}>رتبة</th>
                  {days.map(d => (
                    <th key={d} className={cn('text-center py-1 px-0.5 min-w-[26px] border-l border-border', isFriday(d) && 'bg-amber-50 dark:bg-amber-900/20 text-amber-700')}>
                      <div className="text-[8px] text-muted-foreground leading-none">{getDayName(d)}</div>
                      <div className="font-bold leading-tight">{d}</div>
                    </th>
                  ))}
                  <th className="text-center px-1 py-1 min-w-[26px] border-l bg-green-50  dark:bg-green-900/20  text-green-700  text-[10px]">D</th>
                  <th className="text-center px-1 py-1 min-w-[26px] border-l bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 text-[10px]">N</th>
                  <th className="text-center px-1 py-1 min-w-[26px] border-l bg-blue-50   dark:bg-blue-900/20   text-blue-700   text-[10px]">DN</th>
                  <th className="text-center px-1 py-1 min-w-[26px] border-l bg-red-50    dark:bg-red-900/20    text-red-700    text-[10px]">OFF</th>
                  <th className="text-center px-1 py-1 min-w-[36px] bg-muted/50 font-black text-[10px]">Σ ساعات</th>
                </tr>
              </thead>
              <tbody>
                {staffInUnit.map((staff, si) => {
                  const sum = getSummary(staff)
                  return (
                    <tr key={staff.id} className="border-b last:border-0 hover:bg-muted/20 group">
                      <td className="sticky right-0 bg-card group-hover:bg-muted/20 px-2 py-1 text-center text-muted-foreground border-l border-border">{si + 1}</td>
                      <td className="sticky bg-card group-hover:bg-muted/20 px-3 py-1 font-medium border-l border-border whitespace-nowrap" style={{right:'28px'}}>{staff.name}</td>
                      <td className="sticky bg-card group-hover:bg-muted/20 px-2 py-1 text-center text-muted-foreground border-l border-border text-[10px]" style={{right:'158px'}}>{staff.code}</td>
                      <td className="sticky bg-card group-hover:bg-muted/20 px-2 py-1 text-center border-l-2 border-border font-bold" style={{right:'210px'}}>
                        <span className={cn('text-[10px]', titleColors[staff.title] || 'text-muted-foreground')}>{staff.title}</span>
                      </td>
                      {days.map(d => {
                        const s = getShift(staff, d)
                        const style = shiftStyle[s] || shiftStyle['']
                        return (
                          <td key={d} className={cn('py-0.5 px-0.5 text-center border-l border-border', isFriday(d) && 'bg-amber-50/40 dark:bg-amber-900/10')}>
                            <span className={cn(
                              'inline-block text-[9px] font-bold rounded px-0.5 leading-4 min-w-[18px]',
                              style.cell
                            )}>
                              {s === 'D'   ? '☀ D' :
                               s === 'N'   ? '🌙 N' :
                               s === 'DN'  ? '⟳DN' :
                               s === 'OFF' ? 'OFF' :
                               s === 'ABS' ? 'ABS' : '—'}
                            </span>
                          </td>
                        )
                      })}
                      <td className="py-1 px-1 text-center border-l bg-green-50/50  dark:bg-green-900/10  font-bold text-green-700  text-[10px]">{sum.D}</td>
                      <td className="py-1 px-1 text-center border-l bg-yellow-50/50 dark:bg-yellow-900/10 font-bold text-yellow-700 text-[10px]">{sum.N}</td>
                      <td className="py-1 px-1 text-center border-l bg-blue-50/50   dark:bg-blue-900/10   font-bold text-blue-700   text-[10px]">{sum.DN}</td>
                      <td className="py-1 px-1 text-center border-l bg-red-50/50    dark:bg-red-900/10    font-bold text-red-700    text-[10px]">{sum.OFF}</td>
                      <td className="py-1 px-1 text-center font-black bg-muted/30 text-[10px]">{sum.hours}س</td>
                    </tr>
                  )
                })}

                {/* Balance row */}
                <tr className="bg-muted/50 font-bold border-t-2">
                  <td className="sticky right-0 bg-muted/50 px-2 py-1 border-l border-border" />
                  <td className="sticky bg-muted/50 px-3 py-1 border-l-2 border-border text-xs font-bold" style={{right:'28px'}} colSpan={3}>التوازن اليومي</td>
                  {days.map(d => {
                    const b = getDayBalance(d)
                    return (
                      <td key={d} className={cn('py-0.5 px-0.5 text-center border-l border-border', isFriday(d) && 'bg-amber-50/40')}>
                        <div className="text-[8px] font-bold text-green-700  leading-none">{b.D > 0 ? `D${b.D}` : ''}</div>
                        <div className="text-[8px] font-bold text-yellow-700 leading-none">{b.N > 0 ? `N${b.N}` : ''}</div>
                      </td>
                    )
                  })}
                  <td colSpan={5} />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>رئيس التمريض (CNO): ___________________________</span>
            <span>التوقيع: _______________</span>
            <span>التاريخ: _______________</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
