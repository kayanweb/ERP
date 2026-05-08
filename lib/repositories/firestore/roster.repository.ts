import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IRosterRepository, RosterRecord } from '../contracts'

const COL = 'rosters'

export class FirestoreRosterRepository implements IRosterRepository {
  async getAll(): Promise<RosterRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RosterRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<RosterRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as RosterRecord) : undefined
    } catch { return undefined }
  }

  async getByEmployee(employeeId: string): Promise<RosterRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('employeeId', '==', employeeId), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RosterRecord))
    } catch { return [] }
  }

  async getByDepartment(departmentId: string): Promise<RosterRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('departmentId', '==', departmentId), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RosterRecord))
    } catch { return [] }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<RosterRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RosterRecord))
    } catch { return [] }
  }

  async create(roster: Omit<RosterRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RosterRecord> {
    const now = new Date().toISOString()
    const data = { ...roster, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<RosterRecord>): Promise<RosterRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as RosterRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
