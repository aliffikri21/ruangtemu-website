import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug, getEventEntries, createEntry } from "@/lib/db";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const entries = await getEventEntries(event.id);
    return NextResponse.json({ success: true, entries });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await req.json();

    if (!body.photo_url) {
      return NextResponse.json({ error: "Foto wajib ada" }, { status: 400 });
    }

    const entry = await createEntry({
      event_id: event.id,
      event_slug: event.slug,
      guest_name: body.guest_name || "Tamu",
      photo_url: body.photo_url,
      voice_note_url: body.voice_note_url || null,
      message: body.message || "",
      filter_used: body.filter_used || "normal",
    });

    return NextResponse.json({ success: true, entry });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}
