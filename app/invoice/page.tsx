import { Metadata } from "next";
import { getBookings } from "@/lib/db";
import { AdminInvoice } from "@/components/admin/admin-invoice";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sistem Kasir & Invoice WhatsApp | RUANGTEMU Photobooth",
  description: "Generator invoice resmi dan penawaran WhatsApp instan RUANGTEMU Photobooth Palopo",
};

export default async function InvoicePage() {
  let bookings: any[] = [];
  try {
    bookings = await getBookings();
  } catch (err) {
    // jika tanpa database atau guest, tetap bisa digunakan
    bookings = [];
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#1B2559] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminInvoice bookings={bookings} standalone={true} />
      </div>
    </div>
  );
}
