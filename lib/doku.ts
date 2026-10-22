/**
 * DOKU Payment Gateway Integration Helper
 * Mendukung Sandbox Mode untuk testing Virtual Photobooth RUANGTEMU
 */

export interface DokuConfig {
  clientId: string;
  sharedKey: string;
  mallId?: string;
  isSandbox: boolean;
  sandboxUrl: string;
  productionUrl: string;
}

export const DOKU_CONFIG: DokuConfig = {
  clientId: process.env.DOKU_CLIENT_ID || "",
  sharedKey: process.env.DOKU_SECRET_KEY || "",
  mallId: process.env.DOKU_MALL_ID || "",
  isSandbox: process.env.DOKU_ENVIRONMENT !== "production",
  sandboxUrl: "https://api-sandbox.doku.com",
  productionUrl: "https://api.doku.com",
};

export interface VirtualBoothPackage {
  id: "bronze" | "silver" | "gold";
  name: string;
  tag: string;
  price: number;
  durationDays: number;
  freeFrames: number;
  freeQrCards?: number;
  isRecommended: boolean;
  features: string[];
}

export const VIRTUAL_BOOTH_PACKAGES: Record<"bronze" | "silver" | "gold", VirtualBoothPackage> = {
  bronze: {
    id: "bronze",
    name: "BRONZE",
    tag: "250K",
    price: 250000,
    durationDays: 7,
    freeFrames: 1,
    freeQrCards: 0,
    isRecommended: false,
    features: [
      "Foto dan voice message ucapan",
      "Free 1 desain template frame (Strip/4R/Polaroid)",
      "Akses Web Photobooth Tanpa Aplikasi",
      "Akses foto 7 hari",
      "Unlimited foto",
    ],
  },
  silver: {
    id: "silver",
    name: "SILVER",
    tag: "350K",
    price: 350000,
    durationDays: 14,
    freeFrames: 2,
    freeQrCards: 0,
    isRecommended: true,
    features: [
      "Virtual Photobooth (Photo & Voice Message)",
      "Free 2 desain template frame (Strip/4R/Polaroid)",
      "Akses Web Photobooth Tanpa Aplikasi",
      "Unlimited Akses QR Code",
      "Akses foto 14 hari",
      "Unlimited foto",
    ],
  },
  gold: {
    id: "gold",
    name: "GOLD",
    tag: "450K",
    price: 450000,
    durationDays: 30,
    freeFrames: 3,
    freeQrCards: 0,
    isRecommended: false,
    features: [
      "Virtual Photobooth (Photo & Voice Message)",
      "Free 3 desain template frame (Strip/4R/Polaroid)",
      "Akses Web Photobooth Tanpa Aplikasi",
      "Unlimited Akses QR Code",
      "Akses foto 30 hari",
      "Unlimited foto",
    ],
  },
};

export const ADDON_PRICING = {
  qrCardsPer100: 0,
};

export type PhysicalPrintSize = "2R" | "4R";
export type PhysicalPackageKey = "hours2" | "hours3" | "hours4" | "hours5" | "basic" | "deluxe";

export interface PhotoboothPhysicalPackage {
  id: PhysicalPackageKey;
  name: string;
  tag: string;
  price: number; // default price (2R)
  price2R: number;
  price4R: number;
  durationHours: number;
  printsIncluded: string;
  isRecommended: boolean;
  features: string[];
}

export const PHOTOBOOTH_PHYSICAL_PACKAGES: Record<PhysicalPackageKey, PhotoboothPhysicalPackage> = {
  hours2: {
    id: "hours2",
    name: "Paket 2 Jam",
    tag: "2 Jam",
    price: 2000000,
    price2R: 2000000,
    price4R: 2500000,
    durationHours: 2,
    printsIncluded: "Unlimited Print 2R Strip / 4R",
    isRecommended: false,
    features: [
      "2 Jam Layanan Penuh di Lokasi Acara",
      "Unlimited Print Foto Instan di Lokasi",
      "Pilihan Ukuran Cetak: 2R Strip / 4R",
      "Custom Template Frame Sesuai Tema Acara",
      "Kamera Profesional & Lighting Studio",
      "1 Operator Mesin & 1 Asisten Standby",
      "Download Softcopy Semua Foto via Google Drive",
    ],
  },
  hours3: {
    id: "hours3",
    name: "Paket 3 Jam",
    tag: "3 Jam",
    price: 2500000,
    price2R: 2500000,
    price4R: 3000000,
    durationHours: 3,
    printsIncluded: "Unlimited Print 2R Strip / 4R",
    isRecommended: true,
    features: [
      "3 Jam Layanan Penuh di Lokasi Acara",
      "Unlimited Print Foto Instan di Lokasi",
      "Pilihan Ukuran Cetak: 2R Strip / 4R",
      "Custom Template Frame Eksklusif dengan Logo Event",
      "Kamera Profesional & Lighting Studio",
      "2 Kru Profesional RUANGTEMU Standby",
      "Download Softcopy Semua Foto via Google Drive",
    ],
  },
  hours4: {
    id: "hours4",
    name: "Paket 4 Jam",
    tag: "4 Jam",
    price: 3000000,
    price2R: 3000000,
    price4R: 3500000,
    durationHours: 4,
    printsIncluded: "Unlimited Print 2R Strip / 4R",
    isRecommended: false,
    features: [
      "4 Jam Layanan Penuh di Lokasi Acara",
      "Unlimited Print Foto Instan di Lokasi",
      "Pilihan Ukuran Cetak: 2R Strip / 4R",
      "Custom Template Frame Eksklusif dengan Logo Event",
      "Kamera Profesional & Lighting Studio",
      "2 Kru Profesional RUANGTEMU Standby",
      "Download Softcopy Semua Foto via Google Drive",
    ],
  },
  hours5: {
    id: "hours5",
    name: "Paket 5 Jam",
    tag: "5 Jam",
    price: 3500000,
    price2R: 3500000,
    price4R: 4000000,
    durationHours: 5,
    printsIncluded: "Unlimited Print 2R Strip / 4R",
    isRecommended: false,
    features: [
      "5 Jam Layanan Penuh di Lokasi Acara",
      "Unlimited Print Foto Instan di Lokasi",
      "Pilihan Ukuran Cetak: 2R Strip / 4R",
      "Custom Template Frame Eksklusif dengan Logo Event",
      "Kamera Profesional & Lighting Studio",
      "2 Kru Profesional RUANGTEMU Standby",
      "Download Softcopy Semua Foto via Google Drive",
    ],
  },
  // Aliases for backwards compatibility
  get basic() {
    return this.hours2;
  },
  get deluxe() {
    return this.hours3;
  },
};

export interface DokuPaymentSessionRequest {
  orderId: string;
  amount: number;
  eventName: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  packageName: string;
  addons?: {
    qrCardsCount: number;
  };
}

import crypto from "crypto";

export function generateDokuSignature(params: {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  bodyString?: string;
  secretKey: string;
}) {
  let componentString = `Client-Id:${params.clientId}\nRequest-Id:${params.requestId}\nRequest-Timestamp:${params.requestTimestamp}\nRequest-Target:${params.requestTarget}`;
  let digest = "";

  if (params.bodyString !== undefined) {
    digest = crypto.createHash("sha256").update(params.bodyString).digest("base64");
    componentString += `\nDigest:${digest}`;
  }

  const hmac = crypto.createHmac("sha256", params.secretKey).update(componentString).digest("base64");
  return {
    digest,
    signature: `HMACSHA256=${hmac}`,
  };
}

/**
 * Generate DOKU Sandbox Checkout session or simulated token
 */
export async function createDokuCheckoutSession(params: DokuPaymentSessionRequest) {
  // Jika kredensial DOKU belum diisi, kembalikan mode simulasi sandbox
  if (!DOKU_CONFIG.clientId || !DOKU_CONFIG.sharedKey) {
    return {
      success: true,
      mode: "sandbox_simulated" as const,
      order_id: params.orderId,
      amount: params.amount,
      payment_url: null,
      message: "Kredensial DOKU belum terpasang, beralih ke simulator lokal",
    };
  }

  const targetPath = "/checkout/v1/payment";
  const targetUrl = `${DOKU_CONFIG.isSandbox ? DOKU_CONFIG.sandboxUrl : DOKU_CONFIG.productionUrl}${targetPath}`;
  const requestId = `REQ-${Date.now()}`;
  const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";

  try {
    const payload = {
      order: {
        invoice_number: params.orderId,
        amount: params.amount,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin`,
        auto_redirect: true,
      },
      payment: {
        payment_due_date: 60, // 60 menit
      },
      customer: {
        id: `CUST-${Date.now().toString().slice(-6)}`,
        name: params.customerName || "Admin RUANGTEMU",
        email: params.customerEmail || "admin@ruangtemu.id",
        phone: params.customerPhone || "6282244866088",
      },
      additional_info: {
        event_name: params.eventName,
        package_name: params.packageName,
      },
    };

    const bodyString = JSON.stringify(payload);
    const { digest, signature } = generateDokuSignature({
      clientId: DOKU_CONFIG.clientId,
      requestId,
      requestTimestamp,
      requestTarget: targetPath,
      bodyString,
      secretKey: DOKU_CONFIG.sharedKey,
    });

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": DOKU_CONFIG.clientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        Digest: digest,
        Signature: signature,
      },
      body: bodyString,
    });

    const data = await res.json();
    const paymentUrl = data?.response?.payment?.url || null;

    return {
      success: res.ok,
      mode: "doku_live_api" as const,
      order_id: params.orderId,
      amount: params.amount,
      payment_url: paymentUrl,
      data,
    };
  } catch (err: any) {
    console.error("[DOKU Checkout Error]:", err);
    return {
      success: false,
      error: err?.message || "Gagal menghubungi DOKU API",
      mode: "error" as const,
    };
  }
}

export interface DokuVaRequest {
  invoiceNumber: string;
  amount: number;
  bank: "bca" | "mandiri" | "bri" | "bni";
  customerName?: string;
  customerEmail?: string;
}

/**
 * Generate Real DOKU Virtual Account Number directly from DOKU API
 */
export async function createDokuVirtualAccount(params: DokuVaRequest) {
  if (!DOKU_CONFIG.clientId || !DOKU_CONFIG.sharedKey) {
    return {
      success: false,
      vaNumber: null,
      error: "Kredensial DOKU belum terpasang",
    };
  }

  const bankEndpointMap: Record<string, string> = {
    bca: "/bca-virtual-account/v2/payment-code",
    mandiri: "/mandiri-virtual-account/v2/payment-code",
    bri: "/bri-virtual-account/v2/payment-code",
    bni: "/bni-virtual-account/v2/payment-code",
  };

  const targetPath = bankEndpointMap[params.bank] || bankEndpointMap.bca;
  const targetUrl = `${DOKU_CONFIG.isSandbox ? DOKU_CONFIG.sandboxUrl : DOKU_CONFIG.productionUrl}${targetPath}`;
  const requestId = `REQ-${Date.now()}`;
  const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";

  try {
    const payload = {
      order: {
        invoice_number: params.invoiceNumber,
        amount: params.amount,
      },
      virtual_account_info: {
        expired_time: 60,
        reusable_status: false,
        info1: "RUANGTEMU",
      },
      customer: {
        name: params.customerName || "Admin RUANGTEMU",
        email: params.customerEmail || "admin@ruangtemu.id",
      },
    };

    const bodyString = JSON.stringify(payload);
    const { digest, signature } = generateDokuSignature({
      clientId: DOKU_CONFIG.clientId,
      requestId,
      requestTimestamp,
      requestTarget: targetPath,
      bodyString,
      secretKey: DOKU_CONFIG.sharedKey,
    });

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": DOKU_CONFIG.clientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        Digest: digest,
        Signature: signature,
      },
      body: bodyString,
    });

    const data = await res.json();
    const vaNumber = data?.virtual_account_info?.virtual_account_number || null;

    return {
      success: res.ok && Boolean(vaNumber),
      vaNumber,
      howToPayUrl: data?.virtual_account_info?.how_to_pay_page || null,
      data,
    };
  } catch (err: any) {
    console.error("[DOKU VA Error]:", err);
    return {
      success: false,
      vaNumber: null,
      error: err?.message || "Gagal membuat VA DOKU",
    };
  }
}

/**
 * Global in-memory set to track paid invoices (e.g. from Webhook, Simulator, or Direct Status API)
 */
const paidInvoicesSet = new Set<string>();

export function markInvoiceAsPaid(invoiceNumber: string) {
  if (!invoiceNumber) return;
  paidInvoicesSet.add(invoiceNumber);
  // Also add prefix/base without suffix (e.g. INV-DOKU-908729 from INV-DOKU-908729-BCA)
  const base = invoiceNumber.split("-").slice(0, 3).join("-");
  if (base && base !== invoiceNumber) {
    paidInvoicesSet.add(base);
  }
}

export function isInvoicePaidLocally(invoiceNumber: string): boolean {
  if (!invoiceNumber) return false;
  if (paidInvoicesSet.has(invoiceNumber)) return true;
  const base = invoiceNumber.split("-").slice(0, 3).join("-");
  return paidInvoicesSet.has(base);
}

/**
 * Check transaction status from DOKU Check Status API
 */
export async function checkDokuOrderStatus(invoiceNumber: string) {
  if (!invoiceNumber) {
    return { success: false, paid: false, status: "INVALID_INVOICE" };
  }

  if (isInvoicePaidLocally(invoiceNumber)) {
    return { success: true, paid: true, status: "SUCCESS", source: "local_cache" };
  }

  if (!DOKU_CONFIG.clientId || !DOKU_CONFIG.sharedKey) {
    return { success: false, paid: false, error: "Kredensial DOKU belum terpasang" };
  }

  const targetPath = `/orders/v1/status/${invoiceNumber}`;
  const targetUrl = `${DOKU_CONFIG.isSandbox ? DOKU_CONFIG.sandboxUrl : DOKU_CONFIG.productionUrl}${targetPath}`;
  const requestId = `REQ-${Date.now()}`;
  const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";

  try {
    const { signature } = generateDokuSignature({
      clientId: DOKU_CONFIG.clientId,
      requestId,
      requestTimestamp,
      requestTarget: targetPath,
      secretKey: DOKU_CONFIG.sharedKey,
    });

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Client-Id": DOKU_CONFIG.clientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        Signature: signature,
      },
      cache: "no-store",
    });

    const data = await res.json();
    const transactionStatus =
      data?.transaction?.status ||
      data?.order?.status ||
      (data?.status === "SUCCESS" ? "SUCCESS" : null);

    const isPaid = transactionStatus === "SUCCESS" || transactionStatus === "PAID";

    if (isPaid) {
      markInvoiceAsPaid(invoiceNumber);
    }

    return {
      success: res.ok,
      paid: isPaid,
      status: transactionStatus || "PENDING",
      data,
    };
  } catch (err: any) {
    console.error("[DOKU Check Status Error]:", err);
    return {
      success: false,
      paid: false,
      error: err?.message || "Gagal memeriksa status",
    };
  }
}



