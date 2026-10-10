import { NextRequest, NextResponse } from "next/server";
import { updateEvent, deleteEvent, getEvents, getEventBySlug } from "@/lib/db";
import { FrameItem } from "@/types";
import { saveFrameImage } from "@/lib/save-frame";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event =
      (await getEventBySlug(slug)) ||
      (await getEvents()).find((e) => e.id === slug);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    let eventId = slug;
    const allEvents = await getEvents();
    const matched = allEvents.find((e) => e.id === slug || e.slug === slug);
    if (matched) {
      eventId = matched.id;
    }

    const assigned_frames: FrameItem[] | undefined =
      Array.isArray(body.assigned_frames)
        ? await Promise.all(
            body.assigned_frames.map(async (fr: any, idx: number) => {
              const rawUrl = fr.preview_url || fr.config_json?.customOverlayUrl || "";
              const savedUrl = rawUrl.startsWith("data:image/")
                ? await saveFrameImage(rawUrl, fr.name || `frame-${idx + 1}`)
                : rawUrl;

              return {
                id: fr.id || `frm-${Date.now()}-${idx}`,
                name: fr.name || `Frame ${idx + 1}`,
                slug:
                  fr.slug ||
                  (fr.name || `frame-${idx + 1}`)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, ""),
                template_type: fr.template_type || "custom",
                preview_url: savedUrl,
                config_json: {
                  type: fr.template_type || "custom",
                  backgroundColor: fr.config_json?.backgroundColor || "#0f172a",
                  borderColor: fr.config_json?.borderColor || "#ffffff",
                  fontFamily: fr.config_json?.fontFamily || "serif",
                  textColor: fr.config_json?.textColor || "#ffffff",
                  padding: 16,
                  borderRadius: 12,
                  ...fr.config_json,
                  customOverlayUrl: savedUrl,
                },
                is_active: true,
              };
            })
          )
        : undefined;

    const updates: Record<string, any> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.host_name !== undefined) updates.host_name = body.host_name;
    if (body.client_name !== undefined) updates.client_name = body.client_name;
    if (body.event_name !== undefined) updates.event_name = body.event_name;
    if (body.event_type !== undefined) updates.event_type = body.event_type;
    if (body.date !== undefined) updates.date = body.date;
    if (body.venue !== undefined) updates.venue = body.venue;
    if (body.city !== undefined) updates.city = body.city;
    if (body.description !== undefined) updates.description = body.description;
    if (body.cover_image !== undefined) updates.cover_image = body.cover_image;
    if (body.status !== undefined) updates.status = body.status;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.allow_guestbook !== undefined)
      updates.allow_guestbook = body.allow_guestbook;
    if (body.allow_voice_note !== undefined)
      updates.allow_voice_note = body.allow_voice_note;
    if (body.default_frame_config !== undefined)
      updates.default_frame_config = body.default_frame_config;
    if (body.theme_config !== undefined)
      updates.theme_config = body.theme_config;
    if (assigned_frames !== undefined)
      updates.assigned_frames = assigned_frames;

    const updated = await updateEvent(eventId, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, event: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    let eventId = slug;
    const allEvents = await getEvents();
    const matched = allEvents.find((e) => e.id === slug || e.slug === slug);
    if (matched) {
      eventId = matched.id;
    }
    await deleteEvent(eventId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
