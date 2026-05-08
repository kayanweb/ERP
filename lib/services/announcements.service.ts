/**
 * Announcements Service
 */
import { announcementRepo } from '@/lib/repositories'
import type { AnnouncementRecord } from '@/lib/repositories'

export type { AnnouncementRecord }

export async function getAllAnnouncements(): Promise<AnnouncementRecord[]> {
  return announcementRepo().getAll()
}

export async function getAnnouncementById(id: string): Promise<AnnouncementRecord | undefined> {
  return announcementRepo().getById(id)
}

export async function getActiveAnnouncements(): Promise<AnnouncementRecord[]> {
  return announcementRepo().getActive()
}

export async function getAnnouncementsForUser(
  userId: string,
  userDepartments: string[],
  userRoles: string[]
): Promise<AnnouncementRecord[]> {
  const active = await announcementRepo().getActive()
  
  return active.filter(announcement => {
    // If no target specified, show to all
    if (!announcement.targetDepartments?.length && !announcement.targetRoles?.length) {
      return true
    }
    
    // Check department match
    if (announcement.targetDepartments?.length) {
      const deptMatch = announcement.targetDepartments.some(d => userDepartments.includes(d))
      if (!deptMatch) return false
    }
    
    // Check role match
    if (announcement.targetRoles?.length) {
      const roleMatch = announcement.targetRoles.some(r => userRoles.includes(r))
      if (!roleMatch) return false
    }
    
    return true
  })
}

export async function createAnnouncement(
  announcement: Omit<AnnouncementRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AnnouncementRecord> {
  return announcementRepo().create(announcement)
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<AnnouncementRecord>
): Promise<AnnouncementRecord | undefined> {
  return announcementRepo().update(id, updates)
}

export async function markAsRead(id: string, userId: string): Promise<AnnouncementRecord | undefined> {
  const announcement = await announcementRepo().getById(id)
  if (!announcement) return undefined
  
  const readBy = announcement.readBy || []
  if (readBy.includes(userId)) return announcement
  
  readBy.push(userId)
  return announcementRepo().update(id, { readBy })
}

export async function pinAnnouncement(id: string): Promise<AnnouncementRecord | undefined> {
  return announcementRepo().update(id, { isPinned: true })
}

export async function unpinAnnouncement(id: string): Promise<AnnouncementRecord | undefined> {
  return announcementRepo().update(id, { isPinned: false })
}

export async function deleteAnnouncement(id: string): Promise<void> {
  return announcementRepo().delete(id)
}

export function getTypeLabel(type: AnnouncementRecord['type']): { en: string; ar: string; color: string } {
  const labels: Record<string, { en: string; ar: string; color: string }> = {
    general: { en: 'General', ar: 'عام', color: 'blue' },
    urgent: { en: 'Urgent', ar: 'عاجل', color: 'red' },
    policy: { en: 'Policy', ar: 'سياسة', color: 'purple' },
    event: { en: 'Event', ar: 'فعالية', color: 'green' },
    maintenance: { en: 'Maintenance', ar: 'صيانة', color: 'yellow' },
  }
  return labels[type] || { en: type, ar: type, color: 'gray' }
}

export function getPriorityLabel(priority: AnnouncementRecord['priority']): { en: string; ar: string } {
  const labels: Record<string, { en: string; ar: string }> = {
    low: { en: 'Low', ar: 'منخفض' },
    normal: { en: 'Normal', ar: 'عادي' },
    high: { en: 'High', ar: 'عالي' },
  }
  return labels[priority]
}

export async function getAnnouncementStats(): Promise<{
  total: number
  active: number
  pinned: number
  byType: Record<string, number>
}> {
  const all = await announcementRepo().getAll()
  const active = await announcementRepo().getActive()
  
  const byType: Record<string, number> = {}
  all.forEach(a => {
    byType[a.type] = (byType[a.type] || 0) + 1
  })
  
  return {
    total: all.length,
    active: active.length,
    pinned: all.filter(a => a.isPinned).length,
    byType,
  }
}
