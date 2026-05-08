# Settings System Documentation

## Overview

PRO Nurse features a fully **Firestore-backed settings system** that allows administrators to configure the entire application without code changes. All settings are stored in the `settings` Firestore collection and loaded on application startup.

---

## Settings Model

Single document in `settings` collection with fixed ID `global`:

```typescript
interface SystemSettings {
  id: 'global'                    // Fixed document ID
  hospitalName: string            // Arabic hospital name
  hospitalNameEn: string          // English hospital name
  contactEmail: string            // Admin contact email
  contactPhone: string            // Admin contact phone
  address: string                 // Physical address
  language: 'ar' | 'en'           // Default UI language
  timezone: string                // IANA timezone e.g. "Asia/Riyadh"
  notificationsEnabled: boolean  // Master notification switch
  emailNotifications: boolean    // Email alerts on/off
  pushNotifications: boolean     // Browser push on/off
  maintenanceMode: boolean       // System-wide lockout except admins
  updatedAt: string               // ISO timestamp of last update
}
```

**Collection**: `settings`
**Document ID**: `global`

---

## Settings Service

Located at `lib/services/settings.service.ts`:

```typescript
export async function getSettings(): Promise<SystemSettings> {
  const stored = await settingsRepo().get()
  return stored ?? DEFAULT_SETTINGS
}

export async function saveSettings(updates: Partial<SystemSettings>): Promise<void> {
  return settingsRepo().save(updates)
}
```

If no settings exist in Firestore, returns hardcoded defaults:

```typescript
const DEFAULT_SETTINGS: SystemSettings = {
  id: 'global',
  hospitalName: 'مستشفى المملكة',
  hospitalNameEn: 'Kingdom Hospital',
  contactEmail: 'info@hospital.com',
  contactPhone: '920012345',
  address: 'الرياض، المملكة العربية السعودية',
  language: 'ar',
  timezone: 'Asia/Riyadh',
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: false,
  maintenanceMode: false,
  updatedAt: new Date().toISOString(),
}
```

---

## Admin UI

**Route**: `/admin/settings`

Tab structure:

### 1. Hospital (المستشفى)

Fields:
- Hospital Name (Arabic) → `hospitalName`
- Hospital Name (English) → `hospitalNameEn`
- Contact Email → `contactEmail`
- Contact Phone → `contactPhone`
- Address → `address`
- Default Language (select: Arabic/English) → `language`
- Timezone (select: Asia/Riyadh, Asia/Dubai, Africa/Cairo, UTC) → `timezone`

Used for:
- Header/footer display
- Email notifications footer
- Default language for new users (if not set in localStorage)

### 2. Notifications (الإشعارات)

Toggle switches:
- Enable Notifications (master switch) → `notificationsEnabled`
- Email Notifications → `emailNotifications`
- Push Notifications → `pushNotifications`

Controls:
- Whether notification system is active
- Which channels are active

### 3. Security (الأمان)

- **Maintenance Mode** toggle:
  - When ON: all non-admin users blocked from dashboard
  - Admins can still access
  - Shows maintenance message on login attempt
- Password Requirements (display only):
  - Minimum 6 characters
  - Mandatory change on first login
  - Employee code cannot be reused as password

### 4. Departments (الأقسام)

CRUD interface for hospital departments:
- Add new department: name (Arabic), name (English), code
- Toggle active/inactive
- Delete department (if no users assigned)

Stored in `departments` collection, not inside settings. Settings page loads them for convenience.

### 5. Appearance (المظهر)

Theme selector (visual only, state stored in `localStorage` not Firestore):
- Light
- Dark
- System (auto)

User preference persists client-side; not part of SystemSettings.

---

## Maintenance Mode

When `maintenanceMode === true`:

- All non-admin users see error or redirect on login
- Existing sessions may be terminated (optional implementation)
- Dashboard access denied (check in `DashboardLayout`)
- Admin users (`roleKeys` contains `'admin'`) can still log in

Implementation in UI:
- AuthProvider could check settings after login and log out non-admins
- DashboardLayout could read settings and show maintenance banner

Currently: Flag stored but enforcement not fully implemented in UI.

---

## Default Values

All defaults defined in `lib/services/settings.service.ts` constant `DEFAULT_SETTINGS`. These are used when Firestore document doesn't exist.

First-time load:
1. Settings page calls `getSettings()`
2. Repository returns `null` (no doc)
3. Service returns `DEFAULT_SETTINGS` (not persisted automatically)
4. UI displays defaults
5. When admin clicks Save → `saveSettings()` writes to Firestore, creating document

Thus after first save, Firestore document created and overrides defaults.

---

## Repository Implementation

File: `lib/repositories/firestore/settings.repository.ts`

```typescript
async get(): Promise<SystemSettings | null> {
  const snap = await getDoc(doc(getFirestoreDb(), 'settings', 'global'))
  return snap.exists() ? (snap.data() as SystemSettings) : null
}

async save(updates: Partial<SystemSettings>): Promise<void> {
  await setDoc(
    doc(getFirestoreDb(), 'settings', 'global'),
    { ...updates, id: 'global', updatedAt: new Date().toISOString() },
    { merge: true }
  )
}
```

Uses `setDoc` with `merge: true` → partial updates safe.

---

## Security Rules

Rules defined in `firestore.rules`:

```
match /settings/{docId} {
  allow read: if isActive();        // Any logged-in active user can read
  allow write: if isAdmin();        // Only admins can modify
}
```

All authenticated active users can view settings (useful for department list, language defaults). Write restricted to admin role.

---

## Settings Cache

Settings are fetched once on Settings page load. They are stored in component state (`useState`). No global caching; each page load fetches fresh from Firestore.

Future: Could cache in a SettingsContext for global access without repeated reads.

---

## Multi-Tenancy Considerations

Current implementation is **single-tenant** (one hospital). Multi-tenant would require:

- `tenantId` field on all collections
- Settings per tenant
- Rules scoped to `request.auth.token.tenantId`

Not in scope.

---

## Backups & Export

Settings are part of Firestore database. Backup strategies:

1. **Firebase Automated Backups** (paid): Daily export to Cloud Storage
2. **Manual Export**: Use Firebase Console → Firestore → Data → Export
3. **Custom Script**: Use Admin SDK to dump `settings` collection to JSON

Settings are small (single doc), easy to restore.

---

## Changing Settings at Runtime

No application restart needed. Changes saved to Firestore are:

- Immediately available to **new page loads** (next fetch)
- Already-open pages may not reflect changes until refresh or explicit refetch

Best practice: After Save, show toast "Settings saved. Changes take effect on next login."

---

## Validation

Frontend validates:
- Email format
- Phone format (basic)
- Required fields

Backend (Firestore) has no validation beyond rules. Ensure frontend validation before saving.

---

## Dependencies

- `@/lib/services/settings.service`
- `@/lib/repositories` (settingsRepo)
- Firebase Firestore SDK

---

## Troubleshooting

### Settings not saving
- Check Firestore rules allow write (user must have admin role)
- Check browser console for errors
- Verify `isAdmin()` returns true for current user

### Settings not loading
- Ensure Firestore document exists (`settings/global`)
- If missing, defaults shown but not saved automatically
- Try re-saving from admin UI

### Language not changing
- Language setting is global default
- Individual user language override stored in `localStorage` by LangContext
- Changing default affects new sessions only

---

## Future Enhancements

- Per-user settings override
- Settings versioning/history
- Settings import/export (JSON)
- Scheduled maintenance mode (date-based)
- Feature flags (toggles for experimental features)

---

## Related Files

| File | Purpose |
|------|---------|
| `lib/services/settings.service.ts` | Service layer |
| `lib/repositories/firestore/settings.repository.ts` | Firestore access |
| `app/(dashboard)/admin/settings/page.tsx` | Admin UI |
| `firestore.rules` | Rules for `settings` collection |
| `contracts.ts` | SystemSettings interface |

---

## Related Documentation

- `ARCHITECTURE.md` — Overall system design
- `README.md` — User guide including settings overview
