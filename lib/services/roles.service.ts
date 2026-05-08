/**
 * Roles & Permissions Service
 */
import { roleRepo } from '@/lib/repositories'
import type { RoleRecord } from '@/lib/repositories'

export type { RoleRecord }

// ─── Built-in permission keys (used in the permission matrix UI) ─

export const PERMISSION_KEYS = [
  // Dashboard
  'dashboard.view',
  // Reports
  'reports.view', 'reports.create', 'reports.approve', 'reports.export',
  // Staff
  'staff.view', 'staff.create', 'staff.edit', 'staff.delete',
  // Departments
  'departments.view', 'departments.manage',
  // Patients
  'patients.view', 'patients.create', 'patients.edit',
  // Inventory
  'inventory.view', 'inventory.manage',
  // Equipment
  'equipment.view', 'equipment.manage',
  // Emergency
  'emergency.view', 'emergency.activate',
  // Users
  'users.view', 'users.create', 'users.edit', 'users.delete', 'users.approve',
  // Roles
  'roles.view', 'roles.manage',
  // Settings
  'settings.view', 'settings.manage',
  // Analytics
  'analytics.view',
  // Logs
  'logs.view',
  // Notifications
  'notifications.send',
] as const

export type PermissionKey = (typeof PERMISSION_KEYS)[number]

export const PERMISSION_GROUPS: Record<string, PermissionKey[]> = {
  'لوحة التحكم': ['dashboard.view'],
  'التقارير': ['reports.view', 'reports.create', 'reports.approve', 'reports.export'],
  'الموظفون': ['staff.view', 'staff.create', 'staff.edit', 'staff.delete'],
  'الأقسام': ['departments.view', 'departments.manage'],
  'المرضى': ['patients.view', 'patients.create', 'patients.edit'],
  'المخزون': ['inventory.view', 'inventory.manage'],
  'المعدات': ['equipment.view', 'equipment.manage'],
  'الطوارئ': ['emergency.view', 'emergency.activate'],
  'المستخدمون': ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.approve'],
  'الصلاحيات': ['roles.view', 'roles.manage'],
  'الإعدادات': ['settings.view', 'settings.manage'],
  'التحليلات': ['analytics.view'],
  'السجلات': ['logs.view'],
  'الإشعارات': ['notifications.send'],
}

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  'dashboard.view':       'عرض لوحة التحكم',
  'reports.view':         'عرض التقارير',
  'reports.create':       'إنشاء التقارير',
  'reports.approve':      'اعتماد التقارير',
  'reports.export':       'تصدير التقارير',
  'staff.view':           'عرض الموظفين',
  'staff.create':         'إضافة موظف',
  'staff.edit':           'تعديل موظف',
  'staff.delete':         'حذف موظف',
  'departments.view':     'عرض الأقسام',
  'departments.manage':   'إدارة الأقسام',
  'patients.view':        'عرض المرضى',
  'patients.create':      'إضافة مريض',
  'patients.edit':        'تعديل مريض',
  'inventory.view':       'عرض المخزون',
  'inventory.manage':     'إدارة المخزون',
  'equipment.view':       'عرض المعدات',
  'equipment.manage':     'إدارة المعدات',
  'emergency.view':       'عرض الطوارئ',
  'emergency.activate':   'تفعيل كود الطوارئ',
  'users.view':           'عرض المستخدمين',
  'users.create':         'إضافة مستخدم',
  'users.edit':           'تعديل مستخدم',
  'users.delete':         'حذف مستخدم',
  'users.approve':        'الموافقة على طلبات الدخول',
  'roles.view':           'عرض الصلاحيات',
  'roles.manage':         'إدارة الصلاحيات',
  'settings.view':        'عرض الإعدادات',
  'settings.manage':      'إدارة الإعدادات',
  'analytics.view':       'عرض التحليلات',
  'logs.view':            'عرض سجل العمليات',
  'notifications.send':   'إرسال الإشعارات',
}

// All permissions for admin
export const ALL_PERMISSIONS: PermissionKey[] = [...PERMISSION_KEYS]

// ─── Default Roles (seeded on first run) ─────────────────────

export const DEFAULT_ROLES: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    key: 'admin',
    name: 'System Admin',
    nameAr: 'مدير النظام',
    description: 'صلاحية كاملة على جميع أقسام النظام',
    permissions: [...ALL_PERMISSIONS],
    isActive: true,
    isDefault: false,
    order: 1,
  },
  {
    key: 'head_nurse',
    name: 'Head Nurse',
    nameAr: 'رئيس التمريض',
    description: 'إدارة الكادر والأقسام وإنشاء التقارير',
    permissions: [
      'dashboard.view', 'reports.view', 'reports.create', 'reports.approve', 'reports.export',
      'staff.view', 'staff.create', 'staff.edit',
      'departments.view', 'departments.manage',
      'patients.view', 'patients.create', 'patients.edit',
      'inventory.view', 'equipment.view', 'emergency.view',
      'users.view', 'analytics.view', 'logs.view',
    ],
    isActive: true,
    isDefault: false,
    order: 2,
  },
  {
    key: 'supervisor',
    name: 'Supervisor',
    nameAr: 'مشرف',
    description: 'الإشراف على الشيفت وإنشاء تقارير محدودة',
    permissions: [
      'dashboard.view', 'reports.view', 'reports.create', 'reports.export',
      'staff.view', 'departments.view', 'patients.view',
      'inventory.view', 'equipment.view', 'emergency.view',
      'analytics.view',
    ],
    isActive: true,
    isDefault: false,
    order: 3,
  },
  {
    key: 'staff',
    name: 'Staff',
    nameAr: 'موظف',
    description: 'وصول للوحة التحكم ومهام الموظف فقط',
    permissions: ['dashboard.view', 'patients.view', 'inventory.view', 'equipment.view'],
    isActive: true,
    isDefault: true,
    order: 4,
  },
]

// ─── CRUD ─────────────────────────────────────────────────────

export async function getAllRoles(): Promise<RoleRecord[]> {
  return roleRepo().getAll()
}

export async function getRoleById(id: string): Promise<RoleRecord | undefined> {
  return roleRepo().getById(id)
}

export async function createRole(
  role: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RoleRecord> {
  return roleRepo().create(role)
}

export async function updateRole(
  id: string,
  updates: Partial<RoleRecord>
): Promise<RoleRecord | undefined> {
  return roleRepo().update(id, updates)
}

export async function deleteRole(id: string): Promise<void> {
  return roleRepo().delete(id)
}

export async function cloneRole(id: string): Promise<RoleRecord | undefined> {
  const original = await roleRepo().getById(id)
  if (!original) return undefined
  return roleRepo().create({
    ...original,
    name: `${original.name} (نسخة)`,
    nameAr: `${original.nameAr} (نسخة)`,
    isDefault: false,
  })
}

// ─── Seeding ─────────────────────────────────────────────────

export async function seedDefaultRoles(): Promise<void> {
  const existing = await roleRepo().getAll()
  if (existing.length > 0) return  // already seeded
  for (const role of DEFAULT_ROLES) {
    await roleRepo().create(role)
  }
}

// ─── Permission Check ─────────────────────────────────────────

export function hasPermission(
  userPermissions: string[],
  permission: PermissionKey
): boolean {
  return userPermissions.includes(permission)
}

export function resolveUserPermissions(
  roles: RoleRecord[],
  customPermissions: string[]
): string[] {
  const fromRoles = roles.flatMap((r) => (r.isActive ? r.permissions : []))
  return [...new Set([...fromRoles, ...customPermissions])]
}
