# Employee Login System Documentation

## Overview

PRO Nurse supports two primary authentication methods for employees:

1. **Employee Code + Password** — Default method for hospital staff
2. **Google OAuth** — For guests, contractors, or admins preferring Google

This document details the Employee Code login system, including first-login password policy, credential storage, and security model.

---

## Employee Code Format

- Format: `EMP` + 4-digit zero-padded number, e.g. `EMP0001`, `EMP0002`
- Auto-generated sequentially based on existing employee count
- Unique across system (enforced by Firestore `employeeCode` field)
- Stored in `UserRecord.employeeCode`

### Generation Algorithm

```typescript
function generateEmployeeCode(): string {
  const users = await getAllUsers()
  const codes = users
    .map(u => u.employeeCode)
    .filter(Boolean)
    .map(c => parseInt(c.replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n))
  const max = codes.length > 0 ? Math.max(...codes) : 1000
  return `EMP${(max + 1).toString().padStart(4, '0')}`
}
```

First code after empty database: `EMP1001` (starts from 1001). After that increments: `EMP1002`, `EMP1003`, ...

### Assignment

- Automatically generated when admin creates a new user manually
- Can be overridden by admin if needed (not recommended)
- Used as default password on first login

---

## Password Policy

### Requirements

- **Minimum length**: 6 characters
- **First-login mandatory change**: `mustChangePassword` flag forces password change on first session
- **No reuse of employee code**: After first change, employee code cannot be used as password (enforced by login flow)
- **No complexity requirements**: Simpler for clinical staff; security relies on length and hashing

### Storage

Passwords are **never** stored in plain text. They are hashed using **bcrypt** with 10 salt rounds.

**Collection**: `employeeCredentials`

```typescript
interface EmployeeCredentials {
  employeeId: string   // Matches user.id
  password: string    // bcrypt hash, e.g. "$2b$10$..."
  mustChange: boolean // Deprecated; use UserRecord.mustChangePassword
}
```

### Verification Flow

1. User enters employee code + password
2. System fetches user by employeeCode from `users` collection
3. If user exists:
   - Fetch credentials from `employeeCredentials` by user ID
   - If credentials exist:
     - If password starts with `$2` (bcrypt) → `bcrypt.compare()`
     - Else (legacy plaintext) → direct string compare, then **migrate** by rehashing
   - If credentials missing (no record):
     - Treat as first login: password must equal `employeeCode` (uppercase)
     - On success, create credentials record with bcrypt hash of provided password
4. If password matches:
   - Set `mustChangePassword` based on credentials flag or absence of credentials
   - If `mustChangePassword` is true → redirect to `/change-password`
   - Else → complete login, redirect to dashboard

### Legacy Migration

Existing systems with plaintext passwords will:
- Detect non-bcrypt hash (doesn't start with `$2`)
- Allow login with plaintext comparison
- Immediately rehash and save the password via `setEmployeeCredentials()`

This happens transparently on user's first login after deployment, with no user action required.

---

## First-Login Password Change

### Trigger

`UserRecord.mustChangePassword === true`

Set automatically when:
- New user created by admin (no `employeeCredentials` record initially)
- Legacy user logging in for first time (credentials created with `mustChange = true`)

### Process

1. After successful employee code login, `AuthProvider` checks `mustChangePassword`
2. If true, automatically redirects to `/change-password`
3. User must:
   - Enter current password (default = employee code)
   - Enter new password (min 6 chars)
   - Confirm new password
4. On submit:
   - `changePassword(employeeId, newPassword)` called
   - Hash new password via bcrypt → stored in `employeeCredentials`
   - Update `UserRecord.mustChangePassword = false`
   - Clear React state
   - Redirect to `/dashboard`

### Security Notes

- Current password not verified server-side in this demo (light check only)
- In production, current password should be verified via bcrypt before allowing change
- Password change logs a login attempt? Not yet. Future: add audit entry

---

## Credential Management

### Admin Reset

Admin can reset a user's password from the User Management UI (future feature):

1. Admin clicks "Reset Password" on user row
2. System generates random temporary password OR sets to employeeCode
3. `setEmployeeCredentials(userId, newPassword, true)` → hashes and sets `mustChange` flag
4. User forced to change on next login

### Self-Service Password Change

Users can change password anytime from Settings page (future: not yet implemented).

---

## Google OAuth Integration

### For Employees

Employees may also use Google sign-in if preferred:

1. Click "Sign in with Google"
2. Google popup authenticates via Firebase Auth
3. On return:
   - If `users` record exists and active → logged in normally
   - If no `users` record → creates `pendingUsers` entry
4. Admin must approve first-time Google users
5. After approval, user accesses system; no password required

### No Password for Google Users

- Google-authenticated users **do not have** employee credentials
- They authenticate via Firebase Auth token only
- `mustChangePassword` **not applicable** — Google accounts are considered already verified
- If admin needs to enforce password, they must reset to employee-code flow

---

## Session Security

- Sessions managed by **Firebase Auth SDK**
- Token auto-refresh handled by Firebase
- Session persists across browser tabs via shared `localStorage` internal to Firebase
- No manual token handling in app code

### Logout

```typescript
const logout = () => {
  setUser(null)                    // Clear React state
  setPendingEntry(null)
  signOut(getFirebaseAuth())       // Firebase Auth sign out
  router.push('/login')
}
```

Clears both app state and Firebase Auth session.

### Session Restoration

On app load, `AuthProvider` registers `onAuthStateChanged` listener:

```typescript
onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
  if (fbUser) {
    const record = await getUserById(fbUser.uid)
    // ... rebuild AppUser from Firestore
  } else {
    setUser(null)
  }
})
```

This restores session automatically if Firebase Auth token still valid.

---

## Security Model Summary

| Asset | Protection |
|-------|------------|
| Password hash | Bcrypt, 10 rounds, never exposed |
| Plaintext password | Never stored |
| Employee code | Stored in plaintext (non-secret identifier) |
| Session token | Firebase Auth (HTTP-only, secure, expires) |
| Role assignment | Firestore security rules enforce admin-only write |
| Credential read | User can read own only; admins read all |
| Credential write | Admin-only via rules |
| Password change | User self via `changePassword`; updates both credentials and user flag |

---

## Firestore Collections

### `users`

Primary user profile. Contains:
- `id` (Firebase UID or manual)
- `employeeCode`
- `name`, `nameAr`, `email`
- `roles` (array of role document IDs)
- `roleKeys` (array of role keys like `['admin']` for security rules)
- `departments`
- `customPermissions`
- `mustChangePassword`
- `status`
- timestamps

### `employeeCredentials`

Secure credential store. Contains:
- `employeeId` (matches user.id)
- `password` (bcrypt hash)
- `mustChange` (legacy flag)

**Readable by**: User self + admins
**Writable by**: Admins only

---

## Data Flow Diagrams

### Full Login Sequence

```
┌─────────┐
│ Login   │
│ Form    │
└────┬────┘
     │ employeeCode + password
     ▼
┌────────────────────────────────────────────┐
│ AuthContext.loginWithEmployeeCode()        │
└────────────────┬───────────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│Query     │ │Fetch     │ │Compare      │
│users col │ │credentials│ │password     │
│by empCode│ │doc       │ │(bcrypt/plain)│
└────┬─────┘ └────┬─────┘ └──────┬───────┘
     │            │             │
     │   ┌────────┴─────────────┘
     │   │  success?
     │   ▼
     │  ┌────────────────────────────┐
     │  │No → log attempt, return    │
     │  │error "wrong password"      │
     │  └────────────────────────────┘
     │
     └─Yes ──► Create AppUser object
               - Resolve roles from IDs
               - Build permission set
               └─► setUser(state)
                      │
                mustChangePassword?
                      │
          ┌───────────┴────────────┐
          │YES                      │NO
          ▼                         ▼
    ┌─────────────┐          ┌─────────────┐
    │Redirect to  │          │Redirect to  │
    │/change-pwd  │          │/dashboard   │
    └─────────────┘          └─────────────┘
```

### Password Change Sequence

```
┌──────────────────────┐
│ /change-password page│
│ (user mustChange=true)│
└───────────┬──────────┘
            │ submits (currentPwd, newPwd)
            ▼
┌─────────────────────────────────────┐
│ AuthContext.changePassword()        │
└────────────────┬────────────────────┘
                 │
         ┌───────┼───────┐
         │       │       │
         ▼       ▼       ▼
    ┌──────┐ ┌──────┐ ┌──────┐
    │set   │ │update│ │set   │
    │empl  │ │user  │ │state │
    │cred  │ │profile│      │
    └──────┘ └──────┘ └──────┘
         │       │       │
         └───────┴───────┘
                 │
            Redirect → /dashboard
```

---

## Dependencies

- `bcryptjs` — Password hashing (client-side compatible)
- `firebase/auth` — Firebase Authentication SDK
- `firebase/firestore` — Firestore client SDK
- `@/lib/services/users.service` — Credential CRUD
- `@/lib/services/auth.service` — Audit logging

---

## Future Enhancements

- Multi-factor authentication (MFA/2FA) via Firebase Auth
- Password strength meter with zxcvbn library
- Password expiration policy
- Account lockout after N failed attempts
- Email-based password reset (Firebase Auth built-in)
- Single Sign-On (SAML / OIDC) via Firebase
- Session management UI (view active devices, revoke)

---

## Related Documentation

- `AUTH_FLOW.md` — Complete authentication flow including Google sign-in
- `ROLES_PERMISSIONS.md` — Permission system integration
- `ARCHITECTURE.md` — Repository and service layer patterns
- `firestore.rules` — Security rules protecting credentials
