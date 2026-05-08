import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { ILoginLogRepository, LoginLogRecord } from '../contracts'

const COL = 'loginLogs'

export class FirestoreLoginLogRepository implements ILoginLogRepository {
  async add(entry: Omit<LoginLogRecord, 'id'>): Promise<void> {
    try {
      await addDoc(collection(getFirestoreDb(), COL), entry)
    } catch { /* ignore */ }
  }

  async getRecent(limitCount = 50): Promise<LoginLogRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LoginLogRecord))
    } catch { return [] }
  }
}
