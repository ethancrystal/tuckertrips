# Tucker Trips — Agent Reference

Tucker Trips is a Next.js 14 travel planning and sharing app deployed on Vercel. Users log trips, share honest travel notes with trusted friends, and get recommendations. Auth, database, and storage are all handled by Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (JavaScript + TypeScript mixed) |
| UI | shadcn/ui (Radix primitives) + Tailwind CSS |
| Database / Auth | Supabase (PostgreSQL, RLS, Storage, Realtime) |
| Email | Resend (transactional emails) |
| Package manager | **pnpm** — the active package manager (pinned via `packageManager` + Corepack); `pnpm-lock.yaml` is the lock file |
| Deployment | Vercel |

---

## Repo Structure

```
app/                        # Next.js App Router pages and API routes
  page.js                   # Main entry (auth routing, dashboard)
  layout.js                 # Root layout
  globals.css               # Global styles
  robots.js / sitemap.js    # SEO
  api/                      # All server-side API handlers
    auth/                   # register, login, me, forgot-password, change-password
    trips/                  # CRUD: route.js + [id]/route.js
    messages/               # route.js (POST send, GET ?conversation=<id>)
    chat/                   # AI chatbot (OpenAI-powered travel Q&A)
    friendships/            # route.js + [id]/route.js
    users/heartbeat/        # POST update online status
    users/online/           # GET list online users
    storage/upload/         # POST file upload
    admin/login/            # POST admin auth
    admin/counters/         # GET app-wide counters
    admin/users/            # GET admin user list
    admin/users/stats/      # GET user signup stats
    admin/trips/            # GET admin trip list
    analytics/signup-click/ # POST record signup CTA click
  auth/callback/            # Supabase auth callback handler
  trip/[id]/                # Trip detail page
  shared/[tripId]/          # Public shared trip view
  invite/[tripId]/          # Invitation landing page
  reset-password/           # Password reset (after email link)
  forgot-password/          # Forgot password page
  admin/                    # Admin dashboard page
  admin-login/              # Admin login page
  secure-admin/             # Secure admin page
  secure-super-admin/       # Super admin page
  privacy/                  # Privacy policy page
  terms/                    # Terms of service page
components/                 # React components
  ui/                       # shadcn/ui primitives (button, dialog, input, etc.)
  landing/                  # Landing page sections + duplicate ui/ primitives
  TripCreation/             # Modularized trip wizard steps
    index.js                # Exports the wizard
    StepBasics.tsx          # Step 1
    StepAccommodation.tsx   # Step 2
    StepRestaurant.tsx      # Step 3
    StepAirline.tsx         # Step 4
    StepRental.tsx          # Step 5
    StepPhotos.tsx          # Step 6
    hooks/useFormState.js   # Form state hook
    hooks/usePhotoUpload.js # Photo upload hook
    types.ts                # Trip creation types
  trips/TripsSection.js     # Trips section component
  DashboardNew.jsx          # Main dashboard UI (~41 KB, monolithic)
  TripCreationForm.jsx      # Legacy 6-step trip creation wizard (~49 KB)
  TripCard.jsx              # Trip preview card
  TripDetailPage.jsx        # Full trip view
  TripDetailView.jsx        # Alternate trip detail view
  ShareTripModal.jsx        # Sharing UI
  SharedTripCard.jsx        # Shared trip card
  MyTripCard.jsx            # My trip card variant
  AuthModalNew.jsx          # Login / signup / forgot-password modal (active)
  ProfileSettings.js        # Profile settings component
  ProfileEditModal.jsx      # Profile editing modal
  OnboardingFlow.jsx        # User onboarding
  StarRating.jsx            # Star rating component
lib/                        # Utilities and Supabase clients
  supabase.js               # Browser Supabase client + CRUD helpers
  supabase-server.js        # Server-side Supabase client (createSupabaseRouteClient)
  supabase-clients.ts       # Centralized client helpers (createRouteClient, createAdminClient)
  supabase-admin.js         # Admin Supabase client
  supabase-config.js        # Supabase configuration
  db-types.ts               # Centralized DB types
  api.js                    # Fetch-based API client (frontend -> backend)
  api-enhanced.ts           # Enhanced typed API client
  api-enhanced.js           # JS version of enhanced API client
  api-response.js           # Standardized API response helpers
  auth.js                   # Auth utilities
  auth.ts                   # Auth utilities (TS)
  auth-middleware.js        # Request auth middleware (authenticateOrThrow)
  admin-auth-middleware.js  # Admin session verification (verifyAdminSession)
  auth-redirect.js          # Auth redirect helpers
  analytics.js              # Analytics utilities
  email.js                  # Email utilities (Resend)
  rate-limit.js             # In-memory rate limiter (dev only)
  type-mapper.ts            # Type mapping utilities
  utils.js                  # General utilities
  utils.ts                  # General utilities (TS)
hooks/                      # Custom React hooks
  useAuth.js                # Auth hook
  use-mobile.jsx            # Mobile detection hook
  use-toast.js              # Toast notification hook
types/
  database.ts               # TypeScript interfaces for all DB tables
  api.ts                    # API request/response types
  components.ts             # Component prop types
  global.d.ts               # Global type declarations
constants/
  sample-data.js            # Sample trip data
__tests__/                  # Jest tests (mirrors components/ and lib/)
scripts/                    # Admin and setup scripts
supabase-enhanced-schema.sql   # Complete DB schema
supabase-sharing-schema.sql    # Sharing tables schema
aligned-schema.sql             # Resolved alignment schema
```

---

## Environment Variables

Copy `.env.example` to `.env.local` for local dev. In Replit set secrets in the Secrets panel. In Vercel set them in Project Settings -> Environment Variables for all scopes (Production, Preview, Development).

### Client-safe (NEXT_PUBLIC_ prefix — safe to expose to browser)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / public key |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (e.g. `https://www.tuckertrips.com`) |

### Server-only (never expose to client)

| Variable | Description |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — primary name used in app code |
| `SUPABASE_SERVICE_KEY` | **Same value** — some scripts and types expect this alternate name |
| `RESEND_API_KEY` | Resend email API key |
| `JWT_SECRET` | 32+ char secret for JWT signing |
| `ADMIN_SESSION_SECRET` | 32+ char secret for admin sessions |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_USER_ID` | Admin user ID |
| `OPENAI_API_KEY` | OpenAI API key (used by `/api/chat` AI chatbot) |

### Optional

| Variable | Description |
|---|---|
| `DATABASE_URL` | Direct Postgres connection (admin scripts only) |
| `CORS_ORIGINS` | Allowed CORS origins (defaults to `*`) |
| `VERCEL_TOKEN` | Used by deploy helper scripts |

> **Gotcha:** `NEXT_BASE_APP_URL` exists as a Vercel env var but is NOT read anywhere in the codebase. The app reads `NEXT_PUBLIC_SITE_URL` instead. Do not confuse them.

---

## Database Schema

Supabase project: `rogrzxjxtypzsempesrf` (Tucker Trips)
URL: `https://rogrzxjxtypzsempesrf.supabase.co`
Region: us-east-1
Migration status: Schema aligned and deployed. The canonical schema sources are `aligned-schema.sql` and `supabase-enhanced-schema.sql`. No pending migrations.

### profiles — extends Supabase auth.users

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | references auth.users |
| `email` | text | |
| `full_name` | text | nullable |
| `bio` | text | nullable |
| `avatar_url` | text | nullable |
| `cover_photo_url` | text | nullable |
| `is_online` | boolean | updated by heartbeat |
| `last_seen` | timestamptz | updated by heartbeat |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### trips — main trip entity

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK -> profiles | |
| `trip_name` | text NOT NULL | **primary field** |
| `title` | text GENERATED | always equals `trip_name` (alias) |
| `destination` | text | |
| `start_date` / `end_date` | date | nullable |
| `description` | text | nullable |
| `trip_type` / `status` | enum | `'taken'|'future'|'ongoing'` |
| `visibility` | enum | `'private'|'friends'|'public'` |
| `cover_image` / `cover_photo` / `cover_photo_url` | text | multiple alias columns |
| `trip_images` | text[] | legacy photo field |
| `photo_urls` | text[] | newer photo field |
| `weather` | text | nullable |
| `overall_comment` | text | nullable |
| `overall_rating` | int | 1-5, nullable |
| `airlines` | JSONB | array of AirlineInfo objects |
| `accommodations` | JSONB | array of AccommodationInfo objects |
| `segments` | JSONB | array of TripSegment objects |
| `shared_with` | UUID[] | list of user IDs |
| `is_shared` | boolean | DEFAULT false |
| `shared_at` | timestamptz | nullable |
| `created_at` / `updated_at` | timestamptz | |

> **Note:** The Zod validators in API routes accept `trip_name` only (not `title`). The `title` column in the database is a generated alias that always equals `trip_name`.

### trip_categories — per-category ratings

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `trip_id` | UUID FK -> trips | |
| `category_name` | enum | `'rental'|'food'|'accommodation'|'airline'|'excursions'` |
| `rating` | int | 1-5 |
| `average_price` | numeric | |
| `currency` | text | |
| `notes` / `big_wins` / `do_differently` / `timing_tips` | text | |

### trip_shares — sharing with existing members

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `trip_id` | UUID FK -> trips | |
| `shared_by` | UUID FK -> profiles | |
| `shared_with` | UUID FK -> profiles | |
| `share_type` | enum | `'email'|'link'` |
| `permissions` | enum | `'view'|'edit'|'comment'` DEFAULT `'view'` |
| `created_at` | timestamptz | |

### pending_shares — invitations to non-members

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `trip_id` | UUID FK -> trips | |
| `shared_by` | UUID FK -> profiles | |
| `recipient_email` | text | |
| `invite_link` | text | |
| `claimed` | boolean | DEFAULT false |
| `claimed_by` | UUID | nullable — set when recipient signs up |
| `expires_at` | timestamptz | |

> **Gotcha:** `trip_shares` = existing members; `pending_shares` = invited non-members. They serve different purposes and must not be confused.

### messages — direct messaging

| Column | Type |
|---|---|
| `id` | UUID PK |
| `sender_id` | UUID FK -> profiles |
| `recipient_id` | UUID FK -> profiles |
| `content` | text |
| `read` | boolean |
| `created_at` | timestamptz |

### friendships — user connections

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK -> profiles | |
| `friend_id` | UUID FK -> profiles | |
| `status` | enum | `'pending'|'accepted'|'rejected'|'blocked'` |

### signup_clicks — analytics

RLS: public INSERT allowed, authenticated SELECT.

---

## Supabase Rules

### Client types

| Client | Key used | Where to use |
|---|---|---|
| `lib/supabase.js` (browser) | anon key | Client components, browser-side code |
| `createSupabaseRouteClient` / `createRouteClient` | **anon key** | Most API routes — authenticates via cookies, respects RLS |
| `createAdminClient` / `createServerComponentClient` | **service role key** | Admin routes and server components — bypasses RLS |
| Direct `createClient(url, serviceKey)` | **service role key** | Some routes that need full DB access (see below) |

### Key details

- `createSupabaseRouteClient` (from `lib/supabase-server.js`) and `createRouteClient` (from `lib/supabase-clients.ts`) are aliases — both use the **anon key** with cookie-based auth
- `createAdminClient` (from `lib/supabase-clients.ts`) uses `SUPABASE_SERVICE_ROLE_KEY` — used in admin routes
- Some non-admin routes also use the service role key directly via `createClient()`:
  - `/api/chat/route.js` — fetches all trips for AI context
  - `/api/storage/upload/route.js` — uploads to Supabase Storage
  - `/api/auth/forgot-password/route.js` — password reset flow
- Admin routes must be protected with `verifyAdminSession` from `lib/admin-auth-middleware.js`
- Never import a service-role client from any client component or page
- If admin behavior is needed from the browser, add a server API route
- Prefer RLS + scoped queries for access control
- Storage bucket: **`trip-photos`** (Supabase Storage)

### RLS Access Matrix for Trips

| Visibility | Owner | Friends | Shared users | Public |
|---|---|---|---|---|
| `private` | yes | no | no | no |
| `friends` | yes | yes | no | no |
| `public` | yes | no | no | yes |
| shared | yes | no | yes | no |

---

## API Route Index

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create user |
| POST | `/api/auth/login` | Authenticate, return token |
| GET | `/api/auth/me` | Get current user profile |
| PATCH | `/api/auth/me` | Update current user profile |
| POST | `/api/auth/forgot-password` | Send password reset email (uses service role key) |
| POST | `/api/auth/change-password` | Change password (authenticated) |

### Trips
| Method | Path | Description |
|---|---|---|
| GET | `/api/trips` | List user's trips (`?public=true`, `?shared=true`) |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips/[id]` | Get single trip |
| PATCH | `/api/trips/[id]` | Update trip |
| DELETE | `/api/trips/[id]` | Delete trip |

### Messages
| Method | Path | Description |
|---|---|---|
| POST | `/api/messages` | Send message (body: `{recipientId, content}`) |
| GET | `/api/messages?conversation=<id>` | Get conversation messages |

### Chat (AI)
| Method | Path | Description |
|---|---|---|
| POST | `/api/chat` | AI travel chatbot (OpenAI GPT, uses service role key for trip context) |

### Users
| Method | Path | Description |
|---|---|---|
| POST | `/api/users/heartbeat` | Update online status / last seen |
| GET | `/api/users/online` | List online users (excludes self) |

### Friendships
| Method | Path | Description |
|---|---|---|
| GET | `/api/friendships` | List friend requests |
| POST | `/api/friendships` | Send friend request |
| PATCH | `/api/friendships/[id]` | Accept or reject friend request |
| DELETE | `/api/friendships/[id]` | Remove friendship |

### Storage
| Method | Path | Description |
|---|---|---|
| POST | `/api/storage/upload` | Upload file to Supabase `trip-photos` bucket (uses service role key) |

### Admin (session-token protected via `verifyAdminSession`)
| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/login` | Admin login (returns signed session token) |
| DELETE | `/api/admin/login` | Admin logout |
| GET | `/api/admin/counters` | Get app-wide counters |
| PUT | `/api/admin/counters` | Update counters |
| POST | `/api/admin/counters` | Create/reset counters |
| GET | `/api/admin/users` | Admin user list |
| DELETE | `/api/admin/users` | Delete user |
| GET | `/api/admin/users/stats` | User signup stats |
| GET | `/api/admin/trips` | Admin trip list |
| DELETE | `/api/admin/trips` | Delete trip (admin) |

### Analytics
| Method | Path | Description |
|---|---|---|
| POST | `/api/analytics/signup-click` | Record signup CTA click |
| OPTIONS | `/api/analytics/signup-click` | CORS preflight |

---

## Component Conventions

- Use **shadcn/ui** (`components/ui/`) for all base primitives (Button, Dialog, Input, etc.)
- Mark components `'use client'` only when they need browser APIs or state; prefer server components otherwise
- Keep client/server boundary in mind — never import `supabase-server.js` in client components
- New components go in `components/`; shadcn primitives go in `components/ui/`
- Auth middleware: use `authenticateOrThrow` from `lib/auth-middleware.js` in API routes
- Admin middleware: use `verifyAdminSession` from `lib/admin-auth-middleware.js` in admin routes

### Key Components

| Component | Purpose |
|---|---|
| `DashboardNew.jsx` | Main dashboard, trip list, theme, profile (monolithic ~41 KB) |
| `TripCreationForm.jsx` | 6-step trip wizard (~49 KB) — **actively imported by DashboardNew** |
| `TripCreation/` | Modularized step components (StepBasics, StepAccommodation, etc.) — not yet wired into dashboard |
| `TripCard.jsx` | Trip card with cover photo, visibility icon, status badge, actions |
| `TripDetailPage.jsx` | Full trip view with gallery |
| `ShareTripModal.jsx` | Share flow UI (email or link) |
| `AuthModalNew.jsx` | Login / signup / forgot-password tabs |
| `ProfileSettings.js` | Profile settings component |
| `ProfileEditModal.jsx` | Profile editing modal |
| `OnboardingFlow.jsx` | User onboarding flow |

### Trip Creation Wizard Steps

1. **Basics** — name, destination, dates, privacy setting
2. **Accommodation** — type, rating, URL
3. **Restaurant** — review, cuisine type, best dish
4. **Airline** — rating, airline name, cost
5. **Rental Car** — review, company, cost
6. **Photos** — cover + up to 10 gallery photos

### Sharing Flow

1. Owner clicks Share on a trip
2. Enters recipient email
3. System checks `profiles` table for matching email
4. **Exists ->** inserts `trip_shares` record
5. **Does not exist ->** inserts `pending_shares` record + sends invitation email via Resend
6. Recipient signs up -> auto-redirected to Shared Trips, `pending_shares.claimed` set to `true`

---

## Known Gotchas

1. **Vercel `--prebuilt` is required.** Direct `vercel --prod` fails because Replit's git commit author (`51141499-moizjmj@users.noreply.replit.com`) is not a Vercel team member. Always use the two-step build + deploy approach described in the Deployment section below.

2. **pnpm is the active package manager.** `pnpm-lock.yaml` is the canonical lock file, and the project pins pnpm via the `packageManager` field (run `corepack enable` to activate it). Use `pnpm install` for dependency management — do not use `npm` or `yarn` (`package-lock.json` is gitignored to prevent a second lock file from drifting). Build-script approvals live in `pnpm-workspace.yaml` under `allowBuilds` — pnpm v11 **removed** `onlyBuiltDependencies` / `ignoredBuiltDependencies` in favor of this `package -> boolean` map, and a build script left undecided fails `pnpm install` because `strictDepBuilds` defaults to true.

3. **SWC vs Babel scope.** `jest.babel.config.js` is scoped to Jest only (via the `env.test` pattern). Next.js uses SWC for compilation. Do not add a root-level `.babelrc` or `babel.config.js` — it would disable SWC globally.

4. **`NEXT_PUBLIC_` prefix rules.** Only variables prefixed `NEXT_PUBLIC_` are bundled into the browser. Adding a non-prefixed variable to client code silently returns `undefined` in production.

5. **Replit dev port is 5000.** The dev workflow runs on port 5000 (not 3000). `next.config.js` and the workflow command reflect this.

6. **`pending_shares` vs `trip_shares`** are different tables for different scenarios. `trip_shares` is for registered users; `pending_shares` is for email invitations to non-members who haven't signed up yet.

7. **Dual service key names.** The Supabase service role key is stored under two names: `SUPABASE_SERVICE_ROLE_KEY` (used in app API routes) and `SUPABASE_SERVICE_KEY` (used in some scripts and type files). Both must be set to the same value.

8. **`trip_name` is the canonical column.** The database column is `trip_name`; `title` is a generated alias. API route validators (Zod schemas) accept `trip_name` only. TypeScript types include both fields for read compatibility.

9. **Missing Supabase config error.** If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is absent or empty, `assertBrowserSupabaseConfig()` in `lib/supabase-config.js` throws a `SupabaseBrowserConfigError`. The check uses **static** `process.env.NEXT_PUBLIC_*` access (not dynamic `env[key]`), because webpack's DefinePlugin only replaces static patterns in browser bundles.

10. **`NEXT_BASE_APP_URL` on Vercel is unused.** The Vercel project has this variable but the app only reads `NEXT_PUBLIC_SITE_URL`. Don't reference `NEXT_BASE_APP_URL` in code.

11. **Auth callback path.** Supabase is configured to redirect to `/auth/callback`. The handler lives at `app/auth/callback/page.js`. The Supabase dashboard must list `https://www.tuckertrips.com/auth/callback` in its redirect URL allow-list.

12. **Duplicate/legacy component files exist.** There are legacy versions alongside active versions. The active files are `DashboardNew.jsx`, `TripCard.jsx`, `TripCreationForm.jsx` (imported by dashboard). The `TripCreation/` modularized directory exists but is not yet wired into the dashboard. Do not delete legacy files without explicit instruction.

13. **Mixed JS/TS codebase.** Some modules have both `.js` and `.ts` versions (e.g. `lib/api-enhanced.js` and `lib/api-enhanced.ts`, `lib/utils.js` and `lib/utils.ts`). The `.js` files are typically the ones actively imported. Check import paths before editing.

14. **No `/api/users/profile` route.** Profile editing is handled through components (`ProfileSettings.js`, `ProfileEditModal.jsx`) that talk directly to Supabase, not through a dedicated API route.

15. **Supabase anon key normalization.** `next.config.js` normalizes `NEXT_PUBLIC_SUPABASE_ANON_KEY` at build time: if the stored value is a malformed JWT with more than 3 dot-separated parts, it is trimmed to 3 parts. This guards against the Replit secret being stored with a duplicated value. Do not remove this normalization.

16. **`trip_shares` Realtime subscription.** `DashboardNew.jsx` maintains a Supabase Realtime subscription on the `trip_shares` table filtered by `shared_with=eq.{userId}` so the "Shared With Me" tab updates instantly without a page reload. The `trip_shares` table must remain in the `supabase_realtime` publication — it was manually added (`ALTER PUBLICATION supabase_realtime ADD TABLE trip_shares`).

---

## Testing

- **Unit tests:** `pnpm test` — Jest + jsdom, tests in `__tests__/` mirroring `components/` and `lib/`
- **Single file:** `pnpm test -- __tests__/components/TripCard.test.jsx`
- **Watch mode:** `pnpm test:watch`
- **Coverage:** `pnpm test:coverage`
- **Python smoke test:** `python backend_test.py` (integration smoke test)

Babel config for Jest lives in `jest.babel.config.js` and is activated only in the `test` Node env. It does not affect the Next.js build.

---

## Deployment

**Live URL:** https://www.tuckertrips.com
**Vercel project ID:** `prj_DdM9cuEJwUQBZ6cArXte7lm4Xeu6`
**Vercel org (team) ID:** `team_tpYaICaSl1suJW6Lfpa67Ye9` (`laviezahgmailcoms-projects`)
**Vercel project name:** `tucker-trips`

> **Gotcha:** the project's GitHub integration has previously drifted to a stale/deleted fork (e.g. `moizj00/tuckertrips`) instead of the canonical `ethancrystal/tuckertrips`, which silently breaks auto-deploy on push. If deploys stop triggering, verify with `vercel git connect https://github.com/ethancrystal/tuckertrips.git` (it reports whether it's already connected) before assuming the build itself is broken.

### Deploy Commands (must use prebuilt approach)

```bash
# Step 1 — Build production output
VERCEL_ORG_ID=team_tpYaICaSl1suJW6Lfpa67Ye9 \
VERCEL_PROJECT_ID=prj_DdM9cuEJwUQBZ6cArXte7lm4Xeu6 \
vercel build --prod --token "$VERCEL_TOKEN" --yes

# Step 2 — Deploy the prebuilt output
VERCEL_ORG_ID=team_tpYaICaSl1suJW6Lfpa67Ye9 \
VERCEL_PROJECT_ID=prj_DdM9cuEJwUQBZ6cArXte7lm4Xeu6 \
vercel deploy --prebuilt --prod --token "$VERCEL_TOKEN" --yes
```

**Why `--prebuilt`?** Direct `vercel --prod` triggers a Vercel-side git clone which rejects Replit's commit author email. `--prebuilt` uploads the already-built `.vercel/output` directory and bypasses the git author check entirely.

### Vercel Environment Variables

Must exist in **all** scopes (Production, Preview, Development):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Quick check: `vercel env ls`

### Supabase Auth URL Configuration

In Supabase Dashboard -> Authentication -> URL Configuration:
- **Site URL:** `https://www.tuckertrips.com`
- **Redirect URLs:** include `https://www.tuckertrips.com/auth/callback`

---

## Development Commands

```bash
pnpm dev                 # Dev server on port 5000 (hot reload)
pnpm dev:no-reload       # Dev server without hot reload (quieter)
pnpm build               # Production build
pnpm start               # Start production server
pnpm lint                # ESLint (next lint)
pnpm test                # Jest (all tests)
pnpm test:watch          # Jest watch mode
pnpm test:coverage       # Jest coverage report
```

Local setup:
```bash
cp .env.example .env.local   # fill in real values
corepack enable              # first run only: activate the pinned pnpm
pnpm install
pnpm dev
```

---

## Non-negotiables

- Reuse existing patterns and components — avoid rewrites
- Keep client/server boundary clear (especially around Supabase keys)
- Never commit secrets; use `.env.local` (gitignored) or platform secrets
- Use pnpm — do not use npm or yarn
