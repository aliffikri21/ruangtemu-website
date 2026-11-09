import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/db";
import { VirtualBooth } from "@/components/photobooth/virtual-booth";
import { Metadata } from "next";

import { resolveLandingThemeConfig } from "@/lib/theme-config";

interface Props {
  params: Promise<{ slug: string }>;
}

// =========================================================================================
// 1. GENERATE METADATA (SEO & WhatsApp Link Preview)
// Saat tautan QR/URL acara dibagikan via WhatsApp/Instagram, fungsi ini otomatis menarik
// judul acara dan foto cover langsung dari database untuk dijadikan kartu preview dinamis.
// =========================================================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || event.category === "photobooth") {
    return {
      title: "Event Not Found | RUANGTEMU Digital",
    };
  }

  const resolvedTheme = resolveLandingThemeConfig(event.theme_config, event);
  const rawBg =
    event.theme_config?.background?.image?.trim() ||
    resolvedTheme.background?.image?.trim() ||
    event.cover_image?.trim() ||
    event.cover_image_url?.trim() ||
    "/images/events/bg-jayarika.png";

  const appBaseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://ruangtemu.online"
  ).replace(/\/+$/, "");

  const ogImageUrl =
    rawBg.startsWith("http://") || rawBg.startsWith("https://")
      ? rawBg
      : `${appBaseUrl}${rawBg.startsWith("/") ? "" : "/"}${rawBg}`;

  const eventTitle = event.title || event.event_name || "Virtual Photobooth";
  const isWeddingEvent =
    event.event_type === "wedding" &&
    !event.slug?.toLowerCase().includes("festamsa") &&
    !event.title?.toLowerCase().includes("festamsa");
  const hostName =
    event.host_name ||
    event.client_name ||
    (isWeddingEvent ? "Mempelai" : eventTitle);
  const pageUrl = `${appBaseUrl}/event/${slug}`;
  const description = `Abadikan momen spesial Anda di ${eventTitle}. Ambil foto langsung dengan frame custom eksklusif dan tinggalkan pesan ucapan untuk ${hostName}.`;

  return {
    title: `${eventTitle} | Virtual Photobooth RUANGTEMU Palopo`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${eventTitle} | RUANGTEMU Virtual Photobooth`,
      description: `Buka kamera dan ambil foto photobooth untuk ${eventTitle}`,
      url: pageUrl,
      siteName: "RUANGTEMU",
      locale: "id_ID",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${eventTitle} | RUANGTEMU Virtual Photobooth`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${eventTitle} | RUANGTEMU Virtual Photobooth`,
      description: `Buka kamera dan ambil foto photobooth untuk ${eventTitle}`,
      images: [ogImageUrl],
    },
  };
}

// =========================================================================================
// 2. HALAMAN UTAMA PHOTOBOOTH TAMU (Server Component)
// Alur Kerja:
// 1. Tamu memindai QR Code di meja pesta -> membuka URL: /event/[slug] (misal: /event/wedding-aldi-maya)
// 2. Server Next.js mengeksekusi fungsi ini di level SERVER (bukan browser client)
// 3. Menarik data event dari PostgreSQL Supabase berdasarkan slug URL via getEventBySlug(slug)
// 4. Jika event tidak ada, arahkan otomatis ke halaman notFound (404)
// 5. Jika event aktif, kirim data event ke komponen VirtualBooth untuk membuka kamera & pilihan frame
// =========================================================================================
export default async function EventPhotoboothPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || event.category === "photobooth") {
    notFound();
  }

  return (
    <div className="w-full min-h-[100dvh] bg-black">
      <VirtualBooth event={event} />
    </div>
  );
}
