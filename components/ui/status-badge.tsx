'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusType = 
  | 'done' | 'pending' | 'na' 
  | 'active' | 'inactive' 
  | 'draft' | 'submitted' | 'approved'
  | 'admitted' | 'discharged' | 'transferred'
  | 'open' | 'resolved'
  | 'morning' | 'evening' | 'night'

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Checklist statuses
  done: {
    label: 'تم',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  pending: {
    label: 'قيد الانتظار',
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  },
  na: {
    label: 'غير متاح',
    className: 'bg-muted text-muted-foreground border-muted hover:bg-muted',
  },
  // Staff statuses
  active: {
    label: 'نشط',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  inactive: {
    label: 'غير نشط',
    className: 'bg-muted text-muted-foreground border-muted hover:bg-muted',
  },
  // Report statuses
  draft: {
    label: 'مسودة',
    className: 'bg-muted text-muted-foreground border-muted hover:bg-muted',
  },
  submitted: {
    label: 'مُرسل',
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
  },
  approved: {
    label: 'معتمد',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  // Patient statuses
  admitted: {
    label: 'منوّم',
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
  },
  discharged: {
    label: 'مُخرَج',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  transferred: {
    label: 'محوّل',
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  },
  // Problem statuses
  open: {
    label: 'مفتوح',
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
  resolved: {
    label: 'محلول',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  // Shift types
  morning: {
    label: 'صباحي',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20',
  },
  evening: {
    label: 'مسائي',
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20',
  },
  night: {
    label: 'ليلي',
    className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
