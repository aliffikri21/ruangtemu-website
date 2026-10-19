import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets with extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .css, .js)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gjvppqonfkbiblghvuun.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdnBwcW9uZmtiaWJsZ2h2dXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTA4NzY3MCwiZXhwIjoyMTA2NjYzNjcwfQ.FYPU98oFzPB631xe-a8lkdQKMq7MCmp6cnlptp4McYM";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin dashboard routes are ALWAYS accessible so admins/developers can manage maintenance
  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    if (request.cookies.has("rt_admin_bypass")) {
      response.cookies.delete("rt_admin_bypass");
    }
    return response;
  }

  // 2. Query maintenance mode directly from Supabase REST in real time (cache: "no-store")
  let isMaintenance = false;
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
    // Fail-open: If query fails or network is offline, site continues to work normally
    isMaintenance = false;
  }

  // 3. Maintenance mode is ACTIVE
  if (isMaintenance) {
    // Already on the maintenance page -> allow viewing
    if (pathname === "/maintenance") {
      const response = NextResponse.next();
      if (request.cookies.has("rt_admin_bypass")) {
        response.cookies.delete("rt_admin_bypass");
      }
      return response;
    }

    // All public paths (homepage '/', '/booking', '/event/...', etc.) redirect to /maintenance
    const response = NextResponse.redirect(new URL("/maintenance", request.url), 307);
    if (request.cookies.has("rt_admin_bypass")) {
      response.cookies.delete("rt_admin_bypass");
    }
    return response;
  }

  // 4. Maintenance mode is INACTIVE
  // If someone directly visits /maintenance while the site is online, redirect to homepage
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
