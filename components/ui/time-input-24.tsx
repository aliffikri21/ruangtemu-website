"use client";

import React, { useState, useEffect, useId } from "react";

interface TimeInput24Props {
  value: string; // e.g. "13:00"
  onChange: (time24: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

// Konversi format apapun (termasuk AM/PM) ke format 24 jam (HH:mm)
export function parseTo24Hour(timeStr: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  const ampmMatch = trimmed.match(/^(\d{1,2})[.:](\d{2})\s*(AM|PM)?$/i);
  if (ampmMatch) {
    let [, hStr, mStr, ampm] = ampmMatch;
    let h = parseInt(hStr, 10);
    if (ampm) {
      const isPM = ampm.toUpperCase() === "PM";
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
    }
    const safeH = Math.min(23, Math.max(0, h));
    const safeM = Math.min(59, Math.max(0, parseInt(mStr, 10)));
    return `${String(safeH).padStart(2, "0")}:${String(safeM).padStart(2, "0")}`;
  }
  return trimmed;
}

const COMMON_EVENT_TIMES = [
  "08:00",
  "09:00",
  "09:30",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
];

export function TimeInput24({
  value,
  onChange,
  required = false,
  className = "",
  placeholder = "13:00",
  disabled = false,
  id,
  name,
}: TimeInput24Props) {
  const datalistId = useId();
  const [displayValue, setDisplayValue] = useState<string>(() => parseTo24Hour(value));

  useEffect(() => {
    setDisplayValue(parseTo24Hour(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "").slice(0, 4);

    let formatted = "";
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    } else {
      formatted = digits;
    }

    setDisplayValue(formatted);

    if (digits.length === 4) {
      const h = parseInt(digits.slice(0, 2), 10);
      const m = parseInt(digits.slice(2, 4), 10);
      if (h <= 23 && m <= 59) {
        const finalTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        onChange(finalTime);
      }
    } else if (digits.length === 0) {
      onChange("");
    }
  };

  const handleBlur = () => {
    if (displayValue) {
      const parts = displayValue.split(":");
      if (parts.length === 2) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(h) && !isNaN(m) && h <= 23 && m <= 59) {
          const finalTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          setDisplayValue(finalTime);
          onChange(finalTime);
          return;
        }
      }
      // Reset ke nilai valid sebelumnya jika input tidak valid
      setDisplayValue(parseTo24Hour(value));
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        id={id}
        name={name}
        list={datalistId}
        inputMode="numeric"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        className={`${className} pr-20 font-mono`}
      />

      {/* Suffix Badge WITA & Ikon Jam */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
        <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
          WITA
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-400"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      {/* Datalist rekomendasi jam 24-jam */}
      <datalist id={datalistId}>
        {COMMON_EVENT_TIMES.map((time) => (
          <option key={time} value={time}>
            {time} WITA
          </option>
        ))}
      </datalist>
    </div>
  );
}
