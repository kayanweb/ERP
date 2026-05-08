'use client'

import { useNotifications } from '@/contexts/notification-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Users, Circle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { UserPresence } from '@/types'

const roleLabels: Record<string, string> = {
  admin: 'مدير',
  head_nurse: 'رئيس التمريض',
  supervisor: 'مشرف',
  staff: 'ممرض',
}

interface OnlineUsersProps {
  className?: string
  compact?: boolean
}

export function OnlineUsers({ className, compact = false }: OnlineUsersProps) {
  const { onlineUsers } = useNotifications()

  const sortedUsers = [...onlineUsers].sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1
    if (!a.isOnline && b.isOnline) return 1
    return 0
  })

  const onlineCount = onlineUsers.filter((u) => u.isOnline).length

  if (compact) {
    return (
      <TooltipProvider>
        <div className={cn('flex items-center gap-1', className)}>
          <div className="flex -space-x-2">
            {sortedUsers.slice(0, 5).map((user) => (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarFallback
                        className={cn(
                          'text-xs',
                          user.isOnline
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
                        user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="text-center">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.department} - {roleLabels[user.role]}
                    </p>
                    <p className="text-xs">
                      {user.isOnline ? (
                        <span className="text-green-500">متصل الآن</span>
                      ) : (
                        <span className="text-muted-foreground">
                          آخر ظهور{' '}
                          {formatDistanceToNow(new Date(user.lastSeen), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          {sortedUsers.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{sortedUsers.length - 5}
            </Badge>
          )}
        </div>
      </TooltipProvider>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            المستخدمون
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            {onlineCount} متصل
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {sortedUsers.map((user) => (
              <UserItem key={user.id} user={user} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function UserItem({ user }: { user: UserPresence }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className={cn(
              user.isOnline
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {user.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
            user.isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          {user.department} • {roleLabels[user.role]}
        </p>
      </div>
      <div className="text-left">
        {user.isOnline ? (
          <span className="text-xs text-green-600">متصل</span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(user.lastSeen), {
              addSuffix: true,
              locale: ar,
            })}
          </span>
        )}
      </div>
    </div>
  )
}
