'use client';

import * as React from 'react';
import { Database, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { seedDemoDataAction } from '@/lib/actions/seed';
import { Button } from '@/components/ui/button';

interface SeedButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  label?: string;
  className?: string;
}

export function SeedButton({
  variant = 'outline',
  size = 'sm',
  label = 'Load Demo Data',
  className,
}: SeedButtonProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleSeed = () => {
    startTransition(async () => {
      const res = await seedDemoDataAction();
      if (res.success) {
        toast.success('Demo data seeded successfully!');
      } else {
        toast.error(res.error || 'Failed to seed demo data');
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSeed}
      disabled={isPending}
      className={className}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          Seeding...
        </>
      ) : (
        <>
          <Database className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
          {label}
        </>
      )}
    </Button>
  );
}
