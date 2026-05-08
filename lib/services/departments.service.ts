/**
 * Departments Service
 */
import { departmentRepo } from '@/lib/repositories'
import type { DepartmentRecord } from '@/lib/repositories'

export type { DepartmentRecord }

export const DEFAULT_DEPARTMENTS: Omit<DepartmentRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Administration',        nameAr: 'الإدارة',            code: 'ADMIN', isActive: true },
  { name: 'ICU',                   nameAr: 'العناية المركزة',    code: 'ICU',   isActive: true },
  { name: 'Emergency',             nameAr: 'الطوارئ',            code: 'ER',    isActive: true },
  { name: 'Internal Medicine',     nameAr: 'الباطنية',           code: 'INT',   isActive: true },
  { name: 'Surgery',               nameAr: 'الجراحة',            code: 'SURG',  isActive: true },
  { name: 'Pediatrics',            nameAr: 'الأطفال',            code: 'PEDS',  isActive: true },
  { name: 'Obstetrics',            nameAr: 'النساء والولادة',    code: 'OB',    isActive: true },
  { name: 'Orthopedics',           nameAr: 'العظام',             code: 'ORTH',  isActive: true },
  { name: 'NICU',                  nameAr: 'عناية المواليد',     code: 'NICU',  isActive: true },
  { name: 'Operating Room',        nameAr: 'غرفة العمليات',      code: 'OR',    isActive: true },
  { name: 'Laboratory',            nameAr: 'المختبر',            code: 'LAB',   isActive: true },
  { name: 'Radiology',             nameAr: 'الأشعة',             code: 'RAD',   isActive: true },
  { name: 'Pharmacy',              nameAr: 'الصيدلية',           code: 'PHARM', isActive: true },
  { name: 'HR',                    nameAr: 'الموارد البشرية',    code: 'HR',    isActive: true },
  { name: 'Finance',               nameAr: 'الحسابات',           code: 'FIN',   isActive: true },
  { name: 'Reception',             nameAr: 'الاستقبال',          code: 'REC',   isActive: true },
]

export async function getAllDepartments(): Promise<DepartmentRecord[]> {
  return departmentRepo().getAll()
}

export async function getDepartmentById(id: string): Promise<DepartmentRecord | undefined> {
  return departmentRepo().getById(id)
}

export async function createDepartment(
  dept: Omit<DepartmentRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DepartmentRecord> {
  return departmentRepo().create(dept)
}

export async function updateDepartment(
  id: string,
  updates: Partial<DepartmentRecord>
): Promise<DepartmentRecord | undefined> {
  return departmentRepo().update(id, updates)
}

export async function deleteDepartment(id: string): Promise<void> {
  return departmentRepo().delete(id)
}

export async function seedDefaultDepartments(): Promise<void> {
  const existing = await departmentRepo().getAll()
  if (existing.length > 0) return
  for (const dept of DEFAULT_DEPARTMENTS) {
    await departmentRepo().create(dept)
  }
}
