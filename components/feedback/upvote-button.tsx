'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { toggleUpvoteAction } from '@/lib/actions/posts';

interface UpvoteButtonProps {
  postId: string;
  initialUpvotes: number;
  initialHasUpvoted?: boolean;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'default';
  isLoggedIn?: boolean;
  onVoteChange?: (newCount: number, hasUpvoted: boolean) => void;
}

export function UpvoteButton({
  postId,
  initialUpvotes,
  initialHasUpvoted = false,
  orientation = 'vertical',
  size = 'default',
  isLoggedIn = false,
  onVoteChange,
}: UpvoteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [voteCount, setVoteCount] = React.useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = React.useState(initialHasUpvoted);

  React.useEffect(() => {
    setVoteCount(initialUpvotes);
    setHasUpvoted(initialHasUpvoted);
  }, [initialUpvotes, initialHasUpvoted]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const previousCount = voteCount;
    const previousHasUpvoted = hasUpvoted;

    const nextHasUpvoted = !hasUpvoted;
    const nextCount = nextHasUpvoted
      ? voteCount + 1
      : Math.max(0, voteCount - 1);

    // Optimistically update local state immediately
    setVoteCount(nextCount);
    setHasUpvoted(nextHasUpvoted);
    onVoteChange?.(nextCount, nextHasUpvoted);

    startTransition(async () => {
      const res = await toggleUpvoteAction(postId);
      if (!res.success) {
        // Rollback on failure
        setVoteCount(previousCount);
        setHasUpvoted(previousHasUpvoted);
        onVoteChange?.(previousCount, previousHasUpvoted);

        if (res.error?.includes('signed in')) {
          toast.info('Please sign in to upvote feature requests', {
            action: {
              label: 'Sign In',
              onClick: () => router.push('/login'),
            },
          });
        } else {
          toast.error(res.error || 'Failed to update vote');
        }
      } else {
        if (res.data) {
          setVoteCount(res.data.upvotesCount);
          setHasUpvoted(res.data.hasUpvoted);
          onVoteChange?.(res.data.upvotesCount, res.data.hasUpvoted);
        }
        router.refresh();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={hasUpvoted ? 'Remove upvote' : 'Upvote this request'}
      className={cn(
        'group relative flex items-center justify-center rounded-lg border font-mono font-medium transition-all duration-150 cursor-pointer select-none active:scale-95',
        orientation === 'vertical'
          ? 'flex-col gap-0.5 px-2.5 py-1.5 min-w-[44px]'
          : 'flex-row gap-1.5 px-2.5 py-1',
        size === 'sm' && orientation === 'vertical' ? 'min-w-[40px] py-1 text-[11px]' : 'text-xs',
        hasUpvoted
          ? 'bg-foreground text-background border-foreground shadow-xs'
          : 'bg-card border-border text-muted-foreground hover:border-foreground/40 hover:bg-muted/40 hover:text-foreground'
      )}
    >
      <ChevronUp
        className={cn(
          'transition-transform duration-150 group-hover:-translate-y-0.5',
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5',
          hasUpvoted
            ? 'text-background stroke-[2.5]'
            : 'text-muted-foreground group-hover:text-foreground stroke-[2]'
        )}
      />
      <span className="font-mono text-xs tabular-nums leading-none">
        {voteCount}
      </span>
    </button>
  );
}
