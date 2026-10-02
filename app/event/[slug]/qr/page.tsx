"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import QRCode from "qrcode";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function QrStandeePage({ params }: Props) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [qrUrl, setQrUrl] = useState<string>("");
  const [eventUrl, setEventUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/event/${slug}`;
      setEventUrl(url);
      QRCode.toDataURL(url, {
        width: 320,
        margin: 1,
        color: {
          dark: "#18181b",
          light: "#ffffff",
        },
      }).then(setQrUrl);
    }
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col items-center justify-center p-6 print:bg-white print:p-0">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="w-full max-w-sm mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/event/${slug}`}
          className="font-mono text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          ← Kembali ke Booth
        </Link>

        <button
          onClick={handlePrint}
          className="min-h-[38px] px-4 bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs uppercase tracking-wider transition-colors"
        >
          Cetak Standee Meja
        </button>
      </div>

      {/* Standee Card (Editorial Paper Card) */}
      <div className="w-full max-w-sm bg-white border border-stone-300 p-8 text-center space-y-6 print:border-none print:max-w-none print:w-full print:h-screen print:flex print:flex-col print:justify-center">
        {/* Brand Header */}
        <div className="space-y-1 pb-4 border-b border-stone-200">
          <div className="font-mono text-xs uppercase tracking-widest text-stone-400">
            [ RUANGTEMU PHOTOBOOTH ]
          </div>
          <h1 className="text-xl font-light text-stone-950 tracking-tight">
            Virtual Photobooth & Guestbook
          </h1>
          <p className="text-[11px] text-stone-500">
            Palopo, Sulawesi Selatan
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center py-2">
          <div className="p-3 border border-stone-200 bg-white">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt="QR Code Photobooth"
                className="w-56 h-56 object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center font-mono text-xs text-stone-400">
                Membuat QR Code...
              </div>
            )}
          </div>
        </div>

        {/* 3 Step Instruction */}
        <div className="text-left bg-stone-50 p-4 border border-stone-200 space-y-2.5 font-mono text-xs text-stone-700">
          <div className="flex items-start gap-2.5">
            <span className="text-[#c47a5a] font-semibold">01</span>
            <span>Arahkan kamera smartphone ke kode QR di atas</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-[#c47a5a] font-semibold">02</span>
            <span>Pilih template frame dan ambil foto photobooth</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-[#c47a5a] font-semibold">03</span>
            <span>Unduh foto resolusi tinggi & kirim doa restu</span>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-stone-400 font-mono break-all">
          {eventUrl}
        </div>
      </div>
    </div>
  );
}
