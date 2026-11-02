import * as React from 'react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { MessageSquare } from 'lucide-react';
import type { Post } from '@/types/database';
import { SEED_POSTS } from '@/lib/seed-data';
import { FeedbackDataTable } from '@/components/feedback/feedback-data-table';

export default async function AdminFeedbackPage() {
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: rawPosts },
    { data: comments },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('posts')
      .select('*')
      .order('upvotes_count', { ascending: false }),
    supabase.from('comments').select('post_id'),
  ]);

  // Fetch user upvotes
  let userUpvotedSet = new Set<string>();
  if (user) {
    const { data: userUpvotes } = await supabase
      .from('upvotes')
      .select('post_id')
      .eq('user_id', user.id);

    if (userUpvotes) {
      userUpvotedSet = new Set(userUpvotes.map((u) => u.post_id));
    }
  }

  const commentCounts: Record<string, number> = {};
  if (comments) {
    comments.forEach((c) => {
      commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
    });
  }

  const posts: Post[] = (rawPosts && rawPosts.length > 0)
    ? rawPosts.map((p) => ({
        ...p,
        has_upvoted: userUpvotedSet.has(p.id),
        comments_count: commentCounts[p.id] || 0,
      }))
    : SEED_POSTS;

  return (
    <div className="space-y-6">
      <div className="border-b border-border/50 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Feedback Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Customer Feature Requests & Bugs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Triage incoming feedback, monitor community upvote weight, and transition initiatives into the engineering roadmap.
        </p>
      </div>

      <FeedbackDataTable
        initialPosts={posts}
        isLoggedIn={!!user}
        currentUserEmail={user?.email}
      />
    </div>
  );
}
