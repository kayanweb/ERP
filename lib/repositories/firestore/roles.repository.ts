import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IRoleRepository, RoleRecord } from '../contracts'

const COL = 'roles'

export class FirestoreRoleRepository implements IRoleRepository {
  async getAll(): Promise<RoleRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      const roles = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoleRecord))
      return roles.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    } catch { return [] }
  }

  async getById(id: string): Promise<RoleRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as RoleRecord) : undefined
    } catch { return undefined }
  }

  async create(role: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleRecord> {
    const now = new Date().toISOString()
    const data = { ...role, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<RoleRecord>): Promise<RoleRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(ref, payload as any)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as RoleRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
