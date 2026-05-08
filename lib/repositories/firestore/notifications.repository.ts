import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, writeBatch,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { INotificationRepository, NotificationRecord } from '../contracts'

const COL = 'notifications'

export class FirestoreNotificationRepository implements INotificationRepository {
  async getAll(): Promise<NotificationRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<NotificationRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as NotificationRecord) : undefined
    } catch { return undefined }
  }

  async getByRecipient(recipientId: string): Promise<NotificationRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('recipientId', '==', recipientId),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationRecord))
    } catch { return [] }
  }

  async getUnread(recipientId: string): Promise<NotificationRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('recipientId', '==', recipientId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationRecord))
    } catch { return [] }
  }

  async create(notification: Omit<NotificationRecord, 'id' | 'createdAt'>): Promise<NotificationRecord> {
    const now = new Date().toISOString()
    const data = { ...notification, createdAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<NotificationRecord>): Promise<NotificationRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      await updateDoc(ref, updates as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as NotificationRecord) : undefined
    } catch { return undefined }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      await updateDoc(ref, { isRead: true, readAt: new Date().toISOString() })
    } catch { /* ignore */ }
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('recipientId', '==', recipientId),
        where('isRead', '==', false)
      )
      const snap = await getDocs(q)
      const batch = writeBatch(getFirestoreDb())
      const now = new Date().toISOString()
      snap.docs.forEach(d => {
        batch.update(d.ref, { isRead: true, readAt: now })
      })
      await batch.commit()
    } catch { /* ignore */ }
  }
}
