import {
  collection, getDocs, addDoc,
  query, where, orderBy, limit as firestoreLimit,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IAuditLogRepository, AuditLogRecord } from '../contracts'

const COL = 'audit_logs'

export class FirestoreAuditLogRepository implements IAuditLogRepository {
  async add(entry: Omit<AuditLogRecord, 'id'>): Promise<void> {
    try {
      await addDoc(collection(getFirestoreDb(), COL), entry)
    } catch { /* ignore */ }
  }

  async getRecent(limit = 100): Promise<AuditLogRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limit)
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLogRecord))
    } catch { return [] }
  }

  async getByUser(userId: string): Promise<AuditLogRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLogRecord))
    } catch { return [] }
  }

  async getByModule(module: string): Promise<AuditLogRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('module', '==', module),
        orderBy('timestamp', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLogRecord))
    } catch { return [] }
  }
}
