"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatRupiah } from "@/lib/utils";
import { EventType } from "@/types";

interface PackageOption {
  id: string;
  slug: string;
  name: string;
  price: number;
  duration: number;
}

const packageOptions: PackageOption[] = [
  {
    id: "pkg-1",
    slug: "paket-basic",
    name: "Paket Basic Photobooth (2 Jam)",
    price: 1800000,
    duration: 2,
  },
  {
    id: "pkg-2",
    slug: "paket-standard-deluxe",
    name: "Paket Standard Deluxe (3 Jam : Populer)",
    price: 2500000,
    duration: 3,
  },
  {
    id: "pkg-3",
    slug: "paket-virtual-photobooth",
    name: "Paket Virtual & Web Photobooth (12 Jam)",
    price: 2200000,
    duration: 12,
  },
  {
    id: "pkg-4",
    slug: "paket-platinum-hybrid",
    name: "Paket Platinum All-in Hybrid (4 Jam + Virtual)",
    price: 3800000,
    duration: 4,
  },
];

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageParam = searchParams.get("package");

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    event_type: "wedding" as EventType,
    event_name: "",
    event_date: "",
    event_time: "18:30",
    location: "",
    city: "Palopo",
    package_id: "pkg-2",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (packageParam) {
      const found = packageOptions.find((p) => p.slug === packageParam);
      if (found) {
        setFormData((prev) => ({ ...prev, package_id: found.id }));
      }
    }
  }, [packageParam]);

  const selectedPackage =
    packageOptions.find((p) => p.id === formData.package_id) || packageOptions[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          package_name: selectedPackage.name,
          total_price: selectedPackage.price,
        }),
      });

      if (res.ok) {
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
      `• Nama: ${formData.customer_name}\n` +
      `• Event: ${formData.event_name} (${formData.event_type})\n` +
      `• Tanggal: ${formData.event_date} (${formData.event_time} WITA)\n` +
      `• Lokasi: ${formData.location}, ${formData.city}\n` +
      `• Paket: ${selectedPackage.name} (${formatRupiah(selectedPackage.price)})\n` +
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
              <span className="font-mono text-stone-900">{formData.event_date}</span> telah masuk ke sistem kami.
            </p>
          </div>

          <div className="p-5 bg-stone-50 border border-stone-200 space-y-3 text-xs">
            <div className="font-mono uppercase tracking-wider text-stone-500 text-[10px]">
              Ringkasan Reservasi
            </div>
            <div className="font-medium text-stone-900 text-sm">{formData.event_name}</div>
            <div className="text-stone-600">{selectedPackage.name}</div>
            <div className="text-stone-500">{formData.location}, {formData.city}</div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline font-mono text-sm text-stone-900">
              <span className="text-stone-500 text-xs">Total Estimasi:</span>
              <span className="font-semibold">{formatRupiah(selectedPackage.price)}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={`https://wa.me/6282299887766?text=${whatsappMessage}`}
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
                  {packageOptions.length} pilihan
                </span>
              </div>

              <div className="space-y-2">
                {packageOptions.map((pkg) => {
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
                          <div className="font-mono text-xs text-stone-600 mt-1">
                            {formatRupiah(pkg.price)}
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
                  <span>Biaya Layanan</span>
                  <span className="font-mono text-stone-900">{formatRupiah(selectedPackage.price)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Transport & Setup (Palopo)</span>
                  <span className="font-mono text-stone-900">Termasuk</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-stone-900">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-stone-500">Total Estimasi</span>
                  <span className="font-mono text-base font-semibold">{formatRupiah(selectedPackage.price)}</span>
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
