/**
 * Messages Service
 */
import { messageRepo } from '@/lib/repositories'
import type { MessageRecord } from '@/lib/repositories'

export type { MessageRecord }

export async function getAllMessages(): Promise<MessageRecord[]> {
  return messageRepo().getAll()
}

export async function getMessageById(id: string): Promise<MessageRecord | undefined> {
  return messageRepo().getById(id)
}

export async function getInbox(userId: string): Promise<MessageRecord[]> {
  return messageRepo().getByRecipient(userId)
}

export async function getSent(userId: string): Promise<MessageRecord[]> {
  return messageRepo().getBySender(userId)
}

export async function getUnreadMessages(userId: string): Promise<MessageRecord[]> {
  return messageRepo().getUnread(userId)
}

export async function getUnreadCount(userId: string): Promise<number> {
  const unread = await messageRepo().getUnread(userId)
  return unread.length
}

export async function sendMessage(
  message: Omit<MessageRecord, 'id' | 'createdAt' | 'isRead'>
): Promise<MessageRecord> {
  return messageRepo().create({ ...message, isRead: false })
}

export async function replyToMessage(
  parentId: string,
  reply: Omit<MessageRecord, 'id' | 'createdAt' | 'isRead' | 'parentId'>
): Promise<MessageRecord> {
  return messageRepo().create({ 
    ...reply, 
    isRead: false,
    parentId,
  })
}

export async function markAsRead(id: string): Promise<MessageRecord | undefined> {
  return messageRepo().update(id, {
    isRead: true,
    readAt: new Date().toISOString(),
  })
}

export async function markAsUnread(id: string): Promise<MessageRecord | undefined> {
  return messageRepo().update(id, {
    isRead: false,
    readAt: undefined,
  })
}

export async function deleteMessage(id: string): Promise<void> {
  return messageRepo().delete(id)
}

export async function getThread(messageId: string): Promise<MessageRecord[]> {
  const message = await messageRepo().getById(messageId)
  if (!message) return []
  
  // Find root message
  let rootId = message.parentId || messageId
  const all = await messageRepo().getAll()
  
  // Find the root if we're not at it yet
  while (true) {
    const parent = all.find(m => m.id === rootId && m.parentId)
    if (parent?.parentId) {
      rootId = parent.parentId
    } else {
      break
    }
  }
  
  // Get all messages in thread
  const thread: MessageRecord[] = []
  const collectThread = (id: string) => {
    const msg = all.find(m => m.id === id)
    if (msg) {
      thread.push(msg)
      all.filter(m => m.parentId === id).forEach(child => collectThread(child.id))
    }
  }
  collectThread(rootId)
  
  return thread.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function getPriorityLabel(priority: MessageRecord['priority']): { en: string; ar: string; color: string } {
  const labels: Record<string, { en: string; ar: string; color: string }> = {
    normal: { en: 'Normal', ar: 'عادي', color: 'gray' },
    high: { en: 'High', ar: 'عالي', color: 'orange' },
    urgent: { en: 'Urgent', ar: 'عاجل', color: 'red' },
  }
  return labels[priority]
}

export async function getMessageStats(userId: string): Promise<{
  inbox: number
  unread: number
  sent: number
}> {
  const [inbox, unread, sent] = await Promise.all([
    messageRepo().getByRecipient(userId),
    messageRepo().getUnread(userId),
    messageRepo().getBySender(userId),
  ])
  
  return {
    inbox: inbox.length,
    unread: unread.length,
    sent: sent.length,
  }
}
