import * as React from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Columns3,
  Database,
  Flame,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import type { Post } from '@/types/database';
import { SEED_POSTS } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { SeedButton } from '@/components/dashboard/seed-button';
import { CategoryBarChart } from '@/components/dashboard/category-bar-chart';
import { CreatePostDialog } from '@/components/feedback/create-post-dialog';
import { getCategoryBadge, getStatusBadge } from '@/components/feedback/post-badges';

export default async function DashboardOverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all posts
  const { data: rawPosts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  const posts: Post[] = (rawPosts && rawPosts.length > 0) ? rawPosts : SEED_POSTS;

  // KPI Calculations
  const totalPosts = posts.length;
  const totalUpvotes = posts.reduce((acc, p) => acc + (p.upvotes_count || 0), 0);
  const inProgressCount = posts.filter((p) => p.status === 'in_progress').length;
  const shippedCount = posts.filter((p) => p.status === 'shipped').length;

  // Category counts
  const featureCount = posts.filter((p) => p.category === 'feature').length;
  const bugCount = posts.filter((p) => p.category === 'bug').length;
  const improvementCount = posts.filter((p) => p.category === 'improvement').length;
  const integrationCount = posts.filter((p) => p.category === 'integration').length;

  const chartData = [
    { category: 'Features', count: featureCount, color: 'var(--foreground)' },
    { category: 'Bugs', count: bugCount, color: 'oklch(0.65 0.22 25)' },
    { category: 'Improvements', count: improvementCount, color: 'oklch(0.7 0.16 75)' },
    { category: 'Integrations', count: integrationCount, color: 'var(--muted-foreground)' },
  ];

  const recentPosts = posts.slice(0, 5);

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Zap className="h-3 w-3" />
            <span>ops // telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-foreground">
            Product Telemetry & Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">
            Community feedback frequency, roadmap distribution, and release milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SeedButton variant="outline" size="sm" />
          <CreatePostDialog isLoggedIn={!!user} buttonLabel="Add Feedback" buttonSize="sm" />
        </div>
      </div>

      {/* Zero State Seed Prompt */}
      {totalPosts === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground mx-auto border border-border">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Workspace Empty
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
              Load sample dataset with features, roadmap columns, and changelogs to explore.
            </p>
          </div>
          <SeedButton
            variant="default"
            size="default"
            label="Load Demo Dataset"
          />
        </div>
      )}

      {/* 4 Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Feedback */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider text-[10px]">Total Feedback</span>
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {totalPosts}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-mono">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span>submitted ideas</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Upvotes */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider text-[10px]">Total Upvotes</span>
            <Flame className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {totalUpvotes}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-mono">
              <Activity className="h-3 w-3" />
              <span>community score</span>
            </p>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider text-[10px]">In Progress</span>
            <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {inProgressCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>active cycle</span>
            </p>
          </div>
        </div>

        {/* Card 4: Shipped */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider text-[10px]">Shipped</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {shippedCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>production</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: BarChart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Distribution by Category
              </h3>
              <p className="text-[11px] text-muted-foreground font-sans">
                Features, bugs, improvements, and integrations.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <CategoryBarChart data={chartData} />
          </div>
        </div>

        {/* Recent Feedback Feed */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Recent Submissions
              </h3>
              <p className="text-[11px] text-muted-foreground font-sans">
                Latest customer submissions.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1 h-7 rounded px-2">
              <Link href="/feedback">
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="flex-1 space-y-2 mt-3">
            {recentPosts.length === 0 ? (
              <div className="flex h-36 items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/10 font-mono">
                No feedback submitted yet.
              </div>
            ) : (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="group flex items-start justify-between gap-2.5 rounded-lg border border-border bg-muted/20 p-2.5 hover:border-foreground/30 hover:bg-card transition-colors"
                >
                  <div className="space-y-1 overflow-hidden min-w-0">
                    <div className="flex items-center gap-1.5">
                      {getCategoryBadge(post.category)}
                      <span className="text-[10px] text-muted-foreground truncate font-mono">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h4 className="text-xs font-mono font-semibold text-foreground truncate">
                      {post.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono font-bold text-muted-foreground">
                      ▲ {post.upvotes_count}
                    </span>
                    {getStatusBadge(post.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
