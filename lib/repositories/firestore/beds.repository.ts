import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IBedRepository, BedRecord } from '../contracts'

const COL = 'beds'

export class FirestoreBedRepository implements IBedRepository {
  async getAll(): Promise<BedRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BedRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<BedRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as BedRecord) : undefined
    } catch { return undefined }
  }

  async getByDepartment(departmentId: string): Promise<BedRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('departmentId', '==', departmentId))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BedRecord))
    } catch { return [] }
  }

  async getAvailable(): Promise<BedRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('status', '==', 'available'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BedRecord))
    } catch { return [] }
  }

  async create(bed: Omit<BedRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<BedRecord> {
    const now = new Date().toISOString()
    const data = { ...bed, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<BedRecord>): Promise<BedRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as BedRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
