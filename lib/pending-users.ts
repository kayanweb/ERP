/**
 * Backward-compatible re-export.
 * All logic now lives in lib/services/pending-users.service.ts
 */
export type { PendingUserRecord as PendingUser, PendingStatus } from '@/lib/repositories'
export type { UserRole } from './pending-users-types'
export {
  getPendingUsers,
  getPendingUserById,
  upsertPendingUser,
  updatePendingUser,
} from '@/lib/services/pending-users.service'
