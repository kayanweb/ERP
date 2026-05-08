/**
 * Emergency Codes Service
 */
import { emergencyCodeRepo } from '@/lib/repositories'
import type { EmergencyCodeRecord, EmergencyCodeType } from '@/lib/repositories'

export type { EmergencyCodeRecord }

export async function getAllEmergencyCodes(): Promise<EmergencyCodeRecord[]> {
  return emergencyCodeRepo().getAll()
}

export async function getEmergencyCodeById(id: string): Promise<EmergencyCodeRecord | undefined> {
  return emergencyCodeRepo().getById(id)
}

export async function getActiveEmergencyCodes(): Promise<EmergencyCodeRecord[]> {
  return emergencyCodeRepo().getActive()
}

export async function createEmergencyCode(
  code: Omit<EmergencyCodeRecord, 'id' | 'createdAt' | 'updatedAt' | 'codeNumber'>
): Promise<EmergencyCodeRecord> {
  const codeNumber = `EC-${Date.now().toString(36).toUpperCase()}`
  return emergencyCodeRepo().create({ ...code, codeNumber })
}

export async function updateEmergencyCode(
  id: string,
  updates: Partial<EmergencyCodeRecord>
): Promise<EmergencyCodeRecord | undefined> {
  return emergencyCodeRepo().update(id, updates)
}

export async function addResponder(
  id: string,
  responderId: string,
  responderName: string
): Promise<EmergencyCodeRecord | undefined> {
  const code = await emergencyCodeRepo().getById(id)
  if (!code) return undefined
  
  const responders = code.responders || []
  if (responders.some(r => r.id === responderId)) return code
  
  responders.push({
    id: responderId,
    name: responderName,
    arrivedAt: new Date().toISOString(),
  })
  
  return emergencyCodeRepo().update(id, { responders })
}

export async function resolveEmergencyCode(
  id: string,
  outcome: string,
  notes?: string
): Promise<EmergencyCodeRecord | undefined> {
  return emergencyCodeRepo().update(id, {
    status: 'resolved',
    endTime: new Date().toISOString(),
    outcome,
    notes,
  })
}

export async function cancelEmergencyCode(
  id: string,
  notes?: string
): Promise<EmergencyCodeRecord | undefined> {
  return emergencyCodeRepo().update(id, {
    status: 'cancelled',
    endTime: new Date().toISOString(),
    notes,
  })
}

export function getCodeInfo(type: EmergencyCodeType): {
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  color: string
} {
  const codes: Record<EmergencyCodeType, {
    name: string
    nameAr: string
    description: string
    descriptionAr: string
    color: string
  }> = {
    blue: {
      name: 'Code Blue',
      nameAr: 'كود أزرق',
      description: 'Cardiac/Respiratory Arrest',
      descriptionAr: 'توقف قلبي/تنفسي',
      color: '#3B82F6',
    },
    red: {
      name: 'Code Red',
      nameAr: 'كود أحمر',
      description: 'Fire Emergency',
      descriptionAr: 'طوارئ حريق',
      color: '#EF4444',
    },
    black: {
      name: 'Code Black',
      nameAr: 'كود أسود',
      description: 'Bomb Threat / Security',
      descriptionAr: 'تهديد أمني',
      color: '#1F2937',
    },
    pink: {
      name: 'Code Pink',
      nameAr: 'كود وردي',
      description: 'Infant/Child Abduction',
      descriptionAr: 'اختطاف طفل',
      color: '#EC4899',
    },
    orange: {
      name: 'Code Orange',
      nameAr: 'كود برتقالي',
      description: 'Mass Casualty / Disaster',
      descriptionAr: 'كارثة / إصابات جماعية',
      color: '#F97316',
    },
    yellow: {
      name: 'Code Yellow',
      nameAr: 'كود أصفر',
      description: 'Missing Patient',
      descriptionAr: 'مريض مفقود',
      color: '#EAB308',
    },
    green: {
      name: 'Code Green',
      nameAr: 'كود أخضر',
      description: 'Evacuation / All Clear',
      descriptionAr: 'إخلاء / أمان',
      color: '#22C55E',
    },
  }
  return codes[type]
}

export function getAllCodeTypes(): EmergencyCodeType[] {
  return ['blue', 'red', 'black', 'pink', 'orange', 'yellow', 'green']
}

export async function getEmergencyCodeStats(period?: string): Promise<{
  total: number
  active: number
  resolved: number
  cancelled: number
  byType: Record<EmergencyCodeType, number>
  avgResponseTime: number
}> {
  let codes = await emergencyCodeRepo().getAll()
  
  if (period) {
    codes = codes.filter(c => c.startTime.startsWith(period))
  }
  
  const byType: Record<string, number> = {}
  getAllCodeTypes().forEach(type => {
    byType[type] = codes.filter(c => c.type === type).length
  })
  
  // Calculate average response time (time to first responder arrival)
  const responseTimes = codes
    .filter(c => c.responders && c.responders.length > 0)
    .map(c => {
      const firstResponder = c.responders!.sort((a, b) => 
        (a.arrivedAt || '').localeCompare(b.arrivedAt || '')
      )[0]
      if (!firstResponder.arrivedAt) return null
      const start = new Date(c.startTime).getTime()
      const arrived = new Date(firstResponder.arrivedAt).getTime()
      return (arrived - start) / 1000 / 60 // in minutes
    })
    .filter((t): t is number => t !== null)
  
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0
  
  return {
    total: codes.length,
    active: codes.filter(c => c.status === 'active').length,
    resolved: codes.filter(c => c.status === 'resolved').length,
    cancelled: codes.filter(c => c.status === 'cancelled').length,
    byType: byType as Record<EmergencyCodeType, number>,
    avgResponseTime: Math.round(avgResponseTime * 10) / 10,
  }
}
