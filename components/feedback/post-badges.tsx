import * as React from 'react';
import { Sparkles, Bug, Wrench, Puzzle, CheckCircle2, Clock } from 'lucide-react';
import type { PostCategory, PostStatus } from '@/types/database';
import { Badge } from '@/components/ui/badge';

export function getCategoryBadge(category: PostCategory) {
  switch (category) {
    case 'feature':
      return (
        <Badge variant="outline" className="gap-1 font-mono text-[10px] py-0 px-2 uppercase tracking-wider font-semibold border-border bg-muted/40 text-foreground">
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          Feature
        </Badge>
      );
    case 'bug':
      return (
        <Badge variant="destructive" className="gap-1 font-mono text-[10px] py-0 px-2 uppercase tracking-wider font-semibold">
          <Bug className="h-3 w-3" />
          Bug
        </Badge>
      );
    case 'improvement':
      return (
        <Badge variant="warning" className="gap-1 font-mono text-[10px] py-0 px-2 uppercase tracking-wider font-semibold">
          <Wrench className="h-3 w-3" />
          Improvement
        </Badge>
      );
    case 'integration':
      return (
        <Badge variant="outline" className="gap-1 font-mono text-[10px] py-0 px-2 uppercase tracking-wider font-semibold border-border bg-secondary text-secondary-foreground">
          <Puzzle className="h-3 w-3" />
          Integration
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="font-mono text-[10px]">{category}</Badge>;
  }
}

export function getStatusBadge(status: PostStatus) {
  switch (status) {
    case 'under_review':
      return (
        <Badge variant="outline" className="gap-1.5 text-[10px] font-mono font-medium border-border/80 text-muted-foreground bg-muted/30">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
          Review
        </Badge>
      );
    case 'planned':
      return (
        <Badge variant="outline" className="gap-1.5 text-[10px] font-mono font-medium border-border text-foreground bg-muted/60">
          <Clock className="h-3 w-3 text-muted-foreground" />
          Planned
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="warning" className="gap-1.5 text-[10px] font-mono font-medium">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
          </span>
          In Progress
        </Badge>
      );
    case 'shipped':
      return (
        <Badge variant="success" className="gap-1.5 text-[10px] font-mono font-medium">
          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          Shipped
        </Badge>
      );
    default:
      return <Badge variant="outline" className="font-mono text-[10px]">{status}</Badge>;
  }
}
