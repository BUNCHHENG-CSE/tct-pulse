import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const placeholderFetch: typeof fetch = async (_input, init) => {
  const headers = new Headers(init?.headers);
  const accept = headers.get('accept') || '';
  const body = accept.includes('application/vnd.pgrst.object+json')
    ? JSON.stringify(null)
    : JSON.stringify([]);

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    isPlaceholder ? { global: { fetch: placeholderFetch } } : undefined
  );
}
