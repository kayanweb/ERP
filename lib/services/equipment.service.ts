/**
 * Equipment Service
 */
import { equipmentRepo, maintenanceRepo } from '@/lib/repositories'
import type { EquipmentRecord, MaintenanceRecord, EquipmentStatus } from '@/lib/repositories'

export type { EquipmentRecord, MaintenanceRecord }

// Equipment functions
export async function getAllEquipment(): Promise<EquipmentRecord[]> {
  return equipmentRepo().getAll()
}

export async function getEquipmentById(id: string): Promise<EquipmentRecord | undefined> {
  return equipmentRepo().getById(id)
}

export async function getEquipmentByDepartment(departmentId: string): Promise<EquipmentRecord[]> {
  return equipmentRepo().getByDepartment(departmentId)
}

export async function getEquipmentByStatus(status: EquipmentStatus): Promise<EquipmentRecord[]> {
  return equipmentRepo().getByStatus(status)
}

export async function createEquipment(
  equipment: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EquipmentRecord> {
  return equipmentRepo().create(equipment)
}

export async function updateEquipment(
  id: string,
  updates: Partial<EquipmentRecord>
): Promise<EquipmentRecord | undefined> {
  return equipmentRepo().update(id, updates)
}

export async function deleteEquipment(id: string): Promise<void> {
  return equipmentRepo().delete(id)
}

export async function assignEquipment(
  id: string,
  assignedToId: string,
  assignedToName: string
): Promise<EquipmentRecord | undefined> {
  return equipmentRepo().update(id, {
    status: 'in_use',
    assignedToId,
    assignedToName,
  })
}

export async function releaseEquipment(id: string): Promise<EquipmentRecord | undefined> {
  return equipmentRepo().update(id, {
    status: 'available',
    assignedToId: undefined,
    assignedToName: undefined,
  })
}

export async function sendToMaintenance(
  id: string,
  maintenanceRequest: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ equipment: EquipmentRecord | undefined; maintenance: MaintenanceRecord }> {
  const equipment = await equipmentRepo().update(id, { status: 'maintenance' })
  const maintenance = await maintenanceRepo().create(maintenanceRequest)
  return { equipment, maintenance }
}

export async function getEquipmentNeedingMaintenance(): Promise<EquipmentRecord[]> {
  const all = await equipmentRepo().getAll()
  const today = new Date().toISOString().split('T')[0]
  
  return all.filter(e => 
    e.nextMaintenanceDate && e.nextMaintenanceDate <= today && e.status !== 'maintenance'
  )
}

export function getStatusLabel(status: EquipmentStatus): { en: string; ar: string; color: string } {
  switch (status) {
    case 'available':
      return { en: 'Available', ar: 'متاح', color: 'green' }
    case 'in_use':
      return { en: 'In Use', ar: 'قيد الاستخدام', color: 'blue' }
    case 'maintenance':
      return { en: 'Maintenance', ar: 'صيانة', color: 'yellow' }
    case 'broken':
      return { en: 'Broken', ar: 'معطل', color: 'red' }
    case 'retired':
      return { en: 'Retired', ar: 'متقاعد', color: 'gray' }
  }
}

// Maintenance functions
export async function getAllMaintenance(): Promise<MaintenanceRecord[]> {
  return maintenanceRepo().getAll()
}

export async function getMaintenanceById(id: string): Promise<MaintenanceRecord | undefined> {
  return maintenanceRepo().getById(id)
}

export async function getMaintenanceByEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
  return maintenanceRepo().getByEquipment(equipmentId)
}

export async function getPendingMaintenance(): Promise<MaintenanceRecord[]> {
  return maintenanceRepo().getPending()
}

export async function createMaintenance(
  maintenance: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MaintenanceRecord> {
  return maintenanceRepo().create(maintenance)
}

export async function updateMaintenance(
  id: string,
  updates: Partial<MaintenanceRecord>
): Promise<MaintenanceRecord | undefined> {
  return maintenanceRepo().update(id, updates)
}

export async function completeMaintenance(
  id: string,
  cost?: number,
  notes?: string
): Promise<MaintenanceRecord | undefined> {
  const maintenance = await maintenanceRepo().getById(id)
  if (!maintenance) return undefined
  
  // Update equipment status back to available
  await equipmentRepo().update(maintenance.equipmentId, {
    status: 'available',
    lastMaintenanceDate: new Date().toISOString().split('T')[0],
  })
  
  return maintenanceRepo().update(id, {
    status: 'completed',
    completedDate: new Date().toISOString().split('T')[0],
    cost,
    notes,
  })
}

export async function deleteMaintenance(id: string): Promise<void> {
  return maintenanceRepo().delete(id)
}

export async function getEquipmentStats(departmentId?: string): Promise<{
  total: number
  available: number
  inUse: number
  maintenance: number
  broken: number
}> {
  const equipment = departmentId
    ? await equipmentRepo().getByDepartment(departmentId)
    : await equipmentRepo().getAll()
  
  return {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    inUse: equipment.filter(e => e.status === 'in_use').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    broken: equipment.filter(e => e.status === 'broken').length,
  }
}
