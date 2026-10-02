"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-zinc-950">
            RUANGTEMU
          </span>
          <span className="text-[10px] tracking-widest uppercase text-stone-400 font-medium">
            Palopo
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] text-stone-500">
          <Link href="/" className="hover:text-zinc-950 transition-colors">
            Beranda
          </Link>
          <Link href="/#fitur" className="hover:text-zinc-950 transition-colors">
            Layanan
          </Link>
          <Link href="/#paket" className="hover:text-zinc-950 transition-colors">
            Paket
          </Link>
          <Link
            href="/event/wedding-andi-sarah"
            className="hover:text-zinc-950 transition-colors"
          >
            Demo
          </Link>
          <Link href="/event/wedding-andi-sarah/gallery" className="hover:text-zinc-950 transition-colors">
            Galeri
          </Link>
          <Link href="/admin" className="hover:text-zinc-950 transition-colors">
            Admin
          </Link>
        </nav>

        <div className="hidden md:block">
          <Link
            href="/booking"
            className="px-4 py-2 text-[13px] font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-md transition-colors"
          >
            Reservasi
          </Link>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-11 h-11 flex items-center justify-center text-stone-600 hover:text-zinc-950 transition-colors"
          aria-label="Toggle navigasi menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-5 pt-2 pb-5 space-y-0.5">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3 text-sm text-stone-600 hover:text-zinc-950"
          >
            Beranda
          </Link>
          <Link
            href="/#fitur"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3 text-sm text-stone-600 hover:text-zinc-950"
          >
            Layanan
          </Link>
          <Link
            href="/#paket"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3 text-sm text-stone-600 hover:text-zinc-950"
          >
            Paket
          </Link>
          <Link
            href="/event/wedding-andi-sarah"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3 text-sm text-stone-600 hover:text-zinc-950"
          >
            Demo Photobooth
          </Link>
          <Link
            href="/event/wedding-andi-sarah/gallery"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3 text-sm text-stone-600 hover:text-zinc-950"
          >
            Galeri Tamu
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-3 text-sm text-stone-400 hover:text-zinc-900"
          >
            Admin
          </Link>
          <div className="pt-3">
            <Link
              href="/booking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full min-h-[44px] flex items-center justify-center px-4 py-2.5 bg-zinc-950 text-white text-sm font-medium rounded-md"
            >
              Reservasi Jadwal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
