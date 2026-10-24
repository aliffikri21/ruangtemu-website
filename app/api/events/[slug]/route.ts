import { NextRequest, NextResponse } from "next/server";
import { updateEvent, deleteEvent, getEvents, getEventBySlug } from "@/lib/db";
import { FrameItem } from "@/types";
import { saveFrameImage, saveLandingBgImage } from "@/lib/save-frame";

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

              let frameId = fr.id;
              if (
                !frameId ||
                frameId.startsWith("slot-") ||
                frameId === "frame-strip-1" ||
                frameId === "frame-strip-2" ||
                frameId === "frame-strip-3"
              ) {
                frameId = `frm-${Date.now()}-${idx}`;
              }

              const baseSlug = (fr.name || `frame-${idx + 1}`)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") || "frame";

              const safeSlug = fr.slug && fr.slug.includes(frameId)
                ? fr.slug
                : `${baseSlug.slice(0, 50)}-${frameId}`;

              return {
                id: frameId,
                name: fr.name || `Frame ${idx + 1}`,
                slug: safeSlug,
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
    if (body.cover_image !== undefined) {
      if (typeof body.cover_image === "string" && body.cover_image.startsWith("data:image/")) {
        updates.cover_image = await saveLandingBgImage(body.cover_image, `${slug}-cover`);
      } else {
        updates.cover_image = body.cover_image;
      }
    }
    if (body.category !== undefined) updates.category = body.category;
    if (body.status !== undefined) updates.status = body.status;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.allow_guestbook !== undefined)
      updates.allow_guestbook = body.allow_guestbook;
    if (body.allow_voice_note !== undefined)
      updates.allow_voice_note = body.allow_voice_note;
    if (body.default_frame_config !== undefined)
      updates.default_frame_config = body.default_frame_config;
    if (body.theme_config !== undefined) {
      let safeThemeConfig = body.theme_config;
      if (
        safeThemeConfig &&
        typeof safeThemeConfig.background?.image === "string" &&
        safeThemeConfig.background.image.startsWith("data:image/")
      ) {
        const savedBg = await saveLandingBgImage(
          safeThemeConfig.background.image,
          `${slug}-bg`
        );
        safeThemeConfig = {
          ...safeThemeConfig,
          background: {
            ...safeThemeConfig.background,
            image: savedBg,
          },
        };
      }
      updates.theme_config = safeThemeConfig;
    }
    if (body.package_tier !== undefined)
      updates.package_tier = body.package_tier;
    if (body.package_name !== undefined)
      updates.package_name = body.package_name;
    if (body.payment_status !== undefined)
      updates.payment_status = body.payment_status;
    if (body.payment_amount !== undefined)
      updates.payment_amount = body.payment_amount ? Number(body.payment_amount) : undefined;
    if (body.payment_method !== undefined)
      updates.payment_method = body.payment_method;
    if (body.payment_invoice !== undefined)
      updates.payment_invoice = body.payment_invoice;
    if (body.license_start_date !== undefined)
      updates.license_start_date = body.license_start_date;
    if (body.license_end_date !== undefined)
      updates.license_end_date = body.license_end_date;
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
