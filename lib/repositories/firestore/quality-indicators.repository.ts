import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IQualityIndicatorRepository, QualityIndicatorRecord } from '../contracts'

const COL = 'quality_indicators'

export class FirestoreQualityIndicatorRepository implements IQualityIndicatorRepository {
  async getAll(): Promise<QualityIndicatorRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QualityIndicatorRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<QualityIndicatorRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as QualityIndicatorRecord) : undefined
    } catch { return undefined }
  }

  async getByCategory(category: string): Promise<QualityIndicatorRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('category', '==', category))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QualityIndicatorRecord))
    } catch { return [] }
  }

  async getByPeriod(period: string): Promise<QualityIndicatorRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('period', '==', period))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QualityIndicatorRecord))
    } catch { return [] }
  }

  async create(indicator: Omit<QualityIndicatorRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<QualityIndicatorRecord> {
    const now = new Date().toISOString()
    const data = { ...indicator, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<QualityIndicatorRecord>): Promise<QualityIndicatorRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as QualityIndicatorRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
