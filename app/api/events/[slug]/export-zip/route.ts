import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { getEventBySlug, getEventEntries, getAllEntries } from "@/lib/db";
import { GalleryEntry } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

function cleanFilename(str: string): string {
  return (str || "tamu")
    .trim()
    .replace(/[^a-zA-Z0-9_\-\u00C0-\u024F]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30) || "tamu";
}

async function fetchFileBuffer(url: string): Promise<{ buffer: Buffer; ext: string } | null> {
  try {
    if (url.startsWith("data:image/")) {
      const match = url.match(/^data:image\/(\w+);base64,/);
      const ext = match ? (match[1] === "jpeg" ? "jpg" : match[1]) : "png";
      const base64Data = url.includes(";base64,") ? url.split(";base64,")[1] : url;
      return { buffer: Buffer.from(base64Data, "base64"), ext };
    }

    if (url.startsWith("data:audio/")) {
      const base64Data = url.includes(";base64,") ? url.split(";base64,")[1] : url;
      return { buffer: Buffer.from(base64Data, "base64"), ext: "webm" };
    }

    if (url.startsWith("/uploads/")) {
      const cleanRel = url.split("?")[0].replace(/^\//, "");
      const localPath = path.join(process.cwd(), "public", cleanRel);
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).replace(".", "") || "png";
        return { buffer, ext };
      }
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const pathname = new URL(url).pathname;
        let ext = path.extname(pathname).replace(".", "").toLowerCase();
        if (!ext || ext.length > 4) ext = "png";
        return { buffer, ext };
      }
    }

    return null;
  } catch (err) {
    console.warn("[export-zip] fetchFileBuffer error:", err);
    return null;
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    let eventTitle = "Semua Acara";
    let eventSlug = slug;
    let entries: GalleryEntry[] = [];

    if (slug === "all") {
      entries = await getAllEntries();
      eventTitle = "Semua Galeri RuangTemu";
      eventSlug = "semua-galeri";
    } else {
      const event = await getEventBySlug(slug);
      if (!event) {
        return NextResponse.json({ success: false, error: "Event tidak ditemukan" }, { status: 404 });
      }
      eventTitle = event.title;
      eventSlug = event.slug || event.id;
      entries = await getEventEntries(event.id);
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada foto di galeri acara ini" },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    let textWishes = `========================================================\n`;
    textWishes += `RUANGTEMU VIRTUAL PHOTOBOOTH - REKAP GALERI TAMU\n`;
    textWishes += `Acara   : ${eventTitle}\n`;
    textWishes += `Total   : ${entries.length} Foto\n`;
    textWishes += `Diunduh : ${new Date().toLocaleString("id-ID")}\n`;
    textWishes += `========================================================\n\n`;

    let successCount = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const guestClean = cleanFilename(entry.guest_name);
      const numPrefix = String(i + 1).padStart(2, "0");

      // 1. Process Photo
      if (entry.photo_url) {
        const photoData = await fetchFileBuffer(entry.photo_url);
        if (photoData) {
          const photoName = `${numPrefix}_${guestClean}_${entry.id.slice(0, 6)}.${photoData.ext}`;
          zip.file(photoName, photoData.buffer);
          successCount++;
        }
      }

      // 2. Process Voice Note if present
      if (entry.voice_note_url) {
        const audioData = await fetchFileBuffer(entry.voice_note_url);
        if (audioData) {
          const audioName = `audio/${numPrefix}_${guestClean}_voice.${audioData.ext}`;
          zip.file(audioName, audioData.buffer);
        }
      }

      // 3. Append to Guestbook Wishes summary
      textWishes += `[#${numPrefix}] ${entry.guest_name}\n`;
      textWishes += `Waktu : ${new Date(entry.created_at).toLocaleString("id-ID")}\n`;
      textWishes += `Pesan : ${entry.message?.trim() ? entry.message.trim() : "(Tidak ada pesan teks)"}\n`;
      if (entry.voice_note_url) {
        textWishes += `Audio : Ada voice note terlampir di folder audio/\n`;
      }
      textWishes += `--------------------------------------------------------\n\n`;
    }

    // Add guest wishes txt file
    zip.file("ucapan_dan_doa_tamu.txt", textWishes);

    if (successCount === 0) {
      return NextResponse.json(
        { success: false, error: "Gagal memproses file foto galeri untuk di-zip" },
        { status: 500 }
      );
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const safeZipName = `galeri-${cleanFilename(eventSlug)}-${Date.now()}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeZipName}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[export-zip] Error generating zip:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal membuat file ZIP" },
      { status: 500 }
    );
  }
}
