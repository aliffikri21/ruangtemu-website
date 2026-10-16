"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";

interface DokuPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: string) => void;
  isProcessing: boolean;
  paymentSuccess: boolean;
  invoiceId: string;
  amount: number;
  eventName: string;
  hostName: string;
  packageName: string;
  durationDays: number;
  startDate: string;
  endDate: string;
}

export function DokuPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  isProcessing,
  paymentSuccess,
  invoiceId,
  amount,
  eventName,
  hostName,
  packageName,
  durationDays,
  startDate,
  endDate,
}: DokuPaymentModalProps) {
  const [activeChannel, setActiveChannel] = useState<"qris" | "va" | "cc">("qris");
  const [selectedBank, setSelectedBank] = useState<"bca" | "mandiri" | "bri" | "bni">("bca");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(899); // 14:59
  const [liveCheckoutUrl, setLiveCheckoutUrl] = useState<string | null>(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [realVaMap, setRealVaMap] = useState<Record<string, { vaNumber: string; howToPayUrl?: string }>>({});
  const [isLoadingVa, setIsLoadingVa] = useState(false);
  const [vaError, setVaError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLiveCheckoutUrl(null);
      setRealVaMap({});
      setStatusFeedback(null);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Fetch official DOKU Sandbox Checkout session if API is active
    const initDokuCheckout = async () => {
      setIsLoadingCheckout(true);
      try {
        const res = await fetch("/api/payment/doku/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: invoiceId,
            amount,
            eventName,
            customerName: hostName,
            packageName,
          }),
        });
        const data = await res.json();
        if (data.payment_url) {
          setLiveCheckoutUrl(data.payment_url);
        }
      } catch (err) {
        console.warn("DOKU live checkout notice:", err);
      } finally {
        setIsLoadingCheckout(false);
      }
    };

    initDokuCheckout();

    return () => clearInterval(interval);
  }, [isOpen, invoiceId, amount, eventName, hostName, packageName]);

  // Fetch real DOKU Sandbox Virtual Account Number for the selected bank
  useEffect(() => {
    if (!isOpen) return;
    if (realVaMap[selectedBank]) return;

    let active = true;
    setIsLoadingVa(true);
    setVaError(null);

    fetch("/api/payment/doku/va", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceNumber: `${invoiceId}-${selectedBank.toUpperCase()}`,
        amount,
        bank: selectedBank,
        customerName: hostName || "Admin RUANGTEMU",
        customerEmail: "admin@ruangtemu.id",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success && data.vaNumber) {
          setRealVaMap((prev) => ({
            ...prev,
            [selectedBank]: {
              vaNumber: data.vaNumber,
              howToPayUrl: data.howToPayUrl,
            },
          }));
        } else {
          setVaError(data.error || "Gagal menerbitkan nomor VA resmi dari DOKU");
        }
      })
      .catch((err) => {
        if (!active) return;
        setVaError(err?.message || "Koneksi ke API DOKU terputus");
      })
      .finally(() => {
        if (active) setIsLoadingVa(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, selectedBank, invoiceId, amount, hostName, realVaMap]);

  // Realtime Polling & Window Focus Listener for Payment Confirmation from DOKU Simulator
  const checkPaymentStatus = async (isManual = false) => {
    if (paymentSuccess || isProcessing) return;
    if (isManual) {
      setIsCheckingStatus(true);
      setStatusFeedback("Memeriksa status pembayaran di server DOKU...");
    }

    try {
      const res = await fetch(
        `/api/payment/doku/status?invoiceId=${encodeURIComponent(invoiceId)}&bank=${selectedBank}`
      );
      const data = await res.json();

      if (data.paid) {
        setStatusFeedback("✓ Pembayaran DOKU Lunas Terdeteksi!");
        const channelName =
          activeChannel === "qris"
            ? "DOKU_QRIS"
            : activeChannel === "va"
            ? `DOKU_VA_${selectedBank.toUpperCase()}`
            : "DOKU_CC";
        onSuccess(channelName);
      } else if (isManual) {
        setStatusFeedback("Belum ada pembayaran masuk di simulator DOKU.");
        setTimeout(() => setStatusFeedback(null), 3000);
      }
    } catch {
      if (isManual) {
        setStatusFeedback("Gagal memeriksa status. Coba lagi.");
        setTimeout(() => setStatusFeedback(null), 3000);
      }
    } finally {
      if (isManual) setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (!isOpen || paymentSuccess || isProcessing) return;

    // 1. Polling setiap 2.5 detik
    const interval = setInterval(() => {
      checkPaymentStatus(false);
    }, 2500);

    // 2. Langsung cek ketika tab RUANGTEMU dibuka kembali setelah dari tab Simulator DOKU
    const handleFocus = () => {
      checkPaymentStatus(false);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isOpen, paymentSuccess, isProcessing, invoiceId, selectedBank, activeChannel]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getVaNumber = (bank: string) => {
    const rawNumber = invoiceId.replace(/\D/g, "").padEnd(6, "8");
    switch (bank) {
      case "bca":
        return `8921 0822 ${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 6)}1`;
      case "mandiri":
        return `8892 1082 ${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 6)}2`;
      case "bri":
        return `1029 4821 ${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 6)}3`;
      case "bni":
        return `9881 2026 ${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 6)}4`;
      default:
        return `8921 0822 ${rawNumber.slice(0, 6)}`;
    }
  };

  const formatVaDisplay = (va: string) => {
    const cleaned = va.replace(/\s+/g, "");
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const activeRealVa = realVaMap[selectedBank]?.vaNumber;
  const currentVaRaw = activeRealVa || getVaNumber(selectedBank).replace(/\s/g, "");
  const currentVaDisplay = activeRealVa ? formatVaDisplay(activeRealVa) : getVaNumber(selectedBank);

  const handleCopyVa = (va: string) => {
    navigator.clipboard.writeText(va.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E0E5F2] my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* DOKU Header */}
        <div className="bg-gradient-to-r from-[#D9222A] via-[#E52534] to-[#C01B22] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-[#D9222A] font-black px-2.5 py-1 rounded-lg text-sm tracking-wider shadow-sm">
              DOKU
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider opacity-90">
                Payment Gateway
              </div>
              <div className="text-[11px] opacity-80">RUANGTEMU Official Merchant</div>
            </div>
          </div>
          <div className="bg-amber-400 text-stone-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone-900 animate-ping" />
            Sandbox Mode
          </div>
        </div>

        {/* Success Overlay if Payment Complete */}
        {paymentSuccess ? (
          <div className="p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 bg-[#E9FAF4] text-[#01B574] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-[#01B574] animate-ping opacity-25" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Pembayaran Sukses Dikonfirmasi DOKU</span>
              </div>
              <h3 className="text-2xl font-black text-[#1B2559]">Pembayaran Berhasil!</h3>
              <p className="text-xs text-[#8F9BBA] mt-1 max-w-sm mx-auto leading-relaxed">
                Paket <strong>{packageName}</strong> telah aktif untuk acara <strong>{eventName}</strong>.
              </p>
            </div>
            <div className="p-3 bg-[#F4F7FE] rounded-xl text-xs text-[#1B2559] font-mono space-y-1">
              <div>Invoice: <strong>{invoiceId}</strong> &bull; Lunas via DOKU Sandbox</div>
              <div className="text-[11px] text-[#8F9BBA]">Status aktivasi photobooth otomatis diperbarui</div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#8F9BBA] pt-2">
              <span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-[#01B574] rounded-full animate-spin" />
              <span>Mengalihkan kembali ke dashboard admin...</span>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Invoice & Order Summary */}
            <div className="p-4 bg-[#F4F7FE] rounded-2xl flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] text-[#8F9BBA] font-medium">Total Pembayaran</div>
                <div className="text-2xl font-extrabold text-[#1B2559] mt-0.5 font-mono">
                  {formatRupiah(amount)}
                </div>
                <div className="text-[11px] text-[#4318FF] font-semibold mt-1">
                  Paket {packageName} ({durationDays} Hari Lisensi)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#8F9BBA]">Batas Pembayaran</div>
                <div className="text-xs font-bold text-[#EE5D50] font-mono bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 mt-0.5">
                  {formatTimer(countdown)}
                </div>
                <div className="text-[10px] text-[#A3AED0] mt-1 truncate max-w-[140px]" title={invoiceId}>
                  {invoiceId}
                </div>
              </div>
            </div>

            {/* Event Info Brief */}
            <div className="text-xs text-[#8F9BBA] flex items-center justify-between px-1">
              <span>Acara: <strong className="text-[#1B2559]">{eventName}</strong></span>
              <span>Klien: <strong className="text-[#1B2559]">{hostName}</strong></span>
            </div>

            {/* DOKU Live API Integration Status Banner */}
            {liveCheckoutUrl ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Koneksi DOKU Sandbox API Aktif &amp; Valid
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono font-semibold">Live Staging</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-snug">
                  Kredensial DOKU Anda berhasil membuat sesi tagihan resmi. Anda dapat membuka halaman pembayaran resmi DOKU atau menggunakan simulator langsung di bawah.
                </p>
                <a
                  href={liveCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-9 bg-[#D9222A] hover:bg-[#C01B22] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Buka Halaman DOKU Checkout Resmi</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            ) : isLoadingCheckout ? (
              <div className="py-2 px-3 bg-stone-50 rounded-xl flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-[#D9222A] rounded-full animate-spin" />
                <span>Menghubungkan ke DOKU Sandbox API...</span>
              </div>
            ) : null}


            {/* Payment Channel Selection Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-[#F4F7FE] p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveChannel("qris")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeChannel === "qris"
                    ? "bg-white text-[#D9222A] shadow-sm"
                    : "text-[#8F9BBA] hover:text-[#1B2559]"
                }`}
              >
                QRIS Instant
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel("va")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeChannel === "va"
                    ? "bg-white text-[#D9222A] shadow-sm"
                    : "text-[#8F9BBA] hover:text-[#1B2559]"
                }`}
              >
                Virtual Account
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel("cc")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeChannel === "cc"
                    ? "bg-white text-[#D9222A] shadow-sm"
                    : "text-[#8F9BBA] hover:text-[#1B2559]"
                }`}
              >
                Kartu Kredit
              </button>
            </div>

            {/* Channel Body: QRIS */}
            {activeChannel === "qris" && (
              <div className="text-center space-y-3 p-4 border border-[#E0E5F2] rounded-2xl bg-white">
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-[#D9222A] px-3 py-1 rounded-full text-[11px] font-bold">
                  <span>QRIS Nasional</span> &bull; <span>Bebas Admin</span>
                </div>
                {/* QR Graphic Mockup */}
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-[#D9222A]/40 flex flex-col items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-stone-900 rounded-lg p-2 flex items-center justify-center relative overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                      <rect x="5" y="5" width="25" height="25" fill="white" />
                      <rect x="9" y="9" width="17" height="17" fill="black" />
                      <rect x="13" y="13" width="9" height="9" fill="white" />
                      <rect x="70" y="5" width="25" height="25" fill="white" />
                      <rect x="74" y="9" width="17" height="17" fill="black" />
                      <rect x="78" y="13" width="9" height="9" fill="white" />
                      <rect x="5" y="70" width="25" height="25" fill="white" />
                      <rect x="9" y="74" width="17" height="17" fill="black" />
                      <rect x="13" y="78" width="9" height="9" fill="white" />
                      <rect x="35" y="10" width="8" height="8" fill="white" />
                      <rect x="48" y="15" width="12" height="6" fill="white" />
                      <rect x="38" y="35" width="24" height="24" fill="white" />
                      <rect x="42" y="39" width="16" height="16" fill="black" />
                      <rect x="10" y="40" width="15" height="15" fill="white" />
                      <rect x="70" y="40" width="18" height="12" fill="white" />
                      <rect x="35" y="70" width="12" height="18" fill="white" />
                      <rect x="55" y="70" width="25" height="10" fill="white" />
                      <rect x="70" y="85" width="15" height="10" fill="white" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-[#D9222A] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                        DOKU
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#8F9BBA]">
                  NMID: <strong>ID102026RUANGTEMU</strong> &bull; Merchant: <strong>RUANGTEMU DIGITAL</strong>
                </div>
                <p className="text-[11px] text-[#A3AED0]">
                  Buka aplikasi mobile banking (BCA, Mandiri, BRI, BNI) atau e-wallet (GoPay, OVO, Dana, ShopeePay) lalu scan kode di atas.
                </p>
              </div>
            )}

            {/* Channel Body: Virtual Account */}
            {activeChannel === "va" && (
              <div className="space-y-4 p-4 border border-[#E0E5F2] rounded-2xl bg-white">
                <div className="grid grid-cols-4 gap-2">
                  {(["bca", "mandiri", "bri", "bni"] as const).map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold uppercase transition-all ${
                        selectedBank === bank
                          ? "bg-[#D9222A] text-white shadow-sm"
                          : "bg-[#F4F7FE] text-[#1B2559] hover:bg-[#EAEFFA]"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>

                {isLoadingVa ? (
                  <div className="p-4 bg-[#F4F7FE] rounded-xl flex items-center justify-center gap-2 text-xs text-[#8F9BBA]">
                    <span className="w-4 h-4 border-2 border-stone-300 border-t-[#D9222A] rounded-full animate-spin" />
                    <span>Menerbitkan nomor VA {selectedBank.toUpperCase()} dari DOKU Sandbox...</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-[#F4F7FE] border border-emerald-200/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <div className="text-[10px] text-[#8F9BBA] uppercase font-bold">
                            Nomor Virtual Account {selectedBank.toUpperCase()}
                          </div>
                          {activeRealVa ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Terdaftar di DOKU Sandbox
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Simulasi Lokal
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-black text-[#1B2559] font-mono tracking-wider mt-0.5">
                          {currentVaDisplay}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyVa(currentVaRaw)}
                        className="h-9 px-3.5 bg-white border border-[#E0E5F2] hover:border-[#D9222A] text-xs font-bold text-[#1B2559] rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        {copied ? "Disalin" : "Salin VA"}
                      </button>
                    </div>

                    {activeRealVa && (
                      <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Nomor VA ini resmi &amp; dikenali oleh <strong>DOKU {selectedBank.toUpperCase()} VA Simulator</strong>.</span>
                      </div>
                    )}
                  </div>
                )}

                {vaError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700">
                    <strong>Catatan API DOKU:</strong> {vaError}
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-blue-950">
                    Cara Bayar di DOKU Payment Simulator:
                  </div>
                  <ol className="text-[11px] text-blue-800 space-y-1 pl-4 list-decimal leading-relaxed">
                    <li>Klik <strong>Salin VA</strong> di atas ({currentVaRaw}).</li>
                    <li>Buka menu <strong>DOKU Simulator &gt; {selectedBank.toUpperCase()} VA Simulator</strong>.</li>
                    <li>Tempelkan nomor VA di kolom <em>Virtual Account Number</em> lalu klik <strong>INQUIRY</strong>.</li>
                    <li>Tagihan <strong>{formatRupiah(amount)}</strong> akan muncul, lalu klik <strong>PAY</strong> untuk menyelesaikan transaksi.</li>
                  </ol>
                </div>

                <ol className="text-[11px] text-[#8F9BBA] space-y-1 pl-4 list-decimal">
                  <li>Buka aplikasi m-Banking atau ATM {selectedBank.toUpperCase()}.</li>
                  <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                  <li>Masukkan nomor VA dan konfirmasi nominal {formatRupiah(amount)}.</li>
                  <li>Status aktivasi photobooth otomatis terupdate setelah transfer.</li>
                </ol>
              </div>
            )}

            {/* Channel Body: Credit Card */}
            {activeChannel === "cc" && (
              <div className="space-y-3 p-4 border border-[#E0E5F2] rounded-2xl bg-white">
                <div>
                  <label className="block text-xs font-semibold text-[#1B2559] mb-1">
                    Nomor Kartu (Simulasi Sandbox)
                  </label>
                  <input
                    type="text"
                    disabled
                    value="4000 1234 5678 9010 (DOKU Test Card)"
                    className="w-full h-10 px-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-xs font-mono text-[#1B2559]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1B2559] mb-1">Berlaku Hingga</label>
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="w-full h-10 px-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-xs font-mono text-[#1B2559]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1B2559] mb-1">CVV</label>
                    <input
                      type="text"
                      disabled
                      value="123"
                      className="w-full h-10 px-3 bg-[#F4F7FE] border border-[#E0E5F2] rounded-xl text-xs font-mono text-[#1B2559]"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-[#8F9BBA]">
                  Kartu uji coba terverifikasi 3D Secure Sandbox DOKU.
                </div>
              </div>
            )}

            {/* Realtime Detection Banner & Buttons */}
            <div className="pt-2 space-y-2.5">
              <div className="p-3 bg-[#F4F7FE] rounded-xl flex items-center justify-between text-xs border border-[#E0E5F2]">
                <div className="flex items-center gap-2 text-[#8F9BBA]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11px] font-medium">Mendeteksi pembayaran dari Simulator...</span>
                </div>
                <button
                  type="button"
                  disabled={isCheckingStatus || isProcessing}
                  onClick={() => checkPaymentStatus(true)}
                  className="text-[#D9222A] hover:text-[#C01B22] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer hover:underline disabled:opacity-50"
                >
                  {isCheckingStatus ? (
                    <>
                      <span className="w-3 h-3 border-2 border-[#D9222A] border-t-transparent rounded-full animate-spin" />
                      <span>Memeriksa...</span>
                    </>
                  ) : (
                    <>
                      <span>Cek Status Pembayaran</span>
                    </>
                  )}
                </button>
              </div>

              {statusFeedback && (
                <div className="text-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100 animate-in fade-in">
                  {statusFeedback}
                </div>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  fetch("/api/payment/doku/status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId, bank: selectedBank }),
                  }).catch(() => {});

                  onSuccess(
                    activeChannel === "qris"
                      ? "DOKU_QRIS"
                      : activeChannel === "va"
                      ? `DOKU_VA_${selectedBank.toUpperCase()}`
                      : "DOKU_CC"
                  );
                }}
                className="w-full h-12 bg-[#01B574] hover:bg-[#00965F] disabled:bg-[#8F9BBA] text-white text-sm font-extrabold rounded-2xl transition-all shadow-[0_4px_16px_rgba(1,181,116,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifikasi Pembayaran DOKU...</span>
                  </>
                ) : (
                  <>
                    <span>Konfirmasi Pembayaran Selesai (Sandbox Test)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={onClose}
                className="w-full h-10 border border-[#E0E5F2] hover:bg-[#F4F7FE] text-xs font-semibold text-[#8F9BBA] hover:text-[#1B2559] rounded-xl transition-colors"
              >
                Batalkan &amp; Kembali ke Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
