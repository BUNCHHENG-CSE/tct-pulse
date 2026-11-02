'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Columns3,
  FileText,
  Home,
  Laptop,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative h-8 w-full justify-start rounded-md text-xs font-mono text-muted-foreground sm:w-56 sm:pr-10 md:w-64 bg-background border-border hover:bg-muted"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3 w-3 mr-2 text-muted-foreground" />
        <span className="hidden lg:inline-flex">Search command...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-semibold text-muted-foreground opacity-100 sm:flex">
          <span>⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or jump to page..." className="font-mono text-xs" />
        <CommandList className="font-mono text-xs">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/dashboard'))}
              className="cursor-pointer"
            >
              <BarChart3 className="mr-2 h-3.5 w-3.5" />
              <span>/dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/feedback'))}
              className="cursor-pointer"
            >
              <Activity className="mr-2 h-3.5 w-3.5" />
              <span>/feedback</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/roadmap'))}
              className="cursor-pointer"
            >
              <Columns3 className="mr-2 h-3.5 w-3.5" />
              <span>/roadmap</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/changelog'))}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-3.5 w-3.5" />
              <span>/changelog</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/'))}
              className="cursor-pointer"
            >
              <Home className="mr-2 h-3.5 w-3.5" />
              <span>/portal (public)</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))} className="cursor-pointer">
              <Sun className="mr-2 h-3.5 w-3.5" />
              <span>theme: light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))} className="cursor-pointer">
              <Moon className="mr-2 h-3.5 w-3.5" />
              <span>theme: dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))} className="cursor-pointer">
              <Laptop className="mr-2 h-3.5 w-3.5" />
              <span>theme: system</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
