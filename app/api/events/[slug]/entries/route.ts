import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug, getEventEntries, createEntry } from "@/lib/db";
import { saveEntryPhoto, saveVoiceNote } from "@/lib/save-frame";

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
    return NextResponse.json({ success: true, entries });
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

    // Save base64 photo and voice note to disk to keep database queries fast and light
    const savedPhotoUrl = saveEntryPhoto(body.photo_url, `${event.slug}-photo`);
    const savedVoiceNoteUrl = saveVoiceNote(body.voice_note_url, `${event.slug}-audio`);

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
