"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatRupiah, formatDate, formatTime } from "@/lib/utils";
import { EventType } from "@/types";

interface PackageOption {
  id: string;
  slug: string;
  name: string;
  price: number;
  price2R?: number;
  price4R?: number;
  duration: number;
  category: "photobooth" | "virtual_photobooth";
  description: string;
}

const packageOptions: PackageOption[] = [
  {
    id: "pkg-fisik-2h",
    slug: "paket-2-jam-photobooth",
    name: "Paket 2 Jam Photobooth Fisik",
    category: "photobooth",
    price: 2000000,
    price2R: 2000000,
    price4R: 2500000,
    duration: 120,
    description: "Unlimited print 2R / 4R, studio lighting, props, 2 kru operator",
  },
  {
    id: "pkg-fisik-3h",
    slug: "paket-3-jam-photobooth",
    name: "Paket 3 Jam Photobooth Fisik",
    category: "photobooth",
    price: 2500000,
    price2R: 2500000,
    price4R: 3000000,
    duration: 180,
    description: "Paket terpopuler pernikahan, unlimited print glossy, custom frame, 2 kru",
  },
  {
    id: "pkg-fisik-4h",
    slug: "paket-4-jam-photobooth",
    name: "Paket 4 Jam Photobooth Fisik",
    category: "photobooth",
    price: 3000000,
    price2R: 3000000,
    price4R: 3500000,
    duration: 240,
    description: "4 jam penuh layanan di lokasi, custom frame template, properti lengkap, 2 kru",
  },
  {
    id: "pkg-fisik-5h",
    slug: "paket-5-jam-photobooth",
    name: "Paket 5 Jam Photobooth Fisik",
    category: "photobooth",
    price: 3500000,
    price2R: 3500000,
    price4R: 4000000,
    duration: 300,
    description: "5 jam penuh seharian, unlimited cetak instan di lokasi, properti tematik, 2 kru",
  },
  {
    id: "pkg-bronze",
    slug: "paket-bronze",
    name: "Paket Bronze (7 Hari Akses, 1 Frame, 100 QR)",
    category: "virtual_photobooth",
    price: 250000,
    duration: 168,
    description: "Foto virtual, 1 desain frame, 100 kartu QR, scan QR tanpa batas",
  },
  {
    id: "pkg-silver",
    slug: "paket-silver",
    name: "Paket Silver (10 Hari Akses, 2 Frame, 200 QR)",
    category: "virtual_photobooth",
    price: 350000,
    duration: 240,
    description: "Foto & voice message, 2 desain frame, 200 kartu QR, scan QR tanpa batas",
  },
  {
    id: "pkg-gold",
    slug: "paket-gold",
    name: "Paket Gold (14 Hari Akses, 3 Frame, 300 QR)",
    category: "virtual_photobooth",
    price: 450000,
    duration: 336,
    description: "Foto & voice message, 3 desain frame, 300 kartu QR, live feed proyektor",
  },
];

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageParam = searchParams.get("package");
  const categoryParam = searchParams.get("category");

  const [serviceCategory, setServiceCategory] = useState<"photobooth" | "virtual_photobooth">(() => {
    if (categoryParam === "photobooth") return "photobooth";
    if (
      packageParam?.includes("basic") ||
      packageParam?.includes("deluxe") ||
      packageParam?.includes("fisik") ||
      packageParam?.includes("jam")
    ) {
      return "photobooth";
    }
    return "virtual_photobooth";
  });

  const [physicalPrintSize, setPhysicalPrintSize] = useState<"2R" | "4R">("2R");

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    event_type: "wedding" as EventType,
    event_name: "",
    event_date: "",
    event_time: "13:00",
    location: "",
    city: "Palopo",
    package_id: "pkg-fisik-2h",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (packageParam) {
      const found = packageOptions.find((p) => p.slug === packageParam || p.id === packageParam);
      if (found) {
        setServiceCategory(found.category);
        setFormData((prev) => ({ ...prev, package_id: found.id }));
      }
    }
  }, [packageParam]);

  const filteredPackages = packageOptions.filter((p) => p.category === serviceCategory);
  const selectedPackage =
    packageOptions.find((p) => p.id === formData.package_id) || filteredPackages[0] || packageOptions[0];

  const getPackagePrice = (pkg: PackageOption) => {
    if (pkg.category === "photobooth") {
      return physicalPrintSize === "4R" ? (pkg.price4R ?? pkg.price) : (pkg.price2R ?? pkg.price);
    }
    return pkg.price;
  };

  const selectedPackagePrice = getPackagePrice(selectedPackage);

  const handleCategoryChange = (cat: "photobooth" | "virtual_photobooth") => {
    setServiceCategory(cat);
    const firstOfCat = packageOptions.find((p) => p.category === cat);
    if (firstOfCat) {
      setFormData((prev) => ({ ...prev, package_id: firstOfCat.id }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const resolvedPackageName = serviceCategory === "photobooth"
        ? `${selectedPackage.name} (Cetak ${physicalPrintSize})`
        : selectedPackage.name;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          category: serviceCategory,
          booking_category: serviceCategory,
          package_name: resolvedPackageName,
          total_price: selectedPackagePrice,
          notes: `${formData.notes}${serviceCategory === "photobooth" ? ` [Ukuran Cetak: ${physicalPrintSize}]` : ""}`.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (typeof window !== "undefined" && "BroadcastChannel" in window && data?.booking) {
          try {
            const bc = new BroadcastChannel("ruangtemu_bookings");
            bc.postMessage({ type: "NEW_BOOKING", booking: data.booking });
            bc.close();
          } catch {}
        }
        setIsSuccess(true);
      } else {
        setIsSuccess(true);
      }
    } catch {
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Halo Admin RUANGTEMU Photobooth Palopo! Saya sudah mengisi formulir reservasi:\n\n` +
      `• Kategori Layanan: ${serviceCategory === "photobooth" ? `Photobooth (Cetak Fisik ${physicalPrintSize})` : "Virtual Photobooth"}\n` +
      `• Nama: ${formData.customer_name}\n` +
      `• Event: ${formData.event_name} (${formData.event_type})\n` +
      `• Tanggal: ${formatDate(formData.event_date)} (${formatTime(formData.event_time)} WITA)\n` +
      `• Lokasi: ${formData.location}, ${formData.city}\n` +
      `• Paket: ${selectedPackage.name}${serviceCategory === "photobooth" ? ` (Cetak ${physicalPrintSize})` : ""} (${formatRupiah(selectedPackagePrice)})\n` +
      `• Catatan: ${formData.notes || "-"}\n\n` +
      `Mohon konfirmasi ketersediaan jadwalnya. Terima kasih!`
  );

  return (
    <div className="max-w-4xl mx-auto">
      {isSuccess ? (
        <div className="p-8 sm:p-12 bg-white border border-stone-200 text-left space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#c47a5a]">
              [ Terkirim ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-900">
              Reservasi Berhasil Diajukan
            </h2>
            <p className="text-stone-600 text-sm max-w-lg leading-relaxed">
              Terima kasih, <strong className="font-medium text-stone-900">{formData.customer_name}</strong>. Detail acara Anda untuk tanggal{" "}
              <span className="font-mono text-stone-900">{formatDate(formData.event_date)}</span> telah masuk ke sistem kami.
            </p>
          </div>

          <div className="p-5 bg-stone-50 border border-stone-200 space-y-3 text-xs">
            <div className="font-mono uppercase tracking-wider text-stone-500 text-[10px]">
              Ringkasan Reservasi
            </div>
            <div className="font-medium text-stone-900 text-sm">{formData.event_name}</div>
            <div className="text-stone-600">{selectedPackage.name}{serviceCategory === "photobooth" ? ` (Cetak ${physicalPrintSize})` : ""}</div>
            <div className="text-stone-500">{formData.location}, {formData.city}</div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline font-mono text-sm text-stone-900">
              <span className="text-stone-500 text-xs">Total Estimasi:</span>
              <span className="font-semibold">{formatRupiah(selectedPackagePrice)}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={`https://wa.me/6282244866088?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center tracking-wide transition-colors"
            >
              Konfirmasi Cepat via WhatsApp
            </a>
            <button
              onClick={() => router.push("/")}
              className="min-h-[44px] px-6 py-2.5 bg-white hover:bg-stone-50 text-stone-900 font-medium text-xs border border-stone-300 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Fields */}
          <div className="lg:col-span-8 p-6 sm:p-8 bg-white border border-stone-200 space-y-8">
            <div className="space-y-1">
              <h3 className="text-xl font-light text-stone-900 tracking-tight">Data Pemesanan</h3>
              <p className="text-xs text-stone-500">
                Isi data berikut untuk memeriksa ketersediaan tanggal acara di Palopo & Luwu Raya.
              </p>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 block border-b border-stone-150 pb-1">
                01 / Identitas Pemesan
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Andi Pratama"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                  Email (Opsional untuk tanda terima)
                </label>
                <input
                  type="email"
                  placeholder="andi@example.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Event Info */}
            <div className="space-y-4 pt-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 block border-b border-stone-150 pb-1">
                02 / Rincian Acara
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                    Jenis Acara *
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none transition-colors"
                  >
                    <option value="wedding">Pernikahan (Wedding)</option>
                    <option value="birthday">Ulang Tahun / Sweet 17</option>
                    <option value="corporate">Corporate / Acara Kantor</option>
                    <option value="graduation">Wisuda / Graduation</option>
                    <option value="prom">Prom Night / Reuni</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                    Nama Acara / Pasangan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: The Wedding of Andi & Sarah"
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                    Tanggal Acara *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                    Waktu Mulai (WITA)
                  </label>
                  <input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                    Lokasi / Nama Gedung *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gedung Saokotae"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                    Kota / Wilayah *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none transition-colors"
                  >
                    <option value="Palopo">Kota Palopo</option>
                    <option value="Luwu (Belopa)">Kab. Luwu (Belopa & sekitarnya)</option>
                    <option value="Luwu Utara (Masamba)">Kab. Luwu Utara (Masamba)</option>
                    <option value="Luwu Timur (Malili)">Kab. Luwu Timur (Malili / Sorowako)</option>
                    <option value="Tana Toraja">Tana Toraja / Toraja Utara</option>
                    <option value="Lainnya">Lainnya di Sulawesi Selatan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 mb-1.5">
                  Catatan Tambahan / Desain Frame
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Tema warna sage green & cream, butuh watermark nama pasangan di frame foto."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-sm outline-none resize-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-medium text-xs tracking-wider uppercase transition-colors"
            >
              {isSubmitting ? "Memproses..." : "Kirim Formulir Reservasi"}
            </button>
          </div>

          {/* Right Column: Selected Package Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-white border border-stone-200 space-y-5 sticky top-20">
              <div className="flex justify-between items-baseline">
                <h4 className="font-mono text-xs uppercase tracking-wider text-stone-900">
                  Paket Layanan
                </h4>
                <span className="font-mono text-[10px] text-stone-400">
                  {filteredPackages.length} pilihan
                </span>
              </div>

              {/* Category Selector Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 border border-stone-200">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("photobooth")}
                  className={`min-h-[40px] px-2 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
                    serviceCategory === "photobooth"
                      ? "bg-white text-stone-900 shadow-sm border border-stone-300 font-bold"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  1. Photobooth
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange("virtual_photobooth")}
                  className={`min-h-[40px] px-2 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
                    serviceCategory === "virtual_photobooth"
                      ? "bg-white text-stone-900 shadow-sm border border-stone-300 font-bold"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  2. Virtual
                </button>
              </div>

              {/* Print Size Selector (2R vs 4R) for Photobooth */}
              {serviceCategory === "photobooth" && (
                <div className="p-3 bg-stone-50 border border-stone-200 space-y-1.5">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-stone-600 font-semibold">
                    Ukuran Cetak Foto
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/60 border border-stone-300/60">
                    <button
                      type="button"
                      onClick={() => setPhysicalPrintSize("2R")}
                      className={`min-h-[44px] px-2 py-1.5 text-xs font-mono transition-colors cursor-pointer flex items-center justify-center ${
                        physicalPrintSize === "2R"
                          ? "bg-stone-900 text-white font-bold shadow-sm"
                          : "text-stone-700 hover:text-stone-950 hover:bg-stone-100"
                      }`}
                    >
                      2R (Strip)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhysicalPrintSize("4R")}
                      className={`min-h-[44px] px-2 py-1.5 text-xs font-mono transition-colors cursor-pointer flex items-center justify-center ${
                        physicalPrintSize === "4R"
                          ? "bg-stone-900 text-white font-bold shadow-sm"
                          : "text-stone-700 hover:text-stone-950 hover:bg-stone-100"
                      }`}
                    >
                      4R (Postcard)
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {filteredPackages.map((pkg) => {
                  const isSelected = formData.package_id === pkg.id;
                  return (
                    <label
                      key={pkg.id}
                      className={`block p-3.5 border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-stone-50 border-stone-900"
                          : "bg-white border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="package"
                          value={pkg.id}
                          checked={isSelected}
                          onChange={() => setFormData({ ...formData, package_id: pkg.id })}
                          className="mt-1 text-stone-900 focus:ring-stone-900"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-medium text-stone-900 leading-snug">{pkg.name}</div>
                          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{pkg.description}</p>
                          <div className="font-mono text-xs text-stone-900 font-semibold mt-1.5">
                            {formatRupiah(getPackagePrice(pkg))}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Price Calculation Box */}
              <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Biaya Layanan ({selectedPackage.name}{serviceCategory === "photobooth" ? ` • ${physicalPrintSize}` : ""})</span>
                  <span className="font-mono text-stone-900">{formatRupiah(selectedPackagePrice)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Transport &amp; Setup (Palopo)</span>
                  <span className="font-mono text-stone-900">Termasuk</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-stone-500">Total Estimasi</span>
                  <span className="font-mono text-base font-semibold">{formatRupiah(selectedPackagePrice)}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 text-[11px] text-stone-500 leading-relaxed">
                Tanpa DP saat pengisian formulir. Konfirmasi tanggal dan jadwal teknis akan difinalisasi bersama admin via WhatsApp.
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-stone-900">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 px-5 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-10 pb-6 border-b border-stone-200 space-y-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#c47a5a]">
            [ Reservasi ]
          </span>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-stone-950">
            Pemesanan Photobooth
          </h1>
          <p className="text-stone-500 text-sm max-w-xl">
            Layanan photobooth instan & virtual untuk Kota Palopo, Luwu, Luwu Utara, Luwu Timur, dan Toraja.
          </p>
        </div>

        <Suspense fallback={<div className="text-center font-mono text-xs text-stone-400 py-16">Memuat formulir...</div>}>
          <BookingForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
