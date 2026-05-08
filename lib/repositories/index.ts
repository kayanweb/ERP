/**
 * Repository Registry
 *
 * This is the ONLY file that imports concrete implementations.
 * To switch from Firestore to another backend:
 *   1. Create a new implementation folder (e.g. lib/repositories/supabase/)
 *   2. Implement each interface from contracts.ts
 *   3. Replace the imports below — nothing else in the app changes.
 */

// Core repositories
import { FirestorePendingUserRepository }      from './firestore/pending-users.repository'
import { FirestoreUserRepository }             from './firestore/users.repository'
import { FirestoreEmployeeCredentialsRepository } from './firestore/employee-credentials.repository'
import { FirestoreRoleRepository }             from './firestore/roles.repository'
import { FirestoreDepartmentRepository }       from './firestore/departments.repository'
import { FirestoreSettingsRepository }         from './firestore/settings.repository'
import { FirestoreLoginLogRepository }         from './firestore/login-log.repository'

// Extended repositories
import { FirestoreEmployeeRepository }         from './firestore/employees.repository'
import { FirestoreRosterRepository }           from './firestore/roster.repository'
import { FirestoreVacationRepository }         from './firestore/vacations.repository'
import { FirestoreAttendanceRepository }       from './firestore/attendance.repository'
import { FirestoreOvertimeRepository }         from './firestore/overtime.repository'
import { FirestorePatientRepository }          from './firestore/patients.repository'
import { FirestoreBedRepository }              from './firestore/beds.repository'
import { FirestoreVitalSignsRepository }       from './firestore/vitals.repository'
import { FirestoreHandoverRepository }         from './firestore/handover.repository'
import { FirestoreNursingTaskRepository }      from './firestore/nursing-tasks.repository'
import { FirestoreEquipmentRepository }        from './firestore/equipment.repository'
import { FirestoreMaintenanceRepository }      from './firestore/maintenance.repository'
import { FirestoreInventoryRepository }        from './firestore/inventory.repository'
import { FirestoreInventoryTransactionRepository } from './firestore/inventory-transactions.repository'
import { FirestoreIncidentRepository }         from './firestore/incidents.repository'
import { FirestoreEmergencyCodeRepository }    from './firestore/emergency-codes.repository'
import { FirestoreTrainingRepository }         from './firestore/training.repository'
import { FirestoreCertificationRepository }    from './firestore/certifications.repository'
import { FirestoreEvaluationRepository }       from './firestore/evaluations.repository'
import { FirestoreAnnouncementRepository }     from './firestore/announcements.repository'
import { FirestoreMessageRepository }          from './firestore/messages.repository'
import { FirestoreNotificationRepository }     from './firestore/notifications.repository'
import { FirestoreAuditLogRepository }         from './firestore/audit-log.repository'
import { FirestoreShiftReportRepository }      from './firestore/shift-reports.repository'
import { FirestoreQualityIndicatorRepository } from './firestore/quality-indicators.repository'

// Export all types from contracts
export type {
  // Core types
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
  // Extended types
  ShiftType,
  EmployeeStatus,
  VacationStatus,
  AttendanceStatus,
  EquipmentStatus,
  IncidentSeverity,
  IncidentType,
  EmergencyCodeType,
  TaskPriority,
  TaskStatus,
  EmployeeRecord,
  RosterRecord,
  VacationRecord,
  AttendanceRecord,
  OvertimeRecord,
  PatientRecord,
  BedRecord,
  VitalSignsRecord,
  HandoverRecord,
  NursingTaskRecord,
  EquipmentRecord,
  MaintenanceRecord,
  InventoryRecord,
  InventoryTransactionRecord,
  IncidentRecord,
  EmergencyCodeRecord,
  TrainingRecord,
  CertificationRecord,
  EvaluationRecord,
  AnnouncementRecord,
  MessageRecord,
  NotificationRecord,
  AuditLogRecord,
  ShiftReportRecord,
  QualityIndicatorRecord,
  // Extended interfaces
  IEmployeeRepository,
  IRosterRepository,
  IVacationRepository,
  IAttendanceRepository,
  IOvertimeRepository,
  IPatientRepository,
  IBedRepository,
  IVitalSignsRepository,
  IHandoverRepository,
  INursingTaskRepository,
  IEquipmentRepository,
  IMaintenanceRepository,
  IInventoryRepository,
  IInventoryTransactionRepository,
  IIncidentRepository,
  IEmergencyCodeRepository,
  ITrainingRepository,
  ICertificationRepository,
  IEvaluationRepository,
  IAnnouncementRepository,
  IMessageRepository,
  INotificationRepository,
  IAuditLogRepository,
  IShiftReportRepository,
  IQualityIndicatorRepository,
} from './contracts'

// Singleton instances — lazily created
// Core
let _pendingUsers: FirestorePendingUserRepository | null = null
let _users: FirestoreUserRepository | null = null
let _credentials: FirestoreEmployeeCredentialsRepository | null = null
let _roles: FirestoreRoleRepository | null = null
let _departments: FirestoreDepartmentRepository | null = null
let _settings: FirestoreSettingsRepository | null = null
let _loginLog: FirestoreLoginLogRepository | null = null

// Extended
let _employees: FirestoreEmployeeRepository | null = null
let _rosters: FirestoreRosterRepository | null = null
let _vacations: FirestoreVacationRepository | null = null
let _attendance: FirestoreAttendanceRepository | null = null
let _overtime: FirestoreOvertimeRepository | null = null
let _patients: FirestorePatientRepository | null = null
let _beds: FirestoreBedRepository | null = null
let _vitals: FirestoreVitalSignsRepository | null = null
let _handovers: FirestoreHandoverRepository | null = null
let _nursingTasks: FirestoreNursingTaskRepository | null = null
let _equipment: FirestoreEquipmentRepository | null = null
let _maintenance: FirestoreMaintenanceRepository | null = null
let _inventory: FirestoreInventoryRepository | null = null
let _inventoryTransactions: FirestoreInventoryTransactionRepository | null = null
let _incidents: FirestoreIncidentRepository | null = null
let _emergencyCodes: FirestoreEmergencyCodeRepository | null = null
let _trainings: FirestoreTrainingRepository | null = null
let _certifications: FirestoreCertificationRepository | null = null
let _evaluations: FirestoreEvaluationRepository | null = null
let _announcements: FirestoreAnnouncementRepository | null = null
let _messages: FirestoreMessageRepository | null = null
let _notifications: FirestoreNotificationRepository | null = null
let _auditLog: FirestoreAuditLogRepository | null = null
let _shiftReports: FirestoreShiftReportRepository | null = null
let _qualityIndicators: FirestoreQualityIndicatorRepository | null = null

// Core repository getters
export const pendingUserRepo = () => (_pendingUsers ??= new FirestorePendingUserRepository())
export const userRepo        = () => (_users        ??= new FirestoreUserRepository())
export const credentialsRepo = () => (_credentials  ??= new FirestoreEmployeeCredentialsRepository())
export const roleRepo        = () => (_roles        ??= new FirestoreRoleRepository())
export const departmentRepo  = () => (_departments  ??= new FirestoreDepartmentRepository())
export const settingsRepo    = () => (_settings     ??= new FirestoreSettingsRepository())
export const loginLogRepo    = () => (_loginLog     ??= new FirestoreLoginLogRepository())

// Extended repository getters
export const employeeRepo          = () => (_employees          ??= new FirestoreEmployeeRepository())
export const rosterRepo            = () => (_rosters            ??= new FirestoreRosterRepository())
export const vacationRepo          = () => (_vacations          ??= new FirestoreVacationRepository())
export const attendanceRepo        = () => (_attendance         ??= new FirestoreAttendanceRepository())
export const overtimeRepo          = () => (_overtime           ??= new FirestoreOvertimeRepository())
export const patientRepo           = () => (_patients           ??= new FirestorePatientRepository())
export const bedRepo               = () => (_beds               ??= new FirestoreBedRepository())
export const vitalSignsRepo        = () => (_vitals             ??= new FirestoreVitalSignsRepository())
export const handoverRepo          = () => (_handovers          ??= new FirestoreHandoverRepository())
export const nursingTaskRepo       = () => (_nursingTasks       ??= new FirestoreNursingTaskRepository())
export const equipmentRepo         = () => (_equipment          ??= new FirestoreEquipmentRepository())
export const maintenanceRepo       = () => (_maintenance        ??= new FirestoreMaintenanceRepository())
export const inventoryRepo         = () => (_inventory          ??= new FirestoreInventoryRepository())
export const inventoryTransactionRepo = () => (_inventoryTransactions ??= new FirestoreInventoryTransactionRepository())
export const incidentRepo          = () => (_incidents          ??= new FirestoreIncidentRepository())
export const emergencyCodeRepo     = () => (_emergencyCodes     ??= new FirestoreEmergencyCodeRepository())
export const trainingRepo          = () => (_trainings          ??= new FirestoreTrainingRepository())
export const certificationRepo     = () => (_certifications     ??= new FirestoreCertificationRepository())
export const evaluationRepo        = () => (_evaluations        ??= new FirestoreEvaluationRepository())
export const announcementRepo      = () => (_announcements      ??= new FirestoreAnnouncementRepository())
export const messageRepo           = () => (_messages           ??= new FirestoreMessageRepository())
export const notificationRepo      = () => (_notifications      ??= new FirestoreNotificationRepository())
export const auditLogRepo          = () => (_auditLog           ??= new FirestoreAuditLogRepository())
export const shiftReportRepo       = () => (_shiftReports       ??= new FirestoreShiftReportRepository())
export const qualityIndicatorRepo  = () => (_qualityIndicators  ??= new FirestoreQualityIndicatorRepository())
