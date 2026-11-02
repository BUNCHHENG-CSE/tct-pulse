'use server';

import { createClient, isSupabasePlaceholder } from '@/lib/supabase/server';
import { SEED_CHANGELOGS, SEED_POSTS } from '@/lib/seed-data';
import { changelogSchema, type ChangelogInput } from '@/lib/validations';
import type { Post } from '@/types/database';
import type { ActionResponse } from './posts';
import { revalidatePath } from 'next/cache';

export async function createChangelogAction(
  input: ChangelogInput
): Promise<ActionResponse> {
  const parsed = changelogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid changelog data',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Unauthorized: You must be signed in to publish release notes',
    };
  }

  if (isSupabasePlaceholder()) {
    const newChangelog = {
      id: crypto.randomUUID(),
      version: parsed.data.version,
      title: parsed.data.title,
      content: parsed.data.content,
      tag: parsed.data.tag,
      user_id: user.id,
      published_at: new Date().toISOString(),
    };
    SEED_CHANGELOGS.unshift(newChangelog);
    revalidatePath('/');
    revalidatePath('/changelog');
    revalidatePath('/dashboard');
    return {
      success: true,
      data: newChangelog,
    };
  }

  const { data: newChangelog, error } = await supabase
    .from('changelogs')
    .insert({
      version: parsed.data.version,
      title: parsed.data.title,
      content: parsed.data.content,
      tag: parsed.data.tag,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/');
  revalidatePath('/changelog');
  revalidatePath('/dashboard');

  return {
    success: true,
    data: newChangelog,
  };
}

export async function deleteChangelogAction(
  changelogId: string
): Promise<ActionResponse> {
  if (!changelogId) {
    return { success: false, error: 'Changelog ID is required' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Unauthorized: You must be signed in',
    };
  }

  if (isSupabasePlaceholder()) {
    const idx = SEED_CHANGELOGS.findIndex((c) => c.id === changelogId);
    if (idx !== -1) {
      SEED_CHANGELOGS.splice(idx, 1);
    }
    revalidatePath('/');
    revalidatePath('/changelog');
    revalidatePath('/dashboard');
    return { success: true };
  }

  const { error } = await supabase
    .from('changelogs')
    .delete()
    .eq('id', changelogId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/');
  revalidatePath('/changelog');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function generateChangelogDraftAction(): Promise<
  ActionResponse<{
    version: string;
    title: string;
    content: string;
    tag: 'new' | 'improved' | 'fixed';
    shippedCount: number;
  }>
> {
  let shippedPosts: Post[] = [];

  if (isSupabasePlaceholder()) {
    shippedPosts = SEED_POSTS.filter((p) => p.status === 'shipped');
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'shipped')
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      shippedPosts = data;
    } else {
      shippedPosts = SEED_POSTS.filter((p) => p.status === 'shipped');
    }
  }

  // Calculate next version based on existing changelogs
  const currentLogs = isSupabasePlaceholder() ? SEED_CHANGELOGS : [];
  let nextVersion = 'v1.3.0';
  if (currentLogs.length > 0) {
    const latest = currentLogs[0].version.replace(/^v/, '');
    const parts = latest.split('.').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      nextVersion = `v${parts[0]}.${parts[1] + 1}.0`;
    }
  }

  const features = shippedPosts.filter((p) => p.category === 'feature');
  const improvements = shippedPosts.filter(
    (p) => p.category === 'improvement' || p.category === 'integration'
  );
  const fixes = shippedPosts.filter((p) => p.category === 'bug');

  let markdownLines: string[] = [
    `We are excited to deliver this release packed with community-requested enhancements and milestone features.`,
    '',
  ];

  if (features.length > 0) {
    markdownLines.push('### 🚀 New Features');
    features.forEach((p) => {
      markdownLines.push(`- **${p.title}**: ${p.description.slice(0, 140)}${p.description.length > 140 ? '...' : ''}`);
    });
    markdownLines.push('');
  }

  if (improvements.length > 0) {
    markdownLines.push('### ⚡ Improvements & Integrations');
    improvements.forEach((p) => {
      markdownLines.push(`- **${p.title}**: ${p.description.slice(0, 140)}${p.description.length > 140 ? '...' : ''}`);
    });
    markdownLines.push('');
  }

  if (fixes.length > 0) {
    markdownLines.push('### 🐛 Bug Fixes & Stability');
    fixes.forEach((p) => {
      markdownLines.push(`- **${p.title}** resolved.`);
    });
    markdownLines.push('');
  }

  if (shippedPosts.length === 0) {
    markdownLines.push('### 🛠️ General Maintenance');
    markdownLines.push('- System performance upgrades and telemetry optimisations.');
  }

  return {
    success: true,
    data: {
      version: nextVersion,
      title: `${nextVersion} Release: Milestone Feature Rollout`,
      content: markdownLines.join('\n').trim(),
      tag: features.length > 0 ? 'new' : 'improved',
      shippedCount: shippedPosts.length,
    },
  };
}
