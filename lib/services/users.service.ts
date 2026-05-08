/**
 * Users Service
 * Business logic for system user management.
 */
import { userRepo, credentialsRepo, pendingUserRepo } from '@/lib/repositories'
import { getAllRoles } from './roles.service'
import type { UserRecord, EmployeeCredentials } from '@/lib/repositories'

export type { UserRecord }

// ─── Helper: compute roleKeys array from role IDs ─────────────

async function computeRoleKeys(roleIds: string[]): Promise<string[]> {
  if (roleIds.length === 0) return []
  const allRoles = await getAllRoles()
  const keys: string[] = []
  for (const role of allRoles) {
    if (roleIds.includes(role.id) && role.key) {
      keys.push(role.key)
    }
  }
  return keys
}

// ─── User Profile ────────────────────────────────────────────

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  return userRepo().getById(id)
}

export async function getUserByEmployeeCode(code: string): Promise<UserRecord | undefined> {
  return userRepo().getByEmployeeCode(code)
}

export async function getAllUsers(): Promise<UserRecord[]> {
  return userRepo().getAll()
}

export async function saveUserProfile(
  user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'> & { id: string }
): Promise<UserRecord> {
  // Compute roleKeys from roles before saving
  const roleKeys = await computeRoleKeys(user.roles)
  const data = { ...user, roleKeys }
  const existing = await userRepo().getById(user.id)
  if (existing) {
    return (await userRepo().update(user.id, data)) ?? existing
  }
  return userRepo().create(data)
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserRecord>
): Promise<UserRecord | undefined> {
  // If roles are being updated, recompute roleKeys
  if (updates.roles) {
    const roleKeys = await computeRoleKeys(updates.roles)
    updates = { ...updates, roleKeys } as typeof updates
  }
  return userRepo().update(id, updates)
}

export async function deleteUser(id: string): Promise<void> {
  return userRepo().delete(id)
}

// ─── Employee Credentials ────────────────────────────────────

export async function getEmployeeCredentials(employeeId: string): Promise<EmployeeCredentials | null> {
  return credentialsRepo().get(employeeId)
}

export async function setEmployeeCredentials(
  employeeId: string,
  password: string,
  mustChange: boolean
): Promise<void> {
  return credentialsRepo().set(employeeId, password, mustChange)
}

// ─── Approve pending user — creates a full UserRecord ────────

export async function approveUser(
  pendingId: string,
  roleId: string,
  department: string,
  reviewedBy: string
): Promise<UserRecord | undefined> {
  const pending = await pendingUserRepo().getById(pendingId)
  if (!pending) return undefined

  // Update pending record
  await pendingUserRepo().update(pendingId, {
    status: 'approved',
    role: roleId,
    department,
    reviewedAt: new Date().toISOString(),
    reviewedBy,
  })

  // Compute roleKeys from roleId
  const roleKeys = await computeRoleKeys([roleId])

  // Create user in users collection
  const user = await userRepo().create({
    id: pending.id,
    uid: pending.id,
    name: pending.name,
    nameAr: pending.name,
    email: pending.email,
    photoURL: pending.photoURL,
    roles: [roleId],
    roleKeys,
    departments: [department],
    customPermissions: [],
    mustChangePassword: false,
    status: 'active',
    lastLogin: new Date().toISOString(),
  })
  return user
}

// ─── Generate unique employee code ───────────────────────────

export async function generateEmployeeCode(): Promise<string> {
  const users = await userRepo().getAll()
  const codes = users
    .map((u) => u.employeeCode)
    .filter(Boolean)
    .map((c) => parseInt(c!.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n))

  const max = codes.length > 0 ? Math.max(...codes) : 1000
  return `EMP${(max + 1).toString().padStart(4, '0')}`
}
