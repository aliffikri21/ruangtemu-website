-- RUANGTEMU Virtual Photobooth V3 Migration
-- Safe non-destructive upgrade from 20260919_initial_schema.sql
-- Enables Multi-Event Architecture, 1-3 Frame Assignments, Media Tracking, and Strict RLS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Admin and Operator Accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. UPDATE EVENTS TABLE
-- Ensure all V3 columns exist on the events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gallery_visibility TEXT DEFAULT 'PUBLIC' CHECK (gallery_visibility IN ('PUBLIC', 'PRIVATE'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Backfill client_name and event_name from existing columns if available
UPDATE public.events SET client_name = host_name WHERE client_name IS NULL AND host_name IS NOT NULL;
UPDATE public.events SET event_name = title WHERE event_name IS NULL AND title IS NOT NULL;

-- 3. FRAMES TABLE (Reusable frame catalog)
CREATE TABLE IF NOT EXISTS public.frames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('strip_3', 'grid_4', 'polaroid', 'deluxe')),
    preview_url TEXT,
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. EVENT_FRAMES TABLE (Junction: 1-3 frames assigned per event)
CREATE TABLE IF NOT EXISTS public.event_frames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    frame_id UUID NOT NULL REFERENCES public.frames(id) ON DELETE RESTRICT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_event_frame UNIQUE (event_id, frame_id)
);

-- 5. UPDATE ENTRIES TABLE
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'APPROVED' CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'));
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS client_submission_id TEXT;
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 6. MEDIA_ASSETS TABLE (Tracks files in Supabase Storage)
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'audio', 'frame_overlay')),
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_event_frames_event_id ON public.event_frames(event_id);
CREATE INDEX IF NOT EXISTS idx_event_frames_frame_id ON public.event_frames(frame_id);
CREATE INDEX IF NOT EXISTS idx_entries_event_id ON public.entries(event_id);
CREATE INDEX IF NOT EXISTS idx_entries_moderation ON public.entries(moderation_status);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON public.entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_event_id ON public.media_assets(event_id);

-- 8. SEED DEFAULT FRAMES CATALOG (Baseline Templates)
INSERT INTO public.frames (id, name, slug, template_type, config_json, is_active)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Classic Photo Strip (3 Foto)',
        'strip-3-classic',
        'strip_3',
        '{"backgroundColor": "#0f172a", "borderColor": "#38bdf8", "fontFamily": "serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "💍"}'::jsonb,
        true
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Modern Grid Kolase (4 Foto)',
        'grid-4-modern',
        'grid_4',
        '{"backgroundColor": "#18181b", "borderColor": "#a855f7", "fontFamily": "sans-serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "✨"}'::jsonb,
        true
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Vintage Polaroid (1 Foto)',
        'polaroid-vintage',
        'polaroid',
        '{"backgroundColor": "#fafaf9", "borderColor": "#e7e5e4", "fontFamily": "handwriting", "textColor": "#1c1917", "padding": 20, "borderRadius": 4, "sticker": "📸"}'::jsonb,
        true
    ),
    (
        '10000000-0000-0000-0000-000000000004',
        'Deluxe Dual Portrait (2 Foto)',
        'deluxe-portrait',
        'deluxe',
        '{"backgroundColor": "#020617", "borderColor": "#f59e0b", "fontFamily": "serif", "textColor": "#f8fafc", "padding": 18, "borderRadius": 8, "sticker": "✦"}'::jsonb,
        true
    )
ON CONFLICT (slug) DO NOTHING;

-- 9. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- 10. RLS POLICIES
DROP POLICY IF EXISTS "Public can view active events" ON public.events;
CREATE POLICY "Public can view active events" ON public.events
    FOR SELECT USING (is_active = true AND (status IS NULL OR status != 'DRAFT'));

DROP POLICY IF EXISTS "Public can view active frames" ON public.frames;
CREATE POLICY "Public can view active frames" ON public.frames
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view event frames" ON public.event_frames;
CREATE POLICY "Public can view event frames" ON public.event_frames
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view approved entries" ON public.entries;
CREATE POLICY "Public can view approved entries" ON public.entries
    FOR SELECT USING (is_published = true AND (moderation_status IS NULL OR moderation_status = 'APPROVED'));

DROP POLICY IF EXISTS "Guests can insert entries" ON public.entries;
CREATE POLICY "Guests can insert entries" ON public.entries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = entries.event_id
            AND events.is_active = true
        )
    );
