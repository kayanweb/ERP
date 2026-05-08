import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { INursingTaskRepository, NursingTaskRecord, TaskStatus } from '../contracts'

const COL = 'nursing_tasks'

export class FirestoreNursingTaskRepository implements INursingTaskRepository {
  async getAll(): Promise<NursingTaskRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('dueTime', 'asc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NursingTaskRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<NursingTaskRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as NursingTaskRecord) : undefined
    } catch { return undefined }
  }

  async getByAssignee(assigneeId: string): Promise<NursingTaskRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('assignedToId', '==', assigneeId),
        orderBy('dueTime', 'asc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NursingTaskRecord))
    } catch { return [] }
  }

  async getByPatient(patientId: string): Promise<NursingTaskRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('patientId', '==', patientId),
        orderBy('dueTime', 'asc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NursingTaskRecord))
    } catch { return [] }
  }

  async getByStatus(status: TaskStatus): Promise<NursingTaskRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('status', '==', status),
        orderBy('dueTime', 'asc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NursingTaskRecord))
    } catch { return [] }
  }

  async create(task: Omit<NursingTaskRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<NursingTaskRecord> {
    const now = new Date().toISOString()
    const data = { ...task, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<NursingTaskRecord>): Promise<NursingTaskRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as NursingTaskRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
