import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug, getEventEntries, createEntry } from "@/lib/db";
import { saveEntryPhoto, saveVoiceNote } from "@/lib/save-frame";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ slug: string }>;
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

    const body = await req.json();

    if (!body.photo_url) {
      return NextResponse.json({ success: false, error: "Foto wajib ada" }, { status: 400 });
    }

    // Save photo and voice note to Supabase Storage or disk
    const savedPhotoUrl = await saveEntryPhoto(body.photo_url, `${event.slug}-photo`);
    const savedVoiceNoteUrl = await saveVoiceNote(body.voice_note_url, `${event.slug}-audio`);

    const entry = await createEntry({
      event_id: event.id,
      event_slug: event.slug,
      guest_name: body.guest_name || "Tamu",
      photo_url: savedPhotoUrl,
      voice_note_url: savedVoiceNoteUrl,
      message: body.message || "",
      filter_used: body.filter_used || "normal",
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    console.error("Error creating entry:", error);
    return NextResponse.json({ success: false, error: error?.message || "Gagal menyimpan foto" }, { status: 500 });
  }
}
