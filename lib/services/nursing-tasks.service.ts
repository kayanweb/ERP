/**
 * Nursing Tasks Service
 */
import { nursingTaskRepo } from '@/lib/repositories'
import type { NursingTaskRecord, TaskStatus, TaskPriority } from '@/lib/repositories'

export type { NursingTaskRecord }

export async function getAllTasks(): Promise<NursingTaskRecord[]> {
  return nursingTaskRepo().getAll()
}

export async function getTaskById(id: string): Promise<NursingTaskRecord | undefined> {
  return nursingTaskRepo().getById(id)
}

export async function getTasksByAssignee(assigneeId: string): Promise<NursingTaskRecord[]> {
  return nursingTaskRepo().getByAssignee(assigneeId)
}

export async function getTasksByPatient(patientId: string): Promise<NursingTaskRecord[]> {
  return nursingTaskRepo().getByPatient(patientId)
}

export async function getTasksByStatus(status: TaskStatus): Promise<NursingTaskRecord[]> {
  return nursingTaskRepo().getByStatus(status)
}

export async function getPendingTasks(): Promise<NursingTaskRecord[]> {
  return nursingTaskRepo().getByStatus('pending')
}

export async function getOverdueTasks(): Promise<NursingTaskRecord[]> {
  const pending = await nursingTaskRepo().getByStatus('pending')
  const inProgress = await nursingTaskRepo().getByStatus('in_progress')
  const now = new Date().toISOString()
  
  return [...pending, ...inProgress].filter(task => task.dueTime < now)
}

export async function createTask(
  task: Omit<NursingTaskRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<NursingTaskRecord> {
  return nursingTaskRepo().create(task)
}

export async function updateTask(
  id: string,
  updates: Partial<NursingTaskRecord>
): Promise<NursingTaskRecord | undefined> {
  return nursingTaskRepo().update(id, updates)
}

export async function startTask(id: string): Promise<NursingTaskRecord | undefined> {
  return nursingTaskRepo().update(id, { status: 'in_progress' })
}

export async function completeTask(
  id: string,
  completedBy: string,
  completedByName: string,
  notes?: string
): Promise<NursingTaskRecord | undefined> {
  return nursingTaskRepo().update(id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    completedBy,
    completedByName,
    notes,
  })
}

export async function cancelTask(id: string, notes?: string): Promise<NursingTaskRecord | undefined> {
  return nursingTaskRepo().update(id, {
    status: 'cancelled',
    notes,
  })
}

export async function reassignTask(
  id: string,
  newAssigneeId: string,
  newAssigneeName: string
): Promise<NursingTaskRecord | undefined> {
  return nursingTaskRepo().update(id, {
    assignedToId: newAssigneeId,
    assignedToName: newAssigneeName,
  })
}

export async function deleteTask(id: string): Promise<void> {
  return nursingTaskRepo().delete(id)
}

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'urgent':
      return 'red'
    case 'high':
      return 'orange'
    case 'medium':
      return 'yellow'
    case 'low':
      return 'green'
  }
}

export function getPriorityLabel(priority: TaskPriority): { en: string; ar: string } {
  switch (priority) {
    case 'urgent':
      return { en: 'Urgent', ar: 'عاجل' }
    case 'high':
      return { en: 'High', ar: 'عالي' }
    case 'medium':
      return { en: 'Medium', ar: 'متوسط' }
    case 'low':
      return { en: 'Low', ar: 'منخفض' }
  }
}

export function getStatusLabel(status: TaskStatus): { en: string; ar: string } {
  switch (status) {
    case 'pending':
      return { en: 'Pending', ar: 'قيد الانتظار' }
    case 'in_progress':
      return { en: 'In Progress', ar: 'قيد التنفيذ' }
    case 'completed':
      return { en: 'Completed', ar: 'مكتمل' }
    case 'overdue':
      return { en: 'Overdue', ar: 'متأخر' }
    case 'cancelled':
      return { en: 'Cancelled', ar: 'ملغي' }
  }
}

export async function getTaskStats(assigneeId?: string): Promise<{
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
}> {
  let tasks: NursingTaskRecord[]
  
  if (assigneeId) {
    tasks = await nursingTaskRepo().getByAssignee(assigneeId)
  } else {
    tasks = await nursingTaskRepo().getAll()
  }
  
  const now = new Date().toISOString()
  
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => 
      (t.status === 'pending' || t.status === 'in_progress') && t.dueTime < now
    ).length,
  }
}
