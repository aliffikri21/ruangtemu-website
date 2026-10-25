# 📸 RUANGTEMU Virtual Photobooth & Event Management Platform

> **Commercial Multi-Event Virtual Photobooth Platform**  
> Sistem web modern untuk membuat, mengelola, dan menjalankan Virtual Photobooth terisolasi untuk setiap klien dan acara RUANGTEMU PHOTOBOOTH.

**Mitra Industri:** RUANGTEMU PHOTOBOOTH  
**Wilayah Layanan:** Kota Palopo & Tana Luwu, Sulawesi Selatan, Indonesia  
**Instansi:** Independent Project, Program Studi Teknologi Rekayasa Multimedia, Konsentrasi Web Design, Politeknik Dewantara  
**Status:** Development → Production Ready (Pilot Event 2026)  
**Dokumentasi:** Product Specification, Architecture Guide, Database Schema, dan Panduan Pengoperasian

---

## 📑 Daftar Isi

1. [Ringkasan Produk](#-ringkasan-produk)
2. [Fitur Utama & Pembaruan Terkini](#-fitur-utama--pembaruan-terkini)
3. [Arsitektur & Prinsip Multi-Event](#-arsitektur--prinsip-multi-event)
4. [Tech Stack](#-tech-stack)
5. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
6. [Struktur Database & Folder `database/`](#-struktur-database--folder-database)
7. [Panduan Instalasi & Menjalankan Lokal](#-panduan-instalasi--menjalankan-lokal)
8. [Konfigurasi Environment Variables](#-konfigurasi-environment-variables)
9. [Alur Kerja Sistem (Workflow)](#-alur-kerja-sistem-workflow)
10. [Rute Halaman & Endpoint API](#-rute-halaman--endpoint-api)
11. [Mode Pemeliharaan (Maintenance Mode)](#-mode-pemeliharaan-maintenance-mode)
12. [Integrasi Pembayaran (DOKU Gateway)](#-integrasi-pembayaran-doku-gateway)
13. [Hak Akses & Kredensial Default](#-hak-akses--kredensial-default)

---

## 🌟 Ringkasan Produk

**RUANGTEMU Virtual Photobooth** adalah platform web inovatif yang memungkinkan tamu acara (pernikahan, wisuda, gala dinner, corporate event) untuk mengambil foto berbingkai kustom langsung melalui peramban (*browser*) smartphone mereka cukup dengan memindai **QR Code** di meja atau venue acara, tanpa perlu mengunduh aplikasi tambahan atau mendaftar akun.

### Prinsip Inti:
```text
ONE APPLICATION -> MANY EVENTS -> ONE UNIQUE URL & QR CODE PER EVENT
```

Admin RUANGTEMU dapat membuat event baru melalui dashboard admin dalam hitungan menit:
1. Memasukkan informasi nama klien dan tanggal acara.
2. Memilih 1 sampai 3 template bingkai (*frame*) yang diizinkan untuk acara tersebut.
3. Sistem secara otomatis menerbitkan URL unik (`/event/[slug]`) serta QR Code siap cetak.
4. Pada hari pelaksanaan, tamu memindai QR Code, berfoto, meninggalkan buku tamu digital (teks dan pesan suara), lalu mengunduh hasil foto beresolusi tinggi secara instan.
5. Seluruh data foto, ucapan, dan galeri tersimpan secara aman dan terisolasi per event.

---

## 🚀 Fitur Utama & Pembaruan Terkini

### 1. Mobile-First Virtual Photobooth (Tamu)
* **Kamera Web Berperforma Tinggi**: Mendukung pergantian kamera depan (*selfie*) dan kamera belakang, aspect ratio aman, serta *permission handling* ramah pengguna.
* **Countdown & Multi-Shot Otomatis**: Pengambilan multi-shot (1 foto, 2 foto, 3-strip foto, hingga 6-grid foto) dengan hitungan mundur dinamis dan indikator progres bidikan (misal: *FOTO 1/3*, *2/3*, *3/3*).
* **Live Visual Filters**: Pilihan filter foto langsung (Normal, B&W / Hitam Putih, Warm / Hangat, Vintage).
* **HTML5 Canvas Composite Engine**: Penggabungan foto dan template overlay frame resolusi tinggi tanpa distorsi atau gambar gepeng (*object-fit cover algorithm*).
* **Pratinjau & Retake**: Tamu dapat meninjau hasil sebelum disimpan atau mengulang pengambilan foto (*retake*) jika belum puas.
* **Buku Tamu Digital & Voice Note**: Tamu dapat menyertakan pesan ucapan teks dan merekam pesan suara (*voice note*) hingga 60 detik menggunakan MediaRecorder API.
* **Unduh & Web Share API**: Unduh hasil foto komposit secara langsung ke galeri HP serta opsi berbagi ke media sosial melalui native Web Share API.

### 2. Manajemen Multi-Event & Isolasi Data
* **Isolasi Penuh Antar Acara**: Foto, ucapan tamu, dan pengaturan tema pada Event A tidak akan pernah tercampur dengan Event B.
* **Slug & QR Code Generator**: Otomatis menghasilkan QR Code berbasis vektor SVG/PNG yang dapat diunduh untuk kebutuhan cetak standee akrilik meja tamu.
* **Status Acara Terjadwal**: Mendukung status siklus hidup event (`DRAFT`, `ACTIVE`, `COMPLETED`, `ARCHIVED`).

### 3. Galeri Acara & Mode Proyeksi Venue (Live Projection)
* **Live Event Gallery**: Galeri foto dan ucapan tamu interaktif yang dapat diakses melalui `/event/[slug]/gallery`. Dilengkapi fitur moderasi admin untuk menyaring foto yang tampil.
* **Live Projection Mode**: Halaman khusus layar lebar `/event/[slug]/projection` untuk proyektor atau videotron ballroom hotel yang menampilkan slideshow foto dan ucapan tamu terbaru secara real-time.

### 4. Landing Page Komersial & Live UI Editor
* **Landing Page Interaktif**: Menampilkan katalog layanan paket photobooth fisik dan virtual, kalkulator harga, interaksi 3D Three.js, dan slider ulasan pelanggan.
* **Modal Booking Terpadu**: Formulir reservasi cepat yang terhubung langsung ke WhatsApp Admin serta opsi pembayaran digital.
* **Landing UI Editor**: Panel khusus di dashboard admin untuk mengubah teks hero, tema warna, banner promo, dan susunan konten landing page tanpa perlu menyentuh kode program.

### 5. Dual Database Support (MySQL & Supabase)
* **Folder `database/` Mandiri**: Menyediakan file DDL skema database MySQL (`mysql_schema.sql`) dan data awal (*seed data*) (`mysql_seed.sql`) yang kompatibel dengan XAMPP, phpMyAdmin, dan MySQL 8.0+.
* **Supabase PostgreSQL & Storage**: Mendukung sinkronisasi cloud database realtime dan penyimpanan aset media foto/audio melalui bucket storage Supabase (`ruangtemu-media`).
* **Resilient Mock Fallback**: Sistem dilengkapi in-memory mock store pada `lib/db.ts` sehingga aplikasi tetap dapat berjalan untuk demo/development meskipun koneksi database sedang offline.

### 6. Sistem Pemeliharaan (Maintenance Mode)
* **Intersepsi Terpusat via Middleware**: Mengarahkan pengunjung publik ke halaman `/maintenance` secara instan ketika sistem sedang dalam perbaikan, dengan tetap memberikan akses khusus bagi admin melalui sesi login.

### 7. Integrasi Payment Gateway (DOKU)
* Mendukung pembuatan invoice pembayaran otomatis, QRIS, Virtual Account (BCA, Mandiri, BRI, BNI), dan e-Wallet dengan notifikasi webhook status pembayaran.

---

## 🏗️ Arsitektur & Prinsip Multi-Event

```text
                           RUANGTEMU PLATFORM
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
  Landing Page              Admin Dashboard             Maintenance Mode
  (/, /booking)             (/admin)                    (/maintenance)
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
               CREATE EVENT              MANAGE FRAMES
               (Input Data)              (Upload Template)
                     │
                     ▼
          GENERATE UNIQUE ASSETS
          ├── Event ID (UUID)
          ├── Slug URL: /event/[slug]
          └── Printable QR Code
                     │
       ┌─────────────┴───────────────────────────┐
       ▼                                         ▼
   HARI-H EVENT                              VENUE DISPLAY
   Tamu Scan QR Code                         Layar Proyektor / Videotron
       │                                         │
       ▼                                         ▼
   Mobile Event Page                       Projection Mode
   /event/[slug]                           /event/[slug]/projection
       │                                         ▲
       ├── Input Nama Tamu                       │ (Real-time feed)
       ├── Pilih Frame Template                  │
       ├── Ambil Foto (Multi-shot Kamera)        │
       ├── Canvas Composite Engine               │
       ├── Simpan Foto & Voice Note              │
       └── Download Foto / Bagikan               │
                     │                           │
                     └───────────┬───────────────┘
                                 ▼
                         Event Gallery
                         /event/[slug]/gallery
```

---

## 💻 Tech Stack

| Kategori | Teknologi | Deskripsi / Versi |
|---|---|---|
| **Framework** | Next.js 16.3.5 (App Router) | React Server Components, Server Actions, & Route Handlers |
| **UI Library** | React 19.2.8 & TypeScript 5 | Komponen interaktif modern dengan type safety ketat |
| **Styling** | Tailwind CSS v4 & Vanilla CSS | Styling performa tinggi dengan variabel desain terkini |
| **Animasi & 3D** | Motion (Framer Motion) & Three.js | Transisi halus, mikro-interaksi, dan canvas 3D |
| **Ikon** | Lucide React | Ikonografi clean dan responsif |
| **Database Cloud** | Supabase (PostgreSQL) | Database cloud, otentikasi, dan file storage |
| **Database Relasional** | MySQL 8.0+ / MariaDB | Skema SQL mandiri untuk XAMPP & phpMyAdmin (`mysql2`) |
| **Payment Gateway** | DOKU Checkout API | Integrasi QRIS, Virtual Account, dan e-wallet |
| **Grafika & Audio** | HTML5 Canvas & MediaRecorder API | Engine komposit bingkai foto dan perekam pesan suara |
| **Utilitas** | Zod, QRCode, Canvas-Confetti | Validasi skema, pembuat QR Code, dan efek konfeti |

---

## 📂 Struktur Direktori Proyek

```text
ruangtemu-test/
├── app/                            # Next.js App Router (Halaman & Endpoint API)
│   ├── admin/                      # Halaman panel kontrol admin (/admin)
│   ├── api/                        # Route Handlers backend
│   │   ├── admin/                  # API manajemen maintenance & pengaturan
│   │   ├── bookings/               # API reservasi & pemesanan paket
│   │   ├── entries/                # API unggah foto tamu, pesan, & voice note
│   │   ├── events/                 # API CRUD event & upload aset latar
│   │   ├── frames/                 # API konfigurasi frame template
│   │   └── payment/                # API integrasi & webhook DOKU
│   ├── booking/                    # Halaman pemesanan paket photobooth
│   ├── event/                      # Modul publik event berbasis QR
│   │   └── [slug]/                 # Rute dinamis per acara klien
│   │       ├── gallery/            # Galeri foto & ucapan tamu
│   │       ├── projection/         # Tampilan layar lebar venue
│   │       ├── qr/                 # Halaman cetak QR Code acara
│   │       └── page.tsx            # Halaman utama photobooth tamu
│   ├── maintenance/                # Halaman visual mode pemeliharaan
│   ├── globals.css                 # Konfigurasi CSS global & font
│   ├── landing.css                 # Desain styling khusus landing page
│   ├── layout.tsx                  # Root layout aplikasi
│   └── page.tsx                    # Landing page utama RUANGTEMU
├── components/                     # Komponen UI Reusable
│   ├── admin/                      # Panel admin, editor UI, dan modal pembayaran
│   ├── photobooth/                 # Virtual booth engine (kamera, canvas, filter)
│   ├── booking-modal.tsx           # Modal formulir pemesanan
│   ├── footer.tsx                  # Footer resmi RUANGTEMU
│   └── navbar.tsx                  # Navigasi utama
├── database/                       # Skema Database Relasional (SQL)
│   ├── mysql_schema.sql            # Skema tabel DDL lengkap (XAMPP / MySQL)
│   └── mysql_seed.sql              # Data awal/dummy paket, event, frame, & pesanan
├── docs/                           # Dokumentasi teknis & spesifikasi desain
│   ├── AUDIT.md                    # Laporan audit sistem & arsitektur
│   └── DESIGN.md                   # Spesifikasi desain visual & token warna
├── lib/                            # Library utilitas backend & helper
│   ├── db.ts                       # Abstraksi database utama & in-memory fallback
│   ├── doku.ts                     # Modul integrasi pembayaran DOKU
│   ├── frame-canvas.ts             # Algoritma komposit foto pada canvas
│   └── supabase.ts                 # Inisialisasi Supabase client
├── public/                         # Aset statis (gambar, frame overlay, audio, ikon)
├── supabase/                       # Konfigurasi Supabase
│   └── migrations/                 # File migrasi SQL untuk cloud Supabase
├── types/                          # Definisi tipe TypeScript global
├── middleware.ts                   # Next.js middleware (maintenance interceptor)
├── .maintenance.json               # Konfigurasi status mode pemeliharaan
├── .env.example                    # Template variabel lingkungan
└── package.json                    # Konfigurasi paket dan dependensi
```

---

## 🗄️ Struktur Database & Folder `database/`

Folder [database/](file:///d:/VSCode/ruangtemu-test/database) disediakan khusus agar pengembang atau penguji dapat mereplikasi struktur database dengan mudah:

### 1. `database/mysql_schema.sql` (Initial Database Schema)
Berisi seluruh perintah DDL pembuatan database dan tabel:
* `packages`: Katalog paket photobooth fisik dan virtual.
* `events`: Menyimpan data setiap acara, klien, tanggal, slug, dan izin fitur.
* `frames`: Konfigurasi template frame (jumlah slot foto, koordinat X/Y, dimensi, overlay URL).
* `event_frames`: Tabel relasi *many-to-many* antara event dan frame yang dipilih.
* `bookings`: Data transaksi reservasi layanan dari klien.
* `entries`: Hasil foto tamu, link audio voice note, pesan ucapan, dan status moderasi.
* `admins`: Akun otentikasi pengelola sistem.

### 2. `database/mysql_seed.sql` (Seed Data)
Berisi data awal untuk pengujian langsung, termasuk paket harga resmi RUANGTEMU Palopo, contoh event aktif (misal: *The Wedding of Jaya & Rika*, *Ilva & Ricky*), template frame siap pakai, dan data booking simulasi.

---

## 🛠️ Panduan Instalasi & Menjalankan Lokal

### Prasyarat
* **Node.js**: Versi 20.x atau lebih baru.
* **npm** atau **pnpm / yarn**.
* **Database (Pilih salah satu)**:
  * Akun Supabase (Cloud PostgreSQL), atau
  * XAMPP / MySQL Server lokal untuk mengimpor file di folder `database/`.

### Langkah-Langkah:

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/aliffikri21/ruangtemu-website.git
   cd ruangtemu-test
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Siapkan Environment Variables:**
   Salin file `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Sesuaikan nilai variabel lingkungan di dalamnya.

4. **Siapkan Database:**
   * **Opsi A (MySQL / XAMPP):**
     1. Buka phpMyAdmin (`http://localhost/phpmyadmin`).
     2. Buat database baru bernama `ruangtemu`.
     3. Buka tab **Import**, pilih file `database/mysql_schema.sql`, lalu klik **Execute**.
     4. (Opsional) Ulangi langkah import untuk file `database/mysql_seed.sql` agar database terisi data sampel.
   * **Opsi B (Supabase Cloud):**
     1. Buka SQL Editor di Dashboard Supabase Anda.
     2. Jalankan isi file `supabase/migrations/20261004_ruangtemu_full.sql`.
     3. Buat bucket Storage publik baru bernama `ruangtemu-media`.

5. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:3000`.

---

## ⚙️ Konfigurasi Environment Variables

File `.env.local` membutuhkan parameter berikut:

```env
# URL Aplikasi (Gunakan https://ruangtemu.online pada Vercel Production)
NEXT_PUBLIC_APP_URL=https://ruangtemu.online

# Konfigurasi Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kredensial Admin Login
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-admin-password

# Kontak WhatsApp & Sosial Media RUANGTEMU
NEXT_PUBLIC_RUANGTEMU_WA=6282244866088
NEXT_PUBLIC_RUANGTEMU_INSTAGRAM=ruangtemuphotobooth

# DOKU Payment Gateway (Opsional untuk testing pembayaran)
DOKU_CLIENT_ID=your-doku-client-id
DOKU_SECRET_KEY=your-doku-secret-key
DOKU_ENVIRONMENT=sandbox
```

---

## 🔄 Alur Kerja Sistem (Workflow)

### Alur Admin (Sebelum Acara):
```text
1. Buka /admin/login dan masukkan kredensial.
2. Pada tab Events, klik "Tambah Event Baru".
3. Isi Nama Acara, Tanggal, Venue, dan Klien.
4. Pilih 1–3 Frame Template yang sesuai dengan tema acara.
5. Klik Simpan. Sistem otomatis menerbitkan Slug unik dan QR Code.
6. Klik ikon QR Code untuk membuka halaman cetak (/event/[slug]/qr) dan mencetak standee meja.
```

### Alur Tamu / Guest (Hari-H Acara):
```text
1. Tamu memindai QR Code di meja menggunakan kamera smartphone.
2. Halaman acara (/event/[slug]) terbuka secara instan tanpa perlu login.
3. Tamu memasukkan nama panggilan.
4. Tamu memilih salah satu frame template yang disediakan.
5. Tamu mengizinkan akses kamera browser.
6. Hitungan mundur berjalan (3... 2... 1...) dan kamera mengambil foto.
7. Sistem merender komposit foto ke dalam frame secara otomatis.
8. Tamu memeriksa hasil foto (bisa melakukan retake bila ingin mengulang).
9. Tamu menuliskan pesan ucapan dan merekam voice note (opsional).
10. Tamu menekan tombol "Kirim & Simpan". Foto tersimpan ke galeri acara dan dapat langsung diunduh ke HP tamu.
```

---

## 📍 Rute Halaman & Endpoint API

### Halaman Web (Frontend):
* `/`: Landing page komersial RUANGTEMU PHOTOBOOTH.
* `/booking`: Halaman pemilihan paket & form pemesanan layanan.
* `/admin`: Dashboard manajemen event, frame, booking, galeri, dan UI editor.
* `/maintenance`: Halaman informatif saat sistem dalam status pemeliharaan.
* `/event/[slug]`: Halaman utama photobooth tamu untuk acara terkait.
* `/event/[slug]/gallery`: Galeri foto dan buku ucapan digital tamu.
* `/event/[slug]/projection`: Mode live projection untuk layar panggung venue.
* `/event/[slug]/qr`: Halaman pratinjau & cetak QR Code acara.

### Endpoint API (Backend):
* `GET /api/events`: Mengambil daftar seluruh event aktif.
* `POST /api/events`: Menambah event baru beserta penetapan frame.
* `GET /api/events/[slug]`: Mengambil rincian detail event berdasarkan slug.
* `POST /api/entries`: Menerima kiriman foto tamu, teks ucapan, dan rekaman audio.
* `GET /api/entries?event_id=...`: Mengambil daftar foto galeri untuk event tertentu.
* `POST /api/frames`: Menambah atau memperbarui konfigurasi frame template.
* `POST /api/payment/checkout`: Membuat URL checkout pembayaran digital DOKU.
* `POST /api/payment/webhook`: Menerima callback status pembayaran dari DOKU.
* `GET/POST /api/admin/maintenance`: Memeriksa dan mengubah status mode pemeliharaan.

---

## 🚧 Mode Pemeliharaan (Maintenance Mode)

Sistem memiliki mekanisme pemeliharaan terintegrasi:
* Diaktifkan melalui tombol toggle di panel admin atau file [.maintenance.json](file:///d:/VSCode/ruangtemu-test/.maintenance.json).
* Ketika aktif, seluruh lalu lintas publik diarahkan ke `/maintenance` melalui Next.js middleware ([middleware.ts](file:///d:/VSCode/ruangtemu-test/middleware.ts)).
* Pengelola tetap dapat masuk ke dashboard admin melalui rute `/admin` tanpa terblokir.

---

## 💳 Integrasi Pembayaran (DOKU Gateway)

Modul pembayaran diimplementasikan pada [lib/doku.ts](file:///d:/VSCode/ruangtemu-test/lib/doku.ts):
* Menghasilkan request signature berbasis HMAC-SHA256 sesuai standar keamanan DOKU.
* Menghasilkan tautan pembayaran instan untuk berbagai metode transfer (QRIS seluruh bank/e-wallet, Virtual Account, kartu debit/kredit).
* Webhook handler pada `/api/payment/webhook` otomatis memperbarui status pesanan menjadi `confirmed` saat pembayaran berhasil diverifikasi.

---

## 🔐 Hak Akses & Kredensial Default

Untuk keperluan pengujian dan demonstrasi lokal:
* **URL Admin Panel:** `http://localhost:3000/admin`
* **Email:** `admin@ruangtemu.id`
* **Password:** `ruangtemupalopo2026`

---

## 📄 Hak Cipta & Pengembang

* **Mitra Bisnis:** RUANGTEMU PHOTOBOOTH (Palopo, Sulawesi Selatan)
* **Karya:** Proyek Mandiri / Capstone Project Mahasiswa
* **Program Studi:** Teknologi Rekayasa Multimedia (Konsentrasi Web Design)
* **Perguruan Tinggi:** Politeknik Dewantara, Kota Palopo
* **Tahun:** 2026
