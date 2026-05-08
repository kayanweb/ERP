'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HeartPulse, ChevronDown, LogOut } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { navigationConfig } from '@/config/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useLang } from '@/contexts/lang-context'

export function AppSidebar() {
  const pathname = usePathname()
  const { user, can, logout } = useAuth()
  const { isAr } = useLang()

  // Defer everything that differs between server/client to after mount
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (href: string) => {
    if (!mounted) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  // On server (and first paint) render all items; after mount filter by permission
  const getFilteredItems = (items: typeof navigationConfig[0]['items']) => {
    if (!mounted) return items
    return items.filter((item) => !item.permission || can(item.permission))
  }

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none min-w-0">
                  <span className="font-bold text-base truncate">PRO Nurse</span>
                  <span className="text-xs text-sidebar-foreground/70 truncate">
                    {isAr ? 'نظام إدارة التمريض' : 'Nursing Management'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigationConfig.map((group) => {
          const filteredItems = getFilteredItems(group.items)
          if (filteredItems.length === 0) return null

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>
                {isAr ? group.titleAr : group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon

                    if (item.children && item.children.length > 0) {
                      return (
                        <Collapsible key={item.href} asChild defaultOpen={active}>
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton tooltip={isAr ? item.titleAr : item.title}>
                                <Icon className="h-4 w-4" />
                                <span>{isAr ? item.titleAr : item.title}</span>
                                <ChevronDown className="mr-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.children.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.href}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={mounted && pathname === subItem.href}
                                    >
                                      <Link href={subItem.href}>
                                        <span>{isAr ? subItem.titleAr : subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      )
                    }

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={isAr ? item.titleAr : item.title}
                        >
                          <Link href={item.href}>
                            <Icon className="h-4 w-4" />
                            <span>{isAr ? item.titleAr : item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {user?.nameAr?.charAt(0) || 'م'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none min-w-0 flex-1">
                <span className="font-semibold text-sm truncate">{user?.nameAr}</span>
                <span className="text-xs text-sidebar-foreground/70">
                  {user?.role === 'admin' && (isAr ? 'مدير النظام' : 'System Admin')}
                  {user?.role === 'head_nurse' && (isAr ? 'رئيس التمريض' : 'Head Nurse')}
                  {user?.role === 'supervisor' && (isAr ? 'مشرف' : 'Supervisor')}
                  {user?.role === 'staff' && (isAr ? 'موظف' : 'Staff')}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {logout && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => logout()}
                tooltip={isAr ? "تسجيل الخروج" : "Logout"}
              >
                <LogOut className="h-4 w-4" />
                <span>{isAr ? "تسجيل الخروج" : "Logout"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
