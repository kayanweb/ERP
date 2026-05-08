/**
 * Attendance Service
 */
import { attendanceRepo } from '@/lib/repositories'
import type { AttendanceRecord } from '@/lib/repositories'

export type { AttendanceRecord }

export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  return attendanceRepo().getAll()
}

export async function getAttendanceById(id: string): Promise<AttendanceRecord | undefined> {
  return attendanceRepo().getById(id)
}

export async function getAttendanceByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
  return attendanceRepo().getByEmployee(employeeId)
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  return attendanceRepo().getByDate(date)
}

export async function getAttendanceByDateRange(startDate: string, endDate: string): Promise<AttendanceRecord[]> {
  return attendanceRepo().getByDateRange(startDate, endDate)
}

export async function createAttendance(
  attendance: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AttendanceRecord> {
  return attendanceRepo().create(attendance)
}

export async function updateAttendance(
  id: string,
  updates: Partial<AttendanceRecord>
): Promise<AttendanceRecord | undefined> {
  return attendanceRepo().update(id, updates)
}

export async function deleteAttendance(id: string): Promise<void> {
  return attendanceRepo().delete(id)
}

export async function checkIn(
  employeeId: string,
  employeeName: string,
  departmentId: string,
  shift: 'morning' | 'evening' | 'night',
  scheduledStart: string,
  scheduledEnd: string
): Promise<AttendanceRecord> {
  const now = new Date()
  const actualStart = now.toTimeString().slice(0, 5)
  const scheduledTime = new Date(`1970-01-01T${scheduledStart}:00`)
  const actualTime = new Date(`1970-01-01T${actualStart}:00`)
  const lateMinutes = Math.max(0, Math.floor((actualTime.getTime() - scheduledTime.getTime()) / 60000))
  
  return attendanceRepo().create({
    employeeId,
    employeeName,
    departmentId,
    date: now.toISOString().split('T')[0],
    shift,
    scheduledStart,
    scheduledEnd,
    actualStart,
    status: lateMinutes > 0 ? 'late' : 'present',
    lateMinutes: lateMinutes > 0 ? lateMinutes : undefined,
  })
}

export async function checkOut(id: string): Promise<AttendanceRecord | undefined> {
  const attendance = await attendanceRepo().getById(id)
  if (!attendance) return undefined
  
  const now = new Date()
  const actualEnd = now.toTimeString().slice(0, 5)
  const scheduledTime = new Date(`1970-01-01T${attendance.scheduledEnd}:00`)
  const actualTime = new Date(`1970-01-01T${actualEnd}:00`)
  const overtimeMinutes = Math.max(0, Math.floor((actualTime.getTime() - scheduledTime.getTime()) / 60000))
  
  return attendanceRepo().update(id, {
    actualEnd,
    overtimeMinutes: overtimeMinutes > 0 ? overtimeMinutes : undefined,
  })
}

export async function getAttendanceStats(departmentId: string, date: string): Promise<{
  total: number
  present: number
  absent: number
  late: number
  excused: number
}> {
  const attendance = await attendanceRepo().getByDate(date)
  const deptAttendance = attendance.filter(a => a.departmentId === departmentId)
  
  return {
    total: deptAttendance.length,
    present: deptAttendance.filter(a => a.status === 'present').length,
    absent: deptAttendance.filter(a => a.status === 'absent').length,
    late: deptAttendance.filter(a => a.status === 'late').length,
    excused: deptAttendance.filter(a => a.status === 'excused').length,
  }
}
