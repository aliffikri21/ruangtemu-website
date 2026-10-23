# 📸 RUANGTEMU Virtual Photobooth

> **Commercial Multi-Event Virtual Photobooth Platform**
>
> Sistem web untuk membuat, mengelola, dan menjalankan Virtual Photobooth secara terpisah untuk setiap client/event RUANGTEMU PHOTOBOOTH.

**Mitra:** RUANGTEMU PHOTOBOOTH  
**Lokasi:** Kota Palopo, Sulawesi Selatan, Indonesia  
**Project:** Independent Project — Program Studi Teknologi Rekayasa Multimedia, Konsentrasi Web Design  
**Status:** Development → Production Preparation  
**Dokumen:** Product Specification + Architecture Guide + AI Agent Development Guide

---

# 1. Ringkasan Produk

**RUANGTEMU Virtual Photobooth** adalah platform web yang dikembangkan untuk membantu RUANGTEMU PHOTOBOOTH menyediakan layanan Virtual Photobooth untuk setiap client yang telah memesan layanan tersebut.

Konsep utamanya adalah **multi-event architecture**.

Admin RUANGTEMU tidak perlu membuat website baru setiap kali mendapatkan client baru. Admin cukup membuat **event baru** dari dashboard, memasukkan informasi client/event, menentukan tanggal acara, lalu memilih sekitar **2–3 template frame** yang akan tersedia pada event tersebut.

Setelah event dibuat, sistem menghasilkan:

- Event ID;
- slug unik;
- URL event unik;
- QR Code event.

Pada hari pelaksanaan acara, tamu cukup melakukan scan QR Code menggunakan smartphone. QR Code membuka halaman event yang sudah dikonfigurasi sebelumnya oleh admin.

Informasi seperti nama client/event, tanggal acara, dan pilihan frame akan tampil otomatis berdasarkan data event.

## Konsep paling penting

```text
CLIENT BARU
    ↓
ADMIN RUANGTEMU
    ↓
CREATE EVENT
    ↓
INPUT CLIENT + EVENT + DATE
    ↓
PILIH 2–3 FRAME
    ↓
SYSTEM GENERATES
    ├── UNIQUE EVENT ID
    ├── UNIQUE EVENT SLUG
    ├── UNIQUE EVENT URL
    └── QR CODE
            ↓
         HARI-H
            ↓
       GUEST SCAN QR
            ↓
        EVENT PAGE
            ↓
    PILIH FRAME + AMBIL FOTO
            ↓
         PHOTO RESULT
            ↓
    GUESTBOOK / VOICE NOTE
            ↓
       EVENT GALLERY
```

---

# 2. Latar Belakang Project

RUANGTEMU PHOTOBOOTH membutuhkan layanan Virtual Photobooth yang dapat disiapkan secara berbeda untuk setiap client.

Kebutuhan utamanya bukan membuat satu halaman photobooth yang sama untuk semua acara, melainkan membuat sebuah sistem yang mampu menghasilkan **event-specific photobooth**.

Contoh:

```text
Client A
Dimas & Sarah
24 Oktober 2026
Frames:
- Wedding Navy
- Wedding Gold
- Minimal White

URL:
/event/dimas-sarah
```

dan:

```text
Client B
Andi & Putri
10 November 2026
Frames:
- Floral
- Pink
- Minimal

URL:
/event/andi-putri
```

Kedua event tersebut berada di dalam satu aplikasi yang sama, tetapi seluruh konfigurasi dan data penggunaannya tetap terpisah.

---

# 3. Tujuan Pengembangan

Project ini bertujuan untuk:

1. Membuat sistem Virtual Photobooth berbasis web yang dapat digunakan tanpa instalasi aplikasi.
2. Memungkinkan admin RUANGTEMU membuat event baru secara mandiri.
3. Menghasilkan link unik untuk setiap event.
4. Menghasilkan QR Code yang langsung mengarah ke event terkait.
5. Menampilkan informasi event secara otomatis berdasarkan konfigurasi admin.
6. Membatasi pilihan frame sesuai frame yang ditetapkan untuk event.
7. Memungkinkan tamu mengambil foto menggunakan kamera smartphone/browser.
8. Menghasilkan foto final dengan frame yang dipilih.
9. Menyediakan guestbook dan voice note sebagai fitur pendukung.
10. Menyimpan data foto dan guestbook berdasarkan event.
11. Menampilkan gallery khusus untuk setiap event.
12. Memastikan data antar-event terisolasi.
13. Menghasilkan platform yang dapat digunakan kembali untuk client baru tanpa perubahan source code.

---

# 4. Core Product Principle

Prinsip paling penting dari project:

> **ONE APPLICATION → MANY EVENTS → ONE UNIQUE URL PER EVENT**

```text
RUANGTEMU APPLICATION
        │
        ├── Event A
        │     ├── URL A
        │     ├── QR A
        │     ├── Frames A
        │     ├── Photos A
        │     └── Guestbook A
        │
        ├── Event B
        │     ├── URL B
        │     ├── QR B
        │     ├── Frames B
        │     ├── Photos B
        │     └── Guestbook B
        │
        └── Event C
              ├── URL C
              ├── QR C
              ├── Frames C
              ├── Photos C
              └── Guestbook C
```

Tidak boleh ada developer intervention untuk membuat event baru.

Admin harus cukup menggunakan dashboard.

---

# 5. Scope Utama

## 5.1 Core MVP

Core MVP mencakup:

- Admin authentication;
- Admin dashboard;
- Event management;
- Frame management;
- Event-frame assignment;
- Unique event URL;
- QR Code;
- Guest event page;
- Guest name;
- Frame selection;
- Camera;
- Countdown;
- Multi-shot;
- Filter;
- Canvas composite;
- Preview;
- Retake;
- Photo upload;
- Guestbook;
- Optional voice note;
- Event gallery;
- Moderation;
- QR print page.

## 5.2 Supporting Features

Fitur tambahan yang dapat dikembangkan setelah core stabil:

- Projection mode;
- Event analytics sederhana;
- Gallery search;
- Gallery pagination;
- Reactions/likes;
- Download statistics;
- Advanced frame editor;
- Event duplication.

## 5.3 Out of Scope untuk Core MVP

Fitur berikut bukan prioritas core:

- payment gateway;
- accounting;
- invoice automation;
- CRM;
- marketplace;
- subscription;
- customer portal;
- inventory management;
- physical printer integration;
- automated financial reports;
- complex WhatsApp booking workflow.

Jika sudah ada implementation untuk fitur tersebut, jangan menghapusnya secara destruktif. Namun jangan biarkan fitur tersebut menghambat core Virtual Photobooth.

---

# 6. Business Workflow

## 6.1 Sebelum Event

```text
Client memesan Virtual Photobooth
        ↓
Tanggal event ditentukan
        ↓
Admin RUANGTEMU membuka dashboard
        ↓
Create Event
        ↓
Input:
- Client Name
- Event Name
- Event Date
        ↓
Pilih 2–3 Frame
        ↓
Save Event
        ↓
System membuat URL
        ↓
System membuat QR
        ↓
QR diberikan kepada client / disiapkan untuk venue
```

## 6.2 Hari-H Event

```text
Tamu melihat QR
      ↓
Scan QR
      ↓
Open Event Page
      ↓
Event information tampil
      ↓
Tamu memasukkan nama
      ↓
Memilih frame
      ↓
Mengizinkan kamera
      ↓
Mengambil foto
      ↓
Preview
      ↓
Guestbook
      ↓
Submit
      ↓
Photo saved
      ↓
Gallery
```

---

# 7. User Roles

## 7.1 Admin RUANGTEMU

Admin dapat:

- login;
- membuat event;
- mengubah event;
- mengaktifkan event;
- menyelesaikan event;
- mengarsipkan event;
- memilih frame;
- melihat QR;
- membuka event;
- melihat gallery;
- memoderasi submission.

## 7.2 Guest

Guest tidak memerlukan akun.

Guest dapat:

- membuka event;
- memasukkan nama;
- memilih frame;
- mengambil foto;
- melakukan retake;
- menulis pesan;
- merekam voice note jika tersedia;
- mengirim hasil;
- melihat hasil/gallery sesuai konfigurasi event.

---

# 8. Route Structure

## Public / Root

```text
/
```

Homepage dapat tetap digunakan sebagai halaman informasi/branding RUANGTEMU bila sudah tersedia.

## Admin

```text
/admin/login
/admin
/admin/events
/admin/events/new
/admin/events/[id]
/admin/events/[id]/edit
```

## Event

```text
/event/[slug]
```

## Gallery

```text
/event/[slug]/gallery
```

## Projection

```text
/event/[slug]/projection
```

## QR

```text
/event/[slug]/qr
```

---

# 9. Multi-Event Architecture

Setiap event harus mempunyai:

```text
id
slug
client_name
event_name
event_date
status
frame assignments
entries
media
configuration
```

Database identity menggunakan UUID.

Contoh:

```text
id:
4c1f5a0e-....

slug:
dimas-sarah-wedding
```

URL:

```text
/event/dimas-sarah-wedding
```

---

# 10. Event Isolation

Data Event A tidak boleh muncul pada Event B.

Contoh:

```text
Event A
Dimas & Sarah
```

tidak boleh melihat:

```text
Event B
Andi & Putri
```

termasuk:

- photo;
- guestbook;
- voice note;
- frame configuration;
- private event configuration;
- internal metadata.

Semua query event harus selalu memiliki event context.

Contoh service:

```ts
getEventBySlug(slug)
getEventFrames(eventId)
getEntriesByEventId(eventId)
createEntry(eventId, data)
```

Jangan menggunakan global state sebagai event source of truth.

---

# 11. Event Lifecycle

Gunakan status:

```text
DRAFT
ACTIVE
COMPLETED
ARCHIVED
```

## DRAFT

Event sedang disiapkan.

Guest belum dapat menggunakannya.

## ACTIVE

Event dapat digunakan oleh guest.

## COMPLETED

Acara telah selesai.

Gallery dapat tetap tersedia.

## ARCHIVED

Event sudah selesai dan tidak ditampilkan dalam daftar event aktif.

Event yang telah lewat tanggalnya tidak boleh otomatis dihapus.

---

# 12. Create Event

Admin workflow:

```text
/admin/events/new
```

Form minimum:

```text
Client Name
Event Name
Event Date
Event Type
Venue
Cover Image
Frame Selection
```

Field wajib:

- Client Name;
- Event Name atau title;
- Event Date;
- minimal 1 frame.

Frame maksimum untuk MVP:

```text
3
```

Recommended:

```text
2–3 frames
```

Server wajib melakukan validasi jumlah frame.

---

# 13. Example Event

```text
Client Name:
Dimas & Sarah

Event Name:
The Wedding of Dimas & Sarah

Date:
24 October 2026

Frames:
1. Wedding Navy
2. Wedding Gold
3. Minimal White
```

Setelah disimpan:

```text
Event ID:
generated UUID

Slug:
dimas-sarah

Event URL:
https://domain.com/event/dimas-sarah
```

QR mengarah ke URL tersebut.

---

# 14. Unique Slug

Slug harus:

- lowercase;
- URL-safe;
- unique;
- collision-safe;
- dihasilkan server-side.

Contoh:

```text
Dimas & Sarah Wedding
↓
dimas-sarah-wedding
```

Jika sudah digunakan:

```text
dimas-sarah-wedding-2
```

atau mekanisme collision-safe lainnya.

UUID tetap menjadi identity utama database.

---

# 15. Event Page

Saat guest membuka:

```text
/event/[slug]
```

server harus:

1. membaca slug;
2. mengambil event;
3. memvalidasi status;
4. mengambil frame terkait;
5. membangun public event data;
6. menampilkan halaman event.

Jangan:

```text
get all events
↓
filter on client
```

Gunakan query berdasarkan slug.

---

# 16. Event Page Example

```text
               ruangtemu.

            THE WEDDING OF

             DIMAS & SARAH

             24 OCTOBER 2026

        Pilih Frame Favoritmu

        ┌───────────────┐
        │    FRAME 1    │
        └───────────────┘

        ┌───────────────┐
        │    FRAME 2    │
        └───────────────┘

        ┌───────────────┐
        │    FRAME 3    │
        └───────────────┘

           START PHOTOBOOTH
```

Nama dan tanggal harus berasal dari database.

Jangan hardcode.

---

# 17. Invalid Event Handling

Jika slug tidak ditemukan:

```text
Event tidak ditemukan.
```

Jika DRAFT:

```text
Event belum tersedia.
```

Jika event tidak aktif:

```text
Event ini sedang tidak tersedia.
```

Jika diperlukan:

```text
Event telah selesai.
```

Jangan menampilkan blank page.

---

# 18. Frame Assignment

Frame disimpan sebagai reusable asset/template.

Hubungan:

```text
Event
  ↓
event_frames
  ↓
Frames
```

Contoh:

```text
Event Dimas & Sarah
    ├── Wedding Navy
    ├── Wedding Gold
    └── Minimal White
```

Event lain dapat menggunakan frame yang berbeda.

---

# 19. Frame Limits

MVP:

```text
minimum = 1
maximum = 3
```

Jangan hanya mengandalkan UI untuk membatasi jumlah.

Server harus menolak request jika admin mencoba menyimpan >3 frame.

---

# 20. Frame Types

Prototype existing memiliki:

```text
strip_3
grid_4
polaroid
deluxe
```

Gunakan sebagai baseline.

Jumlah foto mengikuti frame.

Contoh:

```text
strip_3 → 3
grid_4 → 4
polaroid → 1
deluxe → configuration-defined
```

---

# 21. Frame Configuration

Gunakan typed configuration:

```ts
type FrameConfig = {
  template:
    | "strip_3"
    | "grid_4"
    | "polaroid"
    | "deluxe";

  headerText?: string;
  subheaderText?: string;
  watermarkText?: string;

  backgroundColor?: string;
  borderColor?: string;

  fontStyle?: string;

  padding?: number;
  radius?: number;

  sticker?: string;
  overlayUrl?: string;

  filter?: string;
};
```

Gunakan schema validation.

---

# 22. Guest Frame Experience

Default guest experience:

```text
Frame selection
    ↓
Frame preview
    ↓
Select
    ↓
Camera
```

Guest tidak secara default mendapatkan akses untuk mengubah struktur frame.

Frame yang telah dikonfigurasi admin harus dianggap sebagai source of truth.

---

# 23. Camera Module

Gunakan browser camera API:

```text
navigator.mediaDevices.getUserMedia()
```

Fitur:

- permission;
- preview;
- capture;
- countdown;
- multi-shot;
- mirror preview;
- filters;
- stop/cleanup.

---

# 24. Camera State

Gunakan state yang eksplisit.

Contoh:

```ts
type CameraState =
  | "idle"
  | "requesting"
  | "ready"
  | "countdown"
  | "capturing"
  | "processing"
  | "complete"
  | "error";
```

Hindari terlalu banyak boolean yang saling bertabrakan.

---

# 25. Camera Permission

Handle:

```text
permission accepted
permission denied
camera unavailable
camera in use
browser unsupported
insecure context
```

Jika denied:

```text
Kamera belum diizinkan.

Izinkan akses kamera pada browser
untuk melanjutkan.
```

---

# 26. Camera Cleanup

Ketika meninggalkan camera page/step:

```ts
stream?.getTracks().forEach(track => track.stop());
```

Camera tidak boleh tetap aktif setelah session selesai.

Juga revoke object URLs bila digunakan:

```ts
URL.revokeObjectURL(...)
```

---

# 27. Multi-Shot

Jumlah shot harus mengikuti frame.

Contoh:

```text
strip_3
Photo 1/3
Photo 2/3
Photo 3/3
```

Setelah shot terakhir:

```text
Captured Photos
↓
Composite
```

State harus reset pada:

- retake;
- restart;
- session baru;
- page exit.

---

# 28. Camera Filters

Baseline:

```text
normal
grayscale
sepia
soft-glow
warm-vintage
cool-cinema
```

Filter preview dan final harus konsisten semaksimal mungkin.

Jangan menjanjikan hasil identik pada semua browser jika API yang dipakai memiliki keterbatasan.

---

# 29. Frame Renderer

Gunakan HTML5 Canvas.

Pipeline:

```text
Captured Photos
       ↓
Selected Frame
       ↓
Frame Config
       ↓
Filter
       ↓
Canvas Renderer
       ↓
Final Composite
       ↓
Blob/File
```

Renderer harus berupa module terpisah.

Contoh:

```ts
renderPhotoboothFrame({
  photos,
  frameConfig
})
```

Output:

```text
Blob
```

---

# 30. Frame Resolution

Baseline dari prototype:

| Frame | Preview | High Resolution | Ratio | Photo Count |
|---|---:|---:|---:|---:|
| strip_3 | 600 × 1800 | 1200 × 3600 | 1:3 | 3 |
| grid_4 | 800 × 1000 | 1600 × 2000 | 4:5 | 4 |
| polaroid | 700 × 850 | 1400 × 1700 | ~1:1.2 | 1 |
| deluxe | 800 × 1100 | 1600 × 2200 | ~1:1.37 | 2 / configured |

Jika resolusi diubah:

**preview dan final renderer harus diubah bersama.**

---

# 31. Crop / Object Fit

Foto harus menggunakan crop proporsional.

Jangan stretch.

Gunakan matematika `cover`:

```text
source aspect ratio
        ↓
target aspect ratio
        ↓
scale
        ↓
crop
        ↓
draw image
```

Frame engine harus mempertahankan aspect ratio.

---

# 32. Photo Output

MVP sebaiknya menyimpan **final composite**.

Raw camera files tidak wajib disimpan.

Output dapat menggunakan:

```text
WEBP
```

atau JPEG bila compatibility membutuhkan.

Quality dan file size harus masuk akal.

---

# 33. Download

Guest dapat mengunduh hasil foto.

Filename harus unik:

```text
dimas-sarah-20261024-<entry-id>.webp
```

Jangan hanya menggunakan guest name.

---

# 34. Guest Session

Satu guest = satu session.

Temporary state:

```text
guestName
selectedFrame
capturedPhotos
selectedFilter
message
voiceNote
```

Setelah berhasil submit:

```text
reset session
```

Jangan membawa foto guest sebelumnya ke guest berikutnya.

---

# 35. Guestbook

Guest dapat memasukkan:

```text
Nama
Pesan
```

Pesan harus dianggap sebagai **untrusted input**.

Gunakan text rendering.

Jangan menyisipkan raw HTML dari guest.

---

# 36. Voice Note

Voice note bersifat optional.

Baseline:

```text
maximum 60 seconds
```

Gunakan MediaRecorder.

MIME preference:

```text
audio/webm;codecs=opus
audio/mp4
audio/ogg
```

Gunakan `MediaRecorder.isTypeSupported()` sebelum memilih MIME type.

---

# 37. Voice Note UX

Flow:

```text
Start Recording
↓
Timer
↓
Stop
↓
Preview
↓
Retake / Delete
↓
Submit
```

Jika microphone ditolak:

```text
Voice Note tidak tersedia.
Anda tetap dapat melanjutkan tanpa voice note.
```

Voice note tidak boleh memblokir submission apabila fitur bersifat optional.

---

# 38. Media Storage

Final photo dan voice note harus disimpan di object storage.

Database hanya menyimpan metadata/path.

Contoh:

```text
Storage
events/{eventId}/photos/{entryId}.webp

events/{eventId}/audio/{entryId}.webm
```

Jangan menyimpan permanent media sebagai base64 di database.

---

# 39. Upload Validation

Server harus memvalidasi:

- MIME;
- file size;
- extension;
- event context;
- upload authorization;
- allowed media type.

Client:

```html
accept="image/png"
```

bukan security boundary.

---

# 40. Submission Pipeline

```text
Guest Capture
    ↓
Final Composite
    ↓
Client-side validation
    ↓
Upload request
    ↓
Server validation
    ↓
Storage
    ↓
Database metadata
    ↓
Entry created
    ↓
Moderation
    ↓
Gallery
```

---

# 41. Duplicate Submission Protection

Harus mencegah:

- double-click;
- repeated request;
- slow-network retry;
- refresh duplicate;
- accidental repeated submit.

Minimal:

```text
disable submit button while processing
```

Gunakan idempotency/client submission ID atau strategy equivalent bila diperlukan.

---

# 42. Upload Failure

Jika upload gagal:

```text
Foto belum berhasil disimpan.

Periksa koneksi internet lalu coba lagi.
```

Jangan menampilkan success jika server belum mengkonfirmasi.

Jika memungkinkan, pertahankan hasil foto lokal sampai upload berhasil atau user memilih membuangnya.

---

# 43. Guest Success Page

Contoh:

```text
🎉 FOTO BERHASIL DISIMPAN!

Terima kasih telah mengabadikan
momen di acara ini.

[Download Foto]
[Lihat Gallery]
[Ambil Foto Lagi]
```

Guest dapat mengulang session tanpa membawa state sebelumnya.

---

# 44. Event Gallery

Route:

```text
/event/[slug]/gallery
```

Data minimal:

```text
Photo
Guest Name
Message
Voice Note
Created At
Moderation Status
```

Gallery harus event-specific.

---

# 45. Gallery Moderation

Submission baru:

```text
PENDING
```

Admin:

```text
Approve
Reject
Hide
Delete
```

Public gallery:

```text
APPROVED / PUBLISHED
```

saja, berdasarkan konfigurasi business rule.

---

# 46. Gallery Search / Filter

Supporting feature:

```text
Search by guest name
Filter by moderation
Filter by voice note
```

Jangan memuat ribuan media sekaligus.

Gunakan pagination/cursor pagination.

---

# 47. Event Projection

Optional supporting feature:

```text
/event/[slug]/projection
```

Digunakan untuk:

- TV;
- projector;
- LED/videotron.

Hanya menampilkan entry approved/public dari event tersebut.

Tidak boleh mengambil seluruh database.

---

# 48. Projection Requirements

Projection:

- fullscreen;
- 16:9 friendly;
- high contrast;
- large typography;
- photo;
- guest name;
- message;
- optional audio;
- automatic transition.

Default transition dapat dibuat 5–10 detik dan dibuat configurable jika diperlukan.

---

# 49. QR Code

Setiap event harus memiliki QR.

Flow:

```text
event slug
    ↓
canonical event URL
    ↓
QR generator
    ↓
SVG / Canvas
    ↓
download / print
```

QR harus:

- high contrast;
- memiliki quiet zone;
- mudah dipindai;
- tidak terlalu kecil;
- menggunakan URL event yang benar.

---

# 50. QR Page

Route:

```text
/event/[slug]/qr
```

Menampilkan:

```text
Event Name
Event Date
QR Code
Instruction
RUANGTEMU Branding
```

Contoh:

```text
SCAN & CAPTURE
MOMENMU DI SINI

Dimas & Sarah

[QR CODE]

1. Scan QR
2. Pilih Frame
3. Ambil Foto
```

---

# 51. QR Print

Gunakan print CSS.

Target:

```text
A5
```

Pastikan saat `window.print()`:

- QR tetap jelas;
- background benar;
- margin sesuai;
- layout tidak terpotong.

---

# 52. Admin Dashboard

Minimum:

```text
Dashboard
Events
Frames
Gallery
Settings
```

Dashboard overview:

```text
Total Events
Active Events
Completed Events
Total Photos
Total Entries
```

Jangan menampilkan Omset/Pendapatan jika sistem tidak mempunyai sumber transaksi yang valid.

---

# 53. Admin Event List

Columns:

```text
Event
Client
Date
Status
Frames
Photos
Created
Actions
```

Search:

```text
Client
Event
Slug
```

Filter:

```text
All
Draft
Active
Completed
Archived
```

---

# 54. Admin Event Detail

Contoh:

```text
EVENT
Dimas & Sarah

DATE
24 October 2026

STATUS
ACTIVE

EVENT URL
https://domain.com/event/dimas-sarah

FRAMES
3

PHOTOS
124
```

Actions:

```text
Edit
Open Event
Copy Link
QR
Gallery
Projection
Complete
Archive
```

---

# 55. Admin Create Event UX

Prioritaskan kecepatan.

Target workflow:

```text
New Event
↓
Isi data
↓
Pilih 2–3 frame
↓
Save
↓
QR ready
```

Jangan membuat admin melewati wizard yang terlalu panjang.

---

# 56. Admin Frame Management

Admin dapat:

```text
Create Frame
Edit Frame
Preview Frame
Activate Frame
Deactivate Frame
Assign Frame
```

Hard delete frame sebaiknya dihindari jika sudah digunakan event.

Gunakan deactivate/archive bila memungkinkan.

---

# 57. Frame Asset Types

Dukung:

```text
PNG
JPG/JPEG
```

PNG digunakan untuk overlay transparan.

Validasi file upload.

---

# 58. Existing Prototype Mapping

Prototype awal harus diperlakukan sebagai functional reference.

| Prototype | Production System |
|---|---|
| Event settings | Admin Event Configuration |
| Guest name | Guest Session |
| Frame editor | Frame Configuration |
| Custom overlay | Frame Asset |
| Camera | Camera Module |
| Canvas composite | Frame Renderer |
| Voice note | Audio Module |
| Gallery | Event Gallery |
| QR modal | Event QR |
| Projection | Event Projection |
| Admin modal | Admin Portal |
| localStorage | Database + Storage |

---

# 59. Prototype Preservation Rule

Prototype tidak boleh dihapus secara sembarangan.

Lakukan:

```text
Audit
↓
Identify reusable logic
↓
Extract
↓
Refactor
↓
Test
↓
Replace legacy usage
```

Jangan melakukan blind rewrite.

---

# 60. Architecture Target

Target:

```text
Browser
   ↓
Next.js App Router
   ↓
Server / Route Handlers / Server Actions
   ↓
Supabase
   ├── Auth
   ├── PostgreSQL
   └── Storage
```

---

# 61. Recommended Tech Stack

Baseline repository saat ini:

- Next.js 16.x;
- React 19.x;
- TypeScript;
- Tailwind CSS v4;
- Supabase;
- HTML5 Canvas;
- MediaDevices API;
- MediaRecorder API;
- QR library;
- Zod.

Sebelum mengubah versi:

1. baca `package.json`;
2. baca lockfile;
3. verifikasi compatibility;
4. lakukan upgrade hanya jika ada alasan teknis.

Jangan upgrade dependency tanpa kebutuhan.

---

# 62. Next.js Rules

Gunakan:

```text
App Router
```

Jangan membuat:

```text
pages/
```

untuk architecture baru.

Route dinamis harus mengikuti API Next.js versi yang benar.

Pada versi Next.js yang digunakan repository, perhatikan bentuk `params` pada dynamic routes dan ikuti type/API aktual yang didukung versi tersebut.

Jangan menyalin pola lama tanpa verifikasi dari package/version yang sedang terpasang.

---

# 63. Component Architecture

Reusable UI:

```text
Button
Input
Textarea
Select
Dialog
Modal
Toast
Card
Badge
Table
Skeleton
EmptyState
ErrorState
```

Business components:

```text
EventCard
CreateEventForm
EventDetail
FrameSelector
FramePreview
CameraCapture
PhotoPreview
GuestbookForm
GalleryGrid
GalleryItem
QRGenerator
ProjectionView
AdminSidebar
AdminEventTable
```

Jangan membuat satu component dengan ribuan baris.

---

# 64. Code Separation

Pisahkan:

```text
UI
Business Logic
Validation
Database Access
Storage Access
Camera
Audio
Frame Renderer
```

Contoh:

```text
lib/
├── db/
├── validation/
├── storage/
├── camera/
├── frame-canvas.ts
├── audio.ts
└── utils.ts
```

Jangan memasukkan seluruh application logic ke:

```text
virtual-booth.tsx
```

---

# 65. Database

Gunakan PostgreSQL/Supabase.

Core tables:

```text
profiles
events
frames
event_frames
entries
media_assets
```

Optional tables:

```text
packages
bookings
customers
```

hanya jika fitur tersebut tetap menjadi bagian dari scope.

---

# 66. `profiles`

Minimum:

```text
id
full_name
email
role
created_at
updated_at
```

Role MVP dapat menggunakan:

```text
ADMIN
```

Architecture boleh diperluas nanti menjadi:

```text
SUPER_ADMIN
ADMIN
OPERATOR
```

---

# 67. `events`

Minimum:

```text
id
slug
client_name
event_name
event_type
event_date
venue
cover_image_url
status
is_active
allow_guestbook
allow_voice_note
gallery_visibility
created_at
updated_at
```

Jangan simpan field yang tidak digunakan tanpa alasan.

---

# 68. `frames`

Minimum:

```text
id
name
slug
template_type
preview_url
config_json
is_active
created_at
updated_at
```

---

# 69. `event_frames`

Minimum:

```text
id
event_id
frame_id
sort_order
created_at
```

Constraint:

```text
UNIQUE(event_id, frame_id)
```

---

# 70. `entries`

Minimum:

```text
id
event_id
guest_name
message
photo_asset_id
voice_asset_id
moderation_status
is_published
client_submission_id
created_at
updated_at
```

---

# 71. `media_assets`

Minimum:

```text
id
event_id
entry_id
media_type
storage_path
mime_type
size_bytes
created_at
```

Database menyimpan metadata/path.

Storage menyimpan file.

---

# 72. Database Constraints

Gunakan constraints untuk menjaga data integrity:

```text
events.slug unique
frames.slug unique
event_frames(event_id, frame_id) unique
entries.event_id foreign key
media_assets.event_id foreign key
```

Gunakan enum/check constraint untuk status bila sesuai.

---

# 73. Database Indexes

Minimal index:

```text
events.slug
events.event_date
events.status
event_frames.event_id
entries.event_id
entries.moderation_status
media_assets.event_id
```

---

# 74. Row Level Security

Jika menggunakan Supabase:

Aktifkan RLS.

Public event access harus terbatas pada data yang memang public.

Admin mutation harus terotorisasi.

Guest tidak boleh:

```text
read all events
read all entries
update other events
delete entries
access admin data
```

---

# 75. Public Event DTO

Jangan mengirim seluruh row database ke browser.

Gunakan public DTO.

Contoh:

```ts
type PublicEvent = {
  slug: string;
  title: string;
  clientName: string;
  eventDate: string;
  coverImageUrl?: string;
  frames: PublicFrame[];
};
```

Jangan expose:

- private customer data;
- internal notes;
- admin metadata;
- secret keys.

---

# 76. Admin Authorization

Admin authorization harus dilakukan:

```text
Authentication
+
Server-side authorization
+
Database/RLS policy
```

Tidak cukup:

```text
hide admin button
```

---

# 77. Authentication

Gunakan Supabase Auth atau equivalent.

Flow:

```text
/admin/login
      ↓
Supabase Auth
      ↓
Session
      ↓
Server verifies user
      ↓
Admin dashboard
```

Logout:

```text
signOut()
↓
redirect /admin/login
```

---

# 78. Never Hardcode Password

Dilarang:

```text
admin123
ruangtemupalopo2026
```

di:

- source code;
- frontend;
- README;
- seed production;
- test fixtures yang terdeploy.

Jangan menggunakan:

```env
ADMIN_PASSWORD=...
```

sebagai production auth model.

Gunakan authentication provider.

---

# 79. Environment Variables

Gunakan:

```text
.env.local
.env.example
```

Contoh:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
```

Service role key:

**server only.**

Jangan commit `.env.local`.

---

# 80. Public Environment Variables

Prefix:

```text
NEXT_PUBLIC_
```

hanya boleh digunakan untuk values yang memang aman dikirim ke browser.

Jangan memasukkan secret ke public environment variable.

---

# 81. Mock Development Mode

Mock database boleh dipakai untuk:

- local UI development;
- automated tests;
- demo tanpa Supabase.

Mock bukan production database.

Critical rule:

```text
Production database error
↓
Show error
↓
Retry
```

bukan:

```text
Production DB error
↓
Pretend save succeeded
```

---

# 82. Local Storage Policy

`localStorage` tidak boleh menjadi source of truth untuk:

- events;
- admin authentication;
- photos;
- guestbook;
- voice notes;
- production database.

Boleh dipakai untuk:

- harmless UI preference;
- temporary draft;
- non-sensitive convenience state.

---

# 83. Media Storage Security

Storage harus mengikuti event context.

Contoh:

```text
events/
  {eventId}/
    photos/
    audio/
    frames/
```

Gunakan signed URL untuk resource private bila diperlukan.

Jangan expose credentials storage.

---

# 84. Orphan Media

Antisipasi kondisi:

```text
upload success
↓
database insert fails
```

atau:

```text
database insert succeeds
↓
upload fails
```

System harus memiliki cleanup/retry/reconciliation strategy.

Tidak perlu membuat garbage collector kompleks untuk MVP, tetapi jangan mengabaikan masalah tersebut.

---

# 85. Validation

Gunakan Zod atau equivalent.

Minimum:

```text
eventSchema
frameSchema
guestEntrySchema
uploadSchema
```

Validation harus ada di:

```text
client
+
server
```

Client validation untuk UX.

Server validation untuk security/integrity.

---

# 86. Frame Ownership Validation

Server harus memastikan frame yang dipilih guest memang terdaftar untuk event.

Jangan menerima:

```json
{
  "eventId": "event-a",
  "frameId": "frame-from-event-b"
}
```

Request tersebut harus ditolak.

---

# 87. Event Status Validation

Guest submission hanya boleh dilakukan untuk event yang valid/aktif.

Server harus memeriksa:

```text
event exists
event active
submission allowed
```

---

# 88. Content Security

Guest messages adalah untrusted input.

Render sebagai text.

Hindari raw HTML injection.

Jangan menggunakan `dangerouslySetInnerHTML` untuk guest messages tanpa kebutuhan yang benar-benar teruji dan sanitization yang tepat.

---

# 89. Rate Limiting

Pertimbangkan rate limiting untuk:

```text
guest submission
upload
admin login
public APIs
```

Minimal implementasikan protection yang layak sebelum production.

---

# 90. Timezone

Mitra berada di:

```text
Asia/Makassar
```

Tanggal event harus ditangani secara konsisten.

Jangan membiarkan timezone browser menyebabkan tanggal bergeser.

Database dan display formatting harus mengikuti strategy timezone yang jelas.

---

# 91. Responsive Design

Target widths:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

Prioritas utama:

**smartphone portrait**

karena tamu kemungkinan besar menggunakan smartphone.

---

# 92. Guest Visual Design

Pertahankan karakter prototype:

- premium;
- dark navy;
- modern;
- photographic;
- event-oriented;
- rounded surfaces;
- subtle glass effects;
- elegant typography;
- clear CTA.

Jangan membuat interface guest terasa seperti admin dashboard.

---

# 93. Admin Visual Design

Admin:

- professional;
- clean;
- functional;
- clear;
- information-dense tetapi tidak berantakan.

Guest dan admin boleh mempunyai design system yang sama tetapi hierarchy-nya berbeda.

---

# 94. Existing Visual Direction

Prototype menggunakan:

```text
Plus Jakarta Sans
Playfair Display
Dancing Script
Space Grotesk
```

Jika fonts tersebut tetap digunakan:

- load secara optimal;
- hindari blocking yang tidak diperlukan;
- gunakan fallback.

Prototype sebelumnya juga menggunakan dark navy/blue styling dan glass card/modal patterns.

Pertahankan karakter brand kecuali ada alasan UX/performance yang kuat untuk perubahan.

---

# 95. Accessibility

Wajib:

- semantic HTML;
- labels;
- keyboard support;
- visible focus state;
- accessible dialog;
- accessible buttons;
- sufficient color contrast;
- alt text;
- screen-reader-friendly controls.

Icon-only control harus memiliki accessible label.

---

# 96. Guest Experience

Priority:

```text
1. Speed
2. Clarity
3. Camera usability
4. Touch target
5. Minimal input
6. Visual feedback
7. Reliable upload
```

Guest tidak boleh dipaksa:

- login;
- register;
- memasukkan email;
- mengisi data tidak relevan.

---

# 97. Loading States

Setiap async operation memiliki state.

Contoh:

```text
Loading event...
Preparing camera...
Processing photo...
Uploading photo...
Loading gallery...
```

---

# 98. Error States

Contoh:

```text
Event tidak ditemukan.

Kamera tidak dapat diakses.

Foto belum berhasil diunggah.

Gallery gagal dimuat.
```

Semua harus menyediakan tindakan yang jelas jika memungkinkan:

```text
Try Again
Go Back
```

---

# 99. Empty States

Contoh:

```text
Belum ada event.
[Buat Event]
```

```text
Belum ada foto di gallery.
```

```text
Belum ada frame yang tersedia.
```

---

# 100. Navigation Safety

Guest flow harus aman saat:

- browser back;
- browser forward;
- refresh;
- camera exit;
- page transition.

Camera harus selalu dibersihkan.

---

# 101. Refresh Safety

Jika guest refresh saat:

```text
Welcome
Frame selection
```

state boleh reset.

Jika refresh saat upload:

jangan menghasilkan duplicate entry.

Jika refresh setelah success:

jangan membuat submission kedua.

---

# 102. Camera / Microphone Browser Requirements

Production harus HTTPS.

Camera/microphone membutuhkan secure context pada browser production.

Local development pada localhost dapat digunakan sesuai behavior browser.

---

# 103. Performance

Prioritas:

- fast initial render;
- optimized images;
- lazy gallery images;
- limited JS;
- efficient queries;
- pagination;
- no unnecessary rerender;
- camera smoothness.

Jangan menjadikan seluruh app:

```text
"use client"
```

secara default.

Gunakan Server Components bila sesuai.

---

# 104. Camera Performance

Jangan melakukan expensive React render pada setiap camera frame.

Gunakan:

```text
Canvas
requestAnimationFrame
CSS transforms
```

sesuai kebutuhan.

Live preview harus tetap responsif.

---

# 105. Gallery Performance

Jangan load seluruh event gallery sekaligus jika data besar.

Gunakan:

```text
pagination
atau cursor pagination
```

Lazy load images.

---

# 106. Image Optimization

Gunakan framework/image optimization bila sesuai.

Jangan memuat full-resolution image pada thumbnail.

Gunakan thumbnail/optimized delivery bila diperlukan.

---

# 107. SEO

SEO paling penting pada root/public pages.

Minimal:

```text
title
description
Open Graph
favicon
robots
sitemap
```

Event page tidak harus SEO-heavy jika memang hanya merupakan experience page yang diakses melalui QR.

---

# 108. Content Rules

Jangan mengarang data bisnis.

Jangan hardcode:

- phone;
- Instagram;
- email;
- real prices;
- real testimonials;
- real event names.

Gunakan data yang diberikan atau diverifikasi RUANGTEMU.

Demo data harus jelas:

```text
DEMO DATA
```

---

# 109. Reference Design

Reference visual/interaction untuk layanan dapat diperiksa pada:

[Instagram Reference](https://www.instagram.com/p/DbVJaGzT61m/)

Link tersebut adalah referensi yang diberikan oleh project owner.

Jangan mengklaim detail yang tidak dapat diverifikasi hanya dari repository.

Gunakan sebagai referensi bersama brief mitra dan prototype yang tersedia.

---

# 110. Project Structure

Recommended:

```text
ruangtemu/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   ├── events/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   └── page.tsx
│   │
│   ├── event/
│   │   └── [slug]/
│   │       ├── gallery/
│   │       ├── projection/
│   │       └── qr/
│   │
│   ├── api/
│   │   ├── events/
│   │   ├── entries/
│   │   └── media/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── admin/
│   ├── photobooth/
│   ├── gallery/
│   ├── qr/
│   └── ui/
│
├── lib/
│   ├── db/
│   ├── validation/
│   ├── storage/
│   ├── camera/
│   ├── supabase/
│   ├── frame-canvas.ts
│   ├── audio.ts
│   └── utils.ts
│
├── supabase/
│   └── migrations/
│
├── types/
│   └── index.ts
│
├── docs/
│   ├── AUDIT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── QA.md
│   └── DEPLOYMENT.md
│
├── public/
├── .env.example
├── AGENTS.md
├── README.md
└── package.json
```

Actual structure may follow existing repository if it is already coherent.

Do not create folders unnecessarily.

---

# 111. Existing Repository Compatibility

The current project baseline already menggunakan:

```text
Next.js
React
TypeScript
Tailwind
Supabase
```

and contains modules such as:

```text
lib/db.ts
lib/frame-canvas.ts
lib/audio.ts
lib/supabase.ts
```

serta page/component untuk:

```text
admin
booking
event
gallery
projection
QR
```

Audit actual source before changing architecture.

---

# 112. Booking Module

README sebelumnya memiliki booking/public commercial flow.

Requirement terbaru tidak menjadikan booking sebagai core.

Jika booking module sudah ada:

- jangan hapus sembarangan;
- jangan membuatnya lebih kompleks tanpa kebutuhan;
- pertahankan bila stabil;
- tandai sebagai secondary module.

Core acceptance tetap:

```text
Admin
→ Create Event
→ Unique URL
→ QR
→ Guest Photobooth
```

---

# 113. Package Module

Jika `packages` sudah digunakan oleh booking/public site:

pertahankan bila dibutuhkan oleh existing feature.

Namun package tidak boleh menjadi dependency wajib untuk membuat event Virtual Photobooth jika requirement event hanya membutuhkan:

```text
client
date
frames
```

---

# 114. Customer Module

Customer data boleh dipertahankan jika sudah digunakan.

Namun event creation harus dapat dilakukan tanpa membangun CRM kompleks.

MVP:

```text
Client Name
```

sudah cukup apabila business requirement tidak meminta customer database.

---

# 115. Migration Strategy

Jika schema lama mempunyai:

```text
packages
bookings
events
entries
```

jangan langsung drop.

Gunakan:

```text
inspect
↓
compare
↓
migration plan
↓
add / alter
↓
migrate
↓
verify
```

---

# 116. Destructive Migration

Jangan melakukan:

```sql
DROP TABLE ...
```

hanya untuk “membersihkan”.

Sebelum destructive change:

- backup;
- review dependency;
- document;
- migrate;
- verify.

---

# 117. Admin Event Creation Transaction

Flow:

```text
Validate
↓
Create Event
↓
Assign Frames
↓
Generate/verify slug
↓
Return Event
```

Jika frame assignment gagal, jangan membuat UI mengatakan success sementara event sebenarnya belum lengkap.

Gunakan transaction/rollback strategy yang sesuai.

---

# 118. Frame Removal

Jika frame sudah dipakai oleh event atau submission:

jangan menghapus asset secara permanen jika hal tersebut merusak existing entries.

Lebih aman:

```text
Deactivate
```

---

# 119. Event Delete

Default behavior:

```text
Archive
```

lebih aman daripada hard delete.

Permanent delete harus:

- explicit;
- confirmation;
- server-side protected.

---

# 120. Event Duplication

Future feature.

Jika diimplementasikan:

```text
Event A
↓
Duplicate
↓
New Event ID
↓
New Slug
↓
Copy configuration
↓
Do NOT copy entries
↓
Do NOT copy guest media
```

---

# 121. Public Gallery Visibility

Event dapat memiliki:

```text
PUBLIC
PRIVATE
```

atau equivalent setting.

Private event tidak boleh membuat gallery private menjadi public hanya karena URL diketahui.

---

# 122. Projection Visibility

Projection hanya menampilkan:

```text
approved/public entries
```

dari:

```textcurrent event
```

---

# 123. Admin Gallery

Admin dapat filter:

```text
All
Pending
Approved
Rejected
```

Search:

```text
Guest Name
```

Actions:

```text
Approve
Reject
Hide
Delete
```

---

# 124. Storage Naming

Gunakan ID sebagai filename.

Contoh:

```text
events/{eventId}/photos/{entryId}.webp
events/{eventId}/audio/{entryId}.webm
```

Jangan menjadikan user input sebagai filename utama.

---

# 125. Media Metadata

Simpan:

```text
media_type
mime_type
size_bytes
storage_path
event_id
entry_id
created_at
```

---

# 126. Media Validation Limits

Tetapkan reasonable limits untuk:

```text
frame upload
photo upload
voice note
```

Jangan menerima unlimited file size.

Nilai final harus disesuaikan dengan provider storage dan deployment.

---

# 127. Error Logging

Gunakan server-side logging.

Jangan log:

```text
password
access token
service key
private customer information
```

Production logs harus aman.

---

# 128. API Convention

Jika menggunakan API routes:

```text
success response
```

contoh:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid event data"
  }
}
```

Jangan expose stack trace.

---

# 129. Server Actions

Gunakan Server Actions bila cocok dan lebih sederhana.

Jangan membuat REST endpoint untuk setiap operation tanpa kebutuhan.

---

# 130. State Management

Gunakan:

- React state;
- server state;
- URL state;
- form state.

Jangan menambahkan global state library hanya karena umum.

---

# 131. TypeScript Standards

Gunakan strict typing.

Hindari:

```ts
any
```

kecuali ada alasan yang documented.

Gunakan:

```ts
unknown
```

dan type narrowing bila perlu.

---

# 132. No Magic Strings

Gunakan enum/constants untuk state penting.

Contoh:

```text
DRAFT
ACTIVE
COMPLETED
ARCHIVED
```

harus konsisten antara:

- database;
- server;
- TypeScript;
- UI.

---

# 133. No Dead Code

Setelah migration:

hapus:

- unused functions;
- unused imports;
- duplicate logic;
- dead components;
- dead dependencies.

Jangan meninggalkan dua source of truth.

---

# 134. Testing

## Unit

Test:

- slug generation;
- validation;
- frame calculations;
- crop calculation;
- photo count;
- frame configuration;
- status transitions.

## Integration

Test:

- create event;
- read event;
- assign frame;
- create entry;
- upload metadata;
- moderation;
- authorization.

## E2E

Admin:

```text
Login
→ Create Event
→ Select Frames
→ Save
→ Open Event
→ Verify Event Data
→ Verify QR
```

Guest:

```text
Open Event
→ Guest Name
→ Select Frame
→ Camera
→ Capture
→ Preview
→ Guestbook
→ Submit
→ Success
```

---

# 135. Critical E2E Test

Test paling penting:

```text
Create Event A
Create Event B

Open Event A
Submit Photo A

Open Gallery A
→ Photo A exists

Open Gallery B
→ Photo A does NOT exist
```

Ini adalah critical data-isolation test.

---

# 136. Admin Security Test

Test:

```text
Unauthenticated /admin
→ blocked

Guest tries admin mutation
→ rejected

Guest tries Event A using Frame B
→ rejected

Guest tries to modify event
→ rejected
```

---

# 137. Camera Testing

Real hardware camera tidak selalu bisa diotomatisasi.

Gunakan:

```text
Unit / component mock
+
E2E mocked camera
+
Manual hardware testing
```

Manual test minimum:

- Chrome Android;
- Safari iPhone;
- Chrome desktop;
- Edge desktop.

---

# 138. Manual QA Document

Buat:

```text
docs/QA.md
```

Checklist:

```text
[ ] QR opens correct event
[ ] Client name correct
[ ] Event date correct
[ ] Selected frames correct
[ ] Camera permission
[ ] Multi-shot
[ ] Countdown
[ ] Filters
[ ] Composite
[ ] Preview
[ ] Retake
[ ] Guestbook
[ ] Voice note
[ ] Upload
[ ] Gallery
[ ] Moderation
[ ] Projection
[ ] Mobile
[ ] Desktop
[ ] Refresh
[ ] Back button
[ ] Network failure
```

---

# 139. Real Device Pilot

Sebelum production:

```text
Create event
↓
Generate QR
↓
Print/display QR
↓
Scan using smartphone
↓
Capture photo
↓
Submit
↓
Admin moderation
↓
Gallery
```

Lakukan setidaknya satu pilot realistis.

---

# 140. Build Verification

Sebelum phase dianggap complete:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Jika script tidak tersedia:

tambahkan script yang sesuai.

Do not declare complete hanya karena dev server dapat berjalan.

---

# 141. Regression Testing

Setiap major refactor:

```text
lint
typecheck
test
build
relevant E2E
```

Pastikan fitur existing tidak rusak.

---

# 142. Production Deployment

Target yang direkomendasikan:

```text
Vercel
+
Supabase
```

atau infrastructure equivalent.

Production harus memiliki:

- HTTPS;
- database production;
- storage;
- auth;
- environment variables;
- domain;
- backup;
- error monitoring.

---

# 143. Backup

Minimal:

```text
database backup
storage retention strategy
recovery documentation
```

---

# 144. Deployment Documentation

Buat:

```text
docs/DEPLOYMENT.md
```

Isi:

- environment setup;
- Supabase project;
- migrations;
- storage;
- auth;
- deployment;
- domain;
- rollback;
- backup.

---

# 145. Documentation Set

Maintain:

```text
docs/
├── AUDIT.md
├── ARCHITECTURE.md
├── DATABASE.md
├── QA.md
└── DEPLOYMENT.md
```

Update documentation jika architecture berubah secara material.

---

# 146. AI Agent Operating Rules

Repository dapat dikembangkan menggunakan:

- Antigravity;
- Codex;
- AI coding agent lainnya.

Agent harus bekerja sebagai:

> Senior Full-Stack Engineer + Software Architect + Security Engineer + QA Engineer + UI/UX Engineer

---

# 147. Rule: Inspect Before Change

Sebelum mengubah file:

1. inspect repository;
2. inspect dependencies;
3. inspect architecture;
4. inspect existing implementation;
5. identify reusable logic;
6. identify risk;
7. make implementation plan;
8. implement.

Jangan langsung rewrite.

---

# 148. Rule: Never Blind Rewrite

Dilarang melakukan:

```text
delete project
rewrite everything
ignore existing implementation
```

tanpa audit.

Prototype existing adalah functional reference.

---

# 149. Rule: Never Invent Business Requirements

Jangan membuat fitur hanya karena:

> “photobooth biasanya memiliki fitur ini.”

Feature harus berasal dari:

1. requirement mitra;
2. README;
3. existing prototype;
4. requirement yang jelas dari project owner.

Feature baru boleh diusulkan, tetapi jangan diam-diam menjadi scope utama.

---

# 150. Rule: No Fake Success

Tidak boleh:

```ts
catch {
  return { success: true };
}
```

Jika database atau upload gagal:

return error yang benar.

---

# 151. Rule: No Fake Persistence

Jangan membuat UI mengatakan:

```text
Event berhasil dibuat
```

jika database sebenarnya gagal.

Jangan menyimpan ke mock lalu berpura-pura production berhasil.

---

# 152. Rule: No Hardcoded Event

Jangan:

```ts
const event = {
  name: "Dimas & Sarah",
  date: "24.10.2026"
};
```

sebagai production source of truth.

Gunakan database.

---

# 153. Rule: No Hardcoded Credentials

Jangan menyimpan credential production dalam:

- source;
- README;
- frontend;
- committed `.env`;
- migration;
- demo data.

---

# 154. Rule: Preserve Existing Features

Jika prototype mempunyai fitur yang sedang dimigrasikan:

```text
audit
↓
replace
↓
test
↓
remove old
```

Jangan menghapus sebelum replacement terverifikasi.

---

# 155. Rule: Small Coherent Changes

Prefer:

```text
small phase
↓
test
↓
commit-worthy state
↓
next phase
```

daripada satu giant rewrite.

---

# 156. Phase Development

## PHASE 0 — Audit

Produce:

```text
docs/AUDIT.md
```

Isi:

- current stack;
- current file tree;
- reusable features;
- technical debt;
- localStorage usage;
- mock behavior;
- auth risks;
- database gaps;
- migration risks.

## PHASE 1 — Architecture

Produce:

```text
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Lock:

- routes;
- entities;
- data flow;
- auth;
- storage.

## PHASE 2 — Foundation

Implement:

- Supabase;
- database;
- migrations;
- types;
- auth;
- server data access.

## PHASE 3 — Admin Event Management

Implement:

- login;
- dashboard;
- create event;
- edit event;
- status;
- frame assignment;
- event URL;
- QR.

## PHASE 4 — Guest Event

Implement:

- event loading;
- event info;
- guest session;
- frame selection.

## PHASE 5 — Camera

Implement:

- permissions;
- camera;
- countdown;
- multi-shot;
- filters;
- retake.

## PHASE 6 — Frame Renderer

Implement:

- layouts;
- high-resolution composite;
- overlays;
- text;
- filters.

## PHASE 7 — Upload + Guestbook

Implement:

- storage;
- media metadata;
- guestbook;
- voice note;
- submission.

## PHASE 8 — Gallery

Implement:

- gallery;
- moderation;
- search/filter;
- download.

## PHASE 9 — Projection / QR Print

Implement:

- projection;
- QR print;
- fullscreen.

## PHASE 10 — Security

Audit:

- auth;
- authorization;
- RLS;
- storage;
- validation;
- uploads;
- rate limit.

## PHASE 11 — QA

Run:

- unit;
- integration;
- E2E;
- manual device testing.

## PHASE 12 — Pilot

Run realistic event simulation.

## PHASE 13 — Production

Deploy.

---

# 157. First Agent Task

Saat pertama kali membuka repository:

**JANGAN langsung membangun fitur.**

Lakukan:

```text
1. Read README
2. Inspect package.json
3. Inspect source
4. Inspect Supabase migrations
5. Inspect existing prototype
6. Identify localStorage
7. Identify mock DB
8. Identify authentication
9. Identify camera
10. Identify frame renderer
11. Identify QR
12. Identify gallery
```

Kemudian buat:

```text
docs/AUDIT.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

---

# 158. Audit Report Format

Gunakan:

```text
CURRENT STACK
CURRENT FILE STRUCTURE
CURRENT FEATURES
REUSABLE FEATURES
LEGACY FEATURES
DATABASE
AUTHENTICATION
STORAGE
SECURITY RISKS
PERFORMANCE RISKS
MIGRATION PLAN
OPEN ISSUES
```

---

# 159. Agent Decision Policy

Jika ada beberapa pilihan implementation:

prioritas:

```text
1. Security
2. Data integrity
3. Correctness
4. Existing functionality
5. Simplicity
6. Maintainability
7. UX
8. Performance
9. Nice-to-have
```

Jangan mengorbankan security/data integrity demi visual polish.

---

# 160. Agent Checkpoint

Setelah phase:

```text
COMPLETED
CHANGED FILES
TESTS RUN
TESTS PASSED
KNOWN ISSUES
NEXT PHASE
```

Jangan menyatakan:

```text
Everything is perfect
```

tanpa evidence.

---

# 161. Definition of Done

Feature hanya complete jika sesuai scope dan mempertimbangkan:

```text
UI
+
State
+
Validation
+
Persistence
+
Authorization
+
Error Handling
+
Loading
+
Empty State
+
Responsive
+
Testing
```

---

# 162. MVP Acceptance Criteria — Admin

```text
[ ] Secure admin login
[ ] Dashboard
[ ] Create Event
[ ] Edit Event
[ ] Activate Event
[ ] Complete Event
[ ] Archive Event
[ ] Select 1–3 frames
[ ] View event URL
[ ] Copy event URL
[ ] Generate QR
[ ] Open Event
[ ] View Gallery
[ ] Moderate entries
```

---

# 163. MVP Acceptance Criteria — Guest

```text
[ ] Open event from QR
[ ] Correct event name
[ ] Correct event date
[ ] Correct frame list
[ ] Guest name
[ ] Select frame
[ ] Camera permission
[ ] Camera preview
[ ] Countdown
[ ] Multi-shot
[ ] Filter
[ ] Composite
[ ] Preview
[ ] Retake
[ ] Guestbook
[ ] Optional voice note
[ ] Submit
[ ] Success state
[ ] Download
[ ] Gallery
```

---

# 164. MVP Acceptance Criteria — Data

```text
[ ] Every event has unique UUID
[ ] Every event has unique slug
[ ] Every event has isolated frame assignment
[ ] Every entry has event_id
[ ] Photo storage uses event context
[ ] Voice storage uses event context
[ ] Gallery is event-specific
[ ] Event A cannot read Event B data
```

---

# 165. MVP Acceptance Criteria — Security

```text
[ ] No hardcoded passwords
[ ] No secrets in Git
[ ] Service role key is server-only
[ ] Admin routes protected
[ ] Server-side authorization
[ ] RLS configured
[ ] Server-side validation
[ ] Upload validation
[ ] Guest content treated as untrusted
[ ] No fake success on DB failure
```

---

# 166. Core Business Acceptance Test

The most important test is:

```text
RUANGTEMU receives new client
        ↓
Admin opens dashboard
        ↓
Create Event
        ↓
Input client
        ↓
Input event date
        ↓
Select 2–3 frames
        ↓
Save
        ↓
System generates unique URL
        ↓
System generates QR
        ↓
QR is scanned
        ↓
Correct event opens
        ↓
Correct name/date/frame appears
        ↓
Guest takes photo
        ↓
Photo is stored
        ↓
Photo belongs to correct event
        ↓
Gallery displays photo
```

No source code modification should be necessary when repeating the flow for a new client.

---

# 167. Example Multi-Client Test

## Event A

```text
Dimas & Sarah
24 October 2026
Frames:
Navy
Gold
White
```

## Event B

```text
Andi & Putri
10 November 2026
Frames:
Floral
Pink
Minimal
```

Expected:

```text
/event/dimas-sarah
→ only Event A frames/data

/event/andi-putri
→ only Event B frames/data
```

---

# 168. Production Readiness Gate

Do not declare production-ready unless:

```text
Database configured
+
Auth configured
+
RLS configured
+
Storage configured
+
Event creation works
+
Unique URL works
+
QR works
+
Camera works
+
Composite works
+
Upload works
+
Gallery works
+
Moderation works
+
Security reviewed
+
Build passes
+
E2E critical flow passes
+
Real-device test passes
```

---

# 169. Commercial Product Principle

The product is not merely:

> “a website with a camera.”

It is:

> **an event-based Virtual Photobooth management system that allows RUANGTEMU to create a reusable, isolated digital photobooth experience for every client.**

---

# 170. Final System Model

```text
                   RUANGTEMU
                       │
                       ▼
                ADMIN DASHBOARD
                       │
                       ▼
                 CREATE EVENT
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   CLIENT DATA     EVENT DATE      2–3 FRAMES
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                  EVENT RECORD
                       │
               ┌───────┴───────┐
               ▼               ▼
          UNIQUE URL         QR CODE
               │               │
               └───────┬───────┘
                       ▼
                 GUEST SCANS
                       │
                       ▼
                  EVENT PAGE
                       │
                       ▼
                 SELECT FRAME
                       │
                       ▼
                    CAMERA
                       │
                       ▼
                 CAPTURE PHOTOS
                       │
                       ▼
               CANVAS COMPOSITE
                       │
                       ▼
                   PREVIEW
                       │
                       ▼
              MESSAGE / VOICE NOTE
                       │
                       ▼
                    UPLOAD
                       │
                       ▼
                 EVENT ENTRY
                       │
                  ┌────┴────┐
                  ▼         ▼
             MODERATION   GALLERY
                            │
                            ▼
                       PROJECTION
```

---

# 171. Final Principle for AI Agents

Selalu ingat:

```text
ONE APPLICATION
        ↓
MANY EVENTS
        ↓
UNIQUE EVENT CONFIGURATION
        ↓
UNIQUE EVENT URL
        ↓
UNIQUE QR CODE
        ↓
MANY GUEST SESSIONS
        ↓
ISOLATED EVENT DATA
```

Jika client baru datang besok, admin harus cukup:

```text
Create Event
→ Input Client
→ Input Date
→ Select Frames
→ Save
→ Generate QR
```

Tidak boleh ada perubahan source code.

---

# 172. Final Instruction

**Audit repository terlebih dahulu.**

Jangan mulai dengan rewrite.

Setelah audit:

```text
1. Document existing system
2. Identify migration gaps
3. Lock architecture
4. Implement database foundation
5. Implement authentication
6. Implement event management
7. Implement unique URL and QR
8. Implement guest photobooth
9. Implement frame renderer
10. Implement upload and guestbook
11. Implement gallery
12. Implement moderation
13. Implement projection
14. Test
15. Security review
16. Pilot
17. Deploy
```

**Core success criteria:**

> RUANGTEMU dapat membuat event Virtual Photobooth baru untuk client baru hanya melalui dashboard, menghasilkan URL + QR yang unik, dan tamu dapat menggunakan photobooth dari event tersebut tanpa login dan tanpa developer intervention.

---

# © 2026 RUANGTEMU PHOTOBOOTH

Independent Project  
Program Studi Teknologi Rekayasa Multimedia  
Konsentrasi Web Design  
Politeknik Dewantara

**Mitra:** RUANGTEMU PHOTOBOOTH  
**Lokasi:** Kota Palopo, Sulawesi Selatan, Indonesia
