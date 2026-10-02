import { NextRequest, NextResponse } from "next/server";
import { getEvents, createEvent } from "@/lib/db";
import { EventItem } from "@/types";

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json({ success: true, events });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.host_name) {
      return NextResponse.json(
        { success: false, error: "Nama event dan nama client/tuan rumah wajib diisi" },
        { status: 400 }
      );
    }

    const slug = (
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );

    const eventPayload: Omit<EventItem, "id" | "created_at"> = {
      slug,
      title: body.title,
      host_name: body.host_name,
      client_name: body.client_name || body.host_name,
      event_name: body.event_name || body.title,
      event_type: body.event_type || "wedding",
      date: body.date || new Date().toISOString().split("T")[0],
      venue: body.venue || "Palopo",
      city: body.city || "Palopo",
      description: body.description || "",
      cover_image: body.cover_image || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
      status: "ACTIVE",
      is_active: true,
      allow_guestbook: body.allow_guestbook ?? true,
      allow_voice_note: body.allow_voice_note ?? true,
      allow_custom_frame: body.allow_custom_frame ?? true,
      default_frame_config: body.default_frame_config || {
        type: "strip_3",
        backgroundColor: "#0f172a",
        borderColor: "#38bdf8",
        textContent: body.host_name,
        subTextContent: `${body.date || "2026"} • ${body.venue || "Palopo"}`,
        fontFamily: "serif",
        textColor: "#ffffff",
        padding: 16,
        borderRadius: 12,
        sticker: "💍",
      },
    };

    const newEvent = await createEvent(eventPayload);
    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
