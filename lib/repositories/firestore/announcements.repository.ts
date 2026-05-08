import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IAnnouncementRepository, AnnouncementRecord } from '../contracts'

const COL = 'announcements'

export class FirestoreAnnouncementRepository implements IAnnouncementRepository {
  async getAll(): Promise<AnnouncementRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('publishedAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AnnouncementRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<AnnouncementRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as AnnouncementRecord) : undefined
    } catch { return undefined }
  }

  async getActive(): Promise<AnnouncementRecord[]> {
    try {
      const now = new Date().toISOString()
      const snap = await getDocs(collection(getFirestoreDb(), COL))
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AnnouncementRecord))
      return all.filter(a => !a.expiresAt || a.expiresAt > now)
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return b.publishedAt.localeCompare(a.publishedAt)
        })
    } catch { return [] }
  }

  async create(announcement: Omit<AnnouncementRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnnouncementRecord> {
    const now = new Date().toISOString()
    const data = { ...announcement, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<AnnouncementRecord>): Promise<AnnouncementRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      const payload = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as AnnouncementRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
