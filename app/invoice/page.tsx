import { Metadata } from "next";
import { getBookings } from "@/lib/db";
import { AdminInvoice } from "@/components/admin/admin-invoice";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Invoice Photobooth | RUANGTEMU",
  description: "Generator invoice resmi dan penawaran WhatsApp instan RUANGTEMU Photobooth Palopo",
};

export default async function InvoicePage() {
  let bookings: any[] = [];
  try {
    bookings = await getBookings();
  } catch {
    // jika tanpa database atau guest, tetap bisa digunakan
    bookings = [];
  }

  return <AdminInvoice bookings={bookings} standalone={true} />;
}
