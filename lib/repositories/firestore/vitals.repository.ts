import {
  collection, doc, getDoc, getDocs, addDoc,
  query, where, orderBy, limit as firestoreLimit,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IVitalSignsRepository, VitalSignsRecord } from '../contracts'

const COL = 'vital_signs'

export class FirestoreVitalSignsRepository implements IVitalSignsRepository {
  async getAll(): Promise<VitalSignsRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('timestamp', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VitalSignsRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<VitalSignsRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as VitalSignsRecord) : undefined
    } catch { return undefined }
  }

  async getByPatient(patientId: string): Promise<VitalSignsRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VitalSignsRecord))
    } catch { return [] }
  }

  async getLatestByPatient(patientId: string): Promise<VitalSignsRecord | undefined> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(1)
      )
      const snap = await getDocs(q)
      if (snap.empty) return undefined
      const d = snap.docs[0]
      return { id: d.id, ...d.data() } as VitalSignsRecord
    } catch { return undefined }
  }

  async create(vitals: Omit<VitalSignsRecord, 'id' | 'createdAt'>): Promise<VitalSignsRecord> {
    const now = new Date().toISOString()
    const data = { ...vitals, createdAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }
}
