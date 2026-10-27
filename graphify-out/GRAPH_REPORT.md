# Graph Report - ruangtemu-test  (2026-10-27)

## Corpus Check
- 122 files · ~164,020 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .ico 2, .css 2, .example 1)

## Summary
- 1273 nodes · 1921 edges · 88 communities (80 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b0d2f130`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- db.ts
- admin-view.tsx
- layout.tsx
- validate.py
- doku.ts
- save-frame.ts
- virtual-booth.tsx
- compress.py
- theme-config.tsx
- maintenance.ts
- package.json
- detect.py
- compilerOptions
- dependencies
- app/page.tsx
- maintenance/page.tsx
- contrast-mcp.py
- _compress_file_locked
- caveman-explore/tests/skill-file.test.mjs
- file_lock
- cli.py
- caveman-explore/package.json
- caveman-learn/package.json
- gallery/page.tsx
- contrast-check.py
- eslint.config.mjs
- getEventBySlug
- index.ts
- scripts
- CurvedLoop.tsx
- AGENTS.md
- RUANGTEMU Virtual Photobooth - Design & Architecture Specification
- booking-modal.tsx
- react
- Tone & Voice
- 📸 RUANGTEMU Virtual Photobooth & Event Management Platform
- antislop-layoutmobile
- postcss.config.mjs
- RUANGTEMU VIRTUAL PHOTOBOOTH — AUDIT REPORT
- caveman-compress/README.md
- Rules
- antislop-human
- Comments That Add Nothing
- Group 1: Hard Gate (absolute, no exceptions)
- Caveman Help
- export-zip/route.ts
- admin-charts.tsx
- Group 2: Purpose-Gate (technique allowed, purpose required)
- Rules
- Rules
- benchmark.py
- HomePage
- Decorative Elements
- Caveman Compress
- booking-modal.tsx
- next
- antislop-ui
- Layout & Components
- Visual & Color
- caveman-commit
- caveman-review
- Group 3: Quality Locks (consistency)
- Playwright E2E Testing Skill
- packages/route.ts
- admin/page.tsx
- antislop
- Part 1: AI Slop Patterns (Warning Signs)
- App & Dashboard
- Review Caveman evidence
- Manage eval-gated experiments
- caveman-setup/SKILL.md
- Evaluate an optimization observation
- caveman-stats
- The Craftsmanship Standard
- caveman-discover/SKILL.md
- Delivery Gate (Mandatory)
- skills/caveman-learn — the Caveman Learn editing skill (Apache-2.0, public)
- caveman-learn skill
- Part 3: Liveliness Toolkit
- This is NOT the Next.js you know
- MOBILE-FIRST MVP PRIORITY — RUANGTEMU VIRTUAL PHOTOBOOTH
- megacave/README.md
- ultracave/README.md
- canvas-confetti
- @playwright/test

## God Nodes (most connected - your core abstractions)
1. `AdminView()` - 44 edges
2. `next` - 37 edges
3. `getDbClient()` - 27 edges
4. `RUANGTEMU VIRTUAL PHOTOBOOTH — AUDIT REPORT` - 24 edges
5. `react` - 22 edges
6. `_compress_file_locked()` - 19 edges
7. `Group 1: Hard Gate (absolute, no exceptions)` - 18 edges
8. `compilerOptions` - 17 edges
9. `RUANGTEMU Virtual Photobooth - Design & Architecture Specification` - 17 edges
10. `VirtualBooth()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Fixed Pixel Type` --references--> `clamp()`  [INFERRED]
  .agents/skills/antislop-layoutmobile/SKILL.md → components/reactbits/CircularText.tsx
- ``components/photobooth/virtual-booth.tsx` (726 lines)` --references--> `VoiceNoteRecorder`  [INFERRED]
  docs/AUDIT.md → lib/audio.ts
- ``components/photobooth/virtual-booth.tsx` (726 lines)` --references--> `renderPhotoboothFrame()`  [INFERRED]
  docs/AUDIT.md → lib/frame-canvas.ts
- `DELETE()` --calls--> `deleteBooking()`  [EXTRACTED]
  app/api/bookings/route.ts → lib/db.ts
- `AdminPage()` --calls--> `AdminView()`  [EXTRACTED]
  app/admin/page.tsx → components/admin/admin-view.tsx

## Import Cycles
- None detected.

## Communities (88 total, 8 thin omitted)

### Community 0 - "db.ts"
Cohesion: 0.15
Nodes (20): DELETE(), PATCH(), POST(), DELETE(), dynamic, RouteContext, createBooking(), defaultDemoFrames (+12 more)

### Community 1 - "admin-view.tsx"
Cohesion: 0.10
Nodes (36): AdminMobileGuard(), AdminView(), formatIndonesianDateTime(), formatNotificationClockTime(), IconBell(), IconBooking(), IconCalendar(), IconCamera() (+28 more)

### Community 2 - "layout.tsx"
Cohesion: 0.20
Nodes (7): cinzel, geistMono, geistSans, greatVibes, jsonLd, metadata, playfair

### Community 3 - "validate.py"
Cohesion: 0.11
Nodes (17): count_bullets(), extract_code_blocks(), extract_fenced_spans(), extract_headings(), extract_indented_code_blocks(), extract_inline_codes(), extract_paths(), extract_urls() (+9 more)

### Community 4 - "doku.ts"
Cohesion: 0.10
Nodes (28): dynamic, POST(), dynamic, POST(), dynamic, GET(), POST(), dynamic (+20 more)

### Community 5 - "save-frame.ts"
Cohesion: 0.17
Nodes (17): POST(), DELETE(), dynamic, POST(), revalidate, RouteContext, POST(), POST() (+9 more)

### Community 6 - "virtual-booth.tsx"
Cohesion: 0.10
Nodes (28): CameraState, DAYS_ID, FILTERS, formatIndonesianDateUpper(), formatIndonesianFullDate(), FRAME_TEMPLATES, isLightHex(), MONTHS_ID (+20 more)

### Community 7 - "compress.py"
Cohesion: 0.12
Nodes (11): AnthropicSdkUnavailable, call_anthropic_sdk(), call_claude(), call_claude_cli(), call_openai_compat(), call_opencode_cli(), configured_model(), configured_provider() (+3 more)

### Community 8 - "theme-config.tsx"
Cohesion: 0.13
Nodes (26): DEVICES, GuestNameUIEditor(), GuestNameUIEditorProps, PRESETS, DEVICES, ICON_OPTIONS, LandingUIEditor(), LandingUIEditorProps (+18 more)

### Community 9 - "maintenance.ts"
Cohesion: 0.13
Nodes (14): dynamic, GET(), POST(), cachedConfig, DEFAULT_CONFIG, getMaintenanceConfig(), LOCAL_FILE_PATH, MaintenanceConfig (+6 more)

### Community 10 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, tailwindcss@^4, @tailwindcss/postcss@^4, @types/canvas-confetti@^1.9.0, @types/jszip@^3.4.0, @types/node@^20, @types/qrcode@^1.5.6, @types/react@^19 (+14 more)

### Community 11 - "detect.py"
Cohesion: 0.18
Nodes (6): main(), detect_file_type(), _is_code_line(), _is_json_content(), _is_yaml_content(), should_compress()

### Community 12 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 13 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, clsx@^2.1.1, googleapis@^188.0.0, lucide-react@^1.47.0, mysql2@^3.24.5, next@16.3.5, react@19.2.8, react-dom@19.2.8 (+15 more)

### Community 14 - "app/page.tsx"
Cohesion: 0.33
Nodes (4): ClientReviewItem, DEFAULT_LANDING_PACKAGES, DUMMY_QUOTES_POOL, INITIAL_CLIENT_REVIEWS

### Community 15 - "maintenance/page.tsx"
Cohesion: 0.38
Nodes (5): MaintenanceView(), dynamic, MaintenancePage(), metadata, revalidate

### Community 16 - "contrast-mcp.py"
Cohesion: 0.32
Nodes (9): _channel(), check_contrast(), contrast_ratio(), _error(), main(), relative_luminance(), _reply(), _send() (+1 more)

### Community 17 - "_compress_file_locked"
Cohesion: 0.12
Nodes (9): build_compress_prompt(), build_fix_prompt(), _compress_file_locked(), first_nonblank_line(), _is_smaller_than_body(), mask_code_blocks(), read_source(), restore_code_blocks() (+1 more)

### Community 18 - "caveman-explore/tests/skill-file.test.mjs"
Cohesion: 0.23
Nodes (3): md, skillFile, skill

### Community 19 - "file_lock"
Cohesion: 0.18
Nodes (4): file_lock(), LockTimeoutError, _try_lock_nonblocking(), _unlock()

### Community 20 - "cli.py"
Cohesion: 0.16
Nodes (8): backup_dir_for(), compress_file(), is_sensitive_path(), lock_path_for(), _state_base_dir(), write_bytes_atomic(), _write_target(), write_text_atomic()

### Community 21 - "caveman-explore/package.json"
Cohesion: 0.20
Nodes (9): description, files, license, name, private, scripts, test, type (+1 more)

### Community 22 - "caveman-learn/package.json"
Cohesion: 0.20
Nodes (9): description, files, license, name, private, scripts, test, type (+1 more)

### Community 23 - "gallery/page.tsx"
Cohesion: 0.29
Nodes (8): EventGalleryPage(), formatDateCustom(), formatTimeCustom(), isLightHex(), Props, getDefaultThemeConfigForEvent(), resolveLandingThemeConfig(), EventData

### Community 24 - "contrast-check.py"
Cohesion: 0.27
Nodes (9): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+1 more)

### Community 25 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.3.5, eslint, eslint-config-next

### Community 26 - "getEventBySlug"
Cohesion: 0.21
Nodes (15): GET(), DELETE(), GET(), PUT(), EventPhotoboothPage(), generateMetadata(), Props, buildSafeFramePayload() (+7 more)

### Community 27 - "index.ts"
Cohesion: 0.14
Nodes (17): FrameUploadSlot, DetectionResult, detectTransparentRegions(), floodFill(), loadImageFromUrl(), mergeOverlapping(), BookingStatus, EventFrame (+9 more)

### Community 28 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, start, test:e2e, test:e2e:mobile

### Community 29 - "CurvedLoop.tsx"
Cohesion: 0.27
Nodes (10): CurvedLoop(), CurvedLoopProps, CurvedLoopShape, DragState, edgeMask(), Geometry, getGeometry(), wavePath() (+2 more)

### Community 30 - "AGENTS.md"
Cohesion: 0.03
Nodes (58): 10. CAMERA PREVIEW, 11. CAMERA PERMISSION, 12. CAMERA CLEANUP, 13. MOBILE CAMERA PERFORMANCE, 14. MOBILE PHOTO CAPTURE, 15. PHOTO RESOLUTION, 16. DEVICE PIXEL RATIO, 17. MULTI-SHOT UX (+50 more)

### Community 32 - "RUANGTEMU Virtual Photobooth - Design & Architecture Specification"
Cohesion: 0.05
Nodes (39): 10. Data Access Layer (`lib/db.ts`), 11.1 `components/photobooth/virtual-booth.tsx` (657 baris), 11.2 `components/admin/admin-view.tsx` (640 baris), 11.3 `lib/frame-canvas.ts` (11.7KB), 11.4 `lib/audio.ts` (2.9KB), 11. Komponen Utama, 12. Environment Variables, 13. Technical Debt & Migration Gaps (+31 more)

### Community 33 - "booking-modal.tsx"
Cohesion: 0.19
Nodes (14): BookingForm(), BookingPage(), PackageOption, packageOptions, DokuPaymentModal(), DokuPaymentModalProps, BookingModal(), Footer() (+6 more)

### Community 34 - "react"
Cohesion: 0.20
Nodes (6): Props, Props, DateInputDMYProps, qrcode@^1.5.4, qrcode, react

### Community 35 - "Tone & Voice"
Cohesion: 0.05
Nodes (38): Actorless Passive, All-Caps Emphasis, antislop-copywriting, Aphorism Formulas, Boldface Overuse, Chatbot Closers, Copywriting Skill Checklist, Draft, audit, final (+30 more)

### Community 36 - "📸 RUANGTEMU Virtual Photobooth & Event Management Platform"
Cohesion: 0.06
Nodes (32): 1. `database/mysql_schema.sql` (Initial Database Schema), 1. Mobile-First Virtual Photobooth (Tamu), 2. `database/mysql_seed.sql` (Seed Data), 2. Manajemen Multi-Event & Isolasi Data, 3. Galeri Acara & Mode Proyeksi Venue (Live Projection), 4. Landing Page Komersial & Live UI Editor, 5. Dual Database Support (MySQL & Supabase), 6. Sistem Pemeliharaan (Maintenance Mode) (+24 more)

### Community 37 - "antislop-layoutmobile"
Cohesion: 0.05
Nodes (38): 100vh Sections, antislop-layoutmobile, Bottom Nav That Eats Content, Breakpoint Driven by Device List, Breakpoints, Columns That Don't Collapse, Desktop-Only Layout, Desktop-Sized Everything (+30 more)

### Community 39 - "RUANGTEMU VIRTUAL PHOTOBOOTH — AUDIT REPORT"
Cohesion: 0.07
Nodes (27): CURRENT ADMIN IMPLEMENTATION, CURRENT ARCHITECTURE, CURRENT AUDIO IMPLEMENTATION, CURRENT AUTHENTICATION, CURRENT CAMERA IMPLEMENTATION, CURRENT DATABASE, CURRENT FRAME RENDERER, CURRENT GALLERY (+19 more)

### Community 40 - "caveman-compress/README.md"
Cohesion: 0.08
Nodes (22): Before / After, Benchmarks, How It Work, <img src="../../docs/assets/dancing-rock.svg" width="20" height="20" alt="rock"/> Caveman (421 tokens), Install, Original (827 tokens), Part of Caveman, Provider / model (+14 more)

### Community 41 - "Rules"
Cohesion: 0.09
Nodes (20): caveman, Example output, How to invoke, See also, What it does, 1. Answer first, 2. Kill ceremony, 3. Short word (+12 more)

### Community 42 - "antislop-human"
Cohesion: 0.10
Nodes (20): antislop-human, Broken Tab Order, Color & Contrast, Color-Only Feedback, Focus & States, How to use this skill, Human Skill Checklist, Keyboard (+12 more)

### Community 43 - "Comments That Add Nothing"
Cohesion: 0.11
Nodes (17): antislop-code, Code Comment Checklist, Comments That Add Nothing, Decorative Emoji, Decorative Separators, Empty Labels, End Markers, How It Should Read (+9 more)

### Community 44 - "Group 1: Hard Gate (absolute, no exceptions)"
Cohesion: 0.11
Nodes (18): Group 1: Hard Gate (absolute, no exceptions), R-02 — Copywriting, R-03 — Mobile Responsiveness, R-17 — Data & Numbers, R-18 — Testimonials, R-23 — Clarification & Visual Assets, R-24 — Navigation, R-25 — Color Contrast (+10 more)

### Community 45 - "Caveman Help"
Cohesion: 0.14
Nodes (12): caveman-help, Example output, How to invoke, See also, What it does, Caveman Help, Configure Default Mode, Deactivate (+4 more)

### Community 46 - "export-zip/route.ts"
Cohesion: 0.16
Nodes (15): dynamic, GET(), revalidate, GET(), cleanFilename(), dynamic, fetchFileBuffer(), GET() (+7 more)

### Community 47 - "admin-charts.tsx"
Cohesion: 0.39
Nodes (7): AdminCharts(), AdminChartsProps, FILTER_LABELS, getWitaHour(), AdminViewProps, Booking, GalleryEntry

### Community 48 - "Group 2: Purpose-Gate (technique allowed, purpose required)"
Cohesion: 0.15
Nodes (13): Group 2: Purpose-Gate (technique allowed, purpose required), R-01 — Color & Gradients, R-04 — Icons, R-06 — Typography, R-07 — Background, R-08 — Button Arrows, R-09 — Badges, R-10 — Glassmorphism (+5 more)

### Community 49 - "Rules"
Cohesion: 0.15
Nodes (12): 1. Classical register, 2. Particles carry structure, 3. Each fact once, 4. Payload in original script, 5. Tool runs, 6. Never perform, Floor, megacave (+4 more)

### Community 50 - "Rules"
Cohesion: 0.15
Nodes (12): 1. Fragments, 2. One word when one word is enough, 3. Each fact once, 4. Cut conjunctions only when order survives, 5. Tool runs, 6. Never perform, Floor, Persistence (+4 more)

### Community 51 - "benchmark.py"
Cohesion: 0.39
Nodes (4): benchmark_pair(), count_tokens(), main(), print_table()

### Community 52 - "HomePage"
Cohesion: 0.38
Nodes (5): HomePage(), frame(), measure(), resize(), target()

### Community 53 - "Decorative Elements"
Cohesion: 0.17
Nodes (12): AI Capsule Badges, Colored Left Stripe, Decorative Elements, Decorative Status Dot, Emoji as Decoration, Eyebrow Badge Above the Headline, Fake Terminal Window, Generic AI Icons (+4 more)

### Community 54 - "Caveman Compress"
Cohesion: 0.17
Nodes (11): Boundaries, Caveman Compress, Compress, Compression Rules, Pattern, Preserve EXACTLY (never modify), Preserve Structure, Process (+3 more)

### Community 55 - "booking-modal.tsx"
Cohesion: 0.18
Nodes (12): BOOKING_PACKAGES, BookingModalProps, BookingServiceCategory, PackageOption, PHOTOBOOTH_PACKAGES, VIRTUAL_PHOTOBOOTH_PACKAGES, COMMON_EVENT_TIMES, parseTo24Hour() (+4 more)

### Community 56 - "next"
Cohesion: 0.13
Nodes (4): AlbumPageProps, config, nextConfig, next

### Community 57 - "antislop-ui"
Cohesion: 0.18
Nodes (10): antislop-ui, Dead Navigation, Endless Pulses and Loops, How to use this skill, Motion, Non-Functional Controls, Sections That Fill a Template, Structural & Flow (+2 more)

### Community 58 - "Layout & Components"
Cohesion: 0.18
Nodes (11): 4-Column Template Footer, Bento Grid, Copy-Paste Feature Cards, Demo Without a Product, "How It Works" Always 3 Steps, Layout & Components, Monotonous Template Layout, "Most Popular" Pricing Card (+3 more)

### Community 59 - "Visual & Color"
Cohesion: 0.18
Nodes (11): Background Grid, Dark Mode Default for No Reason, Excessive Accent Color, Excessive Border Radius, Excessive Glassmorphism, Generic Blue-Purple Gradient, Glow Everywhere, Overly Soft Shadows (+3 more)

### Community 60 - "caveman-commit"
Cohesion: 0.18
Nodes (9): caveman-commit, Example output, How to invoke, See also, What it does, Auto-Clarity, Boundaries, Examples (+1 more)

### Community 61 - "caveman-review"
Cohesion: 0.18
Nodes (9): caveman-review, Example output, How to invoke, See also, What it does, Auto-Clarity, Boundaries, Examples (+1 more)

### Community 63 - "Group 3: Quality Locks (consistency)"
Cohesion: 0.20
Nodes (10): Group 3: Quality Locks (consistency), R-05 — Layout & Page Structure, R-11 — Border Radius, R-15 — CTA (Call to Action), R-16 — Copywriting & Buzzwords, R-20 — Visual Identity, R-21 — Dark Mode, R-29 — Color Palette (+2 more)

### Community 64 - "Playwright E2E Testing Skill"
Cohesion: 0.50
Nodes (3): Mobile-First Testing Principles (Per AGENTS.md), Playwright E2E Testing Skill, Project Commands

### Community 65 - "packages/route.ts"
Cohesion: 0.29
Nodes (10): dynamic, GET(), PATCH(), revalidate, getPackageBySlug(), getPackages(), mapPackageRow(), toggleEntryApproval() (+2 more)

### Community 66 - "admin/page.tsx"
Cohesion: 0.18
Nodes (12): AdminPage(), dynamic, metadata, revalidate, dynamic, GET(), getEventPrice(), revalidate (+4 more)

### Community 67 - "antislop"
Cohesion: 0.25
Nodes (7): antislop, Core Principle, First-Run Install Wizard, Functional Patterns, Part 2: Mandatory Rules (R-01 to R-38, grouped), Two Usage Modes, What This Is (and What It Isn't)

### Community 68 - "Part 1: AI Slop Patterns (Warning Signs)"
Cohesion: 0.25
Nodes (8): Accessibility, Copywriting & Content, Decorative Elements, Functionality & Content, Identity & Originality, Layout & Components, Part 1: AI Slop Patterns (Warning Signs), Visual & Color

### Community 69 - "App & Dashboard"
Cohesion: 0.25
Nodes (8): App & Dashboard, Charts Without a Question, Default Dashboard Shell, Filler Activity Feed, Filler Data in Fields and Columns, Generic Table Columns, Placeholder Empty and Loading States, Stat Cards With Invented Numbers

### Community 70 - "Review Caveman evidence"
Cohesion: 0.25
Nodes (7): Hard rules, Review Caveman evidence, Step 1 — Load context, Step 2 — Establish baseline, Step 3 — Test the leading explanation with traces, Step 4 — Inspect representative traces, Step 5 — Report

### Community 71 - "Manage eval-gated experiments"
Cohesion: 0.25
Nodes (7): Manage eval-gated experiments, Non-negotiable gates, Step 1 — Load project and experiment, Step 2 — Evaluate evidence, Step 3 — Propose one action, Step 4 — Block unsafe execution, Step 5 — Re-read after external operator action

### Community 72 - "caveman-setup/SKILL.md"
Cohesion: 0.25
Nodes (7): Failure templates (use verbatim, filled in — never soften), Rules (non-negotiable), Step 1 — Find every live LLM callsite, Step 2 — Pick the app slug, Step 3 — Wire each callsite, Step 4 — Verify with one real request, Step 5 — Report

### Community 73 - "Evaluate an optimization observation"
Cohesion: 0.29
Nodes (6): 1. Read the exact observations, 2. Ask the operator to choose, 3. Design a candidate and paired eval, 4. Apply only the approved candidate, 5. Report observations, not savings, Evaluate an optimization observation

### Community 74 - "caveman-stats"
Cohesion: 0.29
Nodes (5): caveman-stats, Example output, How to invoke, See also, What it does

### Community 75 - "The Craftsmanship Standard"
Cohesion: 0.33
Nodes (6): C-1 — Intentionality, C-2 — Functional Completeness, C-3 — Content-Driven Composition, C-4 — Resilience, C-5 — Evidence Over Claims, The Craftsmanship Standard

### Community 76 - "caveman-discover/SKILL.md"
Cohesion: 0.33
Nodes (5): Step 1 — Inventory the workflows, Step 2 — Name them, Step 3 — Propose, then apply, Step 4 — Verify, Step 5 — Report

### Community 77 - "Delivery Gate (Mandatory)"
Cohesion: 0.40
Nodes (5): Block 1: Hard Gate (absolute), Block 2: Purpose-Gate (technique allowed, reason required), Block 3: Liveliness (required to be alive, not just clean), Block 4: Craftsmanship & Quality Locks, Delivery Gate (Mandatory)

### Community 78 - "skills/caveman-learn — the Caveman Learn editing skill (Apache-2.0, public)"
Cohesion: 0.40
Nodes (4): Boundary (binding), Install path, Layout, skills/caveman-learn — the Caveman Learn editing skill (Apache-2.0, public)

### Community 79 - "caveman-learn skill"
Cohesion: 0.40
Nodes (4): caveman-learn skill, Honesty, Install, What it does

### Community 81 - "Part 3: Liveliness Toolkit"
Cohesion: 0.50
Nodes (4): Design Read (how the dials are set), Levers (how the dials become visual decisions), Part 3: Liveliness Toolkit, Three Dials (required)

### Community 82 - "This is NOT the Next.js you know"
Cohesion: 0.67
Nodes (3): antislop, caveman, This is NOT the Next.js you know

### Community 91 - "canvas-confetti"
Cohesion: 0.33
Nodes (4): canvas-confetti@^1.9.4, @supabase/ssr@^0.12.7, canvas-confetti, @supabase/ssr

## Knowledge Gaps
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `db.ts`, `packages/route.ts`, `admin/page.tsx`, `booking-modal.tsx`, `doku.ts`, `save-frame.ts`, `react`, `layout.tsx`, `admin-view.tsx`, `maintenance.ts`, `virtual-booth.tsx`, `package.json`, `dependencies`, `export-zip/route.ts`, `maintenance/page.tsx`, `app/page.tsx`, `gallery/page.tsx`, `getEventBySlug`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `AdminView()` (e.g. with `handleClickOutside()` and `IconBooking()`) actually correct?**
  _`AdminView()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `db.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `booking-modal.tsx`, `admin-view.tsx`, `antislop-layoutmobile`, `virtual-booth.tsx`, `theme-config.tsx`, `package.json`, `dependencies`, `app/page.tsx`, `maintenance/page.tsx`, `admin-charts.tsx`, `booking-modal.tsx`, `gallery/page.tsx`, `CurvedLoop.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `admin-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09851551956815115 - nodes in this community are weakly interconnected._
- **Should `validate.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11330049261083744 - nodes in this community are weakly interconnected._
- **Should `doku.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09659090909090909 - nodes in this community are weakly interconnected._