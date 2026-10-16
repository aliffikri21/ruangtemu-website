import { NextRequest, NextResponse } from "next/server";
import { checkDokuOrderStatus, isInvoicePaidLocally, markInvoiceAsPaid } from "@/lib/doku";

export const dynamic = "force-dynamic";

/**
 * Check Payment Status Endpoint for DOKU (Polling & Instant Status Check)
 * Digunakan oleh UI payment modal untuk mendeteksi secara realtime ketika user
 * menyelesaikan pembayaran di DOKU Sandbox Simulator atau Checkout page.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");
    const bank = searchParams.get("bank") || "BCA";

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, paid: false, error: "Parameter invoiceId diperlukan" },
        { status: 400 }
      );
    }

    // 1. Cek local cache / webhook memory
    if (isInvoicePaidLocally(invoiceId) || isInvoicePaidLocally(`${invoiceId}-${bank.toUpperCase()}`)) {
      return NextResponse.json({
        success: true,
        paid: true,
        status: "SUCCESS",
        source: "webhook_or_cache",
      });
    }

    // 2. Cek status ke DOKU API untuk invoice spesifik VA bank (e.g. INV-DOKU-908729-BCA)
    const vaInvoiceNumber = `${invoiceId}-${bank.toUpperCase()}`;
    const vaResult = await checkDokuOrderStatus(vaInvoiceNumber);

    if (vaResult.paid) {
      markInvoiceAsPaid(invoiceId);
      markInvoiceAsPaid(vaInvoiceNumber);
      return NextResponse.json({
        success: true,
        paid: true,
        status: "SUCCESS",
        source: "doku_api_va",
        data: vaResult.data,
      });
    }

    // 3. Cek status ke DOKU API untuk invoice dasar / checkout (e.g. INV-DOKU-908729)
    const baseResult = await checkDokuOrderStatus(invoiceId);
    if (baseResult.paid) {
      markInvoiceAsPaid(invoiceId);
      return NextResponse.json({
        success: true,
        paid: true,
        status: "SUCCESS",
        source: "doku_api_base",
        data: baseResult.data,
      });
    }

    // 4. Cek bank lain jika user membayar via bank berbeda
    for (const b of ["BCA", "MANDIRI", "BRI", "BNI"]) {
      if (b === bank.toUpperCase()) continue;
      const otherVaInv = `${invoiceId}-${b}`;
      if (isInvoicePaidLocally(otherVaInv)) {
        return NextResponse.json({
          success: true,
          paid: true,
          status: "SUCCESS",
          source: "local_cache",
        });
      }
    }

    return NextResponse.json({
      success: true,
      paid: false,
      status: "PENDING",
      checkedInvoices: [vaInvoiceNumber, invoiceId],
    });
  } catch (error: any) {
    console.error("[DOKU Status Route Error]:", error);
    return NextResponse.json(
      { success: false, paid: false, error: error?.message || "Gagal memeriksa status pembayaran" },
      { status: 500 }
    );
  }
}

/**
 * Endpoint POST untuk konfirmasi manual / instant simulator trigger
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoiceId = body.invoiceId;

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "Parameter invoiceId diperlukan" },
        { status: 400 }
      );
    }

    markInvoiceAsPaid(invoiceId);
    if (body.bank) {
      markInvoiceAsPaid(`${invoiceId}-${String(body.bank).toUpperCase()}`);
    }

    return NextResponse.json({
      success: true,
      paid: true,
      message: `Invoice ${invoiceId} berhasil ditandai sebagai PAID`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
