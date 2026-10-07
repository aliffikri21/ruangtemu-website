import { randomUUID } from "crypto";
import { EventItem, Package, Booking, GalleryEntry, BookingStatus, FrameItem } from "@/types";
import { getDbClient, isSupabaseConfigured } from "./supabase";

function parseJsonField<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === "object") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

// ============================================================================
// IN-MEMORY MOCK STORE (Fallback for offline/local development without Supabase)
// ============================================================================
let mockPackages: Package[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Paket Basic Photobooth",
    slug: "paket-basic",
    tagline: "Pilihan hemat untuk perayaan intim dan ulang tahun di Palopo",
    price: 1800000,
    duration_hours: 2,
    features: [
      "2 Jam Layanan Aktif",
      "Unlimited Print 4R / 2-Strip",
      "Custom Template Frame Sesuai Tema",
      "Standard Fun Props & Aksesoris",
      "Download Semua Foto via Cloud Storage",
      "1 Operator & 1 Asisten Standby",
    ],
    popular: false,
    category: "physical",
    prints_included: "Unlimited High Speed DNP Print",
    backdrop: "Standard Sequin / Fabric",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Paket Standard Deluxe",
    slug: "paket-standard-deluxe",
    tagline: "Paket terfavorit untuk resepsi pernikahan & wisuda di Palopo",
    price: 2500000,
    duration_hours: 3,
    features: [
      "3 Jam Layanan Penuh",
      "Unlimited Strip / 4R Glossy Prints",
      "Custom Frame Eksklusif dengan Logo Event",
      "Premium Props & Kacamata Unik",
      "Live Digital Gallery & QR Download",
      "2 Kru Profesional RUANGTEMU",
      "Free 1 Album Foto Kenangan",
    ],
    popular: true,
    category: "physical",
    prints_included: "Unlimited Thermal Photo Print",
    backdrop: "Pilihan 5+ Premium Backdrop",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Paket Virtual & Web Photobooth",
    slug: "paket-virtual-photobooth",
    tagline: "Photobooth digital interaktif langsung dari smartphone tamu",
    price: 2200000,
    duration_hours: 12,
    features: [
      "Akses Web Photobooth Tanpa Install Aplikasi",
      "Frame Custom Digital (Strip, Grid, Polaroid)",
      "Guestbook Digital + Rekam Voice Note Audio Ucapan",
      "Live Projection Mode untuk LED Videotron Venue",
      "QR Code Table Standee Siap Cetak",
      "Dashboard Moderasi & Analytics Event",
    ],
    popular: false,
    category: "virtual",
    prints_included: "Digital Ultra HD Download + Cloud Archive",
    backdrop: "Virtual Digital Frame",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Paket Platinum All-in Hybrid",
    slug: "paket-platinum-hybrid",
    tagline: "Solusi photobooth terlengkap: cetak fisik + platform digital interaktif",
    price: 3800000,
    duration_hours: 4,
    features: [
      "4 Jam Fisik Photobooth + 24 Jam Virtual Web Photobooth",
      "Unlimited Cetak Fisik + Live Projection Screen di Panggung",
      "Custom Wooden/Acrylic Table Standees",
      "Rekaman Voice Notes & Foto Ucapan Tamu",
      "Exclusive Guestbook Album Hardcover",
      "VIP Customer Support & Tim Khusus RUANGTEMU",
    ],
    popular: true,
    category: "hybrid",
    prints_included: "Unlimited Cetak Fisik + Digital Cloud",
    backdrop: "Custom Printed or Luxury Backdrop",
  },
];

const defaultDemoFrames: FrameItem[] = [
  {
    id: "frame-strip-1",
    name: "Classic Floral Strip",
    slug: "classic-floral-strip",
    template_type: "strip_3",
    preview_url: "/frames/frame-strip-floral.png",
    config_json: {
      type: "strip_3",
      backgroundColor: "#0f172a",
      borderColor: "#e7e5e4",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 8,
      customOverlayUrl: "/frames/frame-strip-floral.png",
    },
    is_active: true,
  },
  {
    id: "frame-strip-2",
    name: "Midnight Navy Gold",
    slug: "midnight-navy-gold",
    template_type: "strip_3",
    preview_url: "/frames/frame-strip-navy-gold.png",
    config_json: {
      type: "strip_3",
      backgroundColor: "#0f172a",
      borderColor: "#e7e5e4",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 8,
      customOverlayUrl: "/frames/frame-strip-navy-gold.png",
    },
    is_active: true,
  },
];

let mockEvents: EventItem[] = [
  {
    id: "99999999-9999-9999-9999-999999999999",
    slug: "ilvaricky-wedding",
    title: "The Wedding of Ilva & Ricky",
    event_name: "The Wedding of Ilva & Ricky",
    host_name: "Ilva & Ricky",
    client_name: "Ilva & Ricky",
    event_type: "wedding",
    date: "2026-10-08",
    venue: "Gedung Opu Daeng Risadju",
    city: "Palopo",
    description: "Selamat datang di perayaan pernikahan Ilva & Ricky. Abadikan momen terbaik Anda bersama kami!",
    cover_image: "/images/events/ilvaricky-bg.jpeg",
    cover_image_url: "/images/events/ilvaricky-bg.jpeg",
    status: "ACTIVE",
    is_active: true,
    allow_guestbook: true,
    allow_voice_note: true,
    allow_custom_frame: true,
    gallery_visibility: "PUBLIC",
    default_frame_config: {
      type: "custom",
      backgroundColor: "#0f172a",
      borderColor: "#e7e5e4",
      textContent: "Ilva & Ricky",
      subTextContent: "2026-10-08 • Gedung Opu Daeng Risadju, Palopo",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 8,
      customOverlayUrl: "https://gjvppqonfkbiblghvuun.supabase.co/storage/v1/object/public/ruangtemu-media/frames/ilva-png-1791291880945-0742a0f2.png",
      photoSlots: [
        { x: 77, y: 248, width: 1049, height: 698 },
        { x: 1274, y: 248, width: 1053, height: 698 },
        { x: 77, y: 1044, width: 1049, height: 698 },
        { x: 1274, y: 1044, width: 1053, height: 698 },
        { x: 77, y: 1832, width: 1049, height: 698 },
        { x: 1274, y: 1832, width: 1053, height: 698 },
      ],
      photoCount: 6,
      frameImageWidth: 2400,
      frameImageHeight: 3600,
    },
    created_at: "2026-10-06T13:35:45.000Z",
    assigned_frames: [
      {
        id: "frm-1791291892961-0",
        name: "ilvaricky-6",
        slug: "frame-1-1791291892961",
        template_type: "custom",
        preview_url: "https://gjvppqonfkbiblghvuun.supabase.co/storage/v1/object/public/ruangtemu-media/frames/ilva-png-1791291880945-0742a0f2.png",
        config_json: {
          type: "custom",
          backgroundColor: "#0f172a",
          borderColor: "#e7e5e4",
          textContent: "Ilva & Ricky",
          subTextContent: "2026-10-08 • Gedung Opu Daeng Risadju, Palopo",
          fontFamily: "serif",
          textColor: "#ffffff",
          padding: 16,
          borderRadius: 8,
          customOverlayUrl: "https://gjvppqonfkbiblghvuun.supabase.co/storage/v1/object/public/ruangtemu-media/frames/ilva-png-1791291880945-0742a0f2.png",
          photoSlots: [
            { x: 77, y: 248, width: 1049, height: 698 },
            { x: 1274, y: 248, width: 1053, height: 698 },
            { x: 77, y: 1044, width: 1049, height: 698 },
            { x: 1274, y: 1044, width: 1053, height: 698 },
            { x: 77, y: 1832, width: 1049, height: 698 },
            { x: 1274, y: 1832, width: 1053, height: 698 },
          ],
          photoCount: 6,
          frameImageWidth: 2400,
          frameImageHeight: 3600,
        },
        is_active: true,
      },
    ],
    stats: {
      total_photos: 0,
      total_wishes: 0,
      total_voice_notes: 0,
    },
  },
  {
    id: "30b2edf8-aa12-43a1-b47c-11fbb607ed0a",
    slug: "iqranurul-wedding",
    title: "The Wedding of Nurul & Iqra",
    event_name: "The Wedding of Nurul & Iqra",
    host_name: "Nurul & Iqra",
    client_name: "Nurul & Iqra",
    event_type: "wedding",
    date: "2026-09-28",
    venue: "Palopo",
    city: "Palopo",
    description: "",
    cover_image: "/images/events/nurul-iqra-real.jpg",
    cover_image_url: "/images/events/nurul-iqra-real.jpg",
    status: "ACTIVE",
    is_active: true,
    allow_guestbook: true,
    allow_voice_note: true,
    allow_custom_frame: true,
    gallery_visibility: "PUBLIC",
    default_frame_config: {
      type: "custom",
      backgroundColor: "#0f172a",
      borderColor: "#e7e5e4",
      textContent: "Nurul & Iqra",
      subTextContent: "2026-09-28 • Palopo, Palopo",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 8,
      customOverlayUrl: "/uploads/frames/nurul-iqra-frame.png",
      photoSlots: [
        { x: 23, y: 214, width: 296, height: 192 },
        { x: 365, y: 214, width: 296, height: 192 },
        { x: 23, y: 451, width: 296, height: 192 },
        { x: 365, y: 451, width: 296, height: 192 },
        { x: 23, y: 690, width: 296, height: 193 },
        { x: 365, y: 690, width: 296, height: 193 },
      ],
      photoCount: 6,
      frameImageWidth: 682,
      frameImageHeight: 1024,
    },
    created_at: "2026-10-03T04:48:36.000Z",
    assigned_frames: defaultDemoFrames,
    stats: {
      total_photos: 10,
      total_wishes: 7,
      total_voice_notes: 3,
    },
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    slug: "wedding-andi-sarah",
    title: "The Wedding of Andi & Sarah",
    event_name: "The Wedding of Andi & Sarah",
    host_name: "Andi Pratama & Sarah Wijaya",
    client_name: "Andi Pratama & Sarah Wijaya",
    event_type: "wedding",
    date: "2026-10-15",
    venue: "Banua Subur Convention Hall",
    city: "Palopo",
    description: "Selamat datang di perayaan hari bahagia kami. Abadikan momen terbaik Anda!",
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    cover_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    status: "COMPLETED",
    is_active: false,
    allow_guestbook: true,
    allow_voice_note: true,
    allow_custom_frame: true,
    gallery_visibility: "PUBLIC",
    default_frame_config: {
      type: "strip_3",
      backgroundColor: "#0f172a",
      borderColor: "#38bdf8",
      textContent: "Andi & Sarah",
      subTextContent: "15 Oktober 2026 • Palopo",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 12,
      sticker: "💍",
    },
    created_at: "2026-10-02T14:46:55.000Z",
    assigned_frames: defaultDemoFrames,
    stats: {
      total_photos: 0,
      total_wishes: 0,
      total_voice_notes: 0,
    },
  },
];

let mockBookings: Booking[] = [
  {
    id: "bkg-00000000-0001",
    customer_name: "Andi Pratama",
    customer_email: "andi.pratama@example.com",
    customer_phone: "081234567890",
    event_type: "wedding",
    event_name: "Resepsi Pernikahan Andi & Sarah",
    event_date: "2026-10-15",
    event_time: "18:30",
    location: "Banua Subur Convention Hall, Palopo",
    city: "Palopo",
    package_id: "44444444-4444-4444-4444-444444444444",
    package_name: "Paket Platinum All-in Hybrid",
    status: "confirmed",
    notes: "Mohon backdrop nuansa Navy & Gold",
    total_price: 3800000,
    created_at: "2026-10-02T14:46:55.000Z",
  },
];

let mockEntries: GalleryEntry[] = [];

// ============================================================================
// ROW MAPPERS
// ============================================================================
function mapPackageRow(row: any): Package {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    tagline: String(row.tagline || ""),
    price: Number(row.price || 0),
    duration_hours: Number(row.duration_hours || 3),
    features: parseJsonField<string[]>(row.features, []),
    popular: Boolean(row.popular),
    category: row.category,
    prints_included: row.prints_included || undefined,
    backdrop: row.backdrop || undefined,
  };
}

function mapEventRow(row: any, assignedFrames?: FrameItem[], computedStats?: { total_photos: number; total_wishes: number; total_voice_notes: number }): EventItem {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title || row.event_name || ""),
    event_name: row.event_name || row.title,
    host_name: String(row.host_name || ""),
    client_name: row.client_name || row.host_name,
    event_type: row.event_type || "wedding",
    date: row.date ? (row.date instanceof Date ? row.date.toISOString().split("T")[0] : String(row.date)) : "",
    venue: String(row.venue || ""),
    city: String(row.city || "Palopo"),
    description: row.description || "",
    cover_image: row.cover_image || row.cover_image_url || "",
    cover_image_url: row.cover_image_url || row.cover_image || "",
    status: row.status || "ACTIVE",
    is_active: Boolean(row.is_active),
    allow_guestbook: Boolean(row.allow_guestbook),
    allow_voice_note: Boolean(row.allow_voice_note),
    allow_custom_frame: Boolean(row.allow_custom_frame),
    gallery_visibility: row.gallery_visibility || "PUBLIC",
    default_frame_config: parseJsonField(row.default_frame_config, {
      type: "strip_3",
      backgroundColor: "#0f172a",
      borderColor: "#38bdf8",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 12,
    }),
    assigned_frames: assignedFrames && assignedFrames.length > 0 ? assignedFrames : defaultDemoFrames,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    stats: computedStats || {
      total_photos: Number(row.total_photos || 0),
      total_wishes: Number(row.total_wishes || 0),
      total_voice_notes: Number(row.total_voice_notes || 0),
    },
  };
}

function mapBookingRow(row: any): Booking {
  return {
    id: String(row.id),
    customer_name: String(row.customer_name),
    customer_email: String(row.customer_email),
    customer_phone: String(row.customer_phone),
    event_type: row.event_type,
    event_name: String(row.event_name),
    event_date: row.event_date ? (row.event_date instanceof Date ? row.event_date.toISOString().split("T")[0] : String(row.event_date)) : "",
    event_time: row.event_time ? String(row.event_time) : undefined,
    location: String(row.location),
    city: String(row.city || "Palopo"),
    package_id: String(row.package_id || ""),
    package_name: row.package_name || undefined,
    status: row.status,
    notes: row.notes || undefined,
    total_price: Number(row.total_price || 0),
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function mapEntryRow(row: any): GalleryEntry {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    event_slug: row.event_slug || undefined,
    guest_name: String(row.guest_name || "Tamu"),
    photo_url: String(row.photo_url || ""),
    voice_note_url: row.voice_note_url || null,
    message: row.message || "",
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    is_approved: Boolean(row.is_approved),
    moderation_status: row.moderation_status || "APPROVED",
    filter_used: row.filter_used || "normal",
    likes_count: Number(row.likes_count || 0),
    client_submission_id: row.client_submission_id || undefined,
  };
}

// ============================================================================
// PACKAGES API
// ============================================================================
export async function getPackages(): Promise<Package[]> {
  const client = getDbClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("packages")
        .select("*")
        .order("price", { ascending: true });

      if (error) {
        console.warn("[Supabase] getPackages error:", error.message);
      } else if (data && data.length > 0) {
        return data.map(mapPackageRow);
      }
    } catch (err: any) {
      console.warn("[Supabase] getPackages exception:", err?.message);
    }
  }
  return mockPackages;
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  const client = getDbClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("packages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.warn("[Supabase] getPackageBySlug error:", error.message);
      } else if (data) {
        return mapPackageRow(data);
      }
    } catch (err: any) {
      console.warn("[Supabase] getPackageBySlug exception:", err?.message);
    }
  }
  const pkgs = await getPackages();
  return pkgs.find((p) => p.slug === slug) || null;
}

// ============================================================================
// EVENTS API
// ============================================================================
export async function getEvents(): Promise<EventItem[]> {
  const client = getDbClient();
  if (client) {
    try {
      const { data: rows, error } = await client
        .from("events")
        .select(`
          *,
          event_frames (
            sort_order,
            frames (*)
          ),
          entries (
            id,
            photo_url,
            voice_note_url,
            message
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[Supabase] getEvents error:", error.message);
      } else if (rows && rows.length > 0) {
        return rows.map((r: any) => {
          // Process assigned frames
          let assignedFrames: FrameItem[] = [];
          if (Array.isArray(r.event_frames) && r.event_frames.length > 0) {
            const sorted = [...r.event_frames].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            assignedFrames = sorted
              .map((ef) => ef.frames)
              .filter(Boolean)
              .map((fr: any) => ({
                id: String(fr.id),
                name: String(fr.name),
                slug: String(fr.slug),
                template_type: fr.template_type,
                preview_url: fr.preview_url || undefined,
                config_json: parseJsonField(fr.config_json, {} as any),
                is_active: Boolean(fr.is_active),
              }));
          }

          // Compute stats
          const entriesList = Array.isArray(r.entries) ? r.entries : [];
          const stats = {
            total_photos: entriesList.filter((e: any) => !!e.photo_url).length,
            total_wishes: entriesList.filter((e: any) => !!e.message && String(e.message).trim() !== "").length,
            total_voice_notes: entriesList.filter((e: any) => !!e.voice_note_url).length,
          };

          return mapEventRow(r, assignedFrames, stats);
        });
      }
    } catch (err: any) {
      console.warn("[Supabase] getEvents exception:", err?.message);
    }
  }

  return [...mockEvents].sort(
    (a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
  );
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const client = getDbClient();
  if (client) {
    try {
      const { data: row, error } = await client
        .from("events")
        .select(`
          *,
          event_frames (
            sort_order,
            frames (*)
          ),
          entries (
            id,
            photo_url,
            voice_note_url,
            message
          )
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.warn("[Supabase] getEventBySlug error:", error.message);
      } else if (row) {
        let assignedFrames: FrameItem[] = [];
        if (Array.isArray(row.event_frames) && row.event_frames.length > 0) {
          const sorted = [...row.event_frames].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          assignedFrames = sorted
            .map((ef) => ef.frames)
            .filter(Boolean)
            .map((fr: any) => ({
              id: String(fr.id),
              name: String(fr.name),
              slug: String(fr.slug),
              template_type: fr.template_type,
              preview_url: fr.preview_url || undefined,
              config_json: parseJsonField(fr.config_json, {} as any),
              is_active: Boolean(fr.is_active),
            }));
        }

        const entriesList = Array.isArray(row.entries) ? row.entries : [];
        const stats = {
          total_photos: entriesList.filter((e: any) => !!e.photo_url).length,
          total_wishes: entriesList.filter((e: any) => !!e.message && String(e.message).trim() !== "").length,
          total_voice_notes: entriesList.filter((e: any) => !!e.voice_note_url).length,
        };

        return mapEventRow(row, assignedFrames, stats);
      }
    } catch (err: any) {
      console.warn("[Supabase] getEventBySlug exception:", err?.message);
    }
  }

  return mockEvents.find((e) => e.slug === slug || e.id === slug) || null;
}

export async function createEvent(event: Omit<EventItem, "id" | "created_at">): Promise<EventItem> {
  const newEvent: EventItem = {
    ...event,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };

  const client = getDbClient();
  if (client) {
    try {
      const { error: evErr } = await client.from("events").insert({
        id: newEvent.id,
        slug: newEvent.slug,
        title: newEvent.title,
        host_name: newEvent.host_name,
        client_name: newEvent.client_name || newEvent.host_name,
        event_name: newEvent.event_name || newEvent.title,
        event_type: newEvent.event_type || "wedding",
        date: newEvent.date,
        venue: newEvent.venue,
        city: newEvent.city || "Palopo",
        description: newEvent.description || "",
        cover_image: newEvent.cover_image || "",
        cover_image_url: newEvent.cover_image_url || newEvent.cover_image || "",
        status: newEvent.status || "ACTIVE",
        is_active: newEvent.is_active ?? true,
        allow_guestbook: newEvent.allow_guestbook ?? true,
        allow_voice_note: newEvent.allow_voice_note ?? true,
        allow_custom_frame: newEvent.allow_custom_frame ?? true,
        gallery_visibility: newEvent.gallery_visibility || "PUBLIC",
        default_frame_config: newEvent.default_frame_config || {},
      });

      if (evErr) {
        throw new Error(evErr.message);
      }

      if (newEvent.assigned_frames && newEvent.assigned_frames.length > 0) {
        for (let i = 0; i < newEvent.assigned_frames.length; i++) {
          const fr = newEvent.assigned_frames[i];
          try {
            await client.from("frames").upsert({
              id: fr.id,
              name: fr.name,
              slug: fr.slug,
              template_type: fr.template_type || "custom",
              preview_url: fr.preview_url || null,
              config_json: fr.config_json || {},
              is_active: true,
            });

            await client.from("event_frames").upsert({
              id: randomUUID(),
              event_id: newEvent.id,
              frame_id: fr.id,
              sort_order: i + 1,
            });
          } catch (fErr: any) {
            console.warn("[Supabase] frame insert skipped:", fErr?.message);
          }
        }
      }

      return newEvent;
    } catch (err: any) {
      console.warn("[Supabase] createEvent fallback to memory:", err?.message);
    }
  }

  mockEvents.unshift(newEvent);
  return newEvent;
}

export async function updateEvent(
  id: string,
  updates: Partial<EventItem> & { assigned_frames?: FrameItem[] }
): Promise<EventItem | null> {
  const client = getDbClient();
  if (client) {
    try {
      const updatePayload: Record<string, any> = {};
      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.slug !== undefined) updatePayload.slug = updates.slug;
      if (updates.host_name !== undefined) updatePayload.host_name = updates.host_name;
      if (updates.client_name !== undefined) updatePayload.client_name = updates.client_name;
      if (updates.event_name !== undefined) updatePayload.event_name = updates.event_name;
      if (updates.event_type !== undefined) updatePayload.event_type = updates.event_type;
      if (updates.date !== undefined) updatePayload.date = updates.date;
      if (updates.venue !== undefined) updatePayload.venue = updates.venue;
      if (updates.city !== undefined) updatePayload.city = updates.city;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.cover_image !== undefined) {
        updatePayload.cover_image = updates.cover_image;
        updatePayload.cover_image_url = updates.cover_image;
      }
      if (updates.status !== undefined) updatePayload.status = updates.status;
      if (updates.is_active !== undefined) updatePayload.is_active = updates.is_active;
      if (updates.allow_guestbook !== undefined) updatePayload.allow_guestbook = updates.allow_guestbook;
      if (updates.allow_voice_note !== undefined) updatePayload.allow_voice_note = updates.allow_voice_note;
      if (updates.allow_custom_frame !== undefined) updatePayload.allow_custom_frame = updates.allow_custom_frame;
      if (updates.default_frame_config !== undefined) updatePayload.default_frame_config = updates.default_frame_config;

      if (Object.keys(updatePayload).length > 0) {
        const { error: updErr } = await client.from("events").update(updatePayload).eq("id", id);
        if (updErr) console.warn("[Supabase] updateEvent error:", updErr.message);
      }

      if (updates.assigned_frames !== undefined) {
        await client.from("event_frames").delete().eq("event_id", id);

        for (let i = 0; i < updates.assigned_frames.length; i++) {
          const fr = updates.assigned_frames[i];
          await client.from("frames").upsert({
            id: fr.id,
            name: fr.name,
            slug: fr.slug,
            template_type: fr.template_type || "custom",
            preview_url: fr.preview_url || null,
            config_json: fr.config_json || {},
            is_active: true,
          });

          await client.from("event_frames").insert({
            id: randomUUID(),
            event_id: id,
            frame_id: fr.id,
            sort_order: i + 1,
          });
        }
      }

      // Fetch the updated event
      const updated = await getEventBySlug(updates.slug || id);
      if (updated) return updated;
    } catch (err: any) {
      console.warn("[Supabase] updateEvent fallback to memory:", err?.message);
    }
  }

  const idx = mockEvents.findIndex((e) => e.id === id);
  if (idx !== -1) {
    mockEvents[idx] = { ...mockEvents[idx], ...updates };
    return mockEvents[idx];
  }
  return null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const client = getDbClient();
  if (client) {
    try {
      const { error } = await client.from("events").delete().eq("id", id);
      if (error) {
        console.warn("[Supabase] deleteEvent error:", error.message);
      } else {
        return true;
      }
    } catch (err: any) {
      console.warn("[Supabase] deleteEvent exception:", err?.message);
    }
  }

  mockEvents = mockEvents.filter((e) => e.id !== id);
  return true;
}

// ============================================================================
// BOOKINGS API
// ============================================================================
export async function getBookings(): Promise<Booking[]> {
  const client = getDbClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[Supabase] getBookings error:", error.message);
      } else if (data && data.length > 0) {
        return data.map(mapBookingRow);
      }
    } catch (err: any) {
      console.warn("[Supabase] getBookings exception:", err?.message);
    }
  }
  return mockBookings;
}

export async function createBooking(
  booking: Omit<Booking, "id" | "created_at" | "status">
): Promise<Booking> {
  const newBooking: Booking = {
    ...booking,
    id: randomUUID(),
    status: "pending",
    created_at: new Date().toISOString(),
  };

  const client = getDbClient();
  if (client) {
    try {
      const { error } = await client.from("bookings").insert({
        id: newBooking.id,
        customer_name: newBooking.customer_name,
        customer_email: newBooking.customer_email,
        customer_phone: newBooking.customer_phone,
        event_type: newBooking.event_type,
        event_name: newBooking.event_name,
        event_date: newBooking.event_date,
        event_time: newBooking.event_time || null,
        location: newBooking.location,
        city: newBooking.city || "Palopo",
        package_id: newBooking.package_id || null,
        package_name: newBooking.package_name || null,
        status: newBooking.status,
        notes: newBooking.notes || null,
        total_price: newBooking.total_price || 0,
      });

      if (error) {
        console.warn("[Supabase] createBooking error:", error.message);
      } else {
        return newBooking;
      }
    } catch (err: any) {
      console.warn("[Supabase] createBooking exception:", err?.message);
    }
  }

  mockBookings.unshift(newBooking);
  return newBooking;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<boolean> {
  const client = getDbClient();
  if (client) {
    try {
      const { error } = await client.from("bookings").update({ status }).eq("id", id);
      if (error) {
        console.warn("[Supabase] updateBookingStatus error:", error.message);
      } else {
        return true;
      }
    } catch (err: any) {
      console.warn("[Supabase] updateBookingStatus exception:", err?.message);
    }
  }

  const b = mockBookings.find((item) => item.id === id);
  if (b) {
    b.status = status;
    return true;
  }
  return false;
}

// ============================================================================
// ENTRIES API (Guest Photobooth & Gallery)
// ============================================================================
export async function getEventEntries(eventId: string): Promise<GalleryEntry[]> {
  const client = getDbClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("entries")
        .select("*")
        .or(`event_id.eq.${eventId},event_slug.eq.${eventId}`)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[Supabase] getEventEntries error:", error.message);
      } else if (data) {
        return data.map(mapEntryRow);
      }
    } catch (err: any) {
      console.warn("[Supabase] getEventEntries exception:", err?.message);
    }
  }

  return mockEntries.filter((e) => e.event_id === eventId || e.event_slug === eventId);
}

export async function createEntry(
  entry: Omit<GalleryEntry, "id" | "created_at" | "likes_count" | "is_approved">
): Promise<GalleryEntry> {
  const newEntry: GalleryEntry = {
    ...entry,
    id: randomUUID(),
    likes_count: 0,
    is_approved: true,
    created_at: new Date().toISOString(),
  };

  const client = getDbClient();
  if (client) {
    try {
      const { error } = await client.from("entries").insert({
        id: newEntry.id,
        event_id: newEntry.event_id,
        event_slug: newEntry.event_slug || null,
        guest_name: newEntry.guest_name,
        photo_url: newEntry.photo_url,
        voice_note_url: newEntry.voice_note_url || null,
        message: newEntry.message || null,
        filter_used: newEntry.filter_used || "normal",
        likes_count: 0,
        is_approved: true,
        moderation_status: "APPROVED",
        is_published: true,
      });

      if (error) {
        console.warn("[Supabase] createEntry error:", error.message);
      } else {
        return newEntry;
      }
    } catch (err: any) {
      console.warn("[Supabase] createEntry fallback to memory:", err?.message);
    }
  }

  mockEntries.unshift(newEntry);
  return newEntry;
}

export async function toggleEntryApproval(id: string, is_approved: boolean): Promise<boolean> {
  const client = getDbClient();
  if (client) {
    try {
      const { error } = await client.from("entries").update({ is_approved }).eq("id", id);
      if (error) {
        console.warn("[Supabase] toggleEntryApproval error:", error.message);
      } else {
        return true;
      }
    } catch (err: any) {
      console.warn("[Supabase] toggleEntryApproval exception:", err?.message);
    }
  }

  const item = mockEntries.find((e) => e.id === id);
  if (item) {
    item.is_approved = is_approved;
    return true;
  }
  return false;
}

export async function deleteEntry(id: string): Promise<boolean> {
  const client = getDbClient();
  if (client) {
    try {
      const { error } = await client.from("entries").delete().eq("id", id);
      if (error) {
        console.warn("[Supabase] deleteEntry error:", error.message);
      } else {
        return true;
      }
    } catch (err: any) {
      console.warn("[Supabase] deleteEntry exception:", err?.message);
    }
  }

  mockEntries = mockEntries.filter((e) => e.id !== id);
  return true;
}

export async function clearEventEntries(eventId: string, eventSlug?: string): Promise<boolean> {
  const client = getDbClient();
  if (client) {
    try {
      const orFilter = eventSlug && eventSlug !== eventId
        ? `event_id.eq.${eventId},event_slug.eq.${eventId},event_slug.eq.${eventSlug}`
        : `event_id.eq.${eventId},event_slug.eq.${eventId}`;

      const { error } = await client.from("entries").delete().or(orFilter);
      if (error) {
        console.warn("[Supabase] clearEventEntries error:", error.message);
      }
    } catch (err: any) {
      console.warn("[Supabase] clearEventEntries exception:", err?.message);
    }
  }

  mockEntries = mockEntries.filter(
    (e) => e.event_id !== eventId && e.event_slug !== eventId && (!eventSlug || e.event_slug !== eventSlug)
  );
  return true;
}

