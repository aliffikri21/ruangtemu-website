"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { EventItem, FrameConfig, FrameType, CameraFilter } from "@/types";
import {
  renderPhotoboothFrame,
  applyFilterToContext,
  isCanvasFilterSupported,
  applyPixelFilter,
} from "@/lib/frame-canvas";
import { VoiceNoteRecorder } from "@/lib/audio";
import {
  LandingPageView,
  GuestNamePageView,
  resolveLandingThemeConfig,
} from "@/lib/theme-config";
import { formatDate } from "@/lib/utils";

interface VirtualBoothProps {
  event: EventItem;
}

type Step = "welcome" | "name_input" | "frame_select" | "camera" | "preview" | "guestbook" | "finished";

type CameraState = "idle" | "requesting" | "ready" | "countdown" | "capturing" | "processing" | "complete" | "error";

const FRAME_TEMPLATES: { type: FrameType; name: string; shots: number; description: string }[] = [
  { type: "strip_3", name: "Photo Strip", shots: 3, description: "3 foto vertikal klasik" },
  { type: "grid_4", name: "Grid Kolase", shots: 4, description: "4 foto format 2×2" },
  { type: "polaroid", name: "Polaroid", shots: 1, description: "1 foto bergaya vintage" },
  { type: "deluxe", name: "Portrait Duo", shots: 2, description: "2 foto vertikal elegan" },
];

const FILTERS: { id: CameraFilter; name: string }[] = [
  { id: "normal", name: "Natural" },
  { id: "soft-glow", name: "Soft" },
  { id: "warm-vintage", name: "Warm" },
  { id: "cool-cinema", name: "Cinema" },
  { id: "grayscale", name: "Mono" },
  { id: "sepia", name: "Sepia" },
];

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatIndonesianFullDate(dateInput?: string | Date | number): string {
  if (!dateInput) return "";
  try {
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoMatch) {
        const [, y, m, d] = isoMatch;
        const yearNum = parseInt(y, 10);
        const monthNum = parseInt(m, 10);
        const dayNum = parseInt(d, 10);
        const dateObj = new Date(yearNum, monthNum - 1, dayNum);
        return `${DAYS_ID[dateObj.getDay()]}, ${dayNum} ${MONTHS_ID[monthNum - 1]} ${yearNum}`;
      }
      const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dmyMatch) {
        const [, d, m, y] = dmyMatch;
        const yearNum = parseInt(y, 10);
        const monthNum = parseInt(m, 10);
        const dayNum = parseInt(d, 10);
        const dateObj = new Date(yearNum, monthNum - 1, dayNum);
        return `${DAYS_ID[dateObj.getDay()]}, ${dayNum} ${MONTHS_ID[monthNum - 1]} ${yearNum}`;
      }
    }
    const d = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    const dayName = DAYS_ID[d.getDay()];
    const dateNum = d.getDate();
    const monthName = MONTHS_ID[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  } catch {
    return String(dateInput);
  }
}

function isLightHex(color?: string): boolean {
  if (!color) return false;
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

function formatIndonesianDateUpper(dateInput?: string | Date | number): string {
  if (!dateInput) return "";
  try {
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoMatch) {
        const [, y, m, d] = isoMatch;
        const monthNum = parseInt(m, 10);
        return `${parseInt(d, 10)} ${MONTHS_ID[monthNum - 1].toUpperCase()} ${y}`;
      }
      const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dmyMatch) {
        const [, d, m, y] = dmyMatch;
        const monthNum = parseInt(m, 10);
        return `${parseInt(d, 10)} ${MONTHS_ID[monthNum - 1].toUpperCase()} ${y}`;
      }
    }
    const d = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput).toUpperCase();
    const dateNum = d.getDate();
    const monthName = MONTHS_ID[d.getMonth()].toUpperCase();
    const year = d.getFullYear();
    return `${dateNum} ${monthName} ${year}`;
  } catch {
    return String(dateInput).toUpperCase();
  }
}

export function VirtualBooth({ event }: VirtualBoothProps) {
  const isNurulIqraWedding =
    event.slug === "iqranurul-wedding" ||
    event.slug.toLowerCase().includes("nurul") ||
    event.title.toLowerCase().includes("nurul");

  const isIlvaRickyWedding =
    event.slug === "ilvaricky-wedding" ||
    event.slug.toLowerCase().includes("ilva") ||
    event.title.toLowerCase().includes("ilva");

  const isJayaRikaWedding =
    event.slug === "jayarika-wedding" ||
    event.slug.toLowerCase().includes("jayarika") ||
    event.slug.toLowerCase().includes("jaya") ||
    event.title.toLowerCase().includes("jaya");

  const isCustomWedding = isIlvaRickyWedding || isJayaRikaWedding;

  const customCoupleName = isJayaRikaWedding
    ? "Jaya & Rika"
    : isIlvaRickyWedding
      ? "Ilva & Ricky"
      : (event.host_name || event.title);

  const customDateText = isJayaRikaWedding
    ? "12/10/2026"
    : isIlvaRickyWedding
      ? "08/10/2026"
      : (event.date ? formatDate(event.date) : "05/10/2026");

  const customVenueText = isJayaRikaWedding
    ? "D'Twins Cafe"
    : isIlvaRickyWedding
      ? "Gedung Opu Daeng Risadju"
      : event.venue;

  const customBgImage = isJayaRikaWedding
    ? "/images/events/bg-jayarika.png"
    : "/images/events/ilvaricky-bg.jpeg";

  const themeConfig = resolveLandingThemeConfig(event.theme_config, event);

  const rawHeaderLeft = themeConfig.header?.left?.trim() || "The Wedding";
  const desktopBadgeText =
    rawHeaderLeft.toLowerCase().includes("wedding") && !rawHeaderLeft.toLowerCase().includes("of")
      ? `${rawHeaderLeft} of`
      : rawHeaderLeft;

  const desktopCoupleTitle =
    themeConfig.title?.text?.trim() ||
    customCoupleName ||
    event.host_name ||
    event.title;

  const desktopFont = themeConfig.title?.font || "Great Vibes";
  const isScriptFont = ["great vibes", "allura", "dancing script"].some((f) =>
    desktopFont.toLowerCase().includes(f)
  );

  const rawDate = event.date || themeConfig.info?.line1 || "2025-12-24";
  const desktopFormattedDate =
    formatIndonesianFullDate(rawDate) || customDateText || formatDate(rawDate);

  const desktopVenue =
    event.venue
      ? `${event.venue}${event.city ? `, ${event.city}` : ""}`
      : themeConfig.info?.line2 || customVenueText || "";

  const desktopBgPhoto =
    themeConfig.background?.image ||
    event.cover_image_url ||
    event.cover_image ||
    customBgImage ||
    "";

  // Event Primary Color Resolution (matches Landing Page primary CTA color & event accent)
  const rawCtaBg = themeConfig?.cta1?.bg?.trim();
  const rawCtaIconBg = themeConfig?.cta1?.iconBg?.trim();
  const rawAccent = themeConfig?.layout?.accent?.trim();

  let eventPrimaryColor = isNurulIqraWedding
    ? "#ad0d0d"
    : isJayaRikaWedding
      ? "#224DA5"
      : isIlvaRickyWedding
        ? "#3a716c"
        : "#801823";

  if (rawCtaBg && !isLightHex(rawCtaBg)) {
    eventPrimaryColor = rawCtaBg;
  } else if (rawCtaIconBg && !isLightHex(rawCtaIconBg)) {
    eventPrimaryColor = rawCtaIconBg;
  } else if (rawAccent && !isLightHex(rawAccent)) {
    eventPrimaryColor = rawAccent;
  } else if (rawCtaBg) {
    eventPrimaryColor = rawCtaBg;
  }

  const isLightPrimary = isLightHex(eventPrimaryColor);
  const onPrimaryTextColor = isLightPrimary ? "#09090b" : "#ffffff";
  const onPrimarySubtextColor = isLightPrimary ? "rgba(9, 9, 11, 0.75)" : "rgba(255, 255, 255, 0.85)";

  const frameSelectHeader = themeConfig.header?.left
    ? `${themeConfig.header.left.replace(/^the\s+/i, "").toUpperCase()} MEMORIES`
    : "WEDDING MEMORIES";

  const frameSelectDate = formatIndonesianDateUpper(rawDate);

  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync document body/html background to eliminate white space on mobile bounce and safe areas
  useEffect(() => {
    const targetBg = currentStep === "frame_select" ? eventPrimaryColor : "#000000";
    const origBodyBg = document.body.style.backgroundColor;
    const origHtmlBg = document.documentElement.style.backgroundColor;

    document.body.style.backgroundColor = targetBg;
    document.documentElement.style.backgroundColor = targetBg;

    return () => {
      document.body.style.backgroundColor = origBodyBg;
      document.documentElement.style.backgroundColor = origHtmlBg;
    };
  }, [currentStep, eventPrimaryColor]);

  // Always reset scroll to topmost position on step transition
  useEffect(() => {
    const resetScrollTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (phoneContainerRef.current) {
        phoneContainerRef.current.scrollTop = 0;
        phoneContainerRef.current.scrollTo(0, 0);
      }
    };

    resetScrollTop();
    const t1 = setTimeout(resetScrollTop, 50);
    const t2 = setTimeout(resetScrollTop, 150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentStep]);

  const handleProceedToNameInput = useCallback(() => {
    if (splashTimerRef.current) {
      clearTimeout(splashTimerRef.current);
      splashTimerRef.current = null;
    }
    setCurrentStep("name_input");
  }, []);

  // Auto transition from welcome poster to name input after 4.5 seconds for Nurul & Iqra
  useEffect(() => {
    if (currentStep === "welcome" && isNurulIqraWedding) {
      splashTimerRef.current = setTimeout(() => {
        setCurrentStep("name_input");
      }, 4500);
      return () => {
        if (splashTimerRef.current) {
          clearTimeout(splashTimerRef.current);
          splashTimerRef.current = null;
        }
      };
    }
  }, [currentStep, isNurulIqraWedding]);

  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  const assignedFrames = event.assigned_frames && event.assigned_frames.length > 0
    ? event.assigned_frames
    : null;

  const [selectedFrameId, setSelectedFrameId] = useState<string>(() => {
    if (assignedFrames && assignedFrames.length > 0) {
      return assignedFrames[0].id;
    }
    return "default";
  });

  const [frameConfig, setFrameConfig] = useState<FrameConfig>(() => {
    if (assignedFrames && assignedFrames.length > 0) {
      const first = assignedFrames[0];
      return {
        ...first.config_json,
        type: first.template_type,
        customOverlayUrl: first.preview_url || first.config_json?.customOverlayUrl,
      };
    }
    return event.default_frame_config;
  });

  const [selectedFilter, setSelectedFilter] = useState<CameraFilter>("normal");

  // Camera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [streamAspect, setStreamAspect] = useState<number>(3 / 4);

  // Frame Carousel
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Multi-shot
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);

  // Camera Adjust / Framing Overlay (matching reference: Pan & Pinch to slot ratio)
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustRawPhoto, setAdjustRawPhoto] = useState<string | null>(null);
  const [adjustIndex, setAdjustIndex] = useState(0);
  const [adjustZoom, setAdjustZoom] = useState(1);
  const [adjustTx, setAdjustTx] = useState(0);
  const [adjustTy, setAdjustTy] = useState(0);
  const [adjNatDim, setAdjNatDim] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [flashOn, setFlashOn] = useState(false);
  const adjustImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const ptrsRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDataRef = useRef<{ startDist: number; startZoom: number; lastX: number; lastY: number }>({
    startDist: 1,
    startZoom: 1,
    lastX: 0,
    lastY: 0,
  });

  // Composite
  const [compositeDataUrl, setCompositeDataUrl] = useState<string | null>(null);
  const [isCompositing, setIsCompositing] = useState(false);

  // Voice Note
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const recorderRef = useRef<VoiceNoteRecorder | null>(null);

  // Submission
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const getShotsForType = (type: FrameType): number => {
    switch (type) {
      case "grid_4": return 4;
      case "polaroid": return 1;
      case "deluxe": return 2;
      case "strip_3":
      default: return 3;
    }
  };

  const requiredShots = frameConfig.photoCount || frameConfig.photoSlots?.length || getShotsForType(frameConfig.type);

  const getTargetSlotAspect = useCallback((shotIndex: number): number => {
    // Untuk frame 1x jepret, gunakan rasio normal kamera 3:4 (0.75)
    // agar tidak menjadi 16:9 dan tidak terlalu ngezoom
    if (requiredShots === 1) {
      return 3 / 4;
    }

    if (frameConfig.photoSlots && frameConfig.photoSlots.length > 0) {
      const idx = Math.min(Math.max(0, shotIndex), frameConfig.photoSlots.length - 1);
      const slot = frameConfig.photoSlots[idx];
      if (slot && slot.width > 0 && slot.height > 0) {
        return slot.width / slot.height;
      }
    }
    if (frameConfig.frameImageWidth && frameConfig.frameImageHeight && frameConfig.frameImageWidth > 0 && frameConfig.frameImageHeight > 0) {
      if (frameConfig.photoCount === 1) {
        return streamAspect || (9 / 16);
      }
    }
    switch (frameConfig.type) {
      case "polaroid": return 1;
      case "deluxe": return 0.75;
      case "grid_4": return 1.25;
      case "strip_3":
      default: return 1.45;
    }
  }, [frameConfig, requiredShots, streamAspect]);

  // ─── Camera Lifecycle ─────────────────────────────────────────

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  }, []);

  const startCamera = useCallback(async (preferredFacing?: "user" | "environment") => {
    setCameraError(null);
    setCameraState("requesting");

    const targetFacing = preferredFacing || facingMode;

    try {
      stopCamera();

      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          aspectRatio: isMobile ? { ideal: 3 / 4 } : { ideal: 4 / 3 },
          width: isMobile ? { ideal: 1440 } : { ideal: 1920 },
          height: isMobile ? { ideal: 1920 } : { ideal: 1440 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
          setStreamAspect(videoRef.current.videoWidth / videoRef.current.videoHeight);
        }
      }

      setCameraState("ready");
    } catch {
      setCameraState("error");
      setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diaktifkan pada browser Anda.");
    }
  }, [facingMode, stopCamera]);

  const toggleCameraFacing = async () => {
    if (cameraState === "countdown" || cameraState === "capturing") return;
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    await startCamera(nextFacing);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ─── Photo Capture & Atur Foto Framing (Matching Reference) ───

  const getAdjustBoxDimensions = useCallback((aspect: number) => {
    const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 320) : 300;
    const maxH = typeof window !== "undefined" ? Math.min(window.innerHeight - 260, 420) : 400;
    let w = maxW;
    let h = Math.round(maxW / aspect);
    if (h > maxH) {
      h = maxH;
      w = Math.round(maxH * aspect);
    }
    return { w: Math.max(140, Math.round(w)), h: Math.max(140, Math.round(h)) };
  }, []);

  const triggerFlash = () => {
    if (!flashRef.current) return;
    const el = flashRef.current;
    el.style.opacity = "1";
    setTimeout(() => {
      el.style.opacity = "0";
    }, 120);
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 960;

    const targetIdx = capturedPhotos.length < requiredShots ? capturedPhotos.length : Math.max(0, requiredShots - 1);
    const aspect = getTargetSlotAspect(targetIdx);
    const vAspect = vWidth / vHeight;

    let srcX = 0;
    let srcY = 0;
    let srcW = vWidth;
    let srcH = vHeight;

    if (vAspect > aspect) {
      // Sensor lebih lebar dari target rasio 3:4: potong sisi kiri/kanan sedikit agar pas
      srcW = Math.round(vHeight * aspect);
      srcX = Math.round((vWidth - srcW) / 2);
    } else if (vAspect < aspect) {
      // Sensor lebih panjang dari target rasio 3:4: potong sisi atas/bawah sedikit agar pas
      srcH = Math.round(vWidth / aspect);
      srcY = Math.round((vHeight - srcH) / 2);
    }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = srcW;
    tempCanvas.height = srcH;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(srcW, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    const photoDataUrl = tempCanvas.toDataURL("image/jpeg", 0.95);

    triggerFlash();

    // Open Atur Foto modal for the current target slot
    setAdjustRawPhoto(photoDataUrl);
    setAdjustIndex(targetIdx);
    setAdjustZoom(1);
    setAdjustTx(0);
    setAdjustTy(0);
    setAdjustOpen(true);
  };

  const captureFromVideoRef = useRef(captureFromVideo);
  captureFromVideoRef.current = captureFromVideo;

  const startCountdown = useCallback(() => {
    if (cameraState === "countdown" || cameraState === "capturing" || adjustOpen) return;
    if (capturedPhotos.length >= requiredShots) return;
    if (!videoRef.current || cameraState !== "ready") return;

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setCameraState("countdown");
    setCountdown(3);

    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setCountdown(null);
        setCameraState("capturing");
        captureFromVideoRef.current();
        setCameraState("ready");
      }
    }, 1000);
  }, [cameraState, adjustOpen]);

  const handleSelectFromGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const targetIdx = capturedPhotos.length < requiredShots ? capturedPhotos.length : requiredShots - 1;
        setAdjustRawPhoto(reader.result);
        setAdjustIndex(targetIdx);
        setAdjustZoom(1);
        setAdjustTx(0);
        setAdjustTy(0);
        setAdjustOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRetakeAdjust = () => {
    setAdjustOpen(false);
    setAdjustRawPhoto(null);
  };

  const handleConfirmAdjust = () => {
    if (!adjustRawPhoto) {
      setAdjustOpen(false);
      return;
    }

    const slotIdx = adjustIndex;
    const aspect = getTargetSlotAspect(slotIdx);
    const imgEl = adjustImgRef.current;

    const canvas = document.createElement("canvas");
    const targetW = aspect >= 1 ? 1200 : Math.round(1200 * aspect);
    const targetH = aspect >= 1 ? Math.round(1200 / aspect) : 1200;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");

    const updated = [...capturedPhotos];
    if (ctx && imgEl && imgEl.naturalWidth && imgEl.naturalHeight) {
      const natW = imgEl.naturalWidth;
      const natH = imgEl.naturalHeight;
      const boxDim = getAdjustBoxDimensions(aspect);
      const boxW = boxDim.w;
      const boxH = boxDim.h;

      const baseScale = Math.max(boxW / natW, boxH / natH);
      const s = baseScale * adjustZoom;

      const srcLeft = -adjustTx / s;
      const srcTop = -adjustTy / s;
      const srcW = boxW / s;
      const srcH = boxH / s;

      const useNativeFilter = isCanvasFilterSupported() && selectedFilter && selectedFilter !== "normal";
      if (useNativeFilter) {
        applyFilterToContext(ctx, selectedFilter);
      }

      ctx.drawImage(imgEl, srcLeft, srcTop, srcW, srcH, 0, 0, targetW, targetH);

      if (!useNativeFilter && selectedFilter && selectedFilter !== "normal") {
        applyPixelFilter(ctx, targetW, targetH, selectedFilter);
      }

      const finalPhoto = canvas.toDataURL("image/jpeg", 0.92);
      updated[slotIdx] = finalPhoto;
    } else {
      updated[slotIdx] = adjustRawPhoto;
    }

    setCapturedPhotos(updated);
    setCurrentShotIndex(updated.length);

    setAdjustOpen(false);
    setAdjustRawPhoto(null);

    // Otomatis langsung lanjut ke preview jika semua slot foto sudah terisi (khususnya frame 1 foto)
    if (updated.length >= requiredShots) {
      setCameraState("processing");
      stopCamera();
      generateComposite(updated);
      setCurrentStep("preview");
    }
  };

  const handleDeleteShot = (indexToDelete: number) => {
    const updated = capturedPhotos.filter((_, idx) => idx !== indexToDelete);
    setCapturedPhotos(updated);
    setCurrentShotIndex(updated.length);
  };

  const handleProceedToPreview = () => {
    if (capturedPhotos.length < requiredShots) return;
    setCameraState("processing");
    stopCamera();
    generateComposite(capturedPhotos);
    setCurrentStep("preview");
  };

  // Pointer event handlers for Pan & Pinch in Atur Foto
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    ptrsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { }
    if (ptrsRef.current.size === 1) {
      pinchDataRef.current.lastX = e.clientX;
      pinchDataRef.current.lastY = e.clientY;
    } else if (ptrsRef.current.size === 2) {
      const ptrs = Array.from(ptrsRef.current.values());
      pinchDataRef.current.startDist = Math.hypot(ptrs[0].x - ptrs[1].x, ptrs[0].y - ptrs[1].y) || 1;
      pinchDataRef.current.startZoom = adjustZoom;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ptrsRef.current.has(e.pointerId)) return;
    ptrsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (ptrsRef.current.size >= 2) {
      const ptrs = Array.from(ptrsRef.current.values());
      const dist = Math.hypot(ptrs[0].x - ptrs[1].x, ptrs[0].y - ptrs[1].y) || 1;
      const newZoom = Math.max(1, Math.min(4, pinchDataRef.current.startZoom * (dist / pinchDataRef.current.startDist)));
      setAdjustZoom(newZoom);
    } else if (ptrsRef.current.size === 1) {
      const dx = e.clientX - pinchDataRef.current.lastX;
      const dy = e.clientY - pinchDataRef.current.lastY;
      pinchDataRef.current.lastX = e.clientX;
      pinchDataRef.current.lastY = e.clientY;

      setAdjustTx((prev) => prev + dx);
      setAdjustTy((prev) => prev + dy);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    ptrsRef.current.delete(e.pointerId);
    if (ptrsRef.current.size === 1) {
      const remaining = Array.from(ptrsRef.current.values())[0];
      pinchDataRef.current.lastX = remaining.x;
      pinchDataRef.current.lastY = remaining.y;
    }
  };

  // ─── Canvas Composite ─────────────────────────────────────────

  const generateComposite = async (photosToUse: string[]) => {
    if (!canvasRef.current) return;
    setIsCompositing(true);
    try {
      const dataUrl = await renderPhotoboothFrame(canvasRef.current, {
        photos: photosToUse,
        config: frameConfig,
        filter: "normal", // Photos already have selectedFilter baked in at capture
        highRes: true,
      });
      setCompositeDataUrl(dataUrl);
      setCameraState("complete");
    } catch (err) {
      console.error("Composite generation error:", err);
    } finally {
      setIsCompositing(false);
    }
  };

  // ─── Voice Note ───────────────────────────────────────────────

  const handleToggleVoiceRecording = async () => {
    if (isRecordingAudio) {
      if (recorderRef.current) {
        try {
          const res = await recorderRef.current.stopRecording();
          setAudioUrl(res.url);
          setAudioBase64(res.base64);
        } catch (e) {
          console.error("Audio stop error:", e);
        }
      }
      setIsRecordingAudio(false);
    } else {
      recorderRef.current = new VoiceNoteRecorder();
      setAudioSeconds(0);
      try {
        await recorderRef.current.startRecording((sec) => {
          setAudioSeconds(sec);
          if (sec >= 60 && recorderRef.current) {
            handleToggleVoiceRecording();
          }
        });
        setIsRecordingAudio(true);
      } catch {
        alert("Mikrofon tidak dapat diakses.");
      }
    }
  };

  // ─── Save Entry ───────────────────────────────────────────────

  const compressDataUrl = async (dataUrl: string, quality = 0.85, maxDim = 1200): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleSaveToGallery = async () => {
    if (!compositeDataUrl || isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      // Ensure photo size is safe for Vercel payload limits (< 4.5MB)
      let photoToSend = compositeDataUrl;
      if (photoToSend.length > 2.5 * 1024 * 1024) {
        photoToSend = await compressDataUrl(photoToSend, 0.82, 1200);
      }

      const res = await fetch(`/api/events/${event.slug}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName || "Tamu",
          photo_url: photoToSend,
          voice_note_url: audioBase64 || null,
          message: guestMessage || "",
          filter_used: selectedFilter,
        }),
      });

      if (!res.ok) {
        if (res.status === 413) {
          // Automatic recovery: compress photo down and retry once
          const compressed = await compressDataUrl(photoToSend, 0.75, 960);
          const retryRes = await fetch(`/api/events/${event.slug}/entries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              guest_name: guestName || "Tamu",
              photo_url: compressed,
              voice_note_url: audioBase64 || null,
              message: guestMessage || "",
              filter_used: selectedFilter,
            }),
          });

          if (retryRes.ok) {
            const retryData = await retryRes.json();
            if (retryData.success) {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
              setCurrentStep("finished");
              return;
            }
          }
          throw new Error("Ukuran foto terlalu besar. Silakan coba lagi.");
        }
        throw new Error(`Gagal menyimpan foto (Error ${res.status}). Silakan coba lagi.`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal menyimpan");
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setCurrentStep("finished");
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err?.message || "Foto belum berhasil disimpan. Periksa koneksi dan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Download / Share ─────────────────────────────────────────

  const handleDownload = () => {
    if (!compositeDataUrl) return;
    const link = document.createElement("a");
    link.href = compositeDataUrl;
    link.download = `ruangtemu_${event.slug}_${Date.now()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!compositeDataUrl || !navigator.share) return;
    try {
      const blob = await (await fetch(compositeDataUrl)).blob();
      const file = new File([blob], `ruangtemu_${event.slug}.png`, { type: "image/png" });
      await navigator.share({
        title: event.title,
        text: `Foto dari ${event.title}`,
        files: [file],
      });
    } catch {
      handleDownload();
    }
  };

  // ─── Reset Session ────────────────────────────────────────────

  const handleNewSession = () => {
    setCurrentStep("welcome");
    setCapturedPhotos([]);
    setCompositeDataUrl(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setGuestMessage("");
    setGuestName("");
    setCameraState("idle");
    setSaveError(null);
    setSelectedFilter("normal");
    setCurrentShotIndex(0);
    setAdjustOpen(false);
    setAdjustRawPhoto(null);
    if (assignedFrames && assignedFrames.length > 0) {
      const first = assignedFrames[0];
      setSelectedFrameId(first.id);
      setFrameConfig({
        ...first.config_json,
        type: first.template_type,
        customOverlayUrl: first.preview_url || first.config_json?.customOverlayUrl,
      });
    }
  };

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProgrammaticScrollRef = useRef(false);

  const scrollToFrame = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const slides = container.querySelectorAll<HTMLElement>("[data-frame-slide]");
    if (slides[index]) {
      const slide = slides[index];
      const targetLeft = slide.offsetLeft - (container.offsetWidth - slide.offsetWidth) / 2;
      isProgrammaticScrollRef.current = true;
      container.scrollTo({ left: targetLeft, behavior: "smooth" });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    }
  }, []);

  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current || isProgrammaticScrollRef.current) return;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!carouselRef.current) return;
      const container = carouselRef.current;
      const center = container.scrollLeft + container.offsetWidth / 2;
      const slides = container.querySelectorAll<HTMLElement>("[data-frame-slide]");
      let closestIdx = 0;
      let minDistance = Infinity;

      slides.forEach((slide, idx) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const dist = Math.abs(center - slideCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      if (assignedFrames && assignedFrames[closestIdx]) {
        const targetFrame = assignedFrames[closestIdx];
        if (targetFrame.id !== selectedFrameId) {
          setSelectedFrameId(targetFrame.id);
          setFrameConfig({
            ...targetFrame.config_json,
            type: targetFrame.template_type,
            customOverlayUrl: targetFrame.preview_url || targetFrame.config_json?.customOverlayUrl,
          });
          setCapturedPhotos([]);
          setCurrentShotIndex(0);
        }
      } else if (!assignedFrames && FRAME_TEMPLATES[closestIdx]) {
        const tmpl = FRAME_TEMPLATES[closestIdx];
        if (frameConfig.type !== tmpl.type) {
          setFrameConfig({ ...frameConfig, type: tmpl.type });
          setCapturedPhotos([]);
          setCurrentShotIndex(0);
        }
      }
    }, 50);
  }, [assignedFrames, selectedFrameId, frameConfig]);

  const handleSelectFrame = (frame: any, index: number) => {
    setSelectedFrameId(frame.id);
    setFrameConfig({
      ...frame.config_json,
      type: frame.template_type,
      customOverlayUrl: frame.preview_url || frame.config_json?.customOverlayUrl,
    });
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    scrollToFrame(index);
  };

  useEffect(() => {
    if (currentStep === "frame_select" && assignedFrames && carouselRef.current) {
      const idx = assignedFrames.findIndex((f) => f.id === selectedFrameId);
      if (idx >= 0) {
        const timer = setTimeout(() => {
          scrollToFrame(idx);
        }, 60);
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, scrollToFrame, assignedFrames, selectedFrameId]);

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div
      className="min-h-[100dvh] w-full bg-black flex flex-col md:flex-row md:h-screen md:max-h-screen md:overflow-hidden overflow-x-hidden"
      style={{ backgroundColor: currentStep === "frame_select" ? eventPrimaryColor : "#000000" }}
    >
      {/* ─── DESKTOP / TABLET POSTER COLUMN (HIDDEN ON SMARTPHONES) ─── */}
      <div className="hidden md:flex flex-1 flex-col justify-between items-center relative overflow-hidden bg-black select-none border-r border-white/10">
        {/* Ambient subtle background from event cover photo */}
        {desktopBgPhoto && (
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={desktopBgPhoto}
              alt=""
              className="w-full h-full object-cover object-center opacity-10 filter blur-md scale-105 select-none"
            />
            <div className="absolute inset-0 bg-black/85" />
          </div>
        )}

        {/* Top Header Watermark */}
        <div className="w-full flex items-center justify-between p-6 lg:p-8 relative z-10">
          <div className="flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-ruangtemu.jpg" alt="RUANGTEMU" className="w-5 h-5 rounded-xs object-cover" />
            <span className="text-[11px] font-medium tracking-[0.25em] text-white uppercase">RUANGTEMU</span>
          </div>
        </div>

        {/* Bottom Poster Typography matching reference layout */}
        <div className="flex-1 flex flex-col justify-end items-center pb-12 lg:pb-16 text-center px-8 relative z-10 w-full max-w-xl">
          <div className="flex flex-col items-center gap-1.5 w-full">
            <span
              className="text-white/85 text-xs md:text-sm tracking-[0.25em] uppercase font-serif italic"
              style={{ fontFamily: `'Playfair Display', 'Cormorant Garamond', 'Cinzel', serif` }}
            >
              {desktopBadgeText}
            </span>
            <h1
              className={`text-white leading-tight drop-shadow-xl ${
                isScriptFont
                  ? "text-4xl md:text-5xl lg:text-6xl font-normal py-1"
                  : "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight"
              }`}
              style={{
                fontFamily: `'${desktopFont}', cursive, serif`,
                filter: "drop-shadow(0 2px 14px rgba(0,0,0,0.9))",
              }}
            >
              {desktopCoupleTitle}
            </h1>
            {desktopFormattedDate && (
              <p className="text-white font-medium text-xs md:text-sm tracking-wide mt-1 drop-shadow">
                {desktopFormattedDate}
              </p>
            )}
            {desktopVenue && (
              <p className="text-white/60 text-[11px] md:text-xs tracking-wider mt-0.5">
                {desktopVenue}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── DOCKED PHONE CONTAINER (FULL WIDTH ON MOBILE, PHONE-SIZED ON DESKTOP) ─── */}
      <div
        ref={phoneContainerRef}
        className="w-full md:w-[420px] lg:w-[450px] xl:w-[480px] shrink-0 min-h-[100dvh] md:h-[100dvh] md:max-h-[100dvh] relative overflow-y-auto overflow-x-hidden flex flex-col bg-black shadow-[-25px_0_60px_rgba(0,0,0,0.85)]"
        style={{
          backgroundColor: currentStep === "frame_select" ? eventPrimaryColor : "#000000",
        }}
      >
        <div
          className={`min-h-[100dvh] flex flex-col relative flex-1 ${
            currentStep === "frame_select"
              ? ""
              : isNurulIqraWedding && currentStep !== "camera"
                ? "bg-white text-stone-900 selection:bg-red-100 selection:text-red-900"
                : "bg-[#111113] text-stone-100 selection:bg-stone-700 selection:text-white"
          }`}
          style={{
            backgroundColor: currentStep === "frame_select" ? eventPrimaryColor : undefined,
          }}
        >
          {/* Bridal Couple Photo Background Overlay (~10% opacity) for screens after poster */}
          {isNurulIqraWedding && currentStep !== "welcome" && currentStep !== "frame_select" && currentStep !== "camera" && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/events/nurul-iqra-real.jpg"
                alt=""
                className="w-full h-full object-cover object-[center_20%] opacity-10 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40" />
            </div>
          )}

          {/* Custom Wedding Couple Photo Background Overlay for screens after welcome */}
          {isCustomWedding && currentStep !== "welcome" && currentStep !== "frame_select" && currentStep !== "camera" && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customBgImage}
                alt=""
                className="w-full h-full object-cover object-[center_25%] opacity-15 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#050906]/85 via-[#050906]/90 to-[#050906]" />
            </div>
          )}

      {/* Minimal Top Bar (hidden during camera, welcome, frame_select, name_input, preview, and guestbook screens) */}
      {!isCustomWedding && currentStep !== "welcome" && currentStep !== "name_input" && currentStep !== "frame_select" && currentStep !== "camera" && currentStep !== "preview" && currentStep !== "guestbook" && (
        <header
          className={`border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40 ${isNurulIqraWedding
            ? "border-red-100 bg-white/95 backdrop-blur-sm text-stone-900 shadow-sm"
            : "border-stone-800/60 bg-[#111113]/95 backdrop-blur-sm text-stone-100"
            }`}
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href={`/event/${event.slug}/gallery`}
              className={`shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-colors ${isNurulIqraWedding ? "text-[#c51d24] bg-red-50 hover:bg-red-100 border border-red-100" : "text-stone-400 active:text-white"
                }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="1.5" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
            </Link>
            <div className="min-w-0">
              <h1 className={`text-sm font-bold truncate ${isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)] tracking-tight" : "text-stone-100"}`}>{event.title}</h1>
              <p className={`text-[11px] truncate ${isNurulIqraWedding ? "text-[#c51d24]/75 font-[family-name:var(--font-great-vibes)] text-base leading-none" : "text-stone-500"}`}>{event.venue}, {event.city}</p>
            </div>
          </div>
        </header>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* ─── STEP 1: WELCOME SCREEN (DYNAMIC FROM THEME_CONFIG IF CONFIGURED) ─── */}
      {currentStep === "welcome" && event.theme_config && (
        <main className="flex-1 w-full h-[100dvh] min-h-[100dvh] flex flex-col relative overflow-hidden select-none">
          <LandingPageView
            config={event.theme_config}
            onCta1Click={handleProceedToNameInput}
            onCta2Click={() => {
              window.location.href =
                event.theme_config?.cta2?.href || `/event/${event.slug}/gallery`;
            }}
            interactive={true}
          />
        </main>
      )}

      {/* ─── STEP 1: WELCOME SCREEN (CUSTOM FULL-PAGE UI FOR JAYA & RIKA / ILVA & RICKY FALLBACK) ─── */}
      {currentStep === "welcome" && !event.theme_config && isCustomWedding && (
        <main
          className="flex-1 w-full min-h-[100dvh] relative flex flex-col justify-between items-center px-7 sm:px-8 overflow-hidden select-none bg-black"
          style={{
            paddingTop: "max(1.5rem, env(safe-area-inset-top))",
            paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
          }}
        >
          {/* Background Image: High-resolution clean couple portrait */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={customBgImage}
              alt={event.title}
              className="w-full h-full object-cover object-[center_top] select-none pointer-events-none"
            />
            {/* Soft top gradient to guarantee crystal-clear text contrast */}
            <div
              className={`absolute inset-x-0 top-0 h-56 pointer-events-none ${
                isJayaRikaWedding
                  ? "bg-gradient-to-b from-white/80 via-white/25 to-transparent"
                  : "bg-gradient-to-b from-black/60 via-black/20 to-transparent"
              }`}
            />
            {/* Soft bottom gradient for button readability */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />
          </div>

          {/* Top Typography Section: Matching user reference image layout */}
          <header className="w-full max-w-sm mx-auto relative z-10 flex flex-col pt-2 sm:pt-4">
            {/* Top row: 'The Wedding' & 'Memories' */}
            <div
              className={`w-full flex items-center justify-between text-[15px] sm:text-base tracking-wide ${
                isJayaRikaWedding
                  ? "text-[#224DA5] font-semibold"
                  : "text-white/95 font-normal"
              }`}
            >
              <span>The Wedding</span>
              <span>Memories</span>
            </div>

            {/* Couple's Name: Lowered with balanced spacing */}
            <div className="mt-6 sm:mt-8 text-center w-full">
              <h1
                className={`text-[clamp(44px,13vw,62px)] font-[family-name:var(--font-great-vibes),'Great_Vibes',cursive] leading-none whitespace-nowrap select-none text-center ${
                  isJayaRikaWedding
                    ? "text-[#224DA5] drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]"
                    : "text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
                }`}
              >
                {customCoupleName}
              </h1>
            </div>

            {/* Date & Venue: aligned to the left, away from center/couple */}
            <div
              className={`mt-[clamp(2.5rem,6.5vh,4rem)] text-left pl-2 sm:pl-3 text-[13px] sm:text-sm font-normal leading-snug ${
                isJayaRikaWedding
                  ? "text-[#224DA5] font-medium drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]"
                  : "text-white/95 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]"
              }`}
            >
              <p>{customDateText}</p>
              <p>{customVenueText}</p>
            </div>
          </header>

          {/* Bottom Interactive Action Buttons Area */}
          <div className="w-full max-w-sm mx-auto relative z-10 flex flex-col items-center space-y-2.5 pb-1 mt-auto">
            {/* Action 1: White pill button with teal circle arrow */}
            <button
              type="button"
              onClick={handleProceedToNameInput}
              className="w-full min-h-[52px] px-5 py-2.5 rounded-full bg-white text-stone-950 font-bold text-base flex items-center justify-between shadow-2xl active:scale-[0.98] transition-transform cursor-pointer"
            >
              <span className="tracking-tight pl-1">Tambahkan Momen Anda</span>
              <span className={`w-9 h-9 rounded-full ${isJayaRikaWedding ? "bg-[#224DA5]" : "bg-[#3a716c]"} text-white flex items-center justify-center shrink-0 shadow-sm ml-2`}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </span>
            </button>

            {/* Action 2: Outline pill button linking to album with gallery icon badge */}
            <Link
              href={`/event/${event.slug}/gallery`}
              className="w-full min-h-[52px] px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-sm border-[1.5px] border-white text-white font-bold text-base flex items-center justify-between shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="tracking-tight pl-1">Jelajahi Album</span>
              <span className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 shadow-sm ml-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </span>
            </Link>

            {/* Footer Text */}
            <div className="pt-2 text-center flex items-center justify-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-ruangtemu.jpg" alt="RUANGTEMU" className="w-4 h-4 rounded-xs object-cover inline-block" />
              <p className="text-[11px] sm:text-xs text-white/80 tracking-wide font-normal">
                Virtual Photobooth by RUANGTEMUPHOTOBOOTH
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ─── STEP 1: WELCOME POSTER / SPLASH (CUSTOM FULL-PAGE BRIDAL UI FOR NURUL & IQRA) ─── */}
      {currentStep === "welcome" && !event.theme_config && isNurulIqraWedding && (
        <main
          role="button"
          tabIndex={0}
          onClick={handleProceedToNameInput}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleProceedToNameInput();
          }}
          className="flex-1 w-full min-h-[100dvh] bg-white text-stone-900 relative flex flex-col justify-between items-center px-4 py-6 overflow-hidden cursor-pointer select-none touch-manipulation"
          style={{
            paddingTop: "max(1.75rem, env(safe-area-inset-top))",
            paddingBottom: "max(1.75rem, env(safe-area-inset-bottom))",
          }}
        >
          {/* Decorative Side Halftone Dot Pattern (matching the poster background) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-30 z-0"
            style={{
              backgroundImage: "radial-gradient(#9ca3af 1.2px, transparent 1.2px)",
              backgroundSize: "13px 13px",
              maskImage: "radial-gradient(ellipse at center, transparent 35%, black 100%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, transparent 35%, black 100%)",
            }}
          />

          {/* TOP TYPOGRAPHY: The Wedding of Nurul & Iqra */}
          <div className="w-full text-center relative z-10 pt-1 flex flex-col items-center">
            <h2 className="font-[family-name:var(--font-great-vibes)] text-4xl sm:text-5xl text-[#c51d24] leading-tight select-none">
              The Wedding of
            </h2>
            <div className="mt-0.5">
              <h1 className="font-[family-name:var(--font-cinzel)] font-bold text-3xl sm:text-4xl text-[#c51d24] tracking-tight border-b-2 border-[#c51d24] pb-1 px-5 inline-block select-none">
                Nurul & Iqra
              </h1>
            </div>
          </div>

          {/* CENTER COUPLE PHOTO */}
          <div className="relative z-10 my-auto py-2 flex items-center justify-center">
            <div className="w-[66vw] max-w-[270px] max-h-[46dvh] aspect-[2/3] rounded-t-full rounded-b-2xl overflow-hidden border-2 border-stone-200/90 shadow-lg relative bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/events/nurul-iqra-real.jpg"
                alt="The Wedding of Nurul & Iqra"
                className="w-full h-full object-cover object-[center_18%] block select-none pointer-events-none"
              />
            </div>
          </div>

          {/* BOTTOM SECTION: Date + Branding + Touch Action */}
          <div className="w-full text-center relative z-10 pb-1 flex flex-col items-center space-y-2.5">
            {/* Date in Script Font */}
            <div className="font-[family-name:var(--font-great-vibes)] text-3xl sm:text-4xl text-[#c51d24] tracking-wider select-none">
              05/10/2026
            </div>

            {/* Brand Text */}
            <div className="font-[family-name:var(--font-cinzel)] font-bold text-[11px] sm:text-[12px] text-[#c51d24] tracking-widest uppercase select-none">
              Virtual Photobooth by RUANGTEMU PHOTOBOOTH
            </div>

            {/* Sleek Auto-progress Bar */}
            <div className="w-full max-w-[180px] h-1 bg-red-100 rounded-full overflow-hidden mt-1">
              <style>{`
                @keyframes splashProgressFullscreen {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
              `}</style>
              <div
                className="h-full bg-[#c51d24] rounded-full"
                style={{
                  animation: "splashProgressFullscreen 4.5s linear forwards",
                }}
              />
            </div>

            {/* Touch helper hint */}
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-sans font-medium flex items-center gap-1.5 pt-0.5">
              <span>Sentuh layar untuk lanjut</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </div>
          </div>
        </main>
      )}

      {/* ─── STEP 1.5: NAME INPUT SCREEN (CUSTOM UI DARI UI EDITOR / THEME CONFIG) ─── */}
      {currentStep === "name_input" && (
        <main className="flex-1 w-full min-h-[100dvh] relative flex flex-col justify-between overflow-hidden select-none">
          <GuestNamePageView
            config={event.theme_config?.guest_name}
            event={event}
            guestName={guestName}
            onGuestNameChange={setGuestName}
            onSubmit={() => {
              if (!guestName.trim()) return;
              setCurrentStep("frame_select");
            }}
            onBack={() => setCurrentStep("welcome")}
            interactive={true}
          />
        </main>
      )}

      {/* ─── STEP 1: WELCOME (DEFAULT DARK THEME FOR OTHER EVENTS) ─── */}
      {
        currentStep === "welcome" && !event.theme_config && !isNurulIqraWedding && !isCustomWedding && (
          <main className="flex-1 flex items-center justify-center px-5 py-8">
            <div className="w-full max-w-sm space-y-6">
              <div className="space-y-2 text-center">
                <div className="inline-block px-3 py-1 bg-[#c47a5a]/15 text-[#c47a5a] text-xs font-medium rounded-full">
                  Virtual Photobooth
                </div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">
                  {event.host_name}
                </h2>
                <p className="text-sm text-stone-400 leading-relaxed">
                  {event.description || "Ambil foto dan tinggalkan ucapan hangat Anda."}
                </p>
              </div>

              {/* Custom Frame Preview on Name Input Screen */}
              {assignedFrames && assignedFrames.length > 0 && (
                <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 flex items-center gap-3.5 shadow-sm">
                  <div
                    className="w-14 h-20 shrink-0 bg-stone-950 border border-stone-800 rounded-lg p-1 flex items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundImage: `radial-gradient(#444 1px, transparent 1px)`,
                      backgroundSize: "6px 6px",
                    }}
                  >
                    {(assignedFrames[0].preview_url || assignedFrames[0].config_json?.customOverlayUrl) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={assignedFrames[0].preview_url || assignedFrames[0].config_json?.customOverlayUrl}
                        alt={assignedFrames[0].name}
                        className="max-h-full max-w-full object-contain drop-shadow"
                      />
                    ) : (
                      <span className="text-[10px] font-mono text-stone-500">FRAME</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                        Frame Khusus
                      </span>
                      <span className="text-[11px] text-[#c47a5a] font-medium">
                        {assignedFrames[0].config_json?.photoCount || 3} Pose Foto
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white mt-1 truncate">
                      {assignedFrames[0].name}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Frame siap digunakan untuk foto Anda
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-medium text-stone-300">
                  Nama Anda
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  inputMode="text"
                  placeholder="contoh: Rian & Nadia"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && guestName.trim()) {
                      setCurrentStep("frame_select");
                    }
                  }}
                  className="w-full min-h-[48px] px-4 py-3 bg-stone-900/80 border border-stone-700 focus:border-stone-400 text-white text-base outline-none transition-colors rounded-lg"
                />
              </div>

              <button
                disabled={!guestName.trim()}
                onClick={() => setCurrentStep("frame_select")}
                className="w-full min-h-[52px] py-3 bg-white hover:bg-stone-100 active:bg-stone-200 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-semibold text-sm uppercase tracking-wide transition-colors rounded-lg"
              >
                Mulai Photobooth
              </button>
            </div>
          </main>
        )
      }

      {/* ─── STEP 2: FRAME SELECTION ─── */}
      {currentStep === "frame_select" && (
        <main
          className="flex-1 w-full min-h-[100dvh] flex flex-col justify-between relative overflow-hidden select-none transition-colors duration-300"
          style={{
            backgroundColor: eventPrimaryColor,
            color: onPrimaryTextColor,
          }}
        >
          {/* Top Bar with Back Button & Centered Typography */}
          <header className="relative w-full pt-4 sm:pt-6 pb-2 px-5 flex flex-col items-center justify-center shrink-0 z-20">
            <button
              type="button"
              onClick={() =>
                setCurrentStep(
                  isNurulIqraWedding || isCustomWedding || !!event.theme_config
                    ? "name_input"
                    : "welcome"
                )
              }
              aria-label="Kembali"
              className="absolute left-3 sm:left-4 top-3 sm:top-5 w-11 h-11 flex items-center justify-center hover:opacity-80 active:scale-90 transition-all cursor-pointer z-30"
              style={{ color: onPrimaryTextColor }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            <div className="flex flex-col items-center text-center px-10">
              <span
                className="text-[11px] sm:text-xs font-serif tracking-[0.25em] uppercase font-medium"
                style={{
                  color: onPrimarySubtextColor,
                  fontFamily: `'Playfair Display', 'Cormorant Garamond', 'Cinzel', serif`,
                }}
              >
                {frameSelectHeader}
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-normal leading-tight drop-shadow-md py-0.5"
                style={{
                  fontFamily: `'${desktopFont}', cursive, serif`,
                  color: onPrimaryTextColor,
                  filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.45))",
                }}
              >
                {desktopCoupleTitle}
              </h2>
              {frameSelectDate && (
                <span
                  className="text-[11px] sm:text-xs font-serif tracking-[0.25em] uppercase font-medium mt-0.5"
                  style={{
                    color: onPrimarySubtextColor,
                    fontFamily: `'Playfair Display', 'Cormorant Garamond', 'Cinzel', serif`,
                  }}
                >
                  {frameSelectDate}
                </span>
              )}
            </div>
          </header>

          {/* Center Frame Carousel */}
          <div className="relative w-full overflow-hidden flex-1 flex flex-col justify-center items-center my-auto min-h-0">
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="w-full flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-[calc(50%-125px)] scroll-smooth touch-pan-x items-center overscroll-x-contain"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {assignedFrames ? (
                assignedFrames.map((frame, index) => {
                  const isSelected = selectedFrameId === frame.id;
                  const overlayUrl = frame.preview_url || frame.config_json?.customOverlayUrl;

                  return (
                    <div
                      key={frame.id}
                      data-frame-slide
                      onClick={() => handleSelectFrame(frame, index)}
                      className="snap-center snap-always shrink-0 w-[250px] flex items-center justify-center cursor-pointer select-none py-2 will-change-transform"
                    >
                      {overlayUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={overlayUrl}
                          alt={frame.name}
                          className={`max-h-[46dvh] sm:max-h-[50dvh] w-auto object-contain transition-all duration-500 ease-out select-none pointer-events-none will-change-transform ${
                            isSelected
                              ? "scale-100 opacity-100 drop-shadow-[0_20px_45px_rgba(0,0,0,0.5)]"
                              : "scale-[0.86] opacity-45 hover:opacity-75 drop-shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                          }`}
                        />
                      ) : (
                        <div className="w-[190px] h-[280px] bg-white text-stone-900 rounded-xl shadow-2xl flex flex-col justify-between p-4 items-center transition-all duration-500 ease-out will-change-transform">
                          <span className="text-xs font-serif font-bold uppercase tracking-wider">{frame.name}</span>
                          <span className="text-[11px] font-medium text-stone-500">{frame.config_json?.photoCount || 1} Pose Foto</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                FRAME_TEMPLATES.map((tmpl, index) => {
                  const isSelected = frameConfig.type === tmpl.type;
                  return (
                    <div
                      key={tmpl.type}
                      data-frame-slide
                      onClick={() => {
                        setFrameConfig({ ...frameConfig, type: tmpl.type });
                        scrollToFrame(index);
                      }}
                      className="snap-center snap-always shrink-0 w-[250px] flex items-center justify-center cursor-pointer select-none py-2 will-change-transform"
                    >
                      <div
                        className={`w-[190px] h-[290px] bg-white text-stone-900 rounded-xl p-5 flex flex-col justify-between items-center transition-all duration-500 ease-out will-change-transform ${
                          isSelected
                            ? "scale-100 opacity-100 shadow-2xl ring-2 ring-white"
                            : "scale-[0.86] opacity-45 shadow-md"
                        }`}
                      >
                        <div className="text-center font-bold text-sm tracking-tight">{tmpl.name}</div>
                        <div className="text-xs font-semibold" style={{ color: eventPrimaryColor }}>
                          {tmpl.shots} Pose Foto
                        </div>
                        <div className="text-[11px] text-stone-500 text-center leading-relaxed">
                          {tmpl.description}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Dots Indicator */}
            <div className="flex justify-center items-center gap-2 pt-2 pb-1">
              {assignedFrames ? (
                assignedFrames.map((frame, idx) => {
                  const isCurrent = selectedFrameId === frame.id;
                  return (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => handleSelectFrame(frame, idx)}
                      aria-label={`Pilih Frame ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        isCurrent
                          ? "w-7 h-1.5 bg-white shadow-sm"
                          : "w-2 h-2 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  );
                })
              ) : (
                FRAME_TEMPLATES.map((tmpl, idx) => {
                  const isCurrent = frameConfig.type === tmpl.type;
                  return (
                    <button
                      key={tmpl.type}
                      type="button"
                      onClick={() => {
                        setFrameConfig({ ...frameConfig, type: tmpl.type });
                        scrollToFrame(idx);
                      }}
                      aria-label={`Pilih Frame ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        isCurrent
                          ? "w-7 h-1.5 bg-white shadow-sm"
                          : "w-2 h-2 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Button ("PILIH BINGKAI") */}
          <div
            className="w-full px-6 pb-6 pt-3 mt-auto shrink-0 z-20"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              onClick={() => {
                setCapturedPhotos([]);
                setCurrentShotIndex(0);
                setCurrentStep("camera");
                startCamera();
              }}
              className="w-full min-h-[54px] py-3.5 px-6 bg-[#fcfaf7] hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center shadow-2xl cursor-pointer"
              style={{
                color: eventPrimaryColor,
              }}
            >
              <span
                className="text-sm sm:text-base font-serif font-bold tracking-[0.2em] uppercase"
                style={{ fontFamily: `'Playfair Display', 'Cormorant Garamond', 'Cinzel', serif` }}
              >
                PILIH BINGKAI
              </span>
            </button>
          </div>
        </main>
      )}

      {/* ─── STEP 3: CAMERA ─── */}
      {
        currentStep === "camera" && (
          <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0a]">
            {/* Flash Overlay */}
            <div
              ref={flashRef}
              className="absolute inset-0 bg-white pointer-events-none z-40"
              style={{ opacity: 0, transition: "opacity 120ms ease-out" }}
            />

            {/* ─── ATUR FOTO (PAN & PINCH FRAMING OVERLAY) ─── */}
            {adjustOpen && (
              <div className="absolute inset-0 z-50 bg-[#0d0d0d] flex flex-col justify-between text-white select-none">
                {/* Header */}
                <div className="flex flex-col items-center text-center pt-5 pb-1 px-5 shrink-0">
                  <h3 className="font-bold text-lg text-white tracking-tight">Atur Foto</h3>
                  <p className="text-xs text-white/60 mt-0.5 tracking-wide">
                    {requiredShots > 1
                      ? `Foto ${adjustIndex + 1} dari ${requiredShots}`
                      : "Atur posisi foto"}
                  </p>
                </div>

                {/* Center Framing Window Box */}
                {(() => {
                  const currentAspect = getTargetSlotAspect(adjustIndex);
                  const boxDim = getAdjustBoxDimensions(currentAspect);
                  const natW = adjNatDim.w || 1;
                  const natH = adjNatDim.h || 1;
                  const baseScale = Math.max(boxDim.w / natW, boxDim.h / natH);
                  const currentScale = baseScale * adjustZoom;
                  const dispW = natW * currentScale;
                  const dispH = natH * currentScale;
                  const minTx = boxDim.w - dispW;
                  const clampedTx = Math.min(0, Math.max(minTx, adjustTx));
                  const minTy = boxDim.h - dispH;
                  const clampedTy = Math.min(0, Math.max(minTy, adjustTy));

                  return (
                    <div className="flex-1 min-h-0 flex items-center justify-center p-3 overflow-hidden">
                      <div
                        className="relative overflow-hidden rounded-xl bg-[#151515] shadow-2xl border border-white/20 touch-none"
                        style={{
                          width: `${boxDim.w}px`,
                          height: `${boxDim.h}px`,
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onWheel={(e) => {
                          e.preventDefault();
                          setAdjustZoom((prev) => Math.max(1, Math.min(4, prev * (e.deltaY < 0 ? 1.08 : 0.92))));
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          ref={adjustImgRef}
                          src={adjustRawPhoto || ""}
                          alt="Preview atur foto"
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            setAdjNatDim({ w: img.naturalWidth, h: img.naturalHeight });
                            const bs = Math.max(boxDim.w / (img.naturalWidth || 1), boxDim.h / (img.naturalHeight || 1));
                            const dw = (img.naturalWidth || 1) * bs;
                            const dh = (img.naturalHeight || 1) * bs;
                            setAdjustTx((boxDim.w - dw) / 2);
                            setAdjustTy((boxDim.h - dh) / 2);
                            setAdjustZoom(1);
                          }}
                          className={`absolute max-w-none cursor-grab active:cursor-grabbing select-none ${selectedFilter === "grayscale"
                            ? "grayscale"
                            : selectedFilter === "sepia"
                              ? "sepia"
                              : selectedFilter === "soft-glow"
                                ? "brightness-105 contrast-95 saturate-110"
                                : selectedFilter === "warm-vintage"
                                  ? "sepia-[0.35] saturate-125"
                                  : selectedFilter === "cool-cinema"
                                    ? "hue-rotate-180 saturate-90"
                                    : ""
                            }`}
                          style={{
                            left: `${clampedTx}px`,
                            top: `${clampedTy}px`,
                            width: `${dispW}px`,
                            height: `${dispH}px`,
                            userSelect: "none",
                            WebkitUserSelect: "none",
                          }}
                          draggable={false}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Helper pill: Pan & pinch guidance */}
                <div className="flex justify-center px-4 pb-2 shrink-0">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs text-white/80 border border-white/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l-3 3M21 12l-3-3M21 12l3 3" />
                    </svg>
                    <span>Geser &amp; cubit untuk menyesuaikan foto</span>
                  </div>
                </div>

                {/* Buttons: Ulangi & Pakai */}
                <div className="p-5 pt-2 pb-8 flex gap-3 shrink-0 max-w-sm mx-auto w-full">
                  <button
                    type="button"
                    onClick={handleRetakeAdjust}
                    className="flex-1 min-h-[48px] rounded-full border border-white/60 bg-transparent text-white font-medium text-sm hover:bg-white/10 active:scale-95 transition-all"
                  >
                    Ulangi
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAdjust}
                    className="flex-1 min-h-[48px] rounded-full bg-white text-stone-950 font-bold text-sm hover:bg-stone-100 active:scale-95 transition-all shadow-lg"
                  >
                    Pakai
                  </button>
                </div>
              </div>
            )}

            {/* Top Bar with Back button, Event Info, and Flash Toggle */}
            <div className={`px-4 py-3 flex items-center justify-between z-20 shrink-0 border-b border-white/5 ${isNurulIqraWedding ? "bg-black/75 text-white backdrop-blur-md" : isCustomWedding ? "bg-black/50 text-white backdrop-blur-md" : "bg-[#111113]/90 text-stone-200 backdrop-blur-md"}`}>
              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setCameraState("idle");
                  setCurrentStep("frame_select");
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 border border-white/10 flex items-center justify-center text-white transition-all backdrop-blur-md"
                aria-label="Kembali ke pilih frame"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              {/* Title Info */}
              <div className="text-center px-2 min-w-0 flex-1">
                <span className="block text-xs font-bold text-white tracking-wide truncate">
                  {event.host_name || event.title}
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-white/50 font-medium">
                  Virtual Photobooth
                </span>
              </div>

              {/* Flash Toggle */}
              <button
                type="button"
                onClick={() => setFlashOn((prev) => !prev)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${
                  flashOn
                    ? "bg-amber-400 text-stone-950 shadow-md shadow-amber-400/30 font-bold"
                    : "bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 active:scale-95"
                }`}
                aria-label={flashOn ? "Matikan flash layar" : "Nyalakan flash layar"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={flashOn ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </button>
            </div>

            {/* Camera Viewfinder Stage (adaptive aspect ratio matching target frame slot) */}
            <div className="flex-1 relative bg-[#070709] flex items-center justify-center overflow-hidden px-3 py-2 min-h-0 w-full">
              {/* Ambient Studio Lighting (Theme Accent Glow) */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center"
              >
                <div
                  className="w-[280px] h-[340px] rounded-full blur-[90px] opacity-20"
                  style={{ backgroundColor: eventPrimaryColor || "#d97706" }}
                />
              </div>

              {(() => {
                const activeSlotIdx = capturedPhotos.length < requiredShots ? capturedPhotos.length : Math.max(0, requiredShots - 1);
                const activeSlotAspect = getTargetSlotAspect(activeSlotIdx);

                return (
                  <div
                    className="relative rounded-3xl overflow-hidden bg-[#141416] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/15 transition-all duration-300 z-10"
                    style={{
                      aspectRatio: `${activeSlotAspect}`,
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: activeSlotAspect >= 1 ? "100%" : "auto",
                      height: activeSlotAspect < 1 ? "100%" : "auto",
                    }}
                  >
                    {cameraState === "error" ? (
                      <div className="px-6 py-8 text-center space-y-4 max-w-xs">
                        <div className="w-16 h-16 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-stone-400">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16.5 7.5a4 4 0 1 0 0-3" />
                            <path d="m2 2 20 20" />
                            <path d="M11.5 15H17a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" />
                            <path d="M7 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
                          </svg>
                        </div>
                        <p className="text-sm text-stone-300 leading-relaxed">{cameraError}</p>
                        <button
                          onClick={() => startCamera()}
                          className="min-h-[48px] px-6 bg-white text-stone-950 font-semibold text-sm rounded-xl shadow-lg"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          onLoadedMetadata={(e) => {
                            const v = e.currentTarget;
                            if (v.videoWidth && v.videoHeight) {
                              setStreamAspect(v.videoWidth / v.videoHeight);
                            }
                          }}
                          className={`w-full h-full object-cover select-none pointer-events-none ${
                            facingMode === "user" ? "-scale-x-100" : "scale-x-100"
                          } ${
                            selectedFilter === "grayscale"
                              ? "grayscale"
                              : selectedFilter === "sepia"
                                ? "sepia"
                                : selectedFilter === "soft-glow"
                                  ? "brightness-105 contrast-95 saturate-110"
                                  : selectedFilter === "warm-vintage"
                                    ? "sepia-[0.35] saturate-125"
                                    : selectedFilter === "cool-cinema"
                                      ? "hue-rotate-180 saturate-90"
                                      : ""
                          }`}
                        />

                        {/* Viewfinder Rule of Thirds Grid (Subtle Studio Guides) */}
                        <div className="absolute inset-0 pointer-events-none z-10 opacity-20 select-none">
                          <div className="absolute left-1/3 top-0 bottom-0 border-r border-white/40" />
                          <div className="absolute left-2/3 top-0 bottom-0 border-r border-white/40" />
                          <div className="absolute top-1/3 left-0 right-0 border-b border-white/40" />
                          <div className="absolute top-2/3 left-0 right-0 border-b border-white/40" />
                        </div>

                        {/* Viewfinder Modern Corner Brackets */}
                        <div className="absolute inset-3 pointer-events-none z-10 select-none">
                          <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/70 rounded-tl-md" />
                          <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/70 rounded-tr-md" />
                          <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/70 rounded-bl-md" />
                          <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/70 rounded-br-md" />
                        </div>

                        {/* Active Slot Badge (Top Center of Viewfinder) */}
                        <div className="absolute top-3 inset-x-0 flex justify-center z-20 pointer-events-none select-none">
                          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider uppercase border border-white/15 shadow-md flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full animate-pulse"
                              style={{ backgroundColor: eventPrimaryColor || "#ffffff" }}
                            />
                            {requiredShots > 1
                              ? `Foto ${activeSlotIdx + 1} dari ${requiredShots}`
                              : "1 Foto"}
                          </span>
                        </div>

                        {/* Countdown Overlay (3, 2, 1) */}
                        {countdown !== null && (
                          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none select-none bg-black/40 backdrop-blur-[2px]">
                            {requiredShots > 1 && (
                              <span className="text-xs font-semibold uppercase tracking-widest text-white mb-4 px-3.5 py-1 rounded-full bg-black/70 border border-white/20 backdrop-blur-md shadow-lg">
                                Foto {activeSlotIdx + 1} dari {requiredShots}
                              </span>
                            )}
                            <div
                              key={countdown}
                              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-black/70 border-2 border-white/40 backdrop-blur-md flex items-center justify-center shadow-2xl animate-in zoom-in-75 fade-in duration-200"
                            >
                              <span className="text-6xl sm:text-7xl font-extrabold text-white tabular-nums drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                                {countdown}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Filter Carousel (hidden scrollbars) */}
            <div className="flex gap-2 overflow-x-auto py-1 px-4 max-w-md mx-auto w-full shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  disabled={cameraState !== "ready"}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`min-h-[36px] px-3.5 text-xs font-semibold whitespace-nowrap rounded-full transition-all active:scale-95 ${
                    selectedFilter === f.id
                      ? "bg-white text-stone-950 shadow-md font-bold"
                      : "bg-white/10 text-stone-300 hover:text-white border border-white/10 backdrop-blur-sm"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Capture Slots Progress (Filmstrip style) */}
            {requiredShots > 1 && (
              <div className="flex items-center justify-center gap-2.5 px-4 pt-1.5 pb-1 shrink-0 max-w-md mx-auto w-full select-none">
                {Array.from({ length: requiredShots }).map((_, idx) => {
                  const photo = capturedPhotos[idx];
                  const isActive = idx === capturedPhotos.length;
                  const slotAspect = getTargetSlotAspect(idx);

                  return (
                    <div
                      key={idx}
                      className={`relative h-12 rounded-lg overflow-hidden flex items-center justify-center transition-all ${
                        photo
                          ? "border-2 border-white shadow-md bg-stone-900"
                          : isActive
                            ? "border-2 border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50"
                            : "border border-dashed border-white/20 bg-white/5 text-white/40"
                      }`}
                      style={{ aspectRatio: `${slotAspect}` }}
                    >
                      {photo ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteShot(idx)}
                            aria-label={`Hapus foto ${idx + 1}`}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-500 active:scale-90 transition-transform"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[10px] font-bold">
                          <span>{idx + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Shutter & Controls Bar */}
            <div
              className="px-6 py-4 bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/10 shrink-0"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              {capturedPhotos.length >= requiredShots ? (
                /* All shots taken: 'Lanjutkan' CTA */
                <div className="max-w-xs mx-auto w-full">
                  <button
                    type="button"
                    onClick={handleProceedToPreview}
                    className="w-full min-h-[54px] px-6 rounded-2xl bg-white hover:bg-stone-100 text-stone-950 font-bold text-base flex items-center justify-between shadow-2xl active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span className="tracking-tight pl-2">Lihat Hasil Foto</span>
                    <span className="w-9 h-9 rounded-xl bg-stone-950 text-white flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </button>
                </div>
              ) : (
                /* Still capturing: Flip Camera, Shutter, Gallery */
                <div className="flex items-center justify-between max-w-xs mx-auto w-full">
                  {/* Flip camera */}
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    disabled={countdown !== null}
                    aria-label="Ganti kamera depan atau belakang"
                    className={`w-12 h-12 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center justify-center active:scale-90 transition-all backdrop-blur-md shadow-md ${
                      countdown !== null ? "opacity-30 pointer-events-none" : ""
                    }`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 2.21 1 4.21 2.6 5.6" />
                      <path d="M4 14c0 4.418 3.582 8 8 8s8-3.582 8-8c0-2.21-1-4.21-2.6-5.6" />
                      <path d="m19 14 3-3-3-3" />
                      <path d="m5 10-3 3 3 3" />
                    </svg>
                  </button>

                  {/* Shutter button */}
                  <button
                    type="button"
                    onClick={startCountdown}
                    disabled={cameraState !== "ready" || countdown !== null || adjustOpen}
                    aria-label={countdown !== null ? `Hitungan mundur ${countdown} detik` : "Ambil foto"}
                    className={`w-20 h-20 rounded-full border-[3px] p-1 flex items-center justify-center transition-all shadow-2xl bg-transparent ${
                      countdown !== null
                        ? "border-amber-400 scale-95 opacity-90 cursor-wait"
                        : "border-white/90 hover:scale-105 active:scale-95"
                    }`}
                  >
                    <span
                      className={`w-14 h-14 rounded-full block shadow-lg transition-all ${
                        countdown !== null ? "bg-amber-400 animate-pulse" : "bg-white active:bg-stone-200"
                      }`}
                    />
                  </button>

                  {/* Gallery picker */}
                  <button
                    type="button"
                    onClick={() => !countdown && fileInputRef.current?.click()}
                    disabled={countdown !== null}
                    aria-label="Pilih foto dari galeri HP"
                    className={`w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center justify-center active:scale-90 transition-all backdrop-blur-md shadow-md ${
                      countdown !== null ? "opacity-30 pointer-events-none" : ""
                    }`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSelectFromGallery}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </main>
        )
      }

      {/* ─── STEP 4: PREVIEW (STUDIO SHOWCASE) ─── */}
      {
        currentStep === "preview" && (
          <main
            className={`flex-1 w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between px-5 py-3 relative z-10 select-none overflow-hidden ${
              isNurulIqraWedding
                ? "bg-gradient-to-b from-[#fffaf7] via-white to-[#fbf2ed] text-stone-900"
                : "bg-radial from-[#18181c]/70 via-[#0e0e11] to-[#070709] text-white"
            }`}
            style={{
              paddingTop: "max(1rem, env(safe-area-inset-top))",
              paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
            }}
          >
            {/* Ambient Studio Lighting (Theme Accent Glow) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none overflow-hidden z-0"
            >
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[460px] rounded-full blur-[90px] ${
                  isNurulIqraWedding ? "opacity-15 bg-[#c51d24]" : "opacity-30"
                }`}
                style={{
                  backgroundColor: isNurulIqraWedding ? undefined : eventPrimaryColor || "#d97706",
                }}
              />
              <div
                className={`absolute inset-0 pointer-events-none ${
                  isNurulIqraWedding
                    ? "bg-gradient-to-b from-white/30 via-transparent to-red-950/5"
                    : "bg-gradient-to-b from-black/20 via-transparent to-black/60"
                }`}
              />
            </div>

            {/* Minimalist Top Indicator Bar */}
            <header className="relative z-10 w-full flex items-center justify-between pt-1 pb-1">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shadow-xs border ${
                  isNurulIqraWedding
                    ? "bg-red-50/90 border-red-100 text-[#c51d24] font-[family-name:var(--font-cinzel)] font-bold"
                    : "bg-white/10 backdrop-blur-md border-white/10 text-stone-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isNurulIqraWedding ? "bg-[#c51d24] animate-pulse" : "animate-pulse"
                  }`}
                  style={{
                    backgroundColor: isNurulIqraWedding ? undefined : eventPrimaryColor || "#ffffff",
                  }}
                />
                <span className="tracking-wide">Review Hasil Foto</span>
              </div>

              <div
                className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                  isNurulIqraWedding
                    ? "text-stone-500 bg-stone-100/80"
                    : "text-stone-400 bg-white/5 border border-white/5"
                }`}
              >
                Langkah 2 / 3
              </div>
            </header>

            {/* Center Stage: The Framed Photo as Physical Print */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center py-2 relative z-10">
              {isCompositing ? (
                <div className="flex flex-col items-center justify-center gap-3.5 py-12">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full border-2 animate-ping opacity-40"
                      style={{
                        borderColor: isNurulIqraWedding ? "#c51d24" : eventPrimaryColor || "#ffffff",
                      }}
                    />
                    <div
                      className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                      style={{
                        borderColor: isNurulIqraWedding
                          ? "#c51d24 transparent #c51d24 #c51d24"
                          : `${eventPrimaryColor || "#ffffff"} transparent ${
                              eventPrimaryColor || "#ffffff"
                            } ${eventPrimaryColor || "#ffffff"}`,
                      }}
                    />
                  </div>
                  <p
                    className={`text-xs font-medium tracking-wide ${
                      isNurulIqraWedding ? "text-[#c51d24]" : "text-stone-300"
                    }`}
                  >
                    Merender cetakan foto...
                  </p>
                </div>
              ) : compositeDataUrl ? (
                <div className="relative max-h-[70dvh] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={compositeDataUrl}
                    alt="Hasil cetakan photobooth"
                    className="max-h-[68dvh] sm:max-h-[70dvh] w-auto max-w-[88vw] sm:max-w-xs object-contain rounded-xl select-none"
                    style={{
                      filter: isNurulIqraWedding
                        ? "drop-shadow(0 18px 30px rgba(180, 20, 20, 0.15)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))"
                        : "drop-shadow(0 22px 40px rgba(0, 0, 0, 0.9)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))",
                    }}
                  />
                </div>
              ) : null}
            </div>

            {/* Ergonomic Bottom Action Buttons */}
            <div className="relative z-10 w-full pt-1 pb-1">
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
                {/* Secondary: Foto Ulang (Retake) */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep("camera");
                    setCapturedPhotos([]);
                    setCurrentShotIndex(0);
                    setCameraState("idle");
                    startCamera();
                  }}
                  className={`min-h-[52px] px-4 font-semibold text-sm rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    isNurulIqraWedding
                      ? "bg-white hover:bg-stone-50 border-2 border-stone-200 text-stone-700 shadow-sm"
                      : "bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 text-stone-200 backdrop-blur-md shadow-sm"
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                  <span>Foto Ulang</span>
                </button>

                {/* Primary: Lanjut (Continue to Guestbook) */}
                <button
                  type="button"
                  onClick={() => setCurrentStep("guestbook")}
                  className={`min-h-[52px] px-4 font-bold text-sm uppercase tracking-wider rounded-2xl transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 ${
                    isNurulIqraWedding
                      ? "bg-[#c51d24] hover:bg-[#a8161c] text-white shadow-red-700/25 font-[family-name:var(--font-cinzel)]"
                      : isJayaRikaWedding
                        ? "bg-[#224DA5] hover:bg-[#1b3e85] text-white shadow-blue-950/40"
                        : "bg-white hover:bg-stone-100 text-stone-950 shadow-black/40"
                  }`}
                >
                  <span>Lanjut</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </main>
        )
      }
          {/* ─── STEP 5: GUESTBOOK (STUDIO SHOWCASE) ─── */}
      {
        currentStep === "guestbook" && (
          <main
            className={`flex-1 w-full min-h-[100dvh] flex flex-col justify-between px-5 py-4 relative z-10 select-none overflow-y-auto ${
              isNurulIqraWedding
                ? "bg-gradient-to-b from-[#fffaf7] via-white to-[#fbf2ed] text-stone-900"
                : "bg-radial from-[#18181c]/70 via-[#0e0e11] to-[#070709] text-white"
            }`}
            style={{
              paddingTop: "max(1rem, env(safe-area-inset-top))",
              paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
            }}
          >
            {/* Ambient Studio Lighting (Theme Accent Glow) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none overflow-hidden z-0"
            >
              <div
                className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[400px] rounded-full blur-[100px] ${
                  isNurulIqraWedding ? "opacity-15 bg-[#c51d24]" : "opacity-25"
                }`}
                style={{
                  backgroundColor: isNurulIqraWedding ? undefined : eventPrimaryColor || "#d97706",
                }}
              />
              <div
                className={`absolute inset-0 pointer-events-none ${
                  isNurulIqraWedding
                    ? "bg-gradient-to-b from-white/30 via-transparent to-red-950/5"
                    : "bg-gradient-to-b from-black/20 via-transparent to-black/60"
                }`}
              />
            </div>

            <div className="w-full max-w-sm mx-auto space-y-4 flex-1 flex flex-col justify-between relative z-10">
              <div className="space-y-4">
                {/* Minimalist Top Indicator Bar */}
                <header className="relative z-10 w-full flex items-center justify-between pb-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("preview")}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                      isNurulIqraWedding
                        ? "bg-stone-100 hover:bg-stone-200 text-stone-800"
                        : "bg-white/10 hover:bg-white/15 border border-white/10 text-white backdrop-blur-md"
                    }`}
                    aria-label="Kembali ke pratinjau foto"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  <div
                    className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold shadow-xs border ${
                      isNurulIqraWedding
                        ? "bg-red-50/90 border-red-100 text-[#c51d24] font-[family-name:var(--font-cinzel)]"
                        : "bg-white/10 backdrop-blur-md border-white/10 text-stone-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isNurulIqraWedding ? "bg-[#c51d24] animate-pulse" : "animate-pulse"
                      }`}
                      style={{
                        backgroundColor: isNurulIqraWedding ? undefined : eventPrimaryColor || "#ffffff",
                      }}
                    />
                    <span>Buku Tamu & Doa</span>
                  </div>

                  <div
                    className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                      isNurulIqraWedding
                        ? "text-stone-500 bg-stone-100/80"
                        : "text-stone-400 bg-white/5 border border-white/5"
                    }`}
                  >
                    3 / 3
                  </div>
                </header>

                {/* Mini Souvenir Badge: Connecting the Photo to the Wish */}
                {compositeDataUrl && (
                  <div
                    className={`p-3 rounded-2xl border backdrop-blur-md flex items-center gap-3.5 shadow-lg ${
                      isNurulIqraWedding
                        ? "bg-white/90 border-red-100 shadow-red-950/5 text-stone-900"
                        : "bg-white/[0.07] border-white/10 shadow-black/40 text-white"
                    }`}
                  >
                    <div className="relative h-16 w-12 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/20 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={compositeDataUrl}
                        alt="Foto Souvenir"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                        <span>Foto Anda Siap</span>
                        <span>•</span>
                        <span className={`font-semibold truncate ${isNurulIqraWedding ? "text-[#c51d24]" : "text-white"}`}>
                          {guestName}
                        </span>
                      </div>
                      <p className={`text-xs font-medium truncate mt-0.5 ${isNurulIqraWedding ? "text-stone-800" : "text-stone-200"}`}>
                        Tinggalkan ucapan untuk {event.host_name || event.title}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pesan Tertulis Card */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs px-1">
                    <label
                      className={`uppercase tracking-wider font-bold text-[11px] flex items-center gap-1.5 ${
                        isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)]" : "text-stone-300 font-mono"
                      }`}
                    >
                      Pesan Tertulis
                    </label>
                    <span className="text-[11px] text-stone-400">
                      {guestMessage.length > 0 ? `${guestMessage.length} karakter` : "Opsional"}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan ucapan dan doa terbaik Anda..."
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    className={`w-full px-4 py-3.5 text-sm outline-none resize-none rounded-2xl transition-all shadow-inner ${
                      isNurulIqraWedding
                        ? "bg-white border-2 border-stone-200 focus:border-[#c51d24] focus:ring-4 focus:ring-[#c51d24]/10 text-stone-900 placeholder:text-stone-400"
                        : isJayaRikaWedding
                          ? "bg-white/[0.06] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 focus:border-[#224DA5] focus:ring-4 focus:ring-[#224DA5]/20 text-white placeholder:text-stone-500"
                          : "bg-white/[0.06] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 text-white placeholder:text-stone-500"
                    }`}
                  />
                </div>

                {/* Voice Note Recorder (if enabled) */}
                {event.allow_voice_note && (
                  <div
                    className={`p-3.5 rounded-2xl border backdrop-blur-md space-y-2.5 shadow-md ${
                      isNurulIqraWedding
                        ? "bg-white/95 border-2 border-red-100/80 shadow-red-950/5 text-stone-900"
                        : "bg-white/[0.06] border-white/10 text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs px-0.5">
                      <span
                        className={`font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 ${
                          isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)]" : "text-stone-300 font-mono"
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                        </svg>
                        <span>Voice Note</span>
                      </span>
                      {isRecordingAudio && (
                        <span className="text-red-400 font-bold tabular-nums text-xs flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          00:{audioSeconds.toString().padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleToggleVoiceRecording}
                        className={`min-h-[44px] px-4 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2 ${
                          isRecordingAudio
                            ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 animate-pulse"
                            : isNurulIqraWedding
                              ? "bg-red-50 hover:bg-red-100 text-[#c51d24] border border-red-100 font-medium"
                              : audioUrl
                                ? "bg-white/15 hover:bg-white/20 text-white border border-white/20"
                                : "bg-white/10 hover:bg-white/15 text-stone-200 border border-white/15"
                        }`}
                      >
                        {isRecordingAudio ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-sm bg-white" />
                            <span>Berhenti</span>
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            </svg>
                            <span>{audioUrl ? "Rekam Ulang" : "Rekam Suara"}</span>
                          </>
                        )}
                      </button>

                      {audioUrl && !isRecordingAudio && (
                        <audio src={audioUrl} controls className="h-9 flex-1 max-w-[190px] opacity-90 rounded-lg" />
                      )}
                    </div>
                  </div>
                )}

                {saveError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-medium">
                    {saveError}
                  </div>
                )}
              </div>

              {/* Submit & Action Buttons */}
              <div className="space-y-2.5 pt-3">
                <button
                  disabled={isSaving}
                  onClick={handleSaveToGallery}
                  className={`w-full min-h-[54px] font-bold text-sm uppercase tracking-wider transition-all rounded-2xl shadow-xl flex items-center justify-center gap-2.5 active:scale-[0.98] ${
                    isNurulIqraWedding
                      ? "bg-[#c51d24] hover:bg-[#a8161c] disabled:bg-stone-200 disabled:text-stone-400 text-white shadow-red-700/25 font-[family-name:var(--font-cinzel)]"
                      : isJayaRikaWedding
                        ? "bg-[#224DA5] hover:bg-[#1b3e85] disabled:bg-stone-800 disabled:text-stone-500 text-white shadow-blue-950/40"
                        : "bg-white hover:bg-stone-100 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 shadow-black/40"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      <span>Menyimpan ke Galeri...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim ke Galeri</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep("preview")}
                  className={`w-full min-h-[44px] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    isNurulIqraWedding ? "text-stone-500 hover:text-[#c51d24]" : "text-stone-400 hover:text-white"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span>Kembali ke Pratinjau Foto</span>
                </button>
              </div>
            </div>
          </main>
        )
      }

      {/* ─── STEP 6: FINISHED ─── */}
      {
        currentStep === "finished" && (
          <main className={`flex-1 flex flex-col items-center justify-center px-5 py-8 relative z-10 ${isNurulIqraWedding ? "bg-transparent text-stone-900" : ""}`}>
            <div className="w-full max-w-sm text-center space-y-6">
              <div className="space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold tracking-tight ${isNurulIqraWedding ? "text-stone-950 font-[family-name:var(--font-cinzel)]" : "text-white"}`}>
                  Foto Berhasil Dikirim
                </h3>
                <p className={`text-sm ${isNurulIqraWedding ? "text-stone-600" : "text-stone-400"}`}>
                  Terima kasih, <strong className={isNurulIqraWedding ? "text-[#c51d24] font-semibold" : "text-stone-200"}>{guestName}</strong>. Foto Anda telah tersimpan di galeri pernikahan.
                </p>
              </div>

              {compositeDataUrl && (
                <div className={`flex justify-center rounded-2xl border p-3 ${isNurulIqraWedding ? "bg-white/95 border-2 border-red-100 shadow-xl shadow-red-950/5" : "bg-black/30 border-stone-800"
                  }`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={compositeDataUrl}
                    alt="Foto tersimpan"
                    className="max-h-56 object-contain rounded-xl drop-shadow"
                  />
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={typeof navigator !== "undefined" && "share" in navigator ? handleShare : handleDownload}
                  className={`w-full min-h-[52px] font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg ${isNurulIqraWedding
                    ? "bg-[#c51d24] hover:bg-[#a8161c] active:scale-[0.98] text-white shadow-red-700/25 font-[family-name:var(--font-cinzel)]"
                    : isJayaRikaWedding
                      ? "bg-[#224DA5] hover:bg-[#1b3e85] active:scale-[0.98] text-white shadow-blue-950/30 font-semibold"
                      : "bg-white active:bg-stone-200 text-stone-950 font-semibold"
                    }`}
                >
                  {typeof navigator !== "undefined" && "share" in navigator ? "Bagikan Foto" : "Download Foto"}
                </button>

                <Link
                  href={`/event/${event.slug}/gallery`}
                  className={`w-full min-h-[48px] px-4 font-bold text-sm rounded-xl transition-colors flex items-center justify-center ${isNurulIqraWedding
                    ? "bg-white hover:bg-red-50 border-2 border-[#c51d24] text-[#c51d24] font-[family-name:var(--font-cinzel)] shadow-sm"
                    : isJayaRikaWedding
                      ? "bg-stone-900 hover:bg-blue-950/30 border border-[#224DA5] text-[#224DA5]"
                      : "bg-stone-800 active:bg-stone-700 border border-stone-700 text-stone-200"
                    }`}
                >
                  Lihat Galeri Pernikahan
                </Link>

                <button
                  onClick={handleNewSession}
                  className={`w-full min-h-[44px] text-sm transition-colors ${isNurulIqraWedding ? "text-stone-500 hover:text-[#c51d24]" : "text-stone-500 active:text-stone-300"
                    }`}
                >
                  Ambil Foto Baru
                </button>
              </div>
            </div>
          </main>
        )
      }

      {/* Footer (hidden for Nurul & Iqra, custom wedding, welcome, frame_select, camera, preview, and guestbook) */}
      {
        !isNurulIqraWedding && !isCustomWedding && currentStep !== "welcome" && currentStep !== "frame_select" && currentStep !== "camera" && currentStep !== "preview" && currentStep !== "guestbook" && (
          <footer
            className="border-t border-stone-800/40 bg-[#111113] px-4 py-3 text-center text-[11px] text-stone-600"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-ruangtemu.jpg" alt="RUANGTEMU" className="w-3.5 h-3.5 rounded-xs object-cover inline-block" />
              <span>RUANGTEMU Photobooth • Palopo</span>
            </div>
          </footer>
        )
      }
        </div>
      </div>
    </div>
  );
}
