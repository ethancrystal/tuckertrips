# Tucker Trips

## Overview

Tucker Trips is a Next.js 14 application designed for travel planning and sharing. It allows users to log their trips, share detailed travel notes with a trusted circle of friends, and receive personalized recommendations. The project aims to provide a platform for authentic travel experiences, fostering a community around shared adventures and insights. Key capabilities include comprehensive trip creation with multi-step wizards, secure sharing functionalities, direct messaging, and an AI-powered travel chatbot. The vision is to become the go-to platform for travelers seeking to document, share, and discover travel experiences with a focus on privacy and user-controlled sharing.

## User Preferences

- Use `npm` for package management; do not use `pnpm` or `yarn`. The active lock file is `package-lock.json` (a historical `pnpm-lock.yaml` also exists but is not the active one).
- Reuse existing patterns and components; avoid unnecessary rewrites.
- Maintain a clear client/server boundary, especially regarding Supabase keys.
- Never commit secrets; use `.env.local` or platform-specific secret management.
- Mark components `'use client'` only when they require browser APIs or state; otherwise, prefer server components.
- Keep client/server boundary in mind — never import `supabase-server.js` in client components.
- New components should be placed in `components/`; `shadcn/ui` primitives belong in `components/ui/`.
- Auth middleware: use `authenticateOrThrow` from `lib/auth-middleware.js` in API routes.
- Admin middleware: use `verifyAdminSession` from `lib/admin-auth-middleware.js` in admin routes.
- Do not add a root-level `.babelrc` or `babel.config.js` as it would disable SWC globally.
- Only variables prefixed `NEXT_PUBLIC_` are bundled into the browser.
- The `trip_name` column is canonical; `title` is a generated alias. API route validators accept `trip_name` only.
- Do not delete legacy files without explicit instruction.
- When editing mixed JS/TS modules, check import paths before editing.

## System Architecture

**Framework & UI:**
- Built with Next.js 14 App Router, using a mixed JavaScript and TypeScript codebase.
- UI components are developed using `shadcn/ui` (built on Radix primitives) and styled with Tailwind CSS.
- **UI/UX Decisions:** The application prioritizes a clean, modern interface consistent with shadcn/ui. Components like `DashboardNew.jsx` and `AuthModalNew.jsx` are central to the user experience, providing core functionalities and a consistent design language. Trip creation utilizes a multi-step wizard (`TripCreation/` directory) for structured data input, though `TripCreationForm.jsx` is currently active.
- **Dynamic Imports:** `app/page.js` uses `next/dynamic` to lazy-load `DashboardNew`, `AuthModalNew`, and `OnboardingFlow`. `LandingPageNew` remains a static import since it's always needed for unauthenticated visitors. This reduces dev cold-boot compilation time by deferring the heaviest components.

**Backend & Database:**
- Supabase handles authentication, database (PostgreSQL with RLS), and storage.
- All API routes are managed within the `app/api/` directory, covering authentication, trips, messaging, AI chat, friendships, and administration.
- Database schema is managed via Supabase migrations in `supabase/migrations/`. Tables include `profiles`, `trips`, `trip_categories`, `trip_shares`, `pending_shares`, `messages`, `friendships`, and `signup_clicks`.
- Supabase Row Level Security (RLS) is extensively used for data access control, with specific policies for trip visibility (`private`, `friends`, `public`, `shared`).
- Four Supabase client types are used depending on context:
  - `lib/supabase.js` (browser singleton, anon key) — used in client components
  - `createSupabaseRouteClient` / `createRouteClient` (server, anon key + cookies) — used in most API routes, respects RLS
  - `createAdminClient` / direct `createClient(url, serviceKey)` (server, service role key) — bypasses RLS; used in admin routes, AI chat, storage uploads, password reset
  - (legacy `lib/supabase-admin.js` removed — use `createAdminClient` from `lib/supabase-clients.ts`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is normalized at build time in `next.config.js` to guard against the Replit secret being stored as a malformed 5-part JWT. Do not remove this normalization.
- `lib/supabase-config.js` uses static `process.env.NEXT_PUBLIC_*` access (not dynamic `env[key]`) because webpack's DefinePlugin only replaces static patterns in browser bundles.
- **Realtime:** `DashboardNew.jsx` subscribes to the `trip_shares` table (filtered by `shared_with`) so the "Shared With Me" tab updates live. It also subscribes to `messages` table (filtered by `recipient_id`) for real-time unread badge updates. `ChatArea` subscribes to incoming messages for live chat updates. The `trip_shares` and `messages` tables are in the `supabase_realtime` publication.

**Key Features:**
- **User Authentication:** Registration, login, profile management, password reset.
- **Trip Management:** CRUD operations for trips, including detailed information, categories, ratings, and multimedia.
- **Trip Sharing:** Secure sharing of trips with existing friends or via email invitations to non-members. Differentiates between `trip_shares` (existing users) and `pending_shares` (invited non-members).
- **Messaging:** Direct messaging between users with full UI — conversation list, chat area with real-time message delivery, new conversation modal with user search, and unread badge in sidebar. Components are in `components/messaging/`. User search API at `app/api/users/search/route.js`.
- **Friendship System:** Managing friend requests and connections.
- **File Storage:** Uploading trip photos to Supabase Storage (`trip-photos` bucket).
- **Admin Dashboard:** Secure interface for managing users, trips, and application-wide counters.

**Observability & Monitoring:**
- Sentry (`@sentry/nextjs`) is configured for error tracking, performance monitoring, and session replay.
- Config files: `sentry.client.config.js`, `sentry.server.config.js`, `sentry.edge.config.js`, `instrumentation.js`
- DSN is stored in `NEXT_PUBLIC_SENTRY_DSN` env var; org/project in `SENTRY_ORG`/`SENTRY_PROJECT`
- `next.config.js` is wrapped with `withSentryConfig` and provides a `/monitoring` tunnel route to bypass ad blockers
- Client-side: browser tracing, session replay (5% normal / 100% on error), breadcrumbs for fetch/DOM/navigation
- Server-side: captures console errors/warnings, filters Next.js internal errors (NEXT_NOT_FOUND, NEXT_REDIRECT)
- `lib/api-response.js` `errorResponse()` automatically reports 500-level errors to Sentry
- `components/ErrorBoundary.jsx` reports caught React errors to Sentry
- `app/global-error.jsx` catches top-level errors and reports to Sentry
- Noisy events are filtered: ResizeObserver, chunk loading errors, heartbeat/analytics breadcrumbs
- Sentry organization: `tuckertrips`, project: `tucker-trips`, dashboard: https://tuckertrips.sentry.io

**Deployment:**
- Deployed on Vercel, utilizing a `--prebuilt` deployment strategy to bypass Replit's git commit author restrictions.

## Known Bugs & Fixes Applied

### Supabase Anon Key — Malformed JWT (FIXED)
The `NEXT_PUBLIC_SUPABASE_ANON_KEY` Replit secret was stored with a duplicated value (5-part JWT instead of the correct 3-part JWT). This caused all Supabase auth operations in the browser to return HTTP 401. Fixed by:
1. Setting the correct 3-part JWT as an env var via Replit (overrides the malformed secret)
2. Adding normalization in `next.config.js` `env` section that trims the key to 3 JWT parts

### supabase-config.js — Dynamic process.env Access (FIXED)
`getMissingBrowserSupabaseEnvVars` used `env[key]` dynamic property access on `process.env`, which doesn't work in Next.js browser bundles (webpack only replaces static `process.env.KEY` patterns). This caused `assertBrowserSupabaseConfig()` to always throw in the browser, showing "Authentication is currently unavailable" toast. Fixed by rewriting to use direct property access (`process.env.NEXT_PUBLIC_SUPABASE_URL` etc.) and adding the missing `SUPABASE_BROWSER_CONFIG_ERROR` constant.

### Shared Trips Not Real-Time (FIXED)
When a user shared a trip, the recipient's "Shared With Me" tab didn't update until a page reload. Fixed by:
1. Adding a Supabase Realtime subscription in `DashboardNew.jsx` on `trip_shares` filtered by `shared_with=eq.{userId}`
2. Adding `trip_shares` table to the `supabase_realtime` publication in the Supabase database

## Error Monitoring (Sentry)

The project uses `@sentry/nextjs` for error monitoring, performance tracing, and session replay.
- **Org:** `tuckertrips`, **Project:** `tucker-trips`
- **Config files:** `instrumentation-client.ts` (client), `sentry.server.config.ts` (server), `sentry.edge.config.ts` (edge), `instrumentation.ts` (runtime router)
- **Global error boundary:** `app/global-error.jsx` catches root layout errors and reports to Sentry
- **Tunnel route:** `/monitoring` configured in `next.config.js` via `withSentryConfig` to bypass ad-blockers
- **Tracing:** 100% in dev, 10% in production
- **Session Replay:** 10% of sessions, 100% of error sessions
- **Env vars:** `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` (shared), `SENTRY_AUTH_TOKEN` (secret, needed for source map uploads)

## External Dependencies

- **Sentry:** Error monitoring, performance tracing, and session replay.
- **Supabase:**
    - PostgreSQL Database
    - Authentication (Auth)
    - Realtime
    - Storage (`trip-photos` bucket for images)
- **Resend:** For sending transactional emails (e.g., password resets, invitation emails).
- **Sentry:** Error tracking, performance monitoring, session replay. Org: `tuckertrips`, project: `tucker-trips`.
- **Vercel:** Hosting and deployment platform.