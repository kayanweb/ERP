/**
 * Overtime Service
 */
import { overtimeRepo } from '@/lib/repositories'
import type { OvertimeRecord } from '@/lib/repositories'

export type { OvertimeRecord }

export async function getAllOvertime(): Promise<OvertimeRecord[]> {
  return overtimeRepo().getAll()
}

export async function getOvertimeById(id: string): Promise<OvertimeRecord | undefined> {
  return overtimeRepo().getById(id)
}

export async function getOvertimeByEmployee(employeeId: string): Promise<OvertimeRecord[]> {
  return overtimeRepo().getByEmployee(employeeId)
}

export async function getPendingOvertime(): Promise<OvertimeRecord[]> {
  return overtimeRepo().getPending()
}

export async function createOvertime(
  overtime: Omit<OvertimeRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<OvertimeRecord> {
  return overtimeRepo().create(overtime)
}

export async function updateOvertime(
  id: string,
  updates: Partial<OvertimeRecord>
): Promise<OvertimeRecord | undefined> {
  return overtimeRepo().update(id, updates)
}

export async function approveOvertime(
  id: string,
  approverId: string
): Promise<OvertimeRecord | undefined> {
  return overtimeRepo().update(id, {
    status: 'approved',
    approvedBy: approverId,
    approvedAt: new Date().toISOString(),
  })
}

export async function rejectOvertime(
  id: string,
  approverId: string
): Promise<OvertimeRecord | undefined> {
  return overtimeRepo().update(id, {
    status: 'rejected',
    approvedBy: approverId,
    approvedAt: new Date().toISOString(),
  })
}

export async function deleteOvertime(id: string): Promise<void> {
  return overtimeRepo().delete(id)
}

export function calculateHours(startTime: string, endTime: string): number {
  const start = new Date(`1970-01-01T${startTime}:00`)
  const end = new Date(`1970-01-01T${endTime}:00`)
  let diff = end.getTime() - start.getTime()
  if (diff < 0) diff += 24 * 60 * 60 * 1000 // Handle overnight
  return diff / (1000 * 60 * 60)
}

export async function getOvertimeStats(employeeId: string, month: string): Promise<{
  totalHours: number
  approved: number
  pending: number
  rejected: number
}> {
  const overtime = await overtimeRepo().getByEmployee(employeeId)
  const monthOvertime = overtime.filter(o => o.date.startsWith(month))
  
  return {
    totalHours: monthOvertime
      .filter(o => o.status === 'approved')
      .reduce((sum, o) => sum + o.totalHours, 0),
    approved: monthOvertime.filter(o => o.status === 'approved').length,
    pending: monthOvertime.filter(o => o.status === 'pending').length,
    rejected: monthOvertime.filter(o => o.status === 'rejected').length,
  }
}
