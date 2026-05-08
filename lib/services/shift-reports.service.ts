/**
 * Shift Reports Service
 */
import { shiftReportRepo } from '@/lib/repositories'
import type { ShiftReportRecord, ShiftType } from '@/lib/repositories'

export type { ShiftReportRecord }

export async function getAllShiftReports(): Promise<ShiftReportRecord[]> {
  return shiftReportRepo().getAll()
}

export async function getShiftReportById(id: string): Promise<ShiftReportRecord | undefined> {
  return shiftReportRepo().getById(id)
}

export async function getShiftReportsByDate(date: string): Promise<ShiftReportRecord[]> {
  return shiftReportRepo().getByDate(date)
}

export async function getShiftReportsByDateRange(startDate: string, endDate: string): Promise<ShiftReportRecord[]> {
  return shiftReportRepo().getByDateRange(startDate, endDate)
}

export async function createShiftReport(
  report: Omit<ShiftReportRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ShiftReportRecord> {
  return shiftReportRepo().create(report)
}

export async function updateShiftReport(
  id: string,
  updates: Partial<ShiftReportRecord>
): Promise<ShiftReportRecord | undefined> {
  return shiftReportRepo().update(id, updates)
}

export async function submitShiftReport(id: string): Promise<ShiftReportRecord | undefined> {
  return shiftReportRepo().update(id, {
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  })
}

export async function approveShiftReport(
  id: string,
  approverId: string,
  approverName: string
): Promise<ShiftReportRecord | undefined> {
  return shiftReportRepo().update(id, {
    status: 'approved',
    approvedById: approverId,
    approvedByName: approverName,
    approvedAt: new Date().toISOString(),
  })
}

export async function deleteShiftReport(id: string): Promise<void> {
  return shiftReportRepo().delete(id)
}

export function getShiftLabel(shift: ShiftType): { en: string; ar: string } {
  const labels: Record<ShiftType, { en: string; ar: string }> = {
    morning: { en: 'Morning', ar: 'صباحي' },
    evening: { en: 'Evening', ar: 'مسائي' },
    night: { en: 'Night', ar: 'ليلي' },
  }
  return labels[shift]
}

export function getStatusLabel(status: ShiftReportRecord['status']): { en: string; ar: string; color: string } {
  const labels: Record<string, { en: string; ar: string; color: string }> = {
    draft: { en: 'Draft', ar: 'مسودة', color: 'gray' },
    submitted: { en: 'Submitted', ar: 'مقدم', color: 'blue' },
    approved: { en: 'Approved', ar: 'معتمد', color: 'green' },
  }
  return labels[status]
}

export const DEFAULT_CHECKLIST_ITEMS = [
  { id: '1', name: 'Patient rounds completed', nameAr: 'جولات المرضى مكتملة' },
  { id: '2', name: 'Medications administered', nameAr: 'الأدوية أُعطيت' },
  { id: '3', name: 'Vital signs documented', nameAr: 'العلامات الحيوية موثقة' },
  { id: '4', name: 'Patient safety checks', nameAr: 'فحوصات سلامة المرضى' },
  { id: '5', name: 'Equipment checked', nameAr: 'المعدات فُحصت' },
  { id: '6', name: 'Documentation completed', nameAr: 'التوثيق مكتمل' },
  { id: '7', name: 'Handover briefing done', nameAr: 'إحاطة التسليم تمت' },
  { id: '8', name: 'Emergency equipment checked', nameAr: 'معدات الطوارئ فُحصت' },
  { id: '9', name: 'Infection control measures', nameAr: 'إجراءات مكافحة العدوى' },
  { id: '10', name: 'Staff allocation confirmed', nameAr: 'توزيع الطاقم مؤكد' },
]

export async function getTodayReport(shift: ShiftType): Promise<ShiftReportRecord | undefined> {
  const today = new Date().toISOString().split('T')[0]
  const reports = await shiftReportRepo().getByDate(today)
  return reports.find(r => r.shift === shift)
}

export async function calculateTotalCensus(report: ShiftReportRecord): Promise<{
  totalBeds: number
  totalPatients: number
  totalNurses: number
  totalIsolation: number
  occupancyRate: number
}> {
  const totals = report.census.reduce(
    (acc, dept) => ({
      totalBeds: acc.totalBeds + dept.beds,
      totalPatients: acc.totalPatients + dept.patients,
      totalNurses: acc.totalNurses + dept.nurses,
      totalIsolation: acc.totalIsolation + dept.isolationCases,
    }),
    { totalBeds: 0, totalPatients: 0, totalNurses: 0, totalIsolation: 0 }
  )
  
  return {
    ...totals,
    occupancyRate: totals.totalBeds > 0 
      ? Math.round((totals.totalPatients / totals.totalBeds) * 100) 
      : 0,
  }
}

export async function getShiftReportStats(month: string): Promise<{
  total: number
  submitted: number
  approved: number
  avgProblems: number
  avgAbsences: number
}> {
  const reports = await shiftReportRepo().getByDateRange(
    `${month}-01`,
    `${month}-31`
  )
  
  const submitted = reports.filter(r => r.status !== 'draft')
  const approved = reports.filter(r => r.status === 'approved')
  
  const totalProblems = reports.reduce((sum, r) => sum + (r.problems?.length || 0), 0)
  const totalAbsences = reports.reduce((sum, r) => sum + (r.absences?.length || 0), 0)
  
  return {
    total: reports.length,
    submitted: submitted.length,
    approved: approved.length,
    avgProblems: reports.length > 0 ? Math.round((totalProblems / reports.length) * 10) / 10 : 0,
    avgAbsences: reports.length > 0 ? Math.round((totalAbsences / reports.length) * 10) / 10 : 0,
  }
}
