/**
 * Notifications Service
 */
import { notificationRepo } from '@/lib/repositories'
import type { NotificationRecord } from '@/lib/repositories'

export type { NotificationRecord }

export async function getAllNotifications(): Promise<NotificationRecord[]> {
  return notificationRepo().getAll()
}

export async function getNotificationById(id: string): Promise<NotificationRecord | undefined> {
  return notificationRepo().getById(id)
}

export async function getNotificationsByUser(userId: string): Promise<NotificationRecord[]> {
  return notificationRepo().getByRecipient(userId)
}

export async function getUnreadNotifications(userId: string): Promise<NotificationRecord[]> {
  return notificationRepo().getUnread(userId)
}

export async function getUnreadCount(userId: string): Promise<number> {
  const unread = await notificationRepo().getUnread(userId)
  return unread.length
}

export async function createNotification(
  notification: Omit<NotificationRecord, 'id' | 'createdAt' | 'isRead'>
): Promise<NotificationRecord> {
  return notificationRepo().create({ ...notification, isRead: false })
}

export async function markAsRead(id: string): Promise<void> {
  return notificationRepo().markAsRead(id)
}

export async function markAllAsRead(userId: string): Promise<void> {
  return notificationRepo().markAllAsRead(userId)
}

// Helper functions for creating specific notification types
export async function notifyTaskAssigned(
  recipientId: string,
  taskTitle: string,
  assignedBy: string,
  taskId: string
): Promise<NotificationRecord> {
  return createNotification({
    recipientId,
    type: 'task_assigned',
    title: 'New Task Assigned',
    titleAr: 'مهمة جديدة',
    message: `${assignedBy} assigned you a new task: ${taskTitle}`,
    messageAr: `${assignedBy} عين لك مهمة جديدة: ${taskTitle}`,
    priority: 'normal',
    actionUrl: `/tasks/${taskId}`,
    data: { taskId },
  })
}

export async function notifyTaskOverdue(
  recipientId: string,
  taskTitle: string,
  taskId: string
): Promise<NotificationRecord> {
  return createNotification({
    recipientId,
    type: 'task_overdue',
    title: 'Task Overdue',
    titleAr: 'مهمة متأخرة',
    message: `Task "${taskTitle}" is overdue`,
    messageAr: `المهمة "${taskTitle}" متأخرة`,
    priority: 'high',
    actionUrl: `/tasks/${taskId}`,
    data: { taskId },
  })
}

export async function notifyHandoverPending(
  recipientId: string,
  patientName: string,
  fromNurse: string,
  handoverId: string
): Promise<NotificationRecord> {
  return createNotification({
    recipientId,
    type: 'handover_request',
    title: 'Handover Pending',
    titleAr: 'تسليم معلق',
    message: `${fromNurse} has a handover for patient ${patientName}`,
    messageAr: `${fromNurse} لديه تسليم للمريض ${patientName}`,
    priority: 'high',
    actionUrl: `/handover/${handoverId}`,
    data: { handoverId },
  })
}

export async function notifyEmergencyCode(
  recipientId: string,
  codeType: string,
  location: string,
  codeId: string
): Promise<NotificationRecord> {
  return createNotification({
    recipientId,
    type: 'emergency_code',
    title: `${codeType} Activated`,
    titleAr: `تم تفعيل ${codeType}`,
    message: `Emergency code activated at ${location}`,
    messageAr: `تم تفعيل كود الطوارئ في ${location}`,
    priority: 'urgent',
    actionUrl: `/emergency/${codeId}`,
    data: { codeId, codeType },
  })
}

export async function notifyVitalAlert(
  recipientId: string,
  patientName: string,
  ewsScore: number,
  patientId: string
): Promise<NotificationRecord> {
  return createNotification({
    recipientId,
    type: 'vital_alert',
    title: 'Vital Signs Alert',
    titleAr: 'تنبيه العلامات الحيوية',
    message: `Patient ${patientName} has EWS score of ${ewsScore}`,
    messageAr: `المريض ${patientName} لديه درجة EWS ${ewsScore}`,
    priority: ewsScore >= 7 ? 'urgent' : 'high',
    actionUrl: `/patients/${patientId}/vitals`,
    data: { patientId, ewsScore },
  })
}

export async function notifyLowInventory(
  recipientId: string,
  itemName: string,
  currentStock: number,
  itemId: string
): Promise<NotificationRecord> {
  return createNotification({
    recipientId,
    type: 'inventory_low',
    title: 'Low Inventory Alert',
    titleAr: 'تنبيه مخزون منخفض',
    message: `${itemName} is low (${currentStock} remaining)`,
    messageAr: `${itemName} منخفض (${currentStock} متبقي)`,
    priority: 'normal',
    actionUrl: `/inventory/${itemId}`,
    data: { itemId, currentStock },
  })
}

export async function notifyShiftReminder(
  recipientId: string,
  shift: string,
  date: string
): Promise<NotificationRecord> {
  return createNotification({
    recipientId,
    type: 'shift_reminder',
    title: 'Shift Reminder',
    titleAr: 'تذكير بالمناوبة',
    message: `You have a ${shift} shift on ${date}`,
    messageAr: `لديك مناوبة ${shift} في ${date}`,
    priority: 'normal',
    data: { shift, date },
  })
}

export async function notifyApprovalNeeded(
  recipientId: string,
  requestType: string,
  requesterId: string,
  requesterName: string,
  requestId: string
): Promise<NotificationRecord> {
  return createNotification({
    recipientId,
    type: 'approval_needed',
    title: 'Approval Required',
    titleAr: 'مطلوب موافقة',
    message: `${requesterName} submitted a ${requestType} request`,
    messageAr: `${requesterName} قدم طلب ${requestType}`,
    priority: 'normal',
    actionUrl: `/approvals/${requestId}`,
    data: { requestType, requesterId, requestId },
  })
}

export function getPriorityColor(priority: NotificationRecord['priority']): string {
  switch (priority) {
    case 'urgent':
      return 'red'
    case 'high':
      return 'orange'
    case 'normal':
      return 'blue'
    case 'low':
      return 'gray'
  }
}
