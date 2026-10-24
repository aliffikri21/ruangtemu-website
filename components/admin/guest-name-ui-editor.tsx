"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GuestNameThemeConfig, EventItem } from "@/types";
import {
  DEFAULT_GUEST_NAME_CONFIG,
  resolveGuestNameConfig,
  GuestNamePageView,
  FONTS_TITLE,
} from "@/lib/theme-config";

interface GuestNameUIEditorProps {
  initialConfig?: Partial<GuestNameThemeConfig>;
  event: EventItem;
  eventSlug?: string;
  onChange: (config: GuestNameThemeConfig) => void;
}

const DEVICES = [
  { id: "s", label: "HP kecil", w: 360, h: 740 },
  { id: "m", label: "HP standar", w: 390, h: 844 },
  { id: "l", label: "HP besar", w: 430, h: 932 },
];

const PRESETS: {
  id: string;
  name: string;
  color: string;
  patch: Partial<GuestNameThemeConfig>;
}[] = [
  {
    id: "navy",
    name: "Navy & Gold (Jaya & Rika)",
    color: "#224DA5",
    patch: {
      background: {
        image: "/images/events/bg-jayarika.png",
        color: "#030712",
        overlay: 0.5,
        topGradient: true,
        bottomGradient: true,
      },
      header: {
        show: true,
        badge: "The Wedding of",
        title: "Jaya & Rika",
        font: "Great Vibes",
        color: "#ffffff",
        size: 24,
      },
      content: {
        headline: "Dari Siapa\nKenangan Ini?",
        headlineColor: "#ffffff",
        headlineSize: 34,
        nameLabel: "Nama Tamu",
        nameLabelColor: "#ffffff",
        placeholder: "Ketik di Sini.......",
        underlineColor: "#78716c",
        textColor: "#ffffff",
      },
      button: {
        text: "Selanjutnya",
        bg: "#ffffff",
        color: "#09090b",
        iconBg: "#224DA5",
        iconColor: "#ffffff",
        icon: "arrow",
      },
      footer: {
        show: true,
        text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH",
        color: "#ffffff",
        showLogo: true,
      },
    },
  },
  {
    id: "emerald",
    name: "Emerald Classic (Ilva & Ricky)",
    color: "#3a716c",
    patch: {
      background: {
        image: "/images/events/ilvaricky-bg.jpeg",
        color: "#020302",
        overlay: 0.5,
        topGradient: true,
        bottomGradient: true,
      },
      header: {
        show: true,
        badge: "The Wedding of",
        title: "Ilva & Ricky",
        font: "Great Vibes",
        color: "#ffffff",
        size: 24,
      },
      content: {
        headline: "Dari Siapa\nKenangan Ini?",
        headlineColor: "#ffffff",
        headlineSize: 34,
        nameLabel: "Nama Tamu",
        nameLabelColor: "#ffffff",
        placeholder: "Ketik di Sini.......",
        underlineColor: "#78716c",
        textColor: "#ffffff",
      },
      button: {
        text: "Selanjutnya",
        bg: "#ffffff",
        color: "#09090b",
        iconBg: "#3a716c",
        iconColor: "#ffffff",
        icon: "arrow",
      },
      footer: {
        show: true,
        text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH",
        color: "#ffffff",
        showLogo: true,
      },
    },
  },
  {
    id: "ruby",
    name: "Romantic Ruby (Nurul & Iqra)",
    color: "#c51d24",
    patch: {
      background: {
        image: "/images/events/nurul-iqra-real.jpg",
        color: "#180304",
        overlay: 0.45,
        topGradient: true,
        bottomGradient: true,
      },
      header: {
        show: true,
        badge: "The Wedding of",
        title: "Nurul & Iqra",
        font: "Great Vibes",
        color: "#fecdd3",
        size: 26,
      },
      content: {
        headline: "Dari Siapa\nKenangan Bahagia Ini?",
        headlineColor: "#ffffff",
        headlineSize: 32,
        nameLabel: "Nama Tamu Undangan",
        nameLabelColor: "#ffe4e6",
        placeholder: "Ketik nama Anda di sini...",
        underlineColor: "#f43f5e",
        textColor: "#ffffff",
      },
      button: {
        text: "Lanjutkan",
        bg: "#ffffff",
        color: "#09090b",
        iconBg: "#c51d24",
        iconColor: "#ffffff",
        icon: "arrow",
      },
      footer: {
        show: true,
        text: "Virtual Photobooth by RUANGTEMUPHOTOBOOTH",
        color: "#fecdd3",
        showLogo: true,
      },
    },
  },
  {
    id: "minimal_dark",
    name: "Modern Clean Dark",
    color: "#18181b",
    patch: {
      background: {
        image: "",
        color: "#09090b",
        overlay: 0.4,
        topGradient: true,
        bottomGradient: true,
      },
      header: {
        show: true,
        badge: "Virtual Photobooth",
        title: "Guest Book",
        font: "Playfair Display",
        color: "#ffffff",
        size: 22,
      },
      content: {
        headline: "Selamat Datang,\nSiapakah Nama Anda?",
        headlineColor: "#ffffff",
        headlineSize: 32,
        nameLabel: "Nama Anda",
        nameLabelColor: "#d4d4d8",
        placeholder: "Masukkan nama Anda...",
        underlineColor: "#52525b",
        textColor: "#ffffff",
      },
      button: {
        text: "Mulai Foto",
        bg: "#ffffff",
        color: "#09090b",
        iconBg: "#18181b",
        iconColor: "#ffffff",
        icon: "camera",
      },
      footer: {
        show: true,
        text: "RUANGTEMU PHOTOBOOTH",
        color: "#a1a1aa",
        showLogo: true,
      },
    },
  },
];

export function GuestNameUIEditor({
  initialConfig,
  event,
  eventSlug,
  onChange,
}: GuestNameUIEditorProps) {
  const [config, setConfig] = useState<GuestNameThemeConfig>(() =>
    resolveGuestNameConfig(initialConfig, event)
  );

  const [device, setDevice] = useState(DEVICES[1]);
  const [history, setHistory] = useState<GuestNameThemeConfig[]>([
    resolveGuestNameConfig(initialConfig, event),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [flashedSection, setFlashedSection] = useState<string | null>(null);
  const [showJsonDrawer, setShowJsonDrawer] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [previewGuestName, setPreviewGuestName] = useState("Aditya Rahman");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    background: true,
    content: true,
  });

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Pan & Zoom Stage State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragDistanceRef = useRef(0);
  const isPointerDownRef = useRef(false);

  // Wheel zoom on preview stage
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
    isPointerDownRef.current = true;
    dragDistanceRef.current = 0;
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    const dist = Math.hypot(dx, dy);
    dragDistanceRef.current = dist;

    // Only initiate canvas panning when user genuinely drags (> 5px)
    if (dist > 5) {
      if (!isPanning) {
        setIsPanning(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch { }
      }
      setPan({
        x: Math.round(panStartRef.current.panX + dx),
        y: Math.round(panStartRef.current.panY + dy),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = false;
    if (isPanning) {
      setIsPanning(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch { }
    }
    setTimeout(() => {
      dragDistanceRef.current = 0;
    }, 60);
  };

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2000);
  }, []);

  const updateConfig = useCallback(
    (newConfig: GuestNameThemeConfig, recordHistory = true) => {
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

  const handleApplyPreset = (preset: (typeof PRESETS)[number]) => {
    const nextConfig = {
      ...config,
      ...preset.patch,
      background: { ...config.background, ...(preset.patch.background || {}) },
      header: { ...config.header, ...(preset.patch.header || {}) },
      content: { ...config.content, ...(preset.patch.content || {}) },
      button: { ...config.button, ...(preset.patch.button || {}) },
      footer: { ...config.footer, ...(preset.patch.footer || {}) },
    };
    updateConfig(nextConfig);
    showToast(`Preset "${preset.name}" diterapkan`);
  };

  const handleSectionClickInPreview = (secId: string) => {
    if (dragDistanceRef.current > 5) return;
    setOpenSections((prev) => ({ ...prev, [secId]: true }));

    // Wait for React to expand the section DOM before scrolling into view
    setTimeout(() => {
      const targetEl = sectionRefs.current[secId];
      const containerEl = sidebarRef.current;

      if (targetEl && containerEl) {
        const targetRect = targetEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top + containerEl.scrollTop;

        containerEl.scrollTo({
          top: Math.max(0, relativeTop - 12),
          behavior: "smooth",
        });

        setFlashedSection(secId);
        setTimeout(() => setFlashedSection(null), 1500);
      } else if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setFlashedSection(secId);
        setTimeout(() => setFlashedSection(null), 1500);
      }
    }, 60);
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const compressImage = (file: File, maxDimension = 1600, quality = 0.85): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBg(true);
      const processedBlob = await compressImage(file);
      const uploadFile = new File([processedBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", uploadFile);
      if (eventSlug) formData.append("slug", eventSlug);

      const res = await fetch("/api/events/upload-bg", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Gagal mengunggah gambar");
      }

      const next = {
        ...config,
        background: {
          ...config.background,
          image: data.url,
        },
      };
      updateConfig(next);
      showToast("Foto latar berhasil diunggah!");
    } catch (err: any) {
      alert(err.message || "Gagal upload latar belakang");
    } finally {
      setIsUploadingBg(false);
      e.target.value = "";
    }
  };

  const handleReset = () => {
    if (confirm("Reset konfigurasi halaman input nama ke default awal?")) {
      const def = resolveGuestNameConfig(DEFAULT_GUEST_NAME_CONFIG, event);
      updateConfig(def);
      showToast("Konfigurasi di-reset ke default");
    }
  };

  return (
    <div className="bg-[#f8fafd] border border-[#e0e5f2] rounded-3xl overflow-hidden shadow-sm flex flex-col">
      {/* Top Bar / Toolbar */}
      <div className="bg-white px-5 py-3.5 border-b border-[#e0e5f2] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1B2559]">Editor Halaman Input Nama Tamu</h4>
            <p className="text-[11px] text-[#8F9BBA]">
              Sesuaikan judul, kolom nama, tombol, dan foto latar untuk halaman kedua yang dilihat tamu
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Preset templates dropdown */}
          <div className="flex items-center gap-1.5 bg-[#f4f7fe] p-1 rounded-xl border border-[#e0e5f2]">
            <span className="text-[11px] font-semibold text-[#8F9BBA] px-2">Preset:</span>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                title={p.name}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-[#1B2559] flex items-center gap-1.5 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate max-w-[90px]">{p.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-[#e0e5f2] mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            className="p-2 rounded-xl text-[#8F9BBA] hover:text-[#1B2559] hover:bg-[#f4f7fe] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
          </button>
          <button
            type="button"
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            className="p-2 rounded-xl text-[#8F9BBA] hover:text-[#1B2559] hover:bg-[#f4f7fe] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" /></svg>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => {
              setJsonInput(JSON.stringify(config, null, 2));
              setShowJsonDrawer(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-[#4318FF] hover:bg-[#4318FF]/10 rounded-xl transition-colors"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Main Workspace (Split: Left Controls, Right Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* LEFT COLUMN: Controls & Settings Form */}
        <div ref={sidebarRef} className="lg:col-span-6 xl:col-span-5 bg-white border-r border-[#e0e5f2] p-5 overflow-y-auto max-h-[780px] space-y-4">
          {/* Section 1: Latar Belakang */}
          <div
            ref={(el) => { sectionRefs.current.background = el; }}
            className={`border rounded-2xl transition-all ${
              flashedSection === "background"
                ? "border-[#4318FF] ring-2 ring-[#4318FF]/20"
                : "border-[#e0e5f2]"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection("background")}
              className="w-full px-4 py-3 bg-[#f8fafd] hover:bg-[#f0f4fd] rounded-2xl flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#4318FF]" />
                <span className="text-xs font-bold text-[#1B2559]">1. Foto Latar & Warna</span>
              </div>
              <span className="text-xs text-[#8F9BBA]">
                {openSections.background ? "−" : "+"}
              </span>
            </button>

            {openSections.background && (
              <div className="p-4 space-y-3.5 bg-white rounded-b-2xl">
                <div>
                  <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1.5">
                    Unggah Foto Latar Pasangan / Acara
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer h-10 px-3 rounded-xl border border-dashed border-[#4318FF]/40 bg-[#4318FF]/5 hover:bg-[#4318FF]/10 text-[#4318FF] text-xs font-medium flex items-center justify-center gap-2 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadBg}
                        disabled={isUploadingBg}
                      />
                      {isUploadingBg ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-[#4318FF]/40 border-t-[#4318FF] rounded-full animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                          <span>Pilih Foto dari Galeri</span>
                        </>
                      )}
                    </label>
                    {config.background.image && (
                      <button
                        type="button"
                        onClick={() =>
                          updateConfig({
                            ...config,
                            background: { ...config.background, image: "" },
                          })
                        }
                        className="h-10 px-3 text-xs text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                        title="Hapus foto latar"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                    Atau URL Gambar
                  </label>
                  <input
                    type="text"
                    value={config.background.image}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        background: { ...config.background, image: e.target.value },
                      })
                    }
                    placeholder="https://... atau /images/events/..."
                    className="w-full h-9 px-3 text-xs rounded-xl border border-[#e0e5f2] focus:border-[#4318FF] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider">
                        Opasitas Foto
                      </label>
                      <span className="text-[11px] font-semibold text-[#1B2559]">
                        {Math.round(config.background.overlay * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={config.background.overlay}
                      onChange={(e) =>
                        updateConfig({
                          ...config,
                          background: { ...config.background, overlay: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-[#4318FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Warna Dasar Latar
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.background.color}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            background: { ...config.background, color: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={config.background.color}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            background: { ...config.background, color: e.target.value },
                          })
                        }
                        className="flex-1 h-8 px-2 text-xs font-mono rounded-lg border border-[#e0e5f2]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#1B2559] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.background.topGradient}
                      onChange={(e) =>
                        updateConfig({
                          ...config,
                          background: { ...config.background, topGradient: e.target.checked },
                        })
                      }
                      className="rounded accent-[#4318FF]"
                    />
                    <span>Gradien Gelap Atas</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#1B2559] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.background.bottomGradient}
                      onChange={(e) =>
                        updateConfig({
                          ...config,
                          background: { ...config.background, bottomGradient: e.target.checked },
                        })
                      }
                      className="rounded accent-[#4318FF]"
                    />
                    <span>Gradien Gelap Bawah</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Header Badge Acara */}
          <div
            ref={(el) => { sectionRefs.current.header = el; }}
            className={`border rounded-2xl transition-all ${
              flashedSection === "header"
                ? "border-[#4318FF] ring-2 ring-[#4318FF]/20"
                : "border-[#e0e5f2]"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection("header")}
              className="w-full px-4 py-3 bg-[#f8fafd] hover:bg-[#f0f4fd] rounded-2xl flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#4318FF]" />
                <span className="text-xs font-bold text-[#1B2559]">2. Badge Acara (Pojok Kanan Atas)</span>
              </div>
              <span className="text-xs text-[#8F9BBA]">
                {openSections.header ? "−" : "+"}
              </span>
            </button>

            {openSections.header && (
              <div className="p-4 space-y-3.5 bg-white rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1B2559]">Tampilkan Badge Acara</label>
                  <input
                    type="checkbox"
                    checked={config.header.show}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        header: { ...config.header, show: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded accent-[#4318FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Teks Baris 1
                    </label>
                    <input
                      type="text"
                      value={config.header.badge}
                      onChange={(e) =>
                        updateConfig({
                          ...config,
                          header: { ...config.header, badge: e.target.value },
                        })
                      }
                      placeholder="The Wedding of"
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#e0e5f2] focus:border-[#4318FF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Nama Mempelai / Acara
                    </label>
                    <input
                      type="text"
                      value={config.header.title}
                      onChange={(e) =>
                        updateConfig({
                          ...config,
                          header: { ...config.header, title: e.target.value },
                        })
                      }
                      placeholder="Jaya & Rika"
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#e0e5f2] focus:border-[#4318FF] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Font Nama Acara
                    </label>
                    <select
                      value={config.header.font}
                      onChange={(e) =>
                        updateConfig({
                          ...config,
                          header: { ...config.header, font: e.target.value },
                        })
                      }
                      className="w-full h-9 px-2.5 text-xs rounded-xl border border-[#e0e5f2] bg-white text-[#1B2559] outline-none"
                    >
                      {FONTS_TITLE.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Warna
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.header.color}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            header: { ...config.header, color: e.target.value },
                          })
                        }
                        className="w-9 h-9 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5 shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Konten & Formulir Nama */}
          <div
            ref={(el) => { sectionRefs.current.content = el; }}
            className={`border rounded-2xl transition-all ${
              flashedSection === "content"
                ? "border-[#4318FF] ring-2 ring-[#4318FF]/20"
                : "border-[#e0e5f2]"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection("content")}
              className="w-full px-4 py-3 bg-[#f8fafd] hover:bg-[#f0f4fd] rounded-2xl flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#4318FF]" />
                <span className="text-xs font-bold text-[#1B2559]">3. Teks Judul & Input Nama Tamu</span>
              </div>
              <span className="text-xs text-[#8F9BBA]">
                {openSections.content ? "−" : "+"}
              </span>
            </button>

            {openSections.content && (
              <div className="p-4 space-y-3.5 bg-white rounded-b-2xl">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider">
                      Judul Utama / Pertanyaan
                    </label>
                    <span className="text-[10px] text-[#8F9BBA]">Bisa pakai Enter untuk baris baru</span>
                  </div>
                  <textarea
                    rows={2}
                    value={config.content.headline}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        content: { ...config.content, headline: e.target.value },
                      })
                    }
                    placeholder="Dari Siapa&#10;Kenangan Ini?"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e0e5f2] focus:border-[#4318FF] outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Warna Judul
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.content.headlineColor}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            content: { ...config.content, headlineColor: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={config.content.headlineColor}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            content: { ...config.content, headlineColor: e.target.value },
                          })
                        }
                        className="flex-1 h-8 px-2 text-xs font-mono rounded-lg border border-[#e0e5f2]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider">
                        Ukuran Judul
                      </label>
                      <span className="text-xs font-semibold text-[#1B2559]">
                        {config.content.headlineSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={46}
                      value={config.content.headlineSize}
                      onChange={(e) =>
                        updateConfig({
                          ...config,
                          content: { ...config.content, headlineSize: parseInt(e.target.value) },
                        })
                      }
                      className="w-full accent-[#4318FF]"
                    />
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                        Label Formulir
                      </label>
                      <input
                        type="text"
                        value={config.content.nameLabel}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            content: { ...config.content, nameLabel: e.target.value },
                          })
                        }
                        placeholder="Nama Tamu"
                        className="w-full h-9 px-3 text-xs rounded-xl border border-[#e0e5f2] focus:border-[#4318FF] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                        Warna Label
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={config.content.nameLabelColor}
                          onChange={(e) =>
                            updateConfig({
                              ...config,
                              content: { ...config.content, nameLabelColor: e.target.value },
                            })
                          }
                          className="w-9 h-9 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5 shrink-0"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Teks Contoh / Placeholder
                    </label>
                    <input
                      type="text"
                      value={config.content.placeholder}
                      onChange={(e) =>
                        updateConfig({
                          ...config,
                          content: { ...config.content, placeholder: e.target.value },
                        })
                      }
                      placeholder="Ketik di Sini......."
                      className="w-full h-9 px-3 text-xs rounded-xl border border-[#e0e5f2] focus:border-[#4318FF] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                        Warna Garis Bawah
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.content.underlineColor}
                          onChange={(e) =>
                            updateConfig({
                              ...config,
                              content: { ...config.content, underlineColor: e.target.value },
                            })
                          }
                          className="w-8 h-8 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5 shrink-0"
                        />
                        <input
                          type="text"
                          value={config.content.underlineColor}
                          onChange={(e) =>
                            updateConfig({
                              ...config,
                              content: { ...config.content, underlineColor: e.target.value },
                            })
                          }
                          className="flex-1 h-8 px-2 text-xs font-mono rounded-lg border border-[#e0e5f2]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                        Warna Teks Ketikan
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.content.textColor}
                          onChange={(e) =>
                            updateConfig({
                              ...config,
                              content: { ...config.content, textColor: e.target.value },
                            })
                          }
                          className="w-8 h-8 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5 shrink-0"
                        />
                        <input
                          type="text"
                          value={config.content.textColor}
                          onChange={(e) =>
                            updateConfig({
                              ...config,
                              content: { ...config.content, textColor: e.target.value },
                            })
                          }
                          className="flex-1 h-8 px-2 text-xs font-mono rounded-lg border border-[#e0e5f2]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Tombol Selanjutnya */}
          <div
            ref={(el) => { sectionRefs.current.button = el; }}
            className={`border rounded-2xl transition-all ${
              flashedSection === "button"
                ? "border-[#4318FF] ring-2 ring-[#4318FF]/20"
                : "border-[#e0e5f2]"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection("button")}
              className="w-full px-4 py-3 bg-[#f8fafd] hover:bg-[#f0f4fd] rounded-2xl flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#4318FF]" />
                <span className="text-xs font-bold text-[#1B2559]">4. Tombol Aksi (Selanjutnya)</span>
              </div>
              <span className="text-xs text-[#8F9BBA]">
                {openSections.button ? "−" : "+"}
              </span>
            </button>

            {openSections.button && (
              <div className="p-4 space-y-3.5 bg-white rounded-b-2xl">
                <div>
                  <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                    Teks Tombol
                  </label>
                  <input
                    type="text"
                    value={config.button.text}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        button: { ...config.button, text: e.target.value },
                      })
                    }
                    placeholder="Selanjutnya"
                    className="w-full h-9 px-3 text-xs rounded-xl border border-[#e0e5f2] focus:border-[#4318FF] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Warna Background Tombol
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.button.bg}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            button: { ...config.button, bg: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={config.button.bg}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            button: { ...config.button, bg: e.target.value },
                          })
                        }
                        className="flex-1 h-8 px-2 text-xs font-mono rounded-lg border border-[#e0e5f2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Warna Teks Tombol
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.button.color}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            button: { ...config.button, color: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={config.button.color}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            button: { ...config.button, color: e.target.value },
                          })
                        }
                        className="flex-1 h-8 px-2 text-xs font-mono rounded-lg border border-[#e0e5f2]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Warna Lingkaran Ikon
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.button.iconBg}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            button: { ...config.button, iconBg: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={config.button.iconBg}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            button: { ...config.button, iconBg: e.target.value },
                          })
                        }
                        className="flex-1 h-8 px-2 text-xs font-mono rounded-lg border border-[#e0e5f2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Pilihan Ikon
                    </label>
                    <select
                      value={config.button.icon}
                      onChange={(e) =>
                        updateConfig({
                          ...config,
                          button: { ...config.button, icon: e.target.value },
                        })
                      }
                      className="w-full h-8 px-2 text-xs rounded-xl border border-[#e0e5f2] bg-white text-[#1B2559] outline-none"
                    >
                      <option value="arrow">Panah Diagonal (↗)</option>
                      <option value="camera">Kamera</option>
                      <option value="heart">Hati</option>
                      <option value="none">Tanpa Ikon</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Footer Branding */}
          <div
            ref={(el) => { sectionRefs.current.footer = el; }}
            className={`border rounded-2xl transition-all ${
              flashedSection === "footer"
                ? "border-[#4318FF] ring-2 ring-[#4318FF]/20"
                : "border-[#e0e5f2]"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleSection("footer")}
              className="w-full px-4 py-3 bg-[#f8fafd] hover:bg-[#f0f4fd] rounded-2xl flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#4318FF]" />
                <span className="text-xs font-bold text-[#1B2559]">5. Footer & Branding Bawah</span>
              </div>
              <span className="text-xs text-[#8F9BBA]">
                {openSections.footer ? "−" : "+"}
              </span>
            </button>

            {openSections.footer && (
              <div className="p-4 space-y-3.5 bg-white rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1B2559]">Tampilkan Footer</label>
                  <input
                    type="checkbox"
                    checked={config.footer.show}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        footer: { ...config.footer, show: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded accent-[#4318FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                    Teks Branding
                  </label>
                  <input
                    type="text"
                    value={config.footer.text}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        footer: { ...config.footer, text: e.target.value },
                      })
                    }
                    placeholder="Virtual Photobooth by RUANGTEMUPHOTOBOOTH"
                    className="w-full h-9 px-3 text-xs rounded-xl border border-[#e0e5f2] focus:border-[#4318FF] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8F9BBA] uppercase tracking-wider mb-1">
                      Warna Teks Footer
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.footer.color}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            footer: { ...config.footer, color: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-[#e0e5f2] cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={config.footer.color}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            footer: { ...config.footer, color: e.target.value },
                          })
                        }
                        className="flex-1 h-8 px-2 text-xs font-mono rounded-lg border border-[#e0e5f2]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-xs text-[#1B2559] cursor-pointer pb-1">
                      <input
                        type="checkbox"
                        checked={config.footer.showLogo}
                        onChange={(e) =>
                          updateConfig({
                            ...config,
                            footer: { ...config.footer, showLogo: e.target.checked },
                          })
                        }
                        className="rounded accent-[#4318FF]"
                      />
                      <span>Tampilkan Ikon Logo</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Phone Stage */}
        <div className="lg:col-span-6 xl:col-span-7 bg-[#0b101b] p-6 relative flex flex-col items-center justify-center overflow-hidden select-none">
          {/* Stage Controls Overlay */}
          <div className="absolute top-4 inset-x-6 z-20 flex items-center justify-between pointer-events-none">
            {/* Device Switcher */}
            <div className="pointer-events-auto bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-white/10 flex items-center gap-1 shadow-lg">
              {DEVICES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    device.id === d.id
                      ? "bg-[#4318FF] text-white shadow"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Zoom & Reset Controls */}
            <div className="pointer-events-auto bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-white/10 flex items-center gap-1 shadow-lg text-white/80">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 text-sm font-bold"
                title="Zoom Out"
              >
                −
              </button>
              <span className="text-xs font-mono px-1 w-12 text-center text-white font-semibold">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 text-sm font-bold"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="px-2.5 h-8 rounded-xl text-xs hover:bg-white/10 transition-colors font-medium text-white/80"
                title="Reset Tampilan"
              >
                100%
              </button>
            </div>
          </div>

          {/* Interactive Hint banner */}
          <div className="absolute bottom-4 z-20 pointer-events-none text-[11px] text-white/40 bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/5">
            Klik elemen di preview untuk melompat langsung ke pengaturannya
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="absolute top-16 z-30 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl animate-fade-in">
              {toastMsg}
            </div>
          )}

          {/* Pan & Zoom Canvas */}
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing ${
              isPanning ? "cursor-grabbing" : ""
            }`}
          >
            <div
              onPointerDown={() => {
                dragDistanceRef.current = 0;
              }}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.15s ease-out",
              }}
              className="relative shadow-[0_25px_70px_rgba(0,0,0,0.85)] rounded-[44px] p-3 bg-stone-900 border-[3px] border-stone-700/80"
            >
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-5 inset-x-0 mx-auto w-24 h-4 bg-black rounded-full z-30 pointer-events-none" />

              {/* Mobile Screen Container */}
              <div
                style={{
                  width: `${device.w}px`,
                  height: `${device.h}px`,
                }}
                className="overflow-hidden rounded-[36px] bg-black relative shadow-inner"
              >
                <GuestNamePageView
                  config={config}
                  event={event}
                  guestName={previewGuestName}
                  onGuestNameChange={setPreviewGuestName}
                  onSectionClick={handleSectionClickInPreview}
                  onBack={() => showToast("Tombol Kembali ke Poster")}
                  onSubmit={() => showToast("Tombol Selanjutnya Berfungsi!")}
                  interactive={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Drawer Modal */}
      {showJsonDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-[#1B2559] mb-1">
              Konfigurasi JSON (Halaman Input Nama)
            </h3>
            <p className="text-xs text-[#8F9BBA] mb-4">
              Anda dapat menyalin atau menempelkan konfigurasi JSON langsung.
            </p>
            <textarea
              rows={12}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full font-mono text-xs p-3 rounded-2xl border border-stone-300 bg-stone-50 text-stone-900 outline-none focus:border-[#4318FF]"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowJsonDrawer(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonInput);
                    const valid = resolveGuestNameConfig(parsed, event);
                    updateConfig(valid);
                    setShowJsonDrawer(false);
                    showToast("JSON berhasil diterapkan!");
                  } catch (e: any) {
                    alert("Format JSON tidak valid: " + e.message);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#4318FF] hover:bg-[#3311DB] rounded-xl shadow"
              >
                Terapkan JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
