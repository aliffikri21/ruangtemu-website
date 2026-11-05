import { NextRequest, NextResponse } from "next/server";
import { getBookings, createBooking, updateBooking, deleteBooking } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// =========================================================================================
// PENGATURAN RATE LIMITER (Pencegah Spam Formulir Pemesanan)
// Membatasi setiap alamat IP agar maksimal hanya boleh submit 5 reservasi per 10 menit
// =========================================================================================
const bookingAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_BOOKINGS_PER_WINDOW = 5;
const BOOKING_WINDOW_MS = 10 * 60 * 1000; // 10 menit

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

// =========================================================================================
// 1. METHOD GET: Mengambil Daftar Semua Reservasi Pemesanan Klien (Khusus Admin)
// Alur: Dashboard Admin membuka tab "Reservasi & Booking" -> fetch GET ke rute ini ->
//       Server cek hak admin -> query ke tabel `bookings` -> kembalikan list reservasi
// =========================================================================================
export async function GET(req: NextRequest) {
  try {
    // Verifikasi sesi cookie admin
    const sessionToken = req.cookies.get("rt_admin_session")?.value;
    const isAdmin = await verifyAdminToken(sessionToken);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Diperlukan akses admin" }, { status: 401 });
    }

    // Ambil data seluruh pemesanan dari database
    const bookings = await getBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

// =========================================================================================
// 2. METHOD POST: Pengunjung Mengisi Formulir Booking Paket di Halaman Web Publik
// Alur: Pengunjung mengisi nama, WhatsApp, tanggal pesta, paket yang dipilih di web ->
//       Server periksa rate limiter -> validasi kolom wajib -> simpan ke database `bookings`
// =========================================================================================
export async function POST(req: NextRequest) {
  try {
    // Langkah 1: Cek batas spam pengiriman dari IP yang sama
    const ip = getClientIp(req);
    const now = Date.now();
    const record = bookingAttempts.get(ip);

    if (record) {
      if (now < record.resetAt) {
        if (record.count >= MAX_BOOKINGS_PER_WINDOW) {
          return NextResponse.json(
            { error: "Terlalu banyak permintaan reservasi. Silakan tunggu beberapa menit sebelum mencoba lagi." },
            { status: 429 }
          );
        }
        record.count += 1;
      } else {
        bookingAttempts.set(ip, { count: 1, resetAt: now + BOOKING_WINDOW_MS });
      }
    } else {
      bookingAttempts.set(ip, { count: 1, resetAt: now + BOOKING_WINDOW_MS });
    }

    // Langkah 2: Ambil isi data JSON dari formulir pemesanan
    const body = await req.json();

    // Langkah 3: Validasi kelengkapan data wajib
    if (!body.customer_name || !body.customer_phone || !body.event_date || !body.location) {
      return NextResponse.json(
        { error: "Semua kolom wajib harus diisi" },
        { status: 400 }
      );
    }

    // Langkah 4: Simpan baris baru ke tabel `bookings` via fungsi createBooking()
    const booking = await createBooking({
      customer_name: String(body.customer_name).slice(0, 100),
      customer_email: body.customer_email ? String(body.customer_email).slice(0, 100) : "",
      customer_phone: String(body.customer_phone).slice(0, 30),
      event_type: body.event_type || "wedding",
      event_name: body.event_name ? String(body.event_name).slice(0, 150) : String(body.customer_name || "Event Tamu").slice(0, 150),
      event_date: body.event_date,
      event_time: body.event_time || "18:30",
      location: String(body.location).slice(0, 200),
      city: body.city ? String(body.city).slice(0, 50) : "Palopo",
      package_id: body.package_id || "22222222-2222-2222-2222-222222222222",
      package_name: body.package_name || "Paket Silver",
      category: body.category || "virtual_photobooth",
      booking_category: body.category || "virtual_photobooth",
      notes: body.notes ? String(body.notes).slice(0, 500) : "",
      total_price: body.total_price || 350000,
      payment_status: body.payment_status || "PENDING",
      payment_method: body.payment_method,
      payment_invoice: body.payment_invoice,
      payment_amount: body.payment_amount || body.total_price || 350000,
      payment_paid_at: body.payment_paid_at,
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

// =========================================================================================
// 3. METHOD PATCH: Mengubah Status Reservasi / Pembayaran (Khusus Admin)
// Alur: Admin klik "Konfirmasi Pembayaran" atau ubah status di tabel -> kirim PATCH ->
//       Server periksa sesi admin -> update kolom tabel `bookings`
// =========================================================================================
export async function PATCH(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("rt_admin_session")?.value;
    const isAdmin = await verifyAdminToken(sessionToken);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Diperlukan akses admin" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Booking ID diperlukan" }, { status: 400 });
    }

    const ok = await updateBooking(id, updates);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

// =========================================================================================
// 4. METHOD DELETE: Menghapus Data Reservasi (Khusus Admin)
// =========================================================================================
export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("rt_admin_session")?.value;
    const isAdmin = await verifyAdminToken(sessionToken);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Diperlukan akses admin" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Booking ID diperlukan" }, { status: 400 });
    }

    await deleteBooking(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
