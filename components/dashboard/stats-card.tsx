'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'warning' | 'success' | 'destructive' | 'danger'
  className?: string
}

const variantStyles = {
  default: 'border-border',
  primary: 'border-primary/20 bg-primary/5',
  warning: 'border-warning/20 bg-warning/5',
  success: 'border-success/20 bg-success/5',
  destructive: 'border-destructive/20 bg-destructive/5',
  danger: 'border-destructive/20 bg-destructive/5',
}

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
  danger: 'bg-destructive/10 text-destructive',
}

export function StatsCard({
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden', variantStyles[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {(subtitle || description) && (
              <p className="text-xs text-muted-foreground">{subtitle || description}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                iconVariantStyles[variant]
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
