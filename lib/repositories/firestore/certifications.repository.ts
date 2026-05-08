import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { ICertificationRepository, CertificationRecord } from '../contracts'

const COL = 'certifications'

export class FirestoreCertificationRepository implements ICertificationRepository {
  async getAll(): Promise<CertificationRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CertificationRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<CertificationRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as CertificationRecord) : undefined
    } catch { return undefined }
  }

  async getByEmployee(employeeId: string): Promise<CertificationRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('employeeId', '==', employeeId),
        orderBy('expiryDate', 'asc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CertificationRecord))
    } catch { return [] }
  }

  async getExpiringSoon(days: number): Promise<CertificationRecord[]> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      const todayStr = new Date().toISOString().split('T')[0]
      
      const q = query(
        collection(getFirestoreDb(), COL),
        where('expiryDate', '>=', todayStr),
        where('expiryDate', '<=', futureDateStr),
        orderBy('expiryDate', 'asc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CertificationRecord))
    } catch { return [] }
  }

  async create(cert: Omit<CertificationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CertificationRecord> {
    const now = new Date().toISOString()
    const data = { ...cert, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<CertificationRecord>): Promise<CertificationRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as CertificationRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
