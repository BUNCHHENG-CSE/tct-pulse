import type { Post, Comment, Changelog, Upvote } from '@/types/database';

export const DEMO_SESSION_COOKIE = 'tctpulse_demo_session';
export const DEMO_REGISTERED_COOKIE = 'tctpulse_demo_registered';
export const DEFAULT_SEED_PASSWORD = 'password123';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes('placeholder') &&
      !key.includes('placeholder')
  );
}

export interface SeedUser {
  id: string;
  email: string;
  name: string;
  password?: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'admin@tctpulse.dev',
    name: 'Alex Rivera (Admin)',
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    email: 'sarah.chen@designlab.co',
    name: 'Sarah Chen',
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    email: 'marcus.v@cloudscale.io',
    name: 'Marcus Vance',
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    email: 'elena.rostova@datadive.org',
    name: 'Elena Rostova',
  },
  {
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    email: 'jordan.k@saasgrowth.com',
    name: 'Jordan Kim',
  },
];

const INITIAL_SEED_POSTS: Post[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    author_email: 'enterprise-admin@acme.corp',
    title: 'SSO & SAML 2.0 authentication with Okta and Google Workspace',
    description:
      'Enterprise teams need to enforce Single Sign-On (SSO) using SAML 2.0 or OIDC. Support for Okta, Azure AD / Microsoft Entra ID, and Google Workspace will allow team members to sign in seamlessly without managing separate credentials.',
    category: 'feature',
    status: 'planned',
    target_quarter: 'Q2 2026',
    admin_response: 'We are currently testing SAML 2.0 with Okta in staging. Google Workspace & Azure AD support will roll out immediately following.',
    upvotes_count: 84,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 3,
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    author_email: 'marcus.v@cloudscale.io',
    title: 'Two-way GitHub Issues and Linear ticket synchronization',
    description:
      'Synchronize roadmap initiatives directly with engineering issue trackers. When a linked GitHub Issue or Linear ticket changes status or closes, update the tctPulse roadmap card status automatically.',
    category: 'integration',
    status: 'in_progress',
    target_quarter: 'Q1 2026',
    admin_response: 'Engineering is finalizing the bi-directional webhook gateway. Beta testing begins next week.',
    upvotes_count: 72,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 2,
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    user_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    author_email: 'jordan.k@saasgrowth.com',
    title: 'Custom domain support with automatic Let\'s Encrypt SSL provisioning',
    description:
      'Allow organizations to host their feedback portal on their own branded domain (e.g., feedback.mycompany.com) with automatic zero-configuration SSL certificate renewal and CNAME verification.',
    category: 'feature',
    status: 'in_progress',
    upvotes_count: 62,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 2,
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    author_email: 'sarah.chen@designlab.co',
    title: 'Real-time Slack & Discord webhook alerts for feedback activity',
    description:
      'Configure outgoing webhook endpoints to deliver instant notifications to designated Slack or Discord channels whenever new feature requests or comments are posted, keeping product teams aligned in real-time.',
    category: 'integration',
    status: 'under_review',
    upvotes_count: 56,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 2,
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    author_email: 'admin@tctpulse.dev',
    title: 'Embeddable public roadmap and feedback widget script for customer docs',
    description:
      'Lightweight JavaScript embed script allowing teams to embed a mini feedback board or release changelog badge directly into their customer documentation (GitBook, Mintlify, Notion, or custom app).',
    category: 'feature',
    status: 'shipped',
    target_quarter: 'Q1 2026',
    admin_response: 'Shipped! The embeddable widget component and script launcher are now available.',
    upvotes_count: 49,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 1,
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    author_email: 'sarah.chen@designlab.co',
    title: 'WCAG AAA dark mode contrast toggle and high-accessibility color palette',
    description:
      'Ensure the public portal and admin workspace meet strict WCAG 2.1 AAA accessibility guidelines, including enhanced contrast ratios, customizable font scaling, and keyboard focus indicators for screen readers.',
    category: 'improvement',
    status: 'under_review',
    upvotes_count: 41,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 1,
  },
  {
    id: '11111111-1111-4111-8111-111111111107',
    user_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    author_email: 'elena.rostova@datadive.org',
    title: 'AI-assisted duplicate feedback detection & topic clustering',
    description:
      'Use semantic vector similarity to detect duplicate feature requests when a customer is drafting an idea. Suggest existing items to upvote instead of creating duplicate fragmented threads.',
    category: 'feature',
    status: 'under_review',
    upvotes_count: 37,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 0,
  },
  {
    id: '11111111-1111-4111-8111-111111111108',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    author_email: 'dev@productteam.io',
    title: 'Keyboard shortcut navigation system (Cmd+K command menu & J/K browsing)',
    description:
      'Power users need rapid navigation: press J/K to move between cards, Enter to open the detail sheet, U to toggle upvote, and Cmd+K / Ctrl+K to trigger global command search.',
    category: 'improvement',
    status: 'in_progress',
    upvotes_count: 33,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 1,
  },
  {
    id: '11111111-1111-4111-8111-111111111109',
    user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    author_email: 'marcus.v@cloudscale.io',
    title: 'PostHog and Segment product analytics event tracking integration',
    description:
      'Send telemetry events (e.g., feedback_submitted, upvote_toggled, changelog_viewed) directly to PostHog and Segment to monitor portal engagement in centralized analytics dashboards.',
    category: 'integration',
    status: 'shipped',
    upvotes_count: 30,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 1,
  },
  {
    id: '11111111-1111-4111-8111-111111111110',
    user_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    author_email: 'elena.rostova@datadive.org',
    title: 'Export feedback items and voter telemetry to CSV & JSON format',
    description:
      'Download filtered feedback tables with vote counts, author metadata, and status timelines into CSV or structured JSON for offline analysis in spreadsheets or BI tools.',
    category: 'improvement',
    status: 'shipped',
    upvotes_count: 27,
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 0,
  },
  {
    id: '11111111-1111-4111-8111-111111111111',
    user_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    author_email: 'jordan.k@saasgrowth.com',
    title: 'Zapier and Make.com trigger connectors for external workflow automation',
    description:
      'Trigger automated workflows in Zapier or Make when new feedback is created, upvotes pass a target milestone, or a feature status moves from Planned to Shipped.',
    category: 'integration',
    status: 'planned',
    upvotes_count: 25,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 1,
  },
  {
    id: '11111111-1111-4111-8111-111111111112',
    user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    author_email: 'sarah.chen@designlab.co',
    title: 'Multi-language localization (i18n) support for public portal',
    description:
      'Enable automatic language detection and user language switching (English, Spanish, French, German, Japanese) for international customer bases.',
    category: 'feature',
    status: 'planned',
    upvotes_count: 21,
    created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 0,
  },
  {
    id: '11111111-1111-4111-8111-111111111113',
    user_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    author_email: 'jordan.k@saasgrowth.com',
    title: 'Granular email notification preferences for upvoted topics',
    description:
      'Allow users to customize whether they receive email notifications when items they upvoted transition status or receive direct replies from project maintainers.',
    category: 'improvement',
    status: 'planned',
    upvotes_count: 19,
    created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 0,
  },
  {
    id: '11111111-1111-4111-8111-111111111114',
    user_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    author_email: 'elena.rostova@datadive.org',
    title: 'Fix intermittent session timeout on mobile Safari browser',
    description:
      'When switching away from the tab on iOS Safari for longer than 5 minutes, returning to the page triggers an unexpected logout banner instead of silently refreshing the session token.',
    category: 'bug',
    status: 'planned',
    upvotes_count: 18,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 2,
  },
  {
    id: '11111111-1111-4111-8111-111111111115',
    user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    author_email: 'marcus.v@cloudscale.io',
    title: 'Upvote button flickering state during high latency mobile connection',
    description:
      'Rapidly clicking upvote under throttled 3G networks caused the optimistic count to flicker between previous and new states due to concurrent server action resolution.',
    category: 'bug',
    status: 'shipped',
    upvotes_count: 15,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 1,
  },
  {
    id: '11111111-1111-4111-8111-111111111116',
    user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    author_email: 'sarah.chen@designlab.co',
    title: 'Markdown table syntax rendering glitch in post details drawer',
    description:
      'Tables formatted with standard Markdown pipe syntax overflow the side sheet container horizontally without horizontal scrolling on narrower viewport widths.',
    category: 'bug',
    status: 'in_progress',
    upvotes_count: 11,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 1,
  },
  {
    id: '11111111-1111-4111-8111-111111111117',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    author_email: 'admin@tctpulse.dev',
    title: 'Character counter overflow on lengthy feedback descriptions',
    description:
      'When pasting a description exceeding 500 characters, the character counter text overlaps with the submit button on smaller mobile screen widths.',
    category: 'bug',
    status: 'under_review',
    upvotes_count: 4,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments_count: 0,
  },
];

const INITIAL_SEED_COMMENTS: Comment[] = [
  {
    id: '22222222-2222-4222-8222-222222222201',
    post_id: '11111111-1111-4111-8111-111111111101',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    author_email: 'admin@tctpulse.dev',
    content:
      'We are prioritizing Okta SAML and Azure AD first, aiming for beta testing in the upcoming release cycle.',
    created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    post_id: '11111111-1111-4111-8111-111111111101',
    user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    author_email: 'marcus.v@cloudscale.io',
    content:
      'Essential for our SOC2 Type II audit. Please ensure JIT (Just-In-Time) provisioning is supported as well!',
    created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222203',
    post_id: '11111111-1111-4111-8111-111111111101',
    user_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    author_email: 'jordan.k@saasgrowth.com',
    content: '+1 for Google Workspace SAML support.',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222204',
    post_id: '11111111-1111-4111-8111-111111111102',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    author_email: 'admin@tctpulse.dev',
    content:
      'The GitHub App integration is in active testing. When PRs merge with fixes #123, status auto-shifts to Shipped!',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222205',
    post_id: '11111111-1111-4111-8111-111111111102',
    user_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    author_email: 'elena.rostova@datadive.org',
    content: 'Will Linear teams be able to sync multiple projects or just a single team board?',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222206',
    post_id: '11111111-1111-4111-8111-111111111103',
    user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    author_email: 'sarah.chen@designlab.co',
    content: 'We need this to maintain consistent branding for feedback.designlab.co.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222207',
    post_id: '11111111-1111-4111-8111-111111111103',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    author_email: 'admin@tctpulse.dev',
    content: 'We are wrapping up automated TLS cert issuance via Cloudflare for SaaS. Coming this week!',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222208',
    post_id: '11111111-1111-4111-8111-111111111104',
    user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    author_email: 'marcus.v@cloudscale.io',
    content: 'Please make sure payload includes author email, category, and direct link to the post.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222209',
    post_id: '11111111-1111-4111-8111-111111111104',
    user_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    author_email: 'jordan.k@saasgrowth.com',
    content: '+1, Discord webhook format would also be fantastic.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222210',
    post_id: '11111111-1111-4111-8111-111111111114',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    author_email: 'admin@tctpulse.dev',
    content: 'Investigating background token refresh behaviors in Webkit lifecycle handlers.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_SEED_CHANGELOGS: Changelog[] = [
  {
    id: '33333333-3333-4333-8333-333333333301',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    version: 'v1.2.0',
    title: 'Custom Status Workflows & Real-time Webhooks',
    content: `### What is new in v1.2.0:
- **Granular Status Tracking:** Filter between Under Review, Planned, In Progress, and Shipped directly on the public board.
- **Optimistic Upvotes:** Instant, lag-free vote button response backed by React 19 optimistic updates.
- **Performance:** Reduced bundle size and faster initial server-rendered page load speeds.`,
    tag: 'new',
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '33333333-3333-4333-8333-333333333302',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    version: 'v1.1.2',
    title: 'Safari Mobile Session Timeout Patch & Layout Improvements',
    content: `### Fixes and Adjustments:
- **Session Continuity:** Fixed token refreshing issue when returning to Safari tab on iOS devices.
- **Responsive Layout:** Corrected mobile drawer padding and table overflow issues.`,
    tag: 'fixed',
    published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '33333333-3333-4333-8333-333333333303',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    version: 'v1.1.0',
    title: 'Enhanced Markdown Editor & Faster Filtering',
    content: `### Enhancements:
- **Rich formatting:** Descriptions and changelogs now support structured Markdown headers, bullet lists, and code blocks.
- **Search & URL Params:** URL queries are now automatically synchronized with active category filters and sort orders.`,
    tag: 'improved',
    published_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '33333333-3333-4333-8333-333333333304',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    version: 'v1.0.5',
    title: 'Upvote Race Condition Fix & Analytics Telemetry',
    content: `### Improvements:
- **Data Integrity:** Prevented duplicate votes caused by rapid clicking on high-latency mobile networks.
- **Analytics:** Integrated PostHog telemetry hooks for tracking post view events.`,
    tag: 'fixed',
    published_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '33333333-3333-4333-8333-333333333305',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    version: 'v1.0.0',
    title: 'Initial Public Launch of tctPulse',
    content: `### Welcome to tctPulse!
We are thrilled to launch the all-in-one Product Feedback Board, Public Roadmap, and Changelog Hub.
Collect customer insights, prioritize what to build next, and celebrate your product releases with a unified portal.`,
    tag: 'new',
    published_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_SEED_UPVOTES: Upvote[] = INITIAL_SEED_POSTS.map((post, idx) => ({
  id: `44444444-4444-4444-8444-4444444444${(idx + 1).toString().padStart(2, '0')}`,
  post_id: post.id,
  user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  created_at: post.created_at,
}));

interface GlobalSeedStore {
  posts: Post[];
  comments: Comment[];
  changelogs: Changelog[];
  upvotes: Upvote[];
  customUsers: SeedUser[];
}

const globalForSeed = globalThis as unknown as {
  __tctPulseSeedStore?: GlobalSeedStore;
};

if (!globalForSeed.__tctPulseSeedStore) {
  globalForSeed.__tctPulseSeedStore = {
    posts: INITIAL_SEED_POSTS.map((p) => ({ ...p })),
    comments: INITIAL_SEED_COMMENTS.map((c) => ({ ...c })),
    changelogs: INITIAL_SEED_CHANGELOGS.map((ch) => ({ ...ch })),
    upvotes: INITIAL_SEED_UPVOTES.map((u) => ({ ...u })),
    customUsers: [],
  };
}

export const SEED_POSTS: Post[] = globalForSeed.__tctPulseSeedStore.posts;
export const SEED_COMMENTS: Comment[] = globalForSeed.__tctPulseSeedStore.comments;
export const SEED_CHANGELOGS: Changelog[] = globalForSeed.__tctPulseSeedStore.changelogs;
export const SEED_UPVOTES: Upvote[] = globalForSeed.__tctPulseSeedStore.upvotes;
export const DEMO_CUSTOM_USERS: SeedUser[] = globalForSeed.__tctPulseSeedStore.customUsers;

export function resetSeedData(): void {
  SEED_POSTS.splice(0, SEED_POSTS.length, ...INITIAL_SEED_POSTS.map((p) => ({ ...p })));
  SEED_COMMENTS.splice(0, SEED_COMMENTS.length, ...INITIAL_SEED_COMMENTS.map((c) => ({ ...c })));
  SEED_CHANGELOGS.splice(0, SEED_CHANGELOGS.length, ...INITIAL_SEED_CHANGELOGS.map((ch) => ({ ...ch })));
  SEED_UPVOTES.splice(0, SEED_UPVOTES.length, ...INITIAL_SEED_UPVOTES.map((u) => ({ ...u })));
}

export function verifyDemoCredentials(
  email: string,
  password: string,
  cookieRegisteredUsers: SeedUser[] = []
): SeedUser | null {
  const normalizedEmail = email.trim().toLowerCase();

  // Check built-in seed users (default password: password123)
  const seedMatch = SEED_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (seedMatch && password === DEFAULT_SEED_PASSWORD) {
    return seedMatch;
  }

  // Check custom registered users in memory or cookie
  const allCustom = [...DEMO_CUSTOM_USERS, ...cookieRegisteredUsers];
  const customMatch = allCustom.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );
  if (customMatch) {
    return {
      id: customMatch.id,
      email: customMatch.email,
      name: customMatch.name,
    };
  }

  return null;
}

export function registerDemoUser(email: string, password: string): SeedUser {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = DEMO_CUSTOM_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (existing) {
    existing.password = password;
    return existing;
  }

  const newUser: SeedUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    name: normalizedEmail.split('@')[0],
    password,
  };
  DEMO_CUSTOM_USERS.push(newUser);
  return newUser;
}
