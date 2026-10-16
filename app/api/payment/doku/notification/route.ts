import { NextRequest, NextResponse } from "next/server";
import { updateEventPaymentByInvoice } from "@/lib/db";
import { markInvoiceAsPaid } from "@/lib/doku";

export const dynamic = "force-dynamic";

/**
 * DOKU Payment Notification (Webhook) Endpoint
 * DOKU akan mengirimkan HTTP POST ke endpoint ini ketika pembayaran berhasil diselesaikan di Sandbox / Production
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[DOKU Notification Webhook]:", JSON.stringify(body, null, 2));

    const invoiceNumber = body?.order?.invoice_number;
    const transactionStatus = body?.transaction?.status;
    const channelId = body?.channel?.id || body?.payment?.payment_method_type || "DOKU_PAYMENT";

    if (invoiceNumber) {
      const isPaid = transactionStatus === "SUCCESS";
      if (isPaid) {
        markInvoiceAsPaid(invoiceNumber);
      }
      await updateEventPaymentByInvoice(
        invoiceNumber,
        isPaid ? "PAID" : "FAILED",
        channelId
      );
    }

    // DOKU mensyaratkan response status 200 dengan text atau JSON
    return new NextResponse("SUCCESS", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    console.error("[DOKU Notification Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Notification failed" },
      { status: 500 }
    );
  }
}
