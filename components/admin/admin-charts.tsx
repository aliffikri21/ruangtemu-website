"use client";

import { useState, useMemo } from "react";
import { GalleryEntry, EventItem, Booking, CameraFilter } from "@/types";
import { formatRupiah } from "@/lib/utils";

interface AdminChartsProps {
  entries: GalleryEntry[];
  events: EventItem[];
  bookings: Booking[];
  isDarkMode?: boolean;
}

const FILTER_LABELS: Record<CameraFilter | string, { name: string; color: string }> = {
  normal: { name: "Original / Normal", color: "from-blue-500 to-indigo-600" },
  "soft-glow": { name: "Soft Glow (Flattering)", color: "from-pink-500 to-rose-600" },
  "warm-vintage": { name: "Warm Vintage (Retro)", color: "from-amber-500 to-orange-600" },
  sepia: { name: "Classic Sepia", color: "from-yellow-600 to-amber-700" },
  grayscale: { name: "B&W Monochrome", color: "from-slate-400 to-slate-600" },
  "cool-cinema": { name: "Cool Cinema", color: "from-teal-400 to-cyan-600" },
};

// Helper untuk konversi waktu ke WITA (Asia/Makassar, UTC+8)
function getWitaHour(isoString: string): number {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 0;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Makassar",
      hour: "numeric",
      hour12: false,
    }).formatToParts(d);
    const hourPart = parts.find((p) => p.type === "hour");
    const h = hourPart ? parseInt(hourPart.value, 10) : d.getHours();
    return h === 24 ? 0 : h;
  } catch {
    return new Date(isoString).getHours();
  }
}

export function AdminCharts({ entries, events, bookings, isDarkMode = false }: AdminChartsProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"all" | "today" | "7d">("all");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Filter entries based on selected event and time range
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Event filter
      if (selectedEventId !== "all") {
        if (entry.event_id !== selectedEventId && entry.event_slug !== selectedEventId) {
          return false;
        }
      }

      // Time range filter
      if (timeRange === "today") {
        const today = new Date().toDateString();
        return new Date(entry.created_at).toDateString() === today;
      }
      if (timeRange === "7d") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(entry.created_at) >= sevenDaysAgo;
      }

      return true;
    });
  }, [entries, selectedEventId, timeRange]);

  // 1. STATISTIK PER JAM (Hourly Capture Distribution dalam WITA)
  const hourlyAnalysis = useMemo(() => {
    // 24-hour slots initialized
    const hourMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourMap[i] = 0;
    }

    filteredEntries.forEach((entry) => {
      const hour = getWitaHour(entry.created_at);
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    // Cari jam aktif minimal dan maksimal untuk tampilan yang pas
    const nonZeroHours = Object.entries(hourMap)
      .filter(([_, count]) => count > 0)
      .map(([hour]) => Number(hour));

    // Default span: 10:00 - 23:00 jika kosong/sedikit, atau sesuaikan data
    const minHour = nonZeroHours.length > 0 ? Math.max(0, Math.min(...nonZeroHours) - 1) : 10;
    const maxHour = nonZeroHours.length > 0 ? Math.min(23, Math.max(...nonZeroHours) + 1) : 22;

    const displaySlots: { hour: number; label: string; count: number }[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      displaySlots.push({
        hour: h,
        label: `${String(h).padStart(2, "0")}:00 WITA`,
        count: hourMap[h] || 0,
      });
    }

    let peakHour = 0;
    let peakCount = 0;
    displaySlots.forEach((slot) => {
      if (slot.count > peakCount) {
        peakCount = slot.count;
        peakHour = slot.hour;
      }
    });

    return {
      slots: displaySlots,
      peakHour,
      peakCount,
      maxVal: Math.max(peakCount, 1),
    };
  }, [filteredEntries]);

  // 2. STATISTIK FILTER / GAYA FOTO
  const filterStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEntries.forEach((entry) => {
      const f = entry.filter_used || "normal";
      counts[f] = (counts[f] || 0) + 1;
    });

    const total = filteredEntries.length || 1;
    const sorted = Object.entries(counts)
      .map(([key, count]) => ({
        key,
        name: FILTER_LABELS[key]?.name || key,
        color: FILTER_LABELS[key]?.color || "from-indigo-500 to-purple-600",
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return sorted;
  }, [filteredEntries]);

  // 3. STATISTIK TINGKAT PARTISIPASI (Text vs Voice vs Photo only)
  const participationStats = useMemo(() => {
    const total = filteredEntries.length;
    if (total === 0) {
      return { total: 0, textCount: 0, textPercent: 0, voiceCount: 0, voicePercent: 0, photoOnlyCount: 0, photoOnlyPercent: 0 };
    }

    let textCount = 0;
    let voiceCount = 0;
    filteredEntries.forEach((e) => {
      if (e.message && e.message.trim().length > 0) textCount++;
      if (e.voice_note_url) voiceCount++;
    });

    const photoOnlyCount = Math.max(0, total - textCount);

    return {
      total,
      textCount,
      textPercent: Math.round((textCount / total) * 100),
      voiceCount,
      voicePercent: Math.round((voiceCount / total) * 100),
      photoOnlyCount,
      photoOnlyPercent: Math.round((photoOnlyCount / total) * 100),
    };
  }, [filteredEntries]);

  // 4. STATISTIK STATUS RESERVASI & FINANSIAL
  const bookingStats = useMemo(() => {
    const total = bookings.length;
    if (total === 0) return { total: 0, confirmed: 0, pending: 0, completed: 0, paidRevenue: 0 };

    let confirmed = 0;
    let pending = 0;
    let completed = 0;
    let paidRevenue = 0;

    bookings.forEach((b) => {
      if (b.status === "confirmed") confirmed++;
      else if (b.status === "pending") pending++;
      else if (b.status === "completed") completed++;

      if (b.payment_status === "PAID") {
        paidRevenue += b.total_price || 0;
      }
    });

    return { total, confirmed, pending, completed, paidRevenue };
  }, [bookings]);

  return (
    <div
      className={`rounded-2xl transition-all border ${
        isDarkMode
          ? "bg-[#1A1B20] border-white/10 text-slate-100"
          : "bg-white border-[#E0E5F2] text-[#1B2559] shadow-[0_18px_40px_0_rgba(112,144,176,0.06)]"
      }`}
    >
      {/* ─── HEADER BAR WITH CONTROLS ─── */}
      <div className="p-5 sm:p-6 border-b border-[#E0E5F2]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4318FF] to-[#6AD2FF] flex items-center justify-center text-white shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Analitik & Diagram Photobooth
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#05CD99]/15 text-[#05CD99] border border-[#05CD99]/20">
                  Real-time
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                Visualisasi traffic tamu, tren filter kamera, dan partisipasi pesan acara
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Event Selector */}
          <div className="relative">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className={`text-xs font-semibold px-3 py-2 pr-8 rounded-xl border outline-hidden transition-all cursor-pointer ${
                isDarkMode
                  ? "bg-[#25262B] border-white/10 text-white hover:border-white/20"
                  : "bg-[#F4F7FE] border-[#E0E5F2] text-[#1B2559] hover:border-[#4318FF]/40"
              }`}
            >
              <option value="all">📊 Semua Event ({events.length})</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.city || "Palopo"})
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter Pills */}
          <div className={`p-1 rounded-xl flex items-center gap-1 border ${isDarkMode ? "bg-[#25262B] border-white/10" : "bg-[#F4F7FE] border-[#E0E5F2]"}`}>
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                timeRange === "all"
                  ? isDarkMode ? "bg-[#1A1B20] text-white shadow-xs" : "bg-white text-[#4318FF] shadow-xs"
                  : isDarkMode ? "text-slate-400 hover:text-white" : "text-[#8F9BBA] hover:text-[#1B2559]"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                timeRange === "7d"
                  ? isDarkMode ? "bg-[#1A1B20] text-white shadow-xs" : "bg-white text-[#4318FF] shadow-xs"
                  : isDarkMode ? "text-slate-400 hover:text-white" : "text-[#8F9BBA] hover:text-[#1B2559]"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("today")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                timeRange === "today"
                  ? isDarkMode ? "bg-[#1A1B20] text-white shadow-xs" : "bg-white text-[#4318FF] shadow-xs"
                  : isDarkMode ? "text-slate-400 hover:text-white" : "text-[#8F9BBA] hover:text-[#1B2559]"
              }`}
            >
              Hari Ini
            </button>
          </div>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode ? "bg-[#25262B] border-white/10 text-slate-300 hover:text-white" : "bg-[#F4F7FE] border-[#E0E5F2] text-[#8F9BBA] hover:text-[#1B2559]"
            }`}
            title={isExpanded ? "Sembunyikan Grafik" : "Tampilkan Grafik"}
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
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── CHARTS CONTENT BODY ─── */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* TOP SUMMARY MINI-PILLS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-[#25262B]/60 border-white/5" : "bg-[#F4F7FE] border-[#E0E5F2]/60"}`}>
              <div className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-[#8F9BBA]"}`}>Foto Dianalisis</div>
              <div className="text-lg font-extrabold mt-0.5">{filteredEntries.length} <span className="text-xs font-normal opacity-70">foto</span></div>
            </div>
            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-[#25262B]/60 border-white/5" : "bg-[#F4F7FE] border-[#E0E5F2]/60"}`}>
              <div className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-[#8F9BBA]"}`}>Jam Puncak (WITA)</div>
              <div className="text-lg font-extrabold text-[#4318FF] dark:text-blue-400 mt-0.5">
                {hourlyAnalysis.peakCount > 0 ? `${String(hourlyAnalysis.peakHour).padStart(2, "0")}:00 WITA` : "-"}
                <span className="text-xs font-normal opacity-70 ml-1">({hourlyAnalysis.peakCount} foto)</span>
              </div>
            </div>
            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-[#25262B]/60 border-white/5" : "bg-[#F4F7FE] border-[#E0E5F2]/60"}`}>
              <div className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-[#8F9BBA]"}`}>Tingkat Pesan Ucapan</div>
              <div className="text-lg font-extrabold text-[#05CD99] mt-0.5">
                {participationStats.textPercent}% <span className="text-xs font-normal opacity-70">({participationStats.textCount})</span>
              </div>
            </div>
            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-[#25262B]/60 border-white/5" : "bg-[#F4F7FE] border-[#E0E5F2]/60"}`}>
              <div className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-[#8F9BBA]"}`}>Pesan Suara (Voice)</div>
              <div className="text-lg font-extrabold text-amber-500 mt-0.5">
                {participationStats.voiceCount} <span className="text-xs font-normal opacity-70">rekaman</span>
              </div>
            </div>
          </div>

          {/* TWO MAIN COLUMNS: 1. TRAFFIC BAR CHART & 2. FILTER + PARTICIPATION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ───── LEFT: HOURLY PHOTO ACTIVITY BAR CHART (7 of 12) ───── */}
            <div className={`lg:col-span-7 p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? "bg-[#25262B]/40 border-white/5" : "bg-slate-50/70 border-[#E0E5F2]"}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      Aktivitas Pemotretan per Jam
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        WITA
                      </span>
                    </h4>
                    <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-[#8F9BBA]"}`}>
                      Distribusi jam tamu memotret di venue (Zona Waktu Palopo / WITA)
                    </p>
                  </div>
                  {hourlyAnalysis.peakCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                      <span>🔥</span> Jam Tersibuk: {String(hourlyAnalysis.peakHour).padStart(2, "0")}:00 WITA
                    </span>
                  )}
                </div>

                {/* The Tailwind CSS Bar Chart */}
                <div className="mt-6">
                  {filteredEntries.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="14"/></svg>
                      </div>
                      <p className="text-xs text-slate-400">Belum ada foto pada filter rentang waktu ini</p>
                    </div>
                  ) : (
                    <div className="relative pt-6">
                      {/* Grid guideline lines */}
                      <div className="absolute inset-x-0 top-6 bottom-6 flex flex-col justify-between pointer-events-none opacity-20">
                        <div className="border-b border-dashed border-slate-400 w-full" />
                        <div className="border-b border-dashed border-slate-400 w-full" />
                        <div className="border-b border-dashed border-slate-400 w-full" />
                      </div>

                      {/* Bar columns */}
                      <div className="flex items-end gap-1.5 sm:gap-2.5 h-44 pb-6 relative z-10">
                        {hourlyAnalysis.slots.map((slot) => {
                          const heightPercent = Math.max(
                            slot.count > 0 ? Math.round((slot.count / hourlyAnalysis.maxVal) * 100) : 4,
                            slot.count > 0 ? 12 : 4
                          );
                          const isPeak = slot.hour === hourlyAnalysis.peakHour && slot.count > 0;

                          return (
                            <div
                              key={slot.hour}
                              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                            >
                              {/* Hover Floating Tooltip */}
                              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 transform -translate-y-1 group-hover:translate-y-0 duration-150">
                                <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-white/10">
                                  {slot.count} Foto • {slot.label}
                                </div>
                              </div>

                              {/* Top Bar count indicator for peak or non-zero */}
                              {slot.count > 0 && (
                                <span className={`text-[9px] font-bold mb-1 transition-opacity ${isPeak ? "text-amber-500 font-extrabold" : "text-slate-400 opacity-60 group-hover:opacity-100"}`}>
                                  {slot.count}
                                </span>
                              )}

                              {/* Bar Pillar */}
                              <div className="w-full max-w-[28px] h-full flex items-end">
                                <div
                                  style={{ height: `${heightPercent}%` }}
                                  className={`w-full rounded-t-md transition-all duration-300 group-hover:brightness-110 ${
                                    slot.count === 0
                                      ? isDarkMode ? "bg-white/5" : "bg-slate-200/60"
                                      : isPeak
                                      ? "bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                                      : "bg-gradient-to-t from-[#4318FF] to-[#6AD2FF] shadow-[0_2px_8px_rgba(67,24,255,0.2)]"
                                  }`}
                                />
                              </div>

                              {/* X-Axis Hour Label */}
                              <span className={`text-[9px] sm:text-[10px] font-medium mt-2 whitespace-nowrap flex flex-col items-center leading-none ${isPeak ? "text-[#4318FF] dark:text-blue-400 font-bold" : isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                                <span>{String(slot.hour).padStart(2, "0")}:00</span>
                                <span className="text-[8px] opacity-75 mt-0.5">WITA</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer hint */}
              <div className={`mt-3 pt-3 border-t text-[11px] flex items-center justify-between ${isDarkMode ? "border-white/5 text-slate-400" : "border-[#E0E5F2] text-[#8F9BBA]"}`}>
                <span>Total pemotretan: <strong className={isDarkMode ? "text-white" : "text-[#1B2559]"}>{filteredEntries.length} kali</strong></span>
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#4318FF]" /> Normal
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Jam Puncak
                  </span>
                </span>
              </div>
            </div>

            {/* ───── RIGHT: FILTER DISTRIBUTION & PARTICIPATION (5 of 12) ───── */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* CARD: FILTER POPULARITY */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#25262B]/40 border-white/5" : "bg-slate-50/70 border-[#E0E5F2]"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold">Filter Kamera Terfavorit</h4>
                  <span className="text-[11px] font-semibold text-[#8F9BBA]">
                    {filterStats.length} variasi
                  </span>
                </div>

                {filterStats.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada data filter</p>
                ) : (
                  <div className="space-y-3">
                    {filterStats.map((item, idx) => (
                      <div key={item.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                            {item.name}
                          </span>
                          <span className="font-mono text-xs font-bold">
                            {item.count} <span className="text-[10px] text-slate-400 font-normal">({item.percent}%)</span>
                          </span>
                        </div>
                        {/* Horizontal Progress Bar */}
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`}>
                          <div
                            style={{ width: `${item.percent}%` }}
                            className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD: PARTICIPATION BREAKDOWN */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#25262B]/40 border-white/5" : "bg-slate-50/70 border-[#E0E5F2]"}`}>
                <h4 className="text-sm font-bold mb-3">Rasio Partisipasi Tamu</h4>
                
                <div className="space-y-3.5">
                  {/* Foto + Ucapan Teks */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs">
                        ✍️
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Foto + Ucapan Pesan</div>
                        <div className="text-[10px] text-slate-400">{participationStats.textCount} tamu menulis ucapan</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-500">
                      {participationStats.textPercent}%
                    </span>
                  </div>

                  {/* Foto + Voice Note */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center text-xs">
                        🎙️
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Foto + Rekaman Suara</div>
                        <div className="text-[10px] text-slate-400">{participationStats.voiceCount} tamu merekam voice note</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-500">
                      {participationStats.voicePercent}%
                    </span>
                  </div>

                  {/* Foto Saja */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center text-xs">
                        📸
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Foto Only (Cepat)</div>
                        <div className="text-[10px] text-slate-400">{participationStats.photoOnlyCount} tamu memotret tanpa pesan</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#4318FF] dark:text-indigo-400">
                      {participationStats.photoOnlyPercent}%
                    </span>
                  </div>
                </div>

                {/* Stacked Visual Bar */}
                <div className="w-full h-2.5 rounded-full overflow-hidden flex mt-4 bg-slate-200 dark:bg-white/10">
                  <div style={{ width: `${participationStats.textPercent}%` }} className="h-full bg-emerald-500" title="Teks Ucapan" />
                  <div style={{ width: `${participationStats.voicePercent}%` }} className="h-full bg-amber-500" title="Voice Note" />
                  <div style={{ width: `${participationStats.photoOnlyPercent}%` }} className="h-full bg-indigo-500" title="Foto Saja" />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
