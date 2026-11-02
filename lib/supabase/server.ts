import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { SEED_USERS, DEMO_CUSTOM_USERS } from '@/lib/seed-data';

export const DEMO_SESSION_COOKIE = 'tctpulse_demo_session';

export function isSupabasePlaceholder(url?: string): boolean {
  const target = url ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return !target || target.includes('placeholder') || !key || key.includes('placeholder');
}

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

export function createDemoUser(email: string): User {
  const normalized = email.trim().toLowerCase();
  const matched =
    SEED_USERS.find((u) => u.email.toLowerCase() === normalized) ||
    DEMO_CUSTOM_USERS.find((u) => u.email.toLowerCase() === normalized);

  return {
    id: matched?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    aud: 'authenticated',
    role: 'authenticated',
    email: matched?.email || normalized,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      email: matched?.email || normalized,
      name: matched?.name || normalized.split('@')[0],
    },
    created_at: new Date().toISOString(),
  } as User;
}

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  const isPlaceholder = isSupabasePlaceholder(supabaseUrl);

  const client = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    ...(isPlaceholder ? { global: { fetch: placeholderFetch } } : {}),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have proxy refreshing user sessions.
        }
      },
    },
  });

  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = (async (...args: Parameters<typeof originalGetUser>) => {
    const demoEmail = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

    if (!isPlaceholder) {
      try {
        const res = await originalGetUser(...args);
        if (res.data?.user) {
          return res;
        }
      } catch {
        // Fall back to demo session cookie if network/fetch fails
      }
    }

    if (demoEmail) {
      return {
        data: { user: createDemoUser(demoEmail) },
        error: null,
      };
    }

    return {
      data: { user: null },
      error: null,
    } as unknown as ReturnType<typeof client.auth.getUser>;
  }) as typeof client.auth.getUser;

  return client;
}
