"use client";

import { useEffect, useState, useId, useMemo } from "react";
import { formatRupiah, formatDate, formatTime } from "@/lib/utils";
import { EventType, Package } from "@/types";
import { DateInputDMY } from "./ui/date-input-dmy";
import { TimeInput24 } from "./ui/time-input-24";

export type BookingServiceCategory = "photobooth" | "virtual_photobooth";

export interface PackageOption {
  id: string;
  slug: string;
  name: string;
  badge?: string;
  price: number;
  price2R?: number;
  price4R?: number;
  duration: number;
  durationLabel: string;
  category: BookingServiceCategory;
  description: string;
  features?: string[];
}

export const PHOTOBOOTH_PACKAGES: PackageOption[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "paket-2-jam-photobooth",
    name: "Paket 2 Jam",
    badge: "2 Jam Layanan",
    price: 2000000,
    price2R: 2000000,
    price4R: 2500000,
    duration: 2,
    durationLabel: "2 Jam Layanan",
    category: "photobooth",
    description: "Cetak fisik unlimited di lokasi acara, custom frame, studio lighting, dan operator standby.",
    features: [
      "2 Jam Layanan Aktif di Venue",
      "Unlimited Print Foto Instan",
      "Pilihan Ukuran: 2R Strip atau 4R",
      "Custom Template Frame Sesuai Tema",
      "Studio Lighting & Kamera Profesional",
      "Download Cloud Semua Foto",
      "1 Operator & 1 Asisten Standby",
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    slug: "paket-3-jam-photobooth",
    name: "Paket 3 Jam",
    badge: "Rekomendasi (3 Jam)",
    price: 2500000,
    price2R: 2500000,
    price4R: 3000000,
    duration: 3,
    durationLabel: "3 Jam Layanan",
    category: "photobooth",
    description: "Paket terpopuler untuk resepsi pernikahan & wisuda dengan kru lengkap di lokasi.",
    features: [
      "3 Jam Layanan Penuh di Venue",
      "Unlimited Print Foto Instan",
      "Pilihan Ukuran: 2R Strip atau 4R",
      "Custom Frame Eksklusif dengan Logo Event",
      "Studio Lighting & Kamera Profesional",
      "Download Cloud Semua Foto",
      "2 Kru Profesional RUANGTEMU Standby",
    ],
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    slug: "paket-4-jam-photobooth",
    name: "Paket 4 Jam",
    badge: "4 Jam Layanan",
    price: 3000000,
    price2R: 3000000,
    price4R: 3500000,
    duration: 4,
    durationLabel: "4 Jam Layanan",
    category: "photobooth",
    description: "Durasi panjang untuk event besar, resepsi malam, & pesta wisuda meriah.",
    features: [
      "4 Jam Layanan Penuh di Venue",
      "Unlimited Print Foto Instan",
      "Pilihan Ukuran: 2R Strip atau 4R",
      "Custom Frame Eksklusif dengan Logo Event",
      "Studio Lighting & Kamera Profesional",
      "Download Cloud Semua Foto",
      "2 Kru Profesional RUANGTEMU Standby",
    ],
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    slug: "paket-5-jam-photobooth",
    name: "Paket 5 Jam",
    badge: "5 Jam Layanan",
    price: 3500000,
    price2R: 3500000,
    price4R: 4000000,
    duration: 5,
    durationLabel: "5 Jam Layanan",
    category: "photobooth",
    description: "Layanan maksimal seharian penuh tanpa khawatir kehabisan waktu sesi foto.",
    features: [
      "5 Jam Layanan Penuh di Venue",
      "Unlimited Print Foto Instan",
      "Pilihan Ukuran: 2R Strip atau 4R",
      "Custom Frame Eksklusif dengan Logo Event",
      "Studio Lighting & Kamera Profesional",
      "Download Cloud Semua Foto",
      "2 Kru Profesional RUANGTEMU Standby",
    ],
  },
];

export const VIRTUAL_PHOTOBOOTH_PACKAGES: PackageOption[] = [
  {
    id: "77777777-7777-7777-7777-777777777777",
    slug: "paket-bronze",
    name: "Paket Bronze",
    badge: "7 Hari Akses",
    price: 250000,
    duration: 168,
    durationLabel: "Akses 7 Hari",
    category: "virtual_photobooth",
    description: "Virtual Photobooth hemat: foto dan voice message ucapan, 1 desain frame kustom, scan QR langsung via HP tamu.",
    features: [
      "Foto dan voice message ucapan",
      "1 Desain Template Frame Kustom",
      "Scan QR Code Tamu Tanpa Batas",
      "Unlimited Akses QR & Foto",
      "Akses Foto 7 Hari",
      "Buku Tamu Digital",
    ],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "paket-silver",
    name: "Paket Silver",
    badge: "Rekomendasi (14 Hari)",
    price: 350000,
    duration: 336,
    durationLabel: "Akses 14 Hari",
    category: "virtual_photobooth",
    description: "Foto dan voice message, 2 desain frame kustom, scan QR langsung via HP tamu, tanpa aplikasi.",
    features: [
      "Virtual Web Photobooth via HP Tamu",
      "2 Desain Template Frame Kustom",
      "Scan QR Code Tamu Tanpa Batas",
      "Unlimited Akses QR & Foto",
      "Akses Foto 14 Hari",
      "Buku Tamu Digital & Rekam Voice Note",
    ],
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    slug: "paket-gold",
    name: "Paket Gold",
    badge: "30 Hari Akses",
    price: 450000,
    duration: 720,
    durationLabel: "Akses 30 Hari",
    category: "virtual_photobooth",
    description: "Foto dan voice message, 3 desain frame kustom, scan QR langsung via HP tamu, tanpa aplikasi.",
    features: [
      "Virtual Web Photobooth via HP Tamu",
      "3 Desain Template Frame Kustom",
      "Scan QR Code Tamu Tanpa Batas",
      "Unlimited Akses QR & Foto",
      "Akses Foto 30 Hari",
      "Buku Tamu Digital & Rekam Voice Note",
    ],
  },
];

export const BOOKING_PACKAGES: PackageOption[] = [
  ...VIRTUAL_PHOTOBOOTH_PACKAGES,
  ...PHOTOBOOTH_PACKAGES,
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackageId?: string;
  initialCategory?: BookingServiceCategory;
  initialPrintSize?: "2R" | "4R";
  packages?: Package[];
}

export function BookingModal({
  isOpen,
  onClose,
  initialPackageId,
  initialCategory,
  initialPrintSize,
  packages,
}: BookingModalProps) {
  const modalTitleId = useId();

  const [dynamicPackages, setDynamicPackages] = useState<Package[]>(packages || []);

  useEffect(() => {
    if (packages && packages.length > 0) {
      setDynamicPackages(packages);
    } else {
      fetch("/api/packages")
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.packages) && data.packages.length > 0) {
            setDynamicPackages(data.packages);
          }
        })
        .catch(() => {});
    }
  }, [packages, isOpen]);

  const photoboothPackages: PackageOption[] = useMemo(() => {
    const list = dynamicPackages.filter((p) => p.category === "physical");
    if (list.length === 0) return PHOTOBOOTH_PACKAGES;
    return list.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      badge: p.popular ? "Rekomendasi Acara" : `${p.duration_hours} Jam Layanan`,
      price: p.price,
      price2R: p.price_2r ?? p.price,
      price4R: p.price_4r ?? p.price + 500000,
      duration: p.duration_hours,
      durationLabel: `${p.duration_hours} Jam Layanan`,
      category: "photobooth",
      description: p.tagline || (p.features && p.features.length > 0 ? p.features.slice(0, 3).join(", ") : ""),
      features: p.features || [],
    }));
  }, [dynamicPackages]);

  const virtualPackages: PackageOption[] = useMemo(() => {
    const list = dynamicPackages.filter((p) => p.category === "virtual");
    if (list.length === 0) return VIRTUAL_PHOTOBOOTH_PACKAGES;
    return list.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      badge: p.popular ? "Rekomendasi" : `Akses ${Math.round(p.duration_hours / 24)} Hari`,
      price: p.price,
      duration: p.duration_hours,
      durationLabel: `Akses ${Math.round(p.duration_hours / 24)} Hari`,
      category: "virtual_photobooth",
      description: p.tagline || (p.features && p.features.length > 0 ? p.features.slice(0, 3).join(", ") : ""),
      features: p.features || [],
    }));
  }, [dynamicPackages]);

  const [physicalPrintSize, setPhysicalPrintSize] = useState<"2R" | "4R">(() => initialPrintSize || "2R");

  const inferCategoryFromPkg = (pkgKey?: string): BookingServiceCategory | null => {
    if (!pkgKey) return null;
    if (
      pkgKey.includes("basic") ||
      pkgKey.includes("deluxe") ||
      pkgKey.includes("fisik") ||
      pkgKey.includes("jam") ||
      pkgKey === "11111111-1111-1111-1111-111111111111" ||
      pkgKey === "44444444-4444-4444-4444-444444444444" ||
      pkgKey === "55555555-5555-5555-5555-555555555555" ||
      pkgKey === "66666666-6666-6666-6666-666666666666"
    ) {
      return "photobooth";
    }
    if (
      pkgKey.includes("bronze") ||
      pkgKey.includes("silver") ||
      pkgKey.includes("gold") ||
      pkgKey === "77777777-7777-7777-7777-777777777777" ||
      pkgKey === "22222222-2222-2222-2222-222222222222" ||
      pkgKey === "33333333-3333-3333-3333-333333333333"
    ) {
      return "virtual_photobooth";
    }
    return null;
  };

  const resolveInitPkgId = (pkgKey?: string, cat: BookingServiceCategory = "virtual_photobooth") => {
    if (cat === "photobooth") {
      if (pkgKey?.includes("5h") || pkgKey?.includes("5-jam") || pkgKey === "66666666-6666-6666-6666-666666666666") {
        return "66666666-6666-6666-6666-666666666666";
      }
      if (pkgKey?.includes("4h") || pkgKey?.includes("4-jam") || pkgKey === "55555555-5555-5555-5555-555555555555") {
        return "55555555-5555-5555-5555-555555555555";
      }
      if (pkgKey?.includes("deluxe") || pkgKey?.includes("3h") || pkgKey?.includes("3-jam") || pkgKey === "44444444-4444-4444-4444-444444444444") {
        return "44444444-4444-4444-4444-444444444444";
      }
      return "11111111-1111-1111-1111-111111111111";
    }
    if (pkgKey?.includes("bronze") || pkgKey === "77777777-7777-7777-7777-777777777777") {
      return "77777777-7777-7777-7777-777777777777";
    }
    if (pkgKey?.includes("gold") || pkgKey === "33333333-3333-3333-3333-333333333333") {
      return "33333333-3333-3333-3333-333333333333";
    }
    return "22222222-2222-2222-2222-222222222222";
  };

  const [serviceCategory, setServiceCategory] = useState<BookingServiceCategory>(() => {
    return initialCategory || inferCategoryFromPkg(initialPackageId) || "virtual_photobooth";
  });

  // Multi-step state: 0 = Pilih Kategori, 1 = Basic Details, 2 = Event Details, 3 = Package & Verification
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(() => {
    if (initialCategory || inferCategoryFromPkg(initialPackageId)) {
      return 1;
    }
    return 0;
  });

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    event_type: "wedding" as EventType,
    event_name: "",
    event_date: "",
    event_time: "13:00",
    event_venue_type: "indoor" as "indoor" | "outdoor",
    location: "",
    city: "Palopo",
    package_id: resolveInitPkgId(initialPackageId, initialCategory || inferCategoryFromPkg(initialPackageId) || "virtual_photobooth"),
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<(typeof formData & { category: BookingServiceCategory }) | null>(null);

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string>(() => `INV-RT-${Date.now().toString().slice(-6)}`);

  // Sync initial category, package, and print size if changed externally
  useEffect(() => {
    if (!isOpen) return;
    if (initialPrintSize) {
      setPhysicalPrintSize(initialPrintSize);
    }
    const cat = initialCategory || inferCategoryFromPkg(initialPackageId);
    if (cat) {
      setServiceCategory(cat);
      setCurrentStep(1);
      setFormData((prev) => ({
        ...prev,
        package_id: resolveInitPkgId(initialPackageId, cat),
      }));
    } else {
      setCurrentStep(0);
    }
  }, [isOpen, initialCategory, initialPackageId, initialPrintSize]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handleSelectCategory = (cat: BookingServiceCategory) => {
    setServiceCategory(cat);
    const defaultPkgId = cat === "photobooth"
      ? "11111111-1111-1111-1111-111111111111"
      : "22222222-2222-2222-2222-222222222222";
    setFormData((prev) => ({ ...prev, package_id: defaultPkgId }));
    setCurrentStep(1);
  };

  const handleSwitchCategory = (cat: BookingServiceCategory) => {
    setServiceCategory(cat);
    const defaultPkgId = cat === "photobooth"
      ? "11111111-1111-1111-1111-111111111111"
      : "22222222-2222-2222-2222-222222222222";
    setFormData((prev) => ({ ...prev, package_id: defaultPkgId }));
  };

  const getPackagePrice = (pkg: PackageOption, size: "2R" | "4R" = physicalPrintSize) => {
    if (pkg.category === "photobooth") {
      return size === "4R" ? (pkg.price4R ?? pkg.price) : (pkg.price2R ?? pkg.price);
    }
    return pkg.price;
  };

  if (!isOpen) return null;

  const activeCategoryPackages = serviceCategory === "photobooth"
    ? photoboothPackages
    : virtualPackages;

  const selectedPackage =
    activeCategoryPackages.find(
      (p) =>
        p.id === formData.package_id ||
        p.slug === formData.package_id ||
        (serviceCategory === "photobooth" && (
          (formData.package_id?.includes("5") && p.slug.includes("5")) ||
          (formData.package_id?.includes("4") && p.slug.includes("4")) ||
          (formData.package_id?.includes("3") && p.slug.includes("3")) ||
          (formData.package_id?.includes("2") && p.slug.includes("2")) ||
          (formData.package_id?.includes("deluxe") && p.slug.includes("3")) ||
          (formData.package_id?.includes("basic") && p.slug.includes("2"))
        )) ||
        (serviceCategory === "virtual_photobooth" && (
          (formData.package_id?.includes("bronze") && p.slug === "paket-bronze") ||
          (formData.package_id?.includes("gold") && p.slug === "paket-gold") ||
          (formData.package_id?.includes("silver") && p.slug === "paket-silver")
        ))
    ) || activeCategoryPackages[0];

  const selectedPackagePrice = getPackagePrice(selectedPackage, physicalPrintSize);


  // Validation before proceeding to next step
  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.customer_name.trim()) {
      setErrorMessage("Nama lengkap pemesan wajib diisi.");
      return;
    }
    if (!formData.customer_phone.trim()) {
      setErrorMessage("Nomor WhatsApp wajib diisi untuk konfirmasi.");
      return;
    }
    setCurrentStep(2);
  };

  const handleNextToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.event_name.trim()) {
      setErrorMessage("Nama acara atau nama pasangan wajib diisi.");
      return;
    }
    if (!formData.event_date) {
      setErrorMessage("Tanggal acara wajib ditentukan.");
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage("Lokasi atau nama gedung acara wajib diisi.");
      return;
    }
    setCurrentStep(3);
  };

  // Submit Step 3 and proceed to WhatsApp Transfer Confirmation
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const currentInv = invoiceId || `INV-RT-${Date.now().toString().slice(-6)}`;
      setInvoiceId(currentInv);

      const resolvedPackageTitle = serviceCategory === "photobooth"
        ? `${selectedPackage.name} (Cetak ${physicalPrintSize})`
        : selectedPackage.name;

      const payload = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim(),
        event_type: formData.event_type,
        event_name: formData.event_name.trim(),
        event_date: formData.event_date,
        event_time: formData.event_time,
        location: `${formData.location.trim()} (${formData.event_venue_type === "indoor" ? "Indoor" : "Outdoor"})`,
        city: formData.city,
        category: serviceCategory,
        booking_category: serviceCategory,
        package_id: selectedPackage.id,
        package_name: resolvedPackageTitle,
        notes: `${formData.notes.trim()}${serviceCategory === "photobooth" ? ` [Ukuran Cetak: ${physicalPrintSize}]` : ""}`.trim(),
        total_price: selectedPackagePrice,
        payment_status: "PENDING",
        payment_method: "WHATSAPP_TRANSFER",
        payment_invoice: currentInv,
        payment_amount: selectedPackagePrice,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan data reservasi. Silakan coba lagi.");
      }

      if (json.booking?.id) {
        setBookingId(json.booking.id);
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          try {
            const bc = new BroadcastChannel("ruangtemu_bookings");
            bc.postMessage({ type: "NEW_BOOKING", booking: json.booking });
            bc.close();
          } catch {}
        }
      }

      setSubmittedData({ ...formData, category: serviceCategory });
      setIsSuccess(true);

      // Otomatis arahkan ke WhatsApp Admin untuk transfer pembayaran
      const waMsg = encodeURIComponent(
        `Halo Admin RUANGTEMU Photobooth Palopo! Saya telah mengisi formulir reservasi dan ingin transfer pembayaran:\n\n` +
          `• No. Reservasi: ${currentInv}\n` +
          `• Layanan: ${serviceCategory === "photobooth" ? `Photobooth (Cetak Fisik ${physicalPrintSize})` : "Virtual Photobooth"}\n` +
          `• Nama Pemesan: ${formData.customer_name.trim()}\n` +
          `• WhatsApp: ${formData.customer_phone.trim()}\n` +
          `• Acara: ${formData.event_name.trim()} (${formData.event_type})\n` +
          `• Tanggal: ${formatDate(formData.event_date)} (${formatTime(formData.event_time)} WITA)\n` +
          `• Lokasi: ${formData.location.trim()} (${formData.event_venue_type === "indoor" ? "Indoor" : "Outdoor"}), ${formData.city}\n` +
          `• Paket: ${resolvedPackageTitle} (${formatRupiah(selectedPackagePrice)})\n` +
          `• Total Pembayaran: ${formatRupiah(selectedPackagePrice)}\n` +
          `• Catatan: ${formData.notes.trim() || "-"}\n\n` +
          `Saya ingin melakukan transfer pembayaran. Mohon informasi nomor rekening transfer RUANGTEMU untuk konfirmasi pembayaran ini. Terima kasih!`
      );
      const waUrl = `https://wa.me/6282244866088?text=${waMsg}`;
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kendala jaringan saat mengajukan reservasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setCurrentStep(initialCategory ? 1 : 0);
    setBookingId(null);
    setInvoiceId(`INV-RT-${Date.now().toString().slice(-6)}`);
    setErrorMessage(null);
    onClose();
  };

  const formattedDate = `${formatDate(new Date())} ${formatTime(new Date())}`;

  const whatsappMessage = submittedData
    ? encodeURIComponent(
        `Halo Admin RUANGTEMU Photobooth Palopo! Saya telah mengisi formulir reservasi dan ingin transfer pembayaran:\n\n` +
          `• No. Reservasi: ${invoiceId}\n` +
          `• Layanan: ${submittedData.category === "photobooth" ? `Photobooth (Cetak Fisik ${physicalPrintSize})` : "Virtual Photobooth"}\n` +
          `• Nama Pemesan: ${submittedData.customer_name}\n` +
          `• WhatsApp: ${submittedData.customer_phone}\n` +
          `• Acara: ${submittedData.event_name} (${submittedData.event_type})\n` +
          `• Tanggal: ${formatDate(submittedData.event_date)} (${formatTime(submittedData.event_time)} WITA)\n` +
          `• Lokasi: ${submittedData.location}, ${submittedData.city}\n` +
          `• Paket: ${selectedPackage.name}${submittedData.category === "photobooth" ? ` (Cetak ${physicalPrintSize})` : ""} (${formatRupiah(selectedPackagePrice)})\n` +
          `• Total Pembayaran: ${formatRupiah(selectedPackagePrice)}\n` +
          `• Catatan: ${submittedData.notes || "-"}\n\n` +
          `Saya ingin melakukan transfer pembayaran. Mohon informasi nomor rekening transfer RUANGTEMU untuk konfirmasi pembayaran ini. Terima kasih!`
      )
    : "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleResetAndClose();
        }
      }}
    >
      {/* Clean White Card Modal */}
      <div
        className="relative w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 pt-5 pb-3 sm:px-8 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="font-mono text-xs tracking-wider uppercase text-blue-700 font-bold">
              RUANGTEMU Digital
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Sudah reservasi?{" "}
              <a
                href="https://wa.me/6282244866088"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-bold transition-colors underline underline-offset-2"
              >
                Cek Jadwal
              </a>
            </span>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              aria-label="Tutup formulir"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stepper Header (Clean White with Blue Accent) */}
        <div className="px-6 pt-4 pb-4 sm:px-8 sm:pb-5 bg-white border-b border-slate-100 shrink-0">
          <div className="text-center mb-3">
            <h2 id={modalTitleId} className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
              {isSuccess
                ? "Reservasi Terkirim"
                : currentStep === 0
                ? "Pilih Layanan Photobooth"
                : serviceCategory === "photobooth"
                ? "Reservasi Photobooth (Fisik)"
                : "Reservasi Virtual Photobooth"}
            </h2>
            <p className="text-xs sm:text-sm text-blue-700/80 font-medium mt-1">
              {isSuccess
                ? "Data pesanan Anda telah tersimpan rapi di sistem kami"
                : currentStep === 0
                ? "Pilih format layanan yang sesuai dengan kebutuhan acara Anda"
                : "Isi data acara untuk mengamankan slot photobooth di Palopo & Luwu Raya"}
            </p>
          </div>

          {!isSuccess && currentStep > 0 && (
            <div className="max-w-xl mx-auto">
              <div className="relative flex items-center justify-between">
                {/* Connecting Track */}
                <div className="absolute left-6 right-6 top-3.5 h-[2px] bg-slate-200 -z-0" />
                <div
                  className="absolute left-6 top-3.5 h-[2px] bg-blue-600 transition-all duration-300 -z-0"
                  style={{
                    width:
                      currentStep === 1
                        ? "0%"
                        : currentStep === 2
                        ? "50%"
                        : "100%",
                  }}
                />

                {/* Step 1: Basic Details */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="relative z-10 flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === 1
                        ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100 scale-105"
                        : currentStep > 1
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 border border-slate-300 text-slate-500"
                    }`}
                  >
                    {currentStep > 1 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      "1"
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                      currentStep === 1 ? "text-blue-700 font-bold" : "text-slate-500"
                    }`}
                  >
                    Data Pemesan
                  </span>
                </button>

                {/* Step 2: Event Details */}
                <button
                  type="button"
                  onClick={() => {
                    if (formData.customer_name && formData.customer_phone) {
                      setCurrentStep(2);
                    }
                  }}
                  className="relative z-10 flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === 2
                        ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100 scale-105"
                        : currentStep > 2
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 border border-slate-300 text-slate-500"
                    }`}
                  >
                    {currentStep > 2 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      "2"
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                      currentStep === 2 ? "text-blue-700 font-bold" : "text-slate-500"
                    }`}
                  >
                    Rincian Acara
                  </span>
                </button>

                {/* Step 3: Verification / Package */}
                <button
                  type="button"
                  onClick={() => {
                    if (formData.customer_name && formData.customer_phone && formData.event_name && formData.event_date) {
                      setCurrentStep(3);
                    }
                  }}
                  className="relative z-10 flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === 3
                        ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100 scale-105"
                        : "bg-slate-100 border border-slate-300 text-slate-500"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                      currentStep === 3 ? "text-blue-700 font-bold" : "text-slate-500"
                    }`}
                  >
                    Pilihan Paket
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 md:p-8 overflow-y-auto space-y-5 text-slate-700 text-sm bg-white">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-rose-600">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {isSuccess ? (
            <div className="space-y-5 py-2 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Reservasi Berhasil Diajukan!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Terima kasih, <strong className="text-slate-900">{submittedData?.customer_name}</strong>. Detail acara Anda untuk <span className="text-blue-700 font-semibold">{submittedData?.event_name}</span> pada tanggal{" "}
                    <span className="text-slate-900 font-mono font-medium">{formatDate(submittedData?.event_date || "")}</span> telah berhasil masuk ke sistem RUANGTEMU.
                  </p>
                </div>
              </div>

              {/* Payment Instructions Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200/60">
                  <span className="font-mono text-xs uppercase tracking-wider text-emerald-800 font-bold flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-600">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    Instruksi Transfer Pembayaran
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Menunggu Transfer
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-slate-600">Total Biaya Pembayaran:</span>
                  <span className="text-2xl sm:text-3xl font-black text-blue-950 font-mono">
                    {formatRupiah(selectedPackagePrice)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-100">
                  Untuk mengunci tanggal acara dan memproses reservasi, silakan lanjutkan chat WhatsApp dengan Admin RUANGTEMU. Admin akan memberikan rekening transfer resmi (BCA / Mandiri / BRI / BNI / QRIS).
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-mono text-xs uppercase tracking-wider text-blue-700 font-bold">
                    Ringkasan Reservasi
                  </span>
                  <span className="text-xs font-mono text-slate-600 font-bold">
                    {invoiceId}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Nama Pemesan</span>
                    <span className="font-bold text-blue-950 text-sm">{submittedData?.customer_name}</span>
                    <span className="text-slate-500 block font-mono text-xs mt-0.5">{submittedData?.customer_phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Acara &amp; Waktu</span>
                    <span className="font-bold text-blue-950 text-sm">{submittedData?.event_name}</span>
                    <span className="text-slate-500 block font-mono text-xs mt-0.5">{formatDate(submittedData?.event_date || "")} ({formatTime(submittedData?.event_time || "")} WITA)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Lokasi Gedung</span>
                    <span className="font-bold text-blue-950 text-sm">{submittedData?.location}</span>
                    <span className="text-slate-500 block text-xs mt-0.5">{submittedData?.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Paket Photobooth</span>
                    <span className="font-bold text-blue-700 text-sm">{selectedPackage.name}{submittedData?.category === "photobooth" ? ` (Cetak ${physicalPrintSize})` : ""}</span>
                    <span className="text-blue-950 font-mono font-bold text-sm block mt-0.5">{formatRupiah(selectedPackagePrice)}</span>
                  </div>
                </div>

                {submittedData?.notes && (
                  <div className="pt-3 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 block mb-1">Catatan Khusus:</span>
                    <p className="text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200">
                      &quot;{submittedData.notes}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`https://wa.me/6282244866088?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all flex-1"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Chat WhatsApp Admin (Transfer Sekarang)</span>
                </a>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="min-h-[48px] px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer sm:flex-initial"
                >
                  <span>Selesai &amp; Tutup</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* STEP 0: PILIH LAYANAN (1. Photobooth / 2. Virtual Photobooth) */}
              {currentStep === 0 && (
                <div className="space-y-6 py-2">
                  <div className="text-center pb-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      Langkah Awal: Tentukan Format Layanan
                    </span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mt-2.5 tracking-tight">
                      Pilih Jenis Layanan yang Ingin Dipesan
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xl mx-auto text-center" style={{ marginLeft: "auto", marginRight: "auto" }}>
                      Silakan pilih antara booth fisik dengan cetak instan di lokasi, atau photobooth virtual berbasis QR smartphone tamu.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-1">
                    {/* OPTION 1: PHOTOBOOTH FISIK */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectCategory("photobooth")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectCategory("photobooth");
                        }
                      }}
                      className="group relative p-4 sm:p-6 md:p-7 rounded-2xl border-2 border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/20 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                              01
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                              Cetak Fisik di Lokasi
                            </span>
                          </div>
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                            Booth Offline
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xl font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                            1. Photobooth
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                            Mesin booth foto profesional di lokasi acara dengan cetak instan kecepatan tinggi, lighting studio, dan kru operator standby.
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs sm:text-sm text-slate-600">
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>Unlimited cetak foto glossy (4R / 2-strip)</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>Studio lighting profesional &amp; kamera HD</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>2 kru operator ramah standby selama acara</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>Link soft copy Google Drive dibagikan</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-mono font-semibold">Mulai Dari</span>
                          <span className="font-mono font-black text-amber-700 text-base sm:text-lg">Rp 2.000.000</span>
                        </div>
                        <span className="min-h-[46px] px-5 py-2.5 rounded-xl bg-amber-500 group-hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all">
                          <span>Pilih Photobooth</span>
                          <span aria-hidden="true">&rarr;</span>
                        </span>
                      </div>
                    </div>

                    {/* OPTION 2: VIRTUAL PHOTOBOOTH */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectCategory("virtual_photobooth")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectCategory("virtual_photobooth");
                        }
                      }}
                      className="group relative p-4 sm:p-6 md:p-7 rounded-2xl border-2 border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/20 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                              02
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                              QR Smartphone Tamu
                            </span>
                          </div>
                          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                            Web Digital
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                            2. Virtual Photobooth
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                            Tamu scan QR code dari meja masing-masing lewat smartphone, foto selfie dengan frame eksklusif acara, tanpa antre.
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs sm:text-sm text-slate-600">
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            <span>Tanpa antre, bisa foto dari meja mana saja</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            <span>Akses langsung lewat browser tanpa install aplikasi</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            <span>Buku tamu digital &amp; pesan ucapan voice note</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            <span>Live feed galeri real-time untuk layar proyektor</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-mono font-semibold">Mulai Dari</span>
                          <span className="font-mono font-black text-blue-700 text-base sm:text-lg">Rp 350.000</span>
                        </div>
                        <span className="min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all">
                          <span>Pilih Virtual Booth</span>
                          <span aria-hidden="true">&rarr;</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: DATA DIRI PEMESAN */}
              {currentStep === 1 && (
                <form onSubmit={handleNextToStep2} className="space-y-4">
                  {/* Category Switcher Pill Header */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-slate-500 font-medium shrink-0">Layanan Dipilih:</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold truncate ${
                        serviceCategory === "photobooth"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-blue-100 text-blue-900 border border-blue-300"
                      }`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${serviceCategory === "photobooth" ? "bg-amber-500" : "bg-blue-600"}`} />
                        <span className="truncate">
                          {serviceCategory === "photobooth" ? "1. Photobooth (Cetak Fisik)" : "2. Virtual Photobooth"}
                        </span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(0)}
                      className="min-h-[44px] px-3 py-1.5 text-xs text-blue-700 hover:text-blue-900 font-bold underline underline-offset-2 cursor-pointer shrink-0 transition-colors"
                    >
                      Ubah Kategori
                    </button>
                  </div>

                  {/* Clean Section Header (No Add Photo) */}
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="text-base sm:text-lg font-bold text-blue-900 tracking-tight">Basic Details</h3>
                    <p className="text-xs text-blue-700/80 mt-0.5">Lengkapi identitas penanggung jawab acara</p>
                  </div>

                  {/* Form Inputs */}
                  <div className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Full Name"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* Constituency / City with pin on right */}
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        Constituency / Wilayah Domisili *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full min-h-[44px] pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Palopo">Kota Palopo</option>
                          <option value="Luwu (Belopa)">Kabupaten Luwu (Belopa)</option>
                          <option value="Luwu Utara (Masamba)">Kabupaten Luwu Utara (Masamba)</option>
                          <option value="Luwu Timur (Malili)">Kabupaten Luwu Timur (Malili / Sorowako)</option>
                          <option value="Tana Toraja">Tana Toraja &amp; Toraja Utara</option>
                          <option value="Lainnya">Lainnya di Sulawesi Selatan</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Contact details two columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 mb-1">
                          WhatsApp Contact *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="0812-xxxx-xxxx"
                          value={formData.customer_phone}
                          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all font-mono placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-blue-900 mb-1">
                          Email Address <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <input
                          type="email"
                          placeholder="Enter Email Address"
                          value={formData.customer_email}
                          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save & Continue Button */}
                  <div className="pt-3 pb-3 flex justify-center">
                    <button
                      type="submit"
                      className="min-h-[46px] px-10 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Save &amp; Continue</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: RINCIAN ACARA */}
              {currentStep === 2 && (
                <form onSubmit={handleNextToStep3} className="space-y-3.5">
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="text-base sm:text-lg font-bold text-blue-900 tracking-tight">Event Details</h3>
                    <p className="text-xs text-blue-700/80 mt-0.5">Tentukan rincian dan spesifikasi teknis acara Anda</p>
                  </div>

                  <div className="space-y-3">
                    {/* Event Name */}
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        Nama Acara / Pasangan *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: The Wedding of Dimas & Sarah"
                        value={formData.event_name}
                        onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* Two Columns: Jenis Acara & Waktu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 mb-1">
                          Jenis Acara *
                        </label>
                        <select
                          value={formData.event_type}
                          onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                          className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all cursor-pointer"
                        >
                          <option value="wedding">Pernikahan (Wedding)</option>
                          <option value="birthday">Ulang Tahun / Sweet 17</option>
                          <option value="corporate">Acara Kantor / Corporate</option>
                          <option value="graduation">Wisuda / Graduation</option>
                          <option value="prom">Prom Night / Reuni</option>
                          <option value="other">Acara Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-blue-900 mb-1">
                          Waktu Mulai Acara (WITA)
                        </label>
                        <TimeInput24
                          value={formData.event_time}
                          onChange={(time24) => setFormData({ ...formData, event_time: time24 })}
                          className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Two Columns: Tanggal Acara & Suasana Lokasi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 mb-1">
                          Tanggal Acara *
                        </label>
                        <div>
                          <DateInputDMY
                            required
                            value={formData.event_date}
                            onChange={(isoDate) => setFormData({ ...formData, event_date: isoDate })}
                            className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Gender Style Radio (Indoor / Outdoor) */}
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 mb-1">
                          Suasana Lokasi Acara
                        </label>
                        <div className="flex items-center gap-5 min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="radio"
                              name="venue_type"
                              value="indoor"
                              checked={formData.event_venue_type === "indoor"}
                              onChange={() => setFormData({ ...formData, event_venue_type: "indoor" })}
                              className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                            />
                            <span>Indoor (Gedung)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="radio"
                              name="venue_type"
                              value="outdoor"
                              checked={formData.event_venue_type === "outdoor"}
                              onChange={() => setFormData({ ...formData, event_venue_type: "outdoor" })}
                              className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                            />
                            <span>Outdoor (Terbuka)</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        Lokasi / Nama Gedung *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Gedung Saokotae Palopo / Hotel Platinum"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* Vision & Concept */}
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        Vision &amp; Concept <span className="text-slate-400 font-normal">(Opsional)</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Type Here... (tema warna acara, konsep dekorasi, atau request khusus)"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none resize-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Bottom Navigation Buttons */}
                  <div className="pt-2 pb-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="min-h-[44px] px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-blue-900 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="submit"
                      className="min-h-[46px] px-8 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Save &amp; Continue</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PILIHAN PAKET & TINJAUAN */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-blue-900 tracking-tight">Package &amp; Verification</h3>
                      <p className="text-xs text-blue-700/80 mt-0.5">Pilih paket layanan dan verifikasi rincian sebelum konfirmasi</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 hidden sm:inline">
                      {serviceCategory === "photobooth" ? "Paket Photobooth Fisik" : "Paket Virtual Photobooth"}
                    </span>
                  </div>

                  {/* Category Switch Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => handleSwitchCategory("photobooth")}
                      className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        serviceCategory === "photobooth"
                          ? "bg-white text-amber-900 shadow-sm border border-amber-300"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>1. Photobooth (Fisik)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchCategory("virtual_photobooth")}
                      className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        serviceCategory === "virtual_photobooth"
                          ? "bg-white text-blue-900 shadow-sm border border-blue-300"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>2. Virtual Photobooth</span>
                    </button>
                  </div>

                  {/* Print Size Selector (2R vs 4R) for Photobooth Fisik */}
                  {serviceCategory === "photobooth" && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                      <div>
                        <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>Ukuran Kertas Cetak</span>
                        </div>
                        <p className="text-[11px] text-amber-900/80 mt-0.5">
                          Pilih format foto cetak (harga paket otomatis terupdate)
                        </p>
                      </div>
                      <div className="inline-flex p-1 bg-amber-100/80 rounded-xl border border-amber-300/80 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setPhysicalPrintSize("2R")}
                          className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            physicalPrintSize === "2R"
                              ? "bg-amber-500 text-slate-950 shadow-sm"
                              : "text-amber-900 hover:text-black hover:bg-amber-200/50"
                          }`}
                        >
                          <span>2R (Strip)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhysicalPrintSize("4R")}
                          className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            physicalPrintSize === "4R"
                              ? "bg-amber-500 text-slate-950 shadow-sm"
                              : "text-amber-900 hover:text-black hover:bg-amber-200/50"
                          }`}
                        >
                          <span>4R (Postcard)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active Category Package Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCategoryPackages.map((pkg) => {
                      const isSelected =
                        formData.package_id === pkg.id ||
                        formData.package_id === pkg.slug ||
                        selectedPackage?.id === pkg.id;
                      return (
                        <label
                          key={pkg.id}
                          className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? serviceCategory === "photobooth"
                                ? "bg-amber-50/70 border-2 border-amber-500 shadow-sm"
                                : "bg-blue-50/70 border-2 border-blue-600 shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-300 shadow-none"
                          }`}
                        >
                          <input
                            type="radio"
                            name="package_selection"
                            value={pkg.id}
                            checked={isSelected}
                            onChange={() => setFormData({ ...formData, package_id: pkg.id })}
                            className="sr-only"
                          />
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-blue-950 text-sm">{pkg.name}</span>
                              {pkg.badge && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  isSelected
                                    ? serviceCategory === "photobooth"
                                      ? "bg-amber-600 text-white"
                                      : "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}>
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {pkg.description}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                            <span className="text-[11px] text-slate-400 font-mono">Biaya Investasi</span>
                            <span className={`font-mono text-sm font-bold ${
                              serviceCategory === "photobooth" ? "text-amber-700" : "text-blue-700"
                            }`}>
                              {formatRupiah(getPackagePrice(pkg))}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Saved Row Box (Tinjauan Data Pemesanan) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-mono text-xs uppercase tracking-wider text-blue-700 font-bold flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        Tinjauan Data Pemesanan
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* 3 Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-0.5">Pemesan</span>
                        <span className="font-bold text-blue-950 text-sm block">{formData.customer_name || "-"}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{formData.customer_phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Acara &amp; Tanggal</span>
                        <span className="font-bold text-blue-950 text-sm block">{formData.event_name || "-"}</span>
                        <span className="text-slate-500 text-[11px]">
                          {formData.event_date ? formatDate(formData.event_date) : "-"} ({formatTime(formData.event_time)} WITA)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Paket &amp; Estimasi</span>
                        <span className="font-bold text-blue-700 text-sm block">{selectedPackage.name}{serviceCategory === "photobooth" ? ` (${physicalPrintSize})` : ""}</span>
                        <span className="font-mono text-blue-950 text-xs font-bold">{formatRupiah(selectedPackagePrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation Buttons */}
                  <div className="pt-2 pb-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="min-h-[44px] px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-blue-900 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-h-[46px] px-6 sm:px-8 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Menyimpan &amp; Menghubungi Admin...</span>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <span>Kirim Reservasi &amp; Bayar via WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
