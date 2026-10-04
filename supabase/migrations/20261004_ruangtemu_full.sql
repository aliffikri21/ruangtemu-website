-- ==============================================================================
-- RUANGTEMU VIRTUAL PHOTOBOOTH - SUPABASE POSTGRESQL FULL SCHEMA & SEED
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    price NUMERIC(12, 0) NOT NULL DEFAULT 0,
    duration_hours INT NOT NULL DEFAULT 3,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    popular BOOLEAN DEFAULT false,
    category TEXT NOT NULL CHECK (category IN ('physical', 'virtual', 'hybrid')),
    prints_included VARCHAR(255),
    backdrop VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug VARCHAR(150) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    host_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    event_name VARCHAR(255),
    event_type VARCHAR(50) NOT NULL DEFAULT 'wedding',
    date DATE NOT NULL,
    venue VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Palopo',
    description TEXT DEFAULT '',
    cover_image TEXT,
    cover_image_url TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    allow_guestbook BOOLEAN NOT NULL DEFAULT true,
    allow_voice_note BOOLEAN NOT NULL DEFAULT true,
    allow_custom_frame BOOLEAN NOT NULL DEFAULT true,
    gallery_visibility TEXT DEFAULT 'PUBLIC' CHECK (gallery_visibility IN ('PUBLIC', 'PRIVATE')),
    default_frame_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.frames (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    template_type VARCHAR(50) NOT NULL DEFAULT 'custom',
    preview_url TEXT,
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.event_frames (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    frame_id TEXT NOT NULL REFERENCES public.frames(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_event_frame UNIQUE (event_id, frame_id)
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Palopo',
    package_id TEXT REFERENCES public.packages(id) ON DELETE SET NULL,
    package_name VARCHAR(255),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    total_price NUMERIC(12, 0) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    event_slug VARCHAR(150),
    guest_name VARCHAR(255) NOT NULL,
    photo_url TEXT NOT NULL,
    voice_note_url TEXT,
    message TEXT,
    filter_used VARCHAR(50) DEFAULT 'normal',
    likes_count INT DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    moderation_status TEXT DEFAULT 'APPROVED' CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN')),
    is_published BOOLEAN DEFAULT true,
    client_submission_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    entry_id TEXT REFERENCES public.entries(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'audio', 'frame_overlay')),
    storage_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_frames_slug ON public.frames(slug);
CREATE INDEX IF NOT EXISTS idx_event_frames_event ON public.event_frames(event_id);
CREATE INDEX IF NOT EXISTS idx_event_frames_frame ON public.event_frames(frame_id);
CREATE INDEX IF NOT EXISTS idx_entries_event ON public.entries(event_id);
CREATE INDEX IF NOT EXISTS idx_entries_event_slug ON public.entries(event_slug);
CREATE INDEX IF NOT EXISTS idx_entries_created ON public.entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public read frames" ON public.frames FOR SELECT USING (true);
CREATE POLICY "Public read event_frames" ON public.event_frames FOR SELECT USING (true);
CREATE POLICY "Public read approved entries" ON public.entries FOR SELECT USING (true);

CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert entries" ON public.entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update entries likes" ON public.entries FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role full packages" ON public.packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full frames" ON public.frames FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full event_frames" ON public.event_frames FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full entries" ON public.entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full media_assets" ON public.media_assets FOR ALL USING (true) WITH CHECK (true);
