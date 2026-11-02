import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import {
  SEED_POSTS,
  SEED_COMMENTS,
  SEED_CHANGELOGS,
} from '../lib/seed-data';

// 1. Manually parse .env.local if present
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...values] = trimmed.split('=');
      const val = values.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runSeed() {
  console.log('🚀 tctPulse Data Seeder\n');

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️  Supabase URL is not configured or is using placeholder credentials:');
    console.warn(`   URL: ${supabaseUrl || '(empty)'}`);
    console.warn('\n📌 To seed your database:');
    console.warn('   1. Option A (Recommended): Copy supabase/seed.sql and run it directly in your');
    console.warn('      Supabase Dashboard -> SQL Editor.');
    console.warn('   2. Option B: Update .env.local with your real Supabase URL and Anon/Service key,');
    console.warn('      then rerun: bun run seed\n');
    console.log(`📦 Seed Dataset Ready:`);
    console.log(`   - ${SEED_POSTS.length} Posts (across feature, bug, improvement, integration)`);
    console.log(`   - ${SEED_COMMENTS.length} Comments with realistic stakeholder feedback`);
    console.log(`   - ${SEED_CHANGELOGS.length} Versioned Changelog Releases\n`);
    return;
  }

  console.log(`📡 Connecting to Supabase at: ${supabaseUrl}...`);

  const clientKey = serviceRoleKey || supabaseAnonKey;
  const supabase = createClient(supabaseUrl, clientKey, {
    auth: { persistSession: false },
  });

  let userId: string;

  if (serviceRoleKey) {
    console.log('🔑 Using SUPABASE_SERVICE_ROLE_KEY (admin mode)...');
    userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  } else {
    console.log('👤 Signing in/up demo admin user (admin@tctpulse.dev)...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@tctpulse.dev',
      password: 'password123',
    });

    if (signInError) {
      console.log('   Creating new demo user admin@tctpulse.dev...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@tctpulse.dev',
        password: 'password123',
      });

      if (signUpError || !signUpData.user) {
        console.error('❌ Failed to authenticate:', signUpError?.message || signInError.message);
        console.log('\n💡 Tip: You can execute supabase/seed.sql directly in the Supabase SQL Editor.');
        return;
      }
      userId = signUpData.user.id;
    } else {
      userId = signInData.user.id;
    }
  }

  console.log(`✅ Authenticated with User ID: ${userId}`);

  // 1. Insert Posts
  console.log(`📝 Inserting ${SEED_POSTS.length} posts...`);
  const postsToInsert = SEED_POSTS.map((p) => ({
    title: p.title,
    description: p.description,
    category: p.category,
    status: p.status,
    upvotes_count: p.upvotes_count,
    user_id: userId,
    author_email: p.author_email,
    created_at: p.created_at,
  }));

  const { data: insertedPosts, error: postsError } = await supabase
    .from('posts')
    .insert(postsToInsert)
    .select();

  if (postsError) {
    console.error('❌ Error inserting posts:', postsError.message);
    return;
  }

  console.log(`   ✓ Successfully inserted ${insertedPosts.length} posts`);

  // 2. Insert Upvotes & Comments
  if (insertedPosts && insertedPosts.length > 0) {
    console.log(`👍 Inserting upvotes...`);
    const upvotesToInsert = insertedPosts.map((p) => ({
      post_id: p.id,
      user_id: userId,
    }));
    await supabase.from('upvotes').insert(upvotesToInsert);
    console.log(`   ✓ Successfully inserted ${upvotesToInsert.length} upvotes`);

    console.log(`💬 Inserting ${SEED_COMMENTS.length} comments...`);
    const commentsToInsert = SEED_COMMENTS.map((c, i) => {
      const targetPost = insertedPosts[i % insertedPosts.length];
      return {
        post_id: targetPost.id,
        user_id: userId,
        author_email: c.author_email,
        content: c.content,
        created_at: c.created_at,
      };
    });
    const { error: commentsError } = await supabase.from('comments').insert(commentsToInsert);
    if (commentsError) {
      console.warn('   ⚠️ Comments notice:', commentsError.message);
    } else {
      console.log(`   ✓ Successfully inserted ${commentsToInsert.length} comments`);
    }
  }

  // 3. Insert Changelogs
  console.log(`📜 Inserting ${SEED_CHANGELOGS.length} changelogs...`);
  const changelogsToInsert = SEED_CHANGELOGS.map((ch) => ({
    user_id: userId,
    version: ch.version,
    title: ch.title,
    content: ch.content,
    tag: ch.tag,
    published_at: ch.published_at,
  }));

  const { error: changelogsError } = await supabase.from('changelogs').insert(changelogsToInsert);
  if (changelogsError) {
    console.warn('   ⚠️ Changelogs notice:', changelogsError.message);
  } else {
    console.log(`   ✓ Successfully inserted ${changelogsToInsert.length} changelogs`);
  }

  console.log('\n🎉 Seeding complete! Launch the app using: bun dev\n');
}

runSeed().catch((err) => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
