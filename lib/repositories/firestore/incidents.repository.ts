import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IIncidentRepository, IncidentRecord } from '../contracts'

const COL = 'incidents'

export class FirestoreIncidentRepository implements IIncidentRepository {
  async getAll(): Promise<IncidentRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('dateTime', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IncidentRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<IncidentRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as IncidentRecord) : undefined
    } catch { return undefined }
  }

  async getByDepartment(departmentId: string): Promise<IncidentRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('departmentId', '==', departmentId),
        orderBy('dateTime', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IncidentRecord))
    } catch { return [] }
  }

  async getByStatus(status: string): Promise<IncidentRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('status', '==', status),
        orderBy('dateTime', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IncidentRecord))
    } catch { return [] }
  }

  async create(incident: Omit<IncidentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<IncidentRecord> {
    const now = new Date().toISOString()
    const data = { ...incident, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<IncidentRecord>): Promise<IncidentRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as IncidentRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
