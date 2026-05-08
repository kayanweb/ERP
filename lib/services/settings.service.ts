/**
 * Settings Service
 */
import { settingsRepo } from '@/lib/repositories'
import type { SystemSettings } from '@/lib/repositories'

export type { SystemSettings }

const DEFAULT_SETTINGS: SystemSettings = {
  id: 'global',
  hospitalName: 'مستشفى المملكة',
  hospitalNameEn: 'Kingdom Hospital',
  contactEmail: 'info@hospital.com',
  contactPhone: '920012345',
  address: 'الرياض، المملكة العربية السعودية',
  language: 'ar',
  timezone: 'Asia/Riyadh',
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: false,
  maintenanceMode: false,
  updatedAt: new Date().toISOString(),
}

export async function getSettings(): Promise<SystemSettings> {
  const stored = await settingsRepo().get()
  return stored ?? DEFAULT_SETTINGS
}

export async function saveSettings(updates: Partial<SystemSettings>): Promise<void> {
  return settingsRepo().save(updates)
}
