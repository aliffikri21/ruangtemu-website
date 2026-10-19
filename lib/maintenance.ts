import fs from "fs";
import path from "path";
import { getDbClient, isSupabaseConfigured } from "./supabase";

export interface MaintenanceConfig {
  enabled: boolean;
  message?: string;
  updatedAt?: string;
}

const DEFAULT_CONFIG: MaintenanceConfig = {
  enabled: false,
  message: "Sistem sedang dalam pemeliharaan berkala untuk peningkatan performa. Kami akan segera kembali online.",
  updatedAt: new Date().toISOString(),
};

// In-memory cache for ultra-fast checks (< 1ms)
let cachedConfig: MaintenanceConfig = { ...DEFAULT_CONFIG };
let lastLoadedTime = 0;
const CACHE_TTL_MS = 2000; // 2 seconds TTL

const LOCAL_FILE_PATH = path.join(process.cwd(), ".maintenance.json");

/**
 * Read maintenance configuration from cache, Supabase, or local file
 */
export async function getMaintenanceConfig(): Promise<MaintenanceConfig> {
  const now = Date.now();
  if (now - lastLoadedTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  // 1. Authoritative source: Supabase (persisted in events table with slug '__system_maintenance__')
  if (isSupabaseConfigured) {
    try {
      const client = getDbClient();
      if (client) {
        const { data, error } = await client
          .from("events")
          .select("is_active, description, updated_at")
          .eq("slug", "__system_maintenance__")
          .maybeSingle();

        if (!error && data) {
          cachedConfig = {
            enabled: Boolean(data.is_active),
            message: data.description || DEFAULT_CONFIG.message,
            updatedAt: data.updated_at || new Date().toISOString(),
          };
          lastLoadedTime = now;
          return cachedConfig;
        }
      }
    } catch (err) {
      console.warn("[Maintenance] Supabase read exception:", err);
    }
  }

  // 2. Secondary fallback: Local file (for local development when Supabase is offline)
  try {
    if (fs.existsSync(LOCAL_FILE_PATH)) {
      const raw = fs.readFileSync(LOCAL_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (typeof parsed.enabled === "boolean") {
        cachedConfig = {
          enabled: parsed.enabled,
          message: parsed.message || DEFAULT_CONFIG.message,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
        lastLoadedTime = now;
        return cachedConfig;
      }
    }
  } catch (err) {
    console.warn("[Maintenance] Error reading local fallback file:", err);
  }

  lastLoadedTime = now;
  return cachedConfig;
}

/**
 * Update maintenance configuration across Supabase and local file
 */
export async function setMaintenanceConfig(enabled: boolean, message?: string): Promise<MaintenanceConfig> {
  const updated: MaintenanceConfig = {
    enabled,
    message: message || cachedConfig.message || DEFAULT_CONFIG.message,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update memory cache immediately
  cachedConfig = updated;
  lastLoadedTime = Date.now();

  // 2. Sync to Supabase first as source of truth
  if (isSupabaseConfigured) {
    try {
      const client = getDbClient();
      if (client) {
        const { error } = await client
          .from("events")
          .update({
            is_active: enabled,
            description: updated.message,
            updated_at: updated.updatedAt,
          })
          .eq("slug", "__system_maintenance__");

        if (error) {
          console.error("[Maintenance] Supabase update error:", error.message);
        }
      }
    } catch (err) {
      console.warn("[Maintenance] Supabase update exception:", err);
    }
  }

  // 3. Write to local file as secondary fallback
  try {
    fs.writeFileSync(LOCAL_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    // Non-fatal on read-only environments like Vercel
    console.warn("[Maintenance] Local file write ignored:", err);
  }

  return updated;
}
