'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  CornerDownLeft,
  Edit2,
  GitMerge,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Comment, Post, PostStatus } from '@/types/database';
import { SEED_COMMENTS } from '@/lib/seed-data';
import {
  updatePostStatusAction,
  deletePostAction,
  updatePostAdminResponseAction,
} from '@/lib/actions/posts';
import {
  getCommentsAction,
  createCommentAction,
  deleteCommentAction,
} from '@/lib/actions/comments';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { UpvoteButton } from './upvote-button';
import { getCategoryBadge } from './post-card';
import { MergePostDialog } from './merge-post-dialog';

interface PostDetailSheetProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  currentUserEmail?: string | null;
  onStatusChange?: (postId: string, newStatus: PostStatus) => void;
  onDelete?: (postId: string) => void;
  onVoteChange?: (postId: string, newCount: number, hasUpvoted: boolean) => void;
  allPosts?: Post[];
}

const QUARTERS = ['None', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Future'] as const;

export function PostDetailSheet({
  post,
  isOpen,
  onClose,
  isLoggedIn = false,
  currentUserEmail,
  onStatusChange,
  onDelete,
  onVoteChange,
  allPosts = [],
}: PostDetailSheetProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [currentStatus, setCurrentStatus] = React.useState<PostStatus | undefined>(
    post?.status
  );
  const [upvotesCount, setUpvotesCount] = React.useState<number>(
    post?.upvotes_count ?? 0
  );
  const [hasUpvoted, setHasUpvoted] = React.useState<boolean>(
    post?.has_upvoted ?? false
  );

  // Admin response & target quarter states
  const [adminResponse, setAdminResponse] = React.useState<string>('');
  const [targetQuarter, setTargetQuarter] = React.useState<string>('None');
  const [isEditingAdminResp, setIsEditingAdminResp] = React.useState(false);
  const [isSavingAdminResp, setIsSavingAdminResp] = React.useState(false);

  // Merge modal
  const [isMergeOpen, setIsMergeOpen] = React.useState(false);

  React.useEffect(() => {
    if (post) {
      setCurrentStatus(post.status);
      setUpvotesCount(post.upvotes_count);
      setHasUpvoted(post.has_upvoted ?? false);
      setAdminResponse(post.admin_response || '');
      setTargetQuarter(post.target_quarter || 'None');
      setIsEditingAdminResp(false);
    }
  }, [post]);

  // Fetch comments whenever post changes or sheet opens
  React.useEffect(() => {
    if (!post || !isOpen) return;

    let isMounted = true;
    async function loadComments() {
      setIsLoadingComments(true);
      const res = await getCommentsAction(post!.id);

      if (isMounted) {
        if (res.success && res.data) {
          setComments(res.data);
        } else {
          setComments(SEED_COMMENTS.filter((c) => c.post_id === post!.id));
        }
        setIsLoadingComments(false);
      }
    }

    loadComments();
    return () => {
      isMounted = false;
    };
  }, [post, isOpen]);

  if (!post) return null;

  const handleStatusChange = async (newStatus: PostStatus) => {
    if (!isLoggedIn) {
      toast.info('You must be signed in to update status');
      return;
    }
    setIsUpdatingStatus(true);
    setCurrentStatus(newStatus);
    onStatusChange?.(post.id, newStatus);
    const res = await updatePostStatusAction(post.id, newStatus);
    setIsUpdatingStatus(false);
    if (!res.success) {
      toast.error(res.error || 'Failed to update status');
      setCurrentStatus(post.status);
      onStatusChange?.(post.id, post.status);
    } else {
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    }
  };

  const handleSaveAdminResponse = async () => {
    setIsSavingAdminResp(true);
    const quarterVal = targetQuarter === 'None' ? null : targetQuarter;
    const responseVal = adminResponse.trim() || null;

    const res = await updatePostAdminResponseAction(post.id, responseVal, quarterVal);
    setIsSavingAdminResp(false);

    if (res.success) {
      toast.success('Official response & ETA updated');
      setIsEditingAdminResp(false);
      post.admin_response = responseVal;
      post.target_quarter = quarterVal;
    } else {
      toast.error(res.error || 'Failed to update response');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this feature request?')) return;
    const res = await deletePostAction(post.id);
    if (res.success) {
      onDelete?.(post.id);
      toast.success('Post deleted successfully');
      onClose();
    } else {
      toast.error(res.error || 'Failed to delete post');
    }
  };

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;

    if (!isLoggedIn) {
      toast.info('Please sign in to join the conversation');
      return;
    }

    setIsSubmittingComment(true);
    const res = await createCommentAction({
      postId: post.id,
      content: commentText.trim(),
    });
    setIsSubmittingComment(false);

    if (res.success && res.data) {
      setComments((prev) => [res.data as Comment, ...prev]);
      setCommentText('');
      toast.success('Comment posted');
    } else {
      toast.error(res.error || 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const res = await deleteCommentAction(commentId, post.id);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } else {
      toast.error(res.error || 'Failed to delete comment');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent hideClose className="w-full sm:max-w-lg p-0 flex flex-col h-full bg-background border-l border-border font-mono">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-border space-y-2 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCategoryBadge(post.category)}
                {targetQuarter && targetQuarter !== 'None' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border text-foreground font-mono">
                    <Calendar className="h-3 w-3" /> {targetQuarter}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {isLoggedIn && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMergeOpen(true)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground rounded cursor-pointer transition-colors"
                      title="Merge into another post"
                    >
                      <GitMerge className="h-3.5 w-3.5" />
                      <span className="sr-only">Merge</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeletePost}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive rounded cursor-pointer transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete post</span>
                    </Button>
                  </>
                )}
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground rounded cursor-pointer transition-colors"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
              </div>
            </div>

            <SheetTitle className="text-base font-mono font-bold tracking-tight text-left mt-2 leading-snug">
              {post.title}
            </SheetTitle>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <UpvoteButton
                  postId={post.id}
                  initialUpvotes={upvotesCount}
                  initialHasUpvoted={hasUpvoted}
                  orientation="horizontal"
                  size="sm"
                  isLoggedIn={isLoggedIn}
                  onVoteChange={(newCount, newHasUpvoted) => {
                    setUpvotesCount(newCount);
                    setHasUpvoted(newHasUpvoted);
                    onVoteChange?.(post.id, newCount, newHasUpvoted);
                  }}
                />
                <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[150px]">
                  @{post.author_email ? post.author_email.split('@')[0] : 'community'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-mono">status:</span>
                <Select
                  value={currentStatus}
                  onValueChange={(val) => handleStatusChange(val as PostStatus)}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="h-7 w-30 text-[11px] font-mono rounded bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-mono text-xs">
                    <SelectItem value="under_review">Review</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Description */}
            <div className="rounded-lg bg-muted/30 p-3.5 border border-border">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                // description
              </h4>
              <div className="text-xs leading-relaxed whitespace-pre-wrap text-foreground font-sans">
                {post.description}
              </div>
            </div>

            {/* Official Team Response Section */}
            {(adminResponse || isLoggedIn) && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Official Team Response</span>
                  </div>
                  {isLoggedIn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingAdminResp((prev) => !prev)}
                      className="h-6 text-[10px] px-1.5 font-mono text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      {isEditingAdminResp ? 'Cancel' : 'Edit Response'}
                    </Button>
                  )}
                </div>

                {isEditingAdminResp ? (
                  <div className="space-y-2.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground font-mono">
                        Target Release Quarter:
                      </label>
                      <Select value={targetQuarter} onValueChange={setTargetQuarter}>
                        <SelectTrigger className="h-7 text-xs font-mono rounded bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-mono text-xs">
                          {QUARTERS.map((q) => (
                            <SelectItem key={q} value={q}>
                              {q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground font-mono">
                        Team Message:
                      </label>
                      <Textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="e.g. We are currently working on this in sprint 4..."
                        rows={3}
                        className="text-xs font-mono bg-background border-border resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={handleSaveAdminResponse}
                        disabled={isSavingAdminResp}
                        className="h-7 text-xs font-mono"
                      >
                        {isSavingAdminResp ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : null}
                        Save Team Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  adminResponse && (
                    <div className="text-xs leading-relaxed text-foreground font-sans">
                      {adminResponse}
                    </div>
                  )
                )}
              </div>
            )}

            <Separator className="bg-border" />

            {/* Comment Thread */}
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Discussion ({comments.length})</span>
                </div>
              </div>

              {isLoadingComments ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-xs">Loading replies...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground bg-card font-mono">
                  No replies yet. Join discussion below.
                </div>
              ) : (
                <div className="space-y-2">
                  {comments.map((comment) => {
                    const isAuthor =
                      currentUserEmail && comment.author_email === currentUserEmail;
                    const time = formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    });

                    return (
                      <div
                        key={comment.id}
                        className="group flex gap-2.5 rounded-lg border border-border bg-card p-3 text-xs"
                      >
                        <Avatar className="h-6 w-6 shrink-0 rounded border border-border">
                          <AvatarFallback className="text-[9px] bg-muted text-foreground font-bold rounded">
                            {comment.author_email
                              ? comment.author_email.slice(0, 2).toUpperCase()
                              : 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-semibold text-foreground text-[11px] truncate">
                              @{comment.author_email ? comment.author_email.split('@')[0] : 'anonymous'}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-muted-foreground">
                                {time}
                              </span>
                              {isAuthor && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity cursor-pointer p-0.5"
                                  title="Delete comment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-[11px] font-sans">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Comment Input Footer */}
          <div className="border-t border-border p-3.5 bg-muted/20 font-mono">
            <form onSubmit={handleAddComment} className="space-y-2.5">
              <Textarea
                placeholder={
                  isLoggedIn
                    ? 'Write a reply or context...'
                    : 'Sign in to join discussion'
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isLoggedIn || isSubmittingComment}
                rows={2}
                className="resize-none text-xs rounded-md bg-background border-border font-mono"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">
                  ⌘+Enter to submit
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!isLoggedIn || isSubmittingComment || !commentText.trim()}
                  className="gap-1 cursor-pointer rounded-md h-7 px-3 text-xs"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      Reply
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <MergePostDialog
        sourcePost={post}
        isOpen={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        allPosts={allPosts}
        onMerged={() => {
          onClose();
        }}
      />
    </>
  );
}
