import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IDepartmentRepository, DepartmentRecord } from '../contracts'

const COL = 'departments'

export class FirestoreDepartmentRepository implements IDepartmentRepository {
  async getAll(): Promise<DepartmentRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DepartmentRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<DepartmentRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as DepartmentRecord) : undefined
    } catch { return undefined }
  }

  async create(dept: Omit<DepartmentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DepartmentRecord> {
    const now = new Date().toISOString()
    const data = { ...dept, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<DepartmentRecord>): Promise<DepartmentRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(ref, payload as any)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as DepartmentRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
