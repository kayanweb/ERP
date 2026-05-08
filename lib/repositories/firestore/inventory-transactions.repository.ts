import {
  collection, doc, getDocs, addDoc,
  query, where, orderBy,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { IInventoryTransactionRepository, InventoryTransactionRecord } from '../contracts'

const COL = 'inventory_transactions'

export class FirestoreInventoryTransactionRepository implements IInventoryTransactionRepository {
  async getAll(): Promise<InventoryTransactionRecord[]> {
    try {
      const q = query(collection(getFirestoreDb(), COL), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryTransactionRecord))
    } catch { return [] }
  }

  async getByInventory(inventoryId: string): Promise<InventoryTransactionRecord[]> {
    try {
      const q = query(
        collection(getFirestoreDb(), COL),
        where('inventoryId', '==', inventoryId),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryTransactionRecord))
    } catch { return [] }
  }

  async create(transaction: Omit<InventoryTransactionRecord, 'id' | 'createdAt'>): Promise<InventoryTransactionRecord> {
    const now = new Date().toISOString()
    const data = { ...transaction, createdAt: now }
    const ref = await addDoc(collection(getFirestoreDb(), COL), data)
    return { id: ref.id, ...data }
  }
}
