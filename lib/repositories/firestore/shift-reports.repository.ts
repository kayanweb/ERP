import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IShiftReportRepository, ShiftReportRecord } from '../contracts'

const COL = 'shift_reports'

export class FirestoreShiftReportRepository implements IShiftReportRepository {
  async getAll(): Promise<ShiftReportRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShiftReportRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<ShiftReportRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as ShiftReportRecord) : undefined
    } catch { return undefined }
  }

  async getByDate(date: string): Promise<ShiftReportRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('date', '==', date))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShiftReportRecord))
    } catch { return [] }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<ShiftReportRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShiftReportRecord))
    } catch { return [] }
  }

  async create(report: Omit<ShiftReportRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShiftReportRecord> {
    const now = new Date().toISOString()
    const data = { ...report, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<ShiftReportRecord>): Promise<ShiftReportRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as ShiftReportRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
