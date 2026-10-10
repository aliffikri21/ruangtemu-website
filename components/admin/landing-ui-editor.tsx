"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { LandingThemeConfig } from "@/types";
import {
  DEFAULT_THEME_CONFIG,
  TEMPLATES,
  FONTS_BODY,
  FONTS_TITLE,
  mergeThemeConfig,
  LandingPageView,
} from "@/lib/theme-config";

interface LandingUIEditorProps {
  initialConfig?: LandingThemeConfig;
  onChange: (config: LandingThemeConfig) => void;
  eventSlug?: string;
}

const DEVICES = [
  { id: "s", label: "HP kecil", w: 360, h: 740 },
  { id: "m", label: "HP standar", w: 390, h: 844 },
  { id: "l", label: "HP besar", w: 430, h: 932 },
];

const ICON_OPTIONS = [
  { id: "arrow", label: "Panah (↗)" },
  { id: "camera", label: "Kamera (📸)" },
  { id: "image", label: "Galeri (🖼️)" },
  { id: "heart", label: "Hati (❤️)" },
  { id: "sparkle", label: "Kilau (✨)" },
  { id: "play", label: "Play (▶)" },
  { id: "none", label: "Tanpa ikon" },
];

const LAYOUT_VARIANTS = [
  { id: "classic", label: "Classic (Teks di atas foto)" },
  { id: "center", label: "Center (Teks di tengah layar)" },
  { id: "sheet", label: "Sheet (Kartu putih dari bawah)" },
  { id: "polaroid", label: "Polaroid (Foto berbingkai miring)" },
  { id: "arch", label: "Arch (Foto lengkung kubah)" },
  { id: "editorial", label: "Editorial (Judul besar elegan di bawah)" },
];

export function LandingUIEditor({
  initialConfig,
  onChange,
  eventSlug,
}: LandingUIEditorProps) {
  const [config, setConfig] = useState<LandingThemeConfig>(
    () => initialConfig || structuredClone(DEFAULT_THEME_CONFIG)
  );

  const [device, setDevice] = useState(DEVICES[1]);
  const [history, setHistory] = useState<LandingThemeConfig[]>([
    initialConfig || structuredClone(DEFAULT_THEME_CONFIG),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [flashedSection, setFlashedSection] = useState<string | null>(null);
  const [showJsonDrawer, setShowJsonDrawer] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    background: true,
    title: true,
  });

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Pan & Zoom Stage State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragDistanceRef = useRef(0);

  // Mouse wheel zoom listener on preview stage
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => {
        const next = Math.min(2.5, Math.max(0.4, Number((prev * zoomFactor).toFixed(2))));
        return next;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    dragDistanceRef.current = 0;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    dragDistanceRef.current = Math.hypot(dx, dy);
    setPan({
      x: Math.round(panStartRef.current.panX + dx),
      y: Math.round(panStartRef.current.panY + dy),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch { }
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    showToast("Tampilan di-reset ke 100%");
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.5, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.4, Number((prev - 0.15).toFixed(2))));
  };

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2000);
  }, []);

  const updateConfig = useCallback(
    (newConfig: LandingThemeConfig, recordHistory = true) => {
      setConfig(newConfig);
      onChange(newConfig);

      if (recordHistory) {
        setHistory((prev) => {
          const sliced = prev.slice(0, historyIndex + 1);
          return [...sliced, structuredClone(newConfig)].slice(-30);
        });
        setHistoryIndex((prev) => Math.min(prev + 1, 29));
      }
    },
    [historyIndex, onChange]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      const prevConfig = structuredClone(history[newIdx]);
      setConfig(prevConfig);
      onChange(prevConfig);
      showToast("Undo ↶");
    }
  }, [history, historyIndex, onChange, showToast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      const nextConfig = structuredClone(history[newIdx]);
      setConfig(nextConfig);
      onChange(nextConfig);
      showToast("Redo ↷");
    }
  }, [history, historyIndex, onChange, showToast]);

  const handleApplyTemplate = (tpl: (typeof TEMPLATES)[number]) => {
    const updated = mergeThemeConfig(config, tpl.patch);
    updateConfig(updated);
    showToast(`Template "${tpl.name}" diterapkan`);
  };

  const handleSectionClickInPreview = (secId: string) => {
    // If user dragged more than 5px, it was a pan gesture, not a click
    if (dragDistanceRef.current > 5) return;

    setOpenSections((prev) => ({ ...prev, [secId]: true }));
    const targetEl = sectionRefs.current[secId];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      setFlashedSection(secId);
      setTimeout(() => setFlashedSection(null), 1200);
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = structuredClone(config);
      updated.background.image = dataUrl;
      updateConfig(updated);
      showToast("Foto background berhasil diunggah");
    };
    reader.readAsDataURL(file);
  };

  const setNestedVal = (path: string, val: any) => {
    const updated = structuredClone(config);
    const keys = path.split(".");
    let curr: any = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = val;
    updateConfig(updated);
  };

  useEffect(() => {
    setJsonInput(JSON.stringify(config, null, 2));
  }, [config]);

  return (
    <div className="w-full bg-stone-100 border border-stone-300 rounded-xl overflow-hidden flex flex-col shadow-sm">
      {/* Top Header Controls */}
      <div className="px-4 py-3 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-stone-900 font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900 animate-pulse" />
            3. Editor Tampilan Landing Page
          </span>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            (Kostumisasi tampilan depan photobooth secara langsung)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
            className="w-8 h-8 rounded border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-stone-800 text-xs font-bold flex items-center justify-center transition-colors"
          >
            ↶
          </button>
          <button
            type="button"
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="w-8 h-8 rounded border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-stone-800 text-xs font-bold flex items-center justify-center transition-colors"
          >
            ↷
          </button>
          <button
            type="button"
            onClick={() => setShowJsonDrawer((prev) => !prev)}
            className="px-2.5 py-1.5 rounded border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-1"
          >
            {showJsonDrawer ? "Tutup JSON" : "{ } JSON"}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Form Controls, Right Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 h-[780px] min-h-[640px] max-h-[880px] overflow-hidden">
        {/* LEFT COLUMN: Controls Form Accordion (5 cols on lg) */}
        <div className="lg:col-span-5 border-r border-stone-200 bg-white flex flex-col h-full min-h-0 overflow-hidden">
          {/* Template Carousel Picker */}
          <div className="shrink-0 p-3.5 border-b border-stone-200 bg-stone-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-900 tracking-tight">
                Pilih Template Desain
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {TEMPLATES.length} Opsi
              </span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {TEMPLATES.map((tpl) => {
                const isSelected = config.layout.variant === tpl.patch.layout?.variant;
                const previewMerged = mergeThemeConfig(config, tpl.patch);
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className={`shrink-0 flex flex-col items-center p-1.5 rounded-lg border text-center transition-all ${isSelected
                      ? "border-stone-900 ring-2 ring-stone-900/10 bg-white shadow-sm"
                      : "border-stone-200 hover:border-stone-400 bg-white/70"
                      }`}
                  >
                    <div className="w-[72px] h-[130px] rounded border border-stone-300 overflow-hidden relative bg-stone-900 pointer-events-none mb-1 shadow-inner">
                      <div
                        className="w-[390px] h-[844px] absolute left-0 top-0 origin-top-left"
                        style={{ transform: "scale(0.1846)" }}
                      >
                        <LandingPageView
                          config={previewMerged}
                          interactive={false}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-medium leading-none ${isSelected ? "text-stone-950 font-bold" : "text-stone-600"
                        }`}
                    >
                      {tpl.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion Form Sections */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2.5 scrollbar-thin">
            {/* 1. BACKGROUND SECTION */}
            <div
              ref={(el) => {
                sectionRefs.current.background = el;
              }}
              className={`border rounded-lg transition-all ${flashedSection === "background"
                ? "ring-2 ring-blue-500 border-blue-500 shadow-md"
                : "border-stone-200"
                }`}
            >
              <button
                type="button"
                onClick={() => toggleSection("background")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100/80 rounded-t-lg"
              >
                <span>Foto & Warna Background</span>
                <span className="text-stone-400 text-sm">
                  {openSections.background ? "▾" : "▸"}
                </span>
              </button>
              {openSections.background && (
                <div className="p-3.5 space-y-3 bg-white text-xs border-t border-stone-150">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Foto Background (URL atau Upload)
                    </label>
                    <input
                      type="text"
                      placeholder="https://... atau /images/events/..."
                      value={config.background.image.startsWith("data:") ? "" : config.background.image}
                      onChange={(e) => setNestedVal("background.image", e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded text-xs outline-none focus:border-stone-900 mb-1.5"
                    />
                    <div className="flex gap-2 items-center">
                      <label className="px-2.5 py-1 border border-stone-300 rounded text-[11px] font-mono cursor-pointer hover:bg-stone-50">
                        <span>Pilih Gambar File...</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {config.background.image && (
                        <button
                          type="button"
                          onClick={() => setNestedVal("background.image", "")}
                          className="text-[11px] text-red-600 hover:underline font-mono"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Warna Dasar
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.background.color.slice(0, 7)}
                          onChange={(e) => setNestedVal("background.color", e.target.value)}
                          className="w-8 h-8 rounded border border-stone-300 cursor-pointer p-0"
                        />
                        <span className="font-mono text-[11px] text-stone-500">
                          {config.background.color}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Posisi Foto Vertikal ({config.background.posY}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={config.background.posY}
                        onChange={(e) => setNestedVal("background.posY", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Overlay Gelap ({Math.round(config.background.overlay * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="0.8"
                        step="0.02"
                        value={config.background.overlay}
                        onChange={(e) => setNestedVal("background.overlay", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Gradasi Bawah ({Math.round(config.background.fade * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.background.fade}
                        onChange={(e) => setNestedVal("background.fade", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. HEADER SECTION */}
            <div
              ref={(el) => {
                sectionRefs.current.header = el;
              }}
              className={`border rounded-lg transition-all ${flashedSection === "header"
                ? "ring-2 ring-blue-500 border-blue-500 shadow-md"
                : "border-stone-200"
                }`}
            >
              <button
                type="button"
                onClick={() => toggleSection("header")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100/80 rounded-t-lg"
              >
                <span>Header Atas (Menu Bar)</span>
                <span className="text-stone-400 text-sm">
                  {openSections.header ? "▾" : "▸"}
                </span>
              </button>
              {openSections.header && (
                <div className="p-3.5 space-y-3 bg-white text-xs border-t border-stone-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-stone-600">
                      Tampilkan Header
                    </span>
                    <input
                      type="checkbox"
                      checked={config.header.show}
                      onChange={(e) => setNestedVal("header.show", e.target.checked)}
                      className="w-4 h-4 rounded text-stone-900 accent-stone-900 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Teks Kiri
                      </label>
                      <input
                        type="text"
                        value={config.header.left}
                        onChange={(e) => setNestedVal("header.left", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-stone-200 rounded text-xs outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Teks Kanan
                      </label>
                      <input
                        type="text"
                        value={config.header.right}
                        onChange={(e) => setNestedVal("header.right", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-stone-200 rounded text-xs outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 items-center">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Warna Teks
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.header.color.slice(0, 7)}
                          onChange={(e) => setNestedVal("header.color", e.target.value)}
                          className="w-7 h-7 rounded border border-stone-300 cursor-pointer p-0"
                        />
                        <span className="font-mono text-[11px] text-stone-500">
                          {config.header.color}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Ukuran ({config.header.size}px)
                      </label>
                      <input
                        type="range"
                        min="11"
                        max="22"
                        value={config.header.size}
                        onChange={(e) => setNestedVal("header.size", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. JUDUL / TITLE SECTION */}
            <div
              ref={(el) => {
                sectionRefs.current.title = el;
              }}
              className={`border rounded-lg transition-all ${flashedSection === "title"
                ? "ring-2 ring-blue-500 border-blue-500 shadow-md"
                : "border-stone-200"
                }`}
            >
              <button
                type="button"
                onClick={() => toggleSection("title")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100/80 rounded-t-lg"
              >
                <span>Judul / Nama Acara Pasangan</span>
                <span className="text-stone-400 text-sm">
                  {openSections.title ? "▾" : "▸"}
                </span>
              </button>
              {openSections.title && (
                <div className="p-3.5 space-y-3 bg-white text-xs border-t border-stone-150">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Teks Judul (Enter = Baris Baru)
                    </label>
                    <textarea
                      rows={2}
                      value={config.title.text}
                      onChange={(e) => setNestedVal("title.text", e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded text-xs outline-none focus:border-stone-900 resize-none font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Font Judul
                      </label>
                      <select
                        value={config.title.font}
                        onChange={(e) => setNestedVal("title.font", e.target.value)}
                        className="w-full px-2 py-1.5 border border-stone-200 rounded text-xs bg-white outline-none focus:border-stone-900"
                      >
                        {FONTS_TITLE.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Warna Judul
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.title.color.slice(0, 7)}
                          onChange={(e) => setNestedVal("title.color", e.target.value)}
                          className="w-7 h-7 rounded border border-stone-300 cursor-pointer p-0"
                        />
                        <span className="font-mono text-[11px] text-stone-500">
                          {config.title.color}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Ukuran ({config.title.size}px)
                      </label>
                      <input
                        type="range"
                        min="28"
                        max="84"
                        value={config.title.size}
                        onChange={(e) => setNestedVal("title.size", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Rata Teks
                      </label>
                      <div className="flex border border-stone-300 rounded overflow-hidden">
                        {(["left", "center", "right"] as const).map((al) => (
                          <button
                            key={al}
                            type="button"
                            onClick={() => setNestedVal("title.align", al)}
                            className={`flex-1 py-1 text-[11px] capitalize ${config.title.align === al
                              ? "bg-stone-900 text-white font-bold"
                              : "bg-white text-stone-700 hover:bg-stone-50"
                              }`}
                          >
                            {al}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {config.layout.variant === "classic" && (
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Jarak dari Header ({config.title.top}px)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="140"
                        value={config.title.top}
                        onChange={(e) => setNestedVal("title.top", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. INFO SECTION (Tanggal & Lokasi) */}
            <div
              ref={(el) => {
                sectionRefs.current.info = el;
              }}
              className={`border rounded-lg transition-all ${flashedSection === "info"
                ? "ring-2 ring-blue-500 border-blue-500 shadow-md"
                : "border-stone-200"
                }`}
            >
              <button
                type="button"
                onClick={() => toggleSection("info")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100/80 rounded-t-lg"
              >
                <span>Info Acara (Tanggal & Lokasi)</span>
                <span className="text-stone-400 text-sm">
                  {openSections.info ? "▾" : "▸"}
                </span>
              </button>
              {openSections.info && (
                <div className="p-3.5 space-y-3 bg-white text-xs border-t border-stone-150">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Baris 1 (Tanggal)
                      </label>
                      <input
                        type="text"
                        value={config.info.line1}
                        onChange={(e) => setNestedVal("info.line1", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-stone-200 rounded text-xs outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Baris 2 (Lokasi Gedung)
                      </label>
                      <input
                        type="text"
                        value={config.info.line2}
                        onChange={(e) => setNestedVal("info.line2", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-stone-200 rounded text-xs outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 items-center">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Warna
                      </label>
                      <input
                        type="color"
                        value={config.info.color.slice(0, 7)}
                        onChange={(e) => setNestedVal("info.color", e.target.value)}
                        className="w-7 h-7 rounded border border-stone-300 cursor-pointer p-0"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Ukuran ({config.info.size}px)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="22"
                        value={config.info.size}
                        onChange={(e) => setNestedVal("info.size", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Jarak Top ({config.info.top}px)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="60"
                        value={config.info.top}
                        onChange={(e) => setNestedVal("info.top", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. CTA 1 (Tombol Utama) */}
            <div
              ref={(el) => {
                sectionRefs.current.cta1 = el;
              }}
              className={`border rounded-lg transition-all ${flashedSection === "cta1"
                ? "ring-2 ring-blue-500 border-blue-500 shadow-md"
                : "border-stone-200"
                }`}
            >
              <button
                type="button"
                onClick={() => toggleSection("cta1")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100/80 rounded-t-lg"
              >
                <span>Tombol Utama (Mulai Photobooth)</span>
                <span className="text-stone-400 text-sm">
                  {openSections.cta1 ? "▾" : "▸"}
                </span>
              </button>
              {openSections.cta1 && (
                <div className="p-3.5 space-y-3 bg-white text-xs border-t border-stone-150">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Teks Tombol
                      </label>
                      <input
                        type="text"
                        value={config.cta1.text}
                        onChange={(e) => setNestedVal("cta1.text", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-stone-200 rounded text-xs outline-none focus:border-stone-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Pilihan Ikon
                      </label>
                      <select
                        value={config.cta1.icon}
                        onChange={(e) => setNestedVal("cta1.icon", e.target.value)}
                        className="w-full px-2 py-1.5 border border-stone-200 rounded text-xs bg-white outline-none focus:border-stone-900"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-1">Bg Tombol</span>
                      <input
                        type="color"
                        value={config.cta1.bg.slice(0, 7)}
                        onChange={(e) => setNestedVal("cta1.bg", e.target.value)}
                        className="w-7 h-7 mx-auto rounded border border-stone-300 cursor-pointer p-0"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-1">Teks</span>
                      <input
                        type="color"
                        value={config.cta1.color.slice(0, 7)}
                        onChange={(e) => setNestedVal("cta1.color", e.target.value)}
                        className="w-7 h-7 mx-auto rounded border border-stone-300 cursor-pointer p-0"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-1">Bg Ikon</span>
                      <input
                        type="color"
                        value={config.cta1.iconBg.slice(0, 7)}
                        onChange={(e) => setNestedVal("cta1.iconBg", e.target.value)}
                        className="w-7 h-7 mx-auto rounded border border-stone-300 cursor-pointer p-0"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-1">Warna Ikon</span>
                      <input
                        type="color"
                        value={config.cta1.iconColor.slice(0, 7)}
                        onChange={(e) => setNestedVal("cta1.iconColor", e.target.value)}
                        className="w-7 h-7 mx-auto rounded border border-stone-300 cursor-pointer p-0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. CTA 2 (Tombol Kedua / Galeri Album) */}
            <div
              ref={(el) => {
                sectionRefs.current.cta2 = el;
              }}
              className={`border rounded-lg transition-all ${flashedSection === "cta2"
                ? "ring-2 ring-blue-500 border-blue-500 shadow-md"
                : "border-stone-200"
                }`}
            >
              <button
                type="button"
                onClick={() => toggleSection("cta2")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100/80 rounded-t-lg"
              >
                <span>Tombol Kedua (Jelajahi Album Galeri)</span>
                <span className="text-stone-400 text-sm">
                  {openSections.cta2 ? "▾" : "▸"}
                </span>
              </button>
              {openSections.cta2 && (
                <div className="p-3.5 space-y-3 bg-white text-xs border-t border-stone-150">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Teks Tombol
                      </label>
                      <input
                        type="text"
                        value={config.cta2.text}
                        onChange={(e) => setNestedVal("cta2.text", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-stone-200 rounded text-xs outline-none focus:border-stone-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Gaya Tombol
                      </label>
                      <div className="flex border border-stone-300 rounded overflow-hidden">
                        {(["outline", "glass", "solid"] as const).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setNestedVal("cta2.variant", v)}
                            className={`flex-1 py-1 text-[11px] capitalize ${config.cta2.variant === v
                              ? "bg-stone-900 text-white font-bold"
                              : "bg-white text-stone-700 hover:bg-stone-50"
                              }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-1">Warna Garis</span>
                      <input
                        type="color"
                        value={config.cta2.borderColor.slice(0, 7)}
                        onChange={(e) => setNestedVal("cta2.borderColor", e.target.value)}
                        className="w-7 h-7 mx-auto rounded border border-stone-300 cursor-pointer p-0"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-1">Warna Teks</span>
                      <input
                        type="color"
                        value={config.cta2.color.slice(0, 7)}
                        onChange={(e) => setNestedVal("cta2.color", e.target.value)}
                        className="w-7 h-7 mx-auto rounded border border-stone-300 cursor-pointer p-0"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-1">Ikon</span>
                      <select
                        value={config.cta2.icon}
                        onChange={(e) => setNestedVal("cta2.icon", e.target.value)}
                        className="w-full px-1.5 py-1 border border-stone-200 rounded text-xs bg-white outline-none focus:border-stone-900"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7. STRUKTUR & LAYOUT */}
            <div
              ref={(el) => {
                sectionRefs.current.layout = el;
              }}
              className={`border rounded-lg transition-all ${flashedSection === "layout"
                ? "ring-2 ring-blue-500 border-blue-500 shadow-md"
                : "border-stone-200"
                }`}
            >
              <button
                type="button"
                onClick={() => toggleSection("layout")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100/80 rounded-t-lg"
              >
                <span>Struktur Layout & Dimensi Tombol</span>
                <span className="text-stone-400 text-sm">
                  {openSections.layout ? "▾" : "▸"}
                </span>
              </button>
              {openSections.layout && (
                <div className="p-3.5 space-y-3 bg-white text-xs border-t border-stone-150">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Bentuk Tombol
                    </label>
                    <div className="flex border border-stone-300 rounded overflow-hidden">
                      {(["pill", "rounded", "square"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNestedVal("layout.buttonStyle", s)}
                          className={`flex-1 py-1 text-[11px] capitalize ${config.layout.buttonStyle === s
                            ? "bg-stone-900 text-white font-bold"
                            : "bg-white text-stone-700 hover:bg-stone-50"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Tinggi Tombol ({config.layout.buttonHeight}px)
                      </label>
                      <input
                        type="range"
                        min="44"
                        max="68"
                        value={config.layout.buttonHeight}
                        onChange={(e) => setNestedVal("layout.buttonHeight", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Font Umum Body
                      </label>
                      <select
                        value={config.global.font}
                        onChange={(e) => setNestedVal("global.font", e.target.value)}
                        className="w-full px-2 py-1.5 border border-stone-200 rounded text-xs bg-white outline-none focus:border-stone-900"
                      >
                        {FONTS_BODY.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Margin Samping ({config.layout.sidePadding}px)
                      </label>
                      <input
                        type="range"
                        min="14"
                        max="36"
                        value={config.layout.sidePadding}
                        onChange={(e) => setNestedVal("layout.sidePadding", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Jarak Antar Tombol ({config.layout.gap}px)
                      </label>
                      <input
                        type="range"
                        min="6"
                        max="24"
                        value={config.layout.gap}
                        onChange={(e) => setNestedVal("layout.gap", Number(e.target.value))}
                        className="w-full accent-stone-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 8. FOOTER */}
            <div
              ref={(el) => {
                sectionRefs.current.footer = el;
              }}
              className={`border rounded-lg transition-all ${flashedSection === "footer"
                ? "ring-2 ring-blue-500 border-blue-500 shadow-md"
                : "border-stone-200"
                }`}
            >
              <button
                type="button"
                onClick={() => toggleSection("footer")}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100/80 rounded-t-lg"
              >
                <span>Footer Branding Bawah</span>
                <span className="text-stone-400 text-sm">
                  {openSections.footer ? "▾" : "▸"}
                </span>
              </button>
              {openSections.footer && (
                <div className="p-3.5 space-y-3 bg-white text-xs border-t border-stone-150">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Teks Footer
                    </label>
                    <input
                      type="text"
                      value={config.footer.text}
                      onChange={(e) => setNestedVal("footer.text", e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-200 rounded text-xs outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Warna Footer
                    </label>
                    <input
                      type="color"
                      value={config.footer.color.slice(0, 7)}
                      onChange={(e) => setNestedVal("footer.color", e.target.value)}
                      className="w-7 h-7 rounded border border-stone-300 cursor-pointer p-0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Mobile Frame Stage (7 cols on lg) */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`lg:col-span-7 bg-stone-900/95 flex flex-col justify-between p-4 relative min-h-[560px] h-full overflow-hidden select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"
            }`}
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Top Controls Bar: Device Size Pills & Zoom Toolbar */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 z-20 shrink-0 w-full"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Device Size Pills */}
            <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-lg border border-stone-700/80 shadow-md backdrop-blur-sm">
              {DEVICES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${device.id === d.id
                    ? "bg-white text-stone-950 font-bold shadow-sm"
                    : "text-stone-300 hover:text-white"
                    }`}
                >
                  {d.label} <span className="text-[10px] opacity-70">({d.w}×{d.h})</span>
                </button>
              ))}
            </div>

            {/* Zoom & Viewport Controls Toolbar */}
            <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-lg border border-stone-700/80 shadow-md backdrop-blur-sm">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out (−)"
                className="w-7 h-7 rounded flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-700/80 font-bold text-sm transition-colors"
              >
                −
              </button>
              <button
                type="button"
                onClick={resetView}
                title="Klik untuk reset zoom ke 100%"
                className="px-2 py-0.5 text-[11px] font-mono text-stone-200 hover:text-white hover:bg-stone-700/60 rounded"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In (+)"
                className="w-7 h-7 rounded flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-700/80 font-bold text-sm transition-colors"
              >
                +
              </button>
              <div className="w-[1px] h-4 bg-stone-700 mx-0.5" />
              <button
                type="button"
                onClick={resetView}
                title="Reset Posisi & Zoom"
                className="px-2 py-1 rounded text-[11px] font-mono text-stone-300 hover:text-white hover:bg-stone-700/80 transition-colors flex items-center gap-1"
              >
                <span>↺</span>
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Interactive Mobile Phone Mockup Canvas Area */}
          <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden my-auto pointer-events-none">
            <div
              className="relative origin-center pointer-events-auto will-change-transform"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${0.72 * zoom})`,
                transition: isPanning ? "none" : "transform 0.12s ease-out",
              }}
            >
              {/* Outer Phone Hardware Bezel (.frame) */}
              <div
                ref={previewRef}
                className="relative rounded-[48px] p-[11px] bg-[#14161a] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-2 ring-[#2b2f36] select-none shrink-0"
                style={{
                  width: `${device.w + 22}px`,
                  height: `${device.h + 22}px`,
                }}
              >
                {/* Phone Screen (.screen) */}
                <div
                  className="relative rounded-[38px] overflow-hidden bg-black shadow-inner"
                  style={{
                    width: `${device.w}px`,
                    height: `${device.h}px`,
                  }}
                >
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[92px] h-[26px] bg-black rounded-full z-20 pointer-events-none shadow-sm flex items-center justify-end pr-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1e] ring-1 ring-white/10" />
                  </div>

                  {/* 1:1 Screen Content */}
                  <div className="w-full h-full relative overflow-hidden">
                    <LandingPageView
                      config={config}
                      onSectionClick={handleSectionClickInPreview}
                      interactive={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Helper caption & Pan hints */}
          <div
            className="text-[11px] text-stone-400 font-mono tracking-wide text-center z-20 shrink-0 bg-stone-950/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-stone-800/80 mx-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span>🖐️ Geser kanvas untuk memindahkan • 🔍 Scroll mouse untuk zoom • 👆 Klik elemen HP untuk mengedit</span>
          </div>

          {/* Floating Toast Notification */}
          {toastMsg && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-stone-950/90 text-white text-xs rounded-full border border-stone-700 shadow-xl z-50 animate-bounce pointer-events-none">
              {toastMsg}
            </div>
          )}
        </div>
      </div>

      {/* JSON Config Drawer */}
      {showJsonDrawer && (
        <div className="p-4 bg-stone-900 border-t border-stone-800 text-white text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-stone-400">
              theme_config (JSON Raw)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                  showToast("JSON disalin ke clipboard!");
                }}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded text-stone-200 font-mono text-[11px]"
              >
                Salin JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonInput);
                    updateConfig(mergeThemeConfig(DEFAULT_THEME_CONFIG, parsed));
                    showToast("JSON berhasil diterapkan!");
                  } catch {
                    showToast("Format JSON tidak valid!");
                  }
                }}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white font-mono text-[11px]"
              >
                Terapkan JSON
              </button>
            </div>
          </div>
          <textarea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full bg-stone-950 text-emerald-400 font-mono text-[11px] p-3 rounded border border-stone-800 outline-none focus:border-stone-600"
          />
        </div>
      )}
    </div>
  );
}
