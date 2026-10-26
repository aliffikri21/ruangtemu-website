"use client";

import React, { useRef, useState, useEffect } from "react";

interface DateInputDMYProps {
  value: string; // Format ISO: "YYYY-MM-DD" atau string kosong ""
  onChange: (isoValue: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

/**
 * Komponen Date Input yang selalu menampilkan format Indonesia DD/MM/YYYY
 * Mengabaikan locale browser (yang sering default ke MM/DD/YYYY)
 * Dilengkapi integrasi kalender picker native dan input manual ber-masking.
 */
export function DateInputDMY({
  value,
  onChange,
  required = false,
  min,
  max,
  className = "",
  placeholder = "dd/mm/yyyy",
  disabled = false,
  id,
  name,
}: DateInputDMYProps) {
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  // Konversi ISO (YYYY-MM-DD) ke tampilan lokal DD/MM/YYYY
  const isoToDmy = (iso: string): string => {
    if (!iso) return "";
    const match = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }
    return "";
  };

  const [displayValue, setDisplayValue] = useState<string>(() => isoToDmy(value));

  // Sinkronisasi saat value prop berubah dari luar (misal: reset form atau dipilih dari kalender)
  useEffect(() => {
    setDisplayValue(isoToDmy(value));
  }, [value]);

  // Penanganan ketik manual dengan auto-masking DD/MM/YYYY
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "").slice(0, 8);

    let formatted = "";
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = digits;
    }

    setDisplayValue(formatted);

    // Jika sudah lengkap 8 digit (DDMMYYYY), validasi dan konversi ke ISO (YYYY-MM-DD)
    if (digits.length === 8) {
      const d = parseInt(digits.slice(0, 2), 10);
      const m = parseInt(digits.slice(2, 4), 10);
      const y = parseInt(digits.slice(4, 8), 10);

      // Validasi batas tanggal & bulan
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2020 && y <= 2099) {
        const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        onChange(iso);
      }
    } else if (digits.length === 0) {
      onChange("");
    }
  };

  const handleBlur = () => {
    // Jika tidak lengkap 8 digit saat blur, kembalikan ke state ISO sebelumnya
    if (displayValue && displayValue.replace(/\D/g, "").length < 8) {
      setDisplayValue(isoToDmy(value));
    }
  };

  const handleOpenPicker = () => {
    if (disabled) return;
    try {
      hiddenDateRef.current?.showPicker?.();
    } catch {
      hiddenDateRef.current?.focus();
    }
  };

  return (
    <div className="relative flex items-center w-full">
      {/* Input visual yang selalu tampil dalam format DD/MM/YYYY */}
      <input
        type="text"
        id={id}
        name={name}
        inputMode="numeric"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        className={`${className} pr-11 font-mono`}
      />

      {/* Ikon kalender di sisi kanan */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-slate-400">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {/* Native HTML5 date picker overlay transparan di atas area ikon untuk memicu pop-up kalender bawaan HP/browser */}
      <input
        ref={hiddenDateRef}
        type="date"
        tabIndex={-1}
        aria-label="Pilih tanggal dari kalender"
        disabled={disabled}
        min={min}
        max={max}
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onClick={handleOpenPicker}
        className="absolute right-0 top-0 bottom-0 w-11 opacity-0 cursor-pointer z-10"
      />
    </div>
  );
}
