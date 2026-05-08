# PRO Nurse - Integrated Nursing Management System

A comprehensive, production-ready hospital nursing management system built with Next.js 16, TypeScript, Firebase Auth, and Firestore.

---

## Features

### Authentication & Security
- **Firebase Auth** - Secure authentication with email/password and Google OAuth
- **Employee Code Login** - Unique employee codes for quick access
- **First-login Password Change** - Mandatory password change for new accounts
- **Bcrypt Password Hashing** - All passwords securely hashed with salt
- **Role-Based Access Control (RBAC)** - Dynamic permissions system
- **Audit Logging** - All login attempts recorded in Firestore

### User Management
- **Dynamic Roles** - Admins can create/edit/delete roles from the admin panel
- **Departments** - Organize staff by department (ICU, Emergency, etc.)
- **Employee Codes** - Auto-generated unique identifiers
- **User Status** - Active/inactive/suspended user states

### Settings & Configuration
- **System Settings** - Hospital info, language, timezone stored in Firestore
- **Notification Preferences** - Enable/disable email and push notifications
- **Maintenance Mode** - Admin-only access during system updates
- **Appearance** - Light/dark/system theme support

### Real-time Features (Ready for Firebase Realtime DB)
- Notifications system (client-side ready, pending Firebase RTDB integration)
- User presence tracking
- Activity feed

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Radix UI, Tailwind CSS v4, shadcn/ui |
| Auth | Firebase Authentication |
| Database | Firestore (NoSQL) |
| Realtime | Firebase Realtime Database (optional, for notifications) |
| Storage | Firebase Storage (for file uploads) |
| Package Manager | npm / yarn |

---

## Architecture

The project follows a clean **Repository Pattern** with separation of concerns:

```
app/                    # Next.js App Router pages
  login/               # Employee code + Google login
  change-password/     # First-login password change
  pending-approval/    # Google sign-up approval wait page
  (dashboard)/         # Protected dashboard routes
    admin/
      users/          # User management + pending approvals
      roles/          # Roles & permissions matrix
      settings/       # All system settings

contexts/              # React Context providers
  auth-context.tsx    # Authentication state & helpers
  lang-context.tsx    # Language (ar/en) with localStorage
  notification-context.tsx # Notifications (Firebase RTDB ready)

lib/
  firebase.ts         # Firebase initialization & config
  repositories/       # Data access layer
    contracts.ts      # All TypeScript interfaces
    index.ts           # Repository registry (singleton factories)
    firestore/        # Firestore implementations
      users.repository.ts
      employee-credentials.repository.ts
      roles.repository.ts
      departments.repository.ts
      settings.repository.ts
      pending-users.repository.ts
      login-log.repository.ts
  services/           # Business logic layer
    auth.service.ts   # Login logging
    users.service.ts   # User CRUD, credentials, approvals
    roles.service.ts   # Role CRUD, permissions, seeding
    departments.service.ts # Department CRUD, seeding
    settings.service.ts   # Settings get/save
    pending-users.service.ts # Pending user management
```

### Key Principles

1. **Single Source of Truth** - All persistent data lives in Firestore only
2. **No localStorage for auth** - No credentials, tokens, or user data in browser storage
3. **UI-only localStorage** - Language preference only (`pronurse-lang`)
4. **Service Layer** - Business logic decoupled from data access
5. **Repository Pattern** - Easy to swap backend (Firestore → Supabase → PostgreSQL)

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" → Enter project name
3. Disable Google Analytics (optional) → Create project

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. Enable **Google** provider
   - Add your domain to authorized domains
   - Set project support email

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **Production mode** (recommended)
4. Choose location closest to your users (e.g., `europe-west1`)

### 4. Get Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** → Add web app if not done
3. Copy the `firebaseConfig` object
4. Paste values into `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 5. Deploy Firestore Security Rules

Copy the contents of `firestore.rules` and deploy:

```bash
# Using Firebase CLI
firebase deploy --only firestore:rules

# Or manually in Firebase Console -> Firestore -> Rules
```

---

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Authentication Flow

### Employee Code Login (Default)

1. User enters employee code (e.g., `EMP001`) and password
2. System looks up user in Firestore `users` collection by `employeeCode`
3. Password verified against hashed value in `employeeCredentials` collection
   - First login: no credentials record → password must equal employee code
   - Subsequent logins: credentials checked via bcrypt hash
4. If `mustChangePassword = true` → redirect to `/change-password`
5. After password change → `mustChangePassword = false` in Firestore → redirect to dashboard

### Google Sign-In

1. User clicks "Sign in with Google"
2. Firebase Google OAuth popup opens
3. On success, check Firestore `users` for existing account:
   - Found & active → redirect to dashboard
   - Not found → create entry in `pendingUsers` collection
4. User waits on `/pending-approval` page
5. Admin approves → `users` record created → auto-redirect to dashboard
6. Admin rejects → user signed out with rejection message

### First-Login Password Change

Required when:
- New employee added by admin (default password = employee code)
- Google sign-up first login (no password set)

Flow:
1. User redirected to `/change-password`
2. Must enter current password (employee code) + new password (min 6 chars)
3. Password hashed via bcrypt and saved to `employeeCredentials`
4. `mustChangePassword` set to `false` in `users` document
5. Redirect to dashboard

---

## Roles & Permissions

### Permission Model

Permissions are atomic keys like `'staff.create'`, `'dashboard.view'`, `'roles.manage'`. They are **data-driven** from Firestore `roles` collection.

#### Built-in Permission Keys

```typescript
const PERMISSION_KEYS = [
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
]
```

### Default Roles (Seeded on First Run)

| Role | Permissions | Description |
|------|-------------|-------------|
| System Admin | ALL (26 keys) | Full system access |
| Head Nurse | 17 permissions | Staff management, departments, reports, patients |
| Supervisor | 9 permissions | Limited reports, view-only staff |
| Staff | 4 permissions | Dashboard, patients, inventory, equipment view |

### Managing Roles (Admin Only)

Navigate to **Settings → Roles & Permissions** (`/admin/roles`):

- **View** all roles and their permission matrices
- **Create** custom roles with selected permissions
- **Edit** existing roles (except default roles)
- **Clone** roles as templates
- **Delete** custom roles (default roles protected)
- **Reorder** roles via drag-and-drop (future)

Permissions changes take effect immediately on next permission check.

---

## Settings System

All settings stored in Firestore `settings` collection, document ID `global`.

### Tabs

1. **Hospital** - Name (Arabic/English), email, phone, address, language, timezone
2. **Notifications** - Enable/disable notifications, email, push
3. **Security** - Maintenance mode toggle, password requirements
4. **Departments** - Create, edit, deactivate hospital departments
5. **Appearance** - Theme selection (light/dark/system)

Settings are loaded on app startup from Firestore and cached in React state.

---

## Employee Code System

- Auto-generated sequentially: `EMP0001`, `EMP0002`, etc.
- Format: `EMP` prefix + 4-digit zero-padded number
- Used as default password on first login
- Unique across system (enforced by Firestore query)

---

## Security Model

### Password Security
- **Bcrypt hashing** with 10 salt rounds
- Legacy plain-text passwords auto-migrated on next login
- Minimum 6 characters enforced
- Employee code cannot be used as password after first change

### Firestore Security Rules

Users can only:
- Read their own profile
- Update their own profile (except roles/status/employeeCode)
- Create their own login logs

Admins (role `admin`) can:
- Read/write all user profiles
- Manage roles, departments, settings
- Approve/reject pending users
- Delete users
- Read all login logs

Rules defined in `firestore.rules` and enforced server-side.

### Data Validation

All service layer functions validate inputs. Frontend validation is supplemental; **backend is source of truth**.

---

## Dynamic Data-Driven Design

Everything is configurable **without code changes**:

- **Roles** - Create via admin UI → stored in `roles` collection → available immediately
- **Departments** - Add/edit/delete → stored in `departments` collection
- **Permissions** - Modify role permission arrays in Firestore → effective instantly
- **Settings** - All config through Settings page → persisted in Firestore

No hardcoded roles or permissions in code beyond the **permission key definitions** (PERMISSION_KEYS constant), which serve as the allowed vocabulary. New permission keys require code change, but new roles/departments do not.

---

## Localization

- **Languages**: Arabic (ar) - primary, English (en) - secondary
- **UI Toggle**: Top-left button on all pages
- **Storage**: Language preference saved in `localStorage.pronurse-lang` (UI-only)
- **RTL Support**: Full RTL layout for Arabic
- **Translation Strategy**: Separate `ar`/`en` strings in code; no i18n library (simple and fast)

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel](https://vercel.com) → Import Project
2. Select your GitHub repository
3. Configure environment variables:
   - All `NEXT_PUBLIC_FIREBASE_*` from `.env.local`
4. Click **Deploy**

### 3. Post-Deploy

1. Visit your deployed URL
2. Login with first admin account (create via Firebase Console if needed)
3. Go to **Settings → Roles** → verify default roles seeded
4. Configure hospital settings
5. Add departments
6. Invite staff via Google sign-up or manual user creation

---

## Project Structure Summary

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages (server + client components) |
| `components/` | Reusable UI components (shadcn/ui) |
| `contexts/` | React Context providers (auth, language, notifications) |
| `lib/` | Core utilities |
| `lib/firebase.ts` | Firebase initialization singleton |
| `lib/repositories/` | Data layer (interfaces + Firestore implementations) |
| `lib/services/` | Business logic layer |
| `config/` | Navigation config, feature flags |
| `types/` | TypeScript type definitions |
| `firestore.rules` | Security rules (copy to Firebase Console) |

---

## Data Model

### Collections

| Collection | Purpose |
|------------|---------|
| `users` | User profiles (name, email, roles, departments, status) |
| `employeeCredentials` | Password hashes + `mustChangePassword` flag |
| `roles` | Role definitions (name, permissions array) |
| `departments` | Department definitions (name, code) |
| `settings` | Single global settings document |
| `pendingUsers` | Google sign-up approvals queue |
| `loginLogs` | Immutable audit trail of all login attempts |

---

## API & Data Flow

All data operations go through **Services** → **Repositories** → **Firestore**.

Example: Login

```
LoginPage (component)
  → useAuth().loginWithEmployeeCode()
    → AuthContext.loginWithEmployeeCode()
      → usersService.getUserByEmployeeCode()
        → userRepo.getByEmployeeCode()
          → Firestore query on 'users' collection
      → credentialsRepo.get()
        → Firestore get on 'employeeCredentials'
      → bcrypt.compare()
      → logLoginAttempt()
        → authService.logLoginAttempt()
          → loginLogRepo.add()
            → Firestore add to 'loginLogs'
      → buildAppUser() (permissions resolution)
      → setUser() (React state)
```

No Firebase SDK imports leak into React components. All Firebase calls isolated to `lib/repositories/firestore/`.

---

## Troubleshooting

### "Firebase is not configured" error
- Ensure `.env.local` exists with all required `NEXT_PUBLIC_FIREBASE_*` variables
- Restart dev server after adding env vars

### "auth/user-not-found" on Google login
- First-time Google users go to pending approval
- Admin must approve in `/admin/users` → Pending tab
- After approval, user auto-redirects to dashboard

### "Cannot set headers after they are sent"
- Caused by mixing client-side Firebase auth with server-side redirects
- All auth logic is client-side; no server actions used

### TypeScript errors about `window` or `document`
- Components using browser APIs must have `'use client'` directive
- Check dynamic imports for SSR compatibility

### Build fails on Windows due to path length
- Windows has 260-character path limit
- Shorten folder names or enable long paths via Group Policy

---

## Maintenance

### Seeding Default Data

Default roles and departments are seeded automatically on first request:

- `seedDefaultRoles()` - Called in `AuthProvider` useEffect
- `seedDefaultDepartments()` - Called in Settings page load

To manually re-seed, delete all role/department documents from Firestore and reload app.

### Backup

Firestore backups via Firebase Console:

1. Go to Firestore Database → Backups
2. Enable daily backups (paid tier) or manual export (free)

### Monitoring

Firebase Console provides:
- Authentication usage & active users
- Firestore read/write metrics
- Security rules evaluation

---

## Contributing

This is a production-ready system. Follow these guidelines:

- **Never** store passwords in plain text
- **Always** use repository pattern for data access
- **Never** import Firebase SDK in React components directly
- **Always** add security rule tests for new collections
- **Document** any new permission keys in `roles.service.ts`

---

## License

Proprietary - Hospital use only.

---

## Support

For issues, contact the development team or refer to:
- Firebase Docs: https://firebase.google.com/docs
- Next.js Docs: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
