import { NextRequest, NextResponse } from "next/server";
import { saveLandingBgImage } from "@/lib/save-frame";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const slug = (formData.get("slug") as string | null) || "landing-bg";
      if (!file) {
        return NextResponse.json(
          { success: false, error: "File tidak ditemukan" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const url = await saveLandingBgImage(buffer, `${slug}-bg`);

      return NextResponse.json({ success: true, url, fileName: file.name });
    }

    // JSON payload with dataUrl
    const body = await req.json();
    if (!body.dataUrl) {
      return NextResponse.json(
        { success: false, error: "Data URL tidak ditemukan" },
        { status: 400 }
      );
    }

    const url = await saveLandingBgImage(body.dataUrl, body.fileName || "landing-bg");
    return NextResponse.json({ success: true, url, fileName: body.fileName });
  } catch (error: any) {
    console.error("Landing background upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal mengunggah foto background" },
      { status: 500 }
    );
  }
}
