import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white text-stone-500 text-[13px]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="space-y-3">
            <span className="font-semibold text-sm text-zinc-950 tracking-tight">
              RUANGTEMU
            </span>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
              Platform photobooth fisik dan virtual modern di Kota Palopo dan Tana Luwu.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-medium text-zinc-900 tracking-wider uppercase">
              Layanan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#paket" className="text-stone-500 hover:text-zinc-950 transition-colors">
                  Paket Photobooth
                </Link>
              </li>
              <li>
                <Link href="/#fitur" className="text-stone-500 hover:text-zinc-950 transition-colors">
                  Virtual Web Photobooth
                </Link>
              </li>
              <li>
                <Link href="/event/wedding-andi-sarah/projection" className="text-stone-500 hover:text-zinc-950 transition-colors">
                  Live Videotron
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-stone-500 hover:text-zinc-950 transition-colors">
                  Reservasi Jadwal
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-medium text-zinc-900 tracking-wider uppercase">
              Kontak
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/6282299887766?text=Halo%20RUANGTEMU%20Photobooth,%20saya%20ingin%20tanya%20paket%20photobooth"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-stone-500 hover:text-zinc-950 transition-colors"
              >
                +62 822-9988-7766 (WhatsApp)
              </a>
              <a
                href="https://instagram.com/ruangtemu_photobooth"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-stone-500 hover:text-zinc-950 transition-colors"
              >
                @ruangtemu_photobooth
              </a>
              <span className="block text-stone-400">
                halo@ruangtemu.id
              </span>
              <span className="block text-stone-400">
                Kota Palopo, Sulawesi Selatan
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>&copy; {new Date().getFullYear()} RUANGTEMU Digital. Palopo, Sulawesi Selatan.</p>
          <div className="flex items-center gap-5">
            <Link href="/admin" className="hover:text-zinc-950 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
