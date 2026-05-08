/**
 * Patients Service
 */
import { patientRepo, bedRepo } from '@/lib/repositories'
import type { PatientRecord, BedRecord } from '@/lib/repositories'

export type { PatientRecord, BedRecord }

export async function getAllPatients(): Promise<PatientRecord[]> {
  return patientRepo().getAll()
}

export async function getPatientById(id: string): Promise<PatientRecord | undefined> {
  return patientRepo().getById(id)
}

export async function getPatientByMRN(mrn: string): Promise<PatientRecord | undefined> {
  return patientRepo().getByMRN(mrn)
}

export async function getPatientsByDepartment(departmentId: string): Promise<PatientRecord[]> {
  return patientRepo().getByDepartment(departmentId)
}

export async function getAdmittedPatients(): Promise<PatientRecord[]> {
  return patientRepo().getAdmitted()
}

export async function getIsolationPatients(): Promise<PatientRecord[]> {
  return patientRepo().getIsolation()
}

export async function createPatient(
  patient: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PatientRecord> {
  return patientRepo().create(patient)
}

export async function updatePatient(
  id: string,
  updates: Partial<PatientRecord>
): Promise<PatientRecord | undefined> {
  return patientRepo().update(id, updates)
}

export async function deletePatient(id: string): Promise<void> {
  return patientRepo().delete(id)
}

export async function admitPatient(
  patient: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  bedId: string
): Promise<PatientRecord> {
  const newPatient = await patientRepo().create({
    ...patient,
    bedId,
    status: 'admitted',
  })
  
  await bedRepo().update(bedId, {
    status: 'occupied',
    currentPatientId: newPatient.id,
    currentPatientName: newPatient.name,
  })
  
  return newPatient
}

export async function dischargePatient(
  id: string,
  dischargeDate?: string
): Promise<PatientRecord | undefined> {
  const patient = await patientRepo().getById(id)
  if (!patient) return undefined
  
  if (patient.bedId) {
    await bedRepo().update(patient.bedId, {
      status: 'available',
      currentPatientId: undefined,
      currentPatientName: undefined,
    })
  }
  
  return patientRepo().update(id, {
    status: 'discharged',
    dischargeDate: dischargeDate || new Date().toISOString().split('T')[0],
    bedId: undefined,
    bedNumber: undefined,
  })
}

export async function transferPatient(
  id: string,
  newDepartmentId: string,
  newDepartmentName: string,
  newBedId: string,
  newBedNumber: string
): Promise<PatientRecord | undefined> {
  const patient = await patientRepo().getById(id)
  if (!patient) return undefined
  
  // Free old bed
  if (patient.bedId) {
    await bedRepo().update(patient.bedId, {
      status: 'available',
      currentPatientId: undefined,
      currentPatientName: undefined,
    })
  }
  
  // Occupy new bed
  await bedRepo().update(newBedId, {
    status: 'occupied',
    currentPatientId: id,
    currentPatientName: patient.name,
  })
  
  return patientRepo().update(id, {
    departmentId: newDepartmentId,
    departmentName: newDepartmentName,
    bedId: newBedId,
    bedNumber: newBedNumber,
  })
}

export async function setIsolation(
  id: string,
  isIsolation: boolean,
  isolationType?: 'contact' | 'droplet' | 'airborne',
  isolationReason?: string
): Promise<PatientRecord | undefined> {
  return patientRepo().update(id, {
    isIsolation,
    isolationType: isIsolation ? isolationType : undefined,
    isolationReason: isIsolation ? isolationReason : undefined,
  })
}

export async function getPatientStats(departmentId?: string): Promise<{
  total: number
  admitted: number
  isolation: number
  discharged: number
}> {
  const patients = departmentId
    ? await patientRepo().getByDepartment(departmentId)
    : await patientRepo().getAll()
  
  return {
    total: patients.length,
    admitted: patients.filter(p => p.status === 'admitted').length,
    isolation: patients.filter(p => p.isIsolation).length,
    discharged: patients.filter(p => p.status === 'discharged').length,
  }
}

// Bed management functions
export async function getAllBeds(): Promise<BedRecord[]> {
  return bedRepo().getAll()
}

export async function getBedById(id: string): Promise<BedRecord | undefined> {
  return bedRepo().getById(id)
}

export async function getBedsByDepartment(departmentId: string): Promise<BedRecord[]> {
  return bedRepo().getByDepartment(departmentId)
}

export async function getAvailableBeds(): Promise<BedRecord[]> {
  return bedRepo().getAvailable()
}

export async function createBed(
  bed: Omit<BedRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BedRecord> {
  return bedRepo().create(bed)
}

export async function updateBed(
  id: string,
  updates: Partial<BedRecord>
): Promise<BedRecord | undefined> {
  return bedRepo().update(id, updates)
}

export async function deleteBed(id: string): Promise<void> {
  return bedRepo().delete(id)
}

export async function getBedOccupancy(departmentId: string): Promise<{
  total: number
  occupied: number
  available: number
  maintenance: number
  occupancyRate: number
}> {
  const beds = await bedRepo().getByDepartment(departmentId)
  const total = beds.length
  const occupied = beds.filter(b => b.status === 'occupied').length
  const available = beds.filter(b => b.status === 'available').length
  const maintenance = beds.filter(b => b.status === 'maintenance').length
  
  return {
    total,
    occupied,
    available,
    maintenance,
    occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
  }
}
