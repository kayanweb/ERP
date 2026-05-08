import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { ISettingsRepository, SystemSettings } from '../contracts'

const COL = 'settings'
const DOC = 'global'

export class FirestoreSettingsRepository implements ISettingsRepository {
  async get(): Promise<SystemSettings | null> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, DOC))
      return snap.exists() ? (snap.data() as SystemSettings) : null
    } catch { return null }
  }

  async save(settings: Partial<SystemSettings>): Promise<void> {
    try {
      await setDoc(
        doc(getFirestoreDb(), COL, DOC),
        { ...settings, id: DOC, updatedAt: new Date().toISOString() },
        { merge: true }
      )
    } catch { /* ignore */ }
  }
}
