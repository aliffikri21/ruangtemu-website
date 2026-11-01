import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets with extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .css, .js)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gjvppqonfkbiblghvuun.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Daftar endpoint API sensitif & mutasi yang wajib otentikasi admin
function isSensitiveAdminApi(pathname: string, method: string): boolean {
  if (pathname.startsWith("/api/admin")) return true;
  if (pathname === "/api/entries" && method === "GET") return true;
  if (pathname.startsWith("/api/entries/") && method === "DELETE") return true;
  if (pathname === "/api/bookings" && (method === "GET" || method === "PATCH" || method === "DELETE")) return true;
  if (pathname === "/api/events" && method === "POST") return true;
  if (pathname.startsWith("/api/events/") && (method === "PUT" || method === "DELETE")) return true;
  if (pathname.endsWith("/entries") && method === "DELETE") return true;
  if (pathname.includes("/export-zip")) return true;
  if (pathname === "/api/frames/upload" && method === "POST") return true;
  if (pathname === "/api/events/upload-bg" && method === "POST") return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // 1. Lewatkan rute auth publik dan halaman login admin
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. Proteksi rute Admin & API Admin Mutasi / Sensitif
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = isSensitiveAdminApi(pathname, method);

  if (isAdminPage || isAdminApi) {
    const sessionToken = request.cookies.get("rt_admin_session")?.value;
    const isAuthenticated = await verifyAdminToken(sessionToken);

    if (!isAuthenticated) {
      if (isAdminApi) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Sesi admin tidak valid atau kedaluwarsa" },
          { status: 401 }
        );
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin terotentikasi selalu diizinkan masuk
    const response = NextResponse.next();
    if (request.cookies.has("rt_admin_bypass")) {
      response.cookies.delete("rt_admin_bypass");
    }
    return response;
  }

  // 3. Lewatkan API publik lainnya dari maintenance check HTML
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 4. Query maintenance mode directly from Supabase REST in real time (cache: "no-store")
  let isMaintenance = false;
  if (SUPABASE_KEY) {
    try {
      const queryUrl = `${SUPABASE_URL}/rest/v1/events?slug=eq.__system_maintenance__&select=is_active`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(queryUrl, {
        signal: controller.signal,
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          isMaintenance = Boolean(data[0].is_active);
        }
      }
    } catch {
      isMaintenance = false;
    }
  }

  // 5. Maintenance mode is ACTIVE
  if (isMaintenance) {
    if (pathname === "/maintenance") {
      const response = NextResponse.next();
      if (request.cookies.has("rt_admin_bypass")) {
        response.cookies.delete("rt_admin_bypass");
      }
      return response;
    }

    const response = NextResponse.redirect(new URL("/maintenance", request.url), 307);
    if (request.cookies.has("rt_admin_bypass")) {
      response.cookies.delete("rt_admin_bypass");
    }
    return response;
  }

  // 6. Maintenance mode is INACTIVE
  if (pathname === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url), 307);
  }

  // Normal public browsing
  const response = NextResponse.next();
  if (request.cookies.has("rt_admin_bypass")) {
    response.cookies.delete("rt_admin_bypass");
  }
  return response;
}
