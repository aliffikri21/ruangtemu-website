import { NextRequest, NextResponse } from "next/server";
import { getDbClient } from "@/lib/supabase";
import { InvoiceArchiveItem } from "@/components/admin/admin-invoice";

export const dynamic = "force-dynamic";

const CLOUD_STORAGE_BUCKET = "ruangtemu-media";
const CLOUD_STORAGE_PATH = "system/invoices/archives.json";

/**
 * Membaca data arsip invoice dari Supabase:
 * 1. Coba baca dari tabel 'invoices' jika tabel SQL sudah ada
 * 2. Jika tabel belum ada (PGRST205), baca dari Supabase Storage 'ruangtemu-media/system/invoices/archives.json'
 */
async function loadInvoicesFromCloud(): Promise<InvoiceArchiveItem[]> {
  const client = getDbClient();
  if (!client) return [];

  // 1. Coba baca dari tabel SQL public.invoices jika ada
  try {
    const { data: dbData, error: dbErr } = await client
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!dbErr && Array.isArray(dbData)) {
      return dbData.map((row: any): InvoiceArchiveItem => ({
        id: row.id,
        invoiceNumber: row.invoice_number || row.invoiceNumber,
        createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        customerName: row.customer_name || row.customerName,
        customerPhone: row.customer_phone || row.customerPhone || "",
        customerInstagram: row.customer_instagram || row.customerInstagram || "",
        customerAddress: row.customer_address || row.customerAddress || "",
        eventDate: row.event_date || row.eventDate,
        eventTime: row.event_time || row.eventTime || "",
        items: Array.isArray(row.items) ? row.items : [],
        subtotal: Number(row.subtotal || 0),
        discount: Number(row.discount || 0),
        taxPercent: Number(row.tax_percent || row.taxPercent || 0),
        taxAmount: Number(row.tax_amount || row.taxAmount || 0),
        grandTotal: Number(row.grand_total || row.grandTotal || 0),
        paymentStatus: row.payment_status || row.paymentStatus || "Belum Dibayar",
        dpAmount: Number(row.dp_amount || row.dpAmount || 0),
        paymentMethod: row.payment_method || row.paymentMethod || "",
        paymentLink: row.payment_link || row.paymentLink || "",
        notes: row.notes || "",
      }));
    }
  } catch {
    // Abaikan dan lanjut ke Supabase Storage
  }

  // 2. Fallback: Baca dari Supabase Storage JSON file
  try {
    const { data: fileData, error: fileErr } = await client.storage
      .from(CLOUD_STORAGE_BUCKET)
      .download(CLOUD_STORAGE_PATH);

    if (!fileErr && fileData) {
      const text = await fileData.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err: any) {
    console.warn("[Invoices API] Load from storage error:", err?.message);
  }

  return [];
}

/**
 * Menyimpan data arsip invoice ke Supabase Cloud (Storage + SQL Table jika ada)
 */
async function saveInvoicesToCloud(archives: InvoiceArchiveItem[]): Promise<boolean> {
  const client = getDbClient();
  if (!client) return false;

  let success = false;

  // 1. Simpan ke Supabase Storage (Kompatibel 100% tanpa perlu migrasi manual)
  try {
    const jsonStr = JSON.stringify(archives, null, 2);
    const { error: upErr } = await client.storage
      .from(CLOUD_STORAGE_BUCKET)
      .upload(CLOUD_STORAGE_PATH, jsonStr, {
        contentType: "application/json",
        upsert: true,
      });

    if (!upErr) {
      success = true;
    } else {
      console.warn("[Invoices API] Save to storage warning:", upErr.message);
    }
  } catch (err: any) {
    console.error("[Invoices API] Save to storage exception:", err?.message);
  }

  // 2. Opsional: Sync juga ke tabel SQL public.invoices jika tabel tersedia
  try {
    const rows = archives.map((a) => ({
      id: a.id,
      invoice_number: a.invoiceNumber,
      customer_name: a.customerName,
      customer_phone: a.customerPhone || null,
      customer_instagram: a.customerInstagram || null,
      customer_address: a.customerAddress || null,
      event_date: a.eventDate || null,
      event_time: a.eventTime || null,
      items: a.items,
      subtotal: a.subtotal,
      discount: a.discount,
      tax_percent: a.taxPercent,
      tax_amount: a.taxAmount,
      grand_total: a.grandTotal,
      payment_status: a.paymentStatus,
      dp_amount: a.dpAmount || null,
      payment_method: a.paymentMethod,
      payment_link: a.paymentLink || null,
      notes: a.notes || null,
      created_at: a.createdAt,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      await client.from("invoices").upsert(rows, { onConflict: "id" });
    }
  } catch {
    // Abaikan jika tabel SQL belum dibuat
  }

  return success;
}

export async function GET() {
  try {
    const archives = await loadInvoicesFromCloud();
    return NextResponse.json({
      success: true,
      count: archives.length,
      archives,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load invoices" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "save";

    // 1. Ambil data cloud saat ini
    let currentArchives = await loadInvoicesFromCloud();

    if (action === "create" || action === "save") {
      const newArchive: InvoiceArchiveItem = body.archive;
      if (!newArchive || !newArchive.invoiceNumber) {
        return NextResponse.json({ success: false, error: "Data invoice tidak valid" }, { status: 400 });
      }

      // Hapus jika sudah ada (replace / update) lalu taruh paling depan (paling baru)
      currentArchives = [
        newArchive,
        ...currentArchives.filter((a) => a.id !== newArchive.id && a.invoiceNumber !== newArchive.invoiceNumber),
      ];
    } else if (action === "update_status") {
      const { id, paymentStatus, dpAmount } = body;
      currentArchives = currentArchives.map((a) =>
        a.id === id
          ? {
              ...a,
              paymentStatus,
              dpAmount: dpAmount !== undefined ? dpAmount : a.dpAmount,
            }
          : a
      );
    } else if (action === "delete") {
      const { id, invoiceNumber } = body;
      currentArchives = currentArchives.filter(
        (a) => a.id !== id && (invoiceNumber ? a.invoiceNumber !== invoiceNumber : true)
      );

      // Jika tabel SQL ada, hapus juga dari tabel
      const client = getDbClient();
      if (client) {
        try {
          await client.from("invoices").delete().eq("id", id);
        } catch {}
      }
    } else if (action === "clear_all") {
      currentArchives = [];
      const client = getDbClient();
      if (client) {
        try {
          await client.from("invoices").delete().neq("id", "none");
        } catch {}
      }
    } else if (action === "sync_batch") {
      // Gabungkan data dari klien (misal dari localStorage) dengan data cloud
      const clientArchives: InvoiceArchiveItem[] = Array.isArray(body.archives) ? body.archives : [];
      const cloudMap = new Map<string, InvoiceArchiveItem>();

      // Masukkan cloud data terlebih dahulu
      currentArchives.forEach((a) => cloudMap.set(a.invoiceNumber, a));
      // Tambahkan client data jika belum ada di cloud
      clientArchives.forEach((a) => {
        if (!cloudMap.has(a.invoiceNumber)) {
          cloudMap.set(a.invoiceNumber, a);
        }
      });

      currentArchives = Array.from(cloudMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Simpan hasil ke Cloud
    await saveInvoicesToCloud(currentArchives);

    return NextResponse.json({
      success: true,
      count: currentArchives.length,
      archives: currentArchives,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save invoice" },
      { status: 500 }
    );
  }
}
