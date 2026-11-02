'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, MessageSquare, ShieldCheck } from 'lucide-react';
import type { Post } from '@/types/database';
import { UpvoteButton } from './upvote-button';
import { getCategoryBadge, getStatusBadge } from './post-badges';
import { cn } from '@/lib/utils';

export { getCategoryBadge, getStatusBadge };

interface PostCardProps {
  post: Post;
  isLoggedIn?: boolean;
  onOpenDetail?: (post: Post) => void;
  onVoteChange?: (count: number, hasUpvoted: boolean) => void;
}

export function PostCard({ post, isLoggedIn = false, onOpenDetail, onVoteChange }: PostCardProps) {
  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
    } catch {
      return 'recently';
    }
  }, [post.created_at]);

  const authorInitials = post.author_email
    ? post.author_email.slice(0, 2).toUpperCase()
    : 'U';

  const authorName = post.author_email
    ? post.author_email.split('@')[0]
    : 'community';

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(post)}
      className={cn(
        'group relative flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-foreground/40 hover:bg-muted/10 cursor-pointer shadow-xs'
      )}
    >
      <UpvoteButton
        postId={post.id}
        initialUpvotes={post.upvotes_count}
        initialHasUpvoted={post.has_upvoted}
        isLoggedIn={isLoggedIn}
        onVoteChange={onVoteChange}
      />

      <div className="flex-1 space-y-2 overflow-hidden min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {getCategoryBadge(post.category)}
            {getStatusBadge(post.status)}
            {post.target_quarter && post.target_quarter !== 'None' && (
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded border border-border bg-muted/60 text-muted-foreground font-mono">
                <Calendar className="h-2.5 w-2.5" /> {post.target_quarter}
              </span>
            )}
            {post.admin_response && (
              <span
                className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono"
                title="Team Replied"
              >
                <ShieldCheck className="h-2.5 w-2.5" /> Team Replied
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
            {timeAgo}
          </span>
        </div>

        <div>
          <h3 className="font-mono font-semibold text-foreground text-sm tracking-tight leading-snug group-hover:text-foreground transition-colors line-clamp-1">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans">
            {post.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">by</span>
            <span className="text-[11px] font-medium text-foreground truncate max-w-[140px] sm:max-w-none">
              @{authorName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="tabular-nums font-mono text-[11px]">
              {post.comments_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
