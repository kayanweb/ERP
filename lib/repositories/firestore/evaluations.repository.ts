import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IEvaluationRepository, EvaluationRecord } from '../contracts'

const COL = 'evaluations'

export class FirestoreEvaluationRepository implements IEvaluationRepository {
  async getAll(): Promise<EvaluationRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('evaluationDate', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EvaluationRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<EvaluationRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as EvaluationRecord) : undefined
    } catch { return undefined }
  }

  async getByEmployee(employeeId: string): Promise<EvaluationRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('employeeId', '==', employeeId),
        orderBy('evaluationDate', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EvaluationRecord))
    } catch { return [] }
  }

  async create(evaluation: Omit<EvaluationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EvaluationRecord> {
    const now = new Date().toISOString()
    const data = { ...evaluation, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<EvaluationRecord>): Promise<EvaluationRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as EvaluationRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
