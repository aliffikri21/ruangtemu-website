import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getDbClient, isSupabaseConfigured } from "./supabase";

const STORAGE_BUCKET = "ruangtemu-media";

/**
 * Upload buffer to Supabase Storage if configured.
 * Returns public URL on success, null on failure.
 */
async function uploadToSupabase(
  buffer: Buffer,
  storagePath: string,
  contentType: string
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const client = getDbClient();
  if (!client) return null;

  try {
    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn("[Supabase Storage] upload error:", error.message);
      return null;
    }

    const { data: urlData } = client.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return urlData.publicUrl;
  } catch (err: any) {
    console.warn("[Supabase Storage] exception:", err?.message);
    return null;
  }
}

/**
 * Saves a frame PNG (base64 data-URL or Buffer).
 * Prefers Supabase Storage; falls back to public uploads directory for local dev.
 */
export async function saveFrameImage(
  dataUrlOrBuffer: string | Buffer,
  filenameHint?: string
): Promise<string> {
  if (typeof dataUrlOrBuffer === "string") {
    // If it's already an absolute or static URL, don't re-save
    if (
      dataUrlOrBuffer.startsWith("/") ||
      dataUrlOrBuffer.startsWith("http://") ||
      dataUrlOrBuffer.startsWith("https://")
    ) {
      return dataUrlOrBuffer;
    }

    if (dataUrlOrBuffer.startsWith("data:image/")) {
      const cleanHint = (filenameHint || "frame")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 30);
      const filename = `${cleanHint || "frame"}-${Date.now()}-${randomUUID().slice(0, 8)}.png`;

      const base64Data = dataUrlOrBuffer.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // 1. Try Supabase Storage (Preferred for Vercel)
      const supabaseUrl = await uploadToSupabase(buffer, `frames/${filename}`, "image/png");
      if (supabaseUrl) return supabaseUrl;

      // 2. Local fallback
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "frames");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        return `/uploads/frames/${filename}`;
      } catch (fsErr) {
        console.warn("[saveFrameImage] Local filesystem write failed:", fsErr);
        return dataUrlOrBuffer; // return base64 if filesystem is read-only (e.g. Vercel without Supabase)
      }
    }

    return dataUrlOrBuffer;
  }

  // If buffer
  const cleanHint = (filenameHint || "frame")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
  const filename = `${cleanHint || "frame"}-${Date.now()}-${randomUUID().slice(0, 8)}.png`;

  const supabaseUrl = await uploadToSupabase(dataUrlOrBuffer, `frames/${filename}`, "image/png");
  if (supabaseUrl) return supabaseUrl;

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "frames");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, dataUrlOrBuffer);
    return `/uploads/frames/${filename}`;
  } catch (fsErr) {
    console.warn("[saveFrameImage] Local filesystem write failed:", fsErr);
    return `/uploads/frames/${filename}`;
  }
}

/**
 * Saves a guest entry photo (base64 data-URL or Buffer).
 * Prefers Supabase Storage; falls back to public uploads directory for local dev.
 */
export async function saveEntryPhoto(
  dataUrlOrBuffer: string | Buffer,
  filenameHint?: string
): Promise<string> {
  if (typeof dataUrlOrBuffer === "string") {
    if (
      dataUrlOrBuffer.startsWith("/") ||
      dataUrlOrBuffer.startsWith("http://") ||
      dataUrlOrBuffer.startsWith("https://")
    ) {
      return dataUrlOrBuffer;
    }

    if (dataUrlOrBuffer.startsWith("data:image/")) {
      const match = dataUrlOrBuffer.match(/^data:image\/(\w+);base64,/);
      const ext = match ? (match[1] === "jpeg" ? "jpg" : match[1]) : "png";
      const contentType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
      const cleanHint = (filenameHint || "entry")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 30);
      const filename = `${cleanHint || "entry"}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

      const base64Data = dataUrlOrBuffer.includes(";base64,")
        ? dataUrlOrBuffer.split(";base64,")[1]
        : dataUrlOrBuffer;
      const buffer = Buffer.from(base64Data, "base64");

      // 1. Try Supabase Storage (Preferred for Vercel)
      const supabaseUrl = await uploadToSupabase(buffer, `entries/${filename}`, contentType);
      if (supabaseUrl) return supabaseUrl;

      // 2. Local fallback
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "entries");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        return `/uploads/entries/${filename}`;
      } catch (fsErr) {
        console.warn("[saveEntryPhoto] Local filesystem write failed:", fsErr);
        return dataUrlOrBuffer;
      }
    }

    return dataUrlOrBuffer;
  }

  const filename = `entry-${Date.now()}-${randomUUID().slice(0, 8)}.png`;
  const supabaseUrl = await uploadToSupabase(dataUrlOrBuffer, `entries/${filename}`, "image/png");
  if (supabaseUrl) return supabaseUrl;

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "entries");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, filename), dataUrlOrBuffer);
    return `/uploads/entries/${filename}`;
  } catch (fsErr) {
    console.warn("[saveEntryPhoto] Local filesystem write failed:", fsErr);
    return `/uploads/entries/${filename}`;
  }
}

/**
 * Saves a guest voice note audio (base64 data-URL).
 * Prefers Supabase Storage; falls back to public uploads directory for local dev.
 */
export async function saveVoiceNote(
  dataUrlOrBase64: string | null | undefined,
  filenameHint?: string
): Promise<string | null> {
  if (!dataUrlOrBase64) return null;
  if (
    dataUrlOrBase64.startsWith("/") ||
    dataUrlOrBase64.startsWith("http://") ||
    dataUrlOrBase64.startsWith("https://")
  ) {
    return dataUrlOrBase64;
  }

  // Detect proper audio extension and mime type from data URL
  let ext = "webm";
  let contentType = "audio/webm";
  if (dataUrlOrBase64.startsWith("data:audio/")) {
    const match = dataUrlOrBase64.match(/^data:audio\/([a-zA-Z0-9]+)/);
    if (match) {
      const mimeSub = match[1].toLowerCase();
      if (mimeSub === "mp4" || mimeSub === "m4a" || mimeSub === "aac") {
        ext = "mp4";
        contentType = "audio/mp4";
      } else if (mimeSub === "ogg") {
        ext = "ogg";
        contentType = "audio/ogg";
      } else if (mimeSub === "wav") {
        ext = "wav";
        contentType = "audio/wav";
      } else if (mimeSub === "webm") {
        ext = "webm";
        contentType = "audio/webm";
      }
    }
  }

  const cleanHint = (filenameHint || "voice")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
  const filename = `${cleanHint || "voice"}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  const base64Data = dataUrlOrBase64.includes(";base64,")
    ? dataUrlOrBase64.split(";base64,")[1]
    : dataUrlOrBase64;

  const buffer = Buffer.from(base64Data, "base64");

  // 1. Try Supabase Storage (Preferred for Vercel)
  const supabaseUrl = await uploadToSupabase(buffer, `audio/${filename}`, contentType);
  if (supabaseUrl) return supabaseUrl;

  // 2. Local fallback
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "audio");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/audio/${filename}`;
  } catch (fsErr) {
    console.warn("[saveVoiceNote] Local filesystem write failed:", fsErr);
    return dataUrlOrBase64;
  }
}
