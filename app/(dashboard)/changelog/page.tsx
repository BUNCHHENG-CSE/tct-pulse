import * as React from 'react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { History, Sparkles } from 'lucide-react';
import type { Changelog } from '@/types/database';
import { SEED_CHANGELOGS } from '@/lib/seed-data';
import { ChangelogDialog } from '@/components/changelog/changelog-dialog';
import { ChangelogItem } from '@/components/changelog/changelog-item';

export default async function AdminChangelogPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rawChangelogs } = await supabase
    .from('changelogs')
    .select('*')
    .order('published_at', { ascending: false });

  const changelogs: Changelog[] =
    rawChangelogs && rawChangelogs.length > 0 ? rawChangelogs : SEED_CHANGELOGS;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-1">
            <History className="h-3.5 w-3.5" />
            <span>Changelog Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Version Release Notes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish versioned release notes to keep internal stakeholders and users continuously informed.
          </p>
        </div>

        <ChangelogDialog buttonLabel="Publish Release" />
      </div>

      <div className="mx-auto max-w-3xl pt-2">
        {changelogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center text-xs text-muted-foreground bg-card/30">
            No release notes published yet. Click &quot;Publish Release&quot; to post your first update!
          </div>
        ) : (
          <div className="relative border-l-2 border-border/80 ml-4 pl-6 sm:ml-6 sm:pl-8 space-y-8">
            {changelogs.map((log) => (
              <ChangelogItem key={log.id} log={log} isLoggedIn={!!user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
