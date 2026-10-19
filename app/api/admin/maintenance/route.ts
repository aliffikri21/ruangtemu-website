import { NextRequest, NextResponse } from "next/server";
import { getMaintenanceConfig, setMaintenanceConfig } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getMaintenanceConfig();
    return NextResponse.json({
      success: true,
      enabled: config.enabled,
      message: config.message,
      updatedAt: config.updatedAt,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memeriksa status maintenance";
    return NextResponse.json({ success: false, error: msg, enabled: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Parameter 'enabled' harus bernilai boolean (true/false)" },
        { status: 400 }
      );
    }

    const updated = await setMaintenanceConfig(body.enabled, body.message);

    const response = NextResponse.json({
      success: true,
      enabled: updated.enabled,
      message: updated.message,
      updatedAt: updated.updatedAt,
    });

    // Ensure any legacy bypass cookie is cleared
    response.cookies.delete("rt_admin_bypass");

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memperbarui status maintenance";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
