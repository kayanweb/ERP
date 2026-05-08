// User Roles
export type UserRole = 'admin' | 'head_nurse' | 'supervisor' | 'staff'

export interface User {
  id: string
  name: string
  nameAr: string
  email: string
  role: UserRole
  department?: string
  avatar?: string
}

// Department
export interface Department {
  id: string
  name: string
  nameAr: string
  beds: number
  patients: number
  nurses: number
  isolationCases: number
}

// Staff
export interface Staff {
  id: string
  name: string
  nameAr: string
  email: string
  phone: string
  role: 'nurse' | 'senior_nurse' | 'head_nurse' | 'supervisor'
  department: string
  status: 'active' | 'on_leave' | 'absent'
  shift?: 'morning' | 'evening' | 'night'
  hireDate: string
}

// Patient
export interface Patient {
  id: string
  name: string
  nameAr: string
  mrn: string // Medical Record Number
  department: string
  bedNumber: string
  admissionDate: string
  diagnosis?: string
  isIsolation: boolean
  isolationType?: 'contact' | 'droplet' | 'airborne'
  status: 'admitted' | 'discharged' | 'transferred'
}

// Shift Report
export interface ShiftReport {
  id: string
  date: string
  shift: 'morning' | 'evening' | 'night'
  supervisor: string
  supervisorId: string
  status: 'draft' | 'submitted' | 'approved'
  departmentCensus: DepartmentCensus[]
  checklist: ChecklistItem[]
  problems: Problem[]
  absences: Absence[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface DepartmentCensus {
  departmentId: string
  departmentName: string
  beds: number
  patients: number
  nurses: number
}

export interface ChecklistItem {
  id: string
  name: string
  nameAr: string
  departments: {
    departmentId: string
    status: 'done' | 'pending' | 'na'
  }[]
}

export interface Problem {
  id: string
  type: 'patient_issue' | 'isolation' | 'equipment' | 'other'
  description: string
  department: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'resolved'
}

export interface Absence {
  id: string
  staffId: string
  staffName: string
  type: 'absence' | 'sick_leave' | 'delegation' | 'vacation'
  details: string
  date: string
}

// Analytics
export interface DashboardStats {
  totalBeds: number
  totalPatients: number
  occupancyRate: number
  totalStaff: number
  absences: number
  isolationCases: number
}

export interface Alert {
  id: string
  type: 'over_capacity' | 'low_staff' | 'critical_patient' | 'isolation'
  message: string
  messageAr: string
  department?: string
  severity: 'warning' | 'critical'
  timestamp: string
}

// Audit Log
export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  details: string
  timestamp: string
  ipAddress?: string
}

// Emergency Codes
export type EmergencyCodeType = 'blue' | 'red' | 'black' | 'pink' | 'orange' | 'yellow' | 'green'

export interface EmergencyCode {
  id: string
  type: EmergencyCodeType
  location: string
  department: string
  calledBy: string
  calledById: string
  status: 'active' | 'resolved' | 'cancelled'
  startTime: string
  endTime?: string
  responders: string[]
  notes: string
  outcome?: string
}

// Handover/SBAR
export interface Handover {
  id: string
  patientId: string
  patientName: string
  mrn: string
  department: string
  fromNurse: string
  toNurse: string
  shift: 'morning' | 'evening' | 'night'
  date: string
  situation: string
  background: string
  assessment: string
  recommendation: string
  criticalAlerts: string[]
  pendingTasks: string[]
  status: 'pending' | 'acknowledged' | 'completed'
}

// Incident Report
export type IncidentType = 'fall' | 'medication_error' | 'pressure_ulcer' | 'infection' | 'equipment_failure' | 'needle_stick' | 'patient_complaint' | 'other'
export type IncidentSeverity = 'near_miss' | 'minor' | 'moderate' | 'major' | 'catastrophic'

export interface IncidentReport {
  id: string
  type: IncidentType
  severity: IncidentSeverity
  department: string
  location: string
  dateTime: string
  reportedBy: string
  reportedById: string
  patientInvolved: boolean
  patientId?: string
  patientName?: string
  description: string
  immediateActions: string
  witnesses: string[]
  rootCause?: string
  correctiveActions?: string
  status: 'reported' | 'investigating' | 'resolved' | 'closed'
  attachments?: string[]
}

// Equipment & Inventory
export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'broken' | 'retired'

export interface Equipment {
  id: string
  name: string
  nameAr: string
  serialNumber: string
  category: string
  department: string
  location: string
  status: EquipmentStatus
  lastMaintenance?: string
  nextMaintenance?: string
  purchaseDate: string
  warrantyExpiry?: string
  assignedTo?: string
  notes?: string
}

export interface InventoryItem {
  id: string
  name: string
  nameAr: string
  category: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  department: string
  lastRestocked?: string
  expiryDate?: string
}

// Quality Indicators
export interface QualityIndicator {
  id: string
  name: string
  nameAr: string
  category: 'patient_safety' | 'clinical' | 'operational' | 'staff'
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  period: string
  department?: string
}

// Training & Certifications
export interface Training {
  id: string
  name: string
  nameAr: string
  type: 'mandatory' | 'optional' | 'specialized'
  duration: number // in hours
  validityPeriod: number // in months
  provider: string
  description?: string
}

export interface StaffCertification {
  id: string
  staffId: string
  staffName: string
  trainingId: string
  trainingName: string
  completedDate: string
  expiryDate: string
  status: 'valid' | 'expiring_soon' | 'expired'
  certificateUrl?: string
}

// Vital Signs Monitoring
export interface VitalSigns {
  id: string
  patientId: string
  timestamp: string
  temperature: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  heartRate: number
  respiratoryRate: number
  oxygenSaturation: number
  painLevel: number
  recordedBy: string
  notes?: string
}

// Task Management
export interface NursingTask {
  id: string
  patientId?: string
  patientName?: string
  department: string
  type: 'medication' | 'assessment' | 'procedure' | 'documentation' | 'communication' | 'other'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  assignedToId: string
  dueTime: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  completedAt?: string
  completedBy?: string
  notes?: string
}

// Communication/Messages
export interface Message {
  id: string
  fromId: string
  fromName: string
  toId: string
  toName: string
  subject: string
  content: string
  priority: 'normal' | 'high' | 'urgent'
  read: boolean
  timestamp: string
  attachments?: string[]
}

// Real-time Notifications
export type NotificationType = 
  | 'emergency_code'
  | 'handover_request'
  | 'task_assigned'
  | 'task_overdue'
  | 'incident_report'
  | 'vital_alert'
  | 'inventory_low'
  | 'equipment_issue'
  | 'message'
  | 'shift_reminder'
  | 'approval_needed'
  | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  titleAr: string
  message: string
  messageAr: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  read: boolean
  actionUrl?: string
  actionLabel?: string
  actionLabelAr?: string
  data?: Record<string, unknown>
  createdAt: string
  expiresAt?: string
  recipientId: string
  senderId?: string
  senderName?: string
}

// Real-time Activity
export interface Activity {
  id: string
  type: string
  userId: string
  userName: string
  action: string
  actionAr: string
  target?: string
  targetId?: string
  department?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// Online Status
export interface UserPresence {
  id: string
  name: string
  department: string
  role: UserRole
  isOnline: boolean
  lastSeen: string
  currentPage?: string
}

