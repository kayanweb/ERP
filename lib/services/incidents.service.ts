/**
 * Incidents Service
 */
import { incidentRepo } from '@/lib/repositories'
import type { IncidentRecord, IncidentType, IncidentSeverity } from '@/lib/repositories'

export type { IncidentRecord }

export async function getAllIncidents(): Promise<IncidentRecord[]> {
  return incidentRepo().getAll()
}

export async function getIncidentById(id: string): Promise<IncidentRecord | undefined> {
  return incidentRepo().getById(id)
}

export async function getIncidentsByDepartment(departmentId: string): Promise<IncidentRecord[]> {
  return incidentRepo().getByDepartment(departmentId)
}

export async function getIncidentsByStatus(status: string): Promise<IncidentRecord[]> {
  return incidentRepo().getByStatus(status)
}

export async function getOpenIncidents(): Promise<IncidentRecord[]> {
  const reported = await incidentRepo().getByStatus('reported')
  const investigating = await incidentRepo().getByStatus('investigating')
  return [...reported, ...investigating]
}

export async function createIncident(
  incident: Omit<IncidentRecord, 'id' | 'createdAt' | 'updatedAt' | 'incidentNumber'>
): Promise<IncidentRecord> {
  const incidentNumber = `INC-${Date.now().toString(36).toUpperCase()}`
  return incidentRepo().create({ ...incident, incidentNumber })
}

export async function updateIncident(
  id: string,
  updates: Partial<IncidentRecord>
): Promise<IncidentRecord | undefined> {
  return incidentRepo().update(id, updates)
}

export async function startInvestigation(
  id: string,
  investigatorId: string,
  investigatorName: string
): Promise<IncidentRecord | undefined> {
  return incidentRepo().update(id, {
    status: 'investigating',
    investigatedById: investigatorId,
    investigatedByName: investigatorName,
  })
}

export async function resolveIncident(
  id: string,
  rootCause: string,
  correctiveActions: string,
  preventiveMeasures?: string
): Promise<IncidentRecord | undefined> {
  return incidentRepo().update(id, {
    status: 'resolved',
    rootCause,
    correctiveActions,
    preventiveMeasures,
    resolvedAt: new Date().toISOString(),
  })
}

export async function closeIncident(id: string): Promise<IncidentRecord | undefined> {
  return incidentRepo().update(id, {
    status: 'closed',
    closedAt: new Date().toISOString(),
  })
}

export async function deleteIncident(id: string): Promise<void> {
  return incidentRepo().delete(id)
}

export function getTypeLabel(type: IncidentType): { en: string; ar: string } {
  const labels: Record<IncidentType, { en: string; ar: string }> = {
    fall: { en: 'Fall', ar: 'سقوط' },
    medication_error: { en: 'Medication Error', ar: 'خطأ دوائي' },
    pressure_ulcer: { en: 'Pressure Ulcer', ar: 'قرحة الضغط' },
    infection: { en: 'Infection', ar: 'عدوى' },
    equipment_failure: { en: 'Equipment Failure', ar: 'عطل معدات' },
    needle_stick: { en: 'Needle Stick', ar: 'وخز إبرة' },
    patient_complaint: { en: 'Patient Complaint', ar: 'شكوى مريض' },
    other: { en: 'Other', ar: 'أخرى' },
  }
  return labels[type]
}

export function getSeverityLabel(severity: IncidentSeverity): { en: string; ar: string; color: string } {
  const labels: Record<IncidentSeverity, { en: string; ar: string; color: string }> = {
    near_miss: { en: 'Near Miss', ar: 'كاد يحدث', color: 'blue' },
    minor: { en: 'Minor', ar: 'بسيط', color: 'green' },
    moderate: { en: 'Moderate', ar: 'متوسط', color: 'yellow' },
    major: { en: 'Major', ar: 'كبير', color: 'orange' },
    catastrophic: { en: 'Catastrophic', ar: 'كارثي', color: 'red' },
  }
  return labels[severity]
}

export function getStatusLabel(status: string): { en: string; ar: string; color: string } {
  const labels: Record<string, { en: string; ar: string; color: string }> = {
    reported: { en: 'Reported', ar: 'تم الإبلاغ', color: 'yellow' },
    investigating: { en: 'Investigating', ar: 'قيد التحقيق', color: 'blue' },
    resolved: { en: 'Resolved', ar: 'تم الحل', color: 'green' },
    closed: { en: 'Closed', ar: 'مغلق', color: 'gray' },
  }
  return labels[status] || { en: status, ar: status, color: 'gray' }
}

export async function getIncidentStats(departmentId?: string, period?: string): Promise<{
  total: number
  byType: Record<IncidentType, number>
  bySeverity: Record<IncidentSeverity, number>
  byStatus: Record<string, number>
}> {
  let incidents = departmentId
    ? await incidentRepo().getByDepartment(departmentId)
    : await incidentRepo().getAll()
  
  if (period) {
    incidents = incidents.filter(i => i.dateTime.startsWith(period))
  }
  
  const byType: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}
  const byStatus: Record<string, number> = {}
  
  incidents.forEach(incident => {
    byType[incident.type] = (byType[incident.type] || 0) + 1
    bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1
    byStatus[incident.status] = (byStatus[incident.status] || 0) + 1
  })
  
  return {
    total: incidents.length,
    byType: byType as Record<IncidentType, number>,
    bySeverity: bySeverity as Record<IncidentSeverity, number>,
    byStatus,
  }
}
