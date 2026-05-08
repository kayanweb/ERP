import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IHandoverRepository, HandoverRecord } from '../contracts'

const COL = 'handovers'

export class FirestoreHandoverRepository implements IHandoverRepository {
  async getAll(): Promise<HandoverRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HandoverRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<HandoverRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as HandoverRecord) : undefined
    } catch { return undefined }
  }

  async getByPatient(patientId: string): Promise<HandoverRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HandoverRecord))
    } catch { return [] }
  }

  async getByNurse(nurseId: string): Promise<HandoverRecord[]> {
    try {
      // Get both sent and received handovers
      const fromQ = query(
        collection(getFirestoreDb(), COL),
        where('fromNurseId', '==', nurseId),
        orderBy('date', 'desc')
      )
      const toQ = query(
        collection(getFirestoreDb(), COL),
        where('toNurseId', '==', nurseId),
        orderBy('date', 'desc')
      )
      const [fromSnap, toSnap] = await Promise.all([getDocs(fromQ), getDocs(toQ)])
      const fromDocs = fromSnap.docs.map((d) => ({ id: d.id, ...d.data() } as HandoverRecord))
      const toDocs = toSnap.docs.map((d) => ({ id: d.id, ...d.data() } as HandoverRecord))
      // Merge and deduplicate
      const all = [...fromDocs, ...toDocs]
      const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
      return unique.sort((a, b) => b.date.localeCompare(a.date))
    } catch { return [] }
  }

  async getPending(): Promise<HandoverRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('status', '==', 'pending'),
        orderBy('date', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HandoverRecord))
    } catch { return [] }
  }

  async create(handover: Omit<HandoverRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<HandoverRecord> {
    const now = new Date().toISOString()
    const data = { ...handover, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<HandoverRecord>): Promise<HandoverRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as HandoverRecord) : undefined
    } catch { return undefined }
  }
}
