import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AuthInput = z.infer<typeof authSchema>;

export const postSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(3000, 'Description cannot exceed 3000 characters'),
  category: z.enum(['feature', 'bug', 'improvement', 'integration']),
  status: z.enum(['under_review', 'planned', 'in_progress', 'shipped']),
});

export type PostInput = z.infer<typeof postSchema>;

export const updateStatusSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
  status: z.enum(['under_review', 'planned', 'in_progress', 'shipped']),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const commentSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
  content: z
    .string()
    .min(2, 'Comment must be at least 2 characters')
    .max(1500, 'Comment cannot exceed 1500 characters'),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const updateAdminResponseSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
  adminResponse: z.string().max(2000, 'Response too long').nullable().optional(),
  targetQuarter: z.string().max(30, 'Target quarter too long').nullable().optional(),
});

export type UpdateAdminResponseInput = z.infer<typeof updateAdminResponseSchema>;

export const bulkStatusSchema = z.object({
  postIds: z.array(z.string().uuid()).min(1, 'Select at least one post'),
  status: z.enum(['under_review', 'planned', 'in_progress', 'shipped']),
});

export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;

export const bulkDeleteSchema = z.object({
  postIds: z.array(z.string().uuid()).min(1, 'Select at least one post'),
});

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

export const mergePostsSchema = z.object({
  sourcePostId: z.string().uuid('Invalid source post ID'),
  targetPostId: z.string().uuid('Invalid target post ID'),
});

export type MergePostsInput = z.infer<typeof mergePostsSchema>;

export const changelogSchema = z.object({
  version: z
    .string()
    .min(1, 'Version is required (e.g. v1.2.0)')
    .max(30, 'Version tag too long'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content cannot exceed 5000 characters'),
  tag: z.enum(['new', 'improved', 'fixed']),
});

export type ChangelogInput = z.infer<typeof changelogSchema>;
