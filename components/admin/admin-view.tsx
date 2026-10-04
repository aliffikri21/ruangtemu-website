"use client";

import { useState } from "react";
import Link from "next/link";
import { EventItem, Booking, Package, GalleryEntry, BookingStatus, FrameItem, FrameType, PhotoSlot } from "@/types";
import { formatRupiah, formatDate } from "@/lib/utils";
import { detectTransparentRegions } from "@/lib/frame-detect";

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

  const [activeTab, setActiveTab] = useState<"overview" | "events" | "edit" | "bookings" | "gallery" | "packages">("overview");

  const [events, setEvents] = useState<EventItem[]>(() =>
    [...(initialEvents || [])].sort(
      (a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
    )
  );
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [entries, setEntries] = useState<GalleryEntry[]>(initialEntries);

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    host_name: "",
    slug: "",
    date: "",
    venue: "",
    city: "Palopo",
    description: "",
  });

  const [frameSlots, setFrameSlots] = useState<FrameUploadSlot[]>(INITIAL_FRAME_SLOTS);

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    host_name: "",
    slug: "",
    date: "",
    venue: "",
    city: "Palopo",
    description: "",
  });
  const [editFrames, setEditFrames] = useState<FrameUploadSlot[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [togglingEventId, setTogglingEventId] = useState<string | null>(null);

  const handleStartEditEvent = (evt: EventItem) => {
    setEditingEvent(evt);
    setEditForm({
      title: evt.title || "",
      host_name: evt.host_name || "",
      slug: evt.slug || "",
      date: evt.date || "",
      venue: evt.venue || "",
      city: evt.city || "Palopo",
      description: evt.description || "",
    });

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

    // Mark as analyzing
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

  const handleEditFrameTypeChange = (index: number, template_type: FrameType) => {
    setEditFrames((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, template_type } : slot))
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

    if (editFrames.length === 0) {
      setEditErrorMsg("Acara harus memiliki minimal 1 frame.");
      return;
    }

    setIsSavingEdit(true);
    setEditErrorMsg("");
    setEditSuccessMsg("");

    const assigned_frames: FrameItem[] = editFrames
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
      assigned_frames,
      default_frame_config: assigned_frames.length > 0
        ? assigned_frames[0].config_json
        : undefined,
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
        setEditSuccessMsg("Perubahan nama event dan frame berhasil disimpan!");
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

    // Mark as analyzing
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

  const handleFrameTypeChange = (index: number, template_type: FrameType) => {
    setFrameSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, template_type } : slot))
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (email === "admin@ruangtemu.id" || email === "admin") &&
      (password === "ruangtemu2026" || password === "admin123" || password === "palopo2026")
    ) {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Kredensial tidak valid. Demo: admin@ruangtemu.id / ruangtemu2026");
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm("Hapus foto ini dari galeri acara?")) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
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
      const res = await fetch(`/api/events/${evt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, is_active: newIsActive }),
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

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assigned_frames: FrameItem[] = frameSlots
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

    const eventPayload = {
      slug: newEvent.slug || newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      title: newEvent.title,
      host_name: newEvent.host_name,
      client_name: newEvent.host_name,
      event_name: newEvent.title,
      event_type: "wedding" as const,
      date: newEvent.date || new Date().toISOString().split("T")[0],
      venue: newEvent.venue || "Banua Subur Hall",
      city: newEvent.city,
      description: newEvent.description,
      is_active: true,
      allow_guestbook: true,
      allow_voice_note: true,
      allow_custom_frame: true,
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
      } else {
        alert(data.error || "Gagal menyimpan event. Coba lagi.");
        setIsCreatingEvent(false);
        return;
      }
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Koneksi ke server gagal. Pastikan server berjalan dan coba lagi.");
      setIsCreatingEvent(false);
      return;
    }

    setIsCreatingEvent(false);
    setFrameSlots(INITIAL_FRAME_SLOTS);
    setNewEvent({
      title: "",
      host_name: "",
      slug: "",
      date: "",
      venue: "",
      city: "Palopo",
      description: "",
    });
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white border border-stone-200 p-8 space-y-6">
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47a5a]">
              [ Administrasi ]
            </span>
            <h1 className="text-xl font-light tracking-tight text-stone-900">
              Panel Pengelola
            </h1>
            <p className="text-xs text-stone-500">
              RUANGTEMU Photobooth Palopo
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-stone-50 border border-stone-300 text-stone-700 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 mb-1">
                Email
              </label>
              <input
                type="text"
                placeholder="admin@ruangtemu.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-xs outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-stone-50/50 border border-stone-200 focus:border-stone-900 focus:bg-white text-stone-900 text-xs outline-none transition-colors"
              />
              <div className="font-mono text-[10px] text-stone-400 mt-1">
                Demo: admin@ruangtemu.id / ruangtemu2026
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs uppercase tracking-wider transition-colors"
            >
              Masuk
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 text-center">
            <Link
              href="/"
              className="font-mono text-[11px] text-stone-500 hover:text-stone-900 transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = bookings.reduce((acc, b) => acc + (b.total_price || 0), 0);
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-mono text-sm tracking-tight font-medium text-stone-900">
            RUANGTEMU <span className="text-stone-400 font-normal">/ Admin</span>
          </Link>
          <span className="hidden sm:inline font-mono text-[10px] uppercase text-stone-400 border-l border-stone-200 pl-4">
            Palopo Operator
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            target="_blank"
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            Buka Web Publik ↗
          </Link>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-stone-500 hover:text-stone-900 border-l border-stone-200 pl-4 transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-6xl w-full mx-auto px-5 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 border-b border-stone-200 pb-px overflow-x-auto">
          {[
            { id: "overview", label: "Ringkasan" },
            { id: "events", label: `Event (${events.length})` },
            {
              id: "edit",
              label: editingEvent
                ? `Edit: ${editingEvent.title.length > 18 ? editingEvent.title.slice(0, 18) + "…" : editingEvent.title}`
                : "Edit Event",
            },
            { id: "bookings", label: `Reservasi (${bookings.length})` },
            { id: "gallery", label: `Foto (${entries.length})` },
            { id: "packages", label: "Paket" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`min-h-[40px] px-4 text-xs font-mono tracking-wider uppercase transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  isActive
                    ? "border-stone-900 text-stone-950 font-medium"
                    : "border-transparent text-stone-500 hover:text-stone-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-200 border border-stone-200">
              <div className="p-6 bg-white space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                  Total Event
                </div>
                <div className="text-3xl font-light text-stone-900">{events.length}</div>
                <div className="text-xs text-stone-500">Terdaftar di sistem</div>
              </div>

              <div className="p-6 bg-white space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                  Reservasi
                </div>
                <div className="text-3xl font-light text-stone-900">{bookings.length}</div>
                <div className="text-xs text-stone-500">{confirmedBookings} Dikonfirmasi</div>
              </div>

              <div className="p-6 bg-white space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                  Foto Tamu
                </div>
                <div className="text-3xl font-light text-stone-900">{entries.length}</div>
                <div className="text-xs text-stone-500">Unggahan virtual</div>
              </div>

              <div className="p-6 bg-white space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                  Estimasi Nilai
                </div>
                <div className="text-2xl font-light text-stone-900 truncate">
                  {formatRupiah(totalRevenue)}
                </div>
                <div className="text-xs text-stone-500">Pipeline booking</div>
              </div>
            </div>

            <div className="p-6 bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-stone-900 text-sm">Registrasi Event Pelanggan</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Buat URL instan untuk Photobooth, Galeri Live, Projection Videotron, dan QR Standee.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("events");
                  setIsCreatingEvent(true);
                }}
                className="min-h-[40px] px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs tracking-wider uppercase transition-colors shrink-0"
              >
                + Tambah Event
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-light text-stone-950">Daftar Event</h2>
                <p className="text-xs text-stone-500">
                  Kelola link photobooth dan layar proyektor untuk tiap acara
                </p>
              </div>
              <button
                onClick={() => setIsCreatingEvent(!isCreatingEvent)}
                className="min-h-[38px] px-4 py-2 border border-stone-300 hover:border-stone-900 text-xs font-mono uppercase tracking-wider transition-colors"
              >
                {isCreatingEvent ? "Batal" : "+ Event Baru"}
              </button>
            </div>

            {isCreatingEvent && (
              <form
                onSubmit={handleCreateEventSubmit}
                className="p-6 bg-white border border-stone-300 space-y-4"
              >
                <div className="font-mono text-xs uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-150">
                  Informasi Acara Baru
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                      Judul Acara *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="The Wedding of Andi & Sarah"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                      Nama Tuan Rumah / Pasangan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Andi & Sarah"
                      value={newEvent.host_name}
                      onChange={(e) => setNewEvent({ ...newEvent, host_name: e.target.value })}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                      Slug URL *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="wedding-andi-sarah"
                      value={newEvent.slug}
                      onChange={(e) => setNewEvent({ ...newEvent, slug: e.target.value })}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                      Tanggal Acara *
                    </label>
                    <input
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                      Lokasi / Gedung *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Gedung Saokotae"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                      className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* ─── UPLOAD FRAME PNG (2-3 FRAME) ─── */}
                <div className="pt-4 border-t border-stone-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
                        <span>Frame Photobooth Acara (Format PNG)</span>
                        <span className="px-2 py-0.5 bg-[#c47a5a]/10 text-[#c47a5a] text-[10px] rounded font-medium">
                          2 - 3 Frame untuk Tamu
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Unggah file frame dengan format PNG transparan. Tamu akan dapat memilih salah satu frame ini saat photobooth.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetPresetFrames}
                        className="text-[11px] font-mono text-stone-600 hover:text-stone-900 underline"
                      >
                        Muat Preset Ruangtemu
                      </button>
                      {frameSlots.length < 3 && (
                        <button
                          type="button"
                          onClick={handleAddFrameSlot}
                          className="min-h-[32px] px-3 border border-stone-300 hover:border-stone-900 text-stone-800 text-xs font-mono transition-colors"
                        >
                          + Tambah Frame ke-{frameSlots.length + 1}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {frameSlots.map((slot, index) => (
                      <div
                        key={slot.id}
                        className="p-4 bg-stone-50/70 border border-stone-200 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                            Pilihan Frame {index + 1}
                          </span>
                          {frameSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFrameSlot(index)}
                              className="text-stone-400 hover:text-red-600 text-xs font-mono transition-colors"
                              title="Hapus slot frame ini"
                            >
                              Hapus ✕
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-600 mb-1">
                            Nama Frame
                          </label>
                          <input
                            type="text"
                            required
                            value={slot.name}
                            onChange={(e) => handleFrameNameChange(index, e.target.value)}
                            placeholder={`contoh: Floral White ${index + 1}`}
                            className="w-full min-h-[36px] px-2.5 py-1 bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-600 mb-1">
                            Jumlah Jepretan (Auto-Detect)
                          </label>
                          {slot.isAnalyzing ? (
                            <div className="w-full min-h-[36px] px-2.5 py-1 bg-stone-100 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                              <span className="w-3 h-3 border-2 border-stone-400 border-t-stone-700 rounded-full animate-spin" />
                              Menganalisis area transparan...
                            </div>
                          ) : slot.detectedCount != null && slot.detectedCount > 0 ? (
                            <div className="w-full min-h-[36px] px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-mono flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {slot.detectedCount}
                              </span>
                              <span>{slot.detectedCount} area foto terdeteksi → {slot.detectedCount}× jepret</span>
                            </div>
                          ) : (
                            <div className="w-full min-h-[36px] px-2.5 py-1 bg-stone-50 border border-stone-200 text-xs text-stone-400 flex items-center">
                              Upload PNG transparan untuk mendeteksi area foto otomatis
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-600 mb-1">
                            File PNG Frame (Transparan)
                          </label>
                          <div className="flex gap-3 items-center">
                            <div
                              className="w-14 h-24 shrink-0 bg-stone-950 border border-stone-300 rounded p-1 flex items-center justify-center relative overflow-hidden"
                              style={{
                                backgroundImage: `radial-gradient(#444 1px, transparent 1px)`,
                                backgroundSize: "6px 6px",
                              }}
                            >
                              {slot.previewUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={slot.previewUrl}
                                  alt={slot.name}
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <span className="text-[9px] font-mono text-stone-500 text-center">PNG</span>
                              )}
                            </div>

                            <div className="flex-1 space-y-1.5 min-w-0">
                              <label className="inline-block cursor-pointer">
                                <span className="min-h-[34px] px-3 py-1.5 bg-white border border-stone-300 hover:border-stone-900 text-stone-800 text-[11px] font-mono uppercase inline-flex items-center gap-1.5 transition-colors">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                  Pilih File PNG
                                </span>
                                <input
                                  type="file"
                                  accept="image/png"
                                  onChange={(e) => handleFrameFileUpload(index, e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                              </label>

                              {slot.fileName && (
                                <div className="text-[11px] text-stone-600 font-mono truncate" title={slot.fileName}>
                                  {slot.fileName} {slot.fileSize ? `(${slot.fileSize})` : ""}
                                </div>
                              )}

                              {slot.error && (
                                <div className="text-[10px] text-red-600 font-mono leading-tight">
                                  {slot.error}
                                </div>
                              )}

                              <p className="text-[10px] text-stone-400 leading-tight">
                                Format wajib PNG transparan.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs uppercase tracking-wider transition-colors"
                >
                  Simpan Acara & Frame
                </button>
              </form>
            )}

            <div className="bg-white border border-stone-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 font-mono text-[10px] uppercase text-stone-500">
                  <tr>
                    <th className="p-4">Acara & Tuan Rumah</th>
                    <th className="p-4">Tanggal & Lokasi</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Tautan Langsung</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-stone-900">{evt.title}</div>
                        <div className="text-stone-500">{evt.host_name}</div>
                        <div className="font-mono text-[10px] text-stone-400 mt-0.5">/event/{evt.slug}</div>
                        {evt.assigned_frames && evt.assigned_frames.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400">
                              Frame PNG ({evt.assigned_frames.length}):
                            </span>
                            {evt.assigned_frames.map((fr, fIdx) => (
                              <span
                                key={fr.id || fIdx}
                                className="inline-flex items-center px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-[10px] text-stone-700 font-mono"
                              >
                                {fr.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-stone-800">{evt.date}</div>
                        <div className="text-stone-500">{evt.venue}, {evt.city}</div>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const active = evt.is_active !== false && evt.status !== "COMPLETED" && evt.status !== "ARCHIVED";
                          if (active) {
                            return (
                              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                                Aktif
                              </span>
                            );
                          }
                          if (evt.status === "ARCHIVED") {
                            return (
                              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 border border-stone-200">
                                Diarsipkan
                              </span>
                            );
                          }
                          return (
                            <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
                              Selesai
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5 font-mono text-[11px] flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleStartEditEvent(evt)}
                            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            Edit
                          </button>
                          <Link
                            href={`/event/${evt.slug}`}
                            target="_blank"
                            className="text-stone-700 hover:text-stone-950 underline"
                          >
                            Booth
                          </Link>
                          <Link
                            href={`/event/${evt.slug}/gallery`}
                            target="_blank"
                            className="text-stone-700 hover:text-stone-950 underline"
                          >
                            Galeri
                          </Link>
                          <Link
                            href={`/event/${evt.slug}/projection`}
                            target="_blank"
                            className="text-stone-700 hover:text-stone-950 underline"
                          >
                            Layar
                          </Link>
                          <Link
                            href={`/event/${evt.slug}/qr`}
                            target="_blank"
                            className="text-stone-700 hover:text-stone-950 underline"
                          >
                            QR
                          </Link>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono text-[10px]">
                          <button
                            type="button"
                            disabled={togglingEventId === evt.id}
                            onClick={() => handleToggleEventStatus(evt)}
                            className={`px-2.5 py-1 uppercase tracking-wider transition-colors inline-flex items-center gap-1 border ${
                              evt.is_active !== false && evt.status !== "COMPLETED" && evt.status !== "ARCHIVED"
                                ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            } ${togglingEventId === evt.id ? "opacity-50 cursor-wait" : ""}`}
                          >
                            {togglingEventId === evt.id ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : evt.is_active !== false && evt.status !== "COMPLETED" && evt.status !== "ARCHIVED" ? (
                              <>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>
                                Selesaikan
                              </>
                            ) : (
                              <>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                Aktifkan
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={deletingEventId === evt.id}
                            onClick={() => handleDeleteEvent(evt)}
                            className={`px-2.5 py-1 border border-red-200 text-red-600 hover:bg-red-50 uppercase tracking-wider transition-colors inline-flex items-center gap-1 ${
                              deletingEventId === evt.id ? "opacity-50 cursor-wait" : ""
                            }`}
                          >
                            {deletingEventId === evt.id ? (
                              <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            )}
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB EDIT EVENT */}
        {activeTab === "edit" && (
          <div className="space-y-6">
            {!editingEvent ? (
              <div className="p-8 bg-white border border-stone-200 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <div>
                  <h2 className="text-base font-medium text-stone-900">Pilih Event yang Ingin Diedit</h2>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    Pilih salah satu event yang sudah terdaftar untuk mengubah tampilan nama atau mengelola (tambah / hapus) frame photobooth.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2 pt-2">
                  {events.length === 0 ? (
                    <p className="text-xs text-stone-400 py-4 font-mono">Belum ada event yang terdaftar.</p>
                  ) : (
                    events.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 bg-stone-50 border border-stone-200 hover:border-stone-900 flex items-center justify-between transition-colors text-left"
                      >
                        <div>
                          <div className="font-medium text-stone-900 text-xs">{evt.title}</div>
                          <div className="text-[11px] text-stone-500">{evt.host_name} • {evt.date}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartEditEvent(evt)}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-mono text-[10px] uppercase tracking-wider transition-colors"
                        >
                          Edit Acara
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#c47a5a]">
                        [ Mode Edit Event ]
                      </span>
                      {editingEvent.is_active !== false && editingEvent.status !== "COMPLETED" && editingEvent.status !== "ARCHIVED" ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono">
                          Selesai
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-light text-stone-950 mt-1">
                      Edit Event: <span className="font-medium">{editingEvent.title}</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Ubah tampilan nama, informasi venue/tanggal, serta kelola (tambah, hapus, ganti) frame photobooth.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/event/${editingEvent.slug}`}
                      target="_blank"
                      className="min-h-[38px] px-3.5 py-1.5 border border-stone-300 hover:border-stone-900 text-xs font-mono uppercase tracking-wider text-stone-800 transition-colors inline-flex items-center gap-1.5"
                    >
                      Lihat Booth ↗
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("events");
                      }}
                      className="min-h-[38px] px-3.5 py-1.5 border border-stone-300 hover:border-stone-900 text-xs font-mono uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      ← Kembali ke Daftar
                    </button>
                  </div>
                </div>

                {/* Success / Error Messages */}
                {editSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>{editSuccessMsg}</span>
                    </div>
                    <Link
                      href={`/event/${editingEvent.slug}`}
                      target="_blank"
                      className="font-mono underline text-emerald-900 font-medium ml-4"
                    >
                      Buka Halaman Tamu ↗
                    </Link>
                  </div>
                )}

                {editErrorMsg && (
                  <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs">
                    {editErrorMsg}
                  </div>
                )}

                <form onSubmit={handleSaveEditSubmit} className="space-y-6">
                  {/* SECTION 1: TAMPILAN NAMA & INFORMASI ACARA */}
                  <div className="p-6 bg-white border border-stone-300 space-y-4">
                    <div className="font-mono text-xs uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-150 flex items-center justify-between">
                      <span>1. Tampilan Nama & Informasi Acara</span>
                      <span className="text-[10px] text-stone-400 font-mono normal-case">
                        ID: {editingEvent.id.slice(0, 8)}...
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                          Judul Acara (Tampilan Utama) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="The Wedding of Andi & Sarah"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                          Nama Tuan Rumah / Pasangan *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Andi & Sarah"
                          value={editForm.host_name}
                          onChange={(e) => setEditForm({ ...editForm, host_name: e.target.value })}
                          className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                          Slug URL *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="wedding-andi-sarah"
                          value={editForm.slug}
                          onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                          className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                        />
                        <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                          /event/{editForm.slug || "..."}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                          Tanggal Acara *
                        </label>
                        <input
                          type="date"
                          required
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                          Lokasi / Gedung *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Gedung Saokotae"
                          value={editForm.venue}
                          onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                          className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                          Kota
                        </label>
                        <input
                          type="text"
                          placeholder="Palopo"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-stone-600 mb-1">
                          Deskripsi / Ucapan Selamat Datang
                        </label>
                        <input
                          type="text"
                          placeholder="Selamat datang di photobooth pernikahan kami"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full min-h-[40px] px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs text-stone-900 outline-none focus:bg-white focus:border-stone-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: KELOLA FRAME PHOTOBOOTH */}
                  <div className="p-6 bg-white border border-stone-300 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-150">
                      <div>
                        <div className="font-mono text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
                          <span>2. Kelola Frame Acara</span>
                          <span className="px-2 py-0.5 bg-stone-900 text-white text-[10px] rounded font-mono">
                            {editFrames.length} Frame Aktif
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Anda dapat menambah frame baru, menghapus frame yang tidak digunakan, mengganti file PNG, atau mengubah nama tampilan frame.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleAddEditFrameSlot}
                          className="min-h-[34px] px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                        >
                          + Tambah Frame Baru
                        </button>
                        <div className="relative group">
                          <button
                            type="button"
                            className="min-h-[34px] px-3 py-1 border border-stone-300 hover:border-stone-900 text-stone-800 text-[11px] font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                          >
                            + Preset Frame ▾
                          </button>
                          <div className="hidden group-hover:block absolute right-0 top-full pt-1 z-20 w-48">
                            <div className="bg-white border border-stone-300 shadow-lg py-1 text-xs">
                              <button
                                type="button"
                                onClick={() => handleAddPresetToEditFrames(0)}
                                className="w-full text-left px-3 py-2 hover:bg-stone-100 font-mono text-[11px] text-stone-800"
                              >
                                Classic Floral Strip
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddPresetToEditFrames(1)}
                                className="w-full text-left px-3 py-2 hover:bg-stone-100 font-mono text-[11px] text-stone-800"
                              >
                                Midnight Navy Gold
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddPresetToEditFrames(2)}
                                className="w-full text-left px-3 py-2 hover:bg-stone-100 font-mono text-[11px] text-stone-800"
                              >
                                Modern Minimalist
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Frame Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {editFrames.map((slot, index) => (
                        <div
                          key={slot.id || index}
                          className="p-4 bg-stone-50 border border-stone-200 relative flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                            <div className="font-mono text-[11px] uppercase tracking-wider text-stone-700 font-semibold flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                                {index + 1}
                              </span>
                              <span>Frame {index + 1}</span>
                            </div>
                            {editFrames.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveEditFrameSlot(index)}
                                className="text-stone-400 hover:text-red-600 transition-colors p-1"
                                title="Hapus Frame Ini"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-stone-600 mb-1">
                              Nama Tampilan Frame *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Misal: Classic Floral"
                              value={slot.name}
                              onChange={(e) => handleEditFrameNameChange(index, e.target.value)}
                              className="w-full min-h-[36px] px-3 py-1 bg-white border border-stone-200 text-xs text-stone-900 outline-none focus:border-stone-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-stone-600 mb-1">
                              Jumlah Jepretan (Auto-Detect)
                            </label>
                            {slot.isAnalyzing ? (
                              <div className="w-full min-h-[36px] px-3 py-1 bg-stone-100 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                                <span className="w-3 h-3 border-2 border-stone-400 border-t-stone-700 rounded-full animate-spin" />
                                Menganalisis area transparan...
                              </div>
                            ) : slot.detectedCount != null && slot.detectedCount > 0 ? (
                              <div className="w-full min-h-[36px] px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-mono flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {slot.detectedCount}
                                </span>
                                <span>{slot.detectedCount} area foto terdeteksi → {slot.detectedCount}× jepret</span>
                              </div>
                            ) : slot.template_type !== "custom" ? (
                              <div className="w-full min-h-[36px] px-3 py-1 bg-amber-50 border border-amber-300 text-xs text-amber-800 font-mono flex items-center">
                                Preset frame — ganti file PNG untuk auto-detect
                              </div>
                            ) : (
                              <div className="w-full min-h-[36px] px-3 py-1 bg-stone-50 border border-stone-200 text-xs text-stone-400 flex items-center">
                                Upload PNG transparan untuk mendeteksi area foto
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-stone-600 mb-1">
                              File Frame PNG Transparan
                            </label>
                            <div className="flex gap-3 items-center">
                              <div
                                className="w-14 h-24 shrink-0 bg-stone-950 border border-stone-300 rounded p-1 flex items-center justify-center relative overflow-hidden"
                                style={{
                                  backgroundImage: `radial-gradient(#444 1px, transparent 1px)`,
                                  backgroundSize: "6px 6px",
                                }}
                              >
                                {slot.previewUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={slot.previewUrl}
                                    alt={slot.name}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                ) : (
                                  <span className="text-[9px] font-mono text-stone-500 text-center">PNG</span>
                                )}
                              </div>

                              <div className="flex-1 space-y-1.5 min-w-0">
                                <label className="inline-block cursor-pointer">
                                  <span className="min-h-[32px] px-2.5 py-1 bg-white border border-stone-300 hover:border-stone-900 text-stone-800 text-[10px] font-mono uppercase inline-flex items-center gap-1.5 transition-colors">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    Ganti PNG
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/png"
                                    onChange={(e) => handleEditFrameFileUpload(index, e.target.files?.[0] || null)}
                                    className="hidden"
                                  />
                                </label>

                                {slot.fileName && (
                                  <div className="text-[10px] text-stone-600 font-mono truncate" title={slot.fileName}>
                                    {slot.fileName} {slot.fileSize ? `(${slot.fileSize})` : ""}
                                  </div>
                                )}

                                {slot.error && (
                                  <div className="text-[10px] text-red-600 font-mono leading-tight">
                                    {slot.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SUBMIT BUTTONS */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="min-h-[44px] px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 text-white font-medium text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                    >
                      {isSavingEdit ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Menyimpan Perubahan...
                        </>
                      ) : (
                        "Simpan Perubahan Event & Frame"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("events")}
                      className="min-h-[44px] px-5 py-2.5 border border-stone-300 hover:border-stone-900 text-stone-700 hover:text-stone-950 font-mono text-xs uppercase tracking-wider transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-light text-stone-950">Reservasi Masuk</h2>
              <p className="text-xs text-stone-500">
                Data calon pelanggan dari formulir pemesanan online
              </p>
            </div>

            <div className="bg-white border border-stone-200 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 font-mono text-[10px] uppercase text-stone-500">
                  <tr>
                    <th className="p-4">Pemesan</th>
                    <th className="p-4">Acara & Tanggal</th>
                    <th className="p-4">Paket & Biaya</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-stone-900">{b.customer_name}</div>
                        <a
                          href={`https://wa.me/${b.customer_phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-[#c47a5a] hover:underline block mt-0.5"
                        >
                          {b.customer_phone} ↗
                        </a>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-stone-900">{b.event_name}</div>
                        <div className="font-mono text-stone-500">{b.event_date} ({b.event_time} WITA)</div>
                        <div className="text-stone-400 text-[11px]">{b.location}, {b.city}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-stone-700">{b.package_name}</div>
                        <div className="font-mono text-stone-950 font-medium">{formatRupiah(b.total_price)}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                            b.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : b.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-stone-100 text-stone-500 border-stone-200"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono text-[11px]">
                          <button
                            onClick={() => handleStatusChange(b.id, "confirmed")}
                            className="px-2 py-1 border border-stone-200 hover:border-stone-900 text-stone-700 transition-colors"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleStatusChange(b.id, "cancelled")}
                            className="px-2 py-1 border border-stone-200 hover:border-stone-900 text-stone-400 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GALLERY */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-light text-stone-950">Moderasi Foto Acara</h2>
              <p className="text-xs text-stone-500">
                Review dan hapus foto kiriman tamu secara live
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {entries.map((ent) => (
                <div
                  key={ent.id}
                  className="bg-white border border-stone-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-2 bg-stone-50 flex justify-center border-b border-stone-150">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ent.photo_url}
                      alt={ent.guest_name}
                      className="max-h-60 object-contain"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="font-medium text-stone-900 text-xs">{ent.guest_name}</div>
                    {ent.message && (
                      <p className="text-xs text-stone-600 italic leading-relaxed">&ldquo;{ent.message}&rdquo;</p>
                    )}
                    <div className="pt-2 flex items-center justify-between border-t border-stone-100 font-mono text-[10px]">
                      <span className="text-stone-400">
                        {formatDate(ent.created_at)}
                      </span>
                      <button
                        onClick={() => handleDeleteEntry(ent.id)}
                        className="text-stone-400 hover:text-stone-900 underline transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PACKAGES */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-light text-stone-950">Katalog Paket Layanan</h2>
              <p className="text-xs text-stone-500">
                Daftar paket dan spesifikasi teknis operasional Palopo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-6 bg-white border border-stone-200 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-stone-900 text-sm">{pkg.name}</h3>
                      <p className="text-xs text-stone-500">{pkg.tagline}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-stone-900 shrink-0">
                      {formatRupiah(pkg.price)}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-stone-600 border-t border-stone-150 pt-3">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-stone-400 font-mono text-[10px]">—</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
