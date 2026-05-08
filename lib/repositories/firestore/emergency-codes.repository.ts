import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IEmergencyCodeRepository, EmergencyCodeRecord } from '../contracts'

const COL = 'emergency_codes'

export class FirestoreEmergencyCodeRepository implements IEmergencyCodeRepository {
  async getAll(): Promise<EmergencyCodeRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('startTime', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmergencyCodeRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<EmergencyCodeRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as EmergencyCodeRecord) : undefined
    } catch { return undefined }
  }

  async getActive(): Promise<EmergencyCodeRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('status', '==', 'active'),
        orderBy('startTime', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmergencyCodeRecord))
    } catch { return [] }
  }

  async create(code: Omit<EmergencyCodeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyCodeRecord> {
    const now = new Date().toISOString()
    const data = { ...code, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<EmergencyCodeRecord>): Promise<EmergencyCodeRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as EmergencyCodeRecord) : undefined
    } catch { return undefined }
  }
}
