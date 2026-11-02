'use server';

import { createClient, isSupabasePlaceholder } from '@/lib/supabase/server';
import type { ActionResponse } from './posts';
import type { Post } from '@/types/database';
import { revalidatePath } from 'next/cache';
import {
  SEED_POSTS,
  SEED_COMMENTS,
  SEED_CHANGELOGS,
  resetSeedData,
} from '@/lib/seed-data';

export async function seedDemoDataAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'You must be signed in to seed demo data',
    };
  }

  if (isSupabasePlaceholder()) {
    resetSeedData();
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/feedback');
    revalidatePath('/roadmap');
    revalidatePath('/changelog');
    return { success: true };
  }

  try {
    // 1. Prepare posts using current user ID to satisfy RLS
    const postsToInsert = SEED_POSTS.map((post) => ({
      title: post.title,
      description: post.description,
      category: post.category,
      status: post.status,
      upvotes_count: post.upvotes_count,
      user_id: user.id,
      author_email: post.author_email || user.email || 'alex@company.io',
      created_at: post.created_at,
    }));

    const { data: insertedPosts, error: postsError } = await supabase
      .from('posts')
      .insert(postsToInsert)
      .select();

    if (postsError) {
      return {
        success: false,
        error: `Failed to seed posts: ${postsError.message}`,
      };
    }

    const posts = insertedPosts as Post[] | null;

    // 2. Seed Upvotes for the inserted posts
    if (posts && posts.length > 0) {
      const upvotesToInsert = posts.map((p) => ({
        post_id: p.id,
        user_id: user.id,
      }));

      await supabase.from('upvotes').insert(upvotesToInsert);

      // 3. Seed Comments on the inserted posts
      const commentsToInsert = SEED_COMMENTS.map((c, index) => {
        // Map to corresponding inserted post
        const targetPost = posts[index % posts.length];
        return {
          post_id: targetPost.id,
          user_id: user.id,
          author_email: c.author_email,
          content: c.content,
          created_at: c.created_at,
        };
      });

      await supabase.from('comments').insert(commentsToInsert);
    }

    // 4. Seed Changelogs
    const changelogsToInsert = SEED_CHANGELOGS.map((ch) => ({
      user_id: user.id,
      version: ch.version,
      title: ch.title,
      content: ch.content,
      tag: ch.tag,
      published_at: ch.published_at,
    }));

    const { error: changelogsError } = await supabase
      .from('changelogs')
      .insert(changelogsToInsert);

    if (changelogsError) {
      console.warn('Notice: Changelogs seeding encountered:', changelogsError.message);
    }

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/feedback');
    revalidatePath('/roadmap');
    revalidatePath('/changelog');

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown seeding error';
    return {
      success: false,
      error: `Seeding error: ${message}`,
    };
  }
}
