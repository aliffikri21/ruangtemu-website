"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { GalleryEntry, EventData } from "@/types";
import { resolveLandingThemeConfig } from "@/lib/theme-config";

interface Props {
  params: Promise<{ slug: string }>;
}

function isLightHex(color?: string): boolean {
  if (!color || color === "transparent") return false;
  const hex = color.trim().toLowerCase();
  if (hex === "white" || hex === "#fff" || hex === "#ffffff") return true;
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 195;
  }
  if (clean.length >= 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 195;
  }
  return false;
}

function formatDateCustom(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "08/10/2026";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "08/10/2026";
  }
}

function formatTimeCustom(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "13:00";
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch {
    return "13:00";
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

  const themeConfig = event ? resolveLandingThemeConfig(event.theme_config, event) : null;

  // Resolve primary color: prioritizes main CTA button color (cta1.bg) from Landing Page Editor
  const rawCtaBg = themeConfig?.cta1?.bg?.trim();
  const rawCtaIconBg = themeConfig?.cta1?.iconBg?.trim();
  const rawAccent = themeConfig?.layout?.accent?.trim();

  let primaryColor = isNurulIqra ? "#ad0d0d" : isJayaRika ? "#224DA5" : "#3a716c";
  if (rawCtaBg && !isLightHex(rawCtaBg)) {
    primaryColor = rawCtaBg;
  } else if (rawCtaIconBg && !isLightHex(rawCtaIconBg)) {
    primaryColor = rawCtaIconBg;
  } else if (rawAccent && !isLightHex(rawAccent)) {
    primaryColor = rawAccent;
  } else if (rawCtaBg) {
    primaryColor = rawCtaBg;
  }

  // Accent text color for text placed on white background
  const accentTextColor = isLightHex(primaryColor)
    ? rawCtaIconBg || rawAccent || (isNurulIqra ? "#ad0d0d" : isJayaRika ? "#224DA5" : "#3a716c")
    : primaryColor;

  const isLightPrimary = isLightHex(primaryColor);
  const onPrimaryTextColor = isLightPrimary ? "#09090b" : "#ffffff";
  const onPrimarySubtextColor = isLightPrimary ? "rgba(9, 9, 11, 0.75)" : "rgba(255, 255, 255, 0.9)";

  // Host name & title font: dynamically match Landing Page Editor title settings
  const displayHostName =
    themeConfig?.title?.text?.replace(/\n/g, " ")?.trim() ||
    event?.host_name ||
    (slug.includes("ilva") ? "Ilva & Ricky" : slug.includes("jaya") ? "Jaya & Rika" : event?.title || "Wedding Memories");

  const displayFont =
    themeConfig?.title?.font ||
    (isNurulIqra ? "Great Vibes" : "Great Vibes");

  const isScriptFont = ["Great Vibes", "Allura", "Dancing Script"].includes(displayFont);

  const headerBadge =
    themeConfig?.header?.left && themeConfig?.header?.right
      ? `${themeConfig.header.left} ${themeConfig.header.right}`.toUpperCase()
      : "WEDDING MEMORIES";

  if (!isLoading && event?.category === "photobooth") {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-stone-900 mb-2">Halaman Tidak Tersedia</h1>
        <p className="text-sm text-stone-600 max-w-md">
          Acara ini merupakan layanan Photobooth Fisik (cetak langsung di lokasi) dan tidak memiliki galeri virtual publik.
        </p>
      </div>
    );
  }

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
            {headerBadge}
          </span>
          <span
            className={`block select-none ${
              isScriptFont
                ? "text-3xl sm:text-4xl leading-none mt-0.5"
                : "text-2xl sm:text-3xl font-bold tracking-tight mt-0.5"
            }`}
            style={{
              color: accentTextColor,
              fontFamily: `'${displayFont}', serif, cursive, sans-serif`,
            }}
          >
            {displayHostName}
          </span>
        </div>
      </header>

      {/* Main Title & Action */}
      <div className="w-full px-5 max-w-xl mx-auto mt-4 mb-5 flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">
          Jelajahi <span style={{ color: accentTextColor }}>Kenangan</span>
        </h1>

        {!isLoading && entries.length > 0 && (
          <a
            href={`/api/events/${slug}/export-zip`}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-stone-200 bg-white shadow-sm text-stone-700 hover:text-stone-950 hover:bg-stone-50 active:scale-95 text-xs font-semibold transition-all cursor-pointer"
            title="Download seluruh foto album ini sebagai file ZIP"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Unduh ZIP ({entries.length})</span>
          </a>
        )}
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
              className="inline-flex items-center justify-center min-h-[46px] px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
              style={{ backgroundColor: primaryColor, color: onPrimaryTextColor }}
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
                  className="rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 overflow-hidden shadow-md cursor-pointer hover:shadow-xl active:scale-[0.98] transition-all"
                  style={{ backgroundColor: primaryColor, color: onPrimaryTextColor }}
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

                  <div className="px-2.5 sm:px-3 pt-2 pb-2">
                    <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase truncate leading-tight">
                      {entry.guest_name}
                    </h3>
                    <div
                      className="flex items-center justify-between text-[9px] sm:text-[10px] font-medium tracking-wider uppercase mt-1"
                      style={{ color: onPrimarySubtextColor }}
                    >
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
                  className="rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 overflow-hidden shadow-md cursor-pointer hover:shadow-xl active:scale-[0.98] transition-all"
                  style={{ backgroundColor: primaryColor, color: onPrimaryTextColor }}
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

                  <div className="px-2.5 sm:px-3 pt-2 pb-2">
                    <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase truncate leading-tight">
                      {entry.guest_name}
                    </h3>
                    <div
                      className="flex items-center justify-between text-[9px] sm:text-[10px] font-medium tracking-wider uppercase mt-1"
                      style={{ color: onPrimarySubtextColor }}
                    >
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
            className="rounded-3xl p-4 sm:p-5 shadow-2xl max-w-sm w-full relative overflow-hidden flex flex-col"
            style={{ backgroundColor: primaryColor, color: onPrimaryTextColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar inside Modal */}
            <div
              className="flex items-center justify-between pb-2 border-b"
              style={{ borderColor: isLightPrimary ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)" }}
            >
              <a
                href={selectedEntry.photo_url}
                download={`ruangtemu_${selectedEntry.guest_name}.png`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm underline underline-offset-4"
                style={{ color: onPrimaryTextColor }}
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
                className="font-semibold text-xs sm:text-sm underline underline-offset-4"
                style={{ color: onPrimaryTextColor }}
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
              <h2
                className="text-xl sm:text-2xl font-bold uppercase tracking-wide leading-tight"
                style={{ color: onPrimaryTextColor }}
              >
                {selectedEntry.guest_name}
              </h2>
              <div
                className="flex items-center justify-between text-xs sm:text-sm uppercase font-medium mt-1"
                style={{ color: onPrimarySubtextColor }}
              >
                <span>{formatDateCustom(selectedEntry.created_at)}</span>
                <span>{formatTimeCustom(selectedEntry.created_at)}</span>
              </div>

              {selectedEntry.message && (
                <p
                  className="mt-3 rounded-xl p-2.5 text-xs italic leading-relaxed"
                  style={{
                    backgroundColor: isLightPrimary ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.25)",
                    color: onPrimaryTextColor,
                  }}
                >
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
