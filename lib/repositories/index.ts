/**
 * Repository Registry
 *
 * This is the ONLY file that imports concrete implementations.
 * To switch from Firestore to another backend:
 *   1. Create a new implementation folder (e.g. lib/repositories/supabase/)
 *   2. Implement each interface from contracts.ts
 *   3. Replace the imports below — nothing else in the app changes.
 */

import { FirestorePendingUserRepository }      from './firestore/pending-users.repository'
import { FirestoreUserRepository }             from './firestore/users.repository'
import { FirestoreEmployeeCredentialsRepository } from './firestore/employee-credentials.repository'
import { FirestoreRoleRepository }             from './firestore/roles.repository'
import { FirestoreDepartmentRepository }       from './firestore/departments.repository'
import { FirestoreSettingsRepository }         from './firestore/settings.repository'
import { FirestoreLoginLogRepository }         from './firestore/login-log.repository'

export type {
  IPendingUserRepository,
  IUserRepository,
  IEmployeeCredentialsRepository,
  IRoleRepository,
  IDepartmentRepository,
  ISettingsRepository,
  ILoginLogRepository,
  PendingUserRecord,
  UserRecord,
  EmployeeCredentials,
  RoleRecord,
  DepartmentRecord,
  SystemSettings,
  LoginLogRecord,
  PendingStatus,
} from './contracts'

// Singleton instances — lazily created
let _pendingUsers: FirestorePendingUserRepository | null = null
let _users: FirestoreUserRepository | null = null
let _credentials: FirestoreEmployeeCredentialsRepository | null = null
let _roles: FirestoreRoleRepository | null = null
let _departments: FirestoreDepartmentRepository | null = null
let _settings: FirestoreSettingsRepository | null = null
let _loginLog: FirestoreLoginLogRepository | null = null

export const pendingUserRepo = () => (_pendingUsers ??= new FirestorePendingUserRepository())
export const userRepo        = () => (_users        ??= new FirestoreUserRepository())
export const credentialsRepo = () => (_credentials  ??= new FirestoreEmployeeCredentialsRepository())
export const roleRepo        = () => (_roles         ??= new FirestoreRoleRepository())
export const departmentRepo  = () => (_departments   ??= new FirestoreDepartmentRepository())
export const settingsRepo    = () => (_settings      ??= new FirestoreSettingsRepository())
export const loginLogRepo    = () => (_loginLog      ??= new FirestoreLoginLogRepository())
