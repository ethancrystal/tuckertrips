# TuckerTrips - Master Development Prompt

> **Purpose**: This is a complete, copy-paste prompt for Claude/Copilot/AI assistants to build TuckerTrips as a coherent MVP from scratch.
>
> **Last Updated**: 2025-11-18
>
> **Version**: 2.0 (with integrated Share Trip module)

---

## Instructions for AI Assistant

You are an expert full-stack engineer (Next.js App Router, TypeScript, Tailwind, Supabase). Your job is to design and build an MVP for an app called **TuckerTrips** as a single coherent project, and then refine it as I ask.

## Product

TuckerTrips is a travel diary app where logged-in users can:

- Log their trips as entries.
- Categorize trips into:
  - **My Trips** → private trips only they can see
  - **Future Trips** → upcoming or planned trips
  - **Shared Trips** → trips shared *with them* or marked public
- Fill a rich "New Trip" form with trip, accommodation, restaurant, airline and rental car details.
- Upload photos to each trip.
- Browse a public feed of **Shared Trips**.
- **Share an existing trip** with members or non-members via email and social links.

The app must be clean, secure, and production-minded (Supabase auth + RLS patterns, no hacky shortcuts).

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + TailwindCSS
- **Backend data & auth**: Supabase (Auth, Database, Storage, RLS – describe conceptually, no SQL)
- **Logic lives in**:
  - Server Components
  - Server Actions
  - Route Handlers (`app/api/.../route.ts`)
  - Supabase JS client (+ optional Edge Functions described conceptually)

Use **React Hook Form + Zod** for validation. Keep a clear separation between UI and data access.

## Domain Model (Conceptual Only)

Assume Supabase tables exist with these shapes; interact only via Supabase JS client:

### 1. Profile

- `id` (UUID, references auth.users)
- `username` (string)
- `created_at` (timestamp)
- `bio` (text, optional)
- `country` (string, optional)

**Relationship**: 1:1 with Supabase Auth user.

### 2. Trip

- `id` (UUID)
- `user_id` (UUID, references profiles)
- `created_at` (timestamp)

**Core fields**:
- `tripName` (string)
- `startDate` (date)
- `endDate` (date)
- `location` (string)
- `description` (text)
- `privacy` (enum: `PRIVATE | FUTURE | SHARED_PUBLIC`)

**Accommodation section** (optional):
- `accommodationRating` (1-5)
- `accommodationType` (string)
- `accommodationUrl` (string)
- `accommodationOtherLink` (string)
- `accommodationExcursion` (text)

**Restaurant section** (optional):
- `restaurantReview` (text)
- `restaurantType` (string)
- `restaurantName` (string)
- `restaurantBestFood` (string)
- `restaurantExcursion` (text)

**Airline section** (optional):
- `airlineRating` (1-5)
- `airlineName` (string)
- `airlineCost` (number)
- `airlineQuantityOfFlight` (number)
- `airlineExcursion` (text)

**Rental Car section** (optional):
- `rentalCarReview` (text)
- `rentalCarCompany` (string)
- `rentalCarCost` (number)
- `rentalCarQuantity` (number)
- `rentalCarExcursion` (text)

**Storage approach**: You may store these sections as flat columns or JSON blobs; pick a simple option and state it.

### 3. TripMedia

- `id` (UUID)
- `trip_id` (UUID, references trips)
- `kind` (enum: `IMAGE`)
- `path` (string, storage key)
- `created_at` (timestamp)

**Storage**: Files are stored in a Supabase Storage bucket named `trip-media`.

### 4. TripShare

Represents a trip that has been shared with someone.

**Fields** (conceptually):
- `id` (UUID)
- `trip_id` (UUID, references trips)
- `sender_user_id` (UUID, references profiles)
- `recipient_user_id` (UUID, references profiles, nullable)
- `recipient_email` (string, nullable)
- `token` (string, unique)
- `status` (enum: `PENDING | ACCEPTED`)
- `created_at` (timestamp)

**Purpose**: Used for member and non-member sharing, and for routing users into their **Shared Trips** area.

### Row Level Security (RLS)

Assume RLS policies are configured so:

- Users can manage only their own trips/media/shares.
- Everyone can read trips with `privacy = SHARED_PUBLIC`.
- Users can see trips shared *with* them via TripShare records.

## Core Features

### 1. Auth & Profiles

- Email/password signup & login via Supabase Auth.
- On first signup, create a linked Profile (server action / route handler).
- `/profile` page to view/edit username + optional bio.

**Implementation notes**:
- Use Supabase Auth hooks or triggers to auto-create profile on signup.
- Protect all authenticated routes with session checks.

### 2. New Trip Form (Multi-Step)

**Route**: `/trips/new`

Multi-step form using **React Hook Form + Zod**:

**Step 1: Trip Basics**
- Trip Name
- Start date
- End date
- Location
- Description
- Privacy (My / Future / Shared public flag)

**Step 2: Accommodation**
- Accommodation Rating (1-5 stars)
- Type (hotel, Airbnb, etc.)
- URL
- Other link
- Excursion notes

**Step 3: Restaurant**
- Restaurant Review (text)
- Type (cuisine)
- Name
- Best food of Restaurant
- Restaurant Excursion

**Step 4: Airline**
- Airline Rating (1-5 stars)
- Airline Name
- Airline cost
- Quantity Of Flight
- Airline Excursion

**Step 5: Rental Car**
- Rental Car Review (text)
- Rental Car Company
- Rental Car Cost
- Quantity of Car
- Rental Car Excursion

**Submit**: Via a Server Action that inserts a Trip via Supabase. All section fields are optional so a user can skip sections.

**UX considerations**:
- Show progress indicator (Step 1/5, 2/5, etc.)
- Allow navigation between steps
- Validate each step before proceeding
- Save draft to localStorage (optional but recommended)

### 3. Dashboard

**Route**: `/dashboard`

**Tabs**:
- **My Trips** → all trips where user is owner.
- **Future Trips** → user's trips with `privacy = FUTURE`.
- **Shared With Me** → trips that appear in TripShare where `recipient_user_id` is current user.

**TripCard component** shows:
- Trip name
- Location
- Date range
- Key highlights (e.g., airlineName, accommodationType)
- Privacy badge
- Actions: View, Edit, Delete, Share

**Actions**:
- Edit/Delete via Server Actions.
- Click card to view full details at `/trips/[id]`.

### 4. Public Discover Feed

**Home route** (`/`):
- Server Component that lists all trips with `privacy = SHARED_PUBLIC`.
- Shows TripCards in a grid layout.
- No authentication required to view.

**Trip detail route** (`/trips/[id]`):
- Shows all sections (trip, accommodation, restaurant, airline, rental car) and images.
- **Access control**:
  - If trip is `SHARED_PUBLIC`, anyone can view.
  - If trip is `PRIVATE` or `FUTURE`, only owner or explicit share recipients can view.
  - Check via RLS or manual auth check in Server Component.

### 5. Media Uploads (Supabase Storage)

**Location**: Per-trip image upload component on `/trips/[id]` (for owner only).

**Implementation**:
- Uses Supabase Storage JS client with current user session.
- Upload to `trip-media` bucket.
- After upload, create TripMedia entries linking to the trip.
- Show gallery on the trip detail page.

**UX**:
- Drag-and-drop or file picker.
- Show upload progress.
- Display thumbnails after upload.
- Allow deletion (owner only).

### 6. Share Trip Module

From either `/dashboard` or `/trips/[id]`, the owner can click **Share Trip**.

#### Share UI

Modal or panel with options:
- **Share by Email** (primary)
- **Share to Facebook** (generates shareable URL)
- **Share to Instagram** (generates shareable URL)

**Note**: Social options can just generate shareable URLs; no deep integration needed.

When user chooses **Email**, they enter one or more email addresses and click Share.

#### Share Logic (Email)

**For each email entered**:

1. Create a TripShare record with:
   - `trip_id`
   - `sender_user_id` (current user)
   - `recipient_email` (the email entered)
   - `token` (generated unique token, e.g., nanoid or UUID)
   - `status = PENDING`

2. Generate a share URL:
   ```
   ${NEXT_PUBLIC_SITE_URL}/share?token={generatedToken}
   ```

3. Send a templated email from the app:
   ```
   Subject: {senderName} shared a trip with you on TuckerTrips

   Body:
   Hey,

   Your friend {senderName} shared a trip with you: {tripName} – {tripDescription}.

   Click here to view it: {shareLink}

   If you don't have an account yet, you can sign up to see the full trip details!

   Happy travels,
   The TuckerTrips Team
   ```

**Email sending options**:
- Use a Supabase Edge Function + Resend/SendGrid
- Or use a Next.js API route + nodemailer/Resend
- State your choice and provide conceptual implementation

#### Handling Share Links

**Route**: `/share` or `/share/[token]` (your choice)

**On page load**:

1. Resolve the token via Supabase query:
   ```typescript
   // Conceptual
   const share = await supabase
     .from('trip_shares')
     .select('*, trips(*)')
     .eq('token', token)
     .single()
   ```

2. **If user is NOT logged in**:
   - Redirect them to **signup** (or combined login/signup).
   - Preserve the token (query param or cookie).
   - After successful signup, associate this user with the TripShare (`recipient_user_id = newUserId`).
   - Redirect to `/dashboard` → "Shared With Me" tab with the shared trip visible.

3. **If user IS logged in but not yet associated**:
   - Attach `recipient_user_id` to the TripShare record.
   - Update `status = ACCEPTED`.
   - Redirect to `/dashboard` → "Shared With Me" tab, scrolled/highlighted to this trip.

4. **If they're already logged in and associated**:
   - Just redirect to the trip detail (`/trips/[id]`) or Shared tab directly.

#### Member vs Non-Member Flow

**If the email belongs to an existing Supabase user**:
- Query `auth.users` or `profiles` to check if email exists.
- The TripShare record is created with `recipient_user_id` set immediately.
- That user sees a new item in their **Shared Trips** section.
- (Optional) Send an in-app notification.

**If the email does NOT belong to an existing user**:
- Only `recipient_email` and `token` are set in TripShare.
- `recipient_user_id` is null.
- When they later sign up with that email, a server action/route handler:
  - Queries TripShare records where `recipient_email = newUserEmail`.
  - Links their new user id to existing TripShare records.
  - Shows them the shared trip in "Shared With Me".

**Implementation tip**:
- Create a server action `associatePendingShares(userId, email)` that runs on signup.

### 7. Routes & Layout

Implement at least these routes:

- `/` - Public discover feed
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - User dashboard (My Trips, Future Trips, Shared With Me)
- `/trips/new` - Multi-step trip creation form
- `/trips/[id]` - Trip detail view
- `/profile` - User profile page
- `/share` or `/share/[token]` - Share link handler

**Layout**:
- Use a shared layout with navbar containing:
  - Logo
  - Dashboard
  - New Trip
  - Shared Trips
  - Login/Logout (conditional)
- Tailwind styling throughout.
- Mobile-friendly design (responsive navbar, etc.).

## Environment Variables

Assume these env vars are configured:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-only

# App
NEXT_PUBLIC_SITE_URL=https://tuckertrips.com  # Or localhost in dev

# Email (if using external service)
RESEND_API_KEY=your-resend-key  # Optional
```

**Supabase clients**:
- Use a `lib/supabase` helper for browser and server clients.
- Browser client uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server client (for admin operations) uses `SUPABASE_SERVICE_ROLE_KEY`.

Example structure:
```typescript
// lib/supabase/client.ts - Browser client
export const supabase = createBrowserClient(...)

// lib/supabase/server.ts - Server client
export const createClient = () => createServerClient(...)
```

## How to Work

- **Treat this as a production app**.
- Use a clear folder structure and provide complete file examples (imports + exports).
- **Do NOT write any SQL**; only Supabase JS client calls and conceptual descriptions of underlying tables.
- When something is ambiguous, make a reasonable assumption and state it.

### Implementation Order

First outline the project structure, then implement in this order:

1. **Supabase/Next setup + auth/profile**
   - Set up Supabase clients (browser + server)
   - Implement signup/login pages
   - Create profile on first signup
   - Protect authenticated routes

2. **New Trip multi-step form**
   - Design form schema with Zod
   - Implement multi-step UI with React Hook Form
   - Create server action to insert trip
   - Handle optional sections

3. **Dashboard + filters**
   - Fetch user's trips (My Trips, Future Trips)
   - Fetch shared trips
   - Implement TripCard component
   - Add edit/delete actions

4. **Public feed + trip detail + media uploads**
   - Public feed at `/`
   - Trip detail at `/trips/[id]`
   - Implement access control checks
   - Add image upload component
   - Create TripMedia records
   - Display gallery

5. **Full Share Trip flow**
   - Design TripShare model (conceptually)
   - Implement Share modal UI
   - Create server action to generate TripShare + token
   - Send email (via Edge Function or API route)
   - Implement `/share/[token]` handler
   - Handle member vs non-member logic
   - Associate shares on signup
   - Show shared trips in dashboard

### Project Structure Example

```
tuckertrips/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── trips/
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── share/
│   │   └── [token]/
│   │       └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── api/
│   │   └── share-email/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── trips/
│   │   ├── TripCard.tsx
│   │   ├── TripForm.tsx
│   │   ├── TripDetail.tsx
│   │   ├── ShareTripModal.tsx
│   │   └── MediaUpload.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ... (other UI components)
│   └── Navbar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── trips.ts
│   │   └── shares.ts
│   ├── schemas/
│   │   └── trip.ts
│   └── utils.ts
├── types/
│   ├── database.types.ts
│   └── index.ts
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Additional Guidance

### TypeScript Types

Generate types from Supabase:
```bash
pnpm dlx supabase gen types typescript --project-id your-project-id > types/database.types.ts
```

### Error Handling

- Show user-friendly error messages (use toast notifications).
- Handle Supabase errors gracefully.
- Validate all inputs on both client and server.

### Security

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Use RLS policies for data access control.
- Validate tokens server-side before associating shares.
- Sanitize user inputs to prevent XSS.

### Performance

- Use Server Components by default.
- Add `"use client"` only when needed (forms, interactivity).
- Implement pagination for trip lists.
- Optimize images (Next.js Image component).
- Cache public trips appropriately.

### Testing

- Test the share flow with both existing and non-existing users.
- Verify RLS policies work correctly.
- Test multi-step form validation.
- Test image uploads and deletions.

---

## Ready to Start?

When you're ready, begin by:

1. **Outlining the complete folder structure** with all files you'll create.
2. **Asking any clarifying questions** about ambiguous requirements.
3. **Starting with Step 1** (Supabase setup + auth) and working sequentially through the implementation order.

Remember: This is a production-grade app. Write clean, maintainable, well-typed code with proper error handling throughout.
