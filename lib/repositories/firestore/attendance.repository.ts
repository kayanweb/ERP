import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IAttendanceRepository, AttendanceRecord } from '../contracts'

const COL = 'attendance'

export class FirestoreAttendanceRepository implements IAttendanceRepository {
  async getAll(): Promise<AttendanceRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<AttendanceRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as AttendanceRecord) : undefined
    } catch { return undefined }
  }

  async getByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('employeeId', '==', employeeId), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord))
    } catch { return [] }
  }

  async getByDate(date: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('date', '==', date))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord))
    } catch { return [] }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord))
    } catch { return [] }
  }

  async create(attendance: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AttendanceRecord> {
    const now = new Date().toISOString()
    const data = { ...attendance, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as AttendanceRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
