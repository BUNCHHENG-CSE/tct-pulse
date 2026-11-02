'use server';

import { createClient, isSupabasePlaceholder } from '@/lib/supabase/server';
import { SEED_COMMENTS, SEED_POSTS } from '@/lib/seed-data';
import { commentSchema, type CommentInput } from '@/lib/validations';
import type { Comment } from '@/types/database';
import type { ActionResponse } from './posts';
import { revalidatePath } from 'next/cache';

export async function getCommentsAction(
  postId: string
): Promise<ActionResponse<Comment[]>> {
  if (!postId) {
    return { success: false, error: 'Post ID is required' };
  }

  if (isSupabasePlaceholder()) {
    const comments = SEED_COMMENTS.filter((c) => c.post_id === postId);
    return { success: true, data: comments };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    const seedFallback = SEED_COMMENTS.filter((c) => c.post_id === postId);
    if (seedFallback.length > 0) {
      return { success: true, data: seedFallback };
    }
  }

  return {
    success: true,
    data: (data as Comment[]) || [],
  };
}

export async function createCommentAction(input: CommentInput): Promise<ActionResponse> {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid comment data',
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'You must be signed in to leave a comment',
    };
  }

  if (isSupabasePlaceholder()) {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      post_id: parsed.data.postId,
      user_id: user.id,
      author_email: user.email || 'Anonymous',
      content: parsed.data.content,
      created_at: new Date().toISOString(),
    };
    SEED_COMMENTS.push(newComment);
    const seedPost = SEED_POSTS.find((p) => p.id === parsed.data.postId);
    if (seedPost) {
      seedPost.comments_count = (seedPost.comments_count || 0) + 1;
    }
    revalidatePath('/');
    revalidatePath('/feedback');
    revalidatePath('/dashboard');
    revalidatePath('/roadmap');
    return {
      success: true,
      data: newComment,
    };
  }

  const { data: newComment, error } = await supabase
    .from('comments')
    .insert({
      post_id: parsed.data.postId,
      user_id: user.id,
      author_email: user.email || 'Anonymous',
      content: parsed.data.content,
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
  revalidatePath('/feedback');
  revalidatePath('/dashboard');
  revalidatePath('/roadmap');

  return {
    success: true,
    data: newComment,
  };
}

export async function deleteCommentAction(
  commentId: string,
  _postId?: string
): Promise<ActionResponse> {
  if (!commentId) {
    return { success: false, error: 'Comment ID is required' };
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
    const idx = SEED_COMMENTS.findIndex((c) => c.id === commentId);
    if (idx !== -1) {
      const removed = SEED_COMMENTS[idx];
      SEED_COMMENTS.splice(idx, 1);
      const seedPost = SEED_POSTS.find((p) => p.id === removed.post_id);
      if (seedPost && seedPost.comments_count) {
        seedPost.comments_count = Math.max(0, seedPost.comments_count - 1);
      }
    }
    revalidatePath('/');
    revalidatePath('/feedback');
    revalidatePath('/dashboard');
    revalidatePath('/roadmap');
    return { success: true };
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/');
  revalidatePath('/feedback');
  revalidatePath('/dashboard');
  revalidatePath('/roadmap');

  return { success: true };
}
