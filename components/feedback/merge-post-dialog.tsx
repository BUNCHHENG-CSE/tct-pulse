'use client';

import * as React from 'react';
import { GitMerge, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import type { Post } from '@/types/database';
import { mergePostsAction } from '@/lib/actions/posts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCategoryBadge } from './post-card';
import { cn } from '@/lib/utils';

interface MergePostDialogProps {
  sourcePost: Post | null;
  isOpen: boolean;
  onClose: () => void;
  allPosts: Post[];
  onMerged?: (targetId: string) => void;
}

export function MergePostDialog({
  sourcePost,
  isOpen,
  onClose,
  allPosts,
  onMerged,
}: MergePostDialogProps) {
  const [search, setSearch] = React.useState('');
  const [selectedTargetId, setSelectedTargetId] = React.useState<string | null>(null);
  const [isMerging, setIsMerging] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedTargetId(null);
    }
  }, [isOpen]);

  if (!sourcePost) return null;

  const candidatePosts = allPosts.filter(
    (p) =>
      p.id !== sourcePost.id &&
      (search.trim() === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedTarget = allPosts.find((p) => p.id === selectedTargetId);

  const handleMerge = async () => {
    if (!selectedTargetId) {
      toast.error('Please select a target post to merge into');
      return;
    }

    setIsMerging(true);
    try {
      const res = await mergePostsAction(sourcePost.id, selectedTargetId);
      if (res.success) {
        toast.success(`Merged "${sourcePost.title}" into "${selectedTarget?.title}"`);
        onMerged?.(selectedTargetId);
        onClose();
      } else {
        toast.error(res.error || 'Failed to merge posts');
      }
    } catch {
      toast.error('Unexpected error while merging posts');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg rounded-xl bg-card border-border p-5 font-mono overflow-hidden">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-mono">
            <GitMerge className="h-3.5 w-3.5 shrink-0" />
            <span>// post deduplication</span>
          </div>
          <DialogTitle className="text-base font-mono font-bold tracking-tight">
            Merge Duplicate Feedback
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Merge duplicate requests into a single initiative. Upvotes will be combined.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1 min-w-0">
          {/* Source Post Info */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1 overflow-hidden">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Source Post (Will be merged & closed)
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0">{getCategoryBadge(sourcePost.category)}</span>
              <span className="text-xs font-semibold text-foreground truncate min-w-0" title={sourcePost.title}>
                {sourcePost.title}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              Transferring <span className="text-foreground font-bold">{sourcePost.upvotes_count}</span> upvotes
            </p>
          </div>

          {/* Search Target */}
          <div className="space-y-2 min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Select Canonical Target Post
            </span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search target initiative..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs font-mono rounded-md bg-background border-border w-full"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border border-border p-1 bg-background/50">
              {candidatePosts.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No matching posts found.
                </div>
              ) : (
                candidatePosts.map((post) => {
                  const isSelected = post.id === selectedTargetId;
                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedTargetId(post.id)}
                      className={cn(
                        'flex items-center justify-between gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors min-w-0',
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground font-medium'
                          : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                        <span className="shrink-0">{getCategoryBadge(post.category)}</span>
                        <span className="truncate min-w-0 text-foreground" title={post.title}>{post.title}</span>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted border border-border">
                        ▲ {post.upvotes_count}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {selectedTarget && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5 text-[11px] font-mono text-foreground space-y-1 min-w-0 overflow-hidden">
              <p className="truncate min-w-0">
                ✓ Combined upvotes will become:{' '}
                <span className="font-bold">
                  {selectedTarget.upvotes_count + sourcePost.upvotes_count}
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isMerging}
            className="rounded-md font-mono"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleMerge}
            disabled={!selectedTargetId || isMerging}
            className="gap-1.5 rounded-md font-mono"
          >
            {isMerging ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <GitMerge className="h-3.5 w-3.5" />
                Confirm Merge
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
