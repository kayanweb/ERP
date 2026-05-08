/**
 * Vacations Service
 */
import { vacationRepo } from '@/lib/repositories'
import type { VacationRecord, VacationStatus } from '@/lib/repositories'

export type { VacationRecord }

export async function getAllVacations(): Promise<VacationRecord[]> {
  return vacationRepo().getAll()
}

export async function getVacationById(id: string): Promise<VacationRecord | undefined> {
  return vacationRepo().getById(id)
}

export async function getVacationsByEmployee(employeeId: string): Promise<VacationRecord[]> {
  return vacationRepo().getByEmployee(employeeId)
}

export async function getVacationsByStatus(status: VacationStatus): Promise<VacationRecord[]> {
  return vacationRepo().getByStatus(status)
}

export async function getPendingVacations(): Promise<VacationRecord[]> {
  return vacationRepo().getByStatus('pending')
}

export async function createVacation(
  vacation: Omit<VacationRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<VacationRecord> {
  return vacationRepo().create(vacation)
}

export async function updateVacation(
  id: string,
  updates: Partial<VacationRecord>
): Promise<VacationRecord | undefined> {
  return vacationRepo().update(id, updates)
}

export async function approveVacation(
  id: string,
  reviewerId: string,
  notes?: string
): Promise<VacationRecord | undefined> {
  return vacationRepo().update(id, {
    status: 'approved',
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
    reviewNotes: notes,
  })
}

export async function rejectVacation(
  id: string,
  reviewerId: string,
  notes?: string
): Promise<VacationRecord | undefined> {
  return vacationRepo().update(id, {
    status: 'rejected',
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
    reviewNotes: notes,
  })
}

export async function deleteVacation(id: string): Promise<void> {
  return vacationRepo().delete(id)
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export async function getVacationBalance(employeeId: string, year: number): Promise<{
  annual: { total: number; used: number; remaining: number }
  sick: { total: number; used: number; remaining: number }
}> {
  const vacations = await vacationRepo().getByEmployee(employeeId)
  const yearVacations = vacations.filter(v => 
    v.status === 'approved' && 
    new Date(v.startDate).getFullYear() === year
  )
  
  const annualUsed = yearVacations
    .filter(v => v.type === 'annual')
    .reduce((sum, v) => sum + v.totalDays, 0)
  
  const sickUsed = yearVacations
    .filter(v => v.type === 'sick')
    .reduce((sum, v) => sum + v.totalDays, 0)
  
  return {
    annual: { total: 30, used: annualUsed, remaining: 30 - annualUsed },
    sick: { total: 15, used: sickUsed, remaining: 15 - sickUsed },
  }
}
