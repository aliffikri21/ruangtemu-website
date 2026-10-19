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

  // 1. Admin dashboard access: Always allowed & grants admin bypass cookie
  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    response.cookies.set("rt_admin_bypass", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  // 2. Secret developer bypass via query param ?bypass=ruangtemu
  const bypassParam = request.nextUrl.searchParams.get("bypass");
  if (bypassParam === "ruangtemu") {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("bypass");
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set("rt_admin_bypass", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  // 3. If developer has bypass cookie, allow full access to all pages
  const hasBypass = request.cookies.get("rt_admin_bypass")?.value === "true";
  if (hasBypass) {
    return NextResponse.next();
  }

  // 4. Query maintenance mode directly from Supabase REST (fast Edge query, no localhost deadlock)
  let isMaintenance = false;
  try {
    const queryUrl = `${SUPABASE_URL}/rest/v1/events?slug=eq.__system_maintenance__&select=is_active`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(queryUrl, {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      next: { revalidate: 3 },
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

  // 5. Handle /maintenance route
  if (pathname === "/maintenance") {
    if (!isMaintenance) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 6. If maintenance is active, redirect public visitor to /maintenance
  if (isMaintenance) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}
