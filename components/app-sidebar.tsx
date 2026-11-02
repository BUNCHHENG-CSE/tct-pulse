'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ChevronRight,
  Columns3,
  ExternalLink,
  History,
  LogOut,
  MessageSquare,
  Zap,
} from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/lib/actions/auth';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  userEmail?: string | null;
}

const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'Feedback',
    href: '/feedback',
    icon: MessageSquare,
  },
  {
    title: 'Roadmap',
    href: '/roadmap',
    icon: Columns3,
  },
  {
    title: 'Changelog',
    href: '/changelog',
    icon: History,
  },
] as const;

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const { open, setOpen, isMobile } = useSidebar();

  const handleNavClick = React.useCallback(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  return (
    <Sidebar className="border-r border-border bg-sidebar font-mono select-none">
      <SidebarHeader
        className={cn(
          'flex h-14 items-center border-b border-border transition-all',
          open ? 'px-3.5 justify-between' : 'px-0 justify-center'
        )}
      >
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className={cn(
            'flex items-center gap-2.5 overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md',
            !open && 'justify-center'
          )}
          title="tctPulse Workspace"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background shadow-xs">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          {open && (
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="font-mono font-bold tracking-tight text-foreground flex items-center gap-1.5 text-xs">
                tctPulse
                <span className="rounded px-1 py-0 text-[9px] font-mono text-muted-foreground border border-border bg-muted/40">
                  CLI
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground truncate font-sans">
                product operations
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 flex flex-col justify-between">
        <div className="space-y-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80 px-2.5 mb-1">
              Workspace
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          'group/item relative rounded-md text-xs font-mono transition-all duration-150',
                          open
                            ? 'px-2.5 py-2 justify-between'
                            : 'px-0 py-2 justify-center',
                          isActive
                            ? 'bg-accent text-accent-foreground font-semibold shadow-xs'
                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        )}
                      >
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                          title={!open ? item.title : undefined}
                        >
                          <span
                            className={cn(
                              'flex items-center gap-2.5 min-w-0',
                              !open && 'justify-center'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-4 w-4 shrink-0 transition-colors',
                                isActive
                                  ? 'text-foreground'
                                  : 'text-muted-foreground group-hover/item:text-foreground'
                              )}
                            />
                            {open && (
                              <span className="truncate">{item.title}</span>
                            )}
                          </span>
                          {open && isActive && (
                            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80 px-2.5 mb-1">
              Public
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'rounded-md text-xs font-mono text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                      open
                        ? 'px-2.5 py-2 justify-between'
                        : 'px-0 py-2 justify-center'
                    )}
                  >
                    <Link
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={!open ? 'Public Portal' : undefined}
                    >
                      <span
                        className={cn(
                          'flex items-center gap-2.5 min-w-0',
                          !open && 'justify-center'
                        )}
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        {open && <span className="truncate">Public Portal</span>}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2.5 bg-muted/20">
        <div
          className={cn(
            'flex items-center gap-2',
            open ? 'justify-between' : 'flex-col justify-center'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2.5 overflow-hidden min-w-0',
              !open && 'justify-center'
            )}
            title={userEmail || 'admin@tctpulse.dev'}
          >
            <Avatar className="h-7 w-7 shrink-0 rounded-md border border-border">
              <AvatarFallback className="bg-muted text-foreground text-[10px] font-mono font-bold rounded-md">
                {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'AD'}
              </AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex flex-col overflow-hidden text-left leading-tight min-w-0">
                <span className="truncate text-[11px] font-mono font-medium text-foreground">
                  {userEmail || 'admin@tctpulse.dev'}
                </span>
                <span className="text-[9px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  online
                </span>
              </div>
            )}
          </div>
          <form action={signOutAction} className="shrink-0">
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              title="Sign out"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
