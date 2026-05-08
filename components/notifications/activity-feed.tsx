'use client'

import { useNotifications } from '@/contexts/notification-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Activity as ActivityIcon, Circle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Activity } from '@/types'

const activityColors: Record<string, string> = {
  emergency_code: 'bg-destructive',
  report_submitted: 'bg-primary',
  patient_admitted: 'bg-green-500',
  patient_discharged: 'bg-blue-500',
  handover_completed: 'bg-purple-500',
  task_completed: 'bg-green-500',
  incident_reported: 'bg-warning',
  default: 'bg-muted-foreground',
}

interface ActivityFeedProps {
  className?: string
  maxItems?: number
  showHeader?: boolean
}

export function ActivityFeed({
  className,
  maxItems = 10,
  showHeader = true,
}: ActivityFeedProps) {
  const { activities, onlineUsers } = useNotifications()

  const displayActivities = activities.slice(0, maxItems)
  const onlineCount = onlineUsers.filter((u) => u.isOnline).length

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-primary" />
              النشاط المباشر
            </CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
              {onlineCount} متصل
            </Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(!showHeader && 'pt-6')}>
        <ScrollArea className="h-64">
          {displayActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ActivityIcon className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">لا يوجد نشاط حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  const colorClass =
    activityColors[activity.type] || activityColors.default

  return (
    <div className="flex items-start gap-3">
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {activity.userName.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background',
            colorClass
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{activity.userName}</span>{' '}
          <span className="text-muted-foreground">{activity.actionAr}</span>
          {activity.target && (
            <>
              {' - '}
              <span className="font-medium">{activity.target}</span>
            </>
          )}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
              locale: ar,
            })}
          </span>
          {activity.department && (
            <>
              <span>•</span>
              <span>{activity.department}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
