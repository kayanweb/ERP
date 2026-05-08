/**
 * Audit Log Service
 */
import { auditLogRepo } from '@/lib/repositories'
import type { AuditLogRecord } from '@/lib/repositories'

export type { AuditLogRecord }

export async function logAction(
  entry: Omit<AuditLogRecord, 'id' | 'timestamp'>
): Promise<void> {
  return auditLogRepo().add({
    ...entry,
    timestamp: new Date().toISOString(),
  })
}

export async function getRecentLogs(limit?: number): Promise<AuditLogRecord[]> {
  return auditLogRepo().getRecent(limit)
}

export async function getLogsByUser(userId: string): Promise<AuditLogRecord[]> {
  return auditLogRepo().getByUser(userId)
}

export async function getLogsByModule(module: string): Promise<AuditLogRecord[]> {
  return auditLogRepo().getByModule(module)
}

// Helper functions for common audit log entries
export async function logCreate(
  userId: string,
  userName: string,
  module: string,
  targetType: string,
  targetId: string,
  newValue: Record<string, unknown>
): Promise<void> {
  return logAction({
    userId,
    userName,
    action: 'create',
    module,
    targetType,
    targetId,
    newValue,
  })
}

export async function logUpdate(
  userId: string,
  userName: string,
  module: string,
  targetType: string,
  targetId: string,
  previousValue: Record<string, unknown>,
  newValue: Record<string, unknown>
): Promise<void> {
  return logAction({
    userId,
    userName,
    action: 'update',
    module,
    targetType,
    targetId,
    previousValue,
    newValue,
  })
}

export async function logDelete(
  userId: string,
  userName: string,
  module: string,
  targetType: string,
  targetId: string,
  previousValue: Record<string, unknown>
): Promise<void> {
  return logAction({
    userId,
    userName,
    action: 'delete',
    module,
    targetType,
    targetId,
    previousValue,
  })
}

export async function logLogin(
  userId: string,
  userName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAction({
    userId,
    userName,
    action: 'login',
    module: 'auth',
    ipAddress,
    userAgent,
  })
}

export async function logLogout(
  userId: string,
  userName: string
): Promise<void> {
  return logAction({
    userId,
    userName,
    action: 'logout',
    module: 'auth',
  })
}

export async function logView(
  userId: string,
  userName: string,
  module: string,
  targetType: string,
  targetId: string
): Promise<void> {
  return logAction({
    userId,
    userName,
    action: 'view',
    module,
    targetType,
    targetId,
  })
}

export async function logExport(
  userId: string,
  userName: string,
  module: string,
  details?: Record<string, unknown>
): Promise<void> {
  return logAction({
    userId,
    userName,
    action: 'export',
    module,
    details,
  })
}

export function getActionLabel(action: string): { en: string; ar: string } {
  const labels: Record<string, { en: string; ar: string }> = {
    create: { en: 'Created', ar: 'إنشاء' },
    update: { en: 'Updated', ar: 'تحديث' },
    delete: { en: 'Deleted', ar: 'حذف' },
    login: { en: 'Logged In', ar: 'تسجيل دخول' },
    logout: { en: 'Logged Out', ar: 'تسجيل خروج' },
    view: { en: 'Viewed', ar: 'عرض' },
    export: { en: 'Exported', ar: 'تصدير' },
    approve: { en: 'Approved', ar: 'موافقة' },
    reject: { en: 'Rejected', ar: 'رفض' },
  }
  return labels[action] || { en: action, ar: action }
}

export function getModuleLabel(module: string): { en: string; ar: string } {
  const labels: Record<string, { en: string; ar: string }> = {
    auth: { en: 'Authentication', ar: 'المصادقة' },
    employees: { en: 'Employees', ar: 'الموظفين' },
    patients: { en: 'Patients', ar: 'المرضى' },
    roster: { en: 'Roster', ar: 'الجدول' },
    vacations: { en: 'Vacations', ar: 'الإجازات' },
    attendance: { en: 'Attendance', ar: 'الحضور' },
    overtime: { en: 'Overtime', ar: 'العمل الإضافي' },
    equipment: { en: 'Equipment', ar: 'المعدات' },
    inventory: { en: 'Inventory', ar: 'المخزون' },
    incidents: { en: 'Incidents', ar: 'الحوادث' },
    training: { en: 'Training', ar: 'التدريب' },
    settings: { en: 'Settings', ar: 'الإعدادات' },
  }
  return labels[module] || { en: module, ar: module }
}

export async function getAuditStats(days: number = 30): Promise<{
  totalActions: number
  byAction: Record<string, number>
  byModule: Record<string, number>
  byUser: { userId: string; userName: string; count: number }[]
}> {
  const logs = await auditLogRepo().getRecent(10000)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString()
  
  const recentLogs = logs.filter(l => l.timestamp >= cutoffStr)
  
  const byAction: Record<string, number> = {}
  const byModule: Record<string, number> = {}
  const byUserMap: Record<string, { userName: string; count: number }> = {}
  
  recentLogs.forEach(log => {
    byAction[log.action] = (byAction[log.action] || 0) + 1
    byModule[log.module] = (byModule[log.module] || 0) + 1
    
    if (!byUserMap[log.userId]) {
      byUserMap[log.userId] = { userName: log.userName, count: 0 }
    }
    byUserMap[log.userId].count++
  })
  
  const byUser = Object.entries(byUserMap)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  return {
    totalActions: recentLogs.length,
    byAction,
    byModule,
    byUser,
  }
}
