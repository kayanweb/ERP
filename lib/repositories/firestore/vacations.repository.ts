import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IVacationRepository, VacationRecord, VacationStatus } from '../contracts'

const COL = 'vacations'

export class FirestoreVacationRepository implements IVacationRepository {
  async getAll(): Promise<VacationRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('requestedAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VacationRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<VacationRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as VacationRecord) : undefined
    } catch { return undefined }
  }

  async getByEmployee(employeeId: string): Promise<VacationRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('employeeId', '==', employeeId), orderBy('requestedAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VacationRecord))
    } catch { return [] }
  }

  async getByStatus(status: VacationStatus): Promise<VacationRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('status', '==', status), orderBy('requestedAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VacationRecord))
    } catch { return [] }
  }

  async create(vacation: Omit<VacationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<VacationRecord> {
    const now = new Date().toISOString()
    const data = { ...vacation, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<VacationRecord>): Promise<VacationRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as VacationRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
