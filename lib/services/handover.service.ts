/**
 * Handover (SBAR) Service
 */
import { handoverRepo } from '@/lib/repositories'
import type { HandoverRecord, ShiftType } from '@/lib/repositories'

export type { HandoverRecord }

export async function getAllHandovers(): Promise<HandoverRecord[]> {
  return handoverRepo().getAll()
}

export async function getHandoverById(id: string): Promise<HandoverRecord | undefined> {
  return handoverRepo().getById(id)
}

export async function getHandoversByPatient(patientId: string): Promise<HandoverRecord[]> {
  return handoverRepo().getByPatient(patientId)
}

export async function getHandoversByNurse(nurseId: string): Promise<HandoverRecord[]> {
  return handoverRepo().getByNurse(nurseId)
}

export async function getPendingHandovers(): Promise<HandoverRecord[]> {
  return handoverRepo().getPending()
}

export async function createHandover(
  handover: Omit<HandoverRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<HandoverRecord> {
  return handoverRepo().create(handover)
}

export async function updateHandover(
  id: string,
  updates: Partial<HandoverRecord>
): Promise<HandoverRecord | undefined> {
  return handoverRepo().update(id, updates)
}

export async function acknowledgeHandover(id: string): Promise<HandoverRecord | undefined> {
  return handoverRepo().update(id, {
    status: 'acknowledged',
    acknowledgedAt: new Date().toISOString(),
  })
}

export async function completeHandover(id: string): Promise<HandoverRecord | undefined> {
  return handoverRepo().update(id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  })
}

// SBAR template helpers
export function getSBARTemplate(): {
  situation: string
  background: string
  assessment: string
  recommendation: string
} {
  return {
    situation: '',
    background: '',
    assessment: '',
    recommendation: '',
  }
}

export function validateSBAR(handover: Partial<HandoverRecord>): {
  isValid: boolean
  missingFields: string[]
} {
  const requiredFields = ['situation', 'background', 'assessment', 'recommendation']
  const missingFields = requiredFields.filter(
    field => !handover[field as keyof HandoverRecord] || 
    (handover[field as keyof HandoverRecord] as string).trim() === ''
  )
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  }
}

export function getNextShift(currentShift: ShiftType): ShiftType {
  switch (currentShift) {
    case 'morning':
      return 'evening'
    case 'evening':
      return 'night'
    case 'night':
      return 'morning'
  }
}

export async function getHandoverStats(departmentId: string, date: string): Promise<{
  total: number
  pending: number
  acknowledged: number
  completed: number
}> {
  const all = await handoverRepo().getAll()
  const filtered = all.filter(h => 
    h.departmentId === departmentId && 
    h.date === date
  )
  
  return {
    total: filtered.length,
    pending: filtered.filter(h => h.status === 'pending').length,
    acknowledged: filtered.filter(h => h.status === 'acknowledged').length,
    completed: filtered.filter(h => h.status === 'completed').length,
  }
}

export function formatHandoverSummary(handover: HandoverRecord): string {
  return `
SBAR Report - ${handover.patientName} (MRN: ${handover.mrn})
Date: ${handover.date} | Shift: ${handover.shift}
From: ${handover.fromNurseName} | To: ${handover.toNurseName}

SITUATION:
${handover.situation}

BACKGROUND:
${handover.background}

ASSESSMENT:
${handover.assessment}

RECOMMENDATION:
${handover.recommendation}

${handover.criticalAlerts?.length ? `CRITICAL ALERTS:\n- ${handover.criticalAlerts.join('\n- ')}` : ''}
${handover.pendingTasks?.length ? `PENDING TASKS:\n- ${handover.pendingTasks.join('\n- ')}` : ''}
`.trim()
}
