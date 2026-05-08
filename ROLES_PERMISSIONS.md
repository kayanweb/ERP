# Roles & Permissions Documentation

## Overview

PRO Nurse uses a **dynamic, data-driven RBAC (Role-Based Access Control)** system. Roles and permissions are stored in Firestore, allowing administrators to manage access without code changes.

---

## Core Concepts

### Permission Keys

Atomic permissions represented as dot-separated strings:

```
{domain}.{action}
```

Examples:
- `dashboard.view` - View the main dashboard
- `staff.create` - Create new staff members
- `roles.manage` - Edit/delete roles
- `settings.view` - View system settings

**Never hardcode permission keys** in components. Always use the constants from `roles.service.ts`:

```typescript
import { PERMISSION_KEYS } from '@/lib/services/roles.service'
// PERMISSION_KEYS includes all 26 keys as const
```

### Role Document

Stored in `roles` Firestore collection:

```typescript
{
  id: string                    // Auto-generated document ID
  name: string                  # English name (fallback)
  nameAr: string                # Arabic name (primary)
  description?: string
  permissions: string[]         # Array of permission keys (e.g. ['dashboard.view', 'staff.view'])
  isActive: boolean             # Disable role without deleting
  isDefault: boolean           # System role (cannot delete)
  createdAt: ISO string
  updatedAt: ISO string
  order: number                # Sort order in UI (1=highest)
}
```

### User-Role Relationship

A user references roles by ID in their `users` document:

```typescript
{
  id: 'user-123',
  name: 'Ahmed Mohammed',
  roles: ['role-admin-id', 'role-supervisor-id'],  // Multiple roles supported
  departments: ['dept-icu'],
  customPermissions: ['special.feature'],  // Optional direct permission grants
  ...
}
```

**Permission Resolution**:

```typescript
finalPermissions = [
  ...flatMap(all user's roles → role.permissions),
  ...user.customPermissions
].filter(unique)
```

---

## Built-in Permission Keys

### Dashboard
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `dashboard.view` | عرض لوحة التحكم | View dashboard |

### Reports
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `reports.view` | عرض التقارير | View reports |
| `reports.create` | إنشاء التقارير | Create reports |
| `reports.approve` | اعتماد التقارير | Approve reports |
| `reports.export` | تصدير التقارير | Export reports |

### Staff / Employees
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `staff.view` | عرض الموظفين | View staff |
| `staff.create` | إضافة موظف | Create staff |
| `staff.edit` | تعديل موظف | Edit staff |
| `staff.delete` | حذف موظف | Delete staff |

### Departments
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `departments.view` | عرض الأقسام | View departments |
| `departments.manage` | إدارة الأقسام | Manage departments |

### Patients
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `patients.view` | عرض المرضى | View patients |
| `patients.create` | إضافة مريض | Create patients |
| `patients.edit` | تعديل مريض | Edit patients |

### Inventory
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `inventory.view` | عرض المخزون | View inventory |
| `inventory.manage` | إدارة المخزون | Manage inventory |

### Equipment
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `equipment.view` | عرض المعدات | View equipment |
| `equipment.manage` | إدارة المعدات | Manage equipment |

### Emergency
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `emergency.view` | عرض الطوارئ | View emergency |
| `emergency.activate` | تفعيل كود الطوارئ | Activate emergency code |

### Users / Authentication
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `users.view` | عرض المستخدمين | View users |
| `users.create` | إضافة مستخدم | Create users |
| `users.edit` | تعديل مستخدم | Edit users |
| `users.delete` | حذف مستخدم | Delete users |
| `users.approve` | الموافقة على طلبات الدخول | Approve access requests |

### Roles & Permissions
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `roles.view` | عرض الصلاحيات | View roles |
| `roles.manage` | إدارة الصلاحيات | Manage roles |

### Settings
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `settings.view` | عرض الإعدادات | View settings |
| `settings.manage` | إدارة الإعدادات | Manage settings |

### Analytics & Logs
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `analytics.view` | عرض التحليلات | View analytics |
| `logs.view` | عرض سجل العمليات | View logs |

### Notifications
| Key | Description (Ar) | Description (En) |
|-----|------------------|------------------|
| `notifications.send` | إرسال الإشعارات | Send notifications |

---

## Default Roles

These are seeded automatically on first run (`seedDefaultRoles()`). They can be edited but not deleted (`isDefault: true`).

### 1. System Admin

| Field | Value |
|-------|-------|
| ID | Auto-generated |
| nameAr | مدير النظام |
| name | System Admin |
| permissions | ALL 26 permission keys |
| isDefault | true |
| order | 1 |

**Full system access** - should be assigned to IT/system administrators only.

### 2. Head Nurse

| Field | Value |
|-------|-------|
| nameAr | رئيس التمريض |
| name | Head Nurse |
| permissions | `dashboard.view`, `reports.view`, `reports.create`, `reports.approve`, `reports.export`, `staff.view`, `staff.create`, `staff.edit`, `departments.view`, `departments.manage`, `patients.view`, `patients.create`, `patients.edit`, `inventory.view`, `equipment.view`, `emergency.view`, `users.view`, `analytics.view`, `logs.view` (17 total) |
| isDefault | true |
| order | 2 |

Can manage staff, departments, view/create/edit patients, generate reports.

### 3. Supervisor

| Field | Value |
|-------|-------|
| nameAr | مشرف |
| name | Supervisor |
| permissions | `dashboard.view`, `reports.view`, `reports.create`, `reports.export`, `staff.view`, `departments.view`, `patients.view`, `inventory.view`, `equipment.view`, `emergency.view`, `analytics.view` (9 total) |
| isDefault | true |
| order | 3 |

Oversees shifts, creates limited reports, views staff and patient data.

### 4. Staff

| Field | Value |
|-------|-------|
| nameAr | موظف |
| name | Staff |
| permissions | `dashboard.view`, `patients.view`, `inventory.view`, `equipment.view` (4 total) |
| isDefault | true |
| order | 4 |

Basic access - view dashboard, patients, inventory, equipment.

---

## Managing Roles (Admin UI)

Navigate to **Settings → Roles & Permissions** (`/admin/roles`).

### View All Roles

Roles table displays:
- Role name (Arabic)
- Description
- Permission count badge
- Active/inactive toggle
- Actions: Edit, Clone, Delete

### Create New Role

1. Click "Add Role" button
2. Fill form:
   - Name (Arabic) - required
   - Name (English) - optional (fallback)
   - Description - optional
3. Select permissions from grouped checkboxes:
   - Dashboard
   - Reports
   - Staff
   - Departments
   - Patients
   - Inventory
   - Equipment
   - Emergency
   - Users
   - Roles
   - Settings
   - Analytics
   - Logs
   - Notifications
4. Click "Create"

Role immediately available for assignment.

### Edit Role

1. Click edit icon on role row
2. Modify name, description, permissions
3. Click "Save"

Changes propagate to all users with that role instantly.

### Clone Role

Duplicate an existing role as template:
1. Click clone icon
2. New role created with " (نسخة)" suffix
3. Edit as needed

### Delete Role

- **Default roles** (isDefault: true) **cannot be deleted**
- Custom roles can be deleted if no users assigned
- If users assigned → must reassign first

### Role Order

Roles sorted by `order` field (ascending). Lower number = higher in list. Default roles have orders 1-4. Custom roles default to 99.

---

## Permission Checks in Code

### Client-Side (React)

```typescript
import { useAuth } from '@/contexts/auth-context'

function SomeComponent() {
  const { can, hasRole } = useAuth()

  // Hide button if user lacks permission
  if (!can('staff.create')) return null

  // OR render alternative UI
  return (
    <Button>
      {can('staff.create') ? 'Add Staff' : 'Request Access'}
    </Button>
  )
}
```

**Tip**: Use the `RequirePermission` wrapper component:

```typescript
import { RequirePermission } from '@/contexts/auth-context'

<RequirePermission permission="roles.manage" fallback={<LockedMessage />}>
  <RolesPage />
</RequirePermission>
```

### Navigation Filtering

Sidebar automatically hides menu items without permission:

```typescript
// config/navigation.ts
export const navigationConfig = [
  {
    title: 'HR Management',
    items: [
      {
        title: 'Employees',
        permission: 'staff.view',  // ← Only shown if user has this permission
        href: '/employees',
      },
    ]
  }
]
```

### Server-Side (Firestore Rules)

Client-side checks are **UX only**. Real security in `firestore.rules`:

```rules
match /roles/{roleId} {
  // All authenticated active users can read (to resolve permissions)
  allow read: if isActive();

  // Only admins can write roles
  allow write: if isAdmin();
}
```

---

## Adding Custom Permissions

### Step 1: Define Permission Key

Edit `lib/services/roles.service.ts`:

```typescript
export const PERMISSION_KEYS = [
  // ... existing keys
  'mynew.feature',  // Add your new key
] as const
```

### Step 2: Add Arabic Label

In same file, add to `PERMISSION_LABELS`:

```typescript
export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  // ...
  'mynew.feature': 'وصول لميزة جديدة',
}
```

### Step 3: Add to Group (UI checkbox grouping)

```typescript
export const PERMISSION_GROUPS: Record<string, PermissionKey[]> = {
  // ...
  'الميزات الجديدة': ['mynew.feature'],  // Arabic group name
}
```

### Step 4: Update Firestore Rules (if needed)

If new permission guards a collection, update `firestore.rules` with appropriate checks.

### Step 5: Use in Component

```typescript
if (useAuth().can('mynew.feature')) {
  // Show new feature
}
```

---

## Custom Permissions (Per-User)

While roles are the primary mechanism, **individual users** can be granted extra permissions via `customPermissions` field on the `users` document.

Example use case:
- Admin wants to grant `reports.export` to one nurse without giving full `staff.create`
- Add `'reports.export'` to user's `customPermissions` array
- User now has both role permissions + custom grant

**Note**: Custom permissions editable via Admin API (future) or directly in Firestore Console.

---

## Permission Resolution Algorithm

```typescript
export function resolveUserPermissions(
  roles: RoleRecord[],
  customPermissions: string[]
): string[] {
  // 1. Collect all permissions from active roles
  const fromRoles = roles
    .filter(r => r.isActive)
    .flatMap(r => r.permissions)

  // 2. Combine + dedupe
  return [...new Set([...fromRoles, ...customPermissions])]
}
```

Example:

```typescript
User roles: ['role-1', 'role-2']
Role-1 permissions: ['a', 'b', 'c']
Role-2 permissions: ['b', 'd']
Custom permissions: ['e']

Result: ['a', 'b', 'c', 'd', 'e']  // sorted? no, order preserved as added
```

---

## Testing Permissions

### Manual Testing

1. Assign role to test user
2. Login as that user
3. Verify:
   - Menu items visible/hidden correctly
   - Direct URL access blocked (check Firestore rules)
   - API calls reject if unauthorized

### Rule Simulation

Use Firebase Console → Firestore → Rules → **Rules Playground**:

```javascript
// Test: Can user edit another user?
match /users/{userId} {
  allow update: if isAdmin() ||
    (isActive() && request.auth.uid == userId &&
     !('roles' in request.resource.data.diff(resource.data).affectedKeys()));
}
```

---

## Auditing Permissions

### View User Permissions

Admin can inspect a user's effective permissions:

1. Go to Users page
2. Click user row
3. Modal shows:
   - Assigned roles (with permission lists expandable)
   - Custom permissions
   - Effective permission list (computed)

### Permission Change Audit

All role updates and user-role assignments logged to `loginLogs`? Not yet. Future: add audit trail for permission changes.

---

## Best Practices

1. **Principle of Least Privilege** - Grant minimum necessary permissions
2. **Use Roles, Not Custom Permissions** - Roles are manageable; custom perms are for exceptions
3. **Never Modify Default Roles** - Clone instead, then assign clone to users
4. **Test New Roles Thoroughly** - Create test user, verify access levels
5. **Document Custom Permissions** - Any permission key added should be documented here

---

## Troubleshooting

### "User can't access page they should"

1. Check user's `roles` array in Firestore Console → `users/{userId}`
2. For each role ID, look up role document in `roles` collection
3. Verify the role has required permission key
4. Check `customPermissions` array for direct grant
5. Verify Firestore rules don't block (check browser console for security errors)

### "Permission check returns false even though role has it"

- Did you add permission key to `PERMISSION_KEYS`? Must be in the const array for TypeScript and permission resolution to recognize it.
- Did you restart dev server after adding new key? TypeScript needs recompilation.
- Is the role `isActive: true`? Inactive roles ignored during permission resolution.

### "Can I have hierarchical roles?"

Not currently. Role permissions are flat union of all assigned roles. To simulate hierarchy, create roles with included permissions and assign multiple roles.

Example: "Nurse Shift Lead" = "Staff" + "Supervisor" partial permissions → create custom role with combined set.

---

## Future Enhancements

- [ ] **Permission groups** - assign group of permissions as unit
- [ ] **Time-based permissions** - temporary elevation (e.g. vacation coverage)
- [ ] **Department-scoped permissions** - same role, different data visibility per department
- [ ] **Approval workflows** - request elevated permissions, manager approves
- [ ] **Permission templates** - copy from existing role quickly

---

## Related Documentation

- `ARCHITECTURE.md` - System design and data flow
- `AUTH_FLOW.md` - Authentication mechanics
- `README.md` - Getting started
