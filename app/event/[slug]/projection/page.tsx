"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { GalleryEntry } from "@/types";
import QRCode from "qrcode";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProjectionModePage({ params }: Props) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Generate QR Code for the event URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const eventUrl = `${window.location.origin}/event/${slug}`;
      QRCode.toDataURL(eventUrl, {
        width: 180,
        margin: 1,
        color: { dark: "#18181b", light: "#ffffff" },
      }).then(setQrDataUrl);
    }
  }, [slug]);

  // Fetch entries
  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/events/${slug}/entries`);
      const data = await res.json();
      if (data.entries && data.entries.length > 0) {
        setEntries(data.entries);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEntries();
    const pollInterval = setInterval(fetchEntries, 15000);
    return () => clearInterval(pollInterval);
  }, [slug]);

  // Auto-advance slideshow every 7 seconds
  useEffect(() => {
    if (!isPlaying || entries.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % entries.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPlaying, entries.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const currentEntry = entries[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[#0f0f11] text-stone-100 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Controls Bar */}
      <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <Link
            href={`/event/${slug}/gallery`}
            className="font-mono text-xs text-stone-400 hover:text-white px-3 py-1.5 border border-stone-800 bg-[#18181b]/80 transition-colors"
          >
            ← Galeri
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47a5a]">
              [ Videotron Projection ]
            </span>
            <span className="font-mono text-xs text-stone-400">
              {entries.length > 0 ? currentIndex + 1 : 0} / {entries.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="min-h-[36px] px-3.5 border border-stone-800 bg-[#18181b]/80 hover:bg-stone-800 font-mono text-xs text-stone-300 transition-colors"
          >
            {isPlaying ? "Jeda" : "Putar"}
          </button>
          <button
            onClick={toggleFullscreen}
            className="min-h-[36px] px-3.5 border border-stone-800 bg-[#18181b]/80 hover:bg-stone-800 font-mono text-xs text-stone-300 transition-colors"
          >
            {isFullscreen ? "Kecilkan" : "Layar Penuh"}
          </button>
        </div>
      </div>

      {/* Main Showcase Area */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-14 relative">
        {entries.length === 0 ? (
          <div className="text-center space-y-4 max-w-sm">
            <span className="font-mono text-xs uppercase tracking-widest text-[#c47a5a] block">
              [ Menunggu Data ]
            </span>
            <h2 className="text-2xl font-light text-white">Menunggu Foto Tamu</h2>
            <p className="text-stone-400 text-xs leading-relaxed">
              Pindai kode QR pada layar untuk mulai mengambil foto dan mengirim ucapan hangat.
            </p>
          </div>
        ) : currentEntry ? (
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Photobooth Frame High-Impact Preview */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="p-3 bg-[#18181b] border border-stone-800 max-h-[75vh] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentEntry.photo_url}
                  alt={`Photobooth dari ${currentEntry.guest_name}`}
                  className="max-h-[70vh] object-contain"
                />
              </div>
            </div>

            {/* Right: Guest Wish, Audio & Host Attribution */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47a5a]">
                  [ Tamu Acara ]
                </span>
                <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                  {currentEntry.guest_name}
                </h2>
              </div>

              {currentEntry.message && (
                <div className="p-6 bg-[#18181b] border border-stone-800">
                  <p className="text-base sm:text-xl text-stone-200 font-light italic leading-relaxed">
                    &ldquo;{currentEntry.message}&rdquo;
                  </p>
                </div>
              )}

              {/* Voice note indicator */}
              {currentEntry.voice_note_url && (
                <div className="p-4 bg-[#18181b] border border-stone-800 space-y-2">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                    Voice Note Tamu
                  </div>
                  <audio
                    src={currentEntry.voice_note_url}
                    controls
                    autoPlay
                    className="w-full h-8"
                  />
                </div>
              )}

              <div className="font-mono text-xs text-stone-500">
                RUANGTEMU Live Stream • Palopo
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Floating QR Code in bottom-right corner for seated guests */}
      <div className="absolute bottom-6 right-6 p-4 bg-white text-stone-900 border border-stone-200 flex items-center gap-4 z-30">
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Scan QR Code" className="w-18 h-18" />
        )}
        <div className="max-w-[140px]">
          <div className="font-mono text-[10px] uppercase tracking-wider font-semibold text-stone-950">
            Scan untuk Foto
          </div>
          <p className="text-[11px] text-stone-600 leading-tight mt-1">
            Buka kamera HP dan abadikan momen Anda.
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      {entries.length > 1 && (
        <div className="h-1 bg-stone-900 w-full relative">
          <div
            className="h-full bg-[#c47a5a] transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / entries.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
