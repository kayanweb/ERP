import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import bcrypt from 'bcryptjs'
import type { IEmployeeCredentialsRepository, EmployeeCredentials } from '../contracts'

const COL = 'employeeCredentials'

export class FirestoreEmployeeCredentialsRepository implements IEmployeeCredentialsRepository {
  async get(employeeId: string): Promise<EmployeeCredentials | null> {
    try {
      const snap = await getDoc(doc(getFirestoreDb(), COL, employeeId))
      return snap.exists() ? (snap.data() as EmployeeCredentials) : null
    } catch { return null }
  }

  async set(employeeId: string, password: string, mustChange: boolean): Promise<void> {
    try {
      const hashed = await bcrypt.hash(password, 10)
      await setDoc(doc(getFirestoreDb(), COL, employeeId), { employeeId, password: hashed, mustChange })
    } catch { /* ignore */ }
  }
}
