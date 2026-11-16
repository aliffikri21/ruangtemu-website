"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Booking, EventItem, Package } from "@/types";
import { formatRupiah } from "@/lib/utils";

// Pilihan Paket Resmi RUANGTEMU Photobooth Palopo
export interface PhotoboothPackageOption {
  name: string;
  category: "physical" | "virtual" | "addon" | "custom";
  price: number;
}

export const RUANGTEMU_PACKAGES: PhotoboothPackageOption[] = [
  // ── 1. PHOTOBOOTH FISIK (CETAK INSTAN DI LOKASI ACARA) ──
  {
    name: "Paket 2 Jam - Cetak 2R Strip (Unlimited)",
    category: "physical",
    price: 2000000,
  },
  {
    name: "Paket 2 Jam - Cetak 4R Postcard (Unlimited)",
    category: "physical",
    price: 2500000,
  },
  {
    name: "Paket 3 Jam - Cetak 2R Strip (Unlimited)",
    category: "physical",
    price: 2500000,
  },
  {
    name: "Paket 3 Jam - Cetak 4R Postcard (Unlimited)",
    category: "physical",
    price: 3000000,
  },
  {
    name: "Paket 4 Jam - Cetak 2R Strip (Unlimited)",
    category: "physical",
    price: 3000000,
  },
  {
    name: "Paket 4 Jam - Cetak 4R Postcard (Unlimited)",
    category: "physical",
    price: 3500000,
  },
  {
    name: "Paket 5 Jam - Cetak 2R Strip (Unlimited)",
    category: "physical",
    price: 3500000,
  },
  {
    name: "Paket 5 Jam - Cetak 4R Postcard (Unlimited)",
    category: "physical",
    price: 4000000,
  },

  // ── 2. VIRTUAL PHOTOBOOTH (DIGITAL WEB & QR CODE) ──
  {
    name: "Virtual Photobooth - Paket Bronze (7 Hari, 1 Frame)",
    category: "virtual",
    price: 250000,
  },
  {
    name: "Virtual Photobooth - Paket Silver (14 Hari, 2 Frame)",
    category: "virtual",
    price: 350000,
  },
  {
    name: "Virtual Photobooth - Paket Gold (30 Hari, 3 Frame)",
    category: "virtual",
    price: 450000,
  },

  // ── 3. ADD-ON & LAYANAN TAMBAHAN ──
  {
    name: "Add-On Extra Hour Photobooth (1 Jam)",
    category: "addon",
    price: 500000,
  },
  {
    name: "Add-On Custom Template Frame Tambahan",
    category: "addon",
    price: 100000,
  },
  {
    name: "Add-On Cetak Kartu QR Fisik (100 Lembar)",
    category: "addon",
    price: 150000,
  },
  {
    name: "Add-On Custom Backdrop 3D / Flower Wall",
    category: "addon",
    price: 650000,
  },
  {
    name: "Add-On Custom Wooden / Acrylic Props",
    category: "addon",
    price: 250000,
  },

  // ── 4. PAKET KUSTOM ──
  {
    name: "Custom Paket Photobooth",
    category: "custom",
    price: 0,
  },
];

export const PHOTOBOOTH_PACKAGES = RUANGTEMU_PACKAGES;

export interface InvoiceItemRow {
  id: string;
  name: string;
  customName?: string;
  qty: number;
  price: number;
}

interface AdminInvoiceProps {
  isDarkMode?: boolean;
  bookings?: Booking[];
  events?: EventItem[];
  packages?: Package[];
  standalone?: boolean;
}

export function AdminInvoice({
  isDarkMode,
  bookings = [],
  events = [],
  packages = [],
  standalone = false,
}: AdminInvoiceProps) {
  // ── State Dark Mode (Sync dengan localStorage dan Parent) ──
  const [internalDark, setInternalDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ruangtemu_admin_dark");
      if (saved === "true") {
        setInternalDark(true);
      } else if (saved === null && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setInternalDark(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Sembunyikan Judul Halaman Browser ("Admin Dashboard...") saat Cetak / Ekspor PDF ──
  useEffect(() => {
    let originalTitle = "";
    const handleBeforePrint = () => {
      originalTitle = document.title;
      // Gunakan spasi tunggal agar header margin browser tidak memuat teks judul halaman admin
      document.title = " ";
    };
    const handleAfterPrint = () => {
      if (originalTitle) {
        document.title = originalTitle;
      }
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const activeDark = isDarkMode !== undefined ? isDarkMode : internalDark;

  const toggleStandaloneDark = () => {
    setInternalDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ruangtemu_admin_dark", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // ── State Data Klien & Event ──
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [eventTime, setEventTime] = useState("19:00");
  const [timeZone, setTimeZone] = useState("WITA");
  const [custInstagram, setCustInstagram] = useState("");
  const [custAddress, setCustAddress] = useState("");

  // ── State Paket & Layanan (Default Paket Terpopuler RUANGTEMU) ──
  const [items, setItems] = useState<InvoiceItemRow[]>([
    {
      id: "item-1",
      name: "Paket 3 Jam - Cetak 2R Strip (Unlimited)",
      qty: 1,
      price: 2500000,
    },
    {
      id: "item-2",
      name: "Virtual Photobooth - Paket Silver (14 Hari, 2 Frame)",
      qty: 1,
      price: 350000,
    },
  ]);

  // ── State Pembayaran & Finansial ──
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank BCA (8800xxxxxx)");
  const [paymentStatus, setPaymentStatus] = useState("Belum Dibayar");
  const [paymentLink, setPaymentLink] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);

  // ── State No. Invoice & Logo ──
  const [invNumber, setInvNumber] = useState("");
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"info" | "warning">("info");

  // Inisialisasi Invoice Number & Logo
  useEffect(() => {
    setInvNumber("INV-PB" + Math.floor(100000 + Math.random() * 900000));
    try {
      const savedLogo = localStorage.getItem("rt_photobooth_logo");
      if (savedLogo) setCustomLogo(savedLogo);
    } catch {
      // ignore
    }
  }, []);

  // Jam Real-time WITA
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WITA"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string, type: "info" | "warning" = "info") => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Upload Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("File harus berupa gambar!", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomLogo(base64);
      try {
        localStorage.setItem("rt_photobooth_logo", base64);
      } catch {
        // quota exceeded
      }
      showToast("Logo berhasil diperbarui!");
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setCustomLogo(null);
    try {
      localStorage.removeItem("rt_photobooth_logo");
    } catch {
      // ignore
    }
    showToast("Logo dikembalikan ke default.");
  };

  // Regenerasi No Invoice
  const handleRegenerateInv = () => {
    const newNumber = "INV-PB" + Math.floor(100000 + Math.random() * 900000);
    setInvNumber(newNumber);
    showToast(`No. Invoice baru: ${newNumber}`);
  };

  // Tambah Baris Layanan
  const handleAddItem = () => {
    const newRow: InvoiceItemRow = {
      id: "item-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      name: RUANGTEMU_PACKAGES[0].name,
      qty: 1,
      price: RUANGTEMU_PACKAGES[0].price,
    };
    setItems((prev) => [...prev, newRow]);
  };

  // Hapus Baris
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      showToast("Minimal harus ada 1 paket/layanan photobooth!", "warning");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Update Baris
  const handleUpdateItem = (id: string, updates: Partial<InvoiceItemRow>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, ...updates };
        if (updates.name && updates.name !== "Custom Paket Photobooth") {
          const match = RUANGTEMU_PACKAGES.find((p) => p.name === updates.name);
          if (match) updated.price = match.price;
        }
        return updated;
      })
    );
  };

  // Hitung Total Finansial
  const subtotal = items.reduce((acc, curr) => acc + curr.qty * curr.price, 0);
  const afterDiscount = Math.max(0, subtotal - (discount || 0));
  const taxAmount = (afterDiscount * (taxPercent || 0)) / 100;
  const grandTotal = afterDiscount + taxAmount;

  // Tanggal Acara Terformat Indonesia
  const formattedEventDate = (() => {
    if (!eventDate) return "-";
    try {
      const d = new Date(eventDate);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return eventDate;
    }
  })();

  const formattedEventTime = eventTime ? `${eventTime} ${timeZone}` : "-";

  // Autofill dari Reservasi
  const handleAutofillBooking = (bookingId: string) => {
    if (!bookingId) return;
    const b = bookings.find((item) => item.id === bookingId);
    if (!b) return;

    setCustName(b.customer_name || "");
    setCustPhone(b.customer_phone || "");
    if (b.event_date) {
      setEventDate(b.event_date.split("T")[0]);
    }
    if (b.event_time) {
      setEventTime(b.event_time);
    }
    const locationVal = b.location || b.city || "";
    if (locationVal) {
      setCustAddress(locationVal);
    }
    if (b.total_price) {
      setItems([
        {
          id: "item-" + Date.now(),
          name: b.package_name || "Paket Photobooth Reservasi",
          qty: 1,
          price: b.total_price,
        },
      ]);
    }
    if (b.payment_status === "PAID") {
      setPaymentStatus("Lunas");
    } else if (b.status === "confirmed") {
      setPaymentStatus("DP (Uang Muka 50%)");
    } else {
      setPaymentStatus("Belum Dibayar");
    }
    showToast(`Data klien "${b.customer_name}" berhasil diisi!`);
  };

  // Kirim ke WhatsApp
  const handleSendToWhatsApp = () => {
    if (!custName.trim()) {
      showToast("Nama Klien tidak boleh kosong!", "warning");
      return;
    }
    if (!custPhone.trim()) {
      showToast("Nomor WhatsApp Klien belum diisi!", "warning");
      return;
    }

    let text = `*INVOICE - RUANGTEMU PHOTOBOOTH*\n`;
    text += `📍 Jl. Anggrek Blok EE No. 24 Kota Palopo\n`;
    text += `--------------------------------------------------\n`;
    text += `*No. Invoice:* ${invNumber}\n`;
    text += `*Nama Klien:* ${custName.trim()}\n`;
    if (custInstagram.trim()) text += `*Instagram:* @${custInstagram.trim().replace(/^@/, "")}\n`;
    text += `*Tanggal Acara:* ${formattedEventDate}\n`;
    text += `*Jam Mulai:* ${formattedEventTime}\n`;
    if (custAddress.trim()) text += `*Lokasi Venue:* ${custAddress.trim()}\n`;
    text += `--------------------------------------------------\n\n`;

    text += `*Rincian Paket & Layanan:*\n`;
    items.forEach((item, index) => {
      const displayName =
        item.name === "Custom Paket Photobooth"
          ? item.customName || "Custom Paket Photobooth"
          : item.name;
      text += `${index + 1}. *${displayName}*\n`;
      text += `   ↳ Qty/Durasi: ${item.qty}x | Harga: ${formatRupiah(item.price)} = *${formatRupiah(
        item.qty * item.price
      )}*\n`;
    });

    text += `\n--------------------------------------------------\n`;
    text += `*Subtotal:* ${formatRupiah(subtotal)}\n`;
    if (discount > 0) text += `*Diskon:* -${formatRupiah(discount)}\n`;
    if (taxAmount > 0) text += `*Pajak/Service Fee (${taxPercent}%):* +${formatRupiah(taxAmount)}\n`;
    text += `*TOTAL INVESTASI:* *${formatRupiah(grandTotal)}*\n`;
    text += `--------------------------------------------------\n\n`;

    text += `*Metode Pembayaran:* ${paymentMethod}\n`;
    text += `*Status Pembayaran:* *${paymentStatus}*\n`;

    if (paymentLink.trim()) {
      text += `\n💳 *Link Pembayaran DP/Lunas:* ${paymentLink.trim()}\n`;
    }

    text += `\n*Catatan:* Mohon lakukan konfirmasi setelah melakukan pembayaran. Terima kasih telah mempercayakan momen bahagia Anda bersama kami! 📸✨`;

    // Normalisasi Nomor WhatsApp Indonesia
    let formattedPhone = custPhone.replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("62")) {
      formattedPhone = "62" + formattedPhone;
    }

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  // Salin Pesan WhatsApp ke Clipboard
  const handleCopyWhatsAppText = () => {
    let text = `*INVOICE - RUANGTEMU PHOTOBOOTH*\n📍 Jl. Anggrek Blok EE No. 24 Kota Palopo\n--------------------------------------------------\n`;
    text += `*No. Invoice:* ${invNumber}\n*Nama Klien:* ${custName || "-"}\n`;
    if (custInstagram) text += `*Instagram:* @${custInstagram.replace(/^@/, "")}\n`;
    text += `*Tanggal Acara:* ${formattedEventDate}\n*Jam Mulai:* ${formattedEventTime}\n`;
    if (custAddress) text += `*Lokasi Venue:* ${custAddress}\n`;
    text += `--------------------------------------------------\n\n*Rincian Paket & Layanan:*\n`;
    items.forEach((item, index) => {
      const displayName =
        item.name === "Custom Paket Photobooth"
          ? item.customName || "Custom Paket Photobooth"
          : item.name;
      text += `${index + 1}. *${displayName}* (${item.qty}x @ ${formatRupiah(item.price)}) = ${formatRupiah(item.qty * item.price)}\n`;
    });
    text += `\n*TOTAL:* *${formatRupiah(grandTotal)}*\n*Status:* *${paymentStatus}*\n*Metode:* ${paymentMethod}\n`;
    if (paymentLink) text += `💳 Link: ${paymentLink}\n`;

    navigator.clipboard.writeText(text);
    showToast("Teks invoice WhatsApp berhasil disalin!");
  };

  // Buka Modal Pratinjau / Download Invoice
  const handleOpenInvoiceModal = () => {
    if (!custName.trim()) {
      showToast("Harap isi Nama Klien terlebih dahulu!", "warning");
      return;
    }
    setIsModalOpen(true);
  };

  // Unduh Invoice sebagai file PDF asli (A4 format)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    const invoiceElem = document.getElementById("printableInvoice");
    if (!invoiceElem) {
      showToast("Elemen invoice tidak ditemukan", "warning");
      return;
    }

    setIsDownloadingPDF(true);
    showToast("Memproses file invoice PDF...");

    const originalTitle = document.title;
    // Kosongkan judul dokumen sementara agar browser tidak mencetak "Admin Dashboard..." di header
    document.title = " ";

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(invoiceElem, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          clonedDoc.title = " ";
          const clonedElem = clonedDoc.getElementById("printableInvoice");
          if (clonedElem) {
            clonedElem.style.backgroundColor = "#ffffff";
            clonedElem.style.color = "#0f172a";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // Lebar standar A4 (mm)
      const pageHeight = 297; // Tinggi standar A4 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Invoice-RUANGTEMU-${invNumber || "PB"}.pdf`;
      pdf.save(fileName);
      showToast(`Berhasil mengunduh ${fileName}`);
    } catch (err) {
      console.error("Gagal generate PDF:", err);
      showToast("Gagal export otomatis, membuka dialog cetak PDF...", "warning");
      document.title = " ";
      window.print();
    } finally {
      setIsDownloadingPDF(false);
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    }
  };

  // Konten Utama
  const content = (
    <div className={`space-y-6 transition-colors duration-200 ${activeDark ? "text-slate-100" : "text-[#1B2559]"}`}>
      {/* ─── STANDALONE TOP BAR (Jika diakses via /invoice langsung) ─── */}
      {standalone && (
        <header
          className={`px-4 sm:px-6 py-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors duration-200 ${activeDark
            ? "bg-[#1A1B20] border-white/10"
            : "bg-white border-[#E0E5F2] shadow-[0_18px_40px_rgba(112,144,176,0.06)]"
            }`}
        >
          <div className="flex items-center gap-3">
            {/* Logo container */}
            <div className="relative group cursor-pointer" title="Klik untuk ganti logo">
              <label htmlFor="logoUploadHeader" className="cursor-pointer block">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#4318FF] flex items-center justify-center text-white shadow-sm border border-white/10">
                  {customLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/logo-ruangtemu.jpg" alt="RUANGTEMU" className="w-full h-full object-cover" />
                  )}
                </div>
              </label>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">RUANGTEMU PHOTOBOOTH</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4318FF]/10 text-[#4318FF] dark:bg-blue-500/20 dark:text-blue-400 border border-[#4318FF]/20">
                  Sistem Kasir
                </span>
              </div>
              <p className={`text-xs ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                Jl. Anggrek Blok EE No. 24 Kota Palopo • Generator Invoice &amp; Penawaran WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Jam Digital Real-time */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${activeDark ? "bg-[#25262B] border-white/10 text-slate-300" : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559]"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentTime}</span>
            </div>

            {/* Toggle Mode Gelap (Standalone) */}
            <button
              type="button"
              onClick={toggleStandaloneDark}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${activeDark
                ? "bg-[#25262B] border-white/10 text-amber-400 hover:text-white"
                : "bg-[#F4F7FE] border-[#E0E5F2] text-[#8F9BBA] hover:text-[#1B2559]"
                }`}
              title={activeDark ? "Beralih ke Mode Terang (Light Mode)" : "Beralih ke Mode Gelap (Dark Mode)"}
            >
              {activeDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${activeDark
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                : "bg-[#F4F7FE] border-[#E0E5F2] hover:bg-[#EAEFFD] text-[#1B2559] hover:text-[#4318FF]"
                }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Dashboard Admin</span>
            </Link>
          </div>
        </header>
      )}

      {/* Input file logo hidden */}
      <input
        type="file"
        id="logoUploadHeader"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* ─── QUICK AUTOFILL BAR DARI DATA BOOKINGS (JIKA ADA) ─── */}
      {bookings && bookings.length > 0 && (
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs transition-colors duration-200 ${activeDark
            ? "bg-[#1A1B20] border-white/10 text-white"
            : "bg-white border-[#E0E5F2] text-[#1B2559]"
            }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-base">⚡</span>
            <span className={activeDark ? "text-blue-400 font-bold" : "text-[#4318FF] font-bold"}>
              Tarik Otomatis dari Reservasi Klien:
            </span>
          </div>
          <select
            onChange={(e) => handleAutofillBooking(e.target.value)}
            defaultValue=""
            className={`text-xs font-medium px-3 py-1.5 rounded-xl border outline-hidden cursor-pointer ${activeDark
              ? "bg-[#25262B] border-white/10 text-white focus:border-[#4318FF]"
              : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
              }`}
          >
            <option value="" disabled>
              -- Pilih Reservasi / Klien ({bookings.length} data) --
            </option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.customer_name} • {b.event_date ? new Date(b.event_date).toLocaleDateString("id-ID") : "-"} ({formatRupiah(b.total_price || 0)})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ─── GRID KONTEN: FORM KIRI (7/12) & RINGKASAN KANAN (5/12) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ────── KOLOM KIRI: FORM DATA & ITEM ────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* CARD 1: DATA KLIEN & DETAIL ACARA */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4 transition-colors duration-200 ${activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
              }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-[#E0E5F2]/60 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4318FF]/10 text-[#4318FF] dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                  👤
                </div>
                <div>
                  <h3 className="text-sm font-bold">Data Klien &amp; Detail Acara</h3>
                  <p className={`text-[11px] ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                    Informasi identitas pemesan dan lokasi venue photobooth
                  </p>
                </div>
              </div>

              {/* Logo Action buttons */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="logoUploadHeader"
                  className="text-xs font-semibold text-[#4318FF] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Ganti Logo
                </label>
                {customLogo && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Nama Klien / Penanggung Jawab *
                </label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Contoh: Rina & Budi (Wedding)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden transition-all ${activeDark
                    ? "bg-[#25262B] border-white/10 text-white placeholder-slate-500 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/30"
                    : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] placeholder-[#A3AED0] focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/20"
                    }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Nomor WhatsApp *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-semibold">
                    +62 / 0
                  </span>
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="81234567890"
                    className={`w-full pl-16 pr-3.5 py-2.5 rounded-xl border text-sm outline-hidden transition-all ${activeDark
                      ? "bg-[#25262B] border-white/10 text-white placeholder-slate-500 focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/30"
                      : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] placeholder-[#A3AED0] focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/20"
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Tanggal Acara / Event *
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden cursor-pointer ${activeDark
                    ? "bg-[#25262B] border-white/10 text-white focus:border-[#4318FF]"
                    : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                    }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Jam Mulai Photobooth *
                </label>
                <div className="grid grid-cols-12 gap-2">
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className={`col-span-7 px-3.5 py-2.5 rounded-xl border text-sm outline-hidden ${activeDark
                      ? "bg-[#25262B] border-white/10 text-white focus:border-[#4318FF]"
                      : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                      }`}
                  />
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className={`col-span-5 px-2 py-2.5 rounded-xl border text-xs font-bold outline-hidden cursor-pointer ${activeDark
                      ? "bg-[#25262B] border-white/10 text-white focus:border-[#4318FF]"
                      : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                      }`}
                  >
                    <option value="WITA">WITA</option>
                    <option value="WIB">WIB</option>
                    <option value="WIT">WIT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Instagram Klien (Username)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-semibold">
                    @
                  </span>
                  <input
                    type="text"
                    value={custInstagram}
                    onChange={(e) => setCustInstagram(e.target.value.replace(/^@/, ""))}
                    placeholder="rina.wedding"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm outline-hidden ${activeDark
                      ? "bg-[#25262B] border-white/10 text-white placeholder-slate-500 focus:border-[#4318FF]"
                      : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] placeholder-[#A3AED0] focus:border-[#4318FF]"
                      }`}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Lokasi Venue / Alamat Acara
                </label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Contoh: Ballroom Hotel Grand Pasundan, Palopo"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden ${activeDark
                    ? "bg-[#25262B] border-white/10 text-white placeholder-slate-500 focus:border-[#4318FF]"
                    : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] placeholder-[#A3AED0] focus:border-[#4318FF]"
                    }`}
                />
              </div>
            </div>
          </div>

          {/* CARD 2: PILIHAN PAKET PHOTOBOOTH & ADD-ON */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4 transition-colors duration-200 ${activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
              }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-[#E0E5F2]/60 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4318FF]/10 text-[#4318FF] dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                  📸
                </div>
                <div>
                  <h3 className="text-sm font-bold">Pilihan Paket Photobooth &amp; Add-on</h3>
                  <p className={`text-[11px] ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                    Rincian layanan utama, jam operasional, dan add-on event
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#4318FF]/10 hover:bg-[#4318FF]/20 text-[#4318FF] dark:bg-blue-500/20 dark:text-blue-400 border border-[#4318FF]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span> Tambah Layanan
              </button>
            </div>

            {/* Header Table */}
            <div className={`hidden sm:grid grid-cols-12 gap-2 px-2 text-[11px] font-bold uppercase tracking-wider ${activeDark ? "text-slate-400" : "text-[#707EAE]"
              }`}>
              <div className="col-span-5">Pilihan Paket / Layanan</div>
              <div className="col-span-2 text-center">Durasi/Qty</div>
              <div className="col-span-3 text-right">Harga Paket</div>
              <div className="col-span-2 text-center">Aksi</div>
            </div>

            {/* Dynamic Rows */}
            <div className="space-y-3">
              {items.map((row) => {
                const isCustom = row.name === "Custom Paket Photobooth";
                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl border items-center transition-colors duration-200 ${activeDark ? "bg-[#25262B]/50 border-white/5" : "bg-[#F4F7FE]/70 border-[#E0E5F2]/80"
                      }`}
                  >
                    <div className="sm:col-span-5 space-y-1.5">
                      <select
                        value={row.name}
                        onChange={(e) => handleUpdateItem(row.id, { name: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm font-semibold outline-hidden cursor-pointer ${activeDark
                          ? "bg-[#1A1B20] border-white/10 text-white focus:border-[#4318FF]"
                          : "bg-white border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                          }`}
                      >
                        <optgroup label="📸 Photobooth Fisik (Cetak Instan di Venue)">
                          {RUANGTEMU_PACKAGES.filter((p) => p.category === "physical").map((pkg) => (
                            <option key={pkg.name} value={pkg.name}>
                              {pkg.name} ({formatRupiah(pkg.price)})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🌐 Virtual Photobooth (Web & QR Code)">
                          {RUANGTEMU_PACKAGES.filter((p) => p.category === "virtual").map((pkg) => (
                            <option key={pkg.name} value={pkg.name}>
                              {pkg.name} ({formatRupiah(pkg.price)})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="✨ Add-On & Layanan Tambahan">
                          {RUANGTEMU_PACKAGES.filter((p) => p.category === "addon").map((pkg) => (
                            <option key={pkg.name} value={pkg.name}>
                              {pkg.name} ({formatRupiah(pkg.price)})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="⚙️ Paket Kustom">
                          {RUANGTEMU_PACKAGES.filter((p) => p.category === "custom").map((pkg) => (
                            <option key={pkg.name} value={pkg.name}>
                              {pkg.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>

                      {isCustom && (
                        <input
                          type="text"
                          placeholder="Ketik nama paket kustom..."
                          value={row.customName || ""}
                          onChange={(e) => handleUpdateItem(row.id, { customName: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-hidden ${activeDark
                            ? "bg-[#1A1B20] border-white/10 text-white focus:border-[#4318FF]"
                            : "bg-white border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                            }`}
                        />
                      )}
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-1.5">
                      <span className="sm:hidden text-xs text-slate-400">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => handleUpdateItem(row.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                        className={`w-full px-2 py-2 rounded-lg border text-center text-xs sm:text-sm font-bold outline-hidden ${activeDark
                          ? "bg-[#1A1B20] border-white/10 text-white focus:border-[#4318FF]"
                          : "bg-white border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                          }`}
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-1.5">
                      <span className="sm:hidden text-xs text-slate-400">Harga:</span>
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        value={row.price}
                        onChange={(e) => handleUpdateItem(row.id, { price: Math.max(0, parseInt(e.target.value) || 0) })}
                        className={`w-full px-3 py-2 rounded-lg border text-right text-xs sm:text-sm font-bold outline-hidden ${activeDark
                          ? "bg-[#1A1B20] border-white/10 text-white focus:border-[#4318FF]"
                          : "bg-white border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                          }`}
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-end sm:justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(row.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Hapus baris ini"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span className="sm:hidden">Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 3: STATUS DP & REKENING PEMBAYARAN */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4 transition-colors duration-200 ${activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
              }`}
          >
            <div className="flex items-center gap-2.5 border-b pb-3 border-[#E0E5F2]/60 dark:border-white/5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold">
                💳
              </div>
              <div>
                <h3 className="text-sm font-bold">Status DP &amp; Rekening Pembayaran</h3>
                <p className={`text-[11px] ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                  Tujuan transfer rekening dan status pelunasan transaksi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-hidden cursor-pointer ${activeDark
                    ? "bg-[#25262B] border-white/10 text-white focus:border-[#4318FF]"
                    : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                    }`}
                >
                  <option value="Transfer Bank BCA (8800xxxxxx)">Transfer Bank - BCA</option>
                  <option value="Transfer Bank Mandiri (123000xxxxxx)">Transfer Bank - Mandiri</option>
                  <option value="QRIS All Payment / E-Wallet">QRIS All Payment</option>
                  <option value="Tunai / Cash On Location">Tunai di Lokasi (Cash)</option>
                  <option value="Link Pembayaran Online">Link Pembayaran Card/Invoice</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Status Pembayaran
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-hidden cursor-pointer ${activeDark
                    ? "bg-[#25262B] border-white/10 text-white focus:border-[#4318FF]"
                    : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                    }`}
                >
                  <option value="Belum Dibayar">Belum Dibayar (Unpaid)</option>
                  <option value="DP (Uang Muka 50%)">DP 50% (Booking Slot)</option>
                  <option value="Lunas">Lunas (Paid in Full)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Link Pembayaran / DP (Opsional)
                </label>
                <input
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://mayar.link/pay/photobooth-dp atau link DOKU"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden ${activeDark
                    ? "bg-[#25262B] border-white/10 text-white placeholder-slate-500 focus:border-[#4318FF]"
                    : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] placeholder-[#A3AED0] focus:border-[#4318FF]"
                    }`}
                />
                <p className={`text-[11px] mt-1 ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                  *Tautan ini akan otomatis disertakan dalam teks WhatsApp dan PDF invoice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ────── KOLOM KANAN: RINGKASAN BIAYA & AKSI (5/12) ────── */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div
            className={`p-6 rounded-2xl border transition-colors duration-200 space-y-5 ${activeDark
              ? "bg-[#1A1B20] border-white/10 text-white shadow-xl"
              : "bg-white border-[#E0E5F2] text-[#1B2559] shadow-[0_18px_40px_rgba(112,144,176,0.08)]"
              }`}
          >
            {/* Header Ringkasan */}
            <div className={`flex justify-between items-center border-b pb-4 ${activeDark ? "border-white/10" : "border-[#E0E5F2]"
              }`}>
              <div>
                <span className={`text-[11px] uppercase tracking-wider font-extrabold block ${
                  activeDark ? "text-slate-400" : "text-[#707EAE]"
                }`}>
                  Ringkasan Biaya Event
                </span>
                <span className={`text-sm font-extrabold ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                  Photobooth RUANGTEMU
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  activeDark
                    ? "bg-[#4318FF]/20 text-[#6AD2FF] border-[#4318FF]/40"
                    : "bg-[#4318FF]/10 text-[#4318FF] border-[#4318FF]/20"
                }`}>
                  {invNumber}
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateInv}
                  title="Ganti nomor invoice acak"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                    activeDark
                      ? "text-slate-400 hover:text-white hover:bg-white/10"
                      : "text-[#707EAE] hover:text-[#4318FF] hover:bg-[#F4F7FE]"
                  }`}
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Breakdown Biaya */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className={activeDark ? "text-slate-300" : "text-[#707EAE]"}>
                  Subtotal Layanan ({items.length} item)
                </span>
                <span className={`font-bold ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                  {formatRupiah(subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className={activeDark ? "text-slate-300" : "text-[#707EAE]"}>
                  Diskon / Potongan (Rp)
                </span>
                <input
                  type="number"
                  min="0"
                  step="25000"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-32 px-3 py-1.5 rounded-lg text-right font-mono text-xs font-semibold outline-hidden transition-all ${
                    activeDark
                      ? "bg-[#25262B] border border-white/10 text-white focus:border-[#4318FF]"
                      : "bg-[#F4F7FE] border border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                  }`}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className={activeDark ? "text-slate-300" : "text-[#707EAE]"}>
                  Pajak / Service Fee (%)
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className={`w-16 px-2.5 py-1.5 rounded-lg text-right font-mono text-xs font-semibold outline-hidden transition-all ${
                      activeDark
                        ? "bg-[#25262B] border border-white/10 text-white focus:border-[#4318FF]"
                        : "bg-[#F4F7FE] border border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                    }`}
                  />
                  <span className={`text-xs font-bold ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>%</span>
                </div>
              </div>

              {taxAmount > 0 && (
                <div className={`flex justify-between text-xs pl-3.5 py-1 border-l-2 rounded-r-lg ${
                  activeDark
                    ? "text-slate-300 border-[#6AD2FF] bg-white/5"
                    : "text-[#1B2559] border-[#4318FF] bg-[#4318FF]/5"
                }`}>
                  <span className={activeDark ? "text-slate-400" : "text-[#707EAE]"}>
                    Nominal Pajak ({taxPercent}%)
                  </span>
                  <span className="font-bold">+{formatRupiah(taxAmount)}</span>
                </div>
              )}

              {/* Box Total Investasi Signature RUANGTEMU */}
              <div
                className={`mt-4 p-4 rounded-xl border transition-all ${
                  activeDark
                    ? "bg-gradient-to-r from-[#4318FF]/20 via-[#1A1B20] to-[#6AD2FF]/10 border-white/10 shadow-lg"
                    : "bg-gradient-to-r from-[#4318FF]/5 via-white to-[#6AD2FF]/10 border-[#4318FF]/20 shadow-[0_4px_20px_rgba(67,24,255,0.06)]"
                }`}
              >
                <div className="flex justify-between items-baseline gap-2">
                  <div>
                    <span className={`text-xs uppercase tracking-wider font-extrabold block ${
                      activeDark ? "text-slate-300" : "text-[#707EAE]"
                    }`}>
                      Total Investasi Event
                    </span>
                    <span className={`text-[11px] ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                      Termasuk pajak &amp; penyesuaian
                    </span>
                  </div>
                  <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    activeDark ? "text-[#6AD2FF]" : "text-[#4318FF]"
                  }`}>
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Aksi Utama */}
            <div className="space-y-3 pt-2">
              {/* Button 1: Kirim WA Langsung */}
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="w-full h-12 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold rounded-xl shadow-[0_8px_20px_-4px_rgba(37,211,102,0.4)] transition-all flex items-center justify-center gap-2.5 text-sm cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.26c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.49c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z" />
                </svg>
                <span>Kirim Penawaran via WhatsApp</span>
              </button>

              {/* Button 2: Generate Invoice Modal */}
              <button
                type="button"
                onClick={handleOpenInvoiceModal}
                className={`w-full h-11 active:scale-[0.98] font-bold rounded-xl border transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer ${activeDark
                  ? "bg-white/10 hover:bg-white/15 text-white border-white/15"
                  : "bg-[#F4F7FE] hover:bg-[#EAEFFD] border-[#E0E5F2] text-[#1B2559] hover:text-[#4318FF]"
                  }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Pratinjau &amp; Unduh Invoice (PDF)</span>
              </button>

              {/* Button 3: Salin Teks WA */}
              <button
                type="button"
                onClick={handleCopyWhatsAppText}
                className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                    : "bg-white hover:bg-[#F4F7FE] border-[#E0E5F2] text-[#707EAE] hover:text-[#4318FF]"
                }`}
              >
                <span>📋</span>
                <span>Salin Teks Format WhatsApp</span>
              </button>
            </div>

            <div className={`border-t pt-3 text-center ${activeDark ? "border-white/10" : "border-[#E0E5F2]"}`}>
              <p className={`text-[11px] ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                🛡️ Format penawaran otomatis ramah WhatsApp &amp; siap download PDF invoice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL PRATINJAU INVOICE / DOWNLOAD PDF ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full my-auto border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Top Chrome (Non-print) - Berisi Judul & Tombol Close yang Terisolasi, Anti-Overlap */}
            <div className="no-print flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-slate-100 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4318FF]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pratinjau &amp; Unduh Invoice Resmi
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                title="Tutup Modal"
              >
                ✕
              </button>
            </div>

            {/* Template Invoice Lengkap (Yang di-render ke Canvas / PDF & Print) */}
            <div id="printableInvoice" className="p-6 sm:p-8 bg-white space-y-6 overflow-y-auto">
              {/* Header Modal */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#4318FF] overflow-hidden flex items-center justify-center text-white shadow-xs border border-slate-200 shrink-0">
                    {customLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/logo-ruangtemu.jpg" alt="RUANGTEMU" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                      INVOICE PHOTOBOOTH
                    </h2>
                    <span className="inline-block mt-0.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#4318FF]/10 text-[#4318FF] border border-[#4318FF]/20">
                      {invNumber}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">RUANGTEMU</h3>
                  <p className="text-[11px] text-slate-500">Jl. Anggrek Blok EE No. 24 Kota Palopo</p>
                  <p className="text-[11px] text-slate-500">Instant Printing &amp; Event Photo Solution</p>
                </div>
              </div>

              {/* Info Pelanggan & Tanggal (Dua Card Bersih Berdampingan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Info Klien */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Tagihan Kepada (Klien / Event):
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm leading-snug">{custName || "-"}</p>
                  {custPhone && <p className="text-slate-600 font-mono text-[11px]">📱 WhatsApp: {custPhone}</p>}
                  {custInstagram && <p className="text-slate-600 text-[11px]">📷 Instagram: @{custInstagram}</p>}
                  {custAddress && <p className="text-slate-600 text-[11px]">📍 Venue: {custAddress}</p>}
                </div>

                {/* Info Jadwal & Pembayaran */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5 text-right">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Tanggal Invoice:</span>
                    <span className="font-medium text-slate-800">
                      {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Tanggal Acara:</span>
                    <span className="font-bold text-slate-900">{formattedEventDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Jam Mulai:</span>
                    <span className="font-bold text-[#4318FF]">{formattedEventTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Metode Bayar:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px] sm:max-w-none">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-0.5">
                    <span className="text-slate-500">Status Pembayaran:</span>
                    <span
                      className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] inline-block ${paymentStatus.includes("Lunas")
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : paymentStatus.includes("DP")
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                    >
                      {paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Items */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 text-center w-10">No</th>
                      <th className="py-2.5 px-3">Paket / Layanan Photobooth</th>
                      <th className="py-2.5 px-3 text-center w-24">Durasi/Qty</th>
                      <th className="py-2.5 px-3 text-right w-28">Harga</th>
                      <th className="py-2.5 px-3 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      const displayName =
                        item.name === "Custom Paket Photobooth"
                          ? item.customName || "Custom Paket Photobooth"
                          : item.name;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{displayName}</td>
                          <td className="py-2.5 px-3 text-center text-slate-600 font-medium">{item.qty}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600 font-mono">{formatRupiah(item.price)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                            {formatRupiah(item.qty * item.price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Ringkasan Hitungan Modal */}
              <div className="flex justify-end pt-1">
                <div className="w-full sm:w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-800 font-mono">{formatRupiah(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Diskon / Potongan:</span>
                      <span className="font-semibold text-rose-600 font-mono">- {formatRupiah(discount)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Pajak / Service Fee ({taxPercent}%):</span>
                      <span className="font-semibold text-slate-800 font-mono">+ {formatRupiah(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline text-sm font-extrabold text-slate-900 border-t-2 border-slate-200 pt-2">
                    <span>Total Pembayaran:</span>
                    <span className="text-[#4318FF] text-lg font-black font-mono">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-500 space-y-1">
                <p className="font-medium text-slate-600">
                  Terima kasih telah mempercayakan momen spesial Anda kepada RUANGTEMU! 📸✨
                </p>
                {paymentLink && (
                  <p className="font-mono text-[10px] text-blue-600 break-all">
                    Link Pembayaran: {paymentLink}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Action Footer (Hidden on Print) */}
            <div className="no-print flex flex-col sm:flex-row justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={isDownloadingPDF}
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#4318FF] hover:bg-[#3311DB] disabled:opacity-50 rounded-xl transition-all shadow-md shadow-[#4318FF]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDownloadingPDF ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengunduh PDF...</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download Invoice (PDF)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSendToWhatsApp();
                  setIsModalOpen(false);
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.26c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.49c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z" />
                </svg>
                <span>Kirim via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-[999999] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold transition-all transform animate-bounce ${toastType === "warning"
            ? "bg-amber-500 text-white"
            : activeDark
              ? "bg-[#25262B] text-white border border-white/10"
              : "bg-slate-900 text-white border border-slate-800"
            }`}
        >
          <span>{toastType === "warning" ? "⚠️" : "ℹ️"}</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── PRINT CSS INJECTION (HILANGKAN HEADER/FOOTER BROWSER SEPERTI "ADMIN DASHBOARD...") ─── */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0 !important;
        }
        @page :left {
          margin: 0 !important;
        }
        @page :right {
          margin: 0 !important;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Sembunyikan seluruh UI latar belakang & elemen navigasi admin */
          body * {
            visibility: hidden !important;
          }
          /* Hanya tampilkan kertas invoice resmi murni */
          #printableInvoice,
          #printableInvoice * {
            visibility: visible !important;
          }
          #printableInvoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 12mm 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );

  if (standalone) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${activeDark ? "bg-[#121214] text-[#F8F9FA]" : "bg-[#F4F7FE] text-[#1B2559]"
        }`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
