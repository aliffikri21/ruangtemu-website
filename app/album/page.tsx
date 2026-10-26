import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface AlbumPageProps {
  searchParams: Promise<{ event?: string; slug?: string }>;
}

export default async function AlbumPage({ searchParams }: AlbumPageProps) {
  const params = await searchParams;
  const eventSlug = params?.event || params?.slug;

  if (eventSlug) {
    redirect(`/event/${eventSlug}/gallery`);
  }

  // Attempt to recover event slug from HTTP Referer
  try {
    const headerList = await headers();
    const referer = headerList.get("referer");
    if (referer) {
      const match = referer.match(/\/event\/([^\/\?#]+)/);
      if (match && match[1]) {
        redirect(`/event/${match[1]}/gallery`);
      }
    }
  } catch {
    // Fallback if headers cannot be inspected
  }

  // Fallback: Redirect to homepage so visitor never sees 404
  redirect("/");
}
