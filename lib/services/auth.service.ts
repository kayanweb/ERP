/**
 * Auth Service
 * Business logic for authentication — no Firebase imports here,
 * all data operations go through repositories.
 */
import { loginLogRepo } from '@/lib/repositories'
import type { LoginLogRecord } from '@/lib/repositories'

export async function logLoginAttempt(
  entry: Omit<LoginLogRecord, 'id'>
): Promise<void> {
  return loginLogRepo().add(entry)
}

export async function getRecentLoginLogs(limit = 50): Promise<LoginLogRecord[]> {
  return loginLogRepo().getRecent(limit)
}
