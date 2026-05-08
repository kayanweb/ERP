import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IOvertimeRepository, OvertimeRecord } from '../contracts'

const COL = 'overtime'

export class FirestoreOvertimeRepository implements IOvertimeRepository {
  async getAll(): Promise<OvertimeRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OvertimeRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<OvertimeRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as OvertimeRecord) : undefined
    } catch { return undefined }
  }

  async getByEmployee(employeeId: string): Promise<OvertimeRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('employeeId', '==', employeeId), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OvertimeRecord))
    } catch { return [] }
  }

  async getPending(): Promise<OvertimeRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('status', '==', 'pending'), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OvertimeRecord))
    } catch { return [] }
  }

  async create(overtime: Omit<OvertimeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<OvertimeRecord> {
    const now = new Date().toISOString()
    const data = { ...overtime, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<OvertimeRecord>): Promise<OvertimeRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as OvertimeRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
