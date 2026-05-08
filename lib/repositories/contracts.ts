/**
 * Repository Contracts
 *
 * These interfaces define the DATA CONTRACT for all repositories.
 * Swapping backends (Firestore → PostgreSQL → Supabase → MongoDB)
 * requires only implementing a new class for each interface, then
 * updating lib/repositories/index.ts to export the new implementation.
 *
 * Components and Services NEVER import from Firebase directly —
 * they always depend on these interfaces.
 */

// ─── Shared Domain Types ────────────────────────────────────

export type PendingStatus = 'pending' | 'approved' | 'rejected'

export interface PendingUserRecord {
  id: string
  name: string
  email: string
  photoURL?: string
  requestedAt: string
  status: PendingStatus
  role?: string
  department?: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface UserRecord {
  id: string
  uid?: string
  employeeCode?: string
  name: string
  nameAr: string
  email: string
  roles: string[]               // array of role document IDs
  roleKeys?: string[]          // array of role keys (for security rules)
  departments: string[]         // array of department IDs
  customPermissions: string[]   // extra one-off permission keys
  mustChangePassword: boolean
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
  lastLogin?: string
  photoURL?: string
}

export interface EmployeeCredentials {
  employeeId: string
  password: string              // hashed or plain for demo
  mustChange: boolean
}

export interface RoleRecord {
  id: string
  key?: string               // optional machine-readable role key (e.g. 'admin')
  name: string
  nameAr: string
  description?: string
  permissions: string[]         // permission keys
  isActive: boolean
  isDefault?: boolean
  createdAt: string
  updatedAt: string
  order?: number
}

export interface DepartmentRecord {
  id: string
  name: string
  nameAr: string
  code?: string
  parentId?: string             // for sub-departments
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SystemSettings {
  id: string                    // always 'global'
  hospitalName: string
  hospitalNameEn: string
  contactEmail: string
  contactPhone: string
  address: string
  language: string
  timezone: string
  notificationsEnabled: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  maintenanceMode: boolean
  updatedAt: string
}

export interface LoginLogRecord {
  id: string
  userId: string
  userEmail: string
  method: 'employee_code' | 'google' | 'email'
  success: boolean
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

// ─── Repository Interfaces ───────────────────────────────────

export interface IPendingUserRepository {
  getAll(): Promise<PendingUserRecord[]>
  getById(id: string): Promise<PendingUserRecord | undefined>
  upsert(user: Omit<PendingUserRecord, 'status' | 'requestedAt'> & { requestedAt?: string }): Promise<PendingUserRecord>
  update(id: string, updates: Partial<PendingUserRecord>): Promise<PendingUserRecord | undefined>
}

export interface IUserRepository {
  getAll(): Promise<UserRecord[]>
  getById(id: string): Promise<UserRecord | undefined>
  getByEmployeeCode(code: string): Promise<UserRecord | undefined>
  create(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<UserRecord>
  update(id: string, updates: Partial<UserRecord>): Promise<UserRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IEmployeeCredentialsRepository {
  get(employeeId: string): Promise<EmployeeCredentials | null>
  set(employeeId: string, password: string, mustChange: boolean): Promise<void>
}

export interface IRoleRepository {
  getAll(): Promise<RoleRecord[]>
  getById(id: string): Promise<RoleRecord | undefined>
  create(role: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleRecord>
  update(id: string, updates: Partial<RoleRecord>): Promise<RoleRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IDepartmentRepository {
  getAll(): Promise<DepartmentRecord[]>
  getById(id: string): Promise<DepartmentRecord | undefined>
  create(dept: Omit<DepartmentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DepartmentRecord>
  update(id: string, updates: Partial<DepartmentRecord>): Promise<DepartmentRecord | undefined>
  delete(id: string): Promise<void>
}

export interface ISettingsRepository {
  get(): Promise<SystemSettings | null>
  save(settings: Partial<SystemSettings>): Promise<void>
}

export interface ILoginLogRepository {
  add(entry: Omit<LoginLogRecord, 'id'>): Promise<void>
  getRecent(limit?: number): Promise<LoginLogRecord[]>
}
