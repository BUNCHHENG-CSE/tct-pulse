'use server';

import {
  createClient,
  DEMO_SESSION_COOKIE,
  isSupabasePlaceholder,
} from '@/lib/supabase/server';
import {
  DEMO_REGISTERED_COOKIE,
  registerDemoUser,
  verifyDemoCredentials,
  type SeedUser,
} from '@/lib/seed-data';
import { authSchema, type AuthInput } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export async function loginAction(input: AuthInput): Promise<AuthActionResult> {
  const parsed = authSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid email or password',
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;
  const cookieStore = await cookies();

  let cookieRegisteredUsers: SeedUser[] = [];
  const registeredRaw = cookieStore.get(DEMO_REGISTERED_COOKIE)?.value;
  if (registeredRaw) {
    try {
      cookieRegisteredUsers = JSON.parse(decodeURIComponent(registeredRaw));
    } catch {
      cookieRegisteredUsers = [];
    }
  }

  const seedUser = verifyDemoCredentials(email, password, cookieRegisteredUsers);

  if (isSupabasePlaceholder()) {
    if (!seedUser) {
      return {
        success: false,
        error: 'Invalid email or password. Use test credentials: admin@tctpulse.dev / password123',
      };
    }

    cookieStore.set(DEMO_SESSION_COOKIE, seedUser.email, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    revalidatePath('/', 'layout');
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Allow seed user login fallback if Supabase does not have the seed user yet or fetch fails
      if (seedUser) {
        cookieStore.set(DEMO_SESSION_COOKIE, seedUser.email, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
        });
        revalidatePath('/', 'layout');
        return { success: true };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err) {
    if (seedUser) {
      cookieStore.set(DEMO_SESSION_COOKIE, seedUser.email, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      revalidatePath('/', 'layout');
      return { success: true };
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Authentication failed',
    };
  }
}

export async function signupAction(input: AuthInput): Promise<AuthActionResult> {
  const parsed = authSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid email or password',
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  if (isSupabasePlaceholder()) {
    const newUser = registerDemoUser(email, password);
    const cookieStore = await cookies();
    let existing: SeedUser[] = [];
    const raw = cookieStore.get(DEMO_REGISTERED_COOKIE)?.value;
    if (raw) {
      try {
        existing = JSON.parse(decodeURIComponent(raw));
      } catch {
        existing = [];
      }
    }
    const updated = [
      ...existing.filter((u) => u.email.toLowerCase() !== email),
      newUser,
    ];
    cookieStore.set(DEMO_REGISTERED_COOKIE, encodeURIComponent(JSON.stringify(updated)), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    revalidatePath('/', 'layout');
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Sign up failed',
    };
  }
}

export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);

  if (!isSupabasePlaceholder()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors during signOut
    }
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}
