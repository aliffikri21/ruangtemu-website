import { NextRequest, NextResponse } from "next/server";
import { deleteEntry } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const sessionToken = req.cookies.get("rt_admin_session")?.value;
    const isAdmin = await verifyAdminToken(sessionToken);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Diperlukan akses admin" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const success = await deleteEntry(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Gagal menghapus foto" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, message: "Foto berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
