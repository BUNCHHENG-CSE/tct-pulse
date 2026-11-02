'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, Sparkles, Trash2, Wrench, Bug } from 'lucide-react';
import { toast } from 'sonner';

import type { Changelog } from '@/types/database';
import { deleteChangelogAction } from '@/lib/actions/changelogs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ChangelogItemProps {
  log: Changelog;
  isLoggedIn?: boolean;
}

export function ChangelogItem({ log, isLoggedIn = false }: ChangelogItemProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete release ${log.version}?`)) return;
    setIsDeleting(true);
    const res = await deleteChangelogAction(log.id);
    setIsDeleting(false);
    if (res.success) {
      toast.success(`Release ${log.version} deleted`);
    } else {
      toast.error(res.error || 'Failed to delete release');
    }
  };

  const formattedDate = format(new Date(log.published_at), 'MMMM d, yyyy');

  return (
    <div className="relative group font-mono">
      {/* Timeline indicator node */}
      <div className="absolute -left-[31px] sm:-left-[39px] top-3 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background border-2 border-foreground" />

      <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3 transition-colors hover:border-foreground/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-[11px] px-2 py-0 border-border bg-muted/50 text-foreground font-bold">
              {log.version}
            </Badge>

            <Badge
              variant={
                log.tag === 'new'
                  ? 'success'
                  : log.tag === 'improved'
                  ? 'outline'
                  : 'destructive'
              }
              className="text-[10px] uppercase tracking-wider font-mono gap-1 py-0 px-2"
            >
              {log.tag === 'new' && <Sparkles className="h-3 w-3" />}
              {log.tag === 'improved' && <Wrench className="h-3 w-3" />}
              {log.tag === 'fixed' && <Bug className="h-3 w-3" />}
              {log.tag === 'new'
                ? 'Feature'
                : log.tag === 'improved'
                ? 'Improvement'
                : 'Bug Fix'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>

            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded"
                title="Delete release note"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <h3 className="text-base font-mono font-bold tracking-tight text-foreground">
          {log.title}
        </h3>

        <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
          {log.content}
        </div>
      </div>
    </div>
  );
}
