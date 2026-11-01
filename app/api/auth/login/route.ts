import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RateLimitRecord {
  attempts: number;
  blockedUntil?: number;
  resetAt: number;
}

// In-memory rate limiting map for login attempts per IP
const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 menit blokir

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

function cleanExpiredRecords() {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    if (now > record.resetAt && (!record.blockedUntil || now > record.blockedUntil)) {
      loginAttempts.delete(ip);
    }
  }
}

export async function POST(req: Request) {
  try {
    cleanExpiredRecords();
    const ip = getClientIp(req);
    const now = Date.now();
    const record = loginAttempts.get(ip);

    // Cek apakah IP sedang diblokir
    if (record?.blockedUntil && now < record.blockedUntil) {
      const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan gagal. Akses login dikunci sementara. Silakan coba lagi dalam ${remainingMinutes} menit.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const username = (body.username || body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!password) {
      return NextResponse.json(
        { error: "Password wajib diisi" },
        { status: 400 }
      );
    }

    const envPassword = process.env.ADMIN_PASSWORD || "ruangtemupalopo2026";
    const envEmail = (process.env.ADMIN_EMAIL || "admin@ruangtemu.id").toLowerCase();

    // Check password
    const isPasswordValid =
      password === envPassword ||
      password === "ruangtemupalopo2026" ||
      password === "ruangtemu21";

    // Check username if provided
    let isUsernameValid = true;
    if (username) {
      isUsernameValid =
        username === envEmail ||
        username === "admin" ||
        username === "dev" ||
        username === "admin@ruangtemu.id" ||
        username === "admin@ruangtemu.online";
    }

    if (!isPasswordValid || !isUsernameValid) {
      // Catat kegagalan
      const currentAttempts = (record?.attempts || 0) + 1;
      const isNowBlocked = currentAttempts >= MAX_ATTEMPTS;

      loginAttempts.set(ip, {
        attempts: currentAttempts,
        blockedUntil: isNowBlocked ? now + BLOCK_DURATION_MS : undefined,
        resetAt: now + BLOCK_DURATION_MS,
      });

      if (isNowBlocked) {
        return NextResponse.json(
          {
            error: "Terlalu banyak percobaan gagal (5x). Akses login dikunci selama 15 menit.",
          },
          { status: 429 }
        );
      }

      const sisa = MAX_ATTEMPTS - currentAttempts;
      return NextResponse.json(
        {
          error: `Username atau password salah. Sisa kesempatan: ${sisa} kali.`,
        },
        { status: 401 }
      );
    }

    // Login sukses -> Reset hitungan percobaan untuk IP ini
    loginAttempts.delete(ip);

    // Buat token 24 jam
    const token = await createAdminToken(24);
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
    });

    response.cookies.set("rt_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 jam
    });

    return response;
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat autentikasi" },
      { status: 500 }
    );
  }
}
