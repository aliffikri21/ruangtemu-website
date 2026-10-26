import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateInput?: string | Date | number): string {
  if (!dateInput) return "";
  try {
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      const isoDateMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoDateMatch) {
        const [, y, m, d] = isoDateMatch;
        return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
      }
      const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dmyMatch) {
        const [, d, m, y] = dmyMatch;
        return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
      }
    }
    const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

export function formatTime(timeInput?: string | Date | number): string {
  if (!timeInput) return "";
  try {
    if (typeof timeInput === "string") {
      const trimmed = timeInput.trim();
      // Tangani format "01:00 PM", "1:00 PM", atau "13:00"
      const ampmMatch = trimmed.match(/^(\d{1,2})[.:](\d{2})\s*(AM|PM)?$/i);
      if (ampmMatch && !trimmed.includes("T")) {
        let [, hStr, mStr, ampm] = ampmMatch;
        let h = parseInt(hStr, 10);
        if (ampm) {
          const isPM = ampm.toUpperCase() === "PM";
          if (isPM && h < 12) h += 12;
          if (!isPM && h === 12) h = 0;
        }
        return `${String(h).padStart(2, "0")}:${mStr}`;
      }
    }
    const date = typeof timeInput === "string" || typeof timeInput === "number" ? new Date(timeInput) : timeInput;
    if (isNaN(date.getTime())) return String(timeInput);

    // Konversi ke zona waktu WITA (Asia/Makassar, UTC+8) dengan format 24 jam (hour12: false)
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Makassar",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const h = parts.find((p) => p.type === "hour")?.value || String(date.getHours()).padStart(2, "0");
    const m = parts.find((p) => p.type === "minute")?.value || String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return String(timeInput);
  }
}

export function formatDateTime(dateTimeInput?: string | Date | number): string {
  if (!dateTimeInput) return "";
  const dStr = formatDate(dateTimeInput);
  const tStr = formatTime(dateTimeInput);
  if (!dStr) return "";
  if (!tStr) return dStr;
  return `${dStr} ${tStr}`;
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}
