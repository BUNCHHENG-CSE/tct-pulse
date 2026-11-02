import * as React from 'react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { CommandMenu } from '@/components/command-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar userEmail={user?.email} />
      <SidebarInset className="flex flex-1 flex-col overflow-hidden bg-background font-mono">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-8 w-8 rounded-md hover:bg-muted" />
            <Separator orientation="vertical" className="h-3.5" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-foreground hidden sm:inline-block">
                workspace
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">/</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-border text-[10px] font-mono text-muted-foreground bg-muted/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                connected
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CommandMenu />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
