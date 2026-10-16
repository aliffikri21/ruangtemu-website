import { NextRequest, NextResponse } from "next/server";
import { createDokuVirtualAccount } from "@/lib/doku";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.invoiceNumber || !body.amount || !body.bank) {
      return NextResponse.json(
        { success: false, error: "Parameter invoiceNumber, amount, dan bank wajib diisi" },
        { status: 400 }
      );
    }

    const result = await createDokuVirtualAccount({
      invoiceNumber: body.invoiceNumber,
      amount: Number(body.amount),
      bank: body.bank,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Server error saat membuat VA DOKU" },
      { status: 500 }
    );
  }
}
