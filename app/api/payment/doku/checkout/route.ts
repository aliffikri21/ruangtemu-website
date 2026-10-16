import { NextRequest, NextResponse } from "next/server";
import { createDokuCheckoutSession } from "@/lib/doku";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.amount || !body.orderId || !body.eventName) {
      return NextResponse.json(
        { success: false, error: "Parameter orderId, amount, dan eventName wajib disertakan" },
        { status: 400 }
      );
    }

    const session = await createDokuCheckoutSession({
      orderId: body.orderId,
      amount: Number(body.amount),
      eventName: body.eventName,
      customerName: body.customerName || "Admin RUANGTEMU",
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      packageName: body.packageName || "Virtual Photobooth",
      addons: body.addons,
    });

    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Server error saat membuat checkout DOKU" },
      { status: 500 }
    );
  }
}
