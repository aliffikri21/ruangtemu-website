<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop skill for the task:
- Core filter, always on: `antislop`
- UI / visual: `antislop-ui`
- Copy & text: `antislop-copywriting`
- People / accessibility: `antislop-human`
- Mobile / responsive layout: `antislop-layoutmobile`
- Code comments: `antislop-code`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->

# MOBILE-FIRST MVP PRIORITY — RUANGTEMU VIRTUAL PHOTOBOOTH

## OBJECTIVE

Prioritas utama project untuk pilot event pada **5 Oktober 2026** adalah membuat pengalaman **Virtual Photobooth berbasis smartphone** yang stabil dan mudah digunakan oleh tamu.

Untuk tahap ini, **MOBILE IS THE PRIMARY PLATFORM**.

Jangan menghabiskan waktu development untuk desktop polish, admin dashboard kompleks, landing page kompleks, booking, payment, CRM, analytics, atau fitur commercial tambahan sebelum mobile photobooth stabil.

---

# 1. PRIMARY TARGET DEVICE

Prioritaskan:

1. Android smartphone — Chrome
2. iPhone — Safari
3. Android/iOS browser modern lainnya

Target utama viewport:

```text
320 × 568
360 × 640
375 × 667
390 × 844
393 × 852
412 × 915
430 × 932
```

Target ideal design width:

```text
360–430px
```

Desktop bukan primary target pada MVP.

---

# 2. MOBILE-FIRST RULE

Semua keputusan UI/UX harus dimulai dari mobile.

Jangan:

```text
Desktop design
↓
dikecilkan ke mobile
```

Gunakan:

```text
Mobile design
↓
ditingkatkan ke tablet/desktop
```

Desktop cukup tetap usable.

Desktop tidak perlu mendapatkan visual polish yang sama dengan mobile pada tahap MVP.

---

# 3. GUEST EXPERIENCE IS THE CORE PRODUCT

Core flow:

```text
QR
 ↓
EVENT PAGE
 ↓
GUEST NAME
 ↓
FRAME SELECTION
 ↓
CAMERA
 ↓
COUNTDOWN
 ↓
PHOTO CAPTURE
 ↓
COMPOSITE
 ↓
PREVIEW
 ↓
RETAKE / CONTINUE
 ↓
GUESTBOOK
 ↓
SUBMIT
 ↓
SUCCESS
```

Tamu tidak boleh:

* login;
* register;
* mengisi form panjang;
* membuka dashboard;
* mengubah konfigurasi event;
* mengubah frame configuration secara bebas.

---

# 4. MOBILE UX PRINCIPLES

Prioritas:

```text
1. Fast
2. Simple
3. Large touch target
4. Clear visual hierarchy
5. Minimal typing
6. Minimal scrolling
7. Camera reliability
8. Stable upload
```

Setiap screen harus mempunyai satu primary action yang jelas.

Contoh:

```text
[ MULAI PHOTOBOOTH ]
```

atau:

```text
[ LANJUT ]
```

atau:

```text
[ AMBIL FOTO ]
```

---

# 5. TOUCH TARGET

Button/interaktif control harus nyaman disentuh.

Target minimum sekitar:

```text
44 × 44px
```

Ideal:

```text
48 × 48px
```

Jangan membuat tombol penting terlalu kecil.

Hindari control yang membutuhkan hover.

---

# 6. NO HOVER DEPENDENCY

Jangan menjadikan hover sebagai satu-satunya feedback.

Bad:

```text
hover → reveal action
```

Good:

```text
tap → action visible
```

Semua interaksi utama harus bekerja melalui touch.

---

# 7. VIEWPORT

Gunakan viewport mobile yang benar.

Perhatikan:

```text
svh
lvh
dvh
safe-area-inset
```

Gunakan layout yang aman terhadap browser mobile modern.

Jangan mengandalkan hanya:

```css
height: 100vh;
```

untuk fullscreen camera UI.

---

# 8. SAFE AREA

Pada device dengan notch/home indicator gunakan safe-area inset.

Contoh:

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

Jangan menempatkan tombol penting terlalu dekat dengan:

* notch;
* browser UI;
* home indicator.

---

# 9. MOBILE CAMERA PAGE

Camera screen adalah salah satu bagian paling penting.

Target layout:

```text
┌─────────────────────────────┐
│ Event / Progress             │
│                             │
│                             │
│       CAMERA PREVIEW        │
│                             │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│                             │
│       [ AMBIL FOTO ]        │
│                             │
└─────────────────────────────┘
```

Camera harus menggunakan sebanyak mungkin viewport.

Jangan membuat camera preview kecil seperti desktop card layout.

---

# 10. CAMERA PREVIEW

Gunakan:

```html
<video
  autoplay
  playsinline
  muted
/>
```

Pastikan camera bekerja pada mobile browser.

Default target:

```text
front-facing camera
```

karena user mengambil selfie/group photo.

Jika browser/device memungkinkan, sediakan camera switching sebagai enhancement.

---

# 11. CAMERA PERMISSION

Saat camera belum aktif:

```text
KAMERA DIPERLUKAN

Izinkan akses kamera browser
untuk mulai mengambil foto.

[ AKTIFKAN KAMERA ]
```

Jika permission ditolak:

```text
Kamera belum diizinkan.

Buka pengaturan izin kamera
pada browser kemudian coba lagi.
```

Jangan tampilkan error teknis seperti:

```text
NotAllowedError
```

kepada guest.

---

# 12. CAMERA CLEANUP

Camera harus dihentikan saat:

* user meninggalkan camera;
* capture selesai jika camera tidak lagi diperlukan;
* user kembali ke frame selection;
* session selesai;
* component unmount.

Gunakan:

```ts
stream.getTracks().forEach(track => track.stop());
```

Pastikan tidak ada camera stream zombie.

---

# 13. MOBILE CAMERA PERFORMANCE

Jangan melakukan re-render React penuh setiap frame kamera.

Gunakan:

* video element;
* CSS transform;
* Canvas hanya ketika diperlukan;
* requestAnimationFrame bila diperlukan.

Live preview harus tetap smooth.

---

# 14. MOBILE PHOTO CAPTURE

Pipeline:

```text
Video
 ↓
Capture
 ↓
Canvas
 ↓
Crop / Cover
 ↓
Filter
 ↓
Frame
 ↓
Final Composite
```

Jangan melakukan image stretching.

Aspect ratio harus dipertahankan.

---

# 15. PHOTO RESOLUTION

Jangan selalu menggunakan resolusi maksimum kamera karena dapat menyebabkan:

* memory spike;
* browser crash;
* upload lambat;
* iPhone Safari instability.

Gunakan output resolution yang cukup untuk digital sharing.

Jika high-resolution output dibutuhkan:

gunakan ukuran yang masuk akal dan test pada device nyata.

---

# 16. DEVICE PIXEL RATIO

Pertimbangkan `devicePixelRatio`.

Jangan membuat canvas terlalu besar hanya karena device memiliki DPR tinggi.

Gunakan cap yang reasonable untuk menghindari memory issue.

Contoh pendekatan:

```text
effective DPR = min(devicePixelRatio, reasonableLimit)
```

---

# 17. MULTI-SHOT UX

Jika frame membutuhkan 3 foto:

```text
FOTO 1 / 3

3
2
1
📸
```

kemudian:

```text
FOTO 2 / 3

3
2
1
📸
```

dan seterusnya.

User harus selalu tahu:

```text
berapa foto
sudah diambil
berapa yang tersisa
```

---

# 18. COUNTDOWN

Countdown harus:

* sangat besar;
* center;
* mudah dilihat;
* tidak menghalangi framing secara berlebihan.

Contoh:

```text
3
2
1
```

Gunakan animasi yang ringan.

Jangan membuat countdown berat atau menyebabkan dropped frames.

---

# 19. FRAME SELECTION MOBILE

Jangan membuat frame cards terlalu kecil.

Gunakan:

```text
vertical scrolling
```

Contoh:

```text
Pilih Frame

┌─────────────┐
│             │
│   FRAME 1   │
│             │
└─────────────┘

┌─────────────┐
│             │
│   FRAME 2   │
│             │
└─────────────┘

┌─────────────┐
│             │
│   FRAME 3   │
│             │
└─────────────┘
```

2–3 frame harus bisa dipilih dengan mudah.

---

# 20. MOBILE TYPOGRAPHY

Body text harus mudah dibaca tanpa zoom.

Primary:

```text
16px-ish
```

Small helper text:

```text
12–14px
```

Primary heading:

```text
24–32px
```

Camera countdown:

```text
64px+
```

Sesuaikan berdasarkan actual viewport.

---

# 21. DO NOT DISABLE ACCESSIBLE ZOOM

Jangan menggunakan:

```html
user-scalable=no
```

hanya demi visual.

Accessibility harus tetap diperhatikan.

---

# 22. MOBILE FORM UX

Guest hanya membutuhkan form minimal.

Prioritas:

```text
Nama
```

Jika guestbook:

```text
Pesan
```

Voice note optional.

Jangan menanyakan:

```text
email
alamat
nomor telepon
password
```

kepada guest kecuali requirement berubah.

---

# 23. MOBILE INPUT

Gunakan:

```html
autocomplete
inputmode
```

bila relevan.

Nama:

```text
autocomplete="name"
```

Jangan membuat input dengan height terlalu kecil.

---

# 24. MOBILE NAVIGATION

Guest page tidak memerlukan complex navbar.

Gunakan:

* back;
* close;
* progress;
* primary CTA.

Jangan membuat dashboard-style sidebar pada guest experience.

---

# 25. MOBILE SCROLLING

Hindari nested scroll container berlebihan.

Ideal:

```text
one primary page scroll
```

Kecuali camera/fullscreen membutuhkan special layout.

---

# 26. CAMERA ORIENTATION

Target:

```text
Portrait
```

Jika landscape membuat layout camera rusak:

tampilkan guidance:

```text
Putar kembali HP ke posisi portrait
```

Jangan membuat camera UI overflow.

---

# 27. MOBILE RESULT PAGE

Setelah composite selesai:

```text
┌─────────────────────────────┐
│                             │
│       PHOTO RESULT          │
│                             │
│      [FINAL PHOTO]          │
│                             │
├─────────────────────────────┤
│ [ DOWNLOAD FOTO ]           │
│                             │
│ [ AMBIL FOTO LAGI ]         │
└─────────────────────────────┘
```

Jangan langsung mengirim user ke halaman lain tanpa menunjukkan hasil.

---

# 28. MOBILE DOWNLOAD

Download action harus mudah ditemukan.

Pada browser mobile, gunakan behavior download/share yang sesuai platform.

Jika Web Share API tersedia:

```text
Share
```

boleh ditampilkan.

Jika tidak:

```text
Download
```

tetap tersedia.

Jangan bergantung hanya pada Web Share API.

---

# 29. WEB SHARE

Gunakan Web Share API hanya jika supported.

Check:

```ts
navigator.share
```

Jika tidak tersedia, fallback.

Jangan membuat entire success page gagal hanya karena Web Share tidak tersedia.

---

# 30. MOBILE GUESTBOOK

Guestbook harus sederhana.

Contoh:

```text
Tulis ucapan untuk acara ini

[________________________]

[ KIRIM UCAPAN ]
```

Voice note:

```text
🎤 Rekam Voice Note
```

Voice note adalah optional.

---

# 31. VOICE NOTE MOBILE

Jika microphone tidak tersedia:

guest tetap dapat submit tanpa audio.

Jangan memblokir entire flow.

Maximum duration:

```text
60 seconds
```

atau mengikuti event configuration.

---

# 32. NETWORK EXPERIENCE

Guest kemungkinan menggunakan mobile internet.

Optimize:

```text
small JS bundle
optimized assets
compressed images
lazy loading
```

Jangan men-download asset besar yang tidak digunakan.

---

# 33. UPLOAD UX

Setelah submit:

```text
Menyimpan foto...
```

dengan progress/feedback.

Jangan membuat guest mengira aplikasi freeze.

---

# 34. UPLOAD RETRY

Jika upload gagal:

```text
Foto belum berhasil disimpan.

Coba lagi.
```

Tampilkan:

```text
[ COBA LAGI ]
```

dan jangan menghapus hasil foto selama masih memungkinkan untuk retry.

---

# 35. MOBILE ERROR RECOVERY

Setiap critical error harus memiliki recovery.

Contoh:

```text
Camera Error
[ Coba Lagi ]
[ Kembali ]
```

```text
Upload Error
[ Coba Lagi ]
```

---

# 36. MOBILE LOADING

Gunakan mobile-friendly loading.

Jangan hanya mengandalkan spinner kecil.

Contoh:

```text
Memproses foto...
Mohon tunggu sebentar.
```

---

# 37. MOBILE BRAND EXPERIENCE

Guest-facing design harus terasa:

* premium;
* elegant;
* fun;
* photographic;
* modern.

Gunakan brand visual RUANGTEMU.

Jangan membuat interface terlalu “dashboard”.

---

# 38. MOBILE COLOR

Pertahankan dark navy visual direction dari prototype.

Namun pastikan:

* text readable;
* button contrast tinggi;
* camera control terlihat;
* selected frame jelas.

---

# 39. MOBILE FRAME SELECTION FEEDBACK

Saat selected:

```text
border
check icon
label
```

harus langsung terlihat.

Guest tidak boleh bertanya:

> “Frame mana yang sedang saya pilih?”

---

# 40. MOBILE BUTTON HIERARCHY

Gunakan satu primary CTA per step.

Contoh:

```text
Primary:
[ LANJUT ]

Secondary:
[ KEMBALI ]
```

Jangan membuat 5 primary buttons sekaligus.

---

# 41. NO DESKTOP-FIRST IMPLEMENTATION

Agent dilarang membuat:

```text
desktop grid
→ kemudian mengecilkan semua ke mobile
```

Sebaliknya:

```text
mobile layout
→ breakpoint enhancement desktop
```

---

# 42. DESKTOP SCOPE

Desktop hanya harus:

* dapat membuka event;
* tidak rusak;
* tidak overflow;
* dapat digunakan untuk development/debugging.

Desktop visual polish adalah prioritas rendah untuk MVP.

---

# 43. ADMIN SCOPE DURING PILOT

Jika admin dashboard belum selesai:

gunakan konfigurasi event yang sudah ada/seeded untuk pilot.

Jangan menunda mobile photobooth hanya karena dashboard belum sempurna.

Namun jangan membuang architecture multi-event.

---

# 44. PILOT EVENT MODE

Buat satu event yang benar-benar dapat digunakan pada tanggal:

**5 Oktober 2026**

Contoh development flow:

```text
Create Event
↓
Configure Client
↓
Configure Date
↓
Select 2–3 Frames
↓
Generate Event URL
↓
Generate QR
↓
Test QR on Android
↓
Test QR on iPhone
```

---

# 45. MOBILE PILOT CHECKLIST

Sebelum event:

```text
[ ] QR scan Android
[ ] QR scan iPhone
[ ] Event information correct
[ ] Frame list correct
[ ] Camera opens
[ ] Front camera correct
[ ] Countdown works
[ ] Multi-shot works
[ ] Frame composite correct
[ ] Preview correct
[ ] Retake works
[ ] Download works
[ ] Share works if supported
[ ] Guestbook works
[ ] Upload works
[ ] Gallery works
[ ] No camera remains active
```

---

# 46. REAL DEVICE TESTING

Do not rely only on desktop browser emulation.

Test with actual:

```text
Android phone
iPhone
```

Emulator/device emulation is useful but not sufficient for:

* camera;
* microphone;
* Safari behavior;
* mobile browser memory;
* real network.

---

# 47. MOBILE TEST ORDER

Test first:

```text
1. iPhone Safari
2. Android Chrome
3. Desktop Chrome
```

The first two are the real acceptance environments for the guest experience.

---

# 48. PERFORMANCE CHECK

Before pilot:

test:

```text
cold load
camera startup
capture
composite
upload
gallery
```

with:

```text
mobile data
Wi-Fi
```

Do not only test on fast development Wi-Fi.

---

# 49. MOBILE MEMORY SAFETY

Avoid:

```text
multiple huge base64 strings
multiple full-resolution canvases
unreleased Blob URLs
unreleased video streams
```

Clean temporary media.

---

# 50. NO BASE64 LOCAL STORAGE

Do not store final photo/audio permanently in:

```text
localStorage
```

Use server/object storage.

Temporary in-memory Blob/File is acceptable during the session.

---

# 51. MVP CORE FILES

Prioritize:

```text
event page
camera module
frame renderer
upload service
guestbook form
gallery
```

Everything else is secondary.

---

# 52. MVP DEVELOPMENT ORDER

Build in this exact order:

```text
1. Event page
2. Event data loading
3. Mobile UI
4. Frame selection
5. Camera
6. Countdown
7. Multi-shot
8. Frame renderer
9. Preview
10. Retake
11. Download
12. Guestbook
13. Upload
14. Gallery
15. Error handling
16. Real-device testing
```

Only after this is stable:

```text
Admin
Projection
Analytics
Commercial site
Booking
```

---

# 53. MOBILE DEFINITION OF DONE

The mobile MVP is complete only when a real user can:

```text
Scan QR
↓
Open event
↓
See correct event info
↓
Choose one of the assigned frames
↓
Allow camera
↓
Take all required photos
↓
Generate final framed photo
↓
Review result
↓
Retake if needed
↓
Submit
↓
Photo reaches correct event
↓
Open gallery
```

without developer intervention.

---

# 54. CRITICAL ISOLATION TEST

Create:

```text
Event A
Event B
```

Then:

```text
Photo submitted to A
```

must appear only on:

```text
Event A
```

and never on:

```text
Event B
```

---

# 55. FINAL PILOT ACCEPTANCE TEST

The most important test before 5 October 2026:

```text
PHONE
 ↓
SCAN QR
 ↓
EVENT
 ↓
SELECT FRAME
 ↓
CAMERA
 ↓
3/4 SHOTS
 ↓
COMPOSITE
 ↓
RESULT
 ↓
DOWNLOAD
 ↓
SUBMIT
 ↓
GALLERY
```

Repeat this flow on:

```text
Android Chrome
iPhone Safari
```

---

# 56. AGENT PRIORITY RULE

When choosing between:

```text
desktop polish
vs
mobile camera reliability
```

choose:

```text
MOBILE CAMERA RELIABILITY
```

When choosing between:

```text
admin dashboard polish
vs
mobile upload reliability
```

choose:

```text
MOBILE UPLOAD RELIABILITY
```

When choosing between:

```text
new feature
vs
fixing mobile regression
```

choose:

```text
FIX MOBILE REGRESSION
```

---

# 57. DO NOT EXPAND SCOPE

Until the mobile MVP passes real-device testing, do NOT spend the main development effort on:

* payment;
* booking;
* CRM;
* analytics;
* projection;
* complex admin;
* advanced SEO;
* desktop redesign;
* complex animation;
* unnecessary dependencies.

---

# 58. FINAL AGENT DIRECTIVE

For this phase, think of RUANGTEMU as:

> **A mobile web camera experience accessed through QR Code.**

Not:

> a general-purpose desktop web application.

The success of this phase is measured by:

```text
REAL PHONE
+
REAL CAMERA
+
REAL EVENT
+
REAL QR
+
REAL PHOTO
+
REAL UPLOAD
```

If the mobile guest flow is reliable, the MVP is successful.

Do not sacrifice this flow for secondary features.
