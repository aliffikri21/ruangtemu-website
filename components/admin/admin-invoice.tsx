"use client";

import { useState, useEffect, useCallback } from "react";
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

// Bersihkan nomor rekening dalam kurung dari metode pembayaran untuk tampilan rapi
export function cleanPaymentMethod(method?: string): string {
  if (!method) return "-";
  return method
    .replace(/\s*\([^)]*\d+[^)]*\)/g, "")
    .replace(/\s*\(8800x+\)/gi, "")
    .replace(/\s*\(123000x+\)/gi, "")
    .trim();
}

export interface InvoiceItemRow {
  id: string;
  name: string;
  customName?: string;
  qty: number;
  price: number;
}

// ── Model Arsip Invoice Resmi untuk Pembukuan ──
export interface InvoiceArchiveItem {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone?: string;
  customerInstagram?: string;
  customerAddress?: string;
  eventDate: string;
  eventTime: string;
  items: InvoiceItemRow[];
  subtotal: number;
  discount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  paymentStatus: "Belum Dibayar" | "DP (Booking Slot)" | "DP (Uang Muka)" | "Lunas";
  dpAmount?: number;
  paymentMethod: string;
  paymentLink?: string;
  notes?: string;
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
  // ── State Dark Mode (Sync dengan localStorage dan Parent - Default Selalu Mode Terang) ──
  const [internalDark, setInternalDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ruangtemu_admin_dark");
      if (saved === "true") {
        setInternalDark(true);
      } else {
        setInternalDark(false);
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
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank BCA");
  const [paymentStatus, setPaymentStatus] = useState("Belum Dibayar");
  const [dpAmount, setDpAmount] = useState<number>(0);
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

  // ── State Tab & Manajemen Arsip Invoice Pembukuan ──
  const [activeInvoiceTab, setActiveInvoiceTab] = useState<"generator" | "archive">("generator");
  const [archives, setArchives] = useState<InvoiceArchiveItem[]>([]);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveStatusFilter, setArchiveStatusFilter] = useState<"all" | "Lunas" | "DP" | "DP (Booking Slot)" | "DP (Uang Muka)" | "Belum Dibayar">("all");
  const [selectedArchiveDetail, setSelectedArchiveDetail] = useState<InvoiceArchiveItem | null>(null);

  // ── State Integrasi Reservasi Klien ──
  const [activeBookings, setActiveBookings] = useState<Booking[]>(bookings || []);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isBookingPickerOpen, setIsBookingPickerOpen] = useState(false);
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState<"all" | "photobooth" | "virtual_photobooth">("all");

  const fetchBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setActiveBookings(data.bookings);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch bookings:", err);
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (bookings && bookings.length > 0) {
      setActiveBookings(bookings);
    } else {
      fetchBookings();
    }
  }, [bookings, fetchBookings]);

  // Fungsi Sinkronisasi Real-time dengan Cloud Supabase (SSOT)
  const syncWithCloud = useCallback(async (silent = true) => {
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.archives)) {
          const cleanedCloud: InvoiceArchiveItem[] = data.archives.filter(
            (item: any) =>
              !item.id?.startsWith("inv-seed-") &&
              item.invoiceNumber !== "INV-PB748446" &&
              item.invoiceNumber !== "INV-PB819203"
          );

          // Cek apakah data benar-benar berubah sebelum memicu re-render
          setArchives((prev) => {
            const isDiff =
              prev.length !== cleanedCloud.length ||
              prev.some((p, idx) => {
                const c = cleanedCloud[idx];
                return (
                  !c ||
                  p.id !== c.id ||
                  p.invoiceNumber !== c.invoiceNumber ||
                  p.paymentStatus !== c.paymentStatus ||
                  p.grandTotal !== c.grandTotal
                );
              });

            if (isDiff) {
              try {
                localStorage.setItem("rt_invoice_archives", JSON.stringify(cleanedCloud));
              } catch {}
              return cleanedCloud;
            }
            return prev;
          });
        }
      }
    } catch (err: any) {
      if (!silent) {
        console.warn("Gagal sinkronisasi cloud:", err?.message);
      }
    }
  }, []);

  // Inisialisasi Invoice Number, Logo, dan Arsip dari localStorage
  useEffect(() => {
    setInvNumber("INV-PB" + Math.floor(100000 + Math.random() * 900000));
    try {
      const savedLogo = localStorage.getItem("rt_photobooth_logo");
      if (savedLogo) setCustomLogo(savedLogo);
    } catch {
      // ignore
    }

    // 1. Baca cache cepat dari localStorage (0ms render)
    try {
      const savedArchives = localStorage.getItem("rt_invoice_archives");
      if (savedArchives !== null) {
        const parsed = JSON.parse(savedArchives);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (item) =>
              !item.id?.startsWith("inv-seed-") &&
              item.invoiceNumber !== "INV-PB748446" &&
              item.invoiceNumber !== "INV-PB819203"
          );
          setArchives(cleaned);
        }
      }
    } catch {
      // ignore
    }

    // 2. Sinkronisasi pertama kali dengan Cloud Supabase
    syncWithCloud(true);
  }, [syncWithCloud]);

  // Real-time polling & auto-sinkronisasi saat tab browser aktif kembali
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncWithCloud(true);
      }
    };
    const handleFocus = () => {
      syncWithCloud(true);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    // Polling background real-time setiap 3 detik agar sinkron instan antar browser
    const pollTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        syncWithCloud(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(pollTimer);
    };
  }, [syncWithCloud]);

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

  // Ambil & Terapkan Data Reservasi Klien ke Formulir Invoice
  const handleSelectBooking = (b: Booking) => {
    setCustName(b.customer_name || "");
    setCustPhone(b.customer_phone || "");
    if (b.event_date) {
      setEventDate(b.event_date.split("T")[0]);
    }
    if (b.event_time) {
      setEventTime(b.event_time);
    }
    const locationVal = [b.location, b.city].filter(Boolean).join(", ");
    if (locationVal) {
      setCustAddress(locationVal);
    }

    // Tentukan Nama Paket Layanan
    let targetPackageName = b.package_name || "";
    if (!targetPackageName && b.package_id) {
      const p = packages.find((pkg) => pkg.id === b.package_id);
      if (p) targetPackageName = p.name;
    }
    if (!targetPackageName) {
      const isPhys = (b.category || b.booking_category) === "photobooth";
      targetPackageName = isPhys ? "Paket Photobooth Fisik" : "Virtual Photobooth";
    }

    setItems([
      {
        id: "item-" + Date.now(),
        name: targetPackageName,
        qty: 1,
        price: b.total_price || 0,
      },
    ]);

    if (b.payment_status === "PAID") {
      setPaymentStatus("Lunas");
      setDpAmount(0);
    } else if (b.payment_amount && b.payment_amount > 0) {
      setPaymentStatus("DP (Booking Slot)");
      setDpAmount(b.payment_amount);
    } else if (b.status === "confirmed") {
      setPaymentStatus("DP (Booking Slot)");
      setDpAmount(b.payment_amount || Math.round((b.total_price || 0) * 0.5));
    } else {
      setPaymentStatus("Belum Dibayar");
      setDpAmount(0);
    }

    if (b.payment_method) {
      setPaymentMethod(cleanPaymentMethod(b.payment_method));
    }
    if (b.payment_invoice) {
      setPaymentLink(b.payment_invoice);
    }

    setIsBookingPickerOpen(false);
    showToast(`Data reservasi klien "${b.customer_name}" berhasil diambil!`);
  };

  const handleAutofillBooking = (bookingId: string) => {
    if (!bookingId) return;
    const b = activeBookings.find((item) => item.id === bookingId);
    if (b) handleSelectBooking(b);
  };

  const filteredBookings = activeBookings.filter((b) => {
    const cat = b.booking_category || b.category || "virtual_photobooth";
    if (bookingCategoryFilter !== "all" && cat !== bookingCategoryFilter) {
      return false;
    }

    if (!bookingSearchQuery.trim()) return true;
    const q = bookingSearchQuery.toLowerCase();
    const nameMatch = (b.customer_name || "").toLowerCase().includes(q);
    const phoneMatch = (b.customer_phone || "").toLowerCase().includes(q);
    const eventMatch = (b.event_name || "").toLowerCase().includes(q);
    const pkgMatch = (b.package_name || "").toLowerCase().includes(q);
    const locMatch = (b.location || b.city || "").toLowerCase().includes(q);

    return nameMatch || phoneMatch || eventMatch || pkgMatch || locMatch;
  });

  // ── Unified Data Invoice untuk Modal & Export (Bisa dari Generator atau Arsip Terpilih) ──
  const modalInvoiceData = selectedArchiveDetail
    ? {
        invNumber: selectedArchiveDetail.invoiceNumber,
        custName: selectedArchiveDetail.customerName,
        custPhone: selectedArchiveDetail.customerPhone || "",
        custInstagram: selectedArchiveDetail.customerInstagram || "",
        custAddress: selectedArchiveDetail.customerAddress || "",
        eventDate: selectedArchiveDetail.eventDate,
        eventTime: selectedArchiveDetail.eventTime,
        formattedEventDate: (() => {
          try {
            return new Date(selectedArchiveDetail.eventDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          } catch {
            return selectedArchiveDetail.eventDate;
          }
        })(),
        formattedEventTime: selectedArchiveDetail.eventTime || "-",
        items: selectedArchiveDetail.items,
        subtotal: selectedArchiveDetail.subtotal,
        discount: selectedArchiveDetail.discount,
        taxPercent: selectedArchiveDetail.taxPercent,
        taxAmount: selectedArchiveDetail.taxAmount,
        grandTotal: selectedArchiveDetail.grandTotal,
        paymentStatus: selectedArchiveDetail.paymentStatus,
        dpAmount: selectedArchiveDetail.dpAmount || 0,
        paymentMethod: selectedArchiveDetail.paymentMethod,
        paymentLink: selectedArchiveDetail.paymentLink || "",
        createdAt: selectedArchiveDetail.createdAt,
        isArchived: true,
        archiveId: selectedArchiveDetail.id,
      }
    : {
        invNumber,
        custName,
        custPhone,
        custInstagram,
        custAddress,
        eventDate,
        eventTime: `${eventTime} ${timeZone}`,
        formattedEventDate,
        formattedEventTime,
        items,
        subtotal,
        discount,
        taxPercent,
        taxAmount,
        grandTotal,
        paymentStatus,
        dpAmount: paymentStatus.includes("DP") ? (dpAmount || 0) : 0,
        paymentMethod,
        paymentLink,
        createdAt: new Date().toISOString(),
        isArchived: archives.some((a) => a.invoiceNumber === invNumber),
        archiveId: archives.find((a) => a.invoiceNumber === invNumber)?.id || null,
      };

  // ── Manajemen Penyimpanan Arsip ke LocalStorage ──
  const persistArchives = (updated: InvoiceArchiveItem[]) => {
    setArchives(updated);
    try {
      localStorage.setItem("rt_invoice_archives", JSON.stringify(updated));
    } catch (e) {
      console.error("Gagal menyimpan arsip:", e);
    }
  };

  // Terbitkan dan Simpan Invoice Resmi ke Buku Arsip Pembukuan
  const handleCreateAndArchiveInvoice = () => {
    if (!custName.trim()) {
      showToast("Harap isi Nama Klien terlebih dahulu!", "warning");
      return;
    }
    if (items.length === 0) {
      showToast("Harap tambahkan minimal 1 item paket/layanan!", "warning");
      return;
    }

    const currentInvoiceNum = invNumber || `INV-PB${Math.floor(100000 + Math.random() * 900000)}`;

    const newArchive: InvoiceArchiveItem = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      invoiceNumber: currentInvoiceNum,
      createdAt: new Date().toISOString(),
      customerName: custName.trim(),
      customerPhone: custPhone.trim(),
      customerInstagram: custInstagram.trim(),
      customerAddress: custAddress.trim(),
      eventDate: eventDate || new Date().toISOString().split("T")[0],
      eventTime: `${eventTime} ${timeZone}`,
      items: items.map((it) => ({ ...it })),
      subtotal,
      discount,
      taxPercent,
      taxAmount,
      grandTotal,
      paymentStatus: paymentStatus as any,
      dpAmount: paymentStatus.includes("DP") ? (dpAmount || 0) : 0,
      paymentMethod,
      paymentLink,
    };

    const nextArchives = [newArchive, ...archives.filter((a) => a.invoiceNumber !== currentInvoiceNum)];
    persistArchives(nextArchives);

    // Kirim & Sinkronkan langsung ke Cloud Supabase
    fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", archive: newArchive }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.archives)) {
          setArchives(data.archives);
          localStorage.setItem("rt_invoice_archives", JSON.stringify(data.archives));
        }
      })
      .catch((e) => console.warn("Background cloud save error:", e));

    showToast(`Invoice ${currentInvoiceNum} berhasil disimpan ke Buku Arsip!`);

    // Tutup pop up window pratinjau setelah berhasil diarsipkan
    setIsModalOpen(false);
    setSelectedArchiveDetail(null);

    // Otomatis siapkan nomor invoice baru untuk transaksi berikutnya
    setInvNumber("INV-PB" + Math.floor(100000 + Math.random() * 900000));
  };

  // Hapus arsip invoice dari pembukuan
  const handleDeleteArchive = (id: string, invoiceNum: string) => {
    if (confirm(`Yakin ingin menghapus invoice ${invoiceNum} dari buku arsip?`)) {
      const filtered = archives.filter((a) => a.id !== id);
      persistArchives(filtered);
      showToast(`Invoice ${invoiceNum} telah dihapus dari arsip.`);
      if (selectedArchiveDetail?.id === id) {
        setIsModalOpen(false);
        setSelectedArchiveDetail(null);
      }

      // Sync hapus ke Cloud Supabase
      fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id, invoiceNumber: invoiceNum }),
      }).catch((e) => console.warn("Background cloud delete error:", e));
    }
  };

  // Kosongkan seluruh arsip pembukuan
  const handleClearAllArchives = () => {
    if (archives.length === 0) return;
    if (confirm("Yakin ingin mengosongkan semua data arsip pembukuan? Data yang dihapus tidak dapat dikembalikan.")) {
      persistArchives([]);
      showToast("Seluruh arsip invoice berhasil dikosongkan.");
      if (selectedArchiveDetail) {
        setIsModalOpen(false);
        setSelectedArchiveDetail(null);
      }

      // Sync kosongkan ke Cloud Supabase
      fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all", confirm: true }),
      }).catch((e) => console.warn("Background cloud clear error:", e));
    }
  };

  // Ubah status pembayaran arsip invoice (Lunas / DP / Belum Dibayar)
  const handleUpdateArchiveStatus = (
    id: string,
    newStatus: "Belum Dibayar" | "DP (Booking Slot)" | "DP (Uang Muka)" | "Lunas",
    newDpAmount?: number
  ) => {
    const updated = archives.map((a) => {
      if (a.id === id) {
        const resolvedDp =
          newDpAmount !== undefined
            ? newDpAmount
            : newStatus.includes("DP")
            ? a.dpAmount || Math.round((a.grandTotal || 0) * 0.5)
            : 0;
        return { ...a, paymentStatus: newStatus, dpAmount: resolvedDp };
      }
      return a;
    });
    persistArchives(updated);
    showToast(`Status invoice diubah menjadi: ${newStatus}`);
    if (selectedArchiveDetail?.id === id) {
      setSelectedArchiveDetail((prev) => {
        if (!prev) return null;
        const resolvedDp =
          newDpAmount !== undefined
            ? newDpAmount
            : newStatus.includes("DP")
            ? prev.dpAmount || Math.round((prev.grandTotal || 0) * 0.5)
            : 0;
        return { ...prev, paymentStatus: newStatus, dpAmount: resolvedDp };
      });
    }

    // Sync status ke Cloud Supabase
    fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", id, paymentStatus: newStatus, dpAmount: newDpAmount }),
    }).catch((e) => console.warn("Background cloud status error:", e));
  };

  // Muat data dari arsip kembali ke formulir generator kasir
  const handleLoadArchiveToGenerator = (arch: InvoiceArchiveItem) => {
    setCustName(arch.customerName);
    setCustPhone(arch.customerPhone || "");
    setCustInstagram(arch.customerInstagram || "");
    setCustAddress(arch.customerAddress || "");
    setEventDate(arch.eventDate);
    const timeParts = arch.eventTime.split(" ");
    if (timeParts[0]) setEventTime(timeParts[0]);
    if (timeParts[1]) setTimeZone(timeParts[1]);
    setItems(arch.items.map((it) => ({ ...it })));
    setDiscount(arch.discount || 0);
    setTaxPercent(arch.taxPercent || 0);
    setPaymentMethod(cleanPaymentMethod(arch.paymentMethod));
    setPaymentStatus(arch.paymentStatus);
    setDpAmount(arch.dpAmount || 0);
    setPaymentLink(arch.paymentLink || "");
    setInvNumber(arch.invoiceNumber);

    setActiveInvoiceTab("generator");
    showToast(`Data invoice ${arch.invoiceNumber} dimuat ke form Kasir.`);
  };

  // Ekspor Rekap Pembukuan ke CSV (Excel ready)
  const handleExportCSV = () => {
    if (archives.length === 0) {
      showToast("Belum ada arsip invoice untuk diekspor", "warning");
      return;
    }

    const headers = [
      "No. Invoice",
      "Tanggal Dibuat",
      "Nama Klien",
      "No. WhatsApp",
      "Instagram",
      "Lokasi Venue",
      "Tanggal Acara",
      "Jam Acara",
      "Layanan / Paket",
      "Subtotal (Rp)",
      "Diskon (Rp)",
      "Pajak (Rp)",
      "Total Pembayaran (Rp)",
      "Status Pembayaran",
      "Metode Pembayaran",
    ];

    const rows = archives.map((a) => [
      `"${a.invoiceNumber}"`,
      `"${new Date(a.createdAt).toLocaleDateString("id-ID")}"`,
      `"${a.customerName.replace(/"/g, '""')}"`,
      `"${a.customerPhone || "-"}"`,
      `"${a.customerInstagram ? "@" + a.customerInstagram : "-"}"`,
      `"${(a.customerAddress || "-").replace(/"/g, '""')}"`,
      `"${a.eventDate}"`,
      `"${a.eventTime}"`,
      `"${a.items.map((i) => `${i.name} (x${i.qty})`).join("; ").replace(/"/g, '""')}"`,
      a.subtotal,
      a.discount,
      a.taxAmount,
      a.grandTotal,
      `"${a.paymentStatus}"`,
      `"${a.paymentMethod}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rekap-Arsip-Invoice-RUANGTEMU-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Berhasil mengunduh rekap pembukuan CSV!");
  };

  // Kirim ke WhatsApp (Mendukung data generator maupun data arsip)
  const handleSendToWhatsApp = (archTarget?: InvoiceArchiveItem) => {
    const targetData = archTarget
      ? {
          invNumber: archTarget.invoiceNumber,
          custName: archTarget.customerName,
          custPhone: archTarget.customerPhone || "",
          custInstagram: archTarget.customerInstagram || "",
          custAddress: archTarget.customerAddress || "",
          formattedDate: new Date(archTarget.eventDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          formattedTime: archTarget.eventTime,
          items: archTarget.items,
          subtotal: archTarget.subtotal,
          discount: archTarget.discount,
          taxPercent: archTarget.taxPercent,
          taxAmount: archTarget.taxAmount,
          grandTotal: archTarget.grandTotal,
          paymentMethod: archTarget.paymentMethod,
          paymentStatus: archTarget.paymentStatus,
          paymentLink: archTarget.paymentLink || "",
        }
      : selectedArchiveDetail
      ? {
          invNumber: selectedArchiveDetail.invoiceNumber,
          custName: selectedArchiveDetail.customerName,
          custPhone: selectedArchiveDetail.customerPhone || "",
          custInstagram: selectedArchiveDetail.customerInstagram || "",
          custAddress: selectedArchiveDetail.customerAddress || "",
          formattedDate: new Date(selectedArchiveDetail.eventDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          formattedTime: selectedArchiveDetail.eventTime,
          items: selectedArchiveDetail.items,
          subtotal: selectedArchiveDetail.subtotal,
          discount: selectedArchiveDetail.discount,
          taxPercent: selectedArchiveDetail.taxPercent,
          taxAmount: selectedArchiveDetail.taxAmount,
          grandTotal: selectedArchiveDetail.grandTotal,
          paymentMethod: selectedArchiveDetail.paymentMethod,
          paymentStatus: selectedArchiveDetail.paymentStatus,
          dpAmount: selectedArchiveDetail.dpAmount || 0,
          paymentLink: selectedArchiveDetail.paymentLink || "",
        }
      : {
          invNumber,
          custName,
          custPhone,
          custInstagram,
          custAddress,
          formattedDate: formattedEventDate,
          formattedTime: formattedEventTime,
          items,
          subtotal,
          discount,
          taxPercent,
          taxAmount,
          grandTotal,
          paymentMethod,
          paymentStatus,
          dpAmount: paymentStatus.includes("DP") ? (dpAmount || 0) : 0,
          paymentLink,
        };

    if (!targetData.custName.trim()) {
      showToast("Nama Klien tidak boleh kosong!", "warning");
      return;
    }

    let text = `*INVOICE & PENAWARAN RESMI PHOTOBOOTH*\n`;
    text += `📍 RUANGTEMU - Jl. Anggrek Blok EE No. 24 Kota Palopo\n`;
    text += `--------------------------------------------------\n`;
    text += `*No. Invoice:* ${targetData.invNumber}\n`;
    text += `*Klien / Event:* ${targetData.custName.trim()}\n`;
    if (targetData.custInstagram.trim()) text += `*Instagram:* @${targetData.custInstagram.trim().replace(/^@/, "")}\n`;
    text += `*Tanggal Acara:* ${targetData.formattedDate}\n`;
    text += `*Jam Mulai:* ${targetData.formattedTime}\n`;
    if (targetData.custAddress.trim()) text += `*Lokasi Venue:* ${targetData.custAddress.trim()}\n`;
    text += `--------------------------------------------------\n\n`;

    text += `*Rincian Paket & Layanan:*\n`;
    targetData.items.forEach((item, index) => {
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
    text += `*Subtotal:* ${formatRupiah(targetData.subtotal)}\n`;
    if (targetData.discount > 0) text += `*Diskon:* -${formatRupiah(targetData.discount)}\n`;
    if (targetData.taxAmount > 0)
      text += `*Pajak/Service Fee (${targetData.taxPercent}%):* +${formatRupiah(targetData.taxAmount)}\n`;
    text += `*TOTAL INVESTASI:* *${formatRupiah(targetData.grandTotal)}*\n`;
    text += `--------------------------------------------------\n\n`;

    text += `*Metode Pembayaran:* ${cleanPaymentMethod(targetData.paymentMethod)}\n`;
    text += `*Status Pembayaran:* *${targetData.paymentStatus}*\n`;
    if (targetData.paymentStatus.includes("DP") && targetData.dpAmount && targetData.dpAmount > 0) {
      text += `*Uang Muka (DP Dibayar):* *${formatRupiah(targetData.dpAmount)}*\n`;
      text += `*Sisa Tagihan / Pelunasan:* *${formatRupiah(Math.max(0, targetData.grandTotal - targetData.dpAmount))}*\n`;
    }

    if (targetData.paymentLink.trim()) {
      text += `\n💳 *Link Pembayaran DP/Lunas:* ${targetData.paymentLink.trim()}\n`;
    }

    text += `\n*Catatan:* Mohon lakukan konfirmasi setelah melakukan pembayaran. Terima kasih telah mempercayakan momen bahagia Anda bersama kami! 📸✨`;

    let formattedPhone = targetData.custPhone.replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    } else if (formattedPhone.length > 0 && !formattedPhone.startsWith("62")) {
      formattedPhone = "62" + formattedPhone;
    }

    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
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
    text += `\n*TOTAL:* *${formatRupiah(grandTotal)}*\n*Status:* *${paymentStatus}*\n`;
    if (paymentStatus.includes("DP") && dpAmount > 0) {
      text += `*Uang Muka (DP):* *${formatRupiah(dpAmount)}*\n*Sisa Pelunasan:* *${formatRupiah(Math.max(0, grandTotal - dpAmount))}*\n`;
    }
    text += `*Metode:* ${cleanPaymentMethod(paymentMethod)}\n`;
    if (paymentLink) text += `💳 Link: ${paymentLink}\n`;

    navigator.clipboard.writeText(text);
    showToast("Teks invoice WhatsApp berhasil disalin!");
  };

  // Buka Modal Pratinjau / Download Invoice
  const handleOpenInvoiceModal = (archItem?: InvoiceArchiveItem) => {
    if (archItem) {
      setSelectedArchiveDetail(archItem);
      setIsModalOpen(true);
      return;
    }
    if (!custName.trim()) {
      showToast("Harap isi Nama Klien terlebih dahulu!", "warning");
      return;
    }
    setSelectedArchiveDetail(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArchiveDetail(null);
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
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(invoiceElem, {
        scale: 2,
        useCORS: true,
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
      // Format standar A4: 210 x 297 mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const marginX = 8; // Margin samping 8mm
      const marginY = 8; // Margin atas-bawah 8mm
      const maxPrintWidth = pageWidth - marginX * 2; // 194mm
      const maxPrintHeight = pageHeight - marginY * 2; // 281mm

      // Skala proporsional agar 100% selalu muat tepat dalam 1 LEMBAR A4 (Single-page fit)
      const widthRatio = maxPrintWidth / canvas.width;
      const heightRatio = maxPrintHeight / canvas.height;
      const scaleRatio = Math.min(widthRatio, heightRatio);

      const finalWidth = canvas.width * scaleRatio;
      const finalHeight = canvas.height * scaleRatio;

      // Posisikan horizontal center di tengah kertas
      const posX = (pageWidth - finalWidth) / 2;
      const posY = marginY;

      pdf.addImage(imgData, "PNG", posX, posY, finalWidth, finalHeight);

      const activeInvNum = modalInvoiceData.invNumber || invNumber || "PB";
      const fileName = `Invoice-RUANGTEMU-${activeInvNum}.pdf`;
      pdf.save(fileName);
      showToast(`Berhasil mengunduh ${fileName} (1 Lembar)`);
    } catch (err) {
      console.error("Gagal generate PDF:", err);
      showToast("Gagal mengunduh file PDF secara langsung. Silakan coba kembali.", "warning");
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeDark
                    ? "bg-[#4318FF]/20 text-[#6AD2FF] border-[#4318FF]/40"
                    : "bg-[#F4F7FE] text-[#4318FF] border-[#E0E5F2]"
                }`}>
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

      {/* ─── QUICK AUTOFILL BAR DARI DATA BOOKINGS ─── */}
      <div
        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs transition-colors duration-200 ${
          activeDark ? "bg-[#1A1B20] border-white/10 text-white" : "bg-white border-[#E0E5F2] text-[#1B2559]"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            activeDark ? "bg-[#4318FF]/20 text-[#6AD2FF]" : "bg-[#F4F7FE] text-[#4318FF]"
          }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${activeDark ? "text-[#6AD2FF]" : "text-[#4318FF]"}`}>
                Reservasi Klien Dashboard
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                activeDark ? "bg-[#4318FF]/20 text-[#6AD2FF]" : "bg-[#F4F7FE] text-[#4318FF]"
              }`}>
                {activeBookings.length} Data
              </span>
            </div>
            <p className={`text-[11px] ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
              Tarik otomatis rincian pemesan, venue, paket, dan total biaya ke formulir
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBookingPickerOpen(true)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-[#4318FF] hover:bg-[#3311DB] active:scale-[0.98] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Ambil Detail Pesanan dari Reservasi Klien</span>
          </button>

          {activeBookings.length > 0 && (
            <select
              onChange={(e) => handleAutofillBooking(e.target.value)}
              defaultValue=""
              className={`hidden lg:block text-xs font-medium px-3 py-2 rounded-xl border outline-hidden cursor-pointer max-w-[210px] truncate ${
                activeDark
                  ? "bg-[#25262B] border-white/10 text-white focus:border-[#4318FF]"
                  : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
              }`}
            >
              <option value="" disabled>
                -- Pilih Cepat ({activeBookings.length}) --
              </option>
              {activeBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.customer_name} ({formatRupiah(b.total_price || 0)})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ─── NAVIGATION SUB-TAB: KASIR GENERATOR vs ARSIP PEMBUKUAN ─── */}
      <div
        className={`p-1.5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-xs transition-colors duration-200 ${
          activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
        }`}
      >
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {/* Tab 1: Kasir & Generator */}
          <button
            type="button"
            onClick={() => setActiveInvoiceTab("generator")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeInvoiceTab === "generator"
                ? "bg-[#4318FF] text-white shadow-md shadow-[#4318FF]/25"
                : activeDark
                ? "text-slate-400 hover:text-white hover:bg-white/5"
                : "text-[#707EAE] hover:text-[#1B2559] hover:bg-[#F4F7FE]"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <line x1="8" y1="7" x2="16" y2="7" />
              <line x1="8" y1="11" x2="16" y2="11" />
              <line x1="8" y1="15" x2="12" y2="15" />
            </svg>
            <span>Kasir &amp; Generator Invoice</span>
          </button>

          {/* Tab 2: Arsip & Pembukuan */}
          <button
            type="button"
            onClick={() => setActiveInvoiceTab("archive")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeInvoiceTab === "archive"
                ? "bg-[#4318FF] text-white shadow-md shadow-[#4318FF]/25"
                : activeDark
                ? "text-slate-400 hover:text-white hover:bg-white/5"
                : "text-[#707EAE] hover:text-[#1B2559] hover:bg-[#F4F7FE]"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>Buku Arsip Invoice</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeInvoiceTab === "archive"
                  ? "bg-white/20 text-white"
                  : activeDark
                  ? "bg-white/10 text-slate-300"
                  : "bg-[#F4F7FE] text-[#4318FF]"
              }`}
            >
              {archives.length}
            </span>
          </button>
        </div>

        {/* Info Cepat Status / Total Terbit */}
        <div className="hidden sm:flex items-center gap-3 px-3 text-xs">
          <span className={activeDark ? "text-slate-400" : "text-[#707EAE]"}>
            Total Arsip:{" "}
            <strong className={activeDark ? "text-white" : "text-[#1B2559]"}>
              {archives.length} Surat
            </strong>
          </span>
          <span className={activeDark ? "text-white/20" : "text-[#E0E5F2]"}>•</span>
          <span className="text-[#05CD99] font-bold">
            Lunas: {archives.filter((a) => a.paymentStatus === "Lunas").length}
          </span>
        </div>
      </div>

      {/* ─── KONTEN TAB 1: FORMULIR KASIR & GENERATOR ─── */}
      {activeInvoiceTab === "generator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ────── KOLOM KIRI: FORM DATA & ITEM ────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* CARD 1: DATA KLIEN & DETAIL ACARA */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4 transition-colors duration-200 ${
              activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
            }`}
          >
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${
              activeDark ? "border-white/10" : "border-[#E0E5F2]"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  activeDark ? "bg-[#4318FF]/20 text-[#6AD2FF]" : "bg-[#F4F7FE] text-[#4318FF]"
                }`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                    Data Klien &amp; Detail Acara
                  </h3>
                  <p className={`text-[11px] ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                    Informasi identitas pemesan dan lokasi venue photobooth
                  </p>
                </div>
              </div>

              {/* Action buttons (Ambil dari Reservasi & Logo) */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsBookingPickerOpen(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                    activeDark
                      ? "bg-[#4318FF] hover:bg-[#3311DB] text-white"
                      : "bg-[#4318FF] hover:bg-[#3311DB] text-white"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                  <span>Ambil dari Reservasi Klien</span>
                  {activeBookings.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
                      {activeBookings.length}
                    </span>
                  )}
                </button>

                <label
                  htmlFor="logoUploadHeader"
                  className={`text-xs font-semibold hover:underline cursor-pointer flex items-center gap-1 ml-1 ${
                    activeDark ? "text-blue-400" : "text-[#4318FF]"
                  }`}
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

            {/* Banner Tombol Aksi: Ambil Detail Pesanan dari Reservasi Klien */}
            <div
              className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                activeDark
                  ? "bg-[#25262B] border-white/10"
                  : "bg-[#F4F7FE] border-[#E0E5F2]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4318FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <span className={activeDark ? "text-white" : "text-[#1B2559]"}>
                      Ambil Detail Pesanan dari Reservasi Klien
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      activeDark ? "bg-[#4318FF]/20 text-[#6AD2FF]" : "bg-white text-[#4318FF] border border-[#E0E5F2]"
                    }`}>
                      {activeBookings.length} Tersedia
                    </span>
                  </h4>
                  <p className={`text-[11px] ${activeDark ? "text-slate-400" : "text-[#707EAE]"}`}>
                    Otomatis mengisi nama, nomor WhatsApp, tanggal, venue, paket, &amp; harga pesanan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBookingPickerOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4318FF] hover:bg-[#3311DB] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4318FF]/20 shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Pilih dari Reservasi Klien</span>
              </button>
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
            className={`p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4 transition-colors duration-200 ${
              activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              activeDark ? "border-white/10" : "border-[#E0E5F2]"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  activeDark ? "bg-[#4318FF]/20 text-[#6AD2FF]" : "bg-[#F4F7FE] text-[#4318FF]"
                }`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                    Pilihan Paket Photobooth &amp; Add-on
                  </h3>
                  <p className={`text-[11px] ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                    Rincian layanan utama, jam operasional, dan add-on event
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeDark
                    ? "bg-[#4318FF]/20 hover:bg-[#4318FF]/30 text-[#6AD2FF] border-[#4318FF]/40"
                    : "bg-[#F4F7FE] hover:bg-[#E0E5F2] text-[#4318FF] border-[#E0E5F2]"
                }`}
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
            className={`p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4 transition-colors duration-200 ${
              activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
            }`}
          >
            <div className={`flex items-center gap-2.5 border-b pb-3 ${
              activeDark ? "border-white/10" : "border-[#E0E5F2]"
            }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                activeDark ? "bg-[#FFB547]/20 text-[#FFB547]" : "bg-[#FFF6E9] text-[#FFB547]"
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" y1="22" x2="22" y2="10" />
                </svg>
              </div>
              <div>
                <h3 className={`text-sm font-bold ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                  Status DP &amp; Rekening Pembayaran
                </h3>
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
                  <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                  <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                  <option value="Transfer Bank BNI">Transfer Bank BNI</option>
                  <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                  <option value="QRIS All Payment / E-Wallet">QRIS All Payment</option>
                  <option value="Tunai / Cash On Location">Tunai di Lokasi (Cash)</option>
                  <option value="Link Pembayaran Online">Link Pembayaran Online</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${activeDark ? "text-slate-400" : "text-[#707EAE]"
                  }`}>
                  Status Pembayaran
                </label>
                <select
                  value={paymentStatus.includes("DP") ? "DP (Booking Slot)" : paymentStatus}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentStatus(val);
                    if (val.includes("DP") && dpAmount === 0) {
                      setDpAmount(Math.round(grandTotal * 0.5));
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-hidden cursor-pointer ${activeDark
                    ? "bg-[#25262B] border-white/10 text-white focus:border-[#4318FF]"
                    : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] focus:border-[#4318FF]"
                    }`}
                >
                  <option value="Belum Dibayar">Belum Dibayar (Unpaid)</option>
                  <option value="DP (Booking Slot)">DP (Booking Slot)</option>
                  <option value="Lunas">Lunas (Paid in Full)</option>
                </select>
              </div>

              {/* Form Input Nominal DP (Muncul Dinamis Saat Status DP Dipilih) */}
              {paymentStatus.includes("DP") && (
                <div
                  className={`sm:col-span-2 p-4 rounded-xl border space-y-2.5 transition-all animate-in fade-in slide-in-from-top-1 duration-200 ${
                    activeDark
                      ? "bg-[#FFB547]/10 border-[#FFB547]/30 text-white"
                      : "bg-[#FFF6E9] border-[#FFB547]/40 text-[#1B2559]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                      activeDark ? "text-[#FFB547]" : "text-amber-800"
                    }`}>
                      Jumlah Nominal DP / Uang Muka *
                    </label>
                    <span className={`text-[11px] font-semibold ${activeDark ? "text-slate-300" : "text-[#707EAE]"}`}>
                      Sisa Pelunasan:{" "}
                      <strong className={activeDark ? "text-amber-300" : "text-amber-700"}>
                        {formatRupiah(Math.max(0, grandTotal - (dpAmount || 0)))}
                      </strong>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={dpAmount || ""}
                      onChange={(e) => setDpAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Contoh: 1000000"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-bold font-mono outline-hidden transition-all ${
                        activeDark
                          ? "bg-[#25262B] border-white/10 text-white focus:border-[#FFB547]"
                          : "bg-white border-[#E0E5F2] text-[#1B2559] focus:border-[#FFB547]"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className={`text-[10px] font-medium ${activeDark ? "text-slate-400" : "text-[#707EAE]"}`}>
                      Preset Cepat:
                    </span>
                    <button
                      type="button"
                      onClick={() => setDpAmount(Math.round(grandTotal * 0.3))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        activeDark
                          ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                          : "bg-white border-[#E0E5F2] hover:bg-slate-100 text-[#1B2559]"
                      }`}
                    >
                      30% ({formatRupiah(Math.round(grandTotal * 0.3))})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDpAmount(Math.round(grandTotal * 0.5))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        activeDark
                          ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                          : "bg-white border-[#E0E5F2] hover:bg-slate-100 text-[#1B2559]"
                      }`}
                    >
                      50% ({formatRupiah(Math.round(grandTotal * 0.5))})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDpAmount(grandTotal)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        activeDark
                          ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                          : "bg-white border-[#E0E5F2] hover:bg-slate-100 text-[#1B2559]"
                      }`}
                    >
                      100% (Lunas)
                    </button>
                  </div>
                </div>
              )}

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
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs flex items-center justify-center ${
                    activeDark
                      ? "text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
                      : "text-[#707EAE] hover:text-[#4318FF] bg-[#F4F7FE] hover:bg-[#E0E5F2] border-[#E0E5F2]"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
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

                {paymentStatus.includes("DP") && dpAmount > 0 && (
                  <div className={`mt-3 pt-3 border-t border-dashed space-y-1.5 text-xs ${
                    activeDark ? "border-white/10" : "border-[#E0E5F2]"
                  }`}>
                    <div className="flex justify-between items-center text-[#05CD99]">
                      <span className="font-semibold">Uang Muka (DP Dibayar):</span>
                      <span className="font-mono font-bold">- {formatRupiah(dpAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#FFB547]">
                      <span className="font-semibold">Sisa Pelunasan:</span>
                      <span className="font-mono font-black">{formatRupiah(Math.max(0, grandTotal - dpAmount))}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tombol Aksi Utama */}
            <div className="space-y-3 pt-2">
              {/* Button 1: Buka Modal Pratinjau Invoice */}
              <button
                type="button"
                onClick={() => handleOpenInvoiceModal()}
                className="w-full h-12 bg-[#4318FF] hover:bg-[#3311DB] active:scale-[0.98] text-white font-bold rounded-xl shadow-[0_8px_20px_-4px_rgba(67,24,255,0.4)] transition-all flex items-center justify-center gap-2.5 text-sm cursor-pointer"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Pratinjau &amp; Unduh Invoice (PDF)</span>
              </button>

              {/* Button 2: Kirim WA Langsung */}
              <button
                type="button"
                onClick={() => handleSendToWhatsApp()}
                className="w-full h-11 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold rounded-xl shadow-[0_8px_20px_-4px_rgba(37,211,102,0.3)] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.26c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.49c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z" />
                </svg>
                <span>Kirim Penawaran via WhatsApp</span>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>Salin Teks Format WhatsApp</span>
              </button>
            </div>

            <div className={`border-t pt-3 text-center ${activeDark ? "border-white/10" : "border-[#E0E5F2]"}`}>
              <p className={`text-[11px] inline-flex items-center justify-center gap-1.5 ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4318FF] shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Format penawaran otomatis ramah WhatsApp &amp; siap unduh PDF invoice.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ─── KONTEN TAB 2: ARSIP & PEMBUKUAN INVOICE ─── */}
      {activeInvoiceTab === "archive" && (
        <div className="space-y-6">
          {/* ── 1. KPI Cards Pembukuan Arsip ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card Total Diterbitkan */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-colors shadow-xs ${
                activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${activeDark ? "text-slate-400" : "text-[#707EAE]"}`}>
                  Total Invoice Terbit
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  activeDark ? "bg-[#4318FF]/20 text-[#6AD2FF]" : "bg-[#F4F7FE] text-[#4318FF]"
                }`}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <h3 className={`text-xl sm:text-2xl font-black font-mono ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                  {formatRupiah(archives.reduce((acc, a) => acc + (a.grandTotal || 0), 0))}
                </h3>
              </div>
              <p className={`mt-1 text-xs ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                Dari total <strong>{archives.length} surat invoice</strong> tercatat
              </p>
            </div>

            {/* Card Pembayaran Lunas */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-colors shadow-xs ${
                activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${activeDark ? "text-slate-400" : "text-[#707EAE]"}`}>
                  Pembayaran Lunas
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  activeDark ? "bg-emerald-500/20 text-[#05CD99]" : "bg-[#E6F9F0] text-[#05CD99]"
                }`}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-black font-mono text-[#05CD99]">
                  {formatRupiah(
                    archives
                      .filter((a) => a.paymentStatus === "Lunas")
                      .reduce((acc, a) => acc + (a.grandTotal || 0), 0)
                  )}
                </h3>
              </div>
              <p className={`mt-1 text-xs ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                Total <strong>{archives.filter((a) => a.paymentStatus === "Lunas").length} transaksi</strong> telah lunas
              </p>
            </div>

            {/* Card Piutang / Pending */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-colors shadow-xs ${
                activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${activeDark ? "text-slate-400" : "text-[#707EAE]"}`}>
                  Piutang / Belum Lunas
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  activeDark ? "bg-amber-500/20 text-[#FFB547]" : "bg-[#FFF6E9] text-[#FFB547]"
                }`}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-black font-mono text-[#FFB547]">
                  {formatRupiah(
                    archives
                      .filter((a) => a.paymentStatus !== "Lunas")
                      .reduce((acc, a) => acc + Math.max(0, (a.grandTotal || 0) - (a.paymentStatus.includes("DP") ? (a.dpAmount || 0) : 0)), 0)
                  )}
                </h3>
              </div>
              <p className={`mt-1 text-xs ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                Total <strong>{archives.filter((a) => a.paymentStatus !== "Lunas").length} invoice</strong> berstatus DP / Belum Bayar
              </p>
            </div>
          </div>

          {/* ── 2. Toolbar Pencarian & Filter Status ── */}
          <div
            className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs ${
              activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
            }`}
          >
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                placeholder="Cari nomor invoice, nama klien, atau WhatsApp..."
                className={`w-full pl-9 pr-8 py-2 rounded-xl border text-xs outline-hidden transition-all ${
                  activeDark
                    ? "bg-[#25262B] border-white/10 text-white placeholder-slate-500 focus:border-[#4318FF]"
                    : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] placeholder-[#A3AED0] focus:border-[#4318FF]"
                }`}
              />
              {archiveSearch && (
                <button
                  type="button"
                  onClick={() => setArchiveSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Status Pills & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Pills */}
              <div
                className={`p-1 rounded-xl border flex items-center gap-1 ${
                  activeDark ? "bg-[#25262B] border-white/10" : "bg-[#F4F7FE] border-[#E0E5F2]"
                }`}
              >
                {(
                  [
                    { id: "all", label: "Semua" },
                    { id: "Lunas", label: "Lunas" },
                    { id: "DP", label: "DP" },
                    { id: "Belum Dibayar", label: "Belum Bayar" },
                  ] as const
                ).map((st) => {
                  const isSelected =
                    st.id === "DP"
                      ? archiveStatusFilter === "DP" || archiveStatusFilter.includes("DP")
                      : archiveStatusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setArchiveStatusFilter(st.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#4318FF] text-white shadow-xs"
                          : activeDark
                          ? "text-slate-400 hover:text-white"
                          : "text-[#707EAE] hover:text-[#1B2559]"
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>

              {/* Export Rekap CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className={`h-9 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
                    : "bg-white hover:bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559]"
                }`}
                title="Ekspor Rekap Pembukuan ke File CSV (Excel)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export CSV</span>
              </button>

              {/* Kosongkan Arsip (jika ada data) */}
              {archives.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllArchives}
                  className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeDark
                      ? "bg-rose-950/20 hover:bg-rose-900/40 border-rose-900/40 text-rose-300"
                      : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600"
                  }`}
                  title="Hapus Semua Data Arsip Pembukuan"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Kosongkan Arsip</span>
                </button>
              )}

              {/* Buat Invoice Baru */}
              <button
                type="button"
                onClick={() => setActiveInvoiceTab("generator")}
                className="h-9 px-3.5 rounded-xl bg-[#4318FF] hover:bg-[#3311DB] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-[#4318FF]/20 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Buat Invoice Baru</span>
              </button>
            </div>
          </div>

          {/* ── 3. Tabel Daftar Arsip Invoice ── */}
          <div
            className={`rounded-2xl border shadow-xs overflow-hidden transition-colors ${
              activeDark ? "bg-[#1A1B20] border-white/10" : "bg-white border-[#E0E5F2]"
            }`}
          >
            {(() => {
              const filteredArchives = archives.filter((a) => {
                if (archiveStatusFilter === "DP") {
                  if (!a.paymentStatus.includes("DP")) return false;
                } else if (archiveStatusFilter !== "all" && a.paymentStatus !== archiveStatusFilter) {
                  return false;
                }
                if (archiveSearch.trim()) {
                  const q = archiveSearch.toLowerCase();
                  const matchNo = a.invoiceNumber.toLowerCase().includes(q);
                  const matchName = a.customerName.toLowerCase().includes(q);
                  const matchPhone = (a.customerPhone || "").toLowerCase().includes(q);
                  const matchItems = a.items.some(
                    (i) => i.name.toLowerCase().includes(q) || (i.customName && i.customName.toLowerCase().includes(q))
                  );
                  return matchNo || matchName || matchPhone || matchItems;
                }
                return true;
              });

              if (filteredArchives.length === 0) {
                return (
                  <div className="py-16 px-4 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center mx-auto">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <h4 className={`text-base font-bold ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                      Tidak Ada Invoice Ditemukan
                    </h4>
                    <p className={`text-xs max-w-sm mx-auto ${activeDark ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                      {archiveSearch
                        ? "Tidak ada invoice yang cocok dengan kata kunci pencarian Anda."
                        : "Belum ada invoice yang diarsipkan. Terbitkan invoice pertama Anda melalui menu Kasir."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveInvoiceTab("generator")}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#4318FF] hover:bg-[#3311DB] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Terbitkan Invoice Sekarang</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr
                        className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                          activeDark
                            ? "bg-white/5 border-white/10 text-slate-300"
                            : "bg-[#F4F7FE]/70 border-[#E0E5F2] text-[#707EAE]"
                        }`}
                      >
                        <th className="py-3 px-4">No. Invoice &amp; Tanggal</th>
                        <th className="py-3 px-4">Klien / Event</th>
                        <th className="py-3 px-4">Jadwal Acara</th>
                        <th className="py-3 px-4">Paket Layanan</th>
                        <th className="py-3 px-4 text-right">Total Biaya</th>
                        <th className="py-3 px-4 text-center">Status Pembayaran</th>
                        <th className="py-3 px-4 text-center min-w-[340px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${activeDark ? "divide-white/5" : "divide-slate-100"}`}>
                      {filteredArchives.map((arch) => (
                        <tr
                          key={arch.id}
                          className={`transition-colors ${
                            activeDark ? "hover:bg-white/[0.02]" : "hover:bg-[#F4F7FE]/40"
                          }`}
                        >
                          {/* No Invoice */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#4318FF]/10 text-[#4318FF] border border-[#4318FF]/20 inline-block">
                              {arch.invoiceNumber}
                            </span>
                            <span className={`block mt-1 text-[10px] ${activeDark ? "text-slate-500" : "text-slate-400"}`}>
                              {new Date(arch.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>

                          {/* Klien / Event */}
                          <td className="py-3.5 px-4">
                            <p className={`font-bold text-sm ${activeDark ? "text-white" : "text-slate-900"}`}>
                              {arch.customerName}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px]">
                              {arch.customerPhone && (
                                <span className={`inline-flex items-center gap-1 ${activeDark ? "text-slate-400" : "text-slate-600"}`}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                                    <path d="M12 18h.01" />
                                  </svg>
                                  {arch.customerPhone}
                                </span>
                              )}
                              {arch.customerAddress && (
                                <span className={`inline-flex items-center gap-1 ${activeDark ? "text-slate-400" : "text-slate-500"}`}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  {arch.customerAddress}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Jadwal Acara */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`font-semibold block ${activeDark ? "text-slate-200" : "text-slate-800"}`}>
                              {arch.eventDate}
                            </span>
                            <span className="text-[11px] text-[#4318FF] font-medium inline-flex items-center gap-1 mt-0.5">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {arch.eventTime}
                            </span>
                          </td>

                          {/* Layanan */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className={`font-medium truncate ${activeDark ? "text-slate-300" : "text-slate-700"}`} title={arch.items.map((it) => it.name).join(", ")}>
                              {arch.items[0]?.name || "-"}
                            </p>
                            {arch.items.length > 1 && (
                              <span className="text-[10px] text-[#4318FF] font-semibold">
                                +{arch.items.length - 1} layanan lainnya
                              </span>
                            )}
                          </td>

                          {/* Total Biaya */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <span className={`font-mono font-black text-sm ${activeDark ? "text-white" : "text-slate-900"}`}>
                              {formatRupiah(arch.grandTotal)}
                            </span>
                            {arch.paymentStatus.includes("DP") && (arch.dpAmount || 0) > 0 && (
                              <div className="text-[10px] space-y-0.5 mt-0.5 font-mono">
                                <span className="text-[#05CD99] font-bold block">
                                  DP: {formatRupiah(arch.dpAmount!)}
                                </span>
                                <span className="text-[#FFB547] font-semibold block">
                                  Sisa: {formatRupiah(Math.max(0, arch.grandTotal - arch.dpAmount!))}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Status Pembayaran (Interaktif) */}
                          <td className="py-3.5 px-4 text-center">
                            <select
                              value={arch.paymentStatus.includes("DP") ? "DP (Booking Slot)" : arch.paymentStatus}
                              onChange={(e) => handleUpdateArchiveStatus(arch.id, e.target.value as any)}
                              className={`font-bold text-[11px] px-2.5 py-1 rounded-lg border outline-hidden cursor-pointer uppercase tracking-wider ${
                                arch.paymentStatus.includes("Lunas")
                                  ? (activeDark
                                      ? "bg-emerald-950/50 text-[#05CD99] border-emerald-800/60"
                                      : "bg-[#E6F9F0] text-[#05CD99] border-[#05CD99]/30")
                                  : arch.paymentStatus.includes("DP")
                                  ? (activeDark
                                      ? "bg-amber-950/50 text-[#FFB547] border-amber-800/60"
                                      : "bg-[#FFF6E9] text-[#FFB547] border-[#FFB547]/30")
                                  : (activeDark
                                      ? "bg-rose-950/50 text-[#EE5D50] border-rose-800/60"
                                      : "bg-[#FEEFEE] text-[#EE5D50] border-[#EE5D50]/30")
                              }`}
                            >
                              <option value="Belum Dibayar">Belum Dibayar</option>
                              <option value="DP (Booking Slot)">DP (Booking Slot)</option>
                              <option value="Lunas">Lunas</option>
                            </select>
                          </td>

                          {/* Aksi (Icon + Teks Profesional) */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Detail / Preview */}
                              <button
                                type="button"
                                onClick={() => handleOpenInvoiceModal(arch)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                  activeDark
                                    ? "bg-white/5 hover:bg-[#4318FF] hover:border-[#4318FF] text-slate-200 hover:text-white border-white/10"
                                    : "bg-[#F4F7FE] hover:bg-[#4318FF] hover:border-[#4318FF] text-[#1B2559] hover:text-white border-[#E0E5F2]"
                                }`}
                                title="Lihat Detail & Pratinjau Invoice Resmi"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span>Detail</span>
                              </button>

                              {/* Download PDF */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedArchiveDetail(arch);
                                  setIsModalOpen(true);
                                  setTimeout(() => handleDownloadPDF(), 350);
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                  activeDark
                                    ? "bg-[#4318FF]/15 hover:bg-[#4318FF] text-[#6AD2FF] hover:text-white border-[#4318FF]/30 hover:border-[#4318FF]"
                                    : "bg-[#F4F7FE] hover:bg-[#4318FF] text-[#4318FF] hover:text-white border-[#E0E5F2] hover:border-[#4318FF]"
                                }`}
                                title="Download File PDF (1 Lembar A4)"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span>PDF</span>
                              </button>

                              {/* WhatsApp */}
                              <button
                                type="button"
                                onClick={() => handleSendToWhatsApp(arch)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                  activeDark
                                    ? "bg-emerald-950/30 hover:bg-[#25D366] text-[#05CD99] hover:text-white border-emerald-800/40 hover:border-[#25D366]"
                                    : "bg-[#E6F9F0] hover:bg-[#25D366] text-[#05CD99] hover:text-white border-[#05CD99]/20 hover:border-[#25D366]"
                                }`}
                                title="Kirim ke WhatsApp Klien"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.26c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.49c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z" />
                                </svg>
                                <span>WhatsApp</span>
                              </button>

                              {/* Load / Edit in Generator */}
                              <button
                                type="button"
                                onClick={() => handleLoadArchiveToGenerator(arch)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                  activeDark
                                    ? "bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border-white/10"
                                    : "bg-white hover:bg-[#F4F7FE] text-[#707EAE] hover:text-[#1B2559] border-[#E0E5F2]"
                                }`}
                                title="Muat Data ke Form Kasir (Edit/Duplikat)"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                </svg>
                                <span>Edit</span>
                              </button>

                              {/* Hapus */}
                              <button
                                type="button"
                                onClick={() => handleDeleteArchive(arch.id, arch.invoiceNumber)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                  activeDark
                                    ? "bg-rose-950/20 hover:bg-[#EE5D50] text-rose-300 hover:text-white border-rose-900/40 hover:border-[#EE5D50]"
                                    : "bg-[#FEEFEE] hover:bg-[#EE5D50] text-[#EE5D50] hover:text-white border-[#EE5D50]/20 hover:border-[#EE5D50]"
                                }`}
                                title="Hapus dari Buku Arsip"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                <span>Hapus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─── MODAL PILIH RESERVASI KLIEN ─── */}
      {isBookingPickerOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBookingPickerOpen(false);
          }}
          className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            className={`w-full max-w-3xl my-auto rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors ${
              activeDark
                ? "bg-[#1A1B20] text-white border-white/10"
                : "bg-white text-[#1B2559] border-[#E0E5F2] shadow-[0_20px_60px_rgba(67,24,255,0.12)]"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between px-6 py-4.5 border-b shrink-0 ${
                activeDark ? "bg-[#25262B] border-white/10" : "bg-white border-[#E0E5F2]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeDark ? "bg-[#4318FF]/20 text-[#6AD2FF]" : "bg-[#F4F7FE] text-[#4318FF]"
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1 2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-base font-extrabold tracking-tight ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                    Ambil Detail Pesanan dari Reservasi Klien
                  </h3>
                  <p className={`text-xs ${activeDark ? "text-slate-400" : "text-[#707EAE]"}`}>
                    Pilih pesanan klien dari dashboard untuk mengisi otomatis formulir invoice
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingPickerOpen(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer text-sm font-bold ${
                  activeDark
                    ? "text-slate-400 hover:text-white hover:bg-white/10"
                    : "text-[#A3AED0] hover:text-[#1B2559] hover:bg-[#F4F7FE]"
                }`}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div
              className={`p-4 sm:p-5 border-b space-y-3 shrink-0 ${
                activeDark ? "bg-[#1A1B20] border-white/10" : "bg-[#FAFCFF] border-[#E0E5F2]"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3AED0]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    placeholder="Cari nama klien, nomor HP / WA, venue, atau paket..."
                    className={`w-full pl-10 pr-8 py-2.5 rounded-xl border text-xs sm:text-sm outline-hidden transition-all ${
                      activeDark
                        ? "bg-[#25262B] border-white/10 text-white placeholder-slate-500 focus:border-[#4318FF]"
                        : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] placeholder-[#A3AED0] focus:border-[#4318FF] focus:bg-white focus:ring-2 focus:ring-[#4318FF]/10"
                    }`}
                  />
                  {bookingSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBookingSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A3AED0] hover:text-[#1B2559] text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isLoadingBookings}
                  onClick={fetchBookings}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50 ${
                    activeDark
                      ? "bg-[#25262B] border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                      : "bg-white hover:bg-[#F4F7FE] border-[#E0E5F2] text-[#707EAE] hover:text-[#4318FF]"
                  }`}
                  title="Segarkan data dari server"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className={isLoadingBookings ? "animate-spin" : ""}
                  >
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setBookingCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    bookingCategoryFilter === "all"
                      ? "bg-[#4318FF] text-white font-bold shadow-md shadow-[#4318FF]/20"
                      : activeDark
                      ? "bg-[#25262B] text-slate-400 hover:text-white font-semibold"
                      : "bg-white hover:bg-[#F4F7FE] border border-[#E0E5F2] text-[#707EAE] hover:text-[#4318FF] font-semibold"
                  }`}
                >
                  Semua ({activeBookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingCategoryFilter("photobooth")}
                  className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    bookingCategoryFilter === "photobooth"
                      ? "bg-[#4318FF] text-white font-bold shadow-md shadow-[#4318FF]/20"
                      : activeDark
                      ? "bg-[#25262B] text-slate-400 hover:text-white font-semibold"
                      : "bg-white hover:bg-[#F4F7FE] border border-[#E0E5F2] text-[#707EAE] hover:text-[#4318FF] font-semibold"
                  }`}
                >
                  Photobooth Fisik ({activeBookings.filter((b) => (b.category || b.booking_category) === "photobooth").length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingCategoryFilter("virtual_photobooth")}
                  className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    bookingCategoryFilter === "virtual_photobooth"
                      ? "bg-[#4318FF] text-white font-bold shadow-md shadow-[#4318FF]/20"
                      : activeDark
                      ? "bg-[#25262B] text-slate-400 hover:text-white font-semibold"
                      : "bg-white hover:bg-[#F4F7FE] border border-[#E0E5F2] text-[#707EAE] hover:text-[#4318FF] font-semibold"
                  }`}
                >
                  Virtual Photobooth ({activeBookings.filter((b) => (b.category || b.booking_category) !== "photobooth").length})
                </button>
              </div>
            </div>

            {/* List Reservasi (Scrollable) */}
            <div
              className={`p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 ${
                activeDark ? "bg-[#1A1B20]" : "bg-white"
              }`}
            >
              {filteredBookings.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div
                    className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                      activeDark ? "bg-[#25262B] text-slate-400" : "bg-[#F4F7FE] text-[#4318FF]"
                    }`}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm sm:text-base font-extrabold ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                      {bookingSearchQuery ? "Tidak Ditemukan Data Reservasi" : "Belum Ada Data Reservasi Klien"}
                    </h4>
                    <p className={`text-xs max-w-sm mx-auto leading-relaxed ${activeDark ? "text-slate-400" : "text-[#707EAE]"}`}>
                      {bookingSearchQuery
                        ? `Tidak ada pesanan yang sesuai dengan kata kunci "${bookingSearchQuery}".`
                        : "Data calon pelanggan dari formulir pemesanan online dashboard akan otomatis tampil di sini."}
                    </p>
                  </div>
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const isPhysical = (b.category || b.booking_category) === "photobooth";
                  const eventDateStr = b.event_date
                    ? new Date(b.event_date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";

                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        activeDark
                          ? "bg-[#25262B] border-white/10 hover:border-[#4318FF]/40"
                          : "bg-white hover:bg-[#F8FAFC] border-[#E0E5F2] hover:border-[#4318FF]/40 shadow-xs hover:shadow-md"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-extrabold text-sm sm:text-base truncate ${activeDark ? "text-white" : "text-[#1B2559]"}`}>
                            {b.customer_name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isPhysical
                                ? activeDark
                                  ? "bg-purple-950/40 text-purple-300 border-purple-800"
                                  : "bg-[#F4F7FE] text-[#4318FF] border-[#E0E5F2]"
                                : activeDark
                                ? "bg-blue-950/40 text-blue-300 border-blue-800"
                                : "bg-[#E8F1FF] text-[#2B77FB] border-[#D0E2FF]"
                            }`}
                          >
                            {isPhysical ? "Photobooth Fisik" : "Virtual Photobooth"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              b.status === "confirmed"
                                ? "bg-[#E6F9F0] text-[#05CD99]"
                                : b.status === "cancelled"
                                ? "bg-[#FEEFEE] text-[#EE5D50]"
                                : "bg-[#FFF6E9] text-[#FFB547]"
                            }`}
                          >
                            {b.status === "confirmed" ? "Terkonfirmasi" : b.status === "cancelled" ? "Batal" : "Pending"}
                          </span>
                        </div>

                        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${activeDark ? "text-slate-400" : "text-[#707EAE]"}`}>
                          {b.customer_phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              {b.customer_phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {eventDateStr} {b.event_time ? `• ${b.event_time}` : ""}
                          </span>
                          {(b.location || b.city) && (
                            <span className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {[b.location, b.city].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <span className={`text-xs font-semibold ${activeDark ? "text-slate-200" : "text-[#1B2559]"}`}>
                            {b.package_name || "Paket Photobooth Reservasi"}
                          </span>
                          <span className={`text-xs font-black ${activeDark ? "text-[#6AD2FF]" : "text-[#4318FF]"}`}>
                            {formatRupiah(b.total_price || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleSelectBooking(b)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4318FF] hover:bg-[#3311DB] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#4318FF]/25 cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Gunakan Data Ini</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`px-6 py-4 border-t flex items-center justify-between text-xs shrink-0 ${
                activeDark ? "bg-[#25262B] border-white/10" : "bg-[#FAFCFF] border-[#E0E5F2]"
              }`}
            >
              <span className={activeDark ? "text-slate-400" : "text-[#707EAE]"}>
                Menampilkan <strong>{filteredBookings.length}</strong> dari {activeBookings.length} reservasi
              </span>
              <button
                type="button"
                onClick={() => setIsBookingPickerOpen(false)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  activeDark
                    ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                    : "bg-white hover:bg-[#F4F7FE] text-[#707EAE] hover:text-[#1B2559] border-[#E0E5F2]"
                }`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL PRATINJAU INVOICE / DOWNLOAD PDF ─── */}
      {isModalOpen && (
        <div id="printableInvoiceModalOverlay" className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div id="printableInvoiceModalCard" className="bg-white text-[#1B2559] rounded-3xl shadow-2xl max-w-2xl w-full my-auto border border-[#E0E5F2] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Top Chrome (Non-print) - Berisi Judul & Tombol Close yang Terisolasi, Anti-Overlap */}
            <div className="no-print flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-[#E0E5F2] bg-[#FAFCFF] shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4318FF]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B2559]">
                  {modalInvoiceData.isArchived ? "Detail Arsip Invoice Resmi" : "Pratinjau & Unduh Invoice Resmi"}
                </h4>
                {modalInvoiceData.isArchived && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#05CD99] border border-[#05CD99]/30">
                    ✓ Terdaftar di Arsip
                  </span>
                )}
              </div>
              {modalInvoiceData.isArchived && (
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full text-[#707EAE] hover:text-[#1B2559] hover:bg-[#F4F7FE] flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                  title="Tutup Modal"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Template Invoice Lengkap (Yang di-render ke Canvas / PDF & Print) - Dioptimasi Pas 1 Lembar */}
            <div id="printableInvoice" className="p-5 sm:p-6 bg-white space-y-3.5">
              {/* Header Modal */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E0E5F2] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#4318FF] overflow-hidden flex items-center justify-center text-white shadow-xs border border-[#E0E5F2] shrink-0">
                    {customLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/logo-ruangtemu.jpg" alt="RUANGTEMU" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#1B2559] leading-tight">
                      INVOICE PHOTOBOOTH
                    </h2>
                    <span className="inline-block mt-0.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#4318FF]/10 text-[#4318FF] border border-[#4318FF]/20">
                      {modalInvoiceData.invNumber}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <h3 className="font-extrabold text-[#1B2559] text-sm tracking-tight">RUANGTEMU</h3>
                  <p className="text-[11px] text-[#707EAE]">Jl. Anggrek Blok EE No. 24 Kota Palopo</p>
                </div>
              </div>

              {/* Info Pelanggan & Tanggal (Dua Card Bersih Berdampingan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Info Klien */}
                <div className="p-3.5 rounded-xl bg-[#FAFCFF] border border-[#E0E5F2] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3AED0] block mb-0.5">
                    Tagihan Kepada (Klien / Event):
                  </span>
                  <p className="font-extrabold text-[#1B2559] text-sm leading-snug">{modalInvoiceData.custName || "-"}</p>
                  {modalInvoiceData.custPhone && <p className="text-[#707EAE] font-mono text-[11px]">📱 WhatsApp: {modalInvoiceData.custPhone}</p>}
                  {modalInvoiceData.custInstagram && <p className="text-[#707EAE] text-[11px]">📷 Instagram: @{modalInvoiceData.custInstagram.replace(/^@/, "")}</p>}
                  {modalInvoiceData.custAddress && <p className="text-[#707EAE] text-[11px]">📍 Venue: {modalInvoiceData.custAddress}</p>}
                </div>

                {/* Info Jadwal & Pembayaran */}
                <div className="p-3.5 rounded-xl bg-[#FAFCFF] border border-[#E0E5F2] space-y-1.5 text-right">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#707EAE]">Tanggal Invoice:</span>
                    <span className="font-medium text-[#1B2559]">
                      {new Date(modalInvoiceData.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#707EAE]">Tanggal Acara:</span>
                    <span className="font-bold text-[#1B2559]">{modalInvoiceData.formattedEventDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#707EAE]">Jam Mulai:</span>
                    <span className="font-bold text-[#4318FF]">{modalInvoiceData.formattedEventTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#707EAE] shrink-0">Metode Bayar:</span>
                    <span className="font-semibold text-[#1B2559] truncate max-w-[170px] sm:max-w-none">
                      {cleanPaymentMethod(modalInvoiceData.paymentMethod)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-2 border-t border-[#E0E5F2]/60 mt-1.5">
                    <span className="text-[#707EAE] font-semibold whitespace-nowrap shrink-0">Status Pembayaran:</span>
                    <span
                      className={`font-bold uppercase px-3 py-1 rounded-lg text-[10px] tracking-wider inline-block text-center shadow-2xs ${modalInvoiceData.paymentStatus.includes("Lunas")
                        ? "bg-[#E6F9F0] text-[#05CD99] border border-[#05CD99]/40"
                        : modalInvoiceData.paymentStatus.includes("DP")
                          ? "bg-[#FFF6E9] text-[#B95000] border border-[#FFB547]/40"
                          : "bg-[#FEEFEE] text-[#EE5D50] border border-[#EE5D50]/40"
                        }`}
                    >
                      {modalInvoiceData.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Items */}
              <div className="overflow-x-auto rounded-xl border border-[#E0E5F2]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E0E5F2] bg-[#F4F7FE] text-[#707EAE] font-extrabold text-[11px] uppercase tracking-wider">
                      <th className="py-2 px-3 text-center w-10">No</th>
                      <th className="py-2 px-3">Paket / Layanan Photobooth</th>
                      <th className="py-2 px-3 text-center w-24">Durasi/Qty</th>
                      <th className="py-2 px-3 text-right w-28">Harga</th>
                      <th className="py-2 px-3 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E5F2]/60">
                    {modalInvoiceData.items.map((item, idx) => {
                      const displayName =
                        item.name === "Custom Paket Photobooth"
                          ? item.customName || "Custom Paket Photobooth"
                          : item.name;
                      return (
                        <tr key={item.id} className="hover:bg-[#F4F7FE]/50 transition-colors">
                          <td className="py-2 px-3 text-center text-[#707EAE] font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-[#1B2559]">{displayName}</td>
                          <td className="py-2 px-3 text-center text-[#707EAE] font-medium">{item.qty}</td>
                          <td className="py-2 px-3 text-right text-[#707EAE] font-mono">{formatRupiah(item.price)}</td>
                          <td className="py-2 px-3 text-right font-bold text-[#1B2559] font-mono">
                            {formatRupiah(item.qty * item.price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Ringkasan Hitungan Modal */}
              <div className="flex justify-end pt-0.5">
                <div className="w-full sm:w-72 space-y-1 text-xs">
                  <div className="flex justify-between text-[#707EAE]">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-[#1B2559] font-mono">{formatRupiah(modalInvoiceData.subtotal)}</span>
                  </div>
                  {modalInvoiceData.discount > 0 && (
                    <div className="flex justify-between text-[#707EAE]">
                      <span>Diskon / Potongan:</span>
                      <span className="font-semibold text-[#EE5D50] font-mono">- {formatRupiah(modalInvoiceData.discount)}</span>
                    </div>
                  )}
                  {modalInvoiceData.taxAmount > 0 && (
                    <div className="flex justify-between text-[#707EAE]">
                      <span>Pajak / Service Fee ({modalInvoiceData.taxPercent}%):</span>
                      <span className="font-semibold text-[#1B2559] font-mono">+ {formatRupiah(modalInvoiceData.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline text-sm font-extrabold text-[#1B2559] border-t-2 border-[#E0E5F2] pt-1.5">
                    <span>Total Pembayaran:</span>
                    <span className="text-[#4318FF] text-base font-black font-mono">{formatRupiah(modalInvoiceData.grandTotal)}</span>
                  </div>

                  {modalInvoiceData.paymentStatus.includes("DP") && (modalInvoiceData.dpAmount || 0) > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed border-[#E0E5F2] space-y-1">
                      <div className="flex justify-between items-center text-[#05CD99] font-semibold">
                        <span>Uang Muka (DP Dibayar):</span>
                        <span className="font-mono font-bold">- {formatRupiah(modalInvoiceData.dpAmount!)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#FFF6E9] text-[#B95000] border border-[#FFB547]/40 px-2.5 py-1.5 rounded-lg font-bold">
                        <span>Sisa Pelunasan:</span>
                        <span className="font-mono font-black text-sm text-[#B95000]">
                          {formatRupiah(Math.max(0, modalInvoiceData.grandTotal - modalInvoiceData.dpAmount!))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Note */}
              <div className="border-t border-[#E0E5F2] pt-2.5 text-center text-[11px] text-[#707EAE] space-y-0.5">
                <p className="font-medium text-[#707EAE]">
                  Terima kasih telah mempercayakan momen spesial Anda kepada RUANGTEMU! 📸✨
                </p>
                {modalInvoiceData.paymentLink && (
                  <p className="font-mono text-[10px] text-[#4318FF] break-all">
                    Link Pembayaran: {modalInvoiceData.paymentLink}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Action Footer (Hidden on Print) */}
            <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-5 sm:px-6 py-4 border-t border-[#E0E5F2] bg-[#FAFCFF] shrink-0">
              <div className="flex items-center gap-2">
                {!modalInvoiceData.isArchived ? (
                  <button
                    type="button"
                    onClick={handleCreateAndArchiveInvoice}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-[#4318FF] hover:bg-[#3311DB] rounded-xl transition-all shadow-md shadow-[#4318FF]/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8" />
                      <rect width="22" height="5" x="1" y="3" rx="1" />
                      <line x1="10" y1="12" x2="14" y2="12" />
                    </svg>
                    <span>Simpan ke Buku Arsip dan Tutup</span>
                  </button>
                ) : (
                  modalInvoiceData.archiveId && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#707EAE] font-medium">Status:</span>
                      <select
                        value={modalInvoiceData.paymentStatus.includes("DP") ? "DP (Booking Slot)" : modalInvoiceData.paymentStatus}
                        onChange={(e) => handleUpdateArchiveStatus(modalInvoiceData.archiveId!, e.target.value as any)}
                        className="text-xs font-bold px-2 py-1 rounded-lg border border-[#E0E5F2] bg-white text-[#1B2559] outline-hidden cursor-pointer"
                      >
                        <option value="Belum Dibayar">Belum Dibayar</option>
                        <option value="DP (Booking Slot)">DP (Booking Slot)</option>
                        <option value="Lunas">Lunas</option>
                      </select>
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                {modalInvoiceData.isArchived && (
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 text-xs font-semibold text-[#707EAE] hover:text-[#1B2559] hover:bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                )}
                <button
                  type="button"
                  disabled={isDownloadingPDF}
                  onClick={handleDownloadPDF}
                  className="px-4 sm:px-5 py-2.5 text-xs font-bold text-[#1B2559] bg-white hover:bg-[#F4F7FE] border border-[#E0E5F2] disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDownloadingPDF ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#A3AED0] border-t-[#4318FF] rounded-full animate-spin" />
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
                  }}
                  className="px-4 sm:px-5 py-2.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.26c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.49c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z" />
                  </svg>
                  <span>Kirim via WhatsApp</span>
                </button>
              </div>
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
            height: 100% !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Sembunyikan seluruh UI latar belakang & elemen navigasi admin */
          body * {
            visibility: hidden !important;
          }
          /* Hanya tampilkan kertas invoice resmi murni */
          #printableInvoiceModalOverlay,
          #printableInvoiceModalOverlay * {
            visibility: visible !important;
          }
          #printableInvoiceModalOverlay {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: 297mm !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: center !important;
            z-index: 9999999 !important;
          }
          #printableInvoiceModalCard {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }
          #printableInvoice {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: 285mm !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 8mm 12mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
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
