import { NextRequest, NextResponse } from "next/server";
import { getPackages, updatePackage } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const packages = await getPackages();
    return NextResponse.json(
      { success: true, packages },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Package ID diperlukan" },
        { status: 400 }
      );
    }

    const updated = await updatePackage(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Paket tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, package: updated },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
