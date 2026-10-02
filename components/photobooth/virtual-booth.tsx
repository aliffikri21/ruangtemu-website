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

type Step = "welcome" | "frame_select" | "camera" | "preview" | "guestbook" | "finished";

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
  const [currentStep, setCurrentStep] = useState<Step>("welcome");

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

  const requiredShots = getShotsForType(frameConfig.type);

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

  const takeSinglePhoto = (): string | null => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const tempCanvas = document.createElement("canvas");

    const maxDim = 1280;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const captureWidth = Math.min(video.videoWidth, maxDim * dpr);
    const captureHeight = Math.min(video.videoHeight, maxDim * dpr);

    tempCanvas.width = captureWidth;
    tempCanvas.height = captureHeight;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return null;

    ctx.translate(captureWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, captureWidth, captureHeight);

    return tempCanvas.toDataURL("image/jpeg", 0.85);
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

          const photo = takeSinglePhoto();
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
    } catch (err) {
      console.error("Save error:", err);
      setSaveError("Foto belum berhasil disimpan. Periksa koneksi dan coba lagi.");
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
    <div className="min-h-[100dvh] bg-[#111113] text-stone-100 flex flex-col selection:bg-stone-700 selection:text-white">
      {/* Minimal Top Bar */}
      <header
        className="border-b border-stone-800/60 bg-[#111113]/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={`/event/${event.slug}/gallery`}
            className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 active:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-medium text-stone-100 truncate">{event.title}</h1>
            <p className="text-[11px] text-stone-500 truncate">{event.venue}, {event.city}</p>
          </div>
        </div>
      </header>

      <canvas ref={canvasRef} className="hidden" />

      {/* ─── STEP 1: WELCOME ─── */}
      {currentStep === "welcome" && (
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
      )}

      {/* ─── STEP 2: FRAME SELECTION ─── */}
      {currentStep === "frame_select" && (
        <main className="flex-1 flex flex-col px-5 py-6 overflow-y-auto">
          <div className="w-full max-w-sm mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#c47a5a] font-medium">Langkah 1 / 3</div>
                <h3 className="text-lg font-semibold text-white">
                  {assignedFrames ? "Pilih Frame Acara" : "Pilih Frame"}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {assignedFrames
                    ? `Pilih 1 dari ${assignedFrames.length} frame yang telah disiapkan untuk acara ini`
                    : "Pilih format tampilan foto Anda"}
                </p>
              </div>
              <button
                onClick={() => setCurrentStep("welcome")}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 active:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            </div>

            {/* Frame Cards */}
            <div className="space-y-3">
              {assignedFrames ? (
                assignedFrames.map((frame, index) => {
                  const isSelected = selectedFrameId === frame.id;
                  const shots = getShotsForType(frame.template_type);
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
                      className={`w-full min-h-[92px] p-3.5 flex items-center gap-3.5 border rounded-xl transition-all text-left active:scale-[0.98] ${
                        isSelected
                          ? "bg-stone-900 border-white ring-1 ring-white/60 shadow-lg"
                          : "bg-stone-900/60 border-stone-800 hover:border-stone-700 active:bg-stone-800"
                      }`}
                    >
                      {/* Frame PNG Visual Preview Thumbnail */}
                      <div
                        className="w-16 h-20 shrink-0 bg-stone-950 border border-stone-800 rounded-lg p-1 flex items-center justify-center relative overflow-hidden"
                        style={{
                          backgroundImage: `radial-gradient(#444 1px, transparent 1px)`,
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
                          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                            Frame {index + 1}
                          </span>
                          <span className="text-[11px] text-[#c47a5a] font-medium">
                            {shots} Foto
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-white mt-1 truncate">
                          {frame.name}
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {isSelected ? "Sedang dipilih untuk sesi foto" : "Ketuk untuk memilih frame ini"}
                        </div>
                      </div>

                      {/* Selected Checkmark Indicator */}
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-950 shadow">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-stone-700" />
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
                      className={`w-full min-h-[64px] p-4 flex items-center justify-between border rounded-lg transition-colors active:scale-[0.98] ${
                        isSelected
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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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
                      className={`min-w-[48px] min-h-[48px] flex items-center justify-center text-lg border rounded-lg transition-colors ${
                        frameConfig.sticker === emoji
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
              className="w-full min-h-[52px] py-3 bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-950 font-semibold text-sm uppercase tracking-wide transition-colors rounded-lg"
            >
              Buka Kamera ({requiredShots} Foto)
            </button>
          </div>
        </main>
      )}

      {/* ─── STEP 3: CAMERA ─── */}
      {currentStep === "camera" && (
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Flash Overlay */}
          <div
            ref={flashRef}
            className="absolute inset-0 bg-white pointer-events-none z-30"
            style={{ opacity: 0, transition: "opacity 120ms ease-out" }}
          />

          {/* Progress bar */}
          <div className="px-4 py-3 flex items-center justify-between bg-[#111113]/90 backdrop-blur-sm z-10">
            <button
              disabled={cameraState === "countdown" || cameraState === "capturing"}
              onClick={() => {
                stopCamera();
                setCameraState("idle");
                setCurrentStep("frame_select");
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 active:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <div className="text-sm font-medium text-stone-200">
              Foto {currentShotIndex} / {requiredShots}
            </div>

            <div className="w-11" />
          </div>

          {/* Camera Viewfinder */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            {cameraState === "error" ? (
              <div className="px-6 py-8 text-center space-y-4 max-w-xs">
                <div className="w-16 h-16 mx-auto rounded-full bg-stone-800 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 7.5a4 4 0 1 0 0-3"/><path d="m2 2 20 20"/><path d="M11.5 15H17a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1"/><path d="M7 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/></svg>
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
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover -scale-x-100 ${
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
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                <span className="text-8xl font-bold text-white drop-shadow-2xl" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {countdown}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div
            className="bg-[#111113] border-t border-stone-800/60 px-4 py-4 space-y-3"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {/* Filter Bar */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  disabled={cameraState !== "ready"}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`min-h-[40px] px-4 text-xs font-medium whitespace-nowrap border rounded-full transition-colors ${
                    selectedFilter === f.id
                      ? "bg-white text-stone-950 border-white"
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
              className="w-full min-h-[56px] bg-white hover:bg-stone-100 active:bg-stone-200 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-base uppercase tracking-wide transition-colors rounded-xl"
            >
              {cameraState === "countdown" || cameraState === "capturing"
                ? "Mengambil Foto..."
                : cameraState === "requesting"
                ? "Menyiapkan Kamera..."
                : "Ambil Foto"}
            </button>
          </div>
        </main>
      )}

      {/* ─── STEP 4: PREVIEW ─── */}
      {currentStep === "preview" && (
        <main className="flex-1 flex flex-col px-5 py-6 overflow-y-auto">
          <div className="w-full max-w-md mx-auto space-y-5 flex-1 flex flex-col">
            <div>
              <div className="text-xs text-[#c47a5a] font-medium">Langkah 2 / 3</div>
              <h3 className="text-lg font-semibold text-white">Hasil Foto</h3>
            </div>

            <div className="flex-1 flex items-center justify-center bg-black/30 rounded-lg border border-stone-800 p-3 min-h-0">
              {isCompositing ? (
                <div className="py-12 text-sm text-stone-400">Merender frame foto...</div>
              ) : compositeDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={compositeDataUrl}
                  alt="Hasil foto photobooth"
                  className="max-h-[55dvh] w-auto object-contain rounded"
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
                className="min-h-[48px] px-4 bg-stone-800 active:bg-stone-700 border border-stone-700 text-stone-200 font-medium text-sm rounded-lg transition-colors"
              >
                Foto Ulang
              </button>

              <button
                onClick={() => setCurrentStep("guestbook")}
                className="min-h-[48px] px-4 bg-white active:bg-stone-200 text-stone-950 font-semibold text-sm rounded-lg transition-colors"
              >
                Lanjut
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ─── STEP 5: GUESTBOOK ─── */}
      {currentStep === "guestbook" && (
        <main className="flex-1 flex flex-col px-5 py-6 overflow-y-auto">
          <div className="w-full max-w-sm mx-auto space-y-5">
            <div>
              <div className="text-xs text-[#c47a5a] font-medium">Langkah 3 / 3</div>
              <h3 className="text-lg font-semibold text-white">Ucapan & Doa</h3>
              <p className="text-sm text-stone-400 mt-1">
                Tulis pesan untuk {event.host_name}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-stone-300">Pesan Tertulis</label>
              <textarea
                rows={3}
                placeholder="Tuliskan ucapan dan doa terbaik Anda..."
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                className="w-full px-4 py-3 bg-stone-900/80 border border-stone-700 focus:border-stone-400 text-white text-base outline-none resize-none rounded-lg"
              />
            </div>

            {event.allow_voice_note && (
              <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-stone-300">Voice Note</span>
                  {isRecordingAudio && (
                    <span className="text-red-400 tabular-nums">
                      ● 00:{audioSeconds.toString().padStart(2, "0")}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleVoiceRecording}
                    className={`min-h-[44px] px-4 font-medium text-sm rounded-lg transition-colors ${
                      isRecordingAudio
                        ? "bg-red-900/60 text-red-200 border border-red-700"
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
              <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-sm text-red-300">
                {saveError}
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button
                disabled={isSaving}
                onClick={handleSaveToGallery}
                className="w-full min-h-[52px] bg-white hover:bg-stone-100 active:bg-stone-200 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-semibold text-sm uppercase tracking-wide transition-colors rounded-lg"
              >
                {isSaving ? "Menyimpan..." : "Kirim ke Galeri"}
              </button>

              <button
                onClick={() => setCurrentStep("preview")}
                className="w-full min-h-[44px] text-sm text-stone-500 active:text-stone-300"
              >
                ← Kembali ke Pratinjau
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ─── STEP 6: FINISHED ─── */}
      {currentStep === "finished" && (
        <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm text-center space-y-6">
            <div className="space-y-2">
              <div className="text-3xl">🎉</div>
              <h3 className="text-xl font-semibold text-white">
                Foto Berhasil Dikirim
              </h3>
              <p className="text-sm text-stone-400">
                Terima kasih, <strong className="text-stone-200">{guestName}</strong>. Foto Anda tersimpan di galeri event.
              </p>
            </div>

            {compositeDataUrl && (
              <div className="flex justify-center bg-black/30 rounded-lg border border-stone-800 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={compositeDataUrl}
                  alt="Foto tersimpan"
                  className="max-h-48 object-contain rounded"
                />
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={typeof navigator !== "undefined" && "share" in navigator ? handleShare : handleDownload}
                className="w-full min-h-[52px] bg-white active:bg-stone-200 text-stone-950 font-semibold text-sm uppercase tracking-wide rounded-lg transition-colors"
              >
                {typeof navigator !== "undefined" && "share" in navigator ? "Bagikan Foto" : "Download Foto"}
              </button>

              <Link
                href={`/event/${event.slug}/gallery`}
                className="w-full min-h-[48px] px-4 bg-stone-800 active:bg-stone-700 border border-stone-700 text-stone-200 font-medium text-sm rounded-lg transition-colors flex items-center justify-center"
              >
                Lihat Galeri
              </Link>

              <button
                onClick={handleNewSession}
                className="w-full min-h-[44px] text-sm text-stone-500 active:text-stone-300"
              >
                Ambil Foto Baru
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer
        className="border-t border-stone-800/40 bg-[#111113] px-4 py-3 text-center text-[11px] text-stone-600"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        RUANGTEMU Photobooth • Palopo
      </footer>
    </div>
  );
}
