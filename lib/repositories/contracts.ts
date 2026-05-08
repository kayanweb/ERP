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

// ─── Extended Domain Types ────────────────────────────────────

export type ShiftType = 'morning' | 'evening' | 'night'
export type EmployeeStatus = 'active' | 'on_leave' | 'absent' | 'terminated'
export type VacationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'broken' | 'retired'
export type IncidentSeverity = 'near_miss' | 'minor' | 'moderate' | 'major' | 'catastrophic'
export type IncidentType = 'fall' | 'medication_error' | 'pressure_ulcer' | 'infection' | 'equipment_failure' | 'needle_stick' | 'patient_complaint' | 'other'
export type EmergencyCodeType = 'blue' | 'red' | 'black' | 'pink' | 'orange' | 'yellow' | 'green'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'

// Employee Record
export interface EmployeeRecord {
  id: string
  employeeCode: string
  name: string
  nameAr: string
  email: string
  phone: string
  nationalId?: string
  dateOfBirth?: string
  gender?: 'male' | 'female'
  nationality?: string
  address?: string
  role: 'nurse' | 'senior_nurse' | 'head_nurse' | 'supervisor' | 'admin'
  departmentId: string
  departmentName?: string
  status: EmployeeStatus
  hireDate: string
  contractEndDate?: string
  salary?: number
  bankAccount?: string
  emergencyContact?: string
  emergencyPhone?: string
  photoURL?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Roster/Shift Assignment Record
export interface RosterRecord {
  id: string
  employeeId: string
  employeeName: string
  departmentId: string
  departmentName: string
  date: string
  shift: ShiftType
  startTime: string
  endTime: string
  isOvertime: boolean
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Vacation/Leave Request Record
export interface VacationRecord {
  id: string
  employeeId: string
  employeeName: string
  departmentId: string
  type: 'annual' | 'sick' | 'emergency' | 'maternity' | 'unpaid' | 'other'
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: VacationStatus
  attachmentUrl?: string
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
  updatedAt: string
}

// Attendance Record
export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  departmentId: string
  date: string
  shift: ShiftType
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  status: AttendanceStatus
  lateMinutes?: number
  overtimeMinutes?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// Overtime Record
export interface OvertimeRecord {
  id: string
  employeeId: string
  employeeName: string
  departmentId: string
  date: string
  startTime: string
  endTime: string
  totalHours: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

// Patient Record
export interface PatientRecord {
  id: string
  mrn: string
  name: string
  nameAr: string
  dateOfBirth: string
  gender: 'male' | 'female'
  nationalId?: string
  phone?: string
  address?: string
  departmentId: string
  departmentName?: string
  bedId?: string
  bedNumber?: string
  admissionDate: string
  dischargeDate?: string
  diagnosis?: string
  attendingPhysician?: string
  primaryNurse?: string
  isIsolation: boolean
  isolationType?: 'contact' | 'droplet' | 'airborne'
  isolationReason?: string
  status: 'admitted' | 'discharged' | 'transferred' | 'deceased'
  allergies?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// Bed Record
export interface BedRecord {
  id: string
  bedNumber: string
  departmentId: string
  departmentName?: string
  roomNumber?: string
  floor?: string
  bedType: 'standard' | 'icu' | 'isolation' | 'pediatric' | 'nicu'
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  currentPatientId?: string
  currentPatientName?: string
  equipment?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// Vital Signs Record
export interface VitalSignsRecord {
  id: string
  patientId: string
  patientName: string
  mrn: string
  departmentId: string
  timestamp: string
  temperature?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  painLevel?: number
  bloodGlucose?: number
  weight?: number
  height?: number
  consciousness?: 'alert' | 'verbal' | 'pain' | 'unresponsive'
  ewsScore?: number
  recordedBy: string
  recordedByName: string
  notes?: string
  createdAt: string
}

// Handover/SBAR Record
export interface HandoverRecord {
  id: string
  patientId: string
  patientName: string
  mrn: string
  departmentId: string
  departmentName: string
  fromNurseId: string
  fromNurseName: string
  toNurseId: string
  toNurseName: string
  shift: ShiftType
  date: string
  situation: string
  background: string
  assessment: string
  recommendation: string
  criticalAlerts?: string[]
  pendingTasks?: string[]
  medications?: string[]
  allergies?: string[]
  status: 'pending' | 'acknowledged' | 'completed'
  acknowledgedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// Nursing Task Record
export interface NursingTaskRecord {
  id: string
  patientId?: string
  patientName?: string
  mrn?: string
  departmentId: string
  departmentName?: string
  type: 'medication' | 'assessment' | 'procedure' | 'documentation' | 'communication' | 'other'
  title: string
  titleAr?: string
  description: string
  priority: TaskPriority
  assignedToId: string
  assignedToName: string
  dueTime: string
  status: TaskStatus
  completedAt?: string
  completedBy?: string
  completedByName?: string
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Equipment Record
export interface EquipmentRecord {
  id: string
  name: string
  nameAr: string
  serialNumber: string
  assetTag?: string
  category: string
  manufacturer?: string
  model?: string
  departmentId: string
  departmentName?: string
  location?: string
  status: EquipmentStatus
  purchaseDate?: string
  purchasePrice?: number
  warrantyExpiry?: string
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  assignedToId?: string
  assignedToName?: string
  notes?: string
  photoURL?: string
  createdAt: string
  updatedAt: string
}

// Maintenance Request Record
export interface MaintenanceRecord {
  id: string
  equipmentId: string
  equipmentName: string
  departmentId: string
  type: 'preventive' | 'corrective' | 'emergency'
  description: string
  priority: TaskPriority
  reportedById: string
  reportedByName: string
  assignedToId?: string
  assignedToName?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate?: string
  completedDate?: string
  cost?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// Inventory Item Record
export interface InventoryRecord {
  id: string
  name: string
  nameAr: string
  sku?: string
  category: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  departmentId: string
  departmentName?: string
  location?: string
  supplier?: string
  unitPrice?: number
  expiryDate?: string
  lastRestocked?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Inventory Transaction Record
export interface InventoryTransactionRecord {
  id: string
  inventoryId: string
  inventoryName: string
  type: 'in' | 'out' | 'adjustment' | 'expired' | 'damaged'
  quantity: number
  previousStock: number
  newStock: number
  reason?: string
  referenceNumber?: string
  performedById: string
  performedByName: string
  createdAt: string
}

// Incident Report Record
export interface IncidentRecord {
  id: string
  incidentNumber: string
  type: IncidentType
  severity: IncidentSeverity
  departmentId: string
  departmentName?: string
  location: string
  dateTime: string
  reportedById: string
  reportedByName: string
  patientInvolved: boolean
  patientId?: string
  patientName?: string
  mrn?: string
  staffInvolved?: string[]
  description: string
  immediateActions: string
  witnesses?: string[]
  rootCause?: string
  correctiveActions?: string
  preventiveMeasures?: string
  status: 'reported' | 'investigating' | 'resolved' | 'closed'
  investigatedById?: string
  investigatedByName?: string
  resolvedAt?: string
  closedAt?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

// Emergency Code Record
export interface EmergencyCodeRecord {
  id: string
  codeNumber: string
  type: EmergencyCodeType
  location: string
  departmentId: string
  departmentName?: string
  calledById: string
  calledByName: string
  status: 'active' | 'resolved' | 'cancelled'
  startTime: string
  endTime?: string
  responders?: { id: string; name: string; arrivedAt?: string }[]
  description?: string
  outcome?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Training Record
export interface TrainingRecord {
  id: string
  name: string
  nameAr: string
  type: 'mandatory' | 'optional' | 'specialized'
  category: string
  description?: string
  duration: number
  validityPeriod: number
  provider?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Staff Certification Record
export interface CertificationRecord {
  id: string
  employeeId: string
  employeeName: string
  trainingId: string
  trainingName: string
  completedDate: string
  expiryDate: string
  status: 'valid' | 'expiring_soon' | 'expired'
  certificateUrl?: string
  score?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// Performance Evaluation Record
export interface EvaluationRecord {
  id: string
  employeeId: string
  employeeName: string
  departmentId: string
  evaluatorId: string
  evaluatorName: string
  period: string
  evaluationDate: string
  overallScore: number
  categories: {
    category: string
    score: number
    weight: number
    comments?: string
  }[]
  strengths?: string
  areasForImprovement?: string
  goals?: string
  employeeComments?: string
  status: 'draft' | 'submitted' | 'acknowledged'
  acknowledgedAt?: string
  createdAt: string
  updatedAt: string
}

// Announcement Record
export interface AnnouncementRecord {
  id: string
  title: string
  titleAr: string
  content: string
  contentAr: string
  type: 'general' | 'urgent' | 'policy' | 'event' | 'maintenance'
  priority: 'low' | 'normal' | 'high'
  targetDepartments?: string[]
  targetRoles?: string[]
  publishedById: string
  publishedByName: string
  publishedAt: string
  expiresAt?: string
  isPinned: boolean
  attachments?: string[]
  readBy?: string[]
  createdAt: string
  updatedAt: string
}

// Message Record
export interface MessageRecord {
  id: string
  fromId: string
  fromName: string
  toId: string
  toName: string
  subject: string
  content: string
  priority: 'normal' | 'high' | 'urgent'
  isRead: boolean
  readAt?: string
  attachments?: string[]
  parentId?: string
  createdAt: string
}

// Notification Record
export interface NotificationRecord {
  id: string
  recipientId: string
  type: string
  title: string
  titleAr: string
  message: string
  messageAr: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  isRead: boolean
  readAt?: string
  actionUrl?: string
  data?: Record<string, unknown>
  expiresAt?: string
  createdAt: string
}

// Audit Log Record (Extended)
export interface AuditLogRecord {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  targetId?: string
  targetType?: string
  details?: Record<string, unknown>
  previousValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

// Shift Report Record
export interface ShiftReportRecord {
  id: string
  date: string
  shift: ShiftType
  departmentId?: string
  supervisorId: string
  supervisorName: string
  status: 'draft' | 'submitted' | 'approved'
  census: {
    departmentId: string
    departmentName: string
    beds: number
    patients: number
    nurses: number
    isolationCases: number
  }[]
  checklist: {
    id: string
    name: string
    nameAr: string
    status: 'done' | 'pending' | 'na'
    notes?: string
  }[]
  problems?: {
    id: string
    type: string
    description: string
    department: string
    severity: 'low' | 'medium' | 'high'
    status: 'open' | 'resolved'
  }[]
  absences?: {
    employeeId: string
    employeeName: string
    type: string
    details?: string
  }[]
  notes?: string
  submittedAt?: string
  approvedById?: string
  approvedByName?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

// Quality Indicator Record
export interface QualityIndicatorRecord {
  id: string
  name: string
  nameAr: string
  category: 'patient_safety' | 'clinical' | 'operational' | 'staff'
  value: number
  target: number
  unit: string
  period: string
  departmentId?: string
  departmentName?: string
  trend: 'up' | 'down' | 'stable'
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Extended Repository Interfaces ───────────────────────────

export interface IEmployeeRepository {
  getAll(): Promise<EmployeeRecord[]>
  getById(id: string): Promise<EmployeeRecord | undefined>
  getByDepartment(departmentId: string): Promise<EmployeeRecord[]>
  getByCode(code: string): Promise<EmployeeRecord | undefined>
  create(employee: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeRecord>
  update(id: string, updates: Partial<EmployeeRecord>): Promise<EmployeeRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IRosterRepository {
  getAll(): Promise<RosterRecord[]>
  getById(id: string): Promise<RosterRecord | undefined>
  getByEmployee(employeeId: string): Promise<RosterRecord[]>
  getByDepartment(departmentId: string): Promise<RosterRecord[]>
  getByDateRange(startDate: string, endDate: string): Promise<RosterRecord[]>
  create(roster: Omit<RosterRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RosterRecord>
  update(id: string, updates: Partial<RosterRecord>): Promise<RosterRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IVacationRepository {
  getAll(): Promise<VacationRecord[]>
  getById(id: string): Promise<VacationRecord | undefined>
  getByEmployee(employeeId: string): Promise<VacationRecord[]>
  getByStatus(status: VacationStatus): Promise<VacationRecord[]>
  create(vacation: Omit<VacationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<VacationRecord>
  update(id: string, updates: Partial<VacationRecord>): Promise<VacationRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IAttendanceRepository {
  getAll(): Promise<AttendanceRecord[]>
  getById(id: string): Promise<AttendanceRecord | undefined>
  getByEmployee(employeeId: string): Promise<AttendanceRecord[]>
  getByDate(date: string): Promise<AttendanceRecord[]>
  getByDateRange(startDate: string, endDate: string): Promise<AttendanceRecord[]>
  create(attendance: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AttendanceRecord>
  update(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IOvertimeRepository {
  getAll(): Promise<OvertimeRecord[]>
  getById(id: string): Promise<OvertimeRecord | undefined>
  getByEmployee(employeeId: string): Promise<OvertimeRecord[]>
  getPending(): Promise<OvertimeRecord[]>
  create(overtime: Omit<OvertimeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<OvertimeRecord>
  update(id: string, updates: Partial<OvertimeRecord>): Promise<OvertimeRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IPatientRepository {
  getAll(): Promise<PatientRecord[]>
  getById(id: string): Promise<PatientRecord | undefined>
  getByMRN(mrn: string): Promise<PatientRecord | undefined>
  getByDepartment(departmentId: string): Promise<PatientRecord[]>
  getAdmitted(): Promise<PatientRecord[]>
  getIsolation(): Promise<PatientRecord[]>
  create(patient: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientRecord>
  update(id: string, updates: Partial<PatientRecord>): Promise<PatientRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IBedRepository {
  getAll(): Promise<BedRecord[]>
  getById(id: string): Promise<BedRecord | undefined>
  getByDepartment(departmentId: string): Promise<BedRecord[]>
  getAvailable(): Promise<BedRecord[]>
  create(bed: Omit<BedRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<BedRecord>
  update(id: string, updates: Partial<BedRecord>): Promise<BedRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IVitalSignsRepository {
  getAll(): Promise<VitalSignsRecord[]>
  getById(id: string): Promise<VitalSignsRecord | undefined>
  getByPatient(patientId: string): Promise<VitalSignsRecord[]>
  getLatestByPatient(patientId: string): Promise<VitalSignsRecord | undefined>
  create(vitals: Omit<VitalSignsRecord, 'id' | 'createdAt'>): Promise<VitalSignsRecord>
}

export interface IHandoverRepository {
  getAll(): Promise<HandoverRecord[]>
  getById(id: string): Promise<HandoverRecord | undefined>
  getByPatient(patientId: string): Promise<HandoverRecord[]>
  getByNurse(nurseId: string): Promise<HandoverRecord[]>
  getPending(): Promise<HandoverRecord[]>
  create(handover: Omit<HandoverRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<HandoverRecord>
  update(id: string, updates: Partial<HandoverRecord>): Promise<HandoverRecord | undefined>
}

export interface INursingTaskRepository {
  getAll(): Promise<NursingTaskRecord[]>
  getById(id: string): Promise<NursingTaskRecord | undefined>
  getByAssignee(assigneeId: string): Promise<NursingTaskRecord[]>
  getByPatient(patientId: string): Promise<NursingTaskRecord[]>
  getByStatus(status: TaskStatus): Promise<NursingTaskRecord[]>
  create(task: Omit<NursingTaskRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<NursingTaskRecord>
  update(id: string, updates: Partial<NursingTaskRecord>): Promise<NursingTaskRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IEquipmentRepository {
  getAll(): Promise<EquipmentRecord[]>
  getById(id: string): Promise<EquipmentRecord | undefined>
  getByDepartment(departmentId: string): Promise<EquipmentRecord[]>
  getByStatus(status: EquipmentStatus): Promise<EquipmentRecord[]>
  create(equipment: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EquipmentRecord>
  update(id: string, updates: Partial<EquipmentRecord>): Promise<EquipmentRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IMaintenanceRepository {
  getAll(): Promise<MaintenanceRecord[]>
  getById(id: string): Promise<MaintenanceRecord | undefined>
  getByEquipment(equipmentId: string): Promise<MaintenanceRecord[]>
  getPending(): Promise<MaintenanceRecord[]>
  create(maintenance: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord>
  update(id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IInventoryRepository {
  getAll(): Promise<InventoryRecord[]>
  getById(id: string): Promise<InventoryRecord | undefined>
  getByDepartment(departmentId: string): Promise<InventoryRecord[]>
  getLowStock(): Promise<InventoryRecord[]>
  create(item: Omit<InventoryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryRecord>
  update(id: string, updates: Partial<InventoryRecord>): Promise<InventoryRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IInventoryTransactionRepository {
  getAll(): Promise<InventoryTransactionRecord[]>
  getByInventory(inventoryId: string): Promise<InventoryTransactionRecord[]>
  create(transaction: Omit<InventoryTransactionRecord, 'id' | 'createdAt'>): Promise<InventoryTransactionRecord>
}

export interface IIncidentRepository {
  getAll(): Promise<IncidentRecord[]>
  getById(id: string): Promise<IncidentRecord | undefined>
  getByDepartment(departmentId: string): Promise<IncidentRecord[]>
  getByStatus(status: string): Promise<IncidentRecord[]>
  create(incident: Omit<IncidentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<IncidentRecord>
  update(id: string, updates: Partial<IncidentRecord>): Promise<IncidentRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IEmergencyCodeRepository {
  getAll(): Promise<EmergencyCodeRecord[]>
  getById(id: string): Promise<EmergencyCodeRecord | undefined>
  getActive(): Promise<EmergencyCodeRecord[]>
  create(code: Omit<EmergencyCodeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyCodeRecord>
  update(id: string, updates: Partial<EmergencyCodeRecord>): Promise<EmergencyCodeRecord | undefined>
}

export interface ITrainingRepository {
  getAll(): Promise<TrainingRecord[]>
  getById(id: string): Promise<TrainingRecord | undefined>
  getActive(): Promise<TrainingRecord[]>
  create(training: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingRecord>
  update(id: string, updates: Partial<TrainingRecord>): Promise<TrainingRecord | undefined>
  delete(id: string): Promise<void>
}

export interface ICertificationRepository {
  getAll(): Promise<CertificationRecord[]>
  getById(id: string): Promise<CertificationRecord | undefined>
  getByEmployee(employeeId: string): Promise<CertificationRecord[]>
  getExpiringSoon(days: number): Promise<CertificationRecord[]>
  create(cert: Omit<CertificationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CertificationRecord>
  update(id: string, updates: Partial<CertificationRecord>): Promise<CertificationRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IEvaluationRepository {
  getAll(): Promise<EvaluationRecord[]>
  getById(id: string): Promise<EvaluationRecord | undefined>
  getByEmployee(employeeId: string): Promise<EvaluationRecord[]>
  create(evaluation: Omit<EvaluationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EvaluationRecord>
  update(id: string, updates: Partial<EvaluationRecord>): Promise<EvaluationRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IAnnouncementRepository {
  getAll(): Promise<AnnouncementRecord[]>
  getById(id: string): Promise<AnnouncementRecord | undefined>
  getActive(): Promise<AnnouncementRecord[]>
  create(announcement: Omit<AnnouncementRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnnouncementRecord>
  update(id: string, updates: Partial<AnnouncementRecord>): Promise<AnnouncementRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IMessageRepository {
  getAll(): Promise<MessageRecord[]>
  getById(id: string): Promise<MessageRecord | undefined>
  getByRecipient(recipientId: string): Promise<MessageRecord[]>
  getBySender(senderId: string): Promise<MessageRecord[]>
  getUnread(recipientId: string): Promise<MessageRecord[]>
  create(message: Omit<MessageRecord, 'id' | 'createdAt'>): Promise<MessageRecord>
  update(id: string, updates: Partial<MessageRecord>): Promise<MessageRecord | undefined>
  delete(id: string): Promise<void>
}

export interface INotificationRepository {
  getAll(): Promise<NotificationRecord[]>
  getById(id: string): Promise<NotificationRecord | undefined>
  getByRecipient(recipientId: string): Promise<NotificationRecord[]>
  getUnread(recipientId: string): Promise<NotificationRecord[]>
  create(notification: Omit<NotificationRecord, 'id' | 'createdAt'>): Promise<NotificationRecord>
  update(id: string, updates: Partial<NotificationRecord>): Promise<NotificationRecord | undefined>
  markAsRead(id: string): Promise<void>
  markAllAsRead(recipientId: string): Promise<void>
}

export interface IAuditLogRepository {
  add(entry: Omit<AuditLogRecord, 'id'>): Promise<void>
  getRecent(limit?: number): Promise<AuditLogRecord[]>
  getByUser(userId: string): Promise<AuditLogRecord[]>
  getByModule(module: string): Promise<AuditLogRecord[]>
}

export interface IShiftReportRepository {
  getAll(): Promise<ShiftReportRecord[]>
  getById(id: string): Promise<ShiftReportRecord | undefined>
  getByDate(date: string): Promise<ShiftReportRecord[]>
  getByDateRange(startDate: string, endDate: string): Promise<ShiftReportRecord[]>
  create(report: Omit<ShiftReportRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShiftReportRecord>
  update(id: string, updates: Partial<ShiftReportRecord>): Promise<ShiftReportRecord | undefined>
  delete(id: string): Promise<void>
}

export interface IQualityIndicatorRepository {
  getAll(): Promise<QualityIndicatorRecord[]>
  getById(id: string): Promise<QualityIndicatorRecord | undefined>
  getByCategory(category: string): Promise<QualityIndicatorRecord[]>
  getByPeriod(period: string): Promise<QualityIndicatorRecord[]>
  create(indicator: Omit<QualityIndicatorRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<QualityIndicatorRecord>
  update(id: string, updates: Partial<QualityIndicatorRecord>): Promise<QualityIndicatorRecord | undefined>
  delete(id: string): Promise<void>
}
