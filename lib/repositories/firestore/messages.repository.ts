import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IMessageRepository, MessageRecord } from '../contracts'

const COL = 'messages'

export class FirestoreMessageRepository implements IMessageRepository {
  async getAll(): Promise<MessageRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageRecord))
    } catch { return [] }
  }

  async getById(id: string): Promise<MessageRecord | undefined> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as MessageRecord) : undefined
    } catch { return undefined }
  }

  async getByRecipient(recipientId: string): Promise<MessageRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('toId', '==', recipientId),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageRecord))
    } catch { return [] }
  }

  async getBySender(senderId: string): Promise<MessageRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('fromId', '==', senderId),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageRecord))
    } catch { return [] }
  }

  async getUnread(recipientId: string): Promise<MessageRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('toId', '==', recipientId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MessageRecord))
    } catch { return [] }
  }

  async create(message: Omit<MessageRecord, 'id' | 'createdAt'>): Promise<MessageRecord> {
    const now = new Date().toISOString()
    const data = { ...message, createdAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }

  async update(id: string, updates: Partial<MessageRecord>): Promise<MessageRecord | undefined> {
    try {
      const ref = doc(getFirestoreDb(), COL, id)
      await updateDoc(ref, updates as Record<string, unknown>)
      const snap = await getDoc(ref)
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as MessageRecord) : undefined
    } catch { return undefined }
  }

  async delete(id: string): Promise<void> {
    try { await deleteDoc(doc(getFirestoreDb(), COL, id)) } catch { /* ignore */ }
  }
}
