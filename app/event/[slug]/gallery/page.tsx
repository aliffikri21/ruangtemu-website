"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { GalleryEntry } from "@/types";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function EventGalleryPage({ params }: Props) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [likedEntries, setLikedEntries] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGalleryData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/events/${slug}/entries`);
      const data = await res.json();
      if (data.entries) {
        setEntries(data.entries);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
    const interval = setInterval(fetchGalleryData, 12000);
    return () => clearInterval(interval);
  }, [slug]);

  const handleLike = (id: string, currentCount = 0) => {
    setLikedEntries((prev) => ({
      ...prev,
      [id]: (prev[id] ?? currentCount) + 1,
    }));
  };

  const filteredEntries = entries.filter((e) =>
    e.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.message && e.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-white px-5 sm:px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/event/${slug}`}
              className="font-mono text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              ← Booth
            </Link>
            <div className="border-l border-stone-200 pl-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47a5a] block">
                [ Live Galeri ]
              </span>
              <h1 className="font-light text-base sm:text-lg text-stone-950">
                Koleksi Foto & Doa Tamu
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <Link
              href={`/event/${slug}/projection`}
              className="text-stone-600 hover:text-stone-950 underline transition-colors"
            >
              Mode Layar ↗
            </Link>
            <Link
              href={`/event/${slug}`}
              className="min-h-[36px] px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-medium uppercase tracking-wider transition-colors flex items-center"
            >
              + Ambil Foto
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search and Refresh bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-6 border-b border-stone-200">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Cari nama tamu atau isi pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[40px] px-3.5 py-2 bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:border-stone-900 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono">
            <span className="text-stone-400">
              {entries.length} foto tersimpan
            </span>
            <button
              onClick={fetchGalleryData}
              disabled={isRefreshing}
              className="text-stone-600 hover:text-stone-950 transition-colors"
            >
              {isRefreshing ? "Memperbarui..." : "Perbarui Data ⟳"}
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="text-center py-20 font-mono text-xs text-stone-400">
            Memuat kenangan acara...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 bg-white border border-stone-200 text-center space-y-4 max-w-sm mx-auto my-12">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47a5a]">
              [ Kosong ]
            </span>
            <h3 className="font-light text-base text-stone-900">Belum Ada Foto</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Jadilah yang pertama mengabadikan momen di photobooth ini.
            </p>
            <Link
              href={`/event/${slug}`}
              className="inline-block min-h-[38px] px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs uppercase tracking-wider transition-colors"
            >
              Buka Kamera
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredEntries.map((entry) => {
              const currentLikes = likedEntries[entry.id] ?? entry.likes_count ?? 0;
              return (
                <div
                  key={entry.id}
                  className="bg-white border border-stone-200 flex flex-col justify-between"
                >
                  {/* Photo Canvas/Image */}
                  <div className="bg-stone-50 p-2 flex items-center justify-center border-b border-stone-150">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.photo_url}
                      alt={`Foto oleh ${entry.guest_name}`}
                      className="max-h-72 w-auto object-contain"
                    />
                  </div>

                  {/* Entry Information */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-stone-900 truncate">
                          {entry.guest_name}
                        </span>
                        <button
                          onClick={() => handleLike(entry.id, entry.likes_count)}
                          className="font-mono text-[11px] text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          ♥ {currentLikes}
                        </button>
                      </div>

                      {entry.message && (
                        <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 border border-stone-150 leading-relaxed">
                          &ldquo;{entry.message}&rdquo;
                        </p>
                      )}

                      {entry.voice_note_url && (
                        <div className="pt-1.5">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 flex items-center gap-1.5 mb-1">
                            <span>🎤</span>
                            <span>Pesan Suara (Voice Note)</span>
                          </span>
                          <audio
                            src={entry.voice_note_url}
                            controls
                            preload="metadata"
                            className="w-full h-9 rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between font-mono text-[10px] text-stone-400">
                      <span>{formatDate(entry.created_at)}</span>
                      <a
                        href={entry.photo_url}
                        download={`ruangtemu_${entry.guest_name}.png`}
                        className="text-stone-700 hover:text-stone-950 underline"
                      >
                        Unduh Foto
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 bg-white px-5 py-4 text-center font-mono text-[11px] text-stone-500">
        RUANGTEMU Photobooth • Palopo
      </footer>
    </div>
  );
}
