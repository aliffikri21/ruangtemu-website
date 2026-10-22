import { randomUUID } from "crypto";
import { EventItem, Package, Booking, GalleryEntry, BookingStatus, FrameItem, FrameConfig } from "@/types";
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
    name: "Paket 2 Jam Photobooth Fisik",
    slug: "paket-2-jam-photobooth",
    tagline: "Photobooth fisik hemat dengan cetak instan unlimited di Palopo & Luwu Raya",
    price: 2000000,
    price_2r: 2000000,
    price_4r: 2500000,
    duration_hours: 2,
    features: [
      "2 Jam Layanan Aktif di Lokasi Acara",
      "Unlimited Print Foto 2R Strip / 4R",
      "Custom Template Frame Sesuai Tema Acara",
      "Standard Fun Props & Aksesoris Foto",
      "Download Semua Foto via Cloud Storage",
      "1 Operator Mesin & 1 Asisten Standby",
    ],
    popular: false,
    category: "physical",
    prints_included: "Unlimited Print 2R Strip / 4R",
    backdrop: "Standard Backdrop / Sequin Fabric",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Paket 3 Jam Photobooth Fisik",
    slug: "paket-3-jam-photobooth",
    tagline: "Paket photobooth fisik terpopuler untuk resepsi pernikahan & wisuda di Palopo",
    price: 2500000,
    price_2r: 2500000,
    price_4r: 3000000,
    duration_hours: 3,
    features: [
      "3 Jam Layanan Penuh di Lokasi Acara",
      "Unlimited Print Foto 2R Strip / 4R Glossy",
      "Custom Frame Eksklusif dengan Logo Event",
      "Premium Props & Kacamata Unik",
      "Download Semua Foto via Cloud Storage",
      "2 Kru Profesional RUANGTEMU Standby",
    ],
    popular: true,
    category: "physical",
    prints_included: "Unlimited Print 2R Strip / 4R",
    backdrop: "Pilihan 5+ Premium Backdrop",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Paket 4 Jam Photobooth Fisik",
    slug: "paket-4-jam-photobooth",
    tagline: "Durasi panjang untuk event besar, resepsi malam, & pesta wisuda",
    price: 3000000,
    price_2r: 3000000,
    price_4r: 3500000,
    duration_hours: 4,
    features: [
      "4 Jam Layanan Penuh di Lokasi Acara",
      "Unlimited Print Foto 2R Strip / 4R Glossy",
      "Custom Frame Eksklusif dengan Logo Event",
      "Premium Props & Kacamata Unik",
      "Download Semua Foto via Cloud Storage",
      "2 Kru Profesional RUANGTEMU Standby",
    ],
    popular: false,
    category: "physical",
    prints_included: "Unlimited Print 2R Strip / 4R",
    backdrop: "Pilihan 5+ Premium Backdrop",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Paket 5 Jam Photobooth Fisik",
    slug: "paket-5-jam-photobooth",
    tagline: "Layanan maksimal untuk pesta seharian penuh tanpa khawatir kehabisan waktu",
    price: 3500000,
    price_2r: 3500000,
    price_4r: 4000000,
    duration_hours: 5,
    features: [
      "5 Jam Layanan Penuh di Lokasi Acara",
      "Unlimited Print Foto 2R Strip / 4R Glossy",
      "Custom Frame Eksklusif dengan Logo Event",
      "Premium Props & Kacamata Unik",
      "Download Semua Foto via Cloud Storage",
      "2 Kru Profesional RUANGTEMU Standby",
    ],
    popular: false,
    category: "physical",
    prints_included: "Unlimited Print 2R Strip / 4R",
    backdrop: "Pilihan 5+ Premium Backdrop",
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    name: "Paket Bronze",
    slug: "paket-bronze",
    tagline: "Paket virtual ekonomis 7 hari akses dengan 1 template frame & 100 QR",
    price: 250000,
    duration_hours: 168,
    features: [
      "Virtual Photobooth (Photo Only)",
      "Free 1 desain template frame (Strip/4R/Polaroid)",
      "Free cetak 100 pcs kartu QR code",
      "Unlimited Akses QR Code",
      "Akses foto 7 hari",
      "Unlimited foto",
    ],
    popular: false,
    category: "virtual",
    prints_included: "Free cetak 100 pcs kartu QR code",
    backdrop: "1 Desain Template Frame (Strip/4R/Polaroid)",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Paket Silver",
    slug: "paket-silver",
    tagline: "Paket virtual terpopuler 10 hari akses dengan 2 template frame & 200 QR",
    price: 350000,
    duration_hours: 240,
    features: [
      "Virtual Photobooth (Photo & Voice Message)",
      "Free 2 desain template frame (Strip/4R/Polaroid)",
      "Free cetak 200 pcs kartu QR code",
      "Unlimited Akses QR Code",
      "Akses foto 10 hari",
      "Unlimited foto",
    ],
    popular: true,
    category: "virtual",
    prints_included: "Free cetak 200 pcs kartu QR code",
    backdrop: "2 Desain Template Frame (Strip/4R/Polaroid)",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Paket Gold",
    slug: "paket-gold",
    tagline: "Paket virtual terlengkap 14 hari akses dengan 3 template frame & 300 QR",
    price: 450000,
    duration_hours: 336,
    features: [
      "Virtual Photobooth (Photo & Voice Message)",
      "Free 3 desain template frame (Strip/4R/Polaroid)",
      "Free cetak 300 pcs kartu QR code",
      "Unlimited Akses QR Code",
      "Akses foto 14 hari",
      "Unlimited foto",
    ],
    popular: false,
    category: "virtual",
    prints_included: "Free cetak 300 pcs kartu QR code",
    backdrop: "3 Desain Template Frame (Strip/4R/Polaroid)",
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
    id: "aad74eb5-ccdb-4dc3-b2ef-0e46dd7dd50c",
    slug: "jayarika-wedding",
    title: "The Wedding of Jaya & Rika",
    event_name: "The Wedding of Jaya & Rika",
    host_name: "Jaya & Rika",
    client_name: "Jaya & Rika",
    event_type: "wedding",
    date: "2026-10-12",
    venue: "D'Twins Cafe",
    city: "Palopo",
    description: "Selamat datang di perayaan pernikahan Jaya & Rika. Abadikan momen terbaik Anda bersama kami!",
    cover_image: "/images/events/bg-jayarika.png",
    cover_image_url: "/images/events/bg-jayarika.png",
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
      textContent: "Jaya & Rika",
      subTextContent: "2026-10-12 • D'Twins Cafe, Palopo",
      fontFamily: "serif",
      textColor: "#ffffff",
      padding: 16,
      borderRadius: 8,
      customOverlayUrl: "https://gjvppqonfkbiblghvuun.supabase.co/storage/v1/object/public/ruangtemu-media/frames/jayarika-png-1791543696078-f6499fcd.png",
      photoSlots: [
        { x: 97, y: 92, width: 1008, height: 952 },
      ],
      photoCount: 1,
      frameImageWidth: 1200,
      frameImageHeight: 1800,
    },
    created_at: "2026-10-09T10:30:11.718Z",
    assigned_frames: [
      {
        id: "frm-1791541810772-0",
        name: "jayarika-1x",
        slug: "jayarika-1x",
        template_type: "custom",
        preview_url: "https://gjvppqonfkbiblghvuun.supabase.co/storage/v1/object/public/ruangtemu-media/frames/jayarika-png-1791543696078-f6499fcd.png",
        config_json: {
          type: "custom",
          backgroundColor: "#0f172a",
          borderColor: "#e7e5e4",
          textContent: "Jaya & Rika",
          subTextContent: "2026-10-12 • D'Twins Cafe, Palopo",
          fontFamily: "serif",
          textColor: "#ffffff",
          padding: 16,
          borderRadius: 8,
          customOverlayUrl: "https://gjvppqonfkbiblghvuun.supabase.co/storage/v1/object/public/ruangtemu-media/frames/jayarika-png-1791543696078-f6499fcd.png",
          photoSlots: [
            { x: 97, y: 92, width: 1008, height: 952 },
          ],
          photoCount: 1,
          frameImageWidth: 1200,
          frameImageHeight: 1800,
        },
        is_active: true,
      },
      {
        id: "frm-1791543710423-1",
        name: "jayarika-2x",
        slug: "jayarika-2x",
        template_type: "custom",
        preview_url: "https://gjvppqonfkbiblghvuun.supabase.co/storage/v1/object/public/ruangtemu-media/frames/jayarika1-png-1791543707319-5d9bc066.png",
        config_json: {
          type: "custom",
          backgroundColor: "#0f172a",
          borderColor: "#e7e5e4",
          textContent: "Jaya & Rika",
          subTextContent: "2026-10-12 • D'Twins Cafe, Palopo",
          fontFamily: "serif",
          textColor: "#ffffff",
          padding: 16,
          borderRadius: 8,
          customOverlayUrl: "https://gjvppqonfkbiblghvuun.supabase.co/storage/v1/object/public/ruangtemu-media/frames/jayarika1-png-1791543707319-5d9bc066.png",
          photoSlots: [
            { x: 83, y: 131, width: 1035, height: 592 },
            { x: 83, y: 765, width: 1035, height: 592 },
          ],
          photoCount: 2,
          frameImageWidth: 1200,
          frameImageHeight: 1800,
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
      sticker: "✦",
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

let mockBookings: Booking[] = [];

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
  const parsedFrameConfig: FrameConfig = parseJsonField<FrameConfig>(row.default_frame_config, {
    type: "strip_3",
    backgroundColor: "#0f172a",
    borderColor: "#38bdf8",
    fontFamily: "serif",
    textColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
  });
  const pkgMeta = (parsedFrameConfig as any)?._package_info || {};

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
    default_frame_config: parsedFrameConfig,
    category: row.category || pkgMeta.category || "virtual_photobooth",
    assigned_frames: assignedFrames && assignedFrames.length > 0 ? assignedFrames : defaultDemoFrames,
    package_tier: row.package_tier || pkgMeta.package_tier || undefined,
    package_name: row.package_name || pkgMeta.package_name || undefined,
    payment_status: row.payment_status || pkgMeta.payment_status || undefined,
    payment_amount: row.payment_amount ? Number(row.payment_amount) : (pkgMeta.payment_amount ? Number(pkgMeta.payment_amount) : undefined),
    payment_method: row.payment_method || pkgMeta.payment_method || undefined,
    payment_invoice: row.payment_invoice || pkgMeta.payment_invoice || undefined,
    license_start_date: row.license_start_date || pkgMeta.license_start_date || undefined,
    license_end_date: row.license_end_date || pkgMeta.license_end_date || undefined,
    theme_config: row.theme_config ? parseJsonField(row.theme_config, undefined) : ((parsedFrameConfig as any)?._theme_config || (pkgMeta as any)?.theme_config || undefined),
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    stats: computedStats || {
      total_photos: Number(row.total_photos || 0),
      total_wishes: Number(row.total_wishes || 0),
      total_voice_notes: Number(row.total_voice_notes || 0),
    },
  };
}

function parseBookingNotes(notes?: string | null): { cleanNotes?: string; meta?: Record<string, any> } {
  if (!notes) return { cleanNotes: undefined, meta: undefined };
  const match = notes.match(/<!--RUANGTEMU_META:([\s\S]*?)-->/);
  if (!match) return { cleanNotes: notes, meta: undefined };
  try {
    const meta = JSON.parse(match[1]);
    const cleanNotes = notes.replace(/\s*<!--RUANGTEMU_META:[\s\S]*?-->/, "").trim();
    return { cleanNotes: cleanNotes || undefined, meta };
  } catch {
    return { cleanNotes: notes, meta: undefined };
  }
}

function encodeBookingNotes(userNotes?: string | null, meta?: Record<string, any>): string | null {
  const clean = (userNotes || "").replace(/\s*<!--RUANGTEMU_META:[\s\S]*?-->/, "").trim();
  const validMeta = meta && Object.keys(meta).length > 0
    ? Object.fromEntries(Object.entries(meta).filter(([_, v]) => v !== undefined && v !== null && v !== ""))
    : null;

  if (!validMeta || Object.keys(validMeta).length === 0) {
    return clean || null;
  }
  const metaString = `<!--RUANGTEMU_META:${JSON.stringify(validMeta)}-->`;
  return clean ? `${clean}\n${metaString}` : metaString;
}

function mapBookingRow(row: any): Booking {
  const { cleanNotes, meta } = parseBookingNotes(row.notes);
  const pkgNameLower = String(row.package_name || "").toLowerCase();
  const pkgId = String(row.package_id || "");
  const isPhysical =
    meta?.category === "photobooth" ||
    meta?.booking_category === "photobooth" ||
    row.category === "photobooth" ||
    row.booking_category === "photobooth" ||
    pkgNameLower.includes("basic photobooth") ||
    pkgNameLower.includes("standard deluxe") ||
    pkgId.includes("11111111") ||
    pkgId.includes("44444444") ||
    pkgId.includes("basic") ||
    pkgId.includes("deluxe");

  const resolvedCategory =
    meta?.category ||
    meta?.booking_category ||
    row.category ||
    row.booking_category ||
    (isPhysical ? "photobooth" : "virtual_photobooth");

  return {
    id: String(row.id),
    customer_name: String(row.customer_name),
    customer_email: String(row.customer_email || ""),
    customer_phone: String(row.customer_phone),
    event_type: row.event_type,
    event_name: String(row.event_name),
    event_date: row.event_date ? (row.event_date instanceof Date ? row.event_date.toISOString().split("T")[0] : String(row.event_date)) : "",
    event_time: row.event_time ? String(row.event_time) : undefined,
    location: String(row.location),
    city: String(row.city || "Palopo"),
    package_id: String(row.package_id || ""),
    package_name: row.package_name || undefined,
    category: resolvedCategory,
    booking_category: resolvedCategory,
    status: row.status,
    notes: cleanNotes,
    total_price: Number(row.total_price || 0),
    payment_status: row.payment_status || meta?.payment_status || "PENDING",
    payment_method: row.payment_method || meta?.payment_method || undefined,
    payment_invoice: row.payment_invoice || meta?.payment_invoice || undefined,
    payment_amount: row.payment_amount ? Number(row.payment_amount) : (meta?.payment_amount ? Number(meta.payment_amount) : undefined),
    payment_paid_at: row.payment_paid_at || meta?.payment_paid_at || undefined,
    payment_receipt_url: row.payment_receipt_url || meta?.payment_receipt_url || undefined,
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
        return rows
          .filter((r: any) => r.slug !== "__system_maintenance__" && r.category !== "system")
          .map((r: any) => {
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

  return [...mockEvents]
    .filter((e) => e.slug !== "__system_maintenance__" && e.category !== "system")
    .sort(
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
        .or(`slug.eq.${slug},id.eq.${slug}`)
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
      // 1. Pastikan slug unik di Supabase
      let finalSlug = newEvent.slug;
      try {
        const { data: existingSlug } = await client
          .from("events")
          .select("id")
          .eq("slug", finalSlug)
          .maybeSingle();

        if (existingSlug) {
          finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
          newEvent.slug = finalSlug;
        }
      } catch (sErr) {
        console.warn("[Supabase] Slug check skipped:", sErr);
      }

      // 2. Kemas metadata ke default_frame_config (karena schema events Supabase menyimpan category & package info di sini)
      const default_frame_config = {
        ...(newEvent.default_frame_config || {}),
        ...(newEvent.theme_config ? { _theme_config: newEvent.theme_config } : {}),
        _package_info: {
          category: newEvent.category || "virtual_photobooth",
          package_tier: newEvent.package_tier,
          package_name: newEvent.package_name,
          payment_status: newEvent.payment_status || "PAID",
          payment_amount: newEvent.payment_amount,
          payment_method: newEvent.payment_method,
          payment_invoice: newEvent.payment_invoice,
          license_start_date: newEvent.license_start_date,
          license_end_date: newEvent.license_end_date,
        },
      };

      // 3. Masukkan hanya kolom-kolom yang valid pada tabel events Supabase
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
        default_frame_config: default_frame_config,
      });

      if (evErr) {
        console.error("[Supabase] createEvent error:", evErr.message);
        throw new Error(evErr.message);
      }

      // 4. Masukkan frame yang ditugaskan jika ada
      if (newEvent.assigned_frames && newEvent.assigned_frames.length > 0) {
        for (let i = 0; i < newEvent.assigned_frames.length; i++) {
          const fr = newEvent.assigned_frames[i];
          try {
            await client.from("frames").upsert({
              id: fr.id,
              name: fr.name,
              slug: fr.slug || `frame-${newEvent.id}-${i + 1}`,
              template_type: fr.template_type || "custom",
              preview_url: fr.preview_url || null,
              config_json: fr.config_json || {},
              is_active: true,
            });

            await client.from("event_frames").insert({
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

      mockEvents.unshift(newEvent);
      return newEvent;
    } catch (err: any) {
      console.error("[Supabase] createEvent failed:", err?.message);
      throw err;
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
      // Note: category dan theme_config dikemas ke default_frame_config karena tidak ada kolom fisik terpisah di tabel events
      if (updates.status !== undefined) updatePayload.status = updates.status;
      if (updates.is_active !== undefined) updatePayload.is_active = updates.is_active;
      if (updates.allow_guestbook !== undefined) updatePayload.allow_guestbook = updates.allow_guestbook;
      if (updates.allow_voice_note !== undefined) updatePayload.allow_voice_note = updates.allow_voice_note;
      if (updates.allow_custom_frame !== undefined) updatePayload.allow_custom_frame = updates.allow_custom_frame;
      if (updates.default_frame_config !== undefined) updatePayload.default_frame_config = updates.default_frame_config;

      if (
        updates.category !== undefined ||
        updates.package_tier !== undefined ||
        updates.package_name !== undefined ||
        updates.payment_status !== undefined ||
        updates.payment_amount !== undefined ||
        updates.payment_method !== undefined ||
        updates.payment_invoice !== undefined ||
        updates.license_start_date !== undefined ||
        updates.license_end_date !== undefined ||
        updates.theme_config !== undefined
      ) {
        let baseConfig: any = updates.default_frame_config;
        if (!baseConfig) {
          const { data: currentEv } = await client.from("events").select("default_frame_config").eq("id", id).maybeSingle();
          baseConfig = parseJsonField(currentEv?.default_frame_config, {});
        }
        const existingMeta = (baseConfig as any)?._package_info || {};
        updatePayload.default_frame_config = {
          ...(typeof baseConfig === "object" ? baseConfig : {}),
          ...(updates.theme_config !== undefined ? { _theme_config: updates.theme_config } : {}),
          _package_info: {
            ...existingMeta,
            ...(updates.category !== undefined ? { category: updates.category } : {}),
            ...(updates.package_tier !== undefined ? { package_tier: updates.package_tier } : {}),
            ...(updates.package_name !== undefined ? { package_name: updates.package_name } : {}),
            ...(updates.payment_status !== undefined ? { payment_status: updates.payment_status } : {}),
            ...(updates.payment_amount !== undefined ? { payment_amount: updates.payment_amount } : {}),
            ...(updates.payment_method !== undefined ? { payment_method: updates.payment_method } : {}),
            ...(updates.payment_invoice !== undefined ? { payment_invoice: updates.payment_invoice } : {}),
            ...(updates.license_start_date !== undefined ? { license_start_date: updates.license_start_date } : {}),
            ...(updates.license_end_date !== undefined ? { license_end_date: updates.license_end_date } : {}),
          },
        };
      }

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
      if (updated) {
        const mockIdx = mockEvents.findIndex((e) => e.id === id || e.slug === id);
        if (mockIdx !== -1) mockEvents[mockIdx] = updated;
        return updated;
      }
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

export async function updateEventPaymentByInvoice(
  invoiceNumber: string,
  paymentStatus: "PAID" | "PENDING" | "UNPAID" | "FAILED",
  paymentMethod?: string
): Promise<boolean> {
  const client = getDbClient();
  if (client) {
    try {
      const { error } = await client
        .from("events")
        .update({
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          is_active: paymentStatus === "PAID",
        })
        .eq("payment_invoice", invoiceNumber);

      if (error) {
        console.warn("[Supabase] updateEventPaymentByInvoice error:", error.message);
      } else {
        return true;
      }
    } catch (err: any) {
      console.warn("[Supabase] updateEventPaymentByInvoice exception:", err?.message);
    }
  }

  const ev = mockEvents.find((e) => e.payment_invoice === invoiceNumber);
  if (ev) {
    ev.payment_status = paymentStatus;
    if (paymentMethod) ev.payment_method = paymentMethod;
    if (paymentStatus === "PAID") ev.is_active = true;
    return true;
  }
  return false;
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
      } else if (data) {
        const dbBookings = data.map(mapBookingRow);
        const dbIds = new Set(dbBookings.map((b) => b.id));
        const extraMocks = mockBookings.filter((b) => !dbIds.has(b.id));
        return [...extraMocks, ...dbBookings];
      }
    } catch (err: any) {
      console.warn("[Supabase] getBookings exception:", err?.message);
    }
  }
  return mockBookings;
}

function normalizePackageId(pkgId?: string | null): string | null {
  if (!pkgId) return null;
  if (
    pkgId === "11111111-1111-1111-1111-111111111111" ||
    pkgId === "pkg-fisik-2h" ||
    pkgId === "pkg-basic" ||
    pkgId === "paket-basic" ||
    pkgId === "paket-2-jam" ||
    pkgId === "paket-2-jam-photobooth" ||
    pkgId === "paket-basic-photobooth"
  ) {
    return "11111111-1111-1111-1111-111111111111";
  }
  if (
    pkgId === "44444444-4444-4444-4444-444444444444" ||
    pkgId === "pkg-fisik-3h" ||
    pkgId === "pkg-deluxe" ||
    pkgId === "paket-standard-deluxe" ||
    pkgId === "paket-3-jam" ||
    pkgId === "paket-3-jam-photobooth" ||
    pkgId === "paket-deluxe"
  ) {
    return "44444444-4444-4444-4444-444444444444";
  }
  if (
    pkgId === "55555555-5555-5555-5555-555555555555" ||
    pkgId === "pkg-fisik-4h" ||
    pkgId === "paket-4-jam" ||
    pkgId === "paket-4-jam-photobooth"
  ) {
    return "55555555-5555-5555-5555-555555555555";
  }
  if (
    pkgId === "66666666-6666-6666-6666-666666666666" ||
    pkgId === "pkg-fisik-5h" ||
    pkgId === "paket-5-jam" ||
    pkgId === "paket-5-jam-photobooth"
  ) {
    return "66666666-6666-6666-6666-666666666666";
  }
  if (
    pkgId === "77777777-7777-7777-7777-777777777777" ||
    pkgId === "pkg-bronze" ||
    pkgId === "paket-bronze" ||
    pkgId === "bronze"
  ) {
    return "77777777-7777-7777-7777-777777777777";
  }
  if (
    pkgId === "22222222-2222-2222-2222-222222222222" ||
    pkgId === "pkg-silver" ||
    pkgId === "paket-silver" ||
    pkgId === "silver"
  ) {
    return "22222222-2222-2222-2222-222222222222";
  }
  if (pkgId === "33333333-3333-3333-3333-333333333333" || pkgId === "pkg-gold" || pkgId === "paket-gold") {
    return "33333333-3333-3333-3333-333333333333";
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(pkgId)) {
    return pkgId;
  }
  return null;
}

export async function createBooking(
  booking: Omit<Booking, "id" | "created_at" | "status"> & { status?: BookingStatus }
): Promise<Booking> {
  const resolvedPackageId = normalizePackageId(booking.package_id);
  const pkgNameLower = String(booking.package_name || "").toLowerCase();
  const isPhysical =
    booking.category === "photobooth" ||
    booking.booking_category === "photobooth" ||
    pkgNameLower.includes("photobooth") ||
    pkgNameLower.includes("cetak fisik") ||
    pkgNameLower.includes("jam") ||
    booking.package_id?.includes("11111111") ||
    booking.package_id?.includes("44444444") ||
    booking.package_id?.includes("55555555") ||
    booking.package_id?.includes("66666666") ||
    booking.package_id?.includes("fisik") ||
    booking.package_id?.includes("basic") ||
    booking.package_id?.includes("deluxe");

  const resolvedCategory =
    booking.category ||
    booking.booking_category ||
    (isPhysical ? "photobooth" : "virtual_photobooth");

  const resolvedPackageName =
    booking.package_name ||
    (resolvedPackageId === "11111111-1111-1111-1111-111111111111"
      ? "Paket 2 Jam Photobooth"
      : resolvedPackageId === "44444444-4444-4444-4444-444444444444"
      ? "Paket 3 Jam Photobooth"
      : resolvedPackageId === "55555555-5555-5555-5555-555555555555"
      ? "Paket 4 Jam Photobooth"
      : resolvedPackageId === "66666666-6666-6666-6666-666666666666"
      ? "Paket 5 Jam Photobooth"
      : resolvedPackageId === "77777777-7777-7777-7777-777777777777"
      ? "Paket Bronze"
      : resolvedPackageId === "33333333-3333-3333-3333-333333333333"
      ? "Paket Gold"
      : "Paket Silver");

  const resolvedPrice =
    booking.total_price ||
    (resolvedPackageId === "11111111-1111-1111-1111-111111111111"
      ? 2000000
      : resolvedPackageId === "44444444-4444-4444-4444-444444444444"
      ? 2500000
      : resolvedPackageId === "55555555-5555-5555-5555-555555555555"
      ? 3000000
      : resolvedPackageId === "66666666-6666-6666-6666-666666666666"
      ? 3500000
      : resolvedPackageId === "77777777-7777-7777-7777-777777777777"
      ? 250000
      : resolvedPackageId === "33333333-3333-3333-3333-333333333333"
      ? 450000
      : 350000);

  const newBooking: Booking = {
    ...booking,
    id: randomUUID(),
    package_id: resolvedPackageId || (booking.package_id || ""),
    package_name: resolvedPackageName,
    category: resolvedCategory,
    booking_category: resolvedCategory,
    status: booking.status || "pending",
    total_price: resolvedPrice,
    payment_status: booking.payment_status || "PENDING",
    payment_method: booking.payment_method || undefined,
    payment_invoice: booking.payment_invoice || undefined,
    payment_amount: booking.payment_amount || resolvedPrice,
    payment_paid_at: booking.payment_paid_at || undefined,
    payment_receipt_url: booking.payment_receipt_url || undefined,
    created_at: new Date().toISOString(),
  };

  const client = getDbClient();
  if (client) {
    try {
      const meta = {
        category: resolvedCategory,
        booking_category: resolvedCategory,
        payment_status: newBooking.payment_status,
        payment_method: newBooking.payment_method,
        payment_invoice: newBooking.payment_invoice,
        payment_amount: newBooking.payment_amount,
        payment_paid_at: newBooking.payment_paid_at,
        payment_receipt_url: newBooking.payment_receipt_url,
      };

      const basePayload: Record<string, any> = {
        id: newBooking.id,
        customer_name: newBooking.customer_name,
        customer_email: newBooking.customer_email || "",
        customer_phone: newBooking.customer_phone,
        event_type: newBooking.event_type,
        event_name: newBooking.event_name,
        event_date: newBooking.event_date,
        event_time: newBooking.event_time || null,
        location: newBooking.location,
        city: newBooking.city || "Palopo",
        package_id: resolvedPackageId,
        package_name: resolvedPackageName,
        status: newBooking.status,
        notes: encodeBookingNotes(newBooking.notes, meta),
        total_price: newBooking.total_price || 0,
      };

      const { error } = await client.from("bookings").insert(basePayload);

      if (error) {
        console.warn("[Supabase] createBooking insert error (retrying with null package_id fallback):", error.message);
        if (error.message.includes("foreign key") || error.message.includes("violates foreign key")) {
          const fallbackPayload = { ...basePayload, package_id: null };
          const { error: fkErr } = await client.from("bookings").insert(fallbackPayload);
          if (fkErr) {
            console.error("[Supabase] createBooking FK fallback failed:", fkErr.message);
          }
        }
      }

      mockBookings.unshift(newBooking);
      return newBooking;
    } catch (err: any) {
      console.warn("[Supabase] createBooking exception:", err?.message);
      mockBookings.unshift(newBooking);
      return newBooking;
    }
  }

  mockBookings.unshift(newBooking);
  return newBooking;
}

export async function updateBooking(id: string, updates: Partial<Booking>): Promise<boolean> {
  const client = getDbClient();
  if (client) {
    try {
      const { data: cur } = await client.from("bookings").select("*").eq("id", id).maybeSingle();
      const curNotes = cur?.notes || "";
      const { cleanNotes, meta: existingMeta } = parseBookingNotes(curNotes);

      const mergedMeta = {
        ...existingMeta,
        ...(updates.category && { category: updates.category, booking_category: updates.category }),
        ...(updates.booking_category && { booking_category: updates.booking_category }),
        ...(updates.payment_status && { payment_status: updates.payment_status }),
        ...(updates.payment_method && { payment_method: updates.payment_method }),
        ...(updates.payment_invoice && { payment_invoice: updates.payment_invoice }),
        ...(updates.payment_amount !== undefined && { payment_amount: updates.payment_amount }),
        ...(updates.payment_paid_at !== undefined && { payment_paid_at: updates.payment_paid_at }),
        ...(updates.payment_receipt_url !== undefined && { payment_receipt_url: updates.payment_receipt_url }),
      };

      const targetNotesText = updates.notes !== undefined ? updates.notes : cleanNotes;
      const encodedNotes = encodeBookingNotes(targetNotesText, mergedMeta);

      const baseUpdates: Record<string, any> = {};
      if (updates.status !== undefined) baseUpdates.status = updates.status;
      if (updates.customer_name !== undefined) baseUpdates.customer_name = updates.customer_name;
      if (updates.customer_email !== undefined) baseUpdates.customer_email = updates.customer_email;
      if (updates.customer_phone !== undefined) baseUpdates.customer_phone = updates.customer_phone;
      if (updates.event_type !== undefined) baseUpdates.event_type = updates.event_type;
      if (updates.event_name !== undefined) baseUpdates.event_name = updates.event_name;
      if (updates.event_date !== undefined) baseUpdates.event_date = updates.event_date;
      if (updates.event_time !== undefined) baseUpdates.event_time = updates.event_time;
      if (updates.location !== undefined) baseUpdates.location = updates.location;
      if (updates.city !== undefined) baseUpdates.city = updates.city;
      if (updates.package_id !== undefined) baseUpdates.package_id = normalizePackageId(updates.package_id);
      if (updates.package_name !== undefined) baseUpdates.package_name = updates.package_name;
      if (updates.total_price !== undefined) baseUpdates.total_price = updates.total_price;
      baseUpdates.notes = encodedNotes;

      const { error } = await client.from("bookings").update(baseUpdates).eq("id", id);
      if (error) {
        console.warn("[Supabase] updateBooking error:", error.message);
      }

      const b = mockBookings.find((item) => item.id === id);
      if (b) Object.assign(b, updates);
      return true;
    } catch (err: any) {
      console.warn("[Supabase] updateBooking exception:", err?.message);
    }
  }

  const b = mockBookings.find((item) => item.id === id);
  if (b) {
    Object.assign(b, updates);
    return true;
  }
  return false;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<boolean> {
  return updateBooking(id, { status });
}

export async function deleteBooking(id: string): Promise<boolean> {
  const idx = mockBookings.findIndex((item) => item.id === id);
  if (idx !== -1) {
    mockBookings.splice(idx, 1);
  }

  const client = getDbClient();
  if (client) {
    try {
      const { error } = await client.from("bookings").delete().eq("id", id);
      if (error) {
        console.warn("[Supabase] deleteBooking error:", error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn("[Supabase] deleteBooking exception:", err?.message);
      return false;
    }
  }

  return idx !== -1;
}

// ============================================================================
// ENTRIES API (Guest Photobooth & Gallery)
// ============================================================================
export async function getAllEntries(): Promise<GalleryEntry[]> {
  const client = getDbClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[Supabase] getAllEntries error:", error.message);
      } else if (data) {
        return data.map(mapEntryRow);
      }
    } catch (err: any) {
      console.warn("[Supabase] getAllEntries exception:", err?.message);
    }
  }

  return [...mockEntries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

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

