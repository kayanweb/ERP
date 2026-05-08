import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IEmployeeRepository, EmployeeRecord } from '../contracts'

const COL = 'employees'

export class FirestoreEmployeeRepository implements IEmployeeRepository {
  async getAll(): Promise<EmployeeRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmployeeRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<EmployeeRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as EmployeeRecord) : undefined
    } catch { return undefined }
  }

  async getByDepartment(departmentId: string): Promise<EmployeeRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('departmentId', '==', departmentId))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmployeeRecord))
    } catch { return [] }
  }

  async getByCode(code: string): Promise<EmployeeRecord | undefined> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('employeeCode', '==', code.toUpperCase()))
      const snap = await getDocs(q)
      if (snap.empty) return undefined
      const d = snap.docs[0]
      return { id: d.id, ...d.data() } as EmployeeRecord
    } catch { return undefined }
  }

  async create(employee: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeRecord> {
    const now = new Date().toISOString()
    const data = { ...employee, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<EmployeeRecord>): Promise<EmployeeRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as EmployeeRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
