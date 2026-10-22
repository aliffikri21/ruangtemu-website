"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { EventItem, Booking, Package, GalleryEntry, BookingStatus, FrameItem, FrameType, PhotoSlot, LandingThemeConfig } from "@/types";
import { formatRupiah, formatDate, formatTime } from "@/lib/utils";
import { detectTransparentRegions } from "@/lib/frame-detect";
import { LandingUIEditor } from "./landing-ui-editor";
import { getDefaultThemeConfigForEvent } from "@/lib/theme-config";
import {
  VIRTUAL_BOOTH_PACKAGES,
  PHOTOBOOTH_PHYSICAL_PACKAGES,
  PhotoboothPhysicalPackage,
  PhysicalPackageKey,
  PhysicalPrintSize,
} from "@/lib/doku";

interface AdminViewProps {
  initialEvents: EventItem[];
  initialBookings: Booking[];
  initialPackages: Package[];
  initialEntries: GalleryEntry[];
}

interface FrameUploadSlot {
  id: string;
  name: string;
  template_type: FrameType;
  previewUrl: string;
  fileName?: string;
  fileSize?: string;
  error?: string;
  photoSlots?: PhotoSlot[];
  detectedCount?: number;
  isAnalyzing?: boolean;
  frameImageWidth?: number;
  frameImageHeight?: number;
}

const INITIAL_FRAME_SLOTS: FrameUploadSlot[] = [
  {
    id: "slot-1",
    name: "Classic Floral Strip",
    template_type: "strip_3",
    previewUrl: "/frames/frame-strip-floral.png",
    fileName: "frame-strip-floral.png (Preset)",
    fileSize: "14 KB",
  },
  {
    id: "slot-2",
    name: "Midnight Navy Gold",
    template_type: "strip_3",
    previewUrl: "/frames/frame-strip-navy-gold.png",
    fileName: "frame-strip-navy-gold.png (Preset)",
    fileSize: "13 KB",
  },
];

// SVG icon components for sidebar and cards
function IconDashboard({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconCalendar({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconEdit({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function IconBooking({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconImage({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
function IconPackage({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function IconSettings({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconLogout({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconSearch({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
function IconPlus({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconTrash({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconUpload({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function IconSun({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconSidebarToggle({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}
function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconBell({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// SFX "Ting" Bell Chime Synthesizer via Web Audio API
function playTingSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => { });
    }

    const now = ctx.currentTime;

    // Harmonic bell frequencies for a bright, pristine crystal "ting" chime
    const partials = [
      { freq: 2093.0, gain: 0.35, decay: 0.9 },     // C7 (Fundamental bright strike)
      { freq: 3135.96, gain: 0.22, decay: 0.65 },   // G7 (Harmonic overtone)
      { freq: 4186.01, gain: 0.12, decay: 0.4 },    // C8 (High sparkle shimmer)
      { freq: 1046.5, gain: 0.18, decay: 0.75 },    // C6 (Warm body resonance)
    ];

    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Strike: rapid percussive attack in 3ms, then smooth natural exponential decay
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.003);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay + 0.05);
    });

    setTimeout(() => {
      try {
        ctx.close();
      } catch { }
    }, 1200);
  } catch (err) {
    console.warn("Could not play notification sound:", err);
  }
}

function formatNotificationClockTime(isoString?: string): { time: string; dateAndClock: string; relative: string } {
  if (!isoString) return { time: "--:--", dateAndClock: "-", relative: "Baru saja" };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { time: "--:--", dateAndClock: "-", relative: "Baru saja" };

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const clock = `${hours}:${minutes} WITA`;

    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const dateAndClock = `${day} ${month} • ${clock}`;

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    let relative = "";
    if (isToday) {
      relative = `Hari ini • ${clock}`;
    } else if (isYesterday) {
      relative = `Kemarin • ${clock}`;
    } else {
      relative = dateAndClock;
    }

    return { time: clock, dateAndClock, relative };
  } catch {
    return { time: "--:--", dateAndClock: "-", relative: "Baru saja" };
  }
}
function IconStar({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FFB547" stroke="#FFB547" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconCheck({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconRefresh({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  );
}
function IconCamera({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function IconMonitor({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
function IconQrCode({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M14 14h3v3h-3zM14 20h3M20 14v3M20 20h.01" />
    </svg>
  );
}
function IconUser({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconMapPin({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconClock({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconShieldCheck({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconDesktopTablet({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="13" height="11" rx="2" />
      <polygon points="5 14 5 17 12 17 12 14" />
      <line x1="3" y1="17" x2="14" y2="17" />
      <rect x="15" y="7" width="7" height="13" rx="1.5" />
      <line x1="18.5" y1="17.5" x2="18.51" y2="17.5" strokeWidth="2.5" />
    </svg>
  );
}

function IconSmartphoneOff({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function AdminMobileGuard() {
  const [screenSize, setScreenSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const updateSize = () => {
      setScreenSize({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, []);

  return (
    <div
      id="admin-mobile-guard"
      className="admin-mobile-guard fixed inset-0 z-[999999] bg-[#0B1021] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto select-none"
    >
      <div className="w-full max-w-md bg-[#131B35]/95 border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl relative my-auto">
        {/* Glow accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#4318FF]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Akses Smartphone Dibatasi
        </div>

        {/* Icon container */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E2958] to-[#121938] border border-white/10 flex items-center justify-center text-[#4318FF] shadow-inner mb-5">
          <IconDesktopTablet size={40} className="text-white drop-shadow" />
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
            <IconSmartphoneOff size={14} />
          </div>
        </div>

        {/* Title & Message */}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-2">
          Silakan Gunakan Mode Desktop
        </h2>
        <p className="text-xs sm:text-sm text-[#A3AED0] leading-relaxed mb-5">
          Dashboard Admin <strong className="text-white font-medium">RUANGTEMU</strong> hanya dapat diakses melalui perangkat tablet ke atas (lebar minimum 768px) atau komputer/laptop.
        </p>

        {/* Instructions Box */}
        <div className="text-left bg-[#0E1428] border border-white/10 rounded-2xl p-4 mb-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E0E5F2] uppercase tracking-wider">
            <IconShieldCheck size={14} className="text-[#01B574]" />
            <span>Cara Buka di Smartphone:</span>
          </div>
          <ol className="text-xs text-[#8F9BBA] space-y-2 pl-4 list-decimal leading-relaxed">
            <li>
              Buka menu browser Anda (ikon <strong className="text-white">titik tiga ⋮</strong> di Chrome atau <strong className="text-white">aA</strong> di Safari).
            </li>
            <li>
              Aktifkan opsi <strong className="text-[#4318FF] font-semibold bg-[#4318FF]/10 px-1.5 py-0.5 rounded">Situs Desktop</strong> atau <strong className="text-[#4318FF] font-semibold bg-[#4318FF]/10 px-1.5 py-0.5 rounded">Desktop Site</strong>.
            </li>
            <li>
              Tekan tombol <strong className="text-white">Muat Ulang Halaman</strong> di bawah ini.
            </li>
          </ol>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            id="admin-reload-btn"
            onClick={() => window.location.reload()}
            className="w-full h-11 px-5 rounded-xl bg-[#4318FF] hover:bg-[#3311DB] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4318FF]/20 active:scale-95 cursor-pointer"
          >
            <IconRefresh size={16} />
            <span>Muat Ulang Halaman</span>
          </button>

          <Link
            href="/"
            className="w-full h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Kembali ke Beranda
          </Link>
        </div>

        {/* Live resolution indicator */}
        {screenSize && (
          <p className="mt-4 text-[10px] text-[#707EAE]">
            Ukuran Layar Anda: <span className="font-mono text-[#A3AED0]">{screenSize.width} × {screenSize.height} px</span> (Dibutuhkan min. 768px)
          </p>
        )}
      </div>
    </div>
  );
}


function formatIndonesianDateTime(dateInput?: string | Date | number) {
  if (!dateInput) return "-";
  try {
    const d = typeof dateInput === "number" || typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return String(dateInput);
  }
}

export function AdminView({
  initialEvents,
  initialBookings,
  initialPackages,
  initialEntries,
}: AdminViewProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ruangtemu_admin_dark");
      if (saved === "true") {
        setIsDarkMode(true);
      } else if (saved === null && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setIsDarkMode(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ruangtemu_admin_dark", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState<"overview" | "events" | "edit" | "bookings" | "gallery" | "packages">("overview");
  const [overviewFilter, setOverviewFilter] = useState<"all" | "active" | "completed">("all");
  const [overviewCategoryFilter, setOverviewCategoryFilter] = useState<"all" | "virtual_photobooth" | "photobooth">("all");
  const [eventsCategoryFilter, setEventsCategoryFilter] = useState<"all" | "virtual_photobooth" | "photobooth">("all");
  const [eventsPaymentFilter, setEventsPaymentFilter] = useState<"all" | "PAID" | "PENDING">("all");
  const [bookingsCategoryFilter, setBookingsCategoryFilter] = useState<"all" | "virtual_photobooth" | "photobooth">("all");
  const [packagesCategoryFilter, setPackagesCategoryFilter] = useState<"all" | "virtual_photobooth" | "photobooth">("all");

  const [events, setEvents] = useState<EventItem[]>(() =>
    [...(initialEvents || [])].sort(
      (a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
    )
  );
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedBookingProof, setSelectedBookingProof] = useState<Booking | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  const [newBookingNotif, setNewBookingNotif] = useState<Booking | null>(null);
  const knownBookingIdsRef = useRef<Set<string>>(
    new Set((initialBookings || []).map((b) => b.id))
  );
  const isInitialMountRef = useRef<boolean>(true);
  const [entries, setEntries] = useState<GalleryEntry[]>(initialEntries);
  const [galleryEventFilter, setGalleryEventFilter] = useState<string>("all");
  const [isRefreshingGallery, setIsRefreshingGallery] = useState(false);

  // Maintenance Mode states
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState<boolean>(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsMaintenanceMode(Boolean(data.enabled));
          if (data.message) setMaintenanceMessage(data.message);
        }
      })
      .catch((err) => console.error("Error fetching maintenance status:", err));
  }, []);

  const handleToggleMaintenance = async (targetState: boolean, customMessage?: string) => {
    setIsLoadingMaintenance(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: targetState,
          message: customMessage || maintenanceMessage || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsMaintenanceMode(data.enabled);
        if (data.message) setMaintenanceMessage(data.message);
        setShowMaintenanceModal(false);
      } else {
        alert(data.error || "Gagal mengubah mode maintenance.");
      }
    } catch (err) {
      console.error(err);
      alert("Koneksi gagal. Coba lagi.");
    } finally {
      setIsLoadingMaintenance(false);
    }
  };

  // Top Header Search & Notification Popover States
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => new Set());
  const [notifTabFilter, setNotifTabFilter] = useState<"all" | "bookings" | "events">("all");

  // Close notification popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  type UnifiedNotif = {
    id: string;
    type: "booking" | "event";
    title: string;
    clientName: string;
    category: "virtual_photobooth" | "photobooth";
    packageName?: string;
    price?: number;
    paymentStatus?: "PAID" | "PENDING";
    createdAt: string;
    dateObj: Date;
    rawBooking?: Booking;
    rawEvent?: EventItem;
  };

  // Unified stream of incoming events and client bookings with timestamp
  const notificationItems = useMemo<UnifiedNotif[]>(() => {
    const items: UnifiedNotif[] = [];

    // 1. Pesanan Klien (Bookings)
    (bookings || []).forEach((b) => {
      const isPhysical = (b.category || b.booking_category) === "photobooth";
      items.push({
        id: `booking-${b.id}`,
        type: "booking",
        title: b.event_name || (isPhysical ? "Photobooth Fisik" : "Virtual Photobooth"),
        clientName: b.customer_name,
        category: isPhysical ? "photobooth" : "virtual_photobooth",
        packageName: b.package_name,
        price: b.total_price,
        paymentStatus: b.payment_status === "PAID" ? "PAID" : "PENDING",
        createdAt: b.created_at,
        dateObj: new Date(b.created_at || b.event_date || Date.now()),
        rawBooking: b,
      });
    });

    // 2. Acara / Event Baru (Events)
    (events || []).forEach((e) => {
      const isPhysical = e.category === "photobooth";
      items.push({
        id: `event-${e.id}`,
        type: "event",
        title: e.title,
        clientName: e.host_name,
        category: isPhysical ? "photobooth" : "virtual_photobooth",
        packageName: e.package_name || (e.package_tier ? `Paket ${e.package_tier.toUpperCase()}` : undefined),
        price: e.payment_amount,
        paymentStatus: e.payment_status === "PAID" ? "PAID" : "PENDING",
        createdAt: e.created_at,
        dateObj: new Date(e.created_at || e.date || Date.now()),
        rawEvent: e,
      });
    });

    // Sort descending by timestamp (newest first)
    return items.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [bookings, events]);

  const filteredNotifs = useMemo<UnifiedNotif[]>(() => {
    if (notifTabFilter === "bookings") return notificationItems.filter((n: UnifiedNotif) => n.type === "booking");
    if (notifTabFilter === "events") return notificationItems.filter((n: UnifiedNotif) => n.type === "event");
    return notificationItems;
  }, [notificationItems, notifTabFilter]);

  const unreadCount = useMemo<number>(() => {
    return notificationItems.filter((item: UnifiedNotif) => !readNotifIds.has(item.id)).length;
  }, [notificationItems, readNotifIds]);

  const handleMarkAllNotifsAsRead = () => {
    setReadNotifIds(new Set(notificationItems.map((n: UnifiedNotif) => n.id)));
  };

  const handleNotificationClick = (item: UnifiedNotif) => {
    setReadNotifIds((prev) => new Set([...prev, item.id]));
    setIsNotifOpen(false);

    if (item.type === "booking" && item.rawBooking) {
      setSelectedBookingDetail(item.rawBooking);
      setActiveTab("bookings");
    } else if (item.type === "event" && item.rawEvent) {
      setActiveTab("events");
    }
  };

  const getEventForEntry = (ent: GalleryEntry) => {
    return events.find((e) => e.id === ent.event_id || (ent.event_slug && e.slug === ent.event_slug));
  };

  const refreshEntries = async () => {
    setIsRefreshingGallery(true);
    try {
      const res = await fetch("/api/entries", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        setEntries(data.entries);
      }
    } catch (err) {
      console.error("Gagal memperbarui galeri foto:", err);
    } finally {
      setIsRefreshingGallery(false);
    }
  };

  const [isRefreshingBookings, setIsRefreshingBookings] = useState(false);

  // Auto-dismiss notification after 14 seconds
  useEffect(() => {
    if (!newBookingNotif) return;
    const timer = setTimeout(() => {
      setNewBookingNotif(null);
    }, 14000);
    return () => clearTimeout(timer);
  }, [newBookingNotif]);

  // Unlock Web Audio context upon first interaction anywhere
  useEffect(() => {
    const resumeAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const dummy = new AudioCtx();
          dummy.resume().then(() => dummy.close()).catch(() => { });
        }
      } catch { }
      window.removeEventListener("click", resumeAudio);
      window.removeEventListener("keydown", resumeAudio);
      window.removeEventListener("touchstart", resumeAudio);
    };
    window.addEventListener("click", resumeAudio, { once: true });
    window.addEventListener("keydown", resumeAudio, { once: true });
    window.addEventListener("touchstart", resumeAudio, { once: true });
    return () => {
      window.removeEventListener("click", resumeAudio);
      window.removeEventListener("keydown", resumeAudio);
      window.removeEventListener("touchstart", resumeAudio);
    };
  }, []);

  const refreshBookings = async (silent = false) => {
    if (!silent) setIsRefreshingBookings(true);
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        const fetchedBookings: Booking[] = data.bookings;

        if (!isInitialMountRef.current) {
          // Detect any newly placed bookings
          const newItems = fetchedBookings.filter(
            (b) => !knownBookingIdsRef.current.has(b.id)
          );
          if (newItems.length > 0) {
            const latestNewBooking = newItems[0];
            setNewBookingNotif(latestNewBooking);
            playTingSound();
          }
        } else {
          isInitialMountRef.current = false;
        }

        // Keep set of known IDs up to date
        fetchedBookings.forEach((b) => knownBookingIdsRef.current.add(b.id));
        setBookings(fetchedBookings);
      }
    } catch (err) {
      console.error("Gagal memperbarui data reservasi:", err);
    } finally {
      if (!silent) setIsRefreshingBookings(false);
    }
  };

  useEffect(() => {
    refreshBookings(true);
    const interval = setInterval(() => {
      refreshBookings(true);
    }, 5000);

    const onFocus = () => {
      refreshBookings(true);
    };
    window.addEventListener("focus", onFocus);

    // BroadcastChannel for instant cross-tab booking notifications
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("ruangtemu_bookings");
        channel.onmessage = (event) => {
          if (event.data?.type === "NEW_BOOKING" && event.data.booking) {
            const incoming: Booking = event.data.booking;
            if (!knownBookingIdsRef.current.has(incoming.id)) {
              knownBookingIdsRef.current.add(incoming.id);
              setBookings((prev) => [incoming, ...prev.filter((b) => b.id !== incoming.id)]);
              setNewBookingNotif(incoming);
              playTingSound();
            }
          }
        };
      }
    } catch { }

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      if (channel) {
        try {
          channel.close();
        } catch { }
      }
    };
  }, []);

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    host_name: "",
    slug: "",
    date: "",
    venue: "",
    city: "Palopo",
    description: "",
    category: "virtual_photobooth" as "virtual_photobooth" | "photobooth",
  });

  // Virtual Booth & Physical Photobooth Package & DOKU Payment States
  const [selectedPackage, setSelectedPackage] = useState<"bronze" | "silver" | "gold">("silver");
  const [selectedPhysicalPackage, setSelectedPhysicalPackage] = useState<PhysicalPackageKey>("hours2");
  const [adminPhysicalPrintSize, setAdminPhysicalPrintSize] = useState<PhysicalPrintSize>("2R");
  const [sourceBooking, setSourceBooking] = useState<Booking | null>(null);
  const [newEventPaymentStatus, setNewEventPaymentStatus] = useState<"PAID" | "PENDING">("PAID");
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<{ title: string; subtitle: string } | null>(null);

  const isNewEventPhysical = newEvent.category === "photobooth";
  const currentVirtualPackage = VIRTUAL_BOOTH_PACKAGES[selectedPackage];
  const currentPhysicalPackage = PHOTOBOOTH_PHYSICAL_PACKAGES[selectedPhysicalPackage] || PHOTOBOOTH_PHYSICAL_PACKAGES.hours2;
  const currentPhysicalPrice = adminPhysicalPrintSize === "4R" ? currentPhysicalPackage.price4R : currentPhysicalPackage.price2R;

  const currentPackage = isNewEventPhysical ? currentPhysicalPackage : currentVirtualPackage;
  const packagePrice = isNewEventPhysical ? currentPhysicalPrice : currentVirtualPackage.price;
  const totalPayment = isNewEventPhysical
    ? (sourceBooking && sourceBooking.payment_status === "PAID"
      ? (sourceBooking.payment_amount || sourceBooking.total_price || currentPhysicalPrice)
      : currentPhysicalPrice)
    : (sourceBooking && sourceBooking.payment_status === "PAID"
      ? (sourceBooking.payment_amount || sourceBooking.total_price || packagePrice)
      : packagePrice);

  const startDateStr = newEvent.date || new Date().toISOString().split("T")[0];
  const startDateObj = new Date(startDateStr);
  const durationDays = isNewEventPhysical ? 7 : currentVirtualPackage.durationDays;
  const endDateObj = new Date(startDateObj.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const endDateStr = endDateObj.toISOString().split("T")[0];

  const [frameSlots, setFrameSlots] = useState<FrameUploadSlot[]>(INITIAL_FRAME_SLOTS);

  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    host_name: "",
    slug: "",
    date: "",
    venue: "",
    city: "Palopo",
    description: "",
    category: "virtual_photobooth" as "virtual_photobooth" | "photobooth",
  });
  const [editFrames, setEditFrames] = useState<FrameUploadSlot[]>([]);
  const [editThemeConfig, setEditThemeConfig] = useState<LandingThemeConfig | undefined>(undefined);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  // Real-time Clock for Live Duration Countdown (ticking every 1000ms)
  const [nowTime, setNowTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Edit Event Payment & Extension States
  const [editSelectedTier, setEditSelectedTier] = useState<"bronze" | "silver" | "gold">("silver");
  const [editSelectedPhysicalTier, setEditSelectedPhysicalTier] = useState<PhysicalPackageKey>("hours2");
  const [editPhysicalPrintSize, setEditPhysicalPrintSize] = useState<PhysicalPrintSize>("2R");
  const [editPaymentStatus, setEditPaymentStatus] = useState<"PAID" | "PENDING">("PAID");
  const [showExtendModal, setShowExtendModal] = useState<boolean>(false);
  const [extendTierChoice, setExtendTierChoice] = useState<"bronze" | "silver" | "gold">("silver");
  const [isExtendingDuration, setIsExtendingDuration] = useState<boolean>(false);

  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [togglingEventId, setTogglingEventId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleStartEditEvent = (evt: EventItem) => {
    setEditingEvent(evt);
    const isPhysical = evt.category === "photobooth";
    if (isPhysical) {
      const rawTier = (evt.package_tier as PhysicalPackageKey) || "hours2";
      if (PHOTOBOOTH_PHYSICAL_PACKAGES[rawTier]) {
        setEditSelectedPhysicalTier(rawTier);
      } else {
        const isDeluxe = (evt.package_name || "").toLowerCase().includes("deluxe") || (evt.package_name || "").includes("3 jam");
        setEditSelectedPhysicalTier(isDeluxe ? "hours3" : "hours2");
      }
      const is4R = (evt.package_name || "").includes("4R");
      setEditPhysicalPrintSize(is4R ? "4R" : "2R");
    } else {
      setEditSelectedTier((evt.package_tier as "bronze" | "silver" | "gold") || "silver");
      setExtendTierChoice((evt.package_tier as "bronze" | "silver" | "gold") || "silver");
    }
    const isPaid =
      evt.payment_status === "PAID" ||
      (Boolean(evt.package_tier) &&
        evt.payment_status !== "PENDING" &&
        evt.payment_status !== "FAILED");
    setEditPaymentStatus(isPaid ? "PAID" : "PENDING");
    setEditForm({
      title: evt.title || "",
      host_name: evt.host_name || "",
      slug: evt.slug || "",
      date: evt.date || "",
      venue: evt.venue || "",
      city: evt.city || "Palopo",
      description: evt.description || "",
      category: evt.category === "photobooth" ? "photobooth" : "virtual_photobooth",
    });
    setEditThemeConfig(evt.theme_config || getDefaultThemeConfigForEvent(evt));

    const slots: FrameUploadSlot[] = (evt.assigned_frames && evt.assigned_frames.length > 0)
      ? evt.assigned_frames.map((fr, idx) => ({
        id: fr.id || `slot-edit-${idx}`,
        name: fr.name || `Frame ${idx + 1}`,
        template_type: fr.template_type || "strip_3",
        previewUrl: fr.preview_url || fr.config_json?.customOverlayUrl || "",
        fileName: fr.name,
        photoSlots: fr.config_json?.photoSlots,
        detectedCount: fr.config_json?.photoCount || fr.config_json?.photoSlots?.length,
        frameImageWidth: fr.config_json?.frameImageWidth,
        frameImageHeight: fr.config_json?.frameImageHeight,
      }))
      : [
        {
          id: `slot-edit-0`,
          name: "Classic Floral Strip",
          template_type: "strip_3",
          previewUrl: "/frames/frame-strip-floral.png",
          fileName: "frame-strip-floral.png (Preset)",
          fileSize: "14 KB",
        },
      ];

    setEditFrames(slots);
    setEditSuccessMsg("");
    setEditErrorMsg("");
    setActiveTab("edit");
  };

  const handleEditFrameFileUpload = (index: number, file: File | null) => {
    if (!file) return;

    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    if (!isPng) {
      setEditFrames((prev) =>
        prev.map((slot, i) =>
          i === index
            ? { ...slot, error: "Format file wajib PNG (.png) dengan transparansi." }
            : slot
        )
      );
      return;
    }

    setEditFrames((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, isAnalyzing: true, error: undefined } : slot
      )
    );

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      try {
        const detection = await detectTransparentRegions(dataUrl);
        const detectedType: FrameType = detection.photoCount > 0 ? "custom" : "strip_3";

        let serverUrl = dataUrl;
        try {
          const uploadRes = await fetch("/api/frames/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dataUrl, fileName: file.name }),
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            serverUrl = uploadData.url;
          }
        } catch (uErr) {
          console.warn("Server upload failed, using dataUrl fallback:", uErr);
        }

        setEditFrames((prev) =>
          prev.map((slot, i) =>
            i === index
              ? {
                ...slot,
                previewUrl: serverUrl,
                fileName: file.name,
                fileSize: `${Math.round(file.size / 1024)} KB`,
                error: detection.photoCount === 0
                  ? "Tidak ditemukan area transparan pada frame ini."
                  : undefined,
                template_type: detectedType,
                photoSlots: detection.slots,
                detectedCount: detection.photoCount,
                isAnalyzing: false,
                frameImageWidth: detection.imageWidth,
                frameImageHeight: detection.imageHeight,
              }
              : slot
          )
        );
      } catch {
        setEditFrames((prev) =>
          prev.map((slot, i) =>
            i === index
              ? {
                ...slot,
                previewUrl: dataUrl,
                fileName: file.name,
                fileSize: `${Math.round(file.size / 1024)} KB`,
                isAnalyzing: false,
                error: "Gagal menganalisis frame. Pastikan file PNG valid.",
              }
              : slot
          )
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditFrameNameChange = (index: number, name: string) => {
    setEditFrames((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, name } : slot))
    );
  };

  const handleAddEditFrameSlot = () => {
    const nextNum = editFrames.length + 1;
    const newSlot: FrameUploadSlot = {
      id: `slot-${Date.now()}`,
      name: `Frame ${nextNum}`,
      template_type: "strip_3",
      previewUrl: "/frames/frame-strip-minimal.png",
      fileName: "frame-strip-minimal.png (Preset)",
      fileSize: "13 KB",
    };
    setEditFrames([...editFrames, newSlot]);
  };

  const handleRemoveEditFrameSlot = (index: number) => {
    if (editFrames.length <= 1) {
      alert("Setidaknya harus ada 1 frame untuk acara.");
      return;
    }
    setEditFrames(editFrames.filter((_, i) => i !== index));
  };

  const handleAddPresetToEditFrames = (presetIndex: number) => {
    const presets = [
      {
        name: "Classic Floral Strip",
        template_type: "strip_3" as const,
        previewUrl: "/frames/frame-strip-floral.png",
        fileName: "frame-strip-floral.png (Preset)",
      },
      {
        name: "Midnight Navy Gold",
        template_type: "strip_3" as const,
        previewUrl: "/frames/frame-strip-navy-gold.png",
        fileName: "frame-strip-navy-gold.png (Preset)",
      },
      {
        name: "Modern Minimalist",
        template_type: "strip_3" as const,
        previewUrl: "/frames/frame-strip-minimal.png",
        fileName: "frame-strip-minimal.png (Preset)",
      },
    ];
    const p = presets[presetIndex % presets.length];
    const newSlot: FrameUploadSlot = {
      id: `slot-${Date.now()}-${presetIndex}`,
      name: p.name,
      template_type: p.template_type,
      previewUrl: p.previewUrl,
      fileName: p.fileName,
      fileSize: "14 KB",
    };
    setEditFrames([...editFrames, newSlot]);
  };

  const handleSaveEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    const isPhysical = (editForm.category || editingEvent.category) === "photobooth";

    if (!isPhysical && editFrames.length === 0) {
      setEditErrorMsg("Acara harus memiliki minimal 1 frame.");
      return;
    }

    setIsSavingEdit(true);
    setEditErrorMsg("");
    setEditSuccessMsg("");

    const assigned_frames: FrameItem[] = isPhysical
      ? (editingEvent.assigned_frames || [])
      : editFrames
        .filter((s) => s.previewUrl)
        .map((s, idx) => ({
          id: s.id.startsWith("slot-") ? `frm-${Date.now()}-${idx}` : s.id,
          name: s.name || `Frame ${idx + 1}`,
          slug: (s.name || `frame-${idx + 1}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          template_type: s.template_type,
          preview_url: s.previewUrl,
          config_json: {
            type: s.template_type,
            backgroundColor: "#0f172a",
            borderColor: "#e7e5e4",
            textContent: editForm.host_name,
            subTextContent: `${editForm.date} • ${editForm.venue}, ${editForm.city}`,
            fontFamily: "serif",
            textColor: "#ffffff",
            padding: 16,
            borderRadius: 8,
            customOverlayUrl: s.previewUrl,
            photoSlots: s.photoSlots,
            photoCount: s.detectedCount,
            frameImageWidth: s.frameImageWidth,
            frameImageHeight: s.frameImageHeight,
          },
          is_active: true,
        }));

    const physicalTier = editSelectedPhysicalTier || "hours2";
    const virtualTier = editSelectedTier || "silver";
    const chosenPkg = isPhysical
      ? (PHOTOBOOTH_PHYSICAL_PACKAGES[physicalTier] || PHOTOBOOTH_PHYSICAL_PACKAGES.hours2)
      : VIRTUAL_BOOTH_PACKAGES[virtualTier];

    const packagePrice = isPhysical
      ? (editPhysicalPrintSize === "4R" ? (chosenPkg as PhotoboothPhysicalPackage).price4R : (chosenPkg as PhotoboothPhysicalPackage).price2R)
      : chosenPkg.price;

    const finalPaymentStatus = editPaymentStatus;
    const finalAmount = finalPaymentStatus === "PAID"
      ? (isPhysical
        ? (editingEvent.payment_amount && editingEvent.payment_amount >= 1000000 ? editingEvent.payment_amount : packagePrice)
        : (editingEvent.payment_amount || chosenPkg.price))
      : editingEvent.payment_amount;

    const updatePayload = {
      title: editForm.title,
      host_name: editForm.host_name,
      client_name: editForm.host_name,
      event_name: editForm.title,
      slug: editForm.slug || editForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      date: editForm.date,
      venue: editForm.venue,
      city: editForm.city,
      description: editForm.description,
      category: editForm.category || editingEvent.category || "virtual_photobooth",
      assigned_frames,
      default_frame_config: assigned_frames.length > 0
        ? assigned_frames[0].config_json
        : undefined,
      theme_config: editThemeConfig,
      package_tier: isPhysical ? physicalTier : virtualTier,
      package_name: chosenPkg.name,
      payment_status: finalPaymentStatus,
      payment_amount: finalAmount,
      payment_method: editingEvent.payment_method || (finalPaymentStatus === "PAID" ? "Reservasi Terverifikasi (Lunas)" : "Menunggu Pembayaran"),
      payment_invoice: editingEvent.payment_invoice || `INV-${editingEvent.id.slice(0, 8).toUpperCase()}`,
      license_start_date: editingEvent.license_start_date || new Date().toISOString(),
      license_end_date: editingEvent.license_end_date || new Date(Date.now() + (isPhysical ? 7 : (chosenPkg as any).durationDays) * 86400000).toISOString(),
    };

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (data.success && data.event) {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === data.event.id ? data.event : ev))
        );
        setEditingEvent(data.event);
        setEditSuccessMsg("Perubahan event, paket photobooth, frame, dan status pembayaran berhasil disimpan!");
      } else {
        setEditErrorMsg(data.error || "Gagal memperbarui event.");
      }
    } catch (err) {
      console.error("Error updating event:", err);
      setEditErrorMsg("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleFrameFileUpload = (index: number, file: File | null) => {
    if (!file) return;

    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    if (!isPng) {
      setFrameSlots((prev) =>
        prev.map((slot, i) =>
          i === index
            ? { ...slot, error: "Format file wajib PNG (.png) dengan transparansi." }
            : slot
        )
      );
      return;
    }

    setFrameSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, isAnalyzing: true, error: undefined } : slot
      )
    );

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      try {
        const detection = await detectTransparentRegions(dataUrl);
        const detectedType: FrameType = detection.photoCount > 0 ? "custom" : "strip_3";

        let serverUrl = dataUrl;
        try {
          const uploadRes = await fetch("/api/frames/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dataUrl, fileName: file.name }),
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            serverUrl = uploadData.url;
          }
        } catch (uErr) {
          console.warn("Server upload failed, using dataUrl fallback:", uErr);
        }

        setFrameSlots((prev) =>
          prev.map((slot, i) =>
            i === index
              ? {
                ...slot,
                previewUrl: serverUrl,
                fileName: file.name,
                fileSize: `${Math.round(file.size / 1024)} KB`,
                error: detection.photoCount === 0
                  ? "Tidak ditemukan area transparan pada frame ini."
                  : undefined,
                template_type: detectedType,
                photoSlots: detection.slots,
                detectedCount: detection.photoCount,
                isAnalyzing: false,
                frameImageWidth: detection.imageWidth,
                frameImageHeight: detection.imageHeight,
              }
              : slot
          )
        );
      } catch {
        setFrameSlots((prev) =>
          prev.map((slot, i) =>
            i === index
              ? {
                ...slot,
                previewUrl: dataUrl,
                fileName: file.name,
                fileSize: `${Math.round(file.size / 1024)} KB`,
                isAnalyzing: false,
                error: "Gagal menganalisis frame. Pastikan file PNG valid.",
              }
              : slot
          )
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFrameNameChange = (index: number, name: string) => {
    setFrameSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, name } : slot))
    );
  };

  const handleAddFrameSlot = () => {
    if (frameSlots.length >= 3) return;
    const nextNum = frameSlots.length + 1;
    const newSlot: FrameUploadSlot = {
      id: `slot-${Date.now()}`,
      name: `Modern Minimalist (${nextNum})`,
      template_type: "strip_3",
      previewUrl: "/frames/frame-strip-minimal.png",
      fileName: "frame-strip-minimal.png (Preset)",
      fileSize: "13 KB",
    };
    setFrameSlots([...frameSlots, newSlot]);
  };

  const handleRemoveFrameSlot = (index: number) => {
    if (frameSlots.length <= 1) return;
    setFrameSlots(frameSlots.filter((_, i) => i !== index));
  };

  const handleResetPresetFrames = () => {
    setFrameSlots([
      {
        id: "slot-1",
        name: "Classic Floral Strip",
        template_type: "strip_3",
        previewUrl: "/frames/frame-strip-floral.png",
        fileName: "frame-strip-floral.png (Preset)",
        fileSize: "14 KB",
      },
      {
        id: "slot-2",
        name: "Midnight Navy Gold",
        template_type: "strip_3",
        previewUrl: "/frames/frame-strip-navy-gold.png",
        fileName: "frame-strip-navy-gold.png (Preset)",
        fileSize: "13 KB",
      },
      {
        id: "slot-3",
        name: "Modern Minimalist",
        template_type: "strip_3",
        previewUrl: "/frames/frame-strip-minimal.png",
        fileName: "frame-strip-minimal.png (Preset)",
        fileSize: "13 KB",
      },
    ]);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUsername = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const isValidAdmin =
      (cleanUsername === "admin" || cleanUsername === "admin@ruangtemu.id") &&
      (cleanPassword === "ruangtemu21" || cleanPassword === "admin");

    const isValidDev =
      (cleanUsername === "dev" || cleanUsername === "dev@ruangtemu.id") &&
      (cleanPassword === "admin" || cleanPassword === "dev" || cleanPassword === "ruangtemu21");

    if (isValidAdmin || isValidDev) {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Username atau password tidak valid.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setLoginError("");
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    try {
      await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });
    } catch (err) {
      console.error("Gagal memperbarui status reservasi:", err);
    }
  };

  const handleUpdatePaymentStatus = async (
    bookingId: string,
    paymentStatus: "PAID" | "PENDING" | "FAILED"
  ) => {
    const nowIso = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
            ...b,
            payment_status: paymentStatus,
            payment_paid_at: paymentStatus === "PAID" ? nowIso : undefined,
            status: paymentStatus === "PAID" ? "confirmed" : b.status,
          }
          : b
      )
    );
    try {
      await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          payment_status: paymentStatus,
          payment_paid_at: paymentStatus === "PAID" ? nowIso : null,
          status: paymentStatus === "PAID" ? "confirmed" : undefined,
        }),
      });
    } catch (err) {
      console.error("Gagal memperbarui status pembayaran:", err);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm("Hapus data reservasi ini?")) {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      try {
        await fetch(`/api/bookings?id=${bookingId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Gagal menghapus reservasi:", err);
      }
    }
  };

  const handleCreateEventFromBooking = (b: Booking) => {
    const isPhysical = b.booking_category === "photobooth" || b.category === "photobooth";
    const cleanSlug =
      (b.event_name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 35) || "event-ruangtemu";

    setSourceBooking(b);
    setNewEventPaymentStatus(b.payment_status === "PAID" ? "PAID" : "PENDING");

    setNewEvent({
      title: b.event_name || "",
      host_name: b.customer_name || "",
      slug: cleanSlug,
      date: b.event_date || new Date().toISOString().split("T")[0],
      venue: b.location || "",
      city: b.city || "Palopo",
      description: b.notes
        ? `Reservasi dari ${b.customer_name} (${b.customer_phone}). Catatan klien: ${b.notes}`
        : `Reservasi dari ${b.customer_name} (${b.customer_phone})`,
      category: isPhysical ? "photobooth" : "virtual_photobooth",
    });

    if (isPhysical) {
      const pkgName = (b.package_name || "").toLowerCase();
      if (pkgName.includes("5 jam") || pkgName.includes("5h") || b.package_id?.includes("5h")) {
        setSelectedPhysicalPackage("hours5");
      } else if (pkgName.includes("4 jam") || pkgName.includes("4h") || b.package_id?.includes("4h")) {
        setSelectedPhysicalPackage("hours4");
      } else if (pkgName.includes("3 jam") || pkgName.includes("3h") || pkgName.includes("deluxe") || b.package_id?.includes("3h")) {
        setSelectedPhysicalPackage("hours3");
      } else {
        setSelectedPhysicalPackage("hours2");
      }
      const is4R = (b.package_name || "").includes("4R") || (b.notes || "").includes("4R");
      setAdminPhysicalPrintSize(is4R ? "4R" : "2R");
    } else {
      const pkgLower = (b.package_name || "").toLowerCase();
      const isBronze = pkgLower.includes("bronze");
      const isGold = pkgLower.includes("gold");
      setSelectedPackage(isBronze ? "bronze" : isGold ? "gold" : "silver");
    }

    setSelectedBookingDetail(null);
    setIsCreatingEvent(true);
    setActiveTab("events");

    const isPaid = b.payment_status === "PAID";
    setPaymentSuccessToast({
      title: isPaid ? "Reservasi LUNAS Siap Diaktifkan" : "Data Reservasi Siap Didaftarkan",
      subtitle: isPaid
        ? `Pembayaran "${b.event_name}" (${formatRupiah(b.payment_amount || b.total_price)}) telah terverifikasi LUNAS. Klik Simpan untuk langsung mengaktifkan tanpa bayar lagi.`
        : `Formulir event baru telah diisi otomatis dari reservasi "${b.event_name}". Silakan tinjau dan aktifkan event.`,
    });
    setTimeout(() => setPaymentSuccessToast(null), 6000);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedBookingDetail) setSelectedBookingDetail(null);
        if (selectedBookingProof) setSelectedBookingProof(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBookingDetail, selectedBookingProof]);

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm("Hapus foto ini dari galeri acara?")) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      try {
        await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Gagal menghapus entri foto:", err);
      }
    }
  };

  const handleDeleteEvent = async (evt: EventItem) => {
    const confirmed = confirm(
      `Hapus event "${evt.title}"?\n\nSemua data terkait event ini (foto, guestbook) juga akan dihapus. Aksi ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setDeletingEventId(evt.id);
    try {
      const res = await fetch(`/api/events/${evt.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== evt.id));
        if (editingEvent?.id === evt.id) {
          setEditingEvent(null);
          setActiveTab("events");
        }
      } else {
        alert(data.error || "Gagal menghapus event.");
      }
    } catch {
      alert("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleToggleEventStatus = async (evt: EventItem) => {
    const isCurrentlyActive = evt.is_active !== false && evt.status !== "COMPLETED" && evt.status !== "ARCHIVED";
    const newStatus = isCurrentlyActive ? "COMPLETED" : "ACTIVE";
    const newIsActive = !isCurrentlyActive;

    const label = isCurrentlyActive ? "Selesai" : "Aktif";
    const confirmed = confirm(
      `Ubah status event "${evt.title}" menjadi ${label}?`
    );
    if (!confirmed) return;

    setTogglingEventId(evt.id);
    try {
      const payload: Record<string, any> = { status: newStatus, is_active: newIsActive };
      if (newIsActive && (!evt.license_end_date || new Date(evt.license_end_date).getTime() <= Date.now())) {
        const tier = (evt.package_tier as "silver" | "gold") || "silver";
        const days = VIRTUAL_BOOTH_PACKAGES[tier]?.durationDays || 10;
        payload.license_start_date = new Date().toISOString();
        payload.license_end_date = new Date(Date.now() + days * 86400000).toISOString();
        if (!evt.package_tier) {
          payload.package_tier = "silver";
          payload.package_name = "SILVER";
          payload.payment_status = "PAID";
        }
      }

      const res = await fetch(`/api/events/${evt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.event) {
        setEvents((prev) =>
          prev.map((e) => (e.id === data.event.id ? data.event : e))
        );
        if (editingEvent?.id === data.event.id) {
          setEditingEvent(data.event);
        }
      } else {
        alert(data.error || "Gagal mengubah status event.");
      }
    } catch {
      alert("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setTogglingEventId(null);
    }
  };



  const handleMarkEditingEventAsPaid = async () => {
    if (!editingEvent) return;
    const isPhysical = editingEvent.category === "photobooth" || editForm.category === "photobooth";
    const chosenPackage = isPhysical
      ? (PHOTOBOOTH_PHYSICAL_PACKAGES[editSelectedPhysicalTier] || PHOTOBOOTH_PHYSICAL_PACKAGES.hours2)
      : VIRTUAL_BOOTH_PACKAGES[editSelectedTier];

    const packagePrice = isPhysical
      ? (editPhysicalPrintSize === "4R" ? (chosenPackage as PhotoboothPhysicalPackage).price4R : (chosenPackage as PhotoboothPhysicalPackage).price2R)
      : chosenPackage.price;

    const inv = `INV-PAID-${Math.floor(100000 + Math.random() * 900000)}`;
    const startIso = new Date().toISOString();
    const endIso = new Date(Date.now() + (isPhysical ? 7 : (chosenPackage as any).durationDays) * 86400000).toISOString();

    const paymentUpdates = {
      package_tier: isPhysical ? editSelectedPhysicalTier : editSelectedTier,
      package_name: isPhysical ? `${chosenPackage.name} (${editPhysicalPrintSize})` : chosenPackage.name,
      payment_status: "PAID" as const,
      payment_amount: packagePrice,
      payment_method: "Transfer Bank / Tunai",
      payment_invoice: inv,
      license_start_date: startIso,
      license_end_date: endIso,
      is_active: true,
      status: "ACTIVE" as const,
    };

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentUpdates),
      });
      const data = await res.json();
      if (data.success && data.event) {
        setEvents((prev) =>
          prev.map((e) => (e.id === data.event.id ? data.event : e))
        );
        setEditingEvent(data.event);
        setPaymentSuccessToast({
          title: `Status Pembayaran Diperbarui: LUNAS`,
          subtitle: `${chosenPackage.name} (${formatRupiah(chosenPackage.price)}) telah ditandai lunas.`,
        });
        setTimeout(() => setPaymentSuccessToast(null), 6000);
      } else {
        alert(data.error || "Gagal menandai lunas.");
      }
    } catch (err) {
      console.error("Error marking event as paid:", err);
      alert("Koneksi gagal. Coba lagi.");
    }
  };

  const handleExtendPackageDuration = async (tier: "bronze" | "silver" | "gold") => {
    if (!editingEvent) return;
    setIsExtendingDuration(true);

    const chosenPkg = VIRTUAL_BOOTH_PACKAGES[tier];
    const addMs = chosenPkg.durationDays * 24 * 60 * 60 * 1000;

    const currentEndMs = editingEvent.license_end_date
      ? new Date(editingEvent.license_end_date).getTime()
      : Date.now();
    const baseMs = Math.max(Date.now(), currentEndMs);
    const newEndIso = new Date(baseMs + addMs).toISOString();

    const updatePayload = {
      package_tier: tier,
      package_name: chosenPkg.name,
      payment_status: "PAID" as const,
      license_end_date: newEndIso,
      is_active: true,
      status: "ACTIVE" as const,
    };

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (data.success && data.event) {
        setEvents((prev) =>
          prev.map((e) => (e.id === data.event.id ? data.event : e))
        );
        setEditingEvent(data.event);
        setShowExtendModal(false);
        setPaymentSuccessToast({
          title: `Masa Aktif Berhasil Diperpanjang! (+${chosenPkg.durationDays} Hari)`,
          subtitle: `Paket ${chosenPkg.name} aktif sampai ${formatIndonesianDateTime(newEndIso)}.`,
        });
        setTimeout(() => setPaymentSuccessToast(null), 6000);
      } else {
        alert(data.error || "Gagal memperpanjang masa aktif.");
      }
    } catch (err) {
      console.error("Error extending duration:", err);
      alert("Koneksi gagal. Coba lagi.");
    } finally {
      setIsExtendingDuration(false);
    }
  };

  const handleCreateEventDirectly = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newEvent.title.trim()) {
      alert("Silakan masukkan Judul Acara terlebih dahulu.");
      return;
    }
    if (!newEvent.host_name.trim()) {
      alert("Silakan masukkan Nama Tuan Rumah / Klien terlebih dahulu.");
      return;
    }

    const isPhysical = newEvent.category === "photobooth";
    const chosenPkg = isPhysical
      ? (PHOTOBOOTH_PHYSICAL_PACKAGES[selectedPhysicalPackage] || PHOTOBOOTH_PHYSICAL_PACKAGES.hours2)
      : VIRTUAL_BOOTH_PACKAGES[selectedPackage];

    const packagePrice = isPhysical
      ? (adminPhysicalPrintSize === "4R" ? (chosenPkg as PhotoboothPhysicalPackage).price4R : (chosenPkg as PhotoboothPhysicalPackage).price2R)
      : chosenPkg.price;

    const amount = sourceBooking
      ? (sourceBooking.payment_amount || sourceBooking.total_price || packagePrice)
      : packagePrice;

    const assigned_frames: FrameItem[] = isPhysical
      ? []
      : frameSlots
        .filter((s) => s.previewUrl)
        .map((s, idx) => ({
          id: `frm-${Date.now()}-${idx}`,
          name: s.name || `Frame ${idx + 1}`,
          slug: `frame-${idx + 1}-${Date.now()}`,
          template_type: s.template_type,
          preview_url: s.previewUrl,
          config_json: {
            type: s.template_type,
            backgroundColor: "#0f172a",
            borderColor: "#e7e5e4",
            textContent: newEvent.host_name,
            subTextContent: `${newEvent.date} • ${newEvent.venue}, ${newEvent.city}`,
            fontFamily: "serif",
            textColor: "#ffffff",
            padding: 16,
            borderRadius: 8,
            customOverlayUrl: s.previewUrl,
            photoSlots: s.photoSlots,
            photoCount: s.detectedCount,
            frameImageWidth: s.frameImageWidth,
            frameImageHeight: s.frameImageHeight,
          },
          is_active: true,
        }));

    const isPaid = newEventPaymentStatus === "PAID";
    const eventPayload = {
      booking_id: sourceBooking?.id || undefined,
      slug: newEvent.slug || newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      title: newEvent.title,
      host_name: newEvent.host_name,
      client_name: newEvent.host_name,
      event_name: newEvent.title,
      event_type: (sourceBooking?.event_type as any) || "wedding",
      date: newEvent.date || new Date().toISOString().split("T")[0],
      venue: newEvent.venue || "Banua Subur Hall",
      city: newEvent.city,
      description: newEvent.description,
      category: newEvent.category || "virtual_photobooth",
      is_active: true,
      allow_guestbook: true,
      allow_voice_note: true,
      allow_custom_frame: true,
      package_tier: isPhysical ? selectedPhysicalPackage : selectedPackage,
      package_name: sourceBooking?.package_name || (isPhysical ? `${chosenPkg.name} (${adminPhysicalPrintSize})` : chosenPkg.name),
      payment_status: newEventPaymentStatus,
      payment_amount: amount,
      payment_method: isPaid
        ? (sourceBooking?.payment_method?.replace("DOKU_", "DOKU ") || "Manual / Admin Verified")
        : "Menunggu Pembayaran",
      payment_invoice: sourceBooking?.payment_invoice || `INV-${Date.now().toString().slice(-6)}`,
      payment_paid_at: isPaid ? new Date().toISOString() : undefined,
      license_start_date: startDateStr,
      license_end_date: isPhysical
        ? new Date(new Date(startDateStr).getTime() + 7 * 86400000).toISOString().split("T")[0]
        : endDateStr,
      assigned_frames,
      default_frame_config: assigned_frames.length > 0
        ? assigned_frames[0].config_json
        : {
          type: "strip_3" as const,
          backgroundColor: "#18181b",
          borderColor: "#e7e5e4",
          textContent: newEvent.host_name,
          subTextContent: `${newEvent.date} • ${newEvent.venue}, ${newEvent.city}`,
          fontFamily: "sans-serif",
          textColor: "#ffffff",
          padding: 16,
          borderRadius: 0,
          sticker: "✦",
        },
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      });
      const data = await res.json();
      if (data.success && data.event) {
        setEvents((prev) => [data.event, ...prev]);
        setIsCreatingEvent(false);
        setPaymentSuccessToast({
          title: `Acara "${newEvent.title}" Berhasil Didaftarkan!`,
          subtitle: isPaid
            ? `Status: LUNAS (${formatRupiah(amount)}). Event langsung aktif & siap digunakan.`
            : `Status: BELUM LUNAS (${formatRupiah(amount)}) tercatat untuk cross-check admin.`,
        });
        setTimeout(() => setPaymentSuccessToast(null), 6000);
        if (sourceBooking?.id) {
          const bookingIdToRemove = sourceBooking.id;
          fetch(`/api/bookings?id=${bookingIdToRemove}`, {
            method: "DELETE",
          }).catch((err) => console.warn("Failed to delete booking:", err));
          setBookings((prev) => prev.filter((b) => b.id !== bookingIdToRemove));
        }
        setSourceBooking(null);
        setFrameSlots(INITIAL_FRAME_SLOTS);
        setNewEvent({
          title: "",
          host_name: "",
          slug: "",
          date: "",
          venue: "",
          city: "Palopo",
          description: "",
          category: "virtual_photobooth",
        });
        setNewEventPaymentStatus("PAID");
      } else {
        alert(data.error || "Gagal menyimpan event. Coba lagi.");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Koneksi ke server gagal. Coba lagi.");
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors ${isDarkMode ? "admin-dark bg-[#0E0E10] text-[#F8F9FA]" : "bg-[#f0f1f3] text-[#1B2559]"
        }`}>
        {/* Mobile Guard (< 768px) */}
        <AdminMobileGuard />

        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-ruangtemu.jpg"
              alt="RUANGTEMU"
              className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0"
            />
            <div>
              <h1 className="text-lg font-semibold text-[#1B2559] leading-tight">RUANGTEMU</h1>
              <p className="text-xs text-[#8F9BBA]">Photobooth Admin Panel</p>
            </div>
          </div>

          {loginError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email-input" className="block text-sm font-medium text-[#1B2559] mb-1.5">
                Username
              </label>
              <input
                id="admin-email-input"
                type="text"
                autoComplete="username"
                required
                placeholder="admin / dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-lg text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="admin-password-input" className="block text-sm font-medium text-[#1B2559] mb-1.5">
                Password
              </label>
              <input
                id="admin-password-input"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-lg text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/20 transition-all"
              />
            </div>

            <button
              id="admin-login-button"
              type="submit"
              className="w-full h-11 bg-[#4318FF] hover:bg-[#3311DB] text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              Masuk
            </button>
          </form>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-[#a3aed0] hover:text-[#4318FF] transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = bookings.reduce((acc, b) => acc + (b.total_price || 0), 0);
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const activeEvents = events.filter((e) => e.is_active !== false && e.status !== "COMPLETED" && e.status !== "ARCHIVED").length;

  const NAV_ITEMS = [
    { id: "overview" as const, label: "Dashboard", icon: IconDashboard },
    { id: "events" as const, label: "Event", icon: IconCalendar, badge: events.length },
    { id: "edit" as const, label: "Edit Event", icon: IconEdit },
    { id: "bookings" as const, label: "Reservasi", icon: IconBooking, badge: bookings.length },
    { id: "gallery" as const, label: "Galeri Foto", icon: IconImage, badge: entries.length },
    { id: "packages" as const, label: "Paket", icon: IconPackage },
  ];

  const pageTitle = {
    overview: "Dashboard",
    events: "Daftar Event",
    edit: editingEvent ? `Edit: ${editingEvent.title}` : "Edit Event",
    bookings: "Reservasi",
    gallery: "Galeri Foto",
    packages: "Paket Layanan",
  }[activeTab];

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${isDarkMode ? "admin-dark bg-[#121214] text-[#F8F9FA]" : "bg-[#F4F7FE] text-[#1B2559]"
      }`}>
      {/* Mobile Guard (< 768px) */}
      <AdminMobileGuard />

      {/* ──────── SIDEBAR (RUANGTEMU PHOTOBOOTH) ──────── */}
      <aside
        className={`${sidebarCollapsed ? "w-[76px]" : "w-[260px]"
          } bg-white border-r border-[#E0E5F2] flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-200 select-none`}
      >
        {/* Brand */}
        <div className="h-[76px] flex items-center justify-between px-5 border-b border-[#E0E5F2] shrink-0">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-ruangtemu.jpg"
              alt="RUANGTEMU"
              className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0"
            />
            {!sidebarCollapsed && (
              <div>
                <span className="text-base font-bold text-[#1B2559] tracking-tight block leading-tight">
                  RUANGTEMU
                </span>
                <span className="text-[10px] text-[#A3AED0] font-medium tracking-wide block">
                  Virtual Photobooth Palopo
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] transition-colors"
            title={sidebarCollapsed ? "Perlebar sidebar" : "Ciutkan sidebar"}
          >
            <IconSidebarToggle size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {/* 1. Dashboard Ringkasan */}
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3.5 h-11 rounded-xl transition-all text-left relative ${sidebarCollapsed ? "justify-center px-0" : "px-3.5"
              } ${activeTab === "overview"
                ? "bg-[#F4F7FE] text-[#4318FF] font-bold"
                : "text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] font-medium"
              }`}
          >
            {activeTab === "overview" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-r-full" />
            )}
            <IconDashboard size={19} />
            {!sidebarCollapsed && <span className="text-sm">Dashboard</span>}
          </button>

          {/* 2. Daftar Event */}
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`w-full flex items-center gap-3.5 h-11 rounded-xl transition-all text-left relative ${sidebarCollapsed ? "justify-center px-0" : "px-3.5"
              } ${activeTab === "events"
                ? "bg-[#F4F7FE] text-[#4318FF] font-bold"
                : "text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] font-medium"
              }`}
          >
            {activeTab === "events" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-r-full" />
            )}
            <IconCalendar size={19} />
            {!sidebarCollapsed && (
              <>
                <span className="text-sm flex-1">Daftar Event</span>
                {events.length > 0 && (
                  <span className="min-w-[22px] h-[20px] px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold bg-[#E9FAF4] text-[#01B574]">
                    {events.length}
                  </span>
                )}
              </>
            )}
          </button>

          {/* 3. Edit Event & Frame */}
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`w-full flex items-center gap-3.5 h-11 rounded-xl transition-all text-left relative ${sidebarCollapsed ? "justify-center px-0" : "px-3.5"
              } ${activeTab === "edit"
                ? "bg-[#F4F7FE] text-[#4318FF] font-bold"
                : "text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] font-medium"
              }`}
          >
            {activeTab === "edit" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-r-full" />
            )}
            <IconEdit size={19} />
            {!sidebarCollapsed && <span className="text-sm">Edit Frame & Desain</span>}
          </button>

          {/* 4. Reservasi & Booking */}
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center gap-3.5 h-11 rounded-xl transition-all text-left relative ${sidebarCollapsed ? "justify-center px-0" : "px-3.5"
              } ${activeTab === "bookings"
                ? "bg-[#F4F7FE] text-[#4318FF] font-bold"
                : "text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] font-medium"
              }`}
          >
            {activeTab === "bookings" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-r-full" />
            )}
            <IconBooking size={19} />
            {!sidebarCollapsed && (
              <>
                <span className="text-sm flex-1">Reservasi Klien</span>
                {bookings.length > 0 && (
                  <span className="min-w-[22px] h-[20px] px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold bg-[#FFF6E9] text-[#FFB547]">
                    {bookings.length}
                  </span>
                )}
              </>
            )}
          </button>

          {/* 5. Galeri Foto Tamu */}
          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`w-full flex items-center gap-3.5 h-11 rounded-xl transition-all text-left relative ${sidebarCollapsed ? "justify-center px-0" : "px-3.5"
              } ${activeTab === "gallery"
                ? "bg-[#F4F7FE] text-[#4318FF] font-bold"
                : "text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] font-medium"
              }`}
          >
            {activeTab === "gallery" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-r-full" />
            )}
            <IconImage size={19} />
            {!sidebarCollapsed && (
              <>
                <span className="text-sm flex-1">Galeri Foto Tamu</span>
                {entries.length > 0 && (
                  <span className="min-w-[22px] h-[20px] px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold bg-[#F4F7FE] text-[#4318FF]">
                    {entries.length}
                  </span>
                )}
              </>
            )}
          </button>

          {/* 6. Paket Layanan */}
          <button
            type="button"
            onClick={() => setActiveTab("packages")}
            className={`w-full flex items-center gap-3.5 h-11 rounded-xl transition-all text-left relative ${sidebarCollapsed ? "justify-center px-0" : "px-3.5"
              } ${activeTab === "packages"
                ? "bg-[#F4F7FE] text-[#4318FF] font-bold"
                : "text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] font-medium"
              }`}
          >
            {activeTab === "packages" && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#4318FF] rounded-r-full" />
            )}
            <IconPackage size={19} />
            {!sidebarCollapsed && <span className="text-sm">Paket Layanan</span>}
          </button>
        </nav>

        {/* Bottom Sidebar: Mode Gelap, Web Publik & Logout */}
        <div className="p-3 border-t border-[#E0E5F2] space-y-1 shrink-0">
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`w-full flex items-center gap-3 h-10 rounded-xl text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] transition-all ${sidebarCollapsed ? "justify-center px-0" : "px-3"
              }`}
            title={isDarkMode ? "Beralih ke Mode Terang (Light Mode)" : "Beralih ke Mode Gelap (Dark Mode)"}
          >
            {isDarkMode ? <IconSun size={16} /> : <IconMoon size={16} />}
            {!sidebarCollapsed && (
              <span className="text-xs font-medium">
                {isDarkMode ? "Mode Terang" : "Mode Gelap"}
              </span>
            )}
          </button>
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 h-10 rounded-xl text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] transition-all ${sidebarCollapsed ? "justify-center px-0" : "px-3"
              }`}
            title="Buka Beranda Publik"
          >
            <IconExternalLink size={16} />
            {!sidebarCollapsed && <span className="text-xs font-medium">Buka Web Publik</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 h-10 rounded-xl text-[#8F9BBA] hover:text-[#EE5D50] hover:bg-red-50 transition-colors ${sidebarCollapsed ? "justify-center px-0" : "px-3"
              }`}
            title="Keluar / Logout"
          >
            <IconLogout size={16} />
            {!sidebarCollapsed && <span className="text-xs font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ──────── MAIN AREA ──────── */}
      <div
        className={`flex-1 ${sidebarCollapsed ? "ml-[76px]" : "ml-[260px]"
          } flex flex-col min-h-screen transition-all duration-200`}
      >
        {/* TOP HEADER */}
        <header className="h-[76px] bg-white border-b border-[#E0E5F2] flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
          {/* Search bar & Notification Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-lg">
            <div className={`w-full h-11 px-4 rounded-full flex items-center gap-3 border border-transparent focus-within:border-[#4318FF]/30 transition-all ${isDarkMode ? "bg-[#25262B]" : "bg-[#F4F7FE]"
              }`}>
              <IconSearch size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama acara, klien, atau gedung..."
                className={`bg-transparent border-none outline-none text-sm flex-1 ${isDarkMode ? "text-white placeholder:text-slate-500" : "text-[#1B2559] placeholder:text-[#A3AED0]"
                  }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[#A3AED0] hover:text-[#EE5D50] p-1 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <IconClose size={13} />
                </button>
              )}
            </div>

            {/* Notification Bell with Badge Indicator */}
            <div className="relative shrink-0" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border ${isNotifOpen
                    ? "bg-[#4318FF] text-white border-[#4318FF] shadow-md shadow-[#4318FF]/25"
                    : isDarkMode
                      ? "bg-[#25262B] text-slate-200 border-white/10 hover:bg-[#2C2E33]"
                      : "bg-[#F4F7FE] text-[#1B2559] border-[#E0E5F2] hover:bg-[#EAEFFC] hover:text-[#4318FF]"
                  }`}
                title="Notifikasi Event & Pesanan Klien Masuk"
                aria-label="Notifikasi Acara Masuk"
              >
                <IconBell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#EE5D50] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifOpen && (
                <div
                  className={`absolute left-0 sm:left-auto sm:right-0 mt-2.5 w-[330px] sm:w-[410px] rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 ${isDarkMode
                      ? "bg-[#1E1F25] border-white/10 text-white"
                      : "bg-white border-[#E0E5F2] text-[#1B2559]"
                    }`}
                >
                  {/* Dropdown Header */}
                  <div className={`p-4 pb-3 border-b flex items-center justify-between ${isDarkMode ? "border-white/10 bg-[#1A1B20]" : "border-[#E0E5F2] bg-white"
                    }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center">
                        <IconBell size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold leading-tight">
                          Event &amp; Pesanan Masuk
                        </h4>
                        <p className="text-[11px] text-[#8F9BBA]">
                          Daftar reservasi &amp; acara baru dari klien
                        </p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EE5D50]/10 text-[#EE5D50] border border-[#EE5D50]/20">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>

                  {/* Tabs Filter & Action */}
                  <div className={`px-3 py-2 border-b flex items-center justify-between gap-1 ${isDarkMode ? "bg-[#141519] border-white/10" : "bg-[#F4F7FE] border-[#E0E5F2]"
                    }`}>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setNotifTabFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${notifTabFilter === "all"
                            ? isDarkMode ? "bg-[#25262B] text-white shadow-xs" : "bg-white text-[#4318FF] shadow-xs"
                            : "text-[#8F9BBA] hover:text-[#1B2559]"
                          }`}
                      >
                        Semua ({notificationItems.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifTabFilter("bookings")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${notifTabFilter === "bookings"
                            ? isDarkMode ? "bg-[#25262B] text-white shadow-xs" : "bg-white text-[#4318FF] shadow-xs"
                            : "text-[#8F9BBA] hover:text-[#1B2559]"
                          }`}
                      >
                        Pesanan ({notificationItems.filter((n) => n.type === "booking").length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifTabFilter("events")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${notifTabFilter === "events"
                            ? isDarkMode ? "bg-[#25262B] text-white shadow-xs" : "bg-white text-[#4318FF] shadow-xs"
                            : "text-[#8F9BBA] hover:text-[#1B2559]"
                          }`}
                      >
                        Acara ({notificationItems.filter((n) => n.type === "event").length})
                      </button>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotifsAsRead}
                        className="text-[11px] font-semibold text-[#4318FF] hover:underline cursor-pointer shrink-0"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>

                  {/* Notification Items List with Timestamp Jam */}
                  <div className={`max-h-[380px] overflow-y-auto divide-y ${isDarkMode ? "divide-white/5" : "divide-[#E0E5F2]/70"
                    }`}>
                    {filteredNotifs.length === 0 ? (
                      <div className="py-10 text-center text-xs text-[#8F9BBA] px-4">
                        <IconBell size={28} className="mx-auto mb-2 opacity-30 text-[#4318FF]" />
                        <p className="font-semibold text-[#1B2559]">Belum ada data notifikasi</p>
                        <p className="mt-0.5 text-[11px]">Event atau pesanan klien yang masuk akan muncul di sini.</p>
                      </div>
                    ) : (
                      filteredNotifs.map((item) => {
                        const isUnread = !readNotifIds.has(item.id);
                        const timeInfo = formatNotificationClockTime(item.createdAt);
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative ${isDarkMode
                                ? isUnread
                                  ? "bg-[#4318FF]/10 hover:bg-[#4318FF]/20"
                                  : "hover:bg-white/5"
                                : isUnread
                                  ? "bg-[#4318FF]/[0.04] hover:bg-[#4318FF]/[0.08]"
                                  : "hover:bg-[#F4F7FE]/80"
                              }`}
                          >
                            {/* Type Icon */}
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.type === "booking"
                                  ? "bg-[#01B574]/15 text-[#01B574]"
                                  : "bg-[#4318FF]/15 text-[#4318FF]"
                                }`}
                            >
                              {item.type === "booking" ? (
                                <IconBooking size={18} />
                              ) : (
                                <IconCamera size={18} />
                              )}
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${item.type === "booking"
                                      ? "bg-[#01B574]/15 text-[#01B574]"
                                      : "bg-[#4318FF]/15 text-[#4318FF]"
                                    }`}
                                >
                                  {item.type === "booking" ? "Pesanan Klien" : "Event Masuk"}
                                </span>

                                {/* TIMESTAMP JAM DENGAN ICON CLOCK */}
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${isDarkMode
                                    ? "bg-white/10 text-amber-300"
                                    : "bg-[#4318FF]/10 text-[#4318FF]"
                                  }`}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  {timeInfo.time}
                                </span>
                              </div>

                              <h5 className={`text-xs font-bold truncate ${isDarkMode ? "text-white" : "text-[#1B2559]"
                                }`}>
                                {item.title}
                              </h5>

                              <div className="text-[11px] text-[#5B6B8B] flex items-center gap-1.5 mt-0.5 truncate">
                                <span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-[#1B2559]"}`}>
                                  {item.clientName}
                                </span>
                                <span>&bull;</span>
                                <span className="text-[#8F9BBA]">
                                  {item.packageName || (item.category === "photobooth" ? "Photobooth Fisik" : "Virtual Photobooth")}
                                </span>
                              </div>

                              <div className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[11px] ${isDarkMode ? "border-white/5" : "border-[#E0E5F2]/40"
                                }`}>
                                <span className="text-[10px] text-[#8F9BBA]">
                                  {timeInfo.relative}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {item.price ? (
                                    <span className={`font-mono font-bold text-xs ${isDarkMode ? "text-white" : "text-[#1B2559]"
                                      }`}>
                                      {formatRupiah(item.price)}
                                    </span>
                                  ) : null}
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.paymentStatus === "PAID"
                                        ? "bg-emerald-100 text-[#01B574]"
                                        : "bg-amber-100 text-[#D97706]"
                                      }`}
                                  >
                                    {item.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Unread Indicator Dot */}
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-[#4318FF] shrink-0 mt-1 shadow-xs" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer Navigation Links */}
                  <div className={`p-3 border-t flex items-center justify-between text-xs ${isDarkMode ? "bg-[#141519] border-white/10" : "bg-[#F4F7FE] border-[#E0E5F2]"
                    }`}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("bookings");
                        setIsNotifOpen(false);
                      }}
                      className="font-semibold text-[#4318FF] hover:underline cursor-pointer"
                    >
                      Buka Pesanan Masuk &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("events");
                        setIsNotifOpen(false);
                      }}
                      className={`font-semibold hover:text-[#4318FF] cursor-pointer ${isDarkMode ? "text-slate-300" : "text-[#1B2559]"
                        }`}
                    >
                      Lihat Semua Acara
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right utility actions */}
          <div className="flex items-center gap-2.5">
            {/* Dark Mode Switch Button in Header */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-semibold transition-all border ${isDarkMode
                ? "bg-[#25262B] text-amber-300 border-amber-300/30 hover:bg-[#2C2E33]"
                : "text-[#8F9BBA] hover:text-[#1B2559] hover:bg-[#F4F7FE] border-transparent hover:border-[#E0E5F2]"
                }`}
              title={isDarkMode ? "Klik untuk Mode Terang (Light Mode)" : "Klik untuk Mode Gelap (Dark Mode)"}
            >
              {isDarkMode ? (
                <>
                  <IconSun size={15} />
                  <span className="hidden sm:inline">Mode Terang</span>
                </>
              ) : (
                <>
                  <IconMoon size={15} />
                  <span className="hidden sm:inline">Mode Gelap</span>
                </>
              )}
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold text-[#8F9BBA] hover:text-[#1B2559] hover:bg-[#F4F7FE] transition-colors"
            >
              <span>Lihat Web</span>
              <IconExternalLink size={13} />
            </Link>

            {/* Maintenance Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMaintenanceModal(true)}
              className={`flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isMaintenanceMode
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm animate-pulse"
                : isDarkMode
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
              title={
                isMaintenanceMode
                  ? "Mode Maintenance AKTIF (Pengunjung diblokir). Klik untuk ubah."
                  : "Situs Online normal. Klik untuk aktifkan mode maintenance."
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${isMaintenanceMode ? "bg-slate-950" : "bg-emerald-500 animate-pulse"
                  }`}
              />
              <span className="hidden sm:inline">
                {isMaintenanceMode ? "Maintenance: AKTIF" : "Situs: ONLINE"}
              </span>
              <span className="sm:hidden">
                {isMaintenanceMode ? "Maint" : "Online"}
              </span>
            </button>

            <div className="w-px h-6 bg-[#E0E5F2] mx-1 hidden sm:block" />

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-1">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-ruangtemu.jpg"
                  alt="RUANGTEMU"
                  className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white/20"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#01B574] border-2 border-white" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-bold text-[#1B2559] leading-tight">Admin Ruangtemu</div>
                <div className="text-[11px] text-[#A3AED0]">Operator Palopo</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors ml-1"
                title="Keluar / Logout"
              >
                <IconLogout size={15} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAINTENANCE ACTIVE BANNER WARNING */}
        {isMaintenanceMode && (
          <div className="mx-6 sm:mx-8 mt-6 mb-2 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                    Situs Sedang Mode Pemeliharaan
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                    PENGUNJUNG DIBLOKIR
                  </span>
                </div>
                <p className="text-xs text-[#1B2559] mt-0.5">
                  Pengunjung publik yang mengakses website RUANGTEMU akan langsung dialihkan ke halaman <strong>/maintenance</strong>. Panel admin (/admin) tetap dapat diakses.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Link
                href="/maintenance"
                target="_blank"
                className="h-9 px-3 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-50 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Lihat /maintenance</span>
                <IconExternalLink size={12} />
              </Link>
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(true)}
                className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Kembalikan Online
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT SUCCESS FLOATING TOAST ALERT */}
        {paymentSuccessToast && (
          <div className="fixed top-24 right-8 z-50 max-w-md bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3.5 animate-in slide-in-from-top-4 duration-300 border border-emerald-400">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                  Sistem Acara
                </span>
                <span className="text-[10px] text-emerald-200">Baru Saja</span>
              </div>
              <h4 className="text-sm font-bold leading-snug">{paymentSuccessToast.title}</h4>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">{paymentSuccessToast.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setPaymentSuccessToast(null)}
              className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <IconClose size={16} />
            </button>
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
          {/* DASHBOARD PAGE TITLE & TOP ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1B2559] tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-xs text-[#A3AED0] mt-1">
                Panel kendali photobooth tamu, layar videotron proyektor, dan moderasi foto real-time
              </p>
            </div>

            {activeTab === "overview" && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("events");
                  setIsCreatingEvent(true);
                }}
                className="h-10 px-4 rounded-xl text-sm font-semibold bg-[#4318FF] hover:bg-[#3311DB] text-white transition-all shadow-[0_4px_12px_rgba(67,24,255,0.2)] hover:shadow-[0_6px_16px_rgba(67,24,255,0.3)] inline-flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <IconPlus size={16} />
                <span>Tambahkan Event Baru</span>
              </button>
            )}
          </div>

          {/* ═════════════ TAB: OVERVIEW (PHOTOBOOTH OPERATIONS) ═════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* ROW 1: 4 RELEVANT METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Acara */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#A3AED0]">Total Acara</span>
                    <div className="w-9 h-9 rounded-xl bg-[#F4F7FE] flex items-center justify-center text-[#4318FF]">
                      <IconCalendar size={18} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-extrabold text-[#1B2559]">
                      {events.length} <span className="text-sm font-medium text-[#8F9BBA]">Acara</span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[#01B574]">
                      {activeEvents} acara aktif berjalan
                    </div>
                  </div>
                </div>

                {/* 2. Foto Tamu Terkumpul */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#A3AED0]">Foto Tamu Terkumpul</span>
                    <div className="w-9 h-9 rounded-xl bg-[#E9FAF4] flex items-center justify-center text-[#01B574]">
                      <IconImage size={18} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-extrabold text-[#1B2559]">
                      {entries.length} <span className="text-sm font-medium text-[#8F9BBA]">Foto</span>
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-[#A3AED0]">
                      Unggahan tamu di semua event
                    </div>
                  </div>
                </div>

                {/* 3. Reservasi Masuk */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#A3AED0]">Reservasi Booking</span>
                    <div className="w-9 h-9 rounded-xl bg-[#FFF6E9] flex items-center justify-center text-[#FFB547]">
                      <IconBooking size={18} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-extrabold text-[#1B2559]">
                      {bookings.length} <span className="text-sm font-medium text-[#8F9BBA]">Klien</span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[#01B574]">
                      {confirmedBookings} sudah dikonfirmasi
                    </div>
                  </div>
                </div>

                {/* 4. Estimasi Nilai Layanan */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#A3AED0]">Estimasi Omset</span>
                    <div className="w-9 h-9 rounded-xl bg-[#F4F7FE] flex items-center justify-center text-[#1B2559]">
                      <IconPackage size={18} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold text-[#1B2559] truncate">
                      {formatRupiah(totalRevenue)}
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-[#A3AED0]">
                      Pipeline booking Palopo
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 2: TWO COLUMNS (LEFT: EVENT MANAGEMENT & LINKS, RIGHT: LIVE GUEST PHOTO STREAM) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* ───── LEFT COLUMN (8 of 12) ───── */}
                <div className="xl:col-span-8 space-y-6">
                  {/* CARD: DAFTAR EVENT UTAMA & LINK AKSES CEPAT */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] border border-transparent">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#E0E5F2]">
                      <div>
                        <h3 className="text-base font-bold text-[#1B2559]">
                          Daftar Operasional Event Photobooth
                        </h3>
                        <p className="text-xs text-[#A3AED0] mt-0.5">
                          Tautan instan photobooth HP tamu, cetak fisik, videotron panggung, galeri, dan QR standee.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Category Filter Tabs */}
                        <div className="flex items-center gap-1 bg-[#F4F7FE] p-1 rounded-xl shrink-0 border border-[#E0E5F2]">
                          <button
                            type="button"
                            onClick={() => setOverviewCategoryFilter("all")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${overviewCategoryFilter === "all" ? "bg-white text-[#4318FF] shadow-xs" : "text-[#8F9BBA] hover:text-[#1B2559]"
                              }`}
                          >
                            Semua
                          </button>
                          <button
                            type="button"
                            onClick={() => setOverviewCategoryFilter("virtual_photobooth")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${overviewCategoryFilter === "virtual_photobooth" ? "bg-white text-[#4318FF] shadow-xs" : "text-[#8F9BBA] hover:text-[#1B2559]"
                              }`}
                          >
                            Virtual
                          </button>
                          <button
                            type="button"
                            onClick={() => setOverviewCategoryFilter("photobooth")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${overviewCategoryFilter === "photobooth"
                              ? isDarkMode
                                ? "bg-white text-amber-400 shadow-xs"
                                : "bg-white text-amber-900 shadow-xs"
                              : "text-[#8F9BBA] hover:text-[#1B2559]"
                              }`}
                          >
                            Photobooth
                          </button>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1 bg-[#F4F7FE] p-1 rounded-xl shrink-0">
                          <button
                            type="button"
                            onClick={() => setOverviewFilter("all")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${overviewFilter === "all" ? "bg-white text-[#4318FF] shadow-xs" : "text-[#8F9BBA] hover:text-[#1B2559]"
                              }`}
                          >
                            Semua ({events.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setOverviewFilter("active")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${overviewFilter === "active" ? "bg-white text-[#4318FF] shadow-xs" : "text-[#8F9BBA] hover:text-[#1B2559]"
                              }`}
                          >
                            Aktif ({activeEvents})
                          </button>
                          <button
                            type="button"
                            onClick={() => setOverviewFilter("completed")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${overviewFilter === "completed" ? "bg-white text-[#4318FF] shadow-xs" : "text-[#8F9BBA] hover:text-[#1B2559]"
                              }`}
                          >
                            Selesai ({events.length - activeEvents})
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Table of Events */}
                    <div className="divide-y divide-[#E0E5F2] mt-2">
                      {events
                        .filter((evt) => {
                          const isPhotobooth = evt.category === "photobooth";
                          if (overviewCategoryFilter === "photobooth" && !isPhotobooth) return false;
                          if (overviewCategoryFilter === "virtual_photobooth" && isPhotobooth) return false;

                          const isActive = evt.is_active !== false && evt.status !== "COMPLETED" && evt.status !== "ARCHIVED";
                          if (overviewFilter === "active") return isActive;
                          if (overviewFilter === "completed") return !isActive;
                          return true;
                        })
                        .slice(0, 6)
                        .map((evt) => {
                          const active = evt.is_active !== false && evt.status !== "COMPLETED" && evt.status !== "ARCHIVED";
                          return (
                            <div
                              key={evt.id}
                              className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-[#F4F7FE]/40 px-2 rounded-xl transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-[#1B2559] truncate">
                                    {evt.title}
                                  </span>
                                  <span
                                    className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-bold ${evt.category === "photobooth"
                                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                                      : "bg-blue-100 text-blue-900 border border-blue-300"
                                      }`}
                                  >
                                    {evt.category === "photobooth" ? "Photobooth" : "Virtual Photobooth"}
                                  </span>
                                  <span
                                    className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-bold ${active
                                      ? "bg-[#E9FAF4] text-[#01B574]"
                                      : "bg-[#FFF6E9] text-[#FFB547]"
                                      }`}
                                  >
                                    {active ? "Aktif" : "Selesai"}
                                  </span>
                                  {evt.category !== "photobooth" && evt.assigned_frames && evt.assigned_frames.length > 0 && (
                                    <span className="text-[11px] font-semibold text-[#8F9BBA] bg-[#F4F7FE] px-2 py-0.5 rounded">
                                      {evt.assigned_frames.length} Frame
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#A3AED0] mt-1 flex items-center gap-2 flex-wrap">
                                  <span className="inline-flex items-center gap-1">
                                    <IconUser size={12} className="text-[#A3AED0]" />
                                    {evt.host_name}
                                  </span>
                                  <span>&bull;</span>
                                  <span className="inline-flex items-center gap-1">
                                    <IconMapPin size={12} className="text-[#A3AED0]" />
                                    {evt.venue}, {evt.city}
                                  </span>
                                  <span>&bull;</span>
                                  <span className="inline-flex items-center gap-1">
                                    <IconCalendar size={12} />
                                    {evt.date}
                                  </span>
                                </div>
                              </div>

                              {/* Action Links */}
                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                {evt.category !== "photobooth" && (
                                  <>
                                    <Link
                                      href={`/event/${evt.slug}`}
                                      target="_blank"
                                      className="h-8 px-2.5 rounded-lg bg-[#F4F7FE] hover:bg-[#4318FF] hover:text-white text-xs font-semibold text-[#4318FF] inline-flex items-center gap-1.5 transition-colors"
                                      title="Akses halaman kamera tamu"
                                    >
                                      <IconCamera size={13} />
                                      <span>Booth</span>
                                      <IconExternalLink size={11} />
                                    </Link>
                                    <Link
                                      href={`/event/${evt.slug}/projection`}
                                      target="_blank"
                                      className="h-8 px-2.5 rounded-lg bg-[#F4F7FE] hover:bg-[#1B2559] hover:text-white text-xs font-semibold text-[#2B3674] inline-flex items-center gap-1.5 transition-colors"
                                      title="Tampilan layar panggung videotron"
                                    >
                                      <IconMonitor size={13} />
                                      <span>Layar</span>
                                      <IconExternalLink size={11} />
                                    </Link>
                                    <Link
                                      href={`/event/${evt.slug}/gallery`}
                                      target="_blank"
                                      className="h-8 px-2.5 rounded-lg bg-[#F4F7FE] hover:bg-[#1B2559] hover:text-white text-xs font-semibold text-[#2B3674] inline-flex items-center gap-1.5 transition-colors"
                                      title="Galeri foto live"
                                    >
                                      <IconImage size={13} />
                                      <span>Galeri</span>
                                      <IconExternalLink size={11} />
                                    </Link>
                                    <Link
                                      href={`/event/${evt.slug}/qr`}
                                      target="_blank"
                                      className="h-8 px-2.5 rounded-lg bg-[#F4F7FE] hover:bg-[#01B574] hover:text-white text-xs font-semibold text-[#01B574] inline-flex items-center gap-1.5 transition-colors"
                                      title="Buka / Cetak QR Standee"
                                    >
                                      <IconQrCode size={13} />
                                      <span>QR</span>
                                      <IconExternalLink size={11} />
                                    </Link>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleStartEditEvent(evt)}
                                  className="h-8 px-3 rounded-lg border border-[#E0E5F2] hover:bg-[#E0E5F2] text-xs font-semibold text-[#1B2559] transition-colors"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          );
                        })}

                      {events.length === 0 && (
                        <div className="py-12 text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#4318FF] mx-auto">
                            <IconCalendar size={20} />
                          </div>
                          <div className="text-sm font-semibold text-[#1B2559]">Belum ada event terdaftar</div>
                          <p className="text-xs text-[#A3AED0] max-w-sm mx-auto">
                            Buat event pertama Anda untuk mendapatkan link photobooth smartphone, layar videotron, dan QR Code.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("events");
                              setIsCreatingEvent(true);
                            }}
                            className="mt-2 h-9 px-4 bg-[#4318FF] hover:bg-[#3311DB] text-white text-xs font-semibold rounded-xl transition-colors"
                          >
                            + Buat Event Sekarang
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KARTU PANDUAN CEPAT OPERATOR VENUE */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] border border-transparent">
                    <h3 className="text-base font-bold text-[#1B2559] mb-1">
                      Panduan Operasional Hari-H di Gedung Acara
                    </h3>
                    <p className="text-xs text-[#A3AED0] mb-4">
                      Tiga langkah mudah menjalankan Virtual Photobooth RUANGTEMU di lokasi event:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#F4F7FE] rounded-xl space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-[#4318FF] text-white flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <h4 className="text-sm font-bold text-[#1B2559]">Pajang QR Standee</h4>
                        <p className="text-xs text-[#8F9BBA] leading-relaxed">
                          Cetak atau tampilkan QR Code di meja resepsionis/meja tamu agar tamu dapat memindai dari kamera HP.
                        </p>
                      </div>

                      <div className="p-4 bg-[#F4F7FE] rounded-xl space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-[#01B574] text-white flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <h4 className="text-sm font-bold text-[#1B2559]">Buka Layar Videotron</h4>
                        <p className="text-xs text-[#8F9BBA] leading-relaxed">
                          Buka tautan <strong>Layar Proyektor</strong> di laptop operator, sambungkan kabel HDMI ke proyektor/LED, dan aktifkan fullscreen (F11).
                        </p>
                      </div>

                      <div className="p-4 bg-[#F4F7FE] rounded-xl space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-[#FFB547] text-white flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <h4 className="text-sm font-bold text-[#1B2559]">Tamu Ambil Foto</h4>
                        <p className="text-xs text-[#8F9BBA] leading-relaxed">
                          Tamu berfoto dengan frame khusus acara. Foto langsung muncul secara otomatis di layar videotron panggung secara real-time!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ───── RIGHT COLUMN (4 of 12) ───── */}
                <div className="xl:col-span-4 space-y-6">
                  {/* CARD 1: LIVE STREAM FOTO TAMU TERBARU */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] border border-transparent">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E0E5F2] mb-3">
                      <div>
                        <h3 className="text-base font-bold text-[#1B2559]">Foto Tamu Terbaru</h3>
                        <p className="text-[11px] text-[#A3AED0]">Unggahan live tamu dari venue</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("gallery")}
                        className="text-xs font-semibold text-[#4318FF] hover:underline"
                      >
                        Lihat Semua ({entries.length})
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {entries.slice(0, 4).map((ent) => {
                        const evt = getEventForEntry(ent);
                        return (
                          <div
                            key={ent.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F4F7FE] hover:bg-[#EAEFFA] transition-colors"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ent.photo_url}
                              alt={ent.guest_name}
                              className="w-14 h-14 rounded-lg object-cover bg-stone-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-[#1B2559] truncate">
                                  {ent.guest_name}
                                </span>
                                {evt && (
                                  <span className="text-[10px] font-semibold text-[#4318FF] bg-[#EAEFFA] px-1.5 py-0.5 rounded-md truncate max-w-[130px]" title={evt.title}>
                                    {evt.title}
                                  </span>
                                )}
                              </div>
                              {ent.message && (
                                <p className="text-[11px] text-[#8F9BBA] italic truncate mt-0.5">
                                  &ldquo;{ent.message}&rdquo;
                                </p>
                              )}
                              <div className="text-[10px] text-[#A3AED0] mt-1">
                                {formatDate(ent.created_at)}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(ent.id)}
                              className="text-[#A3AED0] hover:text-[#EE5D50] p-1.5 transition-colors"
                              title="Hapus foto ini"
                            >
                              <IconTrash size={14} />
                            </button>
                          </div>
                        );
                      })}

                      {entries.length === 0 && (
                        <div className="py-8 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#A3AED0] mx-auto">
                            <IconImage size={18} />
                          </div>
                          <p className="text-xs text-[#A3AED0]">
                            Belum ada foto kiriman tamu. Foto akan otomatis muncul saat tamu memotret.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD 2: RINGKASAN PAKET PHOTOBOOTH PALOPO */}
                  <div className="bg-white rounded-2xl p-6 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] border border-transparent">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E0E5F2] mb-3">
                      <div>
                        <h3 className="text-base font-bold text-[#1B2559]">Katalog Paket Layanan</h3>
                        <p className="text-[11px] text-[#A3AED0]">Opsi paket photobooth untuk klien</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("packages")}
                        className="text-xs font-semibold text-[#4318FF] hover:underline"
                      >
                        Kelola
                      </button>
                    </div>

                    <div className="space-y-3">
                      {initialPackages.slice(0, 3).map((pkg) => (
                        <div
                          key={pkg.id}
                          className="p-3.5 bg-[#F4F7FE] rounded-xl flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#1B2559]">{pkg.name}</span>
                              {pkg.popular && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#4318FF] text-white">
                                  POPULER
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#8F9BBA]">{pkg.tagline}</div>
                          </div>
                          <div className="text-xs font-extrabold text-[#4318FF] shrink-0 font-mono">
                            {formatRupiah(pkg.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ TAB: EVENTS ═══════ */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#a3aed0]">
                  Kelola link photobooth dan layar proyektor untuk tiap acara
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreatingEvent(!isCreatingEvent)}
                  className={`h-10 px-4 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2 ${isCreatingEvent
                    ? "bg-[#f4f7fe] text-[#1B2559] border border-[#e0e5f2]"
                    : "bg-[#4318FF] hover:bg-[#3311DB] text-white"
                    }`}
                >
                  {isCreatingEvent ? "Batal" : <><IconPlus size={16} /> Event Baru</>}
                </button>
              </div>

              {isCreatingEvent && (
                <form
                  onSubmit={handleCreateEventDirectly}
                  className="bg-white rounded-2xl p-6 space-y-6"
                >
                  <h3 className="text-base font-semibold text-[#1B2559] pb-3 border-b border-[#e0e5f2]">
                    Informasi Acara Baru
                  </h3>

                  {/* Pilihan Cepat: Sambungkan dari Data Reservasi Klien */}
                  {bookings && bookings.length > 0 && (
                    <div className="p-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                        <label className="text-xs font-bold text-[#1B2559] flex items-center gap-1.5">
                          <IconCheck size={14} className="text-[#01B574]" />
                          <span>Sambungkan dari Data Reservasi Klien (Opsional):</span>
                        </label>
                        {sourceBooking && (
                          <button
                            type="button"
                            onClick={() => {
                              setSourceBooking(null);
                            }}
                            className="text-[11px] text-[#EE5D50] hover:underline font-semibold self-start sm:self-auto cursor-pointer"
                          >
                            Lepas Sambungan Reservasi
                          </button>
                        )}
                      </div>
                      <select
                        value={sourceBooking?.id || ""}
                        onChange={(e) => {
                          const chosen = bookings.find((b) => b.id === e.target.value);
                          if (chosen) {
                            handleCreateEventFromBooking(chosen);
                          } else {
                            setSourceBooking(null);
                          }
                        }}
                        className="w-full h-11 px-3.5 bg-white border border-[#e0e5f2] rounded-xl text-xs text-[#1B2559] font-medium focus:border-[#4318FF] outline-none shadow-xs"
                      >
                        <option value="">-- Buat Event Manual (Tanpa Sambungan Reservasi) --</option>
                        {bookings.map((b) => {
                          const isPaid = b.payment_status === "PAID";
                          const isPhysical = b.booking_category === "photobooth" || b.category === "photobooth";
                          return (
                            <option key={b.id} value={b.id}>
                              {isPaid ? "[LUNAS] " : "[PENDING] "}
                              {b.event_name} - {b.customer_name} ({isPhysical ? "Photobooth Fisik" : "Virtual Photobooth"}) - {formatRupiah(b.payment_amount || b.total_price)}
                            </option>
                          );
                        })}
                      </select>
                      {sourceBooking && sourceBooking.payment_status === "PAID" && (
                        <p className="text-[11px] text-[#01B574] font-semibold mt-2 flex items-center gap-1">
                          <IconCheck size={12} /> Terhubung ke reservasi lunas "{sourceBooking.event_name}". Pembayaran otomatis terverifikasi LUNAS tanpa bayar lagi.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Kategori Layanan Event */}
                  <div>
                    <label className="block text-sm font-medium text-[#1B2559] mb-1.5">
                      Kategori Layanan *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewEvent({ ...newEvent, category: "virtual_photobooth" })}
                        className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${newEvent.category !== "photobooth"
                          ? "bg-[#4318FF] text-white border-[#4318FF] shadow-sm"
                          : "bg-[#f4f7fe] text-[#1B2559] border-[#e0e5f2] hover:bg-[#eaeefa]"
                          }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>2. Virtual Photobooth (Smartphone Tamu)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewEvent({ ...newEvent, category: "photobooth" })}
                        className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${newEvent.category === "photobooth"
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                          : "bg-[#f4f7fe] text-[#1B2559] border-[#e0e5f2] hover:bg-[#eaeefa]"
                          }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-slate-950" />
                        <span>1. Photobooth (Cetak Fisik di Lokasi)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Judul Acara *</label>
                      <input type="text" required placeholder="The Wedding of Andi & Sarah" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Nama Tuan Rumah / Klien *</label>
                      <input type="text" required placeholder="Andi & Sarah" value={newEvent.host_name} onChange={(e) => setNewEvent({ ...newEvent, host_name: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                    </div>
                  </div>

                  {isNewEventPhysical ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Tanggal Acara *</label>
                        <input type="date" required value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] outline-none focus:border-[#4318FF] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Lokasi / Gedung *</label>
                        <input type="text" required placeholder="Gedung Saokotae" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Slug URL (Tautan Tamu)</label>
                        <input type="text" required placeholder="wedding-andi-sarah" value={newEvent.slug} onChange={(e) => setNewEvent({ ...newEvent, slug: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Tanggal Acara *</label>
                        <input type="date" required value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] outline-none focus:border-[#4318FF] transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Lokasi / Gedung *</label>
                        <input type="text" required placeholder="Gedung Saokotae" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                      </div>
                    </div>
                  )}

                  {/* ═══════════ FORM PAKET & PEMBAYARAN PENGAKTIFAN ACARA ═══════════ */}
                  <div className="pt-5 border-t border-[#e0e5f2] space-y-5">
                    {/* BUKTI PEMBAYARAN RESERVASI TERVERIFIKASI */}
                    {sourceBooking && sourceBooking.payment_status === "PAID" && (
                      <div className="p-4 bg-[#e9faf4] border-2 border-[#01B574]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#01B574] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                            <IconCheck size={22} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-[#01B574]">
                                Pembayaran Reservasi Klien Terverifikasi LUNAS
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#01B574] text-white">
                                PAID
                              </span>
                            </div>
                            <p className="text-xs text-[#1B2559] mt-0.5">
                              Klien telah melunasi pemesanan sebesar <strong className="font-bold text-[#01B574]">{formatRupiah(sourceBooking.payment_amount || sourceBooking.total_price)}</strong> ({sourceBooking.package_name || (isNewEventPhysical ? "Photobooth Fisik" : "Virtual Photobooth")}) via {sourceBooking.payment_method?.replace("DOKU_", "DOKU ") || "DOKU Payment Gateway"}. Event langsung aktif LUNAS tanpa bayar lagi.
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-[#01B574]/20 pt-2 sm:pt-0 sm:pl-4">
                          <div className="text-[11px] text-[#707EAE] font-semibold">Nomor Invoice:</div>
                          <div className="text-xs font-mono font-bold text-[#1B2559]">
                            {sourceBooking.payment_invoice || `INV-${sourceBooking.id.slice(-6).toUpperCase()}`}
                          </div>
                        </div>
                      </div>
                    )}

                    {isNewEventPhysical ? (
                      /* ─── KATEGORI 1: PHOTOBOOTH CETAK FISIK DI LOKASI ─── */
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-[#1B2559]">
                                Pilih Paket Photobooth (Cetak Fisik di Lokasi)
                              </h4>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                                Photobooth Fisik
                              </span>
                            </div>
                            <p className="text-xs text-[#a3aed0] mt-0.5">
                              Layanan cetak foto fisik instan dengan mesin photobooth, studio lighting, dan kru standby di lokasi acara.
                            </p>
                          </div>

                          {/* Print Size Selector (2R Strip vs 4R Postcard) */}
                          <div className="flex items-center gap-1.5 p-1 bg-[#f4f7fe] rounded-xl self-start sm:self-auto border border-[#e0e5f2]">
                            <span className="text-[11px] font-bold text-[#8F9BBA] px-2">Ukuran Cetak:</span>
                            <button
                              type="button"
                              onClick={() => setAdminPhysicalPrintSize("2R")}
                              className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminPhysicalPrintSize === "2R"
                                ? "bg-amber-500 text-slate-950 shadow-sm"
                                : "text-[#8F9BBA] hover:text-[#1B2559]"
                                }`}
                            >
                              2R Strip
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdminPhysicalPrintSize("4R")}
                              className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${adminPhysicalPrintSize === "4R"
                                ? "bg-amber-500 text-slate-950 shadow-sm"
                                : "text-[#8F9BBA] hover:text-[#1B2559]"
                                }`}
                            >
                              4R Postcard
                            </button>
                          </div>
                        </div>

                        {/* 4 Physical Photobooth Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                          {(["hours2", "hours3", "hours4", "hours5"] as const).map((tierKey) => {
                            const pkg = PHOTOBOOTH_PHYSICAL_PACKAGES[tierKey];
                            const isSelected = selectedPhysicalPackage === tierKey;
                            const currentPrice = adminPhysicalPrintSize === "4R" ? pkg.price4R : pkg.price2R;
                            return (
                              <div
                                key={tierKey}
                                onClick={() => setSelectedPhysicalPackage(tierKey)}
                                className={`relative rounded-2xl p-4 cursor-pointer transition-all border-2 flex flex-col justify-between overflow-hidden ${isSelected
                                  ? pkg.isRecommended
                                    ? "bg-white border-[#E52534] ring-4 ring-[#E52534]/15 shadow-xl"
                                    : "bg-white border-amber-500 ring-4 ring-amber-500/15 shadow-xl"
                                  : "bg-[#FAF8F5]/80 hover:bg-white border-[#E0E5F2] hover:border-[#8F9BBA]"
                                  }`}
                              >
                                {pkg.isRecommended && (
                                  <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
                                    <div className="bg-[#E52534] text-white text-[8px] font-black uppercase tracking-widest text-center py-0.5 absolute top-4 -right-7 w-28 rotate-45 shadow-md flex items-center justify-center gap-1">
                                      <IconStar size={8} /> FAVORIT
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-base font-black tracking-wider text-[#1B2559]">
                                      {pkg.name.toUpperCase()}
                                    </h5>
                                    <span className={`px-2 py-0.5 text-xs font-black rounded-md shadow-sm ${pkg.isRecommended ? "bg-[#E52534] text-white" : "bg-amber-500 text-slate-950"
                                      }`}>
                                      {pkg.tag}
                                    </span>
                                  </div>

                                  <div className="text-xs text-[#8F9BBA] font-semibold">
                                    Durasi: <span className="text-[#1B2559] font-bold">{pkg.durationHours} Jam di Venue</span>
                                  </div>

                                  <ul className="space-y-1.5 text-xs text-[#1B2559] pt-2 border-t border-[#E0E5F2]">
                                    <li className="flex items-start gap-1.5">
                                      <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={12} /></span>
                                      <span><strong>{pkg.durationHours} Jam Layanan Aktif</strong></span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                      <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={12} /></span>
                                      <span>Unlimited Cetak ({adminPhysicalPrintSize})</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                      <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={12} /></span>
                                      <span>Custom Frame Logo Event</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                      <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={12} /></span>
                                      <span>Studio Lighting &amp; Kamera HD</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                      <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={12} /></span>
                                      <span>Kru &amp; Operator Mesin Standby</span>
                                    </li>
                                  </ul>
                                </div>

                                <div className="mt-4 pt-2.5 border-t border-[#E0E5F2]">
                                  <div className={`w-full py-2 px-3 rounded-xl text-center text-xs font-bold transition-all ${isSelected
                                    ? pkg.isRecommended
                                      ? "bg-[#E52534] text-white shadow-sm"
                                      : "bg-amber-500 text-slate-950 shadow-sm"
                                    : "bg-[#F4F7FE] text-[#1B2559]"
                                    }`}>
                                    TOTAL: {formatRupiah(currentPrice)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Physical Photobooth Notes */}
                        <div className="p-4 bg-white border border-[#E0E5F2] rounded-2xl space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#E0E5F2]">
                            <span className="text-xs font-bold text-[#1B2559]">Fasilitas Cetak Fisik RUANGTEMU:</span>
                            <span className="text-[11px] font-semibold text-[#01B574] bg-[#E9FAF4] px-2.5 py-0.5 rounded-full">
                              Kru &amp; Mesin di Lokasi
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#1B2559]">
                            <div className="flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5"><IconCamera size={15} /></span>
                              <div>
                                <div className="font-bold">Kamera &amp; Lighting Studio</div>
                                <p className="text-[11px] text-[#8F9BBA] leading-tight">Pencahayaan profesional hasil foto tajam &amp; jernih</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5"><IconPackage size={15} /></span>
                              <div>
                                <div className="font-bold">Thermal Printer Super Cepat</div>
                                <p className="text-[11px] text-[#8F9BBA] leading-tight">Cetak foto otomatis selesai hanya dalam 12 detik</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5"><IconUser size={15} /></span>
                              <div>
                                <div className="font-bold">Kru &amp; Operator Ramah</div>
                                <p className="text-[11px] text-[#8F9BBA] leading-tight">Membantu tamu berpose dan mengarahkan antrean rapi</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Summary breakdown for Physical */}
                        <div className="p-4 bg-[#F4F7FE] border border-[#E0E5F2] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="text-xs text-[#8F9BBA] flex items-center gap-1.5 font-medium">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Jadwal Acara &amp; Sesi Layanan:</span>
                            </div>
                            <div className="text-sm font-bold text-[#1B2559]">
                              Tanggal: {newEvent.date || "Sesuai Jadwal"} ({currentPhysicalPackage.durationHours} Jam Layanan di {newEvent.venue || "Lokasi Acara"})
                            </div>
                          </div>

                          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#E0E5F2] pt-3 md:pt-0 md:pl-5">
                            <div className="text-right">
                              <div className="text-[11px] text-[#8F9BBA]">
                                Total Biaya Paket:
                              </div>
                              <div className="text-xl font-black font-mono text-[#1B2559]">
                                {formatRupiah(totalPayment)}
                              </div>
                              {sourceBooking?.payment_status === "PAID" && (
                                <span className="text-[10px] font-bold text-[#01B574] uppercase tracking-wider">
                                  Lunas dari Reservasi Klien
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* ─── KATEGORI 2: VIRTUAL PHOTOBOOTH (SMARTPHONE TAMU) ─── */
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-[#1B2559]">
                                Pilih Paket Virtual Photobooth &amp; Aktivasi Lisensi
                              </h4>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4318FF] text-white">
                                Virtual Photobooth
                              </span>
                            </div>
                            <p className="text-xs text-[#a3aed0] mt-0.5">
                              Sewa lisensi untuk booth yang dipakai selama event. Pilih paket durasi &amp; benefit sesuai kebutuhan.
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 p-1 bg-[#f4f7fe] rounded-xl self-start sm:self-auto border border-[#e0e5f2]">
                            <span className="px-3 py-1 bg-white text-[#4318FF] font-bold text-xs rounded-lg shadow-sm">
                              Durasi Lisensi
                            </span>
                            <span className="px-3 py-1 text-[#8F9BBA] text-xs font-medium">
                              Jumlah Sesi
                            </span>
                          </div>
                        </div>

                        {/* 3 Package Cards Virtual */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* 1. BRONZE CARD */}
                          <div
                            onClick={() => setSelectedPackage("bronze")}
                            className={`relative rounded-2xl p-5 cursor-pointer transition-all border-2 flex flex-col justify-between overflow-hidden ${selectedPackage === "bronze"
                              ? "bg-white border-[#CD7F32] ring-4 ring-[#CD7F32]/15 shadow-xl"
                              : "bg-[#FAF8F5]/80 hover:bg-white border-[#E0E5F2] hover:border-[#8F9BBA]"
                              }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="text-lg font-black tracking-wider text-[#A05A2C]">BRONZE</h5>
                                <span className="px-2.5 py-1 bg-[#617344] text-white text-xs font-black rounded-md shadow-sm">
                                  250K
                                </span>
                              </div>

                              <div className="text-xs text-[#8F9BBA] font-semibold">
                                Durasi Sewa: <span className="text-[#1B2559] font-bold">7 Hari Akses Foto</span>
                              </div>

                              <ul className="space-y-2 text-xs text-[#1B2559] pt-2 border-t border-[#E0E5F2]">
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Foto dan voice message ucapan</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Free <strong className="text-[#8C4A4A] font-semibold">1 desain</strong> template frame</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Akses web photobooth via <strong className="text-[#8C4A4A] font-semibold">HP tamu</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Unlimited Akses QR Code</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Akses foto <strong className="text-[#8C4A4A] font-semibold">7 hari</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Unlimited foto</span>
                                </li>
                              </ul>
                            </div>

                            <div className="mt-5 pt-3 border-t border-[#E0E5F2]">
                              <div className={`w-full py-2 px-3 rounded-xl text-center text-xs font-bold transition-all ${selectedPackage === "bronze"
                                ? "bg-[#01B574] text-white shadow-sm"
                                : "bg-[#F4F7FE] text-[#1B2559]"
                                }`}>
                                TOTAL: Rp 250.000
                              </div>
                            </div>
                          </div>

                          {/* 2. SILVER CARD (RECOMMENDED) */}
                          <div
                            onClick={() => setSelectedPackage("silver")}
                            className={`relative rounded-2xl p-5 cursor-pointer transition-all border-2 flex flex-col justify-between overflow-hidden ${selectedPackage === "silver"
                              ? "bg-white border-[#E52534] ring-4 ring-[#E52534]/15 shadow-xl"
                              : "bg-[#FAF8F5]/80 hover:bg-white border-[#E0E5F2] hover:border-[#8F9BBA]"
                              }`}
                          >
                            <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none">
                              <div className="bg-[#E52534] text-white text-[9px] font-black uppercase tracking-widest text-center py-1 absolute top-5 -right-7 w-32 rotate-45 shadow-md flex items-center justify-center gap-1">
                                <IconStar size={9} /> RECOMMENDED
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <h5 className="text-lg font-black tracking-wider text-[#735656]">SILVER</h5>
                                <span className="px-2.5 py-1 bg-[#617344] text-white text-xs font-black rounded-md shadow-sm">
                                  350K
                                </span>
                              </div>

                              <div className="text-xs text-[#8F9BBA] font-semibold">
                                Durasi Sewa: <span className="text-[#1B2559] font-bold">14 Hari Akses Foto</span>
                              </div>

                              <ul className="space-y-2 text-xs text-[#1B2559] pt-2 border-t border-[#E0E5F2]">
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Virtual Photobooth <strong className="text-[#8C4A4A] font-semibold">(Photo &amp; Voice Message)</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Free <strong className="text-[#8C4A4A] font-semibold">2 desain</strong> template frame (Strip/4R/Polaroid)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Akses web photobooth via <strong className="text-[#8C4A4A] font-semibold">HP tamu</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Unlimited Akses QR Code</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Akses foto <strong className="text-[#8C4A4A] font-semibold">14 hari</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Unlimited foto</span>
                                </li>
                              </ul>
                            </div>

                            <div className="mt-5 pt-3 border-t border-[#E0E5F2]">
                              <div className={`w-full py-2 px-3 rounded-xl text-center text-xs font-bold transition-all ${selectedPackage === "silver"
                                ? "bg-[#01B574] text-white shadow-sm"
                                : "bg-[#F4F7FE] text-[#1B2559]"
                                }`}>
                                TOTAL: Rp 350.000
                              </div>
                            </div>
                          </div>

                          {/* 2. GOLD CARD */}
                          <div
                            onClick={() => setSelectedPackage("gold")}
                            className={`relative rounded-2xl p-5 cursor-pointer transition-all border-2 flex flex-col justify-between ${selectedPackage === "gold"
                              ? "bg-white border-[#4318FF] ring-4 ring-[#4318FF]/10 shadow-lg"
                              : "bg-[#FAF8F5]/80 hover:bg-white border-[#E0E5F2] hover:border-[#8F9BBA]"
                              }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="text-lg font-black tracking-wider text-[#995C3D]">GOLD</h5>
                                <span className="px-2.5 py-1 bg-[#617344] text-white text-xs font-black rounded-md shadow-sm">
                                  450K
                                </span>
                              </div>

                              <div className="text-xs text-[#8F9BBA] font-semibold">
                                Durasi Sewa: <span className="text-[#1B2559] font-bold">30 Hari Akses Foto</span>
                              </div>

                              <ul className="space-y-2 text-xs text-[#1B2559] pt-2 border-t border-[#E0E5F2]">
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Virtual Photobooth <strong className="text-[#8C4A4A] font-semibold">(Photo &amp; Voice Message)</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Free <strong className="text-[#8C4A4A] font-semibold">3 desain</strong> template frame (Strip/4R/Polaroid)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Akses web photobooth via <strong className="text-[#8C4A4A] font-semibold">HP tamu</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Unlimited Akses QR Code</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Akses foto <strong className="text-[#8C4A4A] font-semibold">30 hari</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#01B574] mt-0.5 shrink-0"><IconCheck size={13} /></span>
                                  <span>Unlimited foto</span>
                                </li>
                              </ul>
                            </div>

                            <div className="mt-5 pt-3 border-t border-[#E0E5F2]">
                              <div className={`w-full py-2 px-3 rounded-xl text-center text-xs font-bold transition-all ${selectedPackage === "gold"
                                ? "bg-[#01B574] text-white shadow-sm"
                                : "bg-[#F4F7FE] text-[#1B2559]"
                                }`}>
                                TOTAL: Rp 450.000
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fasilitas & Catatan Khusus */}
                        <div className="p-4 bg-white border border-[#E0E5F2] rounded-2xl space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#E0E5F2]">
                            <span className="text-xs font-bold text-[#1B2559]">Fasilitas Termasuk &amp; Catatan Khusus:</span>
                            <span className="text-[11px] font-semibold text-[#01B574] bg-[#E9FAF4] px-2.5 py-0.5 rounded-full">
                              Available in 2 Languages (ID / EN)
                            </span>
                          </div>

                          <div className="p-3 bg-[#E9FAF4]/60 border border-[#b5f5e0] rounded-xl flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-[#01B574] flex items-center gap-1.5">
                                <IconCheck size={14} /> Template Frame Personal &amp; Akses Tamu Digital
                              </div>
                              <div className="text-[11px] text-[#5B6B8B] leading-tight mt-0.5">
                                Sudah termasuk desain frame kustom acara dan tautan QR code digital untuk dipindai tamu langsung di venue
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-[#01B574] bg-[#E9FAF4] px-2.5 py-1 rounded-lg border border-[#01B574]/20 shrink-0">
                              Included
                            </span>
                          </div>
                        </div>

                        {/* Features included in virtual packages */}
                        <div className="p-4 bg-[#E9FAF4]/70 border border-[#b5f5e0] rounded-2xl space-y-3">
                          <div className="text-xs font-bold text-[#01B574] uppercase tracking-wider flex items-center gap-1.5">
                            <IconCheck size={14} /> Sudah termasuk di semua paket event:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#1B2559]">
                            <div className="flex items-start gap-2">
                              <span className="text-[#4318FF] mt-0.5"><IconBooking size={15} /></span>
                              <div>
                                <div className="font-bold">Buku ucapan tamu</div>
                                <p className="text-[11px] text-[#8F9BBA] leading-tight">Tamu berfoto dan merekam pesan ucapan lewat QR di meja</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-[#4318FF] mt-0.5"><IconCamera size={15} /></span>
                              <div>
                                <div className="font-bold">Photobooth virtual</div>
                                <p className="text-[11px] text-[#8F9BBA] leading-tight">Tamu berfoto sendiri dari ponselnya, berbingkai frame acara</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-[#4318FF] mt-0.5"><IconImage size={15} /></span>
                              <div>
                                <div className="font-bold">Album foto online</div>
                                <p className="text-[11px] text-[#8F9BBA] leading-tight">Klien melihat, unduh foto semua sesi &amp; live videotron panggung</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* License validity & Pricing breakdown summary for Virtual */}
                        <div className="p-4 bg-[#F4F7FE] border border-[#E0E5F2] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="text-xs text-[#8F9BBA] flex items-center gap-1.5 font-medium">
                              <span className="w-2 h-2 rounded-full bg-[#01B574]" />
                              <span>Masa Berlaku Lisensi Acara:</span>
                            </div>
                            <div className="text-sm font-bold text-[#1B2559]">
                              Lisensi berlaku {startDateStr} sampai {endDateStr} pukul 23:59 WITA ({durationDays} Hari)
                            </div>
                          </div>

                          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#E0E5F2] pt-3 md:pt-0 md:pl-5">
                            <div className="text-right">
                              <div className="text-[11px] text-[#8F9BBA]">
                                Total Biaya Paket:
                              </div>
                              <div className="text-xl font-black font-mono text-[#4318FF]">
                                {formatRupiah(totalPayment)}
                              </div>
                              {sourceBooking?.payment_status === "PAID" && (
                                <span className="text-[10px] font-bold text-[#01B574] uppercase tracking-wider">
                                  Lunas dari Reservasi Klien
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Frame upload section (Hanya untuk Virtual Photobooth, disembunyikan untuk Photobooth Fisik) */}
                  {!isNewEventPhysical ? (
                    <div className="pt-4 border-t border-[#e0e5f2] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-[#1B2559]">Frame Photobooth (PNG)</h4>
                          <p className="text-xs text-[#a3aed0] mt-0.5">Unggah file frame PNG transparan. Tamu memilih salah satu saat photobooth.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={handleResetPresetFrames} className="text-xs font-medium text-[#4318FF] hover:text-[#3311DB] transition-colors">Muat Preset</button>
                          {frameSlots.length < 3 && (
                            <button type="button" onClick={handleAddFrameSlot} className="h-8 px-3 border border-[#e0e5f2] rounded-lg text-xs text-[#1B2559] font-medium hover:border-[#4318FF] transition-colors">
                              + Frame ke-{frameSlots.length + 1}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {frameSlots.map((slot, index) => (
                          <div key={slot.id} className="p-4 bg-[#f4f7fe] rounded-xl space-y-3 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#1B2559]">Frame {index + 1}</span>
                              {frameSlots.length > 1 && (
                                <button type="button" onClick={() => handleRemoveFrameSlot(index)} className="text-[#a3aed0] hover:text-red-500 transition-colors" title="Hapus">
                                  <IconTrash size={14} />
                                </button>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-[#8F9BBA] mb-1">Nama Frame</label>
                              <input type="text" required value={slot.name} onChange={(e) => handleFrameNameChange(index, e.target.value)} placeholder={`Frame ${index + 1}`} className="w-full h-9 px-3 bg-white border border-[#e0e5f2] rounded-lg text-sm text-[#1B2559] outline-none focus:border-[#4318FF] transition-colors" />
                            </div>
                            <div>
                              <label className="block text-xs text-[#8F9BBA] mb-1">Auto-Detect</label>
                              {slot.isAnalyzing ? (
                                <div className="h-9 px-3 bg-white border border-[#e0e5f2] rounded-lg text-xs text-[#8F9BBA] flex items-center gap-2">
                                  <span className="w-3 h-3 border-2 border-[#a3aed0] border-t-[#4318FF] rounded-full animate-spin" />
                                  Menganalisis...
                                </div>
                              ) : slot.detectedCount != null && slot.detectedCount > 0 ? (
                                <div className="h-9 px-3 bg-[#e9faf4] border border-[#b5f5e0] rounded-lg text-xs text-[#01B574] font-medium flex items-center gap-2">
                                  <IconCheck size={14} />
                                  {slot.detectedCount} area foto terdeteksi
                                </div>
                              ) : (
                                <div className="h-9 px-3 bg-white border border-[#e0e5f2] rounded-lg text-xs text-[#a3aed0] flex items-center">
                                  Upload PNG untuk auto-detect
                                </div>
                              )}
                            </div>
                            <div className="flex gap-3 items-center">
                              <div className="w-12 h-20 shrink-0 bg-[#1B2559] rounded-lg p-1 flex items-center justify-center overflow-hidden" style={{ backgroundImage: `radial-gradient(#3a4175 1px, transparent 1px)`, backgroundSize: "5px 5px" }}>
                                {slot.previewUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={slot.previewUrl} alt={slot.name} className="max-h-full max-w-full object-contain" />
                                ) : (
                                  <span className="text-[9px] text-[#8F9BBA]">PNG</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <label className="inline-block cursor-pointer">
                                  <span className="h-8 px-3 border border-[#e0e5f2] bg-white rounded-lg text-xs text-[#1B2559] font-medium inline-flex items-center gap-1.5 hover:border-[#4318FF] transition-colors">
                                    <IconUpload size={12} /> Pilih File
                                  </span>
                                  <input type="file" accept="image/png" onChange={(e) => handleFrameFileUpload(index, e.target.files?.[0] || null)} className="hidden" />
                                </label>
                                {slot.fileName && <div className="text-xs text-[#a3aed0] truncate">{slot.fileName}</div>}
                                {slot.error && <div className="text-xs text-red-500">{slot.error}</div>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-[#e0e5f2]">
                      <div className="bg-[#f4f7fe] rounded-2xl p-4 border border-[#e0e5f2] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                          <IconCamera size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1B2559]">Frame Photobooth Cetak Fisik</div>
                          <p className="text-xs text-[#8F9BBA] mt-0.5">
                            Konfigurasi frame dan tata letak cetak dikelola langsung melalui aplikasi software mesin photobooth di lokasi acara.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═══════════ STATUS PEMBAYARAN ACARA (CROSS-CHECK ADMIN) ═══════════ */}
                  <div className="pt-5 border-t border-[#e0e5f2] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-sm font-bold text-[#1B2559]">
                          Status Pembayaran Acara (Cross-Check Admin) *
                        </label>
                        <p className="text-xs text-[#8F9BBA]">
                          Tentukan status pembayaran untuk verifikasi &amp; cross-check keuangan admin.
                        </p>
                      </div>
                      <div className="text-sm font-bold text-[#1B2559]">
                        Biaya Paket: <span className="font-mono font-extrabold text-[#4318FF]">{formatRupiah(totalPayment)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                      <button
                        type="button"
                        onClick={() => setNewEventPaymentStatus("PAID")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${newEventPaymentStatus === "PAID"
                            ? "bg-[#e9faf4] border-[#01B574] ring-2 ring-[#01B574]/20 shadow-sm"
                            : "bg-white border-[#e0e5f2] hover:bg-[#f4f7fe]"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${newEventPaymentStatus === "PAID" ? "border-[#01B574] bg-[#01B574] text-white" : "border-[#a3aed0]"
                            }`}>
                            {newEventPaymentStatus === "PAID" && <IconCheck size={12} />}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-[#01B574] flex items-center gap-1">
                              Lunas (PAID)
                            </div>
                            <div className="text-[11px] text-[#5B6B8B] mt-0.5">
                              Pembayaran telah diterima / diverifikasi
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#01B574] text-white shrink-0">
                          LUNAS
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewEventPaymentStatus("PENDING")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${newEventPaymentStatus === "PENDING"
                            ? "bg-[#fff6e9] border-[#FFB547] ring-2 ring-[#FFB547]/20 shadow-sm"
                            : "bg-white border-[#e0e5f2] hover:bg-[#f4f7fe]"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${newEventPaymentStatus === "PENDING" ? "border-[#FFB547] bg-[#FFB547] text-white" : "border-[#a3aed0]"
                            }`}>
                            {newEventPaymentStatus === "PENDING" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-[#FFB547] flex items-center gap-1">
                              Belum Lunas (PENDING)
                            </div>
                            <div className="text-[11px] text-[#5B6B8B] mt-0.5">
                              Menunggu pembayaran / transfer dari klien
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFB547] text-slate-950 shrink-0">
                          BELUM LUNAS
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e0e5f2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-[#8F9BBA] flex items-center gap-2 flex-wrap">
                      <span>Status Pembayaran Event:</span>
                      {newEventPaymentStatus === "PAID" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e9faf4] text-[#01B574] border border-[#01B574]/30 shadow-2xs">
                          <IconCheck size={13} />
                          <span>LUNAS ({formatRupiah(totalPayment)})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff6e9] text-[#FFB547] border border-[#FFB547]/30 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-[#FFB547]" />
                          <span>BELUM LUNAS ({formatRupiah(totalPayment)})</span>
                        </span>
                      )}
                      {sourceBooking && (
                        <span className="text-[11px] text-[#707EAE]">
                          (Terhubung ke reservasi: {sourceBooking.customer_name})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingEvent(false);
                          setSourceBooking(null);
                        }}
                        className="h-11 px-5 border border-[#e0e5f2] hover:bg-[#f4f7fe] text-[#8F9BBA] hover:text-[#1B2559] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="h-11 px-6 bg-[#4318FF] hover:bg-[#3311DB] text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(67,24,255,0.3)] inline-flex items-center gap-2 cursor-pointer"
                      >
                        <IconPlus size={16} />
                        <span>Simpan Event Baru</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Events Category & Payment Status Filter Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#F4F7FE] p-1 rounded-xl w-fit border border-[#E0E5F2]">
                    <button
                      type="button"
                      onClick={() => setEventsCategoryFilter("all")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${eventsCategoryFilter === "all" ? "bg-white text-[#4318FF] shadow-xs" : "text-[#8F9BBA] hover:text-[#1B2559]"
                        }`}
                    >
                      Semua ({events.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventsCategoryFilter("virtual_photobooth")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${eventsCategoryFilter === "virtual_photobooth" ? "bg-white text-[#4318FF] shadow-xs" : "text-[#8F9BBA] hover:text-[#1B2559]"
                        }`}
                    >
                      Virtual Photobooth ({events.filter((e) => e.category !== "photobooth").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventsCategoryFilter("photobooth")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${eventsCategoryFilter === "photobooth"
                        ? isDarkMode
                          ? "bg-white text-amber-400 shadow-xs"
                          : "bg-white text-amber-900 shadow-xs"
                        : "text-[#8F9BBA] hover:text-[#1B2559]"
                        }`}
                    >
                      Photobooth Fisik ({events.filter((e) => e.category === "photobooth").length})
                    </button>
                  </div>

                  {/* Filter Status Pembayaran untuk Cross-Check Admin */}
                  <div className="flex items-center gap-1 bg-[#F4F7FE] p-1 rounded-xl w-fit border border-[#E0E5F2]">
                    <button
                      type="button"
                      onClick={() => setEventsPaymentFilter("all")}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${eventsPaymentFilter === "all" ? "bg-white text-[#1B2559] shadow-xs" : "text-[#8F9BBA] hover:text-[#1B2559]"}`}
                    >
                      Semua Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventsPaymentFilter("PAID")}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${eventsPaymentFilter === "PAID" ? "bg-[#01B574] text-white shadow-xs font-bold" : "text-[#01B574] hover:bg-emerald-50"}`}
                    >
                      <IconCheck size={12} /> Lunas ({events.filter((e) => e.payment_status === "PAID").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventsPaymentFilter("PENDING")}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${eventsPaymentFilter === "PENDING" ? "bg-[#FFB547] text-white shadow-xs font-bold" : "text-[#D97706] hover:bg-amber-50"}`}
                    >
                      Belum Lunas ({events.filter((e) => e.payment_status !== "PAID").length})
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#A3AED0]">
                  Menampilkan {
                    events.filter((evt) => {
                      if (searchQuery) {
                        const q = searchQuery.toLowerCase().trim();
                        const matchTitle = evt.title?.toLowerCase().includes(q);
                        const matchHost = evt.host_name?.toLowerCase().includes(q);
                        const matchVenue = evt.venue?.toLowerCase().includes(q);
                        const matchCity = evt.city?.toLowerCase().includes(q);
                        if (!matchTitle && !matchHost && !matchVenue && !matchCity) return false;
                      }
                      if (eventsCategoryFilter === "photobooth" && evt.category !== "photobooth") return false;
                      if (eventsCategoryFilter === "virtual_photobooth" && evt.category === "photobooth") return false;
                      if (eventsPaymentFilter === "PAID" && evt.payment_status !== "PAID") return false;
                      if (eventsPaymentFilter === "PENDING" && evt.payment_status === "PAID") return false;
                      return true;
                    }).length
                  } dari {events.length} acara
                </div>
              </div>

              {/* Events table */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0_18px_40px_0_rgba(112,144,176,0.06)]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#e0e5f2] bg-[#F4F7FE]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Acara</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Tanggal &amp; Lokasi</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Tautan</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e5f2]">
                    {events
                      .filter((evt) => {
                        if (searchQuery) {
                          const q = searchQuery.toLowerCase().trim();
                          const matchTitle = evt.title?.toLowerCase().includes(q);
                          const matchHost = evt.host_name?.toLowerCase().includes(q);
                          const matchVenue = evt.venue?.toLowerCase().includes(q);
                          const matchCity = evt.city?.toLowerCase().includes(q);
                          if (!matchTitle && !matchHost && !matchVenue && !matchCity) return false;
                        }
                        if (eventsCategoryFilter === "photobooth" && evt.category !== "photobooth") return false;
                        if (eventsCategoryFilter === "virtual_photobooth" && evt.category === "photobooth") return false;
                        if (eventsPaymentFilter === "PAID" && evt.payment_status !== "PAID") return false;
                        if (eventsPaymentFilter === "PENDING" && evt.payment_status === "PAID") return false;
                        return true;
                      })
                      .map((evt) => {
                        const active = evt.is_active !== false && evt.status !== "COMPLETED" && evt.status !== "ARCHIVED";
                        return (
                          <tr key={evt.id} className="hover:bg-[#f4f7fe]/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-[#1B2559]">{evt.title}</div>
                              <div className="text-xs text-[#a3aed0] mt-0.5">{evt.host_name}</div>
                              {evt.package_tier && (
                                <div className="mt-1">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${evt.payment_status === "PAID"
                                      ? "bg-[#01B574]/10 text-[#01B574]"
                                      : "bg-[#FFB547]/15 text-[#E08A00]"
                                    }`}>
                                    <IconStar size={10} /> Paket {evt.package_name || evt.package_tier.toUpperCase()} &bull; {evt.payment_status === "PAID" ? "Lunas" : "Belum Lunas"}
                                  </span>
                                </div>
                              )}
                              {evt.category !== "photobooth" && evt.assigned_frames && evt.assigned_frames.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                  {evt.assigned_frames.map((fr, fIdx) => (
                                    <span key={fr.id || fIdx} className="inline-flex items-center px-2 py-0.5 bg-[#f4f7fe] text-[11px] text-[#4318FF] font-medium rounded-md">
                                      {fr.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${evt.category === "photobooth"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : "bg-blue-100 text-blue-900 border border-blue-300"
                                  }`}
                              >
                                {evt.category === "photobooth" ? "Photobooth (Fisik)" : "Virtual Photobooth"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#1B2559]">{evt.date}</div>
                              <div className="text-xs text-[#a3aed0] mt-0.5">{evt.venue}, {evt.city}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium ${active ? "bg-[#e9faf4] text-[#01B574]" : evt.status === "ARCHIVED" ? "bg-[#f4f7fe] text-[#8F9BBA]" : "bg-[#fff6e9] text-[#FFB547]"
                                  }`}>
                                  {active ? "Aktif" : evt.status === "ARCHIVED" ? "Diarsipkan" : "Selesai"}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${evt.payment_status === "PAID"
                                    ? "bg-[#01B574]/15 text-[#01B574]"
                                    : "bg-[#FFB547]/20 text-[#D97706]"
                                  }`}>
                                  {evt.payment_status === "PAID" ? "✓ Lunas" : "⏳ Belum Lunas"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {evt.category === "photobooth" ? (
                                <span className="text-xs text-[#a3aed0] font-medium">-</span>
                              ) : (
                                <div className="flex items-center gap-2 text-xs flex-wrap">
                                  <Link href={`/event/${evt.slug}`} target="_blank" className="text-[#4318FF] hover:text-[#3311DB] font-medium transition-colors">Booth</Link>
                                  <Link href={`/event/${evt.slug}/gallery`} target="_blank" className="text-[#4318FF] hover:text-[#3311DB] font-medium transition-colors">Galeri</Link>
                                  <Link href={`/event/${evt.slug}/projection`} target="_blank" className="text-[#4318FF] hover:text-[#3311DB] font-medium transition-colors">Layar</Link>
                                  <Link href={`/event/${evt.slug}/qr`} target="_blank" className="text-[#4318FF] hover:text-[#3311DB] font-medium transition-colors">QR</Link>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button type="button" onClick={() => handleStartEditEvent(evt)} className="h-8 px-3 rounded-lg bg-[#f4f7fe] text-[#4318FF] text-xs font-medium hover:bg-[#4318FF] hover:text-white transition-colors">
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={togglingEventId === evt.id}
                                  onClick={() => handleToggleEventStatus(evt)}
                                  className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${active
                                    ? "bg-[#fff6e9] text-[#FFB547] hover:bg-[#FFB547] hover:text-white"
                                    : "bg-[#e9faf4] text-[#01B574] hover:bg-[#01B574] hover:text-white"
                                    } ${togglingEventId === evt.id ? "opacity-50 cursor-wait" : ""}`}
                                >
                                  {togglingEventId === evt.id ? (
                                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                                  ) : active ? "Selesaikan" : "Aktifkan"}
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingEventId === evt.id}
                                  onClick={() => handleDeleteEvent(evt)}
                                  className={`h-8 px-3 rounded-lg bg-[#feefee] text-[#EE5D50] text-xs font-medium hover:bg-[#EE5D50] hover:text-white transition-colors ${deletingEventId === evt.id ? "opacity-50 cursor-wait" : ""
                                    }`}
                                >
                                  {deletingEventId === evt.id ? (
                                    <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                                  ) : "Hapus"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════ TAB: EDIT EVENT ═══════ */}
          {activeTab === "edit" && (
            <div className="space-y-6">
              {!editingEvent ? (
                <div className="bg-white rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f4f7fe] flex items-center justify-center text-[#4318FF]">
                    <IconEdit size={24} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#1B2559]">Pilih Event yang Ingin Diedit</h2>
                    <p className="text-sm text-[#a3aed0] mt-1 max-w-md mx-auto">
                      Pilih salah satu event untuk mengubah detail acara atau mengelola tampilan.
                    </p>
                  </div>

                  <div className="max-w-lg mx-auto space-y-2 pt-2">
                    {events.length === 0 ? (
                      <p className="text-sm text-[#a3aed0] py-4">Belum ada event terdaftar.</p>
                    ) : (
                      events.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-4 bg-[#f4f7fe] rounded-xl flex items-center justify-between hover:bg-[#eaedfa] transition-colors"
                        >
                          <div className="text-left">
                            <div className="text-sm font-semibold text-[#1B2559]">{evt.title}</div>
                            <div className="text-xs text-[#a3aed0]">{evt.host_name} &middot; {evt.date}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartEditEvent(evt)}
                            className="h-8 px-4 bg-[#4318FF] hover:bg-[#3311DB] text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e5f2]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium ${editingEvent.is_active !== false && editingEvent.status !== "COMPLETED" && editingEvent.status !== "ARCHIVED"
                          ? "bg-[#e9faf4] text-[#01B574]"
                          : "bg-[#fff6e9] text-[#FFB547]"
                          }`}>
                          {editingEvent.is_active !== false && editingEvent.status !== "COMPLETED" && editingEvent.status !== "ARCHIVED" ? "Aktif" : "Selesai"}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-[#1B2559]">{editingEvent.title}</h2>
                      <p className="text-sm text-[#a3aed0] mt-0.5">
                        {(editForm.category === "photobooth" || editingEvent.category === "photobooth")
                          ? "Ubah informasi acara dan konfigurasi paket photobooth cetak fisik."
                          : "Ubah informasi, kelola frame, dan kustomisasi tampilan landing page."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingEvent.category !== "photobooth" && editForm.category !== "photobooth" && (
                        <Link href={`/event/${editingEvent.slug}`} target="_blank" className="h-10 px-4 border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] font-medium hover:border-[#4318FF] transition-colors inline-flex items-center gap-1.5">
                          Lihat Booth <IconExternalLink size={13} />
                        </Link>
                      )}
                      <button type="button" onClick={() => setActiveTab("events")} className="h-10 px-4 border border-[#e0e5f2] rounded-xl text-sm text-[#8F9BBA] font-medium hover:text-[#1B2559] hover:border-[#1B2559] transition-colors">
                        Kembali
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  {editSuccessMsg && (
                    <div className="px-4 py-3 bg-[#e9faf4] border border-[#b5f5e0] rounded-xl text-sm text-[#01B574] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconCheck size={16} />
                        <span>{editSuccessMsg}</span>
                      </div>
                      {editingEvent.category !== "photobooth" && editForm.category !== "photobooth" && (
                        <Link href={`/event/${editingEvent.slug}`} target="_blank" className="font-medium underline ml-4">
                          Buka Halaman Tamu
                        </Link>
                      )}
                    </div>
                  )}
                  {editErrorMsg && (
                    <div className="px-4 py-3 bg-[#feefee] border border-[#f5c6c6] rounded-xl text-sm text-[#EE5D50]">
                      {editErrorMsg}
                    </div>
                  )}

                  {/* ═══════ STATUS PEMBAYARAN & DURASI REAL-TIME ═══════ */}
                  {(() => {
                    const isPhysical = (editForm.category || editingEvent.category) === "photobooth";

                    const activePhysicalTier: PhysicalPackageKey =
                      (PHOTOBOOTH_PHYSICAL_PACKAGES[editSelectedPhysicalTier]
                        ? editSelectedPhysicalTier
                        : (editingEvent.package_tier as PhysicalPackageKey)) || "hours2";

                    const activeVirtualTier =
                      (editingEvent.package_tier as "bronze" | "silver" | "gold") || editSelectedTier || "silver";

                    const physicalPkgInfo = PHOTOBOOTH_PHYSICAL_PACKAGES[activePhysicalTier] || PHOTOBOOTH_PHYSICAL_PACKAGES.hours2;
                    const virtualPkgInfo = VIRTUAL_BOOTH_PACKAGES[activeVirtualTier] || VIRTUAL_BOOTH_PACKAGES.silver;

                    const pkgInfo = isPhysical ? physicalPkgInfo : virtualPkgInfo;

                    const isPaid =
                      editingEvent.payment_status === "PAID" ||
                      editPaymentStatus === "PAID" ||
                      (Boolean(editingEvent.package_tier) &&
                        editingEvent.payment_status !== "PENDING" &&
                        editingEvent.payment_status !== "FAILED");

                    const isEventActive =
                      editingEvent.is_active !== false &&
                      editingEvent.status !== "COMPLETED" &&
                      editingEvent.status !== "ARCHIVED";

                    const displayPrice = isPhysical
                      ? (editingEvent.payment_amount && editingEvent.payment_amount >= 1000000
                        ? editingEvent.payment_amount
                        : physicalPkgInfo.price)
                      : (editingEvent.payment_amount || virtualPkgInfo.price);

                    const startMs = editingEvent.license_start_date
                      ? new Date(editingEvent.license_start_date).getTime()
                      : new Date(editingEvent.created_at || editingEvent.date || Date.now()).getTime();

                    const endMs = editingEvent.license_end_date
                      ? new Date(editingEvent.license_end_date).getTime()
                      : startMs + (isPhysical ? 7 : (virtualPkgInfo as any).durationDays) * 24 * 60 * 60 * 1000;

                    const totalDurationMs = Math.max(1000, endMs - startMs);
                    const remainingMs = Math.max(0, endMs - nowTime);
                    const isExpired = !isPhysical && isPaid && endMs <= nowTime;

                    const countDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
                    const countHours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
                    const countMinutes = Math.floor((remainingMs / (1000 * 60)) % 60);
                    const countSeconds = Math.floor((remainingMs / 1000) % 60);

                    const percentRemaining = Math.max(0, Math.min(100, Math.round((remainingMs / totalDurationMs) * 100)));

                    return (
                      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#e0e5f2] shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] space-y-6">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e0e5f2]">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[#f4f7fe] text-[#4318FF] flex items-center justify-center shrink-0">
                              <IconClock size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-[#1B2559]">
                                  Status Pembayaran &amp; Operasional Acara
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${isPhysical ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-[#4318FF]/10 text-[#4318FF]"
                                  }`}>
                                  {isPhysical ? "Photobooth Fisik" : "Real-Time"}
                                </span>
                              </div>
                              <p className="text-xs text-[#a3aed0] mt-0.5">
                                {isPhysical
                                  ? "Kelola status pembayaran dan kesiapan operasional kru photobooth fisik di lokasi."
                                  : "Pantau durasi paket photobooth dan masa aktif sesi tamu secara langsung detik demi detik."}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold ${isPaid
                                ? "bg-[#e9faf4] text-[#01B574] border border-[#b5f5e0]"
                                : "bg-[#fff6e9] text-[#FFB547] border border-[#ffe0b2]"
                                }`}
                            >
                              <IconCheck size={12} />
                              {isPaid ? "Pembayaran Lunas (PAID)" : "Menunggu Pembayaran"}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold ${isExpired
                                ? "bg-[#feefee] text-[#EE5D50] border border-[#f5c6c6]"
                                : isEventActive
                                  ? "bg-[#e9faf4] text-[#01B574] border border-[#b5f5e0]"
                                  : "bg-[#fff6e9] text-[#FFB547] border border-[#ffe0b2]"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${isExpired
                                  ? "bg-[#EE5D50]"
                                  : isEventActive
                                    ? "bg-[#01B574] animate-ping"
                                    : "bg-[#FFB547]"
                                  }`}
                              />
                              {isExpired
                                ? "Masa Lisensi Berakhir"
                                : isEventActive
                                  ? (isPhysical ? "Acara Aktif / Terjadwal" : "Event Aktif (Masa Sewa Berjalan)")
                                  : "Event Dijeda (Nonaktif)"}
                            </span>
                          </div>
                        </div>

                        {/* Durasi / Operasional Section */}
                        {isPaid ? (
                          isPhysical ? (
                            /* Physical Photobooth Live Status Card */
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8F9BBA]">
                                    Kesiapan Operasional Photobooth di Lokasi
                                  </span>
                                  <h4 className="text-sm font-bold text-[#1B2559] mt-0.5">
                                    Pembayaran terverifikasi LUNAS. Mesin photobooth, printer thermal, dan kru siap bertugas di venue.
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleEventStatus(editingEvent)}
                                    className={`h-9 px-3.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${isEventActive
                                      ? "bg-[#fff6e9] text-[#FFB547] hover:bg-[#FFB547] hover:text-white"
                                      : "bg-[#e9faf4] text-[#01B574] hover:bg-[#01B574] hover:text-white"
                                      }`}
                                  >
                                    {isEventActive ? "Jeda / Selesaikan" : "Aktifkan Sesi Sekarang"}
                                  </button>
                                </div>
                              </div>

                              {/* 4 Metric Cards for Physical Photobooth */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="p-3.5 bg-[#f4f7fe] rounded-xl border border-[#e0e5f2]">
                                  <div className="text-[10px] uppercase font-bold text-[#8F9BBA]">Paket Terpilih</div>
                                  <div className="text-sm font-black text-[#1B2559] mt-0.5 truncate">
                                    {editingEvent.package_name || physicalPkgInfo.name}
                                  </div>
                                  <div className="text-[11px] text-[#4318FF] font-bold mt-1">
                                    {formatRupiah(displayPrice)}
                                  </div>
                                </div>

                                <div className="p-3.5 bg-[#f4f7fe] rounded-xl border border-[#e0e5f2]">
                                  <div className="text-[10px] uppercase font-bold text-[#8F9BBA]">Durasi Layanan</div>
                                  <div className="text-sm font-black text-[#1B2559] mt-0.5">
                                    {physicalPkgInfo.durationHours} Jam di Lokasi
                                  </div>
                                  <div className="text-[11px] text-[#01B574] font-semibold mt-1">
                                    Unlimited Instant Print
                                  </div>
                                </div>

                                <div className="p-3.5 bg-[#f4f7fe] rounded-xl border border-[#e0e5f2]">
                                  <div className="text-[10px] uppercase font-bold text-[#8F9BBA]">Kru &amp; Mesin Standby</div>
                                  <div className="text-sm font-black text-[#1B2559] mt-0.5">
                                    Operator &amp; Asisten
                                  </div>
                                  <div className="text-[11px] text-[#8F9BBA] font-medium mt-1">
                                    Studio Lighting &amp; Kamera HD
                                  </div>
                                </div>

                                <div className="p-3.5 bg-[#f4f7fe] rounded-xl border border-[#e0e5f2]">
                                  <div className="text-[10px] uppercase font-bold text-[#8F9BBA]">Jadwal &amp; Lokasi</div>
                                  <div className="text-sm font-black text-[#1B2559] mt-0.5 truncate">
                                    {editingEvent.date || "Sesuai Jadwal"}
                                  </div>
                                  <div className="text-[11px] text-[#707EAE] font-medium mt-1 truncate">
                                    {editingEvent.venue || "Lokasi Acara"}, {editingEvent.city || "Palopo"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Virtual Photobooth Countdown Section */
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8F9BBA]">
                                    Sisa Waktu Durasi Akses Tamu
                                  </span>
                                  <h4 className="text-sm font-bold text-[#1B2559] mt-0.5">
                                    {isExpired
                                      ? "Masa aktif paket telah habis. Silakan perpanjang durasi untuk membuka booth kembali."
                                      : isEventActive
                                        ? "Waktu berjalan mundur secara real-time. Tamu dapat mengakses booth selama durasi ini."
                                        : "Event sedang dinonaktifkan / dijeda. Aktifkan kembali agar tamu dapat berfoto."}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleEventStatus(editingEvent)}
                                    className={`h-9 px-3.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${isEventActive
                                      ? "bg-[#fff6e9] text-[#FFB547] hover:bg-[#FFB547] hover:text-white"
                                      : "bg-[#e9faf4] text-[#01B574] hover:bg-[#01B574] hover:text-white"
                                      }`}
                                  >
                                    {isEventActive ? "Jeda / Selesaikan" : "Aktifkan Sesi Sekarang"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowExtendModal(true)}
                                    className="h-9 px-3.5 bg-[#4318FF] hover:bg-[#3311DB] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    + Perpanjang Durasi
                                  </button>
                                </div>
                              </div>

                              {/* Countdown Tiles (Days, Hours, Minutes, Seconds) */}
                              <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
                                <div className="bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl p-3 sm:p-4 text-center">
                                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1B2559] font-mono tracking-tight">
                                    {String(countDays).padStart(2, "0")}
                                  </div>
                                  <div className="text-[10px] sm:text-xs font-bold text-[#8F9BBA] uppercase tracking-wider mt-1">
                                    Hari
                                  </div>
                                </div>
                                <div className="bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl p-3 sm:p-4 text-center">
                                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1B2559] font-mono tracking-tight">
                                    {String(countHours).padStart(2, "0")}
                                  </div>
                                  <div className="text-[10px] sm:text-xs font-bold text-[#8F9BBA] uppercase tracking-wider mt-1">
                                    Jam
                                  </div>
                                </div>
                                <div className="bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl p-3 sm:p-4 text-center">
                                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1B2559] font-mono tracking-tight">
                                    {String(countMinutes).padStart(2, "0")}
                                  </div>
                                  <div className="text-[10px] sm:text-xs font-bold text-[#8F9BBA] uppercase tracking-wider mt-1">
                                    Menit
                                  </div>
                                </div>
                                <div className="bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl p-3 sm:p-4 text-center relative overflow-hidden ring-1 ring-[#4318FF]/20">
                                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4318FF] font-mono tracking-tight animate-pulse">
                                    {String(countSeconds).padStart(2, "0")}
                                  </div>
                                  <div className="text-[10px] sm:text-xs font-bold text-[#4318FF] uppercase tracking-wider mt-1">
                                    Detik
                                  </div>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[#8F9BBA] font-medium">Sisa Masa Aktif Paket</span>
                                  <span
                                    className={`font-bold ${percentRemaining > 20 ? "text-[#01B574]" : "text-[#EE5D50]"
                                      }`}
                                  >
                                    {isExpired
                                      ? "0% (Kedaluwarsa)"
                                      : `${percentRemaining}% (${countDays} Hari ${countHours} Jam Tersisa)`}
                                  </span>
                                </div>
                                <div className="w-full h-2.5 bg-[#e0e5f2] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${isExpired
                                      ? "bg-[#EE5D50]"
                                      : percentRemaining > 20
                                        ? "bg-gradient-to-r from-[#01B574] to-[#4318FF]"
                                        : "bg-[#EE5D50]"
                                      }`}
                                    style={{ width: `${percentRemaining}%` }}
                                  />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#a3aed0] pt-0.5 gap-1">
                                  <span>Diaktifkan: {formatIndonesianDateTime(startMs)}</span>
                                  <span>Batas Lisensi: {formatIndonesianDateTime(endMs)}</span>
                                </div>
                              </div>
                            </div>
                          )
                        ) : (
                          /* Belum Bayar Card */
                          <div className="p-5 bg-[#fff6e9] border border-[#ffe0b2] rounded-xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-[#FFB547] text-white flex items-center justify-center font-bold text-xs">
                                    !
                                  </span>
                                  <h4 className="text-sm font-bold text-[#1B2559]">
                                    Pembayaran Paket Belum Dilakukan
                                  </h4>
                                </div>
                                <p className="text-xs text-[#8F9BBA] mt-1">
                                  {isPhysical
                                    ? "Pilih paket photobooth cetak fisik dan selesaikan pembayaran untuk mengonfirmasi sesi operasional kru dan mesin di lokasi acara."
                                    : "Pilih paket virtual photobooth dan selesaikan pembayaran untuk mengaktifkan sesi photobooth dan memulai hitung mundur real-time."}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                <button
                                  type="button"
                                  onClick={handleMarkEditingEventAsPaid}
                                  className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                                  title="Tandai pembayaran telah diterima via transfer atau tunai"
                                >
                                  <IconCheck size={14} />
                                  <span>Tandai Lunas (Transfer / Tunai)</span>
                                </button>

                              </div>
                            </div>

                            {/* Package Choice Cards for Unpaid */}
                            {isPhysical ? (
                              <div className="space-y-2.5 pt-1">
                                <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#e0e5f2] w-fit">
                                  <span className="text-[11px] font-bold text-[#8F9BBA] px-2">Ukuran:</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditPhysicalPrintSize("2R")}
                                    className={`min-h-[44px] px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${editPhysicalPrintSize === "2R"
                                      ? "bg-amber-500 text-slate-950 shadow-sm"
                                      : "text-[#8F9BBA] hover:text-[#1B2559]"
                                      }`}
                                  >
                                    2R Strip
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditPhysicalPrintSize("4R")}
                                    className={`min-h-[44px] px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${editPhysicalPrintSize === "4R"
                                      ? "bg-amber-500 text-slate-950 shadow-sm"
                                      : "text-[#8F9BBA] hover:text-[#1B2559]"
                                      }`}
                                  >
                                    4R Postcard
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                  {(["hours2", "hours3", "hours4", "hours5"] as const).map((tierKey) => {
                                    const pkg = PHOTOBOOTH_PHYSICAL_PACKAGES[tierKey];
                                    const isSelected = editSelectedPhysicalTier === tierKey;
                                    const currentPrice = editPhysicalPrintSize === "4R" ? pkg.price4R : pkg.price2R;
                                    return (
                                      <div
                                        key={tierKey}
                                        onClick={() => setEditSelectedPhysicalTier(tierKey)}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                                          ? "bg-white border-amber-500 shadow-sm ring-2 ring-amber-500/20"
                                          : "bg-white/70 border-[#e0e5f2] hover:border-amber-500/50"
                                          }`}
                                      >
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-xs font-bold text-[#1B2559] uppercase">
                                            {pkg.name}
                                          </span>
                                          <span className="text-[11px] font-bold text-amber-700">
                                            {pkg.durationHours} Jam
                                          </span>
                                        </div>
                                        <div className="text-base font-extrabold text-[#1B2559] mb-2 font-mono">
                                          {formatRupiah(currentPrice)}
                                        </div>
                                        <ul className="text-[11px] text-[#8F9BBA] space-y-1">
                                          <li>• {pkg.durationHours} Jam Layanan di Venue</li>
                                          <li>• Unlimited Print ({editPhysicalPrintSize})</li>
                                          <li>• Custom Frame Eksklusif</li>
                                        </ul>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                {(["bronze", "silver", "gold"] as const).map((tierKey) => {
                                  const pkg = VIRTUAL_BOOTH_PACKAGES[tierKey];
                                  const isSelected = editSelectedTier === tierKey;
                                  return (
                                    <div
                                      key={tierKey}
                                      onClick={() => setEditSelectedTier(tierKey)}
                                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                                        ? "bg-white border-[#4318FF] shadow-sm ring-2 ring-[#4318FF]/20"
                                        : "bg-white/70 border-[#e0e5f2] hover:border-[#4318FF]/50"
                                        }`}
                                    >
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-bold text-[#1B2559] uppercase">
                                          Paket {pkg.name}
                                        </span>
                                        <span className="text-[11px] font-bold text-[#4318FF]">
                                          {pkg.durationDays} Hari
                                        </span>
                                      </div>
                                      <div className="text-base font-extrabold text-[#1B2559] mb-2 font-mono">
                                        {formatRupiah(pkg.price)}
                                      </div>
                                      <ul className="text-[11px] text-[#8F9BBA] space-y-1">
                                        <li>• {pkg.freeFrames} Desain Frame</li>
                                        <li>• Scan QR Tamu Tanpa Batas</li>
                                        <li>• Durasi {pkg.durationDays} Hari Real-time</li>
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Keterangan Paket yang Diambil */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {/* Kolom 1: Spesifikasi & Fasilitas Paket */}
                          <div className="p-4 bg-[#f4f7fe] rounded-xl border border-[#e0e5f2] space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isPhysical ? "bg-amber-500/10 text-amber-700" : "bg-[#4318FF]/10 text-[#4318FF]"
                                  }`}>
                                  ★
                                </span>
                                <div>
                                  <div className="text-[10px] font-bold text-[#8F9BBA] uppercase tracking-wider">
                                    Paket yang Diambil
                                  </div>
                                  <div className="text-sm font-bold text-[#1B2559]">
                                    {editingEvent.package_name || pkgInfo.name}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-white text-xs font-bold font-mono ${isPhysical ? "bg-amber-600" : "bg-[#4318FF]"
                                }`}>
                                {formatRupiah(displayPrice)}
                              </span>
                            </div>

                            <p className="text-xs text-[#8F9BBA] leading-relaxed">
                              {isPhysical
                                ? `Layanan photobooth fisik ${physicalPkgInfo.durationHours} jam di lokasi acara, cetak instan dengan operator & asisten standby.`
                                : `${(virtualPkgInfo as any).features[0]}: Akses photobooth online aktif selama ${(virtualPkgInfo as any).durationDays} hari kalender.`}
                            </p>

                            <div className="border-t border-[#e0e5f2] pt-2.5 space-y-1.5">
                              <div className="text-[11px] font-bold text-[#1B2559] mb-1">
                                Fasilitas Paket Termasuk:
                              </div>
                              {pkgInfo.features.map((feat: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-[#1B2559]">
                                  <span className="text-[#01B574] shrink-0 font-bold">✓</span>
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Kolom 2: Rincian Pembayaran & Lisensi */}
                          <div className="p-4 bg-[#f4f7fe] rounded-xl border border-[#e0e5f2] space-y-3 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between pb-2 border-b border-[#e0e5f2]">
                                <div className="text-[10px] font-bold text-[#8F9BBA] uppercase tracking-wider">
                                  Rincian Pembayaran
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${isPaid ? "bg-[#e9faf4] text-[#01B574]" : "bg-[#fff6e9] text-[#FFB547]"
                                    }`}
                                >
                                  {isPaid ? <IconCheck size={12} /> : null}
                                  {isPaid ? "Lunas (PAID)" : "Belum Lunas"}
                                </span>
                              </div>

                              <div className="divide-y divide-[#e0e5f2]/70 text-xs pt-1">
                                <div className="py-2 flex items-center justify-between">
                                  <span className="text-[#8F9BBA]">Nomor Invoice</span>
                                  <span className="font-mono font-bold text-[#1B2559]">
                                    {editingEvent.payment_invoice || `INV-${editingEvent.id.slice(0, 8).toUpperCase()}`}
                                  </span>
                                </div>
                                <div className="py-2 flex items-center justify-between">
                                  <span className="text-[#8F9BBA]">Metode Pembayaran</span>
                                  <span className="font-semibold text-[#1B2559]">
                                    {editingEvent.payment_method || (isPaid ? "Reservasi Terverifikasi (Lunas)" : "Menunggu Pembayaran")}
                                  </span>
                                </div>
                                <div className="py-2 flex items-center justify-between">
                                  <span className="text-[#8F9BBA]">Total Nominal</span>
                                  <span className="font-bold text-[#1B2559] font-mono text-sm">
                                    {formatRupiah(displayPrice)}
                                  </span>
                                </div>
                                <div className="py-2 flex items-center justify-between">
                                  <span className="text-[#8F9BBA]">Durasi / Sesi</span>
                                  <span className="font-semibold text-[#4318FF]">
                                    {isPhysical
                                      ? `${physicalPkgInfo.durationHours} Jam di Lokasi (${physicalPkgInfo.printsIncluded})`
                                      : `${(virtualPkgInfo as any).durationDays} Hari Kalender`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 flex items-center gap-2 border-t border-[#e0e5f2]">
                              <button
                                type="button"
                                onClick={() => handleToggleEventStatus(editingEvent)}
                                className={`flex-1 h-9 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${isEventActive
                                  ? "bg-[#fff6e9] text-[#FFB547] hover:bg-[#FFB547] hover:text-white"
                                  : "bg-[#e9faf4] text-[#01B574] hover:bg-[#01B574] hover:text-white"
                                  }`}
                              >
                                {isEventActive ? "Jeda / Selesaikan Sesi" : "Aktifkan Sesi Sekarang"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowExtendModal(true)}
                                className="h-9 px-3.5 bg-[#4318FF] hover:bg-[#3311DB] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                              >
                                + Perpanjang
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <form onSubmit={handleSaveEditSubmit} className="space-y-6">
                    {/* Section 1: Event info */}
                    <div className="bg-white rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#e0e5f2]">
                        <h3 className="text-sm font-semibold text-[#1B2559]">1. Informasi Acara</h3>
                        <span className="text-xs text-[#a3aed0]">ID: {editingEvent.id.slice(0, 8)}...</span>
                      </div>

                      {/* Service Category Selector */}
                      <div>
                        <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Kategori Layanan</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, category: "virtual_photobooth" })}
                            className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${editForm.category === "photobooth"
                              ? "bg-white text-[#707EAE] border-[#e0e5f2] hover:border-[#4318FF]/40"
                              : "bg-[#4318FF] text-white border-[#4318FF] shadow-xs"
                              }`}
                          >
                            <span>Virtual Photobooth</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, category: "photobooth" })}
                            className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${editForm.category === "photobooth"
                              ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold"
                              : "bg-white text-[#707EAE] border-[#e0e5f2] hover:border-[#4318FF]/40"
                              }`}
                          >
                            <span>Photobooth Fisik</span>
                          </button>
                        </div>
                      </div>

                      {/* Package & Payment Status Configuration */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#f4f7fe] rounded-xl border border-[#e0e5f2]">
                        {/* Package Selection */}
                        <div>
                          <label className="block text-xs font-bold text-[#1B2559] uppercase tracking-wider mb-2">
                            Pilihan Paket {editForm.category === "photobooth" ? "Photobooth Fisik" : "Virtual Photobooth"}
                          </label>
                          {editForm.category === "photobooth" ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-[#e0e5f2] w-fit">
                                <span className="text-[11px] font-bold text-[#8F9BBA] px-2">Cetak:</span>
                                <button
                                  type="button"
                                  onClick={() => setEditPhysicalPrintSize("2R")}
                                  className={`min-h-[44px] px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${editPhysicalPrintSize === "2R"
                                    ? "bg-amber-500 text-slate-950 shadow-sm"
                                    : "text-[#8F9BBA] hover:text-[#1B2559]"
                                    }`}
                                >
                                  2R Strip
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditPhysicalPrintSize("4R")}
                                  className={`min-h-[44px] px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${editPhysicalPrintSize === "4R"
                                    ? "bg-amber-500 text-slate-950 shadow-sm"
                                    : "text-[#8F9BBA] hover:text-[#1B2559]"
                                    }`}
                                >
                                  4R Postcard
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {(["hours2", "hours3", "hours4", "hours5"] as const).map((tierKey) => {
                                  const pkg = PHOTOBOOTH_PHYSICAL_PACKAGES[tierKey];
                                  const isSelected = editSelectedPhysicalTier === tierKey;
                                  const currentPrice = editPhysicalPrintSize === "4R" ? pkg.price4R : pkg.price2R;
                                  return (
                                    <button
                                      key={tierKey}
                                      type="button"
                                      onClick={() => setEditSelectedPhysicalTier(tierKey)}
                                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] ${isSelected
                                        ? "bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-sm"
                                        : "bg-white/60 border-[#e0e5f2] hover:bg-white"
                                        }`}
                                    >
                                      <div className="text-xs font-bold text-[#1B2559]">{pkg.name}</div>
                                      <div className="text-xs font-mono font-black text-amber-700 mt-0.5">{formatRupiah(currentPrice)}</div>
                                      <div className="text-[10px] text-[#8F9BBA] mt-0.5">{pkg.durationHours} Jam di Venue</div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setEditSelectedTier("bronze")}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${editSelectedTier === "bronze"
                                  ? "bg-white border-[#4318FF] ring-2 ring-[#4318FF]/20 shadow-sm"
                                  : "bg-white/60 border-[#e0e5f2] hover:bg-white"
                                  }`}
                              >
                                <div className="text-xs font-bold text-[#1B2559]">Bronze 250K</div>
                                <div className="text-xs font-mono font-black text-[#4318FF] mt-0.5">Rp 250.000</div>
                                <div className="text-[10px] text-[#8F9BBA] mt-0.5">7 Hari Akses</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditSelectedTier("silver")}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${editSelectedTier === "silver"
                                  ? "bg-white border-[#4318FF] ring-2 ring-[#4318FF]/20 shadow-sm"
                                  : "bg-white/60 border-[#e0e5f2] hover:bg-white"
                                  }`}
                              >
                                <div className="text-xs font-bold text-[#1B2559]">Silver 350K</div>
                                <div className="text-xs font-mono font-black text-[#4318FF] mt-0.5">Rp 350.000</div>
                                <div className="text-[10px] text-[#8F9BBA] mt-0.5">14 Hari Akses</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditSelectedTier("gold")}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${editSelectedTier === "gold"
                                  ? "bg-white border-[#4318FF] ring-2 ring-[#4318FF]/20 shadow-sm"
                                  : "bg-white/60 border-[#e0e5f2] hover:bg-white"
                                  }`}
                              >
                                <div className="text-xs font-bold text-[#1B2559]">Gold 450K</div>
                                <div className="text-xs font-mono font-black text-[#4318FF] mt-0.5">Rp 450.000</div>
                                <div className="text-[10px] text-[#8F9BBA] mt-0.5">30 Hari Akses</div>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Payment Status Selection */}
                        <div>
                          <label className="block text-xs font-bold text-[#1B2559] uppercase tracking-wider mb-2">
                            Status Pembayaran Acara
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setEditPaymentStatus("PAID")}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${editPaymentStatus === "PAID"
                                ? "bg-white border-[#01B574] ring-2 ring-[#01B574]/20 shadow-sm"
                                : "bg-white/60 border-[#e0e5f2] hover:bg-white"
                                }`}
                            >
                              <div className="text-xs font-bold text-[#01B574] flex items-center gap-1">
                                <IconCheck size={13} /> Lunas (PAID)
                              </div>
                              <div className="text-[10px] text-[#8F9BBA] mt-0.5">
                                Terverifikasi Lunas
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditPaymentStatus("PENDING")}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${editPaymentStatus === "PENDING"
                                ? "bg-white border-[#FFB547] ring-2 ring-[#FFB547]/20 shadow-sm"
                                : "bg-white/60 border-[#e0e5f2] hover:bg-white"
                                }`}
                            >
                              <div className="text-xs font-bold text-[#FFB547]">
                                Menunggu Bayar
                              </div>
                              <div className="text-[10px] text-[#8F9BBA] mt-0.5">
                                Belum Terbayar
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Judul Acara</label>
                          <input type="text" required placeholder="The Wedding of Andi & Sarah" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Nama Tuan Rumah</label>
                          <input type="text" required placeholder="Andi & Sarah" value={editForm.host_name} onChange={(e) => setEditForm({ ...editForm, host_name: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                        </div>
                      </div>

                      {(editForm.category === "photobooth" || editingEvent.category === "photobooth") ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Tanggal</label>
                            <input type="date" required value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] outline-none focus:border-[#4318FF] transition-colors" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Lokasi / Gedung</label>
                            <input type="text" required placeholder="Gedung Saokotae" value={editForm.venue} onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Slug URL</label>
                            <input type="text" required placeholder="wedding-andi-sarah" value={editForm.slug} onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                            <span className="text-xs text-[#a3aed0] mt-1 block">/event/{editForm.slug || "..."}</span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Tanggal</label>
                            <input type="date" required value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] outline-none focus:border-[#4318FF] transition-colors" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Lokasi / Gedung</label>
                            <input type="text" required placeholder="Gedung Saokotae" value={editForm.venue} onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Kota</label>
                          <input type="text" placeholder="Palopo" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1B2559] mb-1.5">Deskripsi</label>
                          <input type="text" placeholder="Selamat datang di photobooth kami" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full h-11 px-4 bg-[#f4f7fe] border border-[#e0e5f2] rounded-xl text-sm text-[#1B2559] placeholder:text-[#a3aed0] outline-none focus:border-[#4318FF] transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Frame management (Hanya untuk Virtual Photobooth, disembunyikan untuk Photobooth Fisik) */}
                    {editForm.category !== "photobooth" && editingEvent.category !== "photobooth" ? (
                      <div className="bg-white rounded-2xl p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0e5f2]">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-[#1B2559]">2. Kelola Frame Acara</h3>
                              <span className="inline-flex items-center h-5 px-2 rounded-full bg-[#4318FF] text-white text-[11px] font-medium">
                                {editFrames.length} Frame
                              </span>
                            </div>
                            <p className="text-xs text-[#a3aed0] mt-0.5">Tambah, hapus, atau ganti file PNG frame.</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button type="button" onClick={handleAddEditFrameSlot} className="h-9 px-3.5 bg-[#4318FF] hover:bg-[#3311DB] text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5">
                              <IconPlus size={14} /> Tambah Frame
                            </button>
                            <div className="relative group">
                              <button type="button" className="h-9 px-3.5 border border-[#e0e5f2] rounded-lg text-xs text-[#1B2559] font-medium hover:border-[#4318FF] transition-colors inline-flex items-center gap-1">
                                Preset Frame
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                              </button>
                              <div className="hidden group-hover:block absolute right-0 top-full pt-1 z-20 w-48">
                                <div className="bg-white border border-[#e0e5f2] rounded-xl shadow-lg py-1.5">
                                  <button type="button" onClick={() => handleAddPresetToEditFrames(0)} className="w-full text-left px-4 py-2 hover:bg-[#f4f7fe] text-sm text-[#1B2559]">Classic Floral Strip</button>
                                  <button type="button" onClick={() => handleAddPresetToEditFrames(1)} className="w-full text-left px-4 py-2 hover:bg-[#f4f7fe] text-sm text-[#1B2559]">Midnight Navy Gold</button>
                                  <button type="button" onClick={() => handleAddPresetToEditFrames(2)} className="w-full text-left px-4 py-2 hover:bg-[#f4f7fe] text-sm text-[#1B2559]">Modern Minimalist</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {editFrames.map((slot, index) => (
                            <div key={slot.id || index} className="p-4 bg-[#f4f7fe] rounded-xl space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-[#e0e5f2]">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-[#4318FF] text-white flex items-center justify-center text-xs font-semibold">{index + 1}</span>
                                  <span className="text-sm font-semibold text-[#1B2559]">Frame {index + 1}</span>
                                </div>
                                {editFrames.length > 1 && (
                                  <button type="button" onClick={() => handleRemoveEditFrameSlot(index)} className="text-[#a3aed0] hover:text-red-500 transition-colors p-1" title="Hapus Frame">
                                    <IconTrash size={14} />
                                  </button>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs text-[#8F9BBA] mb-1">Nama Tampilan</label>
                                <input type="text" required placeholder="Classic Floral" value={slot.name} onChange={(e) => handleEditFrameNameChange(index, e.target.value)} className="w-full h-9 px-3 bg-white border border-[#e0e5f2] rounded-lg text-sm text-[#1B2559] outline-none focus:border-[#4318FF] transition-colors" />
                              </div>

                              <div>
                                <label className="block text-xs text-[#8F9BBA] mb-1">Auto-Detect</label>
                                {slot.isAnalyzing ? (
                                  <div className="h-9 px-3 bg-white border border-[#e0e5f2] rounded-lg text-xs text-[#8F9BBA] flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-[#a3aed0] border-t-[#4318FF] rounded-full animate-spin" />
                                    Menganalisis...
                                  </div>
                                ) : slot.detectedCount != null && slot.detectedCount > 0 ? (
                                  <div className="h-9 px-3 bg-[#e9faf4] border border-[#b5f5e0] rounded-lg text-xs text-[#01B574] font-medium flex items-center gap-2">
                                    <IconCheck size={14} />
                                    {slot.detectedCount} area foto &rarr; {slot.detectedCount}x jepret
                                  </div>
                                ) : slot.template_type !== "custom" ? (
                                  <div className="h-9 px-3 bg-[#fff6e9] border border-[#ffe0b2] rounded-lg text-xs text-[#FFB547] font-medium flex items-center">
                                    Preset frame &mdash; ganti PNG untuk auto-detect
                                  </div>
                                ) : (
                                  <div className="h-9 px-3 bg-white border border-[#e0e5f2] rounded-lg text-xs text-[#a3aed0] flex items-center">
                                    Upload PNG transparan untuk detect
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-3 items-center">
                                <div className="w-12 h-20 shrink-0 bg-[#1B2559] rounded-lg p-1 flex items-center justify-center overflow-hidden" style={{ backgroundImage: `radial-gradient(#3a4175 1px, transparent 1px)`, backgroundSize: "5px 5px" }}>
                                  {slot.previewUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={slot.previewUrl} alt={slot.name} className="max-h-full max-w-full object-contain" />
                                  ) : (
                                    <span className="text-[9px] text-[#8F9BBA]">PNG</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <label className="inline-block cursor-pointer">
                                    <span className="h-8 px-3 border border-[#e0e5f2] bg-white rounded-lg text-xs text-[#1B2559] font-medium inline-flex items-center gap-1.5 hover:border-[#4318FF] transition-colors">
                                      <IconUpload size={12} /> Ganti PNG
                                    </span>
                                    <input type="file" accept="image/png" onChange={(e) => handleEditFrameFileUpload(index, e.target.files?.[0] || null)} className="hidden" />
                                  </label>
                                  {slot.fileName && <div className="text-xs text-[#a3aed0] truncate">{slot.fileName} {slot.fileSize ? `(${slot.fileSize})` : ""}</div>}
                                  {slot.error && <div className="text-xs text-red-500">{slot.error}</div>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#f4f7fe] rounded-2xl p-5 border border-[#e0e5f2] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                          <IconCamera size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1B2559]">Frame Photobooth Cetak Fisik</div>
                          <p className="text-xs text-[#8F9BBA] mt-0.5">
                            Konfigurasi frame dan tata letak cetak dikelola langsung melalui software mesin photobooth di lokasi acara.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Section 3: Landing UI Editor (Hanya untuk Virtual Photobooth, disembunyikan untuk Photobooth Fisik) */}
                    {editForm.category !== "photobooth" && (
                      <div>
                        <LandingUIEditor
                          initialConfig={editThemeConfig}
                          onChange={(newConfig) => setEditThemeConfig(newConfig)}
                          eventSlug={editForm.slug}
                        />
                      </div>
                    )}

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingEdit}
                        className="h-11 px-6 bg-[#4318FF] hover:bg-[#3311DB] disabled:bg-[#a3aed0] text-white text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2"
                      >
                        {isSavingEdit ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan Semua Perubahan"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("events")}
                        className="h-11 px-5 border border-[#e0e5f2] rounded-xl text-sm text-[#8F9BBA] font-medium hover:text-[#1B2559] hover:border-[#1B2559] transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </form>

                  {/* MODAL PERPANJANG DURASI MASA AKTIF */}
                  {showExtendModal && editingEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e0e5f2] space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#e0e5f2]">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-[#4318FF]/10 text-[#4318FF] flex items-center justify-center font-bold">
                              <IconClock size={16} />
                            </span>
                            <div>
                              <h3 className="text-base font-bold text-[#1B2559]">Perpanjang Masa Aktif</h3>
                              <p className="text-xs text-[#8F9BBA]">Tambah durasi akses photobooth untuk &quot;{editingEvent.title}&quot;</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowExtendModal(false)}
                            className="text-[#8F9BBA] hover:text-[#1B2559] p-1.5 rounded-lg hover:bg-[#f4f7fe] transition-colors"
                          >
                            <IconClose size={18} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-[#1B2559] uppercase tracking-wider">
                            Pilih Durasi Perpanjangan:
                          </label>

                          <div className="space-y-2.5">
                            {(["bronze", "silver", "gold"] as const).map((tierKey) => {
                              const pkg = VIRTUAL_BOOTH_PACKAGES[tierKey];
                              const isSelected = extendTierChoice === tierKey;
                              return (
                                <div
                                  key={tierKey}
                                  onClick={() => setExtendTierChoice(tierKey)}
                                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected
                                    ? "bg-[#f4f7fe] border-[#4318FF] ring-2 ring-[#4318FF]/20"
                                    : "bg-white border-[#e0e5f2] hover:border-[#4318FF]/40"
                                    }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-[#1B2559]">
                                        Paket {pkg.name} (+{pkg.durationDays} Hari)
                                      </span>
                                      {pkg.isRecommended && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFB547]/20 text-[#FFB547]">
                                          Populer
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-[#8F9BBA] mt-0.5">
                                      Akses live booth diperpanjang +{pkg.durationDays} hari real-time
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-extrabold text-[#1B2559]">
                                      {formatRupiah(pkg.price)}
                                    </div>
                                    <div className="text-[10px] text-[#4318FF] font-semibold">
                                      {isSelected ? "Terpilih" : "Pilih"}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <button
                            type="button"
                            disabled={isExtendingDuration}
                            onClick={() => handleExtendPackageDuration(extendTierChoice)}
                            className="flex-1 h-11 bg-[#4318FF] hover:bg-[#3311DB] disabled:bg-[#a3aed0] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                          >
                            {isExtendingDuration ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              `Konfirmasi (+${VIRTUAL_BOOTH_PACKAGES[extendTierChoice].durationDays} Hari)`
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowExtendModal(false)}
                            className="h-11 px-5 border border-[#e0e5f2] rounded-xl text-xs font-semibold text-[#8F9BBA] hover:text-[#1B2559] transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}


                </div>
              )}
            </div>
          )}

          {/* ═══════ TAB: BOOKINGS ═══════ */}
          {activeTab === "bookings" && (() => {
            const virtualBookingsCount = bookings.filter((b) => (b.booking_category || b.category || "virtual_photobooth") !== "photobooth").length;
            const photoboothBookingsCount = bookings.filter((b) => (b.booking_category || b.category || "virtual_photobooth") === "photobooth").length;
            const displayedBookings = bookings.filter((b) => {
              const cat = b.booking_category || b.category || "virtual_photobooth";
              if (bookingsCategoryFilter === "all") return true;
              return cat === bookingsCategoryFilter;
            });

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E0E5F2]">
                  <div>
                    <h2 className="text-lg font-bold text-[#1B2559]">Data Reservasi Klien</h2>
                    <p className="text-xs text-[#A3AED0] mt-0.5">
                      Data calon pelanggan dari formulir pemesanan online ({bookings.length} reservasi)
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        playTingSound();
                        if (bookings.length > 0) {
                          setNewBookingNotif(bookings[0]);
                        } else {
                          setNewBookingNotif({
                            id: "test-" + Date.now(),
                            customer_name: "Contoh Pelanggan Baru",
                            customer_email: "pelanggan@example.com",
                            customer_phone: "081234567890",
                            event_type: "wedding",
                            event_name: "Pernikahan Sarah & Rizky",
                            event_date: new Date().toISOString().split("T")[0],
                            location: "Gedung Simpurusiang",
                            city: "Palopo",
                            package_id: "pkg-silver",
                            package_name: "Paket Silver",
                            category: "virtual_photobooth",
                            booking_category: "virtual_photobooth",
                            status: "pending",
                            total_price: 350000,
                            created_at: new Date().toISOString(),
                          });
                        }
                      }}
                      className="h-9 px-3.5 rounded-xl border border-[#4318FF]/20 bg-[#F4F7FE] hover:bg-[#EAEFFA] text-xs font-bold text-[#4318FF] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Uji coba pop up window notifikasi dan suara 'ting'"
                    >
                      <IconBell size={14} />
                      <span>Tes Notifikasi ("Ting")</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => refreshBookings(false)}
                      disabled={isRefreshingBookings}
                      className="h-9 px-3.5 rounded-xl border border-[#E0E5F2] bg-white hover:bg-[#F4F7FE] text-xs font-semibold text-[#1B2559] transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Segarkan Data Reservasi"
                    >
                      <IconRefresh size={14} className={isRefreshingBookings ? "animate-spin" : ""} />
                      <span>{isRefreshingBookings ? "Memuat..." : "Segarkan Data"}</span>
                    </button>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setBookingsCategoryFilter("all")}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${bookingsCategoryFilter === "all"
                      ? "bg-[#4318FF] text-white shadow-md shadow-[#4318FF]/20"
                      : "bg-white text-[#707EAE] border border-[#E0E5F2] hover:bg-[#F4F7FE]"
                      }`}
                  >
                    <span>Semua Reservasi</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${bookingsCategoryFilter === "all" ? "bg-white/20 text-white" : "bg-[#F4F7FE] text-[#707EAE]"}`}>
                      {bookings.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingsCategoryFilter("virtual_photobooth")}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${bookingsCategoryFilter === "virtual_photobooth"
                      ? "bg-[#4318FF] text-white shadow-md shadow-[#4318FF]/20"
                      : "bg-white text-[#707EAE] border border-[#E0E5F2] hover:bg-[#F4F7FE]"
                      }`}
                  >
                    <span>Virtual Photobooth</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${bookingsCategoryFilter === "virtual_photobooth" ? "bg-white/20 text-white" : "bg-[#F4F7FE] text-[#707EAE]"}`}>
                      {virtualBookingsCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingsCategoryFilter("photobooth")}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${bookingsCategoryFilter === "photobooth"
                      ? "bg-[#4318FF] text-white shadow-md shadow-[#4318FF]/20"
                      : "bg-white text-[#707EAE] border border-[#E0E5F2] hover:bg-[#F4F7FE]"
                      }`}
                  >
                    <span>Photobooth Fisik</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${bookingsCategoryFilter === "photobooth" ? "bg-white/20 text-white" : "bg-[#F4F7FE] text-[#707EAE]"}`}>
                      {photoboothBookingsCount}
                    </span>
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center space-y-3 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] border border-transparent">
                    <div className="w-12 h-12 rounded-full bg-[#FFF6E9] flex items-center justify-center text-[#FFB547] mx-auto">
                      <IconBooking size={22} />
                    </div>
                    <div className="text-sm font-semibold text-[#1B2559]">
                      Belum Ada Data Reservasi
                    </div>
                    <p className="text-xs text-[#A3AED0] max-w-sm mx-auto">
                      Data formulir pemesanan yang diajukan oleh calon klien secara online akan otomatis tampil pada panel ini.
                    </p>
                  </div>
                ) : displayedBookings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center space-y-3 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] border border-transparent">
                    <div className="w-12 h-12 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#A3AED0] mx-auto">
                      <IconBooking size={22} />
                    </div>
                    <div className="text-sm font-semibold text-[#1B2559]">
                      Tidak Ada Data untuk Kategori Ini
                    </div>
                    <p className="text-xs text-[#A3AED0] max-w-sm mx-auto">
                      Tidak ditemukan reservasi dengan filter kategori yang dipilih.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] border border-transparent overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[820px]">
                      <thead className="border-b border-[#e0e5f2] bg-[#F4F7FE]">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Pemesan</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Kategori</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Acara &amp; Tanggal</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Paket &amp; Biaya</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Pembayaran DOKU</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider">Status Jadwal</th>
                          <th className="px-6 py-4 text-xs font-semibold text-[#a3aed0] uppercase tracking-wider text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e5f2]">
                        {displayedBookings.map((b) => {
                          const isDokuPaid = b.payment_status === "PAID";
                          const isPhotobooth = b.booking_category === "photobooth" || b.category === "photobooth";
                          return (
                            <tr key={b.id} className="hover:bg-[#f4f7fe]/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-[#1B2559]">{b.customer_name}</div>
                                <a
                                  href={`https://wa.me/${b.customer_phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#4318FF] hover:underline block mt-0.5"
                                >
                                  {b.customer_phone}
                                </a>
                              </td>
                              <td className="px-6 py-4">
                                {isPhotobooth ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#4318FF]/10 text-[#4318FF] border border-[#4318FF]/20 whitespace-nowrap">
                                    <span>Photobooth</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
                                    <span>Virtual</span>
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBookingDetail(b)}
                                  className="text-left w-full group/ev block focus:outline-none focus:ring-2 focus:ring-[#4318FF]/20 rounded-lg p-1.5 -m-1.5 hover:bg-[#4318FF]/5 transition-all cursor-pointer"
                                  title="Klik untuk melihat detail lengkap pesanan"
                                >
                                  <div className="text-sm font-bold text-[#1B2559] group-hover/ev:text-[#4318FF] transition-colors flex items-center gap-1.5">
                                    <span>{b.event_name}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4318FF]/10 text-[#4318FF] font-semibold opacity-0 group-hover/ev:opacity-100 transition-opacity whitespace-nowrap">
                                      Buka Detail
                                    </span>
                                  </div>
                                  <div className="text-xs text-[#a3aed0] mt-0.5">{formatDate(b.event_date)} ({formatTime(b.event_time)} WITA)</div>
                                  <div className="text-xs text-[#a3aed0]">{b.location}, {b.city}</div>
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-[#1B2559]">{b.package_name}</div>
                                <div className="text-sm font-semibold text-[#1B2559] mt-0.5">{formatRupiah(b.total_price)}</div>
                              </td>
                              <td className="px-6 py-4">
                                {isDokuPaid ? (
                                  <div className="space-y-1.5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e9faf4] text-[#01B574] border border-[#01B574]/20 shadow-xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#01B574] animate-pulse" />
                                      <span>Lunas DOKU</span>
                                    </span>
                                    <div className="text-[11px] font-mono text-[#707EAE]">
                                      {b.payment_method?.replace("DOKU_", "") || "QRIS Instant"}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedBookingProof(b)}
                                      className="px-2.5 py-1 rounded-lg bg-[#4318FF]/10 hover:bg-[#4318FF]/20 text-[#4318FF] font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                      </svg>
                                      <span>Lihat Struk DOKU</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fff6e9] text-[#FFB547] border border-[#FFB547]/20">
                                      <span>Menunggu Transfer</span>
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdatePaymentStatus(b.id, "PAID")}
                                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                        title="Tandai pembayaran ini telah lunas"
                                      >
                                        ✓ Tandai Lunas
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedBookingProof(b)}
                                        className="text-[11px] text-[#707EAE] hover:text-[#4318FF] underline transition-colors cursor-pointer"
                                        title="Lihat Pratinjau Struk Transaksi"
                                      >
                                        Cek Form DOKU
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium ${b.status === "confirmed"
                                  ? "bg-[#e9faf4] text-[#01B574]"
                                  : b.status === "pending"
                                    ? "bg-[#fff6e9] text-[#FFB547]"
                                    : "bg-[#f4f7fe] text-[#8F9BBA]"
                                  }`}>
                                  {b.status === "confirmed" ? "Dikonfirmasi" : b.status === "pending" ? "Menunggu" : "Dibatalkan"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBookingDetail(b)}
                                    className="h-8 px-2.5 rounded-lg bg-[#4318FF]/10 text-[#4318FF] text-xs font-semibold hover:bg-[#4318FF] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                                    title="Lihat Detail Lengkap Reservasi"
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <span>Detail</span>
                                  </button>
                                  {b.status !== "confirmed" && (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(b.id, "confirmed")}
                                      className="h-8 px-2.5 rounded-lg bg-[#e9faf4] text-[#01B574] text-xs font-medium hover:bg-[#01B574] hover:text-white transition-colors cursor-pointer"
                                    >
                                      Setujui
                                    </button>
                                  )}
                                  {b.status !== "cancelled" && (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(b.id, "cancelled")}
                                      className="h-8 px-2.5 rounded-lg bg-[#f4f7fe] text-[#8F9BBA] text-xs font-medium hover:bg-[#8F9BBA] hover:text-white transition-colors cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBooking(b.id)}
                                    className="h-8 px-2 rounded-lg text-xs font-medium text-[#A3AED0] hover:text-[#EE5D50] hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Hapus Data Reservasi"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ═══════ POPUP BUKTI / SCREENSHOT TRANSAKSI DOKU RESMI ═══════ */}
                {selectedBookingProof && (
                  <div
                    className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={() => setSelectedBookingProof(null)}
                  >
                    <div
                      className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E0E5F2] my-auto animate-in zoom-in-95 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Official DOKU Header Banner */}
                      <div className="bg-gradient-to-r from-[#D9222A] via-[#E52534] to-[#C01B22] p-5 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="bg-white text-[#D9222A] font-black px-2.5 py-1 rounded-lg text-sm tracking-wider shadow-sm">
                            DOKU
                          </div>
                          <div>
                            <div className="text-xs uppercase font-extrabold tracking-wider opacity-95">
                              Bukti Transaksi Resmi
                            </div>
                            <div className="text-[11px] opacity-85">RUANGTEMU Official Merchant</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedBookingProof(null)}
                          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Screenshot / Receipt Content */}
                      <div className="p-6 sm:p-7 text-center space-y-5">
                        {/* Verification Checkmark */}
                        <div className="relative w-20 h-20 mx-auto">
                          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-25" />
                        </div>

                        <div>
                          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>TRANSAKSI BERHASIL &amp; SETTLED</span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            Pembayaran DOKU Sukses
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Dana telah berhasil didebet dan terkonfirmasi otomatis oleh sistem gateway DOKU.
                          </p>
                        </div>

                        {/* Nominal Box */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Total Nominal Transaksi</span>
                          <span className="text-3xl font-black text-blue-950 font-mono block mt-0.5">
                            {formatRupiah(selectedBookingProof.payment_amount || selectedBookingProof.total_price)}
                          </span>
                          <span className="text-xs text-blue-600 font-semibold block mt-1">
                            Paket {selectedBookingProof.package_name}
                          </span>
                        </div>

                        {/* Detailed Receipt Table */}
                        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 text-left">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-slate-500">Kategori Layanan</span>
                            <span className="font-bold text-slate-900">
                              {selectedBookingProof.booking_category === "photobooth" || selectedBookingProof.category === "photobooth"
                                ? "Photobooth Fisik"
                                : "Virtual Photobooth"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-slate-500">Nomor Invoice</span>
                            <span className="font-mono font-bold text-slate-900">
                              {selectedBookingProof.payment_invoice || `INV-DOKU-${selectedBookingProof.id.slice(-6).toUpperCase()}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-slate-500">Metode Pembayaran</span>
                            <span className="font-bold text-slate-900">
                              {selectedBookingProof.payment_method
                                ? selectedBookingProof.payment_method.replace("DOKU_", "DOKU ")
                                : "DOKU QRIS Instant / VA"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-slate-500">Waktu Pembayaran</span>
                            <span className="font-mono text-slate-800">
                              {formatIndonesianDateTime(selectedBookingProof.payment_paid_at || selectedBookingProof.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-slate-500">Nama Pemesan</span>
                            <span className="font-bold text-slate-900">{selectedBookingProof.customer_name}</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-slate-500">WhatsApp Pemesan</span>
                            <span className="font-mono text-slate-800">{selectedBookingProof.customer_phone}</span>
                          </div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-slate-500">Nama Acara</span>
                            <span className="font-bold text-slate-900">{selectedBookingProof.event_name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Tanggal Acara</span>
                            <span className="font-mono text-slate-800">
                              {formatDate(selectedBookingProof.event_date)} ({formatTime(selectedBookingProof.event_time)} WITA)
                            </span>
                          </div>
                        </div>

                        {/* Verification Footer Stamp */}
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center justify-center gap-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-600 shrink-0">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <span>Struk ini sah dari DOKU Merchant Gateway RUANGTEMU</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBookingProof(null)}
                            className="flex-1 min-h-[44px] px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                          >
                            Tutup
                          </button>
                          <a
                            href={`https://wa.me/${selectedBookingProof.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Halo Kak ${selectedBookingProof.customer_name}! Pembayaran Anda untuk reservasi photobooth RUANGTEMU acara "${selectedBookingProof.event_name}" sebesar ${formatRupiah(
                                selectedBookingProof.payment_amount || selectedBookingProof.total_price
                              )} via DOKU (${selectedBookingProof.payment_invoice || "LUNAS"}) telah KAMI TERIMA & TERKONFIRMASI LUNAS. Terima kasih!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-h-[44px] px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span>Kirim Konfirmasi WA</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══════ MODAL DETAIL LENGKAP RESERVASI & INPUT EVENT BARU ═══════ */}
                {selectedBookingDetail && (
                  <div
                    className="fixed inset-0 z-[99999] bg-[#0B1021]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setSelectedBookingDetail(null);
                    }}
                  >
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-[0_24px_50px_rgba(11,16,33,0.2)] border border-[#E0E5F2] my-8 relative animate-in zoom-in-95 duration-200 text-left">
                      {/* Close button */}
                      <button
                        type="button"
                        onClick={() => setSelectedBookingDetail(null)}
                        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F4F7FE] hover:bg-[#E0E5F2] text-[#8F9BBA] hover:text-[#1B2559] flex items-center justify-center transition-colors cursor-pointer"
                        title="Tutup Modal"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>

                      {/* Header with Badges */}
                      <div className="space-y-3 pb-5 border-b border-[#E0E5F2]">
                        <div className="flex items-center gap-2 flex-wrap">
                          {(selectedBookingDetail.booking_category === "photobooth" || selectedBookingDetail.category === "photobooth") ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4318FF]/10 text-[#4318FF] border border-[#4318FF]/20">
                              <span>Photobooth Fisik di Lokasi</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              <span>Virtual Photobooth Smartphone</span>
                            </span>
                          )}

                          {selectedBookingDetail.payment_status === "PAID" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e9faf4] text-[#01B574] border border-[#01B574]/20">
                              <span className="w-2 h-2 rounded-full bg-[#01B574] animate-pulse" />
                              <span>Lunas DOKU</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff6e9] text-[#FFB547] border border-[#FFB547]/20">
                              <span>Menunggu Transfer</span>
                            </span>
                          )}

                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedBookingDetail.status === "confirmed"
                            ? "bg-[#e9faf4] text-[#01B574]"
                            : selectedBookingDetail.status === "pending"
                              ? "bg-[#fff6e9] text-[#FFB547]"
                              : "bg-[#f4f7fe] text-[#8F9BBA]"
                            }`}>
                            Jadwal: {selectedBookingDetail.status === "confirmed" ? "Dikonfirmasi" : selectedBookingDetail.status === "pending" ? "Menunggu Verifikasi" : "Dibatalkan"}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-[#1B2559] tracking-tight">
                            {selectedBookingDetail.event_name}
                          </h3>
                          <p className="text-xs text-[#707EAE] mt-1">
                            Dipesan pada: {formatIndonesianDateTime(selectedBookingDetail.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Content Details Grid */}
                      <div className="py-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Detail Acara & Waktu */}
                          <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2] space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4318FF]">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              <span>Jadwal &amp; Lokasi Acara</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between py-1 border-b border-[#E0E5F2]/60">
                                <span className="text-[#8F9BBA]">Tanggal Acara:</span>
                                <span className="font-semibold text-[#1B2559]">{formatDate(selectedBookingDetail.event_date)}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#E0E5F2]/60">
                                <span className="text-[#8F9BBA]">Waktu / Jam:</span>
                                <span className="font-semibold text-[#1B2559]">
                                  {selectedBookingDetail.event_time ? `${formatTime(selectedBookingDetail.event_time)} WITA` : "Sesuai Jadwal"}
                                </span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#E0E5F2]/60">
                                <span className="text-[#8F9BBA]">Jenis Acara:</span>
                                <span className="font-semibold text-[#1B2559] capitalize">{selectedBookingDetail.event_type || "Event"}</span>
                              </div>
                              <div className="flex justify-between py-1">
                                <span className="text-[#8F9BBA]">Lokasi / Gedung:</span>
                                <span className="font-semibold text-[#1B2559] text-right max-w-[200px]">
                                  {selectedBookingDetail.location}, {selectedBookingDetail.city}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Data Pemesan & Kontak */}
                          <div className="p-4 rounded-2xl bg-[#F4F7FE] border border-[#E0E5F2] space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4318FF]">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              <span>Data Klien / Pemesan</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between py-1 border-b border-[#E0E5F2]/60">
                                <span className="text-[#8F9BBA]">Nama Klien:</span>
                                <span className="font-bold text-[#1B2559]">{selectedBookingDetail.customer_name}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#E0E5F2]/60 items-center">
                                <span className="text-[#8F9BBA]">Nomor WhatsApp:</span>
                                <a
                                  href={`https://wa.me/${selectedBookingDetail.customer_phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-[#01B574] hover:underline flex items-center gap-1"
                                >
                                  <span>{selectedBookingDetail.customer_phone}</span>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                </a>
                              </div>
                              <div className="flex justify-between py-1 border-b border-[#E0E5F2]/60">
                                <span className="text-[#8F9BBA]">Email:</span>
                                <span className="font-semibold text-[#1B2559]">{selectedBookingDetail.customer_email || "-"}</span>
                              </div>
                              <div className="flex justify-between py-1">
                                <span className="text-[#8F9BBA]">ID Reservasi:</span>
                                <span className="font-mono text-[#707EAE] text-[11px] truncate max-w-[170px]" title={selectedBookingDetail.id}>
                                  {selectedBookingDetail.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Paket & Info Transaksi DOKU */}
                        <div className="p-4 rounded-2xl bg-white border border-[#E0E5F2] shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B2559]">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#4318FF]">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                              </svg>
                              <span>Paket &amp; Rincian Pembayaran</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-[#8F9BBA]">Total Biaya: </span>
                              <span className="text-base font-extrabold text-[#1B2559]">{formatRupiah(selectedBookingDetail.total_price)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-[#F4F7FE]">
                              <div className="text-[11px] text-[#8F9BBA]">Pilihan Paket</div>
                              <div className="font-bold text-[#1B2559] mt-0.5">{selectedBookingDetail.package_name || "-"}</div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#F4F7FE]">
                              <div className="text-[11px] text-[#8F9BBA]">Metode Bayar</div>
                              <div className="font-bold text-[#1B2559] mt-0.5">{selectedBookingDetail.payment_method?.replace("DOKU_", "") || "QRIS / DOKU"}</div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#F4F7FE]">
                              <div className="text-[11px] text-[#8F9BBA]">Invoice DOKU</div>
                              <div className="font-mono font-semibold text-[#4318FF] mt-0.5 truncate" title={selectedBookingDetail.payment_invoice || "-"}>
                                {selectedBookingDetail.payment_invoice || "-"}
                              </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#F4F7FE]">
                              <div className="text-[11px] text-[#8F9BBA]">Status DOKU</div>
                              <div className={`font-bold mt-0.5 ${selectedBookingDetail.payment_status === "PAID" ? "text-[#01B574]" : "text-[#FFB547]"}`}>
                                {selectedBookingDetail.payment_status === "PAID" ? "Lunas" : "Menunggu"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Catatan Klien jika ada */}
                        {selectedBookingDetail.notes && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-amber-800">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                              <span>Catatan Khusus dari Klien:</span>
                            </div>
                            <p className="pl-5 italic leading-relaxed text-amber-950 font-medium">
                              &ldquo;{selectedBookingDetail.notes}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Modal Actions */}
                      <div className="pt-4 border-t border-[#E0E5F2] flex flex-col sm:flex-row gap-3">
                        {/* Primary CTA: Input Event Baru dari Reservasi Ini */}
                        <button
                          type="button"
                          onClick={() => handleCreateEventFromBooking(selectedBookingDetail)}
                          className="flex-1 min-h-[46px] px-6 rounded-xl bg-[#4318FF] hover:bg-[#3311DB] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4318FF]/20 transition-all cursor-pointer active:scale-98"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Input Event Baru dari Reservasi Ini</span>
                        </button>

                        {/* Secondary Actions */}
                        <div className="flex items-center gap-2">
                          {selectedBookingDetail.payment_status === "PAID" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBookingProof(selectedBookingDetail);
                              }}
                              className="min-h-[46px] px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              <span>Struk DOKU</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdatePaymentStatus(selectedBookingDetail.id, "PAID");
                                setSelectedBookingDetail({
                                  ...selectedBookingDetail,
                                  payment_status: "PAID",
                                  status: "confirmed",
                                });
                              }}
                              className="min-h-[46px] px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>✓ Tandai Lunas</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedBookingDetail(null)}
                            className="min-h-[46px] px-5 rounded-xl bg-[#F4F7FE] hover:bg-[#E0E5F2] text-[#1B2559] font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Tutup
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ═══════ TAB: GALLERY ═══════ */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E0E5F2]">
                <div>
                  <h2 className="text-lg font-bold text-[#1B2559]">Galeri Foto Tamu Seluruh Acara</h2>
                  <p className="text-xs text-[#A3AED0] mt-0.5">
                    Menampilkan {galleryEventFilter === "all" ? entries.length : entries.filter((e) => e.event_id === galleryEventFilter || e.event_slug === galleryEventFilter).length} foto dari {galleryEventFilter === "all" ? "semua event" : "event terpilih"} secara real-time.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Event Filter Dropdown */}
                  <select
                    value={galleryEventFilter}
                    onChange={(e) => setGalleryEventFilter(e.target.value)}
                    className="h-9 px-3 bg-white border border-[#E0E5F2] rounded-xl text-xs font-semibold text-[#1B2559] outline-none focus:border-[#4318FF] transition-colors"
                  >
                    <option value="all">Semua Event ({entries.length} Foto)</option>
                    {events.map((evt) => {
                      const count = entries.filter((e) => e.event_id === evt.id || e.event_slug === evt.slug).length;
                      return (
                        <option key={evt.id} value={evt.id}>
                          {evt.title} ({count})
                        </option>
                      );
                    })}
                  </select>

                  {/* Refresh Button */}
                  <button
                    type="button"
                    onClick={refreshEntries}
                    disabled={isRefreshingGallery}
                    className="h-9 px-3.5 rounded-xl border border-[#E0E5F2] bg-white hover:bg-[#F4F7FE] text-xs font-semibold text-[#1B2559] transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Segarkan Foto Terbaru"
                  >
                    <IconRefresh size={14} className={isRefreshingGallery ? "animate-spin" : ""} />
                    <span>{isRefreshingGallery ? "Memuat..." : "Segarkan"}</span>
                  </button>
                </div>
              </div>

              {(() => {
                const displayedEntries = galleryEventFilter === "all"
                  ? entries
                  : entries.filter((e) => e.event_id === galleryEventFilter || e.event_slug === galleryEventFilter);

                if (displayedEntries.length === 0) {
                  return (
                    <div className="bg-white rounded-2xl p-12 text-center space-y-3 shadow-[0_18px_40px_0_rgba(112,144,176,0.06)]">
                      <div className="w-12 h-12 rounded-full bg-[#F4F7FE] flex items-center justify-center text-[#A3AED0] mx-auto">
                        <IconImage size={22} />
                      </div>
                      <div className="text-sm font-semibold text-[#1B2559]">
                        Belum Ada Foto Tamu
                      </div>
                      <p className="text-xs text-[#A3AED0] max-w-sm mx-auto">
                        {galleryEventFilter === "all"
                          ? "Foto dari seluruh acara yang diambil tamu melalui virtual photobooth akan otomatis tampil di panel galeri ini."
                          : "Belum ada foto yang diunggah tamu untuk acara ini."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {displayedEntries.map((ent) => {
                      const evt = getEventForEntry(ent);
                      return (
                        <div key={ent.id} className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-[0_18px_40px_0_rgba(112,144,176,0.06)] border border-transparent">
                          <div className="p-3 bg-[#F4F7FE] flex justify-center relative group min-h-[200px] items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ent.photo_url} alt={ent.guest_name} className="max-h-56 object-contain rounded-lg" />
                            <a
                              href={ent.photo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
                            >
                              <IconExternalLink size={14} /> Lihat Foto Penuh
                            </a>
                          </div>
                          <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              {evt && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAEFFA] text-[#4318FF] text-[10px] font-semibold truncate max-w-full" title={evt.title}>
                                  <IconCalendar size={11} />
                                  <span className="truncate">{evt.title}</span>
                                </div>
                              )}
                              <div className="text-sm font-bold text-[#1B2559]">{ent.guest_name}</div>
                              {ent.message && (
                                <p className="text-xs text-[#8F9BBA] italic leading-relaxed">&ldquo;{ent.message}&rdquo;</p>
                              )}
                              {ent.voice_note_url && (
                                <div className="pt-1">
                                  <audio src={ent.voice_note_url} controls className="w-full h-8" />
                                </div>
                              )}
                            </div>
                            <div className="pt-3 flex items-center justify-between border-t border-[#E0E5F2] mt-2">
                              <span className="text-[11px] text-[#A3AED0]">{formatDate(ent.created_at)}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(ent.id)}
                                className="text-xs text-[#A3AED0] hover:text-[#EE5D50] font-medium transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ═══════ TAB: PACKAGES ═══════ */}
          {activeTab === "packages" && (() => {
            const virtualCount = initialPackages.filter((p) => p.category === "virtual").length;
            const physicalCount = initialPackages.filter((p) => p.category === "physical").length;
            const filteredPackages = initialPackages.filter((pkg) => {
              if (packagesCategoryFilter === "all") return true;
              if (packagesCategoryFilter === "virtual_photobooth") return pkg.category === "virtual";
              if (packagesCategoryFilter === "photobooth") return pkg.category === "physical";
              return true;
            });

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E0E5F2]">
                  <div>
                    <h2 className="text-lg font-bold text-[#1B2559]">Katalog Paket Layanan RUANGTEMU</h2>
                    <p className="text-xs text-[#A3AED0] mt-0.5">
                      Price list resmi RUANGTEMU Photobooth &amp; Virtual Photobooth Palopo (Aktif untuk aktivasi event)
                    </p>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setPackagesCategoryFilter("all")}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${packagesCategoryFilter === "all"
                      ? "bg-[#4318FF] text-white shadow-md shadow-[#4318FF]/20"
                      : "bg-white text-[#707EAE] border border-[#E0E5F2] hover:bg-[#F4F7FE]"
                      }`}
                  >
                    <span>Semua Paket</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${packagesCategoryFilter === "all" ? "bg-white/20 text-white" : "bg-[#F4F7FE] text-[#707EAE]"}`}>
                      {initialPackages.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackagesCategoryFilter("virtual_photobooth")}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${packagesCategoryFilter === "virtual_photobooth"
                      ? "bg-[#4318FF] text-white shadow-md shadow-[#4318FF]/20"
                      : "bg-white text-[#707EAE] border border-[#E0E5F2] hover:bg-[#F4F7FE]"
                      }`}
                  >
                    <span>Virtual Photobooth</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${packagesCategoryFilter === "virtual_photobooth" ? "bg-white/20 text-white" : "bg-[#F4F7FE] text-[#707EAE]"}`}>
                      {virtualCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackagesCategoryFilter("photobooth")}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${packagesCategoryFilter === "photobooth"
                      ? "bg-[#4318FF] text-white shadow-md shadow-[#4318FF]/20"
                      : "bg-white text-[#707EAE] border border-[#E0E5F2] hover:bg-[#F4F7FE]"
                      }`}
                  >
                    <span>Photobooth Fisik</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${packagesCategoryFilter === "photobooth" ? "bg-white/20 text-white" : "bg-[#F4F7FE] text-[#707EAE]"}`}>
                      {physicalCount}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPackages.map((pkg) => {
                    const isPhysical = pkg.category === "physical";
                    const durationLabel = isPhysical
                      ? `${pkg.duration_hours} Jam Layanan`
                      : `${Math.round(pkg.duration_hours / 24)} Hari Akses`;

                    return (
                      <div
                        key={pkg.id}
                        className={`bg-white rounded-2xl p-6 space-y-5 relative flex flex-col justify-between transition-all ${pkg.popular
                          ? "border-2 border-[#4318FF] shadow-[0_20px_50px_0_rgba(67,24,255,0.12)]"
                          : "border border-[#E0E5F2] shadow-[0_18px_40px_0_rgba(112,144,176,0.06)]"
                          }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#4318FF] text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-md flex items-center gap-1">
                            <IconStar size={11} /> RECOMMENDED
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-[#1B2559]">{pkg.name}</h3>
                                {isPhysical ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4318FF]/10 text-[#4318FF] border border-[#4318FF]/20">
                                    <span>Photobooth Fisik</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                                    <span>Virtual Booth</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#A3AED0] mt-1.5 leading-relaxed">{pkg.tagline}</p>
                            </div>
                          </div>

                          <div className="py-3 px-4 rounded-xl bg-[#F4F7FE] flex items-baseline justify-between">
                            <span className="text-xs text-[#8F9BBA] font-medium">Investasi Paket:</span>
                            <span className="text-xl font-black text-[#1B2559] font-mono">
                              {formatRupiah(pkg.price)}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-[#8F9BBA]">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#01B574]" />
                              <span>Durasi Layanan: <strong>{durationLabel}</strong></span>
                            </div>
                            {pkg.prints_included && (
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4318FF]" />
                                <span>Output Cetak: <strong>{pkg.prints_included}</strong></span>
                              </div>
                            )}
                            {pkg.backdrop && (
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB547]" />
                                <span>Backdrop / Template: <strong>{pkg.backdrop}</strong></span>
                              </div>
                            )}
                          </div>

                          <ul className="space-y-2.5 border-t border-[#E0E5F2] pt-4">
                            {pkg.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs text-[#8F9BBA]">
                                <div className="w-4 h-4 rounded-full bg-[#E9FAF4] text-[#01B574] flex items-center justify-center shrink-0 mt-0.5">
                                  <IconCheck size={11} />
                                </div>
                                <span className="leading-snug text-[#1B2559] font-medium">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-3 border-t border-[#E0E5F2]">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingEvent(true);
                              setActiveTab("events");
                              if (isPhysical) {
                                setNewEvent((prev) => ({ ...prev, category: "photobooth" }));
                              } else {
                                setNewEvent((prev) => ({ ...prev, category: "virtual_photobooth" }));
                                const matchingKey = pkg.slug.includes("bronze") ? "bronze" : pkg.slug.includes("gold") ? "gold" : "silver";
                                setSelectedPackage(matchingKey);
                              }
                            }}
                            className={`w-full min-h-[44px] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center ${pkg.popular
                              ? "bg-[#4318FF] hover:bg-[#3311DB] text-white shadow-sm"
                              : "bg-[#F4F7FE] hover:bg-[#EAEFFA] text-[#1B2559]"
                              }`}
                          >
                            Pilih Paket untuk Event Baru
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </main>
      </div>

      {/* ──────── MODAL PENGATURAN MODE PEMELIHARAAN (MAINTENANCE) ──────── */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E0E5F2] space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E0E5F2]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isMaintenanceMode
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    }`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1B2559]">
                    Pengaturan Mode Pemeliharaan
                  </h3>
                  <p className="text-xs text-[#A3AED0]">
                    Kontrol akses publik pengunjung ke seluruh halaman website
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8F9BBA] hover:bg-[#F4F7FE] hover:text-[#1B2559] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Current Status Box */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${isMaintenanceMode
                ? "bg-amber-500/10 border-amber-500/30 text-amber-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full ${isMaintenanceMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                    }`}
                />
                <div>
                  <span className="text-xs font-bold block">
                    {isMaintenanceMode ? "Status: Mode Pemeliharaan AKTIF" : "Status: Situs Normal (ONLINE)"}
                  </span>
                  <span className="text-[11px] opacity-80 block">
                    {isMaintenanceMode
                      ? "Pengunjung umum dialihkan ke halaman /maintenance"
                      : "Semua pengunjung dapat mengakses website secara penuh"}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${isMaintenanceMode ? "bg-amber-500 text-slate-950" : "bg-emerald-500 text-white"
                  }`}
              >
                {isMaintenanceMode ? "MAINTENANCE" : "ONLINE"}
              </span>
            </div>

            {/* Explanatory Note */}
            <div className="space-y-2 text-xs text-[#1B2559]">
              <p>
                {isMaintenanceMode
                  ? "Saat mode pemeliharaan dimatikan, website akan langsung kembali normal untuk seluruh pengunjung publik tanpa perlu deploy ulang."
                  : "Ketika diaktifkan, seluruh pengunjung website (halaman utama, booking, photobooth virtual, dll) tidak dapat mengakses website dan akan diarahkan ke halaman pemeliharaan."}
              </p>
              <div className="p-3 bg-[#F4F7FE] rounded-xl text-[11px] text-[#707EAE] leading-relaxed">
                <strong className="text-[#1B2559] font-semibold">Akses Admin:</strong> Panel admin ini (/admin) selalu dapat diakses sehingga Anda dapat mengembalikan website ke mode online kapan saja. Seluruh halaman publik (halaman depan, booking, galeri, event photobooth) akan langsung diarahkan ke halaman pemeliharaan.
              </div>
            </div>

            {/* Custom Message Field (Only if turning on or editing) */}
            {!isMaintenanceMode && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1B2559]">
                  Pesan Pemeliharaan untuk Pengunjung (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Website RUANGTEMU saat ini sedang dalam peningkatan performa berkala..."
                  className="w-full p-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-xs text-[#1B2559] placeholder:text-[#A3AED0] outline-none focus:border-[#4318FF] transition-colors resize-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E0E5F2]">
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(false)}
                className="h-10 px-4 rounded-xl border border-[#E0E5F2] text-xs font-semibold text-[#8F9BBA] hover:text-[#1B2559] hover:bg-[#F4F7FE] transition-colors cursor-pointer"
              >
                Batal
              </button>

              {isMaintenanceMode ? (
                <button
                  type="button"
                  disabled={isLoadingMaintenance}
                  onClick={() => handleToggleMaintenance(false)}
                  className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {isLoadingMaintenance ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  <span>Kembalikan ke Mode Normal (Online)</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isLoadingMaintenance}
                  onClick={() => handleToggleMaintenance(true)}
                  className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {isLoadingMaintenance ? (
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  <span>Aktifkan Mode Pemeliharaan Sekarang</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ POP UP NOTIFIKASI PESANAN BARU (POJOK KANAN BAWAH) ════════ */}
      {newBookingNotif && (
        <aside
          aria-label="Notifikasi Pesanan Layanan Baru"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] max-w-[410px] w-[calc(100vw-32px)] transition-all transform animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E0E5F2] text-[#1B2559] shadow-[0_20px_45px_rgba(27,37,89,0.14)]">
            {/* Top signature brand accent stripe */}
            <div className="h-1 w-full bg-[#4318FF]" />

            <div className="p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#F4F7FE] text-[#4318FF] border border-[#E0E5F2] shrink-0">
                    <IconBell size={19} />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01B574] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#01B574]" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#4318FF]">
                        Pesanan Baru Masuk
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E9FAF4] text-[#01B574]">
                        Baru
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-[#1B2559] tracking-tight truncate mt-0.5">
                      {newBookingNotif.customer_name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#8F9BBA] shrink-0">
                  {/* Replay ting SFX button */}
                  <button
                    type="button"
                    onClick={() => playTingSound()}
                    title="Putar ulang suara notifikasi"
                    aria-label="Putar ulang suara notifikasi"
                    className="p-1.5 rounded-lg hover:bg-[#F4F7FE] hover:text-[#4318FF] transition-colors cursor-pointer"
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  </button>
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setNewBookingNotif(null)}
                    title="Tutup notifikasi"
                    aria-label="Tutup notifikasi"
                    className="p-1.5 rounded-lg hover:bg-[#F4F7FE] hover:text-[#1B2559] transition-colors cursor-pointer"
                  >
                    <IconClose size={16} />
                  </button>
                </div>
              </div>

              {/* Detail Card */}
              <div className="mt-3.5 p-3.5 rounded-xl bg-[#F4F7FE] border border-[#E0E5F2] space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#1B2559] truncate text-xs sm:text-sm">
                    {newBookingNotif.event_name || "Acara Klien"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shrink-0 border ${(newBookingNotif.category || newBookingNotif.booking_category) === "photobooth"
                      ? "bg-[#FFF6E9] text-[#FFB547] border-[#FFE1B5]"
                      : "bg-[#EEF2FF] text-[#4318FF] border-[#C7D2FE]"
                      }`}
                  >
                    {(newBookingNotif.category || newBookingNotif.booking_category) === "photobooth"
                      ? "Photobooth Fisik"
                      : "Virtual Photobooth"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E0E5F2]/80 text-[11px]">
                  <div>
                    <span className="text-[#8F9BBA] block text-[10px] font-medium">Paket Layanan:</span>
                    <span className="font-semibold text-[#1B2559] truncate block mt-0.5">
                      {newBookingNotif.package_name || "Paket Layanan"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8F9BBA] block text-[10px] font-medium">Estimasi Total:</span>
                    <span className="font-bold text-[#01B574] truncate block mt-0.5">
                      {formatRupiah(newBookingNotif.total_price)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#707EAE] flex items-center gap-1.5 pt-1 border-t border-[#E0E5F2]/60">
                  <span className="shrink-0 text-[#8F9BBA] inline-flex items-center">
                    <IconCalendar size={13} />
                  </span>
                  <span className="font-medium">{formatDate(newBookingNotif.event_date)}</span>
                  <span className="text-[#A3AED0]">•</span>
                  <span className="truncate">{newBookingNotif.location || newBookingNotif.city}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("bookings");
                    setSelectedBookingDetail(newBookingNotif);
                    setNewBookingNotif(null);
                  }}
                  className="flex-1 h-10 px-4 rounded-xl bg-[#4318FF] hover:bg-[#3311DB] text-white text-xs font-bold transition-all shadow-[0_4px_12px_rgba(67,24,255,0.2)] hover:shadow-[0_6px_16px_rgba(67,24,255,0.3)] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4318FF]/40"
                >
                  <span>Buka Reservasi</span>
                  <IconBooking size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setNewBookingNotif(null)}
                  className="h-10 px-4 rounded-xl bg-[#F4F7FE] hover:bg-[#E0E5F2] text-[#1B2559] text-xs font-semibold transition-colors cursor-pointer border border-[#E0E5F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2559]/20"
                >
                  Tutup
                </button>
              </div>

              {/* Auto dismiss countdown bar */}
              <div className="mt-3.5 h-1 w-full bg-[#E0E5F2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4318FF] rounded-full"
                  style={{
                    animation: "ruangtemuShrinkWidth 14s linear forwards",
                  }}
                />
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Inline style for keyframes animation */}
      <style>{`
        @keyframes ruangtemuShrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
