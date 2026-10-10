"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { GalleryEntry, EventData } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDateCustom(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "08 OKT 2026";
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "JAN", "FEB", "MAR", "APR", "MEI", "JUN",
      "JULI", "AGU", "SEP", "OKT", "NOV", "DES"
    ];
    const month = months[d.getMonth()] || "OKT";
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "08 OKT 2026";
  }
}

function formatTimeCustom(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "18.57 WIB";
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}.${minutes} WIB`;
  } catch {
    return "18.57 WIB";
  }
}

export default function EventGalleryPage({ params }: Props) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [event, setEvent] = useState<EventData | null>(null);
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<GalleryEntry | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [eventRes, entriesRes] = await Promise.all([
          fetch(`/api/events/${slug}`),
          fetch(`/api/events/${slug}/entries`, { cache: "no-store" }),
        ]);

        if (eventRes.ok) {
          const evData = await eventRes.json();
          if (isMounted && evData.event) {
            setEvent(evData.event);
          }
        }

        if (entriesRes.ok) {
          const entData = await entriesRes.json();
          if (isMounted && entData.entries) {
            setEntries(entData.entries);
          }
        }
      } catch (err) {
        console.error("Error loading gallery data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [slug]);

  // Separate into 2 columns for a masonry flow
  const col1 = entries.filter((_, idx) => idx % 2 === 0);
  const col2 = entries.filter((_, idx) => idx % 2 === 1);

  const isNurulIqra = slug.includes("nurul") || slug.includes("iqra");
  const isJayaRika = slug.includes("jaya") || slug.includes("rika");
  const primaryColor = isNurulIqra ? "#ad0d0d" : isJayaRika ? "#224DA5" : "#3a716c";
  const accentTextColor = isNurulIqra ? "#b50000" : isJayaRika ? "#224DA5" : "#3a716c";

  const displayHostName = event?.host_name || (slug.includes("ilva") ? "Ilva & Ricky" : slug.includes("jaya") ? "Jaya & Rika" : event?.title || "Wedding Memories");

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] text-stone-900 flex flex-col antialiased">
      {/* Top Header */}
      <header className="w-full px-5 pt-6 pb-2 max-w-xl mx-auto flex items-center justify-between">
        <Link
          href={`/event/${slug}`}
          className="w-12 h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center shadow-sm text-stone-800 hover:bg-stone-50 active:scale-95 transition-all"
          aria-label="Kembali ke photobooth"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>

        <div className="text-right select-none">
          <span className="block font-sans text-[11px] tracking-wider font-semibold text-stone-600 uppercase">
            WEDDING MEMORIES
          </span>
          <span
            className="block font-[family-name:var(--font-great-vibes)] text-3xl sm:text-4xl leading-none mt-0.5"
            style={{ color: accentTextColor }}
          >
            {displayHostName}
          </span>
        </div>
      </header>

      {/* Main Title */}
      <div className="w-full px-5 max-w-xl mx-auto mt-4 mb-5">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">
          Jelajahi <span style={{ color: accentTextColor }}>Kenangan</span>
        </h1>
      </div>

      {/* Gallery Content */}
      <main className="flex-1 w-full max-w-xl mx-auto px-5 pb-12">
        {isLoading ? (
          <div className="text-center py-24 text-stone-400 font-sans text-sm">
            Memuat album kenangan...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-4 my-8 shadow-sm">
            <h3 className="font-bold text-lg text-stone-900">Belum Ada Foto</h3>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
              Foto yang diambil melalui virtual photobooth akan otomatis muncul di sini.
            </p>
            <Link
              href={`/event/${slug}`}
              className="inline-flex items-center justify-center min-h-[46px] px-6 py-2.5 rounded-full text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              Mulai Ambil Foto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 items-start">
            {/* Column 1 */}
            <div className="flex flex-col gap-3.5 sm:gap-4">
              {col1.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 overflow-hidden shadow-md cursor-pointer hover:shadow-xl active:scale-[0.98] transition-all text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="w-full bg-stone-900/10 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.photo_url}
                      alt={`Foto oleh ${entry.guest_name}`}
                      className="w-full h-auto object-contain block select-none pointer-events-none"
                      loading="lazy"
                    />
                  </div>

                  <div className="px-2.5 sm:px-3 pt-2 pb-2 text-white">
                    <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase truncate leading-tight">
                      {entry.guest_name}
                    </h3>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-white/90 font-medium tracking-wider uppercase mt-1">
                      <span>{formatDateCustom(entry.created_at)}</span>
                      <span>{formatTimeCustom(entry.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-3.5 sm:gap-4">
              {col2.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 overflow-hidden shadow-md cursor-pointer hover:shadow-xl active:scale-[0.98] transition-all text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="w-full bg-stone-900/10 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.photo_url}
                      alt={`Foto oleh ${entry.guest_name}`}
                      className="w-full h-auto object-contain block select-none pointer-events-none"
                      loading="lazy"
                    />
                  </div>

                  <div className="px-2.5 sm:px-3 pt-2 pb-2 text-white">
                    <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase truncate leading-tight">
                      {entry.guest_name}
                    </h3>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-white/90 font-medium tracking-wider uppercase mt-1">
                      <span>{formatDateCustom(entry.created_at)}</span>
                      <span>{formatTimeCustom(entry.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Detail / Preview Popup */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="text-white rounded-3xl p-4 sm:p-5 shadow-2xl max-w-sm w-full relative overflow-hidden flex flex-col"
            style={{ backgroundColor: primaryColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar inside Modal */}
            <div className="flex items-center justify-between pb-2 border-b border-white/20">
              <a
                href={selectedEntry.photo_url}
                download={`ruangtemu_${selectedEntry.guest_name}.png`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-white hover:text-white/80 font-semibold text-xs sm:text-sm underline underline-offset-4"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Unduh Softfile</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="text-white hover:text-white/80 font-semibold text-xs sm:text-sm underline underline-offset-4"
              >
                Tutup
              </button>
            </div>

            {/* Photo Preview inside white framed container */}
            <div className="bg-white rounded-2xl p-2 sm:p-3 my-3 shadow-inner flex items-center justify-center max-h-[55vh] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedEntry.photo_url}
                alt={selectedEntry.guest_name}
                className="max-h-[50vh] w-auto max-w-full object-contain rounded-xl block"
              />
            </div>

            {/* Guest Details */}
            <div className="pt-1">
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide leading-tight">
                {selectedEntry.guest_name}
              </h2>
              <div className="flex items-center justify-between text-xs sm:text-sm text-white/90 uppercase font-medium mt-1">
                <span>{formatDateCustom(selectedEntry.created_at)}</span>
                <span>{formatTimeCustom(selectedEntry.created_at)}</span>
              </div>

              {selectedEntry.message && (
                <p className="mt-3 bg-black/20 rounded-xl p-2.5 text-xs text-white/95 italic leading-relaxed">
                  &ldquo;{selectedEntry.message}&rdquo;
                </p>
              )}

              {selectedEntry.voice_note_url && (
                <div className="mt-2.5">
                  <audio
                    src={selectedEntry.voice_note_url}
                    controls
                    className="w-full h-8 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
