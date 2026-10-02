"use client";

import { useState } from "react";
import Link from "next/link";
import { EventItem, Booking, Package, GalleryEntry, BookingStatus } from "@/types";
import { formatRupiah, formatDate } from "@/lib/utils";

interface AdminViewProps {
  initialEvents: EventItem[];
  initialBookings: Booking[];
  initialPackages: Package[];
  initialEntries: GalleryEntry[];
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

  const [activeTab, setActiveTab] = useState<"overview" | "events" | "bookings" | "gallery" | "packages">("overview");

  const [events, setEvents] = useState<EventItem[]>(initialEvents);
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

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventPayload = {
      slug: newEvent.slug || newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      title: newEvent.title,
      host_name: newEvent.host_name,
      client_name: newEvent.host_name,
      event_name: newEvent.title,
      event_type: "wedding",
      date: newEvent.date || new Date().toISOString().split("T")[0],
      venue: newEvent.venue || "Banua Subur Hall",
      city: newEvent.city,
      description: newEvent.description,
      is_active: true,
      allow_guestbook: true,
      allow_voice_note: true,
      allow_custom_frame: true,
      default_frame_config: {
        type: "strip_3",
        backgroundColor: "#18181b",
        borderColor: "#e7e5e4",
        textContent: newEvent.host_name,
        subTextContent: `${newEvent.date} • ${newEvent.venue}, ${newEvent.city}`,
        fontFamily: "sans",
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
        setEvents([data.event, ...events]);
      } else {
        // Fallback local state if server returned custom status
        const created: EventItem = {
          ...eventPayload,
          id: `evt-${Date.now()}`,
          event_type: "wedding",
          created_at: new Date().toISOString(),
          default_frame_config: eventPayload.default_frame_config as any,
        };
        setEvents([created, ...events]);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      const fallback: EventItem = {
        ...eventPayload,
        id: `evt-${Date.now()}`,
        event_type: "wedding",
        created_at: new Date().toISOString(),
        default_frame_config: eventPayload.default_frame_config as any,
      };
      setEvents([fallback, ...events]);
    }

    setIsCreatingEvent(false);
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

                <button
                  type="submit"
                  className="min-h-[40px] px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs uppercase tracking-wider transition-colors"
                >
                  Simpan Acara
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
                    <th className="p-4 text-right">Tautan Langsung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-stone-900">{evt.title}</div>
                        <div className="text-stone-500">{evt.host_name}</div>
                        <div className="font-mono text-[10px] text-stone-400 mt-0.5">/event/{evt.slug}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-stone-800">{evt.date}</div>
                        <div className="text-stone-500">{evt.venue}, {evt.city}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          Aktif
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3 font-mono text-[11px]">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
