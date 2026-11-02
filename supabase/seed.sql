-- ====================================================================
-- tctPulse Seed Data Script for Supabase / PostgreSQL
-- ====================================================================

-- 1. Ensure required extensions exist
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Seed Test Users into auth.users
-- Admin credentials: admin@tctpulse.dev / password123
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@tctpulse.dev',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Alex Rivera (Admin)"}'::jsonb,
    now() - interval '30 days',
    now()
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'sarah.chen@designlab.co',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sarah Chen"}'::jsonb,
    now() - interval '25 days',
    now()
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'marcus.v@cloudscale.io',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Marcus Vance"}'::jsonb,
    now() - interval '20 days',
    now()
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'elena.rostova@datadive.org',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Elena Rostova"}'::jsonb,
    now() - interval '18 days',
    now()
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'jordan.k@saasgrowth.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Jordan Kim"}'::jsonb,
    now() - interval '15 days',
    now()
  )
on conflict (id) do nothing;

-- 3. Populate auth.identities if table exists (for Supabase Auth email login compatibility)
do $$
begin
  if exists (select from pg_tables where schemaname = 'auth' and tablename = 'identities') then
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11","email":"admin@tctpulse.dev"}'::jsonb, 'email', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now(), now(), now()),
      ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '{"sub":"b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22","email":"sarah.chen@designlab.co"}'::jsonb, 'email', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', now(), now(), now()),
      ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', '{"sub":"c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33","email":"marcus.v@cloudscale.io"}'::jsonb, 'email', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', now(), now(), now()),
      ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '{"sub":"d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44","email":"elena.rostova@datadive.org"}'::jsonb, 'email', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', now(), now(), now()),
      ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '{"sub":"e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55","email":"jordan.k@saasgrowth.com"}'::jsonb, 'email', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', now(), now(), now())
    on conflict (provider, provider_id) do nothing;
  end if;
end $$;

-- 4. Clean previous seed data to allow idempotent re-execution
delete from public.comments where id::text like '22222222-%';
delete from public.upvotes where id::text like '44444444-%';
delete from public.posts where id::text like '11111111-%';
delete from public.changelogs where id::text like '33333333-%';

-- 5. Seed Posts (17 posts across all categories and statuses)
insert into public.posts (
  id,
  user_id,
  author_email,
  title,
  description,
  category,
  status,
  upvotes_count,
  created_at
) values
  (
    '11111111-1111-4111-8111-111111111101',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'enterprise-admin@acme.corp',
    'SSO & SAML 2.0 authentication with Okta and Google Workspace',
    'Enterprise teams need to enforce Single Sign-On (SSO) using SAML 2.0 or OIDC. Support for Okta, Azure AD / Microsoft Entra ID, and Google Workspace will allow team members to sign in seamlessly without managing separate credentials.',
    'feature',
    'planned',
    84,
    now() - interval '14 days'
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'marcus.v@cloudscale.io',
    'Two-way GitHub Issues and Linear ticket synchronization',
    'Synchronize roadmap initiatives directly with engineering issue trackers. When a linked GitHub Issue or Linear ticket changes status or closes, update the tctPulse roadmap card status automatically.',
    'integration',
    'in_progress',
    72,
    now() - interval '10 days'
  ),
  (
    '11111111-1111-4111-8111-111111111103',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'jordan.k@saasgrowth.com',
    'Custom domain support with automatic Let''s Encrypt SSL provisioning',
    'Allow organizations to host their feedback portal on their own branded domain (e.g., feedback.mycompany.com) with automatic zero-configuration SSL certificate renewal and CNAME verification.',
    'feature',
    'in_progress',
    62,
    now() - interval '8 days'
  ),
  (
    '11111111-1111-4111-8111-111111111104',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'sarah.chen@designlab.co',
    'Real-time Slack & Discord webhook alerts for feedback activity',
    'Configure outgoing webhook endpoints to deliver instant notifications to designated Slack or Discord channels whenever new feature requests or comments are posted, keeping product teams aligned in real-time.',
    'integration',
    'under_review',
    56,
    now() - interval '3 days'
  ),
  (
    '11111111-1111-4111-8111-111111111105',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@tctpulse.dev',
    'Embeddable public roadmap and feedback widget script for customer docs',
    'Lightweight JavaScript embed script allowing teams to embed a mini feedback board or release changelog badge directly into their customer documentation (GitBook, Mintlify, Notion, or custom app).',
    'feature',
    'shipped',
    49,
    now() - interval '21 days'
  ),
  (
    '11111111-1111-4111-8111-111111111106',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'sarah.chen@designlab.co',
    'WCAG AAA dark mode contrast toggle and high-accessibility color palette',
    'Ensure the public portal and admin workspace meet strict WCAG 2.1 AAA accessibility guidelines, including enhanced contrast ratios, customizable font scaling, and keyboard focus indicators for screen readers.',
    'improvement',
    'under_review',
    41,
    now() - interval '5 days'
  ),
  (
    '11111111-1111-4111-8111-111111111107',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'elena.rostova@datadive.org',
    'AI-assisted duplicate feedback detection & topic clustering',
    'Use semantic vector similarity to detect duplicate feature requests when a customer is drafting an idea. Suggest existing items to upvote instead of creating duplicate fragmented threads.',
    'feature',
    'under_review',
    37,
    now() - interval '2 days'
  ),
  (
    '11111111-1111-4111-8111-111111111108',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'dev@productteam.io',
    'Keyboard shortcut navigation system (Cmd+K command menu & J/K browsing)',
    'Power users need rapid navigation: press J/K to move between cards, Enter to open the detail sheet, U to toggle upvote, and Cmd+K / Ctrl+K to trigger global command search.',
    'improvement',
    'in_progress',
    33,
    now() - interval '7 days'
  ),
  (
    '11111111-1111-4111-8111-111111111109',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'marcus.v@cloudscale.io',
    'PostHog and Segment product analytics event tracking integration',
    'Send telemetry events (e.g., feedback_submitted, upvote_toggled, changelog_viewed) directly to PostHog and Segment to monitor portal engagement in centralized analytics dashboards.',
    'integration',
    'shipped',
    30,
    now() - interval '25 days'
  ),
  (
    '11111111-1111-4111-8111-111111111110',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'elena.rostova@datadive.org',
    'Export feedback items and voter telemetry to CSV & JSON format',
    'Download filtered feedback tables with vote counts, author metadata, and status timelines into CSV or structured JSON for offline analysis in spreadsheets or BI tools.',
    'improvement',
    'shipped',
    27,
    now() - interval '18 days'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'jordan.k@saasgrowth.com',
    'Zapier and Make.com trigger connectors for external workflow automation',
    'Trigger automated workflows in Zapier or Make when new feedback is created, upvotes pass a target milestone, or a feature status moves from Planned to Shipped.',
    'integration',
    'planned',
    25,
    now() - interval '12 days'
  ),
  (
    '11111111-1111-4111-8111-111111111112',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'sarah.chen@designlab.co',
    'Multi-language localization (i18n) support for public portal',
    'Enable automatic language detection and user language switching (English, Spanish, French, German, Japanese) for international customer bases.',
    'feature',
    'planned',
    21,
    now() - interval '16 days'
  ),
  (
    '11111111-1111-4111-8111-111111111113',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'jordan.k@saasgrowth.com',
    'Granular email notification preferences for upvoted topics',
    'Allow users to customize whether they receive email notifications when items they upvoted transition status or receive direct replies from project maintainers.',
    'improvement',
    'planned',
    19,
    now() - interval '11 days'
  ),
  (
    '11111111-1111-4111-8111-111111111114',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'elena.rostova@datadive.org',
    'Fix intermittent session timeout on mobile Safari browser',
    'When switching away from the tab on iOS Safari for longer than 5 minutes, returning to the page triggers an unexpected logout banner instead of silently refreshing the session token.',
    'bug',
    'planned',
    18,
    now() - interval '9 days'
  ),
  (
    '11111111-1111-4111-8111-111111111115',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'marcus.v@cloudscale.io',
    'Upvote button flickering state during high latency mobile connection',
    'Rapidly clicking upvote under throttled 3G networks caused the optimistic count to flicker between previous and new states due to concurrent server action resolution.',
    'bug',
    'shipped',
    15,
    now() - interval '20 days'
  ),
  (
    '11111111-1111-4111-8111-111111111116',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'sarah.chen@designlab.co',
    'Markdown table syntax rendering glitch in post details drawer',
    'Tables formatted with standard Markdown pipe syntax overflow the side sheet container horizontally without horizontal scrolling on narrower viewport widths.',
    'bug',
    'in_progress',
    11,
    now() - interval '4 days'
  ),
  (
    '11111111-1111-4111-8111-111111111117',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@tctpulse.dev',
    'Character counter overflow on lengthy feedback descriptions',
    'When pasting a description exceeding 500 characters, the character counter text overlaps with the submit button on smaller mobile screen widths.',
    'bug',
    'under_review',
    4,
    now() - interval '1 day'
  );

-- 6. Seed Upvotes
insert into public.upvotes (
  id,
  post_id,
  user_id,
  created_at
) values
  ('44444444-4444-4444-8444-444444444401', '11111111-1111-4111-8111-111111111101', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '14 days'),
  ('44444444-4444-4444-8444-444444444402', '11111111-1111-4111-8111-111111111102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '10 days'),
  ('44444444-4444-4444-8444-444444444403', '11111111-1111-4111-8111-111111111103', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '8 days'),
  ('44444444-4444-4444-8444-444444444404', '11111111-1111-4111-8111-111111111104', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '3 days'),
  ('44444444-4444-4444-8444-444444444405', '11111111-1111-4111-8111-111111111105', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '21 days'),
  ('44444444-4444-4444-8444-444444444406', '11111111-1111-4111-8111-111111111106', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '5 days'),
  ('44444444-4444-4444-8444-444444444407', '11111111-1111-4111-8111-111111111107', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '2 days'),
  ('44444444-4444-4444-8444-444444444408', '11111111-1111-4111-8111-111111111108', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '7 days'),
  ('44444444-4444-4444-8444-444444444409', '11111111-1111-4111-8111-111111111109', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '25 days'),
  ('44444444-4444-4444-8444-444444444410', '11111111-1111-4111-8111-111111111110', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '18 days'),
  ('44444444-4444-4444-8444-444444444411', '11111111-1111-4111-8111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '12 days'),
  ('44444444-4444-4444-8444-444444444412', '11111111-1111-4111-8111-111111111112', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '16 days'),
  ('44444444-4444-4444-8444-444444444413', '11111111-1111-4111-8111-111111111113', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '11 days'),
  ('44444444-4444-4444-8444-444444444414', '11111111-1111-4111-8111-111111111114', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '9 days'),
  ('44444444-4444-4444-8444-444444444415', '11111111-1111-4111-8111-111111111115', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '20 days'),
  ('44444444-4444-4444-8444-444444444416', '11111111-1111-4111-8111-111111111116', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '4 days'),
  ('44444444-4444-4444-8444-444444444417', '11111111-1111-4111-8111-111111111117', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '1 day');

-- 7. Seed Comments
insert into public.comments (
  id,
  post_id,
  user_id,
  author_email,
  content,
  created_at
) values
  (
    '22222222-2222-4222-8222-222222222201',
    '11111111-1111-4111-8111-111111111101',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@tctpulse.dev',
    'We are prioritizing Okta SAML and Azure AD first, aiming for beta testing in the upcoming release cycle.',
    now() - interval '13 days'
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    '11111111-1111-4111-8111-111111111101',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'marcus.v@cloudscale.io',
    'Essential for our SOC2 Type II audit. Please ensure JIT (Just-In-Time) provisioning is supported as well!',
    now() - interval '11 days'
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    '11111111-1111-4111-8111-111111111101',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'jordan.k@saasgrowth.com',
    '+1 for Google Workspace SAML support.',
    now() - interval '8 days'
  ),
  (
    '22222222-2222-4222-8222-222222222204',
    '11111111-1111-4111-8111-111111111102',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@tctpulse.dev',
    'The GitHub App integration is in active testing. When PRs merge with fixes #123, status auto-shifts to Shipped!',
    now() - interval '6 days'
  ),
  (
    '22222222-2222-4222-8222-222222222205',
    '11111111-1111-4111-8111-111111111102',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'elena.rostova@datadive.org',
    'Will Linear teams be able to sync multiple projects or just a single team board?',
    now() - interval '4 days'
  ),
  (
    '22222222-2222-4222-8222-222222222206',
    '11111111-1111-4111-8111-111111111103',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'sarah.chen@designlab.co',
    'We need this to maintain consistent branding for feedback.designlab.co.',
    now() - interval '5 days'
  ),
  (
    '22222222-2222-4222-8222-222222222207',
    '11111111-1111-4111-8111-111111111103',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@tctpulse.dev',
    'We are wrapping up automated TLS cert issuance via Cloudflare for SaaS. Coming this week!',
    now() - interval '2 days'
  ),
  (
    '22222222-2222-4222-8222-222222222208',
    '11111111-1111-4111-8111-111111111104',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'marcus.v@cloudscale.io',
    'Please make sure payload includes author email, category, and direct link to the post.',
    now() - interval '2 days'
  ),
  (
    '22222222-2222-4222-8222-222222222209',
    '11111111-1111-4111-8111-111111111104',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'jordan.k@saasgrowth.com',
    '+1, Discord webhook format would also be fantastic.',
    now() - interval '1 day'
  ),
  (
    '22222222-2222-4222-8222-222222222210',
    '11111111-1111-4111-8111-111111111114',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@tctpulse.dev',
    'Investigating background token refresh behaviors in Webkit lifecycle handlers.',
    now() - interval '7 days'
  );

-- 8. Seed Changelogs (5 releases)
insert into public.changelogs (
  id,
  user_id,
  version,
  title,
  content,
  tag,
  published_at
) values
  (
    '33333333-3333-4333-8333-333333333301',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'v1.2.0',
    'Custom Status Workflows & Real-time Webhooks',
    '### What is new in v1.2.0:
- **Granular Status Tracking:** Filter between Under Review, Planned, In Progress, and Shipped directly on the public board.
- **Optimistic Upvotes:** Instant, lag-free vote button response backed by React 19 optimistic updates.
- **Performance:** Reduced bundle size and faster initial server-rendered page load speeds.',
    'new',
    now() - interval '2 days'
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'v1.1.2',
    'Safari Mobile Session Timeout Patch & Layout Improvements',
    '### Fixes and Adjustments:
- **Session Continuity:** Fixed token refreshing issue when returning to Safari tab on iOS devices.
- **Responsive Layout:** Corrected mobile drawer padding and table overflow issues.',
    'fixed',
    now() - interval '6 days'
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'v1.1.0',
    'Enhanced Markdown Editor & Faster Filtering',
    '### Enhancements:
- **Rich formatting:** Descriptions and changelogs now support structured Markdown headers, bullet lists, and code blocks.
- **Search & URL Params:** URL queries are now automatically synchronized with active category filters and sort orders.',
    'improved',
    now() - interval '12 days'
  ),
  (
    '33333333-3333-4333-8333-333333333304',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'v1.0.5',
    'Upvote Race Condition Fix & Analytics Telemetry',
    '### Improvements:
- **Data Integrity:** Prevented duplicate votes caused by rapid clicking on high-latency mobile networks.
- **Analytics:** Integrated PostHog telemetry hooks for tracking post view events.',
    'fixed',
    now() - interval '19 days'
  ),
  (
    '33333333-3333-4333-8333-333333333305',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'v1.0.0',
    'Initial Public Launch of tctPulse',
    '### Welcome to tctPulse!
We are thrilled to launch the all-in-one Product Feedback Board, Public Roadmap, and Changelog Hub.
Collect customer insights, prioritize what to build next, and celebrate your product releases with a unified portal.',
    'new',
    now() - interval '28 days'
  );
