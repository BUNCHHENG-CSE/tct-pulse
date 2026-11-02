'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  Bug,
  Layers,
  Puzzle,
  Search,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import type { Post } from '@/types/database';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PostCard } from './post-card';
import { PostDetailSheet } from './post-detail-sheet';
import { CreatePostDialog } from './create-post-dialog';
import { cn } from '@/lib/utils';

interface PublicFeedbackViewProps {
  posts: Post[];
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

export function PublicFeedbackView({
  posts,
  isLoggedIn = false,
  currentUserEmail,
}: PublicFeedbackViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [feedPosts, setFeedPosts] = React.useState<Post[]>(posts);

  React.useEffect(() => {
    setFeedPosts(posts);
  }, [posts]);

  const handleVoteChange = (postId: string, newCount: number, hasUpvoted: boolean) => {
    setFeedPosts((prev) =>
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

  const currentCategory = searchParams.get('category') || 'all';
  const currentSort = searchParams.get('sort') || 'upvotes';
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Sync category filter to URL search params
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Sync sort to URL search params
  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === 'upvotes') {
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Count items per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: feedPosts.length };
    feedPosts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [feedPosts]);

  // Filter and sort items client-side
  const filteredAndSortedPosts = React.useMemo(() => {
    let result = [...feedPosts];

    if (currentCategory !== 'all') {
      result = result.filter((p) => p.category === currentCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (currentSort === 'newest') {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      result.sort((a, b) => b.upvotes_count - a.upvotes_count);
    }

    return result;
  }, [posts, currentCategory, currentSort, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search feedback by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 pr-8 h-8 bg-background border-border rounded-lg text-xs font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-mono">
              <ArrowUpDown className="h-3 w-3" />
              <span className="hidden sm:inline">Sort:</span>
            </div>
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="h-8 w-32 bg-background border-border rounded-lg text-xs font-mono font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg font-mono">
                <SelectItem value="upvotes">Top Upvoted</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <CreatePostDialog isLoggedIn={isLoggedIn} />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.id;
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-mono transition-all duration-150 cursor-pointer border',
                  isActive
                    ? 'bg-foreground text-background font-semibold border-foreground shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border/60'
                )}
              >
                <Icon className="h-3 w-3" />
                <span>{cat.label}</span>
                <span
                  className={cn(
                    'rounded px-1 text-[10px] tabular-nums',
                    isActive ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-2.5">
        {filteredAndSortedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-10 text-center bg-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-mono font-semibold text-foreground text-sm">
              No results found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm font-sans">
              {searchQuery
                ? 'Try adjusting your search query or reset category filter.'
                : 'No feedback items yet. Submit the first idea!'}
            </p>
            <div className="mt-4">
              <CreatePostDialog
                isLoggedIn={isLoggedIn}
                buttonLabel="Submit New Idea"
              />
            </div>
          </div>
        ) : (
          filteredAndSortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLoggedIn={isLoggedIn}
              onOpenDetail={(p) => {
                setSelectedPost(p);
                setIsSheetOpen(true);
              }}
              onVoteChange={(count, hasUpvoted) =>
                handleVoteChange(post.id, count, hasUpvoted)
              }
            />
          ))
        )}
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
        onVoteChange={handleVoteChange}
        allPosts={feedPosts}
      />
    </div>
  );
}
