import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IUserRepository, UserRecord } from '../contracts'

const COL = 'users'

export class FirestoreUserRepository implements IUserRepository {
  async getAll(): Promise<UserRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<UserRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as UserRecord) : undefined
    } catch { return undefined }
  }

  async getByEmployeeCode(code: string): Promise<UserRecord | undefined> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('employeeCode', '==', code.toUpperCase()))
      const snap = await getDocs(q)
      if (snap.empty) return undefined
      const d = snap.docs[0]
      return { id: d.id, ...d.data() } as UserRecord
    } catch { return undefined }
  }

  async create(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<UserRecord> {
    const now = new Date().toISOString()
    const { id: suppliedId, ...rest } = user as { id?: string } & typeof user
    const data: Omit<UserRecord, 'id'> = { ...rest, createdAt: now, updatedAt: now }
    if (suppliedId) {
      // If caller supplied an id (e.g. Firebase UID), use setDoc
      const ref = doc(getFirestoreDb(), COL, suppliedId)
      await setDoc(ref, data, { merge: true })
      return { id: suppliedId, ...data }
    }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<UserRecord>): Promise<UserRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(ref, payload as any)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as UserRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(getFirestoreDb(), COL, id))
    } catch { /* ignore */ }
  }
}
