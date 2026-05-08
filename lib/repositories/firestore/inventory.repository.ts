import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IInventoryRepository, InventoryRecord } from '../contracts'

const COL = 'inventory'

export class FirestoreInventoryRepository implements IInventoryRepository {
  async getAll(): Promise<InventoryRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<InventoryRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as InventoryRecord) : undefined
    } catch { return undefined }
  }

  async getByDepartment(departmentId: string): Promise<InventoryRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('departmentId', '==', departmentId))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryRecord))
    } catch { return [] }
  }

  async getLowStock(): Promise<InventoryRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryRecord))
      return all.filter(item => item.currentStock <= item.reorderPoint)
    } catch { return [] }
  }

  async create(item: Omit<InventoryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryRecord> {
    const now = new Date().toISOString()
    const data = { ...item, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<InventoryRecord>): Promise<InventoryRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as InventoryRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
