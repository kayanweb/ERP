# Authentication Flow Documentation

## Overview

PRO Nurse uses **Firebase Authentication** combined with a custom **Employee Code** system and Firestore for user profiles. There are three login methods:

1. **Employee Code + Password** (primary, for staff)
2. **Google OAuth** (for guests/visitors, requires admin approval)
3. **Future**: Email/Password (optional)

All authentication data flows through Firebase Auth, while profile/role data lives in Firestore.

---

## Data Model

### Firebase Auth User

Firebase automatically creates a user record in `firebase.auth.User`:

```typescript
{
  uid: string              // Unique Firebase UID
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  providerData: [...]      // Google, email, etc.
}
```

### Firestore User Profile

We maintain a parallel `users` collection in Firestore with our domain data:

```typescript
interface UserRecord {
  id: string               // Matches Firebase Auth UID (or manual ID for employee code users)
  uid?: string             // Firebase UID if available
  employeeCode: string     // Unique employee identifier (e.g. EMP001)
  name: string             # English name
  nameAr: string           # Arabic name (primary display)
  email: string
  roles: string[]          # Array of role document IDs from 'roles' collection
  departments: string[]    # Array of department IDs
  customPermissions: string[] # Extra one-off permissions
  mustChangePassword: boolean # True for first login
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string        # ISO timestamp
  updatedAt: string
  lastLogin?: string
  photoURL?: string
}
```

### Employee Credentials

Separate collection `employeeCredentials` stores password hashes:

```typescript
interface EmployeeCredentials {
  employeeId: string       // Matches user.id
  password: string        # Bcrypt hash ($2b$10$...)
  mustChange: boolean     # Deprecated - use user.mustChangePassword
}
```

---

## Employee Code Login Flow

### Diagram

```
┌─────────────┐
│ Login Page  │
│ (EMP001 +   │
│  password)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ AuthContext.loginWithEmployeeCode(employeeId, password)    │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┴──────────────────────┐
        │ 1. Load roles (seed if empty)                │
        │ 2. Query Firestore: users where employeeCode │
        └─────────────────────┬──────────────────────┘
                              │
                ┌─────────────▼─────────────┐
                │ User found?                │
                └───────┬────────────┬───────┘
                        │ NO        │ YES
                        ▼           ▼
               ┌──────────────┐  ┌─────────────────────────┐
               │ Return       │  │ Fetch credentials from  │
               │ "user not    │  │ employeeCredentials col │
               │ found"       │  └─────────┬───────────────┘
               └──────────────┘            │
                            │             ▼
                            │    ┌─────────────────────┐
                            │    │ Credentials exist?  │
                            │    └───────┬─────────────┘
                            │            │ NO
                            │            ▼
                            │    ┌─────────────────────────┐
                            │    │ No credentials → default │
                            │    │ password = employeeCode  │
                            │    │ (mustChange = true)      │
                            │    └──────────┬──────────────┘
                            │               │
                            │    ┌──────────▼──────────────┐
                            │    │ Verify password:         │
                            │    │ - If storedPwd starts    │
                            │    │   with '$2' → bcrypt     │
                            │    │ - Else → direct compare  │
                            │    │   (legacy plaintext)     │
                            │    └──────────┬──────────────┘
                            │               │
                            │    ┌──────────▼──────────────┐
                            │    │ Password match?          │
                            │    └───────┬────────────┬─────┘
                            │            │ NO         │ YES
                            │            ▼            ▼
                            │    ┌──────────────┐  ┌────────────────────┐
                            │    │ Log failed   │  │ Log success        │
                            │    │ attempt      │  │ to loginLogs       │
                            │    │ Return error │  └────────┬───────────┘
                            │    └──────────────┘           │
                            │                               ▼
                            │                    ┌──────────────────────┐
                            │                    │ Build AppUser object │
                            │                    │ - Resolve roles      │
                            │                    │ - Calculate perms    │
                            │                    └──────────┬───────────┘
                            │                               │
                            │                    ┌──────────▼───────────┐
                            │                    │ setUser(appUser)     │
                            │                    └──────────┬───────────┘
                            │                               │
                            │                    ┌──────────▼──────────────┐
                            │                    │ mustChangePassword?     │
                            │                    └───────┬────────────┬────┘
                            │                           │ YES         │ NO
                            │                           ▼             ▼
                            │                 ┌────────────────┐  ┌────────┐
                            │                 │ Redirect to    │  │ To     │
                            │                 │ /change-password│ │ dashboard│
                            │                 └────────────────┘  └────────┘
```

### First Login (No Credentials Record)

- User looks up by `employeeCode` → finds `UserRecord`
- `getEmployeeCredentials(userId)` returns `null`
- Default password = `employeeCode` (e.g. `EMP001`)
- `mustChange = true` (no credentials → first login)
- After successful password match:
  - Call `setEmployeeCredentials(userId, password, true)` to create credentials
  - User redirected to `/change-password`
  - On password change → `mustChange = false` saved

### Legacy Password Migration

When a user has an `employeeCredentials` record with a **plain-text** password (old system), the system:

1. Checks if `password.startsWith('$2')` → bcrypt hash → use `bcrypt.compare()`
2. If not a bcrypt hash → direct string comparison (legacy)
3. On successful login with legacy password → re-hash and save with bcrypt via `setEmployeeCredentials()`

This migrates users transparently on first login after deployment.

---

## Google OAuth Login Flow

### Diagram

```
┌─────────────┐
│ Login Page  │
│ "Sign in    │
│  with Google"│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ AuthContext.loginWithGoogle()                               │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┴──────────────────────┐
        │ Is Firebase configured?                     │
        └───────┬────────────┬───────────────────────┘
                │ NO        │ YES
                ▼           ▼
      ┌──────────────┐  ┌──────────────────────────────┐
      │ Throw error  │  │ signInWithPopup(Google)      │
      │ "Firebase    │  └────────────┬─────────────────┘
      │  not setup"  │               │
      └──────────────┘               ▼
                       ┌─────────────────────────────┐
                       │ Firebase Auth user created │
                       └────────────┬────────────────┘
                                    │
                        ┌───────────▼──────────────┐
                        │ Check Firestore 'users'  │
                        │ collection for uid       │
                        └───────┬────────────┬─────┘
                                │ NOT FOUND  │ FOUND
                                ▼            ▼
                      ┌────────────────┐  ┌──────────────┐
                      │ Check pending  │  │ User active? │
                      │ Users by uid   │  └──────┬───────┘
                      └───────┬────────┘         │ YES
                              │ FOUND            ▼
                              ▼          ┌──────────────┐
                      ┌────────────────┐  │ Set user     │
                      │ pending.status?│  │ Redirect to  │
                      └───────┬────────┘  │ dashboard    │
                              │            └──────────────┘
                    ┌─────────┼─────────┐
                    │ PENDING │ REJECTED │
                    ▼         ▼         ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │ Set      │  │ Sign out │  │ (already │
            │ pending  │  │ + throw  │  │ handled) │
            │ entry    │  │ error    │  │          │
            │ Redirect │  └──────────┘  └──────────┘
            │ to /     │
            │pending-  │
            │approval  │
            └──────────┘
```

### Pending Approval (Google Sign-Up)

1. User signs in with Google → Firebase Auth creates user
2. No `users` record found → check `pendingUsers` collection
3. If `pending` → set `pendingEntry` in AuthContext → redirect to `/pending-approval`
4. PendingApprovalPage polls every 10s:
   - Fetch pending record by user ID
   - If `approved` and `role` set → admin created `users` record → redirect to dashboard
   - If `rejected` → sign out with error message
   - Else keep waiting

### Admin Approval

Admin visits `/admin/users` → "Pending" tab:
- Sees list of pending Google sign-up requests
- Selects role + department
- Clicks "Approve" → `approveUser()` service called:
  1. Updates `pendingUsers/{id}`: status = 'approved', role, department, reviewedAt, reviewedBy
  2. Creates `users/{id}` document with full profile
  3. `mustChangePassword = false` (Google accounts don't need first-login password change)
- Pending user auto-redirects on next poll (within 10s)

---

## First-Login Password Change Flow

### Trigger

User's `mustChangePassword` flag is `true`:
- New employee created by admin (default password = employeeCode)
- Legacy user logging in for first time after migration
- (Not applicable for Google sign-up - password never set)

### Flow

```
User logs in → mustChangePassword = true
    ↓
Redirect to /change-password
    ↓
ChangePasswordPage component mounts
    ↓
useEffect checks: if user && !mustChangePassword → redirect to dashboard
    ↓
User sees form:
  - Current password (default: employeeCode)
  - New password (min 6 chars)
  - Confirm new password
    ↓
Form submit:
  1. Validate new password length ≥ 6
  2. Validate new === confirm
  3. Validate current password matches stored (or employeeCode fallback)
    ↓
Call changePassword(employeeId, newPassword)
    ↓
AuthContext.changePassword():
  1. setEmployeeCredentials(employeeId, newPassword, false)
     → bcrypt.hash(newPassword, 10) → saved to employeeCredentials
  2. Update UserRecord: mustChangePassword = false
  3. setUser(prev => { ...prev, mustChangePassword: false })
    ↓
Redirect to /dashboard
```

### Password Validation

**No** password complexity requirements beyond 6 characters. Rationale: hospital staff need memorable passwords. Recommendations:
- Encourage mixing letters/numbers
- Warn against using employeeCode as permanent password
- Future: add configurable password policy in settings

---

## Session Management

### Auth State Persistence

Firebase Auth automatically persists session in:
- `localStorage` (browser) for web
- `IndexedDB` for multi-tab support
- Native storage for mobile web

On page load, `AuthProvider` runs:

```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
    if (fbUser) {
      const record = await getUserById(fbUser.uid)
      // ... load user, set state
    } else {
      setUser(null)
    }
  })
  return () => unsubscribe()
}, [])
```

This restores session across page refreshes automatically.

### Logout

```typescript
const logout = () => {
  setUser(null)
  setPendingEntry(null)
  signOut(getFirebaseAuth())  // Clears Firebase Auth session
  router.push('/login')
}
```

Clears React state AND Firebase Auth.

---

## Password Security

### Bcrypt Hashing

- **Salt rounds**: 10 (balance of security vs performance)
- **Hash format**: `$2b$10$<22 char salt><31 char hash>` → 60 chars total
- **Storage**: `employeeCredentials.password` field stores hash only

### Verification Flow

```typescript
const creds = await getEmployeeCredentials(userId)
if (creds.password.startsWith('$2')) {
  // Hashed → use bcrypt.compare()
  valid = await bcrypt.compare(inputPassword, creds.password)
} else {
  // Legacy plaintext → direct compare, then rehash
  valid = inputPassword === creds.password
  if (valid) {
    await setEmployeeCredentials(userId, inputPassword, mustChange) // rehash
  }
}
```

### Migration Strategy

Existing plaintext passwords (from legacy localStorage) will be:
1. Detected on user's next login (hash doesn't start with `$2`)
2. Compared directly (still works)
3. Re-hashed and saved immediately
4. Subsequent logins use bcrypt

**Never** store plaintext passwords in Firestore. The migration path ensures old passwords become secure on first use.

---

## Permission System

### Role-Based + Attribute-Based

Permissions come from two sources:

1. **Roles**: User has array of role IDs → all permissions from those roles
2. **Custom permissions**: Direct per-user permission keys (rare, for exceptions)

Final permissions = `flatMap(role.permissions).concat(customPermissions).dedupe()`

### Permission Check in Code

```typescript
const { can, hasRole } = useAuth()

// Check permission
if (can('users.edit')) {
  // Show edit button
}

// Check role
if (hasRole('admin')) {
  // Admin-only section
}
```

Client-side checks are **convenience only**. All security enforced server-side via Firestore rules.

### Permission Resolution Caching

Roles are fetched on first login and cached in `AuthProvider`:

```typescript
const rolesCache = useRef<RoleRecord[]>([])
const loadRoles = async () => {
  if (rolesCache.current.length === 0) {
    await seedDefaultRoles()  // Only if collection empty
    rolesCache.current = await getAllRoles()
  }
  return rolesCache.current
}
```

Cached for app lifetime; cleared on full page reload.

---

## Security Rules Mapping

Firestore rules (`firestore.rules`) mirror the permission model:

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| `users` | Self OR admin/head_nurse | Admin only | Self (limited) OR admin | Admin only |
| `employeeCredentials` | Self only | Admin only | Admin only | Admin only |
| `roles` | Any active user | Admin only | Admin only | Admin only |
| `departments` | Any active user | Admin only | Admin only | Admin only |
| `settings` | Any active user | Admin only | Admin only | Admin only |
| `pendingUsers` | Self OR admin/head_nurse | Self only | Admin only | Admin only |
| `loginLogs` | Create: any user | Read: admin only | Denied | Admin only |

---

## Error Handling

### Login Errors

```typescript
{
  success: boolean,
  mustChangePassword?: boolean,
  error?: string  // Arabic error message for user
}
```

Possible errors:
- `'كود الموظف غير موجود'` - Employee code not found
- `'كلمة المرور غير صحيحة'` - Wrong password
- `'تم رفض طلبك من قِبَل المدير'` - Google sign-up rejected
- `'Firebase is not configured'` - Missing env vars

### Auth State Restoration Failures

If `getUserById(uid)` returns null but Firebase Auth user exists:
- Likely the user was deleted from Firestore
- AuthProvider signs user out automatically
- Redirects to `/login`

---

## Session Timeouts

No explicit session timeout. Firebase Auth token auto-refreshes. Inactive users remain logged in until:
- They manually logout
- Firebase Auth token revocation (by admin via Firebase Console)
- Browser storage cleared

---

## Multi-Tab & Concurrent Sessions

Firebase Auth handles multi-tab synchronization automatically. State updates broadcast via `onAuthStateChanged` listener in each tab.

---

## Future Enhancements

- [ ] **Two-Factor Authentication (2FA)** via Firebase Auth (TBD)
- [ ] **SMS OTP** for password reset (Firebase Phone Auth)
- [ ] **Single Sign-On (SSO)** via SAML/OIDC (Firebase supports)
- [ ] **Session management UI** - view active devices, revoke sessions
- [ ] **Password reset flow** - email-based reset via Firebase Auth
- [ ] **Remember device** - skip 2FA on trusted devices

---

## Troubleshooting

### "Must change password" loop
- User changes password, but `mustChangePassword` flag not updating Firestore
- Check: Is `setEmployeeCredentials()` and `updateUserProfile()` both succeeding?
- Check: Firestore rules allow user self-update of `mustChangePassword`

### Google login stuck on pending approval
- Admin didn't approve? Check `pendingUsers` collection
- Admin approved but no `users` record? Check approveUser() service logic
- Check browser console for Firebase Auth errors

### Employee code login fails after migration
- bcrypt not installed? `npm install bcryptjs`
- Check credentials collection has `password` field as hash
- Verify hashing algorithm version ($2a$, $2b$, etc.)

### User can't access page they should
- Check role permissions in Firestore `roles` collection
- Verify user's `roles` array has correct role IDs
- Check `customPermissions` array for direct grants
- Verify sidebar uses same `can()` function

---

## Related Documentation

- `README.md` - User guide
- `ROLES_PERMISSIONS.md` - Role management
- `ARCHITECTURE.md` - System design
- `firestore.rules` - Security rules reference
