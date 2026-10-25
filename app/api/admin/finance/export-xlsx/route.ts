import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getBookings, getEvents } from "@/lib/db";
import { Booking, EventItem } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getEventPrice(evt: EventItem): number {
  if (evt.payment_amount && evt.payment_amount > 0) {
    return Number(evt.payment_amount);
  }
  const tier = (evt.package_tier || evt.package_name || "").toLowerCase();
  const isPhysical = evt.category === "physical" || evt.category === "photobooth";

  if (isPhysical) {
    if (tier.includes("3 jam")) return 2800000;
    return 2000000;
  }

  if (tier.includes("gold")) return 500000;
  if (tier.includes("silver")) return 350000;
  if (tier.includes("bronze") || tier.includes("basic")) return 250000;
  return 350000;
}

export async function GET(req: NextRequest) {
  try {
    const [bookings, events]: [Booking[], EventItem[]] = await Promise.all([
      getBookings(),
      getEvents(),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "RUANGTEMU Admin";
    workbook.lastModifiedBy = "RUANGTEMU Finance System";
    workbook.created = new Date();
    workbook.modified = new Date();

    // =========================================================================
    // SHEET 1: KEUANGAN EVENT BERJALAN (SEMUA EVENT)
    // =========================================================================
    const sheetEvents = workbook.addWorksheet("Keuangan Event Berjalan", {
      views: [{ showGridLines: true }],
      pageSetup: { orientation: "landscape", paperSize: 9 },
    });

    // Title Section
    sheetEvents.mergeCells("A1:P1");
    const eTitle = sheetEvents.getCell("A1");
    eTitle.value = "RUANGTEMU PHOTOBOOTH & VIRTUAL PHOTOBOOTH";
    eTitle.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF1B2559" } };
    eTitle.alignment = { vertical: "middle", horizontal: "left" };
    sheetEvents.getRow(1).height = 28;

    sheetEvents.mergeCells("A2:P2");
    const eSub = sheetEvents.getCell("A2");
    eSub.value = `Buku Pencatatan Keuangan Seluruh Event yang Sudah Berjalan & Aktif (Diekspor pada: ${new Date().toLocaleString("id-ID")})`;
    eSub.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF707EAE" } };
    sheetEvents.getRow(2).height = 20;

    sheetEvents.addRow([]); // Blank row 3

    // Header Row (Row 4)
    const eHeader = sheetEvents.addRow([
      "No",
      "Kode Event",
      "Nama Acara / Event",
      "Tuan Rumah / Penyelenggara",
      "Kategori Layanan",
      "Paket Layanan",
      "Tanggal Acara",
      "Lokasi / Venue",
      "Kota",
      "Status Acara",
      "Total Foto Tamu",
      "Total Ucapan",
      "Tarif / Omset (IDR)",
      "Status Pembayaran",
      "Metode Bayar",
      "No. Invoice",
    ]);
    eHeader.height = 26;

    eHeader.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1B2559" },
      };
      cell.font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "medium", color: { argb: "FF0F172A" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } },
      };
    });

    let eventTotalPaid = 0;
    let eventTotalPending = 0;
    let eventCountPaid = 0;
    let eventCountPending = 0;
    let totalPhotosAllEvents = 0;

    events.forEach((evt, idx) => {
      const isPaid = evt.payment_status === "PAID";
      const price = getEventPrice(evt);
      const totalPhotos = Number(evt.stats?.total_photos || 0);
      const totalWishes = Number(evt.stats?.total_wishes || 0);
      totalPhotosAllEvents += totalPhotos;

      if (isPaid) {
        eventTotalPaid += price;
        eventCountPaid++;
      } else {
        eventTotalPending += price;
        eventCountPending++;
      }

      const categoryLabel =
        evt.category === "photobooth" || evt.category === "physical"
          ? "Photobooth Fisik"
          : "Virtual Photobooth";

      const eventStatusLabel =
        evt.status === "COMPLETED"
          ? "Selesai"
          : evt.status === "ARCHIVED"
          ? "Arsip"
          : evt.is_active
          ? "Aktif"
          : "Draft";

      const statusLabel = isPaid ? "LUNAS" : "BELUM LUNAS";

      const row = sheetEvents.addRow([
        idx + 1,
        evt.slug || evt.id.slice(0, 8),
        evt.title || "Acara Photobooth",
        evt.host_name || evt.client_name || "-",
        categoryLabel,
        evt.package_name || (evt.package_tier ? `Paket ${evt.package_tier}` : "Paket Standar"),
        evt.date ? new Date(evt.date).toLocaleDateString("id-ID") : "-",
        evt.venue || "-",
        evt.city || "Palopo",
        eventStatusLabel,
        totalPhotos,
        totalWishes,
        price,
        statusLabel,
        evt.payment_method || (isPaid ? "DOKU / Otomatis" : "Menunggu Pembayaran"),
        evt.payment_invoice || "-",
      ]);

      row.height = 22;

      // Alignments
      row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(3).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(4).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(5).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(6).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(7).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(8).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(9).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(10).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(11).alignment = { horizontal: "right", vertical: "middle" };
      row.getCell(12).alignment = { horizontal: "right", vertical: "middle" };

      // Total Biaya currency format
      const priceCell = row.getCell(13);
      priceCell.numFmt = '"Rp "#,##0';
      priceCell.alignment = { horizontal: "right", vertical: "middle" };

      // Status cell
      const statusCell = row.getCell(14);
      statusCell.alignment = { horizontal: "center", vertical: "middle" };
      if (isPaid) {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6F9F4" },
        };
        statusCell.font = { color: { argb: "FF05CD99" }, bold: true };
      } else {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEF3C7" },
        };
        statusCell.font = { color: { argb: "FFD97706" }, bold: true };
      }

      row.getCell(15).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(16).alignment = { horizontal: "center", vertical: "middle" };

      row.eachCell((cell) => {
        if (!cell.border) {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE2E8F0" } },
            left: { style: "thin", color: { argb: "FFE2E8F0" } },
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            right: { style: "thin", color: { argb: "FFE2E8F0" } },
          };
        }
      });
    });

    sheetEvents.addRow([]);

    // Summary Rows for Events
    const sumEvtRow1 = sheetEvents.addRow([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      totalPhotosAllEvents,
      "TOTAL PENDAPATAN EVENT (LUNAS):",
      eventTotalPaid,
      `${eventCountPaid} Event Lunas`,
      "",
      "",
    ]);
    sumEvtRow1.height = 24;
    sumEvtRow1.getCell(11).font = { bold: true };
    sumEvtRow1.getCell(12).font = { bold: true, color: { argb: "FF05CD99" } };
    sumEvtRow1.getCell(12).alignment = { horizontal: "right", vertical: "middle" };
    const ePaidSumCell = sumEvtRow1.getCell(13);
    ePaidSumCell.numFmt = '"Rp "#,##0';
    ePaidSumCell.font = { bold: true, color: { argb: "FF05CD99" } };
    ePaidSumCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F9F4" } };
    sumEvtRow1.getCell(14).font = { bold: true, color: { argb: "FF05CD99" } };

    const sumEvtRow2 = sheetEvents.addRow([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "POTENSI EVENT TERTUNDA (PENDING):",
      eventTotalPending,
      `${eventCountPending} Event Pending`,
      "",
      "",
    ]);
    sumEvtRow2.height = 22;
    sumEvtRow2.getCell(12).font = { bold: true, color: { argb: "FFD97706" } };
    sumEvtRow2.getCell(12).alignment = { horizontal: "right", vertical: "middle" };
    const ePendingSumCell = sumEvtRow2.getCell(13);
    ePendingSumCell.numFmt = '"Rp "#,##0';
    ePendingSumCell.font = { bold: true, color: { argb: "FFD97706" } };
    ePendingSumCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
    sumEvtRow2.getCell(14).font = { bold: true, color: { argb: "FFD97706" } };

    // Column Widths for Sheet 1
    const eventColumnWidths = [
      { col: 1, width: 6 },   // No
      { col: 2, width: 22 },  // Kode Event
      { col: 3, width: 28 },  // Nama Acara
      { col: 4, width: 24 },  // Tuan Rumah
      { col: 5, width: 20 },  // Kategori Layanan
      { col: 6, width: 22 },  // Paket Layanan
      { col: 7, width: 15 },  // Tanggal
      { col: 8, width: 24 },  // Lokasi
      { col: 9, width: 14 },  // Kota
      { col: 10, width: 14 }, // Status Acara
      { col: 11, width: 16 }, // Total Foto
      { col: 12, width: 14 }, // Total Ucapan
      { col: 13, width: 20 }, // Biaya / Omset
      { col: 14, width: 18 }, // Status Bayar
      { col: 15, width: 22 }, // Metode
      { col: 16, width: 16 }, // Invoice
    ];

    eventColumnWidths.forEach(({ col, width }) => {
      sheetEvents.getColumn(col).width = width;
    });

    // =========================================================================
    // SHEET 2: BUKU RESERVASI & BOOKING KLIEN
    // =========================================================================
    const sheetBookings = workbook.addWorksheet("Reservasi & Booking", {
      views: [{ showGridLines: true }],
      pageSetup: { orientation: "landscape", paperSize: 9 },
    });

    sheetBookings.mergeCells("A1:N1");
    const bTitle = sheetBookings.getCell("A1");
    bTitle.value = "REKAPITULASI PEMESANAN & RESERVASI ONLINE";
    bTitle.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF1B2559" } };
    sheetBookings.getRow(1).height = 26;

    sheetBookings.addRow([]);

    const bHeader = sheetBookings.addRow([
      "No",
      "No. Invoice",
      "Tanggal Booking",
      "Nama Pelanggan",
      "Kontak WhatsApp",
      "Jenis Layanan",
      "Nama Paket",
      "Tanggal Acara",
      "Waktu",
      "Lokasi Acara",
      "Kota",
      "Total Biaya (IDR)",
      "Status Pembayaran",
      "Metode Bayar",
    ]);
    bHeader.height = 24;

    bHeader.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4318FF" } };
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    let bookingPaid = 0;
    let bookingPending = 0;

    bookings.forEach((b, idx) => {
      const isPaid = b.payment_status === "PAID";
      const price = Number(b.total_price || b.payment_amount || 0);
      if (isPaid) bookingPaid += price;
      else bookingPending += price;

      const categoryLabel =
        b.category === "physical" || b.category === "photobooth"
          ? "Photobooth Fisik"
          : "Virtual Photobooth";

      const row = sheetBookings.addRow([
        idx + 1,
        b.payment_invoice || b.id.slice(0, 8).toUpperCase(),
        b.created_at ? new Date(b.created_at).toLocaleDateString("id-ID") : "-",
        b.customer_name || "Pelanggan",
        b.customer_phone || "-",
        categoryLabel,
        b.package_name || "-",
        b.event_date ? new Date(b.event_date).toLocaleDateString("id-ID") : "-",
        b.event_time || "-",
        b.location || "-",
        b.city || "Palopo",
        price,
        isPaid ? "LUNAS" : "BELUM LUNAS",
        b.payment_method || (isPaid ? "DOKU / Otomatis" : "Menunggu Pembayaran"),
      ]);

      row.height = 20;
      row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(4).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(5).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(6).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(7).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(8).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(9).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(10).alignment = { horizontal: "left", vertical: "middle" };
      row.getCell(11).alignment = { horizontal: "center", vertical: "middle" };

      const pCell = row.getCell(12);
      pCell.numFmt = '"Rp "#,##0';
      pCell.alignment = { horizontal: "right", vertical: "middle" };

      const sCell = row.getCell(13);
      sCell.alignment = { horizontal: "center", vertical: "middle" };
      if (isPaid) {
        sCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F9F4" } };
        sCell.font = { color: { argb: "FF05CD99" }, bold: true };
      } else {
        sCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
        sCell.font = { color: { argb: "FFD97706" }, bold: true };
      }
    });

    const bColumnWidths = [
      { col: 1, width: 6 },
      { col: 2, width: 16 },
      { col: 3, width: 15 },
      { col: 4, width: 22 },
      { col: 5, width: 16 },
      { col: 6, width: 20 },
      { col: 7, width: 22 },
      { col: 8, width: 15 },
      { col: 9, width: 10 },
      { col: 10, width: 26 },
      { col: 11, width: 14 },
      { col: 12, width: 18 },
      { col: 13, width: 18 },
      { col: 14, width: 24 },
    ];
    bColumnWidths.forEach(({ col, width }) => {
      sheetBookings.getColumn(col).width = width;
    });

    // =========================================================================
    // SHEET 3: RINGKASAN KATEGORI & TOTAL
    // =========================================================================
    const sheetSummary = workbook.addWorksheet("Ringkasan Eksekutif", {
      views: [{ showGridLines: true }],
    });

    sheetSummary.mergeCells("A1:E1");
    const sTitle = sheetSummary.getCell("A1");
    sTitle.value = "RINGKASAN TOTAL PENDAPATAN & OPERASIONAL RUANGTEMU";
    sTitle.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF1B2559" } };
    sheetSummary.getRow(1).height = 28;

    sheetSummary.addRow([]);

    const summaryHeader = sheetSummary.addRow([
      "Metrik Operasional & Finansial",
      "Total Event",
      "Total Booking",
      "Omset Terbayar / Lunas (IDR)",
      "Potensi Tertunda (IDR)",
    ]);
    summaryHeader.height = 26;
    summaryHeader.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B2559" } };
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const grandTotalPaid = eventTotalPaid + bookingPaid;
    const grandTotalPending = eventTotalPending + bookingPending;

    const rEvt = sheetSummary.addRow([
      "Event yang Dijalankan",
      events.length,
      "-",
      eventTotalPaid,
      eventTotalPending,
    ]);
    rEvt.getCell(4).numFmt = '"Rp "#,##0';
    rEvt.getCell(5).numFmt = '"Rp "#,##0';

    const rBkg = sheetSummary.addRow([
      "Pemesanan / Reservasi Online",
      "-",
      bookings.length,
      bookingPaid,
      bookingPending,
    ]);
    rBkg.getCell(4).numFmt = '"Rp "#,##0';
    rBkg.getCell(5).numFmt = '"Rp "#,##0';

    const rAll = sheetSummary.addRow([
      "TOTAL GABUNGAN FINANSIAL",
      events.length,
      bookings.length,
      grandTotalPaid,
      grandTotalPending,
    ]);
    rAll.height = 24;
    rAll.font = { bold: true };
    rAll.getCell(4).numFmt = '"Rp "#,##0';
    rAll.getCell(5).numFmt = '"Rp "#,##0';
    rAll.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F9F4" } };
    });

    sheetSummary.getColumn(1).width = 36;
    sheetSummary.getColumn(2).width = 16;
    sheetSummary.getColumn(3).width = 16;
    sheetSummary.getColumn(4).width = 28;
    sheetSummary.getColumn(5).width = 28;

    // Generate binary buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `Buku_Keuangan_RUANGTEMU_${timestamp}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[export-xlsx] Error generating excel:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal membuat file Excel keuangan" },
      { status: 500 }
    );
  }
}
