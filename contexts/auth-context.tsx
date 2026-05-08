'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { isFirebaseConfigured, getFirebaseAuth } from '@/lib/firebase'
import bcrypt from 'bcryptjs'
import {
  getUserById,
  saveUserProfile,
  getEmployeeCredentials,
  setEmployeeCredentials,
} from '@/lib/services/users.service'
import {
  upsertPendingUser,
  getPendingUserById,
} from '@/lib/services/pending-users.service'
import { getAllRoles, seedDefaultRoles, resolveUserPermissions } from '@/lib/services/roles.service'
import { logLoginAttempt } from '@/lib/services/auth.service'
import type { UserRecord } from '@/lib/repositories'
import type { RoleRecord } from '@/lib/services/roles.service'
import type { PendingUserRecord } from '@/lib/services/pending-users.service'

// ─── Legacy role type for backward-compat with types/index.ts ─
export type UserRole = 'admin' | 'head_nurse' | 'supervisor' | 'staff'

// ─── App user shape (kept compatible with types/index.ts User) ─
export interface AppUser {
  id: string
  name: string
  nameAr: string
  email: string
  role: string          // primary display role
  roles: string[]       // all role IDs
  department: string
  departments: string[]
  permissions: string[] // resolved flat permission keys
  mustChangePassword: boolean
  employeeCode?: string
  photoURL?: string
}

interface AuthContextType {
  user: AppUser | null
  pendingEntry: PendingUserRecord | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: AppUser) => void
  loginWithGoogle: () => Promise<void>
  loginWithEmployeeCode: (
    employeeId: string,
    password: string,
  ) => Promise<{ success: boolean; mustChangePassword?: boolean; error?: string }>
  changePassword: (employeeId: string, newPassword: string) => Promise<void>
  logout: () => void
  can: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)


// ─── Helpers ─────────────────────────────────────────────────

async function buildAppUser(record: UserRecord, allRoles: RoleRecord[]): Promise<AppUser> {
  const userRoles = allRoles.filter((r) => record.roles.includes(r.id) && r.isActive)
  const permissions = resolveUserPermissions(userRoles, record.customPermissions)
  const primaryRole = userRoles[0]

  return {
    id: record.id,
    name: record.name,
    nameAr: record.nameAr,
    email: record.email,
    role: primaryRole?.nameAr ?? record.roles[0] ?? 'staff',
    roles: record.roles,
    department: record.departments[0] ?? '',
    departments: record.departments,
    permissions,
    mustChangePassword: record.mustChangePassword,
    employeeCode: record.employeeCode,
    photoURL: record.photoURL,
  }
}

// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                = useState<AppUser | null>(null)
  const [pendingEntry, setPendingEntry] = useState<PendingUserRecord | null>(null)
  const [isLoading, setIsLoading]      = useState(true)
  const router = useRouter()
  const rolesCache = useRef<RoleRecord[]>([])

  const loadRoles = async () => {
    if (rolesCache.current.length === 0) {
      await seedDefaultRoles()
      rolesCache.current = await getAllRoles()
    }
    return rolesCache.current
  }

  /* ── Restore session via Firebase Auth ── */
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (fbUser: FirebaseUser | null) => {
      try {
        if (fbUser) {
          const record = await getUserById(fbUser.uid)
          if (record && record.status === 'active') {
            const roles = await loadRoles()
            const appUser = await buildAppUser(record, roles)
            setUser(appUser)
            setPendingEntry(null)

            if (record.mustChangePassword) {
              router.push('/change-password')
            }
          } else {
            // Check pending
            const entry = await getPendingUserById(fbUser.uid)
            if (entry?.status === 'approved') {
              const roles = await loadRoles()
              const updatedRecord = await getUserById(fbUser.uid)
              if (updatedRecord) {
                setUser(await buildAppUser(updatedRecord, roles))
              }
            } else if (entry?.status === 'rejected') {
              await signOut(getFirebaseAuth())
            } else if (entry) {
              setPendingEntry(entry)
            }
          }
        } else {
          setUser(null)
          setPendingEntry(null)
        }
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback((userData: AppUser) => {
    setUser(userData)
  }, [])

  /* ─── Google Sign-In ── */
  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Please set up environment variables.')
    }

    const provider = new GoogleAuthProvider()
    const result   = await signInWithPopup(getFirebaseAuth(), provider)
    const fbUser   = result.user

    await logLoginAttempt({
      userId: fbUser.uid,
      userEmail: fbUser.email || '',
      method: 'google',
      success: true,
      timestamp: new Date().toISOString(),
    })

    // Already an approved user?
    const record = await getUserById(fbUser.uid)
    if (record && record.status === 'active') {
      const roles = await loadRoles()
      setUser(await buildAppUser(record, roles))
      router.push('/dashboard')
      return
    }

    // Check pending
    const existing = await getPendingUserById(fbUser.uid)
    if (existing?.status === 'rejected') {
      await signOut(getFirebaseAuth())
      throw new Error('تم رفض طلبك من قِبَل المدير')
    }

    // Register as pending
    const entry = await upsertPendingUser({
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email || 'User',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || undefined,
    })
    setPendingEntry(entry)
    router.push('/pending-approval')
  }, [router])

  /* ─── Employee Code Login ── */
  const loginWithEmployeeCode = useCallback(async (
    employeeId: string,
    password: string,
  ): Promise<{ success: boolean; mustChangePassword?: boolean; error?: string }> => {
    const roles = await loadRoles()

    // Try Firestore user first
    const dbUser = await import('@/lib/services/users.service')
      .then((m) => m.getUserByEmployeeCode(employeeId))

    if (dbUser) {
      const creds = await getEmployeeCredentials(dbUser.id)
      let passwordValid = false
      let mustChange = creds?.mustChange ?? true

      if (creds) {
        const storedPwd = creds.password
        // Check if stored password is a bcrypt hash (starts with $2)
        if (storedPwd.startsWith('$2')) {
          passwordValid = await bcrypt.compare(password, storedPwd)
        } else {
          // Legacy plain-text password - compare directly and rehash on success
          passwordValid = password === storedPwd
          if (passwordValid) {
            // Migrate to hashed password
            await setEmployeeCredentials(dbUser.id, password, mustChange)
          }
        }
      } else {
        // No credentials record - default password is employee code
        passwordValid = password === employeeId.toUpperCase()
      }

      if (!passwordValid) {
        await logLoginAttempt({ userId: dbUser.id, userEmail: dbUser.email, method: 'employee_code', success: false, timestamp: new Date().toISOString() })
        return { success: false, error: 'كلمة المرور غير صحيحة' }
      }

      const appUser = await buildAppUser(dbUser, roles)
      setUser({ ...appUser, mustChangePassword: mustChange })
      await logLoginAttempt({ userId: dbUser.id, userEmail: dbUser.email, method: 'employee_code', success: true, timestamp: new Date().toISOString() })
      if (mustChange) router.push('/change-password')
      return { success: true, mustChangePassword: mustChange }
    }

    return { success: false, error: 'كود الموظف غير موجود' }
  }, [router])

  /* ─── Change Password ── */
  const changePassword = useCallback(async (employeeId: string, newPassword: string) => {
    await setEmployeeCredentials(employeeId, newPassword, false)
    // Update Firestore user
    const dbUser = await import('@/lib/services/users.service')
      .then((m) => m.getUserById(employeeId))
    if (dbUser) {
      await import('@/lib/services/users.service')
        .then((m) => m.updateUserProfile(employeeId, { mustChangePassword: false }))
    }
    setUser((prev) => prev ? { ...prev, mustChangePassword: false } : prev)
  }, [])

  /* ─── Logout ── */
  const logout = useCallback(() => {
    setUser(null)
    setPendingEntry(null)
    if (isFirebaseConfigured()) signOut(getFirebaseAuth()).catch(() => {})
    router.push('/login')
  }, [router])

  /* ─── Permission helpers ── */
  const can = useCallback((permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false
  }, [user])

  const hasRole = useCallback((role: string): boolean => {
    return user?.roles.includes(role) ?? false
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, pendingEntry, isAuthenticated: !!user, isLoading,
      login, loginWithGoogle, loginWithEmployeeCode, changePassword, logout,
      can, hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function useRole(): string | null {
  const { user } = useAuth()
  return user?.role || null
}

// ─── Backward-compat wrapper ─────────────────────────────────
export function RequirePermission({
  permission, children, fallback = null,
}: {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { can } = useAuth()
  if (!can(permission)) return <>{fallback}</>
  return <>{children}</>
}
