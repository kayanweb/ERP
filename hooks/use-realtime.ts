'use client'

import { useState, useEffect, useCallback } from 'react'
// import { ref, onValue, set, update, push, remove } from 'firebase/database'
// import { getRealtimeDb } from '@/lib/firebase'

// Hook for real-time data subscription
export function useRealtimeData<T>(path: string, initialData: T): {
  data: T
  loading: boolean
  error: Error | null
  refresh: () => void
} {
  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    // In production, this would refetch from Firebase
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    // In production, this would connect to Firebase Realtime Database
    // const db = getRealtimeDb()
    // const dataRef = ref(db, path)
    // const unsubscribe = onValue(dataRef, (snapshot) => {
    //   const val = snapshot.val()
    //   setData(val || initialData)
    //   setLoading(false)
    // }, (err) => {
    //   setError(err)
    //   setLoading(false)
    // })
    // return () => unsubscribe()

    // Simulate loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timeout)
  }, [path])

  return { data, loading, error, refresh }
}

// Hook for real-time presence
export function usePresence(userId: string) {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSeen, setLastSeen] = useState<string>(new Date().toISOString())

  useEffect(() => {
    // In production, this would track user presence in Firebase
    // const db = getRealtimeDb()
    // const presenceRef = ref(db, `presence/${userId}`)
    // const connectedRef = ref(db, '.info/connected')
    //
    // const unsubscribe = onValue(connectedRef, (snapshot) => {
    //   if (snapshot.val() === true) {
    //     set(presenceRef, {
    //       isOnline: true,
    //       lastSeen: new Date().toISOString(),
    //     })
    //     onDisconnect(presenceRef).set({
    //       isOnline: false,
    //       lastSeen: new Date().toISOString(),
    //     })
    //   }
    // })
    //
    // return () => unsubscribe()

    // Update last seen periodically
    const interval = setInterval(() => {
      setLastSeen(new Date().toISOString())
    }, 60000)

    // Handle visibility change
    const handleVisibilityChange = () => {
      setIsOnline(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId])

  return { isOnline, lastSeen }
}

// Hook for real-time typing indicator
export function useTypingIndicator(channelId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const startTyping = useCallback(() => {
    setIsTyping(true)
    // In production, update Firebase
    // const db = getRealtimeDb()
    // set(ref(db, `typing/${channelId}/${userId}`), {
    //   typing: true,
    //   timestamp: Date.now(),
    // })
  }, [channelId, userId])

  const stopTyping = useCallback(() => {
    setIsTyping(false)
    // In production, remove from Firebase
    // const db = getRealtimeDb()
    // remove(ref(db, `typing/${channelId}/${userId}`))
  }, [channelId, userId])

  useEffect(() => {
    // In production, listen for typing changes
    // const db = getRealtimeDb()
    // const typingRef = ref(db, `typing/${channelId}`)
    // const unsubscribe = onValue(typingRef, (snapshot) => {
    //   const data = snapshot.val() || {}
    //   const users = Object.keys(data).filter(id => id !== userId && data[id].typing)
    //   setTypingUsers(users)
    // })
    // return () => unsubscribe()

    return () => {}
  }, [channelId, userId])

  return { typingUsers, isTyping, startTyping, stopTyping }
}

// Hook for real-time counters
export function useRealtimeCounter(path: string, initialValue: number = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => {
    setCount((prev) => prev + 1)
    // In production, use Firebase transaction
    // const db = getRealtimeDb()
    // runTransaction(ref(db, path), (current) => (current || 0) + 1)
  }, [path])

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(0, prev - 1))
    // In production, use Firebase transaction
  }, [path])

  const reset = useCallback(() => {
    setCount(initialValue)
    // In production, set Firebase value
  }, [initialValue, path])

  return { count, increment, decrement, reset }
}

// Hook for real-time list operations
export function useRealtimeList<T extends { id: string }>(
  path: string,
  initialData: T[] = []
) {
  const [items, setItems] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)

  const addItem = useCallback((item: Omit<T, 'id'>) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    } as T
    setItems((prev) => [newItem, ...prev])
    // In production, push to Firebase
    // const db = getRealtimeDb()
    // const newRef = push(ref(db, path))
    // set(newRef, { ...item, id: newRef.key })
    return newItem
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
    // In production, update Firebase
    // const db = getRealtimeDb()
    // update(ref(db, `${path}/${id}`), updates)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    // In production, remove from Firebase
    // const db = getRealtimeDb()
    // remove(ref(db, `${path}/${id}`))
  }, [])

  return { items, loading, addItem, updateItem, removeItem, setItems }
}
