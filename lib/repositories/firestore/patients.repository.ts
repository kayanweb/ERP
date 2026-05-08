import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IPatientRepository, PatientRecord } from '../contracts'

const COL = 'patients'

export class FirestorePatientRepository implements IPatientRepository {
  async getAll(): Promise<PatientRecord[]> {
    try {
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PatientRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<PatientRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as PatientRecord) : undefined
    } catch { return undefined }
  }

  async getByMRN(mrn: string): Promise<PatientRecord | undefined> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('mrn', '==', mrn))
      const snap = await getDocs(q)
      if (snap.empty) return undefined
      const d = snap.docs[0]
      return { id: d.id, ...d.data() } as PatientRecord
    } catch { return undefined }
  }

  async getByDepartment(departmentId: string): Promise<PatientRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('departmentId', '==', departmentId))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PatientRecord))
    } catch { return [] }
  }

  async getAdmitted(): Promise<PatientRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('status', '==', 'admitted'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PatientRecord))
    } catch { return [] }
  }

  async getIsolation(): Promise<PatientRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), where('isIsolation', '==', true))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PatientRecord))
    } catch { return [] }
  }

  async create(patient: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientRecord> {
    const now = new Date().toISOString()
    const data = { ...patient, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<PatientRecord>): Promise<PatientRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as PatientRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
