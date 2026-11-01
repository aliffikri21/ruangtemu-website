import { NextRequest, NextResponse } from "next/server";
import { saveFrameImage } from "@/lib/save-frame";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("rt_admin_session")?.value;
    const isAdmin = await verifyAdminToken(sessionToken);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Diperlukan akses admin" },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: "File tidak ditemukan" }, { status: 400 });
      }

      // Max 15MB
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: "Ukuran frame melebihi batas (max 15MB)" }, { status: 413 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const url = await saveFrameImage(buffer, file.name);

      return NextResponse.json({ success: true, url, fileName: file.name });
    }

    // JSON payload with dataUrl
    const body = await req.json();
    if (!body.dataUrl) {
      return NextResponse.json({ success: false, error: "Data URL tidak ditemukan" }, { status: 400 });
    }

    // Max ~20MB string
    if (typeof body.dataUrl === "string" && body.dataUrl.length > 20 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Ukuran frame melebihi batas" }, { status: 413 });
    }

    const url = await saveFrameImage(body.dataUrl, body.fileName || "frame");
    return NextResponse.json({ success: true, url, fileName: body.fileName });
  } catch (error: any) {
    console.error("Frame upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal mengunggah frame" },
      { status: 500 }
    );
  }
}
