'use client'

import { useState, useEffect } from 'react'
import { Alert } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertCardProps {
  alerts: Alert[]
  className?: string
}

export function AlertCard({ alerts, className }: AlertCardProps) {
  if (alerts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            التنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد تنبيهات حالياً
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          التنبيهات
          <Badge variant="secondary" className="mr-auto">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </CardContent>
    </Card>
  )
}

function AlertItem({ alert }: { alert: Alert }) {
  const [formattedTime, setFormattedTime] = useState<string>('')

  useEffect(() => {
    // Format time only on client to avoid hydration mismatch
    setFormattedTime(new Date(alert.timestamp).toLocaleTimeString('ar-EG'))
  }, [alert.timestamp])

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        alert.severity === 'critical'
          ? 'bg-destructive/5 border-destructive/20'
          : 'bg-warning/5 border-warning/20'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          alert.severity === 'critical' ? 'bg-destructive/10' : 'bg-warning/10'
        )}
      >
        <AlertTriangle
          className={cn(
            'h-4 w-4',
            alert.severity === 'critical' ? 'text-destructive' : 'text-warning'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{alert.messageAr}</p>
        {alert.department && (
          <p className="text-xs text-muted-foreground mt-1">
            القسم: {alert.department}
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
          <Clock className="h-3 w-3" />
          <span suppressHydrationWarning>{formattedTime || '--:--:--'}</span>
        </div>
      </div>
    </div>
  )
}
