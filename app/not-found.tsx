import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Bricolage_Grotesque, DM_Mono, Instrument_Sans } from "next/font/google";
import NotFoundArt from "./not-found-art";
import "./not-found.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-nf-display",
  display: "swap",
});
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-nf-mono",
  display: "swap",
});
const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-nf-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "404 - Acara Tidak Ditemukan | RUANGTEMU Digital",
  description: "Halaman atau tautan acara photobooth yang Anda cari tidak ditemukan.",
};

const GUIDE = [
  "Periksa kembali penulisan URL/slug acara di browser Anda.",
  "Pindai ulang QR Code resmi yang tersedia di kartu meja pernikahan.",
  "Jika acara sedang berlangsung, tanyakan operator photobooth di lokasi.",
];

export default function NotFound() {
  const waNumber = process.env.NEXT_PUBLIC_RUANGTEMU_WA || "6282244866088";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Halo RUANGTEMU, saya mengalami kendala tautan acara / kode QR tidak ditemukan (Error 404)."
  )}`;

  return (
    <div className={`nf ${display.variable} ${mono.variable} ${body.variable}`}>
      {/* Header */}
      <header className="nf-head">
        <Link href="/" className="nf-logo" aria-label="RUANGTEMU, ke beranda">
          <span className="nf-logo-img">
            <Image src="/logo-ruangtemu.jpg" alt="" fill sizes="36px" priority />
          </span>
          <span className="nf-logo-text">RUANGTEMU</span>
        </Link>
        <span className="nf-pill">
          <i className="nf-dot" />
          Status 404
        </span>
      </header>

      {/* Konten utama (mobile first: 360-430px) */}
      <main className="nf-main">
        <NotFoundArt />

        <h1 className="nf-title">
          Acara <em>tidak ditemukan</em>
        </h1>
        <p className="nf-lead">
          Tautan acara atau kode QR yang Anda tuju tidak terdaftar di sistem kami, belum diaktifkan oleh operator, atau
          masa aktif acara telah selesai.
        </p>

        <section className="nf-guide" aria-labelledby="nf-guide-title">
          <h2 id="nf-guide-title">Panduan untuk tamu</h2>
          <ol>
            {GUIDE.map((text) => (
              <li key={text}>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Tombol (target sentuh minimal 48px) */}
        <div className="nf-actions">
          <Link href="/" className="nf-btn nf-btn-main">
            Kembali ke Beranda
            <span className="nf-btn-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </span>
          </Link>

          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="nf-btn nf-btn-alt">
            Bantuan Operator WhatsApp
            <span className="nf-btn-ic">
              <svg className="nf-wa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
              </svg>
            </span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="nf-foot">&copy; {new Date().getFullYear()} RUANGTEMU Virtual Photobooth Palopo</footer>
    </div>
  );
}
