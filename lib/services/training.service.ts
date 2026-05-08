/**
 * Training & Certifications Service
 */
import { trainingRepo, certificationRepo } from '@/lib/repositories'
import type { TrainingRecord, CertificationRecord } from '@/lib/repositories'

export type { TrainingRecord, CertificationRecord }

// Training functions
export async function getAllTrainings(): Promise<TrainingRecord[]> {
  return trainingRepo().getAll()
}

export async function getTrainingById(id: string): Promise<TrainingRecord | undefined> {
  return trainingRepo().getById(id)
}

export async function getActiveTrainings(): Promise<TrainingRecord[]> {
  return trainingRepo().getActive()
}

export async function getMandatoryTrainings(): Promise<TrainingRecord[]> {
  const all = await trainingRepo().getActive()
  return all.filter(t => t.type === 'mandatory')
}

export async function createTraining(
  training: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TrainingRecord> {
  return trainingRepo().create(training)
}

export async function updateTraining(
  id: string,
  updates: Partial<TrainingRecord>
): Promise<TrainingRecord | undefined> {
  return trainingRepo().update(id, updates)
}

export async function deleteTraining(id: string): Promise<void> {
  return trainingRepo().delete(id)
}

// Certification functions
export async function getAllCertifications(): Promise<CertificationRecord[]> {
  return certificationRepo().getAll()
}

export async function getCertificationById(id: string): Promise<CertificationRecord | undefined> {
  return certificationRepo().getById(id)
}

export async function getCertificationsByEmployee(employeeId: string): Promise<CertificationRecord[]> {
  return certificationRepo().getByEmployee(employeeId)
}

export async function getExpiringSoonCertifications(days: number = 30): Promise<CertificationRecord[]> {
  return certificationRepo().getExpiringSoon(days)
}

export async function createCertification(
  certification: Omit<CertificationRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<CertificationRecord> {
  const status = getCertificationStatus(certification.expiryDate)
  return certificationRepo().create({ ...certification, status })
}

export async function updateCertification(
  id: string,
  updates: Partial<CertificationRecord>
): Promise<CertificationRecord | undefined> {
  if (updates.expiryDate) {
    updates.status = getCertificationStatus(updates.expiryDate)
  }
  return certificationRepo().update(id, updates)
}

export async function renewCertification(
  id: string,
  newCompletedDate: string,
  newExpiryDate: string,
  score?: number
): Promise<CertificationRecord | undefined> {
  return certificationRepo().update(id, {
    completedDate: newCompletedDate,
    expiryDate: newExpiryDate,
    status: getCertificationStatus(newExpiryDate),
    score,
  })
}

export async function deleteCertification(id: string): Promise<void> {
  return certificationRepo().delete(id)
}

export function getCertificationStatus(expiryDate: string): 'valid' | 'expiring_soon' | 'expired' {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'expiring_soon'
  return 'valid'
}

export function getStatusLabel(status: CertificationRecord['status']): { en: string; ar: string; color: string } {
  const labels: Record<string, { en: string; ar: string; color: string }> = {
    valid: { en: 'Valid', ar: 'ساري', color: 'green' },
    expiring_soon: { en: 'Expiring Soon', ar: 'ينتهي قريباً', color: 'yellow' },
    expired: { en: 'Expired', ar: 'منتهي', color: 'red' },
  }
  return labels[status]
}

export async function getEmployeeTrainingStatus(employeeId: string): Promise<{
  completed: CertificationRecord[]
  missing: TrainingRecord[]
  expiringSoon: CertificationRecord[]
  expired: CertificationRecord[]
}> {
  const [mandatoryTrainings, employeeCerts] = await Promise.all([
    getMandatoryTrainings(),
    getCertificationsByEmployee(employeeId),
  ])
  
  const completedTrainingIds = new Set(employeeCerts.map(c => c.trainingId))
  const missing = mandatoryTrainings.filter(t => !completedTrainingIds.has(t.id))
  
  return {
    completed: employeeCerts.filter(c => c.status === 'valid'),
    missing,
    expiringSoon: employeeCerts.filter(c => c.status === 'expiring_soon'),
    expired: employeeCerts.filter(c => c.status === 'expired'),
  }
}

export async function getTrainingStats(): Promise<{
  totalTrainings: number
  mandatoryCount: number
  optionalCount: number
  specializedCount: number
  totalCertifications: number
  validCertifications: number
  expiringSoon: number
  expired: number
}> {
  const [trainings, certifications] = await Promise.all([
    trainingRepo().getAll(),
    certificationRepo().getAll(),
  ])
  
  return {
    totalTrainings: trainings.length,
    mandatoryCount: trainings.filter(t => t.type === 'mandatory').length,
    optionalCount: trainings.filter(t => t.type === 'optional').length,
    specializedCount: trainings.filter(t => t.type === 'specialized').length,
    totalCertifications: certifications.length,
    validCertifications: certifications.filter(c => c.status === 'valid').length,
    expiringSoon: certifications.filter(c => c.status === 'expiring_soon').length,
    expired: certifications.filter(c => c.status === 'expired').length,
  }
}
