import { getEvents, getBookings, getPackages, getEventEntries } from "@/lib/db";
import { AdminView } from "@/components/admin/admin-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — RUANGTEMU Digital Palopo",
  description: "Portal pengelola dan operator RUANGTEMU Photobooth Palopo",
};

export default async function AdminPage() {
  const events = await getEvents();
  const bookings = await getBookings();
  const packages = await getPackages();
  const entries = await getEventEntries("evt-1");

  return (
    <AdminView
      initialEvents={events}
      initialBookings={bookings}
      initialPackages={packages}
      initialEntries={entries}
    />
  );
}
