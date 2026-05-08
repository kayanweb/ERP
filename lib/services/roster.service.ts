/**
 * Roster Service
 */
import { rosterRepo } from '@/lib/repositories'
import type { RosterRecord, ShiftType } from '@/lib/repositories'

export type { RosterRecord }

export async function getAllRosters(): Promise<RosterRecord[]> {
  return rosterRepo().getAll()
}

export async function getRosterById(id: string): Promise<RosterRecord | undefined> {
  return rosterRepo().getById(id)
}

export async function getRostersByEmployee(employeeId: string): Promise<RosterRecord[]> {
  return rosterRepo().getByEmployee(employeeId)
}

export async function getRostersByDepartment(departmentId: string): Promise<RosterRecord[]> {
  return rosterRepo().getByDepartment(departmentId)
}

export async function getRostersByDateRange(startDate: string, endDate: string): Promise<RosterRecord[]> {
  return rosterRepo().getByDateRange(startDate, endDate)
}

export async function createRoster(
  roster: Omit<RosterRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RosterRecord> {
  return rosterRepo().create(roster)
}

export async function updateRoster(
  id: string,
  updates: Partial<RosterRecord>
): Promise<RosterRecord | undefined> {
  return rosterRepo().update(id, updates)
}

export async function deleteRoster(id: string): Promise<void> {
  return rosterRepo().delete(id)
}

export async function getRostersByWeek(startOfWeek: Date): Promise<RosterRecord[]> {
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  
  return rosterRepo().getByDateRange(
    startOfWeek.toISOString().split('T')[0],
    endOfWeek.toISOString().split('T')[0]
  )
}

export async function getShiftCoverage(date: string, departmentId: string): Promise<{
  morning: number
  evening: number
  night: number
}> {
  const rosters = await rosterRepo().getByDateRange(date, date)
  const deptRosters = rosters.filter(r => r.departmentId === departmentId)
  
  return {
    morning: deptRosters.filter(r => r.shift === 'morning').length,
    evening: deptRosters.filter(r => r.shift === 'evening').length,
    night: deptRosters.filter(r => r.shift === 'night').length,
  }
}

export function getShiftTimes(shift: ShiftType): { start: string; end: string } {
  switch (shift) {
    case 'morning':
      return { start: '07:00', end: '15:00' }
    case 'evening':
      return { start: '15:00', end: '23:00' }
    case 'night':
      return { start: '23:00', end: '07:00' }
  }
}
