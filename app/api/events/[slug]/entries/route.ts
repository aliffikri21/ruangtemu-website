import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug, getEventEntries, createEntry, clearEventEntries } from "@/lib/db";
import { saveEntryPhoto, saveVoiceNote } from "@/lib/save-frame";
import { verifyAdminToken } from "@/lib/auth";

// Memaksa Next.js agar selalu menjalankan fungsi ini secara dinamis di server (tidak dicache statis)
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * FUNGSI SANITASI TEKS (Pencegah Serangan XSS / Cross-Site Scripting):
 * Menghapus tag HTML seperti <script> atau <iframe> dari input tamu sebelum disimpan ke database,
 * dan membatasi panjang karakter agar database tidak menerima teks raksasa (spam DoS).
 */
function sanitizeText(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  const stripped = input.replace(/<[^>]*>?/gm, "").trim();
  return stripped.slice(0, maxLength);
}

// =========================================================================================
// 1. METHOD GET: Mengambil Seluruh Foto Galeri Suatu Acara
// Alur: Browser tamu/layar proyektor membuka halaman galeri -> fetch GET ke URL ini ->
//       Server mencari event berdasarkan slug -> query foto ke database -> kirim JSON
// =========================================================================================
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // Langkah 1: Ambil parameter slug dari URL (contoh: /api/events/wedding-aldi-maya/entries)
    const { slug } = await context.params;

    // Langkah 2: Cari data acara di database berdasarkan slug tersebut
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ success: false, error: "Event tidak ditemukan" }, { status: 404 });
    }

    // Langkah 3: Ambil semua data foto tamu khusus untuk event ID ini (Data Isolation)
    const entries = await getEventEntries(event.id);

    // Langkah 4: Kembalikan data foto dalam format JSON ke browser dengan header no-cache
    return NextResponse.json(
      { success: true, entries },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Server error" }, { status: 500 });
  }
}

// =========================================================================================
// 2. METHOD POST: Tamu Mengunggah Foto Hasil Photobooth & Pesan Ucapan
// Alur: Tamu selesai memotret di HP -> Canvas menyusun frame foto -> Browser kirim JSON POST ->
//       Server memvalidasi keaktifan event -> simpan file gambar & audio -> simpan ke database
// =========================================================================================
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // Langkah 1: Ambil slug acara dari URL dan pastikan acaranya ada di database
    const { slug } = await context.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ success: false, error: "Event tidak ditemukan" }, { status: 404 });
    }

    // Langkah 2: Validasi apakah acara masih aktif (Tolak jika status sudah selesai/arsip)
    if (!event.is_active || event.status === "COMPLETED" || event.status === "ARCHIVED") {
      return NextResponse.json(
        { success: false, error: "Sesi photobooth untuk event ini sudah tidak aktif" },
        { status: 403 }
      );
    }

    // Langkah 3: Ekstraksi data body JSON yang dikirimkan oleh browser smartphone tamu
    const body = await req.json();

    // Langkah 4: Validasi wajib adanya data foto (Base64 Data-URL dari Canvas)
    if (!body.photo_url || typeof body.photo_url !== "string") {
      return NextResponse.json({ success: false, error: "Foto wajib ada dan valid" }, { status: 400 });
    }

    // Langkah 5: Pembatasan ukuran muatan file (Foto max ~25MB Base64, Audio max 10MB)
    if (body.photo_url.length > 25 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Ukuran foto terlalu besar" }, { status: 413 });
    }
    if (body.voice_note_url && typeof body.voice_note_url === "string" && body.voice_note_url.length > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Ukuran voice note terlalu besar" }, { status: 413 });
    }

    // Langkah 6: Bersihkan dan batasi input teks dari tamu (Cegah injeksi script XSS)
    const guest_name = sanitizeText(body.guest_name, 50) || "Tamu";
    const message = sanitizeText(body.message, 500);
    const filter_used = sanitizeText(body.filter_used, 30) || "normal";

    // Langkah 7: Simpan file fisik (foto & voice note) ke Object Storage (Supabase Storage / disk)
    // Fungsi ini akan mengubah string Base64 menjadi file nyata dengan nama UUID yang aman
    const savedPhotoUrl = await saveEntryPhoto(body.photo_url, `${event.slug}-photo`);
    const savedVoiceNoteUrl = body.voice_note_url
      ? await saveVoiceNote(body.voice_note_url, `${event.slug}-audio`)
      : undefined;

    // Langkah 8: Simpan baris rekaman baru ke tabel PostgreSQL `gallery_entries` via Supabase
    const entry = await createEntry({
      event_id: event.id,
      event_slug: event.slug,
      guest_name,
      photo_url: savedPhotoUrl,
      voice_note_url: savedVoiceNoteUrl,
      message,
      filter_used: (filter_used as any) || "normal",
    });

    // Langkah 9: Respon ke browser tamu bahwa foto berhasil tersimpan (status HTTP 200)
    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error("Error creating entry:", error);
    return NextResponse.json({ success: false, error: error?.message || "Gagal menyimpan foto" }, { status: 500 });
  }
}

// =========================================================================================
// 3. METHOD DELETE: Admin Mengosongkan / Mereset Seluruh Foto Galeri Suatu Acara
// Alur: Tombol "Reset Galeri" di Dashboard Admin ditekan -> kirim request DELETE ->
//       Server verifikasi cookie admin -> hapus semua data foto event di database
// =========================================================================================
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    // Langkah 1: Verifikasi keamanan - Hanya akun admin yang boleh menghapus galeri
    const sessionToken = req.cookies.get("rt_admin_session")?.value;
    const isAdmin = await verifyAdminToken(sessionToken);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Diperlukan akses admin" },
        { status: 401 }
      );
    }

    // Langkah 2: Cari event berdasarkan slug
    const { slug } = await context.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ success: false, error: "Event tidak ditemukan" }, { status: 404 });
    }

    // Langkah 3: Jalankan query SQL DELETE untuk menghapus entri foto milik event ini
    await clearEventEntries(event.id, event.slug);

    return NextResponse.json({
      success: true,
      message: `Semua foto galeri untuk ${event.title} berhasil dibersihkan`,
    });
  } catch (error: any) {
    console.error("Error clearing entries:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal membersihkan galeri" },
      { status: 500 }
    );
  }
}
