import { NextRequest, NextResponse } from "next/server";
import { createBooking, deleteBooking } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customer_name || !body.customer_phone || !body.event_date || !body.location) {
      return NextResponse.json(
        { error: "Semua kolom wajib harus diisi" },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      customer_name: body.customer_name,
      customer_email: body.customer_email || "",
      customer_phone: body.customer_phone,
      event_type: body.event_type || "wedding",
      event_name: body.event_name,
      event_date: body.event_date,
      event_time: body.event_time || "18:30",
      location: body.location,
      city: body.city || "Palopo",
      package_id: body.package_id || "pkg-silver",
      package_name: body.package_name || "Paket Silver",
      notes: body.notes || "",
      total_price: body.total_price || 350000,
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Booking ID diperlukan" }, { status: 400 });
    }

    await deleteBooking(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

