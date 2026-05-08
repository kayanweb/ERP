# Architecture Documentation

## System Overview

PRO Nurse follows a **clean, layered architecture** with strict separation of concerns. The system is designed to be **backend-agnostic** - currently using Firebase Firestore, but easily swappable to any other backend.

---

## Core Principles

1. **Single Source of Truth** - All persistent data lives in Firestore only. No localStorage for user data.
2. **Dependency Inversion** - UI depends on interfaces (contracts), not concrete implementations.
3. **Repository Pattern** - All data access isolated in repository classes.
4. **Service Layer** - Business logic separated from data access and UI.
5. **Provider Pattern** - React Contexts for global state (auth, language, notifications).

---

## Directory Structure

```
pronurse/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Protected dashboard pages (middleware)
│   │   ├── admin/              # Admin section
│   │   │   ├── users/          # User management & pending approvals
│   │   │   ├── roles/          # Roles & permissions matrix
│   │   │   └── settings/       # System settings (hospital, notifications, security, departments)
│   │   ├── dashboard/          # Main dashboard (role-based)
│   │   └── layout.tsx          # Dashboard shell with sidebar
│   ├── login/                  # Auth: employee code + Google sign-in
│   ├── change-password/        # First-login mandatory password change
│   ├── pending-approval/       # Google sign-up approval wait screen
│   ├── layout.tsx              # Root layout (providers)
│   └── page.tsx                # Home redirect
├── components/
│   ├── layout/                 # Dashboard layout components
│   │   ├── dashboard-layout.tsx
│   │   ├── app-sidebar.tsx     # Permission-filtered navigation
│   │   └── topbar.tsx          # Top navigation bar
│   └── ui/                     # shadcn/ui components (buttons, cards, tables...)
├── contexts/
│   ├── auth-context.tsx        # Authentication provider (WHO is logged in)
│   ├── lang-context.tsx        # Language provider (ar/en)
│   └── notification-context.tsx # Notifications (Firebase RTDB-ready)
├── lib/
│   ├── firebase.ts             # Firebase initialization singleton
│   ├── repositories/           # Data Access Layer (DAL)
│   │   ├── contracts.ts        # All TypeScript interfaces (the contract)
│   │   ├── index.ts            # Repository registry (factory functions)
│   │   └── firestore/          # Firestore implementations
│   │       ├── users.repository.ts
│   │       ├── employee-credentials.repository.ts
│   │       ├── roles.repository.ts
│   │       ├── departments.repository.ts
│   │       ├── settings.repository.ts
│   │       ├── pending-users.repository.ts
│   │       └── login-log.repository.ts
│   └── services/               # Business Logic Layer
│       ├── auth.service.ts     # Login attempt logging
│       ├── users.service.ts    # User CRUD, credentials, approvals
│       ├── roles.service.ts    # Role CRUD, permission resolution
│       ├── departments.service.ts # Department CRUD
│       ├── settings.service.ts # Settings get/save
│       └── pending-users.service.ts # Pending user management
├── config/
│   └── navigation.ts           # Menu config with permission keys
├── types/
│   └── index.ts                # Shared type definitions
├── firestore.rules             # Firestore security rules (deploy to Firebase)
├── .env.example                # Environment variables template
├── README.md                   # User-facing documentation
├── ARCHITECTURE.md             # This file
├── AUTH_FLOW.md                # Authentication flow details
├── ROLES_PERMISSIONS.md        # Roles & permissions guide
└── package.json
```

---

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
│  (Next.js Pages + React Components)                         │
│  → Call hooks (useAuth, useLang, useNotifications)           │
│  → Call service methods                                     │
└─────────────────────────────┬───────────────────────────────┘
                              │ calls
┌─────────────────────────────▼───────────────────────────────┐
│                    Service Layer                             │
│  (lib/services/*.service.ts)                                │
│  → Business logic (validation, transformations)             │
│  → Orchestrates multiple repositories                       │
│  → No Firebase imports                                      │
└─────────────────────────────┬───────────────────────────────┘
                              │ calls
┌─────────────────────────────▼───────────────────────────────┐
│                 Repository Layer                             │
│  (lib/repositories/*.repository.ts)                         │
│  → Pure data access (CRUD)                                  │
│  → Implements interfaces from contracts.ts                  │
│  → Firebase SDK imports HERE ONLY                           │
└─────────────────────────────┬───────────────────────────────┘
                              │ reads/writes
┌─────────────────────────────▼───────────────────────────────┐
│                    Firebase Firestore                        │
│  Database (users, roles, departments, settings, ...)        │
└─────────────────────────────────────────────────────────────┘
```

### Why This Matters

- **Testability**: Services can be unit-tested by mocking repositories.
- **Swappability**: Replace Firestore with Supabase/PostgreSQL by implementing the same interfaces.
- **Maintainability**: Business logic centralized, not scattered across components.
- **Security**: All data access goes through one choke point (repositories).

---

## Data Flow Examples

### Login Flow

```
1. User submits employee code + password (LoginPage)
   ↓
2. AuthContext.loginWithEmployeeCode()
   ↓
3. usersService.getUserByEmployeeCode(employeeCode)
   → userRepo.getByEmployeeCode()
   → Firestore query: users collection where employeeCode == ?
   ↓
4. If user found:
   → credentialsRepo.get(userId)
   → Firestore get: employeeCredentials/{userId}
   ↓
5. Bcrypt.compare(password, storedHash)
   ↓
6. If mustChangePassword flag is true:
   → router.push('/change-password')
   ↓
7. Else:
   → buildAppUser() (resolve permissions from roles)
   → setUser(appUser) (React state)
   → router.push('/dashboard')
```

### Google Sign-Up Pending Approval Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Firebase Google OAuth popup
   ↓
3. AuthContext.loginWithGoogle()
   ↓
4. Check if user exists in Firestore 'users'
   ↓
5. If not exists:
   → pendingUserRepo.upsert({ id: uid, name, email, photoURL })
   → Firestore set: pendingUsers/{uid}
   ↓
6. setPendingEntry(entry)
   → router.push('/pending-approval')
   ↓
7. PendingApprovalPage polls every 10s:
   → pendingUsersService.getPendingUserById(uid)
   ↓
8. Admin approves via UsersPage (admin):
   → usersService.approveUser(pendingId, roleId, department)
   → Creates user in 'users' collection
   → Updates pendingUsers status = 'approved'
   ↓
9. PendingApprovalPage detects status change:
   → getUserById(uid) confirms user exists
   → router.push('/dashboard')
```

### Permission Resolution

```
UserRecord.roles: ['role-id-1', 'role-id-2']
UserRecord.customPermissions: ['special.feature']

Step 1: Fetch all RoleRecords from Firestore where id in ['role-id-1', 'role-id-2']
Step 2: For each active role, collect role.permissions array
Step 3: Union all permissions from roles
Step 4: Add customPermissions
Step 5: Deduplicate → final permissions: string[]

Example:
  Role A has: ['dashboard.view', 'staff.view']
  Role B has: ['dashboard.view', 'reports.view']
  Custom: ['analytics.view']

  Result: ['dashboard.view', 'staff.view', 'reports.view', 'analytics.view']
```

---

## Repository Pattern

### Contracts (Interfaces)

File: `lib/repositories/contracts.ts`

Defines all data shapes and repository interfaces:

```typescript
export interface IUserRepository {
  getAll(): Promise<UserRecord[]>
  getById(id: string): Promise<UserRecord | undefined>
  getByEmployeeCode(code: string): Promise<UserRecord | undefined>
  create(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRecord>
  update(id: string, updates: Partial<UserRecord>): Promise<UserRecord | undefined>
  delete(id: string): Promise<void>
}
```

### Registry (Factory Functions)

File: `lib/repositories/index.ts`

Exports singleton factory functions:

```typescript
let _users: FirestoreUserRepository | null = null
export const userRepo = () => (_users ??= new FirestoreUserRepository())
```

This lazy-loaded singleton pattern ensures only one instance per collection.

### Firestore Implementations

Each repository implements its interface using Firestore SDK:

```typescript
export class FirestoreUserRepository implements IUserRepository {
  async getByEmployeeCode(code: string): Promise<UserRecord | undefined> {
    const q = query(collection(getFirestoreDb(), COL), where('employeeCode', '==', code))
    const snap = await getDocs(q)
    // ... return first match
  }
}
```

---

## Service Layer

Services contain **business logic**. They:
- Call multiple repositories
- Perform validation
- Transform data
- Coordinate workflows

Example: `usersService.approveUser()`:

```typescript
export async function approveUser(
  pendingId: string,
  role: string,
  department: string,
  reviewedBy: string
): Promise<UserRecord | undefined> {
  // 1. Fetch pending user
  const pending = await pendingUserRepo().getById(pendingId)
  if (!pending) return undefined

  // 2. Update pending record to 'approved'
  await pendingUserRepo().update(pendingId, { status: 'approved', role, department, ... })

  // 3. Create full user record in 'users' collection
  const user = await userRepo().create({
    id: pending.id,
    uid: pending.id,
    name: pending.name,
    roles: [role],
    departments: [department],
    mustChangePassword: false,
    status: 'active',
    ...
  })

  // 4. Return created user
  return user
}
```

---

## Security Rules

Firestore security rules in `firestore.rules` enforce:

- **Authentication required** for all writes/reads (except public collections)
- **Row-level security**: Users can only update their own profile (not roles/status)
- **Admin-only**: Roles, departments, settings management
- **Immutable logs**: loginLogs can't be updated or deleted by anyone

Rules are **server-side** final authority; client-side `can()` checks are UX-only.

---

## State Management

### Global State (Contexts)

| Context | Provides | Persistence |
|---------|----------|-------------|
| `AuthContext` | `user`, `pendingEntry`, `login()`, `can()`, `hasRole()` | None (ephemeral session) |
| `LangContext` | `lang`, `toggleLang()`, `t()` | `localStorage.pronurse-lang` (UI only) |
| `NotificationContext` | `notifications`, `addNotification()`, `onlineUsers` | None (Firebase RTDB ready) |

### Local State

Components use `useState` for form fields, modals, loading flags.

No Redux, no Zustand - pure React Context + useState.

---

## Firebase Integration

### Initialization

`lib/firebase.ts` uses lazy singleton pattern:

```typescript
let app: FirebaseApp | undefined
export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}
```

All repository files import `getFirestoreDb()` - ensures Firebase initialized once.

### Environment Variables

All `NEXT_PUBLIC_` prefix variables are exposed to client bundle (required for Firebase client SDK). Admin SDK uses service account file path (server-side only, not implemented in this frontend-only app).

---

## Routes & Protection

### Public Routes

- `/login` - Unauthenticated only (redirects if logged in)
- `/change-password` - Only accessible when `mustChangePassword=true`
- `/pending-approval` - Only for pending Google sign-up users

### Protected Routes

All routes under `/(dashboard)/` are protected by `DashboardLayout`:

```typescript
// components/layout/dashboard-layout.tsx
if (!user && !isLoading) router.push('/login')
```

Sidebar navigation is filtered by permissions via `can(permission)` check.

---

## Data Model

### User Document (users collection)

```typescript
{
  id: string              // Firebase Auth UID or manual ID
  uid?: string            // Firebase Auth UID (if using Firebase Auth)
  employeeCode: string    // Unique employee identifier (e.g. EMP001)
  name: string            // English name
  nameAr: string          # Arabic name
  email: string           # Contact email
  roles: string[]         # Array of role document IDs
  departments: string[]   # Array of department IDs
  customPermissions: string[] # Extra per-user permissions
  mustChangePassword: boolean
  status: 'active' | 'inactive' | 'suspended'
  createdAt: ISO string
  updatedAt: ISO string
  lastLogin?: ISO string
  photoURL?: string       # From Google OAuth
}
```

### EmployeeCredentials Document (employeeCredentials collection)

```typescript
{
  employeeId: string      // Matches user.id
  password: string        # Bcrypt hash ($2a$10$...)
  mustChange: boolean    # Legacy flag, also in user.mustChangePassword
}
```

### Role Document (roles collection)

```typescript
{
  id: string
  name: string            # English name (for fallback)
  nameAr: string          # Arabic name (primary)
  description?: string
  permissions: string[]   # Array of permission keys
  isActive: boolean
  isDefault: boolean     # System-assigned, cannot delete
  createdAt: ISO string
  updatedAt: ISO string
  order: number          # Sort order in UI
}
```

### Department Document (departments collection)

```typescript
{
  id: string
  name: string            # English name
  nameAr: string          # Arabic name (primary)
  code: string            # Short code (e.g. ICU, ER)
  parentId?: string      # For sub-department hierarchy
  isActive: boolean
  createdAt: ISO string
  updatedAt: ISO string
}
```

### Settings Document (settings collection)

```typescript
{
  id: 'global'            # Fixed ID
  hospitalName: string
  hospitalNameEn: string
  contactEmail: string
  contactPhone: string
  address: string
  language: 'ar' | 'en'
  timezone: string        # IANA timezone (Asia/Riyadh)
  notificationsEnabled: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  maintenanceMode: boolean
  updatedAt: ISO string
}
```

---

## Performance Considerations

1. **Lazy Loading**: Repositories are singletons created on first use
2. **Caching**: Role data cached in `AuthProvider` `rolesCache` ref
3. **Query Optimization**: Indexes on `employeeCode` field (create in Firestore console)
4. **Minimal Re-renders**: `useCallback` wrappers on auth functions
5. **SSR/SSG**: Minimal use of server-side rendering (dashboard is fully client-side)

---

## Extensibility Points

### Adding a New Permission

1. Add key to `PERMISSION_KEYS` in `lib/services/roles.service.ts`
2. Add Arabic label to `PERMISSION_LABELS`
3. Add to a group in `PERMISSION_GROUPS`
4. Update Firestore rules if needed (`firestore.rules`)
5. Use in component: `useAuth().can('new.permission')`

### Adding a New User Collection

1. Define interface in `contracts.ts`
2. Add `IXXXRepository` interface
3. Create `firestore/xxx.repository.ts` implementing interface
4. Register factory in `repositories/index.ts`
5. Create service `lib/services/xxx.service.ts` (optional)
6. Use in components via service or repository directly

### Switching from Firestore to Another Backend

1. Create `lib/repositories/postgres/` (or `supabase/`)
2. Implement all interfaces from `contracts.ts`
3. Update `lib/repositories/index.ts` to export new implementations
4. **No changes needed to services or components**

---

## Deployment Checklist

- [ ] `.env.local` configured with real Firebase credentials
- [ ] `firebase.rules` deployed to Firestore
- [ ] Default roles seeded (automatic on first admin login)
- [ ] Default departments seeded (automatic on Settings page load)
- [ ] Settings configured (hospital name, language)
- [ ] Admin user exists (create via Firebase Console → Authentication if needed)
- [ ] Vercel environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic on Vercel)

---

## Monitoring & Logs

- **Firebase Console** → Firestore → Usage: monitor read/write operations
- **Firebase Console** → Authentication → Users: active user count
- **Login logs**: stored in `loginLogs` collection (readable by admins in future UI)
- **Error tracking**: Recommend integrating Sentry or LogRocket for production

---

## Known Limitations & Future Work

1. **Notifications**: Real-time Firebase Realtime Database integration not yet implemented (mock data currently). Planned: RTDB listeners on `notifications/{userId}` collection.
2. **File Uploads**: Firebase Storage configured but unused. Planned: profile photos, document attachments.
3. **Offline Mode**: Firestore offline persistence not enabled. Could be added.
4. **PWA**: No service worker yet. Could add Next.js PWA plugin.
5. **Server Actions**: All auth is client-side; could move to server actions for better security.
6. **Email Templates**: Firebase Auth emails are default. Custom email templates not configured.
7. **Multi-hospital**: Single-tenant only. Multi-tenant could be added via `tenantId` field.

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| **Client-side auth** (not server actions) | Firebase Auth SDK requires client; simpler flow |
| **Firestore over Realtime DB** | Better querying, structured data, scalable |
| **Repository pattern** | Future backend swap capability |
| **bcryptjs** (not Firebase Auth hashing) | EmployeeCode auth is custom; needs separate password store |
| **No localStorage for user data** | Security - prevents XSS credential theft |
| **Arabic-first UI** | Target user base (Saudi hospitals) |
| **Permission keys as strings** | Human-readable, easy to check in code |
| **Roles as documents** (not enum) | Admin-configurable without code deploy |

---

## Contact

For architecture questions, see code comments or contact the core maintainers.
