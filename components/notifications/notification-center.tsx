'use client'

import { useState } from 'react'
import { useNotifications } from '@/contexts/notification-context'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Siren,
  ArrowLeftRight,
  AlertTriangle,
  ListTodo,
  Package,
  MessageSquare,
  Clock,
  HeartPulse,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'
import { Notification } from '@/types'

const notificationIcons: Record<string, React.ElementType> = {
  emergency_code: Siren,
  handover_request: ArrowLeftRight,
  task_assigned: ListTodo,
  task_overdue: Clock,
  incident_report: AlertTriangle,
  vital_alert: HeartPulse,
  inventory_low: Package,
  equipment_issue: Wrench,
  message: MessageSquare,
  shift_reminder: Clock,
  approval_needed: Check,
  system: Bell,
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  normal: 'bg-primary text-primary-foreground',
  low: 'bg-muted text-muted-foreground',
}

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isConnected,
    soundEnabled,
    markAsRead,
    markAllAsRead,
    removeNotification,
    toggleSound,
  } = useNotifications()

  const [open, setOpen] = useState(false)

  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1.5 text-xs animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">الإشعارات</h3>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSound}
              title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={markAllAsRead}
                title="تحديد الكل كمقروء"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="unread" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="unread"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              غير مقروءة ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              الكل ({notifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="mt-0">
            <ScrollArea className="h-80">
              {unreadNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BellOff className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">لا توجد إشعارات جديدة</p>
                </div>
              ) : (
                <div className="divide-y">
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onRemove={removeNotification}
                      onClose={() => setOpen(false)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BellOff className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onRemove={removeNotification}
                      onClose={() => setOpen(false)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full text-sm"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href="/notifications">عرض كل الإشعارات</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
  onClose,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onRemove: (id: string) => void
  onClose: () => void
}) {
  const Icon = notificationIcons[notification.type] || Bell

  return (
    <div
      className={cn(
        'group relative flex gap-3 p-4 transition-colors hover:bg-muted/50',
        !notification.read && 'bg-primary/5'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          notification.priority === 'urgent'
            ? 'bg-destructive/10 text-destructive'
            : notification.priority === 'high'
            ? 'bg-warning/10 text-warning'
            : 'bg-primary/10 text-primary'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium leading-tight',
              !notification.read && 'font-semibold'
            )}
          >
            {notification.titleAr}
          </p>
          <Badge
            variant="outline"
            className={cn(
              'shrink-0 text-xs',
              notification.priority === 'urgent' && 'border-destructive text-destructive',
              notification.priority === 'high' && 'border-warning text-warning'
            )}
          >
            {notification.priority === 'urgent'
              ? 'عاجل'
              : notification.priority === 'high'
              ? 'مهم'
              : notification.priority === 'normal'
              ? 'عادي'
              : 'منخفض'}
          </Badge>
        </div>

        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {notification.messageAr}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: ar,
            })}
          </span>

          {notification.actionUrl && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              asChild
              onClick={() => {
                if (!notification.read) {
                  onMarkAsRead(notification.id)
                }
                onClose()
              }}
            >
              <Link href={notification.actionUrl}>
                {notification.actionLabelAr || 'عرض'}
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="absolute left-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onMarkAsRead(notification.id)}
            title="تحديد كمقروء"
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={() => onRemove(notification.id)}
          title="حذف"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {!notification.read && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      )}
    </div>
  )
}
