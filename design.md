# RUANGTEMU Virtual Photobooth - Design & Architecture Specification

> **Versi Dokumen:** 3.0 (Updated October 2026)
> **Status:** Development - Production Preparation
> **Mitra:** RUANGTEMU PHOTOBOOTH - Palopo & Tana Luwu, Sulawesi Selatan
> **Referensi Utama:** README_RUANGTEMU_V3.md (Product Specification)

---

## 1. Ringkasan Produk

RUANGTEMU Virtual Photobooth adalah platform web multi-event yang dikembangkan untuk RUANGTEMU PHOTOBOOTH di Kota Palopo, Sulawesi Selatan.

Prinsip utama:

```text
ONE APPLICATION -> MANY EVENTS -> ONE UNIQUE URL PER EVENT
```

Admin RUANGTEMU membuat event baru dari dashboard tanpa perlu developer intervention. Setiap event menghasilkan:
- UUID unik
- Slug URL unik (`/event/dimas-sarah`)
- QR Code untuk standee meja
- Assignment 1-3 frame template
- Gallery, projection, dan media storage yang terisolasi

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.5 |
| Runtime & UI | React & React DOM | 19.2.8 |
| Language | TypeScript | 5.x (strict) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) | 4.x |
| Icons | Lucide React | 1.47.0 |
| Database & Storage | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | 2.116.0 / 0.12.7 |
| Graphics | HTML5 Canvas API (`lib/frame-canvas.ts`) | Native |
| Audio | Web Audio API & MediaRecorder API (`lib/audio.ts`) | Native |
| Celebration FX | `canvas-confetti` | 1.9.4 |
| QR Generator | `qrcode` | 1.5.4 |
| Validation | `zod` | 4.6.5 |
| Utilities | `clsx`, `tailwind-merge` | Latest |

---

## 3. Design System & Visual Tokens

Tema: **Modern Dark Neo-Glassmorphism** dengan aksen gradien vibran (Indigo, Violet, Rose).

### 3.1 Color Palette

```
PRIMARY BACKGROUND & SURFACES
  Deep Canvas Background : #020617 (slate-950)
  Surface Elevated Card  : #0f172a (slate-900 / 85-90% opacity + blur)
  Surface Sub-Card       : #1e293b (slate-800 / 80% opacity)
  Border Subtle          : #334155 (slate-700 / 60% opacity)
  Border Vibrant Glow    : rgba(99, 102, 241, 0.4) (indigo-500/40)

BRAND ACCENTS & GRADIENTS
  Primary Indigo         : #6366f1 (indigo-500)
  Royal Violet           : #8b5cf6 (violet-500)
  Vivid Fuchsia / Rose   : #f43f5e (rose-500)
  Brand Gradient Button  : linear-gradient(135deg, #6366f1, #a855f7, #f43f5e)
  Amber Gold (VIP/Badge) : #f59e0b (amber-500)
  Emerald Green (Success): #10b981 (emerald-500)

TYPOGRAPHY COLORS
  Headline / High-Emp    : #ffffff (Pure White)
  Body / Medium-Emp      : #cbd5e1 (slate-300)
  Muted / Low-Emp        : #94a3b8 (slate-400) & #64748b (slate-500)
  Gradient Text Fill     : from-indigo-400 via-purple-300 to-rose-400
```

### 3.2 Typography

- **Primary UI Font:** Geist Sans / Inter (`--font-geist-sans`, sans-serif)
- **Monospace Font:** Geist Mono (`--font-geist-mono`, monospace) - untuk metadata, counter, ID booking
- **Display / Decorative Frame Fonts (Canvas & Templates):**
  - Serif Elegan: Playfair Display, Cinzel, Cormorant Garamond (Wedding & Formal)
  - Handwritten: Caveat, Dancing Script (Polaroid & Doa Tamu)
  - Modern Editorial: Outfit, Montserrat, Syne (Graduation & Youth)

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display Hero | 48-64px | 800 | 1.1-1.15 | Hero Section H1 |
| H1 Page Title | 32-40px | 700 | 1.2 | Judul Halaman / Modal |
| H2 Section | 24-30px | 700 | 1.25 | Judul Section, Admin Tab |
| H3 Card Header | 18-20px | 600 | 1.35 | Nama Paket, Kartu Event |
| Body Base | 15-16px | 400 | 1.6 | Paragraf, Deskripsi |
| Body Small | 13-14px | 400-500 | 1.5 | Label form, Metadata |
| Badge / Caption | 11-12px | 600 | 1.4 | Pill, Counter, Status |

### 3.3 Visual Effects & Motion

- **Glassmorphism:** `background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08);`
- **Ambient Aura:** `blur(96px)` gradien `from-indigo-600/20 via-purple-600/20 to-rose-600/10`
- **Button Hover:** Scale `1.02` on hover, `0.98` on active, transisi `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- **Shutter Flash:** White overlay opacity `0.9 -> 0` dalam 300ms saat capture
- **Celebration:** Canvas Confetti burst saat foto berhasil dikirim ke galeri

---

## 4. Route Map & Information Architecture

```
[RUANGTEMU DIGITAL]
 |
 +-- 1. PUBLIC MARKETING & COMMERCIAL
 |    +-- ( / ) : Homepage / Landing Page
 |    |     +-- Hero Section + Dual CTA (Booking & Live Demo)
 |    |     +-- Showcase Layanan (Fisik, Virtual, Hybrid)
 |    |     +-- Daftar Paket & Harga Resmi
 |    |     +-- Demo Interaktif Photobooth
 |    |     +-- Testimonial & Bukti Sosial Lokal Palopo
 |    |     +-- FAQ & Footer Kontak WhatsApp
 |    |
 |    +-- ( /booking ) : Formulir Reservasi Jadwal
 |          +-- Pilihan 4 Paket (Radio Cards)
 |          +-- Form Rincian Acara
 |          +-- Ringkasan Biaya & WhatsApp Dispatch
 |          +-- Layar Konfirmasi
 |
 +-- 2. VIRTUAL PHOTOBOOTH (GUEST FLOW)
 |    +-- ( /event/[slug] ) : Web Photobooth Studio
 |    |     +-- Step 1: Welcome & Input Nama Tamu
 |    |     +-- Step 2: Pemilihan Template & Frame
 |    |     +-- Step 3: Kamera + Filters + Multi-shot Countdown
 |    |     +-- Step 4: Composite Canvas Preview & Retake
 |    |     +-- Step 5: Guestbook & Voice Note Recorder
 |    |     +-- Step 6: Selebrasi (Download HD, Gallery, Share)
 |    |
 |    +-- ( /event/[slug]/gallery ) : Live Photo Stream & Guestbook
 |    |     +-- Live Counter, Search & Filter
 |    |     +-- Masonry Grid Foto Tamu
 |    |     +-- Voice Note Player Bar
 |    |     +-- Like Reaction & HD Download
 |    |
 |    +-- ( /event/[slug]/projection ) : Live Stage / Videotron
 |    |     +-- 16:9 Fullscreen Auto-Slideshow
 |    |     +-- High-Contrast QR Code
 |    |     +-- Branding Event & Ucapan Tamu
 |    |
 |    +-- ( /event/[slug]/qr ) : Printable Table Standee
 |          +-- Format Cetak A5
 |          +-- QR Code High-Density
 |          +-- Panduan 3 Langkah
 |
 +-- 3. ADMIN PORTAL
      +-- ( /admin ) : Control Hub RUANGTEMU
            +-- Login / Session Validation
            +-- Tab 1: Ringkasan KPI & Analytics
            +-- Tab 2: Manajemen Event & Pembuat Event Baru
            +-- Tab 3: Pipeline Reservasi (Pending -> Confirmed)
            +-- Tab 4: Galeri Moderasi & Voice Note Player
            +-- Tab 5: Katalog Paket & Konfigurasi
```

---

## 5. Project File Structure (Aktual)

```
ruangtemu-test/
+-- app/
|   +-- admin/
|   |   +-- page.tsx                    Admin dashboard (renders AdminView)
|   +-- api/
|   |   +-- bookings/
|   |   |   +-- route.ts               GET/POST booking data
|   |   +-- events/
|   |       +-- [slug]/
|   |           +-- entries/
|   |               +-- route.ts       GET/POST entries (base64 photo)
|   +-- booking/
|   |   +-- page.tsx                    Public booking form
|   +-- event/
|   |   +-- [slug]/
|   |       +-- gallery/
|   |       |   +-- page.tsx            Event gallery (polling)
|   |       +-- projection/
|   |       |   +-- page.tsx            Videotron slideshow
|   |       +-- qr/
|   |       |   +-- page.tsx            QR standee print page
|   |       +-- page.tsx                Guest photobooth entry
|   +-- favicon.ico
|   +-- globals.css                     Tailwind v4 theme & font imports
|   +-- layout.tsx                      Root layout (Google Fonts)
|   +-- page.tsx                        Commercial landing page (17.6KB)
+-- components/
|   +-- admin/
|   |   +-- admin-view.tsx              Admin dashboard (640 lines, monolithic)
|   +-- photobooth/
|   |   +-- virtual-booth.tsx           Photobooth wizard (657 lines, monolithic)
|   +-- footer.tsx                      Global footer
|   +-- navbar.tsx                      Glassmorphism navbar
+-- lib/
|   +-- audio.ts                        VoiceNoteRecorder (MediaRecorder API)
|   +-- db.ts                           Hybrid Supabase/mock fallback (13.6KB)
|   +-- frame-canvas.ts                 Canvas composite engine (11.7KB)
|   +-- supabase.ts                     Supabase client initialization
|   +-- utils.ts                        Format currency IDR, date, clsx
+-- types/
|   +-- index.ts                        TypeScript interfaces & types
+-- supabase/
|   +-- migrations/
|   |   +-- 20260919_initial_schema.sql Initial schema
|   +-- seed.sql                        Demo seed data
+-- legacy/
|   +-- README-SPEC.md                  Legacy specification
|   +-- index.html.html                 Original HTML prototype (107KB)
+-- public/
+-- .env.example
+-- AGENTS.md                           Agent rules & antislop config
+-- CLAUDE.md                           Points to AGENTS.md
+-- design.md                           This file
+-- package.json
+-- tsconfig.json
```

---

## 6. TypeScript Type System

Definisi tipe utama di `types/index.ts`:

```ts
// Enum Types
EventType:     "wedding" | "birthday" | "corporate" | "gathering" | "graduation" | "prom" | "other"
EventStatus:   "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED"
BookingStatus: "pending" | "confirmed" | "completed" | "cancelled"
ModerationStatus: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN"
FrameType:     "strip_3" | "grid_4" | "polaroid" | "deluxe"
CameraFilter:  "normal" | "grayscale" | "sepia" | "soft-glow" | "warm-vintage" | "cool-cinema"

// Core Interfaces
Package        - Katalog paket layanan (id, name, slug, price, features, category)
Booking        - Reservasi client (customer info, event details, package_id, status)
FrameConfig    - Konfigurasi frame (type, backgroundColor, borderColor, font, sticker, filter)
FrameItem      - Aset frame reusable (id, name, slug, template_type, config_json)
EventFrame     - Junction event-frame (event_id, frame_id, sort_order)
EventItem      - Data event lengkap (slug, title, host_name, date, venue, status, assigned_frames)
GalleryEntry   - Submission tamu (guest_name, photo_url, voice_note_url, message, likes)
MediaAsset     - Metadata file storage (storage_path, mime_type, size_bytes)

// Public DTOs (guest-facing, sanitized)
PublicFrameDTO - Frame data untuk guest (id, name, templateType, config)
PublicEventDTO - Event data untuk guest (slug, title, clientName, eventDate, frames)
```

---

## 7. Database Schema

Database menggunakan PostgreSQL via Supabase. Schema aktual di `supabase/migrations/20260919_initial_schema.sql`.

### 7.1 Tabel Aktif

| Tabel | Deskripsi | Kolom Utama |
|---|---|---|
| `packages` | Katalog paket layanan | id, slug, name, price, duration_hours, features, category, popular |
| `events` | Data event photobooth | id, slug, title, host_name, event_type, date, venue, city, is_active, status, allow_guestbook, allow_voice_note, default_frame_config |
| `bookings` | Reservasi dari website | id, customer_name, customer_phone, event_type, event_date, package_id, status, total_price |
| `entries` | Submission foto tamu | id, event_id, guest_name, photo_url, voice_note_url, message, filter_used, likes_count, is_approved, moderation_status |

### 7.2 Tabel Target V3 (belum diimplementasikan)

| Tabel | Deskripsi | Status |
|---|---|---|
| `profiles` | Admin user roles (ADMIN, OPERATOR) | Planned |
| `frames` | Katalog frame reusable | Planned |
| `event_frames` | Junction table event-frame (1-3 frame per event) | Planned |
| `media_assets` | Metadata file di Supabase Storage | Planned |

### 7.3 Event Lifecycle

```
[ DRAFT ] ----> [ ACTIVE ] ----> [ COMPLETED ] ----> [ ARCHIVED ]

DRAFT:     Event sedang disiapkan. Guest tidak bisa akses.
ACTIVE:    Event live. Guest bisa foto & submit.
COMPLETED: Acara selesai. Gallery tetap bisa diakses.
ARCHIVED:  Tersembunyi dari daftar aktif. Data tetap ada.
```

---

## 8. Canvas Resolution Matrix

Renderer canvas di `lib/frame-canvas.ts`:

| Frame Type | Preview Canvas | High-Res Output (Download) | Aspect Ratio | Jumlah Foto |
|---|---|---|---|---|
| `strip_3` | 600 x 1800 px | **1200 x 3600 px** | 1:3 Vertikal | 3 |
| `grid_4` | 800 x 1000 px | **1600 x 2000 px** | 4:5 Kolase | 4 |
| `polaroid` | 700 x 850 px | **1400 x 1700 px** | ~1:1.2 Klasik | 1 |
| `deluxe` | 800 x 1100 px | **1600 x 2200 px** | ~1:1.37 Portrait | 2 |

### Camera Filter Matrix

| Filter | CSS Filter Chain |
|---|---|
| `normal` | none |
| `grayscale` | `grayscale(100%) contrast(110%)` |
| `sepia` | `sepia(80%) contrast(105%) brightness(95%)` |
| `soft-glow` | `brightness(105%) contrast(95%) saturate(110%) blur(0.3px)` |
| `warm-vintage` | `sepia(35%) saturate(125%) contrast(110%) brightness(102%)` |
| `cool-cinema` | `hue-rotate(185deg) saturate(90%) contrast(115%)` |

### Audio Voice Note

- Format: `audio/webm;codecs=opus` (fallback `audio/mp4`, `audio/ogg`)
- Durasi maksimal: 60 detik
- Slice per 250ms, konversi ke Base64 / URL Supabase Storage

---

## 9. Screen-by-Screen UI Blueprint

### 9.1 Commercial Landing Page (`/`)

1. **Sticky Glass Navigation Bar:** Logo RUANGTEMU + nav links + CTA "Reservasi Event"
2. **Hero Section:** Badge lokasi, heading utama, value proposition pills, dual CTA
3. **Core Services (3 Cards):** Physical Print, Virtual Web, Live Projection
4. **Pricing (4 Cards):**
   - Paket Basic (2 Jam) - Rp 1.800.000
   - Paket Standard Deluxe (3 Jam, BEST SELLER) - Rp 2.500.000
   - Paket Virtual & Web (12 Jam) - Rp 2.200.000
   - Paket Platinum Hybrid (4 Jam + Virtual) - Rp 3.800.000
5. **Demo Showcase:** Link demo live event
6. **Testimonials:** Ulasan dari event organizer Palopo
7. **Footer:** Alamat Palopo, WhatsApp, copyright

### 9.2 Booking Page (`/booking`)

- 2-column responsive: form kiri, sticky summary kanan
- Data pemesan, detail acara, lokasi, pemilihan paket
- Submit mengarah ke WhatsApp konfirmasi

### 9.3 Virtual Photobooth (`/event/[slug]`)

6-step dynamic flow:

```
Welcome -> Frame Select -> Camera -> Preview -> Guestbook -> Finished
```

1. **Welcome:** Cover event, badge type, input nama tamu
2. **Frame Selection:** 4 layout (strip_3, grid_4, polaroid, deluxe), color swatches, font, stiker
3. **Camera:** Live viewfinder, switch kamera, 6 filter, multi-shot counter, countdown 3-2-1
4. **Preview:** Canvas composite, tombol retake / lanjut
5. **Guestbook:** Textarea pesan, voice note recorder (pulsing, timer, preview)
6. **Finished:** Confetti, download PNG, lihat gallery, foto lagi

### 9.4 Live Gallery (`/event/[slug]/gallery`)

- Sticky header: counter, search, filter
- Masonry grid: avatar, nama, foto, pesan, voice note player, like reaction, download
- Empty state jika belum ada foto

### 9.5 Projection (`/event/[slug]/projection`)

- 16:9 fullscreen, slideshow 7 detik, transisi fade & scale
- Foto besar kiri/tengah, nama & ucapan kanan/bawah
- QR Code persistent pojok kanan bawah
- Font minimal 28px untuk legibilitas jarak jauh

### 9.6 QR Standee (`/event/[slug]/qr`)

- Print-ready A5 via `window.print()`
- QR Code kontras tinggi (#0f172a pada #ffffff)
- Panduan 3 langkah: Scan, Pilih Frame, Ambil Foto

### 9.7 Admin Dashboard (`/admin`)

- Login modal (auth)
- 5 tab: Overview, Events, Bookings, Gallery Moderation, Packages
- KPI cards: Total Event, Reservasi, Foto, Estimasi Pendapatan
- Event management: create, edit, activate, complete, archive
- Gallery moderation: approve, reject, hide, delete

---

## 10. Data Access Layer (`lib/db.ts`)

Database layer menggunakan pattern hybrid:

```
Request -> lib/db.ts -> Supabase (if configured)
                     -> Mock in-memory store (fallback)
```

Fungsi yang tersedia:

```ts
// Packages
getPackages(): Promise<Package[]>

// Events
getEvents(): Promise<EventItem[]>
getEventBySlug(slug: string): Promise<EventItem | null>
createEvent(data): Promise<EventItem>
updateEvent(id, data): Promise<EventItem>

// Bookings
getBookings(): Promise<Booking[]>
createBooking(data): Promise<Booking>
updateBookingStatus(id, status): Promise<Booking>

// Entries
getEntriesByEventId(eventId: string): Promise<GalleryEntry[]>
createEntry(data): Promise<GalleryEntry>
updateEntryApproval(id, approved): Promise<GalleryEntry>
deleteEntry(id): Promise<void>
likeEntry(id): Promise<GalleryEntry>
```

Jika `NEXT_PUBLIC_SUPABASE_URL` tidak dikonfigurasi di `.env.local`, seluruh fungsi fallback ke mock data in-memory.

---

## 11. Komponen Utama

### 11.1 `components/photobooth/virtual-booth.tsx` (657 baris)

Komponen monolitik yang menangani seluruh 6-step wizard:
- Camera lifecycle & state machine
- Frame configuration & selection
- Multi-shot countdown
- Filter application
- Canvas composite rendering
- Audio voice note recording
- Guestbook form
- Submission & celebration

### 11.2 `components/admin/admin-view.tsx` (640 baris)

Komponen monolitik admin dashboard:
- Authentication (client-side state check)
- Overview KPI metrics
- Event list & management forms
- Booking pipeline
- Gallery moderation

### 11.3 `lib/frame-canvas.ts` (11.7KB)

Canvas composite engine:
- 4 frame layout renderers (strip_3, grid_4, polaroid, deluxe)
- Proportional aspect ratio crop (cover algorithm)
- Filter application
- Text overlay (event name, guest name, watermark)
- High-resolution export

### 11.4 `lib/audio.ts` (2.9KB)

VoiceNoteRecorder class:
- Stream initialization
- Codec fallback detection (webm/opus -> mp4 -> ogg)
- Chunk processing
- 60-second limit enforcement

---

## 12. Environment Variables

```env
# Next.js Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (opsional: kosong = fallback ke mock)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Authentication
ADMIN_EMAIL=admin@ruangtemu.id
ADMIN_PASSWORD=ruangtemupalopo2026

# WhatsApp & Social
NEXT_PUBLIC_RUANGTEMU_WA=6282299887766
NEXT_PUBLIC_RUANGTEMU_INSTAGRAM=ruangtemu_photobooth
```

---

## 13. Technical Debt & Migration Gaps

| Area | Status | Target |
|---|---|---|
| Authentication | Client-side state check, hardcoded passwords | Supabase Auth + SSR cookies |
| Media Storage | Base64 di database text fields | Supabase Storage buckets |
| Frame Management | Single `default_frame_config` per event | `frames` + `event_frames` junction (1-3 per event) |
| Component Size | 2 monolithic components (640-657 baris) | Modular sub-components |
| Gallery Polling | `setInterval` 12s tanpa pagination | Cursor pagination + realtime |
| Admin Roles | Tidak ada profil/role system | `profiles` table + RBAC |
| Event Status | `is_active` boolean saja | Full lifecycle (DRAFT -> ACTIVE -> COMPLETED -> ARCHIVED) |

---

## 14. Development Phase Roadmap

Berdasarkan README_RUANGTEMU_V3.md:

| Phase | Scope | Status |
|---|---|---|
| 0 | Audit existing codebase | Done |
| 1 | Architecture & database design lock | Done |
| 2 | Foundation: Supabase, migrations, types, auth | Partial |
| 3 | Admin event management & frame assignment | Pending |
| 4 | Guest event page & frame selection | Existing (needs refactor) |
| 5 | Camera module | Existing (needs cleanup) |
| 6 | Frame renderer | Existing (functional) |
| 7 | Upload & guestbook | Existing (needs storage migration) |
| 8 | Gallery | Existing (needs pagination) |
| 9 | Projection & QR print | Existing (functional) |
| 10 | Security audit | Pending |
| 11 | QA & testing | Pending |
| 12 | Pilot test | Pending |
| 13 | Production deployment | Pending |

---

## 15. Responsive Design Targets

Prioritas: smartphone portrait (tamu scan QR dari HP).

```
320px  - small phones
375px  - iPhone SE
390px  - iPhone 14/15
430px  - iPhone Pro Max
768px  - tablet
1024px - small desktop
1280px - desktop
1440px - wide desktop
```

Minimum tap target: 44px.

---

## 16. Acceptance Criteria Ringkas

### Admin
- Secure login, dashboard, create/edit/activate/complete/archive event
- Select 1-3 frames per event
- View event URL, copy link, generate QR
- Moderate gallery entries

### Guest
- Open event dari QR, event info tampil benar
- Input nama, pilih frame, camera permission
- Countdown, multi-shot, filter, composite, preview, retake
- Guestbook, voice note (optional), submit, download, gallery

### Data Isolation
- Setiap event punya UUID + slug unik
- Entry hanya milik event terkait
- Gallery event-specific
- Event A tidak bisa akses data Event B

---

(c) 2026 RUANGTEMU PHOTOBOOTH
Kota Palopo & Tana Luwu, Sulawesi Selatan
