'use server';

import { createClient, isSupabasePlaceholder } from '@/lib/supabase/server';
import { SEED_POSTS } from '@/lib/seed-data';
import {
  postSchema,
  updateStatusSchema,
  updateAdminResponseSchema,
  bulkStatusSchema,
  bulkDeleteSchema,
  mergePostsSchema,
  type PostInput,
} from '@/lib/validations';
import type { PostStatus } from '@/types/database';
import { revalidatePath } from 'next/cache';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createPostAction(input: PostInput): Promise<ActionResponse> {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid post data',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: 'You must be signed in to submit feedback',
    };
  }

  if (isSupabasePlaceholder()) {
    const newPost = {
      id: crypto.randomUUID(),
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      status: parsed.data.status || 'under_review',
      user_id: user.id,
      author_email: user.email || 'Anonymous',
      upvotes_count: 1,
      has_upvoted: true,
      comments_count: 0,
      created_at: new Date().toISOString(),
    };
    SEED_POSTS.unshift(newPost);
    revalidatePath('/');
    revalidatePath('/feedback');
    revalidatePath('/dashboard');
    revalidatePath('/roadmap');
    return {
      success: true,
      data: newPost,
    };
  }

  const { data: newPost, error: insertError } = await supabase
    .from('posts')
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      status: parsed.data.status || 'under_review',
      user_id: user.id,
      author_email: user.email || 'Anonymous',
      upvotes_count: 1,
    })
    .select()
    .single();

  if (insertError) {
    return {
      success: false,
      error: insertError.message,
    };
  }

  // Also record the creator's initial upvote
  if (newPost) {
    await supabase.from('upvotes').insert({
      post_id: newPost.id,
      user_id: user.id,
    });
  }

  revalidatePath('/');
  revalidatePath('/feedback');
  revalidatePath('/dashboard');
  revalidatePath('/roadmap');

  return {
    success: true,
    data: newPost,
  };
}

export async function toggleUpvoteAction(
  postId: string
): Promise<ActionResponse<{ hasUpvoted: boolean; upvotesCount: number }>> {
  if (!postId) {
    return { success: false, error: 'Post ID is required' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isSupabasePlaceholder()) {
    const seedPost = SEED_POSTS.find((p) => p.id === postId);
    if (seedPost) {
      const nextUpvoted = !seedPost.has_upvoted;
      seedPost.has_upvoted = nextUpvoted;
      seedPost.upvotes_count = nextUpvoted
        ? seedPost.upvotes_count + 1
        : Math.max(0, seedPost.upvotes_count - 1);
      revalidatePath('/');
      revalidatePath('/feedback');
      revalidatePath('/roadmap');
      revalidatePath('/dashboard');
      return {
        success: true,
        data: {
          hasUpvoted: seedPost.has_upvoted,
          upvotesCount: seedPost.upvotes_count,
        },
      };
    }
    return {
      success: true,
      data: {
        hasUpvoted: true,
        upvotesCount: 1,
      },
    };
  }

  if (!user) {
    return {
      success: false,
      error: 'You must be signed in to upvote',
    };
  }

  // Check if current user already upvoted
  const { data: existingUpvote } = await supabase
    .from('upvotes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  // Fetch current post
  const { data: currentPost, error: postFetchError } = await supabase
    .from('posts')
    .select('upvotes_count')
    .eq('id', postId)
    .single();

  if (postFetchError || !currentPost) {
    return {
      success: false,
      error: 'Post not found',
    };
  }

  let newCount = currentPost.upvotes_count;
  let hasUpvoted = false;

  if (existingUpvote) {
    // Remove upvote
    const { error: deleteError } = await supabase
      .from('upvotes')
      .delete()
      .eq('id', existingUpvote.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    newCount = Math.max(0, currentPost.upvotes_count - 1);
    await supabase
      .from('posts')
      .update({ upvotes_count: newCount })
      .eq('id', postId);

    hasUpvoted = false;
  } else {
    // Add upvote
    const { error: insertError } = await supabase.from('upvotes').insert({
      post_id: postId,
      user_id: user.id,
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    newCount = currentPost.upvotes_count + 1;
    await supabase
      .from('posts')
      .update({ upvotes_count: newCount })
      .eq('id', postId);

    hasUpvoted = true;
  }

  revalidatePath('/');
  revalidatePath('/feedback');
  revalidatePath('/roadmap');
  revalidatePath('/dashboard');

  return {
    success: true,
    data: {
      hasUpvoted,
      upvotesCount: newCount,
    },
  };
}

export async function updatePostStatusAction(
  postId: string,
  status: PostStatus
): Promise<ActionResponse> {
  const parsed = updateStatusSchema.safeParse({ postId, status });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid status data',
    };
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
    const seedPost = SEED_POSTS.find((p) => p.id === parsed.data.postId);
    if (seedPost) {
      seedPost.status = parsed.data.status;
    }
    revalidatePath('/');
    revalidatePath('/feedback');
    revalidatePath('/roadmap');
    revalidatePath('/dashboard');
    return { success: true };
  }

  const { error } = await supabase
    .from('posts')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.postId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/');
  revalidatePath('/feedback');
  revalidatePath('/roadmap');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function deletePostAction(postId: string): Promise<ActionResponse> {
  if (!postId) {
    return { success: false, error: 'Post ID is required' };
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
    const idx = SEED_POSTS.findIndex((p) => p.id === postId);
    if (idx !== -1) {
      SEED_POSTS.splice(idx, 1);
    }
    revalidatePath('/');
    revalidatePath('/feedback');
    revalidatePath('/roadmap');
    revalidatePath('/dashboard');
    return { success: true };
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/');
  revalidatePath('/feedback');
  revalidatePath('/roadmap');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function updatePostAdminResponseAction(
  postId: string,
  adminResponse?: string | null,
  targetQuarter?: string | null
): Promise<ActionResponse> {
  const parsed = updateAdminResponseSchema.safeParse({ postId, adminResponse, targetQuarter });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input',
    };
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
    const seedPost = SEED_POSTS.find((p) => p.id === postId);
    if (seedPost) {
      seedPost.admin_response = adminResponse ?? null;
      seedPost.target_quarter = targetQuarter ?? null;
    }
    revalidatePath('/');
    revalidatePath('/feedback');
    revalidatePath('/roadmap');
    revalidatePath('/dashboard');
    return { success: true };
  }

  const { error } = await supabase
    .from('posts')
    .update({
      admin_response: adminResponse ?? null,
      target_quarter: targetQuarter ?? null,
    })
    .eq('id', postId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/feedback');
  revalidatePath('/roadmap');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function bulkUpdateStatusAction(
  postIds: string[],
  status: PostStatus
): Promise<ActionResponse> {
  const parsed = bulkStatusSchema.safeParse({ postIds, status });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid bulk status data',
    };
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
    const idSet = new Set(postIds);
    SEED_POSTS.forEach((p) => {
      if (idSet.has(p.id)) {
        p.status = status;
      }
    });
    revalidatePath('/');
    revalidatePath('/feedback');
    revalidatePath('/roadmap');
    revalidatePath('/dashboard');
    return { success: true };
  }

  const { error } = await supabase
    .from('posts')
    .update({ status })
    .in('id', postIds);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/feedback');
  revalidatePath('/roadmap');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function bulkDeletePostsAction(
  postIds: string[]
): Promise<ActionResponse> {
  const parsed = bulkDeleteSchema.safeParse({ postIds });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid post IDs',
    };
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
    const idSet = new Set(postIds);
    for (let i = SEED_POSTS.length - 1; i >= 0; i--) {
      if (idSet.has(SEED_POSTS[i].id)) {
        SEED_POSTS.splice(i, 1);
      }
    }
    revalidatePath('/');
    revalidatePath('/feedback');
    revalidatePath('/roadmap');
    revalidatePath('/dashboard');
    return { success: true };
  }

  const { error } = await supabase.from('posts').delete().in('id', postIds);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/feedback');
  revalidatePath('/roadmap');
  revalidatePath('/dashboard');

  return { success: true };
}

export async function mergePostsAction(
  sourcePostId: string,
  targetPostId: string
): Promise<ActionResponse> {
  if (sourcePostId === targetPostId) {
    return { success: false, error: 'Cannot merge a post into itself' };
  }

  const parsed = mergePostsSchema.safeParse({ sourcePostId, targetPostId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid merge parameters',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Unauthorized: You must be signed in to merge posts',
    };
  }

  if (isSupabasePlaceholder()) {
    const sourceIndex = SEED_POSTS.findIndex((p) => p.id === sourcePostId);
    const target = SEED_POSTS.find((p) => p.id === targetPostId);

    if (sourceIndex === -1 || !target) {
      return { success: false, error: 'Source or target post not found' };
    }

    const source = SEED_POSTS[sourceIndex];
    const transferredVotes = Math.max(1, source.upvotes_count || 1);
    target.upvotes_count = (target.upvotes_count || 0) + transferredVotes;

    // Remove source from active board to avoid duplication
    SEED_POSTS.splice(sourceIndex, 1);

    revalidatePath('/');
    revalidatePath('/feedback');
    revalidatePath('/roadmap');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        targetId: target.id,
        transferredVotes,
      },
    };
  }

  // Fetch both posts
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, title, upvotes_count')
    .in('id', [sourcePostId, targetPostId]);

  if (fetchError || !posts || posts.length < 2) {
    return { success: false, error: 'Failed to locate posts for merge' };
  }

  const source = posts.find((p) => p.id === sourcePostId);
  const target = posts.find((p) => p.id === targetPostId);

  if (!source || !target) {
    return { success: false, error: 'Source or target post not found' };
  }

  const newCount = target.upvotes_count + source.upvotes_count;

  // Update target post upvotes
  await supabase
    .from('posts')
    .update({ upvotes_count: newCount })
    .eq('id', targetPostId);

  // Add system note as a comment on the target post
  await supabase.from('comments').insert({
    post_id: targetPostId,
    user_id: user.id,
    author_email: 'system@tctpulse.dev',
    content: `[Merged]: Feedback "${source.title}" was merged into this initiative (+${source.upvotes_count} upvotes).`,
  });

  // Delete source post
  await supabase.from('posts').delete().eq('id', sourcePostId);

  revalidatePath('/');
  revalidatePath('/feedback');
  revalidatePath('/roadmap');
  revalidatePath('/dashboard');

  return { success: true };
}
