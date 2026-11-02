export type PostCategory = 'feature' | 'bug' | 'improvement' | 'integration';
export type PostStatus = 'under_review' | 'planned' | 'in_progress' | 'shipped';
export type ChangelogTag = 'new' | 'improved' | 'fixed';

export interface Post {
  id: string;
  user_id: string;
  author_email: string | null;
  title: string;
  description: string;
  category: PostCategory;
  status: PostStatus;
  upvotes_count: number;
  created_at: string;
  admin_response?: string | null;
  target_quarter?: string | null;
  merged_into_id?: string | null;
  // Computed / joined fields:
  has_upvoted?: boolean;
  comments_count?: number;
}

export interface Upvote {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author_email: string | null;
  content: string;
  created_at: string;
}

export interface Changelog {
  id: string;
  user_id: string;
  version: string;
  title: string;
  content: string;
  tag: ChangelogTag;
  published_at: string;
}

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          user_id: string;
          author_email: string | null;
          title: string;
          description: string;
          category: PostCategory;
          status: PostStatus;
          upvotes_count: number;
          created_at: string;
          admin_response?: string | null;
          target_quarter?: string | null;
          merged_into_id?: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          author_email?: string | null;
          title: string;
          description: string;
          category?: PostCategory;
          status?: PostStatus;
          upvotes_count?: number;
          created_at?: string;
          admin_response?: string | null;
          target_quarter?: string | null;
          merged_into_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          author_email?: string | null;
          title?: string;
          description?: string;
          category?: PostCategory;
          status?: PostStatus;
          upvotes_count?: number;
          created_at?: string;
          admin_response?: string | null;
          target_quarter?: string | null;
          merged_into_id?: string | null;
        };
        Relationships: [];
      };
      upvotes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          author_email: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id?: string;
          author_email?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          author_email?: string | null;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      changelogs: {
        Row: {
          id: string;
          user_id: string;
          version: string;
          title: string;
          content: string;
          tag: ChangelogTag;
          published_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          version: string;
          title: string;
          content: string;
          tag?: ChangelogTag;
          published_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          version?: string;
          title?: string;
          content?: string;
          tag?: ChangelogTag;
          published_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
