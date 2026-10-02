import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getPackages } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";

export default async function HomePage() {
  const packages = await getPackages();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-zinc-900">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-32 bg-white border-b border-stone-200">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
                Abadikan momen
                <br />
                paling berkesan
              </h1>

              <p className="mt-5 text-stone-500 text-[15px] sm:text-base leading-relaxed max-w-lg">
                Photobooth modern dengan cetak instan 12 detik dan Virtual Web Photobooth yang
                bisa diakses langsung dari browser smartphone tamu. Tanpa install aplikasi.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/booking"
                  className="min-h-[44px] px-6 py-3 bg-[#c47a5a] hover:bg-[#b06a4a] text-white text-sm font-medium rounded-md transition-colors text-center"
                >
                  Reservasi Jadwal Acara
                </Link>
                <Link
                  href="/event/wedding-andi-sarah"
                  className="min-h-[44px] px-6 py-3 border border-stone-300 hover:border-stone-400 text-zinc-900 text-sm font-medium rounded-md transition-colors text-center"
                >
                  Coba Demo Virtual Booth
                </Link>
              </div>
            </div>

            {/* Photo strip preview */}
            <div className="mt-16 grid grid-cols-3 gap-3 max-w-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="aspect-[3/4] rounded-md overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop"
                  alt="Wedding couple in Palopo"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="aspect-[3/4] rounded-md overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop"
                  alt="Wedding guests celebrating"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="aspect-[3/4] rounded-md overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=600&auto=format&fit=crop"
                  alt="Couple happy moments"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-3 text-center mt-1">
                <span className="text-[11px] text-stone-400 tracking-wide">
                  Andi &amp; Sarah &middot; 15 Oktober 2026 &middot; Banua Subur, Palopo
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* LAYANAN */}
        <section id="fitur" className="py-20 md:py-28 bg-[#fafaf9]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-md">
              <p className="text-xs tracking-widest uppercase text-stone-400 font-medium">
                Layanan
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
                Apa yang kami sediakan
              </h2>
            </div>

            <div className="mt-12 space-y-0 divide-y divide-stone-200">
              <div className="py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-8">
                <div className="sm:col-span-4">
                  <h3 className="text-sm font-semibold text-zinc-950">Cetak Sublimasi Cepat</h3>
                </div>
                <div className="sm:col-span-8">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Printer foto DNP berkecepatan tinggi, hanya 12 detik per cetakan. Kertas foto tahan air, anti pudar, dan tajam hingga puluhan tahun.
                  </p>
                </div>
              </div>

              <div className="py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-8">
                <div className="sm:col-span-4">
                  <h3 className="text-sm font-semibold text-zinc-950">Virtual Photobooth</h3>
                </div>
                <div className="sm:col-span-8">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Tamu cukup scan QR Code di meja dengan kamera smartphone mereka. Langsung foto dengan template frame event, tanpa install aplikasi.
                  </p>
                </div>
              </div>

              <div className="py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-8">
                <div className="sm:col-span-4">
                  <h3 className="text-sm font-semibold text-zinc-950">Live Videotron</h3>
                </div>
                <div className="sm:col-span-8">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Mode slideshow otomatis untuk proyektor atau videotron panggung. Foto dan doa restu tamu muncul seketika di layar venue.
                  </p>
                </div>
              </div>

              <div className="py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-8">
                <div className="sm:col-span-4">
                  <h3 className="text-sm font-semibold text-zinc-950">Voice Note Guestbook</h3>
                </div>
                <div className="sm:col-span-8">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Tamu dapat merekam pesan suara, doa restu, atau keceriaan mereka untuk pasangan pengantin. Bukan hanya ucapan teks biasa.
                  </p>
                </div>
              </div>

              <div className="py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-8">
                <div className="sm:col-span-4">
                  <h3 className="text-sm font-semibold text-zinc-950">Frame Kustom</h3>
                </div>
                <div className="sm:col-span-8">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Template Strip 3-Foto, 4-Grid, Polaroid, hingga Deluxe. Font, palet warna, dan logo acara disesuaikan untuk setiap event.
                  </p>
                </div>
              </div>

              <div className="py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-8">
                <div className="sm:col-span-4">
                  <h3 className="text-sm font-semibold text-zinc-950">Live Gallery &amp; Unduhan HD</h3>
                </div>
                <div className="sm:col-span-8">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Semua tamu dapat menelusuri galeri foto secara realtime dan mengunduh hasil jepretan dalam resolusi penuh tanpa kompresi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PAKET */}
        <section id="paket" className="py-20 md:py-28 bg-white border-y border-stone-200">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-md">
              <p className="text-xs tracking-widest uppercase text-stone-400 font-medium">
                Paket
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
                Pilih sesuai kebutuhan acara Anda
              </h2>
              <p className="mt-3 text-sm text-stone-500">
                Untuk resepsi pernikahan, ulang tahun, wisuda, atau gathering di Palopo dan sekitarnya.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-stone-200 border border-stone-200 rounded-md overflow-hidden">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white p-6 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-950">{pkg.name}</h3>
                    <p className="mt-1 text-xs text-stone-400 line-clamp-2">{pkg.tagline}</p>

                    <div className="mt-4 mb-5 pb-4 border-b border-stone-100">
                      <span className="text-xl font-bold text-zinc-950 tracking-tight">
                        {formatRupiah(pkg.price)}
                      </span>
                      <span className="text-xs text-stone-400 ml-1">/ event</span>
                      <div className="mt-1 text-xs text-stone-500">
                        Durasi: {pkg.duration_hours} Jam
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-stone-500 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-zinc-950 mt-0.5 shrink-0">&bull;</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/booking?package=${pkg.slug}`}
                    className="w-full min-h-[44px] flex items-center justify-center py-2.5 text-xs font-medium text-center rounded-md transition-colors bg-stone-100 hover:bg-stone-200 text-zinc-900"
                  >
                    Pilih Paket Ini
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-stone-400">
                Butuh paket khusus untuk luar kota Palopo?{" "}
                <a
                  href="https://wa.me/6282299887766?text=Halo%20RUANGTEMU,%20saya%20ingin%20konsultasi%20paket%20custom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-950 hover:underline font-medium"
                >
                  Hubungi via WhatsApp
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ALUR PEMESANAN */}
        <section className="py-20 md:py-28 bg-[#fafaf9]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-md">
              <p className="text-xs tracking-widest uppercase text-stone-400 font-medium">
                Cara Kerja
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
                Dari reservasi hingga kenangan
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <span className="text-xs font-medium text-stone-400">01</span>
                <h4 className="mt-1 text-sm font-semibold text-zinc-950">Pilih Paket &amp; Tanggal</h4>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                  Isi formulir reservasi online atau hubungi admin untuk mengamankan tanggal acara Anda.
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-stone-400">02</span>
                <h4 className="mt-1 text-sm font-semibold text-zinc-950">Kustomisasi Bingkai</h4>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                  Tim desainer menyiapkan template frame eksklusif sesuai tema, font, dan warna dekorasi Anda.
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-stone-400">03</span>
                <h4 className="mt-1 text-sm font-semibold text-zinc-950">Keseruan di Hari H</h4>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                  Kru mendampingi operasional booth cetak, tamu mengakses Virtual Booth via QR di setiap meja.
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-stone-400">04</span>
                <h4 className="mt-1 text-sm font-semibold text-zinc-950">Kenangan Tersimpan</h4>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                  Tamu membawa pulang cetakan fisik, penyelenggara menerima arsip digital lengkap.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONI */}
        <section className="py-20 md:py-28 bg-white border-t border-stone-200">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-md mb-12">
              <p className="text-xs tracking-widest uppercase text-stone-400 font-medium">
                Klien
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
                Cerita mereka bersama RUANGTEMU
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-sm text-stone-600 leading-relaxed">
                  &ldquo;Tamu resepsi di Banua Subur antusias sekali. Hasil cetak fotonya sangat jernih, krunya ramah dan sabar mengarahkan gaya. Fitur Virtual Booth juga bikin tamu yang duduk di meja bisa ikut seru-seruan.&rdquo;
                </p>
                <div>
                  <div className="text-sm font-semibold text-zinc-950">Andi Pratama &amp; Sarah</div>
                  <div className="text-xs text-stone-400">Pernikahan, Banua Subur Hall, Palopo</div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-stone-600 leading-relaxed">
                  &ldquo;Fitur Voice Note Guestbook sangat berkesan. Setelah acara, kami mendengarkan kembali rekaman ucapan dari para sahabat. Ada yang mengharukan dan ada yang lucu sekali.&rdquo;
                </p>
                <div>
                  <div className="text-sm font-semibold text-zinc-950">dr. Rian &amp; Nurul</div>
                  <div className="text-xs text-stone-400">Resepsi, Merdeka Convention Hall, Palopo</div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-stone-600 leading-relaxed">
                  &ldquo;Untuk acara gathering komunitas, RUANGTEMU sangat rapi dan tepat waktu. Tayangan live projection di videotron membuat suasana venue panggung jadi interaktif.&rdquo;
                </p>
                <div>
                  <div className="text-sm font-semibold text-zinc-950">Komunitas Kreatif Luwu</div>
                  <div className="text-xs text-stone-400">Palopo Youth Creative Festival</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="py-12 px-8 sm:px-12 bg-zinc-950 rounded-md text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white max-w-md mx-auto tracking-tight">
                Jadikan momen perayaan Anda tak terlupakan
              </h2>
              <p className="mt-3 text-stone-400 text-sm max-w-sm mx-auto">
                Jadwal akhir pekan cepat terisi. Hubungi kami sekarang untuk konsultasi dan kunci tanggal acara.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/booking"
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center px-6 py-2.5 bg-white text-zinc-950 hover:bg-stone-100 text-sm font-medium rounded-md transition-colors"
                >
                  Booking Jadwal
                </Link>
                <a
                  href="https://wa.me/6282299887766?text=Halo%20RUANGTEMU%20Photobooth,%20saya%20ingin%20tanya%20ketersediaan%20jadwal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center px-6 py-2.5 border border-stone-700 hover:border-stone-500 text-stone-300 text-sm font-medium rounded-md transition-colors"
                >
                  Chat WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
