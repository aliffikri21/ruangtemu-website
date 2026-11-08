import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Acara Tidak Ditemukan | RUANGTEMU Digital",
  description: "Halaman atau tautan acara photobooth yang Anda cari tidak ditemukan.",
};

export default function NotFound() {
  const waNumber = process.env.NEXT_PUBLIC_RUANGTEMU_WA || "6282244866088";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Halo RUANGTEMU, saya mengalami kendala tautan acara / kode QR tidak ditemukan (Error 404)."
  )}`;

  return (
    <div className="min-h-[100dvh] bg-[#070B14] text-white flex flex-col items-center justify-between p-6 sm:p-8 font-sans selection:bg-[#4318FF]/30">
      {/* Header Logo */}
      <header className="w-full max-w-md flex items-center justify-between pt-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-md">
            <Image
              src="/logo-ruangtemu.jpg"
              alt="RUANGTEMU"
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              priority
            />
          </div>
          <span className="font-bold tracking-wider text-sm uppercase text-white/90 group-hover:text-white transition-colors">
            RUANGTEMU
          </span>
        </Link>
        <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
          Status 404
        </span>
      </header>

      {/* Main Content Box (Mobile First: 360–430px optimal) */}
      <main className="w-full max-w-md my-auto py-8 flex flex-col items-center text-center">
        {/* Glow & Badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4318FF]/20 to-amber-500/10 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 rounded-3xl bg-[#0E1626] border border-white/10 flex items-center justify-center shadow-2xl">
            <svg
              className="w-12 h-12 text-amber-400/90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          Acara Tidak Ditemukan
        </h1>
        <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm mb-6">
          Tautan acara atau kode QR yang Anda tuju tidak terdaftar di sistem kami, belum diaktifkan oleh operator, atau masa aktif acara telah selesai.
        </p>

        {/* Action Checkpoints */}
        <div className="w-full bg-[#0E1626]/80 border border-white/5 rounded-2xl p-4 text-left text-xs space-y-2.5 mb-8">
          <p className="font-semibold text-white/80 uppercase tracking-wider text-[10px] font-mono">
            Panduan untuk Tamu:
          </p>
          <div className="flex items-start gap-2 text-white/70">
            <span className="text-amber-400 font-bold shrink-0">1.</span>
            <span>Periksa kembali penulisan URL/slug acara di browser Anda.</span>
          </div>
          <div className="flex items-start gap-2 text-white/70">
            <span className="text-amber-400 font-bold shrink-0">2.</span>
            <span>Pindai ulang QR Code resmi yang tersedia di kartu meja pernikahan.</span>
          </div>
          <div className="flex items-start gap-2 text-white/70">
            <span className="text-amber-400 font-bold shrink-0">3.</span>
            <span>Jika acara sedang berlangsung, tanyakan operator photobooth di lokasi.</span>
          </div>
        </div>

        {/* Buttons (Touch target minimal 48px sesuai standar Mobile) */}
        <div className="w-full space-y-3">
          <Link
            href="/"
            className="w-full h-12 flex items-center justify-center gap-2 bg-[#4318FF] hover:bg-[#3311DB] active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#4318FF]/20 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/10 text-white/80 hover:text-white font-medium text-sm rounded-xl transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
            </svg>
            Bantuan Operator WhatsApp
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-[11px] text-white/30 pt-4 border-t border-white/5">
        &copy; {new Date().getFullYear()} RUANGTEMU Virtual Photobooth Palopo
      </footer>
    </div>
  );
}
