-- Seed Data for RUANGTEMU PHOTOBOOTH (Palopo, Sulawesi Selatan)

INSERT INTO public.packages (id, slug, name, tagline, price, duration_hours, features, popular, category, prints_included, backdrop)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'paket-basic',
    'Paket Basic Photobooth',
    'Pilihan hemat untuk perayaan intim dan ulang tahun di Palopo',
    1800000,
    2,
    '["2 Jam Layanan Aktif", "Unlimited Print 4R / 2-Strip", "Custom Template Frame Sesuai Tema", "Standard Fun Props & Aksesoris", "Download Semua Foto via Cloud Storage", "1 Operator & 1 Asisten Standby"]'::jsonb,
    false,
    'physical',
    'Unlimited High Speed DNP Print',
    'Standard Sequin / Fabric'
),
(
    '22222222-2222-2222-2222-222222222222',
    'paket-standard-deluxe',
    'Paket Standard Deluxe',
    'Paket terfavorit untuk resepsi pernikahan & wisuda di Palopo',
    2500000,
    3,
    '["3 Jam Layanan Penuh", "Unlimited Strip / 4R Glossy Prints", "Custom Frame Eksklusif dengan Logo Event", "Premium Props & Kacamata Unik", "Live Digital Gallery & QR Download", "2 Kru Profesional RUANGTEMU", "Free 1 Album Foto Kenangan"]'::jsonb,
    true,
    'physical',
    'Unlimited Thermal Photo Print',
    'Pilihan 5+ Premium Backdrop'
),
(
    '33333333-3333-3333-3333-333333333333',
    'paket-virtual-photobooth',
    'Paket Virtual & Web Photobooth',
    'Photobooth digital interaktif langsung dari smartphone tamu',
    2200000,
    12,
    '["Akses Web Photobooth Tanpa Install Aplikasi", "Frame Custom Digital (Strip, Grid, Polaroid)", "Guestbook Digital + Rekam Voice Note Audio Ucapan", "Live Projection Mode untuk LED Videotron Venue", "QR Code Table Standee Siap Cetak", "Dashboard Moderasi & Analytics Event"]'::jsonb,
    false,
    'virtual',
    'Digital Ultra HD Download + Cloud Archive',
    'Virtual Digital Frame'
),
(
    '44444444-4444-4444-4444-444444444444',
    'paket-platinum-hybrid',
    'Paket Platinum All-in Hybrid',
    'Solusi photobooth terlengkap: cetak fisik + platform digital interaktif',
    3800000,
    4,
    '["4 Jam Fisik Photobooth + 24 Jam Virtual Web Photobooth", "Unlimited Cetak Fisik + Live Projection Screen di Panggung", "Custom Wooden/Acrylic Table Standees", "Rekaman Voice Notes & Foto Ucapan Tamu", "Exclusive Guestbook Album Hardcover", "VIP Customer Support & Tim Khusus RUANGTEMU"]'::jsonb,
    true,
    'hybrid',
    'Unlimited Cetak Fisik + Digital Cloud',
    'Custom Printed or Luxury Backdrop'
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Demo Events in Palopo
INSERT INTO public.events (id, slug, title, host_name, event_type, date, venue, city, description, cover_image, is_active, allow_guestbook, allow_voice_note, allow_custom_frame, default_frame_config)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'wedding-andi-sarah',
    'The Wedding of Andi & Sarah',
    'Andi Pratama & Sarah Wijaya',
    'wedding',
    '2026-10-15',
    'Banua Subur Convention Hall',
    'Palopo',
    'Selamat datang di perayaan hari bahagia kami. Abadikan momen terbaik Anda dan tinggalkan ucapan berkesan di RUANGTEMU photobooth kami!',
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    true,
    true,
    true,
    true,
    '{"type": "strip_3", "backgroundColor": "#0f172a", "borderColor": "#38bdf8", "textContent": "Andi & Sarah", "subTextContent": "15 Oktober 2026 • Palopo", "fontFamily": "serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "💍"}'::jsonb
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'palopo-creative-fest-2026',
    'Palopo Youth Creative Festival 2026',
    'Komunitas Kreatif Palopo',
    'gathering',
    '2026-11-20',
    'Gedung Kesenian Palopo',
    'Palopo',
    'Rayakan karya dan kreativitas anak muda Tana Luwu bersama RUANGTEMU Digital!',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    true,
    true,
    true,
    true,
    '{"type": "grid_4", "backgroundColor": "#18181b", "borderColor": "#a855f7", "textContent": "Palopo Creative Fest", "subTextContent": "#MudaKreatifPalopo", "fontFamily": "sans-serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "✨"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
