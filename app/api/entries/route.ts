import { NextRequest, NextResponse } from "next/server";
import { getAllEntries } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("rt_admin_session")?.value;
    const isAdmin = await verifyAdminToken(sessionToken);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Diperlukan akses admin" },
        { status: 401 }
      );
    }

    const entries = await getAllEntries();
    return NextResponse.json(
      { success: true, entries },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
