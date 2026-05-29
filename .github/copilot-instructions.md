# Tucker Trips — AI Coding Instructions

This repo is a Next.js 14 (App Router) travel planning + sharing app with Supabase as full-stack backend. **Deployed on Vercel.**

---

## Non-Negotiables

- **pnpm only** — no npm/yarn (`packageManager: "pnpm@9.15.0"` in package.json)
- **Reuse existing patterns** — check `components/`, `lib/` before creating new utilities
- **Client/Server boundary** — browser uses anon key (`lib/supabase.ts`), server uses `createSupabaseRouteClient()` from `lib/supabase-server.js`
- **Never commit secrets** — use `.env.local` (gitignored), keep `.env.example` safe

---

## Tech Stack

- **Frontend:** Next.js 14 App Router (JavaScript + TypeScript mixed)
- **Backend:** Supabase (Auth, Postgres, Storage, Realtime, RLS)
- **UI:** shadcn/ui (Radix) + Tailwind CSS
- **Validation:** Zod (API routes)
- **Icons:** Lucide React
- **Toasts:** Sonner (`import { toast } from 'sonner'`)

---

## Dev Commands

```bash
cp .env.example .env.local  # Create env file
pnpm install                # Install dependencies
pnpm dev                    # Start dev server (port 3000)
pnpm build                  # Production build
python backend_test.py      # API smoke tests
```

---

## Database Schema & Tables (Supabase Postgres)

### profiles — Extends Supabase auth.users
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, references auth.users |
| `email` | TEXT | User email |
| `full_name` | TEXT | Display name |
| `bio` | TEXT | User bio |
| `avatar_url` | TEXT | Profile picture URL |
| `cover_photo_url` | TEXT | Cover photo URL |
| `is_online` | BOOLEAN | Online status |
| `last_seen` | TIMESTAMP | Last activity time |
| `created_at`, `updated_at` | TIMESTAMP | Audit timestamps |

### trips — Main trip entity
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK to profiles |
| `trip_name` / `title` | TEXT | Trip name (mapped in API) |
| `destination` | TEXT | Location |
| `start_date`, `end_date` | DATE | Trip dates |
| `description` | TEXT | Trip description |
| `trip_type` / `status` | ENUM | 'taken' \| 'future' \| 'ongoing' |
| `visibility` | ENUM | 'private' \| 'friends' \| 'public' |
| `cover_photo_url` | TEXT | Cover image URL |
| `photo_urls` / `trip_images` | TEXT[] | Gallery photos |
| `weather` | TEXT | Weather notes |
| `overall_comment` | TEXT | Trip summary |
| `overall_rating` | INT | 1-5 rating |
| `airlines` | JSONB | Airline segment data |
| `accommodations` | JSONB | Accommodation segment data |
| `segments` | JSONB | Generic itinerary items |
| `shared_with` | UUID[] | Users with access |
| `is_shared` | BOOLEAN | Whether trip is shared |
| `created_at`, `updated_at` | TIMESTAMP | Audit timestamps |

### trip_categories — Ratings for trip aspects
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `trip_id` | UUID | FK to trips |
| `category_name` | ENUM | 'rental' \| 'food' \| 'accommodation' \| 'airline' \| 'excursions' |
| `rating` | INT | 1-5 rating |
| `average_price` | DECIMAL | Cost |
| `currency` | TEXT | Currency code |
| `notes` | TEXT | General notes |
| `big_wins` | TEXT | What worked well |
| `do_differently` | TEXT | Improvements |
| `timing_tips` | TEXT | Timing advice |

### trip_shares — Sharing with existing members
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `trip_id` | UUID | FK to trips |
| `shared_by` | UUID | Owner user ID |
| `shared_with` | UUID | Recipient user ID |
| `share_type` | ENUM | 'email' \| 'link' |
| `permissions` | ENUM | 'view' \| 'edit' \| 'comment' |

### pending_shares — Invitations to non-members
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `trip_id` | UUID | FK to trips |
| `shared_by` | UUID | Owner user ID |
| `recipient_email` | TEXT | Non-member email |
| `invite_link` | TEXT | Unique invite URL |
| `claimed` | BOOLEAN | Whether claimed |
| `claimed_by` | UUID | User who claimed |
| `expires_at` | TIMESTAMP | Link expiration |

### messages — Direct messaging
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `sender_id` | UUID | FK to profiles |
| `recipient_id` | UUID | FK to profiles |
| `content` | TEXT | Message body |
| `read` | BOOLEAN | Read status |
| `created_at` | TIMESTAMP | Sent time |

### friendships — User connections
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | Requester |
| `friend_id` | UUID | Target |
| `status` | ENUM | 'pending' \| 'accepted' \| 'rejected' \| 'blocked' |

**Schema Files:** `supabase-enhanced-schema.sql`, `supabase-sharing-schema.sql`, `types/database.ts`

---

## Repo Map (High-Signal Files)

### App Pages
| File | Purpose |
|------|---------|
| `app/page.js` | Main entry (auth routing → Dashboard or Landing) |
| `app/layout.js` | Root layout |
| `app/trip/[id]/page.js` | Trip detail page |
| `app/shared/[tripId]/page.js` | Public shared trip view |
| `app/reset-password/page.js` | Password reset handler |
| `app/invite/[tripId]/page.js` | Invitation acceptance page |

### API Routes
| Route | Methods | Purpose |
|-------|---------|---------|
| `app/api/trips/route.js` | GET, POST | List/Create trips |
| `app/api/trips/[id]/route.js` | GET, PATCH, DELETE | Single trip CRUD |
| `app/api/auth/register/route.js` | POST | User registration |
| `app/api/auth/login/route.js` | POST | User authentication |
| `app/api/auth/me/route.js` | GET | Get current user |
| `app/api/messages/route.js` | GET, POST | Messaging |
| `app/api/users/profile/route.js` | PATCH | Update profile |
| `app/api/users/heartbeat/route.js` | POST | Update online status |
| `app/api/users/online/route.js` | GET | List online users |

### Components
| File | Purpose |
|------|---------|
| `components/DashboardNew.jsx` | Main dashboard UI (trip lists, navigation, theme) |
| `components/TripCreationForm.jsx` | 6-step trip wizard with localStorage draft |
| `components/TripCard.jsx` | Trip preview card (visibility icons, actions) |
| `components/TripDetailPage.jsx` | Full trip view |
| `components/ShareTripModal.jsx` | Email/social sharing UI |
| `components/AuthModalNew.jsx` | Login/signup modal with password reset |
| `components/ChatPanel.js` | Live chat interface |
| `components/OnboardingFlow.jsx` | New user onboarding |
| `components/ui/` | 48 shadcn/ui primitives |

### Library Files
| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Browser Supabase client + CRUD helpers |
| `lib/supabase-server.js` | Server-side Supabase client |
| `lib/api.js` | HTTP client with auth token injection |
| `lib/api-enhanced.ts` | Enhanced API client |
| `lib/utils.js` | Utility functions (cn for class merging) |

### Type Definitions
| File | Purpose |
|------|---------|
| `types/database.ts` | All database interfaces + utility types |
| `types/api.ts` | API request/response types |

---

## Environment Variables

### Client-exposed (safe for browser)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Server-only (NEVER expose to browser)
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Admin operations
SUPABASE_SERVICE_KEY=eyJ...        # Same value, some scripts use this name
```

### Optional (scripts/deploy)
```
DATABASE_URL=postgresql://...      # Direct DB access for scripts
VERCEL_TOKEN=...                  # Deploy helper (deploy to Vercel)
```

---

## Supabase Usage Rules

1. **Browser code** must use the anon key client from `lib/supabase.ts`
2. **Admin/service role key** only in server contexts (API routes, scripts)
3. If you need admin behavior from browser, add a server API route
4. Prefer **RLS + scoped queries** for access control
5. Use **Supabase Storage** for file uploads (`trip-photos` bucket)

---

## API Field Name Mapping (snake_case ↔ camelCase)

API routes normalize between DB (snake_case) and Frontend (camelCase). See `mapTripInsert`/`mapTripResponse` in `app/api/trips/route.js`:

```javascript
// Frontend → DB (mapTripInsert)
title → trip_name
startDate → start_date
endDate → end_date
coverPhoto → cover_photo_url
tripImages → photo_urls
overallRating → overall_rating
status → trip_type

// DB → Frontend (mapTripResponse)
trip_name → title
start_date → startDate
end_date → endDate
cover_photo_url → coverPhoto
photo_urls → tripImages
overall_rating → overallRating
trip_type → status
```

---

## API Route Pattern

```javascript
// app/api/example/route.js
import { NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { z } from 'zod'

// Zod validation schema
const exampleSchema = z.object({
  field: z.string().min(1, 'Required'),
})

// Auth helper
async function authenticate(request, supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return user

  // Fallback: check Authorization header
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
  if (token) {
    const { data: tokenData } = await supabase.auth.getUser(token)
    if (tokenData?.user) return tokenData.user
  }

  throw new Error('Not authenticated')
}

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const user = await authenticate(request, supabase)
    
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const user = await authenticate(request, supabase)
    const body = await request.json()
    
    // Validate
    const validated = exampleSchema.parse(body)
    
    const { data, error } = await supabase
      .from('trips')
      .insert({ ...validated, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## Component Patterns

### shadcn/ui Component Usage
```javascript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { MapPin, Camera, Upload } from 'lucide-react'

export default function MyComponent({ open, onClose }) {
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async () => {
    setLoading(true)
    try {
      // async operation
      toast.success('Success!')
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn("bg-background", "border-border")}>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
```

### Trip Creation Wizard (6 Steps)
See `components/TripCreationForm.jsx`:

1. **Trip Basics** — Name, location, dates, privacy (private/friends/public)
2. **Accommodation** — Type, rating, URL, excursion notes
3. **Restaurant** — Review, type, name, best food
4. **Airline** — Rating, name, cost, flight count
5. **Rental Car** — Review, company, cost, car count
6. **Photos** — Cover photo + up to 10 gallery photos

**Draft Auto-Save:**
```javascript
const STORAGE_KEY = 'tucker_trips_draft'

// Save on changes
useEffect(() => {
  if (open && formData.trip_name) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      formData, tripType, step, savedAt: new Date().toISOString()
    }))
  }
}, [formData, tripType, step, open])

// Restore on open
useEffect(() => {
  if (open) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && confirm('Restore draft?')) {
      const { formData, tripType, step } = JSON.parse(saved)
      setFormData(formData)
      setTripType(tripType)
      setStep(step)
    }
  }
}, [open])
```

### Trip Card Features
- Cover photo with fallback gradient
- Visibility icons: Lock (private), Globe (public), Users (friends)
- Status badge: Taken/Future
- Category tags, star ratings
- Actions: Share, Edit, Delete, Copy

---

## Sharing Flow

### Share with Existing Member
1. Owner clicks Share on public trip
2. Enters recipient email in ShareTripModal
3. System finds user in `profiles` table
4. Creates `trip_shares` record
5. Trip appears in recipient's Shared Trips

### Share with Non-Member
1. Owner clicks Share on public trip
2. Enters non-member email
3. Creates `pending_shares` record with unique `invite_link`
4. Sends invitation email via Supabase Edge Function
5. Recipient clicks link → signup → auto-redirect to Shared Trips

### Social Media Sharing
```javascript
const shareUrl = `${window.location.origin}/shared/${trip.id}`
const shareText = `Check out this trip to ${trip.destination}!`

// Facebook
`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`

// Twitter
`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`

// Instagram (copy link only)
navigator.clipboard.writeText(shareUrl)
```

---

## API Client Usage (lib/api.js)

```javascript
import { apiClient, api, tripApi, authApi, userApi, messageApi, ApiError } from '@/lib/api'

// Generic client
const data = await apiClient('/trips', { method: 'POST', body: tripData })

// Convenience methods
await api.get('/trips')
await api.post('/trips', tripData)
await api.patch(`/trips/${id}`, updates)
await api.delete(`/trips/${id}`)

// Domain-specific APIs
await tripApi.create(tripData)
await tripApi.getAll()
await tripApi.getPublic()           // GET /api/trips?public=true
await tripApi.getShared()           // GET /api/trips?shared=true
await tripApi.getById(id)
await tripApi.update(id, updates)
await tripApi.delete(id)

await authApi.register(userData)    // skipAuth: true
await authApi.login(credentials)    // skipAuth: true
await authApi.getMe()

await userApi.updateProfile(updates)
await userApi.heartbeat()
await userApi.getOnlineUsers()

await messageApi.send(messageData)
await messageApi.getConversation(userId)
```

---

## Supabase Client Helpers (lib/supabase.ts)

```javascript
import { 
  supabase,
  getCurrentUser,
  isAuthenticated,
  getCurrentSession,
  signOut,
  getRecordById,
  getRecords,
  insertRecord,
  updateRecord,
  deleteRecord,
  subscribeToTable,
  subscribeToRecord,
  uploadFile,
  getPublicUrl,
  deleteFile
} from '@/lib/supabase'

// Auth helpers
const user = await getCurrentUser()
const isLoggedIn = await isAuthenticated()
const session = await getCurrentSession()
await signOut()

// Generic CRUD
const trip = await getRecordById('trips', tripId)
const trips = await getRecords('trips', {
  filters: { user_id: userId },
  orderBy: { column: 'created_at', ascending: false },
  limit: 10
})
const newTrip = await insertRecord('trips', tripData)
const updated = await updateRecord('trips', tripId, updates)
await deleteRecord('trips', tripId)

// Realtime subscriptions
const subscription = subscribeToTable('trips', (payload) => {
  console.log('Change:', payload.event, payload.new)
})

// File uploads (trip-photos bucket)
const { data, error } = await uploadFile('trip-photos', `${userId}/cover/${filename}`, file)
const url = getPublicUrl('trip-photos', path)
await deleteFile('trip-photos', paths)
```

---

## Product Behavior (MVP)

- Trips support "future" vs "taken" status and private/friends/public visibility
- Sharing flows don't break privacy: private trips are owner-only unless explicitly shared
- All async actions show loading state and surface errors via toast
- Auto-save drafts to localStorage during trip creation
- Theme toggle (dark/light mode) persisted to localStorage

---

## Testing Protocol

### Backend Smoke Test
```bash
python backend_test.py
```

### Agent Coordination
Check `test_result.md` for task status tracking between agents:

```yaml
backend:
  - task: "Feature name"
    implemented: true
    working: true
    file: "app/api/trips/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implementation details"

frontend:
  - task: "Feature name"
    implemented: true
    working: "NA"
    file: "components/TripCreationForm.jsx"

metadata:
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus: ["Task 1", "Task 2"]
  stuck_tasks: ["Problematic task"]
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "What was implemented"
```

### Protocol for Main Agent
1. Update `test_result.md` BEFORE calling testing agent
2. Add implementation details to `status_history`
3. Set `needs_retesting: true` for tasks needing testing
4. Add message to `agent_communication`
5. Track `stuck_count` for persistent issues

---

## Quick Reference

| Need | Solution |
|------|----------|
| Add UI component | `pnpm dlx shadcn@latest add <component>` |
| Database types | `types/database.ts` |
| API client | `lib/api.js` (`apiClient`, `api`, `tripApi`) |
| Supabase browser | `lib/supabase.ts` (`supabase`, helpers) |
| Supabase server | `lib/supabase-server.js` (`createSupabaseRouteClient`) |
| Auth helpers | `getCurrentUser`, `signOut` from `lib/supabase.ts` |
| Toast notifications | `import { toast } from 'sonner'` |
| Class merging | `import { cn } from '@/lib/utils'` |
| Icons | `import { IconName } from 'lucide-react'` |

---

## Security Note

If you find credentials in documentation or code:
1. Remove them immediately
2. Rotate secrets in provider dashboards
3. Never commit secrets — use `.env.local`
