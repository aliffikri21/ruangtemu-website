# RUANGTEMU VIRTUAL PHOTOBOOTH — AUDIT REPORT

> **Date:** 2 October 2026
> **Auditor:** Implementation Agent (Phase 0)
> **Source:** Direct inspection of every file in the repository
> **Purpose:** Document current state before mobile MVP implementation

---

## CURRENT STACK

| Component | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.5 |
| UI Library | React | 19.2.8 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) | ^4 |
| Database/Storage | Supabase (`@supabase/supabase-js`) | 2.116.0 |
| SSR Auth | `@supabase/ssr` | 0.12.7 (installed, NOT used) |
| Canvas FX | HTML5 Canvas (custom `lib/frame-canvas.ts`) | Native |
| Audio | MediaRecorder API (custom `lib/audio.ts`) | Native |
| QR Code | `qrcode` | 1.5.4 |
| Confetti | `canvas-confetti` | 1.9.4 |
| Validation | `zod` | 4.6.5 (installed, NOT used anywhere) |
| Utilities | `clsx`, `tailwind-merge` | Latest |
| Icons | `lucide-react` | 1.47.0 (installed, NOT used) |

**Unused dependencies:** `zod`, `lucide-react`, `@supabase/ssr` are installed but not imported anywhere in the codebase.

---

## CURRENT ARCHITECTURE

```
Server Components (data fetching)
    app/event/[slug]/page.tsx     → getEventBySlug() → passes EventItem to client
    app/admin/page.tsx            → getEvents/Bookings/Packages/Entries → passes to client

Client Components (all UI)
    components/photobooth/virtual-booth.tsx   (726 lines, monolithic)
    components/admin/admin-view.tsx           (680 lines, monolithic)
    app/event/[slug]/gallery/page.tsx         (227 lines, "use client")
    app/event/[slug]/projection/page.tsx      (213 lines, "use client")
    app/event/[slug]/qr/page.tsx              (112 lines, "use client")

API Routes
    app/api/events/route.ts                  GET all events, POST create event
    app/api/events/[slug]/entries/route.ts   GET entries by slug, POST new entry
    app/api/bookings/route.ts                POST create booking

Lib (shared logic)
    lib/db.ts           Hybrid Supabase/mock data layer (420 lines)
    lib/supabase.ts     Supabase client init (15 lines)
    lib/frame-canvas.ts Canvas composite renderer (362 lines)
    lib/audio.ts        VoiceNoteRecorder class (99 lines)
    lib/utils.ts        formatRupiah, formatDate, cn (47 lines)
```

---

## CURRENT ROUTES

| Route | Type | Purpose | Status |
|---|---|---|---|
| `/` | Server | Commercial landing page | Working |
| `/booking` | Client | Booking form | Working (secondary) |
| `/admin` | Server→Client | Admin dashboard | Working (demo auth) |
| `/event/[slug]` | Server→Client | Guest photobooth | Working |
| `/event/[slug]/gallery` | Client | Event gallery | Working |
| `/event/[slug]/projection` | Client | Videotron slideshow | Working |
| `/event/[slug]/qr` | Client | QR standee print | Working |
| `/api/events` | API | CRUD events | Working |
| `/api/events/[slug]/entries` | API | CRUD entries | Working |
| `/api/bookings` | API | Create booking | Working |

---

## CURRENT COMPONENTS

### `components/photobooth/virtual-booth.tsx` (726 lines)

**Steps:** welcome → frame_select → camera → preview → guestbook → finished

**Contains:**
- Guest name input
- Frame template selection (4 types: strip_3, grid_4, polaroid, deluxe)
- Frame customization: color picker, sticker picker
- Camera: getUserMedia, front-facing, countdown 3-2-1
- Multi-shot: captures `requiredShots` photos in sequence
- Flash effect via DOM ID manipulation
- Filter CSS classes applied to `<video>` element
- Canvas composite via `renderPhotoboothFrame()`
- Voice note recording via `VoiceNoteRecorder` class
- Submission to `/api/events/[slug]/entries` with base64 photo
- Confetti on success
- Download link and gallery link

**Reusable logic:**
- Camera initialization and cleanup ✓
- Photo capture from video to canvas ✓
- Multi-shot sequence with countdown ✓
- Voice note toggle ✓
- Submission flow ✓

**Issues:**
- Monolithic: 726 lines in one component, hard to maintain
- Camera aspect ratio: `aspect-[3/4] sm:aspect-[4/3]` — switches on sm breakpoint, not ideal for mobile-first
- Filter preview uses Tailwind CSS classes on video but canvas renderer uses Canvas `ctx.filter` — potential mismatch
- Flash effect uses `document.getElementById("camera-flash")` — imperative DOM, should use ref
- No camera state machine — uses scattered booleans: `isCapturing`, `cameraError`, `countdown`
- `startPhotoSequence` uses nested `setInterval` callbacks — fragile for cleanup
- Error in catch block of `handleSaveToGallery`: navigates to "finished" even on failure (line 254)
- No double-submit protection beyond `isSaving` flag
- Download uses base64 data URL — can be enormous on mobile
- Photo submission sends entire base64 string in JSON body — can hit payload limits
- `guestName` not reset on "Ambil Foto Baru"

### `components/admin/admin-view.tsx` (680 lines)

**Contains:**
- Login form (hardcoded credentials check)
- 5-tab admin: Overview, Events, Bookings, Gallery, Packages
- Event creation form
- Booking status management
- Gallery moderation (delete only, no approve/reject)
- Package display

**Issues:**
- Authentication is pure client-side state (line 46-47): hardcoded email/password comparison
- Multiple accepted passwords: `ruangtemu2026`, `admin123`, `palopo2026`
- Admin gallery only fetches entries for `evt-1` hardcoded (line 14 of admin/page.tsx)
- Event creation fallback adds fake local state even when server fails (lines 110-128)
- No server-side auth protection on admin page
- Booking status update is client-side only — no API call (line 57-59)

---

## CURRENT DATABASE

**Schema file:** `supabase/migrations/20260919_initial_schema.sql`

4 tables:

| Table | Columns | RLS | Notes |
|---|---|---|---|
| `packages` | id(UUID), slug, name, tagline, price, duration_hours, features(JSONB), popular, category, prints_included, backdrop | SELECT public | Commercial packages |
| `events` | id(UUID), slug, title, host_name, event_type, date, venue, city, description, cover_image, is_active, allow_guestbook, allow_voice_note, allow_custom_frame, default_frame_config(JSONB) | SELECT where is_active | No status field, no assigned_frames |
| `bookings` | id(UUID), customer_name/email/phone, event_type/name/date/time, location, city, package_id(FK), status, notes, total_price | INSERT public | No SELECT policy for public |
| `entries` | id(UUID), event_id(FK), guest_name, photo_url(TEXT), voice_note_url(TEXT), message, filter_used, likes_count, is_approved | SELECT where approved, INSERT public | photo_url stores full base64 data |

**Missing from schema (required by V3 spec):**
- `profiles` table (admin roles)
- `frames` table (reusable frame catalog)
- `event_frames` junction table (1-3 frames per event)
- `media_assets` table (storage metadata)
- `status` column on events (DRAFT/ACTIVE/COMPLETED/ARCHIVED)
- `moderation_status` column on entries
- `event_slug` column on entries

**RLS gaps:**
- No admin authentication policy — no way to distinguish admin vs guest
- Bookings table has INSERT but no SELECT policy for admin
- No UPDATE/DELETE policies for admin moderation
- Events only filterable by `is_active`, not full status lifecycle

---

## CURRENT AUTHENTICATION

**Type:** Client-side only, hardcoded comparison

```ts
// admin-view.tsx line 46-47
if (
  (email === "admin@ruangtemu.id" || email === "admin") &&
  (password === "ruangtemu2026" || password === "admin123" || password === "palopo2026")
)
```

**Issues:**
- No server-side authentication
- No session management
- No token/cookie
- Multiple hardcoded passwords in source code
- `@supabase/ssr` is installed but not used
- No middleware protecting `/admin` routes
- No authorization on API routes

---

## CURRENT STORAGE

**Photo storage:** Base64 data URL string stored directly in `entries.photo_url` TEXT column

**Voice note storage:** Base64 data URL string stored directly in `entries.voice_note_url` TEXT column

**Issues:**
- A single photo composite can be 2-5MB as base64 — stored as TEXT in database
- JSON POST body with base64 photo hits typical body size limits (1MB default)
- No Supabase Storage buckets configured
- No `media_assets` table for metadata
- No file size validation
- No cleanup of temporary Blob URLs

---

## CURRENT CAMERA IMPLEMENTATION

**Location:** `components/photobooth/virtual-booth.tsx` lines 72-181

**getUserMedia config:**
```ts
{ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }, audio: false }
```

**Features:**
- Front-facing camera (selfie mode) ✓
- Mirror transform (`-scale-x-100`) ✓
- Countdown 3-2-1 ✓
- Multi-shot with configurable count ✓
- Flash overlay animation ✓
- Camera cleanup on unmount ✓
- Camera cleanup on back navigation ✓
- Error state with retry ✓

**Issues:**
- No camera state machine — uses `isCapturing` boolean + `countdown` number + `cameraError` string
- `startPhotoSequence` creates nested `setInterval` callbacks without storing interval IDs for cleanup
- No handling of camera stream error mid-capture
- No camera switch functionality
- Video aspect ratio `aspect-[3/4] sm:aspect-[4/3]` changes at `sm` breakpoint — mobile should always be portrait
- Camera resolution 1280×720 may be excessive for mobile memory
- No `devicePixelRatio` cap on canvas
- Photo captured at `videoWidth × videoHeight` without resolution limiting

---

## CURRENT FRAME RENDERER

**Location:** `lib/frame-canvas.ts` (362 lines)

**Frame types:**

| Type | Preview | High-Res | Photos |
|---|---|---|---|
| strip_3 | 600×1800 | 1200×3600 | 3 |
| grid_4 | 800×1000 | 1600×2000 | 4 |
| polaroid | 700×850 | 1400×1700 | 1 |
| deluxe | 800×1100 | 1600×2200 | 2 |

**Features:**
- 4 frame layout renderers ✓
- Aspect-fill image placement ✓
- Rounded corners ✓
- Text overlay (title, subtitle, brand) ✓
- Sticker overlay ✓
- Custom PNG overlay support ✓
- Canvas filter application ✓

**Issues:**
- **BUG on line 296:** `ctx.font = \`11 * scale}px sans-serif\`` — malformed template literal, missing backtick and `${`. This will cause a runtime error or wrong font size in deluxe frame rendering.
- High-res output (1200×3600 for strip_3) may crash mobile Safari
- `toDataURL("image/png", 0.95)` on large canvas creates enormous base64 strings
- No Blob output option — only base64 data URL
- Custom overlay loaded with `crossOrigin: "anonymous"` — may fail on external URLs without CORS

---

## CURRENT AUDIO IMPLEMENTATION

**Location:** `lib/audio.ts` (99 lines)

**Features:**
- MediaRecorder with codec detection (webm/opus → mp4 → ogg) ✓
- 250ms time slicing ✓
- Timer callback ✓
- Base64 conversion on stop ✓
- Stream cleanup on stop ✓
- Cancel method ✓

**Issues:**
- No maximum duration enforcement (AGENTS.md requires 60s)
- Base64 conversion of entire audio blob — can be large
- No Blob URL revocation
- `NodeJS.Timeout` type used for `timerInterval` — should be `ReturnType<typeof setInterval>` for browser

---

## CURRENT QR IMPLEMENTATION

**Location:** `app/event/[slug]/qr/page.tsx` (112 lines) and `app/event/[slug]/projection/page.tsx`

**Features:**
- QR generated client-side via `qrcode` library ✓
- Event URL encoded in QR ✓
- Print-ready standee layout ✓
- 3-step instruction card ✓
- QR in projection mode bottom-right corner ✓

**Issues:**
- QR uses `window.location.origin` — generated client-side only, not during SSR
- No fallback if JavaScript fails

---

## CURRENT GALLERY

**Location:** `app/event/[slug]/gallery/page.tsx` (227 lines)

**Features:**
- Fetches entries from `/api/events/[slug]/entries` ✓
- Polling every 12 seconds ✓
- Search by guest name or message ✓
- Like button (client-side only) ✓
- Download link ✓
- Voice note player ✓
- Empty state ✓
- Manual refresh button ✓

**Issues:**
- Marked `"use client"` — no server-side data fetching, no SEO
- Like button only updates local state — no persistence
- No pagination — loads all entries at once
- Download link points to `photo_url` which is a base64 data URL — works but not ideal
- No lazy loading of images
- Polling without cleanup risk on fast navigation

---

## CURRENT ADMIN IMPLEMENTATION

**Location:** `app/admin/page.tsx` + `components/admin/admin-view.tsx`

**Data loading:** Server-side in `page.tsx`, but gallery entries are hardcoded to `evt-1`:
```ts
const entries = await getEventEntries("evt-1");
```

**Features:**
- Login modal (client-side auth) ✓
- Overview with KPI cards ✓
- Event list with direct links (Booth, Gallery, Projection, QR) ✓
- Event creation form ✓
- Booking list with status badges ✓
- Gallery moderation (delete only) ✓
- Package catalog display ✓

**Issues:**
- Gallery entries hardcoded to single event
- No approve/reject moderation — only delete
- Booking status update is client-side only, no API call
- No event edit/archive functionality
- No event status management (DRAFT → ACTIVE → COMPLETED)

---

## LOCALSTORAGE USAGE

**None found.** The application does not use localStorage.

This is correct per AGENTS.md requirements.

---

## MOCK DATA

**Location:** `lib/db.ts` lines 5-261

Mock data is used as fallback when Supabase is not configured:
- 4 packages with Palopo pricing
- 3 events (bombom-wedding, wedding-andi-sarah, palopo-creative-fest-2026)
- 2 bookings
- 2 gallery entries (both for event evt-1)

**Behavior:** Every `db.ts` function checks `isSupabaseConfigured` first. If Supabase is not available or returns empty, falls back to mock data. This means:
- In dev without Supabase: always returns mock data ✓
- In production with Supabase: uses Supabase, but falls back to mock on empty results ⚠️

**Risk:** If Supabase returns 0 rows (legitimate empty state), the code falls back to mock data instead of showing empty state.

---

## REUSABLE LOGIC

The following existing code is functional and should be preserved/refactored:

| Module | Reusable? | Notes |
|---|---|---|
| Camera init/cleanup | ✓ | Extract to hook/module |
| Multi-shot countdown sequence | ✓ | Needs state machine refactor |
| Photo capture (video → canvas) | ✓ | Mirror transform included |
| Canvas frame renderer | ✓ | Fix line 296 bug, add Blob output |
| Filter application | ✓ | Both CSS preview and Canvas render |
| VoiceNoteRecorder class | ✓ | Add duration limit |
| Supabase client init | ✓ | Clean pattern |
| DB data access layer | ✓ | Needs mock fallback fix |
| Slug generation | ✓ | In API route |
| QR Code generation | ✓ | Client-side only |
| Utility functions | ✓ | formatRupiah, formatDate, cn |
| Type definitions | ✓ | Comprehensive |

---

## LEGACY LOGIC

| Item | Location | Action |
|---|---|---|
| Original HTML prototype | `legacy/index.html.html` (107KB) | Keep as reference |
| Hardcoded admin auth | `admin-view.tsx` L46 | Replace with Supabase Auth |
| Base64 photo storage | entries API | Replace with Supabase Storage |
| Event creation local fallback | `admin-view.tsx` L110-128 | Remove fake success |
| Booking status client-only | `admin-view.tsx` L57 | Add API call |

---

## SECURITY RISKS

| Risk | Severity | Location |
|---|---|---|
| Hardcoded admin credentials in source | CRITICAL | `admin-view.tsx` L46-47 |
| No server-side auth on admin page | CRITICAL | `app/admin/page.tsx` |
| No auth on API routes | HIGH | All API routes |
| Guest can POST to any event | HIGH | `api/events/[slug]/entries` |
| No frame-to-event validation | HIGH | Entry creation accepts any data |
| No input sanitization | MEDIUM | Guest messages rendered as text (safe), but no length limits |
| No upload size validation | MEDIUM | Base64 payload can be arbitrary size |
| No rate limiting | MEDIUM | All API routes |
| RLS incomplete | MEDIUM | No admin policies, no UPDATE/DELETE |
| Demo credentials in `.env.example` | LOW | Should use placeholder values |

---

## MOBILE UX ISSUES

| Issue | Severity | Location |
|---|---|---|
| Camera aspect ratio switches at `sm` breakpoint | HIGH | `virtual-booth.tsx` L456 |
| Camera UI constrained in card layout (`max-w-lg`) | HIGH | `virtual-booth.tsx` L431 |
| Welcome/frame screens constrained (`max-w-sm`, `max-w-md`) | MEDIUM | Lines 297, 340 |
| Font sizes too small: `text-[10px]`, `text-[11px]` used extensively | MEDIUM | Throughout |
| No safe-area-inset handling | MEDIUM | `globals.css`, layouts |
| No `dvh`/`svh` viewport units | MEDIUM | Camera layout uses percentage |
| Color picker (`input type="color"`) poor mobile UX | MEDIUM | Frame selection |
| Sticker buttons `w-7 h-7` below 44px tap target | HIGH | `virtual-booth.tsx` L404 |
| "← Ubah Frame" button `text-xs` with no min-height | MEDIUM | L445 |
| Filter chips `min-h-[32px]` below 44px target | MEDIUM | L505 |
| No orientation lock guidance | LOW | No landscape handling |
| Gallery uses `grid-cols-1 sm:grid-cols-2` — fine | OK | gallery/page.tsx |
| Header navigation links too small on mobile | MEDIUM | virtual-booth.tsx L263 |

---

## KNOWN BUGS

1. **`lib/frame-canvas.ts` line 296:** Malformed template literal
   ```ts
   // BROKEN:
   ctx.font = `11 * scale}px sans-serif`;
   // SHOULD BE:
   ctx.font = `${11 * scale}px sans-serif`;
   ```

2. **`virtual-booth.tsx` line 254:** Error catch navigates to "finished" step — user sees success even when save fails

3. **`admin/page.tsx` line 14:** Gallery entries hardcoded to `"evt-1"` — admin cannot see entries from other events

4. **`db.ts` fallback logic:** When Supabase returns 0 rows (empty result), code returns mock data instead of empty array (condition checks `data.length > 0`)

5. **Gallery `use` hook:** `app/event/[slug]/gallery/page.tsx` uses React `use()` to unwrap params promise — only works in React 19+ (currently installed, but fragile)

---

## MIGRATION RISKS

| Risk | Impact | Mitigation |
|---|---|---|
| Switching from base64 to Storage | HIGH — all existing entries use base64 | Support both during transition |
| Adding frame/event_frames tables | MEDIUM — changes frame selection flow | Backwards-compatible: keep `default_frame_config` as fallback |
| Adding Supabase Auth | HIGH — replaces entire auth flow | Implement incrementally |
| Adding status lifecycle | LOW — additive change | Add `status` column with default `ACTIVE` |
| Refactoring monolithic components | MEDIUM — risk of regression | Extract module by module with tests |

---

## PRIORITY ACTIONS FOR MOBILE MVP

Based on AGENTS.md priority and this audit:

### IMMEDIATE (Blocks mobile testing)
1. Fix frame-canvas.ts line 296 bug
2. Fix error-swallowing in handleSaveToGallery
3. Make camera UI fullscreen on mobile (remove card constraints)
4. Increase touch targets to 44px minimum
5. Fix camera aspect ratio for mobile (always portrait)

### HIGH (Required for pilot)
6. Add mobile-first camera layout
7. Implement proper camera state machine
8. Add upload retry UI
9. Add safe-area-inset handling
10. Fix mock data fallback (empty vs mock)

### MEDIUM (Required for production)
11. Replace base64 storage with Supabase Storage
12. Add server-side authentication
13. Add frame/event_frames tables
14. Add entry moderation (approve/reject)
15. Extract VirtualBooth into sub-components

### LOW (Post-pilot)
16. Admin dashboard polish
17. Landing page optimization
18. Booking system improvements
19. Analytics/metrics

---

## FILE INVENTORY

| File | Lines | Bytes | Purpose |
|---|---|---|---|
| `app/page.tsx` | ~600+ | 17,600 | Landing page |
| `app/layout.tsx` | 51 | 1,391 | Root layout with Geist fonts |
| `app/globals.css` | 46 | 1,106 | Tailwind v4 theme |
| `app/event/[slug]/page.tsx` | 41 | 1,206 | Event photobooth (server) |
| `app/event/[slug]/gallery/page.tsx` | 227 | 9,093 | Gallery (client) |
| `app/event/[slug]/projection/page.tsx` | 213 | 7,994 | Projection (client) |
| `app/event/[slug]/qr/page.tsx` | 112 | 3,887 | QR standee (client) |
| `app/admin/page.tsx` | 25 | 724 | Admin (server) |
| `app/booking/page.tsx` | — | — | Booking form |
| `app/api/events/route.ts` | 72 | 2,474 | Events API |
| `app/api/events/[slug]/entries/route.ts` | 54 | 1,617 | Entries API |
| `app/api/bookings/route.ts` | 36 | 1,203 | Bookings API |
| `components/photobooth/virtual-booth.tsx` | 726 | 28,286 | Photobooth wizard |
| `components/admin/admin-view.tsx` | 680 | 29,079 | Admin dashboard |
| `components/navbar.tsx` | — | — | Navigation |
| `components/footer.tsx` | — | — | Footer |
| `lib/db.ts` | 420 | 13,632 | Data access layer |
| `lib/frame-canvas.ts` | 362 | 11,708 | Canvas renderer |
| `lib/audio.ts` | 99 | 2,928 | Voice recorder |
| `lib/supabase.ts` | 15 | 436 | Supabase init |
| `lib/utils.ts` | 47 | 1,123 | Utilities |
| `types/index.ts` | 165 | 3,666 | TypeScript types |
| `supabase/migrations/20260919_initial_schema.sql` | 101 | 3,566 | DB schema |

---

*End of Audit Report*
