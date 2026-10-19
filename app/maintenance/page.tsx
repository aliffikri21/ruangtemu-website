import { Metadata } from "next";
import Link from "next/link";
import { getMaintenanceConfig } from "@/lib/maintenance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sistem Sedang Dalam Pemeliharaan | RUANGTEMU Digital Palopo",
  description:
    "Layanan RUANGTEMU saat ini sedang dalam peningkatan performa berkala demi memberikan pengalaman terbaik bagi Anda.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MaintenancePage() {
  const config = await getMaintenanceConfig();

  return (
    <div className="min-h-[100dvh] bg-[#0B1437] text-white flex flex-col justify-between selection:bg-[#4318FF] selection:text-white relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#4318FF]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header with logo */}
      <header className="w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-ruangtemu.jpg"
            alt="RUANGTEMU"
            className="w-10 h-10 rounded-xl object-cover shadow-lg border border-white/10"
          />
          <div>
            <span className="font-bold text-lg tracking-tight text-white block leading-tight">
              RUANGTEMU
            </span>
            <span className="text-[11px] text-white/60 tracking-wider uppercase font-medium">
              Digital Photobooth Palopo
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Maintenance Mode</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 flex flex-col items-center justify-center text-center relative z-10">
        {/* Animated Status Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#1B2559] to-[#2B3674] border border-white/15 shadow-2xl flex items-center justify-center text-amber-400">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-[#0B1437] flex items-center justify-center text-[10px] text-slate-950 font-bold">
            !
          </span>
        </div>

        {/* Headings */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Kami Sedang Melakukan <br />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
            Peningkatan Sistem
          </span>
        </h1>

        <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-lg mb-8">
          {config.message ||
            "Website RUANGTEMU saat ini sedang dalam peningkatan performa berkala agar layanan photobooth tetap cepat dan stabil. Kami akan segera kembali online."}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md">
          {/* Reload Button */}
          <Link
            href="/"
            className="w-full sm:w-auto min-h-[48px] px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>Cek Status &amp; Muat Ulang</span>
          </Link>

          {/* WhatsApp Direct Help */}
          <a
            href="https://wa.me/6282259654167?text=Halo%20Admin%20RUANGTEMU,%20saya%20sedang%20mengakses%20website%20dan%20melihat%20status%20pemeliharaan.%20Bisa%20bantu%20informasi%20reservasi%20photobooth?"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[48px] px-6 rounded-xl bg-[#01B574] hover:bg-[#019660] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#01B574]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>Hubungi via WhatsApp</span>
          </a>
        </div>

        {/* Feature status notice */}
        <div className="mt-12 p-4 rounded-2xl bg-white/[0.04] border border-white/10 w-full max-w-md text-left">
          <div className="text-xs font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4318FF]" />
            <span>Informasi Reservasi &amp; Acara</span>
          </div>
          <p className="text-[12px] text-white/60 leading-relaxed">
            Pemesanan yang telah terjadwal dan sesi photobooth di lokasi acara tetap berlangsung normal dengan kru kami di lapangan.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 border-t border-white/10 relative z-10">
        <div>
          &copy; {new Date().getFullYear()} RUANGTEMU Virtual Photobooth Palopo. All rights reserved.
        </div>
        <div>
          <Link
            href="/admin"
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            Portal Pengelola
          </Link>
        </div>
      </footer>
    </div>
  );
}
