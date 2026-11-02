'use client';

import * as React from 'react';
import {
  Bug,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  GripVertical,
  Layers,
  MessageSquare,
  MoreVertical,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Post, PostCategory, PostStatus } from '@/types/database';
import { updatePostStatusAction } from '@/lib/actions/posts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UpvoteButton } from '@/components/feedback/upvote-button';
import { getCategoryBadge } from '@/components/feedback/post-card';
import { PostDetailSheet } from '@/components/feedback/post-detail-sheet';
import { cn } from '@/lib/utils';

interface RoadmapBoardProps {
  initialPosts: Post[];
  isLoggedIn?: boolean;
  currentUserEmail?: string | null;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'feature', label: 'Features', icon: Sparkles },
  { id: 'bug', label: 'Bugs', icon: Bug },
  { id: 'improvement', label: 'Improvements', icon: Wrench },
  { id: 'integration', label: 'Integrations', icon: Puzzle },
] as const;

export function RoadmapBoard({
  initialPosts,
  isLoggedIn = false,
  currentUserEmail,
}: RoadmapBoardProps) {
  const [posts, setPosts] = React.useState<Post[]>(initialPosts);
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [, startTransition] = React.useTransition();

  // Drag and drop states
  const [draggedPostId, setDraggedPostId] = React.useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<PostStatus | null>(null);

  React.useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Optimistic list of posts
  const [optimisticPosts, setOptimisticPosts] = React.useOptimistic(
    posts,
    (state, update: { id: string; nextStatus: PostStatus }) =>
      state.map((p) => (p.id === update.id ? { ...p, status: update.nextStatus } : p))
  );

  const handleStatusChange = (postId: string, nextStatus: PostStatus) => {
    if (!isLoggedIn) {
      toast.info('You must be signed in to modify roadmap status');
      return;
    }

    const previousPosts = posts;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: nextStatus } : p))
    );
    setSelectedPost((prev) =>
      prev && prev.id === postId ? { ...prev, status: nextStatus } : prev
    );

    startTransition(async () => {
      setOptimisticPosts({ id: postId, nextStatus });
      const res = await updatePostStatusAction(postId, nextStatus);
      if (!res.success) {
        setPosts(previousPosts);
        toast.error(res.error || 'Failed to update status');
      } else {
        toast.success(`Moved to ${nextStatus.replace('_', ' ')}`);
      }
    });
  };

  const handleVoteChange = (postId: string, newCount: number, hasUpvoted: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, upvotes_count: newCount, has_upvoted: hasUpvoted }
          : p
      )
    );
    setSelectedPost((prev) =>
      prev && prev.id === postId
        ? { ...prev, upvotes_count: newCount, has_upvoted: hasUpvoted }
        : prev
    );
  };

  const filteredPosts = React.useMemo(() => {
    if (categoryFilter === 'all') return optimisticPosts;
    return optimisticPosts.filter((p) => p.category === categoryFilter);
  }, [optimisticPosts, categoryFilter]);

  const plannedPosts = filteredPosts.filter((p) => p.status === 'planned');
  const inProgressPosts = filteredPosts.filter((p) => p.status === 'in_progress');
  const shippedPosts = filteredPosts.filter((p) => p.status === 'shipped');

  const columns: {
    status: PostStatus;
    title: string;
    description: string;
    icon: React.ElementType;
    badgeVariant: 'outline' | 'warning' | 'success';
    posts: Post[];
  }[] = [
    {
      status: 'planned',
      title: 'Planned',
      description: 'Queued for development',
      icon: Clock,
      badgeVariant: 'outline',
      posts: plannedPosts,
    },
    {
      status: 'in_progress',
      title: 'In Progress',
      description: 'Active in development cycle',
      icon: Flame,
      badgeVariant: 'warning',
      posts: inProgressPosts,
    },
    {
      status: 'shipped',
      title: 'Shipped',
      description: 'Delivered in production',
      icon: CheckCircle2,
      badgeVariant: 'success',
      posts: shippedPosts,
    },
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Category Filter Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const isActive = categoryFilter === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-mono transition-all duration-150 cursor-pointer border',
                  isActive
                    ? 'bg-foreground text-background font-semibold border-foreground shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border/60'
                )}
              >
                <Icon className="h-3 w-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono px-1">
          {isLoggedIn && (
            <span className="hidden sm:inline-block text-[10px] text-muted-foreground/80">
              💡 Drag & drop cards between columns
            </span>
          )}
          <span>{filteredPosts.length} items</span>
        </div>
      </div>

      {/* 3-Column Kanban Board with Drag & Drop */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const Icon = col.icon;
          const isOverThisColumn = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverColumn !== col.status) {
                  setDragOverColumn(col.status);
                }
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragOverColumn(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverColumn(null);
                const postId = e.dataTransfer.getData('text/plain') || draggedPostId;
                if (postId) {
                  handleStatusChange(postId, col.status);
                }
                setDraggedPostId(null);
              }}
              className={cn(
                'flex flex-col rounded-xl border p-3.5 shadow-xs transition-all duration-200',
                isOverThisColumn
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border bg-card/60'
              )}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-foreground border border-border">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                      {col.title}
                    </h3>
                  </div>
                </div>
                <Badge variant={col.badgeVariant} className="font-mono text-[10px] px-1.5 py-0 h-4">
                  {col.posts.length}
                </Badge>
              </div>

              {/* Column Cards Drop Area */}
              <div className="flex flex-1 flex-col gap-2.5 min-h-[300px]">
                {col.posts.length === 0 ? (
                  <div
                    className={cn(
                      'flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-xs transition-colors',
                      isOverThisColumn
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-border/70 text-muted-foreground bg-muted/20'
                    )}
                  >
                    {isOverThisColumn ? 'Drop initiative here' : 'No items'}
                  </div>
                ) : (
                  col.posts.map((post) => {
                    const isBeingDragged = draggedPostId === post.id;
                    return (
                      <div
                        key={post.id}
                        draggable={isLoggedIn}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', post.id);
                          setDraggedPostId(post.id);
                        }}
                        onDragEnd={() => {
                          setDraggedPostId(null);
                          setDragOverColumn(null);
                        }}
                        onClick={() => {
                          if (draggedPostId) return;
                          setSelectedPost(post);
                          setIsSheetOpen(true);
                        }}
                        className={cn(
                          'group relative flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-xs transition-all duration-150',
                          isLoggedIn ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                          isBeingDragged
                            ? 'opacity-40 border-dashed border-primary scale-[0.98]'
                            : 'border-border hover:border-foreground/40 hover:bg-muted/10'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isLoggedIn && (
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground shrink-0" />
                            )}
                            {getCategoryBadge(post.category)}
                            {post.target_quarter && post.target_quarter !== 'None' && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded border border-border bg-muted/60 text-muted-foreground font-mono">
                                🎯 {post.target_quarter}
                              </span>
                            )}
                          </div>

                          {isLoggedIn && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-lg font-mono">
                                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
                                    Move Status
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(post.id, 'under_review')}
                                    className="text-xs"
                                  >
                                    Review
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(post.id, 'planned')}
                                    className="text-xs"
                                  >
                                    Planned
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(post.id, 'in_progress')}
                                    className="text-xs"
                                  >
                                    In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(post.id, 'shipped')}
                                    className="text-xs"
                                  >
                                    Shipped
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>

                        <h4 className="text-xs font-mono font-semibold text-foreground group-hover:text-foreground transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>

                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-sans">
                          {post.description}
                        </p>

                        {post.admin_response && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            <ShieldCheck className="h-3 w-3" />
                            <span className="truncate">Team update posted</span>
                          </div>
                        )}

                        <div className="mt-1 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground font-mono">
                          <UpvoteButton
                            postId={post.id}
                            initialUpvotes={post.upvotes_count}
                            initialHasUpvoted={post.has_upvoted}
                            orientation="horizontal"
                            size="sm"
                            isLoggedIn={isLoggedIn}
                            onVoteChange={(count, hasUpvoted) =>
                              handleVoteChange(post.id, count, hasUpvoted)
                            }
                          />

                          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span className="font-mono text-[11px] tabular-nums">
                              {post.comments_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <PostDetailSheet
        post={selectedPost}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedPost(null);
        }}
        isLoggedIn={isLoggedIn}
        currentUserEmail={currentUserEmail}
        allPosts={posts}
        onStatusChange={(postId, nextStatus) => {
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, status: nextStatus } : p))
          );
          setSelectedPost((prev) =>
            prev && prev.id === postId ? { ...prev, status: nextStatus } : prev
          );
        }}
        onDelete={(postId) => {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        }}
        onVoteChange={handleVoteChange}
      />
    </div>
  );
}
