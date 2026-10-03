"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { EventItem, FrameConfig, FrameType, CameraFilter } from "@/types";
import { renderPhotoboothFrame } from "@/lib/frame-canvas";
import { VoiceNoteRecorder } from "@/lib/audio";

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

export function VirtualBooth({ event }: VirtualBoothProps) {
  const isNurulIqraWedding =
    event.slug === "iqranurul-wedding" ||
    event.slug.toLowerCase().includes("nurul") ||
    event.title.toLowerCase().includes("nurul");

  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Multi-shot
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);

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
    if (frameConfig.photoSlots && frameConfig.photoSlots.length > 0) {
      const idx = Math.min(Math.max(0, shotIndex), frameConfig.photoSlots.length - 1);
      const slot = frameConfig.photoSlots[idx];
      if (slot && slot.width > 0 && slot.height > 0) {
        return slot.width / slot.height;
      }
    }
    switch (frameConfig.type) {
      case "polaroid": return 1;
      case "deluxe": return 0.75;
      case "grid_4": return 1.25;
      case "strip_3":
      default: return 1.45;
    }
  }, [frameConfig]);

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

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraState("requesting");

    try {
      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setCameraState("ready");
    } catch {
      setCameraState("error");
      setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diaktifkan pada browser Anda.");
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ─── Photo Capture ────────────────────────────────────────────

  const takeSinglePhoto = (targetAspect?: number): string | null => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 960;
    const videoAspect = vWidth / vHeight;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = vWidth;
    let sourceHeight = vHeight;

    if (targetAspect && targetAspect > 0) {
      if (videoAspect > targetAspect) {
        // Video is wider than target crop
        sourceHeight = vHeight;
        sourceWidth = Math.round(vHeight * targetAspect);
        sourceX = Math.round((vWidth - sourceWidth) / 2);
        sourceY = 0;
      } else {
        // Video is taller than target crop
        sourceWidth = vWidth;
        sourceHeight = Math.round(vWidth / targetAspect);
        sourceX = 0;
        sourceY = Math.round((vHeight - sourceHeight) / 2);
      }
    }

    const maxDim = 1280;
    let outWidth = sourceWidth;
    let outHeight = sourceHeight;
    if (outWidth > maxDim || outHeight > maxDim) {
      if (outWidth > outHeight) {
        outWidth = maxDim;
        outHeight = Math.round(maxDim / (targetAspect || videoAspect));
      } else {
        outHeight = maxDim;
        outWidth = Math.round(maxDim * (targetAspect || videoAspect));
      }
    }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = outWidth;
    tempCanvas.height = outHeight;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return null;

    ctx.translate(outWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outWidth,
      outHeight
    );

    return tempCanvas.toDataURL("image/jpeg", 0.88);
  };

  const triggerFlash = () => {
    if (!flashRef.current) return;
    const el = flashRef.current;
    el.style.opacity = "1";
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.style.opacity = "0";
      }, 100);
    });
  };

  const startPhotoSequence = () => {
    if (cameraState !== "ready") return;

    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setCameraState("countdown");

    let shotsTaken = 0;
    const photos: string[] = [];

    const captureNext = () => {
      let count = 3;
      setCountdown(count);

      countdownTimerRef.current = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setCountdown(null);
          setCameraState("capturing");

          triggerFlash();

          const slotAspect = getTargetSlotAspect(shotsTaken);
          const photo = takeSinglePhoto(slotAspect);
          if (photo) {
            photos.push(photo);
            setCapturedPhotos([...photos]);
          }

          shotsTaken++;
          setCurrentShotIndex(shotsTaken);

          if (shotsTaken < requiredShots) {
            setTimeout(() => {
              setCameraState("countdown");
              captureNext();
            }, 1000);
          } else {
            setCameraState("processing");
            stopCamera();
            generateComposite(photos);
            setCurrentStep("preview");
          }
        }
      }, 1000);
    };

    captureNext();
  };

  // ─── Canvas Composite ─────────────────────────────────────────

  const generateComposite = async (photosToUse: string[]) => {
    if (!canvasRef.current) return;
    setIsCompositing(true);
    try {
      const dataUrl = await renderPhotoboothFrame(canvasRef.current, {
        photos: photosToUse,
        config: frameConfig,
        filter: selectedFilter,
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

  const handleSaveToGallery = async () => {
    if (!compositeDataUrl || isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`/api/events/${event.slug}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName || "Tamu",
          photo_url: compositeDataUrl,
          voice_note_url: audioBase64 || null,
          message: guestMessage || "",
          filter_used: selectedFilter,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
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

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className={`min-h-[100dvh] flex flex-col relative ${isNurulIqraWedding && currentStep !== "camera"
      ? "bg-white text-stone-900 selection:bg-red-100 selection:text-red-900"
      : "bg-[#111113] text-stone-100 selection:bg-stone-700 selection:text-white"
      }`}>
      {/* Decorative Halftone Dot Pattern matching the poster for Nurul & Iqra Theme */}
      {isNurulIqraWedding && currentStep !== "camera" && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none opacity-25 z-0"
          style={{
            backgroundImage: "radial-gradient(#9ca3af 1.2px, transparent 1.2px)",
            backgroundSize: "13px 13px",
            maskImage: "radial-gradient(ellipse at center, transparent 35%, black 100%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, transparent 35%, black 100%)",
          }}
        />
      )}

      {/* Minimal Top Bar (hidden on welcome and name_input screen for Nurul & Iqra to showcase clean bridal layout) */}
      {(!isNurulIqraWedding || (currentStep !== "welcome" && currentStep !== "name_input")) && (
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

      {/* ─── STEP 1: WELCOME POSTER / SPLASH (CUSTOM FULL-PAGE BRIDAL UI FOR NURUL & IQRA) ─── */}
      {currentStep === "welcome" && isNurulIqraWedding && (
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

      {/* ─── STEP 1.5: NAME INPUT SCREEN (SEPARATE STEP AFTER SPLASH DELAY) ─── */}
      {currentStep === "name_input" && (
        <main
          className={`flex-1 flex flex-col px-5 overflow-y-auto relative z-10 min-h-[100dvh] justify-between ${
            isNurulIqraWedding ? "bg-transparent text-stone-900" : "bg-[#111113] text-stone-100"
          }`}
          style={{
            paddingTop: "max(1.25rem, env(safe-area-inset-top))",
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-between">
            {/* Top Navigation - positioned cleanly at the upper section */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setCurrentStep("welcome")}
                className={`min-h-[44px] px-3.5 flex items-center gap-1.5 text-xs font-medium rounded-full transition-colors ${
                  isNurulIqraWedding ? "text-[#c51d24] hover:text-[#a8161c] bg-red-50/90 hover:bg-red-100 border border-red-100 shadow-sm" : "text-stone-400 active:text-white"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                <span>Lihat Poster</span>
              </button>

              <Link
                href={`/event/${event.slug}/gallery`}
                className={`min-h-[44px] text-xs font-medium flex items-center gap-1 px-3.5 py-1.5 rounded-full border shadow-sm transition-colors ${
                  isNurulIqraWedding ? "text-[#c51d24] hover:text-[#a8161c] bg-red-50/90 hover:bg-red-100 border-red-100" : "text-stone-300 bg-stone-900 border-stone-800"
                }`}
              >
                <span>Galeri Foto</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </Link>
            </div>

            {/* Middle Section: Wedding Title Header & Name Input Card */}
            <div className="my-auto py-3 space-y-4">
              {/* Wedding Title Header */}
              {isNurulIqraWedding ? (
                <div className="text-center flex flex-col items-center">
                  <span className="font-[family-name:var(--font-great-vibes)] text-3xl sm:text-4xl text-[#c51d24] leading-tight select-none">
                    The Wedding of
                  </span>
                  <div className="mt-0.5">
                    <h1 className="font-[family-name:var(--font-cinzel)] font-bold text-2xl sm:text-3xl text-[#c51d24] tracking-tight border-b-2 border-[#c51d24] pb-1 px-4 inline-block select-none">
                      Nurul & Iqra
                    </h1>
                  </div>
                  <div className="font-[family-name:var(--font-great-vibes)] text-2xl text-[#c51d24] mt-1 select-none">
                    05/10/2026
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <div className="inline-block px-3 py-1 bg-[#c47a5a]/15 text-[#c47a5a] text-xs font-medium rounded-full">
                    Virtual Photobooth
                  </div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    {event.host_name}
                  </h2>
                </div>
              )}

              {/* Name Input Card */}
              <div
                className={`p-6 rounded-2xl border space-y-4 shadow-xl ${
                  isNurulIqraWedding ? "bg-white/95 backdrop-blur-sm border-2 border-[#c51d24]/20 shadow-red-950/5" : "bg-stone-900 border-stone-800 shadow-md"
                }`}
              >
                <div className="text-center space-y-1">
                  <label
                    className={`block text-xs uppercase tracking-widest font-bold ${
                      isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)]" : "text-stone-300 font-mono"
                    }`}
                  >
                    Masukkan Nama Anda
                  </label>
                  <p className={`text-xs ${isNurulIqraWedding ? "text-stone-600" : "text-stone-400"}`}>
                    Nama Anda akan tertera pada hasil foto dan pesan ucapan tamu
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    autoFocus
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
                    className={`w-full min-h-[52px] px-4 text-center font-semibold text-base outline-none transition-all rounded-xl ${
                      isNurulIqraWedding
                        ? "bg-stone-50/70 border-2 border-[#c51d24]/30 focus:border-[#c51d24] focus:bg-white focus:ring-4 focus:ring-[#c51d24]/10 text-stone-900 placeholder:text-stone-400 shadow-inner"
                        : "bg-stone-950 border border-stone-700 focus:border-stone-400 text-white"
                    }`}
                  />
                </div>

                <button
                  disabled={!guestName.trim()}
                  onClick={() => setCurrentStep("frame_select")}
                  className={`w-full min-h-[52px] py-3 font-bold text-sm uppercase tracking-wider transition-all rounded-xl shadow-lg flex items-center justify-center gap-2 ${
                    isNurulIqraWedding
                      ? "bg-[#c51d24] hover:bg-[#a8161c] active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400 text-white shadow-red-700/25 font-[family-name:var(--font-cinzel)]"
                      : "bg-white hover:bg-stone-100 active:bg-stone-200 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950"
                  }`}
                >
                  <span>Lanjut Pilih Frame</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            {/* Bottom Credits - positioned at the bottom */}
            <div className="py-2 text-center mt-auto">
              <p className={`text-[11px] ${isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)] font-bold tracking-widest uppercase select-none" : "text-stone-500"}`}>
                Virtual Photobooth by <strong>RUANGTEMU PHOTOBOOTH</strong>
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ─── STEP 1: WELCOME (DEFAULT DARK THEME FOR OTHER EVENTS) ─── */}
      {
        currentStep === "welcome" && !isNurulIqraWedding && (
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
      {
        currentStep === "frame_select" && (
          <main className={`flex-1 flex flex-col px-5 py-6 overflow-y-auto relative z-10 ${isNurulIqraWedding ? "bg-transparent text-stone-900" : ""}`}>
            <div className="w-full max-w-sm mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs uppercase tracking-wider ${isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)] font-bold bg-red-50 px-2.5 py-0.5 rounded-full inline-block border border-red-100 mb-1" : "text-[#c47a5a] font-semibold"}`}>
                    Langkah 1 / 3
                  </div>
                  <h3 className={`text-xl font-bold tracking-tight ${isNurulIqraWedding ? "text-stone-950 font-[family-name:var(--font-cinzel)] text-2xl" : "text-white"}`}>
                    {assignedFrames ? "Pilih Frame Acara" : "Pilih Frame"}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isNurulIqraWedding ? "text-stone-600" : "text-stone-400"}`}>
                    {assignedFrames
                      ? `Pilih 1 dari ${assignedFrames.length} frame yang telah disiapkan untuk acara ini`
                      : "Pilih format tampilan foto Anda"}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(isNurulIqraWedding ? "name_input" : "welcome")}
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-colors ${isNurulIqraWedding ? "text-[#c51d24] hover:text-[#a8161c] bg-red-50/90 hover:bg-red-100 border border-red-100 shadow-sm" : "text-stone-400 active:text-white"
                    }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
              </div>

              {/* Frame Cards */}
              <div className="space-y-3">
                {assignedFrames ? (
                  assignedFrames.map((frame, index) => {
                    const isSelected = selectedFrameId === frame.id;
                    const shots = frame.config_json?.photoCount || frame.config_json?.photoSlots?.length || getShotsForType(frame.template_type);
                    const overlayUrl = frame.preview_url || frame.config_json?.customOverlayUrl;

                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => {
                          setSelectedFrameId(frame.id);
                          setFrameConfig({
                            ...frame.config_json,
                            type: frame.template_type,
                            customOverlayUrl: overlayUrl,
                          });
                        }}
                        className={`w-full min-h-[92px] p-3.5 flex items-center gap-3.5 border rounded-2xl transition-all text-left active:scale-[0.98] ${isSelected
                          ? isNurulIqraWedding
                            ? "bg-white border-2 border-[#c51d24] ring-4 ring-[#c51d24]/10 shadow-lg shadow-red-950/10"
                            : "bg-stone-900 border-white ring-1 ring-white/60 shadow-lg"
                          : isNurulIqraWedding
                            ? "bg-white/95 border border-stone-200 hover:border-[#c51d24]/40 text-stone-900 shadow-sm"
                            : "bg-stone-900/60 border-stone-800 hover:border-stone-700 active:bg-stone-800"
                          }`}
                      >
                        {/* Frame PNG Visual Preview Thumbnail */}
                        <div
                          className={`w-16 h-20 shrink-0 border rounded-xl p-1 flex items-center justify-center relative overflow-hidden ${isNurulIqraWedding ? "bg-stone-50 border-2 border-stone-200/80" : "bg-stone-950 border-stone-800"
                            }`}
                          style={{
                            backgroundImage: `radial-gradient(#888 1px, transparent 1px)`,
                            backgroundSize: "6px 6px",
                          }}
                        >
                          {overlayUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={overlayUrl}
                              alt={frame.name}
                              className="max-h-full max-w-full object-contain drop-shadow"
                            />
                          ) : (
                            <span className="text-[10px] font-mono text-stone-500">PNG</span>
                          )}
                        </div>

                        {/* Frame Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${isNurulIqraWedding ? "bg-red-50 text-[#c51d24] font-bold border border-red-100 font-[family-name:var(--font-cinzel)]" : "bg-stone-800 text-stone-300 font-mono"
                              }`}>
                              Frame {index + 1}
                            </span>
                            <span className={`text-[11px] font-semibold ${isNurulIqraWedding ? "text-[#c51d24]" : "text-[#c47a5a]"}`}>
                              {shots} Pose
                            </span>
                          </div>
                          <div className={`text-sm font-bold mt-1 truncate ${isNurulIqraWedding ? "text-stone-950 font-[family-name:var(--font-cinzel)]" : "text-white"}`}>
                            {frame.name}
                          </div>
                          <div className={`text-xs mt-0.5 ${isNurulIqraWedding ? "text-stone-500" : "text-stone-400"}`}>
                            {isSelected ? "Sedang dipilih untuk sesi foto" : "Ketuk untuk memilih frame ini"}
                          </div>
                        </div>

                        {/* Selected Checkmark Indicator */}
                        <div className="shrink-0">
                          {isSelected ? (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${isNurulIqraWedding ? "bg-[#c51d24] text-white shadow-red-900/20" : "bg-white text-stone-950"
                              }`}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                          ) : (
                            <div className={`w-7 h-7 rounded-full border-2 ${isNurulIqraWedding ? "border-stone-300" : "border-stone-700"}`} />
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  FRAME_TEMPLATES.map((tmpl) => {
                    const isSelected = frameConfig.type === tmpl.type;
                    return (
                      <button
                        key={tmpl.type}
                        onClick={() => setFrameConfig({ ...frameConfig, type: tmpl.type })}
                        className={`w-full min-h-[64px] p-4 flex items-center justify-between border rounded-lg transition-colors active:scale-[0.98] ${isSelected
                          ? "bg-white/10 border-white/40"
                          : "bg-stone-900/60 border-stone-800 active:bg-stone-800"
                          }`}
                      >
                        <div className="text-left">
                          <div className="text-sm font-medium text-white">{tmpl.name}</div>
                          <div className="text-xs text-stone-400">{tmpl.description}</div>
                        </div>
                        <div className="shrink-0 ml-3">
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-stone-600" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Sticker Picker only if not using full custom overlay */}
              {!assignedFrames && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-stone-400">Aksen Ikon</div>
                  <div className="flex gap-2 flex-wrap">
                    {["✦", "💍", "❤️", "🥂", "🎉", "⭐"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFrameConfig({ ...frameConfig, sticker: emoji })}
                        className={`min-w-[48px] min-h-[48px] flex items-center justify-center text-lg border rounded-lg transition-colors ${frameConfig.sticker === emoji
                          ? "bg-white text-stone-950 border-white"
                          : "bg-stone-900/60 border-stone-700 active:bg-stone-800"
                          }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => {
                  setCurrentStep("camera");
                  startCamera();
                }}
                className={`w-full min-h-[52px] py-3 font-bold text-sm uppercase tracking-wider transition-all rounded-xl shadow-lg ${isNurulIqraWedding
                  ? "bg-[#c51d24] hover:bg-[#a8161c] active:scale-[0.98] text-white shadow-red-700/25 font-[family-name:var(--font-cinzel)]"
                  : "bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-950 rounded-lg font-semibold"
                  }`}
              >
                Buka Kamera ({requiredShots} Foto)
              </button>
            </div>
          </main>
        )
      }

      {/* ─── STEP 3: CAMERA ─── */}
      {
        currentStep === "camera" && (
          <main className="flex-1 flex flex-col relative overflow-hidden">
            {/* Flash Overlay */}
            <div
              ref={flashRef}
              className="absolute inset-0 bg-white pointer-events-none z-30"
              style={{ opacity: 0, transition: "opacity 120ms ease-out" }}
            />

            {/* Progress bar */}
            <div className={`px-4 py-3 flex items-center justify-between backdrop-blur-sm z-10 ${isNurulIqraWedding ? "bg-black/75 text-white" : "bg-[#111113]/90 text-stone-200"
              }`}>
              <button
                disabled={cameraState === "countdown" || cameraState === "capturing"}
                onClick={() => {
                  stopCamera();
                  setCameraState("idle");
                  setCurrentStep("frame_select");
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 active:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>

              <div className={`text-sm font-semibold flex items-center gap-1.5 ${isNurulIqraWedding ? "text-white" : "text-stone-200"}`}>
                {isNurulIqraWedding && <span className="w-2 h-2 rounded-full bg-[#c51d24] animate-pulse" />}
                <span>Foto {currentShotIndex} / {requiredShots}</span>
              </div>

              <div className="w-11" />
            </div>

            {/* Camera Viewfinder */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
              {cameraState === "error" ? (
                <div className="px-6 py-8 text-center space-y-4 max-w-xs">
                  <div className="w-16 h-16 mx-auto rounded-full bg-stone-800 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 7.5a4 4 0 1 0 0-3" /><path d="m2 2 20 20" /><path d="M11.5 15H17a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" /><path d="M7 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" /></svg>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="min-h-[48px] px-6 bg-white text-stone-950 font-semibold text-sm rounded-lg"
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
                    className={`w-full h-full object-cover -scale-x-100 ${selectedFilter === "grayscale"
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

                  {/* Dark Mask Overlay with Framing Cutout Window */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden p-4">
                    <div
                      className="relative rounded-2xl transition-all duration-300 ease-out"
                      style={{
                        aspectRatio: `${getTargetSlotAspect(currentShotIndex)}`,
                        width: getTargetSlotAspect(currentShotIndex) >= 1 ? "min(88vw, 440px)" : "auto",
                        height: getTargetSlotAspect(currentShotIndex) < 1 ? "min(62vh, 480px)" : "auto",
                        maxWidth: "92%",
                        maxHeight: "82%",
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.72)",
                      }}
                    >
                      {/* Corner framing brackets */}
                      <div className="absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg shadow-sm" />
                      <div className="absolute -top-[1px] -right-[1px] w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg shadow-sm" />
                      <div className="absolute -bottom-[1px] -left-[1px] w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg shadow-sm" />
                      <div className="absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg shadow-sm" />

                      {/* Rule of thirds grid lines */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-white" />
                        <div className="border-r border-white" />
                        <div />
                      </div>

                      {/* Slot Info Badge on top of frame */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 text-[10px] font-mono tracking-wider text-white flex items-center gap-1.5 shadow-md whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span>
                          Batas Foto {currentShotIndex + 1}/{requiredShots} {getTargetSlotAspect(currentShotIndex) >= 1 ? "(Landscape)" : "(Portrait)"}
                        </span>
                      </div>

                      {/* Guidance helper at bottom of frame */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-sans text-white/80 border border-white/10 whitespace-nowrap">
                        Posisikan di dalam batas area
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                  <span className={`text-8xl font-bold drop-shadow-2xl ${isNurulIqraWedding ? "text-white" : "text-white"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {countdown}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div
              className={`border-t px-4 py-4 space-y-3 ${isNurulIqraWedding ? "bg-[#111113] border-stone-800" : "bg-[#111113] border-stone-800/60"
                }`}
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              {/* Filter Bar */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    disabled={cameraState !== "ready"}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`min-h-[40px] px-4 text-xs font-medium whitespace-nowrap border rounded-full transition-colors ${selectedFilter === f.id
                      ? isNurulIqraWedding
                        ? "bg-[#c51d24] text-white border-[#c51d24]"
                        : "bg-white text-stone-950 border-white"
                      : "bg-stone-900/60 text-stone-400 border-stone-700 active:bg-stone-800"
                      }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Capture Button */}
              <button
                disabled={cameraState !== "ready"}
                onClick={startPhotoSequence}
                className={`w-full min-h-[56px] font-bold text-base uppercase tracking-wider transition-all rounded-xl shadow-lg ${isNurulIqraWedding
                  ? "bg-[#c51d24] hover:bg-[#a8161c] active:scale-[0.98] disabled:bg-stone-800 disabled:text-stone-500 text-white"
                  : "bg-white hover:bg-stone-100 active:bg-stone-200 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950"
                  }`}
              >
                {cameraState === "countdown" || cameraState === "capturing"
                  ? "Mengambil Foto..."
                  : cameraState === "requesting"
                    ? "Menyiapkan Kamera..."
                    : "Ambil Foto"}
              </button>
            </div>
          </main>
        )
      }

      {/* ─── STEP 4: PREVIEW ─── */}
      {
        currentStep === "preview" && (
          <main className={`flex-1 flex flex-col px-5 py-6 overflow-y-auto relative z-10 ${isNurulIqraWedding ? "bg-transparent text-stone-900" : ""}`}>
            <div className="w-full max-w-md mx-auto space-y-5 flex-1 flex flex-col">
              <div>
                <div className={`text-xs uppercase tracking-wider ${isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)] font-bold bg-red-50 px-2.5 py-0.5 rounded-full inline-block border border-red-100 mb-1" : "text-[#c47a5a] font-semibold"}`}>
                  Langkah 2 / 3
                </div>
                <h3 className={`text-xl font-bold tracking-tight ${isNurulIqraWedding ? "text-stone-950 font-[family-name:var(--font-cinzel)] text-2xl" : "text-white"}`}>
                  Hasil Foto Photobooth
                </h3>
              </div>

              <div className={`flex-1 flex items-center justify-center rounded-2xl border p-3 min-h-0 ${isNurulIqraWedding ? "bg-white/95 backdrop-blur-sm border-2 border-red-100 shadow-xl shadow-red-950/5" : "bg-black/30 border-stone-800"
                }`}>
                {isCompositing ? (
                  <div className={`py-12 text-sm flex items-center gap-2 ${isNurulIqraWedding ? "text-[#c51d24] font-medium" : "text-stone-400"}`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c51d24] animate-ping" />
                    <span>Merender frame foto...</span>
                  </div>
                ) : compositeDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={compositeDataUrl}
                    alt="Hasil foto photobooth"
                    className="max-h-[55dvh] w-auto object-contain rounded-xl drop-shadow-md"
                  />
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setCurrentStep("camera");
                    setCapturedPhotos([]);
                    setCurrentShotIndex(0);
                    setCameraState("idle");
                    startCamera();
                  }}
                  className={`min-h-[50px] px-4 font-semibold text-sm rounded-xl transition-all active:scale-[0.98] ${isNurulIqraWedding
                    ? "bg-white hover:bg-red-50/50 border-2 border-stone-200 hover:border-[#c51d24] text-stone-700 hover:text-[#c51d24] shadow-sm"
                    : "bg-stone-800 active:bg-stone-700 border border-stone-700 text-stone-200"
                    }`}
                >
                  Foto Ulang
                </button>

                <button
                  onClick={() => setCurrentStep("guestbook")}
                  className={`min-h-[50px] px-4 font-bold text-sm uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${isNurulIqraWedding
                    ? "bg-[#c51d24] hover:bg-[#a8161c] text-white shadow-red-700/25 font-[family-name:var(--font-cinzel)]"
                    : "bg-white active:bg-stone-200 text-stone-950"
                    }`}
                >
                  <span>Lanjut</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </main>
        )
      }

      {/* ─── STEP 5: GUESTBOOK ─── */}
      {
        currentStep === "guestbook" && (
          <main className={`flex-1 flex flex-col px-5 py-6 overflow-y-auto relative z-10 ${isNurulIqraWedding ? "bg-transparent text-stone-900" : ""}`}>
            <div className="w-full max-w-sm mx-auto space-y-5">
              <div>
                <div className={`text-xs uppercase tracking-wider ${isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)] font-bold bg-red-50 px-2.5 py-0.5 rounded-full inline-block border border-red-100 mb-1" : "text-[#c47a5a] font-semibold"}`}>
                  Langkah 3 / 3
                </div>
                <h3 className={`text-xl font-bold tracking-tight ${isNurulIqraWedding ? "text-stone-950 font-[family-name:var(--font-cinzel)] text-2xl" : "text-white"}`}>
                  Ucapan & Doa
                </h3>
                <p className={`text-xs mt-1 ${isNurulIqraWedding ? "text-stone-600" : "text-stone-400"}`}>
                  Tulis pesan untuk {event.host_name}
                </p>
              </div>

              <div className="space-y-2">
                <label className={`block text-xs uppercase tracking-wider font-bold ${isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)]" : "text-stone-300 font-mono"
                  }`}>
                  Pesan Tertulis
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan ucapan dan doa terbaik Anda..."
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  className={`w-full px-4 py-3 text-base outline-none resize-none rounded-xl transition-all ${isNurulIqraWedding
                    ? "bg-white border-2 border-stone-200 focus:border-[#c51d24] focus:ring-4 focus:ring-[#c51d24]/10 text-stone-900 placeholder:text-stone-400 shadow-sm"
                    : "bg-stone-900/80 border border-stone-700 focus:border-stone-400 text-white"
                    }`}
                />
              </div>

              {event.allow_voice_note && (
                <div className={`p-4 rounded-xl space-y-3 border ${isNurulIqraWedding ? "bg-white/95 border-2 border-red-100/80 shadow-md shadow-red-950/5" : "bg-stone-900/60 border-stone-800"
                  }`}>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={isNurulIqraWedding ? "text-[#c51d24] font-[family-name:var(--font-cinzel)] font-bold uppercase tracking-wider" : "text-stone-300"}>Voice Note</span>
                    {isRecordingAudio && (
                      <span className="text-[#c51d24] font-semibold tabular-nums">
                        ● 00:{audioSeconds.toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleVoiceRecording}
                      className={`min-h-[44px] px-4 font-semibold text-sm rounded-xl transition-colors ${isRecordingAudio
                        ? "bg-red-900/80 text-white border border-red-700"
                        : isNurulIqraWedding
                          ? "bg-red-50 hover:bg-red-100 text-[#c51d24] border border-red-100 font-medium"
                          : "bg-stone-800 active:bg-stone-700 text-stone-200 border border-stone-700"
                        }`}
                    >
                      {isRecordingAudio ? "Berhenti" : "🎤 Rekam"}
                    </button>

                    {audioUrl && !isRecordingAudio && (
                      <audio src={audioUrl} controls className="h-9 flex-1 max-w-[180px]" />
                    )}
                  </div>
                </div>
              )}

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {saveError}
                </div>
              )}

              <div className="space-y-3 pt-1">
                <button
                  disabled={isSaving}
                  onClick={handleSaveToGallery}
                  className={`w-full min-h-[52px] font-bold text-sm uppercase tracking-wider transition-all rounded-xl shadow-lg ${isNurulIqraWedding
                    ? "bg-[#c51d24] hover:bg-[#a8161c] active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400 text-white shadow-red-700/25 font-[family-name:var(--font-cinzel)]"
                    : "bg-white hover:bg-stone-100 active:bg-stone-200 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950"
                    }`}
                >
                  {isSaving ? "Menyimpan ke Galeri..." : "Kirim ke Galeri"}
                </button>

                <button
                  onClick={() => setCurrentStep("preview")}
                  className={`w-full min-h-[44px] text-sm transition-colors ${isNurulIqraWedding ? "text-stone-500 hover:text-[#c51d24]" : "text-stone-500 active:text-stone-300"
                    }`}
                >
                  ← Kembali ke Pratinjau
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
                <div className="text-4xl">🎉</div>
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
                    : "bg-white active:bg-stone-200 text-stone-950 font-semibold"
                    }`}
                >
                  {typeof navigator !== "undefined" && "share" in navigator ? "Bagikan Foto" : "Download Foto"}
                </button>

                <Link
                  href={`/event/${event.slug}/gallery`}
                  className={`w-full min-h-[48px] px-4 font-bold text-sm rounded-xl transition-colors flex items-center justify-center ${isNurulIqraWedding
                    ? "bg-white hover:bg-red-50 border-2 border-[#c51d24] text-[#c51d24] font-[family-name:var(--font-cinzel)] shadow-sm"
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

      {/* Footer (hidden for Nurul & Iqra wedding per user request) */}
      {
        !isNurulIqraWedding && (
          <footer
            className="border-t border-stone-800/40 bg-[#111113] px-4 py-3 text-center text-[11px] text-stone-600"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            RUANGTEMU Photobooth • Palopo
          </footer>
        )
      }
    </div >
  );
}
