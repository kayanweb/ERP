/**
 * Pending Users Service
 * Business logic layer — uses the repository, never imports Firebase directly.
 */
import { pendingUserRepo } from '@/lib/repositories'
import type { PendingUserRecord, PendingStatus } from '@/lib/repositories'

export type { PendingUserRecord, PendingStatus }

export async function getPendingUsers(): Promise<PendingUserRecord[]> {
  return pendingUserRepo().getAll()
}

export async function getPendingUserById(id: string): Promise<PendingUserRecord | undefined> {
  return pendingUserRepo().getById(id)
}

export async function upsertPendingUser(
  user: Omit<PendingUserRecord, 'status' | 'requestedAt'> & { requestedAt?: string }
): Promise<PendingUserRecord> {
  return pendingUserRepo().upsert(user)
}

export async function updatePendingUser(
  id: string,
  updates: Partial<PendingUserRecord>
): Promise<PendingUserRecord | undefined> {
  return pendingUserRepo().update(id, updates)
}
