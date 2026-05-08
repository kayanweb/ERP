/**
 * Vital Signs Service
 */
import { vitalSignsRepo } from '@/lib/repositories'
import type { VitalSignsRecord } from '@/lib/repositories'

export type { VitalSignsRecord }

export async function getAllVitals(): Promise<VitalSignsRecord[]> {
  return vitalSignsRepo().getAll()
}

export async function getVitalsById(id: string): Promise<VitalSignsRecord | undefined> {
  return vitalSignsRepo().getById(id)
}

export async function getVitalsByPatient(patientId: string): Promise<VitalSignsRecord[]> {
  return vitalSignsRepo().getByPatient(patientId)
}

export async function getLatestVitals(patientId: string): Promise<VitalSignsRecord | undefined> {
  return vitalSignsRepo().getLatestByPatient(patientId)
}

export async function recordVitals(
  vitals: Omit<VitalSignsRecord, 'id' | 'createdAt' | 'ewsScore'>
): Promise<VitalSignsRecord> {
  const ewsScore = calculateEWS(vitals)
  return vitalSignsRepo().create({ ...vitals, ewsScore })
}

// Early Warning Score (EWS) calculation
export function calculateEWS(vitals: Partial<VitalSignsRecord>): number {
  let score = 0
  
  // Respiratory Rate
  if (vitals.respiratoryRate !== undefined) {
    if (vitals.respiratoryRate <= 8) score += 3
    else if (vitals.respiratoryRate <= 11) score += 1
    else if (vitals.respiratoryRate >= 25) score += 3
    else if (vitals.respiratoryRate >= 21) score += 2
    // 12-20 is normal (0)
  }
  
  // Oxygen Saturation
  if (vitals.oxygenSaturation !== undefined) {
    if (vitals.oxygenSaturation <= 91) score += 3
    else if (vitals.oxygenSaturation <= 93) score += 2
    else if (vitals.oxygenSaturation <= 95) score += 1
    // >= 96 is normal (0)
  }
  
  // Temperature
  if (vitals.temperature !== undefined) {
    if (vitals.temperature <= 35) score += 3
    else if (vitals.temperature <= 36) score += 1
    else if (vitals.temperature >= 39.1) score += 2
    else if (vitals.temperature >= 38.1) score += 1
    // 36.1-38 is normal (0)
  }
  
  // Systolic Blood Pressure
  if (vitals.bloodPressureSystolic !== undefined) {
    if (vitals.bloodPressureSystolic <= 90) score += 3
    else if (vitals.bloodPressureSystolic <= 100) score += 2
    else if (vitals.bloodPressureSystolic <= 110) score += 1
    else if (vitals.bloodPressureSystolic >= 220) score += 3
    // 111-219 is normal (0)
  }
  
  // Heart Rate
  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate <= 40) score += 3
    else if (vitals.heartRate <= 50) score += 1
    else if (vitals.heartRate >= 131) score += 3
    else if (vitals.heartRate >= 111) score += 2
    else if (vitals.heartRate >= 91) score += 1
    // 51-90 is normal (0)
  }
  
  // Consciousness (AVPU)
  if (vitals.consciousness !== undefined && vitals.consciousness !== 'alert') {
    score += 3
  }
  
  return score
}

export function getEWSRiskLevel(score: number): {
  level: 'low' | 'medium' | 'high' | 'critical'
  color: string
  action: string
  actionAr: string
} {
  if (score >= 7) {
    return {
      level: 'critical',
      color: 'red',
      action: 'Immediate medical review required',
      actionAr: 'مطلوب مراجعة طبية فورية',
    }
  }
  if (score >= 5) {
    return {
      level: 'high',
      color: 'orange',
      action: 'Urgent response required',
      actionAr: 'مطلوب استجابة عاجلة',
    }
  }
  if (score >= 3) {
    return {
      level: 'medium',
      color: 'yellow',
      action: 'Increase monitoring frequency',
      actionAr: 'زيادة معدل المراقبة',
    }
  }
  return {
    level: 'low',
    color: 'green',
    action: 'Continue routine monitoring',
    actionAr: 'استمر في المراقبة الروتينية',
  }
}

export function isVitalsAbnormal(vitals: VitalSignsRecord): boolean {
  return (vitals.ewsScore || 0) >= 3
}

export async function getAbnormalVitals(departmentId?: string): Promise<VitalSignsRecord[]> {
  const all = await vitalSignsRepo().getAll()
  const abnormal = all.filter(v => (v.ewsScore || 0) >= 3)
  
  if (departmentId) {
    return abnormal.filter(v => v.departmentId === departmentId)
  }
  return abnormal
}

export function formatVitalsForDisplay(vitals: VitalSignsRecord): {
  label: string
  value: string
  unit: string
  isAbnormal: boolean
}[] {
  return [
    {
      label: 'Temperature',
      value: vitals.temperature?.toString() || '-',
      unit: '°C',
      isAbnormal: (vitals.temperature || 0) < 36 || (vitals.temperature || 0) > 38,
    },
    {
      label: 'Blood Pressure',
      value: vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic
        ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`
        : '-',
      unit: 'mmHg',
      isAbnormal: (vitals.bloodPressureSystolic || 0) < 90 || (vitals.bloodPressureSystolic || 0) > 140,
    },
    {
      label: 'Heart Rate',
      value: vitals.heartRate?.toString() || '-',
      unit: 'bpm',
      isAbnormal: (vitals.heartRate || 0) < 60 || (vitals.heartRate || 0) > 100,
    },
    {
      label: 'Respiratory Rate',
      value: vitals.respiratoryRate?.toString() || '-',
      unit: '/min',
      isAbnormal: (vitals.respiratoryRate || 0) < 12 || (vitals.respiratoryRate || 0) > 20,
    },
    {
      label: 'O2 Saturation',
      value: vitals.oxygenSaturation?.toString() || '-',
      unit: '%',
      isAbnormal: (vitals.oxygenSaturation || 0) < 95,
    },
    {
      label: 'Pain Level',
      value: vitals.painLevel?.toString() || '-',
      unit: '/10',
      isAbnormal: (vitals.painLevel || 0) >= 7,
    },
  ]
}
