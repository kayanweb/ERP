/**
 * Employees Service
 */
import { employeeRepo } from '@/lib/repositories'
import type { EmployeeRecord } from '@/lib/repositories'

export type { EmployeeRecord }

export async function getAllEmployees(): Promise<EmployeeRecord[]> {
  return employeeRepo().getAll()
}

export async function getEmployeeById(id: string): Promise<EmployeeRecord | undefined> {
  return employeeRepo().getById(id)
}

export async function getEmployeesByDepartment(departmentId: string): Promise<EmployeeRecord[]> {
  return employeeRepo().getByDepartment(departmentId)
}

export async function getEmployeeByCode(code: string): Promise<EmployeeRecord | undefined> {
  return employeeRepo().getByCode(code)
}

export async function createEmployee(
  employee: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EmployeeRecord> {
  return employeeRepo().create(employee)
}

export async function updateEmployee(
  id: string,
  updates: Partial<EmployeeRecord>
): Promise<EmployeeRecord | undefined> {
  return employeeRepo().update(id, updates)
}

export async function deleteEmployee(id: string): Promise<void> {
  return employeeRepo().delete(id)
}

export async function getActiveEmployees(): Promise<EmployeeRecord[]> {
  const all = await employeeRepo().getAll()
  return all.filter(e => e.status === 'active')
}

export async function getEmployeeStats(departmentId?: string): Promise<{
  total: number
  active: number
  onLeave: number
  absent: number
}> {
  const employees = departmentId 
    ? await employeeRepo().getByDepartment(departmentId)
    : await employeeRepo().getAll()
  
  return {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    onLeave: employees.filter(e => e.status === 'on_leave').length,
    absent: employees.filter(e => e.status === 'absent').length,
  }
}
