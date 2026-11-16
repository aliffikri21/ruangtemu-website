import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/auth";
import { getEvents, getBookings, getPackages, getAllEntries } from "@/lib/db";
import { AdminView } from "@/components/admin/admin-view";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin Dashboard: RUANGTEMU Digital Palopo",
  description: "Portal pengelola dan operator RUANGTEMU Photobooth Palopo",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("rt_admin_session")?.value;
  const isAuthenticated = await verifyAdminToken(sessionToken);

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialTab = resolvedParams?.tab as any;

  // Jalankan seluruh query database secara paralel (Promise.all) agar load time turun drastis
  const [events, bookings, packages, entries] = await Promise.all([
    getEvents(),
    getBookings(),
    getPackages(),
    getAllEntries(),
  ]);

  return (
    <AdminView
      initialEvents={events}
      initialBookings={bookings}
      initialPackages={packages}
      initialEntries={entries}
      initialTab={initialTab}
    />
  );
}
