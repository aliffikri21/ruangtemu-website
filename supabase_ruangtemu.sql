-- ==============================================================================
-- RUANGTEMU VIRTUAL PHOTOBOOTH - SUPABASE POSTGRESQL SCHEMA & SEED
-- Migrated from ruangtemu.sql (MySQL MariaDB) for Supabase & Vercel Deployment
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PACKAGES TABLE
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 2. EVENTS TABLE
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. FRAMES TABLE
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 4. EVENT_FRAMES TABLE (Junction: Frames assigned to Event)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_frames (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    frame_id TEXT NOT NULL REFERENCES public.frames(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_event_frame UNIQUE (event_id, frame_id)
);

-- ------------------------------------------------------------------------------
-- 5. BOOKINGS TABLE
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. ENTRIES TABLE (Guest Photobooth captures & Guestbook)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 7. MEDIA_ASSETS TABLE
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 8. INDEXES FOR HIGH QUERY PERFORMANCE
-- ------------------------------------------------------------------------------
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
CREATE INDEX IF NOT EXISTS idx_bookings_package ON public.bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_media_event ON public.media_assets(event_id);
CREATE INDEX IF NOT EXISTS idx_media_entry ON public.media_assets(entry_id);

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public read frames" ON public.frames FOR SELECT USING (true);
CREATE POLICY "Public read event_frames" ON public.event_frames FOR SELECT USING (true);
CREATE POLICY "Public read approved entries" ON public.entries FOR SELECT USING (true);

-- Allow public insertion (guests taking photobooth / booking package)
CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert entries" ON public.entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update entries likes" ON public.entries FOR UPDATE USING (true) WITH CHECK (true);

-- Allow full access for backend / admin / service role
CREATE POLICY "Service role full packages" ON public.packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full frames" ON public.frames FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full event_frames" ON public.event_frames FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full entries" ON public.entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full media_assets" ON public.media_assets FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 10. SUPABASE STORAGE BUCKET CONFIGURATION (for Vercel deployment)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('ruangtemu-media', 'ruangtemu-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Public read ruangtemu-media'
    ) THEN
        CREATE POLICY "Public read ruangtemu-media"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'ruangtemu-media');
    END IF;
END $$;

-- Storage public upload policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Public upload ruangtemu-media'
    ) THEN
        CREATE POLICY "Public upload ruangtemu-media"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'ruangtemu-media');
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 11. DATA SEEDING (Exported from ruangtemu.sql)
-- ------------------------------------------------------------------------------

-- Seed Packages
INSERT INTO public.packages (id, slug, name, tagline, price, duration_hours, features, popular, category, prints_included, backdrop, created_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'paket-basic', 'Paket Basic Photobooth', 'Pilihan hemat untuk perayaan intim dan ulang tahun di Palopo', 1800000, 2, '["2 Jam Layanan Aktif", "Unlimited Print 4R / 2-Strip", "Custom Template Frame Sesuai Tema", "Standard Fun Props & Aksesoris", "Download Semua Foto via Cloud Storage", "1 Operator & 1 Asisten Standby"]'::jsonb, false, 'physical', 'Unlimited High Speed DNP Print', 'Standard Sequin / Fabric', '2026-10-02 14:46:55+00'),
('22222222-2222-2222-2222-222222222222', 'paket-standard-deluxe', 'Paket Standard Deluxe', 'Paket terfavorit untuk resepsi pernikahan & wisuda di Palopo', 2500000, 3, '["3 Jam Layanan Penuh", "Unlimited Strip / 4R Glossy Prints", "Custom Frame Eksklusif dengan Logo Event", "Premium Props & Kacamata Unik", "Live Digital Gallery & QR Download", "2 Kru Profesional RUANGTEMU", "Free 1 Album Foto Kenangan"]'::jsonb, true, 'physical', 'Unlimited Thermal Photo Print', 'Pilihan 5+ Premium Backdrop', '2026-10-02 14:46:55+00'),
('33333333-3333-3333-3333-333333333333', 'paket-virtual-photobooth', 'Paket Virtual & Web Photobooth', 'Photobooth digital interaktif langsung dari smartphone tamu', 2200000, 12, '["Akses Web Photobooth Tanpa Install Aplikasi", "Frame Custom Digital (Strip, Grid, Polaroid)", "Guestbook Digital + Rekam Voice Note Audio Ucapan", "Live Projection Mode untuk LED Videotron Venue", "QR Code Table Standee Siap Cetak", "Dashboard Moderasi & Analytics Event"]'::jsonb, false, 'virtual', 'Digital Ultra HD Download + Cloud Archive', 'Virtual Digital Frame', '2026-10-02 14:46:55+00'),
('44444444-4444-4444-4444-444444444444', 'paket-platinum-hybrid', 'Paket Platinum All-in Hybrid', 'Solusi photobooth terlengkap: cetak fisik + platform digital interaktif', 3800000, 4, '["4 Jam Fisik Photobooth + 24 Jam Virtual Web Photobooth", "Unlimited Cetak Fisik + Live Projection Screen di Panggung", "Custom Wooden/Acrylic Table Standees", "Rekaman Voice Notes & Foto Ucapan Tamu", "Exclusive Guestbook Album Hardcover", "VIP Customer Support & Tim Khusus RUANGTEMU"]'::jsonb, true, 'hybrid', 'Unlimited Cetak Fisik + Digital Cloud', 'Custom Printed or Luxury Backdrop', '2026-10-02 14:46:55+00')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    price = EXCLUDED.price,
    duration_hours = EXCLUDED.duration_hours,
    features = EXCLUDED.features,
    popular = EXCLUDED.popular,
    category = EXCLUDED.category,
    prints_included = EXCLUDED.prints_included,
    backdrop = EXCLUDED.backdrop;

-- Seed Bookings
INSERT INTO public.bookings (id, customer_name, customer_email, customer_phone, event_type, event_name, event_date, event_time, location, city, package_id, package_name, status, notes, total_price, created_at)
VALUES
('bkg-00000000-0001', 'Andi Pratama', 'andi.pratama@example.com', '081234567890', 'wedding', 'Resepsi Pernikahan Andi & Sarah', '2026-10-15', '18:30:00', 'Banua Subur Convention Hall, Palopo', 'Palopo', '44444444-4444-4444-4444-444444444444', 'Paket Platinum All-in Hybrid', 'confirmed', 'Mohon backdrop nuansa Navy & Gold', 3800000, '2026-10-02 14:46:55+00'),
('bkg-00000000-0002', 'Rahmat Hidayat', 'rahmat.palopo@example.com', '082188776655', 'corporate', 'Gala Dinner BUMN Palopo', '2026-11-05', '19:00:00', 'Hotel Value Grand Ballroom Palopo', 'Palopo', '22222222-2222-2222-2222-222222222222', 'Paket Standard Deluxe', 'pending', 'Perlu invoice resmi perusahaan', 2500000, '2026-10-02 14:46:55+00')
ON CONFLICT (id) DO NOTHING;

-- Seed Frames
INSERT INTO public.frames (id, name, slug, template_type, preview_url, config_json, is_active, created_at, updated_at)
VALUES
('10000000-0000-0000-0000-000000000001', 'Classic Photo Strip (3 Foto)', 'strip-3-classic', 'strip_3', NULL, '{"backgroundColor": "#0f172a", "borderColor": "#38bdf8", "fontFamily": "serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "💍"}'::jsonb, true, '2026-10-02 14:46:55+00', '2026-10-02 14:46:55+00'),
('10000000-0000-0000-0000-000000000002', 'Modern Grid Kolase (4 Foto)', 'grid-4-modern', 'grid_4', NULL, '{"backgroundColor": "#18181b", "borderColor": "#a855f7", "fontFamily": "sans-serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "✨"}'::jsonb, true, '2026-10-02 14:46:55+00', '2026-10-02 14:46:55+00'),
('10000000-0000-0000-0000-000000000003', 'Vintage Polaroid (1 Foto)', 'polaroid-vintage', 'polaroid', NULL, '{"backgroundColor": "#fafaf9", "borderColor": "#e7e5e4", "fontFamily": "handwriting", "textColor": "#1c1917", "padding": 20, "borderRadius": 4, "sticker": "📸"}'::jsonb, true, '2026-10-02 14:46:55+00', '2026-10-02 14:46:55+00'),
('10000000-0000-0000-0000-000000000004', 'Deluxe Dual Portrait (2 Foto)', 'deluxe-portrait', 'deluxe', NULL, '{"backgroundColor": "#020617", "borderColor": "#f59e0b", "fontFamily": "serif", "textColor": "#f8fafc", "padding": 18, "borderRadius": 8, "sticker": "✦"}'::jsonb, true, '2026-10-02 14:46:55+00', '2026-10-02 14:46:55+00'),
('frm-1790954724055-0', 'Classic Floral Strip', 'frame-1-1790954724055', 'strip_3', '/frames/frame-strip-floral.png', '{"type":"strip_3","backgroundColor":"#0f172a","borderColor":"#e7e5e4","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":8,"customOverlayUrl":"/frames/frame-strip-floral.png","textContent":"Test Host","subTextContent":"2026-11-01 • Test VenueTest Venue, Palopo"}'::jsonb, true, '2026-10-02 23:25:24+00', '2026-10-02 23:25:24+00'),
('frm-1790954724055-1', 'Midnight Navy Gold', 'frame-2-1790954724055', 'strip_3', '/frames/frame-strip-navy-gold.png', '{"type":"strip_3","backgroundColor":"#0f172a","borderColor":"#e7e5e4","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":8,"customOverlayUrl":"/frames/frame-strip-navy-gold.png","textContent":"Test Host","subTextContent":"2026-11-01 • Test VenueTest Venue, Palopo"}'::jsonb, true, '2026-10-02 23:25:24+00', '2026-10-02 23:25:24+00'),
('frm-1790956240633-0', 'Classic Floral Strip', 'frame-1-1790956240633', 'strip_3', '/frames/frame-strip-floral.png', '{"type":"strip_3","backgroundColor":"#0f172a","borderColor":"#e7e5e4","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":8,"customOverlayUrl":"/frames/frame-strip-floral.png","textContent":"Afdal & Sukma","subTextContent":"2027-01-02 • Aula Polidewa LT 4, Palopo"}'::jsonb, true, '2026-10-02 23:50:41+00', '2026-10-02 23:50:41+00'),
('frm-1790974115027-0', 'nuruliqra-6x', 'nuruliqra-6x', 'custom', '/uploads/frames/nurul-iqra-frame.png', '{"type":"custom","backgroundColor":"#0f172a","borderColor":"#e7e5e4","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":8,"textContent":"Nurul & Iqra","subTextContent":"2026-09-28 • Palopo, Palopo","customOverlayUrl":"/uploads/frames/nurul-iqra-frame.png","photoSlots":[{"x":23,"y":214,"width":296,"height":192},{"x":365,"y":214,"width":296,"height":192},{"x":23,"y":451,"width":296,"height":192},{"x":365,"y":451,"width":296,"height":192},{"x":23,"y":690,"width":296,"height":193},{"x":365,"y":690,"width":296,"height":193}],"photoCount":6,"frameImageWidth":682,"frameImageHeight":1024}'::jsonb, true, '2026-10-03 04:48:36+00', '2026-10-03 19:17:46+00'),
('frm-1791022338480-1', 'nuruliqra-1x', 'nuruliqra-1x', 'custom', '/uploads/frames/frame-2132-png-1791022331777-f23f6cd2.png', '{"type":"custom","backgroundColor":"#0f172a","borderColor":"#e7e5e4","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":8,"textContent":"Nurul & Iqra","subTextContent":"2026-09-28 • Palopo, Palopo","customOverlayUrl":"/uploads/frames/frame-2132-png-1791022331777-f23f6cd2.png","photoSlots":[{"x":203,"y":1485,"width":3193,"height":3517}],"photoCount":1,"frameImageWidth":3600,"frameImageHeight":5400}'::jsonb, true, '2026-10-03 18:12:18+00', '2026-10-03 19:17:46+00'),
('frm-1791026266059-2', 'nuruliqra-2x', 'nuruliqra-2x', 'custom', '/uploads/frames/frame-214-png-1791026259900-c2128a26.png', '{"type":"custom","backgroundColor":"#0f172a","borderColor":"#e7e5e4","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":8,"textContent":"Nurul & Iqra","subTextContent":"2026-09-28 • Palopo, Palopo","customOverlayUrl":"/uploads/frames/frame-214-png-1791026259900-c2128a26.png","photoSlots":[{"x":203,"y":1485,"width":3193,"height":1681},{"x":203,"y":3287,"width":3193,"height":1681}],"photoCount":2,"frameImageWidth":3600,"frameImageHeight":5400}'::jsonb, true, '2026-10-03 19:17:46+00', '2026-10-03 19:17:46+00'),
('test-frame-1', 'Frame 1: Floral White (PNG)', 'frame-1-1790929718137', 'strip_3', '/frames/frame-strip-floral.png', '{"type":"strip_3","backgroundColor":"#0f172a","borderColor":"#ffffff","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":12,"customOverlayUrl":"/frames/frame-strip-floral.png"}'::jsonb, true, '2026-10-02 16:28:38+00', '2026-10-02 16:28:38+00'),
('test-frame-2', 'Frame 2: Midnight Gold (PNG)', 'frame-2-1790929718137', 'strip_3', '/frames/frame-strip-navy-gold.png', '{"type":"strip_3","backgroundColor":"#0f172a","borderColor":"#ffffff","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":12,"customOverlayUrl":"/frames/frame-strip-navy-gold.png"}'::jsonb, true, '2026-10-02 16:28:38+00', '2026-10-02 16:28:38+00')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    template_type = EXCLUDED.template_type,
    preview_url = EXCLUDED.preview_url,
    config_json = EXCLUDED.config_json,
    is_active = EXCLUDED.is_active;

-- Seed Events
INSERT INTO public.events (id, slug, title, host_name, client_name, event_name, event_type, date, venue, city, description, cover_image, cover_image_url, status, is_active, allow_guestbook, allow_voice_note, allow_custom_frame, gallery_visibility, default_frame_config, created_at, updated_at)
VALUES
('168eaa11-aecc-4658-a74b-f3714fa68228', 'wedding-bombom', 'Wedding Bombom & ZZ', 'Bombom & Z', 'Bombom & Z', 'Wedding Bombom & ZZ', 'wedding', '2027-01-02', 'Gedung BRC', 'Palopo', '', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', true, true, true, true, 'PUBLIC', '{"type":"strip_3","backgroundColor":"#18181b","borderColor":"#e7e5e4","textContent":"Bombom & Z","subTextContent":"2027-01-02 • Gedung BRC, Palopo","fontFamily":"sans","textColor":"#ffffff","padding":16,"borderRadius":0,"sticker":"✦"}'::jsonb, '2026-10-02 14:49:04+00', '2026-10-02 14:49:04+00'),
('1d93af26-b3ce-4236-b49e-4f8a694e1ab2', 'wedding-fahmy', 'Wedding Fahmi & Pasangan', 'Fahmi & Pasangan', 'Fahmi & Pasangan', 'Wedding Fahmi & Pasangan', 'wedding', '2027-09-01', 'Gedung SCC', 'Palopo', '', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', true, true, true, true, 'PUBLIC', '{"type":"strip_3","backgroundColor":"#18181b","borderColor":"#e7e5e4","textContent":"Fahmi & Pasangan","subTextContent":"2027-09-01 • Gedung SCC, Palopo","fontFamily":"sans","textColor":"#ffffff","padding":16,"borderRadius":0,"sticker":"✦"}'::jsonb, '2026-10-02 14:49:53+00', '2026-10-02 14:49:53+00'),
('30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'The Wedding of Nurul & Iqra', 'Nurul & Iqra', 'Nurul & Iqra', 'The Wedding of Nurul & Iqra', 'wedding', '2026-09-28', 'Palopo', 'Palopo', '', '/images/events/nurul-iqra-real.jpg', '/images/events/nurul-iqra-real.jpg', 'ACTIVE', true, true, true, true, 'PUBLIC', '{"type":"custom","backgroundColor":"#0f172a","borderColor":"#e7e5e4","textContent":"Nurul & Iqra","subTextContent":"2026-09-28 • Palopo, Palopo","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":8,"customOverlayUrl":"/uploads/frames/nurul-iqra-frame.png","photoSlots":[{"x":23,"y":214,"width":296,"height":192},{"x":365,"y":214,"width":296,"height":192},{"x":23,"y":451,"width":296,"height":192},{"x":365,"y":451,"width":296,"height":192},{"x":23,"y":690,"width":296,"height":193},{"x":365,"y":690,"width":296,"height":193}],"photoCount":6,"frameImageWidth":682,"frameImageHeight":1024}'::jsonb, '2026-10-03 04:48:36+00', '2026-10-03 21:15:58+00'),
('a659a0c1-fcc5-4dfc-a7e7-56c6aa844c5d', 'wedding-afdal-sukma', 'Wedding Afdal & Sukma', 'Afdal & Sukma', 'Afdal & Sukma', 'Wedding Afdal & Sukma', 'wedding', '2027-01-02', 'Aula Polidewa LT 4', 'Palopo', '', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', true, true, true, true, 'PUBLIC', '{"type":"strip_3","backgroundColor":"#0f172a","borderColor":"#e7e5e4","fontFamily":"serif","textColor":"#ffffff","padding":16,"borderRadius":8,"customOverlayUrl":"/frames/frame-strip-floral.png","textContent":"Afdal & Sukma","subTextContent":"2027-01-02 • Aula Polidewa LT 4, Palopo"}'::jsonb, '2026-10-02 23:50:41+00', '2026-10-02 23:50:41+00'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'wedding-andi-sarah', 'The Wedding of Andi & Sarah', 'Andi Pratama & Sarah Wijaya', 'Andi Pratama & Sarah Wijaya', 'The Wedding of Andi & Sarah', 'wedding', '2026-10-15', 'Banua Subur Convention Hall', 'Palopo', 'Selamat datang di perayaan hari bahagia kami. Abadikan momen terbaik Anda dan tinggalkan ucapan berkesan di RUANGTEMU photobooth kami!', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', NULL, 'COMPLETED', false, true, true, true, 'PUBLIC', '{"type": "strip_3", "backgroundColor": "#0f172a", "borderColor": "#38bdf8", "textContent": "Andi & Sarah", "subTextContent": "15 Oktober 2026 • Palopo", "fontFamily": "serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "💍"}'::jsonb, '2026-10-02 14:46:55+00', '2026-10-04 02:05:14+00'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'palopo-creative-fest-2026', 'Palopo Youth Creative Festival 2026', 'Komunitas Kreatif Palopo', 'Komunitas Kreatif Palopo', 'Palopo Youth Creative Festival 2026', 'gathering', '2026-11-20', 'Gedung Kesenian Palopo', 'Palopo', 'Rayakan karya dan kreativitas anak muda Tana Luwu bersama RUANGTEMU Digital!', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop', NULL, 'COMPLETED', false, true, true, true, 'PUBLIC', '{"type": "grid_4", "backgroundColor": "#18181b", "borderColor": "#a855f7", "textContent": "Palopo Creative Fest", "subTextContent": "#MudaKreatifPalopo", "fontFamily": "sans-serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "✨"}'::jsonb, '2026-10-02 14:46:55+00', '2026-10-04 02:09:08+00')
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    host_name = EXCLUDED.host_name,
    client_name = EXCLUDED.client_name,
    event_name = EXCLUDED.event_name,
    event_type = EXCLUDED.event_type,
    date = EXCLUDED.date,
    venue = EXCLUDED.venue,
    city = EXCLUDED.city,
    description = EXCLUDED.description,
    cover_image = EXCLUDED.cover_image,
    cover_image_url = EXCLUDED.cover_image_url,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    allow_guestbook = EXCLUDED.allow_guestbook,
    allow_voice_note = EXCLUDED.allow_voice_note,
    allow_custom_frame = EXCLUDED.allow_custom_frame,
    gallery_visibility = EXCLUDED.gallery_visibility,
    default_frame_config = EXCLUDED.default_frame_config;

-- Seed Event Frames Junction
INSERT INTO public.event_frames (id, event_id, frame_id, sort_order, created_at)
VALUES
('bc591cc8-4ea0-42bc-8078-c147fc3dfdae', 'a659a0c1-fcc5-4dfc-a7e7-56c6aa844c5d', 'frm-1790956240633-0', 1, '2026-10-02 23:50:41+00'),
('e8fd4d8e-59da-4b00-b925-81a4498b9ab2', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'frm-1791026266059-2', 3, '2026-10-03 19:17:46+00'),
('f3b6b381-458f-4a29-83cf-11444bbcfcea', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'frm-1790974115027-0', 1, '2026-10-03 19:17:46+00'),
('f7409745-03e2-44a8-ab9a-f0f0f9852e95', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'frm-1791022338480-1', 2, '2026-10-03 19:17:46+00')
ON CONFLICT (id) DO UPDATE SET
    event_id = EXCLUDED.event_id,
    frame_id = EXCLUDED.frame_id,
    sort_order = EXCLUDED.sort_order;

-- Seed Entries
INSERT INTO public.entries (id, event_id, event_slug, guest_name, photo_url, voice_note_url, message, filter_used, likes_count, is_approved, moderation_status, is_published, client_submission_id, created_at, updated_at)
VALUES
('014d9e4e-f941-4234-b167-3dd53194c0a1', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'aaa', '/uploads/entries/iqranurul-wedding-photo-1791026313516-24d9e070.png', NULL, 'lorem ipsum dolor sit amet\n', 'sepia', 0, true, 'APPROVED', true, NULL, '2026-10-03 19:18:33+00', '2026-10-03 19:18:33+00'),
('0e13d642-86d5-40d5-9990-ee74fed9f009', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'bombom', '/uploads/entries/iqranurul-wedding-photo-1791034562895-5acd6e79.png', NULL, 'loerm\n', 'warm-vintage', 0, true, 'APPROVED', true, NULL, '2026-10-03 21:36:02+00', '2026-10-03 21:36:02+00'),
('289be70e-e68f-4caf-9372-e78ae5f7d539', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'sss', '/uploads/entries/iqranurul-wedding-photo-1791053075620-592f3d9e.png', NULL, 'aa', 'normal', 0, true, 'APPROVED', true, NULL, '2026-10-04 02:44:35+00', '2026-10-04 02:44:35+00'),
('2e1f616c-9c65-4174-80e8-67407d919a88', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'b', '/uploads/entries/iqranurul-wedding-photo-1791026043448-a6601a27.png', '/uploads/audio/iqranurul-wedding-audio-1791026043465-24dbe190.webm', 'lllll', 'sepia', 0, true, 'APPROVED', true, NULL, '2026-10-03 19:14:03+00', '2026-10-03 19:14:03+00'),
('5cfcb14f-b6ff-48e4-8ece-b75950a4d8e6', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'bom', '/uploads/entries/iqranurul-wedding-photo-1791022597706-7b713b93.png', NULL, 'lorem ipsum dolor sit amet\n', 'normal', 0, true, 'APPROVED', true, NULL, '2026-10-03 18:16:37+00', '2026-10-03 18:16:37+00'),
('5f851954-68a5-4c3c-8f37-dd1d7d1613da', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'pino', '/uploads/entries/iqranurul-wedding-photo-1791037982013-ff57d931.png', '/uploads/audio/iqranurul-wedding-audio-1791037982025-46b3e6ff.webm', 'kata kata hari ini', 'sepia', 0, true, 'APPROVED', true, NULL, '2026-10-03 22:33:02+00', '2026-10-03 22:33:02+00'),
('9f7d5304-9904-4272-98c3-22b6e0e3c96c', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'Bombom', '/uploads/entries/iqranurul-wedding-photo-1791024710847-fa452b24.png', NULL, NULL, 'soft-glow', 0, true, 'APPROVED', true, NULL, '2026-10-03 18:51:50+00', '2026-10-03 18:51:50+00'),
('bcb8487b-019a-442b-8426-54a52224f110', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'aa', '/uploads/entries/iqranurul-wedding-photo-1791035967729-6e6ef4ad.png', NULL, NULL, 'grayscale', 0, true, 'APPROVED', true, NULL, '2026-10-03 21:59:27+00', '2026-10-03 21:59:27+00'),
('e2d557b9-02cd-484b-9a33-e05b9fa8b46b', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'bombom2', '/uploads/entries/iqranurul-wedding-photo-1791036374489-07cac5db.png', '/uploads/audio/iqranurul-wedding-audio-1791036374504-0f132045.webm', 'lorem ipsum dolor sit amet', 'sepia', 0, true, 'APPROVED', true, NULL, '2026-10-03 22:06:14+00', '2026-10-03 22:06:14+00'),
('fc396288-540f-4c17-adcb-c4e2f1fd88b2', '30b2edf8-aa12-43a1-b47c-11fbb607ed0a', 'iqranurul-wedding', 'p', '/uploads/entries/iqranurul-wedding-photo-1791026140074-2f649bb7.png', NULL, 'lllllll\n', 'sepia', 0, true, 'APPROVED', true, NULL, '2026-10-03 19:15:40+00', '2026-10-03 19:15:40+00')
ON CONFLICT (id) DO UPDATE SET
    photo_url = EXCLUDED.photo_url,
    voice_note_url = EXCLUDED.voice_note_url,
    message = EXCLUDED.message,
    filter_used = EXCLUDED.filter_used,
    likes_count = EXCLUDED.likes_count,
    is_approved = EXCLUDED.is_approved,
    moderation_status = EXCLUDED.moderation_status,
    is_published = EXCLUDED.is_published;
