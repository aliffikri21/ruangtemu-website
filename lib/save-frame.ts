import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Saves a frame PNG (base64 data-URL or Buffer) to the public uploads folder.
 * Returns the public static URL, e.g. "/uploads/frames/frame-123.png".
 * If the input is already a static URL (starts with "/"), returns it directly.
 */
export function saveFrameImage(dataUrlOrBuffer: string | Buffer, filenameHint?: string): string {
  if (typeof dataUrlOrBuffer === "string") {
    // If it's already a static URL, don't re-save
    if (dataUrlOrBuffer.startsWith("/") || dataUrlOrBuffer.startsWith("http://") || dataUrlOrBuffer.startsWith("https://")) {
      return dataUrlOrBuffer;
    }

    if (dataUrlOrBuffer.startsWith("data:image/")) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "frames");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const cleanHint = (filenameHint || "frame")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 30);
      const filename = `${cleanHint || "frame"}-${Date.now()}-${randomUUID().slice(0, 8)}.png`;
      const filePath = path.join(uploadDir, filename);

      const base64Data = dataUrlOrBuffer.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(filePath, buffer);
      return `/uploads/frames/${filename}`;
    }

    return dataUrlOrBuffer;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "frames");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const cleanHint = (filenameHint || "frame")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
  const filename = `${cleanHint || "frame"}-${Date.now()}-${randomUUID().slice(0, 8)}.png`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, dataUrlOrBuffer);
  return `/uploads/frames/${filename}`;
}

/**
 * Saves a guest entry photo (base64 data-URL or Buffer) to public/uploads/entries.
 * Returns public static URL, e.g. "/uploads/entries/entry-123.png".
 */
export function saveEntryPhoto(dataUrlOrBuffer: string | Buffer, filenameHint?: string): string {
  if (typeof dataUrlOrBuffer === "string") {
    if (dataUrlOrBuffer.startsWith("/") || dataUrlOrBuffer.startsWith("http://") || dataUrlOrBuffer.startsWith("https://")) {
      return dataUrlOrBuffer;
    }

    if (dataUrlOrBuffer.startsWith("data:image/")) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "entries");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const match = dataUrlOrBuffer.match(/^data:image\/(\w+);base64,/);
      const ext = match ? (match[1] === "jpeg" ? "jpg" : match[1]) : "png";
      const cleanHint = (filenameHint || "entry")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 30);
      const filename = `${cleanHint || "entry"}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
      const filePath = path.join(uploadDir, filename);

      const base64Data = dataUrlOrBuffer.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(filePath, buffer);
      return `/uploads/entries/${filename}`;
    }

    return dataUrlOrBuffer;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "entries");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `entry-${Date.now()}-${randomUUID().slice(0, 8)}.png`;
  fs.writeFileSync(path.join(uploadDir, filename), dataUrlOrBuffer);
  return `/uploads/entries/${filename}`;
}

/**
 * Saves a guest voice note audio (base64 data-URL) to public/uploads/audio.
 * Returns public static URL, e.g. "/uploads/audio/voice-123.webm".
 */
export function saveVoiceNote(dataUrlOrBase64: string | null | undefined, filenameHint?: string): string | null {
  if (!dataUrlOrBase64) return null;
  if (dataUrlOrBase64.startsWith("/") || dataUrlOrBase64.startsWith("http://") || dataUrlOrBase64.startsWith("https://")) {
    return dataUrlOrBase64;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "audio");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const cleanHint = (filenameHint || "voice")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
  const filename = `${cleanHint || "voice"}-${Date.now()}-${randomUUID().slice(0, 8)}.webm`;
  const filePath = path.join(uploadDir, filename);

  const base64Data = dataUrlOrBase64.replace(/^data:audio\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, buffer);
  return `/uploads/audio/${filename}`;
}

