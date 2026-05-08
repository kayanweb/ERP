import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IEquipmentRepository, EquipmentRecord, EquipmentStatus } from '../contracts'

const COL = 'equipment'

export class FirestoreEquipmentRepository implements IEquipmentRepository {
  async getAll(): Promise<EquipmentRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EquipmentRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<EquipmentRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as EquipmentRecord) : undefined
    } catch { return undefined }
  }

  async getByDepartment(departmentId: string): Promise<EquipmentRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('departmentId', '==', departmentId))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EquipmentRecord))
    } catch { return [] }
  }

  async getByStatus(status: EquipmentStatus): Promise<EquipmentRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('status', '==', status))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EquipmentRecord))
    } catch { return [] }
  }

  async create(equipment: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EquipmentRecord> {
    const now = new Date().toISOString()
    const data = { ...equipment, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<EquipmentRecord>): Promise<EquipmentRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as EquipmentRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
