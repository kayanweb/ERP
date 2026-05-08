import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IMaintenanceRepository, MaintenanceRecord } from '../contracts'

const COL = 'maintenance'

export class FirestoreMaintenanceRepository implements IMaintenanceRepository {
  async getAll(): Promise<MaintenanceRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MaintenanceRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<MaintenanceRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as MaintenanceRecord) : undefined
    } catch { return undefined }
  }

  async getByEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('equipmentId', '==', equipmentId),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MaintenanceRecord))
    } catch { return [] }
  }

  async getPending(): Promise<MaintenanceRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('status', 'in', ['pending', 'in_progress']),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MaintenanceRecord))
    } catch { return [] }
  }

  async create(maintenance: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord> {
    const now = new Date().toISOString()
    const data = { ...maintenance, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as MaintenanceRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
