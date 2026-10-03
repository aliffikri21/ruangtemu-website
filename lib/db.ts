import { randomUUID } from "crypto";
import { EventItem, Package, Booking, GalleryEntry, BookingStatus, FrameItem } from "@/types";
import { query, queryOne, execute } from "./mysql";

function parseJsonField<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === "object") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function isConnectionError(err: any): boolean {
  const code = err?.code || "";
  const msg = (err?.message || "").toLowerCase();
  return (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "PROTOCOL_CONNECTION_LOST" ||
    code === "ER_ACCESS_DENIED_ERROR" ||
    code === "ER_BAD_DB_ERROR" ||
    msg.includes("connect") ||
    msg.includes("econnrefused") ||
    msg.includes("pool is closed")
  );
}

// In-memory store for fallback/dev mode
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
      borderColor: "#d4af37",
      customOverlayUrl: "/frames/frame-strip-floral.png",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 12,
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
      backgroundColor: "#0a0f1e",
      borderColor: "#e2b93b",
      customOverlayUrl: "/frames/frame-strip-navy-gold.png",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 12,
    },
    is_active: true,
  },
  {
    id: "frame-strip-3",
    name: "Modern Minimalist",
    slug: "modern-minimalist",
    template_type: "strip_3",
    preview_url: "/frames/frame-strip-minimal.png",
    config_json: {
      type: "strip_3",
      backgroundColor: "#121214",
      borderColor: "#ffffff",
      customOverlayUrl: "/frames/frame-strip-minimal.png",
      fontFamily: "sans-serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 12,
    },
    is_active: true,
  },
];

let mockEvents: EventItem[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    slug: "bombom-wedding",
    title: "The Wedding of Bom Bom & Partner",
    host_name: "Bom Bom & Partner",
    client_name: "Bom Bom",
    event_name: "The Wedding of Bom Bom",
    event_type: "wedding",
    date: "2026-10-24",
    venue: "Gedung Saodenrae Convention Center",
    city: "Palopo",
    description: "Selamat datang di perayaan pernikahan kami! Abadikan momen spesial Anda dan tinggalkan ucapan berkesan di RUANGTEMU photobooth kami.",
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    status: "ACTIVE",
    is_active: true,
    allow_guestbook: true,
    allow_voice_note: true,
    allow_custom_frame: true,
    created_at: new Date().toISOString(),
    assigned_frames: defaultDemoFrames,
    default_frame_config: {
      type: "strip_3",
      backgroundColor: "#0f172a",
      borderColor: "#38bdf8",
      textContent: "Bom Bom Wedding",
      subTextContent: "24 Oktober 2026 • Palopo",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 12,
      sticker: "💍",
      customOverlayUrl: "/frames/frame-strip-floral.png",
    },
    stats: {
      total_photos: 0,
      total_wishes: 0,
      total_voice_notes: 0,
    },
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    slug: "palopo-creative-fest-2026",
    title: "Palopo Youth Creative Festival 2026",
    host_name: "Komunitas Kreatif Palopo",
    client_name: "Pemuda Palopo",
    event_name: "Palopo Creative Fest",
    event_type: "gathering",
    date: "2026-11-20",
    venue: "Gedung Kesenian Palopo",
    city: "Palopo",
    description: "Rayakan karya dan kreativitas anak muda Tana Luwu bersama RUANGTEMU Digital!",
    cover_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
    status: "ACTIVE",
    is_active: true,
    allow_guestbook: true,
    allow_voice_note: true,
    allow_custom_frame: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    default_frame_config: {
      type: "grid_4",
      backgroundColor: "#18181b",
      borderColor: "#a855f7",
      textContent: "Palopo Creative Fest",
      subTextContent: "#MudaKreatifPalopo",
      fontFamily: "sans-serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 12,
      sticker: "✨",
    },
    stats: {
      total_photos: 35,
      total_wishes: 29,
      total_voice_notes: 12,
    },
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    slug: "wedding-andi-sarah",
    title: "The Wedding of Andi & Sarah",
    host_name: "Andi Pratama & Sarah Wijaya",
    client_name: "Andi & Sarah",
    event_name: "The Wedding of Andi & Sarah",
    event_type: "wedding",
    date: "2026-10-15",
    venue: "Banua Subur Convention Hall",
    city: "Palopo",
    description: "Selamat datang di perayaan hari bahagia kami! Abadikan momen terbaik Anda dan tinggalkan ucapan berkesan di RUANGTEMU photobooth kami.",
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    status: "ACTIVE",
    is_active: true,
    allow_guestbook: true,
    allow_voice_note: true,
    allow_custom_frame: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    assigned_frames: defaultDemoFrames,
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
      customOverlayUrl: "/frames/frame-strip-floral.png",
    },
    stats: {
      total_photos: 18,
      total_wishes: 14,
      total_voice_notes: 8,
    },
  },
];

let mockBookings: Booking[] = [
  {
    id: "bkg-1",
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
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

let mockEntries: GalleryEntry[] = [
  {
    id: "ent-1",
    event_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    event_slug: "wedding-andi-sarah",
    guest_name: "Fajar & Dina",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    message: "Selamat menempuh hidup baru Andi & Sarah! Semoga sakinah, mawaddah, warrahmah. Momen pernikahan terindah di Palopo!",
    filter_used: "soft-glow",
    likes_count: 12,
    is_approved: true,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

function mapPackageRow(row: any): Package {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    tagline: String(row.tagline || ""),
    price: Number(row.price || 0),
    duration_hours: Number(row.duration_hours || 2),
    features: parseJsonField<string[]>(row.features, []),
    popular: Boolean(row.popular),
    category: row.category,
    prints_included: row.prints_included || undefined,
    backdrop: row.backdrop || undefined,
  };
}

function mapEventRow(row: any, assignedFrames?: FrameItem[]): EventItem {
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
    assigned_frames: assignedFrames,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    stats: {
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
  try {
    const rows = await query<any>("SELECT * FROM packages ORDER BY price ASC");
    if (rows && rows.length > 0) {
      return rows.map(mapPackageRow);
    }
    return [];
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
  }
  return mockPackages;
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  try {
    const row = await queryOne<any>("SELECT * FROM packages WHERE slug = ? LIMIT 1", [slug]);
    if (row) return mapPackageRow(row);
    return null;
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
  }
  const pkgs = await getPackages();
  return pkgs.find((p) => p.slug === slug) || null;
}

// ============================================================================
// EVENTS API
// ============================================================================
export async function getEvents(): Promise<EventItem[]> {
  try {
    const rows = await query<any>(`
      SELECT e.*,
        (SELECT COUNT(*) FROM entries en WHERE en.event_id = e.id AND en.photo_url IS NOT NULL) AS total_photos,
        (SELECT COUNT(*) FROM entries en WHERE en.event_id = e.id AND en.message IS NOT NULL AND en.message != '') AS total_wishes,
        (SELECT COUNT(*) FROM entries en WHERE en.event_id = e.id AND en.voice_note_url IS NOT NULL) AS total_voice_notes
      FROM events e
      ORDER BY e.created_at DESC, e.date DESC
    `);

    if (!rows || rows.length === 0) return [];

    const frameMap: Record<string, FrameItem[]> = {};
    try {
      const allFrameRows = await query<any>(`
        SELECT ef.event_id, f.*
        FROM event_frames ef
        JOIN frames f ON f.id = ef.frame_id
        ORDER BY ef.sort_order ASC
      `);
      if (allFrameRows && allFrameRows.length > 0) {
        for (const fr of allFrameRows) {
          const evId = String(fr.event_id);
          if (!frameMap[evId]) frameMap[evId] = [];
          frameMap[evId].push({
            id: String(fr.id),
            name: String(fr.name),
            slug: String(fr.slug),
            template_type: fr.template_type,
            preview_url: fr.preview_url || undefined,
            config_json: parseJsonField(fr.config_json, {} as any),
            is_active: Boolean(fr.is_active),
          });
        }
      }
    } catch {
      // frame query can fail independently; events still valid
    }

    return rows.map((r) => {
      const frames = frameMap[String(r.id)] || defaultDemoFrames;
      return mapEventRow(r, frames);
    });
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
  }
  return [...mockEvents].sort(
    (a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
  );
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  try {
    const row = await queryOne<any>(`
      SELECT e.*,
        (SELECT COUNT(*) FROM entries en WHERE en.event_id = e.id AND en.photo_url IS NOT NULL) AS total_photos,
        (SELECT COUNT(*) FROM entries en WHERE en.event_id = e.id AND en.message IS NOT NULL AND en.message != '') AS total_wishes,
        (SELECT COUNT(*) FROM entries en WHERE en.event_id = e.id AND en.voice_note_url IS NOT NULL) AS total_voice_notes
      FROM events e
      WHERE e.slug = ?
      LIMIT 1
    `, [slug]);

    if (row) {
      let assignedFrames: FrameItem[] = [];
      try {
        const frameRows = await query<any>(`
          SELECT f.*
          FROM frames f
          JOIN event_frames ef ON ef.frame_id = f.id
          WHERE ef.event_id = ?
          ORDER BY ef.sort_order ASC
        `, [row.id]);

        if (frameRows && frameRows.length > 0) {
          assignedFrames = frameRows.map((fr) => ({
            id: String(fr.id),
            name: String(fr.name),
            slug: String(fr.slug),
            template_type: fr.template_type,
            preview_url: fr.preview_url || undefined,
            config_json: parseJsonField(fr.config_json, {} as any),
            is_active: Boolean(fr.is_active),
          }));
        }
      } catch {
        // frame query can fail independently
      }

      if (assignedFrames.length === 0) {
        assignedFrames = defaultDemoFrames;
      }

      return mapEventRow(row, assignedFrames.length > 0 ? assignedFrames : undefined);
    }
    return null;
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
  }
  return mockEvents.find((e) => e.slug === slug) || null;
}

export async function createEvent(event: Omit<EventItem, "id" | "created_at">): Promise<EventItem> {
  const newEvent: EventItem = {
    ...event,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };

  try {
    await query(
      `INSERT INTO events (
        id, slug, title, host_name, client_name, event_name, event_type, date, venue, city,
        description, cover_image, cover_image_url, status, is_active, allow_guestbook,
        allow_voice_note, allow_custom_frame, gallery_visibility, default_frame_config
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newEvent.id,
        newEvent.slug,
        newEvent.title,
        newEvent.host_name,
        newEvent.client_name || newEvent.host_name,
        newEvent.event_name || newEvent.title,
        newEvent.event_type || "wedding",
        newEvent.date,
        newEvent.venue,
        newEvent.city || "Palopo",
        newEvent.description || "",
        newEvent.cover_image || "",
        newEvent.cover_image_url || newEvent.cover_image || "",
        newEvent.status || "ACTIVE",
        newEvent.is_active ? 1 : 0,
        newEvent.allow_guestbook ? 1 : 0,
        newEvent.allow_voice_note ? 1 : 0,
        newEvent.allow_custom_frame ? 1 : 0,
        newEvent.gallery_visibility || "PUBLIC",
        JSON.stringify(newEvent.default_frame_config || {}),
      ]
    );

    if (newEvent.assigned_frames && newEvent.assigned_frames.length > 0) {
      for (let i = 0; i < newEvent.assigned_frames.length; i++) {
        const fr = newEvent.assigned_frames[i];
        try {
          await query(
            `INSERT INTO frames (id, name, slug, template_type, preview_url, config_json, is_active)
             VALUES (?, ?, ?, ?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE name = VALUES(name), preview_url = VALUES(preview_url), config_json = VALUES(config_json)`,
            [fr.id, fr.name, fr.slug, fr.template_type, fr.preview_url || null, JSON.stringify(fr.config_json || {})]
          );
          await query(
            `INSERT IGNORE INTO event_frames (id, event_id, frame_id, sort_order)
             VALUES (?, ?, ?, ?)`,
            [randomUUID(), newEvent.id, fr.id, i + 1]
          );
        } catch (fErr) {
          console.warn("[MySQL] frame insert skipped:", (fErr as any)?.message);
        }
      }
    }

    return newEvent;
  } catch (err: any) {
    if (!isConnectionError(err)) {
      throw err;
    }
    console.warn("[MySQL] unreachable, event saved to memory only:", err?.message);
  }

  mockEvents.unshift(newEvent);
  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<EventItem> & { assigned_frames?: FrameItem[] }): Promise<EventItem | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) { fields.push("title = ?"); values.push(updates.title); }
    if (updates.slug !== undefined) { fields.push("slug = ?"); values.push(updates.slug); }
    if (updates.host_name !== undefined) { fields.push("host_name = ?"); values.push(updates.host_name); }
    if (updates.client_name !== undefined) { fields.push("client_name = ?"); values.push(updates.client_name); }
    if (updates.event_name !== undefined) { fields.push("event_name = ?"); values.push(updates.event_name); }
    if (updates.event_type !== undefined) { fields.push("event_type = ?"); values.push(updates.event_type); }
    if (updates.date !== undefined) { fields.push("date = ?"); values.push(updates.date); }
    if (updates.venue !== undefined) { fields.push("venue = ?"); values.push(updates.venue); }
    if (updates.city !== undefined) { fields.push("city = ?"); values.push(updates.city); }
    if (updates.description !== undefined) { fields.push("description = ?"); values.push(updates.description); }
    if (updates.cover_image !== undefined) { fields.push("cover_image = ?"); values.push(updates.cover_image); fields.push("cover_image_url = ?"); values.push(updates.cover_image); }
    if (updates.status !== undefined) { fields.push("status = ?"); values.push(updates.status); }
    if (updates.is_active !== undefined) { fields.push("is_active = ?"); values.push(updates.is_active ? 1 : 0); }
    if (updates.allow_guestbook !== undefined) { fields.push("allow_guestbook = ?"); values.push(updates.allow_guestbook ? 1 : 0); }
    if (updates.allow_voice_note !== undefined) { fields.push("allow_voice_note = ?"); values.push(updates.allow_voice_note ? 1 : 0); }
    if (updates.allow_custom_frame !== undefined) { fields.push("allow_custom_frame = ?"); values.push(updates.allow_custom_frame ? 1 : 0); }
    if (updates.default_frame_config !== undefined) { fields.push("default_frame_config = ?"); values.push(JSON.stringify(updates.default_frame_config)); }

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE events SET ${fields.join(", ")} WHERE id = ?`, values);
    }

    if (updates.assigned_frames !== undefined) {
      await query(`DELETE FROM event_frames WHERE event_id = ?`, [id]);

      for (let i = 0; i < updates.assigned_frames.length; i++) {
        const fr = updates.assigned_frames[i];
        await query(
          `INSERT INTO frames (id, name, slug, template_type, preview_url, config_json, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 1)
           ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), template_type = VALUES(template_type), preview_url = VALUES(preview_url), config_json = VALUES(config_json)`,
          [fr.id, fr.name, fr.slug, fr.template_type, fr.preview_url || null, JSON.stringify(fr.config_json || {})]
        );
        await query(
          `INSERT INTO event_frames (id, event_id, frame_id, sort_order) VALUES (?, ?, ?, ?)`,
          [randomUUID(), id, fr.id, i + 1]
        );
      }
    }

    let assignedFrames: FrameItem[] = [];
    try {
      const frameRows = await query<any>(`
        SELECT f.* FROM frames f
        JOIN event_frames ef ON ef.frame_id = f.id
        WHERE ef.event_id = ?
        ORDER BY ef.sort_order ASC
      `, [id]);
      if (frameRows && frameRows.length > 0) {
        assignedFrames = frameRows.map((fr) => ({
          id: String(fr.id),
          name: String(fr.name),
          slug: String(fr.slug),
          template_type: fr.template_type,
          preview_url: fr.preview_url || undefined,
          config_json: parseJsonField(fr.config_json, {} as any),
          is_active: Boolean(fr.is_active),
        }));
      }
    } catch {
      // frame query can fail independently
    }

    const row = await queryOne<any>(`
      SELECT e.*,
        (SELECT COUNT(*) FROM entries en WHERE en.event_id = e.id AND en.photo_url IS NOT NULL) AS total_photos,
        (SELECT COUNT(*) FROM entries en WHERE en.event_id = e.id AND en.message IS NOT NULL AND en.message != '') AS total_wishes,
        (SELECT COUNT(*) FROM entries en WHERE en.event_id = e.id AND en.voice_note_url IS NOT NULL) AS total_voice_notes
      FROM events e WHERE e.id = ?
    `, [id]);
    return row ? mapEventRow(row, assignedFrames.length > 0 ? assignedFrames : undefined) : null;
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
    console.warn("[MySQL] updateEvent fallback to memory:", err?.message);
  }

  const idx = mockEvents.findIndex((e) => e.id === id);
  if (idx !== -1) {
    mockEvents[idx] = { ...mockEvents[idx], ...updates };
    return mockEvents[idx];
  }
  return null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    await query("DELETE FROM events WHERE id = ?", [id]);
    return true;
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
    console.warn("[MySQL] deleteEvent fallback:", err?.message);
  }
  mockEvents = mockEvents.filter((e) => e.id !== id);
  return true;
}

// ============================================================================
// BOOKINGS API
// ============================================================================
export async function getBookings(): Promise<Booking[]> {
  try {
    const rows = await query<any>("SELECT * FROM bookings ORDER BY created_at DESC");
    if (rows && rows.length > 0) {
      return rows.map(mapBookingRow);
    }
    return [];
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
  }
  return mockBookings;
}

export async function createBooking(booking: Omit<Booking, "id" | "created_at" | "status">): Promise<Booking> {
  const newBooking: Booking = {
    ...booking,
    id: randomUUID(),
    status: "pending",
    created_at: new Date().toISOString(),
  };

  try {
    await query(
      `INSERT INTO bookings (
        id, customer_name, customer_email, customer_phone, event_type,
        event_name, event_date, event_time, location, city, package_id,
        package_name, status, notes, total_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newBooking.id,
        newBooking.customer_name,
        newBooking.customer_email,
        newBooking.customer_phone,
        newBooking.event_type,
        newBooking.event_name,
        newBooking.event_date,
        newBooking.event_time || null,
        newBooking.location,
        newBooking.city || "Palopo",
        newBooking.package_id || null,
        newBooking.package_name || null,
        newBooking.status,
        newBooking.notes || null,
        newBooking.total_price,
      ]
    );
    return newBooking;
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
    console.warn("[MySQL] createBooking fallback:", err?.message);
  }

  mockBookings.unshift(newBooking);
  return newBooking;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<boolean> {
  try {
    await query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
    return true;
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
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
  try {
    const rows = await query<any>(
      `SELECT * FROM entries 
       WHERE (event_id = ? OR event_slug = ?) AND is_approved = 1 
       ORDER BY created_at DESC`,
      [eventId, eventId]
    );
    if (rows && rows.length > 0) {
      return rows.map(mapEntryRow);
    }
    return [];
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
  }
  return mockEntries.filter((e) => e.event_id === eventId || e.event_slug === eventId);
}

export async function createEntry(entry: Omit<GalleryEntry, "id" | "created_at" | "likes_count" | "is_approved">): Promise<GalleryEntry> {
  const newEntry: GalleryEntry = {
    ...entry,
    id: randomUUID(),
    likes_count: 0,
    is_approved: true,
    created_at: new Date().toISOString(),
  };

  try {
    await query(
      `INSERT INTO entries (
        id, event_id, event_slug, guest_name, photo_url, voice_note_url,
        message, filter_used, likes_count, is_approved, moderation_status, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 'APPROVED', 1)`,
      [
        newEntry.id,
        newEntry.event_id,
        newEntry.event_slug || null,
        newEntry.guest_name,
        newEntry.photo_url,
        newEntry.voice_note_url || null,
        newEntry.message || null,
        newEntry.filter_used || "normal",
      ]
    );
    return newEntry;
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
    console.warn("[MySQL] createEntry fallback to memory:", err?.message);
  }

  mockEntries.unshift(newEntry);
  return newEntry;
}

export async function toggleEntryApproval(id: string, is_approved: boolean): Promise<boolean> {
  try {
    await query("UPDATE entries SET is_approved = ? WHERE id = ?", [is_approved ? 1 : 0, id]);
    return true;
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
  }
  const item = mockEntries.find((e) => e.id === id);
  if (item) {
    item.is_approved = is_approved;
    return true;
  }
  return false;
}

export async function deleteEntry(id: string): Promise<boolean> {
  try {
    await query("DELETE FROM entries WHERE id = ?", [id]);
    return true;
  } catch (err: any) {
    if (!isConnectionError(err)) throw err;
    console.warn("[MySQL] deleteEntry fallback:", err?.message);
  }
  mockEntries = mockEntries.filter((e) => e.id !== id);
  return true;
}
