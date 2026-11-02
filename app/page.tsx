import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { format } from 'date-fns';
import {
  Calendar,
  Columns3,
  History,
  LayoutDashboard,
  LogIn,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import type { Post, Changelog } from '@/types/database';
import { SEED_POSTS, SEED_CHANGELOGS } from '@/lib/seed-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { PublicFeedbackView } from '@/components/feedback/public-feedback-view';
import { RoadmapBoard } from '@/components/roadmap/roadmap-board';
import { CreatePostDialog } from '@/components/feedback/create-post-dialog';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PublicPortalPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialTab =
    typeof resolvedSearchParams.tab === 'string'
      ? resolvedSearchParams.tab
      : 'feedback';

  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: rawPosts },
    { data: comments },
    { data: rawChangelogs },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('posts')
      .select('*')
      .order('upvotes_count', { ascending: false }),
    supabase.from('comments').select('post_id'),
    supabase
      .from('changelogs')
      .select('*')
      .order('published_at', { ascending: false }),
  ]);

  // Fetch user upvotes if logged in
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

  const isSeedData = !rawPosts || rawPosts.length === 0;
  const posts: Post[] = !isSeedData
    ? rawPosts.map((p) => ({
        ...p,
        has_upvoted: userUpvotedSet.has(p.id),
        comments_count: commentCounts[p.id] || 0,
      }))
    : SEED_POSTS;

  const changelogs: Changelog[] =
    rawChangelogs && rawChangelogs.length > 0
      ? rawChangelogs
      : SEED_CHANGELOGS;

  const totalUpvotes = posts.reduce((acc, p) => acc + (p.upvotes_count || 0), 0);
  const roadmapCount = posts.filter((p) => p.status !== 'under_review').length;

  return (
    <div className="min-h-screen flex flex-col bg-background font-mono relative overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-tight text-foreground text-sm leading-none">
                tctPulse
              </span>
              <span className="rounded px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground border border-border">
                v0.1
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <CreatePostDialog
              isLoggedIn={!!user}
              buttonVariant="default"
              buttonSize="sm"
            />

            {user ? (
              <Button asChild variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3 w-3" />
                  Workspace
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/login">
                  <LogIn className="h-3 w-3" />
                  Sign In
                </Link>
              </Button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner with Mira Monospace Aesthetic */}
      <section className="border-b border-border py-10 sm:py-14 bg-muted/15">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>pulse.live // community-driven roadmap</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-mono font-bold tracking-tight text-foreground max-w-3xl mx-auto">
            Shape product roadmap with customer voice
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Vote on top suggestions, track active development cycles, and read versioned release notes as features ship.
          </p>

          {/* Real-time stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto pt-2">
            <div className="rounded-lg border border-border bg-card p-2.5 text-center">
              <div className="font-mono text-lg font-bold text-foreground">
                {posts.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Feedback
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-2.5 text-center">
              <div className="font-mono text-lg font-bold text-foreground">
                {totalUpvotes}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Upvotes
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-2.5 text-center">
              <div className="font-mono text-lg font-bold text-foreground">
                {roadmapCount}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Roadmap
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-2.5 text-center">
              <div className="font-mono text-lg font-bold text-foreground">
                {changelogs.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Releases
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs Section */}
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isSeedData && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>
                  <strong className="text-foreground">Sample Test Dataset Active:</strong> 17 posts & 5 releases loaded for UI testing.
                </span>
              </div>
              <span className="text-[11px]">
                Persist to database: <code className="bg-background px-1.5 py-0.5 rounded text-foreground border border-border">bun run seed</code> or <code className="bg-background px-1.5 py-0.5 rounded text-foreground border border-border">supabase/seed.sql</code>
              </span>
            </div>
          )}
          <Tabs defaultValue={initialTab} className="space-y-6">
            <div className="flex justify-center sm:justify-start">
              <TabsList className="h-9 p-1 rounded-lg bg-muted/40 border border-border">
                <TabsTrigger
                  value="feedback"
                  className="gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Feedback</span>
                  <span className="rounded px-1 text-[10px] bg-muted tabular-nums">
                    {posts.length}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="roadmap"
                  className="gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  <Columns3 className="h-3.5 w-3.5" />
                  <span>Roadmap</span>
                  <span className="rounded px-1 text-[10px] bg-muted tabular-nums">
                    {roadmapCount}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="changelog"
                  className="gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Changelog</span>
                  <span className="rounded px-1 text-[10px] bg-muted tabular-nums">
                    {changelogs.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: Feedback Board */}
            <TabsContent value="feedback" className="outline-none">
              <Suspense
                fallback={
                  <div className="h-48 w-full animate-pulse rounded-xl border border-border bg-card" />
                }
              >
                <PublicFeedbackView
                  posts={posts}
                  isLoggedIn={!!user}
                  currentUserEmail={user?.email}
                />
              </Suspense>
            </TabsContent>

            {/* TAB 2: Roadmap Board */}
            <TabsContent value="roadmap" className="outline-none space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-base font-mono font-bold tracking-tight text-foreground">
                  Product Roadmap
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                  Current initiative status across planned development, active build cycle, and shipped features.
                </p>
              </div>

              <RoadmapBoard
                initialPosts={posts}
                isLoggedIn={!!user}
                currentUserEmail={user?.email}
              />
            </TabsContent>

            {/* TAB 3: Changelog Releases */}
            <TabsContent value="changelog" className="outline-none">
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="border-b border-border pb-3">
                  <h2 className="text-base font-mono font-bold tracking-tight text-foreground">
                    Release Notes
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                    Log of shipped features, usability enhancements, and maintenance updates.
                  </p>
                </div>

                {changelogs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center text-xs text-muted-foreground bg-card">
                    No release notes published yet. Check back soon.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-border ml-4 pl-5 sm:ml-6 sm:pl-7 space-y-6">
                    {changelogs.map((log) => {
                      const formattedDate = format(
                        new Date(log.published_at),
                        'MMMM d, yyyy'
                      );

                      return (
                        <div key={log.id} className="relative group">
                          {/* Timeline dot */}
                          <div className="absolute -left-[27px] sm:-left-[35px] top-3 flex h-3 w-3 items-center justify-center rounded-full bg-background border-2 border-foreground" />

                          <div className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-foreground/30">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
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
                                  className="text-[10px] uppercase font-mono tracking-wider gap-1 py-0 px-2"
                                >
                                  {log.tag === 'new' && <Sparkles className="h-3 w-3" />}
                                  {log.tag === 'new'
                                    ? 'Feature'
                                    : log.tag === 'improved'
                                    ? 'Improvement'
                                    : 'Bug Fix'}
                                </Badge>
                              </div>

                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                                <Calendar className="h-3 w-3" />
                                {formattedDate}
                              </span>
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
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 text-xs text-muted-foreground mt-16 font-mono">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">tctPulse</span>
            <span>{'//'}</span>
            <span>all systems normal</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-foreground transition-colors">
              portal
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              workspace
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              auth
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
