'use client';

import * as React from 'react';
import { Check, Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-md border-border bg-background hover:bg-muted cursor-pointer font-mono text-xs transition-colors"
          title="Toggle theme"
        >
          {mounted && theme === 'light' ? (
            <Sun className="h-3.5 w-3.5 text-foreground transition-transform" />
          ) : mounted && theme === 'dark' ? (
            <Moon className="h-3.5 w-3.5 text-foreground transition-transform" />
          ) : (
            <>
              <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-lg font-mono text-xs min-w-[130px] p-1 shadow-md border-border bg-popover">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="cursor-pointer flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Light</span>
          </div>
          {mounted && theme === 'light' && <Check className="h-3 w-3 text-foreground" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="cursor-pointer flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Dark</span>
          </div>
          {mounted && theme === 'dark' && <Check className="h-3 w-3 text-foreground" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="cursor-pointer flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
            <span>System</span>
          </div>
          {mounted && theme === 'system' && <Check className="h-3 w-3 text-foreground" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
