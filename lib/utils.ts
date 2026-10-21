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
      const timeMatch = trimmed.match(/^(\d{1,2})[.:](\d{2})/);
      if (timeMatch && !trimmed.includes("T")) {
        const [, h, m] = timeMatch;
        return `${h.padStart(2, "0")}:${m}`;
      }
    }
    const date = typeof timeInput === "string" || typeof timeInput === "number" ? new Date(timeInput) : timeInput;
    if (isNaN(date.getTime())) return String(timeInput);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
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
