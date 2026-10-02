import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/db";
import { VirtualBooth } from "@/components/photobooth/virtual-booth";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found | RUANGTEMU Digital",
    };
  }

  return {
    title: `${event.title} | Virtual Photobooth RUANGTEMU Palopo`,
    description: `Abadikan momen spesial Anda di ${event.title}. Ambil foto langsung dengan frame custom eksklusif dan tinggalkan pesan ucapan untuk ${event.host_name}.`,
    openGraph: {
      title: `${event.title} | RUANGTEMU Virtual Photobooth`,
      description: `Buka kamera dan ambil foto photobooth untuk ${event.title}`,
      images: [event.cover_image || "/og-image.jpg"],
    },
  };
}

export default async function EventPhotoboothPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return <VirtualBooth event={event} />;
}
