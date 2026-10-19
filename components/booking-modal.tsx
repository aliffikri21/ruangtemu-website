"use client";

import { useEffect, useState, useId } from "react";
import { formatRupiah } from "@/lib/utils";
import { EventType } from "@/types";

export type BookingServiceCategory = "photobooth" | "virtual_photobooth";

export interface PackageOption {
  id: string;
  slug: string;
  name: string;
  badge?: string;
  price: number;
  duration: number;
  durationLabel: string;
  category: BookingServiceCategory;
  description: string;
  features?: string[];
}

export const PHOTOBOOTH_PACKAGES: PackageOption[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "paket-basic-photobooth",
    name: "Paket Basic Photobooth",
    badge: "2 Jam Layanan",
    price: 1800000,
    duration: 2,
    durationLabel: "2 Jam Layanan",
    category: "photobooth",
    description: "Cetak fisik unlimited 4R / 2-strip, custom frame sesuai tema, fun props, dan operator standby.",
    features: [
      "2 Jam Layanan Aktif di Venue",
      "Unlimited Print Foto 4R / 2-Strip",
      "Custom Template Frame Sesuai Tema",
      "Standard Fun Props & Aksesoris",
      "Download Cloud Semua Foto",
      "1 Operator & 1 Asisten Standby",
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    slug: "paket-standard-deluxe",
    name: "Paket Standard Deluxe",
    badge: "Rekomendasi (3 Jam)",
    price: 2500000,
    duration: 3,
    durationLabel: "3 Jam Layanan",
    category: "photobooth",
    description: "Cetak glossy unlimited, custom frame eksklusif, live digital gallery, 2 kru standby, free album kenangan.",
    features: [
      "3 Jam Layanan Penuh di Venue",
      "Unlimited Cetak Strip / 4R Glossy",
      "Custom Frame Eksklusif dengan Logo Event",
      "Premium Props & Kacamata Unik",
      "Live Digital Gallery & QR Download",
      "2 Kru Profesional RUANGTEMU Standby",
      "Free 1 Album Foto Kenangan Eksklusif",
    ],
  },
];

export const VIRTUAL_PHOTOBOOTH_PACKAGES: PackageOption[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "paket-silver",
    name: "Paket Silver",
    badge: "Rekomendasi (10 Hari)",
    price: 350000,
    duration: 240,
    durationLabel: "Akses 10 Hari",
    category: "virtual_photobooth",
    description: "Foto dan voice message, 2 desain frame kustom, cetak 200 kartu QR meja, tanpa aplikasi.",
    features: [
      "Virtual Web Photobooth via HP Tamu",
      "2 Desain Template Frame Kustom",
      "Free Cetak 200 Pcs Kartu QR Meja",
      "Unlimited Akses QR & Foto",
      "Akses Foto 10 Hari",
      "Buku Tamu Digital & Rekam Voice Note",
    ],
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    slug: "paket-gold",
    name: "Paket Gold",
    badge: "14 Hari Akses",
    price: 450000,
    duration: 336,
    durationLabel: "Akses 14 Hari",
    category: "virtual_photobooth",
    description: "Foto dan voice message, 3 desain frame kustom, cetak 300 kartu QR meja, tanpa aplikasi.",
    features: [
      "Virtual Web Photobooth via HP Tamu",
      "3 Desain Template Frame Kustom",
      "Free Cetak 300 Pcs Kartu QR Meja",
      "Unlimited Akses QR & Foto",
      "Akses Foto 14 Hari",
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
}

export function BookingModal({
  isOpen,
  onClose,
  initialPackageId,
  initialCategory,
}: BookingModalProps) {
  const modalTitleId = useId();

  const inferCategoryFromPkg = (pkgKey?: string): BookingServiceCategory | null => {
    if (!pkgKey) return null;
    if (
      pkgKey.includes("basic") ||
      pkgKey.includes("deluxe") ||
      pkgKey === "11111111-1111-1111-1111-111111111111" ||
      pkgKey === "44444444-4444-4444-4444-444444444444"
    ) {
      return "photobooth";
    }
    if (
      pkgKey.includes("silver") ||
      pkgKey.includes("gold") ||
      pkgKey === "22222222-2222-2222-2222-222222222222" ||
      pkgKey === "33333333-3333-3333-3333-333333333333"
    ) {
      return "virtual_photobooth";
    }
    return null;
  };

  const resolveInitPkgId = (pkgKey?: string, cat: BookingServiceCategory = "virtual_photobooth") => {
    if (cat === "photobooth") {
      if (pkgKey?.includes("deluxe") || pkgKey === "44444444-4444-4444-4444-444444444444") {
        return "44444444-4444-4444-4444-444444444444";
      }
      return "11111111-1111-1111-1111-111111111111";
    }
    if (pkgKey?.includes("gold") || pkgKey === "33333333-3333-3333-3333-333333333333") {
      return "33333333-3333-3333-3333-333333333333";
    }
    return "22222222-2222-2222-2222-222222222222";
  };

  const [serviceCategory, setServiceCategory] = useState<BookingServiceCategory>(() => {
    return initialCategory || inferCategoryFromPkg(initialPackageId) || "virtual_photobooth";
  });

  // Multi-step state: 0 = Pilih Kategori, 1 = Basic Details, 2 = Event Details, 3 = Package & Verification, 4 = Pembayaran DOKU
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3 | 4>(() => {
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
    event_time: "18:30",
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

  // DOKU Payment States
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string>(() => `INV-DOKU-${Date.now().toString().slice(-6)}`);
  const [activePaymentChannel, setActivePaymentChannel] = useState<"qris" | "va">("qris");
  const [selectedBank, setSelectedBank] = useState<"bca" | "mandiri" | "bri" | "bni">("bca");
  const [copiedVa, setCopiedVa] = useState(false);
  const [paymentCountdown, setPaymentCountdown] = useState(899); // 14:59
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidAt, setPaidAt] = useState<string | null>(null);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep !== 4 || paymentSuccess) return;
    const timer = setInterval(() => {
      setPaymentCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep, paymentSuccess]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Sync initial category or package if changed externally
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, initialCategory, initialPackageId]);

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

  if (!isOpen) return null;

  const activeCategoryPackages = serviceCategory === "photobooth"
    ? PHOTOBOOTH_PACKAGES
    : VIRTUAL_PHOTOBOOTH_PACKAGES;

  const selectedPackage =
    activeCategoryPackages.find(
      (p) =>
        p.id === formData.package_id ||
        p.slug === formData.package_id ||
        (serviceCategory === "photobooth" && (
          (formData.package_id?.includes("deluxe") && p.slug.includes("deluxe")) ||
          (formData.package_id?.includes("basic") && p.slug.includes("basic"))
        )) ||
        (serviceCategory === "virtual_photobooth" && (
          (formData.package_id?.includes("gold") && p.slug === "paket-gold") ||
          (formData.package_id?.includes("silver") && p.slug === "paket-silver")
        ))
    ) || activeCategoryPackages[0];

  const getVaNumber = (bank: string) => {
    const rawNumber = invoiceId.replace(/\D/g, "").padEnd(6, "8");
    switch (bank) {
      case "bca":
        return `8921 0822 ${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 6)}1`;
      case "mandiri":
        return `8892 1082 ${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 6)}2`;
      case "bri":
        return `1029 4821 ${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 6)}3`;
      case "bni":
        return `9881 2026 ${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 6)}4`;
      default:
        return `8921 0822 ${rawNumber.slice(0, 6)}`;
    }
  };

  const handleCopyVa = (va: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(va.replace(/\s/g, ""));
    }
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

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

  // Submit Step 3 and proceed to DOKU Payment (Step 4)
  const handleSubmitToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const currentInv = invoiceId || `INV-DOKU-${Date.now().toString().slice(-6)}`;
      setInvoiceId(currentInv);

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
        package_name: selectedPackage.name,
        notes: formData.notes.trim(),
        total_price: selectedPackage.price,
        payment_status: "PENDING",
        payment_invoice: currentInv,
        payment_amount: selectedPackage.price,
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
      }
      setSubmittedData({ ...formData, category: serviceCategory });
      setCurrentStep(4);
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kendala jaringan saat mengajukan reservasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm payment made by customer
  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    setErrorMessage(null);

    try {
      const method =
        activePaymentChannel === "qris"
          ? "DOKU_QRIS"
          : `DOKU_VA_${selectedBank.toUpperCase()}`;
      const nowIso = new Date().toISOString();

      if (bookingId) {
        await fetch("/api/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: bookingId,
            payment_status: "PAID",
            payment_method: method,
            payment_invoice: invoiceId,
            payment_amount: selectedPackage.price,
            payment_paid_at: nowIso,
            status: "confirmed",
          }),
        });
      }

      setPaymentSuccess(true);
      setPaidAt(nowIso);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal memverifikasi status pembayaran. Silakan coba lagi.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    setCheckingPaymentStatus(true);
    setStatusFeedback("Menghubungi gateway DOKU...");
    try {
      const res = await fetch(`/api/payment/doku/status?invoiceId=${encodeURIComponent(invoiceId)}`);
      const data = await res.json();
      if (data.paid) {
        await handleConfirmPayment();
      } else {
        setStatusFeedback("Mutasi belum terdeteksi. Silakan klik 'Saya Sudah Transfer / Bayar' jika sudah menyelesaikan pembayaran.");
        setTimeout(() => setStatusFeedback(null), 4000);
      }
    } catch {
      setStatusFeedback("Koneksi ke gateway DOKU Sandbox. Silakan klik 'Saya Sudah Transfer / Bayar'.");
      setTimeout(() => setStatusFeedback(null), 4000);
    } finally {
      setCheckingPaymentStatus(false);
    }
  };

  const handleSkipPayment = () => {
    setPaymentSuccess(false);
    setIsSuccess(true);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setPaymentSuccess(false);
    setCurrentStep(initialCategory ? 1 : 0);
    setBookingId(null);
    setInvoiceId(`INV-DOKU-${Date.now().toString().slice(-6)}`);
    setErrorMessage(null);
    setStatusFeedback(null);
    onClose();
  };

  const formattedDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const whatsappMessage = submittedData
    ? encodeURIComponent(
        paymentSuccess
          ? `Halo Admin RUANGTEMU Photobooth Palopo! Saya telah menyelesaikan reservasi dan melunasi pembayaran via DOKU Payment Gateway:\n\n` +
            `• No. Invoice: ${invoiceId}\n` +
            `• Layanan: ${submittedData.category === "photobooth" ? "Photobooth (Cetak Fisik)" : "Virtual Photobooth"}\n` +
            `• Nama: ${submittedData.customer_name}\n` +
            `• Acara: ${submittedData.event_name} (${submittedData.event_type})\n` +
            `• Tanggal: ${submittedData.event_date} (${submittedData.event_time} WITA)\n` +
            `• Lokasi: ${submittedData.location}, ${submittedData.city}\n` +
            `• Paket: ${selectedPackage.name} (${formatRupiah(selectedPackage.price)})\n` +
            `• Status Pembayaran: LUNAS (${activePaymentChannel === "qris" ? "QRIS Instant" : `${selectedBank.toUpperCase()} Virtual Account`})\n\n` +
            `Mohon dicek di dashboard admin RUANGTEMU. Terima kasih!`
          : `Halo Admin RUANGTEMU Photobooth Palopo! Saya sudah mengisi formulir reservasi online:\n\n` +
            `• No. Invoice: ${invoiceId}\n` +
            `• Layanan: ${submittedData.category === "photobooth" ? "Photobooth (Cetak Fisik)" : "Virtual Photobooth"}\n` +
            `• Nama: ${submittedData.customer_name}\n` +
            `• Acara: ${submittedData.event_name} (${submittedData.event_type})\n` +
            `• Tanggal: ${submittedData.event_date} (${submittedData.event_time} WITA)\n` +
            `• Lokasi: ${submittedData.location}, ${submittedData.city}\n` +
            `• Paket: ${selectedPackage.name} (${formatRupiah(selectedPackage.price)})\n` +
            `• Catatan: ${submittedData.notes || "-"}\n\n` +
            `Mohon dicek di dashboard admin dan dikonfirmasi jadwalnya. Terima kasih!`
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
                        ? "33%"
                        : currentStep === 3
                        ? "66%"
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
                        : currentStep > 3
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 border border-slate-300 text-slate-500"
                    }`}
                  >
                    {currentStep > 3 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      "3"
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                      currentStep === 3 ? "text-blue-700 font-bold" : "text-slate-500"
                    }`}
                  >
                    Pilihan Paket
                  </span>
                </button>

                {/* Step 4: Pembayaran DOKU */}
                <button
                  type="button"
                  onClick={() => {
                    if (bookingId) {
                      setCurrentStep(4);
                    }
                  }}
                  disabled={!bookingId && currentStep < 4}
                  className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === 4
                        ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100 scale-105"
                        : bookingId
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 border border-slate-300 text-slate-500"
                    }`}
                  >
                    4
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                      currentStep === 4 ? "text-blue-700 font-bold" : "text-slate-500"
                    }`}
                  >
                    Pembayaran
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
            <div className="space-y-5 py-2">
              {paymentSuccess ? (
                /* SCREENSHOT TRANSAKSI DOKU / BUKTI PEMBAYARAN RESMI */
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-white overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  {/* DOKU Header Banner */}
                  <div className="bg-gradient-to-r from-[#D9222A] via-[#E52534] to-[#C01B22] p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-white text-[#D9222A] font-black px-2 py-0.5 rounded text-xs tracking-wider shadow-sm">
                        DOKU
                      </div>
                      <div>
                        <div className="text-xs uppercase font-extrabold tracking-wider">
                          BUKTI PEMBAYARAN RESMI
                        </div>
                        <div className="text-[10px] text-white/80">RUANGTEMU Official Merchant</div>
                      </div>
                    </div>
                    <div className="bg-emerald-400 text-emerald-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 animate-ping" />
                      Lunas / Settled
                    </div>
                  </div>

                  {/* Receipt Body */}
                  <div className="p-6 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Pembayaran Berhasil!
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Transaksi telah terverifikasi sukses via DOKU Payment Gateway
                      </p>
                    </div>

                    {/* Total Bayar Box */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Total Pembayaran</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-blue-900 font-mono block mt-0.5">
                        {formatRupiah(selectedPackage.price)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Status: SETTLED / LUNAS
                      </span>
                    </div>

                    {/* Transaction Details Grid */}
                    <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl grid grid-cols-2 gap-3 text-left text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">No. Invoice DOKU</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">{invoiceId}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Metode Bayar</span>
                        <span className="font-semibold text-slate-800 text-xs">
                          {activePaymentChannel === "qris" ? "QRIS Instant" : `Virtual Account ${selectedBank.toUpperCase()}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Nama Pemesan</span>
                        <span className="font-semibold text-slate-800 text-xs">{submittedData?.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">Waktu Transaksi</span>
                        <span className="font-mono text-slate-700 text-xs">
                          {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WITA, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Acara: <strong className="text-slate-800">{submittedData?.event_name}</strong></span>
                        <span className="text-blue-700 font-bold">{selectedPackage.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-600">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Struk transaksi resmi terverifikasi sistem RUANGTEMU</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* PENDING APPROVAL IF USER SKIPPED PAYMENT */
                <>
                  <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-950 text-lg">
                        Terima kasih, {submittedData?.customer_name}!
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Reservasi Anda untuk acara <span className="text-blue-700 font-semibold">{submittedData?.event_name}</span> pada tanggal{" "}
                        <span className="text-slate-900 font-mono font-medium">{submittedData?.event_date}</span> telah masuk ke sistem RUANGTEMU dengan status <strong className="text-amber-600 font-semibold">Menunggu Konfirmasi</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Booking Summary Box */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <span className="font-mono text-xs uppercase tracking-wider text-blue-700 font-bold">
                        Ringkasan Pemesanan
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        Pending Approval
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-0.5">Nama Pemesan</span>
                        <span className="font-bold text-blue-950 text-sm">{submittedData?.customer_name}</span>
                        <span className="text-slate-500 block font-mono text-xs mt-0.5">{submittedData?.customer_phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Acara & Waktu</span>
                        <span className="font-bold text-blue-950 text-sm">{submittedData?.event_name}</span>
                        <span className="text-slate-500 block font-mono text-xs mt-0.5">{submittedData?.event_date} ({submittedData?.event_time} WITA)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Lokasi Gedung</span>
                        <span className="font-bold text-blue-950 text-sm">{submittedData?.location}</span>
                        <span className="text-slate-500 block text-xs mt-0.5">{submittedData?.city}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Paket Photobooth</span>
                        <span className="font-bold text-blue-700 text-sm">{selectedPackage.name}</span>
                        <span className="text-blue-950 font-mono font-bold text-sm block mt-0.5">{formatRupiah(selectedPackage.price)}</span>
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
                </>
              )}

              {/* ACTION BUTTONS (SELESAI & KONFIRMASI) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="min-h-[46px] px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs tracking-wide shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer flex-1"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Selesai &amp; Tutup</span>
                </button>
                <a
                  href={`https://wa.me/6282244866088?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Konfirmasi WhatsApp Admin</span>
                </a>
              </div>
            </div>
          ) : (
            <div>
              {/* STEP 0: PILIH LAYANAN (1. Photobooth / 2. Virtual Photobooth) */}
              {currentStep === 0 && (
                <div className="space-y-6 py-2">
                  <div className="text-center pb-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      Langkah 1 dari 4: Tentukan Format Layanan
                    </span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mt-2.5 tracking-tight">
                      Pilih Jenis Layanan yang Ingin Dipesan
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xl mx-auto">
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
                            <span>Studio lighting &amp; aneka properti seru</span>
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
                          <span className="font-mono font-black text-amber-700 text-base sm:text-lg">Rp 1.800.000</span>
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
                        <input
                          type="time"
                          value={formData.event_time}
                          onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
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
                        <div className="relative">
                          <input
                            type="date"
                            required
                            value={formData.event_date}
                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                            className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm outline-none transition-all font-mono"
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
                <form onSubmit={handleSubmitToPayment} className="space-y-4">
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
                              {formatRupiah(pkg.price)}
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
                          {formData.event_date} ({formData.event_time} WITA)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Paket &amp; Estimasi</span>
                        <span className="font-bold text-blue-700 text-sm block">{selectedPackage.name}</span>
                        <span className="font-mono text-blue-950 text-xs font-bold">{formatRupiah(selectedPackage.price)}</span>
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
                      className="min-h-[46px] px-8 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menyimpan Data...
                        </>
                      ) : (
                        <>
                          <span>Lanjut ke Pembayaran</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: PEMBAYARAN DOKU GATEWAY */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  {/* DOKU Header Banner */}
                  <div className="bg-gradient-to-r from-[#D9222A] via-[#E52534] to-[#C01B22] p-4 rounded-2xl text-white shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-white text-[#D9222A] font-black px-2 py-0.5 rounded text-xs tracking-wider shadow-sm">
                          DOKU
                        </div>
                        <div>
                          <div className="text-xs uppercase font-extrabold tracking-wider">
                            Payment Gateway
                          </div>
                          <div className="text-[10px] text-white/80">RUANGTEMU Official Merchant</div>
                        </div>
                      </div>
                      <div className="bg-amber-400 text-stone-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-ping" />
                        Sandbox Active
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/80 uppercase block">Total Pembayaran</span>
                        <span className="text-xl sm:text-2xl font-black font-mono">
                          {formatRupiah(selectedPackage.price)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/80 uppercase block">Sisa Waktu Bayar</span>
                        <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                          {formatTimer(paymentCountdown)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Short Recap */}
                  <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-600">
                    <div>
                      <span>Invoice: <strong className="font-mono text-slate-800">{invoiceId}</strong></span>
                    </div>
                    <div>
                      <span>Paket: <strong className="text-blue-700">{selectedPackage.name}</strong></span>
                    </div>
                  </div>

                  {/* Payment Method Switcher (QRIS vs VA) */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setActivePaymentChannel("qris")}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activePaymentChannel === "qris"
                          ? "bg-white text-blue-900 shadow-sm border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span>QRIS Instant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePaymentChannel("va")}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activePaymentChannel === "va"
                          ? "bg-white text-blue-900 shadow-sm border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span>Virtual Account</span>
                    </button>
                  </div>

                  {/* QRIS Channel Content */}
                  {activePaymentChannel === "qris" && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span>QRIS Standar Bank Indonesia</span>
                      </div>

                      {/* QR Representation Box */}
                      <div className="w-48 h-48 sm:w-52 sm:h-52 mx-auto p-3 bg-white border-2 border-slate-800 rounded-2xl shadow-md flex flex-col items-center justify-between">
                        <div className="text-[10px] font-bold font-mono tracking-widest text-slate-600 uppercase border-b border-slate-200 w-full pb-1">
                          QRIS RUANGTEMU DIGITAL
                        </div>
                        {/* SVG QR Code Illustration */}
                        <div className="w-32 h-32 relative flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                            <rect x="0" y="0" width="30" height="30" rx="4" />
                            <rect x="6" y="6" width="18" height="18" rx="2" fill="white" />
                            <rect x="10" y="10" width="10" height="10" rx="1" />

                            <rect x="70" y="0" width="30" height="30" rx="4" />
                            <rect x="76" y="6" width="18" height="18" rx="2" fill="white" />
                            <rect x="80" y="10" width="10" height="10" rx="1" />

                            <rect x="0" y="70" width="30" height="30" rx="4" />
                            <rect x="6" y="76" width="18" height="18" rx="2" fill="white" />
                            <rect x="10" y="80" width="10" height="10" rx="1" />

                            <rect x="36" y="6" width="6" height="6" />
                            <rect x="46" y="12" width="6" height="6" />
                            <rect x="56" y="6" width="6" height="6" />
                            <rect x="36" y="22" width="10" height="6" />
                            <rect x="10" y="36" width="6" height="6" />
                            <rect x="20" y="44" width="6" height="12" />
                            <rect x="36" y="36" width="28" height="28" rx="4" fill="#D9222A" />
                            <text x="50" y="54" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">DOKU</text>
                            <rect x="72" y="36" width="6" height="10" />
                            <rect x="84" y="44" width="10" height="6" />
                            <rect x="40" y="72" width="6" height="14" />
                            <rect x="52" y="78" width="14" height="6" />
                            <rect x="74" y="72" width="20" height="6" />
                            <rect x="80" y="84" width="12" height="10" />
                          </svg>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          NMID: ID1020268844866
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                        Buka BCA Mobile, Livin&apos; Mandiri, BRImo, BNI, GoPay, OVO, Dana, atau ShopeePay dan scan kode QR di atas.
                      </p>
                    </div>
                  )}

                  {/* Virtual Account Channel Content */}
                  {activePaymentChannel === "va" && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
                      {/* Bank selector */}
                      <div>
                        <span className="text-xs font-semibold text-slate-700 block mb-2">Pilih Bank Virtual Account:</span>
                        <div className="grid grid-cols-4 gap-2">
                          {(["bca", "mandiri", "bri", "bni"] as const).map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setSelectedBank(b)}
                              className={`py-2 px-1 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                                selectedBank === b
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* VA Details Box */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">Nomor Virtual Account {selectedBank.toUpperCase()}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Otomatis Terverifikasi</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-wider">
                            {getVaNumber(selectedBank)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyVa(getVaNumber(selectedBank))}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {copiedVa ? "Tersalin!" : "Salin"}
                          </button>
                        </div>
                        <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                          <span>Nama Akun: <strong className="text-slate-800">RUANGTEMU - {formData.customer_name}</strong></span>
                          <span>Batas: <strong className="text-slate-800">24 Jam</strong></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback or Loading Message */}
                  {statusFeedback && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-blue-600">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <span>{statusFeedback}</span>
                    </div>
                  )}

                  {/* Primary & Secondary Action Buttons */}
                  <div className="space-y-2 pt-1 pb-3">
                    {/* Primary: Confirm Payment */}
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isProcessingPayment}
                      className="w-full min-h-[48px] px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessingPayment ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Memverifikasi Pembayaran DOKU...</span>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Saya Sudah Transfer / Bayar</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {/* Check Status */}
                      <button
                        type="button"
                        onClick={handleCheckPaymentStatus}
                        disabled={checkingPaymentStatus}
                        className="min-h-[42px] px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${checkingPaymentStatus ? "animate-spin" : ""}`}>
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        <span>{checkingPaymentStatus ? "Mengecek..." : "Cek Status DOKU"}</span>
                      </button>

                      {/* Skip / Bayar Nanti */}
                      <button
                        type="button"
                        onClick={handleSkipPayment}
                        className="min-h-[42px] px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                      >
                        Bayar Nanti (Konfirmasi Manual)
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        ← Ubah Paket / Detail Pemesanan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
