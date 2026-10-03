export type EventType = "wedding" | "birthday" | "corporate" | "gathering" | "graduation" | "prom" | "other";

export type EventStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export type FrameType = "strip_3" | "grid_4" | "polaroid" | "deluxe" | "custom";

export type CameraFilter = "normal" | "grayscale" | "sepia" | "soft-glow" | "warm-vintage" | "cool-cinema";

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  price: number;
  duration_hours: number;
  features: string[];
  popular?: boolean;
  category: "physical" | "virtual" | "hybrid";
  prints_included?: string;
  backdrop?: string;
}

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_type: EventType;
  event_name: string;
  event_date: string;
  event_time?: string;
  location: string;
  city: string;
  package_id: string;
  package_name?: string;
  status: BookingStatus;
  notes?: string;
  total_price: number;
  created_at: string;
}

export interface FrameConfig {
  type: FrameType;
  backgroundColor: string;
  borderColor: string;
  textContent?: string;
  subTextContent?: string;
  watermarkText?: string;
  fontFamily: string;
  textColor: string;
  padding: number;
  borderRadius: number;
  sticker?: string;
  customOverlayUrl?: string;
  filter?: CameraFilter;
  photoSlots?: PhotoSlot[];
  photoCount?: number;
  frameImageWidth?: number;
  frameImageHeight?: number;
}

export interface FrameItem {
  id: string;
  name: string;
  slug: string;
  template_type: FrameType;
  preview_url?: string;
  config_json: FrameConfig;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventFrame {
  id: string;
  event_id: string;
  frame_id: string;
  sort_order: number;
  frame?: FrameItem;
  created_at?: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  event_name?: string;
  host_name: string;
  client_name?: string;
  event_type: EventType;
  date: string;
  event_date?: string;
  venue: string;
  city: string;
  description?: string;
  cover_image?: string;
  cover_image_url?: string;
  status?: EventStatus;
  is_active: boolean;
  allow_guestbook: boolean;
  allow_voice_note: boolean;
  allow_custom_frame?: boolean;
  gallery_visibility?: "PUBLIC" | "PRIVATE";
  default_frame_config: FrameConfig;
  assigned_frames?: FrameItem[];
  created_at: string;
  updated_at?: string;
  stats?: {
    total_photos: number;
    total_wishes: number;
    total_voice_notes: number;
  };
}

export interface GalleryEntry {
  id: string;
  event_id: string;
  event_slug?: string;
  guest_name: string;
  photo_url: string;
  voice_note_url?: string | null;
  message?: string;
  created_at: string;
  is_approved: boolean;
  moderation_status?: ModerationStatus;
  filter_used?: CameraFilter;
  likes_count?: number;
  client_submission_id?: string;
}

export interface MediaAsset {
  id: string;
  event_id: string;
  entry_id?: string;
  media_type: "photo" | "audio" | "frame_overlay";
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface PublicFrameDTO {
  id: string;
  name: string;
  templateType: FrameType;
  previewUrl?: string;
  config: FrameConfig;
}

export interface PublicEventDTO {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  eventType: EventType;
  eventDate: string;
  venue: string;
  city: string;
  coverImageUrl?: string;
  status: EventStatus;
  allowGuestbook: boolean;
  allowVoiceNote: boolean;
  frames: PublicFrameDTO[];
}
