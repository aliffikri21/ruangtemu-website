import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug, getEventEntries, createEntry, clearEventEntries } from "@/lib/db";
import { saveEntryPhoto, saveVoiceNote } from "@/lib/save-frame";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

function sanitizeText(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  // Strip potential HTML tags to prevent stored XSS
  const stripped = input.replace(/<[^>]*>?/gm, "").trim();
  return stripped.slice(0, maxLength);
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ success: false, error: "Event tidak ditemukan" }, { status: 404 });
    }

    const entries = await getEventEntries(event.id);
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

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ success: false, error: "Event tidak ditemukan" }, { status: 404 });
    }

    // Validasi status keaktifan event
    if (!event.is_active || event.status === "COMPLETED" || event.status === "ARCHIVED") {
      return NextResponse.json(
        { success: false, error: "Sesi photobooth untuk event ini sudah tidak aktif" },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.photo_url || typeof body.photo_url !== "string") {
      return NextResponse.json({ success: false, error: "Foto wajib ada dan valid" }, { status: 400 });
    }

    // Batasi ukuran payload foto (max 25MB base64 ~ 18MB gambar)
    if (body.photo_url.length > 25 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Ukuran foto terlalu besar" }, { status: 413 });
    }

    // Batasi ukuran payload voice note jika ada (max 10MB base64)
    if (body.voice_note_url && typeof body.voice_note_url === "string" && body.voice_note_url.length > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Ukuran voice note terlalu besar" }, { status: 413 });
    }

    // Sanitasi input teks
    const guest_name = sanitizeText(body.guest_name, 50) || "Tamu";
    const message = sanitizeText(body.message, 500);
    const filter_used = sanitizeText(body.filter_used, 30) || "normal";

    // Save photo and voice note to Supabase Storage or disk
    const savedPhotoUrl = await saveEntryPhoto(body.photo_url, `${event.slug}-photo`);
    const savedVoiceNoteUrl = body.voice_note_url
      ? await saveVoiceNote(body.voice_note_url, `${event.slug}-audio`)
      : undefined;

    const entry = await createEntry({
      event_id: event.id,
      event_slug: event.slug,
      guest_name,
      photo_url: savedPhotoUrl,
      voice_note_url: savedVoiceNoteUrl,
      message,
      filter_used: (filter_used as any) || "normal",
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error("Error creating entry:", error);
    return NextResponse.json({ success: false, error: error?.message || "Gagal menyimpan foto" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    // Defense-in-depth: verifikasi otentikasi admin
    const sessionToken = req.cookies.get("rt_admin_session")?.value;
    const isAdmin = await verifyAdminToken(sessionToken);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Diperlukan akses admin" },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ success: false, error: "Event tidak ditemukan" }, { status: 404 });
    }

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
