-- ================================================================
-- RUANGTEMU VIRTUAL PHOTOBOOTH - MySQL Seed Data
-- Import SETELAH mysql_schema.sql berhasil dijalankan
-- ================================================================

USE `ruangtemu`;

-- ────────────────────────────────────────────────────────────
-- PACKAGES
-- ────────────────────────────────────────────────────────────
INSERT IGNORE INTO `packages` (`id`, `slug`, `name`, `tagline`, `price`, `duration_hours`, `features`, `popular`, `category`, `prints_included`, `backdrop`)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'paket-basic',
    'Paket Basic Photobooth',
    'Pilihan hemat untuk perayaan intim dan ulang tahun di Palopo',
    1800000,
    2,
    '["2 Jam Layanan Aktif", "Unlimited Print 4R / 2-Strip", "Custom Template Frame Sesuai Tema", "Standard Fun Props & Aksesoris", "Download Semua Foto via Cloud Storage", "1 Operator & 1 Asisten Standby"]',
    0,
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
    '["3 Jam Layanan Penuh", "Unlimited Strip / 4R Glossy Prints", "Custom Frame Eksklusif dengan Logo Event", "Premium Props & Kacamata Unik", "Live Digital Gallery & QR Download", "2 Kru Profesional RUANGTEMU", "Free 1 Album Foto Kenangan"]',
    1,
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
    '["Akses Web Photobooth Tanpa Install Aplikasi", "Frame Custom Digital (Strip, Grid, Polaroid)", "Guestbook Digital + Rekam Voice Note Audio Ucapan", "Live Projection Mode untuk LED Videotron Venue", "QR Code Table Standee Siap Cetak", "Dashboard Moderasi & Analytics Event"]',
    0,
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
    '["4 Jam Fisik Photobooth + 24 Jam Virtual Web Photobooth", "Unlimited Cetak Fisik + Live Projection Screen di Panggung", "Custom Wooden/Acrylic Table Standees", "Rekaman Voice Notes & Foto Ucapan Tamu", "Exclusive Guestbook Album Hardcover", "VIP Customer Support & Tim Khusus RUANGTEMU"]',
    1,
    'hybrid',
    'Unlimited Cetak Fisik + Digital Cloud',
    'Custom Printed or Luxury Backdrop'
);

-- ────────────────────────────────────────────────────────────
-- EVENTS (Demo)
-- ────────────────────────────────────────────────────────────
INSERT IGNORE INTO `events` (`id`, `slug`, `title`, `host_name`, `client_name`, `event_name`, `event_type`, `date`, `venue`, `city`, `description`, `cover_image`, `status`, `is_active`, `allow_guestbook`, `allow_voice_note`, `allow_custom_frame`, `default_frame_config`)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'wedding-andi-sarah',
    'The Wedding of Andi & Sarah',
    'Andi Pratama & Sarah Wijaya',
    'Andi Pratama & Sarah Wijaya',
    'The Wedding of Andi & Sarah',
    'wedding',
    '2026-10-15',
    'Banua Subur Convention Hall',
    'Palopo',
    'Selamat datang di perayaan hari bahagia kami. Abadikan momen terbaik Anda dan tinggalkan ucapan berkesan di RUANGTEMU photobooth kami!',
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    'ACTIVE',
    1,
    1,
    1,
    1,
    '{"type": "strip_3", "backgroundColor": "#0f172a", "borderColor": "#38bdf8", "textContent": "Andi & Sarah", "subTextContent": "15 Oktober 2026 • Palopo", "fontFamily": "serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "💍"}'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'palopo-creative-fest-2026',
    'Palopo Youth Creative Festival 2026',
    'Komunitas Kreatif Palopo',
    'Komunitas Kreatif Palopo',
    'Palopo Youth Creative Festival 2026',
    'gathering',
    '2026-11-20',
    'Gedung Kesenian Palopo',
    'Palopo',
    'Rayakan karya dan kreativitas anak muda Tana Luwu bersama RUANGTEMU Digital!',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    'ACTIVE',
    1,
    1,
    1,
    1,
    '{"type": "grid_4", "backgroundColor": "#18181b", "borderColor": "#a855f7", "textContent": "Palopo Creative Fest", "subTextContent": "#MudaKreatifPalopo", "fontFamily": "sans-serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "✨"}'
);

-- ────────────────────────────────────────────────────────────
-- FRAMES (Template catalog)
-- ────────────────────────────────────────────────────────────
INSERT IGNORE INTO `frames` (`id`, `name`, `slug`, `template_type`, `config_json`, `is_active`)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'Classic Photo Strip (3 Foto)',
    'strip-3-classic',
    'strip_3',
    '{"backgroundColor": "#0f172a", "borderColor": "#38bdf8", "fontFamily": "serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "💍"}',
    1
),
(
    '10000000-0000-0000-0000-000000000002',
    'Modern Grid Kolase (4 Foto)',
    'grid-4-modern',
    'grid_4',
    '{"backgroundColor": "#18181b", "borderColor": "#a855f7", "fontFamily": "sans-serif", "textColor": "#ffffff", "padding": 16, "borderRadius": 12, "sticker": "✨"}',
    1
),
(
    '10000000-0000-0000-0000-000000000003',
    'Vintage Polaroid (1 Foto)',
    'polaroid-vintage',
    'polaroid',
    '{"backgroundColor": "#fafaf9", "borderColor": "#e7e5e4", "fontFamily": "handwriting", "textColor": "#1c1917", "padding": 20, "borderRadius": 4, "sticker": "📸"}',
    1
),
(
    '10000000-0000-0000-0000-000000000004',
    'Deluxe Dual Portrait (2 Foto)',
    'deluxe-portrait',
    'deluxe',
    '{"backgroundColor": "#020617", "borderColor": "#f59e0b", "fontFamily": "serif", "textColor": "#f8fafc", "padding": 18, "borderRadius": 8, "sticker": "✦"}',
    1
);

-- ────────────────────────────────────────────────────────────
-- DEMO BOOKINGS
-- ────────────────────────────────────────────────────────────
INSERT IGNORE INTO `bookings` (`id`, `customer_name`, `customer_email`, `customer_phone`, `event_type`, `event_name`, `event_date`, `event_time`, `location`, `city`, `package_id`, `package_name`, `status`, `notes`, `total_price`)
VALUES
(
    'bkg-00000000-0001',
    'Andi Pratama',
    'andi.pratama@example.com',
    '081234567890',
    'wedding',
    'Resepsi Pernikahan Andi & Sarah',
    '2026-10-15',
    '18:30:00',
    'Banua Subur Convention Hall, Palopo',
    'Palopo',
    '44444444-4444-4444-4444-444444444444',
    'Paket Platinum All-in Hybrid',
    'confirmed',
    'Mohon backdrop nuansa Navy & Gold',
    3800000
),
(
    'bkg-00000000-0002',
    'Rahmat Hidayat',
    'rahmat.palopo@example.com',
    '082188776655',
    'corporate',
    'Gala Dinner BUMN Palopo',
    '2026-11-05',
    '19:00:00',
    'Hotel Value Grand Ballroom Palopo',
    'Palopo',
    '22222222-2222-2222-2222-222222222222',
    'Paket Standard Deluxe',
    'pending',
    'Perlu invoice resmi perusahaan',
    2500000
);
