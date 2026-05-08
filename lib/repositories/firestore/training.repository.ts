import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { ITrainingRepository, TrainingRecord } from '../contracts'

const COL = 'trainings'

export class FirestoreTrainingRepository implements ITrainingRepository {
  async getAll(): Promise<TrainingRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TrainingRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<TrainingRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as TrainingRecord) : undefined
    } catch { return undefined }
  }

  async getActive(): Promise<TrainingRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('isActive', '==', true))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TrainingRecord))
    } catch { return [] }
  }

  async create(training: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingRecord> {
    const now = new Date().toISOString()
    const data = { ...training, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<TrainingRecord>): Promise<TrainingRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as TrainingRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
